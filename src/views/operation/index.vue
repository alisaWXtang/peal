<template>
  <div class="page-content-operation">
    <co-menu
      mode="horizontal"
      :default-active="defaultActive"
      @select="changeView"
    >
      <co-menu-item index="/operation/feedback/inner">
        {{ $t('内部用户反馈') }}
      </co-menu-item>
      <co-menu-item index="/operation/feedback/400">
        400{{ $t('工单反馈') }}
      </co-menu-item>
      <co-menu-item index="/operation/setting">{{ $t('设置') }}</co-menu-item>
    </co-menu>
    <div class="operation-content">
      <router-view />
    </div>
  </div>
</template>
<script>
/**
 * @title 运营模块根组件
 * @description 主要由反馈、设置模块构成
 * @author wuqian
 * @time 2020.5.2
 */
export default {
  name: 'Operation',
  components: {},
  data() {
    return {}
  },
  computed: {
    defaultActive() {
      const settingRouetes = [
        '/operation/setting/settingNormal',
        '/operation/setting/setting400',
        '/operation/setting/settingNotice',
      ]

      return settingRouetes.includes(this.$route.path)
        ? '/operation/setting'
        : this.$route.path
    },
  },

  watch: {},
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
@import './common.scss';
</style>
