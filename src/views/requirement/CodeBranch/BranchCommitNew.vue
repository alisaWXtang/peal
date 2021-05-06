<template>
  <div class="commit-box">
    <code-commit
      v-show="isShow"
      :work-item-id="workItemId"
      :work-item-type="workItemType"
      :project-id="projectId"
      :is-show="isShow"
    ></code-commit>
    <div v-show="!isShow">
      <el-table :data="tableData.list" max-height="600" style="width: 100%">
        <el-table-column
          prop="commitId"
          label="CommitId"
          show-overflow-tooltip
          width="100"
        >
          <template slot-scope="scope">
            <span
              type="text"
              style="color: #409EFF;"
              class="cp"
              @click="handleClickl(scope.row.gitCommitUrl)"
              >{{ scope.row.shortCommitId }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="commitMsg"
          :label="$t('提交日志')"
          show-overflow-tooltip
          min-width="80"
        >
        </el-table-column>
        <el-table-column
          prop="commitUserName"
          :label="$t('提交者')"
          show-overflow-tooltip
          width="140"
        >
          <template slot-scope="scope">
            <span
              >{{ scope.row.commitUserName }}({{ scope.row.commitUser }})
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="commitTime"
          :label="$t('提交时间')"
          width="160"
          show-overflow-tooltip
        >
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="block" align="center" style="margin-top: 20px;">
        <el-pagination
          :current-page="tableData.pageNum"
          :page-sizes="[20, 50, 100]"
          :page-size="tableData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * @title 新版 - 分支提交记录
 * @desc
 * @author zhengruiqin
 * @date 2019.11.22
 */

import CodeCommit from '@/components/code-commit/indexNewTable'
import { branchCommitsQuery } from '@/service/code'

export default {
  name: 'BranchCommitNew',
  components: {
    CodeCommit,
  },

  mixins: [],
  props: {
    branchId: {
      type: [String, Number],
      required: false,
      desc: '分支id',
    },

    projectId: {
      type: [String, Number],
      required: true,
    },

    workItemId: {
      type: [Number, String],
      required: true,
    },

    workItemType: {
      type: [Number, String],
      required: true,
    },
  },

  data() {
    return {
      isShow: false, // 是否展示
      tableData: { list: [] }, //分支提交记录表格数据
      filterInfo: {
        branchId: 0,
        pageNum: 1,
        pageSize: 20,
      },

      //分支请求信息
    }
  },
  computed: {},
  watch: {
    // modalStatus() {
    //   this.dialogShow = this.modalStatus;
    //   if(this.dialogShow === true) {
    //     this.getBranchCommitsQuery();
    //   }
    // },
    branchId() {
      if (this.branchId === 'workItem') {
        this.isShow = true
        return
      } else {
        this.filterInfo.pageNum = 1
        this.isShow = false
        this.getBranchCommitsQuery()
      }
    },
  },

  created() {},
  mounted() {},
  methods: {
    // 点击取消
    cancel() {
      this.filterInfo.pageNum = 1
      this.filterInfo.pageSize = 20
      this.$emit('update:modalStatus', false)
    },
    //分支提交记录数据
    async getBranchCommitsQuery() {
      this.filterInfo.branchId = this.branchId
      let result = await branchCommitsQuery(this.filterInfo)

      if (result.status === 200) {
        this.tableData = result.data.gitCommits
        // this.tableData.list.commitId = result.data.gitCommits.list.map(item=>{
        // return  item.commitId = item.commitId.substr(0,8)
        // });
      }
    },
    //分页
    handleSizeChange(val) {
      this.filterInfo.pageSize = val
      this.getBranchCommitsQuery()
    },
    handleCurrentChange(val) {
      this.filterInfo.pageNum = val
      this.getBranchCommitsQuery()
    },
    // 点击跳转gitlab
    handleClickl(data) {
      window.open(data, '_blank')
    },
  },
}
</script>
<style lang="scss" scoped>
.commit-box {
  margin-top: 10px;
}
</style>
