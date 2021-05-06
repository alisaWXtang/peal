<template>
  <div>
    <div
      v-if="!dealResultVisible && !solveProgressVisible"
      class="deal-result-btn"
    >
      <el-button type="primary" @click="openSolveProgressContent"
        >添加解决进度</el-button
      >
      <el-button type="primary" @click="openDealResultContent"
        >添加处理结果</el-button
      >
    </div>

    <div v-else id="feedback-deal-result-box" class="deal-result-content">
      <div v-if="dealResultVisible" class="deal-result-box deal-result-common">
        <div class="deal-result-item">
          <div class="title">处理结果</div>
          <div class="textarea-box">
            <co-input
              v-model="dealResultContent"
              v-focus
              type="textarea"
              class="textarea"
            ></co-input>
          </div>
        </div>
        <div class="opreation">
          <el-button
            type="primary"
            :loading="dealResultLoading"
            @click="addDealResultContent('dealReault')"
            >添加</el-button
          >
          <el-button @click="cancelDealResultContent">取消</el-button>
        </div>
      </div>
      <div
        v-if="solveProgressVisible"
        class="solve-progress-box deal-result-common"
      >
        <div class="deal-result-item">
          <div class="title">解决进度</div>
          <div class="textarea-box">
            <co-input
              v-model="solveProgressContent"
              v-focus
              type="textarea"
              class="textarea"
            ></co-input>
          </div>
        </div>
        <div class="opreation">
          <el-button
            type="primary"
            :loading="solveProgressLoading"
            @click="addDealResultContent('solveProgress')"
            >添加</el-button
          >
          <el-button @click="cancelSolveProgressContent">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * @title
 * @desc
 * @author wangling
 * @date
 */
import { operationActionTypes } from '@/store/action-types'

export default {
  name: 'AddDealResultBtn',
  components: {},
  mixins: [],
  props: {
    feedbackId: {
      type: [Number, String],
      desc: '反馈详情id',
    },
    feedbackNumber: {
      type: [Number, String],
      desc: '互联网单号',
    },
  },
  data() {
    return {
      dealResultVisible: false, // 400处理结果按钮显示，true则显示内容
      solveProgressVisible: false, // 400处理进度按钮显示，true则显示内容
      dealResultContent: '', // 400处理结果新增内容
      solveProgressContent: '', // 400处理进度新增内容
      dealResultLoading: false, // 处理结果tab添加按钮loading
      solveProgressLoading: false, // 处理进度tab添加按钮loading
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    // 打开添加解决进度 编辑内容框
    openSolveProgressContent() {
      this.solveProgressVisible = !this.solveProgressVisible
    },
    // 打开添加处理结果 编辑内容框
    openDealResultContent() {
      this.dealResultVisible = !this.dealResultVisible
    },
    // 取消添加处理结果 编辑内容框
    cancelDealResultContent() {
      this.dealResultVisible = !this.dealResultVisible
      this.dealResultContent = ''
    },
    // 取消添加解决进度 编辑内容框
    cancelSolveProgressContent() {
      this.solveProgressVisible = !this.solveProgressVisible
      this.solveProgressContent = ''
    },
    // 添加处理结果或者解决进度
    async addDealResultContent(type) {
      const dealBtnMap = {
        dealReault: {
          dispatchName: 'ACTION_ADD_OPERATION_DEAL_RESULT',
          contentName: 'dealResultContent',
          successCallback: 'cancelDealResultContent',
          loadingName: 'dealResultLoading',
        },
        solveProgress: {
          dispatchName: 'ACTION_ADD_OPERATION_SOLVE_PROGRESS',
          contentName: 'solveProgressContent',
          successCallback: 'cancelSolveProgressContent',
          loadingName: 'solveProgressLoading',
        },
      }

      const {
        dispatchName,
        contentName,
        successCallback,
        loadingName,
      } = dealBtnMap[type]
      if (!this[contentName]) {
        this.$message.warning('内容不能为空')
        return
      }
      this[loadingName] = true
      const result = await this.$store.dispatch(
        operationActionTypes[dispatchName],
        {
          feedbackNumber: this.feedbackNumber,
          content: this[contentName],
          feedbackId: this.feedbackId,
        },
      )
      this[loadingName] = false
      if (result?.status === 200) {
        this[successCallback]()
        this.$emit('addSuccessCallback')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.deal-result-btn,
.deal-result-content {
  margin-bottom: 20px;
}
.deal-result-common .deal-result-item {
  display: flex;
  .title {
    padding: 10px 20px 0 0;
    flex-shrink: 0;
    font-size: 14px;
    color: #333;
  }
  .textarea-box {
    flex: 1;
    height: 100px;
    .textarea {
      height: 100%;
    }
    /deep/.el-textarea__inner {
      height: 100%;
    }
  }
}
.deal-result-common .opreation {
  margin: 10px 0 0 76px;
}
#feedback-deal-result-box .textarea-box /deep/.el-textarea__inner {
  resize: none !important;
}
</style>
