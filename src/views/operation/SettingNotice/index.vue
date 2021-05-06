<template>
  <div class="setting-notice-card">
    <div class="header">{{ $t('提醒设置') }}</div>
    <div class="content">
      <div class="setting-item">
        <div class="title">{{ $t('反馈消息提醒') }}</div>
        <el-switch
          v-model="noticeStatus"
          inactive-color="#e8f4fd"
          @change="handleSettingNotice"
        ></el-switch>
      </div>
    </div>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
import {
  settingNotice,
  settingNoticeStatus,
} from '@/service/operation/feedback'
const statuses = {
  open: 0, // 打开
  cancel: 1, // 关闭
}
export default {
  name: 'SettingNotice',
  data() {
    return {
      noticeStatus: false,
    }
  },
  created() {
    this.getSettingNoticeStatus()
  },
  methods: {
    // 获取状态
    getSettingNoticeStatus() {
      settingNoticeStatus().then(res => {
        if (res.status === 200) {
          this.noticeStatus = res.data === statuses.open
        }
      })
    },
    // 设置状态
    handleSettingNotice(status) {
      const message = status ? i18n.t('开启成功') : i18n.t('关闭成功')
      status = status ? statuses.open : statuses.cancel
      settingNotice(status).then(res => {
        if (res.status === 200) {
          this.$message.success(message)
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.setting-notice-card {
  .header {
    font-size: 16px;
    padding: 8px 0 20px 0;
  }
}

.setting-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;

  .title {
    flex: 0 0 400px;
  }
}
</style>
