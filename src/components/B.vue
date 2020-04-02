<template>
  <div>
    这是一个B组件
    <el-button type="primary" @click="clickEve">点击</el-button>
  </div>
</template>

<script>
import bus from './bus';

export default {
  data() {
    return {};
  },
  methods: {
    clickEve() {
      bus.$emit('getMessage', 'qqqq');
    },
  },
};
</script>
