<template>
  <div id="app">
    <div>我是头部</div>
    <router-view />
    <div>我是尾部</div>
  </div>
</template>

<script>
export default {
  name: "app",
  watch: {
    $route: (n, o) => {
      // console.info(n.fullPath, o);
    },
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: Microsoft YaHei;
}
input,
textarea,
keygen,
select,
button {
  font-family: "Microsoft Yahei", "Avenir", Helvetica, Arial, sans-serif;
}
#app {
  width: 100%;
  height: 100%;
}
</style>
