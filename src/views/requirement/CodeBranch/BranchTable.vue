<template>
  <div
    v-loading="loading"
    element-loading-text=" "
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgb(255,255,255)"
  >
    <div style="padding-bottom: 30px;">
      <!--TODO 列表中的scope.row.branchInfo.appId均为项目这边储存的psaId，因为涉及到其后台代码修改，这里暂时做这样的处理-->
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        class="tableButton"
      >
        <el-table-column
          prop="branchInfo.originalBranch"
          class="BranchTable"
          :label="$t('分支名称')"
          min-width="120"
        >
          <template slot-scope="scope">
            <div
              v-if="
                $authFunction(
                  'FUNC_APP_PIPELINE_EXECUTE_WHOLE',
                  2,
                  scope.row.branchInfo.appId,
                )
              "
            >
              <div
                v-if="
                  scope.row.branchInfo.developMode === 0 &&
                    scope.row.branchInfo.del === 1
                "
              >
                <el-tooltip
                  :content="$t('Git分支已被删除')"
                  placement="top-start"
                >
                  <i
                    class="el-icon-warning warning"
                    style="vertical-align: text-bottom;"
                  ></i>
                </el-tooltip>
                <span style="width: calc(100% - 50px);display: inline-block;">
                  <ellipsis-block
                    class="ellipsis-block-common-title  cursorDefault"
                    :value="
                      scope.row.branchInfo.developMode === 0
                        ? scope.row.branchInfo.originalBranch
                        : scope.row.branchInfo.featureBranch
                    "
                  ></ellipsis-block>
                </span>
              </div>
              <div
                v-else-if="
                  scope.row.branchInfo.developMode === 1 &&
                    scope.row.branchInfo.close === 1
                "
              >
                <el-tooltip
                  :content="$t('该分支已关闭变更/合并主干')"
                  placement="top-start"
                >
                  <i
                    class="el-icon-warning"
                    style="vertical-align: text-bottom;"
                  ></i>
                </el-tooltip>
                <span style="width: calc(100% - 50px);display: inline-block;">
                  <ellipsis-block
                    class="ellipsis-block-common-title  cursorDefault"
                    :value="
                      scope.row.branchInfo.developMode === 0
                        ? scope.row.branchInfo.originalBranch
                        : scope.row.branchInfo.featureBranch
                    "
                  ></ellipsis-block>
                </span>
              </div>
              <div
                v-else-if="
                  scope.row.branchInfo.developMode === 1 &&
                    scope.row.branchInfo.del === 1 &&
                    scope.row.branchInfo.close === 0
                "
                show-overflow-tooltip
              >
                <el-tooltip
                  :content="$t('Git分支已被删除')"
                  placement="top-start"
                >
                  <i
                    class="el-icon-warning warning"
                    style="vertical-align: text-bottom;"
                  ></i>
                </el-tooltip>
                <span
                  style="color: red; width: calc(100% - 50px);display: inline-block;"
                  class="cp"
                >
                  <ellipsis-block
                    class="ellipsis-block-common-title"
                    :value="
                      scope.row.branchInfo.developMode === 0
                        ? scope.row.branchInfo.originalBranch
                        : scope.row.branchInfo.featureBranch
                    "
                    @click="handleClickl(scope.row)"
                  ></ellipsis-block>
                </span>
              </div>
              <div v-else>
                <span
                  style="color: #2196F3; width: 100%;display: inline-block;"
                  class="cp"
                >
                  <ellipsis-block
                    class="ellipsis-block-common-title"
                    :value="
                      scope.row.branchInfo.developMode === 0
                        ? scope.row.branchInfo.originalBranch
                        : scope.row.branchInfo.featureBranch
                    "
                    @click="handleClickl(scope.row)"
                  ></ellipsis-block>
                </span>
              </div>
            </div>
            <div
              v-if="
                !$authFunction(
                  'FUNC_APP_PIPELINE_EXECUTE_WHOLE',
                  2,
                  scope.row.branchInfo.appId,
                )
              "
            >
              <span style="width: 100%;display: inline-block;">
                <ellipsis-block
                  class="ellipsis-block-common-title  cursorDefault"
                  :value="
                    scope.row.branchInfo.developMode === 0
                      ? scope.row.branchInfo.originalBranch
                      : scope.row.branchInfo.featureBranch
                  "
                ></ellipsis-block>
              </span>
              <div v-if="scope.row.branchInfo.del === 1">
                <el-tooltip
                  :content="$t('Git分支已被删除')"
                  placement="top-start"
                >
                  <i
                    class="el-icon-warning warning"
                    style="vertical-align: text-bottom;"
                  ></i>
                </el-tooltip>
                <span style="width: calc(100% - 50px);display: inline-block;">
                  <ellipsis-block
                    class="ellipsis-block-common-title  cursorDefault"
                    :value="
                      scope.row.branchInfo.developMode === 0
                        ? scope.row.branchInfo.originalBranch
                        : scope.row.branchInfo.featureBranch
                    "
                  ></ellipsis-block>
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="commitInfo.shortCommitId"
          label="Commitld"
          show-overflow-tooltip
          width="90"
        ></el-table-column>
        <el-table-column
          prop="branchInfo.appCode"
          :label="$t('应用')"
          show-overflow-tooltip
          min-width="60"
        ></el-table-column>
        <el-table-column
          prop="commitInfo.commitUserName"
          :label="$t('最后提交人')"
          width="88"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{
                scope.row.commitInfo === null
                  ? ''
                  : `${scope.row.commitInfo.commitUserName}`
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="commitInfo.commitTime"
          :label="$t('最后提交时间')"
          show-overflow-tooltip
          :min-width="isNap ? 100 : 60"
        ></el-table-column>
        <el-table-column
          prop
          :label="$t('操作')"
          :width="$isEnglish() ? 240 : 195"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-button
              v-show="
                $authFunction(
                  'FUNC_APP_PIPELINE_EXECUTE_WHOLE',
                  2,
                  scope.row.branchInfo.appId,
                )
              "
              v-if="
                scope.row.branchInfo.del === 0 &&
                  scope.row.branchInfo.close !== 1
              "
              type="text"
              @click="liushuixian(scope.row)"
              >{{ $t('运行流水线') }}</el-button
            >
            <el-button
              v-show="
                $authFunction(
                  'FUNC_APP_COOP_ASSOC_REMOVE_SHOW',
                  2,
                  scope.row.branchInfo.appId,
                )
              "
              type="text"
              @click="getAssocBranchRemoveclick(scope.row)"
              >{{ $t('解除关联') }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      :title="$t('运行流水线')"
      :visible.sync="dialogVisible"
      :modal-append-to-body="false"
      width="40%"
      @close="cancel"
    >
      <el-form
        ref="ruleForm"
        :model="ruleForm"
        :rules="rules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="$t('版本流水线')" prop="pipeline">
          <el-select
            v-model="ruleForm.pipeline"
            :popper-append-to-body="false"
            medium
            :placeholder="$t('请选择流水线')"
            style="width: 90%;"
          >
            <el-option
              v-for="item in pipelineList"
              :key="item.pipelineId"
              :label="item.pipelineName"
              :value="item.pipelineId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button style="margin-left: 30%;" @click="cancel('ruleForm')">{{
            $t('取消')
          }}</el-button>
          <el-button type="primary" @click="success('ruleForm')">{{
            $t('确定')
          }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
// import { log } from 'util'
import * as requirementService from '@/service/requirement'
/**
 * @title 已经关联好的分支 table
 * @desc
 * @author zhengruiqin
 * @date
 */
export default {
  name: 'BranchTable',
  components: {},
  mixins: [],
  props: {
    assocBranchDialogModalStatus: {
      type: [Number, Boolean],
      required: true,
    },

    workItemId: {
      type: [Number, String],
      required: true,
    },

    projectId: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      loading: false, //加载中
      tableData: [], //表格数据
      pipelineList: [], //流水线列表
      PipelineInfo: {}, //流水线信息
      dialogVisible: false,
      hasBorder: false,
      ruleForm: {
        pipeline: '',
      },

      rules: {
        pipeline: [
          { required: true, message: '请选择流水线', trigger: 'change' },
        ],
      },

      isNap: false, // 是否是笔记本
    }
  },
  computed: {},
  watch: {
    assocBranchDialogModalStatus() {
      if (this.assocBranchDialogModalStatus === false) {
        this.getAssocBranch()
      }
    },
  },

  created() {
    this.getAssocBranch()
    this.isNap = window.innerWidth < 1400
  },
  methods: {
    //重置
    cancel() {
      this.dialogVisible = false
      this.$refs['ruleForm'].resetFields()
    },
    //流水线跳转
    success(formName) {
      let data = this.pipelineList.filter(item => {
        return item.pipelineId == this.ruleForm.pipeline
      })
      data = JSON.stringify(data)
      let branch = JSON.stringify(this.PipelineInfo)
      let psaId = this.PipelineInfo.branchInfo.appId
      let serverId = this.PipelineInfo.branchInfo.bizId
      let pipelineId = this.ruleForm.pipeline
      let pipelineinfo = 'pipeLineinfo'
      sessionStorage.setItem('pipeLineinfo', data)
      sessionStorage.setItem('branch', branch)
      if (this.PipelineInfo.branchInfo.developMode === 0) {
        let url = '/cicd/app/versions?'
        window.open(
          `${url}psaId=${psaId}&serverId=${serverId}&pipelineId=${pipelineId}`,
          '_blank',
        )
      }
      if (this.PipelineInfo.branchInfo.developMode === 1) {
        let url = '/cicd/app/pipeline/list?'
        window.open(
          `${url}psaId=${psaId}&serverId=${serverId}&pipelineinfo=${pipelineinfo}`,
          '_blank',
        )
      }
      this.dialogVisible = false
      this.$refs[formName].resetFields()
    },
    //查询需求关联分支数据
    async getAssocBranch() {
      this.hasBorder = false
      let result = await requirementService.requirementAssocBranchQuery({
        requireId: this.workItemId,
        projectId: this.projectId,
      })

      if (result.status === 200) {
        this.tableData = result.data
        this.$emit('update:footerData', result.data)
        if (this.tableData.length !== 0) {
          this.hasBorder = true
        }
      }
    },
    //需求分支解除关联
    async getAssocBranchRemove(data) {
      let result = await requirementService.requirementAssocBranchRemove({
        requireId: this.workItemId,
        branchId: data.branchInfo.id,
      })

      if (result.status === 200) {
        this.$message({
          type: 'success',
          message: `${i18n.t('解绑成功')}!`,
        })

        this.getAssocBranch()
        this.$emit('tabRelateditem')
      }
    },
    getAssocBranchRemoveclick(data) {
      this.$confirm(i18n.t('此操作将解除关联, 是否继续?'), i18n.t('提示'), {
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      })
        .then(() => {
          this.getAssocBranchRemove(data)
        })
        .catch(() => {
          // this.$message({
          //   type: 'info',
          //   message: '已取消解绑'
          // });
        })
    },
    //点击分支名称
    handleClickl(data) {
      let psaId = data.branchInfo.appId
      let serverId = data.branchInfo.bizId
      if (data.branchInfo.developMode === 0) {
        let url = '/cicd/app/versions?'
        window.open(`${url}psaId=${psaId}&serverId=${serverId}`, '_blank')
      }
      if (data.branchInfo.developMode === 1) {
        let url = '/cicd/app/feature_branch/list?'
        window.open(`${url}psaId=${psaId}&serverId=${serverId}`, '_blank')
      }
    },
    //获取流水线列表
    async getPipelineList(data) {
      let result = await requirementService.pipelineCoopList(data)

      if (result.status === 200) {
        this.pipelineList = result.data
        this.ruleForm.pipeline = this.pipelineList[0].pipelineId
      }
    },
    handleClick(data) {
      this.$emit('showBranchCommits', data)
    },
    //运行流水线
    liushuixian(data) {
      let info = {}
      info.psaId = data.branchInfo.appId
      info.originalBranch = data.branchInfo.originalBranch
      this.dialogVisible = true
      this.getPipelineList(info)
      this.PipelineInfo = data
    },
  },
}
</script>
<style lang="scss" scoped>
.spanCP {
  cursor: pointer;
  color: #409eff;
}
.spanDel {
  cursor: not-allowed;
  color: red;
}
.ellipsis-block-common-title {
  width: 100%;
  vertical-align: middle;
  /deep/ .cursor-pointer:hover {
    box-shadow: none !important;
  }
  /deep/ .cursor-pointer {
    padding: 0 !important;
  }
}
</style>
