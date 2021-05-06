<template>
  <div>
    <Btpl />
    <hr />
    <Ctpl />
    <div class="swiper-wrapper">
      <swiper ref="mySwiper" :options="swiperOptions">
        <swiper-slide>
          <div class="slideItem">Slide 1</div>
        </swiper-slide>
        <swiper-slide>
          <div class="slideItem">Slide 2</div>
        </swiper-slide>
        <swiper-slide>
          <div class="slideItem">Slide 3</div>
        </swiper-slide>
        <swiper-slide>
          <div class="slideItem">Slide 4</div>
        </swiper-slide>
        <swiper-slide>
          <div class="slideItem">Slide 5</div>
        </swiper-slide>
      </swiper>
      <div class="prev-a">left</div>
      <div class="next-a">right</div>
    </div>
    <div class="content">
      <div class="contentDiv">{{contents||'111111111111111111'}}</div>
      <div class="item1" :class="{shadow:activeItem==1}" @click="ratateFn(1)">1</div>
      <div class="item2" :class="{shadow:activeItem==2}" @click="ratateFn(2)">2</div>
      <div class="item3" :class="{shadow:activeItem==3}" @click="ratateFn(3)">3</div>
      <div class="item4" :class="{shadow:activeItem==4}" @click="ratateFn(4)">4</div>
      <div :class="rotateDiv" class="rotateDiv">
        <img src="../assets/logo.png" alt />
      </div>
    </div>
    <div style="height:200px;background:red;">
      <el-scrollbar class="cf" style="height:100%">
        <h4>sdfg</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <!-- <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>sdfg</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4>
        <h4>/bus</h4> -->
      </el-scrollbar>
      <ul class="tab-group-btn dib">
        <li
          v-for="item in demandStageData"
          :key="item.id"
          :class="{'active':item.color}"
          @click="switchDemandStage(item)"
        >{{ `${item.label}` }}{{ item.number!==null?`(${item.number})`:'' }}</li>
      </ul>
      <el-select
        v-model="contractStatus"
        multiple
        placeholder="请选择合同状态"
        collapse-tags
        @change="contractStatusChange($event)"
      >
        <el-option
          v-for="(item,index) in contractStatusOptions"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-cascader
        @change = "cascaderchang"
        v-model="cascaderValue"
        :options="options"
        :props="props"
        clearable
      ></el-cascader>      
    </div>
  </div>
</template>
<script>
export default {
  name: 'TestBaiDu',
  data() {
    return {
      contents: '',
      activeItem: 1,
      props: { multiple: true },
      cascaderValue:[['']],
      firstCascader:false,
      rotateDiv: 'rotateDiv1',
      swiperOptions: {
        slidesPerView: 3,
        spaceBetween: 10,
        direction: 'horizontal',
        navigation: {
          nextEl: '.next-a',
          prevEl: '.prev-a',
          hideOnClick: true,
        },
      },
      contractStatus:[''],
      demandStageData:[
        {
          label:'全部',
          number:'',
          color:true
        },
        {
          label:'已审批',
          number:22,
          color:false

        }, 
        {
          label:'待审批',
          number:23,
          color:false
        },                 
      ],
      contractStatusOptions:[
          {
          value: '',
          label: '全部'
        },
        {
          label:'已审批',
          value:22
        }, 
        {
          label:'待审批',
          value:23
        },      
        {
          label:'已签订',
          value:24
        },  
        {
          label:'已取消',
          value:25
        },      
        {
          label:'已驳回',
          value:26
        },              
      ],
options: [
        {
          value: '',
          label: '全部',
        },
        {
          value: 1,
          label: '东南',
          children: [
            {
              value: 2,
              label: '上海',
              children: [
                { value: 3, label: '普陀' },
                { value: 4, label: '黄埔' },
                { value: 5, label: '徐汇' }
              ]
            }, 
            {
              value: 7,
              label: '江苏',
              children: [
                { value: 8, label: '南京' },
                { value: 9, label: '苏州' },
                { value: 10, label: '无锡' }
              ]
            }, 
            {
              value: 12,
              label: '浙江',
              children: [
                { value: 13, label: '杭州' },
                { value: 14, label: '宁波' },
                { value: 15, label: '嘉兴' }
              ]
            }
          ]
        }, 
        {
          value: 17,
          label: '西北',
          children: [
            {
              value: 18,
              label: '陕西',
              children: [
                { value: 19, label: '西安' },
                { value: 20, label: '延安' }
              ]
            }, 
            {
              value: 21,
              label: '新疆维吾尔族自治区',
              children: [
                { value: 22, label: '乌鲁木齐' },
                { value: 23, label: '克拉玛依' }
              ]
            }]
        }]
    };
  },
  // computed: {
  //   activedLi:{
  //     get(){
  //       return !!this.demandStageData.length
  //     }
  //   }

  // },
  methods: {
    ratateFn(n) {
      switch (n) {
        case 1:
          this.rotateDiv = 'rotateDiv1';
          this.contents = '111111111111111111111111111111111';
          this.activeItem = 1;
          break;
        case 2:
          this.rotateDiv = 'rotateDiv2';
          this.contents =
            '222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222';
          this.activeItem = 2;

          break;
        case 3:
          this.rotateDiv = 'rotateDiv3';
          this.contents = '33333333333333333333333333333333';
          this.activeItem = 3;

          break;
        case 4:
          this.rotateDiv = 'rotateDiv4';
          this.contents = '44444444444444444444444444444444444444';
          this.activeItem = 4;

          break;
        default:
          break;
      }
    },
    activedLi(item){
      
    },
    cascaderchang(val){
      // 全部可勾选可不勾选
      console.log(val,'vvvvv',this.cascaderValue)
      let flag = val.find(i=>{ return i.length===1 && i[0]==='' })
      

      console.log('QQQQQQQQQQQQQQ',flag,this.firstCascader)
      if(this.firstCascader){
        if(flag){
          console.log(val,'firstCascader&&flag')

          this.cascaderValue = [['']]
          this.firstCascader = false
        }
      }else{
        if(flag){
          console.log(val,'else&&flag')
          this.cascaderValue = val.splice(1)
          this.firstCascader = true
          // 全部手动被取消了
        }else{
          // this.cascaderValue = [['']]
          this.firstCascader = true
        }
      }
    },    
    cascaderchang2(val){
      // 全部不可取消勾选
      console.log(val,'vvvvv',this.cascaderValue)
      let flag = val.find(i=>{ return i.length===1 && i[0]==='' })
      

      console.log('QQQQQQQQQQQQQQ',flag,this.firstCascader)
      if(this.firstCascader){
        if(flag){
          console.log(val,'firstCascader&&flag')

          this.cascaderValue = [['']]
          this.firstCascader = false
        }
      }else{
        if(flag){
          console.log(val,'else&&flag')
          this.cascaderValue = val.splice(1)
          this.firstCascader = true
          // 全部手动被取消了
        }else{
          this.cascaderValue = [['']]
          this.firstCascader = false
        }
      }
    },      
    switchDemandStage(val){
      this.contractStatus = [val.number]
      this.demandStageData.forEach(i=>{
        i.color = false
      })
      val.color = true
    },
    contractStatusChange(e){
      if(e[e.length-1]===''||e.length===0){
        this.contractStatus = ['']
      }else{
        e.forEach((item,index) => {
          if(item===''){
            this.contractStatus.splice(index,1)
          }
        });
      }
      this.demandStageData.forEach(item=>{
        item.color = false
      })
      // 选择器只选了 1个并且是全部或者不是已审批、不是待审批选中全部
      // 选择多个的时候选中全部
      let flag =this.contractStatus.length===1&&(this.contractStatus[0]===''||!['',22,23,24].includes(this.contractStatus[0]))
      console.log(flag,'flag')
      if(flag||this.contractStatus.length>1){
        this.demandStageData[0].color=true
        console.log(this.demandStageData,'demandStageData11111111111111111111111111')
      }else{
        this.demandStageData.forEach((item,index)=>{
          if(this.contractStatus[0]===item.number){
            this.demandStageData[index].color = true
          }
        })
        console.log(this.demandStageData,'demandStageData22222222222222222222')

      }
    }
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.$swiper;
    },
  },
  mounted() {
    console.log('Current Swiper instance object', this.swiper);
    this.swiper.slideTo(3, 1000, false);
  },
  components: {
    Btpl: () => import('@/components/B'),
    Ctpl: () => import('@/components/C'),
  },
};
</script>

