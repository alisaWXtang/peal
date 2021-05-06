<template>
  <div id="taskview" class="task-view taskView1">
    <header-filter
      :project-id="projectId"
      :order-btn-show="changeStatus !== '2'"
      :change-status="changeStatus"
      @newTaskBtnClick="newTaskBtnClick"
      @exportExcel="exportExcel"
      @orderChange="orderChange"
      @taskModel="taskModel"
      @uploadSuccess="refreshList"
      @filterClick="filterClick"
      @sprintTypeFun="sprintTypeFun"
      @viewChang="type => viewChang(type)"
    ></header-filter>

    <el-tabs
      v-model="changeStatus"
      class="footer-tab taskView-tabs-loading"
      @tab-click="changePageHandle"
    >
      <el-tab-pane
        v-loading="tabsLoading"
        :label="$t('状态视图')"
        name="1"
        :element-loading-text="$t('拼命加载中')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgb(255,255,255)"
      >
        <div v-show="changeStatus === '1'" class="flexpaly scrollbal-common">
          <template v-for="item in statusViewDate.lane">
            <div :key="item.name" class="flexpaly-item">
              <div class="flexpaly-item-header">
                <ellipsis-block :value="item.name"></ellipsis-block>
                <!-- <span class="pending-disposal">{{item.name}}</span> -->
                <span v-show="changeStatus === '1'" class="pending-disposal1"
                  >({{
                    statusViewDate.task[item.name]
                      ? statusViewDate.task[item.name].length
                      : 0
                  }})</span
                >
                <!-- <span class="el-icon-plus task-icon"></span> -->
              </div>
              <draggable
                v-model="statusViewDate.task[item.name]"
                class="box1 scrollbal-common"
                :options="{ group: 'people' }"
                :move="checkMove"
                :data-class="item.statusId"
                @start="drag = false"
                @end="endHandle"
              >
                <div
                  v-for="element in statusViewDate.task[item.name]"
                  :id="'taskbox' + element.id"
                  ref="boxBorder"
                  :key="element.id"
                  class="color-text card-box"
                  :class="{
                    'panel-item-finish': element.display.detail.status.end,
                    'panel-item-cureent': element.id == selectedWorkItemId,
                  }"
                  :style="{
                    backgroundColor: element.display.delayed ? '#FDF1F2' : '',
                  }"
                  :data-priority="element.display.assignUser"
                  :data-id="element.id"
                  :data-statusId="element.statusId"
                  @click.stop="sendTaskHandle(element, $event, item.statusId)"
                >
                  <p class="card-title">
                    <i :data-id="element.id" class="cp icon-title">{{
                      element.display.title
                    }}</i>
                  </p>
                  <p
                    v-show="element.display && element.display.parentTitle"
                    class="card-title-parent ellipsis"
                  >
                    {{ $t('父需求') }}：{{
                      element.display && element.display.parentTitle
                    }}
                  </p>
                  <div
                    class="card-info"
                    style="position: relative; bottom: 2px"
                  >
                    <span
                      class="cursor-pointer fl task-priority"
                      v-html="
                        initNameStatus(
                          element.display.detail.priority.color,
                          element.display.detail.priority.literal,
                        )
                      "
                    ></span>
                    <span class="person">{{ element.display.assignUser }}</span>
                    <div ref="time" class="time">{{ element.endTime }}</div>
                  </div>
                  <div class="card-start-time">
                    {{ $t('开始时间') }}：{{ element.startTime || '--' }}
                  </div>
                </div>
              </draggable>
            </div>
          </template>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('人员视图')" name="3">
        <div
          v-show="changeStatus === '3'"
          v-loading="tabsLoading"
          :element-loading-text="$t('拼命加载中')"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgb(255,255,255)"
          class="person-view"
        >
          <div
            ref="personViewContent"
            class="person-view-content scrollbal-common"
          >
            <div class="person-view-header">
              <div class="person-view-header-item">
                <ellipsis-block value="成员"></ellipsis-block>
              </div>
              <div
                v-for="item in personData.lane"
                :key="item.id"
                class="person-view-header-item"
              >
                <ellipsis-block :value="item.name"></ellipsis-block>
              </div>
            </div>
            <div
              v-for="(row, keyVal) in personData.task"
              :key="keyVal"
              class="person-content-view-list"
            >
              <div class="box">{{ keyVal }}</div>
              <draggable
                v-for="item in personData.lane"
                :key="item.id"
                v-model="row[item.name]"
                class="box5"
                :data-class="item.statusId"
                :options="{ group: keyVal }"
                :move="checkMove"
                @start="drag = false"
                @end="endHandle"
              >
                <div
                  v-for="element in row[item.name]"
                  :key="element.id"
                  class="color-text1 card-box"
                  :class="{
                    'panel-item-finish': element.display.detail.status.end,
                    'panel-item-cureent': element.id == selectedWorkItemId,
                  }"
                  style="left: -4px"
                  :style="{
                    backgroundColor: element.display.delayed ? '#FDF1F2' : '',
                  }"
                  :data-id="element.id"
                  :data-statusId="element.statusId"
                  @click.stop="sendTaskHandle(element, $event, item.statusId)"
                >
                  <p class="card-title">
                    <i :data-id="element.id" class="cp icon-title">{{
                      element.display.title
                    }}</i>
                  </p>
                  <p
                    v-show="element.display && element.display.parentTitle"
                    class="card-title-parent ellipsis"
                  >
                    {{ $t('父需求') }}：{{
                      element.display && element.display.parentTitle
                    }}
                  </p>
                  <div
                    class="card-info"
                    style="position: relative; bottom: 2px"
                  >
                    <span
                      class="cursor-pointer fl task-priority"
                      v-html="
                        initNameStatus(
                          element.display.detail.priority.color,
                          element.display.detail.priority.literal,
                        )
                      "
                    ></span>
                    <span class="person">{{ element.display.assignUser }}</span>
                    <div ref="time3" class="time">{{ element.endTime }}</div>
                  </div>
                </div>
              </draggable>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('列表视图')" name="2">
        <div
          v-if="changeStatus === '2'"
          v-loading="tabsLoading"
          :element-loading-text="$t('拼命加载中')"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgb(255,255,255)"
          class="listView"
        >
          <header-operation
            :work-item-type="2"
            :check-items="checkItems"
            :is-all-checked="isAllChecked"
            @checkbox-change="handleOperationCheck"
            @update-data="refreshList(true)"
            @seeTaskHandle="sendTaskHandle"
          ></header-operation>
          <table-header-custom-field
            class="table-task-custom-set"
            :project-id="projectId"
            :work-item-type="2"
            @updateDisplay="getTaskList"
          ></table-header-custom-field>
          <!-- 里面的任务id和任务标题 .stop去掉在表格上统一加上，加上stop会影响table选中样式 -->
          <el-table
            ref="taskMultipleTable"
            border
            :highlight-current-row="true"
            :data="taskList"
            style="width: 100%"
            class="multiple-table"
            row-key="id"
            :class="{ 'table-no-data': taskList.length == 0 }"
            @click.stop
            @selection-change="handleTableSelect"
            @sort-change="sortaChangeCallBack"
          >
            <el-table-column
              type="selection"
              width="24"
              :reserve-selection="true"
            ></el-table-column>
            <el-table-column
              prop="id"
              show-overflow-tooltip
              :label="$t('ID')"
              width="72px"
            >
              <template slot-scope="scope">
                <span
                  slot
                  class="title-link-common cp c-blue-hover"
                  @click.stop="sendTaskHandle(scope.row)"
                  >{{ scope.row.id }}</span
                >
              </template>
            </el-table-column>
            <el-table-column
              prop="title"
              show-overflow-tooltip
              sortable="custom"
              :label="$t('标题')"
              min-width="400px"
            >
              <template slot-scope="scope">
                <global-input
                  :init-value="scope.row.display.title"
                  :on-change="
                    value => {
                      GlobalTaskUpdate({
                        title: value,
                        id: scope.row.id,
                        projectId: scope.row.projectId,
                        cb: getTaskList,
                      })
                    }
                  "
                >
                  <span slot class="table-input-edit-text c-blue-hover">
                    <span
                      class="title-link-common cp c-blue-hover"
                      @click.stop="sendTaskHandle(scope.row)"
                    >
                      <span class="iconfont icon-renwu"></span>
                      <span>{{ scope.row.display.title }}</span>
                    </span>
                  </span>
                  <el-tooltip
                    v-if="
                      scope.row &&
                        scope.row.display &&
                        scope.row.display.delayed
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
              v-for="(item, index) in currentTaskListCustomFields"
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
                  :project-id="formInline.projectId"
                  :status-id="scope.row.statusId"
                  :work-item-type="2"
                  :work-item-id="scope.row.id"
                  :update-data="updateTaskSuccess"
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
                          getTaskList,
                          item,
                        )
                    "
                    @updateSuccess="() => getTaskList()"
                  ></work-item-table-custom-column>
                </StateFlow>
                <work-item-table-custom-column
                  v-else
                  :key="item.attrName + scope.row.id"
                  :scope="scope"
                  :field="item"
                  @selectClick="
                    e =>
                      GlobalSelectTargetClick(
                        scope.row,
                        e,
                        item.attrName,
                        getTaskList,
                        item,
                      )
                  "
                  @updateSuccess="() => getTaskList()"
                ></work-item-table-custom-column>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('操作')"
              show-overflow-tooltip
              width="100"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  @click.stop="sendTaskHandle(scope.row)"
                  >{{ $t('编辑') }}</el-button
                >
                <el-button type="text" @click="deleteTaskHandle(scope.row)">{{
                  $t('删除')
                }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="table_b_f_b left-content-footer">
            <el-pagination
              background
              class="fr"
              size="middle"
              :current-page="taskListPageInfo.pageNumber"
              :page-size="taskListPageInfo.pageSize"
              layout="total, prev, pager, next"
              :total="taskListPageInfo.totalRecords"
              :page-count="taskListPageInfo.totalPages"
              @current-change="handleTaskListPageChange"
            ></el-pagination>
            <div class="pagination-custom">
              <span>{{ $t('每页') }}</span>
              <el-input
                v-model.number="taskpageSizeChange"
                class="pagination-custom-input"
                @change="leftContentPagasizeChange"
              ></el-input>
              <span>{{ $t('条') }}</span>
              <!--              <span-->
              <!--                >{{ $t('共') }} {{ taskListPageInfo.totalRecords }}-->
              <!--                {{ $t('条') }}-->
              <!--              </span>-->
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <slide
      ref="side"
      :show="show"
      :after-close="HandleSide"
      :before-close="({ cb }) => beforeSliderClose({ id: taskId, cb })"
    >
      <div slot="task" class="taslinfo silder-box">
        <TaskDetail
          ref="task"
          :work-item-id="taskId"
          :show="show"
          @HandleSide="HandleSide"
          @updateInfoSuccess="refreshList"
          @deleteSuccess="refreshList"
        ></TaskDetail>
      </div>
    </slide>
    <slide
      :show="taskAddSlideStatus.taskAddSlideProps.show"
      :after-close="taskAddSlideStatus.taskAddSlideProps.afterClose"
      :before-close="({ cb }) => beforeSliderClose({ id: -2, cb })"
    >
      <div slot="task" class="taslinfo silder-box">
        <task-create
          v-if="taskAddSlideStatus.taskAddSlideProps.show"
          ref="task"
          :show="taskAddSlideStatus.taskAddSlideProps.show"
          @HandleSide="newTaskHandleClose"
          @HandleAddSuccess="newTaskHandleClose(true)"
        ></task-create>
      </div>
    </slide>
    <GlobalSelect v-bind="GlobalSelectProps"></GlobalSelect>
    <back-top
      :show="changeStatus === '3'"
      :customed-dom="$refs.personViewContent"
    ></back-top>
    <change-father-rquire
      v-if="showRequireDialog"
      style="min-width:750px"
      :require-id="GlobalCurrentInfo.requireId"
      :clone-rquire-modal-status="showRequireDialog"
      :project-name="projectName"
      :task-id="GlobalCurrentInfo.data.id"
      :project-id="GlobalCurrentInfo.projectId"
      :close-modal="() => (showRequireDialog = false)"
      @updata="getTaskList"
    />
  </div>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * 任务视图，也就是任务列表
 */
import draggable from 'vuedraggable'
// import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import slide from '@/components/slide-slip'
import { TaskCreate } from '@/components/columbus-workitem-create'
import { TaskDetail } from '@/components/columbus-workitem-display'
import GlobalSelect from '@/components/field-edit/GlobalSelect'
import GlobalInput from '@/components/field-edit/GlobalInput'
import TinymceSaveMixin from '@/mixin/tinymce-save-mixin'
// import SprintMultipleSelect from '@/components/sprint-tree-multiple-select'
import TableHeader from '@/components/ellipsis-block/TableHeader'
import StateFlow from '@/components/state-flow'
import { downloadFilePost } from '@/utils/index'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import WorkItemTableCustomColumn from '@/components/project/WorkItemTableCustomColumn'
import TableHeaderCustomField from '@/components/project/table-header-custom-field'

import HeaderFilter from './HeaderFilter'
import { TaskWorkItem } from '@/utils/project.config'
import {
  getRequirementList,
  getTaskView,
  taskEdit,
  deleteTask,
  taskUpdate,
  getTaskListCustom,
  getPersonView,
} from '@/service/task'
import { getListSprintName } from '@/service/sprint'
import { getUserList } from '@/service/project'
import { taskModelApi, taskExportApi } from '@/api/task'
import { WORKITEMCONST } from '@/utils/constant'
import { windowOpenUrl } from '@/utils/sub-app-util'
import HeaderOperation from '@/components/columbus-workitem-batch-operation/HeaderOperation'
import ChangeFatherRquire from './ChangeFatherRquire'

export default {
  name: 'TaskView',
  components: {
    draggable,
    slide,
    GlobalSelect,
    GlobalInput,
    HeaderFilter,
    StateFlow,
    WorkItemTableCustomColumn,
    TableHeader,
    TableHeaderCustomField,
    TaskCreate,
    TaskDetail,
    HeaderOperation,
    ChangeFatherRquire,
  },

  mixins: [ProjectCommonMixin, TinymceSaveMixin],
  provide() {
    return {
      onSubmit: (formInline, forceRequest = false) => {
        this.filterClick(formInline, forceRequest)
      },
    }
  },
  data() {
    return {
      funnlistBoxHeight: '500px',
      taskpageSizeChange: 15,
      currentCreateType: 'task',
      formInlineCopy: null,
      statusId: '', //状态id
      //区分迭代归档未归档过滤信息
      isArchived: -1,
      projectId: this.$getUrlParams().projectId,
      onlyDelay: false, //延期的任务
      isScoll: '', //滚动条是否显示
      loading: false,
      isnoshow: false,
      taskStatus: 1,
      allSprint: -1,
      allassignUser: null,
      Unplanned: 0,
      StatusNumerone: '',
      StatusNumertwo: '',
      StatusNumerthree: '',
      StatusNumerfour: '',
      sprintData: [],
      personchange: false,
      personName: [],
      personData: {
        task: [],
      },

      show: false,
      count: 0,
      restore: 1,
      preID: null,
      isShow: false,
      taskId: null,
      //页面切换的值
      changeStatus: '1',
      value: '',
      value1: '', //时间绑定
      statusDate: '', //下拉绑定
      labelPosition: 'right',
      taskList: [],
      taskListCustomFields: [], // 表示当前 tableList 需要展示哪些字段 add by heyunjiang on 2020.1.10
      screenHeight: '',
      //切换选项切换绑定的值
      radio3: '',
      radio2: '',
      // screenHeight:"",
      screenWidth: document.body.clientWidth,
      // 标题框绑定的值
      formInline: {
        projectId: null,
        sprintIds: [],
        assignUsers: [],
        orderBy: null,
        requireIds: [],
      },

      isOnlyMineTask: false, // 是否仅我的任务
      tabsLoading: true, // 加载中
      statusViewDate: [],
      assignUserData: [],
      // 分页及排序信息 - add by heyunjiang on 2019.5.8
      pageInation: {
        orderBy: null,
        pageInfo: {
          pageNumber: 1,
          pageSize: 10,
        },
      },

      taskListPageInfo: {
        pageNumber: 1,
        totalPages: 0,
        pageSize: 15,
      },

      // 创建任务 slider 状态信息
      taskAddSlideStatus: {
        taskAddSlideProps: {
          show: false,
          beforeClose: () => {},
          afterClose: this.newTaskHandleClose,
        },

        loading: false,
      },

      requirementData: [],
      search: '',
      selectedWorkItemId: '', //打开侧窗当前选中样式
      // 已勾选的工作项
      checkItems: [],
      isAllChecked: false,
      showRequireDialog: false,
    }
  },
  computed: {
    // 权限 - 是否可以编辑
    editAble() {
      return this.$authFunction('FUNC_COOP_TASK_DELETE', 3, this.projectId)
    },
    // 权限 - 是否可以删除
    deleteAble() {
      return this.$authFunction('FUNC_COOP_TASK_DELETE', 3, this.projectId)
    },
    // 自定义 table 展示字段
    currentTaskListCustomFields() {
      return this.taskListCustomFields.filter(
        item => !['id', 'title'].includes(item.attrName),
      )
    },
    // 表格高度
    tableBodyHeight() {
      return window.innerHeight - 437
    },
    projectName() {
      return this.$store.state.projectName
    },
  },
  watch: {
    // 暂时不确定做不做这个功能，一进来滚动到选中的任务id位置
    // statusViewDate(newValue) {
    //   if(newValue){
    //      this.scrollToElement();
    //   }
    // },
    search() {
      this.getRequiremenList()
    },
    show: function(newName) {
      if (newName) {
        this.$router.replace({
          path: this.$route.path,
          query: { ...this.$route.query, taskId: this.taskId },
        })
      }
    },
    screenWidth(val) {
      // 为了避免频繁触发resize函数导致页面卡顿，使用定时器
      if (!this.timer) {
        // 一旦监听到的screenWidth值改变，就将其重新赋给data里的screenWidth
        this.screenWidth = val
        this.timer = true
      }
    },
    '$route.query': function({ taskId }) {
      if (taskId) {
        this.taskId = taskId
        this.selectedWorkItemId = taskId
      }
    },
    'taskListPageInfo.pageNumber'() {
      this.$refs.taskMultipleTable.clearSelection()
    },
    // 解决当分页大于1页，当前页只有一条数据时，改变数据后，造成table 没有数据情况
    // 'taskListPageInfo.totalRecords'() {
    //   if (this.taskListPageInfo.pageNumber > 1 && this.taskList.length === 0) {
    //     this.taskListPageInfo.pageNumber = this.taskListPageInfo.pageNumber - 1
    //     this.$nextTick(() => {
    //       this.getTaskList()
    //     })
    //   }
    // },
  },

  mounted() {
    // document.body.ondrop = function(event) {
    //   event.preventDefault();
    //   event.stopPropagation();
    // };
    this.getRequiremenList()
    this.getAssignUser()
    this.getSprintName()
    // this.getTaskView();
    this.isTaskId = {
      id: this.$getUrlParams().taskId,
    }

    if (this.isTaskId.id) {
      this.sendTaskHandle(this.isTaskId)
    }
    const that = this

    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth
        that.screenWidth = window.screenWidth
      })()
    }
    this.screenHeight = window.screen.availHeight
  },
  beforeRouteLeave(to, from, next) {
    // 如果存在内容在编辑，则不能离开
    // if (this.sliderBeforeCloseData.title || this.sliderBeforeCloseData.desc) {
    //   return false;
    // }
    next()
  },

  methods: {
    // 切换tabs
    viewChang(type) {
      if (type === 'status') {
        this.changeStatus = '1'
      } else if (type === 'members') {
        this.changeStatus = '3'
      } else {
        this.changeStatus = '2'
      }
      this.changePageHandle()
    },
    // 表格中选择
    handleTableSelect(val) {
      this.checkItems = val
      this.isAllChecked = this.taskList.length === val.length
    },
    // 批量操作勾选工作项
    handleOperationCheck(val) {
      if (!val) {
        this.$refs.taskMultipleTable.clearSelection()
      } else {
        this.$refs.taskMultipleTable.toggleAllSelection()
      }
    },
    // 任务列表分页-分页信息变化数据获取-每页条数
    leftContentPagasizeChange() {
      if (
        Number(this.taskpageSizeChange) < 1 ||
        !/^\d+$/.test(Number(this.taskpageSizeChange))
      ) {
        this.$message({
          type: 'warning',
          message: i18n.t('每页条数必须大于0，并且是整数'),
        })
        this.taskpageSizeChange = 15
      } else {
        this.list.pageInfo.pageSize = this.taskpageSizeChange
      }
      this.getTaskList()
    },
    // 让当前展示条目滚动到可视区域内，通过url进来时
    scrollToElement() {
      if (!this.$getUrlParams().taskId) {
        return
      }

      let currentItem = ''
      for (let status in this.statusViewDate.task) {
        let current =
          this.statusViewDate.task[status] &&
          this.statusViewDate.task[status].filter(
            item => item.id == this.$getUrlParams().taskId,
          )[0]
        currentItem = current || currentItem
      }
      if (!currentItem) {
        return
      }
      setTimeout(() => {
        let currentElement = document.getElementById('taskbox' + currentItem.id)

        if (currentElement && currentElement.scrollIntoView) {
          // currentElement.scrollIntoViewIfNeeded() // webkit 浏览器自带的方法,前面备注的是scrollIntoView火狐下有问题，暂时没发现问题，发现问题在说,scrollIntoViewIfNeeded在火狐下不兼容
          currentElement.scrollIntoView()
        }
      })
    },
    updateTaskSuccess() {
      this.getTaskList()
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
    // 点击过滤器
    filterClick(filterInfo) {
      this.taskListPageInfo.pageNumber = 1
      this.formInline = { ...this.formInline, ...filterInfo }
      this.selectHandle()
    },
    //获取迭代过滤器类型
    sprintTypeFun(val) {
      this.isArchived = val
    },
    //获取赛选的需求列表
    getRequiremenList() {
      getRequirementList({
        projectId: this.$getUrlParams().projectId,
        query: this.search,
        filterType: 2,
      }).then(res => {
        if (res.status === 200) {
          this.requirementData = res.data
        }
      })
    },
    // 排序
    orderChange(value) {
      this.formInline.orderBy = value
      this.$nextTick(this.selectHandle)
    },
    //延期的任务
    deferreDtask() {
      this.onlyDelay = !this.onlyDelay
      this.$nextTick(this.selectHandle)
    },
    // 下载模板
    taskModel() {
      let projectId = this.$getUrlParams().projectId
      let url = taskModelApi.url + '?projectId=' + projectId
      windowOpenUrl(url, '_blank', { ssoToken: true })
    },
    // 导出 excel
    exportExcel(val) {
      let projectId = this.$getUrlParams().projectId
      let list = {
        projectId,
        ...this.formInline,
        orderBy: this.pageInation.orderBy,
        pageInfo: {
          pageNumber: this.taskListPageInfo.pageNumber,
          pageSize: this.taskListPageInfo.pageSize,
        },
        ...val,
        isArchived: this.isArchived,
      }
      let url = `${taskExportApi.url}?projectId=${
        this.$getUrlParams().projectId
      }`
      downloadFilePost(url, list, '导出任务.xlsx')
    },
    refreshList(silent = false) {
      if (this.changeStatus == 1) {
        this.getTaskView()
      } else if (this.changeStatus == 2) {
        this.getTaskList({}, silent)
      } else if (this.changeStatus == 3) {
        this.getPersonView()
      }
    },
    // 新建任务 - 点击新建任务按钮
    newTaskBtnClick() {
      this.taskAddSlideStatus.taskAddSlideProps.show = true
    },
    // 新建任务 - 关闭
    newTaskHandleClose(bool = false) {
      this.taskAddSlideStatus.taskAddSlideProps.show = false
      bool && this.selectHandle()
    },
    dealSprintIds(params) {
      const { sprintIds } = params
      // 特殊处理默认选中已归档和未归档状态
      if (Array.isArray(sprintIds) && sprintIds.length === 2) {
        const tempStr = sprintIds.join(',')
        if (
          params.isArchived === 0 &&
          (/0,unarchived/.test(tempStr) || /unarchived,0/.test(tempStr))
        ) {
          params.sprintIds = []
        }
      }
      params.sprintIds = params.sprintIds.filter(
        item => item !== 'all' && item !== 'unarchived' && item !== 'archived',
      )
    },
    // 获取状态视图
    getTaskView(filterInfo = {}) {
      this.formInline.projectId = this.$getUrlParams().projectId
      let status = {
        ...this.formInline,
        projectId: this.formInline.projectId || null,
        assignUsers: this.formInline.assignUsers || null,
        sprintIds: this.formInline.sprintIds || null,
        onlyDelay: this.onlyDelay,
        orderBy: this.formInline.orderBy,
        requireIds: this.formInline.requireIds,
        isArchived: this.isArchived,
      }

      for (let i in this.formInline) {
        if (
          Array.isArray(this.formInline[i]) &&
          this.formInline[i].length > 0
        ) {
          if (this.formInline[i].includes('all')) {
            status[i] = []
          }
        }
      }
      this.loading = true
      if (filterInfo.sprintIds) {
        filterInfo.sprintIds = filterInfo.sprintIds.filter(
          item => [-1, -2, -3, -4, -5].indexOf(item) == -1,
        )
      }
      // 特殊处理
      this.dealSprintIds(status)
      // this.tabsLoading = true
      getTaskView({ ...status, ...filterInfo }).then(res => {
        if (res.status === 200 && res.data) {
          this.tabsLoading = false
          this.loading = false
          this.setStorageFilterTitle(TaskWorkItem, this.formInline.title)
          this.formInlineCopy = cloneDeep(this.formInline)
          this.statusViewDate = res.data
          // this.taskViewHeight()
        }
      })
    },
    //获取人员视图
    // 排序过滤
    sortaChangeCallBack(obj) {
      if (obj.prop) {
        this.pageInation.orderBy = [
          {
            column: obj.prop,
            order: obj.order === 'descending' ? 'DESC' : 'ASC',
          },
        ]
      } else {
        this.pageInation.orderBy = []
      }
      this.$nextTick(this.getTaskList)
    },
    //展开过滤条件
    onshowFrom() {
      this.isnoshow = false
    },
    //收缩过滤条件
    onhideFrom() {
      this.isnoshow = true
    },
    //仅我的查询
    userserch() {
      let user = this.$store.state.gd.userInfo
      this.formInline.assignUsers = [user.userId]
      this.isOnlyMineTask = true
      this.$nextTick(this.selectHandle)
    },
    taskViewHeight() {
      let dom = document.getElementsByClassName('box1')
      setTimeout(() => {
        for (let i = 0; i < dom.length; i++) {
          dom[i].style.minHeight = this.screenHeight - 369 + 'px'
          dom[i].style.maxHeight = this.screenHeight - 369 + 'px'
        }
      })
    },
    HandleSide() {
      if (this.show) {
        this.show = false
        this.count = 0
        this.restore = Math.random() * 10
        // this.taskId = -1;
        // this.$refs.side.style.right = -51 + '%';
      }
    },
    remoteMethod(query) {
      this.getAssignUser(query)
    },
    // 查询任务数据 状态视图、人员视图、列表视图
    selectHandle(filterInfo) {
      // if (value && isCustom) {
      //   if (isCustom === 'assignUsers') { this.isOnlyMineTask = false; }
      //   let filterData = this.formInline;
      //   // 如果最后一个选中了全部
      //   if (value[value.length - 1] === "all") {
      //     filterData[isCustom] = ["all"];
      //     //this.formInline[isCustom] = [];
      //   }
      //   // 如果不是最后一个选中了全部
      //   if (
      //     filterData[isCustom].includes("all") &&
      //     filterData[isCustom].length > 1
      //   ) {
      //     filterData[isCustom] = filterData[isCustom].filter(
      //       item => item !== "all"
      //     );
      //   }
      // }
      if (this.changeStatus == 2) {
        this.getTaskList(filterInfo)
      } else if (this.changeStatus == 1) {
        this.getTaskView(filterInfo)
      } else if (this.changeStatus == 3) {
        this.getPersonView(filterInfo)
      }
    },
    sendDate() {},
    sendSelectHandle() {
      if (this.changeStatus == 2) {
        this.getTaskList()
      } else if (this.changeStatus == 1) {
        this.getTaskView()
      } else if (this.changeStatus == 3) {
        this.getPersonView()
      }
    },
    inputHandle() {
      //this.getSprintName()
    },
    getSprintName() {
      let projectId = this.$getUrlParams().projectId
      getListSprintName({ projectId, status: 1 }).then(res => {
        if (res.status === 200) {
          this.sprintData = res.data
        }
      })
    },
    getAssignUser(query) {
      let projectId = this.$getUrlParams().projectId
      // let query = this.formInline.assignUser
      let assData = {
        projectId: projectId,
        query: query || null,
        workItemType: WORKITEMCONST.workItemTypeMap.task,
      }

      getUserList(assData).then(res => {
        if (res.data && res.status === 200) {
          this.assignUserData = res.data.map(item => {
            return {
              ...item,
              key: item.userId,
              value: item.userName + '(' + item.userId + ')',
            }
          })
        }
      })
    },

    async sendTaskHandle(data) {
      if (this.$refs.taskMultipleTable)
        this.$refs['taskMultipleTable'].setCurrentRow(data)
      //  保持选中状态
      this.selectedWorkItemId = data.id
      this.statusId = data.statusId
      if (data.id) {
        let res = await taskEdit(data.id)

        if (res && res.status === 500) {
          return
        }
      }
      if (this.count === 0) {
        this.preID = data.id
        this.show = true
        this.taskId = Number(data.id)
        this.restore = Math.random() * 10
        // e.currentTarget.style.backgroundColor = '#93c36b';
        // this.count++
      } else {
        if (this.preID !== data.id) {
          this.preID = Number(data.id)
          // e.currentTarget.style.backgroundColor = '#93c36b';
          // this.show = !this.show;
          this.taskId = Number(data.id)
          this.restore = Math.random() * 10
          if (this.changeStatus == 1) {
            this.getTaskView()
          } else if (this.changeStatus == 2) {
            this.getTaskList()
          } else if (this.changeStatus == 3) {
            this.getPersonView()
          }
        } else {
          // e.currentTarget.style.backgroundColor = '#93c36b';
          this.restore = Math.random() * 10
          this.preID = Number(data.id)
          this.count = 0
          this.show = !this.show
          this.taskId = Number(data.id)
        }
      }
    },
    deleteTaskHandle(data) {
      if (!data.data.authority.deletable) {
        this.$message({
          message: data.data.authority.deleteErrorMsg,
          type: 'warning',
        })

        return
      }
      this.$confirm(i18n.t('此操作将删除该数据, 是否继续?'), i18n.t('提示'), {
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      })
        .then(() => {
          deleteTask({ id: data.id }).then(res => {
            if (res.status === 200) {
              this.getTaskList()
            } else {
              this.$message({ message: res.msg, type: 'error' })
            }
          })
        })
        .catch(() => {})
    },
    checkMove(ev) {
      return (
        ev.from.getAttribute('data-class') !== ev.to.getAttribute('data-class')
      )
    },
    endHandle(ev) {
      let a = parseInt(ev.from.getAttribute('data-class'))
      let b = parseInt(ev.to.getAttribute('data-class'))
      let id = parseInt(ev.item.getAttribute('data-id'))
      const projectId = this.projectId || this.$getUrlParams().projectId
      // 如果拖到其他泳道
      if (a !== b) {
        taskUpdate({
          id,
          statusId: b,
          projectId,
        })
          .then(res => {
            if (res.status === 200) {
              this.$message({
                message: res.msg || i18n.t('操作成功'),
                type: 'success',
              })
            }
            if (this.changeStatus === '1') {
              this.getTaskView()
            } else if (this.changeStatus === '3') {
              this.getPersonView()
            }
          })
          .catch(() => {
            if (this.changeStatus === '1') {
              this.getTaskView()
            } else if (this.changeStatus === '3') {
              this.getPersonView()
            }
          })
      }
    },
    onSubmit() {},
    changePageHandle() {
      // this.changeStatus = this.taskStatus;
      this.selectHandle()
    },
    handleTaskListSizeChange(val) {
      this.taskListPageInfo.pageSize = val
      this.getTaskList()
    },
    handleTaskListPageChange(val) {
      this.taskListPageInfo.pageNumber = val
      this.getTaskList()
    },

    // 获取任务列表
    getTaskList(filterInfo = {}, silent = false) {
      // let pageInfo = {
      //   pageNumber: this.taskListPageInfo.pageNumber,
      //   pageSize: this.taskListPageInfo.pageSize
      // };
      this.formInline.projectId = this.$getUrlParams().projectId
      this.list = {
        ...this.formInline,
        projectId: this.formInline.projectId,
        assignUsers: this.formInline.assignUsers,
        sprintIds: this.formInline.sprintIds,
        onlyDelay: this.onlyDelay,
        requireIds: this.formInline.requireIds,
        isArchived: this.isArchived,
        orderBy: this.pageInation.orderBy,
        pageInfo: {
          pageNumber: this.taskListPageInfo.pageNumber,
          pageSize: this.taskpageSizeChange,
        },

        ...filterInfo,
      }

      for (let i in this.formInline) {
        if (
          Array.isArray(this.formInline[i]) &&
          this.formInline[i].length > 0
        ) {
          if (this.formInline[i].includes('all')) {
            this.list[i] = []
          }
        }
      }
      this.loading = true
      this.list.sprintIds = this.list.sprintIds.filter(
        item => [-1, -2, -3, -4, -5].indexOf(item) == -1,
      )

      this.dealSprintIds(this.list)
      !silent && (this.tabsLoading = true)
      getTaskListCustom(this.list).then(res => {
        if (res.status === 200) {
          if (
            res.data.result.length === 0 &&
            this.taskListPageInfo.pageNumber > 1
          ) {
            this.taskListPageInfo.pageNumber = res.data.pageInfo.totalPages
            this.getTaskList()
          } else {
            this.formInlineCopy = cloneDeep(this.formInline)
            this.setStorageFilterTitle(TaskWorkItem, this.formInline.title)
            this.loading = false
            this.tabsLoading = false
            //todo cpp 这里应该获取自己的queryType=1
            this.taskList = res.data.result.map(item => {
              return {
                ...item.data,
                ...item,
              }
            })
            this.taskListCustomFields = res.data.fields
            this.taskListPageInfo = res.data.pageInfo
            // 当更新数据时，表格选中当前行
            this.$nextTick(() => {
              const currentItem = this.taskList.find(
                item => item.id == this.selectedWorkItemId,
              )
              currentItem &&
                this.$refs.taskMultipleTable.setCurrentRow(currentItem)
              this.checkItems = this.$refs.taskMultipleTable.selection
              this.clearInvalidCheckWorkItem()
            })
          }
        }
      })
    },
    // 清空不在列表中的勾选项
    clearInvalidCheckWorkItem() {
      const itemIdSet = new Set(this.checkItems.map(item => item.id))
      const localWorkItemsSet = new Set(this.taskList.map(item => item.id))
      const invalidItems = this.checkItems.filter(
        item => !localWorkItemsSet.has(item.id),
      )

      invalidItems.forEach(item => {
        this.$refs.taskMultipleTable.toggleRowSelection(item, false)
      })
      this.checkItems = this.taskList.filter(item => itemIdSet.has(item.id))
    },
    // 获取人员视图
    getPersonView(filterInfo = {}) {
      this.formInline.projectId = this.$getUrlParams().projectId
      let person = {
        ...this.formInline,
        projectId: this.formInline.projectId,
        assignUsers: this.formInline.assignUsers,
        sprintIds: this.formInline.sprintIds,
        onlyDelay: this.onlyDelay,
        requireIds: this.formInline.requireIds,
        orderBy: this.formInline.orderBy,
        isArchived: this.isArchived,
      }

      for (let i in this.formInline) {
        if (
          Array.isArray(this.formInline[i]) &&
          this.formInline[i].length > 0
        ) {
          if (this.formInline[i].includes('all')) {
            person[i] = []
          }
        }
      }
      this.loading = true
      person.sprintIds = person.sprintIds.filter(
        item => [-1, -2, -3, -4, -5].indexOf(item) == -1,
      )

      this.dealSprintIds(person)
      // this.tabsLoading = true
      getPersonView({ ...person, ...filterInfo }).then(res => {
        if (res.status === 200) {
          this.loading = false
          this.tabsLoading = false
          if (!res.data) {
            this.personData.task = {}
            return
          }
          this.formInlineCopy = cloneDeep(this.formInline)
          this.setStorageFilterTitle(TaskWorkItem, this.formInline.title)
          this.personData = res.data
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
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
}

.task-view {
  padding: 20px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  .footer-tab {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    /deep/ .el-tabs__header {
      display: none;
    }
    /deep/ .el-tabs__content {
      height: 100%;
      flex: 1;
      overflow: hidden;
      .el-tab-pane {
        height: 100%;
      }
    }
  }
}
.listView {
  height: calc(100% - 40px);
  position: relative;
  .el-table /deep/ .el-table__body-wrapper {
    overflow: auto;
  }
}
.table-task-custom-set {
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
.person-view {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  @include scrollbal-common;
  .person-view-header {
    width: max-content;
    position: sticky;
    top: 0;
    z-index: 3;
    display: flex;
    .person-view-header-item {
      width: 300px;
      height: 40px;
      line-height: 40px;
      //display: inline-block;
      border-radius: 4px 4px 0 0;
      box-sizing: border-box;
      margin-right: 10px;
      padding: 0 10px;
      background-color: $--background-gray;
      color: #333;
      font-size: 14px;
      //font-weight: 900;
      /deep/ .tooltip {
        width: 100%;
      }
    }
  }
  .person-view-content {
    width: 100%;
    overflow: auto;
    flex: 1;
    .person-content-view-list {
      //border-bottom: 1px solid;
      padding-bottom: 8px;
      display: flex;
      //align-items: stretch;
      width: max-content;
    }
  }
}

#taskview .active {
  color: $color-font-active-common;
}

#taskview .inactive {
  color: $color-font-inactive-common;
}

.taskinfo {
  height: 100%;
}

.btntext {
  color: $--color-primary;
  margin: 0 20px 0 0;
  cursor: pointer;
}

.content {
  height: 100%;
}

.btnBox {
  overflow: hidden;
  margin-left: 300px;
  margin-top: 20px;
}

.task-priority {
  margin-left: 9px;
}

.box1 {
  width: 100%;
  background-color: $--background-gray;
  height: 100%;
  padding: 0 12px 12px 12px;
  overflow-y: auto;
  box-sizing: border-box;
}

.box {
  width: 300px;
  //min-height: 60px;
  font-size: 18px;
  color: #333333;
  //font-weight: 900;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: top;
  padding: 32px 10px 20px;
  position: relative;
  box-sizing: border-box;
  margin-right: 10px;
  &:after {
    content: '';
    height: 1px;
    width: 100%;
    background: $--background-gray;
    border-radius: 4px;
    position: absolute;
    bottom: -8px;
    left: 0;
  }
}

.box5 {
  background-color: $--background-gray;
}
.box5,
.box6,
.box7,
.box8 {
  width: 300px;
  min-height: 60px;
  display: inline-block;
  margin-right: 10px;
  vertical-align: top;
  padding: 0 12px 12px 12px;
  box-sizing: border-box;
  flex-shrink: 0;
}

// 状态视图 - 任务泳道
.flexpaly {
  display: flex;
  flex-flow: row nowrap;
  overflow-x: auto;
  min-width: 953px;
  height: 100%;

  .flexpaly-item {
    width: 300px;
    border-radius: 2px;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    &:not(:first-child) {
      margin-left: 10px;
    }

    .flexpaly-item-header {
      width: 100%;
      height: 40px;
      line-height: 40px;
      // display: inline-block;
      box-sizing: border-box;
      padding: 0 10px;
      background-color: $--background-gray;
      color: #292f3a;
      font-size: 14px;
      font-family: 'MicrosoftYaHei';
      //font-weight: 900;
      /deep/ .tooltip {
        max-width: calc(100% - 50px);
      }
    }
    .task-icon {
      color: #000;
      font-size: 14px;
      font-weight: 900;
      /* margin-left:76px; */
      position: absolute;
      right: 22px;
      top: 14px;
      cursor: pointer;
    }
  }
}

.flexpaly-header {
  width: 953px;
  display: flex;
  justify-content: space-around;
  margin-left: 100px;
  align-items: flex-start;
  height: 100%;
}

.line {
  margin: 10px 0;
}

.flexpaly1 {
  width: 100%;
  overflow: hidden;
  padding: 15px 0;
  border-bottom: 1px double rgba(121, 121, 121, 1);
}

.color-text {
  width: 100%;
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
  position: relative;
  z-index: 2;
  background-color: #fff;
  cursor: pointer;
  border: 1px solid transparent;
  box-shadow: 0 2px 6px 0 rgba(12, 37, 77, 0.06);
  &.panel-item-cureent {
    border: 1px solid $--color-primary !important;
  }
}

.over {
  overflow: hidden;
  padding-bottom: 8px;
}

.color-text1 {
  width: 100%;
  background-color: #ffffff;
  border-radius: 5px;
  position: relative;
  z-index: 2;
  cursor: pointer;
  margin-top: 12px;
  border: 1px solid transparent;
  box-shadow: 0 2px 6px 0 rgba(12, 37, 77, 0.06);
  &.panel-item-cureent {
    border: 1px solid $--color-primary;
  }
}

.danger-circle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid red;
  float: right;
  position: absolute;
  top: 37px;
  right: 31px;
}

.danger-circle1 {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(255, 204, 0, 1);
  float: right;
  position: absolute;
  top: 37px;
  right: 31px;
}

.box-all {
  width: 300px;
}

p {
  margin-top: 3px;
}

.person {
  position: absolute;
  left: 50px;
  max-width: 70px;
  color: #666666;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ax-box {
  width: 280px;
}

.time {
  position: absolute;
  right: 0;
  font-size: 12px;
}

.color {
  width: 230px;
  background-color: #eee;
  box-sizing: border-box;
  color: #fff;
  font-weight: 900;
  padding-top: 11px;
  /* cursor: pointer; */
  position: relative;
}

.pending-disposal {
  text-align: center;
  display: inline-block;
  margin-left: 30px;
  margin-bottom: 11px;
  color: #333;
  font-size: 13px;
}

.pending-disposal1 {
  color: #333;
  font-size: 13px;
  vertical-align: top;
}

.icon {
  margin-left: 88px;
}

.viewChange {
  margin-left: 5px;
}

.taskView {
  margin-top: 20px;
}

.icon-title {
  width: 100%;
  display: inline-block;
  word-break: break-word;
  font-style: normal;
  position: relative;
  padding: 0 8px;
  box-sizing: border-box;
  font-weight: 600;
  // top: 4px;
  color: #333333;
}

.reviwe-center {
  width: 100%;
  margin-top: 5px;
  padding: 5px 5px 2px 5px;
  height: auto;
}

.demo-form-inline {
  /* overflow: hidden; */
  display: inline-block;
  width: 100%;
}

.icon-renwu {
  color: $--color-icon-default;
  margin-right: 6px;
}
.c-blue-hover {
  &:hover {
    .icon-renwu {
      color: $--color-icon-renwu;
    }
  }
}
.left-content-footer {
  bottom: 0;
  // border-top: 1px solid $color-border-common;
  width: 100%;
  padding: 4px 0 4px 2px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;
  .pagination-custom {
    //float: left;
    //width: 210px;
    font-size: 14px;
    padding: 3px 0;
    box-sizing: border-box;
    color: #bfbfbf;
    .pagination-custom-input {
      display: inline-block;
      width: 45px;
      margin: 0 10px;
      /deep/ .el-input__inner {
        color: #bfbfbf;
        text-align: center;
      }
    }
    .pagination-custom-input-en {
      width: 32px;
    }
  }
}

// 新建任务按钮
.new-button {
  position: relative;
  top: 5px;
  right: 18px;
}

// 卡片信息
.card-info {
  display: flex;
  align-items: center;
  overflow: hidden;
  margin-bottom: 5px;

  > .person {
    margin-left: 10px;
  }

  > .time {
    text-align: right;
    padding-right: 12px;
    box-sizing: border-box;
  }
}

// 卡片标题
.card-title {
  margin: 12px 0 8px 0;
}

.card-start-time {
  padding-right: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #666666;
  text-align: end;
}

// 父需求
.card-title-parent {
  margin-bottom: 10px;
  font-size: 12px;
  padding-left: 8px;
  color: #666666;
}
// 已结束卡片颜色控制
.card-box.panel-item-finish {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #f1f4f9;
  box-shadow: 0 2px 6px 0 rgba(12, 37, 77, 0.06);
  .card-item,
  .card-time-common,
  .card-time-red,
  .iconfont {
    color: #797979;
  }
  .icon-title {
    color: #888888;
  }
  .card-title-parent,
  .person,
  .time,
  .card-start-time {
    color: #999999;
  }
}
</style>
