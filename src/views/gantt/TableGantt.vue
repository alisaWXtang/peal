<template>
  <div class="ui-gantt-table">
    <ganttTable
      v-if="columnList.length"
      ref="ganttTable"
      class="gantt-table-container"
      init-left-width="40%"
      :tasks="tasks"
      :gantt-options="ganttOptions"
      height="100%"
      :border-full="true"
      v-bind="$attrs"
      @on_taskbar_click="taskClick"
      @on_date_change="updateWorkItemInfo"
      @scrollBottom="scrollBottom"
    >
      <template #left>
        <span class="table--header-custom">
          <el-tooltip
            class="item"
            effect="dark"
            :content="$t('表头设置')"
            placement="top-start"
            :open-delay="300"
          >
            <i
              class="co-icon-setting table-custom-field-icon color-weight"
              @click="customIconClick"
            ></i>
          </el-tooltip>
        </span>
      </template>
      <co-table-column
        v-for="(item, index) in columns"
        :key="item.attrName + index"
        :prop="item.attrName"
        :label="item.fieldName"
        :width="
          item.attrName === 'title'
            ? undefined
            : currentColumnWidthMap[item.attrName] ||
              columnWidthMap[item.attrName] ||
              columnWidthMap[item.attrValue] ||
              (item.attrValue.indexOf('MEMBER_CHOICE') > -1 ? 180 : 100)
        "
        :min-width="item.attrName === 'title' ? 200 : undefined"
        :align="item.attrName === 'title' ? 'left' : 'center'"
        show-overflow-tooltip
      >
        <template #header>
          <template v-if="item.attrName === 'title'">
            <i
              class="icon-prefix-mutiple"
              :class="{
                'co-icon-arrow-right-solid': !isExpandedAll,
                'co-icon-arrow-down-solid': isExpandedAll,
              }"
              @click="_expandAllHandler"
            ></i>
          </template>
          <table-header
            :value="item.fieldName"
            :sortable="item.sortable"
          ></table-header>
        </template>
        <template slot-scope="scope">
          <StateFlow
            v-if="item.attrName === 'statusId' && !scope.row.isAssignUser"
            :project-id="scope.row.projectId"
            :status-id="scope.row.statusId"
            :work-item-type="scope.row.detail.workItemType"
            :work-item-id="scope.row.id"
            :update-data="() => updateSuccess(scope.row)"
          >
            <work-item-table-custom-column
              :key="item.attrName + scope.row.id"
              :class="{ 'filter-gray': scope.row.detail.isEndOrCancel }"
              :scope="scope"
              :field="item"
              simple
              @selectClick="
                e =>
                  GlobalSelectTargetClick(
                    scope.row,
                    e,
                    item.attrName,
                    () => updateSuccess(scope.row),
                    item,
                  )
              "
              @updateSuccess="info => updateSuccess(info)"
            ></work-item-table-custom-column>
          </StateFlow>
          <template v-else>
            <template
              v-if="scope.row.isAssignUser && item.attrName === 'title'"
            >
              <span>
                <i
                  class="icon-prefix color-light"
                  :class="{
                    'co-icon-arrow-right-solid': !scope.row.isExpanded,
                    'co-icon-arrow-down-solid': scope.row.isExpanded,
                    'filter-gray': scope.row.detail.isEndOrCancel,
                  }"
                  @click="_expandRowHandler(scope)"
                ></i>
                <span class="color-weight">{{ scope.row.userName }}</span>
              </span>
            </template>
            <template v-else-if="!scope.row.isAssignUser">
              <div
                :class="{
                  'table-cell-title': item.attrName === 'title',
                  'highlight-title':
                    scope.row.id === currentRowKey && item.attrName === 'title',
                }"
              >
                <span
                  v-if="item.attrName === 'title'"
                  :class="[
                    'expand-placeholder',
                    'm-l-24',
                    scope.row.childLevel
                      ? `child-level-${scope.row.childLevel}`
                      : '',
                  ]"
                >
                  <span
                    v-if="iconShow(scope.row)"
                    class="tree-ctrl"
                    @click.stop="toggleExpanded(scope.row)"
                  >
                    <i
                      v-if="collapseIds.includes(scope.row.id)"
                      class="el-icon-plus"
                    />
                    <i v-else class="el-icon-minus" />
                  </span>
                </span>
                <span
                  v-if="item.attrName === 'title'"
                  class="custom-prefix"
                  :class="{ 'filter-gray': scope.row.detail.isEndOrCancel }"
                  @click="taskClick({ task: scope.row })"
                >
                  <el-tooltip
                    v-if="scope.row.detail && scope.row.detail.delayed"
                    class="item"
                    effect="dark"
                    :content="$t('已过期')"
                    placement="top-start"
                  >
                    <i class="el-icon-warning warning"></i>
                  </el-tooltip>
                  <span
                    :class="_getworkItemType(scope.row.detail)"
                    class="iconfont title-link-common cp"
                  ></span>
                </span>
                <work-item-table-custom-column
                  :key="item.attrName + scope.row.id"
                  :scope="scope"
                  :field="item"
                  simple
                  :class="{
                    'custom-column-withprefix': item.attrName === 'title',
                    'filter-gray': scope.row.detail.isEndOrCancel,
                  }"
                  @click="
                    () => {
                      item.attrName === 'title' &&
                        taskClick({ task: scope.row })
                    }
                  "
                  @selectClick="
                    e => {
                      GlobalSelectTargetClick(
                        scope.row,
                        e,
                        item.attrName,
                        () => updateSuccess(scope.row),
                        item,
                      )
                    }
                  "
                  @updateSuccess="info => updateSuccess(info)"
                ></work-item-table-custom-column>
              </div>
            </template>
          </template>
        </template>
      </co-table-column>
    </ganttTable>
    <GlobalSelect v-bind="GlobalSelectProps"></GlobalSelect>
  </div>