<style scoped lang="scss">
.cf /deep/.el-scrollbar__wrap{
  overflow-x: hidden;
  overflow-y:auto;
}
.swiper-wrapper {
  height: 180px;
  background: #aaccaa;
  width: 900px;
}
.swiper-button-next {
  width: 30px;
  height: 30px;
  background: black;
}

.swiper-button-prev {
  width: 30px;
  height: 30px;
  background: black;
}
.slideItem {
  background: red;
  display: flex;
  justify-content: center;
  align-items: center;
  // width: 100%;
  // height: 100%;
}
.next-a {
  position: absolute;
  top: 50px;
  z-index: 45;
  left: 30px;
  color: #fff;
  background: black;
}
.content {
  position: relative;
  background: cadetblue;
  border: 1px solid cadetblue;
  border-radius: 50%;
  width: 300px;
  height: 300px;
  margin-left: 300px;
  .item1 {
    position: absolute;
    left: -150px;
    top: 30px;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    background: chartreuse;
  }
  .item2 {
    position: absolute;
    left: -130px;
    top: 200px;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    background: chartreuse;
  }
  .item3 {
    position: absolute;
    left: 56px;
    top: 391px;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    background: chartreuse;
  }
  .item4 {
    position: absolute;
    left: 310px;
    top: 338px;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    background: chartreuse;
  }
  .rotateDiv {
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    left: -10px;
    top: 125px;
    background: goldenrod;
    transform-origin: 160px center;
    transition: all 1s;
    font-size: 16px;
    img {
      widows: 100%;
      height: 100%;
    }
  }
  .rotateDiv1 {
    transform: rotate(-10deg);
  }
  .rotateDiv2 {
    transform: rotate(-30deg);
  }
  .rotateDiv3 {
    transform: rotate(-90deg);
  }
  .rotateDiv4 {
    transform: rotate(-130deg);
  }
}
.contentDiv {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.shadow {
  box-shadow: 0 0 5px brown;
}
.cf{
  height: 100%;
}
.tab-group-btn{
  li{
    border-radius: 6px;
    display: inline-block;
    padding: 0 15px;
    line-height: 30px;
    font-size: 14px;
    color:#000 ;
    cursor: pointer;
    @media screen and (max-width: 1280) {
      font-size: 12px;
      line-height: 26px;
    }
    &+li{
      margin-left: 30px;
      @media screen and (max-width: 1280) {
        margin-left: 15px;
      }
    }
    &.active{
      background-color: #2EC09A;
      color: #fff;
    }
  }
}
</style>
