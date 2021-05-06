<template>
  <div v-loading="tableLoading">
    <base-card v-if="$attrs.show" ref="baseCard" shadow="never">
      <template slot="header">
        <div class="header-left">
          <div class="header-title">
            {{ $t(workItemsTypesDesc[workItemsType]) }}
          </div>
        </div>
        <div class="header-right">
          <div class="operation-icon" :title="$t('退出详情')">
            <i class="el-icon-close" @click="handleExitFullScreen"></i>
          </div>
        </div>
      </template>
      <div slot="content">
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
          :header-cell-style="{ background: '#F0F3F7' }"
          :data="filteredTableData"
          :highlight-current-row="true"
          border
          class="data-table"
          :height="maxTableHeight"
          @sort-change="sortChange"
        >
          <el-table-column key="1" width="75" label="ID">
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
                <i
                  class="iconfont"
                  :class="[iconMaps[scope.row.workItemType]]"
                ></i>
                <ellipsis-block
                  :value="scope.row.display.title"
                  class="title-text"
                  popper-class="coteam-workbench-tooltip"
                  @click="handleShowWorkItem(scope.row)"
                ></ellipsis-block>
                <span
                  v-if="scope.row.display.delayed"
                  class="delay-text danger"
                >
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
                :update-data="updateData"
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
                      updateData,
                      item,
                    )
                "
                @updateSuccess="updateData"
              />
            </template>
          </el-table-column>
        </el-table>
        <GlobalSelect v-bind="GlobalSelectProps" />
      </div>
      <template slot="footer">
        <el-pagination
          v-show="pages > 1"
          class="work-items-pagination__content"
          background
          layout="total, prev, pager, next, sizes, jumper"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageInfo.pageSize"
          :current-page.sync="pageInfo.pageNumber"
          :total="pageInfo.totalRecords"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </template>
    </base-card>
  </div>
</template>

<script>
/**
 * @title  全屏组件
 * @author WangLin
 * @date 2021.01.08
 */
import moment from 'dayjs'
import BaseCard from '@/views/workbench/components/BaseCard'
import StateFlow from '@/components/state-flow'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import debounce from 'lodash/debounce'
import TableHeader from '@/components/ellipsis-block/TableHeader'
import WorkItemTableCustomColumn from '@/components/project/WorkItemTableCustomColumn'
import GlobalSelect from '@/components/field-edit/GlobalSelect.vue'
import GlobalInput from '@/components/field-edit/GlobalInput.vue'
import EllipsisBlock from '@/components/ellipsis-block'
import {
  iconMaps,
  workbenchCardTypes,
  workItemsTypes,
} from '@/views/workbench/constant'
import { WORKITEMCONST } from '@/utils/constant'
import { getTableFields } from './FullScreenTableFields'
import { getFiltersList } from './FullScreenFiltersList'
import WorkbenchWorker from '../../workbench.v1.worker'
import { workItemList as workItemListApi } from '@/api/workbench'
import { getRealUrl } from '@/utils/sub-app-util'
import { parseResponse } from '@/utils/http'

const dataMaps = {
  0: 'allList',
  1: 'requirementList',
  2: 'taskList',
  3: 'bugList',
}

