import cloneDeep from 'lodash/cloneDeep'

import { workbenchActions } from '@/store/action-types'
import { getRealUrl } from '@/utils/sub-app-util'
import { customFilterDetailByNameApi } from '@/api/custom-filter'

// TODO warning 筛选条件中，注意项目和迭代是存在先后顺序的，使用组件的时候请注意注入候选筛选项的筛选条件
const filterMaps = [
  {
    attrName: 'searchKey',
    attrValue: 'INPUT',
    fieldName: 'ID/标题',
    formType: 'INPUT',
    value: '',
    attrs: {},
  },
  {
    attrName: 'workItemTypes',
    attrValue: 'CHECKBOX',
    fieldName: '工作项',
    formType: 'CHECKBOX',
    value: [],
    selectList: [
      {
        value: '需求',
        label: '需求',
        key: 1,
      },
      {
        value: '任务',
        label: '任务',
        key: 2,
      },
      {
        value: '缺陷',
        label: '缺陷',
        key: 3,
      },
    ],
    filterField: false,
    popperAppendToBody: true,
    isClearable: false,
    isAssignUser: false,
    attrs: {},
  },
  {
    attrName: 'statusClassifies',
    attrValue: 'MULTI_CHOICE',
    fieldName: '状态',
    formType: 'CHECKBOX',
    value: ['done', 'cancel', 'inProgress'],
    selectList: [
      {
        value: '结束态',
        label: '结束态',
        key: 'done',
      },
      {
        value: '取消态',
        label: '取消态',
        key: 'cancel',
      },
      {
        value: '进行中',
        label: '进行中',
        key: 'inProgress',
      },
    ],
    filterField: false,
    popperAppendToBody: false,
    isClearable: false,
    isAssignUser: false,
    attrs: {
      clearAll: false,
      pickAll: false,
      multiple: true,
      loading: false,
      'collapse-tags': true,
      group: false,
    },
  },
  {
    attrName: 'deadlines',
    attrValue: 'MULTI_CHOICE',
    fieldName: '截止类型',
    formType: 'CHECKBOX',
    value: [],
    selectList: [
      {
        value: '已延期',
        label: '已延期',
        key: 'delay',
      },
      {
        value: '今日到期',
        label: '今日到期',
        key: 'dueToday',
      },
      {
        value: '本周到期',
        label: '本周到期',
        key: 'dueThisWeek',
      },
      {
        value: '未排期及其他',
        label: '未排期及其他',
        key: 'other',
      },
    ],
    filterField: false,
    popperAppendToBody: false,
    isClearable: false,
    isAssignUser: false,
    attrs: {
      clearAll: false,
      pickAll: false,
      multiple: true,
      loading: false,
      'collapse-tags': true,
      group: false,
    },
  },
  {
    attrName: 'projectIds',
    attrValue: 'MULTI_CHOICE_SEARCH',
    fieldName: '项目',
    dataSource: 'project',
    formType: 'SELECT',
    value: ['all'],
    selectList: [],
    filterField: false,
    popperAppendToBody: true,
    isClearable: false,
    isAssignUser: false,
    attrs: {
      clearAll: true,
      pickAll: true,
      multiple: true,
      loading: true,
      'collapse-tags': true,
      group: true,
    },
  },
  {
    attrName: 'sprintIds',
    attrValue: 'MULTI_CHOICE_SEARCH',
    fieldName: '迭代',
    dataSource: 'sprint',
    formType: 'SELECT',
    value: ['all'],
    selectList: [],
    filterField: false,
    popperAppendToBody: true,
    isClearable: false,
    isAssignUser: false,
    attrs: {
      clearAll: true,
      pickAll: true,
      multiple: true,
      loading: true,
      'collapse-tags': true,
      group: true,
    },
  },
  {
    attrName: 'endTimes',
    attrValue: 'LITE_DATE_RANGE_ATTR',
    fieldName: '预计结束时间',
    formType: 'DATE_PICKER',
    value: [],
    selectList: [],
    filterField: false,
    popperAppendToBody: true,
    isClearable: false,
    isAssignUser: false,
    attrs: {
      'start-placeholder': '开始日期',
      'end-placeholder': '结束日期',
    },
  },
  {
    attrName: 'startTimes',
    attrValue: 'LITE_DATE_RANGE_ATTR',
    fieldName: '预计开始时间',
    formType: 'DATE_PICKER',
    value: [],
    selectList: [],
    filterField: false,
    popperAppendToBody: true,
    isClearable: false,
    isAssignUser: false,
    attrs: {
      'start-placeholder': '开始日期',
      'end-placeholder': '结束日期',
    },
  },
  {
    attrName: 'finishTimes',
    attrValue: 'LITE_DATE_RANGE_ATTR',
    fieldName: '实际完成时间',
    formType: 'DATE_PICKER',
    value: [],
    selectList: [],
    filterField: false,
    popperAppendToBody: true,
    isClearable: false,
    isAssignUser: false,
    attrs: {
      'start-placeholder': '开始日期',
      'end-placeholder': '结束日期',
    },
  },
  {
    attrName: 'prioritys',
    attrValue: 'MULTI_CHOICE_SEARCH',
    fieldName: '优先级',
    dataSource: 'priority',
    formType: 'SELECT',
    value: ['all'],
    selectList: [],
    filterField: false,
    popperAppendToBody: true,
    isClearable: false,
    isAssignUser: false,
    attrs: {
      clearAll: true,
      pickAll: true,
      multiple: true,
      loading: true,
      'collapse-tags': true,
      group: false,
    },
  },
]

