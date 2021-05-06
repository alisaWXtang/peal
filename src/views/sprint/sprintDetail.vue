<template>
  <div v-if="!getSprintInfoError" class="sprint-detail-scroll scrollbal-common">
    <div
      id="sprintDetail"
      v-loading="!sprintDetailLoading"
      class="sprint-detail content-outer-box"
      :element-loading-text="$t('拼命加载中')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255,255,255, 0.5)"
    >
      <!-- 工作项滑窗 -->
      <slide
        :show="sliderWorkItemInfo.sliderStatus"
        :after-close="sliderClose"
        :left-slider-editable="true"
        :before-close="
          ({ cb }) => beforeSliderClose({ id: sliderWorkItemInfo.info.id, cb })
        "
      >
        <div slot="task" class="taslinfo">
          <!--延期抽屉-->
          <TaskDetail
            v-if="sliderWorkItemInfo.type === 'task'"
            ref="task"
            :project-id="sliderWorkItemInfo.projectId"
            :work-item-id="sliderWorkItemInfo.info.id"
            :show="sliderWorkItemInfo.sliderStatus"
            @HandleSide="sliderClose"
            @updateInfoSuccess="getTaskList"
            @deleteSuccess="sliderClose"
          ></TaskDetail>
          <RequirementDetail
            v-if="sliderWorkItemInfo.type === 'requirement'"
            ref="requrire"
            :project-id="sliderWorkItemInfo.projectId"
            :work-item-id="sliderWorkItemInfo.info.id"
            :show="sliderWorkItemInfo.sliderStatus"
            @HandleSide="sliderClose"
            @updateInfoSuccess="getRequirementList"
            @deleteSuccess="sliderClose"
          ></RequirementDetail>
        </div>
      </slide>
      <slide
        ref="side"
        v-loading="loading"
        :show="show"
        :after-close="HandleSide"
        :before-close="
          ({ cb }) =>
            beforeSliderClose({
              id: workType === 2 ? bugProjectId : taskId,
              cb,
            })
        "
        :element-loading-text="$t('拼命加载中')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgb(255,255,255)"
        @click.stop
      >
        <div slot="task" class="silder-box">
          <!--工作项抽屉-->
          <BugDetail
            v-if="workType === 2 && bugProjectId != -1"
            ref="bug"
            :work-item-id="activeBugInfo.id"
            :project-id="bugProjectId"
            :show="show"
            @HandleSide="HandleSide"
            @deleteSuccess="HandleSide"
            @updateInfoSuccess="changHandleTask"
          ></BugDetail>
          <TaskDetail
            v-if="workType === 1"
            ref="task"
            :project-id="bugProjectId"
            :work-item-id="taskId"
            :show="show"
            @HandleSide="HandleSide"
            @deleteSuccess="HandleSide"
            @updateInfoSuccess="changHandleTask"
          ></TaskDetail>
          <RequirementDetail
            v-if="workType === 3"
            ref="requrire"
            :project-id="bugProjectId"
            :work-item-id="taskId"
            :show="show"
            @HandleSide="HandleSide"
            @deleteSuccess="HandleSide"
            @updateInfoSuccess="changHandleTask"
          ></RequirementDetail>
        </div>
      </slide>
      <div v-if="sprintDetailLoading" class="x-arD review-center">
        <div class="sprintInfo-content">
          <div v-show="showDetailMenu" class="clearfloat mb10">
            <div style="float: left;" class="sprint-title">
              <span
                v-if="!isEditName"
                class="font-desgin"
                :title="sprintInfo.name"
                @click="showEditInput"
                >{{ sprintInfo.name }}</span
              >
              <div v-else>
                <co-input
                  ref="sprintInfoName"
                  v-model.trim="editSprintInfo.sprintForm.name"
                  :placeholder="$t('请输入迭代名称')"
                  @blur="editSprintInfoName"
                  @change="editSprintInfoName"
                ></co-input>
              </div>
              <span class="ml5"></span>
              <i
                v-if="sprintInfo.isLocked == 1"
                class="iconfont icon-lock ml5"
                :title="$t('迭代已锁定')"
              ></i>
              <span class="ml5">
                <span
                  v-if="sprintInfo.isDeadlineClose"
                  class="dateTips"
                  :title="titleIconLabelTime(sprintInfo.deadlineCloseDisplay)"
                  >{{ sprintInfo.deadlineCloseDisplay }}</span
                >
                <!--到期多少天-->
                <span
                  v-if="sprintInfo.isOutOfDate"
                  class="dateTipsred"
                  :title="titleIconLabelTime(sprintInfo.outOfDateDisplay)"
                  >{{ sprintInfo.outOfDateDisplay }}</span
                >
              </span>
            </div>
            <div style="float: right;line-height: 28px;">
              <template v-if="sprintInfo.status != 2">
                <span
                  v-show="$authFunction('PROJ_SPRINT_ADD_TASK', 3, projectId)"
                  ref="planSprintBtn"
                  class="btn-span"
                  type="primary"
                  @click="planSprint"
                  ><i class="iconfont icon-guihua1" />{{ $t('规划') }}</span
                >
                <span
                  v-if="sprintInfo.isLocked == 0"
                  v-show="$authFunction('FUNC_COOP_SPRINT_LOCK', 3, projectId)"
                  class="btn-span"
                  @click="lockSprint(sprintInfo.id)"
                  ><i class="iconfont icon-suoding" />{{ $t('锁定') }}</span
                >
                <span
                  v-if="sprintInfo.isLocked == 1"
                  v-show="
                    $authFunction('FUNC_COOP_SPRINT_UNLOCK', 3, projectId)
                  "
                  class="btn-span"
                  @click="unLockSprint(sprintInfo.id)"
                  ><i class="iconfont icon-jiesuo" />{{ $t('解锁') }}</span
                >
                <span
                  v-show="$authFunction('PROJ_SPRINT_STOP', 3, projectId)"
                  class="btn-span"
                  @click="stopSprint()"
                  ><i class="iconfont icon-guidang" />{{ $t('归档') }}</span
                >
                <co-dropdown
                  v-show="$authFunction('PROJ_SPRINT_STOP', 3, projectId)"
                  class="more-dropdown"
                  size="medium"
                >
                  <co-link
                    suffix-icon="co-icon-arrow-down"
                    :underline="false"
                    style="font-size: 14px;"
                    >更多</co-link
                  >
                  <co-dropdown-menu slot="dropdown">
                    <co-dropdown-item
                      v-show="
                        $authFunction('PROJ_SPRINT_STOP', 3, projectId) ||
                          $authFunction('PROJ_SPRINT_STOP', 3, projectId)
                      "
                    >
                      <div style="font-size: 14px;" @click="editSprint()">
                        {{ $t('编辑') }}
                      </div>
                    </co-dropdown-item>
                    <co-dropdown-item
                      v-show="$authFunction('PROJ_SPRINT_STOP', 3, projectId)"
                    >
                      <div style="font-size: 14px;" @click="deleteSprint()">
                        {{ $t('删除') }}
                      </div>
                    </co-dropdown-item>
                  </co-dropdown-menu>
                </co-dropdown>
              </template>
              <el-button v-else @click="rollbackArchived">{{
                $t('取消归档')
              }}</el-button>
            </div>
          </div>
        </div>
        <el-tabs
          v-model="changeStatus"
          class="footer-tab"
          @tab-click="changHandleTask"
        >
          <el-tab-pane :label="$t('概览')" name="6" lazy>
            <div
              v-if="changeStatus === '6'"
              ref="sprintLog"
              class="scrollbal-common sprint-detail-table-scroll sprint-log"
            >
              <Overview
                :sprint-info="sprintInfo"
                @dateUpdate="getSprintInfo"
                @templateUpdate="getSprintInfo"
                @changHandleTask="changHandleTask"
                @archivedSuccess="onArchivedSuccess"
                @delayNumberClick="onDelayNumberClick"
                @onEditChange="onEditChange"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('工作项')" name="0">
            <div class="sprint-work-project">
              <div class="sprint-work-header">
                <el-input
                  v-model="searchInputValue"
                  v-focus
                  clearable
                  :placeholder="$t('请输入标题/ID,按enter键搜索')"
                  class="header-filter-item-top"
                  style="width: 196px;margin: 0 32px 16px 0;"
                  @clear="getRequireTaskInfo"
                  @keyup.enter.native="getRequireTaskInfo"
                ></el-input>
                <div style="line-height: 26px;font-family: MicrosoftYaHei;">
                  工作项类型：
                </div>
                <div>
                  <el-checkbox-group
                    v-model="checkList"
                    style="margin-top: 5px;"
                    class="fl sprint-require-task-checkbox"
                    @change="selectChange"
                  >
                    <el-checkbox
                      :label="$t('需求')"
                      style="margin: 0 0 0 17px;font-size: 14px;"
                    >
                      {{ $t('需求') }}({{ workItemCounts.requireCount }})
                    </el-checkbox>
                    <el-checkbox
                      :label="$t('任务')"
                      style="margin: 0 0 0 24px;font-size: 14px;"
                    >
                      {{ $t('任务') }}({{ workItemCounts.taskCount }})
                    </el-checkbox>
                    <el-checkbox
                      :label="$t('缺陷')"
                      style="margin: 0 0 0 24px;font-size: 14px;"
                    >
                      {{ $t('缺陷') }}({{ workItemCounts.bugCount }})
                    </el-checkbox>
                  </el-checkbox-group>
                  <div
                    v-show="isShowGanttBtn"
                    class="unfold-gantt"
                    :style="{ color: isShowGantt ? '#3081F2' : '' }"
                    @click="handleUnfoldGantt"
                  >
                    <i
                      class="iconfont icon-gantetu"
                      style="vertical-align: top;margin-right: 6px"
                    />甘特图
                  </div>
                  <header-filter
                    v-if="changeStatus == 0"
                    class="fl"
                    :change-status="changeStatus"
                    :project-id="projectId || $getUrlParams().projectId"
                    :work-item-type="workItemTypeReqTask"
                    @filterClick="updateFilterInfo"
                  ></header-filter>
                  <div class="export-btn-box" @click="exportExcel">
                    <i
                      class="iconfont icon-daochu"
                      style="vertical-align: top;margin-right: 6px"
                    />导出
                  </div>
                </div>
              </div>
              <div ref="tableGanttBody" class="treetable requirement-table">
                <div class="treetable">
                  <sprint-table-gantt
                    ref="sprintTableGantt"
                    :tree-data="pageRequireTaskData"
                    :see-task-handle="seeTaskHandle"
                    :is-show-gantt="isShowGantt"
                    class="require-task-table"
                    table-height="610"
                    :sorta-change-call-back="
                      prop => {
                        sortaChangeCallBack(prop, true)
                      }
                    "
                    :get-base-list="getRequireTaskInfo"
                    :show-gantt="false"
                    :has-gantt="true"
                    :enable-collspan="showGanttRequireTaskData"
                    :date-list="dateList"
                    :scroll-option="requirementScroll"
                    :update-data="updataStausInfo"
                    @ganttDataIsNull="ganttDataIsNull"
                    @taskRequireSuccess="taskRequireSuccess"
                  ></sprint-table-gantt>
                </div>
                <el-pagination
                  v-if="requireTaskPageInfo.totalCount > 0"
                  class="flex-right"
                  background
                  :current-page="requireTaskPageInfo.pageNumber"
                  :page-sizes="[10, 20, 30, 50]"
                  :page-size="requireTaskPageInfo.pageSize"
                  layout="total, prev, pager, next, jumper"
                  :total="requireTaskPageInfo.totalCount"
                  @size-change="requireTaskPageSizeChange"
                  @current-change="requireTaskPageChange"
                >
                </el-pagination>
                <!-- </div> -->
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('成员视图')" name="1">
            <div class="view-tab-pane" style="height: 100%">
              <div style="overflow:hidden;margin-bottom: 16px;">
                <el-input
                  v-model="searchUserInputValue"
                  v-focus
                  clearable
                  :placeholder="$t('请输入标题/ID,按enter键搜索')"
                  class="header-filter-item-top"
                  style="margin: 0 15px;width: 196px;float: left;margin: 0 32px 0 0;"
                  @clear="getUserTaskInfo"
                  @keyup.enter.native="getUserTaskInfo"
                ></el-input>
                <div
                  style="float: left;line-height: 26px;font-family: MicrosoftYaHei;"
                >
                  工作项类型：
                </div>
                <div style="float: left; width: 63%;">
                  <el-checkbox-group
                    v-model="userCheckList"
                    class="fl"
                    style="margin-top: 5px;margin-right: 10px;"
                    @change="userSelectChange"
                  >
                    <el-checkbox
                      :label="$t('需求')"
                      style="margin: 0 0 0 17px;font-size: 14px;"
                    >
                      {{ $t('需求') }}
                    </el-checkbox>
                    <el-checkbox :label="$t('任务')" class="ml30">
                      {{ $t('任务') }}
                    </el-checkbox>
                    <el-checkbox :label="$t('缺陷')" class="ml30">
                      {{ $t('缺陷') }}
                    </el-checkbox>
                  </el-checkbox-group>
                  <header-filter
                    v-if="changeStatus == 1"
                    :change-status="changeStatus"
                    :project-id="projectId || $getUrlParams().projectId"
                    :work-item-type="{
                      req: false,
                      task: false,
                      bug: false,
                      priority: 3,
                    }"
                    @filterClick="updateFilterInfo3"
                  ></header-filter>
                </div>
              </div>
              <div
                style="width: 100%;flex: 1;overflow: auto;height: calc(100% - 60px);"
              >
                <div
                  class="scrollbal-common sprint-detail-table-scroll member-table"
                >
                  <div
                    v-if="userTaskData.length === 0 && !userTaskDataLoading"
                    style="text-align: center; margin-top: 20px;color: #909399;"
                  >
                    {{ $t('暂无数据') }}
                  </div>
                  <div
                    v-for="(row, index) in userTaskData"
                    :key="index"
                    class="member-parent"
                  >
                    <div>
                      <div class="user-name" :class="{ mt0: index === 0 }">
                        <span style="color: #333333"
                          >{{ row.userName }}({{ row.userId }})</span
                        >
                        <span class="ml10" style="font-size: 12px;"
                          >{{ $t('需求') }}({{ row.completeRequires }}/{{
                            row.totalRequires
                          }})</span
                        >
                        <span class="ml10" style="font-size: 12px;"
                          >{{ $t('任务') }}({{ row.completeTasks }}/{{
                            row.totalTasks
                          }})</span
                        >
                        <span class="ml10" style="font-size: 12px;"
                          >{{ $t('缺陷') }}({{ row.closedDefect }}/{{
                            row.totalDefect
                          }})</span
                        >
                      </div>
                    </div>
                    <div class="member-table__content">
                      <sprint-table-gantt
                        :user-id="row.userId"
                        :tree-data="row.dataList"
                        :see-task-handle="seeTaskHandle"
                        :sorta-change-call-back="sortaChangeCallBack"
                        :get-base-list="getUserTaskInfo"
                        :has-gantt="false"
                        :update-data="updataStausInfo.bind(this)"
                        @taskRequireSuccess="taskRequireSuccess"
                        @bugStatusChange="bugStatusChangeSprintTableGantt"
                      ></sprint-table-gantt>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('迭代跟踪日志')" name="sprint">
            <div class="scrollbal-common sprint-detail-table-scroll sprint-log">
              <sprint-log v-if="changeStatus === 'sprint'"></sprint-log>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <sprint-creact-or-edit-dialog
      :dialog-form-title="editSprintInfo.dialogFormTitle"
      :dialog-form-visible.sync="editSprintInfo.dialogFormVisible"
      :sure-update-sprint="updateSprintFn"
      :sprint-edit-form="editSprintInfo.sprintForm"
      @change="onEditChange"
    ></sprint-creact-or-edit-dialog>
    <GlobalSelect v-bind="GlobalSelectProps"></GlobalSelect>
    <back-top></back-top>
    <el-dialog
      :title="$t('提示')"
      :visible.sync="sprintdialogVisible"
      width="550px"
      style="margin-top: 26vh"
      :class="{ 'sprint-archive-dialog-en': $isEnglish() }"
    >
      <div style="display: flex;">
        <div style="width: 30px; padding-top: 3px;">
          <i
            class="el-icon-warning-outline"
            style="color:#E6A23C;font-size: 20px;font-weight: 600;"
          ></i>
        </div>
        <div
          v-if="sprintInfo && sprintInfo.name"
          style="flex: 1;line-height: 24px;"
          :class="{ 'work-break': $isEnglish() }"
        >
          <template v-if="$isEnglish()">
            There is an uncompleted task in [{{ sprintInfo.name }}].You can
            complete all the tasks, or:
          </template>
          <template v-else>
            [{{ sprintInfo.name }}
            ]下有未完成的工作项，请将未完成工作项完成，或者选择如下附加操作：
          </template>
        </div>
      </div>
      <el-checkbox
        v-model="sprintchecked"
        style="margin-left: 30px;font-weight: normal;"
        >{{ $t('将未完成的工作项移除迭代,同时归档迭代') }}</el-checkbox
      >
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelStopSprint">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="successStopSprint">{{
          $t('确定')
        }}</el-button>
      </span>
    </el-dialog>
    <!--导出弹窗-->
    <co-dialog
      title="导出迭代"
      :visible.sync="dialogVisible"
      custom-class="export-sprint-dialog"
      width="440px"
    >
      <div>
        <div class="select-title">工作项类型</div>
        <co-checkbox-group v-model="exportSprintCheckList" size="medium">
          <co-checkbox label="需求" />
          <co-checkbox label="任务" />
          <co-checkbox label="缺陷" />
        </co-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <!--        <co-button @click="dialogVisible = false">取 消</co-button>-->
        <co-button type="primary" @click="onExportSprintSubmit"
          >确 定</co-button
        >
      </span>
    </co-dialog>
    <dialog-box :dialog-data="dialogData">
      <task-table
        v-if="activeType === 'task' && dialogData.show"
        parent-type="sprintDetail"
        :list="delayList"
        :page-info="pageInfo"
        :loading="dialogLoading"
        @pageChange="pageChange"
        @exportExcel="exportExcelSheet"
        @metricSlide="metricSlide"
      ></task-table>
      <requirement-table
        v-if="activeType === 'requirement' && dialogData.show"
        parent-type="sprintDetail"
        :list="delayList"
        :page-info="pageInfo"
        :loading="dialogLoading"
        :is-delay="true"
        @pageChange="pageChange"
        @exportExcel="exportExcelSheet"
        @metricSlide="metricSlide"
      ></requirement-table>
    </dialog-box>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
