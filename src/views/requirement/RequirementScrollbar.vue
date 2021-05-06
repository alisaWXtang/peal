<template>
  <div
    ref="scrollbarbox"
    class="scrollbar-box"
    :class="{ 'fixed-bottom': isScrollbarFixed }"
  >
    <div ref="scrollbar" class="scrollbar-item scrollbal-weight">
      <div ref="scrollbarcontent" class="scrollbar-content"></div>
    </div>
  </div>
</template>
<script>
/**
 * @title 需求列表 - 自定义底部悬浮滚动条
 * @desc 3.5.2 临时功能
 * @author heyunjiang
 * @date 2020.1.19
 */
export default {
  name: 'RequirementScrollbar',
  components: {},
  mixins: [],
  props: {
    treeData: Array,
  },

  data() {
    return {
      isScrollbarFixed: false, // 是否滚动到底部
      tableHeader: null, // ref tableheader
      tableWrapper: null, // ref tableWrapper
      windowScrollBox: null, // 全局滚动盒子
    }
  },
  computed: {},
  watch: {
    treeData() {
      // 在 element ui table header 渲染速度较慢，这里 setTimeout 300 只会影响当前模块，因为它是一个独立的组件
      setTimeout(() => {
        this.scrollbarUpdate()
      }, 300)
    },
  },

  created() {},
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.uninit()
  },
  methods: {
    uninit() {
      this.windowScrollBox &&
        this.windowScrollBox.removeEventListener(
          'scroll',
          this.scrollBottomComputed,
        )

      this.$refs.scrollbar &&
        this.$refs.scrollbar.removeEventListener(
          'scroll',
          this.scrollbarScrollEvent,
        )
    },
    // 初始化
    init() {
      this.parentScrollBox = document.getElementById('table-box')
      this.tableWrapper = this.parentScrollBox.querySelector(
        '.el-table__body-wrapper',
      )

      this.tableHeader = this.parentScrollBox.querySelector('.el-table__header')

      this.windowScrollBox =
        document.querySelector('.project-content') || window
      this.scrollbarUpdate()
    },
    // 更新滚动条组件信息：滚动条宽度、父盒子宽度、滚动条位置、滚动事件
    scrollbarUpdate() {
      this.uninit()
      if (!this.$refs.scrollbarbox) {
        return
      }
      // 首先判断是否需要展示滚动条
      if (
        this.parentScrollBox.getBoundingClientRect().width >
        this.tableHeader.getBoundingClientRect().width + 11
      ) {
        this.$refs.scrollbarbox.style.display = 'none'
        return false
      }
      this.$refs.scrollbarbox.style.display = 'inherit'
      this.refreshScrollBarContentWidth()
      this.scrollBottomComputed()

      const { paddingLeft, paddingRight } = getComputedStyle(
        this.parentScrollBox,
      )

      const scrollbarboxOffset =
        +paddingLeft.split('px')[0] + +paddingRight.split('px')[0]

      this.$refs.scrollbarbox.style.width =
        this.parentScrollBox.getBoundingClientRect().width -
        scrollbarboxOffset +
        'px'

      // 初始化滚动条滚动事件
      this.$refs.scrollbar.addEventListener('scroll', this.scrollbarScrollEvent)

      // window 滚动设置滚动条固定
      this.windowScrollBox.addEventListener('scroll', this.scrollBottomComputed)
    },
    // 滚动条 - 计算滚动条内容宽度
    refreshScrollBarContentWidth() {
      this.$refs.scrollbarcontent.style.width =
        this.tableHeader.getBoundingClientRect().width + 'px'
    },
    // 滚动条 - 固定
    scrollBottomComputed() {
      const { bottom } = this.parentScrollBox.getBoundingClientRect()
      if (bottom > window.innerHeight) {
        this.isScrollbarFixed = true
      } else {
        this.isScrollbarFixed = false
      }
    },
    // 滚动条 - 滚动事件
    scrollbarScrollEvent() {
      this.tableWrapper.scrollLeft = this.$refs.scrollbar.scrollLeft
    },
  },
}
</script>
<style lang="scss" scoped>
// 滚动条样式
.scrollbar-box {
  position: relative;
  display: inline-block;
  width: 100%;
  z-index: 2;
  .scrollbar-item {
    float: left;
    height: 12px;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    .scrollbar-content {
      background: transparent;
      height: 1px;
    }
  }
}
.fixed-bottom {
  position: fixed;
  bottom: 0;
}
</style>
<style lang="scss">
// 去掉自带的滚动条
.el-table-hidden-scrollbar-box {
  .el-table__body-wrapper {
    // overflow-x: hidden;
    &::-webkit-scrollbar {
      /*滚动条整体样式*/
      width: 12px;
      /*高宽分别对应横竖滚动条的尺寸*/
      height: 0;
    }
    &::-webkit-scrollbar-thumb {
      /*滚动条里面小方块*/
      border-radius: 0;
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      background: #dddddd;
    }
    &::-webkit-scrollbar-track {
      /*滚动条里面轨道*/
      background: #eee;
    }
  }
}
</style>
