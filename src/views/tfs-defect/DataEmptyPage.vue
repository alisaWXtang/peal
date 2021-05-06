<template>
  <div class="data-empty-page__container">
    <div>
      <img v-if="imgSrc" :src="imgSrc" :alt="msg" />
      <div>{{ msg }}</div>
    </div>
  </div>
</template>
<script>
/**
 * @title 无数据提示页面
 * @author wuqian
 * @date 2020.9.22
 */
export default {
  name: 'DataEmptyPage',
  props: {
    imgSrc: {
      type: String,
    },
    msg: {
      type: String,
      default: '暂无数据',
    },
  },
  // data() {
  //   return {}
  // },
  // created() {
  //   this.updateRouteQuery()
  // },
  // beforeDestroy() {
  //   this.updateRouteQuery()
  // },
  // methods: {
  //   // 该页面无法监听切换集合事件，所以需要在生命周期更改url中productType参数，防止显示后请求数据错误
  //   updateRouteQuery() {
  //     this.$updateRouteQuery(
  //       { productType: localStorage.almProductType },
  //       { replace: true },
  //     )
  //   },
  // },
}
</script>
<style lang="scss" scoped>
.data-empty-page__container {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #fff;
}
</style>
