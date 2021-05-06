<template>
  <div id="demand" class="content-outer-box">
    <div class="go-back-box">
      <span @click="goBack">
        <i class="co-icon-arrow-left" style="margin-right: 9.6px;" />返回
      </span>
    </div>
    <slide
      ref="side"
      v-loading="loading"
      :show="show"
      :after-close="HandleSide"
      :element-loading-text="$t('拼命加载中')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgb(255,255,255)"
      @click.stop
    >
      <div slot="task" class="silder-box">
        <!-- <task-edit :taskId="taskId" :show="show" :restore="restore" v-on:HandleSide="HandleSide" v-if="workType===1">
        </task-edit>
        <bug-detail :detailType="detailType" :projectId="bugProjectId" :activeBugInfo="activeBugInfo"  @detailClose="HandleSide" :isSlider="true"
          v-else-if="workType===2" ></bug-detail>
          <demand-view  :requireId="taskId" :show="show" :restore="restore" v-on:HandleSide="HandleSide" v-else-if="workType===3"></demand-view> -->
        <BugDetail
          v-if="workType === 2"
          ref="bug"
          :work-item-id="activeBugInfo.id"
          :project-id="bugProjectId"
          :show="show"
          @HandleSide="HandleSide"
          @updateInfoSuccess="HandleSide"
          @deleteSuccess="HandleSide"
        ></BugDetail>
        <TaskDetail
          v-if="workType === 1"
          ref="task"
          :project-id="bugProjectId"
          :work-item-id="taskId"
          :show="show"
          @HandleSide="HandleSide"
          @updateInfoSuccess="HandleSide"
          @deleteSuccess="HandleSide"
        ></TaskDetail>
        <RequirementDetail
          v-if="workType === 3"
          ref="requrire"
          :project-id="bugProjectId"
          :work-item-id="taskId"
          :show="show"
          @HandleSide="HandleSide"
          @updateInfoSuccess="HandleSide"
          @deleteSuccess="HandleSide"
        ></RequirementDetail>
      </div>
    </slide>
    <div class="x-arD">
      <div
        v-loading="treetableLoading"
        class="review-treetable-all sprintPlan-treetable-loading "
        :element-loading-text="$t('拼命加载中')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgb(255,255,255)"
      >
        <span class="plan-table-title">规划迭代</span>
        <el-form :inline="true" :model="formInline" style="text-align: right;">
          <el-form-item class="mb10">
            <el-input
              v-model="formInline.title"
              clearable
              prefix-icon="co-icon-search"
              placeholder="请输入标题,按enter键搜索"
              class="title-input"
              style="width:176px;border-radius: 4px;"
              @keyup.enter.native="searchRequireTaskInfo"
            ></el-input>
          </el-form-item>
          <el-form-item ref="firstStep" class="mb10" style="margin-right: 0">
            <el-select
              v-model="formInline.sprintId"
              style="width: 100px"
              @change="searchRequireTaskInfo"
            >
              <el-option :label="$t('未规划')" value="0"></el-option>
              <el-option
                v-for="item in sprintNameList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!--          <el-form-item>-->
          <!--            <el-button @click="searchRequireTaskInfo">{{-->
          <!--              $t('过滤')-->
          <!--            }}</el-button>-->
          <!--          </el-form-item>-->
          <!--          <el-form-item>-->
          <!--            <el-button type="primary" @click="returnBnt">{{-->
          <!--              $t('返回')-->
          <!--            }}</el-button>-->
          <!--          </el-form-item>-->
        </el-form>
        <div class="table-box">
          <tree-table
            ref="myTree"
            :data="currentPageData"
            :eval-args="args"
            :expand-all="expandAll"
            :show-check-box="showSearchCheckBox"
            style="width: 100%;margin-left: 0;"
            :ltype="2"
            :update-global-title="updateGlobalTitle"
            :sorta-change-call-back="sortaChangeCallBackSearch"
            :selectable="selectable"
            @seeTaskHandle="seeTaskHandle"
            @HandleSide="HandleSide"
            @setMultipleSelection="setMultipleSelection"
          >
            <el-table-column
              :label="$t('优先级')"
              prop="priority"
              sortable="custom"
              width="100px"
            >
              <template slot-scope="scope">
                <span
                  class="cursor-pointer"
                  @click.stop="
                    e =>
                      GlobalSelectTargetClick(
                        scope.row.data,
                        e,
                        'priority',
                        searchRequireTaskInfo,
                      )
                  "
                  v-html="
                    initNameStatus(
                      scope.row.data.display.detail.priority.color,
                      scope.row.data.display.detail.priority.literal,
                    )
                  "
                >
                </span>
              </template>
            </el-table-column>
          </tree-table>
        </div>
        <div class="pagination-box">
          <co-pagination
            :page-size="pageSize"
            background
            layout="prev, pager, next, jumper"
            :total="total"
            @current-change="currentChange"
            @size-change="sizeChange"
          ></co-pagination>
        </div>
      </div>
      <div class="review-treetable-center">
        <co-button
          ref="secondStep"
          class="Shuttle"
          :class="{ 'bgc-yuan': selectedWorkItemData.length }"
          :disabled="deleteWorkItemData.length !== 0"
          @click="addIntoSprint()"
        >
          <i class="co-icon-arrow-right"></i>
        </co-button>
        <co-button
          class="Shuttle"
          style="margin-top: 16px;"
          :class="{ 'bgc-yuan': deleteWorkItemData.length }"
          :disabled="selectedWorkItemData.length !== 0"
          @click="deleteFromSprintRight()"
        >
          <i class="co-icon-arrow-left"></i>
        </co-button>
      </div>
      <div
        v-loading="requireAndTaskLoading"
        class="review-treetable-all sprintPlan-treetable-loading"
        :element-loading-text="$t('拼命加载中')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgb(255,255,255)"
      >
        <div class="info-head">
          <span class="plan-table-title mlc" :title="sprintInfo.name">{{
            sprintInfo.name
          }}</span>
          <span class="demand"
            >{{ $t('需求') }}：{{ sprintInfo.totalRequires
            }}{{ $t('个') }}</span
          >
          <span class="task"
            >{{ $t('任务') }}：{{ sprintInfo.totalTasks }}{{ $t('个') }}</span
          >
          <span class="bug"
            >{{ $t('缺陷') }}：{{ sprintInfo.totalDefect }}{{ $t('个') }}</span
          >
          <span class="datetime" style="margin-right: 0"
            >{{ $t('周期') }}：{{ sprintInfo.startTime }}~{{
              sprintInfo.endTime
            }}</span
          >
        </div>
        <div class="table-box">
          <tree-table
            ref="myTreeRight"
            :data="currentPageDataRight"
            :eval-args="args"
            :expand-all="expandAll"
            :show-check-box="showSelectedCheckBox"
            style="width: 100%;margin-left: 0;"
            :ltype="2"
            :update-global-title="updateGlobalTitle"
            :sorta-change-call-back="sortaChangeCallBackRightTable"
            :selectable="selectableRight"
            @seeTaskHandle="seeTaskHandle"
            @HandleSide="HandleSide"
            @setMultipleSelection="setMultipleSelectionRight"
          >
            <!-- <el-table-column label="类型" width="60px">
              <template slot-scope="scope">
                {{ scope.row.data.workItemTypeDesc}}
              </template>
            </el-table-column> -->
            <!--          <el-table-column-->
            <!--            :label="$t('迭代')"-->
            <!--            prop="sprintId"-->
            <!--            sortable="custom"-->
            <!--            show-overflow-tooltip-->
            <!--            width="100px"-->
            <!--          >-->
            <!--            <template slot-scope="scope">-->
            <!--              <span-->
            <!--                class="cursor-pointer"-->
            <!--                @click.stop="-->
            <!--                  e =>-->
            <!--                    GlobalSelectTargetClick(-->
            <!--                      scope.row.data,-->
            <!--                      e,-->
            <!--                      'sprintId',-->
            <!--                      getRequireTaskInfo,-->
            <!--                    )-->
            <!--                "-->
            <!--                >{{ scope.row.data.display.sprint || '&#45;&#45;' }}</span-->
            <!--              >-->
            <!--            </template>-->
            <!--          </el-table-column>-->
            <el-table-column
              :label="$t('优先级')"
              prop="priority"
              sortable="custom"
              width="120px"
            >
              <template slot-scope="scope">
                <span
                  class="cursor-pointer"
                  @click.stop="
                    e =>
                      GlobalSelectTargetClick(
                        scope.row.data,
                        e,
                        'priority',
                        getRequireTaskInfo,
                      )
                  "
                  v-html="
                    initNameStatus(
                      scope.row.data.display.detail.priority.color,
                      scope.row.data.display.detail.priority.literal,
                    )
                  "
                >
                </span>
              </template>
            </el-table-column>
            <!--<el-table-column label="状态">-->
            <!--<template slot-scope="scope">-->
            <!--<span @click="message(scope.row)">{{ scope.row.data.display.status}}</span>-->
            <!--</template>-->
            <!--</el-table-column>-->
            <!--          <el-table-column :label="$t('操作')" width="90px">-->
            <!--            <template slot-scope="scope">-->
            <!--              <el-button-->
            <!--                v-if="deleteable(scope.row)"-->
            <!--                type="text"-->
            <!--                @click="deleteFromSprint(scope.row)"-->
            <!--                >{{ $t('移除') }}</el-button-->
            <!--              >-->
            <!--            </template>-->
            <!--          </el-table-column>-->
          </tree-table>
        </div>
        <div class="pagination-box">
          <co-pagination
            :page-size="pageSizeRight"
            background
            layout="prev, pager, next, jumper"
            :total="totalRight"
            @current-change="currentChangeRight"
            @size-change="sizeChangeRight"
          ></co-pagination>
        </div>
      </div>
    </div>
    <GlobalSelect v-bind="GlobalSelectProps"></GlobalSelect>
  </div>
