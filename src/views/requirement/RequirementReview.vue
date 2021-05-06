<template>
  <div class="requirement-review-content">
    <co-button
      v-if="reviewable"
      type="text"
      class="create-review"
      @click="createReview"
      >+{{ $t('发起评审') }}</co-button
    >
    <ReviewTable :review-table-data="requirementReviewList"></ReviewTable>
  </div>
</template>
<script>
// import { i18n } from '@/i18n'
/*
 * @Author: 王玲
 * @Date: 2020-06-05 10:28:18
 * @LastEditTime: 2020-06-05 10:29:32
 * @LastEditors: Please set LastEditors
 * @Description: 需求评审
 */
import ACTIONCONSTVARLIABLE from '@/store/action-types'
import ReviewTable from './components/ReviewTable'
import { windowOpenRouter } from '@/utils/sub-app-util'
export default {
  name: 'RequirementReview',
  components: {
    ReviewTable,
  },

  props: {
    requireId: {
      type: [String, Number],
      required: true,
      desc: '工作项id',
    },

    projectId: {
      type: [String, Number],
      required: true,
      desc: '项目id',
    },

    reviewable: {
      type: Boolean,
      required: true,
      desc: '是否显示新建评审按钮',
    },
  },

  data() {
    return {}
  },
  computed: {
    requirementReviewList() {
      return this.$store.state.review.requirementReviewList
    },
  },

  mounted() {
    this.getReviewList()
  },
  methods: {
    // 获取需求评审列表
    getReviewList() {
      this.$store.dispatch(ACTIONCONSTVARLIABLE.GET_REQUIREMENT_REVIEW_LIST, {
        workItemId: this.requireId,
      })
    },
    // 创建评审需求
    createReview() {
      windowOpenRouter(
        `/reviewAdmin/requirement/create?id=${this.requireId}&projectId=${this.projectId}`,
        '_blank',
      )
    },
  },
}
</script>
<style lang="scss" scoped>
.requirement-review-content {
  margin-top: -3px;
  .create-review {
    font-size: 14px;
  }
}
</style>
