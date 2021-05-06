<template>
  <el-dialog
    :visible.sync="dialogShow"
    width="40%"
    :title="$t('关联分支')"
    :modal-append-to-body="false"
    @close="cancel('ruleForm')"
  >
    <el-form
      ref="ruleForm"
      :model="ruleForm"
      :rules="rules"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-form-item :label="$t('关联应用')" prop="application">
        <el-select
          v-model="ruleForm.application"
          clearable
          filterable
          medium
          :placeholder="$t('请选择应用')"
          @change="changeApplication(ruleForm.application)"
        >
          <el-option
            v-for="item in applicationList"
            :key="item.psaId"
            :label="item.appCode"
            :value="item.psaId"
          >
          </el-option>
        </el-select>
        <!-- <div style="color:#ccc;" v-if="isShowApplication"><i class="el-icon-warning"></i><span>暂不支持多仓库应用</span></div> -->
      </el-form-item>
      <el-form-item :label="$t('关联分支')" prop="branch">
        <el-select
          v-model="ruleForm.branch"
          clearable
          :placeholder="$t('请选择分支')"
          @change="changeBranch(ruleForm.branch)"
        >
          <el-option
            v-for="item in branchList"
            :key="item.originalBranch"
            :label="item.featureBranch"
            :value="item.originalBranch"
          >
          </el-option>
        </el-select>
        <!-- <div style="color:#ccc;" v-if="isshow"><i class="el-icon-warning"></i><span>需求不支持关联主干分支</span></div> -->
      </el-form-item>
    </el-form>
    <div class="fotter">
      <el-button style="margin-left: 30%;" @click="cancel('ruleForm')">{{
        $t('取消')
      }}</el-button>
      <el-button type="primary" @click="success('ruleForm')">{{
        $t('确定')
      }}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  appList,
  branchList,
  requirementAssocBranch,
} from '@/service/requirement'
/**
 * @title 关联分支选择组件
 * @desc
 * @author heyunjiang
 * @date 2019.11.6
 */
export default {
  name: 'AssocBranchDialog',
  components: {},
  mixins: [],
  props: {
    modalStatus: {
      type: Boolean,
      required: true,
    },

    workItemId: {
      type: [Number, String],
      required: true,
    },
  },

  data() {
    return {
      dialogShow: false,
      ruleForm: {
        application: '',
        branch: '',
      },

      rules: {
        application: [
          { required: true, message: '请选择应用', trigger: 'change' },
        ],

        branch: [{ required: true, message: '请选择分支', trigger: 'change' }],
      },

      options: [],
      applicationList: [], //应用列表
      branchList: [], //分支列表
      branchInfo: {
        sourceRepo: '', //仓库地址
        originalBranch: '', //分支
        bizId: '', //业务id
        appId: '', //应用id
        appCode: '', //应用名称
        developMode: '', //开发模式（0：自由模式 1：分支模式）
        featureBranch: '', //仓库特性分支（分支模式必需）地址
      }, //关联分支参数
      isshow: false, //需求不支持关联主干分支
      isShowApplication: false, //需求不支持关联主干分支
    }
  },
  computed: {},
  watch: {
    modalStatus() {
      this.dialogShow = this.modalStatus
      if (this.dialogShow === true) {
        this.getApplicationList()
      }
    },
  },

  created() {},
  methods: {
    // 点击确定
    success(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.assocBranch()
        } else {
          return false
        }
      })
      // this.$emit("update:modalStatus", false);
    },
    // 点击取消
    cancel(formName) {
      this.branchList = []
      this.$emit('update:modalStatus', false)
      if (this.$refs[formName] !== undefined) {
        this.resetForm(formName)
      }
    },
    //重置
    resetForm(formName) {
      this.isshow = false
      this.isShowApplication = false
      this.$refs[formName].resetFields()
    },
    //选择应用
    changeApplication(data) {
      this.isShowApplication = false
      this.isshow = false
      let key = this.applicationList.filter(item => {
        return item.psaId == this.ruleForm.application
      })
      if (this.ruleForm.application !== '') {
        this.branchInfo.bizId = key[0].serverId //TODO 这个字段需要同时修改项目协同后端，因为保留其key
        this.branchInfo.appId = key[0].psaId //TODO 这个字段需要同时修改项目协同后端，因为保留其key
        this.branchInfo.appName = key[0].appName
        this.branchInfo.appCode = key[0].appCode
        this.branchInfo.developMode = key[0].developMode
        if (key[0].developMode === 0) {
          this.isshow = true
        }
      }
      if (this.ruleForm.branch !== '') {
        this.ruleForm.branch = ''
      }
      this.branchList = []
      if (data !== '') {
        this.isShowApplication = true
        this.getBranchList(data)
      }
    },
    //选择分支
    changeBranch(data) {
      let key = this.branchList.filter(item => {
        return item.originalBranch == data
      })
      if (data !== '') {
        this.branchInfo.sourceRepo = key[0].sourceRepo
        this.branchInfo.originalBranch = key[0].originalBranch
        this.branchInfo.featureBranch = key[0].featureBranch
        this.branchInfo.developMode = key[0].developMode
      }
    },
    //获取应用数据列表
    async getApplicationList() {
      let result = await appList()

      if (result.status === 200) {
        this.applicationList = result.data
      }
    },
    //获取分支数据列表
    async getBranchList(data) {
      let result = await branchList({
        psaId: data,
      })

      if (result.status === 200) {
        // this.$message({
        //   type: 'success',
        //   message: '关联成功!'
        // });
        this.branchList = result.data
      }
    },
    //需求分支关联
    async assocBranch() {
      let result = await requirementAssocBranch({
        requireId: this.workItemId,
        branchInfo: this.branchInfo,
      })

      if (result.status === 200) {
        this.cancel('ruleForm')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.fotter {
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
}
</style>
