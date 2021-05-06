<template>
  <div class="bug-count-box">
    <div
      v-for="(item, index) in headerCount"
      :key="index"
      class="bug-count-item"
      :class="{ 'bug-count-item-active': item.key === activeType }"
      @click="shortcutClick(item.key)"
    >
      <span class="bug-count-item-title">{{ item.title }}</span>
      <span class="bug-count-item-number" :class="item.colorClass">{{
        item.number
      }}</span>
      <!-- <span
        class="bug-count-item-left cursor-pointer"
        :class="item.colorClass"
        >{{ item.number }}</span
      >
      <span class="bug-count-item-right">
        <div v-if="item.descTop !== ''" class="bug-count-item-right-desc">
          {{ item.descTop }}
        </div>
        <div v-if="item.descBottom !== ''" class="bug-count-item-right-desc">
          {{ item.descBottom }}
        </div>
      </span> -->
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 缺陷顶部统计数据
 * @desc
 * @author heyunjiang
 * @date
 */
export default {
  name: 'HeaderCount',
  components: {},
  mixins: [],
  props: {
    updateShortcutInfo: Function,
    shortcut: Object,
    summary: Object,
  },
  data() {
    return {
      activeType: 'none',
    }
  },
  computed: {
    // 顶部统计数据
    headerCount() {
      const { ONGOING, TODO, DONE, TOTAL } = this.summary
      return [
        {
          number: (TOTAL && TOTAL.number) || 0,
          colorClass: 'bug-count-item-color-total',
          title: i18n.t('全部问题'),
          descTop: i18n.t('当前版本'),
          descBottom: i18n.t('个问题'),
          key: 'toAll',
        },

        {
          number: (ONGOING && ONGOING.number) || 0,
          colorClass: 'bug-count-item-color-fixing',
          title: i18n.t('正处理'),
          descTop: i18n.t('个问题'),
          descBottom: i18n.t('正在处理'),
          key: 'ongIng',
        },

        {
          number: (TODO && TODO.number) || 0,
          colorClass: 'bug-count-item-color-waiting',
          title: i18n.t('待处理'),
          descTop: i18n.t('个问题'),
          descBottom: i18n.t('待处理'),
          key: 'toDo',
        },

        {
          number: (DONE && DONE.number) || 0,
          colorClass: 'bug-count-item-color-completed',
          title: i18n.t('已完成'),
          descTop: i18n.t('个问题'),
          descBottom: i18n.t('已完成'),
          key: 'done',
        },
      ]
    },
  },
  watch: {
    summary() {
      this.setActive()
    },
  },
  created() {},
  mounted() {
    let key = this.$getUrlParams().key
    if (key) {
      this.select(key)
    }
  },
  methods: {
    // 设置选中
    setActive() {
      const type = sessionStorage.getItem('bugSelectType') || 'norefresh'
      if (type === 'shortcut') {
        this.activeType = Object.keys(this.shortcut).find(
          item => this.shortcut[item],
        )
      } else {
        this.activeType = 'none'
      }
    },
    // 快捷搜索点击
    shortcutClick(key) {
      this.$emit('headCountClick', key)
      this.select(key)
    },
    select(key) {
      this.updateShortcutInfo(
        {
          done: false,
          ongIng: false,
          toDo: false,
          toAll: false,
          [key]: true,
        },

        'shortcut',
      )
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/bug/BugCommon';
// @import '@/style/ele-variables';

// 顶部统计数据
.bug-count-box {
  display: flex;

  .bug-count-item {
    display: flex;
    justify-content: space-between;
    min-width: 130px;
    height: 44px;
    line-height: 44px;
    padding: 0 16px;
    margin-right: 24px;
    background: #ffffff;
    border: 1px solid #e5e5e5;
    box-shadow: 0 2px 4px 0 rgba(102, 102, 102, 0.1);
    border-radius: 6px;
    border-radius: 6px;
    cursor: pointer;

    &.bug-count-item-active {
      border: 1px solid $color-font-active-common;
      background: $color-background-white-common;
    }

    .bug-count-item-title {
      font-size: 12px;
      color: #666666;
    }
    .bug-count-item-number {
      font-size: 20px;
    }

    // .bug-count-item-left {
    //   display: inline-block;
    //   min-width: 50px;
    //   height: 50px;
    //   line-height: 50px;
    //   font-size: 38px;
    //   padding-right: 5px;
    //   text-align: right;
    //   vertical-align: top;
    // }

    // .bug-count-item-right {
    //   display: inline-block;
    //   font-size: 14px;
    //   padding: 5px 0;

    //   .bug-count-item-right-desc {
    //     height: 20px;
    //     line-height: 20px;
    //   }
    // }

    .bug-count-item-color-total {
      color: #00c9c9;
    }

    .bug-count-item-color-completed {
      color: $--color-primary;
    }

    .bug-count-item-color-fixing {
      color: #007aff;
    }

    .bug-count-item-color-waiting {
      color: #ff722e;
    }
  }
}
</style>
