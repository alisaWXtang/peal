<template>
  <div :key="feedbackSource" class="feedback-list__container">
    <co-row class="feedback-inter-list mb15">
      <co-col :span="24">
        <co-table
          v-if="feedbackSource === feedbackSourceInner"
          :border="true"
          :data="feedbackList"
          :empty-text="$t('暂无数据')"
          highlight-current-row
          style="width: 100%;"
          :class="feedbackList && feedbackList.length > 0 ? '' : 'cotable'"
        >
          <co-table-column
            label="ID"
            min-width="80"
            prop="display.id"
            show-overflow-tooltip
          >
            <template #default="scope">
              <co-link
                style="display: inline-block;"
                type="primary"
                :underline="false"
                @click="tableCellClick(scope.row, scope.column)"
                @mousedown.stop
                @mouseup.stop
                >{{ scope.row.display.id }}</co-link
              >
            </template>
          </co-table-column>
          <co-table-column
            :label="$t('标题')"
            prop="display.title"
            min-width="250"
          >
            <template #default="scope">
              <co-link
                type="primary"
                :underline="false"
                @click="tableCellClick(scope.row, scope.column)"
                @mousedown.stop
                @mouseup.stop
                >{{ scope.row.display.title }}</co-link
              >
            </template>
          </co-table-column>
          <co-table-column
            prop="display.productName"
            :label="$t('产品名称')"
            min-width="150"
            show-overflow-tooltip
          >
            <template #default="scope">{{
              scope.row.display.productName
            }}</template>
          </co-table-column>
          <co-table-column
            prop="display.feedbackTypeName"
            :label="$t('反馈类型')"
            min-width="160"
            show-overflow-tooltip
          >
          </co-table-column>
          <co-table-column
            v-if="feedbackSource === feedbackSource400"
            :label="$t('问题等级')"
            prop="display.problemLevelName"
            min-width="80"
          ></co-table-column>
          <co-table-column
            prop="display.priority"
            :label="$t('优先级')"
            min-width="100"
            show-overflow-tooltip
          >
          </co-table-column>
          <co-table-column :label="$t('状态')" width="90" show-overflow-tooltip>
            <template #default="scope">
              <div
                class="status-tag"
                :style="
                  `color: ${scope.row.detail.status.color};border: 1px solid ${scope.row.detail.status.color}`
                "
              >
                {{ scope.row.display.status }}
              </div>
            </template>
          </co-table-column>
          <co-table-column
            prop="display.replyResultName"
            :label="$t('回复结果')"
            min-width="100"
            show-overflow-tooltip
          >
          </co-table-column>
          <co-table-column
            prop="display.currentProcessorNames"
            :label="$t('当前处理人')"
            min-width="200"
            show-overflow-tooltip
          >
            <template v-slot="scope">
              <global-user-select
                v-if="scope.row._opertionUser"
                ref="globalUserSelect"
                :filter-invalid="true"
                value=""
                :is-focus="true"
                placeholder="输入拼音/工号/姓名"
                @visibleChange="val => selectUserVisibleChange(val, scope.row)"
                @change="val => selectUserChange(val, scope.row)"
              ></global-user-select>
              <span
                v-else
                :class="{
                  'select-user':
                    scope.row.data.status == 1 &&
                    scope.row.data.currentProcessors.includes(
                      currentUser.userId,
                    ),
                }"
                :title="
                  scope.row.data.status == 1 &&
                    scope.row.data.currentProcessors.includes(
                      currentUser.userId,
                    ) &&
                    '点击选择处理人'
                "
                @click="handleSelectUser(scope.row)"
                >{{ scope.row.display.currentProcessorNamesList }}</span
              >
            </template>
          </co-table-column>
          <co-table-column
            :label="$t('创建人')"
            min-width="150"
            show-overflow-tooltip
          >
            <template v-slot="scope">
              {{ scope.row.display.createUserName }}({{
                scope.row.data.createUser
              }})
            </template>
          </co-table-column>
          <co-table-column
            prop="display.createTime"
            :label="$t('反馈时间')"
            min-width="160"
            show-overflow-tooltip
          >
          </co-table-column>
          <co-table-column
            prop="display.lastUpdateTime"
            :label="$t('上次处理时间')"
            min-width="160"
            show-overflow-tooltip
          >
          </co-table-column>
        </co-table>
        <co-table
          v-else
          :data="feedbackList"
          :max-height="tableHeight"
          highlight-current-row
          :border="true"
          style="width: 100%"
          :class="feedbackList && feedbackList.length > 0 ? '' : 'cotable'"
        >
          <co-table-column
            label="ID"
            min-width="80"
            prop="display.id"
            show-overflow-tooltip
          >
            <template #default="scope">
              <co-link
                style="display: inline-block;"
                type="primary"
                :underline="false"
                @click="tableCellClick(scope.row, scope.column)"
                @mousedown.stop
                @mouseup.stop
                >{{ scope.row.display.id }}</co-link
              >
            </template>
          </co-table-column>
          <co-table-column
            :label="$t('标题')"
            prop="display.title"
            min-width="250"
          >
            <template #default="scope">
              <co-link
                type="primary"
                :underline="false"
                @click="tableCellClick(scope.row, scope.column)"
                @mousedown.stop
                @mouseup.stop
                >{{ scope.row.display.title }}</co-link
              >
            </template>
          </co-table-column>
          <co-table-column
            v-if="feedbackSource === feedbackSource400"
            :label="$t('移动互联网单号')"
            prop="display.singleText1"
            min-width="130"
          ></co-table-column>
          <co-table-column
            prop="display.productName"
            :label="$t('产品名称')"
            min-width="150"
            show-overflow-tooltip
          >
          </co-table-column>
          <co-table-column
            prop="display.feedbackTypeName"
            :label="$t('反馈类型')"
            min-width="150"
            show-overflow-tooltip
          >
          </co-table-column>
          <co-table-column
            v-if="feedbackSource === feedbackSource400"
            :label="$t('问题等级')"
            prop="display.problemLevelName"
            min-width="80"
          ></co-table-column>
          <co-table-column
            :prop="
              feedbackSource === feedbackSourceInner
                ? 'display.priority'
                : 'display.feedbackLevelName'
            "
            :label="
              feedbackSource === feedbackSourceInner
                ? $t('优先级')
                : $t('反馈级别')
            "
            min-width="100"
            show-overflow-tooltip
          >
          </co-table-column>
          <co-table-column
            :label="$t('状态')"
            width="140"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div
                class="status-tag"
                :style="
                  `color: ${scope.row.detail.status.color};border: 1px solid ${scope.row.detail.status.color}`
                "
              >
                {{ scope.row.display.status }}
              </div>
            </template>
          </co-table-column>
          <co-table-column
            prop="display.currentProcessorNames"
            :label="$t('当前处理人')"
            min-width="200"
            show-overflow-tooltip
          >
            <template v-slot="scope">
              <global-user-select
                v-if="scope.row._opertionUser"
                ref="globalUserSelect"
                :filter-invalid="true"
                value=""
                :is-focus="true"
                :placeholder="$t('输入拼音/工号/姓名')"
                @visibleChange="val => selectUserVisibleChange(val, scope.row)"
                @change="val => selectUserChange(val, scope.row)"
              ></global-user-select>
              <span
                v-else
                :class="{
                  'select-user':
                    scope.row.data.status == 1 &&
                    scope.row.data.currentProcessors.includes(
                      currentUser.userId,
                    ),
                }"
                :title="
                  scope.row.data.status == 1 &&
                    scope.row.data.currentProcessors.includes(
                      currentUser.userId,
                    ) &&
                    $t('点击选择处理人')
                "
                @click="handleSelectUser(scope.row)"
                >{{ scope.row.display.currentProcessorNamesList }}</span
              >
            </template>
          </co-table-column>
          <co-table-column
            prop="display.createTime"
            :label="$t('反馈时间')"
            min-width="160"
            show-overflow-tooltip
          >
          </co-table-column>
          <co-table-column
            prop="display.lastUpdateTime"
            :label="$t('上次处理时间')"
            min-width="160"
            show-overflow-tooltip
          >
          </co-table-column>
        </co-table>
      </co-col>
    </co-row>
    <co-row type="flex" justify="end">
      <co-col class="list__pagination" :span="24">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[15, 30, 50]"
          :current-page="pageInfo.pageNumber"
          :page-size="pageInfo.pageSize"
          :total="pageInfo.totalRecords"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </co-col>
    </co-row>
  </div>
