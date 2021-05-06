<template>
  <div class="feedback-400 page-content__feedback">
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
            <FeedbackFilter @export="exportFeedback" />
          </co-col>
        </co-row>
        <div class="feedback-content">
          <FeedbackList @table-cell-click="showdetailModal" />
        </div>
      </div>
    </two-block-width-changer>
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
import { mapState } from 'vuex'

export default {
  name: 'Feedback400',
  components: {},
  mixins: [FeedbackCommonMixin],
  data() {
    return {}
  },
  computed: {
    ...mapState({
      feedbackListLoading: state =>
        state.operationFeedbackList.feedbackListLoading,
    }),
  },
  watch: {},
  created() {},
  methods: {},
}
</script>
<style lang="scss" scoped>
@import '../../common.scss';
</style>
