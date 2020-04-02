<template>
  <div class="home-page">
    <div class="img">
      <van-swipe :autoplay="3000">
        <van-swipe-item v-for="(image, index) in images" :key="index">
          <img :src="image" />
        </van-swipe-item>
      </van-swipe>
    </div>
    <div class="social">
      <div class="left">
        <div>
          <van-icon name="friends-o" />
        </div>
        <div>有*人更新社保</div>
      </div>
      <div class="right">
        <marquee>
          <div class="marquee-containt">
            <div v-for="(item, index) in avators" :key="index">
              <p>
                <van-image width="30px" height="30px" round :src="item.img" />
              </p>
              <p>{{item.name}}</p>
            </div>
          </div>
        </marquee>
      </div>
    </div>
    <div class="chosen-coupon">
      <div class="chosen-coupon1" @click="showlow($event)" ref="div" v-if="show">优惠券1</div>
      <div class="chosen-coupon2" >优惠券2</div>
      <div class="chosen-coupon3">优惠券3</div>
    </div>
    <button @click="letshow">按钮</button>
    <div class="thereason" >为啥</div>
    <div class="submit-btn">
      <van-button type="primary" size="large" @click="clickSubmit">立即申请</van-button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import {
  Swipe, SwipeItem, Icon, Image, Button, Dialog,
} from "vant";

export default {
  name: "Home",
  data() {
    return {
      show: true, // 弹框
      images: [
        "https://img.yzcdn.cn/vant/apple-1.jpg",
        "https://img.yzcdn.cn/vant/apple-2.jpg",
      ],
      avators: [
        { img: "https://img.yzcdn.cn/vant/cat.jpeg", name: "唐**" },
        { img: "https://img.yzcdn.cn/vant/apple-3.jpg", name: "明**" },
        { img: require("../assets/logo.png"), name: "刘**" },
        { img: "https://img.yzcdn.cn/vant/apple-1.jpg", name: "王**" },
        { img: "https://img.yzcdn.cn/vant/cat.jpeg", name: "张**" },
        { img: "https://img.yzcdn.cn/vant/apple-2.jpg", name: "赵**" },
      ],
    };
  },
  components: {
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Icon.name]: Icon,
    [Image.name]: Image,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
  },
  created() {
    this.getData();
    document.addEventListener('click', (e) => {
      // console.log(this.$refs.div.contains(e.target));
      if (!this.$refs.div.contains(e.target)) {
        this.show = !this.show;
      }
    });
  },
  methods: {
    // 模拟弹框
    showlow(e) {
      e.stopPropagation();
    },
    // 按钮
    letshow() {
      this.show = !this.show;
    },
    async getData() {
      const res = await this.$ajax.getMockData();
      console.info(res);
      this.setMockData(res);
    },
    ...mapMutations(["setMockData"]),
    clickSubmit() {
      const _this = this;
      Dialog.confirm({
        title: "标题",
        cancelButtonText: "深户",
        confirmButtonText: "非深户",
        message: "温馨提示！！！！！！！！！！",
      })
        .then(() => {
          _this.$router.push({ path: "/combo?is=no" });
        })
        .catch(() => {
          _this.$router.push({ path: "/combo?is=yes" });
        });
    },
  },
};
</script>

<style scoped lang="scss">
.home-page {
  font-size: 14px;
  height: 100%;
  width: 100%;
  .img {
    img {
      width: 100%;
      height: 156px;
    }
  }
  .social {
    display: inline-flex;
    height: 50px;
    width: 100%;
    .left {
      padding: 3px;
      width: 35%;
      line-height: 25px;
      text-align: center;
      i {
        font-size: 24px;
        color: #000;
      }
    }
    .right {
      text-align: center;
      padding: 3px;
      width: 65%;
      .marquee-containt {
        display: inline-flex;
        padding: 0;
        p {
          margin: 0;
        }
        div {
          margin-right: 5px;
        }
      }
    }
  }
  .chosen-coupon {
    width: 100%;
    height: 130px;
    display: flex;
    margin-top: 10px;
    text-align: center;
    .chosen-coupon1,
    .chosen-coupon2,
    .chosen-coupon3 {
      width: 33.3333%;
      height: 100%;
      line-height: 130px;
    }
    .chosen-coupon1 {
      background: red;
      .white{
        z-index: 20;
        color: #000;
        background: white;
        width: 30px;
        height: 80px;
      }
    }
    .chosen-coupon2 {
      background: khaki;
    }
    .chosen-coupon3 {
      background: blueviolet;
    }
  }
  .thereason {
    margin: 8px 0;
    width: 100%;
    height: 250px;
    background: gold;
  }
  .submit-btn {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
  }
}
</style>
