<!--
 * @Descripttion: 内部用户新建反馈
 * @version:
 * @Author: lili
 * @Date: 2020-05-07 09:56:03
 * @LastEditors: lili
 * @LastEditTime: 2020-07-24 14:39:41
 -->
<template>
  <div
    v-loading="loading"
    class="content-outer-box detail-content add_feedback"
    :element-loading-text="$t('拼命加载中')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
  >
    <!-- 标题 -->
    <div class="slide-header">
      <span class="taskinfo-title">{{ $t('创建反馈') }}</span>
      <div class="slide-header-right">
        <el-button
          type="primary"
          :loading="saveBtnLoading"
          @click="saveFeedback"
        >
          {{ $t('保存') }}
        </el-button>
        <el-button type="default" @click="closeSlide">{{
          $t('取消')
        }}</el-button>
      </div>
    </div>
    <!-- 内容 -->
    <el-row :gutter="10" class="detail-content-body">
      <el-col
        :xs="16"
        :sm="16"
        :md="16"
        :lg="16"
        :xl="18"
        class="detail-col-left"
      >
        <div class="detail-content-left">
          <div class="detail-content-header" style="padding:5px;">
            <el-input
              ref="titleInput"
              v-model.trim="feedbackTitle"
              v-focus
              class="title-input-active"
              :placeholder="$t('输入标题,回车新建')"
              size="large"
              style="height:35px;"
              @input="titleInput"
            ></el-input>
            <div
              v-show="feedbackTitle && feedbackTitle.length > 127"
              class="warning warning-title"
            >
              {{ $t('标题不能超过') }}127{{ $t('个字符') }}！
            </div>
          </div>
          <div
            class="detail-content-left-content detail-content-left-content-inactive"
            style="box-shadow:none;"
          >
            <UserInputRestoreTips
              item-type="feedback"
              action-type="create"
              @restore="restoreContent"
            ></UserInputRestoreTips>
            <tiny-mce
              :value="content"
              @edit="userEdit"
              @watch="editHnadle"
              @save="saveFeedback"
            ></tiny-mce>
          </div>
        </div>
      </el-col>
      <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="6" class="detail-col-right">
        <div class="detail-content-right">
          <div class="bug-basic-info">
            <p class="bug-basic-info-title">{{ $t('基本信息') }}</p>
            <CreateFeedbackBasic
              ref="CreateFeedbackBasic"
              v-model="workItemCreateBasicFormObject"
              :basic-template-array="basicTemplateArray"
            ></CreateFeedbackBasic>
          </div>
          <div class="bug-attachment">
            <p class="bug-attachment-title">
              {{ $t('附件') }}
              <!--              <span class="bug-attachment-title-btn" @click="handleShow">{{-->
              <!--                fileListShow ? $t('收起上传') : $t('展开上传')-->
              <!--              }}</span>-->
            </p>
            <file-upload
              :file-updaload-box-status="fileListShow"
              :uploaded-file-list="uploadedFileList"
              :handle-file-delete="deleteAttachment"
              :handle-upload-success="handleUploadSuccess"
              work-item-type="3"
              :upload-url="uploadUrl"
              :extra-data="extraData"
              :is-need-related-file="false"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 创建反馈
 * @author wuqian
 * @date 2020.5.2
 */
import CreateFeedbackBasic from './CreateFeedbackBasic'
import UserInputRestoreTips from '@/components/user-input-restore-tips'
import FileUpload from '@/components/file-upload'
import TinyMce from '@/components/tinymce'
import { setCreateItemUserInputCache } from '@/utils/help'
import { operationActionTypes } from '@/store/action-types'
import { USER_INFO } from '@/utils/constant'
import operationApi from '@/api/operation'

const itemType = 'feedback'
const basicTemplateArray = [
  {
    attrType: 10,
    attrValue: 'MEMBER_CHOICE',
    attrName: 'productId',
    attrText: '单选框',
    fieldName: '产品名称',
    displayAttrName: 'productName',
    userDefined: false,
    required: true,
    readonly: false,
    hideable: false,
    optional: false,
    hiddenWhenCreate: false,
  },

  {
    attrType: 10,
    attrValue: 'MULTI_CHOICE',
    attrName: 'feedbackTypeId',
    attrText: '多选框',
    fieldName: '反馈类型',
    displayAttrName: 'feedbackTypeName',
    userDefined: false,
    required: true,
    readonly: false,
    hideable: false,
    optional: false,
    hiddenWhenCreate: false,
  },

  {
    attrType: 11,
    attrValue: 'MULTI_CHOICE',
    attrName: 'currentProcessor',
    attrText: '多选框',
    fieldName: '当前处理人',
    displayAttrName: 'currentProcessorName',
    userDefined: false,
    required: true,
    readonly: false,
    hideable: false,
    optional: false,
    hiddenWhenCreate: false,
    selectList: [],
  },

  {
    attrType: 10,
    attrValue: 'SINGLE_CHOICE',
    attrName: 'priority',
    attrText: '单选框',
    fieldName: '优先级',
    displayAttrName: 'priorityName',
    presetValue: JSON.stringify({ key: 80, vlaue: 'P2' }),
    userDefined: false,
    required: true,
    readonly: false,
    hideable: false,
    optional: false,
    hiddenWhenCreate: false,
  },

  {
    attrType: 5,
    attrValue: 'LITE_DATE_ATTR',
    attrName: 'expectedCompleteTime',
    attrText: '简单时间框(不包含时分秒)',
    fieldName: '期望完成时间',
    displayAttrName: 'expectedCompleteTimeName',
    userDefined: false,
    required: false,
    readonly: false,
    hideable: false,
    optional: false,
    hiddenWhenCreate: false,
  },

  {
    attrType: 11,
    attrValue: 'MULTI_CHOICE',
    attrName: 'proposers',
    attrText: '多选框',
    fieldName: '反馈人',
    displayAttrName: 'proposersName',
    presetValue: JSON.stringify({
      key: window.storage?.getItem(USER_INFO)
        ? [JSON.parse(window.storage?.getItem(USER_INFO))]
        : [],
      vlaue: [],
    }),
    userDefined: false,
    required: false,
    readonly: false,
    hideable: false,
    optional: false,
    hiddenWhenCreate: false,
  },
]

