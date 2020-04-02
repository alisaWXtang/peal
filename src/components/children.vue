<template>
  <div @click="toConfigFn" class="toConfig">
    这是一个子组件,这是一个按钮
  </div>
</template>

<script>

export default {
  name:'nihao',
  data() {
    return {};
  },
  methods: {
      toConfigFn(){
          console.log('子组件的事件触发了')
          this.$emit('whereValue',{name:'你少', age:'123456'})
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
