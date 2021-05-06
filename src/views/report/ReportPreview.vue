<template>
  <div class="report-preview-mask">
    <div class="report-preview-container">
      <div class="dialog-header">
        <div class="preview-dialog-title">{{ t('邮件详情') }}</div>
        <i class="co-icon-close" @click="hidden"></i>
      </div>
      <div class="content-container">
        <!-- 邮件头 -->
        <div class="email-header">
          <div class="dialog-title">{{ mailTopicName }}</div>
          <div class="senderCC">
            <div class="senderCC-name">
              <span>{{ t('收件人') }}：</span>
            </div>
            <div class="senderCC-content">
              <span v-for="item in mailRecipers" :key="item.userName"
                >{{ item.userEmail | userEmail(item.userName, item.userId) }}
              </span>
            </div>
          </div>
          <div class="senderCC">
            <div class="senderCC-name">
              <span>{{ t('抄送人') }}：</span>
            </div>
            <div class="senderCC-content">
              <span v-for="item in mailOtherRecipers" :key="item.userName"
                >{{ item.userEmail | userEmail(item.userName, item.userId) }}
              </span>
            </div>
          </div>
        </div>
        <!-- 邮件内容 -->
        <div v-html="emailtemplate"></div>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * @title 邮件预览组件
 * @desc
 * @author huangmei
 * @date
 */
import { i18n } from '@/i18n'
import ReportMixin from './ReportMixin'
import HTTPINFOMAP from './HTTPINFOMAP'

export default {
  name: 'ReportPreview',
  components: {},
  filters: {
    userEmail(val, name, id) {
      return val ? `${val};` : `${name}(${id});`
    },
  },

  mixins: [ReportMixin],
  props: {
    reportId: {
      type: [Number, String],
      default: null,
    },
    hidden: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      emailtemplate: '',
    }
  },
  computed: {
    mailTopicName() {
      return this.reportInfo[HTTPINFOMAP.mailTopicName]
    },
    mailRecipers() {
      return this.reportInfo[HTTPINFOMAP.mailRecipers]
    },
    mailOtherRecipers() {
      return this.reportInfo[HTTPINFOMAP.mailOtherRecipers]
    },
  },

  watch: {
    reportId() {
      this.queryReport(this.reportId)
    },
    reportContent() {
      this.emailtemplate = this.getAllItemHtml()
    },
  },

  mounted() {
    this.queryReport(this.reportId)
  },

  methods: {
    t(...args) {
      return i18n.t(...args)
    },
  },
}
</script>
<style lang="scss" scoped>
.report-preview-mask {
  display: flex;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  overflow: auto;
  background-color: $--background-gray;
  z-index: 11;
  .report-preview-container {
    display: flex;
    flex: 1;
    width: 0;
    flex-direction: column;
    padding: 24px;
    box-shadow: 0 3px 12px 0 rgba(86, 139, 207, 0.18);
    border-radius: 8px;
    background-color: #fff;

    .dialog-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;

      .preview-dialog-title {
        font-size: 16px;
        color: $--color-text-fine;
        font-weight: bold;
      }

      .co-icon-close {
        font-size: 16px;
        color: $--color-text-secondary;
        cursor: pointer;

        &:hover {
          color: $--color-primary;
        }
      }
    }

    .content-container {
      flex: 1;
      overflow: auto;

      .email-header {
        padding: 24px;
        margin-bottom: 20px;
        border-radius: 4px;
        background: $--background-gray;
        color: $--color-text-fine;

        .dialog-title {
          margin-bottom: 20px;
          font-size: 18px;
          // color: $--color-text-fine;
        }

        .senderCC {
          display: flex;
          font-size: 14px;
          margin-bottom: 10px;

          .senderCC-name {
            width: 65px;
            flex-shrink: 0;
          }
        }
      }
    }
  }
}
</style>