// import treeTable from '@/pages/tool/TreeTable'
import slide from '@/components/slide-slip'
// import demandView from "pages/project/requirement/requirementView.vue";
import {
  BugDetail,
  TaskDetail,
  RequirementDetail,
} from '@/components/columbus-workitem-display'
import GlobalSelect from '@/components/field-edit/GlobalSelect.vue'
// import GlobalInput from '@/components/field-edit/GlobalInput.vue'
// import CommentForStatus from '@/pages/project/bugManagement/CommentForStatus.vue'
// import TestPlan from '@/components/test-plan'
// import StateFlow from '@/components/state-flow'
// import ExpansionFoldButton from '@/components/expansion-fold-button'
import DialogBox from '@/components/dialog-box'
import StringView from '@/utils/string-view'
import { seeDemand as seeDemandOfRequirementService } from '@/service/requirement'
import * as sprintService from '@/service/sprint'
import { excelExport as sprintApiExcelExport } from '@/api/sprint'
import metricApi from '@/api/metric'

import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import RequirementTable from './RequirementTable'
import SprintTableGantt from './SprintTableGantt'
import HeaderFilter from './HeaderFilter'
import SprintCreactOrEditDialog from './SprintCreactOrEditDialog'
// import SprintInfo from './SprintInfo'
// import CodeStatistics from './CodeStatistics'
import SprintLog from './SprintLog'
import TaskTable from './TaskTable'
import Overview from './overview/index'