export default {
  name: 'FullScreenWorkItems',
  components: {
    BaseCard,
    StateFlow,

    TableHeader,
    WorkItemTableCustomColumn,
    GlobalSelect,
    GlobalInput,
    EllipsisBlock,
  },
  mixins: [ProjectCommonMixin],
  props: {
    workItemsType: {
      type: String,
      default: 'todo',
    },
  },
  data() {
    const isEnglish = this.$isEnglish()
    return {
      tableLoading: false,
      tableData: [],
      iconMaps,
      workbenchCardTypes,
      workItemsTypesDesc: {
        [workItemsTypes.MY_TODO]: '所有待办',
        [workItemsTypes.MY_CREATED]: '我创建的',
        [workItemsTypes.MY_DONE]: '我完成的',
        [workItemsTypes.MY_RELATED]: '我相关的',
        [workItemsTypes.MY_DONE_OF_TODAY]: '今日已完成',
        [workItemsTypes.MY_TODO_OF_TODAY]: '今日待办',
        [workItemsTypes.MY_DUE_OF_TODAY]: '今日到期',
      },
      workItemTypesCount: {
        all: 0,
        requirement: 0,
        task: 0,
        defect: 0,
      },
      filtersList: getFiltersList(this.workItemsType),
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
      filterForm: {
        searchKey: '',
        projectIds: [],
        sprintIds: [],
        deadlines: ['delay', 'dueToday', 'dueThisWeek', 'other'],
        statusClassifies: [],
        prioritys: [],
        startTimes: [],
        endTimes: [],
        finishTimes: [],
        orderBy: [],
      },
      allList: [],
      requirementList: [],
      taskList: [],
      bugList: [],
      currentTableData: [],
      pageInfo: {
        pageNumber: 1,
        pageSize: 20,
        totalRecords: 0,
      },
      currentWorkItemType: 0,
      curerentAllWorkItemTypesFilter: [1, 2, 3],
      tableFields: getTableFields(this.workItemsType),
      maxTableHeight: '600', // 表格最大高度
      worker: null,
      workItemListApi: getRealUrl(workItemListApi.url, { ssoToken: true }),
      totalList: [],
    }
  },
  computed: {
    filteredTableData() {
      return this.currentTableData.slice(
        (this.pageInfo.pageNumber - 1) * this.pageInfo.pageSize,
        this.pageInfo.pageNumber * this.pageInfo.pageSize,
      )
    },
    pages() {
      return Math.ceil(this.pageInfo.totalRecords / this.pageInfo.pageSize)
    },
  },
  watch: {
    $attrs: {
      handler(val) {
        this.changeCardHeight(val['card-height'])
      },
      immediate: true,
    },
  },
  created() {
    this.worker = new WorkbenchWorker()
    this.worker.onmessage = this.initData
    this.currentWorkItemType = 0
    this.tableFields = getTableFields(this.workItemsType)
    this.getTableData()
  },
  async mounted() {
    this.getWorkItemsTypesDesc()
  },
  beforeDestroy() {
    // 清除worker线程
    this.worker && this.worker.terminate()
  },
  methods: {
    initData(e) {
      const { event, res } = e.data

      if (event !== 'today.workItemData') {
        return
      }

      parseResponse(
        { data: res },
        function() {},
        function() {},
      )

      if (res.status === 200 && res.data) {
        this.totalList = res.data
      }

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
        this.workItemTypesCount.all = this.allList.length
        this.workItemTypesCount.requirement = this.requirementList.length
        this.workItemTypesCount.task = this.taskList.length
        this.workItemTypesCount.defect = this.bugList.length
      }
      this.currentTableData = this[dataMaps[this.currentWorkItemType]]
      this.pageInfo.totalRecords = this.currentTableData.length
      this.ensurePageNumber()
      this.tableLoading = false
    },

    handleShowWorkItem(workItem) {
      if (this.$refs['dataTable'])
        this.$refs['dataTable'].setCurrentRow(workItem)
      this.$emit('work-item-click', workItem)
    },

    ensurePageNumber() {
      if (this.pageInfo.pageNumber === 1) return
      const pages = this.pageInfo.totalRecords / this.pageInfo.pageSize
      if (
        pages > this.pageInfo.pageNumber - 1 &&
        pages <= this.pageInfo.pageNumber
      ) {
        return
      } else {
        // 数据是一条一条减少，可以应付
        this.pageInfo.pageNumber = this.pageInfo.pageNumber - 1
      }
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
      const orderMap = {
        ascending: 'ASC',
        descending: 'DESC',
      }
      this.filterForm.orderBy = [
        {
          column: prop,
          order: orderMap[order],
        },
      ]

      this.getTableData()
    },

    getWorkItemsTypesDesc() {
      // todo 从远程获取
      this.workItemsTypesDesc = {
        ...this.workItemsTypesDesc,
        [workItemsTypes.MY_TODO]: '所有待办',
        [workItemsTypes.MY_CREATED]: '我创建的',
        [workItemsTypes.MY_DONE]: '我完成的',
        [workItemsTypes.MY_RELATED]: '我相关的',
      }
    },

    getParams() {
      const params = {
        workItemTypes: [1, 2, 3],
      }
      this.filtersList.forEach(item => {
        params[item.attrName] = this.filterForm[item.attrName]
      })

      if (this.workItemsType === workItemsTypes.MY_TODO) {
        // 状态是固定的 非取消态，非结束态
        params.statusClassifies = ['inProgress']
        params.assignUser = this.$store.state.gd.userInfo.userId
      } else if (this.workItemsType === workItemsTypes.MY_DONE) {
        // 状态是固定的 结束态
        params.statusClassifies = ['done']
        params.assignUser = this.$store.state.gd.userInfo.userId
      } else if (this.workItemsType === workItemsTypes.MY_CREATED) {
        params.createUser = this.$store.state.gd.userInfo.userId
      } else if (this.workItemsType === workItemsTypes.MY_RELATED) {
        params.relevantUserIds = [this.$store.state.gd.userInfo.userId]
      } else if (this.workItemsType === workItemsTypes.MY_DONE_OF_TODAY) {
        // 状态是固定的 已经完成， 结束时间是今天
        params.statusClassifies = ['done']
        const day = moment(new Date().valueOf()).format('YYYY-MM-DD')
        params.finishTimes = [`${day} 00:00:00`, `${day} 23:59:59`]
        params.assignUser = this.$store.state.gd.userInfo.userId
      } else if (this.workItemsType === workItemsTypes.MY_TODO_OF_TODAY) {
        params.statusClassifies = ['inProgress']
        const day = moment(new Date().valueOf()).format('YYYY-MM-DD')
        params.startTimes = [null, `${day} 23:59:59`]
        params.assignUser = this.$store.state.gd.userInfo.userId
      } else if (this.workItemsType === workItemsTypes.MY_DUE_OF_TODAY) {
        params.statusClassifies = ['inProgress']
        params.deadlines = ['dueToday']
        params.assignUser = this.$store.state.gd.userInfo.userId
      }
      if (!params.deadlines) {
        // 没设置deadLins
        params.deadlines = ['delay', 'dueToday', 'dueThisWeek', 'other']
      }
      params.orderBy = this.filterForm.orderBy
      params.pageInfo = this.filterForm.pageInfo
      return params
    },

    updateData() {
      this.$emit('update-work-item-data')
    },

    getTableData() {
      this.tableLoading = true
      const params = this.getParams()
      this.worker.postMessage({
        type: 'http',
        event: 'today.workItemData',
        props: {
          method: 'POST',
          url: this.workItemListApi,
          payload: params,
        },
      })
    },

    // 动态修改卡片高度
    changeCardHeight(height) {
      if (height) {
        this.$nextTick(() => {
          this.$refs?.baseCard?.$el &&
            (this.$refs.baseCard.$el.style.height = height + 'px')
          this.maxTableHeight = height - 200 + ''
        })
      }
    },

    handleWorkItemTypeChange(value) {
      this.pageInfo.pageNumber = 1
      this.currentTableData = this[dataMaps[value]]
      this.pageInfo.totalRecords = this.currentTableData.length
    },

    // 筛选条件
    handleFilter: debounce(function(val) {
      const filters = {}
      val?.length &&
        val.forEach(item => {
          filters[item.key] = item.value
        })

      this.filterForm = { ...this.filterForm, ...filters }
      this.getTableData()
    }, 300),

    handleSizeChange(value) {
      this.pageInfo.pageSize = value
      this.pageInfo.pageNumber = 1
      // this.getTableData()
    },

    updateGlobalTitle(info, value) {
      let originInfo = { ...info }
      let cb = () => {
        this.updateData()
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
.work-items-type__content {
  .el-radio-button {
    /deep/.el-radio-button__inner {
      color: $--color-text-fine;
    }
  }
}
/deep/.el-table .el-table__body td {
  //border-color: $borderColoreee !important;
  border-width: 0;
}
/deep/ .el-table--border th {
  border-right: 1px solid #f2f6fc;
}
/deep/ .el-table--border {
  border: none;

  .el-table__fixed-right::before,
  &::before,
  &::after {
    display: none;
  }
}
/deep/ .el-table__body td {
  border-right: none;
}
</style>
