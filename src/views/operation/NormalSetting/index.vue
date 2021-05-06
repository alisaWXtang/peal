<template>
  <div class="normal-setting">
    <co-radio-group v-model="activeName">
      <co-radio-button label="appList">{{ $t('产品列表') }}</co-radio-button>
      <co-radio-button label="type">{{ $t('反馈类型') }}</co-radio-button>
    </co-radio-group>
    <div class="setting-body">
      <AppList v-show="activeName === 'appList'" />
      <TypeSetting v-show="activeName === 'type'" />
    </div>
  </div>
</template>
<script>
import AppList from './AppList'
import TypeSetting from './TypeSetting'

export default {
  name: 'Setting',
  components: {
    AppList,
    TypeSetting,
  },

  data() {
    return {
      activeName: 'appList',
    }
  },

  watch: {
    activeName(val) {
      this.countlyLog(`operation_setting_${val}`)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../common.scss';
.normal-setting {
  width: 100%;
}
.setting-body {
  margin-top: 16px;
  height: calc(100% - 40px) !important;
}
</style>
