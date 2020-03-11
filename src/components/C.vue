<template>
  <div>
    这是一个C组件
  </div>
</template>

<script>
import bus from './bus'
export default {
  data () {
    return {}
  },
  methods:{
    showMsg () {　
　　　　console.log('msg', msg)
　　}
  },
  created () {
    bus.$on('getMessage', (msg)=>{
　　　　console.log('msg', msg)

    } )
  },
  beforDestory () {
    bus.$off('getMessage',(msg)=>{
　　　　console.log('msg', msg)
    })
  }
}

</script>
