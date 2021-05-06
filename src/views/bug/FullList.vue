<template>
  <div class="left-content">
    <header-operation
      :work-item-type="3"
      :check-items="checkItems"
      :is-all-checked="isAllChecked"
      @checkbox-change="handleOperationCheck"
      @update-data="$parent.getBugList(null, true, true)"
      @seeTaskHandle="itemClick"
    ></header-operation>
    <table-header-custom-field
      class="bug-table-header-set"
      :project-id="projectId"
      :work-item-type="3"
      @updateDisplay="updateCommonInfo"
    ></table-header-custom-field>
    <div class="left-content-body scrollbal-common">
      <el-table
        ref="bugTable"
        v-loading="fullListLoading"
        class="multiple-table"
        :element-loading-text="$t('拼命加载中')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgb(255,255,255)"
        border
        :data="bugList"
        height="100%"
        :class="{ 'table-no-data': bugList.length == 0 }"
        :highlight-current-row="true"
        row-key="id"
        @sort-change="onFilterChange"
        @click.stop
        @selection-change="handleTableSelect"
      >
        <el-table-column
          type="selection"
          width="24"
          :reserve-selection="true"
        ></el-table-column>
        <!--        <el-table-column-->
        <!--          prop="id"-->
        <!--          label="ID"-->
        <!--          show-overflow-tooltip-->
        <!--          width="72"-->
        <!--          class-name="c-blue-hover"-->
        <!--        ></el-table-column>-->
        <el-table-column key="1" width="75" label="ID">
          <template slot-scope="scope">
            <span @mousedown.stop>
              <el-link
                :underline="false"
                class="c-blue-hover"
                @click="() => itemClick(scope.row)"
              >
                {{ scope.row.id }}
              </el-link>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="display.title"
          :label="$t('标题')"
          class-name="buglist-title"
          show-overflow-tooltip
          min-width="280"
        >
          <template slot-scope="scope">
            <global-input
              :init-value="scope.row.display.title"
              :on-change="
                value => {
                  GlobalBugUpdate({
                    title: value,
                    id: scope.row.id,
                    projectId: scope.row.projectId,
                    cb: updateCommonInfo,
                  })
                }
              "
            >
              <el-link
                slot
                type="primary"
                :underline="false"
                class="table-input-edit-text"
                @click="() => itemClick(scope.row)"
              >
                <i class="iconfont icon-quexian" />
                {{ scope.row.display.title }}
              </el-link>
              <el-tooltip
                v-if="
                  scope.row && scope.row.display && scope.row.display.delayed
                "
                class="item item-past-due"
                effect="dark"
                :content="$t('已过期')"
                placement="top-start"
              >
                <i class="el-icon-warning warning"></i>
              </el-tooltip>
            </global-input>
          </template>
        </el-table-column>
        <!-- elementui bug，如果自定义 el-table-column 会造成列顺序不一致 -->
        <el-table-column
          v-for="(item, index) in currentBugListCustomFields"
          :key="item.attrName + index"
          :label="item.fieldName"
          :prop="item.attrName"
          :sortable="item.sortable ? 'custom' : false"
          :width="
            columnWidthMap[item.attrName] ||
              columnWidthMap[item.attrValue] ||
              (item.attrValue.indexOf('MEMBER_CHOICE') > -1 ? 180 : 100)
          "
          show-overflow-tooltip
        >
          <template slot="header">
            <table-header
              :value="item.fieldName"
              :sortable="item.sortable"
            ></table-header>
          </template>
          <template slot-scope="scope">
            <StateFlow
              v-if="item.attrName === 'statusId'"
              :project-id="$getUrlParams().projectId"
              :status-id="scope.row.statusId"
              :work-item-type="3"
              :work-item-id="scope.row.id"
              :parent-info="scope.row"
              :update-data="updataStausInfo"
            >
              <work-item-table-custom-column
                :key="item.attrName + scope.row.id"
                :scope="scope"
                :field="item"
                @selectClick="
                  e =>
                    GlobalSelectTargetClick(
                      scope.row,
                      e,
                      item.attrName,
                      () =>
                        requirementListInitWithPageNumber(scope.row.pageNumber),
                      item,
                    )
                "
                @updateSuccess="
                  info => requirementListInitWithPageNumber(info.pageNumber)
                "
              ></work-item-table-custom-column>
            </StateFlow>
            <work-item-table-custom-column
              v-else
              :key="item.attrName + scope.row.id"
              :scope="scope"
              :field="item"
              @selectClick="e => onCustomColumnSelect(e, scope.row, item)"
              @updateSuccess="() => updateCommonInfo()"
            ></work-item-table-custom-column>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <GlobalSelect v-bind="GlobalSelectProps"></GlobalSelect>
    <change-bug-father-require
      v-if="showRequireDialog && currentSelected.workItemType === 3"
      style="min-width:750px"
      :require-id="currentSelected.requireId"
      :clone-rquire-modal-status="showRequireDialog"
      :project-name="projectName"
      :bug-id="currentSelected.data.id"
      :project-id="currentSelected.projectId"
      :close-modal="colseRequireModal"
      @onChange="updateCommonInfo"
    />
    <change-father-rquire
      v-else-if="showRequireDialog"
      style="min-width:750px"
      :require-id="currentSelected.requireId"
      :clone-rquire-modal-status="showRequireDialog"
      :project-name="projectName"
      :task-id="currentSelected.data.id"
      :project-id="currentSelected.projectId"
      :close-modal="colseRequireModal"
      @updata="updateCommonInfo"
    />
  </div>
