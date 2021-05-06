<template>
  <div class="project-list-container">
    <co-row class="filter-wrap">
      <co-col class="_left" :span="20">
        <div class="filter-keywords mr15">
          <co-input
            v-model.trim="currentKeyworld"
            class="keywords__input"
            :placeholder="$t('输入项目名称搜索')"
            @keyup.native.enter="handleKeyworldChange"
          >
            <template v-slot:suffix>
              <div class="keywords__icon">
                <i
                  v-if="currentKeyworld"
                  class="el-input__icon el-icon-close"
                  @click="handleClearKeyword"
                ></i>
                <i v-if="currentKeyworld" class="line"></i>
                <i
                  class="el-input__icon el-icon-search"
                  @click="handleKeyworldChange"
                ></i>
              </div>
            </template>
          </co-input>
        </div>
      </co-col>
    </co-row>
    <co-row v-if="!showEmpty" class="tab-wrap">
      <ManageViewTabList
        v-model="currentStatusType"
        key-name="status"
        :data="summaryList"
        @change="handleStatusTypeChange"
      ></ManageViewTabList>
    </co-row>
    <co-row v-if="!showEmpty" class="list-wrap">
      <table-header-custom-field
        :default-display="defaultDisplayHeader"
        :view-type="viewType"
        class="require-table-header-set"
        @updateDisplay="updateDisplay"
      >
      </table-header-custom-field>
      <div>
        <co-table
          v-if="tableHeight"
          class="project-list__table common-table"
          :max-height="tableHeight"
          :data="basicTableList"
          border
        >
          <template v-for="(col, index) in fields">
            <co-table-column
              v-if="col.displayAttrName === 'projectName'"
              :key="col.attrName + index"
              :label-class-name="showStar ? 'label-class__name' : ''"
              :label="$t('项目名称')"
              :width="tableColWidth[col.displayAttrName]"
              show-overflow-tooltip
              fixed
            >
              <template #default="scope">
                <span class="column-name">
                  <span v-if="showStar" class="column-name-icon">
                    <i
                      v-if="scope.row.detail.followed"
                      class="star-icon co-icon-starsolid"
                      @click="starHandle(scope.row)"
                    ></i>
                    <i
                      v-else
                      class="star-icon co-icon-star cell-hover-show"
                      @click="starHandle(scope.row)"
                    ></i>
                  </span>
                  <span
                    class="cell-hover-color cell-hover-color"
                    @click="redirectToProjectOverview(scope.row.data.projectId)"
                    >{{ scope.row.display.projectName }}</span
                  >
                </span>
              </template>
            </co-table-column>
            <co-table-column
              v-else-if="notOperation(col.displayAttrName)"
              :key="col.attrName + index"
              show-overflow-tooltip
              :label="col.fieldName"
              :min-width="tableColWidth[col.displayAttrName]"
              :prop="`data.${[col.displayAttrName]}`"
            ></co-table-column>
            <co-table-column
              v-else
              :key="col.attrName + index"
              show-overflow-tooltip
              :label="col.fieldName"
              :min-width="tableColWidth[col.displayAttrName]"
            >
              <template #default="scope">
                <template v-if="col.displayAttrName === 'chargeUserName'">
                  <span>{{
                    scope.row.display.chargeUserName &&
                      scope.row.display.chargeUserName.join(',')
                  }}</span>
                </template>
                <template v-else-if="col.displayAttrName === 'statusName'">
                  <span
                    class="mini-circle"
                    :style="{
                      backgroundColor: scope.row.detail.statusColor || '#ccc',
                    }"
                  ></span>
                  <span class="inline-block" style="width: 69px;">{{
                    scope.row.display.statusName
                  }}</span>
                </template>
                <template
                  v-else-if="col.displayAttrName === 'participantsCount'"
                >
                  <div
                    :class="{
                      'cell-hover-color': scope.row.data.participantsCount > 0,
                    }"
                    style="width: 59px;"
                    @click="
                      scope.row.data.participantsCount > 0 &&
                        $emit('participantsCountClick', scope.row)
                    "
                  >
                    {{ scope.row.data.participantsCount }}
                  </div>
                </template>
                <template
                  v-else-if="col.displayAttrName === 'currentMilepostNames'"
                >
                  <span
                    v-if="isClickContent(scope.row.data.currentMileposts)"
                    class="cell-hover-color"
                    @click="redirectToProjectOverview(scope.row.data.projectId)"
                    >{{
                      scope.row.display.currentMilepostNames &&
                        scope.row.display.currentMilepostNames.join(',')
                    }}</span
                  >
                  <span v-else>{{
                    scope.row.display.currentMilepostNames &&
                      scope.row.display.currentMilepostNames.join(',')
                  }}</span>
                </template>
                <template
                  v-else-if="col.displayAttrName === 'onGoingSprintCount'"
                >
                  <div
                    :class="{
                      'cell-hover-color': scope.row.data.onGoingSprintCount > 0,
                    }"
                    style="width: 79px;"
                    @click="
                      scope.row.data.onGoingSprintCount > 0 &&
                        $emit('onGoingSprintCountClick', scope.row)
                    "
                  >
                    {{ scope.row.data.onGoingSprintCount }}
                  </div>
                </template>
                <template
                  v-else-if="col.displayAttrName === 'currentRiskNames'"
                >
                  <span
                    v-if="isClickContent(scope.row.data.currentRisks)"
                    class="cell-hover-color"
                    @click="redirectToProjectOverview(scope.row.data.projectId)"
                    >{{
                      scope.row.display.currentRiskNames &&
                        scope.row.display.currentRiskNames.join(',')
                    }}</span
                  >
                  <span v-else>{{
                    scope.row.display.currentRiskNames &&
                      scope.row.display.currentRiskNames.join(',')
                  }}</span>
                </template>
              </template>
            </co-table-column>
          </template>
        </co-table>
      </div>
    </co-row>
    <co-row type="flex" class="pagination-container" justify="end">
      <el-pagination
        :current-page="pageInfo.pageNumber"
        :page-sizes="pageSizeList"
        :page-size="pageInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageInfo.totalRecords"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </co-row>
    <div v-if="showEmpty && !loading" class="empty-box">
      <img :src="tableEmpty" alt="empty" />
      <span>{{ emptyText }}</span>
      <span v-if="!showStar"
        ><co-button type="text" @click="$emit('labelManage', labelId)">{{
          $t('添加已有项目')
        }}</co-button></span
      >
    </div>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 管理者视图 - 项目视图列表组件
 * @desc 输入过滤、概览、项目列表
 * @event 支持事件 @onGoingSprintCountClick @participantsCountClick
 * @author heyunjiang
 * @date 2020.4.14
 */
