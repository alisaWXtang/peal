
<template>
  <el-cascader
    v-model="displayValue"
    :options="options"
    class="input-width"
    collapse-tags
    :props="props"
    :size="size"
    @change="handleChange($event)"
  />
</template>

<script>
// import { getQueryTreeRequest } from '@/api/utils'
export default {
  name: 'BusinessCascader',
  props: {
    value: {
      type: [Array],
      default: null
    },
    size: {
      type: String,
      default: 'medium'
    }
  },
  data() {
    return {
      props: { multiple: true },
      options: []
    }
  },
  computed: {
    displayValue: {
      get() {
        return this.value
      },
      set(modifiedValue) {
        this.$emit('input', modifiedValue)
      }
    }
  },
  created() { },
  mounted() {
    this.getBusinessList()
  },
  methods: {
    async getBusinessList() {
        this.options= [
            { value: '', label: '全部' },
            {
                value: 'dongnan',
                label: '东南',
                children: [
                    {
                        value: 'shanghai',
                        label: '上海',
                    },
                    {
                        value: 'jiangsu',
                        label: '江苏',
                    },
                    {
                        value: 'zhejiang',
                        label: '浙江',
                    }
                ]
            },
            {
                value: 'xibei',
                label: '西北',
                children: [
                    {
                        value: 'shanxi',
                        label: '陕西',

                    }, 
                    {
                        value: 'hebei',
                        label: '河北',

                    }, 
                    {
                        value: 'xiangjiang',
                        label: '新疆维吾尔族自治区',

                    },
                ]
            },
            {
                value: 'huazhong',
                label: '华中',
                children: [
                    {
                        value: 'hunan',
                        label: '湖南',

                    }, 
                    {
                        value: 'hubei',
                        label: '湖北',

                    },
                    {
                        value: 'sichuan',
                        label: '四川',

                    },
                    {
                        value: 'chongqing',
                        label: '重庆',

                    },
                ]
            },
        ]

    },
    handleChange(arr) {
      // console.log(arr,'arr')
      this.$emit('changeType', arr)
    }
  }
}

</script>
<style lang='scss' scoped>
  /deep/ .el-cascader__tags .el-tag > span{
    flex:auto;
  }
</style>

