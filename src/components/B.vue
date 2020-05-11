<template>
  <div>
    这是一个B组件
    <el-button type="primary" @click="clickEve">点击</el-button>
    {{num}}
  </div>
</template>

<script>
import bus from './bus';

export default {
  data() {
    return {
      num: 1,
    };
  },
  // created(){
  //   console.log('created')
  // },
  // beforeUpdate(){
  //   console.log('beforeUpdate')
  // },
  // updated(){
  //   console.log('Update')

  // },
  // mounted() {
  //   console.log('mounted')

  // },
  beforeDestroy() {
    console.log('beforeDestroy');
    // bus.$emit('getMessage', 'qqqq');
  },
  methods: {
    clickEve() {
      // this.num = 4
      // this.$nextTick(()=>{

      // })
      setTimeout(() => {
        bus.$emit('getMessage', 'qqqq');
        console.log('摧毁之前？');
      }, 100);
      this.$router.push({ path: "/config/cool" });
    },
  },
};
</script>
