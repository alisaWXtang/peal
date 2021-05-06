<template>
  <div v-loading="loading" class="workbench-full-screen">
    <div class="work-items-type__content">
      <el-radio-group
        v-model="currentWorkItemType"
        @change="handleWorkItemTypeChange"
      >
        <el-radio-button :label="0">
          {{ $t('全部') }} ({{ workItemTypesCount.all }})
        </el-radio-button>
        <el-radio-button :label="1">
          {{ $t('需求') }} ({{ workItemTypesCount.requirement }})
        </el-radio-button>
        <el-radio-button :label="2">
          {{ $t('任务') }} ({{ workItemTypesCount.task }})
        </el-radio-button>
        <el-radio-button :label="3">
          {{ $t('缺陷') }} ({{ workItemTypesCount.defect }})
        </el-radio-button>
      </el-radio-group>
    </div>
    <el-table
      ref="dataTable"
      v-loading="tableLoading"
      border
      :header-cell-style="{ background: '#F0F3F7' }"
      :highlight-current-row="true"
      :data="tableData"
      class="data-table"
      :height="maxTableHeight"
      @sort-change="sortChange"
    >
      <el-table-column key="1" min-width="75" label="ID">
        <template slot-scope="scope">
          <span @mousedown.stop>
            <span
              class="table-id"
              @click="handleShowWorkItem(scope.row, $event)"
            >
              {{ scope.row.id }}
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        key="2"
        prop="title"
        :label="$t('标题')"
        sortable="custom"
        min-width="280px"
      >
        <template slot-scope="scope">
          <global-input
            :init-value="scope.row.title"
            class="table-title"
            :on-change="
              value => {
                updateGlobalTitle(scope.row, value)
              }
            "
          >
            <i class="iconfont" :class="[iconMaps[scope.row.workItemType]]"></i>
            <ellipsis-block
              :value="scope.row.display.title"
              class="title-text"
              popper-class="coteam-workbench-tooltip"
              @click="handleShowWorkItem(scope.row)"
            ></ellipsis-block>
            <span v-if="scope.row.display.delayed" class="delay-text danger">
              <i class="el-icon-warning-outline"></i>{{ $t('延期') }}
              {{ $isEnglishDisplaySpace() }}
              {{ scope.row.display.delayedDays
              }}{{
                $isEnglish()
                  ? ` ${computedDisplayDay(scope.row.display.delayedDays)}`
                  : '天'
              }}</span
            >
            <span
              v-if="scope.row.display.toBeDelayedAfterToday"
              class="delay-text warning"
              type="warning"
              >{{ $t('今日到期') }}</span
            >
          </global-input>
        </template>
      </el-table-column>

      <!-- elementui bug，如果自定义 el-table-column 会造成列顺序不一致 -->
      <el-table-column
        v-for="(item, index) in tableFields"
        :key="item.attrName + index"
        :prop="item.attrName"
        :label="item.fieldName"
        :sortable="item.sortable ? 'custom' : false"
        :width="
          columnWidthMap[item.attrName] ||
            columnWidthMap[item.attrValue] ||
            (item.attrValue.indexOf('MEMBER_CHOICE') > -1 ? 180 : '') ||
            ($isEnglish() ? 120 : 100)
        "
        :show-overflow-tooltip="item.attrName !== 'statusId'"
      >
        <template slot="header">
          <table-header :value="item.fieldName" :sortable="item.sortable" />
        </template>
        <template slot-scope="scope">
          <state-flow
            v-if="item.attrName === 'statusId'"
            :project-id="scope.row.projectId"
            :status-id="scope.row.statusId"
            :work-item-type="scope.row.workItemType"
            :work-item-id="scope.row.id"
            :update-data="updateTableData"
            :current-index="scope.$index"
            :bg-color="scope.row.detail.status.color"
            :border-color="scope.row.detail.status.color"
            :style="{ '--color': scope.row.detail.status.color }"
            :display-status="scope.row.display.status"
          ></state-flow>
          <work-item-table-custom-column
            v-else
            :key="item.attrName + scope.row.id"
            :scope="scope"
            :field="item"
            :width="columnWidthMap[item.attrName]"
            @selectClick="
              e =>
                GlobalSelectTargetClick(
                  scope.row,
                  e,
                  item.attrName,
                  updateTableData,
                  item,
                )
            "
            @updateSuccess="updateTableData"
          />
        </template>
      </el-table-column>
    </el-table>
    <GlobalSelect v-bind="GlobalSelectProps" />
    <el-pagination
      v-show="pages > 1"
      class="work-items-pagination__content flex-right"
      background
      layout="total, prev, pager, next, sizes, jumper"
      :page-sizes="[10, 20, 30, 50]"
      :page-size="pageInfo.pageSize"
      :current-page.sync="pageInfo.pageNumber"
      :total="pageInfo.totalRecords"
      @size-change="handleSizeChange"
      @current-change="getTableData"
    >
    </el-pagination>
  </div>
