<template>
  <div class="self-page">

    <i class="iconfont icon-back iconClass" @click="$router.back(-1)"></i>

    <div class="autoPlay">
      <img :src="item" v-for="(item,index) in imgList" :key="index" v-show="index==interim" />
      <div class="circleWrapper">
        <div
          v-for="(item,index) in imgList"
          :key="index"
          class="circle"
          :class="index==interim?'activeCircle':''"
          @click="CircleFn(index)"
        ></div>
      </div>
    </div>
    <div class="dotStyle">
      <div class="loading">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
    <div v-for="(item,index) in shuxList" :key="index">
        <span>
          {{ item.name }}
        </span>
        <span v-if="index !== shuxList.length -1">|</span>
    </div>
    <p>尊敬的X女士</p>
    <p  style="text-indent:2em;">你好，您的密码已经过期</p>
    <p style="text-align:right;width:100%">——————————oppo</p>

    <el-input v-model="numberIn" @keyup.native="onlyNumFn" maxlength="9" />
    <hr />
    <el-button type="text" @click="dialogVisible = true">点击打开 Dialog</el-button>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" v-debounce="dialogFalse">确 定</el-button>
      </span>
    </el-dialog>
    <el-button type="text" @click="open">点击打开 Message Box</el-button>
    <router-link to="/config/cool/configCd">router-linkAAAAAA</router-link>
    <router-link to="/config/cool/configC">router-linkBBBBBBb</router-link>
    <div>动态路径参数{{this.$route.params}}</div>
    <div>
    <router-view/>
    </div>
    <chil-dren  :show.sync='valueChild'
     style="padding: 30px 20px 30px 5px;border:1px solid #ddd;margin-bottom: 10px;"
    ></chil-dren>
    <button @click="changeValue">toggle</button>
  </div>
</template>

<script>
import {} from 'vuex';
import {} from 'vant';
import chilDren from './children';
import bus from './bus';

export default {
  components: {
    chilDren,
  },
  name: 'Self-select',
  data() {
    return {
      valueChild:true,
      shuxList:[
        {name:'a',id:1},
        {name:'b',id:2},
        {name:'c',id:3},
        {name:'d',id:4},
        {name:'e',id:5},
        {name:'f',id:6},
        {name:'g',id:7},
        {name:'h',id:8},
      ],
      interim: 0,
      imgList: [
        require('../assets/images/F1.jpeg'),
        require('../assets/images/F2.jpeg'),
        require('../assets/images/F3.jpeg'),
        require('../assets/images/F4.jpeg'),
        require('../assets/images/F5.jpeg'),
        require('../assets/images/F6.jpeg'),
      ],
      numberIn: '',
      inputValue: '',
      dialogVisible: false,
    };
  },
  computed: {
    // id(){
    //   return this.$route
    // }
  },
  methods: {
    changeValue(){
            this.valueChild = !this.valueChild
        },
    log() {
      console.log('log');
    },
    playImgFn() {
      setInterval(this.playFn, 2000);
    },
    playFn() {
      this.interim++;
      if (this.interim == this.imgList.length) {
        this.interim = 0;
      }
    },
    CircleFn(index) {
      this.interim = index;
    },
    onlyNumFn() {
      this.numberIn = this.numberIn.replace(/[^\d.]/g, '');
      this.numberIn = this.numberIn.replace(/^\./g, '');
      this.numberIn = this.numberIn.replace(/\.{2,}/g, '');
      this.numberIn = this.numberIn
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.');
    },
    dialogFalse() {
      this.dialogVisible = false;
      console.log('哇哇哇');
    },
    open() {
      const h = this.$createElement;
      this.$msgbox({
        title: '消息',
        message: h('p', { style: 'text-align: center' }, [
          h('P', null, '内容可以是 '),
          h('P', { style: 'color: teal' }, 'VNode'),
          h('P', { style: 'color: red' }, 'what'),
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '执行中...';
            setTimeout(() => {
              done();
              setTimeout(() => {
                instance.confirmButtonLoading = false;
              }, 300);
            }, 3000);
          } else {
            done();
          }
        },
      }).then((action) => {
        this.$message({
          type: 'info',
          message: `action: ${action}`,
        });
      });
    },
    fatherFn(val) {
      console.log('sssssssssss');
      console.log(val, 'val');
    },

  },
  beforeDestroy() {
    bus.$off('getMessage');
  },
  created() {
    bus.$on('getMessage', (msg) => {
      console.log('msg', msg);
    });
    this.playImgFn();
    // console.log(this.$route,'this.$route');
    // console.log(this.$router,'this.$router');
  },
  updated() {

  },
  directives: {
    debounce: {
      bind(el, binding) {
        // console.log(el, binding);
        let timer;
        el.onclick = function () {
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(() => {
            binding.value();
          }, 800);
        };
      },
      unbind(el, binding) {
        console.log('解绑了嘛');
      },
    },
  },
};
</script>

<style scoped lang="scss">
.iconClass {
  font-size: 30px;
  background: #aca;
  width: 80px;
  text-align: center;
  height: 80px;
  line-height: 80px;
  display: block;
}
.autoPlay {
  width: 448px;
  margin-left: 100px;
  .circleWrapper {
    display: flex;
    width: 100px;
    margin: 0 auto;
    justify-content: space-between;
    position: relative;
    top: -30px;
    .circle {
      width: 5px;
      height: 5px;
      background: #bbb;
    }
    .activeCircle {
      background: rgb(18, 182, 18);
    }
  }
}
.dotStyle {
  .loading {
    $colors: #7ef9ff, #89cff0, #4682b4, #0f52ba, #000080;
    display: flex;
    animation-delay: 1s;
    .dot {
      position: relative;
      width: 25px;
      height: 25px;
      margin: 10px;
      border-radius: 50%;
      &::before {
        position: absolute;
        content: '';
        width: 25px;
        height: 25px;
        background: inherit;
        border-radius: inherit;
        animation: wave 2s ease-out infinite;
        animation: name duration timing-function delay iteration-count direction fill-mode;
      }
      @for $i from 1 through 5 {
        &:nth-child(#{$i}) {
          background: nth($colors, $i);
          &::before {
            animation-delay: $i * 0.2s;
          }
        }
      }
    }
  }
}
@keyframes wave {
  50%,
  75% {
    transform: scale(2.5);
  }

  80%,
  100% {
    opacity: 0;
  }
}
.buttonMouse {
  width: 300px;
  height: 300px;
  background: red;
}
</style>
