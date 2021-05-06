<template>
  <div class="viewRecordsItem">
    <div class="viewRecordsItem-info">
      <div class="viewRecordsItem-info-icon">
        <i class="iconfont icon-xiangmu1" />
      </div>
      <div
        class="viewRecordsItem-info-name"
        :title="itemInfo.name"
        @click.stop="jumpPath('/requirement/list')"
      >
        {{ itemInfo.name }}
      </div>
    </div>
    <div class="viewRecordsItem-icon">
      <co-tooltip :content="$t('迭代')" popper-class="coteam-workbench-tooltip">
        <i
          class="iconfont icon-diedai"
          @click.stop="jumpPath('/sprint/list')"
        />
      </co-tooltip>
      <co-tooltip :content="$t('任务')" popper-class="coteam-workbench-tooltip">
        <i class="iconfont icon-renwu" @click.stop="jumpPath('/task/view')" />
      </co-tooltip>
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
    jumpPath(path) {
      this.$emit('openApp', {
        path,
        query: {
          projectId: this.itemInfo.id,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.viewRecordsItem {
  width: 207px;
  padding: 16px 16px 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: $--background-block;
  border: 1px solid transparent;
  border-radius: 4px;
  box-sizing: border-box;
  transition: all linear 0.4s;
  &-info {
    padding-bottom: 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f1f4f9;
    &-icon {
      width: 20px;
      height: 20px;
      margin-right: 8px;
      text-align: center;
      line-height: 20px;
      font-size: 16px;
      color: $--color-primary;
      border-radius: 4px;
    }
    &-name {
      font-size: 15px;
      color: #333;
      max-width: calc(100% - 24px);
      cursor: pointer;
      @include no-wrap;
      // line-height: 20px;
      &:hover {
        color: $--color-primary;
      }
    }
  }
  &-icon {
    margin-top: 16px;
    text-align: right;
    color: $--color-text-secondary;
    .iconfont {
      padding: 5px 4px;
      cursor: pointer;
    }

    i:hover {
      color: $--color-primary;
    }
  }
}
</style>
