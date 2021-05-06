<template>
  <div>
    <div
      class="scrollbal-common sprint-detail-table-scroll progress-speed"
      :class="{ 'no-all-height': !allHeight }"
    >
      <div style="width: 50%; float:left">
        <div class="map-title" style="margin-top: 0;">
          <i class="iconfont icon-xuqiuzhuangtaifenbutu1" />需求状态分布图
        </div>
        <div
          id="requieStatusChart"
          :style="{ width: '100%', height: '300px' }"
        ></div>
        <div class="map-title">
          <i class="iconfont icon-renwuzhuangtaifenbutu" />任务状态分布图
        </div>
        <div
          id="taskStatusChart"
          :style="{ width: '100%', height: '300px' }"
        ></div>
        <div ref="bugTrendChartTitle" class="map-title">
          <i class="iconfont icon-quexianqushitu" />缺陷趋势图
        </div>
        <div
          id="bugTrendChart"
          :style="{ width: '100%', height: '300px' }"
        ></div>
      </div>
      <div style="width: 50%; float:right">
        <div ref="firstGuideDom" class="map-title" style="margin-top: 0;">
          <i class="iconfont icon-xuqiushuliangranjintu1" />需求数量燃尽图
        </div>
        <div
          id="reqNumBurnDownChart"
          :style="{ width: '100%', height: '300px' }"
        ></div>
        <div class="map-title">
          <i class="iconfont icon-renwugongshiranjintu" />任务工时燃尽图
        </div>
        <div
          id="taskHourBurnDownChart"
          :style="{ width: '100%', height: '300px' }"
        ></div>
        <div ref="thirdGuideDom" class="map-title">
          <i class="iconfont icon-renwushuliangranjintu" />任务数量燃尽图
        </div>
        <div
          id="taskNumBurnDownChart"
          :style="{ width: '100%', height: '300px' }"
        ></div>
      </div>
    </div>
    <div class="footer-box">
      <span v-if="!allHeight" ref="secondGuideDom" @click="allHeight = true">
        展开全部<i
          class="el-icon-d-arrow-left"
          style="transform: rotate(-90deg);"
        />
      </span>
      <span v-if="allHeight" @click="allHeight = false">
        收起<i
          class="el-icon-d-arrow-left"
          style="transform: rotate(-270deg);"
        />
      </span>
    </div>
  </div>
</template>

