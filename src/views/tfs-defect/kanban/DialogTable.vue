<template>
  <div class="dialog">
    <co-dialog
      :visible.sync="show"
      :title="$t('缺陷详情')"
      v-bind="$attrs"
      :modal-append-to-body="false"
      width="60%"
      @closed="closeDialog"
    >
      <div class="export">
        <co-button type="primary" @click="exportSheet">{{
          $t('导出')
        }}</co-button>
      </div>
      <div class="table">
        <el-table
          class="tfs-defect-table"
          :data="blockDefectList"
          row-key="id"
          border
          :indent="0"
          default-expand-all
          max-height="500px"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column
            min-width="120"
            prop="id"
            label="ID"
            show-overflow-tooltip
            class-name="table-cell-content"
          ></el-table-column>
          <el-table-column min-width="220" prop="title" :label="$t('标题')">
            <template #default="scope">
              <el-link
                style="display: inline"
                type="primary"
                :underline="false"
                target="_blank"
                :href="getTfsDefectUrl(scope.row)"
                >{{ scope.row.title }}</el-link
              >
            </template>
          </el-table-column>
          <el-table-column
            min-width="110"
            prop="display.severity"
            show-overflow-tooltip
            :label="$t('原始缺陷等级')"
          ></el-table-column>
          <el-table-column
            min-width="80"
            prop="display.status"
            show-overflow-tooltip
            :label="$t('状态')"
          ></el-table-column>
          <el-table-column
            min-width="100"
            prop="display.assignUser"
            show-overflow-tooltip
            :label="$t('指派给')"
          ></el-table-column>
          <el-table-column
            min-width="120"
            prop="display.module"
            show-overflow-tooltip
            :label="$t('模块')"
          ></el-table-column>
          <el-table-column
            min-width="180"
            prop="createTime"
            show-overflow-tooltip
            :label="$t('创建时间')"
          ></el-table-column>
        </el-table>
        <div class="list-pagination-box">
          <el-pagination
            class="list-pagination"
            :current-page="pageInfo.pageNumber"
            :page-size="pageInfo.pageSize"
            :total="totalRecords"
            layout="total, prev, pager, next"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>
    </co-dialog>
  </div>
</template>
<script>
/**
 * @description 阻塞问题数列表
 * @time 2020.9.14
 */
import { mapState } from 'vuex'
import { tfsDefectAction } from '@/store/action-types'
export default {
  name: 'DialogTable',
  props: {
    visible: {
      type: Boolean,
      desc: '是否显示 Dialog',
    },
    filterInfo: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      show: false,
      pageInfo: {
        pageSize: 15,
        pageNumber: 1,
      },
      exportUrl: '/api/tfs/defect/board/popup/export',
      defectList: [],
    }
  },
  computed: {
    ...mapState({
      blockDefectList: state => state.tfsKanban.blockDefectList,
      totalRecords: state => state.tfsKanban.blockDefectListTotal,
    }),
  },
  watch: {
    visible: {
      handler: function(val) {
        this.show = val
      },
      immediate: true,
    },
    show() {
      if (this.show) {
        const { filterInfo, pageInfo } = this
        this.$store.dispatch(tfsDefectAction.GET_TSF_KANBAN_BLOCK_DEFECT_LIST, {
          ...filterInfo,
          pageInfo,
        })
      } else {
        this.pageInfo = {
          pageNumber: 1,
          pageSize: 15,
        }
      }
    },
  },
  created() {},
  methods: {
    getTfsDefectUrl(row) {
      return row.display?.detail?.url || ''
    },
    exportSheet() {
      const { filterInfo, pageInfo } = this
      this.$fileDownLoadForGet(this.exportUrl, { ...filterInfo, pageInfo }, {})
    },
    handleCurrentChange(num) {
      this.pageInfo.pageNumber = num
      const { filterInfo, pageInfo } = this
      this.$store.dispatch(tfsDefectAction.GET_TSF_KANBAN_BLOCK_DEFECT_LIST, {
        ...filterInfo,
        pageInfo,
      })
    },
    closeDialog() {
      this.$emit('update:visible', false)
    },
  },
}
</script>
<style lang="scss" scoped>
.dialog {
  .export {
    padding-bottom: 10px;
  }
}
.list-pagination-box {
  overflow: hidden;
  margin-top: 16px;
  .list-pagination {
    float: right;
  }
}
.tfs-defect-table {
  width: 100%;
  margin-bottom: 15px;
  /deep/ .table-cell-content .cell {
    padding-left: 33px;
  }
  /deep/ .el-table__expand-icon {
    margin-left: -23px;
  }

  /deep/ .el-table__body-wrapper {
    @include scrollbal-common;
  }
}
/deep/ .el-table .el-table__expand-icon .el-icon-arrow-right:before {
  content: '\e6d9';
}
/deep/ .el-table .el-table__expand-icon--expanded {
  transform: rotate(0);
  .el-icon-arrow-right:before {
    content: '\e6d8';
  }
}
</style>
