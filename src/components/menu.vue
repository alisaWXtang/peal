<template>
  <div>
    <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
      <el-radio-button :label="false">展开</el-radio-button>
      <el-radio-button :label="true">收起</el-radio-button>
    </el-radio-group>
    <el-menu
      default-active="1-4-1"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      :collapse="isCollapse"
    >
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span slot="title">导航一</span>
        </template>
        <el-menu-item-group >
          <el-scrollbar style="height:200px;background:red;">
            <el-menu-item index="1-1"><span class="red-circle"></span>你好1<span class="red-num">4</span> </el-menu-item>
            <el-menu-item index="1-2">你好2</el-menu-item>
            <el-menu-item index="1-3">你好3</el-menu-item>
            <el-menu-item index="1-4">你好4</el-menu-item>
            <el-menu-item index="1-5">你好5</el-menu-item>
            <el-menu-item index="1-6">你好6</el-menu-item>
            <el-menu-item index="1-7">你好7</el-menu-item>
            <el-menu-item index="1-8">你好8</el-menu-item>
          </el-scrollbar>
        </el-menu-item-group>
        <el-menu-item-group title="分组2">
          <el-menu-item index="1-3">选项3</el-menu-item>
        </el-menu-item-group>
        <el-submenu index="1-4">
          <span slot="title">选项4</span>
          <el-menu-item index="1-4-1">选项1</el-menu-item>
        </el-submenu>
      </el-submenu>

      <el-menu-item index="2">
        <i class="el-icon-menu"></i>
        <span slot="title">导航二</span>
      </el-menu-item>
      <el-submenu index="3">
        <template slot="title">
          <i class="el-icon-document"></i>
          <span slot="title">导航三</span>
        </template>
        <el-submenu index="3-1">
          <span slot="title">选项4</span>
          <el-menu-item index="3-1">选项1</el-menu-item>
        </el-submenu>
      </el-submenu>
      <el-menu-item index="4">
        <i class="el-icon-setting"></i>
        <span slot="title">导航四</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'nihao',
  data() {
    return {
      isCollapse: true,
    };
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
  },
};
</script>
<style scoped lang="scss">
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
.list {
  max-height: 400px;
  background: red;
}
.el-scrollbar__wrap{
  overflow-x: hidden;
}
.red-circle{
    position: absolute;
    top: 10px;
    left:-10px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: black;
    display:inline-block;
    margin-left: 20px;
}
.red-num{
    margin-left: 50px;
    display: inline-block;
}
</style>
