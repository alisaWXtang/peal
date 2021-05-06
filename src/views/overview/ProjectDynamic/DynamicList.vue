<template>
  <div class="project-dynamic-wrapper public-wrap">
    <div v-loading="loading" class="dynamic-wrapper">
      <ul v-if="projectDynamicList.length">
        <li
          v-for="(log, index) in projectDynamicList"
          :key="log.id"
          class="dynamic-list"
        >
          <span class="dynamic-list_time">{{ log.changeTime }}</span>
          <div class="dynamic-time-line-wrapper">
            <i class="dynamic-list_spot"></i>
            <i :class="{ 'time-line': lastIndex !== index }"></i>
          </div>
          <p class="list-break-wrap">
            <span class="dynamic-list_item">{{ log.opUserName }}</span>
            <span class="fixed-content">{{ log.changeDesc }}</span>
            <span
              v-if="
                log.workItemType === dynamicType.projectType ||
                  log.workItemType === dynamicType.noticeType
              "
              class="dynamic-list_item"
              >{{ log.name || '--' }}</span
            >
            <span
              v-else
              class="dynamic-list_item poplist-underline_add"
              @click="jumpToDetail(log)"
              >{{ log.name }}</span
            >
            <span v-if="log.changeMark == 'update'">
              <span class="fixed-content">{{ $t('把') }}</span>
              <span class="dynamic-list_item">{{ log.changeField }}</span>
              <span class="fixed-content">{{ $t('从') }}</span>
              <span
                v-if="
                  log.changeType == 200 ||
                    log.workItemType == dynamicType.noticeType
                "
              >
                <span
                  class="dynamic-list_item poplist-underline_add"
                  @click="showNoticeOrRequireReviseSprint(log, 'origValue')"
                  >{{ $t('原内容') }}</span
                >
                <span class="fixed-content">{{ $t('置为') }}</span>
                <span
                  class="dynamic-list_item poplist-underline_add"
                  @click="showNoticeOrRequireReviseSprint(log, 'changeValue')"
                  >{{ $t('新内容') }}</span
                >
              </span>
              <span v-else>
                <span class="dynamic-list_item">{{
                  log.origValue || '--'
                }}</span>
                <span class="fixed-content">{{ $t('置为') }}</span>
                <span class="dynamic-list_item">{{
                  log.changeValue || '--'
                }}</span>
              </span>
            </span>
          </p>
        </li>
      </ul>
      <div v-else-if="!loading" class="no-dynamic-list">
        {{ $t('暂无项目动态') }}
      </div>
      <div v-if="isShowPagination" class="pagination">
        <co-pagination
          background
          layout="total, prev, pager, next, sizes, jumper"
          :current-page="pageInfo.pageNumber"
          :page-size="pageInfo.pageSize"
          :total="pageInfo.totalRecords"
          :page-sizes="[5, 10, 20, 50, 100]"
          @current-change="currentChange"
          @size-change="sizeChange"
        ></co-pagination>
      </div>
    </div>
    <milepost-dialog
      v-if="milepostVisible"
      :milepost-visible="milepostVisible"
      type="detail"
      :milepost-detail-info="milepostDetailInfo"
      @beforeClose="closeMilepostDialog"
    ></milepost-dialog>
    <risk-add-and-edit-dialog
      v-if="riskVisible"
      type="detail"
      :risk-visible="riskVisible"
      :risk-detail-info="riskDetailInfo"
      @beforeClose="closeRiskDialog"
    ></risk-add-and-edit-dialog>
    <el-dialog
      class="content-preview-dialog"
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :modal-append-to-body="false"
    >
      <div class="form-iterm-box" v-html="dialogContent"></div>
    </el-dialog>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
// 工作类型 1 需求 2 任务 3 缺陷
const WorkItemTypeObj = {
  4: '风险',
  5: '迭代',
  6: '里程碑',
}

import { mapState } from 'vuex'
import MilepostDialog from '../Milepost/MilepostDialog'
import RiskAddAndEditDialog from '../ProjectBasicInfo/riskAddAndEditDialog'
/**
 * @title 项目动态列表
 * @desc
 * @author liufeng
 * @date 2020/04/07
 */