import { guide } from '@/store/mutation-types'
import { guideStep, guideType } from '../../components/guide/guideData'

var echarts = require('echarts')

// const BUGLIST = 'bugList'
// const REQUIREMENT = 'requirementList'

// 迭代操作枚举
const OperateEnum = {
  edit: 'edit', // 编辑
  delete: 'delete', // 删除
  lock: 'lock', // 锁定
  unLock: 'unLock', // 解锁
  forceLock: 'forceLock', // 强制锁定
  archived: 'archived', // 归档
}
//埋点key映射
const nameMap = {
  0: 'requirementAndTask', //需求与任务
  1: 'member', //成员视图
  2: 'progress', //进程图
  3: 'bug', //缺陷
  code: 'code', //代码统计
  sprint: 'sprint', //迭代跟踪日志
  testplan: 'testplan', //测试计划
}
export default {
  name: 'SprintDetail',
  components: {
    // ExpansionFoldButton,
    // treeTable,
    slide,
    TaskDetail,
    RequirementDetail,
    BugDetail,
    GlobalSelect,
    // GlobalInput,
    SprintTableGantt,
    // SprintInfo,
    // CommentForStatus,
    // CodeStatistics,
    SprintLog,
    // TestPlan,
    HeaderFilter,
    SprintCreactOrEditDialog,
    DialogBox,
    RequirementTable,
    TaskTable,
    // StateFlow,
    Overview,
  },
  mixins: [ProjectCommonMixin],
  inject: ['reload'],
  data() {
    return {
      isShowGanttBtn: false,
      foldStatus: null,
      requirementScroll: {
        height: 610,
        overflowY: true,
      },

      getSprintInfoError: false,
      // 初始不显示菜单操作 避免闪烁
      showDetailMenu: false,
      workItemId: '',
      workItemTypeReqTask: { req: true, task: true, bug: false },
      workItemTypeBug: { req: false, task: false, bug: true, priority: 2 },
      disabledTestplan: true,
      CommentForStatusInfo: {
        isShow: false,
        statusInfo: {},
        onOk: this.bugStatusClickCallbackOnOk,
        onCancel: this.bugStatusClickCallbackOnCancel,
      },

      lastSortOrders: {}, // 排序数据保存 - by heyunjiang on 2019.10.8
      workType: null,
      detailType: 'show',
      activeBugInfo: {},
      defectData: [], //缺陷列表数据
      // 缺陷的分页数据
      defectPageInfo: {
        pageNumber: 1,
        pageSize: 20,
        totalCount: 0,
      },
      reqTaskFilterInfo: {}, //迭代过滤器任务数据
      bugFilterInfo: {}, //迭代过滤器缺陷数据
      userFilterInfo: {}, //迭代过滤器成员视图数据
      bugProjectId: null,
      sprintId: '',
      projectId: '',
      expandAll: true,
      changeStatus: '0',
      radio3: '1',
      // checkList: [this.$t('需求'), this.$t('任务'), this.$t('缺陷')],
      checkList: [this.$t('需求'), this.$t('任务')],
      isShowRequire: 1,

      isShowDefect: 0,
      editSprintInfo: {
        dialogFormTitle: '',
        dialogFormVisible: false,
        sprintForm: {
          id: 0,
          projectId: '',
          name: '',
          startTime: '',
          endTime: '',
          chargeUser: '',
          sprintDesc: '',
        },
      },

      sprintInfo: {
        status: '',
        name: '',
        process: 0,
        startTime: '',
        endTime: '',
        completeRequires: 0,
        completeInTimeRequires: 0,
        completeDelayRequires: 0,
        totalRequires: 0,
        completeTasks: 0,
        completeInTimeTasks: 0,
        completeDelayTasks: 0,
        totalTasks: 0,
        totalTaskHours: 0,
        completeTaskHours: 0,
      },

      isEditName: false,

      // 需求与任务分页信息
      requireTaskPageInfo: {
        pageNumber: 1,
        pageSize: 20,
        totalCount: 0,
      },
      searchInputValue: '', // 工作项输入框值
      searchUserInputValue: '', // 成员视图输入框值
      workItemCounts: {
        requireCount: 0,
        taskCount: 0,
        bugCount: 0,
      },
      requireTaskData: [],
      pageRequireTaskData: [], // 当前需求与任务列表数据
      dateList: [],

      userTaskData: [],
      userCheckList: [i18n.t('需求'), i18n.t('任务'), i18n.t('缺陷')],

      userIsShowRequire: 1,
      userIsShowTask: 1,
      isShowTask: 1, // 兼容设置，兼容之前的前端代码，保证所有数据初始化在 data 对象内部 - add by heyunjiang
      userIsShowDefect: 1,
      jumpPage: 'sprintUserTask',
      delayList: [],
      activeType: '',
      dialogData: {
        title: i18n.t('需求详情'),
        show: false,
      },

      pageInfo: {
        pageNumber: 1,
        pageSize: 10,
        totalRecords: 0,
      },

      dialogLoading: false,

      requireStatusDistributeChartData: {
        reqXAxis: [],
        reqYAxis: [],
      },

      taskStatusDistributeChartData: {
        taskXAxis: [],
        taskYAxis: [],
      },

      bugTrendChartData: {
        bugXAxis: [],
        bugY1Axis: [],
        bugY2Axis: [],
        bugY3Axis: [],
      },

      taskHourBurnDownChartData: {
        xAxis: [],
        taskY1Axis: [],
        taskY2Axis: [],
      },

      taskNumBurnDownChartData: {
        xAxis: [],
        taskNumY1Axis: [],
        taskNumY2Axis: [],
      },

      reqNumBurnDownChartData: {
        xAxis: [],
        reqY1Axis: [],
        reqY2Axis: [],
      },

      count: 0,
      restore: 1,
      preID: null,
      show: false,
      userTaskDataLoading: false,
      showGanttRequireTaskData: false,
      taskId: null,
      loading: false,
      sprintDetailLoading: false,
      treetableLoading: false,
      screenHeight: null,
      sprintdialogVisible: false,
      sprintchecked: false,
      currentTableSelectId: '', //当前行id,主要用于更新数据时，列表更新不会选中当前行问题
      sliderWorkItemInfo: {},
      dialogVisible: false,
      exportSprintCheckList: [],
      isShowGantt: false,
      lastUneditedTableTime: 0, // 模拟节流实现：上次 blur 或 change 时间
    }
  },

  computed: {
    titleIconLabelTime() {
      return timeInfo =>
        `${i18n.t('周期')}
：${this.sprintInfo.startTime || i18n.t('未设置')} ~ ${this.sprintInfo
          .endTime || i18n.t('未设置')} ${timeInfo}`
    },
    sprintDetailFoldStatus() {
      return this.$store.state.bugManage.sprintDetailFoldStatus
    },
  },
  watch: {
    $route(val, oldVal) {
      // val.path !== oldVal.path 解决多次重复请求接口问题
      if (val.path === '/sprint/detail' && val.path !== oldVal.path) {
        this.onInit()
      }
    },
    '$route.query'(query, oldQuery) {
      if (this.count === 0) {
        if (query.requireId) {
          this.taskId = this.currentTableSelectId = query.requireId
        } else if (query.taskId) {
          this.taskId = this.currentTableSelectId = query.taskId
        } else if (query.bugId) {
          this.activeBugInfo = {
            id: query.bugId,
          }
          this.currentTableSelectId = query.bugId
        }
      }

      if (query.sprintId != oldQuery.sprintId) {
        this.onInit()
      }
      if (query.guideType === guideType.sprint) {
        this.changeStatus = '0'
        this.changHandleTask({ name: '0' })
      } else if (query.guideType === guideType.sprintProgress) {
        this.changeStatus = '6'
        this.changHandleTask({ name: '6' })
      }
    },
  },

  mounted() {
    this.onInit()
    this.$emit('afterChildrenMounted')
    this.copeLinkOpenSlide()
    this.foldStatus = this.sprintDetailFoldStatus
    if (
      [guideType.sprintProgress, guideType.bug].includes(
        this.$getUrlParams().guideType,
      )
    ) {
      this.changeStatus = '6'
    }
    this.$bus.$on('G_changeGuideStep', this.changeGuideStep)
    this.$bus.$on('G_splitPlanning', this.initGuide)
    this.$bus.$on('G_sprintScroll', this.sprintScroll)
  },
  beforeDestroy() {
    this.$bus.$off('G_changeGuideStep', this.changeGuideStep)
    this.$bus.$off('G_splitPlanning', this.initGuide)
    this.$bus.$off('G_sprintScroll', this.sprintScroll)
  },
  beforeRouteLeave(to, from, next) {
    // 如果存在内容在编辑，则不能离开
    // if (this.sliderBeforeCloseData.title || this.sliderBeforeCloseData.desc) {
    //   return false;
    // }
    next()
  },
  methods: {
    sprintScroll(targetDom) {
      targetDom = targetDom.$el || targetDom
      this.$refs.sprintLog.scrollTo(0, targetDom.offsetTop)
    },
    changeGuideStep(item) {
      if (item.guideStep === guideStep.sprintPlanning) {
        this.initGuide()
        return
      }
      if (item.guideStep === guideStep.taskSplit) {
        this.initGuide()
      }
    },
    initGuide() {
      if (this.show) return
      if (this.$store.state.guide.guideType === guideType.sprint) {
        let _this = this
        if (this.$store.state.guide.guideStep === guideStep.sprintPlanning) {
          if (!this.$authFunction('PROJ_SPRINT_ADD_TASK', 3, this.projectId)) {
            this.$store.commit(guide.STEP_WARN, {
              warnMessage:
                '你没有规划迭代权限，请在设置中添加权限，再继续浏览此步指引',
              guideStep: guideStep.sprintPlanning,
            })
            return
          }
          if (this.$store.state.guide.guideStep) {
            this.$store.commit(guide.RECOVERY_STEP)
          }
          this.$store.commit(guide.START_GUIDE, {
            guideType: guideType.sprint,
            guideStep: guideStep.sprintPlanning,
            step: 1,
            steps: {
              1: {
                dom: this.$refs.planSprintBtn,
                nextCallback() {
                  // 下一步
                  _this.planSprint()
                },
                prevCallback() {
                  if (
                    !_this.$authFunction(
                      'PROJ_SPRINT_ADD',
                      3,
                      _this.$getUrlParams().projectId,
                    )
                  ) {
                    _this.$store.commit(guide.STEP_WARN, {
                      warnMessage:
                        '你没有创建迭代权限，请在设置中添加权限，再继续浏览此步指引',
                      guideStep: guideStep.sprintCreate,
                    })
                    return
                  }
                  // 上一步
                  _this.$store.commit(guide.UPDATE_STEP_INDEX, 3)
                  _this.$bus.$emit('G_sprintPlanPrev')
                },
              },
            },
          })
          return
        }
        if (this.$store.state.guide.guideStep === guideStep.taskSplit) {
          // if (this.$store.state.guide.step !== 1) return
          // 无需求
          let domId = null
          let rowData = null
          this.pageRequireTaskData.forEach(item => {
            if (item.data.workItemType === 1 && !domId) {
              domId = 'tableIdDom' + item.data.id
              rowData = item
            }
          })
          if (!this.pageRequireTaskData.length || !domId) {
            this.$store.commit(guide.STEP_WARN, {
              warnMessage:
                '当前迭代未规划需求，请先规划需求，再按照浏览此步指引。',
              guideStep: guideStep.taskSplit,
            })
            return
          }
          this.$store.commit(guide.RECOVERY_STEP)
          this.$store.commit(guide.START_GUIDE, {
            guideType: guideType.sprint,
            guideStep: guideStep.taskSplit,
            step: 1,
            steps: {
              1: {
                dom: document.getElementById(domId),
                nextCallback() {
                  // 下一步
                  _this.seeTaskHandle(rowData.data)
                },
                prevCallback() {
                  if (
                    !_this.$authFunction(
                      'PROJ_SPRINT_ADD_TASK',
                      3,
                      _this.projectId,
                    )
                  ) {
                    _this.$store.commit(guide.STEP_WARN, {
                      warnMessage:
                        '你没有规划迭代权限，请在设置中添加权限，再继续浏览此步指引',
                      guideStep: guideStep.sprintPlanning,
                    })
                    return false
                  }
                  // 上一步
                  _this.$store.commit(guide.UPDATE_STEP_INDEX, 3)
                  _this.planSprint()
                },
              },
            },
          })
        }
      }
    },
    showEditInput() {
      this.editSprintInfo.sprintForm.name = this.sprintInfo.name
      this.isEditName = true
      this.$nextTick(() => {
        this.$refs.sprintInfoName.focus()
      })
      let params = { sprintId: this.sprintInfo.id }
      sprintService.getBaseInfo(params).then(res => {
        this.editSprintInfo.sprintForm = res.data
      })
    },
    // 修改迭代名称
    editSprintInfoName() {
      const now = new Date().getTime()
      if (now - this.lastUneditedTableTime < 100) {
        return
      }
      this.lastUneditedTableTime = now
      this.isEditName = false
      if (
        this.editSprintInfo.sprintForm.name &&
        this.editSprintInfo.sprintForm.name !== this.sprintInfo.name
      ) {
        sprintService
          .updateSprint({ ...this.editSprintInfo.sprintForm })
          .then(res => {
            if (res.status == 200) {
              this.updateSprintFn()
              this.$message({
                message: res.msg || i18n.t('修改迭代成功'),
                type: 'success',
              })

              this.onEditChange()
            }
          })
      }
    },
    onToggleDetailFold(val) {
      this.$store.commit('updateSprintDetailFoldStatus', val)
    },
    onCloseSlider() {
      this.show = false
    },
    //复制链接打开右侧弹窗
    async copeLinkOpenSlide() {
      const urlParams = this.$getUrlParams()
      const projectId = urlParams.projectId
      let bugId = urlParams.bugId
      let requireId = urlParams.requireId
      let taskId = urlParams.taskId
      if (!bugId && !taskId && !requireId) {
        return
      }
      if (bugId) {
        this.bugProjectId = projectId
        this.activeBugInfo = {
          id: bugId,
        }

        this.workType = 2
        this.show = true
      }
      if (taskId) {
        // 记录preID 用于表格title点击查看校验
        this.taskId = this.preID = taskId
        this.workType = 1
        this.show = true
      }
      if (requireId) {
        this.taskId = this.preID = requireId
        this.workType = 3
        this.show = true
      }

      // 默认已点击一次
      this.count = 1
    },
    // 需求详情鉴权接口
    async checkRequirementInfo(info) {
      const res = await seeDemandOfRequirementService({
        id: info.id,
      })

      if (res.status === 200) {
        this.sliderWorkItemInfo = {
          sliderStatus: true, // 是否展示工作项详情右侧滑窗
          projectId: info.projectId,
          type: info.type, // 工作项类型
          info: {
            id: info.id,
          },

          // 工作项信息
        }
      }

      return res
    },
    async onInit() {
      this.sprintId = this.$getUrlParams().sprintId
      this.projectId = this.$getUrlParams().projectId
      this.screenHeight = window.screen.availHeight - 195 + 'px'
      if (this.projectId && this.sprintId) {
        const status = await this.getSprintInfo()
        if (status == 200) {
          await this.getRequireTaskInfo()
        } else {
          this.getSprintInfoError = true
        }
      }
    },
    // 当前阶段 归档迭代成功
    onArchivedSuccess() {
      this.$emit('change', {
        type: OperateEnum.archived,
        sprintId: this.sprintId,
        projectId: this.projectId,
      })
    },
    // 查看延期数据
    onDelayNumberClick(t) {
      let type = t.type
      let title
      this.activeType = type
      this.pageInfo = {
        pageNumber: 1,
        pageSize: 10,
        totalRecords: 0,
      }

      if (type === 'requirement') {
        title = i18n.t('需求延期列表')
        this.getRequirementList()
      } else if (type === 'task') {
        title = i18n.t('任务延期列表')
        this.getTaskList()
      }
      this.dialogData = {
        title,
        show: true,
        width: '1200px',
      }
    },
    // 分页变化
    pageChange(pageInfo) {
      this.pageInfo = { ...pageInfo }
      if (this.activeType === 'requirement') {
        this.getRequirementList()
      } else {
        this.getTaskList()
      }
    },
    // 导出 excel
    async exportExcelSheet() {
      let url = ''
      switch (this.activeType) {
        case 'requirement':
          url = metricApi.requireExportAllFields.url
          break
        case 'task':
          url = metricApi.taskExportAllFields.url
          break
        default:
      }

      this.$fileDownLoadForGet(url, this.getFilterInfo())
    },
    getFilterInfo() {
      const type = this.activeType
      const { sprintId, projectId } = this.$route.query
      const filterInfo = {
        projectIds: [projectId],
        sprintIds: [sprintId],
        statisticsType: 1,
        startDate: '',
        endDate: '',
      }

      let obj = {}
      switch (type) {
        case 'requirement':
          obj = {
            ...filterInfo,
            statisticFlag: 1,
            sprintId,
            projectId,
            shortCut: {
              finishedDelayedRequire: true,
            },

            pageInfo: this.pageInfo,
          }

          break
        case 'task':
          obj = {
            ...filterInfo,
            statisticsType: 1,
            shortCount: {
              delayTaskCompletionCount: true,
              sprintId,
              projectId,
              pageInfo: this.pageInfo,
            },
          }

          break
      }

      return obj
    },
    metricSlide(info) {
      if (info.type === 'requirement') {
        this.checkRequirementInfo(info)
      } else {
        this.sliderWorkItemInfo = {
          sliderStatus: true, // 是否展示工作项详情右侧滑窗
          projectId: info.projectId,
          type: info.type, // 工作项类型
          info: {
            id: info.id,
          },

          // 工作项信息
        }
      }
    },
    // 获取需求列表
    async getRequirementList() {
      this.dialogLoading = true
      let result = await sprintService.delayRequire(this.getFilterInfo())
      this.dialogLoading = false
      if (result.status === 200) {
        this.delayList = result.data.result
        this.pageInfo = result.data.pageInfo
      }
    },
    // 获取任务列表
    async getTaskList() {
      this.dialogLoading = true
      let result = await sprintService.delayTask(this.getFilterInfo())
      this.dialogLoading = false
      if (result.status === 200) {
        this.delayList = result.data.results
        this.pageInfo = result.data.pageInfo
      }
    },
    onEditChange() {
      this.$emit('change', {
        type: OperateEnum.edit,
        sprintId: this.sprintId,
        projectId: this.projectId,
      })
    },
    // 任务需求点击状态时会触发
    taskRequireSuccess(obj) {
      this.showActiveStatus(obj.e, obj.info, obj.workItemId)
    },
    // 查看甘特图是否有数据，用于判断甘特图按钮是否显示
    ganttDataIsNull(ganttData) {
      if (ganttData.length > 0) {
        this.isShowGanttBtn = true
      } else {
        this.isShowGanttBtn = false
      }
    },
    updateSprintFn() {
      this.onInit()
    },
    deleteSprint() {
      this.$confirm(
        `${i18n.t('删除该迭代后')}['${this.sprintInfo.name}']，${i18n.t(
          '其所含需求/任务/缺陷的迭代属性将被置为未规划，确认删除此迭代吗？',
        )}`,
      )
        .then(() => {
          sprintService
            .defectSprint(
              {
                sprintId: this.sprintInfo.id,
                projectId: this.projectId,
              },
              { type: 'form' },
            )
            .then(res => {
              if (res.status == 200) {
                this.$emit('change', {
                  type: OperateEnum.delete,
                  sprintId: this.sprintId,
                  projectId: this.projectId,
                })

                // 清空缺陷基本信息的 session 值
                let getSession = JSON.parse(
                  sessionStorage.getItem('LASTBUGCREATE'),
                )

                if (getSession && getSession.sprintId == this.sprintInfo.id) {
                  getSession.sprintId = ''
                  sessionStorage.setItem(
                    'LASTBUGCREATE',
                    JSON.stringify(getSession),
                  )
                }
              }
              this.$message({
                message: res.msg || i18n.t('操作成功'),
                type: 'success',
              })

              // window.location.reload();
            })
        })
        .catch(() => {})
    },
    // 导出按钮
    exportSprint() {
      this.dialogVisible = true
    },
    // 确认导出
    onExportSprintSubmit() {
      // this.dialogVisible = false
      const params = {
        sprintId: this.sprintId,
      }
      // if (this.exportSprintCheckList.includes('需求')) {
      //   params.isShowRequire = 1
      // } else {
      //   params.isShowRequire = 0
      // }
      // if (this.exportSprintCheckList.includes('任务')) {
      //   params.isShowTask = 1
      // } else {
      //   params.isShowTask = 0
      // }
      // if (this.exportSprintCheckList.includes('缺陷')) {
      //   params.isShowDefect = 1
      // } else {
      //   params.isShowDefect = 0
      // }
      this.$fileDownLoadForGet(sprintApiExcelExport.url, params, {
        projectId: this.projectId,
      })
    },
    editSprint() {
      this.editSprintInfo.dialogFormTitle = i18n.t('编辑迭代')
      let params = { sprintId: this.sprintInfo.id }
      sprintService.getBaseInfo(params).then(res => {
        this.$nextTick(() => {
          this.editSprintInfo.sprintForm = res.data
          this.editSprintInfo.dialogFormVisible = true
        })
      })
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
    // 需求与任务更新过滤器
    updateFilterInfo(data) {
      this.reqTaskFilterInfo = data
      this.requireTaskPageInfo.pageNumber = 1
      this.getRequireTaskInfo()
    },
    // 缺陷更新过滤器
    updateFilterInfo2(data) {
      this.bugFilterInfo = data
      this.getDefectlist()
    },
    // 成员视图更新过滤器
    updateFilterInfo3(data) {
      this.userFilterInfo = data
      this.getUserTaskInfo()
    },
    // 发送请求 状态扭转更新缺陷信息，更新流转状态时单独的一个接口，为了解决权限问题
    requestUpdateDefectStatus() {
      // 当前tab为成员视图时
      if (this.changeStatus === '1') {
        this.getUserTaskInfo()
        //当前tab为缺陷时
      } else if (this.changeStatus === '3') {
        this.getDefectlist()
      }

      this.GlobalSelectCB && this.GlobalSelectCB()
      this.$emit('updateInfoSuccess')
    },
    //状态扭转更新缺陷信息
    async updataStausInfo(value) {
      const { workItemType } = value
      if (workItemType == null) {
        this.requestUpdateDefectStatus(value)
      } else {
        this.getUserTaskInfo()
        this.getRequireTaskInfo()
      }
    },
    // 甘特图 table 缺陷状态流转
    bugStatusChangeSprintTableGantt(obj) {
      this.showActiveStatus(obj.e, obj.info)
    },
    encodeString(str) {
      return encodeURIComponent(new StringView(str).toBase64())
    },
    //导出甘特图
    exportExcel() {
      let param = {
        ...this.reqTaskFilterInfo,
        orderList: (this.param && this.param.orderList) || [],
        sprintId: this.sprintId,
        isShowRequire: this.isShowRequire,
        isShowTask: this.isShowTask,
        isShowDefect: this.isShowDefect,
      }

      this.$fileDownLoadForGet(sprintApiExcelExport.url, param, {
        projectId: this.projectId,
      })
    },
    // 展开/关闭甘特图
    handleUnfoldGantt() {
      this.isShowGantt = !this.isShowGantt
    },
    //锁定迭代和解绑迭代的方法
    isLockSprint(id, val) {
      if (val) {
        this.unLockSprint(id)
      } else {
        this.lockSprint(id)
      }
    },
    //锁定迭代
    lockSprint(id) {
      this.$confirm(i18n.t('确定锁定该迭代吗？')).then(() => {
        sprintService
          .sprintLock(
            { sprintId: id, projectId: this.projectId },
            { type: 'form' },
          )
          .then(res => {
            if (res.msg == i18n.t('需要执行强制锁定')) {
              this.$confirm(
                i18n.t(
                  '迭代每个阶段的计划日期尚没有完全确定，是否强制锁定迭代?',
                ),
                i18n.t('提示'),
                {
                  confirmButtonText: i18n.t('确定'),
                  cancelButtonText: i18n.t('取消'),
                  type: 'warning',
                },
              ).then(() => {
                this.forceLockSpring(id)
              })
            } else {
              this.$emit('change', {
                type: OperateEnum.lock,
                sprintId: this.sprintId,
                projectId: this.projectId,
              })
              this.$message({
                message: res.msg || i18n.t('操作成功'),
                type: 'success',
              })
              this.getSprintInfo()
            }
          })
          .catch(() => {})
      })
    },
    //解锁迭代
    unLockSprint(id) {
      this.$confirm(i18n.t('确定解锁该迭代吗？'))
        .then(() => {
          sprintService
            .sprintUnlock(
              { sprintId: id, projectId: this.projectId },
              { type: 'form' },
            )
            .then(res => {
              if (res.status === 200) {
                this.$emit('change', {
                  type: OperateEnum.unLock,
                  sprintId: this.sprintId,
                  projectId: this.projectId,
                })
                this.$message({
                  message: res.msg || i18n.t('操作成功'),
                  type: 'success',
                })
                this.getSprintInfo()
              } else {
                // this.$message({ message: res.msg || "操作失败", type: "error" });
              }
            })
        })
        .catch(() => {})
    },
    //强制锁定
    forceLockSpring(id) {
      sprintService
        .sprintForceLock(
          { sprintId: id, projectId: this.projectId },
          { type: 'form' },
        )
        .then(res => {
          if (res.status === 200) {
            this.$emit('change', {
              type: OperateEnum.forceLock,
              sprintId: this.sprintId,
              projectId: this.projectId,
            })
            this.$message({
              message: res.msg || i18n.t('操作成功'),
              type: 'success',
            })
            this.getSprintInfo()
          } else {
            // this.$message({ message: res.msg || "操作失败", type: "error" });
          }
        })
    },
    // 更新缺陷 - 状态变化 - 添加二级状态及评论
    bugStatusClickCallback(info, cb) {
      // 如果不需要评论
      if (!info.toComment && (!info.children || info.children.length === 0)) {
        this.GlobalBugUpdate({
          [info.updateName]: info.key,
          cb: this.getDefectlist,
        })

        cb(true)
      } else {
        // 如果需要评论，只要 toComment 为 true ，或者 children.length > 0
        this.CommentForStatusInfo = {
          isShow: true,
          statusInfo: { ...info },
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
    bugStatusClickCallbackOnOk(value, cb) {
      this.CommentForStatusInfo.isShow = false
      let comment = value.comment.trim()
      if (value.statu !== null) {
        if (comment.length > 0) {
          this.GlobalBugUpdate({
            statusId: value.statu,
            comment,
            cb: this.getDefectlist,
          })
        } else {
          this.GlobalBugUpdate({
            statusId: value.statu,
            cb: this.getDefectlist,
          })
        }
      } else if (comment.length > 0) {
        this.GlobalBugUpdate({
          comment,
          statusId: value.statusId,
          cb: this.getDefectlist,
        })
      }
      cb(true)
    },
    // 更新缺陷 - 状态变化 - 添加二级状态及评论 - modal 点击取消
    bugStatusClickCallbackOnCancel(cb) {
      this.CommentForStatusInfo.isShow = false
      cb(true)
    },
    // 全局更新缺陷 - 迭代 - add by heyunjiang on 2019.5.7
    GlobalSelectTargetClickForBug(info, e, type) {
      info = { ...info, workItemType: 3 }
      this.GlobalSelectTargetClick(info, e, type, this.getDefectlist)
    },
    // 排序变化 - add by heyunjiang on 2019.5.7
    sortaChangeCallBack(obj = {}) {
      let func = this.getRequireTaskInfo,
        param = {
          column: obj.prop,
          order: obj.order === 'descending' ? 'DESC' : 'ASC',
        }

      switch (this.changeStatus) {
        case '0':
          func = this.getRequireTaskInfo
          param = { orderList: [param] }
          break
        case '1':
          func = this.getUserTaskInfo
          param = { orderList: [param] }
          break
        case '3':
          func = this.getDefectlist
          param = { orderBy: [param] }
          break
      }

      if (!obj.prop) {
        param = {}
      }
      this.lastSortOrders[this.changeStatus] = param
      this.param = param
      func(param)
    },
    //查看任务
    async seeTaskHandle(data, e, num) {
      this.currentTableSelectId = data.id

      this.workItemId = data.id
      if (data.workItemType == 2) {
        this.workType = 1
      } else if (data.workItemType == 3 || num == 1) {
        this.workType = 2
        this.bugProjectId = data.projectId
      } else {
        this.workType = 3
      }
      // 如果为引导情况，避免弹窗内监听不到show的变化
      if (this.$store.state.guide.guideType === guideType.sprint) {
        await setTimeout(() => {}, 50)
      }

      this.$nextTick(() => {
        this.loading = true
        setTimeout(() => {
          this.loading = false
        }, 500)
      })

      // let projectId = this.$getUrlParams().projectId
      // this.goToNewWindowPage(this, "taskEdit", { taskId: data.id, projectId })

      if (this.count === 0) {
        this.preID = data.id
        this.show = !this.show
        this.taskId = data.id
        this.activeBugInfo = { id: data.id }
        this.restore = Math.random() * 10
        this.count++
      } else {
        if (this.preID != data.id) {
          this.preID = data.id

          this.activeBugInfo = { id: data.id }
          // this.show = !this.show;
          this.taskId = data.id
          this.restore = Math.random() * 10
        } else {
          this.restore = Math.random() * 10
          this.preID = data.id
          this.activeBugInfo = { id: data.id }
          this.count = 0
          this.show = !this.show
          this.taskId = data.id
        }
      }
    },
    HandleSide() {
      if (this.show) {
        this.show = false
        this.count = 0
        this.restore = Math.random() * 10
        // this.$refs.side.style.right = -51 + '%';
      }
      // this.taskId = -1; // 清除保存的需求 id，保证再次点击相同的需求，可以更新数据 add by heyunjiang on 2019.8.1
      // this.bugProjectId = -1; // 清除保存的需求 id，保证再次点击相同的需求，可以更新数据 add by heyunjiang on 2019.8.1
    },
    sliderClose() {
      this.sliderWorkItemInfo = {
        sliderStatus: false, // 是否展示工作项详情右侧滑窗
        projectId: null,
        type: '', // 工作项类型
        info: {
          id: null,
        },

        // 工作项信息
      }
    },
    selectChange(checkedList) {
      this.workItemTypeReqTask.req = checkedList.includes(this.$t('需求'))
      this.workItemTypeReqTask.task = checkedList.includes(this.$t('任务'))
      this.workItemTypeReqTask.bug = checkedList.includes(this.$t('缺陷'))
      this.isShowRequire = this.workItemTypeReqTask.req ? 1 : 0
      this.isShowTask = this.workItemTypeReqTask.task ? 1 : 0
      this.isShowDefect = this.workItemTypeReqTask.bug ? 1 : 0

      if (!this.workItemTypeReqTask.req) {
        this.reqTaskFilterInfo.reqtStatusIds = []
      }
      if (!this.workItemTypeReqTask.task) {
        this.reqTaskFilterInfo.taskStatusIds = []
      }

      this.requireTaskPageInfo.pageNumber = 1
      this.getRequireTaskInfo()
    },
    userSelectChange(checkedList) {
      this.userIsShowRequire = 0
      this.userIsShowTask = 0
      this.userIsShowDefect = 0
      checkedList.forEach(checked => {
        if (checked == i18n.t('需求')) {
          this.userIsShowRequire = 1
        } else if (checked == i18n.t('任务')) {
          this.userIsShowTask = 1
        } else if (checked == i18n.t('缺陷')) {
          this.userIsShowDefect = 1
        }
      })

      this.getUserTaskInfo()
    },
    async getSprintInfo() {
      let params = {
        sprintId: this.sprintId,
      }

      let status
      await sprintService.getInfo(params).then(res => {
        this.sprintInfo = res.data
        status = res.status
      })
      // 详情加载完成后 显示菜单操作
      this.showDetailMenu = true
      return status
    },
    getDefectlist(obj = this.lastSortOrders[this.changeStatus] || {}) {
      let params = {
        sprintId: this.sprintId,
        projectId: this.projectId,
        ...obj,
        statusIds: this.bugFilterInfo.defectStatusIds,
        priorities: this.bugFilterInfo.priorities,
        assignUsers: this.bugFilterInfo.assignUsers,
        title: this.bugFilterInfo.title,
      }

      sprintService
        .defectInfoParam({
          ...params,
          pageInfo: {
            pageNumber: this.defectPageInfo.pageNumber,
            pageSize: this.defectPageInfo.pageSize,
          },
        })
        .then(res => {
          this.defectData = res.data?.results
          // 保持选中状态
          if (this.currentTableSelectId) {
            const currentItem = this.defectData.find(
              item => item.id == this.currentTableSelectId,
            )

            this.$nextTick(() => {
              this.$refs.requireMultipleBug.setCurrentRow(currentItem)
            })
          }
          this.defectPageInfo = {
            ...this.defectPageInfo,
            pageNumber: res.data.pageInfo?.pageNumber,
            totalCount: res.data.pageInfo?.totalRecords,
          }
        })
      this.getSprintInfo()
    },
    // 缺陷每页数据改变
    defectPageSizeChange(size) {
      this.defectPageInfo = {
        ...this.defectPageInfo,
        pageSize: size,
        pageNumber: 1,
      }
      this.getDefectlist()
    },
    // 缺陷页码改变
    defectPageChange(page) {
      this.defectPageInfo.pageNumber = page
      this.$refs.requireMultipleBug.bodyWrapper.scrollTop = 0
      this.getDefectlist()
    },
    async getRequireTaskInfo(
      obj = this.lastSortOrders[this.changeStatus] || {
        orderList: [
          {
            column: 'assignUser',
            order: 'DESC',
          },
        ],
      },
    ) {
      let params = {
        sprintId: this.sprintId,
        isShowRequire: this.isShowRequire,
        isShowTask: this.isShowTask,
        isShowDefect: this.isShowDefect,
        ...obj,
        ...this.reqTaskFilterInfo,
        title: this.searchInputValue,
      }

      this.treetableLoading = true
      await sprintService.taskInfo(params).then(res => {
        // $http.get($http.api.sprint.task_info, params).then(res => {
        this.sprintDetailLoading = true
        this.treetableLoading = false
        if (!res.data) {
          return
        }

        this.requireTaskData = res.data.tree
        this.workItemCounts.taskCount = 0
        this.workItemCounts.requireCount = 0
        this.workItemCounts.bugCount = 0
        this.requireTaskCount(this.requireTaskData)
        this.dateList = res.data.dateList
        this.showGanttRequireTaskData = this.requireTaskData.length !== 0
        this.requireTaskPageInfo = {
          ...this.requireTaskPageInfo,
          totalCount: this.requireTaskData.length,
        }
        let start =
          (this.requireTaskPageInfo.pageNumber - 1) *
          this.requireTaskPageInfo.pageSize
        if (
          this.requireTaskData.length <= start &&
          this.requireTaskPageInfo.pageNumber > 1
        ) {
          this.requireTaskPageInfo.pageNumber -= 1
          start =
            (this.requireTaskPageInfo.pageNumber - 1) *
            this.requireTaskPageInfo.pageSize
        }
        const end = start + this.requireTaskPageInfo.pageSize
        this.pageRequireTaskData = this.requireTaskData.slice(start, end)
        this.$nextTick(() => {
          // 设置高亮
          this.$refs.sprintTableGantt?.localSetCurrentRow(
            this.currentTableSelectId,
          )
          this.initGuide()
        })
      })
      this.getSprintInfo()
    },
    requireTaskCount(data) {
      data.forEach(data => {
        if (data.data.workItemType === 2) {
          ++this.workItemCounts.taskCount
        } else if (data.data.workItemType === 3) {
          ++this.workItemCounts.bugCount
        } else if (+data.data.sprintId === +this.sprintId) {
          ++this.workItemCounts.requireCount
        }

        if (data.children) {
          this.requireTaskCount(data.children)
        }
      })
    },
    // 需求与任务的每页个数改变时
    requireTaskPageSizeChange(size) {
      this.requireTaskPageInfo = {
        ...this.requireTaskPageInfo,
        pageNumber: 1,
        pageSize: size,
      }
      this.pageRequireTaskData = this.requireTaskData.slice(
        0,
        this.requireTaskPageInfo.pageSize,
      )
    },
    // 需求与任务改变页码
    requireTaskPageChange(page) {
      this.requireTaskPageInfo.pageNumber = page
      const start =
        (this.requireTaskPageInfo.pageNumber - 1) *
        this.requireTaskPageInfo.pageSize
      const end = start + this.requireTaskPageInfo.pageSize
      this.pageRequireTaskData = this.requireTaskData.slice(start, end)
      document.querySelector(
        '.require-task-table .el-table__body-wrapper',
      ).scrollTop = 0
    },
    getUserTaskInfo(obj = this.lastSortOrders[this.changeStatus] || {}) {
      let params = {
        sprintId: this.sprintId,
        isShowRequire: this.userIsShowRequire,
        isShowTask: this.userIsShowTask,
        isShowDefect: this.userIsShowDefect,
        ...obj,
        ...this.userFilterInfo,
        title: this.searchUserInputValue,
      }

      this.userTaskDataLoading = true
      sprintService.userTask(params).then(res => {
        this.userTaskDataLoading = false
        this.userTaskData = res.data
        if (this.userFilterInfo.title) {
          let userTaskData = []
          res.data.forEach(item => {
            if (item.dataList.length > 0) {
              userTaskData.push(item)
            }
          })
          this.userTaskData =
            userTaskData.length === 0 ? res.data : userTaskData
        }
        if (
          this.userFilterInfo.assignUsers &&
          this.userFilterInfo.assignUsers.length > 0
        ) {
          let userTaskData = []
          for (
            let index = 0;
            index < this.userFilterInfo.assignUsers.length;
            index++
          ) {
            const element = this.userFilterInfo.assignUsers[index]
            this.userTaskData.forEach(item => {
              if (item.userId === element) {
                userTaskData.push(item)
              }
            })
          }
          this.userTaskData = userTaskData
        }
      })
      this.getSprintInfo()
    },
    getStatusDistributeInfo() {
      let params = {
        projectId: this.projectId,
        sprintId: this.sprintId,
      }

      sprintService.getStatusDistribute(params).then(res => {
        const {
          reqXAxis,
          reqYAxis,
          taskXAxis,
          taskYAxis,
          defectXAxis,
          defectY1Axis,
          defectY2Axis,
          defectY3Axis,
        } = res.data
        const {
          requireStatusDistributeChartData,
          bugTrendChartData,
          taskStatusDistributeChartData,
        } = this
        requireStatusDistributeChartData.reqXAxis = reqXAxis
        requireStatusDistributeChartData.reqYAxis = reqYAxis

        taskStatusDistributeChartData.taskXAxis = taskXAxis
        taskStatusDistributeChartData.taskYAxis = taskYAxis

        bugTrendChartData.bugXAxis = defectXAxis
        bugTrendChartData.bugY1Axis = defectY1Axis
        bugTrendChartData.bugY2Axis = defectY2Axis.map(i => -i)
        bugTrendChartData.bugY3Axis = defectY3Axis

        this.drawRequieStatusChart()
        this.drawTaskStatusChart()
        this.drawBugTrendChart()
      })
    },
    getBurnDownInfo() {
      let params = {
        projectId: this.projectId,
        sprintId: this.sprintId,
      }

      sprintService.getBurnDown(params).then(res => {
        const {
          xaxis,
          reqY1Axis,
          reqY2Axis,
          taskY1Axis,
          taskY2Axis,
          taskNumY1Axis,
          taskNumY2Axis,
        } = res.data
        const {
          taskHourBurnDownChartData,
          taskNumBurnDownChartData,
          reqNumBurnDownChartData,
        } = this
        taskHourBurnDownChartData.xAxis = xaxis
        taskNumBurnDownChartData.xAxis = xaxis
        reqNumBurnDownChartData.xAxis = xaxis
        reqNumBurnDownChartData.reqY1Axis = reqY1Axis
        reqNumBurnDownChartData.reqY2Axis = reqY2Axis
        taskHourBurnDownChartData.taskY1Axis = taskY1Axis
        taskHourBurnDownChartData.taskY2Axis = taskY2Axis
        taskNumBurnDownChartData.taskNumY1Axis = taskNumY1Axis
        taskNumBurnDownChartData.taskNumY2Axis = taskNumY2Axis

        this.drawBurnDownChart()
      })
    },
    async stopSprint() {
      let results = await sprintService.sprintHasUnfinishedItem({
        projectId: this.$getUrlParams().projectId,
        sprintId: this.sprintId,
      })

      if (results.status === 200 && results.data === true) {
        this.sprintdialogVisible = true
      } else {
        this.$confirm(
          `${i18n.t('归档迭代')}[${this.sprintInfo.name}]${i18n.t(
            '后',
          )}，${i18n.t(
            '其所含需求/任务将默认不在列表展示，但能过滤搜索出来，确认归档此迭代吗？',
          )}`,
          {
            confirmButtonText: i18n.t('确定'),
            cancelButtonText: i18n.t('取消'),
            type: 'warning',
          },
        )
          .then(() => {
            sprintService
              .stopSprint(
                {
                  sprintId: this.sprintId,
                  projectId: this.projectId,
                },

                { type: 'form' },
              )
              .then(res => {
                if (res.status !== 200) return
                this.$emit('change', {
                  type: OperateEnum.archived,
                  sprintId: this.sprintId,
                  projectId: this.projectId,
                })

                this.$message({
                  message: res.msg || i18n.t('操作成功'),
                  type: 'success',
                })
                this.reload()
              })
          })
          .catch(() => {})
      }
    },
    async rollbackArchived() {
      try {
        await this.$confirm(
          `${i18n.t('确认取消归档迭代')}[${this.sprintInfo.name}]？`,
          {
            confirmButtonText: i18n.t('确定'),
            cancelButtonText: i18n.t('取消'),
            type: 'warning',
          },
        )

        const { status } = await sprintService.rollbackSprint({
          sprintId: this.sprintId,
        })

        if (status === 200) {
          this.$message({ message: i18n.t('操作成功'), type: 'success' })
          this.$emit('change', {
            type: 'rollback',
            sprintId: this.sprintId,
            projectId: this.projectId,
          })
          this.reload()
        }
      } catch (e) {
        console.warn(e.message)
      }
    },
    cancelStopSprint() {
      this.sprintchecked = false
      this.sprintdialogVisible = false
    },
    async successStopSprint() {
      let results = await sprintService.stopSprint(
        {
          projectId: this.$getUrlParams().projectId,
          sprintId: this.sprintId,
          removeUnfinished: this.sprintchecked,
        },

        { type: 'form' },
      )

      this.sprintchecked = false
      this.sprintdialogVisible = false
      if (results.status === 200) {
        this.$emit('change', {
          type: OperateEnum.archived,
          sprintId: this.sprintId,
          projectId: this.projectId,
        })

        this.$message({
          message: results.msg || i18n.t('操作成功'),
          type: 'success',
        })
        this.reload()
      }
    },
    planSprint() {
      let query = {
        projectId: this.$getUrlParams().projectId,
        sprintId: this.sprintId,
      }
      if (this.$getUrlParams().guideType) {
        query.guideType = this.$getUrlParams().guideType
      }
      this.$goToPage(this, 'sprintPlan', query)
    },
    changHandleTask({ name } = {}) {
      name && this.countlyHandle(name)
      if (this.changeStatus == '0') {
        this.getRequireTaskInfo()
      } else if (this.changeStatus == '1') {
        this.getUserTaskInfo()
      } else if (this.changeStatus == '2') {
        this.getStatusDistributeInfo()
        this.getBurnDownInfo()
      } else if (this.changeStatus == '3') {
        this.getDefectlist()
      }
    },
    //埋点处理
    countlyHandle(name) {
      this.countlyLog(`project_sprintDetail_${nameMap[name]}`)
    },
    drawBurnDownChart() {
      let taskHourBurnDownChart = echarts.init(
        document.getElementById('taskHourBurnDownChart'),
      )

      taskHourBurnDownChart.setOption({
        title: {
          text: i18n.t('任务工时燃尽图'),
          left: 'center',
        },

        tooltip: {
          trigger: 'axis',
          formatter: '{a} <br/>{b} : {c}',
        },

        xAxis: {
          type: 'category',
          // name: 'x',
          boundaryGap: false,
          splitLine: { show: false },
          data: this.taskHourBurnDownChartData.xAxis,
        },

        yAxis: {},
        legend: {
          left: 'center',
          top: '30',
          data: [i18n.t('未完成任务工时'), i18n.t('任务工时基准线')],
          type: 'scroll',
        },

        series: [
          {
            name: i18n.t('未完成任务工时'),
            type: 'line',
            itemStyle: {
              normal: {
                areaStyle: { type: 'default' },
                color: 'rgba(144,197,237,0.8)',
              },
            },

            data: this.taskHourBurnDownChartData.taskY1Axis,
          },

          {
            name: i18n.t('任务工时基准线'),
            type: 'line',
            lineStyle: {
              color: 'gray',
            },

            itemStyle: {
              normal: { label: { show: false } },
            },

            data: this.taskHourBurnDownChartData.taskY2Axis,
          },
        ],
      })

      let taskNumBurnDownChart = echarts.init(
        document.getElementById('taskNumBurnDownChart'),
      )

      taskNumBurnDownChart.setOption({
        title: {
          text: i18n.t('任务数量燃尽图'),
          left: 'center',
        },

        tooltip: {
          trigger: 'axis',
          //formatter: "{a} <br/>{b} : {c}"
        },
        xAxis: {
          type: 'category',
          // name: 'x',
          boundaryGap: false,
          splitLine: { show: false },
          data: this.taskNumBurnDownChartData.xAxis,
        },

        yAxis: {},
        legend: {
          left: 'center',
          top: '30',
          data: [i18n.t('未完成任务数量'), i18n.t('任务数量基准线')],
          type: 'scroll',
        },

        series: [
          {
            name: i18n.t('未完成任务数量'),
            type: 'line',
            itemStyle: {
              normal: {
                areaStyle: { type: 'default' },
                color: 'rgba(144,197,237,0.8)',
              },
            },

            data: this.taskNumBurnDownChartData.taskNumY1Axis,
          },

          {
            name: i18n.t('任务数量基准线'),
            type: 'line',
            lineStyle: {
              color: 'gray',
            },

            itemStyle: {
              normal: { label: { show: false } },
            },

            data: this.taskNumBurnDownChartData.taskNumY2Axis,
          },
        ],
      })

      let reqNumBurnDownChart = echarts.init(
        document.getElementById('reqNumBurnDownChart'),
      )

      reqNumBurnDownChart.setOption({
        title: {
          text: i18n.t('需求数量燃尽图'),
          left: 'center',
        },

        tooltip: {
          trigger: 'axis',
          formatter: '{a} <br/>{b} : {c}',
        },

        xAxis: {
          type: 'category',
          // name: 'x',
          boundaryGap: false,
          splitLine: { show: false },
          data: this.reqNumBurnDownChartData.xAxis,
        },

        yAxis: {},
        legend: {
          left: 'center',
          top: '30',
          data: [i18n.t('未完成需求数量'), i18n.t('需求数量基准线')],
          type: 'scroll',
        },

        series: [
          {
            name: i18n.t('未完成需求数量'),
            type: 'line',
            data: this.reqNumBurnDownChartData.reqY1Axis,
            itemStyle: {
              normal: {
                areaStyle: { type: 'default' },
                color: 'rgba(144,197,237,0.8)',
              },
            },
          },

          {
            name: i18n.t('需求数量基准线'),
            type: 'line',
            lineStyle: {
              color: 'gray',
            },

            itemStyle: {
              normal: { label: { show: false } },
            },

            data: this.reqNumBurnDownChartData.reqY2Axis,
          },
        ],
      })
    },
    drawRequieStatusChart() {
      // 基于准备好的dom，初始化echarts实例
      let requieStatusChart = echarts.init(
        document.getElementById('requieStatusChart'),
      )

      // 绘制图表
      requieStatusChart.setOption({
        color: ['#3398DB'],
        title: {
          text: i18n.t('需求状态分布图'),
          left: 'center',
        },

        legend: {
          left: 'center',
          top: '30',
          data: [i18n.t('需求')],
          type: 'scroll',
        },

        tooltip: {},
        xAxis: {
          data: this.requireStatusDistributeChartData.reqXAxis,
          axisLabel: {
            showMaxLabel: true,
            rotate: 40,
            interval: 0,
          },
        },

        yAxis: {},
        series: [
          {
            //name: '需求',
            type: 'bar',
            barMaxWidth: 34,
            data: this.requireStatusDistributeChartData.reqYAxis,
            label: {
              normal: {
                show: false,
                position: 'inside',
              },
            },
          },
        ],
      })
    },
    drawTaskStatusChart() {
      // 基于准备好的dom，初始化echarts实例
      let taskStatusChart = echarts.init(
        document.getElementById('taskStatusChart'),
      )

      // 绘制图表
      taskStatusChart.setOption({
        color: ['#3398DB'],
        title: {
          text: i18n.t('任务状态分布图'),
          left: 'center',
        },

        legend: {
          left: 'center',
          top: '30',
          data: [i18n.t('任务')],
          type: 'scroll',
        },

        tooltip: {},
        xAxis: {
          data: this.taskStatusDistributeChartData.taskXAxis,
          axisLabel: {
            showMaxLabel: true,
            rotate: 40,
            interval: 0,
          },
        },

        yAxis: {},
        series: [
          {
            //name: '任务',
            type: 'bar',
            barMaxWidth: 34,
            data: this.taskStatusDistributeChartData.taskYAxis,
            label: {
              normal: {
                show: false,
                position: 'inside',
              },
            },
          },
        ],
      })
    },
    drawBugTrendChart() {
      // 基于准备好的dom，初始化echarts实例
      let bugTrendChart = echarts.init(document.getElementById('bugTrendChart'))

      // 绘制图表
      bugTrendChart.setOption({
        color: ['#3398DB'],
        title: {
          text: i18n.t('缺陷趋势图'),
          left: 'center',
        },

        legend: {
          left: 'center',
          top: '30',
          data: [
            i18n.t('新建缺陷数'),
            i18n.t('关闭缺陷数'),
            i18n.t('存量缺陷数'),
          ],
          type: 'scroll',
        },

        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            crossStyle: {
              color: '#999',
            },
          },

          formatter: function(datas) {
            let res = datas[0].name + '<br/>'
            for (let i = 0, length = datas.length; i < length; i++) {
              res +=
                datas[i].marker +
                datas[i].seriesName +
                '：' +
                Math.abs(datas[i].value) +
                '<br/>'
            }
            return res
          },
        },

        xAxis: {
          type: 'category',
          boundaryGap: false,
          splitLine: { show: false },
          data: this.bugTrendChartData.bugXAxis,
        },

        yAxis: {
          minInterval: 1,
        },

        series: [
          {
            name: i18n.t('新建缺陷数'),
            type: 'bar',
            barMaxWidth: 20,
            data: this.bugTrendChartData.bugY1Axis,
            stack: 'all',
            color: '#ed4f60',
          },

          {
            name: i18n.t('关闭缺陷数'),
            type: 'bar',
            barMaxWidth: 20,
            data: this.bugTrendChartData.bugY2Axis,
            stack: 'all',
            color: '#06a025',
          },

          {
            name: i18n.t('存量缺陷数'),
            type: 'line',
            smooth: true,
            data: this.bugTrendChartData.bugY3Axis,
            color: '#ff874d',
          },
        ],
      })
    },
  },
}
</script>
<style lang="scss" scoped>
@import './sprint';

.dateTips {
  color: #fff;
  /*border-radius: 8px;*/
  /*padding: 1px 4px;*/
  /*font-size: 12px;*/
  background: #fce8ea;
  padding: 4px 11px;
  border: 1px solid #ea3447;
  border-radius: 4px;
  font-family: MicrosoftYaHei;
  font-size: 12px;
  color: #ea3447;
}
.header-right {
  display: flex;
  align-items: center;

  .count-container {
    display: flex;
    align-items: center;

    .count {
      margin-right: 8px;
    }
  }

  button {
    margin-bottom: 0 !important;
  }
}
.member-parent {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 32px;
}
.member-table__content {
  min-width: 1024px;
}
.dateTipsred {
  /*color: #fff;*/
  /*border-radius: 8px;*/
  /*padding: 1px 4px;*/
  /*font-size: 12px;*/
  /*background: #fa0b00;*/
  background: #fce8ea;
  padding: 4px 11px;
  border: 1px solid #ea3447;
  border-radius: 4px;
  font-family: MicrosoftYaHei;
  font-size: 12px;
  color: #ea3447;
}

.sprint-finish-check {
  margin-top: 20px;
  margin-left: 50px;
}
.clearfloat::after {
  content: '.';
  clear: both;
  display: block;
  overflow: hidden;
  font-size: 0;
  height: 0;
}
.message-tips {
  display: flex;
  align-items: center;
  .el-icon-warning {
    color: #e6a23c;
    font-size: 24px;
  }
  .content {
    margin-left: 20px;
  }
}

.clearfloat {
  zoom: 1;
  .btn-span {
    display: inline-block;
    width: 80px;
    height: 20px;
    line-height: 20px;
    vertical-align: middle;
    border-right: 1px solid #e5e5e5;
    cursor: pointer;
    text-align: center;
    font-family: MicrosoftYaHei;
    font-size: 14px;
    color: #666666;
    &:hover {
      color: $--color-primary;
    }
    .iconfont {
      margin-right: 5px;
      font-size: 14px;
    }
  }
  .more-dropdown {
    margin-left: 13px;
  }
}
.el-dropdown-menu {
  /*padding: 0px !important;*/
}
.el-dropdown-menu .el-dropdown-menu__item {
  font-size: 14px;
  /*padding: 10px 24px;*/
}
.sprint-detail {
  height: 100%;
  .review-center {
    height: 100%;
    display: flex;
    flex-direction: column;
    .footer-tab {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      /deep/ .el-tabs__content {
        flex: 1;
        overflow: hidden;
        .el-tab-pane {
          height: 100%;
          overflow: hidden;
          .sprint-log {
            height: 100%;
            overflow-y: auto;
          }
          .sprint-work-project {
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            .sprint-work-header {
              display: flex;
              .export-btn-box {
                position: absolute;
                height: 20px;
                right: 0;
                top: 5px;
                vertical-align: top;
                border-left: 1px solid #e5e5e5;
                padding-left: 16px;
                cursor: pointer;
                &:hover {
                  color: $--color-primary;
                }
              }
              .unfold-gantt {
                position: absolute;
                height: 20px;
                right: 151px;
                top: 5px;
                vertical-align: top;
                border-right: 1px solid #e5e5e5;
                padding-right: 16px;
                cursor: pointer;
              }
            }
            .requirement-table {
              flex: 1;
              overflow: hidden;
              .treetable {
                height: calc(100% - 36px);
              }
              .flex-right {
                /*padding: 8px 0;*/
                height: 32px;
              }
            }
          }
        }
      }
    }
  }
}

.sprint-detail-scroll {
  height: 100%;
  padding: 16px;
  background: #fff;
  box-sizing: border-box;
  @include scroll;
}

.requirement-table {
  //height: 610px;
}

.member-table__data {
  height: 610px;
}

.member-table {
  height: auto;
  min-width: 1400px;
  overflow: auto;
}

.code-statistics,
.progress-speed,
.sprint-log {
  /*height: 658px;*/
  //height: 780px;
}

.bug-table {
  /*height: 610px;*/
  height: 780px;
  /deep/ .el-table__body-wrapper {
    max-height: 605px !important;
    overflow-y: auto;
  }
}

.test-plan-table {
  height: 663px;
  /deep/ .el-table__body-wrapper {
    max-height: 605px !important;
  }
}
.sprint-detail-table-scroll {
  //overflow-y: auto;
}

.footer-tab {
  /*margin-top: 20px;*/
  margin-top: 0px;
  //min-height: 455px;
}

.circle-user {
  width: 50px;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 100%;
}

.f13 {
  font-size: 13px;
}

.f14 {
  font-size: 14px;
}

.f15 {
  font-size: 15px;
}

.sprint-title {
  display: flex;
  line-height: 28px;
  padding-right: 20px;
}

.control {
  margin-top: 20px;
}

.sprint-list-scroll {
  max-height: 660px;
  overflow-y: auto;
}

.user-name {
  font-size: 14px;
  font-family: MicrosoftYaHei;
  margin-bottom: 16px;
}

.font-desgin {
  display: inline-block;
  max-width: 460px;
  /*width: calc(100% - 450px);*/
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /*font-weight: 700;*/
  line-height: 28px;
  font-family: MicrosoftYaHei;
  font-size: 16px;
  color: #292f3a;
  cursor: pointer;
}

.ml30 {
  margin-left: 24px;
  font-size: 14px;
  margin-right: 0;
}

.ml77 {
  margin-left: 77px;
}

.dialog {
  width: 600px;
  height: 300px;
}

.ml15 {
  margin-left: 15px;
}

/*.ml30 {*/
/*  margin-left: 30px;*/
/*}*/

.requirement-table /deep/ .el-table__body-wrapper {
  overflow: auto !important;
}
/deep/ .el-table-active {
  background-color: rgba(241, 245, 248, 0.7) !important;
}
.sprint-expansion-fold-wrap {
  border-top: 1px solid #e4e7ed;
  position: relative;
  .expansion-fold-btn {
    position: absolute;
    top: 0;
    left: 50%;
    margin-left: -25px;
  }
}
.status_name {
  display: inline-block;
  vertical-align: middle;
  border-radius: 4px;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-sizing: border-box;
  color: #fff;
}
.sprint-require-task-checkbox {
  margin-bottom: 10px;
}
/deep/ .export-sprint-dialog {
  font-family: PingFangSC-Regular;
  border-radius: 8px;
  .el-dialog__header {
    border-bottom: 1px solid #dcdfe6;
    padding-bottom: 16px;
    font-size: 16px;
    .el-dialog__title {
      color: #333333;
    }
  }
  .el-dialog__body {
    font-size: 14px;
    color: #333333;
    padding-bottom: 24px;
    .select-title {
      margin-bottom: 10px;
    }
    .el-checkbox {
      margin-left: 0;
      margin-right: 41px;
    }
  }
}
/deep/ .el-input__inner {
  border-radius: 4px;
}
</style>
<style>
.el-message-box {
  border-radius: 8px !important;
}
</style>
