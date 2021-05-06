<template>
  <div>
    <el-dialog
      :title="$t('修改日期')"
      :visible.sync="dateshow1"
      width="600px"
      @close="dialogClose"
    >
      <div class="date-container">
        <div class="date-title">
          {{ $t('修改日期可以更好地比较每个阶段实际周期与计划周期的偏差') }}，{{
            $t('总结各阶段的进度问题')
          }}。{{ $t('实际周期会根据阶段的流转进行自动记录') }}，{{
            $t('也可以手动调整')
          }}。
        </div>
        <el-table
          :data="tableData"
          style="width: 100%;display: inline-block;"
          @cell-click="handleEaitClick"
        >
          <el-table-column prop="name" :label="$t('迭代阶段')" min-width="180">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
              <span v-if="scope.row.currentStageId" class="ui-tag-yellow">{{
                $t('当前')
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="startTimePlan"
            :label="$t('计划日期')"
            width="180"
          >
            <template slot-scope="scope">
              <el-date-picker
                v-model="scope.row.startTimePlan"
                style="border: none;"
                class="data-time-chice"
                prefix-icon="clean-icon"
                type="date"
                :placeholder="$t('未设置')"
              ></el-date-picker>
            </template>
          </el-table-column>
          <el-table-column
            prop="startTimeActual"
            :label="$t('实际日期')"
            width="180"
          >
            <template slot-scope="scope">
              <el-date-picker
                v-model="scope.row.startTimeActual"
                style="border: none;"
                class="data-time-chice"
                prefix-icon="clean-icon"
                type="date"
                :placeholder="$t('未设置')"
              ></el-date-picker>
            </template>
          </el-table-column>

          <!-- <el-table-column prop="id" label="计划日期" width="180">
            <el-table-column prop="startTimePlan" label="开始时间" width="180">
              <template slot-scope="scope">
                <el-date-picker
                  size="mini"
                  style="border: none;"
                  v-if="scope.row.name!=='已完成'"
                  v-model="scope.row.startTimePlan"
                  class="data-time-chice"
                  prefix-icon="clean-icon"
                  type="date"
                  placeholder="未设置"
                ></el-date-picker>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column prop="endTimePlan" label="结束时间" width="180">
              <template slot-scope="scope">
                <el-date-picker
                  v-if="scope.row.name!=='未开始'"
                  size="mini"
                  style="border: none;"
                  v-model="scope.row.endTimePlan"
                  class="data-time-chice"
                  prefix-icon="clean-icon"
                  type="date"
                  placeholder="未设置"
                ></el-date-picker>
                <span v-else>--</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column prop="id" label="实际日期" width="180">
            <el-table-column prop="startTimeActual" label="开始时间" width="180">
              <template slot-scope="scope">
                <el-date-picker
                  size="mini"
                  v-model="scope.row.startTimeActual"
                  style="border: none;"
                  v-if="scope.row.name!=='已完成'"
                  class="data-time-chice"
                  prefix-icon="clean-icon"
                  type="date"
                  placeholder="未设置"
                ></el-date-picker>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column prop="endTimeActual" label="结束时间" width="180">
              <template slot-scope="scope">
                <el-date-picker
                  size="mini"
                  style="border: none;"
                  v-model="scope.row.endTimeActual"
                  v-if="scope.row.name !=='未开始'"
                  class="data-time-chice"
                  prefix-icon="clean-icon"
                  type="date"
                  placeholder="未设置"
                ></el-date-picker>
                <span v-else>--</span>
              </template>
            </el-table-column>
          </el-table-column> -->
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancleBtn">{{ $t('取消') }}</el-button>
        <el-button
          v-show="
            $authFunction('FUNC_COOP_SPRINT_STAGE_TIME_UPDATE', 3, projectId)
          "
          type="primary"
          @click="confirmBtn"
          >{{ $t('确定') }}</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 迭代详情 - 日期修改
 * @desc
 * @author panhui | heyunjiang
 * @date
 */
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import sprintService from '@/service/sprint'

export default {
  name: 'SprintInfoDateModified',
  mixins: [ProjectCommonMixin],
  props: {
    dateshow: {
      type: [Boolean],
      default: null,
    },
  },

  data() {
    return {
      dateshow1: false, //弹窗显示
      projectId: this.$getUrlParams().projectId,
      tableData: [],
    }
  },
  computed: {},
  watch: {
    dateshow() {
      this.dateshow1 = this.dateshow
      this.dateshow && this.initList()
    },
  },
  mounted() {},

  created() {},
  methods: {
    initList() {
      sprintService
        .stageTimeInfoList({
          projectId: this.projectId,
          sprintId: this.$getUrlParams().sprintId,
        })
        .then(res => {
          if (res.status == 200) {
            res.data.stageTime.forEach(item => {
              if (item.stageId == res.data.currentStageId) {
                item.currentStageId = res.data.currentStageId
              }
            })
            this.tableData = res.data.stageTime
          } else {
            // this.$message({ message: '搜索需求/任务失败', type: 'error' });
          }
        })
    },
    handleEaitClick() {},
    confirmBtn() {
      // 必填数据校验
      const validObj = this.dataValidator()
      if (!validObj.valid) {
        this.$message({
          message: validObj.isPlan
            ? i18n.t('填写实际日期后，也必须填写计划日期')
            : i18n.t('必须保证阶段前的实际日期不能为空'),

          type: 'warning',
        })

        return false
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
      this.dateshow1 = false
      this.$emit('func', false)
      let obj = {}
      obj = {
        sprintId: this.$getUrlParams().sprintId,
        stageTimeList: this.tableData,
      }

      sprintService
        .stageTimeInfoUpdate(obj)
        .then(res => {
          if (res.status == 200) {
            this.$message({
              message: res.msg || i18n.t('修改成功'),
              type: 'success',
            })

            this.$emit('func', false)
          } else {
            // this.$message({ message: res.msg || '操作失败', type: 'error' });
          }
        })
        .catch()
    },
    // 日期必填数据校验
    dataValidator() {
      let exsitEmpty = false,
        valid = true,
        isPlan = false
      this.tableData.forEach(item => {
        if (!item.startTimeActual) {
          exsitEmpty = true
        } else if (item.startTimeActual && exsitEmpty) {
          valid = false
        }
        if (valid && item.startTimeActual && !item.startTimePlan) {
          isPlan = true
          valid = false
        }
      })
      return {
        valid,
        isPlan,
      }
    },
    // 日期顺序校验
    dateValid() {
      let planresult = true,
        actualresult = true
      const startTimePlanPoor = this.tableData.map(item => item.startTimePlan)
      const startTimeActualPoor = this.tableData.map(
        item => item.startTimeActual,
      )

      let lastPlan, lastActual
      for (let i = 0; i < startTimePlanPoor.length; i++) {
        if (startTimePlanPoor[i]) {
          if (lastPlan) {
            // 如果当前阶段晚于之前阶段
            const date1 = new Date(lastPlan + ' 00:00:00')
            const date2 = new Date(startTimePlanPoor[i] + ' 00:00:00')
            if (date1 > date2) {
              planresult = false
            }
          }
          // 如果当前阶段有值，则保存为最近一个待比较值
          lastPlan = startTimePlanPoor[i]
        }
        if (startTimeActualPoor[i]) {
          if (lastActual) {
            // 如果当前阶段晚于之前阶段
            const date1 = new Date(lastActual + ' 00:00:00')
            const date2 = new Date(startTimeActualPoor[i] + ' 00:00:00')
            if (date1 > date2) {
              actualresult = false
            }
          }
          // 如果当前阶段有值，则保存为最近一个待比较值
          lastActual = startTimeActualPoor[i]
        }
      }
      return { planresult, actualresult }
    },
    cancleBtn() {
      this.dateshow1 = false
      this.$emit('func', true)
    },
    dialogClose() {
      this.dateshow1 = false
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
  .date-title {
    border: 1px solid #eef0f6;
    border-left: 3px #409eff solid;
    padding: 5px 5px;
    margin-bottom: 5px;
  }
}

.ui-tag-yellow {
  color: #f0a100;
  border: 1px solid #f0a100;
  border-radius: 8px;
  padding: 1px 4px;
  font-size: 12px;
}
</style>