export default {
  name: 'DynamicList',
  components: {
    MilepostDialog,
    RiskAddAndEditDialog,
  },

  data() {
    return {
      projectId: this.$route.query.projectId,
      // 可进行操作的动态类型
      dynamicType: {
        riskType: 4, // 风险动态
        sprintType: 5, // 迭代动态
        milepostType: 6, // 里程碑动态
        noticeType: 7, // 公告动态
        projectType: 0, // 项目动态
      },
      milepostVisible: false, //里程碑dialog 开启/关闭 状态
      milepostDetailInfo: {}, //里程碑详细信息 点击时传到弹窗里
      riskVisible: false, // 风险dialog 开启/关闭
      riskDetailInfo: {}, // 风险动态详细信息  点击时传入弹窗
      dialogVisible: false, // 是否展示信息弹窗
      dialogTitle: '需求内容详情', // 弹窗标题
      dialogContent: '', // 弹窗信息
    }
  },
  computed: {
    lastIndex() {
      return this.projectDynamicList.length - 1
    },
    // 是否显示分页信息
    isShowPagination() {
      return this.pageInfo.totalPages > 1
    },
    ...mapState({
      loading: state => state.projectOverviewDynamic.loading,
      projectDynamicList: state =>
        state.projectOverviewDynamic.projectDynamicList,
      pageInfo: state => state.projectOverviewDynamic.pageInfo,
      workItemType: state =>
        state.projectOverviewDynamic.projectDynamicInfo.workItemType,
    }),
  },

  created() {
    this.$store.dispatch('getProjectDynamic', {
      projectId: this.projectId,
    })
  },
  methods: {
    /**
     * 切换列表显示页
     */
    currentChange(num) {
      this.$store.dispatch('getProjectDynamic', {
        pageNumber: num,
        workItemType: this.workItemType,
        projectId: this.projectId,
        isPagination: true,
      })
    },
    sizeChange(pageSize) {
      this.$store.dispatch('getProjectDynamic', {
        pageNumber: 1,
        pageSize,
        workItemType: this.workItemType,
        projectId: this.projectId,
        isPagination: true,
      })
    },
    /**
     * @description: 跳转到迭代页面或者弹窗里程碑和风险
     * @param { Number } workItemType 项目动态类型 4：风险 5：迭代 6： 里程碑
     * @param { Number } workItemId 工作项id
     * @param { String } changeMark 类型
     */
    async jumpToDetail({ workItemType, workItemId, changeMark }) {
      if (
        changeMark === 'delete' &&
        workItemType !== this.dynamicType.sprintType
      ) {
        this.setDialogInfo(workItemType)
        return
      }
      const projectId = this.projectId
      // 风险弹窗
      if (workItemType === this.dynamicType.riskType) {
        this.riskDetailInfo = await this.$store.dispatch('getRiskInfoById', {
          projectId,
          id: workItemId,
        })

        if (this.riskDetailInfo) {
          this.riskDetailInfo = {
            ...this.riskDetailInfo,
            priority: this.riskDetailInfo.priority.priority,
          }
          this.riskVisible = true
        } else {
          this.setDialogInfo(workItemType)
        }
      } else if (workItemType == this.dynamicType.milepostType) {
        // 里程碑弹窗
        this.milepostDetailInfo = await this.$store.dispatch(
          'getSingleMilepostById',
          { projectId, id: workItemId },
        )

        if (this.milepostDetailInfo) {
          this.milepostVisible = true
        } else {
          this.setDialogInfo(workItemType)
        }
      } else if (workItemType == this.dynamicType.sprintType) {
        // 跳转到迭代页面
        this.$router.push(
          `/sprint/detail?projectId=${this.projectId}&sprintId=${workItemId}`,
        )
      }
    },
    // 关闭里程碑弹窗
    closeMilepostDialog() {
      this.milepostVisible = false
    },
    // 关闭风险弹窗
    closeRiskDialog() {
      this.riskVisible = false
    },
    // 是否富文本内容
    isRTFContent(type) {
      return type === 5
    },
    // 获取迭代需求内容变更
    async showNoticeOrRequireReviseSprint(log, valueType) {
      const {
        origValue,
        changeValue,
        workItemType,
        changeValueType,
        origValueType,
      } = log
      let selectedValue = valueType === 'origValue' ? origValue : changeValue
      const contentType =
        valueType === 'origValue' ? origValueType : changeValueType

      // 设置公告或需求 dialog title
      this.dialogTitle = i18n.t(
        workItemType === this.dynamicType.noticeType
          ? '项目公告信息'
          : '需求内容详情',
      )

      if (this.isRTFContent(contentType)) {
        const data = await this.$store.dispatch('getSprintRequireRevise', {
          reviseId: selectedValue,
        })

        if (data) {
          this.dialogContent = data.content
        }
      } else {
        this.dialogContent = selectedValue || '--'
      }

      this.dialogVisible = true
    },
    // 展示dialog弹窗信息
    setDialogInfo(workItemType) {
      this.dialogTitle = i18n.t('提示信息')
      this.dialogVisible = true
      this.dialogContent = `该${WorkItemTypeObj[workItemType]}已被删除，无法查看`
    },
  },
}
</script>

<style lang="scss" scoped>
@mixin center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.project-dynamic-wrapper {
  display: flex;
  flex: 1;
  margin-top: 16px;

  .dynamic-wrapper {
    width: 100%;
    min-height: 70px;

    > ul {
      margin: 0;
      padding: 0;
    }
    .dynamic-list {
      display: flex;
      list-style: none;
      justify-content: flex-start;
      min-height: 35px;
      .dynamic-list_time {
        margin-top: 4px;
        font-size: 12px;
        color: $--color-text-secondary;
      }
      .dynamic-time-line-wrapper {
        position: relative;
        width: 36px;
        text-align: center;
        transform: translateY(5px);

        .dynamic-list_spot {
          display: inline-block;
          position: absolute;
          left: 13px;
          width: 6px;
          height: 6px;
          padding: 2px;
          border-radius: 50%;
          background-color: #fff;

          &::after {
            content: '';
            display: block;
            width: 6px;
            height: 6px;
            background-color: #e5e5e5;
            border-radius: 50%;
          }
        }
        .time-line {
          display: inline-block;
          width: 4px;
          height: 100%;
          background-color: #e5e5e5;
        }
      }
      .list-break-wrap {
        margin: 0;
        flex: 1;
        line-height: 1.5;
        word-break: break-all;
        .fixed-content {
          margin: 0 2px;
        }
        .dynamic-list_item {
          color: $color-font-active-common;
        }
        .poplist-underline_add {
          cursor: pointer;
          border-bottom: 1px solid $color-font-active-common;
          padding-bottom: 1px;
        }
      }
    }
    .no-dynamic-list {
      @include center;
      height: 100px;
    }
    .no-dynamic-list,
    .dynamic-list {
      font-size: 14px;
    }
    .pagination {
      display: flex;
      justify-content: flex-end;
      // margin-top: -5px;

      /deep/ .el-select .el-input {
        width: auto;
        margin: 0;
      }
    }
  }
}
/deep/ .content-preview-dialog .el-dialog__body {
  overflow-y: auto;
  max-height: 600px;
}
</style>