// import CustomDate from '@/pages/commonComponents/CustomDate'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import ManageViewTabList from '../../components/ManageViewTabList'
import TableHeaderCustomField from '../../components/TableHeaderCustomField'
import tableEmpty from '@/assets/no-data.png'
import { isEmpty } from '@/utils'
import { windowOpenRouter } from '@/utils/sub-app-util'

export default {
  name: 'ProjectList',
  components: {
    // CustomDate,
    ManageViewTabList,
    TableHeaderCustomField,
  },

  data() {
    return {
      tableHeight: null,
      currentKeyworld: '',
      currentStatusType: this.status,
      viewType: 1, //项目视图
      pageSizeList: [15, 30, 50], // 可选的分页条数
      tableEmpty,
      defaultTableDisplay: [],
      tableColWidth: {
        projectName: 180, //项目名称
        chargeUserName: 130, //负责人
        goal: 130, //目标
        statusName: 120, //状态
        participantsCount: 100, //参与人数
        PROJECT_CURRENT_MILE_POSTS: 150, //当前里程碑节点
        onGoingSprintCount: 110, //进行的迭代数
        requireCompletionDegree: 115, //需求完成度
        defectCompletionDegree: 115, //缺陷完成度
        currentRiskNames: 100, //当前风险
      },
      defaultDisplayHeader: ['projectName', 'chargeUserName'], //默认显示的表头
    }
  },
  computed: {
    ...mapState({
      filterInfo: state => state.manageViewProject.filterInfo,
      keyword: state => state.manageViewProject.filterInfo.keyword,
      status: state => state.manageViewProject.filterInfo.status,
      pageInfo: state => state.manageViewProject.filterInfo.pageInfo,
      labelId: state => state.manageViewProject.filterInfo.labelId,
      basicTableList: state => state.manageViewProject.basicTableList,
      fields: state => state.manageViewProject.fields,
      summaryList: state => state.manageViewProject.summaryList,
      loading: state => state.manageViewProject.loading,
    }),

    showStar() {
      return this.$store.state.manageViewProject.activeTab === 'department'
    },
    // 展示非搜索时，项目为空
    showEmpty() {
      const { basicTableList, filterInfo } = this.$store.state.manageViewProject
      return (
        basicTableList.length === 0 &&
        isEmpty(filterInfo.keyword) &&
        filterInfo.status === -1
      )
    },
    // 为空提示
    emptyText() {
      const { activeTab, filterInfo } = this.$store.state.manageViewProject
      if (activeTab === 'tag') {
        return i18n.t('当前项目标签内无项目')
      }
      if (activeTab === 'department' && filterInfo.toFollow) {
        return i18n.t('暂无关注的项目')
      } else {
        return i18n.t('当前部门内无项目')
      }
    },
  },

  watch: {
    keyword() {
      this.currentKeyworld = this.keyword
    },
    status() {
      this.currentStatusType = this.status
    },
  },

  mounted() {
    // 去除上下 padding 16 * 2；搜索栏 32 + 16 + 64；分页器 40；共计：184
    this.tableHeight = this.$el.clientHeight - 184

    this.currentKeyworld = this.keyword
    this.currentStatusType = this.status
  },
  methods: {
    handleClearKeyword() {
      this.currentKeyworld = ''
      this.currentKeyworld !== this.keyword && this.handleKeyworldChange()
    },
    //不需要操作的列表项
    notOperation(name) {
      return (
        name === 'goal' ||
        name === 'requireCompletionDegree' ||
        name === 'defectCompletionDegree'
      )
    },
    // 点击关注/取消关注
    starHandle: debounce(function(info) {
      this.$store.dispatch('projectFollowHandle', {
        watchType: 'PROJECT',
        watchId: info.data.projectId,
        followed: info.detail.followed,
      })
    }, 100),
    // 点击顶部输入过滤/清空
    handleKeyworldChange: debounce(function() {
      // 更新项目列表
      this.$store.dispatch('getManageViewProjectList', {
        filterInfo: {
          keyword: this.currentKeyworld,
          status: -1,
          pageInfo: {
            ...this.$store.state.manageViewProject.filterInfo.pageInfo,
            pageNumber: 1,
          },
        },
      })
    }, 300),
    // 点击状态栏过滤
    handleStatusTypeChange() {
      // 更新项目列表
      this.$store.dispatch('getManageViewProjectList', {
        filterInfo: {
          status: this.currentStatusType,
          pageInfo: {
            ...this.$store.state.manageViewProject.filterInfo.pageInfo,
            pageNumber: 1,
          },
        },
      })
    },
    // 分页 - pageSize
    handleSizeChange(pageSize) {
      // 更新项目列表
      this.$store.dispatch('getManageViewProjectList', {
        filterInfo: {
          pageInfo: {
            ...this.$store.state.manageViewProject.filterInfo.pageInfo,
            pageSize,
            pageNumber: 1,
          },
        },
      })
    },
    // 分页 - pageNumber
    handleCurrentChange(currentPage) {
      // 更新项目列表
      this.$store.dispatch('getManageViewProjectList', {
        filterInfo: {
          pageInfo: {
            ...this.$store.state.manageViewProject.filterInfo.pageInfo,
            pageNumber: currentPage,
          },
        },
      })
    },
    //更新项目列表
    updateDisplay() {
      const pageOne = 1 //第一页
      this.handleCurrentChange(pageOne)
    },
    //是否可点击内容
    isClickContent(val) {
      const contentStr = val && val.join(',')
      return contentStr.length > 0 && contentStr !== '--'
    },
    // 跳转到项目概览
    redirectToProjectOverview(projectId) {
      windowOpenRouter(`/overview?projectId=${projectId}`)
    },
  },
}
</script>

