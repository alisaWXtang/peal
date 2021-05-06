<template>
  <div class="page-progress-overview">
    <co-row class="overview-count">
      <co-col :span="8">
        <div style="margin-bottom: 32px;">
          <i class="co-icon-file overview-icon"></i>需求<span class="line"
            >|</span
          >总数<span class="count">{{ sprintInfo.totalRequires }}</span>
        </div>
        <div>
          <div class="circleBox">
            <co-progress
              type="circle"
              :percentage="sprintInfo.completionRequires"
              :width="115.6"
              :show-text="false"
              color="#3081F2"
            ></co-progress>
            <div class="circleCenter">
              <div style="font-size: 14px;">
                <div>
                  <span style="font-size: 22px;">{{
                    sprintInfo.completionRequires
                  }}</span
                  >%
                </div>
                <div style="color: #999999;line-height: 30px;">
                  <AnnotationTooltip icon="co-icon-question-solid">
                    <div slot="toolContent">
                      <p>需求完成率：已完成需求数/需求总数</p>
                    </div>
                    完成率
                  </AnnotationTooltip>
                </div>
              </div>
            </div>
          </div>
          <div class="countBox" style="">
            <div style="">
              <span style="float: left;margin-right: 40px;">
                <div class="text">已完成</div>
                <div class="number">{{ sprintInfo.completeRequires }}</div>
              </span>
              <span style="float: left;margin-right: 40px;">
                <div class="text">延期</div>
                <div
                  class="number click-item"
                  @click="checkDelayList('requirement')"
                >
                  {{ sprintInfo.completeDelayRequires }}
                </div>
              </span>
              <span style="float: left;">
                <div class="text">总工时</div>
                <div class="number">{{ sprintInfo.totalRequireHours }}h</div>
              </span>
            </div>
          </div>
        </div>
      </co-col>
      <co-col :span="10">
        <div style="margin-bottom: 32px;">
          <i class="co-icon-date overview-icon"></i>任务<span class="line"
            >|</span
          >总数<span class="count">{{ sprintInfo.totalTasks }}</span>
        </div>
        <div>
          <div class="circleBox">
            <co-progress
              type="circle"
              :percentage="sprintInfo.completionTasks"
              :width="115.6"
              :show-text="false"
              color="#007AFF"
            ></co-progress>
            <div class="circleCenter">
              <div style="font-size: 14px;">
                <div>
                  <span style="font-size: 22px;">{{
                    sprintInfo.completionTasks
                  }}</span
                  >%
                </div>
                <div style="color: #999999;line-height: 30px;">
                  <AnnotationTooltip icon="co-icon-question-solid">
                    <div slot="toolContent">
                      <p>
                        任务进度：已完成任务预计总工时/所有任务预计总工时
                      </p>
                    </div>
                    任务进度
                  </AnnotationTooltip>
                </div>
              </div>
            </div>
          </div>
          <div style="float: left;padding: 36px 0;">
            <div style="">
              <span style="float: left;margin-right: 40px;">
                <div class="text">已完成</div>
                <div class="number">{{ sprintInfo.completeTasks }}</div>
              </span>
              <span style="float: left;margin-right: 40px;">
                <div class="text">延期</div>
                <div class="number click-item" @click="checkDelayList('task')">
                  {{ sprintInfo.completeDelayTasks }}
                </div>
              </span>
              <span style="float: left;margin-right: 40px;">
                <div class="text">预计总工时</div>
                <div class="number">{{ sprintInfo.totalTaskHours }}h</div>
              </span>
              <span style="float: left;">
                <div class="text">完成工时</div>
                <div class="number">{{ sprintInfo.completeTaskHours }}h</div>
              </span>
            </div>
          </div>
        </div>
      </co-col>
      <co-col :span="6">
        <div style="margin-bottom: 32px;">
          <i class="co-icon-bug overview-icon"></i>缺陷<span class="line"
            >|</span
          >总数<span class="count">{{ sprintInfo.totalDefect }}</span>
        </div>
        <div>
          <div class="circleBox">
            <co-progress
              type="circle"
              :percentage="sprintInfo.completionDefect"
              :width="115.6"
              :show-text="false"
              color="#00C9C9"
            ></co-progress>
            <div class="circleCenter">
              <div style="font-size: 14px;">
                <div>
                  <span style="font-size: 22px;">{{
                    sprintInfo.completionDefect
                  }}</span
                  >%
                </div>
                <div style="color: #999999;line-height: 30px;">
                  <AnnotationTooltip icon="co-icon-question-solid">
                    <div slot="toolContent">
                      <p>缺陷解决率：已关闭缺陷数/缺陷总数</p>
                    </div>
                    解决率
                  </AnnotationTooltip>
                </div>
              </div>
            </div>
          </div>
          <div style="float: left;padding: 36px 0;">
            <div style="">
              <span style="float: left;margin-right: 40px;">
                <div class="text">已完成</div>
                <div class="number">{{ sprintInfo.closedDefect }}</div>
              </span>
              <span style="float: left;">
                <div class="text">未完成</div>
                <div class="number">
                  {{ sprintInfo.totalDefect - sprintInfo.closedDefect }}
                </div>
              </span>
            </div>
          </div>
        </div>
      </co-col>
    </co-row>
  </div>
