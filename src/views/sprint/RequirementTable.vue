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
      <template v-if="tableType === 'number'">
        <el-table
          ref="requireMultipleTable"
          :data="tableList"
          class="multiple-table"
          :highlight-current-row="currentRowShow"
          row-class-name="metric-dialog-tr"
          :border="tableList.length !== 0"
          @current-change="handleCurrentChange"
        >
          <el-table-column
            :label="$t('标题')"
            min-width="130"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span
                class="c-blue-hover cp"
                @click.stop="jump2Reqt(scope.row)"
                >{{ scope.row.display && scope.row.display.title }}</span
              >
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('优先级')"
            width="70"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ scope.row.display && scope.row.display.priority }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column
            :label="$t('迭代')"
            width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ scope.row.display && scope.row.display.sprint }}</span>
            </template>
          </el-table-column> -->
          <el-table-column :label="$t('状态')" width="80" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.display && scope.row.display.status }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('处理人')"
            width="80"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{
                scope.row.display && scope.row.display.assignUser
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('需求分类')"
            width="100"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ scope.row.display && scope.row.display.category }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('创建时间')"
            width="100"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{
                scope.row.createTime && scope.row.createTime.split(' ')[0]
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('开始时间')"
            width="100"
            show-overflow-tooltip
          >
            <template slot-scope="scope">{{ scope.row.startTime }} </template>
          </el-table-column>
          <el-table-column
            :label="$t('结束时间')"
            width="100"
            show-overflow-tooltip
          >
            <template slot-scope="scope">{{ scope.row.endTime }} </template>
          </el-table-column>
          <el-table-column
            v-if="parentType === 'sprintDetail'"
            :label="$t('实际完成时间')"
            width="160"
            show-overflow-tooltip
          >
            <template slot-scope="scope">{{ scope.row.finishTime }} </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-else>
        <el-table :data="tableList" stripe>
          <el-table-column
            :label="$t('时间')"
            width="180"
            show-overflow-tooltip
          >
            <template slot-scope="scope">{{ scope.row.time }} </template>
          </el-table-column>

          <el-table-column
            :label="$t('操作者')"
            width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">{{ scope.row.userName }} </template>
          </el-table-column>
          <el-table-column
            :label="$t('变更内容')"
            min-width="230"
            show-overflow-tooltip
          >
            <template slot-scope="scope">{{ scope.row.content }} </template>
          </el-table-column>
        </el-table>
      </template>

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
 * @title 需求 table
 * @desc 简版，通常放在 dialog 内部使用
 * @author heyunjiang
 * @date
 */
export default {
  name: 'RequirementTable',
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
  computed: {
    tableType() {
      let type = 'number'
      if (this.list.length > 0 && this.list[0].content) {
        type = 'change'
      }
      return type
    },
  },

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

          this.$refs.requireMultipleTable.setCurrentRow(currentItem)
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
    jump2Reqt(row) {
      this.currentTableSelectId = row.id
      this.$refs.requireMultipleTable.setCurrentRow(row)
      let info = {
        projectId: row.projectId,
        id: row.id,
        type: 'requirement',
      }

      this.currentRowShow = true
      this.$emit('metricSlide', info)
      // let url = "/requirement/list?projectId="+ projectId+ "&requireId=" + id;
      // window.open(url, '_blank');
    },
    exportExcel() {
      this.$emit('exportExcel')
    },
  },
}
</script>
<style lang="scss">
.metric-current-title {
  // color:blue !important;
  background: #ccc !important;
}
</style>
<style lang="scss" scoped>
.header-filter-item {
  margin-bottom: 8px;
}
/deep/ .el-table.el-table--mini .el-table__header thead > tr:first-child {
  height: 51px;
}
</style>
