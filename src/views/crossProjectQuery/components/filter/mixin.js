/**
 * @title filter mixin
 * @author chenxiaolong
 * @date 2021.4.15
 */
import { workItems, topFilterFields, moreFilterFields } from '../../constant'
import moment from 'dayjs'
import cloneDeep from 'lodash/cloneDeep'
import { WORKITEMCONST } from '@/utils/constant'
import debounce from 'lodash/debounce'
import { postQueryOptions } from '@/service/workbench'
import {
  getSprint,
  userDefinedAttrSelect,
  getRequirementByProjectIds,
  getRequirementCategory,
} from '@/service/cross-project'
import isEqual from 'lodash/isEqual'
import { workItemNames } from '../../constant'
import { isEmpty } from '@/utils'

const priorities = {
  P0: 'P0 / 阻塞',
  P1: 'P1 / 严重',
  P2: 'P2 / 普通',
  P3: 'P3 / 轻微',
}
export default {
  data() {
    return {
      workItems,
      projectList: [], // 项目列表
      // 查询表单
      form: {},
      currentModelValue: [],
      showMoreField: false,
      localTopFiltersList: cloneDeep(topFilterFields),
      localMoreFiltersList: cloneDeep(moreFilterFields),
      showMoreFieldDialog: false,
      renderKey: Math.random() + Date.now(),
      userList: [], // 用户列表
      lastProjectIds: [], // 上一次查询使用的项目id
      requireFinished: false,
      requireList: [],
      originRequireField: {},
      requireLoading: false,
      pageInfo: {
        pageNumber: 1,
        pageSize: 30,
      },
      defaultSelectKeys: [],
    }
  },
  computed: {
    isCacheUserList() {
      return isEqual(this.projectIds, this.lastProjectIds)
    },
    filterKeys() {
      return this.localFiltersList.map(item => item.attrName)
    },
    disableKeys() {
      return [...topFilterFields, ...moreFilterFields].map(
        item => item.attrName,
      )
    },
    topFiltersKeys() {
      return new Set(this.localTopFiltersList.map(item => item.attrName))
    },
    disableKeysSet() {
      return new Set(this.disableKeys)
    },
    hasMoreFilterList() {
      return this.localMoreFiltersList.filter(item => {
        if (Array.isArray(item.value) && item.value.length) {
          return true
        } else if (!Array.isArray(item.value) && item.value) {
          return true
        }

        return false
      })
    },
    localFiltersList() {
      return [...this.localTopFiltersList, ...this.localMoreFiltersList]
    },
    workItemTypeIds() {
      const workItemType = this.localFiltersList.find(
        item => item.attrName === 'workItemType',
      )

      if (workItemType) {
        if (workItemType.value[0] === 'all' || !workItemType.value.length) {
          const ids = []
          workItemType.selectList.forEach(item => {
            ids.push(item.key)
          })
          return ids
        }

        return workItemType.value
      }

      return []
    },
    projectIds() {
      const project = this.localFiltersList.find(
        item => item.attrName === 'projectId',
      )

      if (project) {
        if (project.value[0] === 'all' || !project.value.length) {
          const projectIds = []
          project.selectList.forEach(item => {
            item.children.forEach(itm => {
              projectIds.push(itm.id)
            })
          })
          return projectIds
        }

        return project.value
      }

      return []
    },
  },
  watch: {
    showMoreField(val) {
      if (val) {
        this.renderKey = Math.random() + Date.now()
      }
    },
    '$route.query'(val) {
      const { bugId, requireId, taskId, keyword } = val
      if (keyword && !bugId && !taskId && !requireId) {
        const keywordField = this.localFiltersList.find(
          item => item.attrName === 'searchKey',
        )
        keywordField && (keywordField.value = decodeURIComponent(keyword))
        this.handleSearch()
      }
    },
  },
  async created() {
    await this.initFilters()
    let keyword = this.$route.query.keyword
    this.defaultSelectKeys = this.localFiltersList.map(item => item.attrName)

    // 关键字填充
    if (keyword) {
      keyword = decodeURIComponent(keyword)
      const keywordField = this.localFiltersList.find(
        item => item.attrName === 'searchKey',
      )
      keywordField && (keywordField.value = keyword)
    }
    this.handleSearch()
  },
  mounted() {},
  methods: {
    // 搜索
    handleSearch() {
      this.getModelObj()
      this.$emit('search', this.currentModelValue)
    },
    async handleSelectMore(val) {
      const localFilters = this.localMoreFiltersList.filter(item =>
        this.disableKeysSet.has(item.attrName),
      )
      const namesSet = new Set()
      const filters = []
      const hasFilterSet = new Set(
        this.localFiltersList.map(item => item.attrName),
      )
      for (const item of val) {
        if (hasFilterSet.has(item.attrName)) {
          const original = this.localFiltersList.find(
            filter => item.attrName === filter.attrName,
          )
          this.mergeSameTitle(filters, namesSet, original)
          continue
        }
        const isSelect =
          [
            'SINGLE_CHOICE',
            'MEMBER_CHOICE',
            'MULTI_MEMBER_CHOICE',
            'MULTI_CHOICE',
          ].includes(item.attrValue) ||
          ['expectHour', 'actualHour'].includes(item.attrName)
        const isMember = ['MULTI_MEMBER_CHOICE', 'MEMBER_CHOICE'].includes(
          item.attrValue,
        )
        const formType = isSelect ? 'SELECT' : 'TEXT'
        const others = {
          formType,
          value: isSelect ? [] : '',
          isClearable: true,
          dataSource: isMember ? 'Member' : item.attrName,
          attrs: {
            multiple: isSelect,
            loading: true,
            'collapse-tags': true,
            group: false,
          },
        }

        if (['DATE_ATTR', 'LITE_DATE_ATTR'].includes(item.attrValue)) {
          item.attrValue = 'LITE_DATE_RANGE_ATTR'
        }

        if (item.attrName === 'progress') {
          item.attrValue = 'INT_ATTR'
        }

        if (item.attrName === 'relevantUsers') {
          others.dataSource = 'Member'
        }
        if (item.attrName === 'requireId') {
          this.originRequireField = item
          others.value = ['all']
          others.attrs = {
            ...others.attrs,
            clearAll: true,
            pickAll: true,
          }
        }
        Object.assign(item, others)
        item.attrName !== 'requireId' && (await this.getSelectList(item))
        // 不同类型同名称加前缀
        this.mergeSameTitle(filters, namesSet, item)
      }
      this.localMoreFiltersList = [...localFilters, ...filters]
    },
    /**
     * @title 计算自定义字段名称
     * @param {Array} | dataList
     * @param {Set} | nameSet
     * @param {Object} | data
     */
    mergeSameTitle(dataList, nameSet, data) {
      if (nameSet.has(data.fieldName)) {
        const sameFieldArr = dataList.filter(
          field => field.workItemTypeOriginalFieldName === data.fieldName,
        )

        if (sameFieldArr.length) {
          const original = sameFieldArr.find(
            item => item.workItemType === data.workItemType,
          )
          if (!original) {
            dataList.push({
              ...data,
              workItemTypeOriginalFieldName: data.fieldName,
              fieldName: `【${workItemNames[data.workItemType]}】${
                data.fieldName
              }`,
            })
            // 第一个改变名称
            const firstField = sameFieldArr[0]
            firstField.fieldName = `【${
              workItemNames[firstField.workItemType]
            }】${firstField.workItemTypeOriginalFieldName}`
          }
        }
      } else {
        dataList.push({
          ...data,
          workItemTypeOriginalFieldName: data.fieldName,
        })
        nameSet.add(data.fieldName)
      }
    },
    // 获取需求
    async getRequireList(keyword, isReload = false) {
      let res = {}
      this.requireLoading = true
      isReload && ((this.requireList = []), (this.pageInfo.pageNumber = 1))
      try {
        res = await getRequirementByProjectIds({
          projectIds: this.projectIds,
          pageInfo: this.pageInfo,
          keyword,
        })
      } catch (error) {
        res.status = 0
      }

      if (res.status === 200 && res.data) {
        ++this.pageInfo.pageNumber
        this.requireList.push(
          ...res.data.results.map(item => {
            return {
              ...item,
              _label: `${item.display.title}(${item.id})`,
            }
          }),
        )

        this.requireFinished =
          this.pageInfo.pageNumber > res.data.pageInfo.totalPages
      }
      this.requireLoading = false
    },
    // 格式化缓存过滤器
    formatCacheFilter(filters) {
      if (filters && Object.keys(filters).length) {
        for (const item of this.localFiltersList) {
          const originFilter = filters[item.attrName]
          if (!originFilter || !originFilter?.length) {
            if (['projectId', 'sprintId', 'priority'].includes(item.attrName)) {
              filters[item.attrName] = ['all']
            } else if (item.attrName === 'searchKey') {
              filters[item.attrName] = ''
            } else {
              filters[item.attrName] = []
            }
          }
        }
      }

      this.cacheFilter = filters
    },
    // 初始化过滤器
    async initFilters() {
      for (const filter of this.localFiltersList) {
        await this.getSelectList(filter)
      }
    },
    handleChange: debounce(async function(field, value) {
      this.fieldValidCheck(field)
      this.topFiltersKeys.has(field.attrName) && this.$emit('search-change')
      let target = this.localFiltersList.find(
        i => i.attrName === field.attrName,
      )

      if (value === null && target.attrValue === 'LITE_DATE_RANGE_ATTR') {
        value = []
      }

      target.value = value
      await this.changeProjectLinkage(field.attrName)

      if (target.attrName === 'workItemType') {
        const priorityFilter = this.localFiltersList.find(
          item => item.attrName === 'priority',
        )
        const hasBug = this.workItemTypeIds.includes(
          WORKITEMCONST.workItemTypeMap.bug,
        )
        priorityFilter.selectList = priorityFilter.selectList.map(item => {
          return {
            ...item,
            value: hasBug ? priorities[item.literal] : item.literal,
          }
        })
      }

      if (this.topFiltersKeys.has(field.attrName)) {
        this.handleSearch()
      }
    }, 300),
    moreFilterClick() {
      this.showMoreField = !this.showMoreField
      this.$emit('show-more-field', this.showMoreField)
    },
    // 获取当前表单数据 - 注意区分固有字段和自定义字段
    getModelObj() {
      let condition = []

      for (let i = 0, len = this.localFiltersList.length; i < len; i++) {
        let {
          attrName,
          fieldName,
          value,
          selectList,
          attrs,
          attrValue,
          workItemType,
          projectId,
          isUserDefined = false,
        } = this.localFiltersList[i]
        if (attrName === 'relevantUsers') {
          attrName = 'relevantUserIds'
        }
        if (attrName === 'progress') {
          let current = value
          const tofixed = /^(\d{1,2}(\.\d{1})?|100)$/ // 匹配最多一位小数
          if (!tofixed.test(current) && !isEmpty(current)) {
            current = Number(current).toFixed(1)
            value = current > 100 ? 100 : current < 0 ? 0 : current
          }
        }
        // 过滤掉数组空值
        Array.isArray(value) &&
          (value = value.filter(m => m !== undefined && m !== null))
        if (attrs.group) {
          selectList = [].concat.apply(
            [],
            selectList.map(m => m.children),
          )
        }

        if (attrValue === 'LITE_DATE_RANGE_ATTR' && value.length) {
          value[0] = moment(value[0]).format('YYYY-MM-DD') + ' 00:00:00'
          value[1] = moment(value[1]).format('YYYY-MM-DD') + ' 23:59:59'
        }
        let temp = {
          key: attrName,
          workItemType,
          label: fieldName,
          value: Array.isArray(value) && value[0] === 'all' ? [] : value,
          isUserDefined,
          attrValue,
          projectId,
          presetList:
            selectList?.length && Array.isArray(value)
              ? selectList.filter(j => new Set(value).has(j.key))
              : [],
        }
        condition.push(temp)
      }

      this.currentModelValue = condition
      return condition
    },
    // 修改项目联动-迭代，相关人，处理人，创建人，需求分类
    async changeProjectLinkage(fieldName) {
      if (fieldName === 'projectId') {
        for (let i = 0, len = this.localFiltersList.length; i < len; i++) {
          const filter = this.localFiltersList[i]
          let { attrName } = filter
          if (this.isUserFilter(filter)) {
            await this.getSelectList(filter)
            filter.value = ['all']
          } else if (attrName === 'sprintId') {
            const res = await getSprint(this.projectIds)
            if (res.status === 200) {
              const data = res.data || []
              filter.selectList = this.mergeSelectValueTitle(
                data,
                'id',
                item => {
                  const masSix = item.projectName.length > 6
                  let name = item.projectName.slice(0, 6)
                  masSix && (name = name + '...')
                  return `【${name}(${item.projectId})】${item.sprintName}`
                },
              )
              filter.value = [...filter.selectList, { status: 1, id: 0 }]
                .filter(m => m.status === 1)
                .map(n => n.id)
              filter.selectList = this.groupProject(
                filter.selectList,
                filter.attrName,
              )
            }
          }
        }

        // 清除
        this.changeProjectInitMoreFilter()
        this.$refs.filterSelect.clearSelect()
        this.requireList = []
        this.requireFinished = false
        this.originRequireField = {}
        this.requireLoading = false
        this.pageInfo.pageNumber = 1
      }
    },
    changeProjectInitMoreFilter() {
      const filters = []
      for (const item of this.localMoreFiltersList) {
        if (this.disableKeysSet.has(item.attrName)) {
          if (Array.isArray(item.value)) {
            item.value =
              item.attrValue === 'LITE_DATE_RANGE_ATTR' ? [] : ['all']
          } else {
            item.value = ''
          }
          filters.push(item)
        }
      }
      this.localMoreFiltersList = filters
    },
    workItemTypeHasBug() {
      return this.workItemTypeIds.includes(WORKITEMCONST.workItemTypeMap.bug)
    },
    // 判断是否为人员筛选条件
    isUserFilter(filter) {
      return (
        ['assignUser', 'createUser', 'relevantUser'].includes(
          filter.attrName,
        ) || ['MULTI_MEMBER_CHOICE', 'MEMBER_CHOICE'].includes(filter.attrValue)
      )
    },
    // 获取select的下拉框的值
    async getSelectList(filter) {
      const projectIds = this.projectIds
      const isUserFilter = this.isUserFilter(filter)
      const hasBug = this.workItemTypeHasBug()

      // 人员缓存
      if (isUserFilter && this.isCacheUserList) {
        filter.selectList = this.userList
        filter.attrs.loading = false
        return
      }

      if (filter?.formType === 'SELECT') {
        let res = {}
        try {
          if (filter.attrName === 'sprintId') {
            res = await getSprint(projectIds)
          } else if (filter.isUserDefined) {
            let payload = filter?.mergeList?.map(item => {
              return {
                attrName: item.attrName,
                projectId: item.projectId,
                workItemType: filter.workItemType,
              }
            })
            if (!payload || !payload?.length) {
              payload = [
                {
                  projectId: filter.projectId,
                  attrName: filter.attrName,
                  workItemType: filter.workItemType,
                },
              ]
            }
            res = await userDefinedAttrSelect(payload)
          } else if (filter.dataSource === 'categoryId') {
            res = await getRequirementCategory(projectIds)
          } else {
            const params = {
              projectIds,
              dataSource: filter.dataSource,
            }
            if (['missTest', 'cause'].includes(filter.dataSource)) {
              params.workItemType = 3
            } else if (
              ['actualHour', 'expectHour'].includes(filter.dataSource)
            ) {
              params.workItemType = 2
            }
            res = await postQueryOptions(params)
          }
        } catch (error) {
          res.status = 0
        }

        const resultData = res.data || []
        if (resultData?.length) {
          let selectList = cloneDeep(filter.selectList)
          if (filter.attrs.group) {
            selectList = [].concat.apply(
              [],
              selectList.map(m => m.children),
            )
          }
          let diffList = this.differenceSet(selectList, resultData)
          const allList = [...resultData, ...diffList]
          if (filter.isUserDefined) {
            filter.selectList = this.mergeSelectValueTitle(
              allList,
              'id',
              'value',
            )
          } else if (isUserFilter) {
            filter.selectList = this.mergeSelectValueTitle(
              allList,
              'userId',
              item => {
                return `${item.userName}(${item.userId})`
              },
            )
          } else if (filter.attrName === 'sprintId') {
            filter.selectList = this.mergeSelectValueTitle(
              allList,
              'id',
              item => {
                const masSix = item.projectName.length > 6
                let name = item.projectName.slice(0, 6)
                masSix && (name = name + '...')
                return `【${name}(${item.projectId})】${item.sprintName}`
              },
            )
          } else if ('projectId' === filter.attrName) {
            filter.selectList = this.mergeSelectValueTitle(
              allList,
              'id',
              item => {
                return `${item.name}(${item.id})`
              },
            )
          } else if (['categoryId'].includes(filter.attrName)) {
            filter.selectList = this.mergeSelectValueTitle(
              allList,
              'id',
              'name',
            )
          } else if (
            ['defectStatusIds', 'requireStatusIds', 'taskStatusIds'].includes(
              filter.attrName,
            )
          ) {
            filter.selectList = this.mergeSelectValueTitle(
              allList,
              item => {
                return `${item.projectId}${item.statusId}`
              },
              'statusName',
            )
          } else if (filter.attrName === 'priority') {
            filter.selectList = this.mergeSelectValueTitle(
              allList,
              'priority',
              item => {
                return hasBug ? priorities[item.literal] : item.literal
              },
            )
          } else {
            filter.selectList = this.mergeSelectValueTitle(
              allList,
              'value',
              'label',
            )
          }

          if (filter.attrs.group) {
            filter.selectList = this.groupProject(
              filter.selectList,
              filter.attrName,
            )
          }
        }
        filter.attrs.loading = false

        // 缓存人员列表
        if (isUserFilter) {
          this.lastProjectIds = cloneDeep(projectIds)
          this.userList = filter.selectList
        }
      }
    },
    /**
     * @title 选项值合并
     * @param {Array} selectList
     * @param {String | Function} keyKey
     * @param {String | Function} titleKey
     * @returns
     */
    mergeSelectValueTitle(selectList, keyKey, titleKey) {
      const nameSets = new Set()
      const format = []
      selectList.forEach(item => {
        const key = typeof keyKey === 'function' ? keyKey(item) : item[keyKey]
        const title =
          typeof titleKey === 'function' ? titleKey(item) : item[titleKey]

        if (nameSets.has(title)) {
          const origin = format.find(itm => itm.value === title)
          if (origin) {
            const { mergeList = [] } = origin
            if (mergeList.length) {
              mergeList.push(item)
            } else {
              mergeList.push(cloneDeep(origin), cloneDeep(item))
            }

            origin.mergeList = mergeList
          }
        } else {
          nameSets.add(title)
          format.push({
            ...item,
            key,
            value: title,
          })
        }
      })

      return format
    },
    fieldValidCheck(field) {
      // 特殊字段处理 1 progress 检测
      if (field.attrName === 'progress') {
        let current = field.value
        const tofixed = /^(\d{1,2}(\.\d{1})?|100)$/ // 匹配最多一位小数
        if (!tofixed.test(current) && !isEmpty(current)) {
          current = Number(current).toFixed(1)
          this.$message({
            showClose: true,
            message: this.$t('进度只能在0到100之间且只保留一位小数'),
            type: 'warning',
          })
          this.$nextTick(() => {
            field.value = current > 100 ? 100 : current < 0 ? 0 : current
            this.$forceUpdate()
          })
        }
      }
    },
    // 清空筛选条件
    clearFilter() {
      for (const item of this.localFiltersList) {
        if (['projectId', 'sprintId', 'priority'].includes(item.attrName)) {
          item.value = ['all']
        } else if (
          item.attrValue === 'LITE_DATE_RANGE_ATTR' ||
          item.attrValue === 'MULTI_CHOICE'
        ) {
          item.value = []
        } else if (item.attrName === 'workItemType') {
          item.value = []
        } else {
          item.value = ''
        }
      }

      this.handleFilter()
    },
    // 分组
    groupProject(list, type) {
      if (!list.length) {
        return []
      }
      let result = [
        {
          label: type === 'projectId' ? '进行中' : '未归档',
          children: [],
        },
        {
          label: type === 'projectId' ? '已结束' : '已归档',
          children: [],
        },
      ]
      list.forEach(item => {
        if (
          (type === 'projectId' && item.completed) ||
          (type !== 'projectId' && item.status === 2)
        ) {
          result[1].children.push(item)
        } else {
          result[0].children.push(item)
        }
      })

      if (type === 'sprintId') {
        result[0].children.unshift({
          key: 0,
          id: 0,
          value: '未规划',
          name: '未规划',
          label: '未规划',
          status: 1,
        })
      }
      return result
    },
    // 导出数据
    handleExport() {
      this.$emit('export')
    },
    /**
     * 2 个数组求差集
     */
    differenceSet(target, origin) {
      !target && (target = [])

      return [...target]
        .filter(x =>
          [...origin].every(y => y.id !== x.id || y.userId !== x.userId),
        )
        .map(item => ({
          ...item,
          noHeight: true,
        }))
    },
    // 删除单个更多查询条件
    deleteMoreField(field, index, isReload = false) {
      this.localMoreFiltersList.splice(index, 1)
      this.$refs.filterSelect.handleChange(false, field)
      if (isReload) {
        this.handleSearch()
      }
    },
    // 清除查询条件--单个
    clearFilterValue(field) {
      if (Array.isArray(field.value)) {
        const defaultField = [...topFilterFields, ...moreFilterFields].find(
          item => item.attrName === field.attrName,
        )
        field.value = defaultField?.value || []
      } else {
        field.value = ''
      }
    },
    // 清除全部查询条件
    clearAll() {
      this.localFiltersList.map(field => {
        this.clearFilterValue(field)
      })
      this.handleSearch()
    },
  },
}
