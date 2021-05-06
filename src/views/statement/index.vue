<template>
  <div class="statement">
    <router-view></router-view>
  </div>
</template>
<script>
/**
 * @title 报表2.0
 * @description 新版表报系统
 * @author chenxiaolong
 * @time 2020.07.02
 */

export default {
  name: 'Statement',
}
</script>
<style lang="scss" scoped>
.statement {
  margin: auto;
  display: flex;
  flex-direction: column;
  /*padding: 16px;*/
  padding: 0 16px 16px 16px;
  background-color: #f1f4f9;
  /deep/ .el-menu--horizontal > .el-menu-item {
    flex-shrink: 0;
    height: 40px;
    line-height: 40px;
  }
}
</style>
