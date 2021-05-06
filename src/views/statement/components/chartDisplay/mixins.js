/**
 * @title mixins chart数据解析
 */

// 数据图表类型
const chartTypesMap = {
  BarChart: 'bar',
  FlowChart: 'line',
  PieChart: 'pie',
  LineChart: 'line',
}

// 分割x轴名称固定长度
const splitXaxisNameLen = 6

// 在存在x轴分割名称是 datazoom 的缩放大小
// const dataZoomValueSpanForXaxis = 9

// 规定x轴溢出名称最大长度，溢出特殊处理
const overflowNameLen = 10

// 默认颜色
const defaultColors = [
  '#5294FF',
  '#5AD8A6',
  '#F06D4F',
  '#FEC03C',
  '#A397F7',
  '#FF69B4',
  '#C7DC68',
  '#F29073',
  '#19d4ae',
  '#ff9999',
  '#3398DB',
  '#f4cd42',
  '#f6695e',
  '#afebc8',
  '#f4c192',
  '#ffcccc',
  '#d5e5f4',
  '#faa59e',
]

// 流积图默认使用颜色
const RequireFlowVolumeChartColors = [
  '#5294FF',
  '#5AD8A6',
  '#F06D4F',
  '#FEC03C',
  '#A397F7',
  '#FF69B4',
  '#C7DC68',
  '#F29073',
  '#336699',
  '#3398DB',
  '#BDD7EE',
  '#FF9999',
  '#FFCC33',
  '#9999FF',
  '#9999CC',
  '#66CC99',
  '#66CCCC',
  '#CCCC99',
  '#339999',
  '#CC9999',
  '#FFCCCC',
  '#CC99CC',
  '#333366',
  '#FF9966',
  '#CC9966',
  '#996666',
  '#CCCCCC',
  '#99CC66',
  '#CC3399',
]

/**
 * @title 解析数据类
 * @desc 使用后端接口chart数据 初始化类
 * @author chenxiaolong
 * @date 2020.10.19
 */
class ChartParse {
  constructor(chartData) {
    this.showDataZoomLength = 20
    this.type = 'normal'
    this.legendData = []
    this.yAxis = []
    this.series = []
    this.chartTypes = [] // 图表类型
    this.chartData = chartData
    this.options = {}
    this.tooltip = {}
    this.dataZoom = [{}]
    this.parse()

    return this
  }

  // 解析数据
  parse() {
    const legendDataSet = new Set()
    const yAxisNameSet = new Set()
    const { legendData, chartTypes } = this
    const { data, chartDefinition } = this.chartData
    data.forEach(dataItem => {
      const colField = chartDefinition.colFields.find(
        field =>
          field.data === dataItem.colKey &&
          field.colGroup === dataItem.colGroup &&
          field.summaryType === dataItem.summaryType,
      )

      if (colField && !legendDataSet.has(colField.display)) {
        legendDataSet.add(colField.display)
        legendData.push(colField.display)
        chartTypes.push(colField.chartType)
      }

      const colNameItem = chartDefinition.colNames.find(
        nameItem => nameItem.colNameKey === dataItem.colNameKey,
      )

      if (colField) {
        // 指标描述
        if (colNameItem && !yAxisNameSet.has(colNameItem.colName)) {
          this.yAxisFn(colNameItem, colField)
          yAxisNameSet.add(colNameItem.colName)
        }

        this.seriesFn(dataItem, colField)
      }
    })

    this.xAxisFn()
    this.tooltipFn()
    this.dataZoomFn()
    this.options = this.generateOptions()
  }

  // series 数据计算
  seriesFn(dataItem, colField) {
    const { chartDefinition } = this.chartData
    let config = {
      ...dataItem,
      clickable: colField.clickable,
      name: colField.display,
      type: chartTypesMap[colField.chartType],
      // 数据正反处理
      data: dataItem.values.map(item =>
        colField.positive ? item.value : -item.value,
      ),

      yAxisType: colField.axisType,
      smooth: ['LineChart', 'FlowChart'].includes(colField.chartType),
      yAxisIndex: this.yAxis.length - 1,
    }

    if (colField.chartType === 'PieChart') {
      config.radius = ['35%', '55%']
      config.tooltip = {
        trigger: 'item',
        formatter: function(params) {
          return `${params.seriesName}<br>${params.marker}${params.name}: ${params.value} (${params.percent}%)`
        },
      }
      config.label = {
        formatter: function(params) {
          return `${params.name}(${params.percent}%)`
        },
      }

      this.legendData = [] // 饼状图 清空legendData
      config.data = dataItem.values.map((item, index) => {
        const rowName = chartDefinition.rowFields[index].display
        this.legendData.push(rowName)
        return {
          value: item.value,
          name: rowName,
        }
      })
    } else if (colField.chartType === 'FlowChart') {
      // 开启流积图, 以及配置相关参数
      config = {
        ...config,
        // 重新按照颜色顺序制定指定颜色
        color:
          RequireFlowVolumeChartColors[
            this.series.length % RequireFlowVolumeChartColors.length
          ],
        areaStyle: {},
        lineStyle: {
          width: 0,
        },

        showSymbol: false,
        smooth: true,
        stack: 'flowChart',
      }
    } else if (colField.chartType === 'BarChart') {
      config.label = {
        show: true,
        // 柱状图label位置设置
        position: colField.positive ? 'top' : 'bottom',
        formatter: function(params) {
          return params.value && params.value !== '0'
            ? Math.abs(params.value)
            : ''
        },
      }
      config.barMaxWidth = 18
      config.barMinWidth = 5
    }

    this.series.push(config)
  }

