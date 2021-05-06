<template>
  <div class="operation-feedback">
    <div v-loading="loading" class="operation-feedback__content">
      <router-view />
    </div>
  </div>
</template>
<script>
/**
 * @title 运营 - 反馈
 * @description 模块主要由内部用户反馈、400工单反馈构成
 * @author wuqian
 * @time 2020.5.7
 */
import { mapState } from 'vuex'
export default {
  name: 'Feedback',
  components: {},
  data() {
    return {}
  },
  computed: {
    ...mapState({
      loading: state => state.operationFeedbackList.loading,
    }),
  },

  created() {},
  mounted() {},
  methods: {
    changeView(path) {
      // 切换模块时清空路由参数
      this.$router.push({ path: path })
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../common.scss';
</style>
