<template>
  <div class="chart-content">
    <div v-show="!emptyData" :id="`chart${id}`" class="chart-container"></div>
    <slot v-if="emptyData" name="empty">
      <div class="empty-data">{{ $t('暂无数据') }}</div>
    </slot>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 用于展示图表
 * @description
 * @author chenxiaolong
 * @time 2020.7.2
 */
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
import 'echarts-liquidfill/src/liquidFill'
var echarts = require('echarts')
// import { defaultFilterMaps } from '../../util'
import { defaultOptions, defaultLiquidFillOptions } from './config'
import Mixins from './mixins'

export default {
  name: 'ChartDisplay',
  mixins: [Mixins],
  props: {
    /**
     * chart data
     */
    chartData: {
      required: false,
      type: Object,
      desc: i18n.t('配置参数'),
    },

    extraOptions: {
      type: Object,
      default: () => {},
      desc: '额外配置，可覆盖计算出的options',
    },
    finished: {
      type: Boolean,
      default: false,
      desc: '是否加载完毕',
    },
  },

  data() {
    return {
      id: this._uid,
      defaultOptions: cloneDeep(defaultOptions),
      nativeChartOptions: {},
      formatOptions: {},
      myChart: null,
      emptyData: true, // 图表数据是否为空
    }
  },

  computed: {
    finishLoading: {
      get() {
        return this.finished
      },
      set(val) {
        this.$emit('update:finished', val)
      },
    },
  },
  watch: {
    chartData: {
      handler: function(val) {
        this.formatOptions = this.generateChartOptions(val)
        this.emptyData = this.formatOptions?.series.every(
          item => !item.data.length,
        )

        if (!this.emptyData) {
          this.generateOptions()
        } else {
          this.finishLoading = true
        }
      },
      deep: true,
    },

    nativeChartOptions: {
      handler: function() {
        this.initChart()
      },
      deep: true,
    },
  },

  mounted() {},
  beforeDestroy() {
    if (this.myChart) {
      window.removeEventListener('resize', this.myChart.resize)
      this.myChart.dispose()
    }
  },
  methods: {
    // 生成最终配置
    generateOptions() {
      // 占比图配置
      if (this.formatOptions.type === 'liquidFill') {
        this.nativeChartOptions = merge({}, defaultLiquidFillOptions, {
          series: { data: this.formatOptions.series[0]?.data || [0] },
        })
      } else {
        this.nativeChartOptions = merge(
          {},
          defaultOptions,
          this.formatOptions,
          this.extraOptions,
        )
      }
    },
    // 初始化图表
    initChart() {
      this.finishLoading = false
      if (this.myChart) {
        this.myChart.showLoading()
        this.myChart.setOption(this.nativeChartOptions, true)
        this.myChart.hideLoading()
        this.finishLoading = true
        return
      }

      this.$nextTick(() => {
        const dom = document.getElementById(`chart${this.id}`)
        if (dom) {
          this.myChart = echarts.init(dom)
          this.myChart.showLoading()
          this.myChart.setOption(this.nativeChartOptions, true)
          this.myChart.hideLoading()
          this.finishLoading = true

          // 占比图不注册点击事件
          if (this.formatOptions.type !== 'liquidFill') {
            this.myChart.on('click', this.chartClick)
          }

          window.addEventListener('resize', this.myChart.resize)
        }
      })
    },
    // 点击事件
    chartClick(e) {
      const seriesItem = this.formatOptions.series[e.seriesIndex]
      const data = seriesItem.values[e.dataIndex]
      const valueAble = data?.value && data?.value !== '0'

      // 不可点击处理
      if (!seriesItem.clickable || !valueAble) {
        this.$message.warning(i18n.t('该区域数据不可点击'))
        return
      }

      if (data) {
        const queryParams = {
          rowKey: data.rowKey,
          rowGroup: data.rowGroup,
          colKey: seriesItem.colKey,
          colGroup: seriesItem.colGroup,
          colNameKey: seriesItem.colNameKey,
          summaryType: seriesItem.summaryType,
        }

        this.$emit('click', { e, data: { ...data, queryParams } })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.chart-content {
  height: 400px;
  width: auto;
  position: relative;
}

.chart-container {
  width: auto;
  height: 100%;
  position: relative;
}

.empty-data {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999999;
}
</style>
