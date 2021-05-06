<template>
  <div id="financial-detail">
    <el-page-header content="订单详情页面" class="page-header" @back="goBack" />
    <cascader @changeType="changeType" v-model="cascaderVal"/>
      <div v-if="!isRtl" class="all-list" :style="{ 'direction': (isRtl?'rtl': '') }">
        <!-- ok -->
        <van-swipe-cell
          v-for="(item,index) in myFeedbackList"
          ref="swipeCellRef"
          :key="index"
          :before-close="beforeCloseSwipeCell"
          :name="index"
          @open="openSwipeCell"
          @close="closeSwipeCell"
        >
          <van-cell
            size="large"
            :border="false"
          >
            <template slot="title">
              <div class="custom-title van-ellipsis">
                <div v-if="item.hasnewreply === 1" :class="isRtl?'red-point-R':'red-point-Normal'"></div>
                <div :class="isRtl?'right': 'left'"><span class="title-num light">{{ (index + 1) }}</span></div>
                <span :class="{ 'custom-label': true, isRtl: isRtl }">{{ item.feedBack }}</span>
              </div>
            </template>
            <div slot="right-icon">
              <svg-icon class="arrow-icon" icon-class="arrow" :style="{ 'transform': (isRtl?'rotate(180deg)': 'rotate(0deg)') }" />
            </div>
          </van-cell>
          <template v-if="item.isConfirm" #right>
            <van-button
              style="width:165px"
              square
              color="#ea3447"
              text="确认删除"
              @click="delconfirmFn(item,index)"
            />
          </template>
          <template v-else #right>
            <van-button
              style="width:165px"
              square
              color="#ea3447"
              text="删除"
              @click="delUnconfirmFn(item)"
            />
          </template>
        </van-swipe-cell>
      </div>

      <van-swipe-cell
       :before-close="beforeClose"
        ref="swipeCellRefs"
        :right-width="165"
        :left-width="165"
        :key="index"
        stop-propagation
         v-show="item.flag"
        v-for="(item,index) in myFeedbackLists"
        :name="index"
        @open="openSwipeCell"
        @close="closeSwipeCell">
        <!-- {{item.isConfirm}} -->
                  <template v-if="item.isConfirm" #right>
            <van-button
              square
              color="#ea3447"
              text="确认删除"
              @click="delconfirmFn(item,index)"
            />
          </template>
          <template v-else #right>
            <van-button
              square
              color="#ea3447"
              text="删除"
              @click="delUnconfirmFn(item)"
            />
          </template>
          <template v-if="item.isConfirm" #left>
            <van-button
              square
              color="#ea3447"
              text="确认删除"
              @click="delconfirmFn(item,index)"
            />
          </template>
          <template v-else #left>
            <van-button
              square
              color="#ea3447"
              text="删除"
              @click="delUnconfirmFn(item)"
            />
          </template>
        <van-cell :border="false" :title="item.feedBack" value="内容" />
    </van-swipe-cell>
  </div>
</template>

<script>
import { NavBar, Search, Cell, CellGroup, Button, Icon, Toast, Popup, Skeleton, SwipeCell } from 'vant'

