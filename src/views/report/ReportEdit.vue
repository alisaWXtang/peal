<template>
  <div class="ui-report-edit" @scroll="contentScroll">
    <co-button
      class="back-btn"
      type="text"
      size="medium"
      icon="co-icon-arrow-left"
      @click="pageTypeChange('list')"
      >{{ $t('返回') }}</co-button
    >
    <report-type
      ref="reportType"
      :report-type-id.sync="reportInfo[HTTPINFOMAP.reportTypeId]"
      :report-id.sync="reportInfo[HTTPINFOMAP.reportId]"
      :report-template-id.sync="reportInfo[HTTPINFOMAP.reportTemplateId]"
      @updateReportHeader="updateReportHeader"
    ></report-type>
    <report-header
      ref="reportHeader"
      :mail-topic-name.sync="reportInfo[HTTPINFOMAP.mailTopicName]"
      :mail-recipers.sync="reportInfo[HTTPINFOMAP.mailRecipers]"
      :mail-other-recipers.sync="reportInfo[HTTPINFOMAP.mailOtherRecipers]"
    ></report-header>
    <report-content
      ref="reportContent"
      :report-content.sync="reportInfo[HTTPINFOMAP.reportContent]"
      :project-id="projectId"
      @updateReportContent="updateReportContent"
    ></report-content>
    <report-footer
      ref="reportFooter"
      :template-name.sync="reportInfo[HTTPINFOMAP.templateName]"
      @sendEmail="postReportInfo('sendEmail')"
      @saveTemplate="postReportInfo('saveTemplate')"
      @saveDraft="postReportInfo('saveDraft')"
      @emailPreview="emailPreview"
      @cancel="pageTypeChange('list')"
    ></report-footer>
  </div>
</template>

<script>
import ReportType from './ReportType'
import ReportHeader from './ReportHeader'
import ReportContent from './ReportContent'
import HTTPINFOMAP from './HTTPINFOMAP'
import ReportFooter from './ReportFooter'
import ReportMixin from './ReportMixin'
import ReportTableCSS from '!!raw-loader!@/style/global-box/ReportTable.scss'
import { queryDraft } from '@/service/report'
import PreviewDialog from './PreviewDialog.js'
import { getRouterUrl } from '@/utils/sub-app-util'

export default {
  name: 'ReportEdit',
  components: {
    ReportType,
    ReportHeader,
    ReportContent,
    ReportFooter,
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
  mounted() {
    const { reportId } = this.$route.query
    // 报告 id 不存在，返回列表页面
    if (!reportId) {
      this.pageTypeChange('list')
    } else {
      this.queryReport()
    }
  },
  beforeDestroy() {
    // 销毁预览弹窗
    PreviewDialog.destroy()
  },
  beforeRouteLeave(to, from, next) {
    // 离开 /report 或者 /report/edit 都把Draft 置为false
    if (to.path !== '/report') {
      this.$store.dispatch('setReportDraft', false)
    }
    next()
  },
  methods: {
    contentScroll() {
      // 视口滚动，关闭富文本颜色选择器弹窗，table选择弹窗
      const editorTable = document.querySelector('button.tox-tbtn--active')
      if (editorTable) {
        editorTable.click()
      }
      const editorColor = document.querySelector('.tox-tbtn--enabled')
      if (editorColor) {
        editorColor.click()
      }
    },
    // 报告预览
    previewReport(reportId) {
      PreviewDialog.show({
        reportId,
      })
    },
    // 发送邮件、保存模板 0、保存草稿 1
    postReportInfo(url) {
      let count = this.getUserInputValue()
      if (url === 'sendEmail') {
        this.$refs.reportHeader.$refs.messageForm.validate(valid => {
          if (valid) {
            // 没有保存之前调用保存草稿接口
            if (count > 0) {
              queryDraft({
                ...this.params,
                shortCut: 1,
              }).then(result => {
                if (result.status === 200) {
                  // 数据处理
                  result.data && this.getReportInfoResultHandle(result.data)
                  this.saveTemplate(
                    {
                      ...this.params,
                      html: this.getFullHtml(),
                      reportDomain: getRouterUrl('', true) || location.origin,
                    },

                    url,
                    true,
                  )
                }
              })
            } else {
              this.saveTemplate(
                {
                  ...this.params,
                  html: this.getFullHtml(),
                  reportDomain: getRouterUrl('', true) || location.origin,
                },

                url,
                true,
              )
            }
          }
        })
      } else {
        // shortCut
        this.params.shortCut = this.shortCut[url]
        this.saveTemplate(this.params, url, true)
        // // 更新模板
        // this.$refs.reportType.getTemplates()
      }
    },
    // 获取邮件完整的 html
    getFullHtml() {
      const header = `<html><head><meta charset="UTF-8"/><style type="text/css">${ReportTableCSS}</style></head><body>`
      const body = this.getAllItemHtml()
      const footer = `</body></html>`
      return header + body + footer
    },
  },
}
</script>
<style lang="scss" scoped>
.ui-report-edit {
  padding: 16px 24px;

  .back-btn {
    color: $--color-text-regular;

    &:hover {
      color: $--color-primary;
    }
  }

  /deep/ .report-module-title {
    margin: 24px 0 16px 0;
    font-size: 16px;
    color: $--color-text-fine;
    line-height: 24px;
    font-weight: bold;
  }
}
</style>
