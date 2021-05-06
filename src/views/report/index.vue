<template>
  <div class="ui-page-report">
    <el-button class="report-create" type="primary" @click="newReportClick">{{
      $t('新建报告')
    }}</el-button>
    <report-list
      :report-id.sync="reportInfo[HTTPINFOMAP.reportId]"
      @pageTypeChange="pageTypeChange"
      @emailPreview="emailPreview"
    ></report-list>
  </div>
</template>
<script>
import ReportList from './ReportList'
import HTTPINFOMAP from './HTTPINFOMAP'
import ReportMixin from './ReportMixin'
import PreviewDialog from './PreviewDialog.js'

export default {
  name: 'ReportContainer',
  components: {
    ReportList,
  },

  mixins: [ReportMixin],
  props: {},
  data() {
    return {
      HTTPINFOMAP,
    }
  },
  computed: {},
  watch: {},
  created() {
    // 携带 reportId 即为预览报告
    const { reportId } = this.$route.query
    if (reportId) {
      this.previewReport(reportId)
    }
  },
  beforeDestroy() {
    // 销毁预览弹窗
    PreviewDialog.destroy()
  },
  beforeRouteLeave(to, from, next) {
    // 离开 /report 或者 /report/edit 都把Draft 置为false
    if (to.path !== '/report/edit') {
      this.$store.dispatch('setReportDraft', false)
    }
    next()
  },
  methods: {
    // 报告预览
    previewReport(reportId) {
      PreviewDialog.show({
        reportId,
      })
    },
    // 点击新建报告
    async newReportClick() {
      this.$store.dispatch('setReportDraft', false)
      await this.createReport()
      this.pageTypeChange('new')
    },
  },
}
</script>
<style lang="scss" scoped>
.ui-page-report {
  position: relative;
  padding: 10px 24px;

  .report-create {
    position: absolute;
    top: 16px;
    right: 24px;
    z-index: 1;
  }
}
</style>
