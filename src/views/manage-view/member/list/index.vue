<template>
  <div v-loading="memberListLoading" class="member-list__container">
    <co-row class="filter-wrap">
      <co-col class="_left" :span="16">
        <MemberListFilter></MemberListFilter>
      </co-col>
      <co-col
        v-if="activeTab === 'team' && currentTeam.admin"
        class="_right"
        :span="8"
      >
        <co-button type="primary" @click="importMember">{{
          $t('导入项目成员')
        }}</co-button>
        <co-button type="primary" @click="addNewMember">{{
          $t('新增成员')
        }}</co-button>
      </co-col>
      <!-- 导出功能本期不做 先屏蔽 -->
      <!--<co-col class="_right" :span="4">
        <co-button type="info" icon="co-icon-edit" @click="onClick">导出</co-button>
      </co-col>-->
    </co-row>
    <co-row v-if="!showEmpty && memberTabs.data.length" class="tab-wrap">
      <ManageViewTabList
        v-bind="memberTabs"
        :value="filterInfoCopy.groupId"
        @change="onMemberTabChange"
      ></ManageViewTabList>
    </co-row>
    <co-row v-if="!showEmpty" class="list-wrap">
      <table-header-custom-field
        :default-display="defaultDisplayHeader"
        :view-type="viewType"
        class="require-table-header-set"
        @updateDisplay="updateDisplay"
      ></table-header-custom-field>
      <div>
        <co-table
          v-if="tableHeight"
          class="member-list__table common-table"
          :data="memberList"
          :max-height="tableHeight"
          border
        >
          <template v-for="(col, index) in fields">
            <co-table-column
              v-if="col.displayAttrName === 'userName'"
              :key="col.attrName + index"
              fixed
              show-overflow-tooltip
              :label="col.fieldName"
              :width="tableColWidth[col.displayAttrName]"
            >
              <template #default="scope">
                <div class="column-name">
                  <div v-if="isDepartment" class="column-name-icon">
                    <i
                      v-if="scope.row.followed"
                      class="star-icon co-icon-starsolid"
                      @click="onStarThrottle('cancelFollow', scope.row.userId)"
                    ></i>
                    <i
                      v-else
                      class="star-icon co-icon-star cell-hover-show"
                      @click="onStarThrottle('addFollow', scope.row.userId)"
                    ></i>
                  </div>
                  <div
                    class="column-name-content"
                    :style="{ width: nameContentWidth }"
                  >
                    <span>{{ scope.row[col.displayAttrName] }}</span>
                    <i
                      v-if="scope.row.deletable"
                      class="delete-icon el-icon-delete cell-hover-show"
                      @click="onRemoveMember(scope.row.userId)"
                    ></i>
                  </div>
                </div>
              </template>
            </co-table-column>
            <co-table-column
              v-else-if="notOperation(col.displayAttrName)"
              :key="col.attrName + index"
              show-overflow-tooltip
              :label="col.fieldName"
              :min-width="tableColWidth[col.displayAttrName]"
              :prop="col.displayAttrName"
            ></co-table-column>
            <co-table-column
              v-else
              :key="col.attrName + index"
              show-overflow-tooltip
              :min-width="tableColWidth[col.displayAttrName]"
            >
              <template #header>
                <span :title="col.fieldName">{{ col.fieldName }}</span>
                <co-tooltip
                  effect="dark"
                  :content="col.description"
                  placement="top"
                >
                  <i v-show="col.description" class="co-icon-question"></i>
                </co-tooltip>
              </template>
              <template #default="scope">
                <div
                  v-if="col.displayAttrName === 'saturation'"
                  :class="{
                    'cell-hover-color': scope.row.saturation !== '0%',
                  }"
                  @click="
                    scope.row.saturation !== '0%' &&
                      showPopList(scope.row, 'saturation')
                  "
                >
                  <span>{{ scope.row.saturation }}</span>
                </div>
                <div
                  v-else-if="col.displayAttrName === 'pendingTasks'"
                  :class="{
                    'cell-hover-color': tableCellNotEmpty(
                      scope.row.pendingTasks,
                    ),
                  }"
                  @click="
                    tableCellNotEmpty(scope.row.pendingTasks) &&
                      showPopList(scope.row, 'pendingTasks')
                  "
                >
                  <span>{{ scope.row.pendingTasks }}</span>
                </div>
                <div
                  v-else
                  :class="{
                    'cell-hover-color': scope.row[col.displayAttrName],
                    'column-total-task-hour':
                      col.displayAttrName === 'totalHours',
                  }"
                  @click="
                    scope.row[col.displayAttrName] &&
                      showPopList(scope.row, col.displayAttrName)
                  "
                >
                  <span>{{ scope.row[col.displayAttrName] }}</span>
                </div>
              </template>
            </co-table-column>
          </template>
        </co-table>
      </div>
    </co-row>
    <co-row type="flex" class="pagination-container" justify="end">
      <el-pagination
        :layout="pagination.layout"
        :page-sizes="pagination.pageSizeList"
        :current-page="filterInfoCopy.pageNumber"
        :page-size="filterInfoCopy.pageSize"
        :total="filterInfoCopy.totalRecords"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </co-row>
    <div
      v-if="showEmpty && !memberViewLoading && !memberListLoading"
      class="empty-box"
    >
      <img :src="tableEmpty" alt="empty" />
      <span>{{ emptyText }}</span>
    </div>
    <!-- 弹窗组件 -->
    <pop-list
      v-if="ifShowTablePopList"
      @popListCurrentChange="popListCurrentChange"
      @openSlider="openSlider"
      @popListSortChange="popListSortChange"
    ></pop-list>
    <!-- 添加成员 -->
    <add-member-model
      :show-model.sync="teamManageModel"
      :left-list="alternativeList"
      :right-list="selectedList"
      :show-loading="showLoading"
      @submitModel="submitUpdateGroupPerson"
    ></add-member-model>
    <!-- 导入项目成员 -->
    <person-clone
      :visible.sync="importMembleVisible"
      type="member"
    ></person-clone>
    <!-- 工作项详情右侧弹窗 -->
    <OpenWorkItemSlide
      :id="sliderWorkItemInfo.id"
      :project-id="sliderWorkItemInfo.projectId"
      :work-item-type="sliderWorkItemInfo.workItemType"
      :slider-status.sync="sliderWorkItemVisible"
      @updateWorkInfoSuccess="updateWorkInfoSuccess"
    ></OpenWorkItemSlide>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 管理者视图 - 成员视图列表组件
 * @desc 包括成员视图列表、分页、过滤等功能
 * @author wuqian
 * @date 2020.4.8
 */
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import CONSTVARLIABLE from '@/store/mutation-types'
import PopList from '@/components/pop-list'
// import CustomDate from '@/components/CustomDate'
import PersonClone from '@/components/biz/person-clone'
import OpenWorkItemSlide from '@/components/biz/open-work-item-slide'
import CopeUrlOpenSliderMixin from '@/components/biz/open-work-item-slide/CopeUrlOpenSliderMixin'
import MemberListFilter from './MemberListFilter'
import AddMemberModel from '../AddMemberModel'
import ManageViewTabList from '../../components/ManageViewTabList'
import TableHeaderCustomField from '../../components/TableHeaderCustomField'

