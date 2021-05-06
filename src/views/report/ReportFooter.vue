<template>
  <div ref="reportFooter" class="report-footer">
    <el-button type="primary" @click="sendEmail">{{
      $t('发送邮件')
    }}</el-button>
    <el-button type="primary" plain @click="previewEmail">{{
      $t('邮件预览')
    }}</el-button>
    <!-- 权限控制 保存模板按钮 -->
    <el-button v-if="authParams" type="primary" plain @click="saveTemplate">{{
      $t('保存为模板')
    }}</el-button>
    <el-button type="primary" plain @click="saveDraft">{{
      $t('保存草稿')
    }}</el-button>
    <el-button @click="cancel">{{ $t('取消') }}</el-button>
    <!-- 保存模板弹窗 -->
    <el-dialog
      :title="$t('模板名称')"
      :class="{
        'el-dialog-350w': !$isEnglish(),
        'el-dialog-400w': $isEnglish(),
      }"
      :before-close="closeDialog"
      :visible.sync="dialogVisible"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
    >
      <div class="form-iterm-box">
        <el-form
          ref="templateForm"
          :label-width="$isEnglish() ? '130px' : '80px'"
          :model="templateForm"
          @submit.native.prevent
        >
          <el-form-item
            :label="$t('模板名称')"
            prop="modelName"
            :rules="modelNameRule"
          >
            <el-input
              v-model="templateForm.modelName"
              :placeholder="$t('请输入模板名称')"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveModel">{{
          $t('保存')
        }}</el-button>
        <el-button @click="closeDialog">{{ $t('关闭') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
/**
 * @title 报告内容的操作按钮
 * @desc
 * @author huangmei
 * @date
 */

export default {
  name: 'ReportFooter',
  components: {},
  mixins: [],
  props: {
    templateName: String,
  },

  data() {
    return {
      dialogVisible: false,
      footerFixed: false,
      saveType: '', // 区分模板 草稿
      timer: '',
      templateForm: {
        modelName: '',
      },
      modelNameRule: [
        { required: true, message: '请输入模板名称', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (/^\s+$/.test(value)) {
              callback(new Error('模板名称不合法！'))
            } else {
              callback()
            }
          },
          trigger: 'blur',
        },
      ],
    }
  },
  computed: {
    authParams() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_REPORT_DETAIL_CREATE',
        3,
        this.$getUrlParams().projectId,
      )
    },
  },

  watch: {},
  mounted() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    // this.timer = setInterval(() => {
    //   this.handleScroll()
    // }, 2000)
  },
  destroyed() {
    clearInterval(this.timer)
  },
  methods: {
    // 滚动事件
    handleScroll() {
      const innerHeight = window.innerHeight
      const height =
        document.querySelector('.project-content').offsetHeight + 100
      if (height > innerHeight) {
        this.footerFixed = true
      } else {
        this.footerFixed = false
      }
    },
    // 发送邮件
    sendEmail() {
      this.$store.dispatch('setReportDraft', false)
      this.$emit('sendEmail')
    },
    // 邮件预览
    previewEmail() {
      this.saveType = 'saveDraft'
      // this.saveDraft()
      this.$parent.saveTemplate(
        {
          ...this.$parent.params,
          shortCut: this.$parent.shortCut[this.saveType],
        },

        this.saveType,
      )

      this.$emit('emailPreview')
    },
    //保存模板
    saveTemplate() {
      this.$store.dispatch('setReportDraft', false)
      this.dialogVisible = true
      this.saveType = 'saveTemplate'
    },
    // 保存草稿 都跳转到草稿箱
    saveDraft() {
      this.$store.dispatch('setReportDraft', true)
      this.saveType = 'saveDraft'
      this.$emit('saveDraft')
    },
    // 取消
    cancel() {
      this.$emit('cancel')
    },
    closeDialog() {
      this.templateForm.modelName = ''
      this.dialogVisible = false
      this.$refs.templateForm.resetFields()
    },
    saveModel() {
      this.$refs.templateForm.validate(valid => {
        if (valid) {
          this.$emit('update:templateName', this.templateForm.modelName.trim())
          this.$emit(this.saveType)
          this.closeDialog()
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.report-footer {
  margin-top: 24px;
}
// .margin-left-30 {
//   margin-left: 30px;
//   height: 20px;
// }
// .isFixed {
//   position: fixed;
//   background-color: #fff;
//   bottom: 30px;
// }
.el-dialog-400w .el-dialog {
  width: 400px;
}
</style>
