<template>
  <div id="form ">
    <el-form
      :model="ruleForm"
      :rules="boolear?rules:newRules"
      ref="ruleForm"
      label-width="80px"
      class="demo-ruleForm"
    >
      <!-- boolear?rules:newRules -->
        
      <el-form-item  prop="advice" style="margin-left:-50px;" class="adviceCs">
        <div><span style="color: red;">*</span>审批意见"</div>
        <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="ruleForm.advice"> </el-input>
      </el-form-item>
      
      <el-form-item label="feilv" prop="percent" v-if="boolear">
        <el-input v-model="ruleForm.percent"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="block">
    <span class="demonstration">折叠展示Tag</span>
    <el-cascader
        :options="options"
        :props="props"
         v-model="tagsArr"
        collapse-tags
        clearable
        @change="cascaderChange"

        ></el-cascader>
    </div>
  </div>
</template>

<script>
import {} from 'vuex';
import {} from 'vant';

export default {
  name: 'form',
  data() {
      var validatepercent=(rule, value, callback) => {
        if (parseInt(value)===100) {
          callback();
          return;
        }
        if(!/(^(\d|[1-9]\d)(\.\d{1,2})?$)|(^100$)/.test(value)) {
          callback(new Error('请0-100以内的两位小数'));
        }else{
          callback();
        }
      };
    return {
        boolear:true,
        ruleForm: {
            advice:'',
            percent:''
        },
        rules: {
          advice: [
            { required: true, message: '请输入审批意见', trigger: 'blur' },
             {min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' },
          ],
          percent: [
            { required: true, message: '请输入费率', trigger: 'blur' },
            { validator: validatepercent, trigger: 'blur' }
          ]
        },
        newRules:{
          advice: [
            { required: true, message: '请输入审批意见33333333333', trigger: 'blur' },
             {min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' },
          ]          
        },
        props: { multiple: true },
        options: [
        {
            value:'1_all',
            label:'全部',
            children:undefined
        },
        {
          value: 1,
          label: '东南',
          children: [
           {
            value:'1_dn',
            label:'全部',
            children:undefined
          },
          {
            value: 2,
            label: '上海',
          },
          {
            value: 7,
            label: '江苏',
          },
          {
            value: 12,
            label: '浙江',
          }]
        },
         {
          value: 17,
          label: '西北',
          children: [
           {
            value:'1_xb',
            label:'全部',
            children:undefined
           },
           {
            value: 18,
            label: '陕西',
          },
          {
            value: 21,
            label: '新疆维吾尔族自治区',
          }]
        },
        {
          value: 22,
          label: '华中',
          children: [
           {
            value:'1_hz',
            label:'全部',
            children:undefined
           },
           {
            value: 23,
            label: '湖南',
          },
           {
            value: 26,
            label: '湖北',
          },
          ]
        }
        ],
        tagsArr:[['1_all']]
      }
    },
  
  components: {},
  methods: {
      cascaderChange(val){
        console.log(val, 'cal===================================')
        val.forEach((element,index) => {
            if(element[0]==='1_all'){
            this.tagsArr = val.splice(1)
        }
        });
      },
      submitForm(formName){
          this.$refs[formName].validate((valid) => {
          if (valid) {
            alert('submit!')
          } else {
            console.log('error submit!!')
            return false;
          }
        })
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      }
  },
  mounted() {
  },


};
</script>

<style scoped lang="scss">
#form{
.demo-ruleForm{
    .adviceCs{
        /deep/.el-form-item__content{
            // margin-left: 0px!important;

        }
    }
  }
}


</style>