</template>

<script>
import * as sprintService from '@/service/sprint'
import AnnotationTooltip from '@/components/annotation-tooltip'
export default {
  name: 'ProgressOverview',
  components: {
    AnnotationTooltip,
  },
  props: {
    // sprintInfo: {
    //   type: Object,
    //   required: true,
    //   desc: '迭代详情展示',
    // },
  },
  data() {
    return {
      sprintInfo: '',
      // customColor: '$--color-primary',
    }
  },
  created() {
    this.getSprintInfo()
  },
  methods: {
    // 点击延期数查看列表
    checkDelayList(key) {
      this.$emit('delayNumberClick', { type: key })
    },
    async getSprintInfo() {
      let params = {
        sprintId: this.$getUrlParams().sprintId,
      }
      await sprintService.getInfo(params).then(res => {
        this.sprintInfo = res.data
        this.setValue()
      })
    },
    roundValue(value, totalValue) {
      return Math.round((value / totalValue) * 1000) / 10
    },
    setValue() {
      if (this.sprintInfo.totalRequires !== 0) {
        this.sprintInfo.completionRequires = this.roundValue(
          this.sprintInfo.completeRequires,
          this.sprintInfo.totalRequires,
        )
        // this.sprintInfo.completionRequires = ((1 / 15) * 100).toFixed(1)
      } else {
        this.sprintInfo.completionRequires = 0
      }
      if (this.sprintInfo.totalTasks !== 0) {
        this.sprintInfo.completionTasks = this.roundValue(
          this.sprintInfo.completeTasks,
          this.sprintInfo.totalTasks,
        )
      } else {
        this.sprintInfo.completionTasks = 0
      }
      if (this.sprintInfo.totalDefect !== 0) {
        this.sprintInfo.completionDefect = this.roundValue(
          this.sprintInfo.closedDefect,
          this.sprintInfo.totalDefect,
        )
      } else {
        this.sprintInfo.completionDefect = 0
      }
    },
  },
}
</script>

<style scoped lang="scss">
.page-progress-overview {
  .overview-count {
    font-family: MicrosoftYaHei;
    font-size: 14px;
    color: #333333;
    .overview-icon {
      color: #999999;
      margin-right: 7.3px;
    }
    .circleBox {
      position: relative;
      text-align: center;
      width: 115.6px;
      float: left;
      padding-right: 20px;
    }
    .circleCenter {
      position: absolute;
      text-align: center;
      width: 115.6px;
      top: 32px;
      /*left: 22px;*/
    }
    .countBox {
      float: left;
      padding: 36px 0;
    }
    .line {
      margin: 0 12px;
      color: #e5e5e5;
    }
    .count {
      margin-left: 8px;
    }
    .text {
      font-family: OPPOSans-M;
      font-size: 12px;
      color: #666666;
      margin-bottom: 8px;
    }
    .number {
      font-family: ArialMT;
      font-size: 20px;
      color: #333333;
    }
    .click-item {
      cursor: pointer;
      &:hover {
        color: $--color-primary;
      }
    }
  }
}
</style>