</template>

<script>
import { i18n } from '@/i18n'

import treeTable from './treeTable'
import slide from '@/components/slide-slip'
// import demandView from 'pages/project/requirement/requirementView.vue'
import {
  BugDetail,
  TaskDetail,
  RequirementDetail,
} from '@/components/columbus-workitem-display'
import GlobalSelect from '@/components/field-edit/GlobalSelect.vue'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'

import * as sprintService from '@/service/sprint'

import { guideType, guideStep } from '@/components/guide/guideData'
import { guide } from '@/store/mutation-types'

export default {
  name: 'SprintPlan',
  components: {
    treeTable,
    slide,
    TaskDetail,
    RequirementDetail,
    BugDetail,
    GlobalSelect,
  },

  mixins: [ProjectCommonMixin],
  data() {
    return {
      detailType: 'show',
      bugProjectId: null,
      urlParam: {
        projectId: 0,
        sprintId: 0,
      },

      workType: null,
      activeBugInfo: {},
      formInline: {
        projectId: 0,
        title: null,
        sprintId: '0',
      },

      sprintNameList: [],
      searchRequireAndTaskInfo: [],
      requireAndTaskInfo: [],
      sprintInfo: {},
      args: [null, null, 'timeLine'],
      expandAll: true,
      showSearchCheckBox: true,
      showSelectedCheckBox: true,
      selectedWorkItemData: [],
      deleteWorkItemData: [],
      count: 0,
      restore: 1,
      preID: null,
      show: false,
      taskId: null,
      loading: false,
      treetableLoading: false,
      requireAndTaskLoading: false,
      selectable: false,
      selectableRight: false,
      pageSize: 20,
      total: 0,
      totalPage: 0,
      currentPageData: [],
      currentPage: 1,
      pageSizeRight: 20,
      totalRight: 0,
      totalPageRight: 0,
      currentPageDataRight: [],
      currentPageRight: 1,
      isGuidePrev: false,
    }
  },
  watch: {
    show: function(newName) {
      if (newName !== true) {
        this.searchRequireTaskInfo()
        this.getRequireTaskInfo()
      }
    },
  },
  mounted() {
    this.urlParam.projectId = this.$getUrlParams().projectId
    this.formInline.projectId = this.urlParam.projectId
    this.urlParam.sprintId = this.$getUrlParams().sprintId

    this.getSprintNameList()
    this.getSprintInfo()
    this.getRequireTaskInfo()
    this.searchRequireTaskInfo()
    this.initGuide()
    this.$bus.$on('G_changeGuideStep', this.changeGuideStep)
  },
  beforeDestroy() {
    this.$bus.$off('G_changeGuideStep', this.changeGuideStep)
    if (!this.isGuidePrev) {
      this.$store.commit(guide.STOP_STEP)
    }
  },
  methods: {
    initGuide() {
      if (this.$store.state.guide.guideType === guideType.sprint) {
        let _this = this
        let stepIndex = this.$store.state.guide.stepIndex || 2
        this.$store.commit(guide.START_GUIDE, {
          guideType: guideType.sprint,
          guideStep: guideStep.sprintPlanning,
          step: stepIndex,
          steps: {
            2: {
              dom: this.$refs.firstStep,
              prevCallback() {
                _this.isGuidePrev = true
                _this.goBack()
                _this.$store.commit(guide.UPDATE_STEP_INDEX, 1)
              },
            },
            3: {
              dom: this.$refs.secondStep,
              nextCallback() {
                _this.isGuidePrev = true
                _this.goBack()
                _this.$store.commit(
                  guide.UPDATE_GUIDE_STEP,
                  guideStep.taskSplit,
                )
              },
            },
          },
        })
      }
    },
    changeGuideStep() {
      this.goBack()
    },
    // 返回
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/')
    },
    // 全局更新标题 - add by heyunjiang on 2019.5.8
    updateGlobalTitle(info, value) {
      let originInfo = { ...info.data }
      let cb = () => {
        this.getRequireTaskInfo()
        this.searchRequireTaskInfo()
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
    sortaChangeCallBackSearch(obj) {
      let param = {}
      if (obj.prop) {
        param = {
          column: obj.prop,
          order: obj.order === 'descending' ? 'DESC' : 'ASC',
        }
      }
      this.$nextTick(() => {
        this.searchRequireTaskInfo(param)
      })
    },
    sortaChangeCallBackRightTable(obj) {
      let param = {}
      if (obj.prop) {
        param = {
          column: obj.prop,
          order: obj.order === 'descending' ? 'DESC' : 'ASC',
        }
      }
      this.$nextTick(() => {
        this.getRequireTaskInfo(param)
      })
    },
    //查看任务
    seeTaskHandle(data, e) {
      if (data.workItemType === 2) {
        this.workType = 1
      } else if (data.workItemType === 3) {
        this.workType = 2
        this.bugProjectId = data.projectId
      } else {
        this.workType = 3
      }
      // this.$goToPage(this, "taskEdit", {projectId: this.urlParam.projectId, taskId: id});
      if (e && e.stopPropagation) {
        //非IE浏览器
        e.stopPropagation()
      } else {
        //IE浏览器
        window.event.cancelBubble = true
      }
      this.$nextTick(() => {
        this.loading = true
        setTimeout(() => {
          this.loading = false
        }, 500)
      })

      // let projectId = this.$getUrlParams().projectId
      // this.goToNewWindowPage(thi s, "taskEdit", { taskId: data.id, projectId })

      if (this.count === 0) {
        this.preID = data.id
        this.show = !this.show
        this.taskId = data.id
        this.activeBugInfo = { id: data.id }
        this.restore = Math.random() * 10
        this.count++
      } else {
        if (this.preID !== data.id) {
          this.preID = data.id

          this.activeBugInfo = { id: data.id }
          // this.show = !this.show;
          this.taskId = data.id
          this.restore = Math.random() * 10
        } else {
          this.restore = Math.random() * 10
          this.activeBugInfo = { id: data.id }
          this.preID = data.id
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
    },
    getSprintNameList() {
      sprintService
        .getListSprintName({
          projectId: this.urlParam.projectId,
        })
        .then(res => {
          if (res.status == 200) {
            this.sprintNameList = res.data
          } else {
            this.$message({
              message: i18n.t('获取迭代名称失败'),
              type: 'error',
            })
          }
        })
    },
    getRequireTaskInfo(param) {
      this.requireAndTaskLoading = true
      sprintService
        .taskInfo({
          sprintId: this.urlParam.sprintId,
          isShowDefect: 1,
          ...param,
        })
        .then(res => {
          this.requireAndTaskLoading = false
          if (res.status == 200) {
            this.requireAndTaskInfo = res.data.tree
            // 计算一共有几页
            this.totalPageRight = Math.ceil(
              this.requireAndTaskInfo.length / this.pageSizeRight,
            )
            // 计算得0时设置为1
            this.totalPageRight =
              this.totalPageRight === 0 ? 1 : this.totalPageRight
            this.totalRight = this.requireAndTaskInfo.length
            this.setCurrentPageDataRight()
          } else {
            this.$message({
              message: i18n.t('获取迭代名称失败'),
              type: 'error',
            })
          }
        })
    },
    setCurrentPageDataRight() {
      let begin = (this.currentPageRight - 1) * this.pageSizeRight
      let end = this.currentPageRight * this.pageSizeRight
      this.currentPageDataRight = this.requireAndTaskInfo.slice(begin, end)
    },
    currentChangeRight(val) {
      this.currentPageRight = val
      this.setCurrentPageDataRight()
    },
    sizeChangeRight(val) {
      this.pageSizeRight = val
      this.setCurrentPageDataRight()
    },
    getSprintInfo() {
      sprintService.getInfo({ sprintId: this.urlParam.sprintId }).then(res => {
        if (res.status == 200) {
          this.sprintInfo = res.data
        } else {
          this.$message({
            message: i18n.t('获取迭代名称失败'),
            type: 'error',
          })
        }
      })
    },
    searchRequireTaskInfo(param) {
      this.treetableLoading = true
      sprintService.searchTask({ ...this.formInline, ...param }).then(res => {
        this.treetableLoading = false
        if (res.status == 200) {
          this.searchRequireAndTaskInfo = res.data
          // 计算一共有几页
          this.totalPage = Math.ceil(
            this.searchRequireAndTaskInfo.length / this.pageSize,
          )
          // 计算得0时设置为1
          this.totalPage = this.totalPage === 0 ? 1 : this.totalPage
          this.total = this.searchRequireAndTaskInfo.length
          this.setCurrentPageData()
        } else {
          this.$message({
            message: res.msg || i18n.t('搜索需求/任务失败'),
            type: 'error',
          })
        }
      })
    },
    setCurrentPageData() {
      let begin = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize
      this.currentPageData = this.searchRequireAndTaskInfo.slice(begin, end)
    },
    currentChange(val) {
      this.currentPage = val
      this.setCurrentPageData()
    },
    sizeChange(val) {
      this.pageSize = val
      this.setCurrentPageData()
    },
    setMultipleSelection() {
      this.selectedWorkItemData = []
      //筛选出的list

      let selectData = this.$refs['myTree'].getMultipleSelectData()
      selectData.forEach(item => {
        if (item) {
          this.selectedWorkItemData.push({
            sprintId: this.urlParam.sprintId,
            workItemId: item.data.id,
            workItemType: item.data.workItemType,
          })
        }
      })
      if (this.selectedWorkItemData.length) {
        this.selectableRight = true
      } else {
        this.selectableRight = false
      }
    },
    setMultipleSelectionRight() {
      this.deleteWorkItemData = []
      //筛选出的list

      let selectData = this.$refs['myTreeRight'].getMultipleSelectData()
      selectData.forEach(item => {
        if (item) {
          this.deleteWorkItemData.push({
            sprintId: this.urlParam.sprintId,
            workItemId: item.data.id,
            workItemType: item.data.workItemType,
          })
        }
      })
      if (this.deleteWorkItemData.length) {
        this.selectable = true
      } else {
        this.selectable = false
      }
    },
    addIntoSprint() {
      this.selectedWorkItemData = []
      //筛选出的list

      let selectData = this.$refs['myTree'].getMultipleSelectData()
      if (selectData.length === 0) {
        this.$message({
          message: i18n.t('请选择工作项'),
          type: 'error',
        })

        return
      }
      selectData.forEach(item => {
        if (item) {
          this.selectedWorkItemData.push({
            sprintId: this.urlParam.sprintId,
            workItemId: item.data.id,
            workItemType: item.data.workItemType,
          })
        }
      })

      sprintService.addTask(this.selectedWorkItemData).then(res => {
        if (res.status == 200) {
          this.getSprintInfo()
          this.getRequireTaskInfo()
          this.searchRequireTaskInfo()
          this.$message({
            message: res.msg || i18n.t('操作成功'),
            type: 'success',
          })
        } else {
          this.$message({
            message: res.msg || i18n.t('搜索需求/任务失败'),
            type: 'error',
          })
        }
        this.selectableRight = false
      })
    },
    deleteFromSprintRight() {
      this.deleteWorkItemData = []
      let selectData = this.$refs['myTreeRight'].getMultipleSelectData()
      if (selectData.length === 0) {
        this.$message({
          message: i18n.t('请选择工作项'),
          type: 'error',
        })

        return
      }
      selectData.forEach(item => {
        if (item) {
          this.deleteWorkItemData.push({
            sprintId: this.urlParam.sprintId,
            workItemId: item.data.id,
            workItemType: item.data.workItemType,
          })
        }
      })
      sprintService.deleteTask(this.deleteWorkItemData).then(res => {
        if (res.status == 200) {
          this.getSprintInfo()
          this.getRequireTaskInfo()
          this.searchRequireTaskInfo()
          this.$message({
            message: res.msg || i18n.t('操作成功'),
            type: 'success',
          })
        } else {
          this.$message({
            message: res.msg || i18n.t('搜索需求/任务失败'),
            type: 'error',
          })
        }
        this.selectable = false
      })
    },
    deleteFromSprint(item) {
      this.deleteWorkItemData = []
      this.deleteWorkItemData.push({
        sprintId: this.urlParam.sprintId,
        workItemId: item.data.id,
        workItemType: item.data.workItemType,
      })

      sprintService.deleteTask(this.deleteWorkItemData).then(res => {
        if (res.status == 200) {
          this.getSprintInfo()
          this.getRequireTaskInfo()
          this.searchRequireTaskInfo()
          this.$message({
            message: res.msg || i18n.t('操作成功'),
            type: 'success',
          })
        } else {
          this.$message({
            message: res.msg || i18n.t('搜索需求/任务失败'),
            type: 'error',
          })
        }
      })
    },
    deleteable(row) {
      if (row.data.sprintId == this.$getUrlParams().sprintId) {
        if (row.data.workItemType == 1) {
          if (row.data.sprintId != 0) {
            return true
          }
        } else {
          return true
        }
      }
      return false
    },

    returnBnt() {
      this.$goToPage(this, 'sprintList', {
        projectId: this.$getUrlParams().projectId,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.content-outer-box {
  padding: 16px 70px;
  background-color: $--background-gray;
  height: 100%;
  .go-back-box {
    height: 30px;
    margin-left: -50px;
    & > span {
      cursor: pointer;
      &:hover {
        color: $--color-primary;
      }
    }
  }
}
.x-arD {
  /*display: flex;*/
  height: calc(100% - 100px);
}
.review-treetable-all {
  width: calc(50% - 100px);
  overflow: hidden;
  min-height: 330px;
  height: 100%;
  display: inline-block;
  vertical-align: top;
  border-radius: 16px;
  background-color: #fff;
  padding: 28px 24px;
  .plan-table-title {
    text-align: left;
    float: left;
    line-height: 30px;
    font-family: MicrosoftYaHei;
    font-size: 16px;
    color: #292f3a;
  }
  /deep/ .table-box {
    height: calc(100% - 63px);
    overflow: hidden;
    & > div {
      height: 100%;
      .el-table {
        height: 100%;
        .el-table__body-wrapper {
          height: calc(100% - 51px);
          overflow: auto;
        }
      }
    }
  }
  .mlc {
    width: calc(100% - 450px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mb10 {
    /deep/ .el-select .el-input .el-input__inner {
      font-family: MicrosoftYaHei;
      font-size: 12px;
      /*color: #bfbfbf;*/
    }
  }
  .title-input {
    /deep/ .el-input__inner {
      padding-left: 28px;
      font-size: 12px;
    }
  }
  .pagination-box {
    width: 100%;
    margin-top: 10px;
    text-align: right;
    padding-bottom: 30px;
    .el-pagination {
      float: right;
    }
  }
}

.info-head {
  line-height: 28px;
  margin-bottom: 10px;
  text-align: right;
}

.review-treetable-center {
  width: 100px;
  min-height: 300px;
  display: inline-block;
  vertical-align: top;

  .Shuttle {
    margin-left: 30px;
    margin-top: 100px;
    /*color: #000;*/
    color: #999999;
    font-size: 22px;
    /*cursor: pointer;*/
    font-weight: 900;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #fff;
    text-align: center;
    line-height: 40px;
    padding: 0;
    border: none;
  }
  .bgc-yuan {
    background-color: $--color-primary;
    color: #ffffff;
  }
}
.sprintPlan-treetable-loading {
  /deep/ .el-loading-spinner {
    top: 200px;
  }
}

.sprint {
  font-size: 16px;
  color: #000;
  font-weight: 900;
}

.sprintDetail {
  margin-top: 0px;
  margin-bottom: 10px;
  padding-top: 12px;
}

.demand,
.task,
.datetime,
.bug {
  margin-right: 20px;
  white-space: nowrap;
  font-family: MicrosoftYaHei;
  font-size: 12px;
  color: #666666;
}
</style>