</template>
<script>
/**
 * @title 反馈列表
 * @author wuqian
 * @date 2020.5.2
 */
import { operationActionTypes } from '@/store/action-types'
import { mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import GlobalUserSelect from '@/components/global-user-select'
import { USER_INFO, OPERATION } from '@/utils/constant'
import { getStorage } from '@/utils'
import { updateFeedback } from '@/service/operation/feedback'

export default {
  name: 'FeedbackList',
  components: {
    GlobalUserSelect,
  },

  data() {
    return {
      pageInfo: {},
      feedbackSourceInner: OPERATION.FEEDBACK_SOURCE_INNER, // 0
      feedbackSource400: OPERATION.FEEDBACK_SOURCE_400, // 400反馈
      currentUser: getStorage(USER_INFO),
    }
  },
  computed: {
    ...mapState({
      _pageInfo: state => state.operationFeedbackList.pageInfo,
      feedbackListLoading: state =>
        state.operationFeedbackList.feedbackListLoading,
      feedbackList: state => state.operationFeedbackList.feedbackList,
      feedbackSource: state => state.operationFeedbackList.feedbackSource,
      filterInfo: state => state.operationFeedbackList.filterInfo,
    }),

    tableHeight() {
      return window.innerHeight - 235 + 'px'
    },
  },

  watch: {
    _pageInfo: {
      handler: function(val) {
        this.pageInfo = cloneDeep(val)
      },
      immediate: true,
    },
  },
  methods: {
    handleSizeChange(pageSize) {
      this.pageInfo.pageNumber = 1
      this.pageInfo.pageSize = pageSize
      this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_GET_FEEDBACK_LIST,
        {
          pageInfo: this.pageInfo,
        },
      )
    },
    handleCurrentChange(pageNumber) {
      this.pageInfo.pageNumber = pageNumber
      this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_GET_FEEDBACK_LIST,
        {
          pageInfo: this.pageInfo,
        },
      )
    },
    tableCellClick(row, column) {
      this.$emit('table-cell-click', row, column)
    },
    // 人员选择
    selectUserChange(val, row) {
      if (val && val.userId) {
        updateFeedback({
          id: row.data.id,
          currentProcessors: [val.userId],
          source: row.data.source,
        }).then(res => {
          if (res.status == 200) {
            this.$message.success(this.$i18n.t('修改处理人成功'))

            this.$store.dispatch(
              operationActionTypes.ACTION_OPERATION_FEEDBACK_GET_FEEDBACK_LIST,
              {
                pageInfo: this.pageInfo,
              },
            )
          }
        })
      }
    },
    selectUserVisibleChange(val, row) {
      !val && this.$set(row, '_opertionUser', 0)
    },
    handleSelectUser(row) {
      if (
        row.data.status == 1 &&
        row.data.currentProcessors.includes(this.currentUser.userId)
      ) {
        const select = []
        const userNames = row.display.currentProcessorNames.split(',')
        row.data.currentProcessors.forEach((userId, key) => {
          select.push({
            userId,
            userName: userNames[key],
          })
        })
        this.currentProcessorsSelects = select
        this.$set(row, '_opertionUser', 1)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.list__pagination {
  text-align: right;
  display: flex;
  justify-content: flex-end;
}

.select-user {
  display: block;
  padding: 1px 3px;
  margin-left: -4px;
  border: 1px solid transparent;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover {
    border: 1px solid #eee;
  }

  &:focus {
    outline: unset;
  }
}
.status-tag {
  display: inline-block;
  border-radius: 5px;
  padding: 0 3px;
  color: #fff;
}
.feedback-list__container {
  height: calc(100% - 46px) !important;
}
.feedback-inter-list {
  height: 100% !important;
  overflow: auto !important;
  /deep/.el-table {
    border-width: 0 !important;
    th {
      border-right: 2px solid #fff !important;
    }
    td {
      border-right: none !important;
    }
  }
}
/deep/.el-col-24 {
  height: 100% !important;
  .cotable {
    height: 100% !important;
    .el-table__body-wrapper {
      height: calc(100% - 46px) !important;
    }
  }
}
</style>