export default {
  name: 'CreateFeedback',

  components: {
    UserInputRestoreTips,
    FileUpload,
    TinyMce,
    CreateFeedbackBasic,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
      default: false,
      desc: '组件显示状态',
    },
  },

  data() {
    return {
      isDirty: false,
      loading: false,
      // 默认数据
      originalData: {
        title: '',
        content: `<p><strong>【${this.$i18n.t(
          '反馈内容',
        )}】</strong>：</p>\n<p>&nbsp;</p>`,
      },

      feedbackTitle: '', // 反馈标题
      content: '', // 反馈内容
      uploadUrl: operationApi.uploadUrl.url, // 上传附件接口
      extraData: {
        feedbackId: 0,
        source: 0,
      },
      // 上传附件额外信息
      basicTemplateArray,
      workItemCreateBasicFormObject: {}, // 基本信息
      fileListShow: true,
      uploadedFileList: [],
      saveBtnLoading: false,
    }
  },
  computed: {},
  watch: {},
  created() {
    window.addEventListener('beforeunload', this.pageUnloadHandler)
  },
  mounted() {
    this.feedbackTitle = this.originalData.title
    this.content = this.originalData.content
  },
  beforeDestroy() {
    this.setUserInputCache()
  },
  methods: {
    addDirtyTag() {
      this.isDirty = true
    },
    resetDirtyTag() {
      this.isDirty = false
    },
    // 标题输入内容监听
    titleInput() {
      const title = this.feedbackTitle
      if (title !== this.originalData.title) {
        this.addDirtyTag()
      } else {
        this.resetDirtyTag()
      }
    },
    userEdit(data) {
      if (data !== this.originalData.content) {
        this.addDirtyTag()
      } else {
        this.resetDirtyTag()
      }
    },
    editHnadle(data) {
      this.content = data
    },
    restoreContent(value) {
      const { title, content } = value
      this.content = content
      this.feedbackTitle = title
    },
    // 展开/关闭上传
    handleShow() {
      this.fileListShow = !this.fileListShow
    },
    // 删除附件
    deleteAttachment(file) {
      this.uploadedFileList = this.uploadedFileList.filter(
        item => item.id !== file.id,
      )
    },
    // 附件上传成功回调
    handleUploadSuccess(res) {
      if (res.status !== 200) {
        this.$message({
          message: res.msg || i18n.t('文件上传失败'),
          type: 'error',
        })

        return
      }
      this.uploadedFileList.push({
        name: res.data.origName,
        url: res.data.url,
        id: res.data.id,
        size: res.data.size,
        createTime: res.data.createTime,
        createUser: res.data.createUser,
      })

      this.$message({
        message: '文件上传成功',
        type: 'success',
      })
    },
    // 缓存用户输入信息
    setUserInputCache() {
      const storageContent = {
        title: this.feedbackTitle,
        content: this.content,
        extendInfo: this.workItemCreateBasicFormObject,
      }
      this.isDirty && setCreateItemUserInputCache(itemType, storageContent)
    },
    clearUserInputCache() {
      setCreateItemUserInputCache(itemType, null)
    },
    pageUnloadHandler() {
      this.setUserInputCache()
      window.removeEventListener('beforeunload', this.pageUnloadHandler)
    },
    // 保存反馈
    saveFeedback() {
      const {
        productId,
        feedbackTypeId,
        currentProcessor,
        priority,
        expectedCompleteTime,
        proposers,
      } = this.workItemCreateBasicFormObject
      if (!this.feedbackTitle) {
        this.$message({
          type: 'error',
          message: i18n.t('反馈标题不能为空'),
        })

        return
      }
      // 必填项校验
      if (!this.$refs.CreateFeedbackBasic.checkFields()) {
        return
      }
      this.saveBtnLoading = true
      let currentProcessorUserIds = currentProcessor.map(item => item.userId)

      this.$store
        .dispatch(operationActionTypes.ACTION_OPERATION_FEEDBACK_CREATE, {
          title: this.feedbackTitle,
          content: this.content,
          productId,
          feedbackTypeId,
          currentProcessors: currentProcessorUserIds[0]
            ? currentProcessorUserIds
            : currentProcessor,
          priority,
          expectedCompleteTime,
          proposers: proposers.map(item => item.userId),
          attachments: this.uploadedFileList.map(item => item.id),
        })
        .then(res => {
          if (!res || res.status !== 200) {
            return
          }
          this.$message({
            type: 'success',
            message: i18n.t('反馈创建成功'),
          })

          // todo 关闭弹窗
          this.resetDirtyTag()
          this.$emit('onSave')
          this.$emit('update:show', false)
          this.clearUserInputCache()
        })
        .finally(() => {
          this.saveBtnLoading = false
        })
    },
    // 关闭
    closeSlide() {
      this.$emit('update:show', false)
      this.setUserInputCache()
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/project/ProjectCommon.scss';
</style>
