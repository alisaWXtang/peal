<!--
 * @Descripttion: 反馈详情查看
 * @version:
 * @Author: lili
 * @Date: 2020-05-07 09:56:03
 * @LastEditors: zhangyun
 * @LastEditTime: 2020-08-04 11:09:56
 -->
<template>
  <div class="detail-content bug-content-box detail-content-show slider-body">
    <BaseDisplay
      v-if="showDetail"
      :detail-info="feedbackDetail"
      is-showmore
      @updateField="updateField"
      @HandleSide="closeDetail"
    >
      <template #headerBtns>
        <template>
          <el-button
            v-if="
              orderDetail.ableActions &&
                orderDetail.ableActions.includes('GET_FEEDBACK')
            "
            type="primary"
            @click="statusFlowButtonClickHandler('GET_FEEDBACK')"
            >{{ $t('领单') }}</el-button
          >
          <el-button
            v-if="
              orderDetail.ableActions &&
                orderDetail.ableActions.includes('FORWARD_FEEDBACK')
            "
            type="primary"
            @click="
              statusFlowButtonClickHandler(
                source === FEEDBACK_SOURCE_INNER
                  ? 'FORWARD_FEEDBACK'
                  : 'FORWARD_FEEDBACK_400',
              )
            "
            >{{ $t('转交') }}</el-button
          >
        </template>
        <template>
          <el-button
            v-if="
              orderDetail.ableActions &&
                orderDetail.ableActions.includes('PROCESS_FEEDBACK')
            "
            type="success"
            @click="statusFlowButtonClickHandler('PROCESS_FEEDBACK')"
            >处理完成</el-button
          >
          <el-button
            v-if="
              orderDetail.ableActions &&
                orderDetail.ableActions.includes('REJECT_FEEDBACK')
            "
            type="danger"
            @click="statusFlowButtonClickHandler('REJECT_FEEDBACK')"
            >驳回</el-button
          >
          <el-button
            v-if="
              orderDetail.ableActions &&
                orderDetail.ableActions.includes('REOPEN')
            "
            type="primary"
            @click="statusFlowButtonClickHandler('REOPEN')"
            >重新提交</el-button
          >
          <el-button
            v-if="
              orderDetail.ableActions &&
                orderDetail.ableActions.includes('CONVERT_TO_REQUIRE')
            "
            type="primary"
            @click="feedbackToRequirement"
            >转需求</el-button
          >
          <el-button
            v-if="
              orderDetail.ableActions &&
                orderDetail.ableActions.includes('CONVERT_TO_DEFECT')
            "
            type="primary"
            @click="feedbackToDefect"
            >转缺陷</el-button
          >
          <el-button
            v-if="orderDetail.editAble"
            type="danger"
            @click="feedbackDelete"
            >删除</el-button
          >
        </template>
      </template>
      <template #footer>
        <el-tabs v-model="tabIndex" @tab-click="tabClick">
          <el-tab-pane :label="`${$t('评论')}(${commentList.total})`" name="0">
            <comment-list
              v-if="checkAuthority"
              :feedback="commentInfo"
              @discussFun="commentData"
            ></comment-list>
          </el-tab-pane>
          <el-tab-pane
            v-if="orderDetail.convertType == 1 && processList.length > 0"
            :label="`${$t('需求进度')}(${processList.length})`"
            name="4"
          >
            <div>
              <status-line
                use-type="workItemProcess"
                :data="processList"
                :extra="processDate"
              ></status-line>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="orderDetail.convertType == 2 && processList.length > 0"
            :label="`${$t('缺陷进度')}(${processList.length})`"
            name="5"
          >
            <div>
              <status-line
                use-type="workItemProcess"
                :data="processList"
                :extra="processDate"
              ></status-line>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="source === FEEDBACK_SOURCE_400"
            :label="`${$t('催单信息')}(${remindersInfo.length})`"
            name="7"
          >
            <div v-if="remindersInfo.length > 0" class="content-text">
              <p
                v-for="(item, index) in remindersInfo"
                :key="item.id"
                :class="{ mb10: index < remindersInfo.length - 1 }"
              >
                {{ item }}
              </p>
            </div>
            <div v-else class="content-text">{{ $t('暂无信息') }}</div>
          </el-tab-pane>
          <el-tab-pane
            v-if="
              (source === FEEDBACK_SOURCE_INNER && feedbackInfo.status == 3) ||
                source === FEEDBACK_SOURCE_400
            "
            :label="$t('处理结果')"
            name="3"
          >
            <div v-if="source === FEEDBACK_SOURCE_INNER" class="content-text">
              <template v-if="handleInfo.userName">
                <span
                  >{{ handleInfo.userName }}({{
                    handleInfo.userId
                  }})&nbsp;&nbsp;{{ handleInfo.handleTime }}</span
                >
                <div v-html="handleInfo.content"></div>
              </template>
              <template v-else>{{ $t('暂无信息') }}</template>
            </div>
            <div v-else>
              <AddDealResultBtn
                v-if="showDealResultBtn"
                :feedback-number="feedbackInfo.singleText1"
                :feedback-id="feedbackId || $route.query.feedbackId"
                @addSuccessCallback="addDealResultSuccess"
              />
              <div class="result-box">
                <p>{{ $t('解决进度') }}</p>
                <div v-html="solveProgress"></div>
              </div>
              <div class="result-box">
                <p>{{ $t('处理结果') }}</p>
                <div v-html="dealResult"></div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="feedbackInfo.status == 2"
            :label="$t('驳回原因')"
            name="2"
          >
            <div class="content-text">
              <span
                >{{ handleInfo.userName }}({{
                  handleInfo.userId
                }})&nbsp;&nbsp;{{ handleInfo.handleTime }}</span
              >
              <p v-html="handleInfo.content"></p>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="source === FEEDBACK_SOURCE_400"
            :label="`${$t('400工单历程')}(${workOrderProcess.length})`"
            name="6"
          >
            <el-table
              style="width:100%;"
              :data="workOrderProcess"
              max-height="500px"
              stripe
            >
              <el-table-column
                type="index"
                :label="$t('序号')"
                :index="i => i + 1"
                width="50"
              >
              </el-table-column>
              <el-table-column
                prop="oldStatus"
                :label="$t('前处理任务')"
                width="150"
              >
              </el-table-column>
              <el-table-column
                prop="oldModifier"
                :label="$t('前处理人')"
                width="200"
              >
              </el-table-column>
              <el-table-column
                prop="newStatus"
                :label="$t('当前处理任务')"
                width="150"
              >
              </el-table-column>
              <el-table-column
                prop="newModifier"
                :label="$t('当前处理人')"
                width="200"
              >
              </el-table-column>
              <el-table-column
                prop="transitionTime"
                :label="$t('交接时间')"
                width="180"
              >
              </el-table-column>
              <el-table-column
                prop="timePeriod"
                :label="$t('时间周期')"
                width="180"
              >
              </el-table-column>
              <el-table-column prop="remark" :label="$t('备注')">
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane
            :label="`${$t('反馈历程')}(${feedbackProcess.length})`"
            name="1"
          >
            <div>
              <status-line
                use-type="feedbackProcess"
                :data="feedbackProcess"
                :extra="{
                  workItemId: orderDetail && orderDetail.workItemId,
                  projectId: orderDetail && orderDetail.projectId,
                }"
              ></status-line>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
      <template #right>
        <div class="detail-content-right">
          <div class="bug-basic-info">
            <p class="bug-basic-info-title">{{ $t('基本信息') }}</p>
            <FeedbackDetailBasic
              ref="FeedbackDetailBasic"
              :detail="feedbackDetail"
              @updateField="updateField"
              @updateSuccess="updateSuccess"
              @HandleSide="closeDetail"
            ></FeedbackDetailBasic>
          </div>
          <div class="bug-attachment">
            <p class="bug-attachment-title">{{ $t('附件') }}</p>
            <div>
              <media-file-list
                v-if="!orderDetail.editAble"
                :uploaded-file-list="uploadedFileList"
                :support-delect="false"
              />
              <file-upload
                v-else
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
        </div>
      </template>
    </BaseDisplay>
    <!-- 转需求 -->
    <slide
      ref="side"
      v-loading="loading"
      :show="toRequirementShow"
      :after-close="afterToClose"
      :before-close="({ cb }) => beforeSliderClose({ id: -1, cb })"
      :element-loading-text="$t('拼命加载中')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgb(255,255,255)"
      @click.stop
    >
      <div slot="task" class="silder-box">
        <RequirementCreate
          :show="toRequirementShow"
          :other-detail-content="feedbackDetail.detail.content"
          :other-detail-title="feedbackDetail.detail.title"
          from-other-detail-type="feedbackToRequirement"
          :from-other-detail-id="feedbackDetail.detail.id"
          :uploaded-file-list="uploadedFileList"
          @HandleSide="afterToClose"
          @transferSuccess="transferSuccess"
        />
      </div>
    </slide>
    <!-- 转缺陷 -->
    <slide
      ref="side"
      v-loading="loading"
      :show="toDefectShow"
      :after-close="afterToClose"
      :before-close="({ cb }) => beforeSliderClose({ id: -1, cb })"
      :element-loading-text="$t('拼命加载中')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgb(255,255,255)"
      @click.stop
    >
      <div slot="task" class="silder-box">
        <BugCreate
          :show="toDefectShow"
          :other-detail-content="feedbackDetail.detail.content"
          :other-detail-title="feedbackDetail.detail.title"
          from-other-detail-type="feedbackToDefect"
          :from-other-detail-id="feedbackDetail.detail.id"
          :uploaded-file-list="uploadedFileList"
          @HandleSide="afterToClose"
          @transferSuccess="transferSuccess"
        />
      </div>
    </slide>
    <FeedbackStatusFlow
      ref="FeedbackStatusFlow"
      :visible.sync="statusDialogVisible"
      :status-type="statusType"
      :detail="feedbackDetail"
      @transferSuccess="transferSuccess"
    />
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { mapState } from 'vuex'
import FeedbackDetailBasic from './FeedbackDetailBasic'
import FeedbackStatusFlow from './FeedbackStatusFlow'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import CommentList from '@/components/comment-list'
import {
  RequirementCreate,
  BugCreate,
} from '@/components/columbus-workitem-create'
import MediaFileList from '@/components/file-upload/MediaFileList'
import FileUpload from '@/components/file-upload'
import StatusLine from '@/components/status-line'
import slide from '@/components/slide-slip'
import { operationActionTypes } from '@/store/action-types'
import debounce from 'lodash/debounce'
import BaseDisplay from './BaseDisplay'
import { updateFeedbackDetail } from '@/service/operation/feedback'
import { deleteInner } from '@/service/operation'
import AddDealResultBtn from './AddDealResultBtn'
import operationApi from '@/api/operation'
import { sanitizeHTML } from '@/utils'

