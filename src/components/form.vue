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
        >
          <template slot-scope="{ node }">
            <span @click.stop="nodeClick(node.label)">{{ node.label }}</span>
          </template>
        </el-cascader>

<br/>
<br/>
<br/>
    <div
        style="width: 60%; margin: 0 auto;"
        @mousemove="ulShow=true"
        @mouseleave="ulShow=false"
    >
    <el-input readonly :rows="2" placeholder="请选择内容" v-model="tagsArr"></el-input>
    <div class="outer-div" v-show="ulShow">
        <div
            class="ul-div"
            v-for="item in options"
           :key="item.label" v-show="ulShow"
           @mouseover.stop="itemOver(item)"
        >
            <el-checkbox v-model="item.check" @change="ulClick(item)">{{item.label}}</el-checkbox>
        </div>
        <div class="li-outer" v-show="clickItem && clickItem.length">
            <div class="li-div" v-for="ele in clickItem" :key="ele.label">
                <el-checkbox v-model="ele.check">{{ele.label}}</el-checkbox>
            </div>
        </div>
    </div>
</div>

<br/>
<br/>
<br/>
<br/>

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
          value: '全部',
          label: '全部',
          check: false,
        },
        {
          value: '东南',
          label: '东南',
          check: false,
          children: [
            {
                value: '上海',
                label: '上海',
                check: false,
            },
            {
                value: '江苏',
                label: '江苏',
                check: false,
            },
          ]
        },
        {
          value: '西北',
          label: '西北',
          check: false,
          children: [
            {
                value: '陕西',
                label: '陕西',
                check: false,
            }, 
            {
                value: '新疆',
                label: '喀什',
                check: false,
            }
          ]
        }
        ],
        tagsArr: '',
        ulShow: false,
        innerItem: false,
        clickItem: ''
      }
    },
  
  components: {},
  watch: {
        
    },
    created(){
        
    },
  methods: {
      ulClick(item) {
          console.log(item, 173);
          if (item.label == '全部' && item.check) {
              this.options.forEach(ele => {
                  ele.check = true;
                  if (ele.children && ele.children.length) {
                      ele.children.forEach(i => {
                         i.check = true;
                      })
                  }
              })
              return;
          }
          if (item.label == '全部' && !item.check) {
              this.options.forEach(ele => {
                  ele.check = false;
                  if (ele.children && ele.children.length) {
                      ele.children.forEach(i => {
                         i.check = false;
                      })
                  }
              })
              return;
          }
          if (item.label == '东南' && item.check) {

            item.check = true;
            if (item.children && item.children.length) {
                item.children.forEach(i => {
                    i.check = true;
                })
            }

          }

        if (item.label == '东南' && !item.check) {

            item.check = false;
            if (item.children && item.children.length) {
                item.children.forEach(i => {
                    i.check = false;
                })
            }

          }

      },
      itemOver(item) {
         this.innerItem=true
         if (item.children) {
             this.clickItem = item.children;
         } else {
             this.clickItem = [];
         }
      },
      nodeClick(node) {
          console.log(node);
      },
      cascaderChange(val){
        console.log(val, 'cal===================================');
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
.outer-div {
    padding: 15px 0 50px 15px;
    border: 1px solid #CCC;
    border-radius: 5px;
    width: 100px;
    .ul-div {
        padding-top: 5px;
        padding-left: 10px;
        &:hover {
            background: #ccc;
        }
    }
    .li-outer {
        position: relative;
        left: 100px;
        top: -50px;
        padding: 15px 0 50px 15px;
        border: 1px solid #CCC;
        width: 100px;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
    }
    .ul-div:last-child {
        padding-bottom: 5px;
    }
}
</style>