import tableEmpty from 'assets/no-data.png'
import { isEmpty } from '@/utils'

export default {
  name: 'MemberList',
  components: {
    // CustomDate,
    ManageViewTabList,
    PopList,
    MemberListFilter,
    AddMemberModel,
    PersonClone,
    TableHeaderCustomField,
    OpenWorkItemSlide,
  },

  mixins: [CopeUrlOpenSliderMixin],
  data() {
    return {
      tableHeight: null,
      viewType: 2, //成员视图
      // 列表 toolTips 数据
      //表格宽度
      tableColWidth: {
        userName: 90, //姓名
        titleName: 120, //职务
        projectNames: 150, //正在参与的项目
        pendingTasks: 150, //正在处理的任务
        totalHours: 150, //预计总工时
        saturation: 160, //预计工时饱和度
        delayedTaskCount: 150, //延期待处理任务数
        uncompletedTaskCount: 120, //待处理任务数
        waitingTaskCount: 120, //待处理任务数
        totalTaskCount: 120, //总任务数
        completedTaskCount: 130, //完成任务数
        closedDefectCount: 120, //关闭缺陷数
        createdDefectCount: 150, //创建缺陷数
        completedHours: 160, //完成总工时
      },
      teamManageModel: false, // 是否显示添加成员弹窗
      showLoading: true, // 添加成员弹窗是否显示加载动画
      // 列表分页数据
      pagination: {
        pageSizeList: [15, 30, 50], // 可选的分页条数
        layout: 'total, sizes, prev, pager, next, jumper',
      },

      popListCurrentSelectParams: {},
      tableEmpty,
      importMembleVisible: false, //导入成员弹窗状态
      defaultDisplayHeader: [
        'userName',
        'titleName',
        'pendingTasks',
        'projectNames',
      ], //默认显示的表头
      orderInfo: {}, // 排序信息
    }
  },
  computed: {
    ...mapState({
      currentTeam: state => state.manageViewMember.currentTeam,
      teamId: state => state.manageViewMember.filterInfo.teamId,
      activeTab: state => state.manageViewMember.activeTab,
      memberListLoading: state => state.manageViewMember.memberListLoading,
      memberViewLoading: state => state.manageViewMember.memberViewLoading,
      memberTabs: state => state.manageViewMember.memberTabMap,
      memberList: state => state.manageViewMember.memberList,
      fields: state => state.manageViewMember.fields,
      filterInfo: state => state.manageViewMember.filterInfo,
      ifShowTablePopList: state => state.manageViewPopList.ifShowTablePopList,
      alternativeList: state => state.manageViewMember.alternativeList,
      selectedList: state => state.manageViewMember.selectedList,
    }),

    isDepartment() {
      return this.activeTab === 'department'
    },
    // 展示非搜索时，成员为空
    showEmpty() {
      const {
        memberList,
        filterInfo,
        teamList,
        activeTab,
      } = this.$store.state.manageViewMember
      const isShowEmpty =
        (!memberList.length &&
          isEmpty(filterInfo.keyword) &&
          filterInfo.groupId === 'all') ||
        (activeTab === 'team' && !teamList.length)
      return isShowEmpty
    },
    // 为空提示
    emptyText() {
      const {
        activeTab,
        filterInfo,
        teamList,
      } = this.$store.state.manageViewMember
      if (activeTab === 'team' && !teamList.length) {
        return i18n.t('暂无团队')
      }
      if (activeTab === 'department' && filterInfo.toFollow) {
        return i18n.t('暂无关注的成员')
      } else {
        return i18n.t('当前部门内无成员')
      }
    },
    filterInfoCopy() {
      return { ...this.filterInfo }
    },
    nameContentWidth() {
      return this.isDepartment ? 'calc(100% - 16px)' : '100%'
    },
  },

  watch: {},
  created() {
    this.onStarThrottle = debounce(this.onStar, 300)
  },
  mounted() {
    // 去除上下 padding 16 * 2；搜索栏 32 + 16 + 64；分页器 40；共计：184
    this.tableHeight = this.$el.clientHeight - 184
  },
  methods: {
    //只有显示功能的表格
    notOperation(type) {
      const isTrue = type === 'titleName' || type === 'projectNames'
      return isTrue
    },
    tableCellNotEmpty(val) {
      return val && val !== '--'
    },
    async addNewMember() {
      this.teamManageModel = true
      await this.$store.dispatch('getGroupPersonList', {
        id: this.teamId,
      })

      this.showLoading = false
    },
    onRemoveMember(id) {
      this.$confirm(i18n.t('确定移除成员吗？'), i18n.t('提示'), {
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      })
        .then(() => {
          this.$store.dispatch('memberViewRemoveMember', {
            userId: id,
            teamId: this.teamId,
          })
        })
        .catch(() => {})
    },
    onMemberTabChange(val) {
      this.$store.dispatch('getMemberViewList', {
        pageNumber: 1,
        groupId: val,
      })
    },
    async onStar(actionFnName, id) {
      const { status, msg } = await this.$store.dispatch(actionFnName, {
        watchType: 'USER',
        watchId: id,
      })

      status === 200 &&
        this.$message({
          message: msg,
          type: 'success',
        })
    },
    handleSizeChange(pageSize) {
      this.filterInfoCopy.pageNumber = 1
      this.$store.dispatch('getMemberViewList', { pageNumber: 1, pageSize })
    },
    handleCurrentChange(pageNumber) {
      this.$store.dispatch('getMemberViewList', { pageNumber })
    },
    //更新成员列表
    updateDisplay() {
      const pageOne = 1 //第一页
      this.handleCurrentChange(pageOne)
    },
    // 点击展示弹窗
    showPopList(row, property) {
      const params = {
        userId: row.userId,
        attrName: property,
        projectIdList: row.projectIdList,
      }

      if (this.filterInfoCopy.daterange.length) {
        params.startDate = this.filterInfoCopy.daterange[0]
        params.endDate = this.filterInfoCopy.daterange[1]
      }
      // 如果点击的是展示缺陷
      const colConfigType = 'memberColConfig'
      params.colConfigType = colConfigType
      // 保存当前弹窗的相关参数
      this.popListCurrentSelectParams = params
      // 调用接口
      this.$store.dispatch('getMemberPopList', {
        ...params,
      })
    },
    // 更新团队成员
    submitUpdateGroupPerson() {
      let userIdList = this.selectedList.map(item => item.userId)
      this.$store
        .dispatch('postUpdateGroupPerson', {
          id: this.teamId,
          userIdList,
        })
        .then(res => {
          if (res.status === 200) {
            this.$store.dispatch('getMemberViewList')
            this.teamManageModel = false
            this.$message({
              type: 'success',
              message: i18n.t('更新成功'),
            })
          }
        })
    },
    /**
     * 切换弹窗列表显示页
     */
    async popListCurrentChange(num) {
      const { column, order } = this.orderInfo
      await this.$store.dispatch('getMemberPopList', {
        ...this.popListCurrentSelectParams,
        pageNumber: num,
        field: column,
        order,
        isPagination: true,
      })
    },
    // 弹窗排序
    async popListSortChange({ prop, order }) {
      this.orderInfo = {
        column: prop,
        order: order ? (order === 'ascending' ? 'asc' : 'desc') : null,
      }
      this.$store.commit(CONSTVARLIABLE.UPDATE_MANAGEVIEW_LIST_POP_LOADING, {
        loadingStatus: true,
      })
      try {
        await this.$store.dispatch('getMemberPopList', {
          ...this.popListCurrentSelectParams,
          pageNumber: 1, // 排序规则变化，重置到第一页
          field: prop,
          order: this.orderInfo.order,
          isPagination: true,
        })
      } finally {
        this.$store.commit(CONSTVARLIABLE.UPDATE_MANAGEVIEW_LIST_POP_LOADING, {
          loadingStatus: false,
        })
      }
    },
    // 打开导入项目成员弹窗
    importMember() {
      this.importMembleVisible = true
    },
    // 更新工作项右侧弹窗 回调函数
    updateWorkInfoSuccess() {
      // 通过点击弹窗打开时，主要为了排除通过复制链接打开
      if (this.ifShowTablePopList) {
        const {
          pageNumber,
          pageSize,
        } = this.$store.state.manageViewPopList.pageInfo
        const { column, order } = this.orderInfo
        this.$store.dispatch('getMemberPopList', {
          ...this.popListCurrentSelectParams,
          pageNumber,
          pageSize,
          field: column,
          order,
          isPagination: true,
        })
      }
      //获取成员视图列表
      this.$store.dispatch('getMemberViewList', {
        noLoading: true,
      })
    },
    // 通过poplist弹窗里面的标题打开右侧弹窗
    openSlider(info) {
      this.sliderWorkItemInfo = info
      this.sliderWorkItemVisible = true
    },
  },
}
</script>

