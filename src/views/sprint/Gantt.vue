<template>
  <div ref="gttroot" class="ganttbox"></div>
</template>
<script>
/**
 * @title 甘特图
 * @desc
 * @author heyunjiang
 * @date 2019.5.1
 */
import GanttJS from '@/utils/gantt'

export default {
  name: 'Gantt',
  components: {},
  mixins: [],
  props: {
    tasks: {
      type: Array,
      required: true,
      desc: '基础数据，包含需求、任务，统称 task，增加前置',
    },

    dateList: {
      type: Array,
      required: true,
      desc: '日期数据',
    },

    scrollCallback: {
      type: Function,
      required: true,
      desc: '滚动事件',
    },

    hoverCallback: {
      type: Function,
      required: false,
      default: () => {},
      desc: '鼠标悬浮事件',
    },

    activeRow: {
      type: Number,
      required: false,
      default: -1,
      desc: '当前活跃行，表示高亮',
    },

    tableRowHeight: {
      type: Number,
    },
  },

  data() {
    return {
      gantt: null,
      ganttOptions: {
        header_height: 40,
        column_width: 36,
        step: 24,
        view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month', 'Year'],

        bar_height: 16,
        row_height: 47,
        bar_corner_radius: 4,
        arrow_curve: 1,
        padding: 15.5,
        view_mode: 'Day',
        date_format: 'YYYY-MM-DD',
        popup_trigger: 'click', // html、svg 支持的事件
        custom_popup_html: null,
        language: 'zh',
        scrollCallback: this.scrollCallback,
        hoverCallback: this.hoverCallback,
        activeSet: this.activeSetWrapper,
      },

      ganttActiveSet: () => {},
    }
  },
  watch: {
    tasks() {
      this.generate()
    },
    activeRow() {
      if (this.activeRow === -1) {
        return
      }
      this.ganttActiveSet(this.activeRow)
    },
    tableRowHeight(newVal) {
      if (newVal !== 0) {
        // this.ganttOptions.padding = newVal - this.ganttOptions.bar_height
        if (this.gantt) {
          this.$refs.gttroot.innerHTML = ''
          this.gantt = new GanttJS(
            this.$refs.gttroot,
            [],
            this.ganttOptions,
            this.dateList,
          )

          this.generate()
        }
      }
    },
  },

  mounted() {
    this.generate()
  },
  methods: {
    // 生成、更新甘特图实例
    generate() {
      if (this.gantt) {
        this.gantt.refresh(this.tasks, this.dateList)
      } else {
        this.gantt = new GanttJS(
          this.$refs.gttroot,
          this.tasks,
          this.ganttOptions,
          this.dateList,
        )
      }
    },
    // 设置甘特图活跃
    activeSetWrapper(cb) {
      this.ganttActiveSet = cb
    },
  },
}
</script>
<style lang="scss" scoped>
.ganttbox {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}
</style>
