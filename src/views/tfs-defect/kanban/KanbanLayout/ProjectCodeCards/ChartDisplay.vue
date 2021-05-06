<template>
  <div :id="`chart` + id" class="chart-container">
    <div class="empty">
      <i class="iconfont icon-pie"></i>
      <p>{{ $t('暂无数据') }}</p>
    </div>
  </div>
</template>

<script>
/**
 * @title 数据展示
 * @author chenxiaolong
 * @date 2020.11.27
 */
import merge from 'lodash/merge'
import { i18n } from '@/i18n'
const echarts = require('echarts')

export default {
  name: 'ChartDisplay',
  props: {
    data: {
      type: Object,
      required: true,
      desc: i18n.t('项目数据'),
    },
  },
  data() {
    return {
      id: this._uid,
      myChart: null,
      localOption: {
        color: ['#3081F2', '#007AFF', '#FF722E', '#EA3447'],
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `${params.seriesName}<br>${params.marker}${params.name}: ${params.value} (${params.percent}%)`
          },
        },
        legend: {
          bottom: 0,
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 20,
          icon: 'circle',
          data: [
            i18n.t('轻微'),
            i18n.t('普通'),
            i18n.t('严重'),
            i18n.t('阻塞'),
          ],
        },
        series: [
          {
            name: i18n.t('缺陷总数'),
            type: 'pie',
            radius: ['0%', '55%'],
            bottom: 80,
            color: ['#fff'],
            hoverAnimation: false,
            label: {
              show: true,
              position: 'center',
              color: '#000',
              fontSize: 26,
              formatter: '{c}',
            },
            tooltip: {
              show: false,
            },
            data: [
              {
                value: 31,
              },
            ],
          },
          {
            name: i18n.t('缺陷数量'),
            type: 'pie',
            radius: ['58%', '88%'],
            bottom: 80,
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'inside',
              formatter: '{c}',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '24',
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: 0, name: i18n.t('轻微') },
              { value: 0, name: i18n.t('普通') },
              { value: 0, name: i18n.t('严重') },
              { value: 0, name: i18n.t('阻塞') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    chartData() {
      return {
        series: [
          {
            data: [
              {
                value:
                  this.data.minorNum +
                  this.data.majorNum +
                  this.data.criticalNum +
                  this.data.blockNum,
                type: 'all',
              },
            ],
          },
          {
            data: [
              { value: this.data.minorNum, type: 'minor' },
              { value: this.data.majorNum, type: 'major' },
              { value: this.data.criticalNum, type: 'critical' },
              { value: this.data.blockNum, type: 'block' },
            ],
          },
        ],
      }
    },
  },
  watch: {
    chartData: {
      handler: function() {
        merge(this.localOption, this.chartData)
        this.initChart()
      },
      deep: true,
    },
  },
  mounted() {
    merge(this.localOption, this.chartData)
    this.initChart()
  },
  beforeDestroy() {
    if (this.myChart) {
      window.removeEventListener('resize', this.myChart.resize)
      this.myChart.dispose()
    }
  },
  methods: {
    // 初始化图表
    initChart() {
      if (this.myChart) {
        this.myChart.showLoading()
        this.myChart.setOption(this.localOption, true)
        this.myChart.hideLoading()
        return
      }

      const dom = document.getElementById(`chart${this.id}`)

      if (dom) {
        this.myChart = echarts.init(dom)
        this.myChart.showLoading()
        this.myChart.setOption(this.localOption, true)
        this.myChart.hideLoading()

        this.myChart.on('click', this.chartClick)

        window.addEventListener('resize', this.myChart.resize)
      }
    },
    // 图表点击
    chartClick(e) {
      this.$emit('chartClick', this.data, e.data?.type)
    },
  },
}
</script>

<style lang="scss" scoped>
.chart-container {
  height: 260px;
  width: 155px;

  /deep/ canvas {
    margin-top: -50px !important;
  }

  .empty {
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    color: #999999;
    padding-left: 20px;

    & > i {
      font-size: 80px;
    }
  }
}
</style>
