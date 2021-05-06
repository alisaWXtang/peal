<template>
  <co-dialog
    v-loading="loading"
    :title="titleMap[statusType]"
    width="420px"
    :visible.sync="currentVisible"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    @closed="resetDate"
  >
    <co-form
      v-if="currentVisible"
      ref="dialogForm"
      :model="dialogForm"
      @submit.native.prevent
    >
      <co-form-item
        v-if="statusType === 'GET_FEEDBACK'"
        :label="$t('反馈类型')"
        label-width="100px"
        class="mt15"
        prop="feedbackTypeId"
        :rules="[
          { required: true, message: '反馈类型不能为空', trigger: 'blur' },
        ]"
      >
        <el-cascader
          v-model="dialogForm.feedbackTypeId"
          :options="feedbackTypeList"
          :props="{
            multiple: true,
            value: 'id',
            label: 'name',
            emitPath: false,
          }"
          :show-all-levels="false"
          :placeholder="$t('请选择')"
          @visible-change="show => !show && formValid()"
          @remove-tag="formValid"
        ></el-cascader>
      </co-form-item>
      <template v-if="statusType === 'FORWARD_FEEDBACK'">
        <co-form-item
          :label="$t('产品名称')"
          label-width="100px"
          class="mt15"
          prop="productId"
          :rules="[
            {
              required: true,
              message: $t('产品名称不能为空'),
              trigger: 'blur',
            },
          ]"
        >
          <typed-form-item
            v-model="dialogForm.productId"
            :popper-append-to-body="true"
            type="SINGLE_CHOICE"
            :select-list="productIdList"
            filterable
            @change="
              value => {
                innerProductChange(value)
              }
            "
            @remove-tag="formValid"
          ></typed-form-item>
        </co-form-item>
        <co-form-item
          :label="$t('当前处理人')"
          label-width="100px"
          class="mt15"
          prop="currentProcessors"
          :rules="[
            { required: true, message: '当前处理人不能为空', trigger: 'blur' },
          ]"
        >
          <global-user-select
            v-model="dialogForm.currentProcessors"
            multiple
            :disabled="dialogForm.productId !== productIdOther"
            @visible-change="show => !show && formValid()"
            @remove-tag="formValid"
          ></global-user-select>
        </co-form-item>
      </template>
      <co-form-item
        v-if="statusType === 'PROCESS_FEEDBACK'"
        :label="$t('处理方法')"
        label-width="100px"
        class="mt15"
        prop="processMethod"
        :rules="[
          { required: true, message: '处理方法不能为空' },
          {
            min: 0,
            max: 2000,
            message: '处理方法不能超过2000个字符',
            trigger: 'change',
          },
        ]"
      >
        <co-input
          v-model="dialogForm.processMethod"
          type="textarea"
          :rows="4"
          :placeholder="$t('请填写处理方法')"
        ></co-input>
      </co-form-item>
      <co-form-item
        v-if="statusType === 'REJECT_FEEDBACK'"
        :label="$t('驳回原因')"
        label-width="100px"
        class="mt15"
        prop="rejectReason"
        :rules="[
          { required: true, message: '驳回原因不能为空' },
          {
            min: 0,
            max: 200,
            message: '驳回原因不能超过200个字符',
            trigger: 'change',
          },
        ]"
      >
        <co-input
          v-model="dialogForm.rejectReason"
          type="textarea"
          :rows="4"
          :placeholder="$t('请填写驳回原因')"
        ></co-input>
      </co-form-item>
      <!--  -->
      <co-form-item
        v-if="statusType === 'FORWARD_FEEDBACK_400'"
        label="业务对接人"
        label-width="100px"
        class="mt15"
        prop="currentWorkOrderButtPeople"
        :rules="[{ required: true, message: '业务对接人不能为空' }]"
      >
        <co-select
          v-model="dialogForm.currentWorkOrderButtPeople"
          placeholder="请选择"
          filterable
          @change="changeCureentWorkIrderButtPeople"
        >
          <co-option
            v-for="item in workOrderButtPeopleList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </co-option>
        </co-select>
      </co-form-item>
      <co-form-item
        v-if="
          statusType === 'FORWARD_FEEDBACK_400' &&
            dialogForm.workOrderCurrentProcessors &&
            dialogForm.workOrderCurrentProcessors.length
        "
        label="当前处理人:"
        label-width="100px"
        class="mt15"
      >
        <div>{{ formatCureentProcessors() }}</div>
      </co-form-item>
    </co-form>
    <div slot="footer">
      <co-button size="small" @click="closeDialog">{{ $t('取消') }}</co-button>
      <co-button type="primary" size="small" @click="submit">{{
        $t('确定')
      }}</co-button>
    </div>
  </co-dialog>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 状态流转组件
 * @desc 包含了领单、转交、处理完成、驳回
 * @author heyunjiang
 * @date 2020.5.20
 */
