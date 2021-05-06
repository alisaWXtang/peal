<template>
  <div
    v-if="cardData.length"
    v-infinite-scroll="load"
    :infinite-scroll-disabled="noMore"
    :infinite-scroll-distance="20"
    :infinite-scroll-immediate="false"
  >
    <div
      v-for="item in cardPageData"
      :key="item.requirement.id"
      class="panel-item"
      :class="{
        'panel-item-line': isPanelItemLine,
      }"
    >
      <slot :row="item"></slot>
    </div>
    <!--    <p v-if="noMore">没有更多了</p>-->
  </div>
</template>

<script>
export default {
  name: 'CardInfiniteScroll',
  props: {
    cardData: {
      type: Array,
      default: () => [],
    },
    isPanelItemLine: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      pageNum: 0,
      pageSize: 20,
      total: 0,
      cardPageData: [],
      start: 0,
      end: 0,
      isLoad: true,
    }
  },
  computed: {
    noMore() {
      return this.pageSize * this.pageNum >= this.cardData.length
    },
  },
  watch: {
    cardData: {
      handler() {
        this.cardPageData = []
        this.isLoad = false
        this.clearAndGetCardPageData()
      },
    },
  },
  mounted() {
    this.init()
    this.getPageData()
  },
  methods: {
    init() {
      this.total = this.cardData.length
    },
    getPageData() {
      if (this.cardData.length) {
        this.pageNum++
        this.start = (this.pageNum - 1) * this.pageSize
        this.end = this.start + this.pageSize
        this.cardPageData.push(...this.cardData.slice(this.start, this.end))
      }
    },
    clearAndGetCardPageData() {
      this.pageNum = 0
      this.$nextTick(() => {
        this.getPageData()
        this.isLoad = true
      })
    },
    load() {
      if (this.isLoad) {
        this.getPageData()
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
