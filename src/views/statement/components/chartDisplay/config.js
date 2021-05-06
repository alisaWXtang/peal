/**
 * @title chart配置参数
 * @author chenxiaolong
 * @date 2020.10.17
 */

const defaultOptions = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'none',
    },
    confine: false,

    formatter: function(params) {
      let htmlStr = ''
      Array.isArray(params) &&
        params.forEach(item => {
          if (item.value && item.value !== '0') {
            htmlStr += `${item.marker}${item.seriesName}：${Math.abs(
              item.value,
            )} </br>`
          }
        })

      return htmlStr ? params[0]?.axisValue + '<br>' + htmlStr : htmlStr
    },
  },

  dataZoom: [
    {
      handleIcon:
        'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      handleSize: '100%',
      showDetail: false,
      handleStyle: {
        color: '#fff',
        shadowBlur: 3,
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
      },
      minValueSpan: 1,
      height: 14,
      bottom: 0,
    },
  ],

  legend: {
    type: 'scroll',
    top: 0,
    right: 0,
  },

  xAxis: {
    boundaryGap: true,
    axisLabel: {
      interval: 'auto',
    },

    axisTick: {
      alignWithLabel: true,
    },
  },
}

// 老版占比图配置
const defaultLiquidFillOptions = {
  series: {
    type: 'liquidFill',
    cursor: 'default',
    data: [0],
    outline: {
      borderDistance: 0,
      itemStyle: {
        borderWidth: 3,
        borderColor: '#156ACF',
        shadowBlur: 20,
      },
    },

    label: {
      normal: {
        textStyle: {
          color: 'red',
          insideColor: 'yellow',
          fontSize: 40,
        },
      },
    },
  },
}

export { defaultOptions, defaultLiquidFillOptions }