</template>

<script>
// import { i18n } from '@/i18n'
/**
 * @title 缺陷列表
 * @author heyunjiang
 * @date 2019-4-12
 */
// import FieldEdit from '../../tool/FieldEdit'
import GlobalSelect from '@/components/field-edit/GlobalSelect.vue'
import GlobalInput from '@/components/field-edit/GlobalInput.vue'
// import CommentForStatus from './CommentForStatus.vue'
import WorkItemTableCustomColumn from '@/components/project/WorkItemTableCustomColumn'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import StateFlow from '@/components/state-flow'
import TableHeader from '@/components/ellipsis-block/TableHeader'
import TableHeaderCustomField from '@/components/project/table-header-custom-field'
// import ACTIONCONSTVARLIABLE from '@/store/action-types'
import HeaderOperation from '@/components/columbus-workitem-batch-operation/HeaderOperation'
import { sanitizeHTML } from '@/utils/index'
import ChangeFatherRquire from '@/views/task/ChangeFatherRquire'
import ChangeBugFatherRequire from './ChangeBugFatherRquire'

export default {
  name: 'FullList',
  components: {
    // FieldEdit,
    GlobalSelect,
    GlobalInput,
    // CommentForStatus,
    WorkItemTableCustomColumn,
    StateFlow,
    ChangeFatherRquire,
    ChangeBugFatherRequire,
    TableHeader,
    TableHeaderCustomField,
    HeaderOperation,
  },

  mixins: [ProjectCommonMixin],
  props: {
    projectId: {
      type: String,
    },

    bugList: {
      type: Array,
      required: true,
    },

    currentBugListCustomFields: {
      type: Array,
      required: true,
    },

    changeActiveBugInfo: {
      type: Function,
      required: true,
    },

    updateCommonInfo: {
      type: Function,
      desc: '该函数用于更新当前列表数据，并且会更新到当前活跃项所对应的页数',
    },

    fullListLoading: {
      type: Boolean,
    },

    commonFilterInfo: Object,
  },

  data() {
    return {
      CommentForStatusInfo: {
        isShow: false,
        statusInfo: {},
        parentInfo: {},
        onOk: this.bugStatusClickCallbackOnOk,
        onCancel: this.bugStatusClickCallbackOnCancel,
      },

      targetdata: this.GlobalSelectProps,
      showStausObj: {
        status: false,
      },
      // 已勾选的工作项
      checkItems: [],
      isAllChecked: false,
      showRequireDialog: false,
      currentSelected: {}, // 当前选中行
    }
  },
  computed: {
    bugSelectedId() {
      return this.$store.state.st.bugSelectedId
    },
    projectName() {
      return this.$store.state.projectName
    },
  },

  watch: {
    // 当数据更新时,保存选中状态
    bugList(newValue) {
      let currentItem = newValue.find(
        item => item.id == this.$store.state.st.bugSelectedId,
      )
      this.$nextTick(function() {
        this.$refs.bugTable.setCurrentRow(currentItem)
        this.checkItems = this.$refs.bugTable.selection
        this.clearInvalidCheckWorkItem()
      })
    },
    'commonFilterInfo.pageInfo.pageNumber'() {
      this.$refs.bugTable.clearSelection()
    },
  },
  mounted() {},

  methods: {
    // 清空不在列表中的勾选项
    clearInvalidCheckWorkItem() {
      const itemIdSet = new Set(this.checkItems.map(item => item.id))
      const localWorkItemsSet = new Set(this.bugList.map(item => item.id))
      const invalidItems = this.checkItems.filter(
        item => !localWorkItemsSet.has(item.id),
      )

      invalidItems.forEach(item => {
        this.$refs.bugTable.toggleRowSelection(item, false)
      })
      this.checkItems = this.bugList.filter(item => itemIdSet.has(item.id))
    },
    // 表格中选择
    handleTableSelect(val) {
      this.checkItems = val
      this.isAllChecked = this.bugList.length === val.length
    },
    // 批量操作勾选工作项
    handleOperationCheck(val) {
      if (!val) {
        this.$refs.bugTable.clearSelection()
      } else {
        this.$refs.bugTable.toggleAllSelection()
      }
    },
    offsetLeft(obj) {
      var tmp = obj.offsetLeft
      var val = obj.offsetParent
      while (val != null) {
        tmp += val.offsetLeft
        val = val.offsetParent
      }
      return tmp
    },
    offsetTop(obj) {
      var tmp = obj.offsetTop
      var val = obj.offsetParent
      while (val != null) {
        tmp += val.offsetTop
        val = val.offsetParent
      }
      return tmp
    },
    //关闭缺陷状态
    closeStatus() {
      this.showStausObj.status = false
    },
    //状态扭转更新缺陷信息
    updataStausInfo() {
      this.updateCommonInfo && this.updateCommonInfo()
    },
    // 顶部过滤-排序方式
    onFilterChange(obj) {
      let param = {},
        arr = []
      if (obj.prop) {
        param = {
          column: obj.prop.split('.').reverse()[0],
          order: obj.order === 'descending' ? 'DESC' : 'ASC',
        }

        arr.push(param)
      }
      this.updateCommonInfo({
        orderBy: arr,
        pageInfo: {
          pageSize: this.commonFilterInfo.pageInfo.pageSize,
          pageNumber: 1,
        },
      })
    },
    // 点击列的内容
    onCustomColumnSelect(e, row, item) {
      // 所属需求/父需求 需要弹框处理
      if (item.attrName === 'requireId') {
        this.currentSelected = row
        this.showRequireDialog = true
      } else {
        this.GlobalSelectTargetClick(
          row,
          e,
          item.attrName,
          this.updateCommonInfo,
          item,
        )
      }
    },
    // 关闭父需求dialog
    colseRequireModal() {
      this.showRequireDialog = false
    },
    // 缺陷 item 点击
    itemClick(info) {
      this.$store.commit('updateBugSelectedId', {
        id: info.id,
      })

      this.changeActiveBugInfo(info)
    },
    // initname - 状态
    initNameStatus(item, info) {
      if (info == 'status') {
        return `<span class="statusbox-list-common" style="background-color: ${
          item.display.detail.status.color
        }" title="${item.display.status}">${sanitizeHTML(
          item.display.status,
        )}</span>`
      } else {
        return `<span class="statusbox-list-common" style="background-color: ${
          item.display.detail.priority.color
        }" title="${item.display.priority}">${sanitizeHTML(
          item.display.priority,
        )}</span>`
      }
    },
    // 更新缺陷 - 状态变化 - 添加二级状态及评论
    bugStatusClickCallback(info, cb, parentInfo) {
      // 如果不需要选择附加字段
      if (!info.fields.present) {
        this.GlobalBugUpdate({
          [info.updateName]: info.key,
          cb: this.updateCommonInfo,
        })

        cb(true)
      } else {
        // 如果需要附加字段
        this.CommentForStatusInfo = {
          isShow: true,
          statusInfo: { ...info },
          parentInfo,
          onOk: value => {
            this.bugStatusClickCallbackOnOk(value, cb)
          },
          onCancel: () => {
            this.bugStatusClickCallbackOnCancel(cb)
          },
        }
      }
    },
    // 更新缺陷 - 状态变化 - 添加二级状态及评论 - modal 点击确定
    bugStatusClicackCallbkOnOk(value, cb) {
      this.CommentForStatusInfo.isShow = false
      this.GlobalBugUpdate({
        ...value,
        cb: this.updateCommonInfo,
      })
      cb(true)
    },
    // 更新缺陷 - 状态变化 - 添加二级状态及评论 - modal 点击取消
    bugStatusClickCallbackOnCancel(cb) {
      this.CommentForStatusInfo.isShow = false
      cb(true)
    },
    // setCurrentRow 高亮当前活动行
    localSetCurrentRow() {
      const bugId = this.$route.query.bugId
      const currentItem = this.bugList.find(item => item.id == bugId)
      if (currentItem) {
        this.$nextTick(() => {
          this.$refs.bugTable.setCurrentRow(currentItem)
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/style/bug/BugCommon';
$leftHeaderHeight: 40px;

// 解决空数据时表头checkbox还能勾选
.table-no-data {
  /deep/ .el-checkbox.is-disabled {
    &.is-checked .el-checkbox__inner {
      background-color: #edf2fc;
      border-color: #dcdfe6;
      &::after {
        border-color: transparent;
      }
    }
  }
}

.multiple-table {
  /deep/ .el-checkbox .el-checkbox__inner {
    width: 14px;
    height: 14px;
  }

  /deep/ .el-loading-mask {
    z-index: 1000 !important;
  }
}

.left-content {
  height: calc(100% - 40px);
  position: relative;
}
.bug-table-header-set {
  position: absolute;
  top: 5px;
  right: 0;
  z-index: 2;
  line-height: 40px;
  height: 40px;
  background: #f1f4f9;
  width: 40px;
  text-align: center;
}
.left-content-header {
  height: $leftHeaderHeight;
  line-height: $leftHeaderHeight;
  padding: 2px 2px 2px 10px;

  .field-edit-asside {
    display: inline-block;
    overflow: hidden;
  }

  .header-icon-class {
    cursor: pointer;

    &:hover {
      background-color: $color-gray-common;
    }
  }
}

.left-content-body {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;

  .buglist-title {
    .table-input-edit-text {
      font-size: 14px;
      padding-left: 5px;
      color: $color-font-title-common;
    }
    .table-input-edit-text:hover {
      color: $--color-primary;
    }
    &:hover {
      .icon-quexian {
        color: $--color-icon-quexian;
      }
    }
  }

  .bug-active {
    background-color: $color-active-background-common;

    p {
      // text-decoration: underline;
    }
  }

  .bug-card-simple {
    padding: 8px 20px 6px;
    box-sizing: border-box;
    border-bottom: 1px solid $color-border-common;
    position: relative;
    cursor: pointer;

    &:hover {
      @extend .bug-active;
    }

    p {
      @extend .list-item-ellipsis;
      height: 21px;
      line-height: 21px;
      margin: 0;
      color: $color-font-active-jira;
    }

    .bug-card-simple-status {
      position: absolute;
      right: 20px;
      top: 8px;
      padding: 2px 5px;
      height: 16px;
      line-height: 16px;
      font-size: $font-size-small;
      background-color: #fff;
      border: 1px solid #e4e8ed;
      display: inline-block;
      max-width: 12em;

      .mini-circle {
        margin: 0 2px 0 0;
        // width: 8px;
        // height: 8px;
        // border-radius: 4px;
        // top: -1px;
      }
    }
  }
}
</style>
