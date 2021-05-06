<template>
  <div class="ui-report-list">
    <el-tabs
      v-model="activeName"
      size="medium"
      class="metric-table-top"
      @tab-click="handleClick"
    >
      <el-tab-pane
        v-for="tab in tabList"
        :key="tab.type"
        :label="tab.display"
        :name="tab.type"
      ></el-tab-pane>
      <co-input
        v-model="reportName"
        class="search-input"
        :placeholder="$t('请输入报告名称')"
        prefix-icon="co-icon-search"
        @keyup.enter.native="search"
        @clear="search"
      ></co-input>
      <!-- <el-form :inline="true" @submit.native.prevent>
        <el-form-item class="header-filter-item">
          <el-input
            v-model="reportName"
            v-focus
            :class="{ 'z--en': $isEnglish() }"
            :placeholder="$t('请输入报告名称')"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="search">{{ $t('查询') }}</el-button>
        </el-form-item>
      </el-form> -->

      <el-table
        v-loading="listLoading || loading"
        class="multiple-table"
        :data="list"
        border
      >
        <el-table-column :label="$t('报告名称')" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button
              type="text"
              class="report-title el-tooltip"
              @click="reportDetail(scope.row)"
              >{{ scope.row.title }}</el-button
            >
          </template>
        </el-table-column>
        <el-table-column :label="$t('报告类型')" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="el-tooltip">{{ scope.row.type.display }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('状态')" width="200">
          <template slot-scope="scope">
            <span
              class="status-tip"
              :class="statusColor(scope.row.status.value)"
            ></span>
            <span class="el-tooltip">{{ scope.row.status.display }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="activeName === 'DraftBox'"
          prop="createTime"
          :label="$t('创建时间')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          v-else
          prop="sendTime"
          :label="$t('发送时间')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('创建人')"
          width="200"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span class="el-tooltip">{{ scope.row.createUser.display }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="showReEditColumn || showDeleteColumn"
          :label="$t('操作')"
          width="120"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-button
              v-if="showReEditColumn"
              type="text"
              class="el-tooltip operate-btn"
              @click="reEditReport(scope.row.id, activeName)"
              >{{ $t('重新编辑') }}</el-button
            >
            <el-button
              v-if="showDeleteColumn"
              type="text"
              class="el-tooltip operate-btn"
              @click="deleteReport(scope.row.id, activeName)"
              >{{ $t('删除') }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        class="pagination"
        :current-page="pageInfo.pageNumber"
        :page-size="pageInfo.pageSize"
        :total="totalRecords"
        layout="total, prev, pager, next,sizes,jumper"
        @size-change="sizeChange"
        @current-change="currentChange"
      ></el-pagination>
    </el-tabs>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 报告列表
 * @desc
 * @author huangmei
 * @date
 */
import { mapState } from 'vuex'
import { projectReportActionTypes } from '@/store/action-types'
import HTTPINFOMAP from './HTTPINFOMAP'
import ReportMixin from './ReportMixin'

import reportService from '@/service/report'

export default {
  name: 'ReportList',
  components: {},
  mixins: [ReportMixin],
  props: {
    reportId: [Number, String],
  },

  data() {
    return {
      reportName: '', // 查询名称
      activeName: this.$store.getters.getDraft ? 'DraftBox' : 'All',
      pageInfo: {
        pageNumber: 1,
        pageSize: 10,
      },
    }
  },
  computed: {
    ...mapState({
      listLoading: state => state.projectReportList.loading,
      tabList: state => state.projectReportList.reportListTabs,
      list: state => state.projectReportList.reportList,
      totalRecords: state => state.projectReportList.reportListTotalRecords,
    }),

    showReEditColumn() {
      // 非草稿列表显示重新编辑按钮
      return this.activeName !== 'DraftBox'
    },

    showDeleteColumn() {
      // 非草稿列表检测删除报告权限
      return (
        this.activeName === 'DraftBox' ||
        this.$authFunction('FUNC_COOP_REPORT_DELETE_REPORT', 3)
      )
    },
  },

  watch: {
    activeName(val) {
      this.reportName = ''
      // 清除分页信息
      this.pageInfo = {
        pageNumber: 1,
        pageSize: 10,
      }

      this.getLists(val)
    },
  },

  created() {
    this.getLists()
  },
  methods: {
    statusColor(status) {
      if (status === 'Sent') {
        return 'primary'
      } else if (status === 'Draft') {
        return 'gray'
      }
      return 'blue'
    },
    // 删除报告\草稿
    deleteReport(id, type) {
      const reportType = ['All', 'DeliverToTest', 'Other'].includes(type)
        ? 'report'
        : 'draft'
      const tips = {
        report: i18n.t(
          '确定删除项目报告吗？一旦删除，报告接收人将不能再查看该报告。',
        ),
        draft: i18n.t('确认删除报告吗？'),
      }

      this.$confirm(tips[reportType], {
        type: 'warning',
      }).then(() => {
        this.$store
          .dispatch(projectReportActionTypes.ACTION_DELETE_PROJECT_REPORT, {
            type: reportType,
            payload: { id },
          })
          .then(() => {
            this.$message({
              type: 'success',
              message: i18n.t('删除成功'),
            })

            const page = this.totalRecords % 10
            if (this.pageInfo.pageNumber > 1 && page === 1) {
              this.pageInfo.pageNumber = this.pageInfo.pageNumber - 1
            }
            this.getLists()
          })
          .catch(() => {
            this.$message({
              type: 'error',
              message: i18n.t('系统错误'),
            })
          })
      })
    },
    async reEditReport(id) {
      try {
        const result = await reportService.createReport({
          projectId: this.$route.query.projectId,
        })
        await this.queryReport(id)
        const params = {
          ...this.params,
          reportId: result.data[HTTPINFOMAP.reportId],
          shortCut: 1,
        }
        await reportService.saveDraft(params)
        this.$router.push({
          path: '/report/edit',
          query: {
            ...this.$route.query,
            reportId: result.data[HTTPINFOMAP.reportId],
            type: 'draft',
          },
        })
      } catch (e) {
        console.log(e)
      }
    },
    handleClick({ name }) {
      this.countlyLog(`project_reportDetail_${name}`)
    },
    // 表格内容
    async getLists() {
      this.$store.dispatch(
        projectReportActionTypes.ACTION_GET_PROJECT_REPORT_LIST,
        {
          title: this.reportName,
          type: this.activeName,
          pageInfo: { ...this.pageInfo },
          projectId: this.$getUrlParams().projectId,
        },
      )
    },
    // 查询
    search() {
      // 清除分页信息
      this.pageInfo = {
        pageNumber: 1,
        pageSize: 10,
      }
      this.getLists()
    },
    sizeChange(pageSize) {
      this.pageInfo.pageSize = pageSize
      this.getLists()
    },
    // 分页
    currentChange(val) {
      this.pageInfo.pageNumber = val
      this.getLists()
    },
    //  草稿--> 详情 已发送--> 预览
    reportDetail(row) {
      this.$emit('update:reportId', row.id)
      if (row.status.value === 'Draft') {
        this.$store.dispatch('setReportDraft', true)
        this.$emit('pageTypeChange', 'draft')
      } else {
        this.$emit('emailPreview')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.ui-report-list {
  /deep/ .el-tabs__item.is-active {
    color: $--color-primary !important;
  }

  .multiple-table /deep/ {
    .el-table__header-wrapper {
      height: auto;
    }
    .report-title {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status-tip {
      display: inline-block;
      width: 6px;
      height: 6px;
      margin: 0 6px 2px 0;
      border-radius: 3px;
      background-color: #007aff;
      &.primary {
        background-color: $--color-primary;
      }
      &.gray {
        background-color: #d5d5d5;
      }
    }

    .operate-btn {
      color: $--color-primary;
    }
  }

  .search-input {
    width: 250px;
    margin-bottom: 16px;

    /deep/ .el-input__inner {
      padding-left: 30px;
      border-radius: 4px;
    }
  }
  // .z--en {
  //   width: 200px;
  // }

  .pagination {
    display: flex;
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