const productIdOther = -2 // 产品名称其他
const FEEDBACK_SOURCE_INNER = 0 // 内部反馈
const FEEDBACK_SOURCE_400 = 1 // 400反馈
const processResult = '3' //处理结果
const processFeedback = '1' //反馈历程
export default {
  name: 'FeedbackDetail',

  components: {
    MediaFileList,
    FileUpload,
    StatusLine,
    FeedbackDetailBasic,
    FeedbackStatusFlow,
    CommentList,
    slide,
    RequirementCreate,
    BugCreate,
    BaseDisplay,
    AddDealResultBtn,
  },

  mixins: [ProjectCommonMixin],
  props: {
    feedbackId: {
      type: [Number, String],
      required: true,
      desc: '反馈id',
    },

    show: {
      type: Boolean,
      required: true,
      default: false,
      desc: '组件显示状态',
    },

    loading: {
      type: Boolean,
      required: false,
      default: false,
      desc: '组件loading状态',
    },
  },
  data() {
    return {
      FEEDBACK_SOURCE_INNER,
      FEEDBACK_SOURCE_400,
      feedbackInfo: {},
      orderDetail: {
        ableActions: [],
      },
      feedbackDetail: {
        detail: {},
        display: {},
        data: {},
      },
      uploadedFileList: [],
      editStatus: 1, // 1处于只读状态，2处于可编辑状态
      showMore: false, //展示更多
      tabIndex: '0',
      statusObject: {
        fullScreen: false,
        taskDescShowActiveStatus: 'inactive',
      },

      commentInfo: {}, // 评论参数
      commentList: {
        total: 0,
      },

      showTxtMore: false,
      hideTxtMore: false,
      feedbackProcess: [], // 反馈历程
      workOrderProcess: [], // 400工单历程
      remindersInfo: [], // 催单信息
      dealResult: '', // 400处理结果
      solveProgress: '', // 400处理进度,
      processList: [], // 工作项进度
      processDate: {}, // 工作项预计时间
      handleInfo: {}, // 驳回/处理信息
      statusType: 'GET_FEEDBACK',
      statusDialogVisible: false, // 状态流转框
      toRequirementShow: false, // 转需求框
      toDefectShow: false, // 转缺陷框
      checkAuthority: true, // 查看详情权限
    }
  },
  computed: {
    ...mapState({
      source: state => Number(state.operationFeedbackList.feedbackSource),
      showDealResultBtn: state => state.operationFeedbackList.showDealResultBtn,
    }),
    showDetail() {
      return !!Object.keys(this.feedbackDetail.detail).length
    },
    uploadUrl() {
      return operationApi.uploadUrl.url // 上传附件接口
    },
    extraData() {
      return {
        feedbackId: this.feedbackId,
        source: 0,
      }
    },
  },
  watch: {
    feedbackId: {
      handler: async function(newVal) {
        if (newVal) {
          this.setSlideDetail()
        } else {
          this.$emit('update:loading', false)
        }
      },
    },
    show: {
      handler: async function(newVal) {
        if (newVal) {
          this.setSlideDetail()
        } else {
          this.$emit('update:loading', false)
        }
      },
    },
  },
  created() {},
  methods: {
    async setSlideDetail() {
      if (Number(this.feedbackId) !== Number(this.orderDetail.id)) {
        this.getFileList()
        this.getFeedbackProcess()
        this.tabIndex =
          this.source === this.FEEDBACK_SOURCE_400
            ? processResult
            : processFeedback
      }
      // 表格修改数据后，保证每次都重新获取数据
      await this.getFeedbackDetail()
      let userNames =
        this.source === 0 &&
        this.feedbackDetail.display.proposerNames.split(',')
      let proposers = this.feedbackDetail.data.proposers
      this.commentInfo = {
        source: this.source,
        feedbackId: this.feedbackId,
        feedbackNumber: this.feedbackInfo.singleText1,
        feedbackInfoUrl: window.location.href,
        defaultNoticePerson:
          this.source === 0
            ? proposers
              ? proposers.map((userId, index) => {
                  return {
                    userId,
                    userName: userNames[index],
                  }
                })
              : []
            : [
                {
                  userId: this.feedbackDetail.data.createUser,
                  userName: this.feedbackDetail.display.createUserName,
                },
              ],
      }
    },
    // 反馈详情 - 获取
    async getFeedbackDetail() {
      const res = await this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_DETAIL,
        {
          id: this.feedbackId,
          source: this.source,
        },
      )

      if (res.status === 200) {
        const {
          result: { data, detail, display },
          fields,
        } = res.data
        this.feedbackDetail = {
          data,
          detail,
          display,
          fields,
        }

        this.checkAuthority = true
        this.feedbackInfo = data
        this.orderDetail = detail
        this.handleInfo = detail.rejectReason || detail.processMethod || {}
        this.handleInfo.content = sanitizeHTML(this.handleInfo.content).replace(
          /\n/g,
          '<br/>',
        )
        this.boxShowmore()
        if (this.source === FEEDBACK_SOURCE_400) {
          this.checkDealResultAuth()
          this.getWorkOrderExtra(data.singleText1)
        }

        // convertType: 1-转需求，2-转缺陷
        Number(detail.convertType) &&
          this.getWorkItemProcess(detail.workItemId, detail.workItemType)
      } else if (res.status === 646) {
        this.checkAuthority = false
      }
    },
    // 反馈详情 - 更新
    async updateField(key, value) {
      let obj = {
        id: this.feedbackDetail.detail.id,
        expectedCompleteTime: this.feedbackDetail.data.expectedCompleteTime,
      }
      if (typeof key === 'object') {
        obj = {
          ...obj,
          ...key,
        }
      } else {
        obj[key] = value
      }
      let result = {}
      try {
        result = await updateFeedbackDetail(obj)
        // eslint-disable-next-line no-empty
      } catch (_) {}
      if (result.status === 200) {
        this.$message.success(result.msg || '更新成功')
        this.getFeedbackProcess()
        this.$store.dispatch(
          operationActionTypes.ACTION_OPERATION_FEEDBACK_GET_FEEDBACK_LIST,
        )
      }
      this.getFeedbackDetail()
    },
    // 更新成功回调函数
    updateSuccess() {
      this.getFeedbackDetail()
      this.getFeedbackProcess()
    },
    //展示更多
    showMoreBtn() {
      this.showMore = false
      this.showTxtMore = false
      this.hideTxtMore = true
    },
    hideMoreBtn() {
      this.showMore = true
      this.showTxtMore = true
      this.hideTxtMore = false
    },
    //判断更多的盒子高度
    boxShowmore() {
      setTimeout(() => {
        let boxHeight =
          this.$refs.showMorebox && this.$refs.showMorebox.offsetHeight
        let boxsHeight =
          this.$refs.showMorebox && this.$refs.showMoresbox.offsetHeight
        this.showTxtMore = false
        this.showMore = false
        if (boxsHeight > boxHeight) {
          this.showTxtMore = true
          this.showMore = true
          this.hideTxtMore = false
        } else if (boxHeight > 349) {
          this.showTxtMore = true
          this.showMore = true
          this.hideTxtMore = false
        }
        if (boxsHeight < 349) {
          this.hideTxtMore = false
        }
        this.$emit('update:loading', false)
      }, 200)
    },
    // 附件
    async getFileList() {
      const res = await this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_ATTACHMENT,
        { feedbackId: this.feedbackId },
      )

      if (res.status === 200) {
        this.uploadedFileList = res.data
      }
    },
    // 删除附件
    async deleteAttachment(file) {
      this.uploadedFileList = this.uploadedFileList.filter(
        item => item.id !== file.id,
      )
      const res = await this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_ATTACHMENT_DELETE,
        { feedbackId: this.feedbackId, attachmentId: file.id },
      )

      if (res.status !== 200) {
        this.$message({
          message: res.msg || i18n.t('文件删除失败'),
          type: 'error',
        })
        this.getFileList()
      } else {
        this.$message({
          message: i18n.t('文件删除成功'),
          type: 'success',
        })
      }
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
    // 评论
    commentData(res) {
      this.commentList = res
    },
    // 反馈历程
    async getFeedbackProcess() {
      const res = await this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_PROCESS,
        {
          feedbackId: this.feedbackId,
          source: this.source,
        },
      )

      if (res.status === 200) {
        this.feedbackProcess = res.data
      }
    },
    // 400反馈详情tab工单历程+催单内容
    async getWorkOrderExtra(orderId) {
      const res = await this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_WORK_ORDER_EXTRA,
        {
          feedbackNumber: orderId,
        },
      )

      if (res.status === 200) {
        const {
          reminderContent,
          dealResult,
          statusLog,
          solveProgress,
        } = res.data
        this.remindersInfo = reminderContent || []
        this.workOrderProcess = statusLog || []
        this.dealResult = StrToHtml(dealResult)
        this.solveProgress = StrToHtml(solveProgress)
      }
      // todo 这里替换的原因是，后台返回的字符串带有换行符，HTML标签不能识别，所以替换为<br/>; HTML标签转义
      function StrToHtml(str) {
        return (
          str?.replace(/<|>|\r\n|\n/g, function(s) {
            switch (s) {
              case '<':
                return '&lt;'
              case '>':
                return '&gt;'
              case '\r\n':
                return '<br/>'
              case '\n':
                return '<br/>'
            }
          }) || i18n.t('暂无信息')
        )
      }
    },
    // 工作项进度
    async getWorkItemProcess(id, type) {
      const res = await this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_WORK_ITEM_PROCESS,
        {
          workItemId: id,
          workItemType: type,
        },
      )

      if (res.status === 200) {
        const { result, desc } = res.data
        this.processList =
          (result?.length &&
            result.map(item => {
              return {
                statusName: item.status,
                ...item,
              }
            })) ||
          []
        this.processDate = desc
      }
    },
    // 反馈内容全屏
    fullScreenMethod() {
      this.statusObject.fullScreen = !this.statusObject.fullScreen
    },
    // 关闭slide
    closeDetail() {
      this.$emit('update:show', false)
    },
    // 状态流转按钮点击
    statusFlowButtonClickHandler(type = 'GET_FEEDBACK') {
      this.statusType = type
      // 1. 产品选择其他时 + 领单
      // 2. 非内部创建 + 领单/转交
      if (
        (this.feedbackDetail.data.productId === productIdOther &&
          ['GET_FEEDBACK'].includes(type)) ||
        (this.source !== FEEDBACK_SOURCE_INNER &&
          ['GET_FEEDBACK', 'FORWARD_FEEDBACK'].includes(type)) ||
        ['REOPEN'].includes(type)
      ) {
        this.$refs.FeedbackStatusFlow.postInfo({
          id: this.feedbackDetail.detail.id,
          action: type,
        })

        return
      }
      this.statusDialogVisible = true
    },
    // 删除反馈
    feedbackDelete: debounce(async function() {
      let info = this.feedbackDetail
      if (!info.detail.editAble) {
        this.$message({
          message: i18n.t('当前状态反馈不可删除'),
          type: 'warning',
        })
        return
      }
      // eslint-disable-next-line no-useless-escape
      this.$confirm(`确认删除反馈\"${info.detail.title}\"吗？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const result = await deleteInner(info.detail.id)

          if (result.status === 200) {
            this.$message({
              message: result.msg || '反馈删除成功',
              type: 'success',
            })

            if (this.$getUrlParams().feedbackId) {
              this.$router.replace({
                path: this.$route.path,
                query: {
                  ...this.$route.query,
                  feedbackId: null,
                },
              })
            }
            this.closeDetail()
            this.$store.dispatch(
              operationActionTypes.ACTION_OPERATION_FEEDBACK_GET_FEEDBACK_LIST,
            )
          }
        })
        .catch(() => {})
    }, 300),
    // 转需求
    feedbackToRequirement() {
      this.toRequirementShow = true
    },
    // 关闭转需求、转缺陷
    afterToClose() {
      this.toRequirementShow = false
      this.toDefectShow = false
    },
    // 转缺陷
    feedbackToDefect() {
      this.toDefectShow = true
    },
    // 转需求、转缺陷成功
    transferSuccess() {
      // 如果是转交，则直接关闭弹窗
      if (
        ['FORWARD_FEEDBACK', 'FORWARD_FEEDBACK_400'].includes(this.statusType)
      ) {
        if (this.$getUrlParams().feedbackId) {
          this.$router.replace({
            path: this.$route.path,
            query: {
              ...this.$route.query,
              feedbackId: null,
            },
          })
        }
        this.closeDetail()
        this.getFeedbackProcess()
        this.$store.dispatch(
          operationActionTypes.ACTION_OPERATION_FEEDBACK_GET_FEEDBACK_LIST,
        )
        return
      }
      this.afterToClose()
      this.getFeedbackDetail()
      this.getFeedbackProcess()
      this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_GET_FEEDBACK_LIST,
      )
    },
    checkDealResultAuth() {
      const feedbackId = this.feedbackId || this.$route.query.feedbackId
      this.$store.dispatch(
        operationActionTypes.ACTION_CHECK_OPERATION_DEAL_RESULT_AUTH,
        {
          id: feedbackId,
        },
      )
    },
    // 反馈详情el-tabs切换
    tabClick(val) {
      if (this.source === FEEDBACK_SOURCE_400 && val.name === '3') {
        this.checkDealResultAuth()
        this.getWorkOrderExtra(this.feedbackInfo.singleText1)
      }
    },
    // 添加进度或处理结果成功回调
    addDealResultSuccess() {
      this.getWorkOrderExtra(this.feedbackInfo.singleText1)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/project/ProjectCommon';
@import '@/style/mixin';
.detail-content {
  .detail-content-body {
    .detail-content-left {
      .detail-content-header {
        align-items: flex-start;
        .detail-content-header-id {
          top: 0;
          flex-shrink: 0;
        }
        .title {
          flex: 1;
          font-size: 22px;
          line-height: 35px;
          cursor: pointer;
          padding: 0 5px;
          margin-left: 10px;
        }
      }
    }
  }
}
.edit-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background-color: white;
  z-index: 99999;
}
.showMore {
  height: 349px;
  overflow: hidden;
  border-radius: 5px;
  padding: 0 1px;
}
.detail-content-footer {
  /deep/ .el-tabs__content {
    overflow: auto;
  }
}
.detail-content-left {
  position: relative;
}
.textTaskbox {
  position: absolute;
  width: 100%;
  background: rgba(218, 210, 210, 0.5);
  bottom: 0;
  left: 0;
  height: 50px;
  transform: translateZ(0);
}
.moreText {
  text-align: center;
  color: #409eff;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
  padding-bottom: 10px;
}
.content-text {
  padding: 8px 10px;
  background-color: #f5f5f5;
  span {
    display: block;
    color: #666666;
    margin-bottom: 15px;
  }
  p {
    padding: 0;
    margin: 0;
    color: #333;
    word-break: break-all;
  }
  .mb10 {
    margin-bottom: 10px;
  }
}
.result-box {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  &:first-child {
    margin-bottom: 10px;
  }
  p {
    padding: 10px 20px 0 0;
    margin: 0;
    flex-shrink: 0;
    font-size: 14px;
    color: #333;
  }
  div {
    flex: 1;
    background-color: #f5f5f5;
    min-height: 80px;
    max-height: 500px;
    overflow: auto;
    padding: 8px 10px;
    box-sizing: border-box;
  }
}
</style>