<style lang="scss" scoped>
.member-list__container {
  box-sizing: border-box;

  .filter-wrap {
    margin-bottom: 16px;

    ._right {
      text-align: right;
    }
  }
  .tab-wrap {
    min-height: 58px;
  }
  .list-wrap {
    display: flex;
    flex-direction: column;
    flex: 1;

    .member-list__table /deep/ {
      // flex: 1;
      // height: 0;

      .co-table-th__last {
        padding-right: 28px;
      }

      th > .cell {
        display: flex;
        align-items: center;

        span {
          flex: 1;
          width: 0;
          @include ellipsis;
        }

        .co-icon-question {
          margin-left: 3px;
          color: $--color-text-regular;
        }
      }

      .column-name {
        display: flex;

        .column-name-icon {
          width: 13px;
          height: 23px;
          display: inline-block;
          margin-right: 5px;
        }

        .column-name-content {
          @include ellipsis;
        }
      }

      .star-icon {
        color: #ffac52;
        cursor: pointer;
      }
      .delete-icon {
        margin-left: 3px;
        width: 14px;
        font-size: 14px;
        cursor: pointer;
      }

      // 默认隐藏
      .cell-hover-show {
        display: none;
      }

      .el-table__row:hover {
        .cell-hover-color {
          cursor: pointer;
          color: $--color-primary;
        }

        .cell-hover-show {
          display: inline;
        }
      }
    }
  }
  .pagination-container {
    padding-top: 8px;
  }
  .el-tooltip {
    cursor: pointer;
  }
}
/deep/ .label-class__name .cell {
  padding-left: 27px !important;
}

.empty-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  img,
  span {
    display: block;
    margin: 0 auto;
  }
  span {
    height: 26px;
    line-height: 26px;
  }
}
.table-tooltip {
  line-height: 18px;
  vertical-align: middle;
  width: 128px;
}
.require-table-header-set {
  position: absolute;
  right: 0;
  z-index: 2;
  line-height: 48px;
  height: 48px;
  background: #f1f4f9;
  width: 36px;
  text-align: center;
}
</style>
