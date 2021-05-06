<template>
  <div
    v-loading="loading"
    class="gantt-box-container"
    element-loading-text="数据加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0)"
  >
    <public-filter
      :filter-list="filterList"
      :more-filter-list="moreFilterList"
      :cache-filter-key="cacheKeyName"
      action-name="POST_FILTER_FIELDS_OPTIONS"
      @addField="
        showFieldSetting('filterField', systemQueryFields, pickedFields)
      "
      @submitSearch="receiveParams"
    >
      <template #filterRight>
        <div class="filter-right">
          <co-divider direction="vertical"></co-divider>
          <div class="view">
            <el-dropdown
              size="medium"
              class="gantt-dropdown-link"
              @command="onViewModeChange"
            >
              <span class="el-dropdown-link cursor-pointer">
                {{ $t(viewModeText)
                }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown" class="gantt-dropdown-menu">
                <el-dropdown-item
                  command="list"
                  :disabled="viewMode === 'list'"
                  >{{ $t('列表视图') }}</el-dropdown-item
                >
                <el-dropdown-item
                  command="tree"
                  :disabled="viewMode === 'tree'"
                  >{{ $t('树状视图') }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <co-divider direction="vertical"></co-divider>
          <div class="today">
            <el-button type="primary" @click="intoViewToday">{{
              $t('今日')
            }}</el-button>
          </div>
          <co-divider direction="vertical"></co-divider>
          <div>
            <co-link
              :underline="false"
              :disabled="tableDataList.length < 1"
              @click="exportSheet"
              ><i class="co-icon-upload el-icon--left" />{{
                $t('导出')
              }}</co-link
            >
          </div>
        </div>
      </template>
    </public-filter>
    <div class="gantt-content">
      <table-gantt
        ref="gantt"
        :column-list="tableHeaderList"
        :data-list="tableDataList"
        :expand-all="expandAll"
        @taskClick="openSlide"
        @updateSuccess="quicklyUpdateInfo"
        @customIconClick="
          showFieldSetting(
            'tableHeaderField',
            systemTableFields,
            pickedHeaderFields,
          )
        "
        @scrollBottom="scrollBottom"
      ></table-gantt>
    </div>
    <co-dialog
      id="gantt-filter-field-dialog"
      :title="settingType === 'filterField' ? '增加过滤字段' : '表头字段设置'"
      :visible.sync="fieldSettingVisible"
      width="800px"
      :close-on-click-modal="false"
      @closed="dialogClosed"
    >
      <div class="field-content">
        <div class="field__content--left">
          <div class="field__content--title">
            <span>{{ $t('可选字段') }}</span>
          </div>
          <div class="field__list">
            <div class="field__list--set">
              <span>{{ $t('系统字段') }}</span>
              <co-checkbox-group
                v-if="settingType === 'filterField'"
                v-model="pickedFields"
                size="medium"
              >
                <ul>
                  <li v-for="item in systemFieldsList" :key="item.attrName">
                    <co-checkbox
                      :label="item.attrName"
                      @change="handleFieldChange($event, item)"
                      >{{ item.fieldName }}</co-checkbox
                    >
                  </li>
                </ul>
              </co-checkbox-group>
              <co-checkbox-group
                v-else
                v-model="pickedHeaderFields"
                size="medium"
              >
                <ul>
                  <li v-for="item in systemFieldsList" :key="item.attrName">
                    <co-checkbox
                      :label="item.attrName"
                      :disabled="item.required"
                      @change="handleFieldChange($event, item)"
                      >{{ item.fieldName }}</co-checkbox
                    >
                  </li>
                </ul>
              </co-checkbox-group>
            </div>
          </div>
        </div>
        <div class="line"></div>
        <div class="field__content--right">
          <div class="field__content--title">
            <span>当前选定字段</span>
            <co-link :underline="false" type="primary" @click="restoreDefault"
              >恢复默认</co-link
            >
          </div>
          <div class="select__set">
            <div
              v-for="item in rightPickedListNotSort"
              :key="item.attrName"
              class="select-item no-sortable"
            >
              <div>
                <i class="co-icon-move-solid"></i>
                <span>{{ item.fieldName }}</span>
              </div>
              <i class="select-item-del el-icon-close"></i>
            </div>
            <draggable
              v-model="rightPickedListSortable"
              v-bind="dragOptions"
              @change="handleSortChange"
            >
              <div
                v-for="(item, index) in rightPickedListSortable"
                :key="item.attrName"
                class="select-item"
              >
                <div>
                  <i class="co-icon-move-solid"></i>
                  <span>{{ item.fieldName }}</span>
                </div>
                <i
                  class="select-item-del el-icon-close"
                  @click="deleteCurrent(item.attrName, index)"
                ></i>
              </div>
            </draggable>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fieldSettingVisible = false">{{
          $t('取消')
        }}</el-button>
        <el-button type="primary" @click="submitSelectedFields">{{
          $t('提交')
        }}</el-button>
      </span>
    </co-dialog>
    <!-- 工作项滑窗 -->
    <open-work-item-slide
      :id="sliderWorkItemInfo.id"
      :project-id="sliderWorkItemInfo.projectId"
      :work-item-type="sliderWorkItemInfo.workItemType"
      :slider-status.sync="sliderWorkItemInfo.sliderStatus"
      class="work-item-slide"
      @updateWorkInfoSuccess="updateWorkInfoSuccess"
    ></open-work-item-slide>
  </div>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
