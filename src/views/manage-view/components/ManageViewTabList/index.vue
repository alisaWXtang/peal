<template>
  <div class="tab-list">
    <div
      v-for="tab in data"
      :key="keyName ? tab[keyName] : tab.id"
      class="tab-list__item"
      :class="
        value === (keyName ? tab[keyName] : tab.id)
          ? 'tab-list__item--active'
          : ''
      "
      @click="selectTab(tab)"
    >
      <span class="item-name" :title="tab.name">{{ tab.name }}</span>
      <span class="item-count">{{ tab.count }}</span>
      <!-- <div class="item-bar" :style="{ background: getBarColor(index) }"></div> -->
    </div>
  </div>
</template>

<script>
/**
 *  管理者视图需要的tabList封装
 *  props
 *    keyName 用于列表key的字段名，不传默认使用id，无id则默认使用index
 *    data 要渲染的列表数组
 *      data[i].name 用于展示的标签名
 *      data[i].count 用于展示的分类数字
 *      data[i].id 列表的索引(可选，也可使用其它字段名作为列表索引，通过keyName设置)
 *    defaultSelected 默认选中项，为data数组重的某个元素
 *  event
 *    change 用于获取当前选中项，参数为选中的data数组中的元素
 */
export default {
  name: 'ManageViewTabList',
  model: {
    prop: 'value',
    event: 'change',
  },

  props: {
    keyName: {
      type: String,
    },

    value: {
      validator: () => {
        return true
      },
      required: true,
      desc: 'v-model 绑定的值',
    },

    data: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {}
  },
  methods: {
    selectTab(currentTab) {
      this.$emit(
        'change',
        this.keyName ? currentTab[this.keyName] : currentTab.id,
      )
    },
    // getBarColor(index) {
    //   const barColorList = [
    //     '#274977',
    //     '#7777a4',
    //     '#7aa7ff',
    //     '#a7d2ff',
    //     '#d2d252',
    //     '#a5d24c',
    //     '#cfed8e',
    //   ]

    //   return barColorList[index % barColorList.length]
    // },
  },
}
</script>
<style scoped lang="scss">
.tab-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;

  .tab-list__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    min-width: 136px;
    height: 44px;
    padding: 0 16px;
    margin-right: 16px;
    background: #ffffff;
    border: 1px solid #e5e5e5;
    box-shadow: 0 2px 4px 0 rgba(102, 102, 102, 0.1);
    border-radius: 6px;
    cursor: pointer;

    &.tab-list__item--active {
      border-color: $--color-primary;
    }

    .item-count {
      font-size: 20px;
      color: $--color-text-fine;
      margin-left: 10px;
    }
  }
}
</style>