import { getRootEl } from '@/utils'
import { parseResponse } from '@/utils/http'
export default {
  inject: ['worker'],
  data() {
    return {
      localFiltersList: [],
      saveForm: {
        projectId: -1,
        type: -1,
        filterName: this.filterName,
        isPrivate: true,
        replaceSave: true,
        systemFieldFilter: {},
        userFieldFilter: '{}',
      },
      cacheFilter: {},
      rootEl: getRootEl(),
      canClose: false,
    }
  },
  created() {},
  async mounted() {
    this.worker.postMessage({
      type: 'http',
      event: 'card_filter_info',
      props: {
        method: 'get',
        url: getRealUrl(customFilterDetailByNameApi.url, { ssoToken: true }),
        payload: {
          projectId: -1,
          filterName: this.filterName,
        },
      },
    })
    this.worker.addEventListener('message', async e => {
      const { event, res = {} } = e.data
      if (event !== 'card_filter_info') {
        return
      }

      try {
        parseResponse(
          { data: res },
          function() {},
          function() {},
        )
      } catch (error) {
        console.error(error)
      }

      if (
        res.status === 200 &&
        Object.keys(res.data?.systemFieldFilter || {}).length
      ) {
        this.formatCacheFilter(res.data?.systemFieldFilter || {})

        if (this.filtersList.length) {
          this.cacheValueModel()
          this.$emit('submitSearch', this.currentModelValue)
        }
      } else {
        if (this.$attrs['init-filter']) {
          await this.initFilters()
        }
        this.handleFilter()
      }
    })
    this.rootEl.addEventListener('mousedown', this.handleMouseDown)
    this.rootEl.addEventListener('click', this.handleFilterClose)
  },
  beforeDestroy() {
    this.rootEl.removeEventListener('mousedown', this.handleMouseDown)
    this.rootEl.removeEventListener('click', this.handleFilterClose)
  },
  methods: {
    // 缓存数据初始化，仅供初始化过滤器调用
    cacheValueModel() {
      const values = []
      for (const [key, value] of Object.entries(this.cacheFilter)) {
        values.push({
          key,
          value: Array.isArray(value) && value[0] === 'all' ? [] : value,
        })
      }
      this.currentModelValue = this.filterObj = values
    },
    // 鼠标点击
    handleMouseDown(e) {
      if (
        this.$el &&
        this.$el.contains(e.target) &&
        !/workbench-filter-container/.test(e.target.className)
      ) {
        this.canClose = false
      } else {
        this.canClose = true
      }
    },
    // 关闭
    handleFilterClose() {
      if (!this.canClose) {
        return
      }

      this.canClose = false
      this.drawerShow = false
    },
    // 格式化缓存过滤器
    formatCacheFilter(filters) {
      if (filters && Object.keys(filters).length) {
        for (const item of this.filtersList) {
          const originFilter = filters[item.attrName]
          if (!originFilter || !originFilter?.length) {
            if (
              ['projectIds', 'sprintIds', 'prioritys'].includes(item.attrName)
            ) {
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
      this.loading = true
      this.localFiltersList = []
      if (this.filtersList?.length) {
        for (const filter of this.filtersList) {
          let originFilter = filterMaps.find(
            item => item.attrName === filter.attrName,
          )

          if (originFilter) {
            originFilter = cloneDeep(originFilter)
            await this.getSelectList(originFilter)
            const value = this.computedValue(filter, originFilter)

            this.localFiltersList.push({
              ...originFilter,
              ...filter,
              value,
            })
          }
        }
      }

      this.loading = false
      this.init = true
      this.copyFilters = cloneDeep(this.localFiltersList)
    },
    // 计算过滤器value
    computedValue(filter, originFilter) {
      let value = originFilter.value
      let selectList = originFilter.selectList

      // 传递默认值处理
      if (filter.initValue) {
        if (typeof filter.initValue === 'function') {
          if (originFilter.attrs.group) {
            selectList = []
            originFilter.selectList.forEach(item => {
              selectList.push(...item.children)
            })
          }

          value = filter.initValue(selectList)
        } else {
          value = filter.initValue
        }
      }

      // 缓存处理
      const cacheValue = this.cacheFilter[filter.attrName]
      cacheValue && (value = cacheValue)

      // 需要去除存储中已被删除的项目或者迭代
      if (
        cacheValue &&
        ['projectIds', 'sprintIds'].includes(originFilter.attrName)
      ) {
        const valueSet = new Set(selectList.map(item => item.key))
        value = cacheValue.filter(v => {
          return valueSet.has(v)
        })
        !value.length && (value = ['all'])

        //TODO 当只选择一个项目，该项目被删除后需要清空已选择的未规划的迭代, 此时默认选择全部
        if (
          this.cacheFilter['projectIds'].length === 1 &&
          this.cacheFilter['projectIds']?.[0] !== 'all' &&
          originFilter.attrName === 'sprintIds'
        ) {
          const currentProjectIds =
            this.localFiltersList.find(item => item.attrName === 'projectIds')
              ?.value || []
          currentProjectIds[0] === 'all' && (value = ['all'])
        }
      }

      return value
    },
    // 保存过滤器
    async saveFilter() {
      const filters = {}
      this.currentModelValue.forEach(item => {
        filters[item.key] = item.value
      })
      const hiddenFilters = {}
      this.localFiltersList.map(item => {
        if (item.hidden) {
          hiddenFilters[item.attrName] = item.value
        }
      })
      this.saveForm.systemFieldFilter = { ...this.hiddenFilters, ...filters }
      const res = await this.$store.dispatch(
        workbenchActions.SAVE_FILTER_CACHE_INFO,
        {
          filterName: this.filterName,
          data: this.saveForm,
        },
      )

      if (res.status === 200) {
        this.formatCacheFilter(this.saveForm.systemFieldFilter)
      }
    },
    // 关闭标签
    handleCloseTag(item) {
      const filter = this.localFiltersList.find(
        filter => filter.attrName === item.key,
      )

      if (['projectIds', 'sprintIds', 'prioritys'].includes(filter.attrName)) {
        filter.value = ['all']
      } else if (
        ['LITE_DATE_RANGE_ATTR', 'CHECKBOX', 'MULTI_CHOICE'].includes(
          filter.attrValue,
        )
      ) {
        filter.value = []
      } else {
        filter.value = ''
      }

      this.updateModel()
    },
  },
}
