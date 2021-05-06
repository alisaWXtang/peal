<template>
  <div>
    <el-dialog
      :title="$t('修改阶段')"
      :visible.sync="progressTabShow"
      width="450px"
      @close="dialogClose"
    >
      <!-- <div class="date-container" v-if="this.progressTab.data.isCurrentStage">当前迭代正处于该阶段，无需变更。</div> -->
      <div class="date-container">
        <div
          v-for="(item, index) in stagelistshow"
          :key="index"
          class="stagetime-item"
        >
          <div class="stagetime-item-left">
            <span
              class="data-icon"
              :class="{ 'data-icon-yellow': true, 'data-icon-blue': false }"
              :title="item.stageName"
              >{{ item.stageName }}</span
            >
            <div class="data-timetext">{{ $t('计划时间') }}</div>
            <div class="data-time">
              <custom-date
                v-model="item.startTimePlan"
                class="data-time-chice1"
              ></custom-date>
            </div>
          </div>
          <div class="stagetime-item-right">
            <span
              class="data-icon"
              :class="{ 'data-icon-yellow': true, 'data-icon-blue': false }"
              :title="item.stageName"
              >{{ item.stageName }}</span
            >
            <div class="data-timetext">{{ $t('实际时间') }}</div>
            <div class="data-time">
              <custom-date
                v-model="item.startTimeActual"
                class="data-time-chice1"
              ></custom-date>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancleBtn">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="confirmBtn">{{
          $t('确定')
        }}</el-button>
        <!-- <el-button type="primary" v-else disabled="true">确 定</el-button> -->
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 迭代阶段-计划时间、实际时间修改
 * @desc 列出当前及之前未设置的阶段，计划时间和实际时间都列出来
 * @author panhui、heyunjiang
 * @date
 */
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import { currentStageUpdate } from '@/service/sprint'

export default {
  name: 'SprintInfoDateModified',
  mixins: [ProjectCommonMixin],
  props: {
    progressTab: {
      type: [Object],
      default: null,
    },
  },

  data() {
    return {
      progressTabShow: false, //弹窗显示
      projectId: this.$getUrlParams().projectId,
      stagelist: [], // 需要展示填写数据的 stage 列表
      endIndex: 0,
    }
  },
  computed: {
    currentTime() {
      let myDate = new Date()
      let month = myDate.getMonth() + 1
      return myDate.getFullYear() + '-' + month + '-' + myDate.getDate()
    },
    stagelistshow() {
      return this.stagelist.filter(item => item.show)
    },
  },

  watch: {
    progressTab() {
      this.progressTabShow = this.progressTab.show
      if (this.progressTab.show) {
        const currentIndex = this.progressTab.list.findIndex(
          item => item.stageInfo.name === this.progressTab.data.stageInfo.name,
        )
        this.endIndex = currentIndex
        this.stagelist = this.progressTab.list.map((item, index) => {
          let obj = {
            stageName: item.stageInfo.name,
            sprintId: item.stageInfo.sprintId,
            stageId: item.stageInfo.stageId,
            startTimePlan: item.stageInfo.startTimePlan || this.currentTime,
            startTimeActual: item.stageInfo.startTimeActual || this.currentTime,
            show: false,
          }

          // 只展示自己及自己之前未填写的阶段
          if (
            ((!item.stageInfo.startTimePlan ||
              !item.stageInfo.startTimeActual) &&
              index < currentIndex) ||
            index === currentIndex
          ) {
            obj.show = true
          }
          return obj
        })
      }
    },
  },
  mounted() {},

  created() {},
  methods: {
    // 日期顺序校验
    dateValid() {
      let planresult = true,
        actualresult = true
      let lastPlan, lastActual
      for (let i = 0; i < this.stagelist.length; i++) {
        const currentPlan = this.stagelist[i].startTimePlan
        const currentActual = this.stagelist[i].startTimeActual
        if (currentPlan) {
          if (lastPlan) {
            // 如果当前阶段晚于之前阶段
            const date1 = new Date(lastPlan + ' 00:00:00')
            const date2 = new Date(currentPlan + ' 00:00:00')
            if (date1 > date2) {
              planresult = false
            }
          }
          // 如果当前阶段有值，则保存为最近一个待比较值
          lastPlan = currentPlan
        }
        if (currentActual) {
          if (lastActual) {
            // 如果当前阶段晚于之前阶段
            const date1 = new Date(lastActual + ' 00:00:00')
            const date2 = new Date(currentActual + ' 00:00:00')
            if (date1 > date2) {
              actualresult = false
            }
          }
          // 如果当前阶段有值，则保存为最近一个待比较值
          lastActual = currentActual
        }
      }
      return { planresult, actualresult }
    },
    // 点击确定
    confirmBtn() {
      let obj = {}
      obj = {
        sprintId: this.$getUrlParams().sprintId,
        projectId: this.projectId,
        stageTimeList: this.stagelistshow,
      }

      const validResult = this.dateValid()
      if (!validResult.planresult || !validResult.actualresult) {
        this.$message({
          message: !validResult.planresult
            ? i18n.t('后一阶段的计划时间必须晚于前一阶段的计划时间')
            : i18n.t('后一阶段的实际时间必须晚于前一阶段的实际时间'),
          type: 'warning',
        })

        return false
      }
      currentStageUpdate(obj).then(res => {
        if (res.status == 200) {
          this.progressTabShow = false
          this.$message({
            message: res.msg || i18n.t('修改成功'),
            type: 'success',
          })
          this.$emit('func', false)
        } else {
          // this.$message({ message: res.msg || '修改失败', type: 'error' });
        }
      })
    },
    cancleBtn() {
      this.progressTabShow = false
      this.$emit('func', true)
    },
    dialogClose() {
      this.progressTabShow = false
      this.$emit('func', true)
    },
  },
}
</script>
<style lang="scss" scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: inline-block;
}

.date-container {
  margin: 0 10%;

  .stagetime-item {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    padding-top: 10px;

    .stagetime-item-left {
      text-align: center;
      min-width: 150px;
    }

    .stagetime-item-right {
      text-align: center;
      min-width: 150px;
    }
  }

  .data-icon {
    border-radius: 20px;
    padding: 0 8px;
    max-width: 165px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: inline-block;
  }

  .data-icon-yellow {
    border: 1px solid #f0a100;
    color: #f0a100;
  }

  .data-icon-green {
    border: 1px solid #24b47e;
    color: #24b47e;
  }

  .data-icon-blue {
    border: 1px solid #338fe5;
    color: #338fe5;
  }

  .data-timetext {
    margin: 10px 0;
  }

  .data-time {
    .data-time-chice1 {
      width: 100px;
      border-radius: 5px;
    }
  }
}
</style>
