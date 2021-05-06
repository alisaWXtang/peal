<template>
  <div v-if="visible" class="guide-step-pop-view" @click.stop>
    <div class="desc">{{ stepInfo.desc }}</div>
    <i class="el-icon-close btn-close" @click="handleClose" />
    <div class="point">
      <div />
      <div />
    </div>
    <div class="horn"></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      stepInfo: {
        desc: '请先创建项目',
      },
      visible: true,
    }
  },
  methods: {
    handleClose() {
      this.visible = false
    },
  },
}
</script>
<style lang="scss" scoped>
.guide-step-pop-view {
  width: 290px;
  background-color: #599af5;
  min-height: 112px;
  border-radius: 5px;
  z-index: 2888;
  color: #fff;
  padding: 24px 24px 18px;
  box-sizing: border-box;
  position: absolute;
  left: -105px;
  top: -20px;
  // transition: all .3s;
  opacity: 1;
  .horn {
    content: '';
    position: absolute;
    right: -5px;
    top: 30%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-left: 5px solid #599af5;
    border-bottom: 5px solid transparent;
  }
  .point {
    position: absolute;
    z-index: 1;
    right: -40px;
    top: 30%;
    transform: translateY(-50%);
    width: 26px;
    height: 26px;
    div {
      width: 100%;
      height: 100%;
      position: absolute;
      border-radius: 50%;
      &:first-child {
        opacity: 0.6;
        background-image: radial-gradient(#3081f2 50%, #3081f2 79%);
        z-index: 2;
        animation: ani1 infinite ease-in 1s;
      }
      &:last-child {
        opacity: 0.4;
        background-image: radial-gradient(#3081f2 50%, #3081f2 100%);
        z-index: 1;
        animation: ani2 infinite ease-in 1s;
        animation-delay: 0.6s;
      }
    }
  }
  .btn-close {
    position: absolute;
    right: 0;
    top: 0;
    padding: 10px;
    cursor: pointer;
  }
  .desc {
    font-size: 14px;
    color: #ffffff;
    letter-spacing: 1px;
    line-height: 20px;
    padding-bottom: 24px;
    min-height: 28px;
    text-align: left;
  }
  .btn-box {
    font-size: 14px;
    color: #ffffff;
    &::after {
      content: '';
      display: block;
      clear: both;
    }
    & > div {
      cursor: pointer;
    }
    .prev {
      float: left;
    }
    .next {
      float: right;
    }
  }
}
@keyframes ani1 {
  from {
    transform: scale(0.3);
    opacity: 0.6;
  }
  to {
    transform: scale(1);
    opacity: 0.45;
  }
}
@keyframes ani2 {
  from {
    transform: scale(0.3);
    opacity: 0.4;
  }
  to {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