<script>
var echarts = require('echarts')
import { i18n } from '@/i18n'
import * as sprintService from '@/service/sprint'
import { guide } from '@/store/mutation-types'
import { guideStep, guideType } from '@/components/guide/guideData'
export default {
  name: 'ProgressMap',
  data() {
    return {
      allHeight: false,
      requireStatusDistributeChartData: {
        reqXAxis: [],
        reqYAxis: [],
      },

      taskStatusDistributeChartData: {
        taskXAxis: [],
        taskYAxis: [],
      },

      bugTrendChartData: {
        bugXAxis: [],
        bugY1Axis: [],
        bugY2Axis: [],
        bugY3Axis: [],
      },

      taskHourBurnDownChartData: {
        xAxis: [],
        taskY1Axis: [],
        taskY2Axis: [],
      },

      taskNumBurnDownChartData: {
        xAxis: [],
        taskNumY1Axis: [],
        taskNumY2Axis: [],
      },

      reqNumBurnDownChartData: {
        xAxis: [],
        reqY1Axis: [],
        reqY2Axis: [],
      },
    }
  },
  created() {
    this.sprintId = this.$getUrlParams().sprintId
    this.projectId = this.$getUrlParams().projectId
    this.getStatusDistributeInfo()
    this.getBurnDownInfo()
  },
  mounted() {
    this.$bus.$on('G_sprintBurnOut', this.initGuide)
    this.$bus.$on('G_bugTrack', this.bugTrack)
  },
  beforeDestroy() {
    this.$bus.$off('G_sprintBurnOut', this.initGuide)
    this.$bus.$off('G_bugTrack', this.bugTrack)
  },
  methods: {
    bugTrack() {
      let _this = this
      this.allHeight = true
      this.$nextTick(() => {
        this.$bus.$emit('G_sprintScroll', this.$refs.bugTrendChartTitle)
        setTimeout(() => {
          this.$store.commit(guide.RECOVERY_STEP)
          this.$store.commit(guide.START_GUIDE, {
            guideType: guideType.bug,
            guideStep: guideStep.bugTrack,
            step: 1,
            steps: {
              1: {
                dom: this.$refs.bugTrendChartTitle,
                nextCallback() {
                  // 下一步
                  _this.$router.push({
                    path: '/statement/list',
                    query: {
                      projectId: _this.$getUrlParams().projectId,
                      guideType: guideType.bug,
                    },
                  })
                },
                prevCallback() {
                  if (
                    !_this.$authFunction(
                      'FUNC_COOP_DEFECT_CREATE',
                      3,
                      _this.$getUrlParams().projectId,
                    )
                  ) {
                    _this.$store.commit(guide.STEP_WARN, {
                      warnMessage:
                        '你没有创建缺陷权限，请在设置中添加权限，再继续浏览此步指引',
                      guideStep: guideStep.bugCreate,
                    })
                    return
                  }
                  // 上一步
                  _this.$store.commit(guide.UPDATE_STEP_INDEX, 5)
                  _this.$router.push({
                    path: '/bug/list',
                    query: {
                      guideType: guideType.bug,
                      projectId: _this.$getUrlParams().projectId,
                      // stepIndex: 5,
                    },
                  })
                },
              },
            },
          })
          setTimeout(() => {
            this.$store.commit(guide.UPDATE_GUIDE_STEP, guideStep.bugTrack)
            this.$store.commit(guide.UPDATE_STEP_VISIBLE, true)
          }, 50)
        }, 50)
      })
    },
    initGuide() {
      let _this = this
      this.allHeight = false
      this.$store.commit(guide.START_GUIDE, {
        guideType: guideType.sprintProgress,
        guideStep: guideStep.sprintBurnOut,
        step: 1,
        steps: {
          1: {
            dom: this.$refs.firstGuideDom,
            prevCallback() {
              // 上一步
              _this.$emit('sprintBurnPrev')
            },
          },
          2: {
            dom: this.$refs.secondGuideDom,
            prevCallback() {
              _this.$bus.$emit('G_sprintScroll', _this.$refs.firstGuideDom)
              return true
            },
            nextCallback() {
              _this.allHeight = true
              _this.$bus.$emit('G_sprintScroll', _this.$refs.thirdGuideDom)
              return true
            },
          },
          3: {
            dom: this.$refs.thirdGuideDom,
            prevCallback() {
              _this.allHeight = false
              return true
            },
            nextCallback() {
              // 模块最后一步，统一由guideStep组件处理
            },
          },
        },
      })
    },
    getStatusDistributeInfo() {
      let params = {
        projectId: this.projectId,
        sprintId: this.sprintId,
      }

      sprintService.getStatusDistribute(params).then(res => {
        const {
          reqXAxis,
          reqYAxis,
          taskXAxis,
          taskYAxis,
          defectXAxis,
          defectY1Axis,
          defectY2Axis,
          defectY3Axis,
        } = res.data
        const {
          requireStatusDistributeChartData,
          bugTrendChartData,
          taskStatusDistributeChartData,
        } = this
        requireStatusDistributeChartData.reqXAxis = reqXAxis
        requireStatusDistributeChartData.reqYAxis = reqYAxis

        taskStatusDistributeChartData.taskXAxis = taskXAxis
        taskStatusDistributeChartData.taskYAxis = taskYAxis

        bugTrendChartData.bugXAxis = defectXAxis
        bugTrendChartData.bugY1Axis = defectY1Axis
        bugTrendChartData.bugY2Axis = defectY2Axis.map(i => -i)
        bugTrendChartData.bugY3Axis = defectY3Axis

        this.drawRequieStatusChart()
        this.drawTaskStatusChart()
        this.drawBugTrendChart()
      })
    },
    getBurnDownInfo() {
      let params = {
        projectId: this.projectId,
        sprintId: this.sprintId,
      }

      sprintService.getBurnDown(params).then(res => {
        const {
          xaxis,
          reqY1Axis,
          reqY2Axis,
          taskY1Axis,
          taskY2Axis,
          taskNumY1Axis,
          taskNumY2Axis,
        } = res.data
        const {
          taskHourBurnDownChartData,
          taskNumBurnDownChartData,
          reqNumBurnDownChartData,
        } = this
        taskHourBurnDownChartData.xAxis = xaxis
        taskNumBurnDownChartData.xAxis = xaxis
        reqNumBurnDownChartData.xAxis = xaxis
        reqNumBurnDownChartData.reqY1Axis = reqY1Axis
        reqNumBurnDownChartData.reqY2Axis = reqY2Axis
        taskHourBurnDownChartData.taskY1Axis = taskY1Axis
        taskHourBurnDownChartData.taskY2Axis = taskY2Axis
        taskNumBurnDownChartData.taskNumY1Axis = taskNumY1Axis
        taskNumBurnDownChartData.taskNumY2Axis = taskNumY2Axis

        this.drawBurnDownChart()
      })
    },
    drawBurnDownChart() {
      let taskHourBurnDownChart = echarts.init(
        document.getElementById('taskHourBurnDownChart'),
      )

      taskHourBurnDownChart.setOption({
        // title: {
        //   text: i18n.t('任务工时燃尽图'),
        //   left: '30',
        //   top: '20',
        // },
        grid: {
          top: 30, //生成的图片和顶部的间距
          left: 5,
          containLabel: true, //为ture才会生效
        },

        tooltip: {
          trigger: 'axis',
          formatter: '{a} <br/>{b} : {c}',
        },

        xAxis: {
          type: 'category',
          // name: 'x',
          boundaryGap: false,
          splitLine: { show: false },
          data: this.taskHourBurnDownChartData.xAxis,
        },

        yAxis: {},
        legend: {
          left: 'center',
          bottom: 20,
          data: [i18n.t('未完成任务工时'), i18n.t('任务工时基准线')],
          type: 'scroll',
        },

        series: [
          {
            name: i18n.t('未完成任务工时'),
            type: 'line',
            // symbol: 'circle',
            // symbolSize: 7,
            lineStyle: {
              color: '#6FB5FF',
            },
            color: ['#6FB5FF'],
            itemStyle: {
              normal: {
                areaStyle: { type: 'default' },
                // normal: { label: { show: false } },
                // color: 'rgba(144,197,237,0.8)',
                color: 'rgba(111,181,255,0.5)',
                borderColor: '#6FB5FF', //拐点边框颜色
              },
            },

            data: this.taskHourBurnDownChartData.taskY1Axis,
          },

          {
            name: i18n.t('任务工时基准线'),
            type: 'line',
            // symbol: 'circle',
            // symbolSize: 7,
            lineStyle: {
              // color: 'gray',
              color: '#FFCB1B',
            },
            color: ['#FFCB1B'],

            itemStyle: {
              normal: { label: { show: false } },
            },

            data: this.taskHourBurnDownChartData.taskY2Axis,
          },
        ],
      })

      let taskNumBurnDownChart = echarts.init(
        document.getElementById('taskNumBurnDownChart'),
      )

      taskNumBurnDownChart.setOption({
        // title: {
        //   text: i18n.t('任务数量燃尽图'),
        //   left: '30',
        //   top: '20',
        // },
        grid: {
          top: 30, //生成的图片和顶部的间距
          left: 5,
          containLabel: true, //为ture才会生效
        },

        tooltip: {
          trigger: 'axis',
          //formatter: "{a} <br/>{b} : {c}"
        },
        xAxis: {
          type: 'category',
          // name: 'x',
          boundaryGap: false,
          splitLine: { show: false },
          data: this.taskNumBurnDownChartData.xAxis,
        },

        yAxis: {},
        legend: {
          left: 'center',
          bottom: 20,
          data: [i18n.t('未完成任务数量'), i18n.t('任务数量基准线')],
          type: 'scroll',
        },

        series: [
          {
            name: i18n.t('未完成任务数量'),
            type: 'line',
            itemStyle: {
              normal: {
                areaStyle: { type: 'default' },
                // normal: { label: { show: false } },
                // color: 'rgba(144,197,237,0.8)',
                color: 'rgba(111,181,255,0.5)',
                borderColor: '#6FB5FF', //拐点边框颜色
              },
            },
            // symbol: 'circle',
            // symbolSize: 7,
            lineStyle: {
              color: '#6FB5FF',
            },
            color: ['#6FB5FF'],

            data: this.taskNumBurnDownChartData.taskNumY1Axis,
          },

          {
            name: i18n.t('任务数量基准线'),
            type: 'line',
            // symbol: 'circle',
            // symbolSize: 7,
            lineStyle: {
              // color: 'gray',
              color: '#FFCB1B',
            },
            color: ['#FFCB1B'],

            itemStyle: {
              normal: { label: { show: false } },
            },

            data: this.taskNumBurnDownChartData.taskNumY2Axis,
          },
        ],
      })

      let reqNumBurnDownChart = echarts.init(
        document.getElementById('reqNumBurnDownChart'),
      )

      reqNumBurnDownChart.setOption({
        // title: {
        //   text: i18n.t('需求数量燃尽图'),
        //   left: '30',
        //   top: '20',
        // },
        grid: {
          top: 30, //生成的图片和顶部的间距
          left: 5,
          containLabel: true, //为ture才会生效
        },

        tooltip: {
          trigger: 'axis',
          formatter: '{a} <br/>{b} : {c}',
        },

        xAxis: {
          type: 'category',
          // name: 'x',
          boundaryGap: false,
          splitLine: { show: false },
          data: this.reqNumBurnDownChartData.xAxis,
        },

        yAxis: {},
        legend: {
          left: 'center',
          bottom: 20,
          data: [i18n.t('未完成需求数量'), i18n.t('需求数量基准线')],
          type: 'scroll',
        },

        series: [
          {
            name: i18n.t('未完成需求数量'),
            type: 'line',
            // symbol: 'circle',
            // symbolSize: 7,
            lineStyle: {
              color: '#6FB5FF',
            },
            color: ['#6FB5FF'],
            data: this.reqNumBurnDownChartData.reqY1Axis,
            itemStyle: {
              normal: {
                areaStyle: { type: 'default' },
                // normal: { label: { show: false } },
                // color: 'rgba(144,197,237,0.8)',
                color: 'rgba(111,181,255,0.5)',
                borderColor: '#6FB5FF', //拐点边框颜色
              },
            },
          },

          {
            name: i18n.t('需求数量基准线'),
            type: 'line',
            // symbol: 'circle',
            // symbolSize: 7,
            lineStyle: {
              // color: 'gray',
              color: '#FFCB1B',
            },
            color: ['#FFCB1B'],
            itemStyle: {
              normal: { label: { show: false } },
            },

            data: this.reqNumBurnDownChartData.reqY2Axis,
          },
        ],
      })
    },
    drawRequieStatusChart() {
      // 基于准备好的dom，初始化echarts实例
      let requieStatusChart = echarts.init(
        document.getElementById('requieStatusChart'),
      )

      // 绘制图表
      requieStatusChart.setOption({
        color: ['#14C781'],
        // title: {
        //   text: i18n.t('需求状态分布图'),
        //   left: '30',
        //   top: '20',
        // },
        grid: {
          top: 30, //生成的图片和顶部的间距
          left: 5,
          containLabel: true, //为ture才会生效
        },

        legend: {
          left: 'center',
          bottom: 20,
          data: [i18n.t('需求')],
          type: 'scroll',
        },

        tooltip: {},
        xAxis: {
          data: this.requireStatusDistributeChartData.reqXAxis,
          axisLabel: {
            showMaxLabel: true,
            rotate: 40,
            interval: 0,
          },
        },

        yAxis: {},
        series: [
          {
            //name: '需求',
            type: 'bar',
            barMaxWidth: 34,
            data: this.requireStatusDistributeChartData.reqYAxis,
            label: {
              normal: {
                show: false,
                position: 'inside',
              },
            },
          },
        ],
      })
    },
    drawTaskStatusChart() {
      // 基于准备好的dom，初始化echarts实例
      let taskStatusChart = echarts.init(
        document.getElementById('taskStatusChart'),
      )

      // 绘制图表
      taskStatusChart.setOption({
        color: ['#14C781'],
        // title: {
        //   text: i18n.t('任务状态分布图'),
        //   left: '30',
        //   top: '20',
        // },
        grid: {
          top: 30, //生成的图片和顶部的间距
          left: 5,
          containLabel: true, //为ture才会生效
        },

        legend: {
          left: 'center',
          bottom: 20,
          data: [i18n.t('任务')],
          type: 'scroll',
        },

        tooltip: {},
        xAxis: {
          data: this.taskStatusDistributeChartData.taskXAxis,
          axisLabel: {
            showMaxLabel: true,
            rotate: 40,
            interval: 0,
          },
        },

        yAxis: {},
        series: [
          {
            //name: '任务',
            type: 'bar',
            barMaxWidth: 34,
            data: this.taskStatusDistributeChartData.taskYAxis,
            label: {
              normal: {
                show: false,
                position: 'inside',
              },
            },
          },
        ],
      })
    },
    drawBugTrendChart() {
      // 基于准备好的dom，初始化echarts实例
      let bugTrendChart = echarts.init(document.getElementById('bugTrendChart'))

      // 绘制图表
      bugTrendChart.setOption({
        color: ['#14C781'],
        // title: {
        //   text: i18n.t('缺陷趋势图'),
        //   left: '30',
        //   top: '20',
        // },
        grid: {
          top: 30, //生成的图片和顶部的间距
          left: 5,
          containLabel: true, //为ture才会生效
        },

        legend: {
          left: 'center',
          bottom: 20,
          data: [
            i18n.t('新建缺陷数'),
            i18n.t('关闭缺陷数'),
            i18n.t('存量缺陷数'),
          ],
          type: 'scroll',
        },

        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            crossStyle: {
              color: '#999',
            },
          },

          formatter: function(datas) {
            let res = datas[0].name + '<br/>'
            for (let i = 0, length = datas.length; i < length; i++) {
              res +=
                datas[i].marker +
                datas[i].seriesName +
                '：' +
                Math.abs(datas[i].value) +
                '<br/>'
            }
            return res
          },
        },

        xAxis: {
          type: 'category',
          boundaryGap: false,
          splitLine: { show: false },
          data: this.bugTrendChartData.bugXAxis,
        },

        yAxis: {
          minInterval: 1,
        },

        series: [
          {
            name: i18n.t('新建缺陷数'),
            type: 'bar',
            barMaxWidth: 20,
            data: this.bugTrendChartData.bugY1Axis,
            stack: 'all',
            color: '#ed4f60',
          },

          {
            name: i18n.t('关闭缺陷数'),
            type: 'bar',
            barMaxWidth: 20,
            data: this.bugTrendChartData.bugY2Axis,
            stack: 'all',
            color: '#06a025',
          },

          {
            name: i18n.t('存量缺陷数'),
            type: 'line',
            smooth: true,
            data: this.bugTrendChartData.bugY3Axis,
            color: '#ff874d',
          },
        ],
      })
    },
  },
}
</script>

<style scoped lang="scss">
.no-all-height {
  height: 310px;
  overflow: hidden;
}
.map-title {
  font-family: MicrosoftYaHei;
  font-size: 16px;
  color: #333333;
  margin-top: 20px;
  /*margin-left: 30px;*/
  .iconfont {
    margin-right: 5px;
    font-size: 24px;
    vertical-align: middle;
    color: $--color-primary;
  }
}
.footer-box {
  text-align: center;
  & > span {
    cursor: pointer;
  }
}
</style>