<style lang="scss" scoped>
.project-list-container {
  // min-height: calc(100vh - 165px);
  // box-sizing: border-box;

  .filter-wrap {
    margin-bottom: 16px;

    ._left {
      display: flex;
      justify-content: flex-start;
    }
    ._right {
      text-align: right;
    }
    .statis-time {
      width: 320px;
      height: 28px;
      .label {
        padding-right: 10px;
        line-height: 28px;
      }
    }
    .filter-keywords {
      width: 200px;
      .keywords__input /deep/ .el-input__inner {
        padding-right: 50px !important;
      }
      .el-input__icon {
        cursor: pointer;
        width: 20px;
      }
      .keywords__icon {
        display: flex;
        .el-icon-close {
          font-size: 12px;
        }
        .line {
          margin: 6px 4px 6px 2px;
          display: inline-block;
          width: 1px;
          height: 16px;
          background-color: #bfbfbf;
        }
      }
    }
  }
  .tab-wrap {
    min-height: 58px;
  }
  .list-wrap {
    display: flex;
    flex-direction: column;
    flex: 1;

    .project-list__table {
      // flex: 1;
      // height: 0;

      /deep/ th > .cell {
        white-space: nowrap;
        word-break: keep-all;
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
// 空内容提示
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
  width: 100%;
  line-height: 18px;
  vertical-align: middle;
}
.mini-circle {
  top: -2px;
  width: 6px;
  height: 6px;
  margin: 0 6px;
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