import draggable from 'vuedraggable'
import OpenWorkItemSlide from '@/components/biz/open-work-item-slide'
import CopeUrlOpenSliderMixin from '@/components/biz/open-work-item-slide/CopeUrlOpenSliderMixin'

import PublicFilter from './PublicFilter'
import TableGantt from './TableGantt'
import { ganttActionTypes } from '@/store/action-types'
import ganttAPI from '@/api/gantt'

const baseOptions = () => {
  return {
    value: '',
    selectList: [],
    filterField: false,
    popperAppendToBody: true,
    isClearable: false,
    isAssignUser: false,
  }
}
const inputAttrs = {
  prefix: true,
  placeholder: '请输入标题/ID',
  type: 'text',
}
const selectAttrs = () => {
  return {
    clearAll: true,
    pickAll: true,
    multiple: true,
    loading: true,
    'collapse-tags': true,
  }
}
const dateAttrs = {
  'start-placeholder': '开始日期',
  'end-placeholder': '结束日期',
}

export default {
  name: 'Gantt',
  components: {
    PublicFilter,
    OpenWorkItemSlide,
    TableGantt,
    draggable,
  },
  mixins: [CopeUrlOpenSliderMixin],
  data() {
    return {
      dragOptions: {
        animation: 500,
      },
      loading: false,
      viewMode: localStorage.getItem('gantViewMode') || 'list', // 显示视图类型，默认为列表视图
      filterData: [], // 过滤器数据
      projectAllList: [], // 全部项目
      projectList: [], // 过滤器项目初始值
      sprintAllList: [], // 全部迭代
      sprintList: [], // 过滤器迭代初始值
      workItemTypeOptions: [], // 工作项的选项组
      cacheKeyName: 'GANTT_FILTER_CACHE', // 缓存的key
      settingType: 'filterField', // 弹窗类别
      fieldSettingVisible: false, // 字段设置弹窗显示
      tableHeaderList: [], // 甘特图表头数据
      pageTableData: {}, // 用于缓存分页数据
      sliderWorkItemInfo: {}, // 工作项详情
      filterList: [], // 外部过滤项
      moreFilterList: [], // 更多过滤项
      selectedFilterFields: [], // 已选中的筛选字段
      selectedQueryFields: [], // 默认选中过滤项
      systemQueryFields: [], // 过滤项系统字段
      systemTableFields: [], // 表头系统字段
      selectedTableFields: [], // 表头默认选中字段
      pickedFields: [], // 弹窗选中过滤字段
      pickedHeaderFields: [], // 弹窗选中表头字段
      systemFieldsList: [], // 弹窗可选字段数据
      expandAll: false, // 甘特图是否全部展开
      pageInfo: {
        pageNumber: 1,
        pageSize: 20,
      }, // 分页信息
      totalPages: 0, // 分页总数
      rightPickedListNotSort: [], // 弹窗右侧已选数据--不可排序
      rightPickedListSortable: [], // 弹窗右侧已选数据--可排序
    }
  },
  computed: {
    // 甘特图 table 数据
    tableDataList() {
      let list = []
      Object.values(this.pageTableData).forEach(arr => {
        list = list.concat(...arr)
      })
      return list
    },
    viewModeText() {
      const viewModeTypes = {
        list: '列表',
        tree: '树状',
      }
      return viewModeTypes[this.viewMode] || viewModeTypes.list
    },
  },
  watch: {
    'sliderWorkItemInfo.sliderStatus': {
      handler: function(val) {
        if (!val) {
          this.sliderWorkItemInfo.id = ''
          this.$router.replace({
            query: {},
          })
        }
      },
    },
  },
  created() {},
  async mounted() {
    this.pageInfo.pageSize = this.calcPageSize()
    await this.getInitValue()
    this.getFilterFields()
    this.getTableHeaderFields()
  },
  methods: {
    // 展示字段设置弹窗
    showFieldSetting(type, fields, picked) {
      this.settingType = type
      this.systemFieldsList = cloneDeep(fields)
      const rightList = this.updateFieldFilter(picked, this.systemFieldsList)
      this.rightPickedListNotSort = rightList.filter(j => !j.sortable)
      this.rightPickedListSortable = rightList.filter(j => j.sortable)
      this.fieldSettingVisible = true
    },
    dialogClosed() {
      if (this.settingType === 'filterField') {
        this.pickedFields = this.moreFilterList.map(j => j.attrName)
      } else {
        this.pickedHeaderFields = this.selectedTableFields.map(j => j.attrName)
      }
    },
    // 恢复默认字段
    async restoreDefault() {
      if (this.settingType === 'filterField') {
        this.pickedFields = this.selectedQueryFields.map(j => j.attrName)
        this.rightPickedListSortable = this.systemQueryFields.filter(
          i => new Set(this.pickedFields).has(i.attrName) && i.sortable,
        )
      } else {
        await this.getTableHeaderFields({
          defaultConfig: true,
        })
        this.rightPickedListSortable = this.systemTableFields.filter(
          i => new Set(this.pickedHeaderFields).has(i.attrName) && i.sortable,
        )
      }
    },
    // 更新字段
    submitSelectedFields() {
      if (this.settingType === 'filterField') {
        this.moreFilterList = this.initFilterValue(
          this.combination(
            this.updateFieldFilter(this.pickedFields, this.systemQueryFields),
          ),
          this.filterData,
        )
      } else {
        this.updateTableHeader(
          this.updateFieldFilter(
            this.pickedHeaderFields,
            this.systemTableFields,
          ),
        )
      }
      this.fieldSettingVisible = false
    },
    updateFieldFilter(selected, originList) {
      let sortableList = []
      selected.forEach(item => {
        sortableList.push(originList.find(i => i.attrName === item))
      })
      return sortableList
    },
    // 更新表头字段
    async updateTableHeader(list) {
      let res = await this.$store.dispatch(
        ganttActionTypes.UPDATE_TABLE_HEADER_FIELDS,
        {
          displayColumns: list,
        },
      )
      if (res.status === 200) {
        const { displayColumns = [] } = res.data || {}
        this.selectedTableFields = displayColumns
        this.pickedHeaderFields = displayColumns.map(i => i.attrName)
        this.$message({
          type: 'success',
          message: '表头设置成功',
        })
        this.pageInfo.pageNumber = 1
        this.pageTableData = {}
        this.loading = true
        this.requestData()
      }
    },
    // 甘特图定位到今日
    intoViewToday() {
      this.$refs.gantt.scrollToday()
    },
    // 导出
    exportSheet() {
      this.$fileDownLoadForGet(
        ganttAPI.exportSheet.url,
        { ...this.paramsFormat(), treeToShow: this.viewMode === 'tree' },
        {},
      )
    },
    // 操作工作项后更新数据列表
    updateWorkInfoSuccess() {
      this.loading = true
      this.$refs.gantt.renderHistory()
      this.requestData(this.sliderWorkItemInfo.pageNumber)
    },
    // 展开工作项详情
    openSlide(info) {
      const { id, projectId, workItemType, pageNumber = 1 } =
        info?.task?.detail || {}

      this.sliderWorkItemInfo = {
        id,
        projectId,
        workItemType,
        sliderStatus: true,
        pageNumber,
      }
    },
    // 甘特图更新工作项的回调
    quicklyUpdateInfo() {
      this.requestData(1)
    },
    // 获取过滤器字段
    async getFilterFields() {
      let res = await this.$store.dispatch(ganttActionTypes.GET_FILTER_FIELDS)
      if (res.status === 200) {
        const { topFields = [], systemFields = [], selectedFields = [] } =
          res.data || {}
        let outFilterList = this.combination(topFields)
        let pickedFields = selectedFields.map(j => j.attrName)
        this.systemQueryFields = systemFields.map(i => {
          return {
            ...i,
            sortable: true,
          }
        })
        this.selectedQueryFields = selectedFields
        if (this.cacheKeyName) {
          let cache = localStorage.getItem(this.cacheKeyName)
          let { condition = [], fields = [] } = cache ? JSON.parse(cache) : {}
          this.filterList =
            cache && condition.length
              ? this.initFilterValue(outFilterList, condition)
              : outFilterList
          this.pickedFields = cache ? fields : pickedFields
          this.selectedFilterFields = this.updateFieldFilter(
            this.pickedFields,
            systemFields,
          )
          this.moreFilterList =
            cache && condition.length
              ? this.initFilterValue(
                  this.combination(this.selectedFilterFields),
                  condition,
                )
              : this.combination(this.selectedFilterFields)
        } else {
          this.filterList = outFilterList
          this.pickedFields = pickedFields
          this.selectedFilterFields = this.updateFieldFilter(
            this.pickedFields,
            systemFields,
          )
          this.moreFilterList = this.combination(this.selectedFilterFields)
        }
      }
    },
    // 获取表头字段
    async getTableHeaderFields(params = {}) {
      let result = await this.$store.dispatch(
        ganttActionTypes.GET_TABLE_HEADER_FIELDS,
        params,
      )
      if (result.status === 200) {
        const { displayColumns = [], columns = [] } = result.data || {}
        if (!params.defaultConfig) {
          this.selectedTableFields = displayColumns
          this.systemTableFields = columns
        }
        this.pickedHeaderFields = displayColumns.map(i => i.attrName)
      }
    },
    combination(list) {
      return list.map(i => {
        let attrs = {}
        let options = baseOptions()
        if (i.formType === 'INPUT') {
          attrs = inputAttrs
        } else if (i.formType === 'SELECT') {
          attrs = selectAttrs()
          if (i.attrName === 'projectIds') {
            options.value = this.projectList.length
              ? this.projectList.map(i => i.id)
              : ['all']
            options.selectList = this.groupProject(this.projectList, i.attrName)
            attrs.group = true
          } else if (i.attrName === 'sprintIds') {
            options.value = this.sprintList
              ? this.sprintList.map(i => i.id)
              : ['all']
            options.selectList = this.groupProject(this.sprintList, i.attrName)
            attrs.group = true
          } else {
            options.value = ['all']
          }
        } else if (i.formType === 'DATE_PICKER') {
          attrs = dateAttrs
        } else if (i.formType === 'CHECKBOX') {
          options.value = JSON.parse(i.presetValue).key || []
          options.selectList =
            JSON.parse(i.options).map(k => {
              return {
                ...k,
                key: k.value,
                value: k.label,
              }
            }) || []
          this.workItemTypeOptions = cloneDeep(options.selectList)
        }
        return {
          ...i,
          ...options,
          attrs,
        }
      })
    },
    // 读取缓存给筛选项赋初始值
    initFilterValue(list, target) {
      return list.map(i => {
        let obj = target.find(j => j.key === i.attrName) || {}
        if (obj.key === 'projectIds' && obj.value + '' !== 'all') {
          this.filterDeleteData(obj, this.projectAllList, this.projectList)
        }
        if (obj.key === 'sprintIds' && obj.value + '' !== 'all') {
          this.filterDeleteData(obj, this.sprintAllList, this.sprintList)
        }
        let defaultValue
        // 赋默认值
        if (Array.isArray(obj.value)) {
          defaultValue = obj.value.filter(i => i)
        } else if (obj.value) {
          defaultValue = obj.value
        } else if (i.formType === 'SELECT') {
          defaultValue = ['all']
        } else if (i.formType === 'CHECKBOX') {
          defaultValue = []
        } else {
          defaultValue = ''
        }
        let temp = {
          ...i,
          value: defaultValue,
          selectList:
            i.formType === 'CHECKBOX'
              ? this.workItemTypeOptions
              : obj.presetList,
        }
        if (i.attrs.group) {
          temp.selectList = this.groupProject(obj.presetList || [], i.attrName)
        }
        return temp
      })
    },
    // 排除已经删除的数据
    filterDeleteData(obj, list, _default) {
      // 求后台数据和本地缓存的并集
      let sameSet = list.filter(k => obj.value.indexOf(k.id) !== -1)
      obj.presetList = sameSet.length ? sameSet : _default
      //如果并集为空，说明本地缓存的数据已经被删除了，然后给过滤项初始值赋默认值
      obj.value = sameSet.length
        ? sameSet.map(m => m.id)
        : _default.map(i => i.id) || ['all']
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
      return result
    },
    // 获取项目和迭代的初始值
    async getInitValue() {
      this.loading = true
      let res = await this.$store.dispatch(
        ganttActionTypes.POST_FILTER_FIELDS_OPTIONS,
        {
          projectIds: [],
          attrName: 'projectIds',
          dataSource: 'project',
        },
      )
      if (res.status === 200) {
        // let projectIds = []
        this.projectAllList =
          res?.data?.map(m => {
            return {
              ...m,
              key: m.id,
              value: m.name,
            }
          }) || []
        this.projectList = this.projectAllList.filter(i => !i.completed)
        let result = await this.$store.dispatch(
          ganttActionTypes.POST_FILTER_FIELDS_OPTIONS,
          {
            projectIds: this.projectList.map(j => j.id),
            attrName: 'sprintIds',
            dataSource: 'sprint',
          },
        )
        if (result.status === 200) {
          this.sprintAllList =
            result?.data?.map(m => {
              return {
                ...m,
                key: m.id,
                value: m.name,
              }
            }) || []
          this.sprintList = this.sprintAllList.filter(i => i.status === 1)
        }
      }
    },
    // 接受参数
    receiveParams(params) {
      this.loading = true
      this.filterData = params
      this.pageInfo.pageNumber = 1
      this.pageTableData = {}
      this.requestData()
    },
    //  切换树状/列表视图显示
    onViewModeChange(cmd) {
      this.loading = true
      this.viewMode = cmd
      localStorage.setItem('gantViewMode', this.viewMode)
      this.requestData()
    },
    // 请求数据
    async requestData(num = '') {
      let payload = {}
      const { pageNumber, pageSize } = this.pageInfo
      payload = {
        ...this.paramsFormat(),
        treeToShow: this.viewMode === 'tree',
        pageInfo: {
          pageSize,
          pageNumber: num || pageNumber,
        },
      }
      this.expandAll = payload.title ? true : false
      let res = {
        status: 0,
      }
      try {
        res = await this.$store.dispatch(
          ganttActionTypes.POST_TABLE_DATA,
          payload,
        )
        if (res.status === 200) {
          const { fields = [], pageInfo = {}, result = [] } = res.data || {}
          this.tableHeaderList = fields
          this.totalPages = pageInfo.totalPages
          result.length &&
            this.$set(
              this.pageTableData,
              [payload.pageInfo.pageNumber],
              result.map(k => {
                return {
                  ...k,
                  childrenTasks: k.leisureTime,
                  extraText: k.estimatedTime ? k.estimatedTime + 'h' : null,
                  pageNumber: this.pageInfo.pageNumber,
                }
              }),
            )
        }
      } finally {
        this.loading = false
      }
      if (!payload.workItemTypes) {
        this.$message({
          type: 'error',
          message: '请选择工作项',
        })
      }
    },
    // 滚动到底部加载更多
    scrollBottom() {
      if (this.totalPages > this.pageInfo.pageNumber) {
        this.loading = true
        this.pageInfo.pageNumber += 1
        this.$refs.gantt.renderHistory()
        this.requestData()
      }
    },
    // 参数格式化
    paramsFormat() {
      let targetObj = {}
      cloneDeep(this.filterData).forEach(item => {
        let temp = item.value + ''
        if (temp.trim() && !['undefined', 'all'].includes(temp)) {
          targetObj[item.key] = item.value
        }
      })
      return targetObj
    },
    // 动态计算甘特图分页大小
    calcPageSize() {
      return Math.max(Math.ceil((window.innerHeight - 250) / 32), 20)
    },
    // 修改字段
    handleFieldChange(val, item) {
      if (val) {
        this.rightPickedListSortable.push(item)
      } else {
        this.rightPickedListSortable.splice(
          this.rightPickedListSortable.indexOf(item),
          1,
        )
      }
    },
    // 修改排序
    handleSortChange() {
      let fieldList = [
        ...this.rightPickedListNotSort.map(i => i.attrName),
        ...this.rightPickedListSortable.map(i => i.attrName),
      ]
      if (this.settingType === 'filterField') {
        this.pickedFields = fieldList
      } else {
        this.pickedHeaderFields = fieldList
      }
    },
    deleteCurrent(attr, idx) {
      let pickedList
      if (this.settingType === 'filterField') {
        pickedList = this.pickedFields
      } else {
        pickedList = this.pickedHeaderFields
      }
      pickedList.splice(pickedList.indexOf(attr), 1)
      this.rightPickedListSortable.splice(idx, 1)
    },
  },
}
</script>
<style lang="scss" scoped>
// ul,
// li {
//   list-style: none;
//   margin: 0;
//   padding: 0;
// }
.gantt-box-container {
  // position: absolute;
  // top: 0;
  // right: 0;
  // bottom: 0;
  // left: 0;
  height: 100%;
  // padding: 20px;
  margin: auto;
  background-color: #e9edf0;
  box-sizing: border-box;
  transition: all 0.12s ease, 0.12s ease;
  overflow: auto;

  .filter-right {
    display: flex;
    align-items: center;
    .el-divider--vertical {
      height: 20px;
      margin: 0 15px;
    }

    .gantt-dropdown-link {
      color: $--color-primary;
    }

    div {
      // padding: 0 15px;
      &:first-child {
        padding-left: 0;
      }
      &:last-child {
        padding-right: 0;
      }
      &.today {
        border-right: 1px solid #eee;
        // span {
        //   display: inline-block;
        //   padding: 6px 12px;
        //   line-height: 1;
        //   color: #fff;
        //   // background-color: #007aff;
        //   border-radius: 4px;
        //   cursor: pointer;
        // }
      }
    }
    // .view {
    //   .el-dropdown-link {
    //     color: #007aff;
    //   }
    // }
  }

  .gantt-content {
    // 100% - header - padding
    height: calc(100% - 73px - 16px);
    padding: 8px;
  }

  .field-content {
    display: flex;
    margin-bottom: 20px;
    .field__content--title {
      display: flex;
      justify-content: space-between;
      padding: 0 12px;
      height: 36px;
      line-height: 36px;
      background-color: #f1f4f9;
      span {
        font-weight: bolder;
      }
    }
    .field__content--left {
      flex: 1;
      .field__content--title {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
      }
      .field__list {
        padding-top: 15px;
        padding-left: 12px;
        max-height: 300px;
        overflow: auto;
        .field__list--set {
          font-size: 12px;
          span {
            display: block;
            color: #010101;
            font-weight: bolder;
            margin-bottom: 8px;
          }
          ul {
            display: flex;
            flex-wrap: wrap;
            padding: 0;
            li {
              width: 112px;
              overflow: hidden;
              margin-right: 15px;
              margin-bottom: 15px;
              &:nth-child(4n) {
                margin-right: 0;
              }
            }
          }
        }
      }
    }
    .line {
      border-left: 1px solid #f1f4f9;
    }
    .field__content--right {
      width: 230px;
      flex-shrink: 0;
      .field__content--title {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }
      .select__set {
        padding-top: 15px;
        padding-left: 12px;
        max-height: 300px;
        overflow: auto;
        .select-item {
          display: flex;
          margin-bottom: 15px;
          align-items: center;
          &.no-sortable {
            div,
            .select-item-del {
              cursor: not-allowed;
              color: #ccc;
            }
          }
          div {
            display: flex;
            align-items: center;
            flex: 1;
            cursor: move;
            i {
              flex-shrink: 0;
              margin-right: 6px;
            }
            span {
              flex: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 1;
            }
          }
          &:last-child {
            margin-bottom: 0;
          }
        }
        .select-item-del {
          flex-shrink: 0;
          padding-left: 10px;
          cursor: pointer;
          font-size: 14px;
        }
      }
    }
  }
}

.gantt-dropdown-menu /deep/ {
  .el-dropdown-menu__item.is-disabled {
    color: $--color-primary;
  }
}
</style>
