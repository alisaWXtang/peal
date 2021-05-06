<template>
  <div class="workbench-filter-container">
    <i
      class="filter-icon"
      :class="{
        'iconfont icon-guolv has-filter': hasFilter,
        'iconfont icon-guolv1': !hasFilter,
      }"
      @click="drawerShow = true"
    ></i>
    <div
      v-loading="loading"
      class="filter-drawer-container"
      :class="{ hide: !drawerShow, show: drawerShow }"
    >
      <div class="header">
        <div class="title">{{ $t('过滤') }}</div>
        <div class="close" @click.stop="drawerShow = false">
          <i class="el-icon-close"></i>
        </div>
      </div>
      <div class="content">
        <!--        <div class="prompt">-->
        <!--          &lt;!&ndash; eslint-disable-next-line vue/valid-v-for &ndash;&gt;-->
        <!--          <el-tag-->
        <!--            v-for="(item, index) in promptValues"-->
        <!--            :key="index"-->
        <!--            :title="item.text"-->
        <!--            type="success"-->
        <!--            closable-->
        <!--            @close="handleCloseTag(item)"-->
        <!--            >{{ $t(item.label) }}: {{ item.text }}</el-tag-->
        <!--          >-->
        <!--        </div>-->
        <div
          v-for="form in localFiltersList"
          :key="form.attrName"
          class="filter-item"
          :class="{ hidden: form.hidden }"
        >
          <div class="filter-title">{{ $t(form.fieldName) }}</div>
          <el-input
            v-if="form.attrValue === 'INPUT'"
            v-model="form.value"
          ></el-input>
          <typed-form-item
            v-else
            v-model="form.value"
            class="form-item"
            :type="form.attrValue"
            v-bind="form.attrs"
            :select-list="form.selectList"
            :filter-field="form.filterField"
            :popper-append-to-body="form.popperAppendToBody"
            :is-clearable="form.isClearable"
            :is-assign-user="form.isAssignUser"
            @change="
              value => {
                handleChange(form, value)
              }
            "
          ></typed-form-item>
        </div>
      </div>
      <div class="footer">
        <el-button type="default" @click="clearFilter">{{
          $t('清除筛选')
        }}</el-button>
        <el-button type="primary" @click="handleFilter">{{
          $t('筛选')
        }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @title 基础过滤器
 * @author chenxiaolong
 * @date 2020.01.07
 */
import TypedFormItem from '@/components/typed-form-item'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'
import { workbenchActions } from '@/store/action-types'
import commonMixin from './commonMixin'
import { WORKITEMCONST } from '@/utils/constant'
import isEqual from 'lodash/isEqual'
import moment from 'dayjs'
const priorities = {
  P0: 'P0 / 阻塞',
  P1: 'P1 / 严重',
  P2: 'P2 / 普通',
  P3: 'P3 / 轻微',
}
export default {
  name: 'BaseFilter',
  components: { TypedFormItem },
  mixins: [commonMixin],
  props: {
    filterName: {
      type: String,
      required: true,
      desc: '过滤器的名称，用于建立缓存',
    },
    /**
     * [
     *  {
     *    attrName: 'projectIds',
     *    initValue: [10001]
     *  }
     * ]
     */
    filtersList: {
      type: Array,
      desc: '过滤器配置',
      default: () => [],
    },
  },
  data() {
    return {
      drawerShow: false,
      currentModelValue: [],
      copyFilters: [],
      init: false,
      loading: false,
      filterObj: {},
    }
  },
  computed: {
    // 判断是否有筛选条件
    hasFilter() {
      let hasFilter = false
      for (const filter of this.currentModelValue) {
        if (Array.isArray(filter.value) && filter.value.length) {
          hasFilter = true
          break
        } else if (!Array.isArray(filter.value) && filter.value) {
          hasFilter = true
          break
        }
      }

      return hasFilter && Object.keys(this.cacheFilter).length
    },
    // prompt 提示计算
    promptValues() {
      const values = []
      for (let index = 0; index < this.currentModelValue.length; index++) {
        const filter = this.currentModelValue[index]
        if (!filter || this.localFiltersList[index]?.hidden) {
          continue
        }
        if (Array.isArray(filter.value)) {
          if (filter.presetList?.length) {
            const text = filter.presetList.map(item => item.value).join(',')
            values.push({
              ...filter,
              text,
            })
          } else if (filter.value.length > 1) {
            values.push({
              ...filter,
              text: filter.value
                .join(' - ')
                .replace(/( 00:00:00| 23:59:59)/g, ''),
            })
          }
        } else if (!Array.isArray(filter.value) && filter.value) {
          values.push({
            ...filter,
            text: filter.value,
          })
        }
      }

      return values
    },
  },
  watch: {
    async drawerShow(val) {
      if (!val) {
        const oldData = cloneDeep(this.filterObj)
        const oldFilter = cloneDeep(this.currentModelValue)
        this.updateModel()
        if (!isEqual(oldData, this.filterObj)) {
          this.localFiltersList = cloneDeep(this.copyFilters)
          this.currentModelValue = oldFilter
        }
      } else {
        if (!this.init) {
          await this.initFilters()
          this.updateModel()
        }
      }
    },
    filtersList: {
      async handler(val) {
        if (val && val.length && this.init) {
          await this.initFilters()
          const oldFilters = cloneDeep(this.filterObj)
          this.updateModel()

          if (!isEqual(oldFilters, this.filterObj)) {
            this.$emit('submitSearch', this.currentModelValue)
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    handleChange: debounce(async function(field, value) {
      let target = this.localFiltersList.find(
        i => i.attrName === field.attrName,
      )

      if (value === null && target.attrValue === 'LITE_DATE_RANGE_ATTR') {
        value = []
      }

      target.value = value
      await this.changeProjectLinkage(
        field.attrName,
        value?.indexOf('all') > -1 ? [] : value,
      )

      if (target.attrName === 'workItemTypes') {
        const priorityFilter = this.localFiltersList.find(
          item => item.attrName === 'prioritys',
        )
        const hasBug = value.includes(WORKITEMCONST.workItemTypeMap.bug)
        priorityFilter.selectList = priorityFilter.selectList.map(item => {
          return {
            ...item,
            value: hasBug ? priorities[item.literal] : item.literal,
          }
        })
      }
    }, 300),
    // 更新 v-model 值
    updateModel() {
      this.getModelObj()
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
        } = this.localFiltersList[i]
        if (attrName === 'expectedSolutionPhase') {
          this.localFiltersList[i].attrName = 'expectedSolutionPhases'
        }
        if (attrName === 'businessEnd') {
          this.localFiltersList[i].attrName = 'businessEnds'
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
          label: fieldName,
          value: Array.isArray(value) && value[0] === 'all' ? [] : value,
          presetList: selectList?.length
            ? selectList.filter(j => new Set(value).has(j.key))
            : [],
        }
        condition.push(temp)
      }
      if (this.cacheFilterKey) {
        let cache = localStorage.getItem(this.cacheFilterKey)
        let cacheObj = cache ? JSON.parse(cache) : {}
        cacheObj.condition = condition
        localStorage.setItem(this.cacheFilterKey, JSON.stringify(cacheObj))
      }
      this.currentModelValue = condition
      this.filterObj = condition.map(item => {
        return {
          key: item.key,
          value: item.value,
        }
      })
      return condition
    },
    // 修改项目联动-迭代，相关人，处理人，创建人，需求分类
    async changeProjectLinkage(fieldName, projectIds) {
      if (fieldName === 'projectIds') {
        for (let i = 0, len = this.localFiltersList.length; i < len; i++) {
          let { attrName, dataSource } = this.localFiltersList[i]
          if (
            [
              'assignUsers',
              'createUsers',
              'relevantUsers',
              'categoryIds',
            ].includes(attrName)
          ) {
            this.localFiltersList[i].value = ['all']
          }
          if (attrName === 'sprintIds') {
            let result = await this.$store.dispatch(
              workbenchActions.GET_FILTER_FIELDS_OPTIONS,
              {
                projectIds,
                attrName,
                dataSource,
              },
            )
            if (result?.length) {
              let list =
                result.map(k => {
                  return {
                    ...k,
                    key: k.id,
                    value: k.name,
                  }
                }) || []
              this.localFiltersList[i].selectList = this.groupProject(
                list,
                attrName,
              )
              this.localFiltersList[i].value = [...list, { status: 1, id: 0 }]
                .filter(m => m.status === 1)
                .map(n => n.id)
            }
          }
        }
      }
    },
    // 过滤
    handleFilter: debounce(
      function() {
        this.updateModel()
        this.saveFilter()
        this.$emit('submitSearch', this.currentModelValue)
        this.copyFilters = cloneDeep(this.localFiltersList)
        this.drawerShow = false
      },
      300,
      { leading: true },
    ),
    // 判断当前工作项中是否有bug
    workItemTypeHasBug() {
      const workItemTypes = this.currentModelValue.find(
        item => item.key === 'workItemTypes',
      )?.value

      return (
        workItemTypes &&
        workItemTypes.includes(WORKITEMCONST.workItemTypeMap.bug)
      )
    },
    // 获取select的下拉框的值
    async getSelectList(filter) {
      let projectIds =
        this.localFiltersList.find(i => i.attrName === 'projectIds')?.value ||
        []
      projectIds = ['all', 'undefined'].includes(projectIds + '')
        ? []
        : projectIds
      const hasBug = this.workItemTypeHasBug()
      if (filter?.formType === 'SELECT') {
        let res = await this.$store.dispatch(
          workbenchActions.GET_FILTER_FIELDS_OPTIONS,
          {
            projectIds,
            attrName: filter.attrName,
            dataSource: filter.dataSource,
          },
        )
        const resultData = res
        if (resultData?.length) {
          let selectList = cloneDeep(filter.selectList)
          if (filter.attrs.group) {
            selectList = [].concat.apply(
              [],
              selectList.map(m => m.children),
            )
          }
          let diffList = this.differenceSet(selectList, resultData)
          filter.selectList = [...resultData, ...diffList].map(item => {
            if (
              ['assignUsers', 'createUsers', 'relevantUsers'].includes(
                filter.attrName,
              )
            ) {
              return {
                ...item,
                key: item.userId,
                value: `${item.userName}(${item.userId})`,
              }
            } else if (['projectIds', 'sprintIds'].includes(filter.attrName)) {
              return {
                ...item,
                key: item.id,
                value: item.name,
              }
            } else if (['defectStatusIds'].includes(filter.attrName)) {
              return {
                ...item,
                key: item.statusId,
                value: item.statusName,
              }
            } else if (['prioritys'].includes(filter.attrName)) {
              return {
                ...item,
                key: item.priority,
                value: hasBug ? priorities[item.literal] : item.literal,
              }
            } else {
              return {
                ...item,
                key: item.value,
                value: item.label,
              }
            }
          })
          if (filter.attrs.group) {
            filter.selectList = this.groupProject(
              filter.selectList,
              filter.attrName,
            )
          }
        }
        filter.attrs.loading = false
      }
    },
    // 清空筛选条件
    clearFilter() {
      for (const item of this.localFiltersList) {
        if (['projectIds', 'sprintIds', 'prioritys'].includes(item.attrName)) {
          item.value = ['all']
        } else if (
          item.attrValue === 'LITE_DATE_RANGE_ATTR' ||
          item.attrValue === 'MULTI_CHOICE'
        ) {
          item.value = []
        } else if (item.attrName === 'workItemTypes') {
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
          label: type === 'projectIds' ? '进行中' : '未归档',
          children: [],
        },
        {
          label: type === 'projectIds' ? '已结束' : '已归档',
          children: [],
        },
      ]
      list.forEach(item => {
        if (
          (type === 'projectIds' && item.completed) ||
          (type !== 'projectIds' && item.status === 2)
        ) {
          result[1].children.push(item)
        } else {
          result[0].children.push(item)
        }
      })

      if (type === 'sprintIds') {
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
    handleClose() {
      if (this.drawerShow) {
        this.drawerShow = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
$box-shadow: 0 3px 14px 0 rgba(102, 102, 102, 0.2);
.has-filter {
  color: $--color-primary;
}

.filter-icon {
  cursor: pointer;
  color: $--color-text-secondary;
}

.hidden {
  display: none;
}

.prompt {
  margin-bottom: 10px;
  .el-tag {
    display: inline-block;
    position: relative;
    padding-right: 20px;
    @include no-wrap;

    /deep/ .el-tag__close {
      position: absolute;
      top: 6px;
      right: 4px;
    }
  }
}

.filter-drawer-container {
  border-radius: 6px;
  width: 320px;
  box-sizing: border-box;
  padding: 16px;
  position: absolute;
  top: 0;
  bottom: 0;
  right: -320px;
  background-color: #fff;
  z-index: 1900;
  transition: right 0.3s linear;
  &.hide {
    animation: closeDrawer 0.3s forwards;
  }

  &.show {
    right: 0;
    box-shadow: $box-shadow;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;

    .title {
      font-size: 16px;
      color: #666666;
    }

    .close {
      font-size: 18px;
      cursor: pointer;
      &:hover {
        color: $--color-primary;
      }
    }
  }

  .content {
    margin: 0 -16px;
    padding: 16px;
    height: calc(100% - 65px);
    overflow-y: auto;
    @include scrollbal-common;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
  }
}

.filter-item {
  margin-bottom: 16px;

  /deep/ .el-select-dropdown {
    left: 0 !important; // 复写样式
  }

  .form-item {
    position: relative;

    /deep/ .el-date-editor {
      width: 100%;
      position: relative;
      line-height: normal;

      .el-range__icon {
        display: none;
      }

      .el-icon-date {
        line-height: 28px;
        right: -4px;
        position: relative;
      }
    }

    /deep/ .el-checkbox-group {
      display: flex;
      justify-content: space-between;

      label {
        margin: 0;
      }
    }
  }

  .filter-title {
    font-size: 14px;
    padding-bottom: 5px;
    color: $--color-text-regular;
  }
}

@keyframes closeDrawer {
  0%,
  99% {
    box-shadow: $box-shadow;
  }
  100% {
    box-shadow: none;
  }
}
</style>
