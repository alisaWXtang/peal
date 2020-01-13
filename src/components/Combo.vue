<template>
  <div class="combo-page">
    <div class="combo-top">
      <span class="go-back" @click="goback">
        <van-icon name="arrow-left" />
      </span>
      <span>代缴</span>
      <van-dropdown-menu class="combo-top-center">
        <van-dropdown-item
          v-model="value"
          :options="this.$route.query.is==='no'? option : yesOption"
        />
      </van-dropdown-menu>
      <span>社保</span>
    </div>
    <div @click="viewpic">
      <div class="pic-one" v-if="value===1 && this.$route.query.is==='no'">
        <img :src="avators.noshenzhenOne" alt />
      </div>
      <div class="pic-two" v-if="value===2 && this.$route.query.is==='no'">
        <img :src="avators.noshenzhenTwo" alt />
      </div>
      <div class="pic-three" v-if="value===3 && this.$route.query.is==='no'">
        <img :src="avators.noshenzhenThree" alt />
      </div>
      <div class="pic-three" v-if="value===1 && this.$route.query.is==='yes'">
        <img :src="avators.yesshenzhenOne" alt />
      </div>
    </div>
    <div class="ad-containt">放资料宣传</div>
    <div class="bottom-tab">
      <van-tabbar v-model="active" @change="tabChange">
        <van-tabbar-item name="two" @click="checkout" icon="cart-circle-o">自选组合</van-tabbar-item>
        <van-tabbar-item name="one" icon="newspaper-o">推荐搭配</van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import {
  DropdownMenu,
  DropdownItem,
  ImagePreview,
  Tabbar,
  TabbarItem,
  Toast,
  Icon,
} from "vant";

export default {
  name: "Combo",
  data() {
    return {
      value: 1,
      active: "two",
      option: [
        { text: "一档", value: 1 },
        { text: "二挡", value: 2 },
        { text: "三挡", value: 3 },
      ],
      yesOption: [{ text: "一档", value: 1 }],
      avators: {
        noshenzhenOne: require("../assets/images/noshenzhenOne.jpg"),
        noshenzhenTwo: require("../assets/images/noshenzhenTwo.jpg"),
        noshenzhenThree: require("../assets/images/noshenzhenThree.jpg"),
        yesshenzhenOne: require("../assets/images/579616592.jpg"),
      },
    };
  },
  components: {
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [ImagePreview.name]: ImagePreview,
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
    [Toast.name]: Toast,
    [Icon.name]: Icon,
  },
  methods: {
    viewpic() {
      this.$route.query.is === "no"
        ? ImagePreview({
          images: [
            this.avators.noshenzhenOne,
            this.avators.noshenzhenTwo,
            this.avators.noshenzhenThree,
          ],
        })
        : ImagePreview({
          images: [this.avators.yesshenzhenOne],
        });
    },
    tabChange(v) {
      if (v.includes("one")) {
        this.$router.push({ path: "/self-selected" });
      }
    },
    checkout() {
      console.info("去付费！！！");
      Toast("去付款！！！！！");
    },
    goback() {
      this.$router.push({ path: "/" });
    },
  },
  watch: {
    value: (n, o) => {
      // console.info(n, o);
    },
  },
};
</script>

<style scoped lang="scss">
.combo-page {
  width: 100%;
  height: 100%;
  background: url("../assets/images/bg.jpg");
  background-size: cover;
  background-repeat: repeat-y;
  .combo-top {
    display: flex;
    justify-content: center;
    align-items: center;
    .go-back {
      position: fixed;
      left: 5px;
      i:hover {
        color: #1989fa;
        transition: all 0.3s;
      }
    }
    .combo-top-center {
      margin: 0 20px;
    }
  }
  .pic-one,
  .pic-two,
  .pic-three {
    img {
      width: 100%;
      height: 210px;
    }
  }
  .ad-containt {
    font-size: 16px;
    padding: 5px;
  }
  .bottom-tab {
    position: fixed;
    bottom: 0;
  }
}
</style>