  // tooltip 计算
  tooltipFn() {
    // 流积图排列顺序变化后， tooltip显示顺序也需要变化
    if (this.chartTypes.includes('FlowChart')) {
      this.tooltip = {
        formatter: function(params) {
          let htmlStr = ''
          Array.isArray(params) &&
            params.forEach(item => {
              if (item.value && item.value !== '0') {
                htmlStr += `${item.marker}${item.seriesName}：${item.value} </br>`
              }
            })

          return htmlStr ? params[0]?.axisValue + '<br>' + htmlStr : htmlStr
        },
      }
    }
  }

  // yXaix 数据计算
  yAxisFn(colNameItem, colField) {
    this.yAxis.push({
      ...colNameItem,
      type: 'value',
      nameLocation: 'middle',
      nameTextStyle: {
        fontSize: 12,
        lineHeight: this.yAxis.length > 0 ? 100 : 60,
      },
      nameGap: 35,

      name: colNameItem.colName,
      axisLabel: {
        formatter: function(val) {
          // 百分比类型设置百分比展示
          if (colField.axisType === 'percent') {
            return val * 100 + '%'
          } else {
            return val
          }
        },
      },
    })
  }

  // xAxis 数据计算
  xAxisFn() {
    const { chartDefinition } = this.chartData
    /**
     * xAxis 数据配置
     */
    this.xAxis = {
      show: !this.chartTypes.includes('PieChart'),
      type: 'category',
      boundaryGap: !this.chartTypes.includes('FlowChart'),
      data: chartDefinition.rowFields.map(item => item.display),

      axisTick: {
        show: true,
      },
    }

    this.xAxis.axisLabel = {
      formatter: function(value) {
        if (value) {
          let isOverflow = false

          // 最多处理长度为10的名称，多余以...显示
          if (value.length > overflowNameLen) {
            isOverflow = true
            value = value.substr(0, overflowNameLen)
          }

          const labelAttr = value.split('')

          for (
            let index = splitXaxisNameLen;
            index < labelAttr.length;
            index += splitXaxisNameLen + 1
          ) {
            labelAttr.splice(index, 0, '\n')
          }
          return labelAttr.join('') + (isOverflow ? '...' : '')
        }
      },
    }
  }

  // dataZoom 计算
  dataZoomFn() {
    const { chartDefinition } = this.chartData
    const openDataZoom =
      chartDefinition.rowFields.length > splitXaxisNameLen &&
      !this.chartTypes.includes('PieChart')

    const startValue = this.getZoomStartValue()
    this.dataZoom = [
      {
        show: openDataZoom,
        startValue,
        endValue: startValue + splitXaxisNameLen - 1,
      },
    ]
  }

  // 生成options
  generateOptions() {
    const { chartDefinition } = this.chartData
    // 饼图不显示y轴
    if (this.chartTypes.includes('PieChart')) {
      this.yAxis = []
    }

    // 老版占比图，特殊处理
    this.chartTypes.includes('RatioChart') && (this.type = 'liquidFill')
    const openDataZoom =
      chartDefinition.rowFields.length > splitXaxisNameLen &&
      !this.chartTypes.includes('PieChart')
    const { tooltip, dataZoom, legendData, yAxis, series, xAxis } = this
    const isFlowChart = this.chartTypes.includes('FlowChart')
    const showLegend = legendData.length > 1

    // 计算grid right
    let right = 'auto'
    if (isFlowChart) {
      right = 22
    } else if (yAxis.length === 2) {
      right = 38
    } else if (openDataZoom) {
      right = 10
    }

    return {
      type: this.type,
      color: isFlowChart ? RequireFlowVolumeChartColors : defaultColors,
      tooltip,
      legend: {
        show: showLegend,
        data: legendData,
      },

      dataZoom,
      grid: {
        top: showLegend ? 55 : 24,
        // left: 38,
        left: 48,
        bottom: openDataZoom ? 24 : 0,
        right,
        containLabel: true,
      },

      // 流积图控制显示顺序
      series: isFlowChart ? series.reverse() : series,
      xAxis,
      yAxis,
    }
  }

  // TODO: 特殊需求：自动定位到图表有值区域 - 遍历 series data 找到第一项value大于0的横坐标索引作为dataZoom起始值
  getZoomStartValue() {
    // 每个series data列表中第一项value大于0的索引
    const dataIndexs = []
    this.series.forEach(({ data }) => {
      for (let i = 0; i < data.length; i++) {
        // 找第一项value大于0的索引
        if (data[i] > 0) {
          dataIndexs.push(i > 0 ? i - 1 : i)
          break
        }
      }
    })
    // 取最小值作为dataZoom起始值
    return dataIndexs.length ? Math.min(...dataIndexs) : 0
  }
}

export default {
  methods: {
    generateChartOptions(chartData) {
      return new ChartParse(chartData).options
    },
  },
}