</template>
<script>
/**
 * @title 哥伦布甘特图组件
 * @desc 本组件作为 gantt 原组件的使用，是扩展了左侧 table 的自定义渲染实现，本身不属于甘特图公共组件的功能
 */
import throttle from 'lodash/throttle'
// import ganttTable from '@heytap/columbus-gantt-canvas/lib/table'
import ganttTable from '@/components/columbus-gantt-canvas/src/gantt-table/ganttTable'
// import TableColumn from '@heytap/cook-ui/lib/table-column'

import GlobalSelect from '@/components/field-edit/GlobalSelect'
// import GlobalInput from '@/pages/tool/FieldEdit/GlobalInput.vue'
import WorkItemTableCustomColumn from '@/components/project/WorkItemTableCustomColumn'
import TableHeader from '@/components/ellipsis-block/TableHeader'
import StateFlow from '@/components/state-flow'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import { WORK_ITEM_ICON } from '@/utils/constant'

// const OTHER_HEIGTH = 64 + 73 + 16 + 32

// const 常量配置
const constmap = {
  id: 'userId', // 当前展开行的 key
}

// 常量 工作项
const WORKITEMTYPE = {
  1: '需求',
  2: '任务',
  3: '缺陷',
}

export default {
  name: 'TableGantt',
  components: {
    ganttTable,
    // [TableColumn.name]: TableColumn,
    WorkItemTableCustomColumn,
    GlobalSelect,
    // GlobalInput,
    TableHeader,
    StateFlow,
  },
  mixins: [ProjectCommonMixin],
  props: {
    columnList: {
      type: Array,
      required: true,
      desc: '表头',
    },
    dataList: {
      type: Array,
      required: true,
      desc: '数据列表',
    },
    expandAll: {
      type: Boolean,
      required: false,
      default: false,
      desc: '是否全部展开',
    },
  },
  data() {
    const vm = this
    return {
      expandRowKeys: [], // 当前展开的行 key
      isExpandedAll: false, // 是否展开所有行
      isFirstExpand: true, // 是否首次展开首行
      collapseIds: [], // 当前收起的父需求的ID
      ganttOptions: {
        bar_height: 16,
        padding: 24,
        custom_popup_html(task) {
          return task.isAssignUser
            ? `<p class="title">${vm.$i18n.t('处理人')}：${task.userName}</p>
            <p class="subtitle">${vm.$i18n.t('时间')}：${task.start} - ${
                task.end
              }</p>`
            : `<p class="title">${vm.$i18n.t(task.workItemName)}：${
                task.name
              }</p>
            <p class="subtitle">${vm.$i18n.t('项目')}：${task.display
                .projectName || task.detail.projectName}</p>
            <p class="subtitle">${vm.$i18n.t('状态')}：${
                task.display.status
              }</p>
            <p class="subtitle">${vm.$i18n.t('时间')}：${task.start} - ${
                task.end
              }</p>
            <p class="title">${vm.$i18n.t('优先级')}：${
                task.display.priority
              }</p>
            <p class="subtitle">${vm.$i18n.t('处理人')}：${
                task.detail.assignUser
              }</p>`
        },
        on_parent_scroll: this.parentScroll,
      },
      tasks: [], // 渲染数据源
      currentRowKey: null, // 当前选中的工作项
      currentColumnWidthMap: {
        priority: 120,
        statusId: 120,
        startTime: 132,
        endTime: 132,
        finishTime: 132,
      },
      // tableHeight: window.innerHeight - OTHER_HEIGTH + 'px',
    }
  },
  computed: {
    columns() {
      return this.columnList || []
    },
    tasksOrigin() {
      const result = this.dataList || []
      const list = []
      const expandRowKeys = this.expandRowKeys

      result.forEach(item => {
        const id = item[constmap.id]
        const pageNumber = item.pageNumber
        list.push({
          ...item,
          name: item.userName,
          id,
          start: item.startTime,
          end: item.endTime,
          backgroundColor: '#A6B0F5',
          isExpanded: expandRowKeys.includes(id),
          isAssignUser: true,
          dragable: false,
          data: {},
          detail: {
            status: {},
            priority: {},
          },
          display: {
            assignUser: item.userName,
          },
        })
        // 如果展开，则需要添加子数据
        if (expandRowKeys.includes(id) && item.workItemList?.length) {
          const workItems = this.mappingWorkItemData(item.workItemList, {
            pageNumber,
            childLevel: 1,
          })
          list.push(...workItems)
        }
      })
      return list
    },
  },
  watch: {
    dataList() {
      // 首次有数据时展开首行
      if (this.dataList.length && this.isFirstExpand) {
        this.expandRowKeys = [this.dataList[0][constmap.id]]
        this.isFirstExpand = false
      }
      // 判断是否展开全部
      if (this.expandAll) {
        this.expandRowKeys = this.dataList.map(item => item[constmap.id])
      }
    },
    // 执行分片渲染
    tasksOrigin() {
      this.renderSlice()
    },
  },
  created() {},
  mounted() {
    window.addEventListener('resize', this.resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandler)
  },
  methods: {
    // 图标显示
    iconShow(record) {
      return record.detail.childList && record.detail.childList.length > 0
    },
    toggleExpanded(record) {
      if (this.collapseIds.includes(record.id)) {
        const idx = this.collapseIds.findIndex(id => id === record.id)
        this.collapseIds.splice(idx, 1)
      } else {
        this.collapseIds.push(record.id)
      }
    },
    // Mapping workItemList中的数据及其childList
    mappingWorkItemData(data, extra) {
      const result = []
      const { childLevel = 1 } = extra
      if (data?.length) {
        const collapseIds = this.collapseIds
        data.forEach(item => {
          const itemId = item.data.id || item.detail.id
          result.push({
            ...item,
            ...item.data,
            detail: {
              status: {},
              priority: {},
              ...item.detail,
            },
            extraText: item.data.estimatedTime
              ? item.data.estimatedTime + 'h'
              : null,
            workItemType: item.detail.workItemType,
            workItemName: WORKITEMTYPE[item.detail.workItemType],
            dragable: item.detail.workItemType !== 3, // 缺陷不支持拖拽和创建
            id: itemId,
            projectId: item.data.projectId || item.detail.projectId,
            start: item.data.startTime || item.detail.startTime,
            end: item.data.endTime || item.detail.endTime,
            name: item.display.title,
            ...extra,
          })
          if (!collapseIds.includes(itemId) && item.detail.childList?.length) {
            result.push(
              ...this.mappingWorkItemData(item.detail.childList, {
                ...extra,
                childLevel: childLevel + 1,
              }),
            )
          }
        })
      }
      return result
    },
    // window.resize 或主动调用的 resize 处理函数
    resizeHandler() {
      // this.tableHeight = window.innerHeight - OTHER_HEIGTH + 'px'
      this.renderSlice()
    },
    // 渲染已有数据，用于外部加载更多、更新单条数据场景
    renderHistory() {
      this.isRenderPages = true
    },
    // 更新成功回调
    updateSuccess() {
      this.isRenderPages = true
      this.$emit('updateSuccess')
    },
    // 自定义表头图标点击事件
    customIconClick() {
      this.$emit('customIconClick')
    },
    // 工作项点击事件，包含 table, gantt 点击
    taskClick(info) {
      if (!info.task.isAssignUser) {
        this.$emit('taskClick', info)
        this.currentRowKey = info.task.id
      }
    },
    // 滚动到底部，加载下一页
    scrollBottom() {
      // 如果还有未渲染完的数据
      if (this.currentPage > 1 && this.renderMethod()) {
        return
      }
      // 所有数据已经渲染完毕，需要渲染新的数据了
      this.$emit('scrollBottom')
    },
    // 滚动到今天
    scrollToday() {
      this.$refs.ganttTable.scrollToday()
    },
    // 父级滚动 - 搭配甘特图的 browserScrollPrevent 属性使用
    parentScroll({ y }) {
      const ganttBoxContainer = this.$el.closest('.gantt-box-container')
      ganttBoxContainer.scrollTop = ganttBoxContainer.scrollTop + y
    },
    // 合并列
    _colSpanMethod({ row, columnIndex }) {
      if (row.isAssignUser) {
        return columnIndex === 0 ? [1, this.columns.length] : [0, 0]
      }
    },
    // 展开/折叠行
    _expandRowHandler: throttle(function(info) {
      if (info.row.isExpanded) {
        this.expandRowKeys = this.expandRowKeys.filter(
          item => item !== info.row.id,
        )
      } else {
        this.expandRowKeys.push(info.row.id)
      }
      // 是否渲染所有数据 - 用于更新场景
      this.isRenderPages = true
    }, 300),
    // 展开/折叠所有行
    _expandAllHandler: throttle(function() {
      this.isExpandedAll = !this.isExpandedAll
      if (this.isExpandedAll) {
        this.expandRowKeys = this.dataList.map(item => item[constmap.id])
      } else {
        this.expandRowKeys = []
      }
    }, 300),
    // 图标绘制
    _getworkItemType(row) {
      if (row != undefined) {
        return WORK_ITEM_ICON[row.workItemType]
        // if (row && row.workItemType == 1) {
        //   return 'iconfont icon-requirement'
        // } else if (row && row.workItemType == 2) {
        //   return 'iconfont icon-task'
        // } else if (row && row.workItemType == 3) {
        //   return 'iconfont icon-bug'
        // }
      }
    },
    // 更新工作项 - 日期 - gantt
    updateWorkItemInfo(info) {
      const { start, end } = info
      const { projectId, id, workItemType } = info.task.detail

      let updateMethod = 'GlobalRequirementUpdate'
      switch (workItemType) {
        case 3:
          updateMethod = 'GlobalBugUpdate'
          break
        case 2:
          updateMethod = 'GlobalTaskUpdate'
          break
        case 1:
          updateMethod = 'GlobalRequirementUpdate'
          break
      }
      this[updateMethod]({
        startTime: start,
        endTime: end,
        id,
        projectId,
        cb: () => this.updateSuccess(info.task),
      })
    },
    /**
     * 分片渲染入口，后续通过滚动到底部继续渲染剩余数据
     * 场景1: 全部展开、折叠
     * 场景2: 单个展开、折叠
     * 场景3: 数据初次加载
     * 场景4: 数据更新整体覆盖(更新某一条数据) - 快速更新没问题，打开但窗更新有问题
     * 场景5: 向下滚动加载 http 数据 - 不适用
     */
    renderSlice() {
      // 如果还有未渲染完全的，则停止渲染
      if (this.lastRenderHandler) {
        clearTimeout(this.lastRenderHandler)
      }
      if (this.tasksOrigin.length === 0) {
        this.tasks = this.tasksOrigin
        return
      }
      this.perPage = Math.ceil(((window.innerHeight - 200) * 3) / 32) // 每页渲染条数
      this.totalSlices = Math.ceil(this.tasksOrigin.length / this.perPage) // 总共片数

      /**
       * 滚动记忆 - 设计方案
       * 1. 如果是单个折叠、快速更新更新，则滚动到之前已加载页数
       * 2. 如果是外部更新某条数据、加载更多数据，则需要告知组件，把已有加载的数据给处理了
       */
      if (this.isRenderPages) {
        this.isRenderPages = false
        const currentPage = this.currentPage - 1
        this.currentPage =
          currentPage < this.totalSlices ? currentPage : this.totalSlices
      } else {
        this.currentPage = 1 // 当前已渲染片数
      }

      this.renderMethod()
    },
    // 单体渲染函数
    renderMethod() {
      if (this.currentPage <= this.totalSlices) {
        this.tasks = this.tasksOrigin.slice(0, this.currentPage * this.perPage)
        this.currentPage += 1
        return true
      } else {
        // 所有数据已经渲染完毕
        return false
      }
    },
  },
}
</script>
<style lang="scss" scoped>
// 表头自定义
.table--header-custom {
  position: absolute;
  top: 1px;
  right: 1px;
  z-index: 2;
  line-height: 74px;
  height: 74px;
  width: 24px;
  font-size: 16px;
  color: #292f3a;
  text-align: center;
  background: #fff;
  cursor: pointer;
  i {
    position: relative;
    top: 1px;
  }
}