import  Cascader  from "../com/cascader";
export default {
  name: 'FinancialDetail',
  components:{
    Cascader,
    [Button.name]: Button,
    [SwipeCell.name]: SwipeCell,
    [Cell.name]: Cell,

  },
  data() {
    return {
      cascaderVal:[''],
      options: [[]],
      formInline: {
        min: '',
        max: ''
      },
      FinCenterForm: {
        currentPage: 1,
        pageSize: 30
      },
      dialogFormVisible: false,
      dialogTitle: '',
      model: 1,
      tableData: [],
      checkoutTableData: [
        { id: 'IFS123456', orderNo: '222222',
          bussinessType: '金融', customerCompanyName: '阿里',
          customerBankAccount: '222', accountDuring: '2019-2020',
          applyDate: '1591974507000', confirmAmount: 0,
          amount: 80, unConfirmAmount: 80, applyP: 'who',
          settlementNo:1
        },
        { id: 'IFS123456', orderNo: '222222',
          bussinessType: '金融', customerCompanyName: '阿里',
          customerBankAccount: '222', accountDuring: '2019-2020',
          applyDate: '1591974507000', confirmAmount: 0,
          amount: 40, unConfirmAmount: 40, applyP: 'who',
          settlementNo:2

        },
        { id: 'IFS123456', orderNo: '222222',
          bussinessType: '金融', customerCompanyName: '阿里',
          customerBankAccount: '222', accountDuring: '2019-2020',
          applyDate: '1591974507000', confirmAmount: 0,
          amount: 20, unConfirmAmount: 20, applyP: 'who',
          settlementNo:3

        },
        { id: 'IFS123456', orderNo: '222222',
          bussinessType: '金融', customerCompanyName: '阿里',
          customerBankAccount: '222', accountDuring: '2019-2020',
          applyDate: '1591974507000', confirmAmount: 0,
          amount: 30, unConfirmAmount: 30, applyP: 'who',
          settlementNo:4

        },
        { id: 'IFS123456', orderNo: '222222',
          bussinessType: '金融', customerCompanyName: '阿里',
          customerBankAccount: '222', accountDuring: '2019-2020',
          applyDate: '1591974507000', confirmAmount: 0,
          amount: 60, unConfirmAmount: 60, applyP: 'who',
          settlementNo:4

        },
      ],
      flag:false,
      isRtl:false,
      myFeedbackList:[
        {hasnewreply:1,feedBack:'手表怎么连接手机'},
        {hasnewreply:0,feedBack:'手表怎么连接手机'},
        {hasnewreply:0,feedBack:'手表怎么连接手机'},
        {hasnewreply:1,feedBack:'手表怎么连接手机'},
      ],
      myFeedbackLists:[
        {hasnewreply:1,feedBack:'手表怎么连接手机',isConfirm:false,flag:true},
        {hasnewreply:0,feedBack:'手表怎么连接手机',isConfirm:false,flag:true},
        
      ],
      totalMoney: 50,
      isOverSize: false,
    }
  },
  created() {
    // console.log(Cascader)
      this.getData();
  },
  methods: {
    openSwipeCell(position) {
      console.log('打开的方法', position)
    },
    closeSwipeCell(position) {
      console.log('关闭的方法', position)
      // this.myFeedbackLists.forEach(item => {
      //   item.isConfirm = false
      // })
      this.$forceUpdate()
    },
    delconfirmFn(item, index) {
      console.log('确认删除的按钮' +333333,item)
      // this.$refs.swipeCellRef[index].close()
      // this.getQueryapplist()
      item.flag = false
      this.$forceUpdate()
    },
    delUnconfirmFn(item) {
      console.log('未确认删除的按钮')

      item.isConfirm = !item.isConfirm
      this.$forceUpdate()
    },
    beforeCloseSwipeCell({ position, instance, name }) {
      console.log(position, instance, name, 'beforeCloseSwipeCell=========')
      switch (position) {
        case 'left':
        case 'cell':
        case 'outside':
          instance.close()
          break
        case 'right':
          // instance.open()
          break
      }
    },

    beforeClose({ position, instance, name }) {
      // this.$nextTick(()=>{
      // console.log(instance.$el.innerText.includes('确定'),'$el')

      // })
      console.log(position, instance, name, 'beforeCloseSwipeCell=========')
      switch (position) {
        case 'right':
        case 'cell':
        case 'outside':
          instance.close()
          break
        case 'left':
          // instance.open()
          break
      }
    },


    changeType(arr){
      console.log(arr,'外层的arr')
      console.log(this.cascaderVal,'this.cascaderVal')
      arr.forEach((item,index)=>{
        if( item[0]===''&&index===0){
          // arr.splice(-10000,1)
          console.log('lllllllllllll')
      this.cascaderVal = [
          [""],
          ["dongnan", "shanghai"],
          ["dongnan", "jiangsu"],
          ["dongnan", "zhejiang"],
          ["xibei", "shanxi"],
          ["xibei", "hebei"],
          ["xibei", "xiangjiang"],
          ["huazhong", "hunan"],
          ["huazhong", "hubei"],
          ["huazhong", "sichuan"],
          ["huazhong", "chongqing"],
      ]

        }
      })


    },
    getData() {
        this.checkoutTableData.forEach(item => {
            item.applyDate = '2020年06月12日'
        })
    },
    clickQuery() {
        // todo
    },
    clickReset() {
        // todo
    },
    // 重置表单
    reset() {
      this.dialogFormVisible = false
    },
    adminFormSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.addUser()
        }
      })
    },
    async addUser() {
      this.$emit('refreshDataList')
    },
    goBack() {
      window.history.back(-1)
    },
    onSubmit() {},
    handleSelectionChange(selection, row) {
      console.log(selection, 'selection')
      if (selection.length) {
        selection.forEach(item => {
          if (item.settlementNo === row.settlementNo) {
            console.log('勾选--------')
            let total = 0
            selection.forEach(item => {
              if (total >= 100) {
                alert('不可以再勾选了')
                this.$refs.finCenterTable.toggleRowSelection(row)
                this.checkoutTableData.forEach((item, index) => {
                  if (item.settlementNo === row.settlementNo) {
                    this.checkoutTableData[index].confirmAmount = 0
                    this.checkoutTableData[index].unConfirmAmount = row.amount
                  }
                })
              } else {
                this.checkoutTableData.forEach((item, index) => {
                  if (item.settlementNo === row.settlementNo) {
                    if (100 - total < row.amount) {
                      this.checkoutTableData[index].confirmAmount = 100 - total // 金额不足时 本次结算金额 = 剩余金额
                    } else {
                      this.checkoutTableData[index].confirmAmount = row.amount // 金额足时 本次结算金额 = 结算单金额
                    }
                    this.checkoutTableData[index].unConfirmAmount = this.checkoutTableData[index].amount - this.checkoutTableData[index].confirmAmount // 未结算金额 = 结算单金额 - 本次结算金额
                  }
                })
              }
              total += item.amount
            })
          } else {
            console.log('取消勾选--------')

            this.checkoutTableData.forEach((item, index) => {
              if (item.settlementNo === row.settlementNo) {
                this.checkoutTableData[index].confirmAmount = 0 // 本次结算金额 = 0
                this.checkoutTableData[index].unConfirmAmount = row.amount // 未结算金额 = 结算单金额
              }
            })
            if (selection.length === 1) {
              this.checkoutTableData.forEach((item, index) => {
                if (item.settlementNo === selection[0].settlementNo) {
                  this.checkoutTableData[index].confirmAmount = this.checkoutTableData[index].amount // 本次结算金额 = 结算单金额
                  this.checkoutTableData[index].unConfirmAmount = 0 // 未结算金额 = 0
                }
              })
            }
          }
        })
      } else {
        console.log('最后一次取消选择')
        this.checkoutTableData.forEach((item, index) => {
          if (item.settlementNo === row.settlementNo) {
            this.checkoutTableData[index].confirmAmount = 0 // 本次结算金额 = 0
            this.checkoutTableData[index].unConfirmAmount = this.checkoutTableData[index].amount // 未结算金额 = 计算单金额
          }
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
#financial-detail{
.twoInput{
  width: 30%;
  display: flex;
  border:transparent 1px solid;
  border-radius: 4px;
  height: 40px;
  line-height: 40px;
  background: #fff;
  .hoverInput-min,.inputOuter{
    /deep/input{
      border: none;
    }
  }
    &:hover{
      border-radius: 4px;
      border:#c0c4cc 1px solid;
    }
    &:focus{
      border:red 1px solid;
    }
}
}
  .all-list {
    margin-top: 52px;
    h2 {
      text-align: left;
      font-size: 14px;
      padding-left: 20px;
    }
    .left{
      position: absolute;
      height: 26px;
      width: 26px;
      line-height: 26px;
      background: #D5F6E6!important;
      text-align: center;
      margin-right: 10px;
      border-radius: 4px;
    }
    .custom-title{
      position: relative;
    }
    .custom-label.isRtl{
      padding-right: 40px;
      line-height: 26px;
      height: 26px;
    }
    .right{
      position: absolute;
      right: 0;
      top: 0;
      height: 26px;
      width: 26px;
      line-height: 26px;
      background: #D5F6E6!important;
      margin-left: 10px;
      text-align: center;
      border-radius: 4px;
    }
    .title-num {
        color: #ffffff;
    }
    .light {
      color: #2AD181;
    }
    .van-swipe-cell__right{
      .van-button--normal{
        padding: 0!important;
      }
    }
    .van-swipe-cell{
      .van-cell--large .van-cell__title{
        width: 50%;
      }
    }
    .custom-label{
      display: block;
      position: relative;
      flex: 1;
      width: 280px;
      height: 26px;
      padding-left: 40px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .arrow-icon{
      color: #000000;
      opacity: 0.2;
    }

    .red-point-Normal,.red-point-R{
      position: relative;
    }

    .red-point-Normal::before{
      content: " ";
      border: 3px solid red;/*设置红色*/
      border-radius:3px;/*设置圆角*/
      position: absolute;
      left: 19px;
      z-index: 1000;
    }

    .red-point-R::before{
      content: " ";
      border: 3px solid red;/*设置红色*/
      border-radius:3px;/*设置圆角*/
      position: absolute;
      right: 19px;
      z-index: 1000;

    }

  }
</style>