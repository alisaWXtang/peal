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
      <div class="prev-a ">left</div>
      <div class="next-a ">right</div>
    </div>
    <div class="content">
      <div class="contentDiv">{{contents||'111111111111111111'}}</div>
      <div class="item1" :class="{shadow:activeItem==1}" @click="ratateFn(1)">1</div>
      <div class="item2" :class="{shadow:activeItem==2}" @click="ratateFn(2)">2</div>
      <div class="item3" :class="{shadow:activeItem==3}" @click="ratateFn(3)">3</div>
      <div class="item4" :class="{shadow:activeItem==4}" @click="ratateFn(4)">4</div>
      <div :class="rotateDiv" class="rotateDiv" ><img src='../assets/logo.png' alt=""></div>
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
    };
  },
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
          this.contents = '222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222';
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
.next-a{
  position: absolute;
  top: 50px;
  z-index: 45;
  left: 30px;
  color: #fff;
  background: black;
}
.content{
  position: relative;
  background: cadetblue;
  border: 1px solid cadetblue;
  border-radius: 50%;
  width: 300px;
  height:300px;
  margin-left:300px;
  .item1{
    position: absolute;
    left: -150px;
    top: 30px;
    border-radius: 50%;
    width: 80px;
    height:80px;
    background: chartreuse;
  }
  .item2{
      position: absolute;
      left: -130px;
      top: 200px;
      border-radius: 50%;
      width: 80px;
      height:80px;
      background: chartreuse;
  }
  .item3{
    position: absolute;
    left: 56px;
    top: 391px;
    border-radius: 50%;
    width: 80px;
    height:80px;
    background: chartreuse;
  }
    .item4{
    position: absolute;
    left: 310px;
    top: 338px;
    border-radius: 50%;
    width: 80px;
    height:80px;
    background: chartreuse;
  }
  .rotateDiv{
    position: absolute;
    width: 50px;
    height:50px;
    border-radius: 50%;
    left: -10px;
    top: 125px;
    background: goldenrod;
    transform-origin: 160px center;
		transition: all 1s;
    font-size: 16px;
    img{
      widows: 100%;
      height:100%;
    }
  }
  .rotateDiv1{
    transform: rotate(-10deg);
  }
  .rotateDiv2{
    transform: rotate(-30deg);
  }
  .rotateDiv3{
    transform: rotate(-90deg);
  }
  .rotateDiv4{
    transform: rotate(-130deg);
  }
}
.contentDiv{
  width: 100%;
  height:100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.shadow{
  box-shadow: 0 0 5px brown;
}
</style>