// 表头 - 批量展开图标
.icon-prefix-mutiple {
  cursor: pointer;
  margin-right: 6px;
}

// 表头 - 单个展开图标
.icon-prefix {
  @extend .icon-prefix-mutiple;
  transform: scale(0.714); // 保证为 10*10
}

.tree-ctrl {
  cursor: pointer;
  color: #2196f3;
}

.m-l-24 {
  margin-left: 24px;
}

$child-level: 0, 1, 2, 3, 4, 5;
@each $l in $child-level {
  .child-level-#{$l} {
    margin-left: $l * 20px;
  }
}

.expand-placeholder {
  display: inline-block;
  width: 20px;
  text-align: right;
}

// 表体 - 标题图标
.custom-prefix {
  .title-link-common {
    position: relative;
    top: 1px;
    margin-right: 3px;

    &.icon-xuqiu,
    &.icon-renwu,
    &.icon-quexian {
      color: $--color-icon-default;
    }
  }

  .el-icon-warning {
    margin-right: 3px;
  }
}

// 已完成增加滤镜
.filter-gray,
.filter-gray i,
.filter-gray .iconfont {
  opacity: 0.4;
  color: #666666 !important; // important 用于覆盖全局 id 样式优先级
}

// 表体 - 标题高亮
.highlight-title {
  background: $--color-primary;
  color: #ffffff;
  border-radius: 4px;
  .filter-gray,
  i,
  .iconfont,
  /deep/ .common-input-edit-text:hover,
  /deep/ .table-input-edit-icon {
    opacity: 1;
    color: #ffffff !important; // important 用于覆盖全局 id 样式优先级
  }
}

