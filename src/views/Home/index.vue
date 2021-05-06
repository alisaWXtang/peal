<template>
  <div class="home">
    <co-button type="primary" class="btn" @click="openApp('workitem')"
      >打开工作项微应用</co-button
    >
    <pre class="userinfo">{{ userInfo }}</pre>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      userString: '',
    }
  },
  created() {
    const { getUserInfo } = window.$udp || {}
    this.userString = JSON.stringify(getUserInfo(), null, 2)
  },
  methods: {
    openApp(key) {
      window.$udp.openApp({
        // 微应用 key
        key,
        // 微应用路由
        path: '/prototype',
        query: {
          id: 1234,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.home {
  padding: 30px;
  .userinfo {
    margin-top: 20px;
    border: 1px solid #ececec;
    padding: 20px;
  }
}
</style>
