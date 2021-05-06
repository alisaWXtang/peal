<template>
  <div
    v-loading="loading"
    element-loading-text=" "
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgb(255,255,255)"
  >
    <div style="padding-bottom: 30px;">
      <el-button
        type="primary"
        class="header-filter-item"
        @click="exportExcel"
        >{{ $t('导出') }}</el-button
      >
      <el-table
        ref="taskMultipleTable"
        :data="tableList"
        class="multiple-table"
        :highlight-current-row="currentRowShow"
        row-class-name="metric-dialog-tr"
        :border="tableList.length !== 0"
        @current-change="handleCurrentChange"
      >
        <el-table-column
          prop="display.title"
          :label="$t('标题')"
          min-width="230"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span class="c-blue-hover cp" @click.stop="jump2Task(scope.row)">{{
              scope.row.display.title
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="display.priority"
          :label="$t('优先级')"
          width="80"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="display.status"
          :label="$t('状态')"
          width="80"
          show-overflow-tooltip
        ></el-table-column>
        <!-- <el-table-column :label="$t('迭代')" width="120" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.display && scope.row.display.sprint }}</span>
          </template>
        </el-table-column> -->
        <el-table-column
          prop="display.assignUser"
          :label="$t('处理人')"
          width="70"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="display.createUser"
          :label="$t('创建人')"
          width="70"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="startTime"
          :label="$t('预计开始时间')"
          width="160"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="endTime"
          :label="$t('预计结束时间')"
          width="160"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          v-if="parentType === 'sprintDetail'"
          prop="finishTime"
          :label="$t('实际完成时间')"
          width="160"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>

      <el-pagination
        class="fr mr10"
        style="margin-top:4px;"
        :current-page="pageInfo.pageNumber"
        :page-size="pageInfo.pageSize"
        :total="pageInfo.totalRecords"
        layout="total, prev, pager, next"
        @size-change="defectSizeChange"
        @current-change="defectCurChange"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
/**
 * @title 任务 table
 * @desc 简版，通常放在 dialog 内部使用
 * @author heyunjiang
 * @date
 */
export default {
  name: 'TaskTable',
  components: {},
  mixins: [],
  props: {
    list: {
      type: Array,
      required: true,
      desc: '表格数据',
    },

    pageInfo: {
      type: Object,
      required: true,
      desc: '分页器',
    },

    loading: {
      type: Boolean,
      required: false,
      default: false,
    },

    parentType: {
      type: String,
      desc: '父级类型，用于使用差异化的处理',
    },
  },

  data() {
    return {
      currentRowShow: false,
      currentTableSelectId: '', //当前行id,主要用于更新数据时，列表更新不会选中当前行问题
      tableList: [],
      currentRow: null,
    }
  },
  computed: {},
  watch: {
    // 监听表格数据的更新
    list: {
      handler(newValue) {
        if (newValue) {
          this.tableList = newValue
        }
        //  当数据更新了，选中刚点击的哪一行
        if (this.currentTableSelectId && newValue) {
          let currentItem = this.list.find(
            item => item.id == this.currentTableSelectId,
          )

          this.$refs.taskMultipleTable.setCurrentRow(currentItem)
        }
      },
    },
  },

  created() {},
  methods: {
    handleCurrentChange(val) {
      this.currentRow = val
      this.currentRowShow = true
    },
    // 分页
    defectCurChange(val) {
      this.$emit('pageChange', {
        ...this.pageInfo,
        pageNumber: val,
      })
    },
    defectSizeChange() {},
    jump2Task(row) {
      // let url = "/task/view?projectId="+ projectId+ "&taskId=" + id;
      // window.open(url, '_blank');
      this.currentTableSelectId = row.id
      this.$refs.taskMultipleTable.setCurrentRow(row)
      let info = {
        projectId: row.projectId,
        id: row.id,
        type: 'task',
      }

      this.currentRowShow = true
      this.$emit('metricSlide', info)
    },
    // 表格导出
    exportExcel() {
      this.$emit('exportExcel')
    },
  },
}
</script>
<style lang="scss" scoped>
// .el-table__body tr.current-row>td {
//   background: #ccc !important;
// }
.header-filter-item {
  margin-bottom: 8px;
}
/deep/ .el-table.el-table--mini .el-table__header thead > tr:first-child {
  height: 51px;
}
</style>
