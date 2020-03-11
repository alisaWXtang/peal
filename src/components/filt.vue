<template>
  <div>
    这是一个B组件
    <el-button type="primary" @click="clickEve">点击</el-button>
  </div>
</template>

<script>
import bus from './bus'
export default {
  data () {
    return {}
  },
  methods: {
    clickEve () {
      if(inputValue1 !=='' ||  inputValue2 !== '' || inputValue3 !== ''){
        this.listdata = listdata.filter(item=>{
          return item.includes(inputValue1)||item.includes(inputValue1)||item.includes(inputValue1)
        })
      }else{
        this.listdata = copylistData
      }
    }
  }

}
</script>