// 表体 - 滚动条样式调整
/deep/ .block-box-left .el-table__body-wrapper {
  background-color: #fff;

  &::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 6px;
    /*高宽分别对应横竖滚动条的尺寸*/
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 3px;
    // box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: #ddd;
  }
  // &::-webkit-scrollbar-track {
  //   /*滚动条里面轨道*/
  //   background: #eee;
  // }
}

// 标题宽度设置
.custom-column-withprefix {
  // position: absolute;
  display: inline-block;
  width: calc(100% - 70px);
}

// 深色
.color-weight {
  color: #292f3a;
}
// 浅色
.color-light {
  color: #989a9c;
}

// 覆盖甘特图样式
.ui-gantt-table {
  padding: 16px 24px;
  background-color: #fff;
  height: 100%;
  box-sizing: border-box;

  .gantt-table-container {
    border-radius: 0;
    height: 100%;

    /deep/ {
      .block-box-left {
        border-radius: 0;
      }

      .block-box-right {
        border: 1px solid #eee;
        border-left: none;
        border-radius: 0;
      }

      .gantt-table {
        // border: 1px solid #eee;
        border-right: none;
        border-radius: 0;

        .table-cell-title:not(.highlight-title):hover {
          .common-input-edit-text {
            color: $--color-primary;
          }
          .icon-xuqiu {
            color: $--color-icon-xuqiu !important;
          }
          .icon-renwu {
            color: $--color-icon-renwu !important;
          }
          .icon-quexian {
            color: $--color-icon-quexian !important;
          }
        }
      }

      .gantt-vue,
      .gantt-table,
      .gantt-container {
        width: 100%;
        height: 100%;
        // overflow: hidden;

        .table-body-cell {
          padding: 0;
          height: 40px;
        }
      }
    }
  }
}
</style>
