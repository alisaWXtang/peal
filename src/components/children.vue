<template>
  <div v-if="show">
    <p>默认初始值是{{show}}，所以是显示的</p>
    <button @click.stop="closeDiv">关闭</button>
  </div>
</template>

<script>

export default {
  name: 'nihao',
  data() {
    return {};
  },
  props:['show'],
  methods: {
    closeDiv() {
      this.$emit('update:show', false); //触发 input 事件，并传入新值
    }
  },

};
</script>
<style scoped lang="scss">
.toConfig{
    width: 300px;
    height: 300px;
    background: red;
}
</style>
