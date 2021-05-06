<template>
  <div class="feedback-inner page-content__feedback">
    <two-block-width-changer
      :init-left-width="248"
      fixed-left
      bar-type="tiny"
      expand-btn
    >
      <div slot="left">
        <LeftColSelect
          :default-active="currentFilterId"
          :data="leftColSelectData"
          @change="onLeftColSelectChange"
        >
        </LeftColSelect>
      </div>
      <div
        slot="right"
        v-loading="feedbackListLoading"
        class="page-content__feedback--right"
      >
        <co-row class="feedback-filter">
          <co-col :span="24">
            <FeedbackFilter
              ref="feedbackFilter"
              @create="showCreateModal"
              @export="exportFeedback"
            />
          </co-col>
        </co-row>
        <div class="feedback-content">
          <FeedbackList @table-cell-click="showdetailModal" />
        </div>
      </div>
    </two-block-width-changer>
    <!-- 右侧弹窗 - 创建反馈 -->
    <slide
      ref="side1"
      :key="restore"
      v-loading="loading"
      :show="showCreate"
      :after-close="createModalClosed"
      @click.stop
    >
      <div slot="task" class="silder-box">
        <create-feedback
          v-if="showCreate"
          :show.sync="showCreate"
          @onSave="onSave"
        />
      </div>
    </slide>
    <!-- 右侧弹窗 - 反馈详情 -->
    <slide
      ref="side2"
      v-loading="loading"
      :show="showDetail"
      :after-close="detailModalClosed"
      @click.stop
    >
      <div slot="task" class="silder-box">
        <feedback-detail
          :show.sync="showDetail"
          :loading.sync="loading"
          :feedback-id="currentFeedback ? currentFeedback.data.id : ''"
        />
      </div>
    </slide>
  </div>
</template>
<script>
/**
 * @title 运营 - 反馈
 * @description 模块主要由两栏布局、反馈过滤、反馈分类、反馈列表构成
 * @author wuqian
 * @time 2020.5.2
 */
import FeedbackCommonMixin from '../Common/FeedbackCommonMixin'
import CreateFeedback from '../Common/CreateFeedback'
import { mapState } from 'vuex'
export default {
  name: 'FeedbackInner',
  components: {
    CreateFeedback,
  },
  mixins: [FeedbackCommonMixin],

  data() {
    return {
      showCreate: false,
      restore: 1,
    }
  },
  computed: {
    ...mapState({
      feedbackListLoading: state =>
        state.operationFeedbackList.feedbackListLoading,
    }),
  },
  watch: {
    $route: {
      handler: function(val) {
        // 点击全局悬浮按钮，意见反馈时，显示创建反馈
        if (val.query.source === 'suggestBtn') {
          this.$nextTick(() => {
            this.showCreate = true
          })
        }
      },
      immediate: true,
    },
  },

  created() {},
  mounted() {
    if (this.$getUrlParams().productId) {
      this.showCreateModal()
    }
  },
  methods: {
    // 弹出创建slide
    showCreateModal() {
      this.showCreate = true
    },
    // 关闭创建 slide 回调
    createModalClosed() {
      this.showCreate = false
      this.restore = Math.random() * 10
      // 去掉链接里面的 productId，用于清除新建时的产品默认选中
      if (this.$getUrlParams().productId) {
        this.$router.replace({
          path: this.$route.path,
          query: { ...this.$route.query, productId: undefined },
        })
      }
    },
    onSave() {
      this.showCreate = false
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../../common.scss';
</style>