</template>

<script>
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import StateFlow from '@/components/state-flow'
import TableHeader from '@/components/ellipsis-block/TableHeader'
import WorkItemTableCustomColumn from '@/components/project/WorkItemTableCustomColumn'
import GlobalSelect from '@/components/field-edit/GlobalSelect.vue'
import GlobalInput from '@/components/field-edit/GlobalInput.vue'
import { getTableFields } from './FullScreenTableFields'
import { WORKITEMCONST } from '@/utils/constant'
import { iconMaps } from '@/views/workbench/constant'
import EllipsisBlock from '@/components/ellipsis-block'
const dataMaps = {
  0: 'allList',
  1: 'requirementList',
  2: 'taskList',
  3: 'bugList',
}
export default {
  name: 'FullScreenDisplay',
  components: {
    StateFlow,
    TableHeader,
    WorkItemTableCustomColumn,
    GlobalSelect,
    GlobalInput,
    EllipsisBlock,
  },
  mixins: [ProjectCommonMixin],
  props: {
    totalList: {
      type: Array,
      required: true,
      default: () => [],
    },
    workItemsType: {
      type: String,
      default: 'todo',
    },
  },
  data() {
    const isEnglish = this.$isEnglish()
    return {
      iconMaps,
      allList: [],
      requirementList: [],
      taskList: [],
      bugList: [],
      workItemTypesCount: {
        all: 0,
        requirement: 0,
        task: 0,
        defect: 0,
      },
      pageInfo: {
        totalRecords: 0,
        pageSize: 20,
        pageNumber: 1,
      },
      tableLoading: false,
      tableFields: getTableFields(this.workItemsType),
      maxTableHeight: '368', // 表格最大高度
      currentWorkItemType: 0,
      curerentAllWorkItemTypesFilter: [1, 2, 3],
      columnWidthMap: {
        title: 200,
        priority: 100,
        sprintId: 150,
        statusId: isEnglish ? 110 : 90,
        startTime: 130,
        endTime: 130,
        assignUser: 150,
        createUser: 150,
        relevantUsers: 150,
        createTime: 145,
        updateTime: isEnglish ? 120 : 100,
        finishTime: 145,
        projectName: 150,
        BOOLEAN_ATTR: 130,
        LITE_DATE_ATTR: 120,
      },
      activeWorkItem: {
        id: null,
        projectId: null,
      },
      tableData: [],
      currentTableData: [],
      renderKey: Date.now() + Math.random(),
      outContainerHeight: 0, // 外部容器高度
      loading: false,
    }
  },
  computed: {
    pages() {
      return Math.ceil(this.pageInfo.totalRecords / this.pageInfo.pageSize)
    },
  },
  watch: {
    totalList: {
      handler: function() {
        this.loading = true
        this.$nextTick(() => {
          this.initData()
          this.getTableData()
        })
      },
      deep: true,
      immediate: true,
    },
    $attrs: {
      handler() {
        this.maxTableHeight =
          this.$attrs['card-height'].replace('px', '') - 190 + ''
      },
      immediate: true,
    },
  },
  methods: {
    initData() {
      if (this.totalList) {
        const requirementList = []
        const taskList = []
        const bugList = []
        this.allList = []
        for (const item of this.totalList) {
          const temp = item.priority
          const data = {
            data: {
              id: item.id,
            },
            ...item,
            ...item.display,
          }
          data.priority = temp
          this.allList.push(data)
          if (item.workItemType == WORKITEMCONST.workItemTypeMap.requirement) {
            requirementList.push(data)
          } else if (item.workItemType == WORKITEMCONST.workItemTypeMap.task) {
            taskList.push(data)
          } else if (item.workItemType == WORKITEMCONST.workItemTypeMap.bug) {
            bugList.push(data)
          }
        }

        this.requirementList = requirementList
        this.taskList = taskList
        this.bugList = bugList
        this.workItemTypesCount.all = this.totalList.length
        this.workItemTypesCount.requirement = this.requirementList.length
        this.workItemTypesCount.task = this.taskList.length
        this.workItemTypesCount.defect = this.bugList.length
      }
      this.currentTableData = this[dataMaps[Number(this.currentWorkItemType)]]
      this.pageInfo.totalRecords = this.currentTableData.length
    },
    handleExitFullScreen() {
      this.$emit('exit-full-screen', true)
    },

    // 延时1天返回day 超过1天返回days
    computedDisplayDay(day) {
      return +day > 1 ? 'days' : 'day'
    },

    // 排序
    sortChange({ prop, order }) {
      this.$emit('sort-change', {
        prop,
        order,
      })
    },

    // 动态修改卡片高度
    changeCardHeight(height) {
      if (height) {
        this.outContainerHeight = height
        this.tableLoading = true
        this.$nextTick(() => {
          if (this.pages > 1) {
            this.maxTableHeight = height - 190 + ''
          } else {
            this.maxTableHeight = height - 150 + ''
          }
          this.tableLoading = false
        })
      }
    },

    handleWorkItemTypeChange() {
      this.currentTableData = this[dataMaps[Number(this.currentWorkItemType)]]
      this.pageInfo.totalRecords = this.currentTableData.length
      this.pageInfo.pageNumber = 1
      this.getTableData()
    },

    handleSizeChange(value) {
      this.pageInfo.pageSize = value
      this.pageInfo.pageNumber = 1
      this.getTableData()
    },

    getTableData() {
      this.tableLoading = true
      const start = (this.pageInfo.pageNumber - 1) * this.pageInfo.pageSize
      const end = start + this.pageInfo.pageSize
      this.tableData = this.currentTableData.slice(start, end)
      this.$nextTick(() => {
        this.tableLoading = false
        this.loading = false
      })
    },

    handleShowWorkItem(workItem) {
      this.activeWorkItem = workItem
      if (this.$refs['dataTable'])
        this.$refs['dataTable'].setCurrentRow(workItem)
      this.$emit('work-item-click', workItem)
    },

    updateTableData() {
      this.$emit('update-data')
    },

    updateGlobalTitle(info, value) {
      let originInfo = { ...info }
      let cb = () => {
        this.updateTableData()
      }
      let updatefunc = this.GlobalRequirementUpdate
      switch (+originInfo.workItemType) {
        case 1:
          updatefunc = this.GlobalRequirementUpdate
          break
        case 2:
          updatefunc = this.GlobalTaskUpdate
          break
        case 3:
          updatefunc = this.GlobalBugUpdate
          break
      }

      updatefunc({
        id: originInfo.id,
        title: value,
        projectId: originInfo.projectId || this.$getUrlParams().projectId,
        cb,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.workbench-full-screen {
  width: 100%;
  .work-items-type__content {
    .el-radio-button {
      /deep/.el-radio-button__inner {
        color: $--color-text-fine;
      }
    }
  }
}
</style>
