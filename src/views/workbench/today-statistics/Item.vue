<template>
  <!-- 统计项 -->
  <div
    class="todayStatistics-item"
    :class="+itemInfo.count <= 0 ? 'none-cursor-pointer' : ''"
    @click.stop="setMode"
  >
    <div :class="['todayStatistics-item-icon', itemInfo.bgClass]">
      <i :class="['iconfont', itemInfo.class]" />
    </div>
    <div class="todayStatistics-item-info" :class="[itemInfo.bgClass]">
      <span class="count">
        <span class="number">{{ itemInfo.count }}</span>
        <span
          v-if="itemInfo.attr === 'todayTodoCount' && itemInfo.todayDelayCount"
          class="delay-count"
          ><i class="el-icon-warning-outline"></i>{{ $t('延期')
          }}{{ itemInfo.todayDelayCount || 0 }}{{ $t('个') }}</span
        >
      </span>
      <div class="title">{{ itemInfo.title }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    itemInfo: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    setMode() {
      if (typeof this.itemInfo.count === 'number' && +this.itemInfo.count > 0) {
        const type = this.itemInfo.workItemsType
        this.$emit('setMode', type)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
$done: $--color-success;
$todo: $--color-warning;
$maturity: $--color-danger;
$all_todo: $--color-primary;

.todayStatistics-item {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  padding: 0 10px;
  cursor: pointer;

  &.none-cursor-pointer {
    cursor: default;
  }

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
  }

  &-icon {
    width: 48px;
    height: 48px;
    margin-right: 16px;
    border-radius: 6px;
    text-align: center;
    line-height: 48px;
    .iconfont {
      font-size: 22px;
      color: #fff;
    }
  }
  &-info {
    background-color: #fff !important;
    .title {
      font-size: 14px;
      color: $--color-text-fine;
      letter-spacing: 0.88px;
      line-height: 24px;
    }
    .count {
      display: flex;
      align-items: center;

      .number {
        font-size: 32px;
        color: currentColor;
        line-height: 32px;
      }

      .delay-count {
        position: relative;
        margin-left: 8px;
        font-size: 12px;
        color: $--color-danger;
        line-height: 20px;
        border-radius: 4px;
        pointer-events: none;
        i {
          margin-right: 5px;
        }
      }
    }
  }
  .completed {
    background: $done;
    color: $done;

    .number {
      &:hover {
        color: mix($--color-white, $done, 30%);
      }
      &:active {
        color: mix($--color-black, $done, 30%);
      }
    }
  }
  .pending {
    background: $todo;
    color: $todo;

    .number {
      &:hover {
        color: mix($--color-white, $todo, 30%);
      }
      &:active {
        color: mix($--color-black, $todo, 30%);
      }
    }
  }
  .expired {
    background: $maturity;
    color: $maturity;
    .number {
      &:hover {
        color: mix($--color-white, $maturity, 30%);
      }
      &:active {
        color: mix($--color-black, $maturity, 30%);
      }
    }
  }
  .pending-all {
    background: $all_todo;
    color: $all_todo;

    .count {
      &:hover {
        color: mix($--color-white, $all_todo, 30%);
      }

      &:active {
        color: mix($--color-black, $all_todo, 30%);
      }
    }
  }
}
</style>
