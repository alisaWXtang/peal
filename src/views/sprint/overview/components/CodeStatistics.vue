<template>
  <div class="code-statistics">
    <div id="graph" class="graph">
      <div class="graph-commiter">
        <div class="map-title">
          <i class="iconfont icon-tijiaorenyuanfenbu" />提交人分布
        </div>
        <div
          id="commitPerson"
          :style="{ width: '100%', height: '330px' }"
        ></div>
      </div>
      <div class="graph-commit-code">
        <div class="map-title">
          <i class="iconfont icon-tijiaodaimaqushi" />提交代码趋势
        </div>
        <div id="commitCode" :style="{ width: '100%', height: '330px' }"></div>
      </div>
    </div>

    <div class="map-title">
      <i class="iconfont icon-zuijindaimatijiao" />最近代码提交
    </div>
    <!--    <h3 class="code-title">{{ $t('最近代码提交') }}</h3>-->
    <!--    <div class="line"></div>-->
    <submit-recod
      :value="listdata"
      :load-more-callback="CodeLoadmoreCallback"
      :is-more="codePageInfo.isMore"
    >
    </submit-recod>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 迭代详情
 * @desc
 * @author chenxuecheng
 * @date
 */
import SubmitRecod from '@/components/submit-recod'
import { sprintCodeAssociation } from '@/service/code'

var echarts = require('echarts')

export default {
  name: 'CodeStatistics',
  components: { SubmitRecod },
  mixins: [],
  props: {},

  data() {
    return {
      list_data: '',
      listdata: [],
      commitUser: [],
      commitUserData: [],
      commitCodeData: {
        codeXAxis: [],
        codeYAxis: [],
      },

      codePageInfo: {
        pageNum: 1,
        pageSize: 5,
        isMore: false,
      },
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.getSprintCodeAssociation()
  },
  methods: {
    CodeLoadmoreCallback() {
      this.codePageInfo.pageNum = this.codePageInfo.pageNum + 1
      this.getSprintCodeAssociation()
    },
    //获取迭代代码关联
    getSprintCodeAssociation() {
      let sprintId = this.$getUrlParams().sprintId
      let projectId = this.$getUrlParams().projectId
      let params = {
        sprintId,
        projectId,
        pageNum: this.codePageInfo.pageNum,
        pageSize: this.codePageInfo.pageSize,
      }

      // this.listdata.length = 0;
      this.commitUser.length = 0
      this.commitUserData.length = 0
      this.commitCodeData.codeXAxis.length = 0
      this.commitCodeData.codeYAxis.length = 0
      sprintCodeAssociation(params).then(res => {
        // console.log(res.data)
        this.codePageInfo.isMore =
          res.data.gitCommits.total >
          this.codePageInfo.pageNum * this.codePageInfo.pageSize
        if (res.data.gitCommits.pageNum === 1) {
          this.listdata = res.data.gitCommits.list
        } else {
          this.listdata = [...this.listdata, ...res.data.gitCommits.list]
          return
        }
        this.$nextTick(() => {
          for (
            let i = 0;
            i < res.data.gitCommitStatistics.commitUserStatistics.length;
            i++
          ) {
            this.commitUser.push(
              res.data.gitCommitStatistics.commitUserStatistics[i]
                .commitUserName,
            )
          }
          this.commitUserData = res.data.gitCommitStatistics.commitUserStatistics.map(
            item => {
              return {
                value: item.commitCount,
                name: item.commitUserName,
              }
            },
          )

          res.data.gitCommitStatistics.commitDateStatistics.map(item => {
            this.commitCodeData.codeXAxis.push(item.commitDate)
            this.commitCodeData.codeYAxis.push(item.commitCount)
          })
          this.drawCommitPerson()
          this.drawCommitCode()
        })
      })
    },
    //提交人分布图形构建
    drawCommitPerson() {
      let commitPerson = echarts.init(document.getElementById('commitPerson'))

      commitPerson.setOption({
        // title: {
        //   text: i18n.t('提交人分布'),
        //   left: 'center',
        // },
        color: [
          '#2DC84D',
          '#00C9C9',
          '#007AFF',
          '#FFCB1B',
          '#FF722E',
          '#EA3447',
          '#8A48F9',
        ],
        grid: {
          top: 30, //生成的图片和顶部的间距
          left: 5,
          containLabel: true, //为ture才会生效
        },

        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },

        legend: {
          // left: 'center',
          // left: 'right',
          top: '50',
          right: 100,
          width: 100,
          // data: this.commitUser,
          data: this.commitUser,
        },

        series: [
          {
            name: i18n.t('提交数'),
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['36%', '50%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center',
              },
            },

            hoverAnimation: true,
            labelLine: {
              normal: {
                show: false,
              },
            },

            data: this.commitUserData,
          },
        ],
      })
    },
    //提交代码趋势构建
    drawCommitCode() {
      let commitCode = echarts.init(document.getElementById('commitCode'))

      // 绘制图表
      commitCode.setOption({
        color: ['#3398DB'],
        // title: {
        //   text: i18n.t('提交代码趋势'),
        //   left: 'center',
        // },
        grid: {
          top: 30, //生成的图片和顶部的间距
          left: 5,
          containLabel: true, //为ture才会生效
        },

        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: ['rgb(255, 255, 255, 0)'],
            },
          },
        },

        xAxis: {
          data: this.commitCodeData.codeXAxis,
        },

        yAxis: {},
        series: [
          {
            name: i18n.t('提交数'),
            type: 'bar',
            barMaxWidth: 34,
            data: this.commitCodeData.codeYAxis,
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
  },
}
</script>
<style lang="scss" scoped>
.code-statistics {
  /*width: 100%;*/
  /*height: 100%;*/
  .code-title {
    color: #4a4a4a;
    height: 20px;
    line-height: 20px;
    margin-top: 0;
  }

  .graph {
    width: 100%;
    display: flex;
    justify-content: space-between;
    height: 400px;

    .graph-commiter {
      /*border: 1px solid #e8e8e8;*/
      width: 50%;
      & > div {
        width: 100%;
      }
    }

    .graph-commit-code {
      width: 50%;
      /*border: 1px solid #e8e8e8;*/
    }
  }
  .map-title {
    font-family: MicrosoftYaHei;
    font-size: 16px;
    color: #333333;
    /*margin-top: 20px;*/
    /*margin-left: 30px;*/
    .iconfont {
      margin-right: 5px;
      color: $--color-primary;
      font-size: 24px;
      vertical-align: middle;
    }
  }
}

.line {
  width: 100%;
  height: 1px;
  border-bottom: 1px solid #ccc;
}
</style>
