<template>
  <div class="code-statistics">
    <h3 class="code-title">{{ $t('代码统计') }}</h3>
    <div class="graph">
      <div
        id="commitPerson"
        class="graph-commiter"
        :style="{ width: '46%', height: '330px' }"
      ></div>
      <div
        id="commitCode"
        class="graph-commit-code"
        :style="{ width: '46%', height: '330px' }"
      ></div>
    </div>

    <h3 class="code-title">{{ $t('最近代码提交') }}</h3>
    <div class="line"></div>
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
        title: {
          text: i18n.t('提交人分布'),
          left: 'center',
        },

        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },

        legend: {
          left: 'center',
          top: '25',
          data: this.commitUser,
        },

        series: [
          {
            name: i18n.t('提交数'),
            type: 'pie',
            radius: ['30%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center',
              },
            },

            hoverAnimation: false,
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
        title: {
          text: i18n.t('提交代码趋势'),
          left: 'center',
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
      border: 1px solid #e8e8e8;
    }

    .graph-commit-code {
      border: 1px solid #e8e8e8;
    }
  }
}

.line {
  width: 100%;
  height: 1px;
  border-bottom: 1px solid #ccc;
}
</style>
