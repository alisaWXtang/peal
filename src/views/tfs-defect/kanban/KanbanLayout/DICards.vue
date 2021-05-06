<template>
  <div class="tfs-di-cards__container">
    <div class="di-card el-card is-always-shadow">
      <div class="left">{{ $t('当前DI值超过标准值80%的总天数') }}</div>
      <div class="right">
        <div class="content">
          {{ currentData.exceedTarget80SumDayNum }}
          <span class="unit">{{ $t('天') }}</span>
        </div>
      </div>
    </div>
    <div class="di-card el-card is-always-shadow">
      <div class="left">{{ $t('当前DI值超过标准值的总天数') }}</div>
      <div class="right">
        <div class="content">
          {{ currentData.exceedTargetSumDayNum }}
          <span class="unit">{{ $t('天') }}</span>
        </div>
      </div>
    </div>
    <div class="di-card el-card is-always-shadow">
      <div class="left">{{ $t('阻塞问题总数') }}</div>
      <div class="right">
        <div class="content">
          {{ currentData.blockSumNum }}
        </div>
      </div>
    </div>
    <div class="di-card el-card is-always-shadow">
      <div class="left">{{ $t('严重问题总数') }}</div>
      <div class="right">
        <div class="content">
          {{ currentData.criticalNum }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * @title tfs DI 超过标准值总天数卡片
 * @author wuqian
 * @date 2020.9.7
 */
export default {
  name: 'DICards',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      currentData: {
        exceedTargetSumDayNum: 0,
        exceedTarget80SumDayNum: 0,
        blockSumNum: 0,
      },
    }
  },
  watch: {
    data(val) {
      this.currentData = {
        ...this.currentData,
        ...val,
      }
    },
  },
  created() {
    this.currentData = {
      ...this.currentData,
      ...this.data,
    }
  },
}
</script>
<style lang="scss" scoped>
.tfs-di-cards__container {
  display: flex;
}
.di-card {
  display: inline-flex;
  padding: 12px 0;
  margin-right: 21px;
  .left {
    padding: 0 16px;
    width: 106px;
    line-height: 20px;
    border-right: 1px solid #e5e5e5;
    height: 46px;
    color: #666;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .right {
    display: flex;
    width: 55px;
    padding: 0 16px;
    justify-content: center;
    align-items: center;
    .content {
      font-size: 24px;
    }
    .unit {
      font-size: 14px;
      color: #666;
    }
  }
}
</style>