import debounce from 'lodash/debounce'
import GlobalUserSelect from '@/components/global-user-select'
import { mapState } from 'vuex'
import { operationActionTypes } from '@/store/action-types'
import { isEmpty } from '@/utils'

const titleMap = {
  GET_FEEDBACK: '选择反馈类型',
  FORWARD_FEEDBACK: '选择转交人',
  PROCESS_FEEDBACK: '填写处理方法',
  REJECT_FEEDBACK: '填写驳回原因',
  FORWARD_FEEDBACK_400: '选择转交人',
}

const productIdOther = -2 // 产品名称其他

export default {
  name: 'FeedbackStatusFlow',
  components: {
    GlobalUserSelect,
  },

  mixins: [],
  props: {
    visible: {
      type: Boolean,
      required: true,
      desc: '控制 dialog 框是否展示，支持 .sync 修饰符',
    },

    detail: {
      type: Object,
      required: true,
      desc: '反馈详情',
    },

    statusType: {
      type: String,
      required: true,
      validator: value => {
        return [
          'GET_FEEDBACK',
          'FORWARD_FEEDBACK',
          'PROCESS_FEEDBACK',
          'REJECT_FEEDBACK',
          'FORWARD_FEEDBACK_400',
        ].includes(value)
      },
      desc: '当前状态流转类型',
    },
  },

  data() {
    return {
      titleMap,
      currentVisible: this.visible,
      loading: false,
      // 表单数据
      dialogForm: {
        feedbackTypeId: [], // 领单 - 反馈类型
        processMethod: '', // 处理完成 - 处理方法
        rejectReason: '', // 驳回 - 驳回原因
        productId: '', // 转交 - 产品名称
        currentProcessors: [], // 转交 - 处理人
        currentWorkOrderButtPeople: '', // 400工单反馈 - 业务对接人
        workOrderCurrentProcessors: [], // 400工单反馈 - 转交当前处理人
      },
      feedbackTypeList: [], // 反馈类型可选值
      productList: [], // 产品列表可选值
      productIdOther,
      workOrderButtPeopleList: [], // 400工单反馈 - 业务对接人列表
    }
  },
  computed: {
    ...mapState({
      productIdList: state =>
        state.operationFeedbackList.productIdList.map(item => {
          return {
            ...item,
            key: item.id,
            value: item.productName,
          }
        }),
    }),
  },

  watch: {
    visible() {
      this.currentVisible = this.visible
      this.initData()
    },
    currentVisible() {
      if (this.currentVisible !== this.visible) {
        this.$emit('update:visible', this.currentVisible)
      }
    },
  },

  created() {},
  mounted() {},
  methods: {
    // 数据初始化
    async initData() {
      // 400工单 - 转交 - 业务对接人
      if (this.statusType === 'FORWARD_FEEDBACK_400') {
        this.getInterfacePeopleList()
      }

      if (!['GET_FEEDBACK', 'FORWARD_FEEDBACK'].includes(this.statusType)) {
        return
      }
      if (this.statusType === 'FORWARD_FEEDBACK') {
        this.dialogForm.productId = +this.detail.data.productId
      }
      this.innerProductChange(this.detail.data.productId, true)
    },
    // 400反馈详情 - 业务对接人列表
    async getInterfacePeopleList() {
      const result = await this.$store.dispatch(
        operationActionTypes.ACTION_GET_BUTT_PEOPLE_LIST,
        { type: 2 },
      )
      this.workOrderButtPeopleList = result.data
    },
    // 400反馈详情 - 根据产品查询对接人
    async getQueryDockingUserList() {
      const result = await this.$store.dispatch(
        operationActionTypes.ACTION_GET_QUERY_DOCKING_USER_LIST,
        { id: this.dialogForm.currentWorkOrderButtPeople },
      )
      this.dialogForm.workOrderCurrentProcessors = result.data || []
    },
    // 改变业务对接人
    changeCureentWorkIrderButtPeople() {
      this.getQueryDockingUserList()
    },
    // 400反馈详情 - 转交- 格式化当前处理人
    formatCureentProcessors() {
      const currentProcessors = this.dialogForm.workOrderCurrentProcessors?.map(
        item => `${item.userName}(${item.userId})`,
      )
      return currentProcessors.join('，')
    },
    // 当切换产品时
    async innerProductChange(id, isInit) {
      const {
        dockingUsers,
        feedbackTypeTree,
      } = await this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_PRODUCTDETAIL_QUERY,
        { id },
      )

      this.feedbackTypeList = feedbackTypeTree
      this.dialogForm.currentProcessors = dockingUsers

      // 特殊处理，如果反馈类型列表为空，则当前无选中值
      if (feedbackTypeTree.length && this.statusType === 'GET_FEEDBACK') {
        this.dialogForm.feedbackTypeId = isEmpty(
          this.detail.data.feedbackTypeId,
        )
          ? []
          : this.detail.data.feedbackTypeId
      }
      // 如果主动切换产品则校验表单
      if (!isInit) {
        this.formValid()
      }
    },
    // 表单验证
    formValid() {
      return new Promise((resolve, reject) => {
        this.$refs.dialogForm.validate(valid => {
          if (valid) {
            resolve(true)
          } else {
            reject(false)
          }
        })
      })
    },
    // 点击确定
    submit: debounce(async function() {
      let result = false
      try {
        result = await this.formValid()
        // eslint-disable-next-line no-empty
      } catch (_) {}
      if (!result) {
        return
      }
      this.loading = true
      const param = {
        id: this.detail.detail.id,
        action: this.statusType,
      }

      // 领单
      if (this.statusType === 'GET_FEEDBACK') {
        param.feedbackTypeId = this.dialogForm.feedbackTypeId
      }
      // 转交
      if (this.statusType === 'FORWARD_FEEDBACK') {
        param.productId = this.dialogForm.productId
        param.currentProcessors = this.dialogForm.currentProcessors.map(
          item => item.userId,
        )
      }
      // 400工单反馈 - 转交
      if (this.statusType === 'FORWARD_FEEDBACK_400') {
        param.dispatchObj = this.dialogForm.currentWorkOrderButtPeople
        param.currentProcessors = this.dialogForm.workOrderCurrentProcessors?.map(
          item => item.userId,
        )
        param.action = 'FORWARD_FEEDBACK'
      }
      // 驳回
      if (this.statusType === 'REJECT_FEEDBACK') {
        param.rejectReason = this.dialogForm.rejectReason
      }
      // 处理完成
      if (this.statusType === 'PROCESS_FEEDBACK') {
        param.processMethod = this.dialogForm.processMethod
      }
      this.postInfo(param)
    }, 300),
    // 发起状态流转请求
    async postInfo(param) {
      const result = await this.$store.dispatch(
        operationActionTypes.ACTION_UPDATE_OPERATION_STATUS_TRANSFER,
        param,
      )

      this.loading = false
      if (result.status === 200) {
        this.$message({
          type: 'success',
          message: result.msg || i18n.t('处理成功'),
        })

        this.$emit('transferSuccess')
        this.closeDialog()
      }
    },
    closeDialog() {
      this.currentVisible = false
      this.loading = false
    },
    // 数据重置 - 关闭 dialog 时
    resetDate() {
      this.dialogForm = {
        feedbackTypeId: [], // 领单 - 反馈类型
        processMethod: '', // 处理完成 - 处理方法
        rejectReason: '', // 驳回 - 驳回原因
        productId: '', // 转交 - 产品名称
        currentProcessors: [], // 转交 - 处理人
        currentWorkOrderButtPeople: '', // 400工单反馈 - 业务对接人
        workOrderCurrentProcessors: [], // 400工单反馈 - 转交当前处理人
      }
    },
  },
}
</script>
<style lang="scss" scoped>
/deep/.el-cascader {
  width: 230px !important;
}
</style>
