<template>
  <div>
    <div class="progress-time">
      <div>
        <div
          class="sprint-header"
          :class="{ 'sprint-header-english': $isEnglish() }"
        >
          <div class="sprint-header-left">
            <span class="title">迭代阶段</span>
            <span
              v-show="
                $authFunction(
                  'FUNC_COOP_SPRINT_STAGE_CURRENT_UPDATE',
                  3,
                  data.projectId,
                )
              "
              style="color:#a09e9e;"
              >({{ $t('点选时间节点修改迭代阶段时间') }})</span
            >
          </div>
          <div class="sprint-header-right">
            <div class="template-select">
              <field-edit
                ref="fieldEdit"
                v-bind="FieldEditProps"
                :on-change="changeTemplate"
                class="template-select-input"
              ></field-edit>
              <i
                class="el-icon-arrow-down"
                style="cursor: pointer;"
                @click="onFieldEditClick"
              ></i>
            </div>
            <el-link
              type="primary"
              style="font-size: 14px"
              :underline="false"
              @click="custormBtn"
              >{{ $t('迭代阶段模板设置') }}&nbsp;<i class="el-icon-setting"></i>
            </el-link>
          </div>
        </div>
        <div
          v-loading="loading"
          class="progress-dute scrollbal-common"
          element-loading-text="updating..."
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(255,255,255, 0.5)"
        >
          <div
            v-for="(item, i) in progressVO"
            :key="i"
            class="progress-item"
            :class="{
              'progress-item-current':
                item.isCurrentStage || item.isCurrentStageActual,
            }"
          >
            <div
              class="progress-item-header"
              :class="{ 'progress-item-header-en': $isEnglish() }"
            >
              <div>{{ $t('计划完成时间') }}</div>
              <div>{{ $t('实际完成时间') }}</div>
            </div>
            <div
              class="progress-item-line progress-item-line-1"
              :class="{
                'progress-line-green': item.isPlanFinished,
                'progress-line-yellow': item.isCurrentStage,
                'progress-line-grey':
                  !item.isPlanFinished && !item.isCurrentStage ? true : false,
              }"
            ></div>
            <div
              class="progress-item-line progress-item-line-2"
              :class="{
                'progress-line-green': item.isActualFinished,
                'progress-line-yellow': item.isCurrentStageActual,
                'progress-line-grey':
                  !item.isActualFinished && !item.isCurrentStageActual
                    ? true
                    : false,
              }"
            ></div>
            <div class="progress-item-content">
              <div
                class="progress-item-content-tag-box"
                style="margin-bottom: 5px;"
              >
                <el-tooltip placement="top">
                  <div slot="content">
                    <div>
                      <div style="font-size:14px;margin:0 10px;">
                        {{ item.stageInfo.name }}
                      </div>
                      <div class="progress-tooltip-mr" style="margin:10px; ">
                        <span
                          >{{ $t('计划完成时间') }}：{{
                            item.stageInfo.startTimePlan || '--'
                          }}</span
                        >&nbsp;
                        <span
                          >{{ $t('实际完成时间') }}：{{
                            item.stageInfo.startTimeActual || '--'
                          }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="ui-tag ui-tag-grey progress-item-content-tag">
                    {{ item.stageInfo.name }}
                  </div>
                </el-tooltip>
              </div>
              <div
                class="progress-item-content-plan"
                :class="{
                  'progress-date-yellow': item.isCurrentStage,
                  'progress-date-grey':
                    !item.isPlanFinished && !item.isCurrentStage ? true : false,
                }"
              >
                <global-input
                  v-if="hasAuth"
                  :init-value="item.stageInfo.startTimePlan || ''"
                  input-type="time"
                  project-text="sprintTime"
                  :on-change="
                    value => beforeUpdateDate(value, item, 'startTimePlan')
                  "
                  :daisable-time="daisableTime"
                >
                  <span slot class="cursor-pointer">{{
                    item.stageInfo.startTimePlan || EMPTYDATE
                  }}</span>
                </global-input>
                <span v-else>{{
                  item.stageInfo.startTimePlan || EMPTYDATE
                }}</span>
              </div>
              <div
                class="progress-item-content-real"
                :class="{
                  'progress-date-yellow': item.isCurrentStageActual,
                  'progress-date-grey':
                    !item.isActualFinished && !item.isCurrentStageActual
                      ? true
                      : false,
                }"
              >
                <global-input
                  v-if="hasAuth"
                  :init-value="item.stageInfo.startTimeActual || ''"
                  input-type="time"
                  project-text="sprintTime"
                  :on-change="
                    value => beforeUpdateDate(value, item, 'startTimeActual')
                  "
                  :daisable-time="daisableTime"
                >
                  <span slot class="cursor-pointer">{{
                    item.stageInfo.startTimeActual || EMPTYDATE
                  }}</span>
                </global-input>
                <span v-else>{{
                  item.stageInfo.startTimeActual || EMPTYDATE
                }}</span>
              </div>
              <div
                v-show="item.line3"
                class="progress-item-content-delay"
                :class="{
                  'progress-item-content-before': item.isCompletedBefore,
                }"
              >
                {{ item.line3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      :title="$t('提示')"
      :visible.sync="sprintdialogVisible"
      width="550px"
      style="margin-top: 26vh"
    >
      <i
        class="el-icon-warning"
        style="color:#E6A23C;position: absolute;font-size: 20px;top: 64px;"
      ></i>
      <div style="margin-left: 30px; line-height: 24px;">
        [{{ sprintInfo.name }} ]{{
          $t('迭代下有未完成的工作项，请完成或进行如下操作：')
        }}
      </div>
      <el-checkbox v-model="sprintchecked" style="margin-left: 30px">{{
        $t('将未完成的工作项移除迭代，对已完成的工作项进行归档。')
      }}</el-checkbox>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelStopSprint">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="successStopSprint">{{
          $t('确定')
        }}</el-button>
      </span>
    </el-dialog>
    <!-- 修改日期 date modified -->
    <!-- <date-modified :dateshow="dateshow" @func="getMsgFormSon"></date-modified>
    <progress-dialog :progressTab="progressTab" @func="getMsgFormSon"></progress-dialog> -->
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 迭代详情
 * @desc
 * @author heyunjiang
 * @date
 */
// import DateModified from './SprintInfoDateModified'
// import ProgressDialog from './SprintInfoProgressdialog'
import GlobalInput from '@/components/field-edit/GlobalInput.vue'
import FieldEdit from '@/components/field-edit'
import * as sprintService from '@/service/sprint'

export default {
  name: 'SprintInfo',
  components: {
    // DateModified,
    // ProgressDialog,
    GlobalInput,
    FieldEdit,
  },

  mixins: [],
  props: {
    sprintInfo: {
      type: Object,
      required: true,
      desc: '迭代详情展示',
    },

    projectId: {
      type: [Number, String],
      required: false,
    },
  },

  data() {
    return {
      dateshow: false, //展示修改日期弹窗
      progress: [], //迭代阶段进度信息列表
      progressTab: {},
      loading: false,
      daisableTime: 1, //标记迭代时间1:为已锁定和已归档
      progressList: null, //临时存迭代日期
      data: {
        projectId: this.$getUrlParams().projectId,
        sprintId: this.$getUrlParams().sprintId,
      },

      EMPTYDATE: i18n.t('未设置'),
      FieldEditProps: {
        fieldType: 'select',
        initValue: '',
        selectValue: [],
      },

      sprintdialogVisible: false,
      sprintchecked: false,
      sprinrow: {},
    }
  },
  computed: {
    hasAuth() {
      return this.$authFunction(
        'FUNC_COOP_SPRINT_STAGE_TIME_UPDATE',
        3,
        this.data.projectId,
      )
    },
    // 迭代阶段 - VO，实现了绿线、灰线判断逻辑
    progressVO() {
      const planIndex = this.progress.findIndex(item => item.isCurrentStage)
      const actualIndex = this.progress.findIndex(
        item => item.isCurrentStageActual,
      )

      if (this.progressList) {
        return this.progressList
      } else {
        return this.progress.map((item, index) => {
          const planTime = new Date(item.stageInfo.startTimePlan)
          const actualTime = new Date(item.stageInfo.startTimeActual)
          return {
            ...item,
            isPlanFinished: planIndex > -1 && index < planIndex,
            isActualFinished: actualIndex > -1 && index < actualIndex,
            isCompletedBefore: actualTime < planTime,
          }
        })
      }
    },
  },

  watch: {
    dateshow() {
      this.initProgressData(this.data)
    },
    sprintInfo() {
      this.getTemList()
      this.initProgressData(this.data)
      if (this.sprintInfo.isLocked == 1 || this.sprintInfo.status == 2) {
        this.daisableTime = 1
      } else {
        this.daisableTime = null
      }
    },
  },

  created() {},
  mounted() {
    this.data = {
      projectId: this.$getUrlParams().projectId,
      sprintId: this.$getUrlParams().sprintId,
    }

    this.initProgressData(this.data)
    this.getTemList()
  },
  methods: {
    onFieldEditClick() {
      this.$refs.fieldEdit.fieldClick()
    },
    //迭代设置了结束时增加提示框判断
    async beforeUpdateDate(value, info, key) {
      if (!key || !info.stageInfo) {
        return
      }
      let obj = {}
      obj = {
        sprintId: this.$getUrlParams().sprintId,
        projectId: this.projectId || this.$getUrlParams().projectId,
        stageTimeList: [
          {
            ...info.stageInfo,
            [key]: value,
            setTime: value,
          },
        ],
      }

      if (
        info.stageInfo.name === i18n.t('已完成') &&
        key === 'startTimeActual'
      ) {
        let results = await sprintService.sprintHasUnfinishedItem({
          sprintId: this.$getUrlParams().sprintId,
          projectId: this.projectId || this.$getUrlParams().projectId,
        })

        if (results.status === 200 && results.data === true) {
          this.sprintdialogVisible = true
          this.sprinrow = obj
        }
        if (results.status === 200 && results.data === false) {
          this.$confirm(
            '迭代结束后，迭代会进行归档，请确认，是否要结束该迭代？',
            i18n.t('提示'),
            {
              confirmButtonText: i18n.t('确定'),
              cancelButtonText: i18n.t('取消'),
              type: 'warning',
            },
          )
            .then(() => {
              this.updateDate(obj, 'archived')
            })
            .catch(() => {})
        }
      } else {
        this.updateDate(obj)
      }
    },
    cancelStopSprint() {
      this.sprintchecked = false
      this.sprintdialogVisible = false
      this.sprinrow = {}
    },
    successStopSprint() {
      this.sprinrow.removeUnfinishedItem = this.sprintchecked
      this.sprintchecked = false
      this.sprintdialogVisible = false
      this.updateDate(this.sprinrow)
    },
    // 更新日期 - 点击日期项、更新日期 - add by heyunjiang
    async updateDate(obj, type) {
      this.loading = true
      let res = {}
      try {
        res = await sprintService.sprintTimeUpdate(obj)
      } finally {
        this.loading = false
        const text =
          obj.stageTimeList[0].setTime == null ? i18n.t('删除') : i18n.t('修改')
        if (res.status === 200) {
          this.$message({
            message: res.msg || `${text}${i18n.t('成功')}`,
            type: 'success',
          })
          this.$emit('dateUpdate')
          this.$emit('changHandleTask')
          this.initProgressData(this.data)
          this.progressList = null
          // 更新详情成功后执行的回调 用于更新迭代列表
          if (type && type === 'archived') {
            // 归档成功
            this.$emit('archivedSuccess')
          } else {
            // 编辑成功 更新迭代列表的对应迭代的参数
            const data = {
              type: 'edit',
              sprintId: this.$getUrlParams().sprintId,
              projectId: this.$getUrlParams().projectId,
            }
            this.$emit('onEditChange', data)
            // this.$refs.fieldEdit.$parent.$parent.onEditChange({
            //   type: 'edit',
            //   sprintId: this.$getUrlParams().sprintId,
            //   projectId: this.$getUrlParams().projectId,
            // })
          }
        } else {
          this.daisableTime = 1
          // this.$message({ message: res.msg || `${text}失败`, type: 'error' });
          this.progressList = JSON.parse(JSON.stringify(this.progressVO))
        }
      }
    },
    dateModifiedBtn() {
      this.dateshow = true
    },
    custormBtn() {
      this.$goToPage(this, 'projectSetting', {
        projectId: this.$getUrlParams().projectId,
        sprintId: this.$getUrlParams().sprintId,
        key: 'sprint',
      })
    },
    //进度阶段tab可编辑
    progressTagBtn(item) {
      if (
        !this.$authFunction(
          'FUNC_COOP_SPRINT_STAGE_CURRENT_UPDATE',
          3,
          this.data.projectId,
        )
      ) {
        return
      }
      this.progressTab = {
        show: true,
        data: item,
        list: this.progress,
      }
    },
    getMsgFormSon(data) {
      this.dateshow = false
      this.progressTab = {
        ...this.progressTab,
        show: false,
      }

      if (!data) {
        this.initProgressData(this.data)
      }
    },
    //获取阶段进度初始数据
    initProgressData(obj) {
      sprintService.scheduleInfoList(obj).then(res => {
        if (res.status == 200) {
          let show = true
          this.progress = res.data.map(item => {
            // 只要有一个实际日期为空，后面的都为空
            if (item.stageInfo && !item.stageInfo.startTimeActual) {
              show = false
            }
            return {
              ...item,
              show,
            }
          })
        } else {
          // this.$message({ message: '搜索需求/任务失败', type: 'error' });
        }
      })
    },
    // 获取模板列表
    async getTemList() {
      let result = {}
      try {
        // this.loading = true;
        result = await sprintService.templateList({
          projectId: this.projectId || this.$getUrlParams().projectId,
        })
      } catch (_) {
        // do nothing
      } finally {
        // this.loading = false;
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '获取迭代阶段模板列表数据失败',
        //   type: 'error'
        // })
        return
      }
      const list = result.data.map(item => {
        return {
          ...item,
          key: item.id,
          value: item.name,
        }
      })
      const initvalue = list.find(
        item => +item.key === +this.sprintInfo.templateId,
      )

      this.FieldEditProps.initValue = (initvalue && initvalue.key) || ''
      this.FieldEditProps.selectValue = list
      this.$forceUpdate()
    },
    // 更改当前迭代使用的模板
    async changeTemplate(value) {
      this.loading = true
      let res = {}
      try {
        res = await sprintService.templateUse({
          projectId: this.projectId,
          sprintId: this.sprintInfo.id,
          templateId: value,
        })
      } finally {
        this.loading = false
        if (res.status === 200) {
          this.$message({
            message: res.msg || i18n.t('应用成功'),
            type: 'success',
          })

          this.FieldEditProps.initValue = value
          this.$emit('templateUpdate')
        } else {
          // this.$message({
          //   message: res.msg || i18n.t('应用失败'),
          //   type: 'error',
          // })
          const selectArr = this.FieldEditProps.selectValue.filter(item => {
            return item.id === this.FieldEditProps.initValue
          })
          this.FieldEditProps.initName = selectArr[0].name
        }
      }
    },
    // 点击延期数查看列表
    checkDelayList(key) {
      this.$emit('delayNumberClick', { type: key })
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/ele-variables';
.sprint-info {
  display: inline-block;
  max-width: calc(100% - 110px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.info-item {
  min-width: 200px;
  display: inline-block;
}
.link {
  vertical-align: top;
}
.sprint-header {
  margin-bottom: 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  /deep/ .template-select {
    padding: 2px 14px 0 0;
    color: $--color-primary;
    .template-select-title {
      font-size: 14px;
      color: #606266;
      margin-right: 5px;
    }
    .select-box {
      right: -120px;
      left: auto;
    }
  }
}
.sprint-header-left {
  flex-shrink: 0;
  .title {
    border-left: 2.5px solid $--color-primary;
    font-family: MicrosoftYaHei;
    font-size: 16px;
    color: #333333;
    padding-left: 12.5px;
    margin-bottom: 32px;
  }
}
.sprint-header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .template-select {
    display: flex;
    align-items: center;
  }
  .field-edit-box {
    height: auto;
    padding: 0 0 0 5px;
  }
}

.progress-list {
  width: 150px;
  height: 18px;
  display: inline-block;
  border-radius: 0% !important;
  position: relative;
  top: -2px;
}
.progress-time {
  overflow-x: auto;
  position: relative;
  /*border: 1px solid #ebeef5;*/
  /*margin-top: 20px;*/
  padding: 0 15px 10px 0;
  .progress-title {
    font-size: 14px;
    font-weight: bold;
  }
  .progress-btn {
    display: inline-block;
    margin: 0 15px;
    &:hover {
      color: #409eff;
    }
  }
  .ui-tag {
    font-size: 12px;
    height: 30px;
    line-height: 30px;
    border-radius: 4px;
    padding: 0px 8px;
    min-width: 90px;
    max-width: 165px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-family: MicrosoftYaHei;
    color: #666666;
  }
  .ui-tag-grey {
    /*color: #909090;*/
    color: #666666;
    border: 1px solid #bfbfbf;
  }
  .ui-tag-red {
    color: #ea0d0d !important;
    border: 1px solid #ea0d0d !important;
    background: rgba(234, 13, 13, 0.05) !important;
    border-color: rgba(234, 13, 13, 0.05) !important;
    border-radius: 6px;
    padding: 1px 2px;
  }
  .ui-tag-green_1 {
    color: #24b47e;
    border: 1px solid #24b47e;
    background: rgba(194, 239, 222, 0.38);
    border-color: rgba(194, 239, 222, 0.38);
    border-radius: 6px;
    padding: 1px 2px;
  }
  .ui-tag-green {
    color: #24b47e;
    border: 1px solid #24b47e;
  }
  .ui-tag-yellow {
    color: #f0a100;
    border: 1px solid #f0a100;
  }
  // 新版迭代里程碑样式 - 两条线 add by heyunjiang
  .progress-dute {
    display: flex;
    overflow-y: auto;
    min-height: 93px;
    flex-flow: row nowrap;
    padding: 15px 20px;
    /*background-color: #f9f9f9;*/
    .progress-item {
      flex: 1 1 auto; // 可以充满整个 Item
      font-size: 0;
      position: relative;
      // 当前阶段需要加大面积
      &.progress-item-current {
        .progress-item-content {
          width: 100px;
        }
        .progress-item-line {
          width: calc(100% - 100px);
        }
      }
      .progress-item-line-common {
        height: 28px;
        line-height: 28px;
        color: #909090;
      }
      // 头部：计划日期、实际日期
      .progress-item-header {
        display: none;
        width: 76px;
        font-size: 12px;
        vertical-align: top;
        position: relative;
        top: 37px;
        div {
          @extend .progress-item-line-common;
        }
      }
      .progress-item-header-en {
        width: 160px;
      }
      .progress-item-content,
      .progress-item-line {
        display: inline-block;
      }
      .progress-item-content-tag,
      .progress-item-content-plan,
      .progress-item-content-real,
      .progress-item-content-delay {
        text-align: center;
        font-size: 12px;
      }
      .progress-item-content-plan,
      .progress-item-content-real {
        @extend .progress-item-line-common;
      }
      .progress-item-content {
        width: 100px;
        float: right;
      }
      // 内容超期
      .progress-item-content-delay {
        color: #ea0d0d;
        border: 1px solid rgba(234, 13, 13, 0.05);
        border-radius: 6px;
        background-color: rgba(234, 13, 13, 0.05);
        padding: 1px 2px;
        margin-top: 5px;
      }
      // 内容提前
      .progress-item-content-before {
        color: #24b47e;
        background-color: rgba(218, 241, 232, 0.5);
      }
      // 连接线
      .progress-item-line {
        width: calc(100% - 90px);
        height: 1px;
        box-sizing: border-box;
        border-top: 1px solid red;
        position: absolute;
        left: 0;
        &.progress-item-line-1 {
          top: 51px;
        }
        &.progress-item-line-2 {
          top: 79px;
        }
      }
      // 设置第一个盒子展示数据
      &:first-of-type {
        flex: none;
        .progress-item-line {
          width: 0;
        }
        .progress-item-header {
          display: inline-block;
        }
      }
      .progress-line-dash {
        border-top-style: dashed;
      }
      .progress-line-yellow {
        border-top-color: #f0a100;
      }
      .progress-line-blue {
        border-top-color: #338fe5;
      }
      .progress-line-green {
        border-top-color: #24b47e;
      }
      .progress-line-grey {
        border-top-color: #909090;
      }
      .progress-date-yellow {
        color: #f0a100;
        font-size: 14px;
        font-weight: 700;
      }
      .progress-date-blue {
        color: #338fe5;
      }
      .progress-date-green {
        color: #24b47e;
      }
      .progress-date-grey {
        color: #909090;
      }
    }
  }
  // 已废弃
  .progress-img {
    // display: inline-flex;
    display: none;
    padding: 30px 8%;
    min-width: 100%;
    // .progress:first-child {
    //   margin-left: auto;
    // }
    // .progress:last-child {
    //   margin-right: auto;
    // }
    .progress {
      flex: 1 1 auto;
      display: flex;
      position: relative;
      max-width: 317px;
      min-width: 114px;
      .progress-common {
        flex: 0 0 auto;
        display: flex;
        justify-content: center;
        white-space: nowrap;
      }
      &:last-child {
        max-width: 6px;
        min-width: 6px;
      }
      .progress-point-container {
        width: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .progress-show-date-label {
        flex: 0 0 auto;
      }
      .progress-show-date {
        margin-top: 10px;
        font-size: 12px;
        text-align: center;
        flex-wrap: wrap;
        @extend .progress-common;
      }
      .ProgressTag {
        flex: 0 0 auto;
      }
      .ProgressTag-container {
        margin-top: 5px;
        @extend .progress-common;
        cursor: pointer;
        .progress-tooltip-mr {
          margin: 10px;
          color: blue;
        }
      }
      .progress-point {
        flex: 0 0 auto;
        width: 6px;
        height: 6px;
        border-radius: 6px;
        border-width: 1px;
        border-style: solid;
        margin-top: 10px;
      }
      .progress-line {
        flex: 1 1 auto;
        margin-top: 33px;
        border-top: 1px solid transparent;
        .progress-line-dash {
          border-top-style: dashed;
        }
      }
      .progress-point-yellow {
        background: #f0a100;
        border-color: #fff;
      }
      .progress-point-yellow-notFill {
        border-color: #f0a100;
        background: #fff;
      }
      .progress-show-date-yellow {
        color: #f0a100;
      }
      .progress-show-date-blue {
        color: #338fe5;
      }
      .progress-line-yellow {
        border-top-color: #f0a100;
      }
      .progress-point-blue {
        background: #338fe5;
        border-color: #fff;
      }
      .progress-point-blue-notFill {
        border-color: #338fe5;
        background: #fff;
      }
      .progress-line-blue {
        border-top-color: #338fe5;
      }
      .progress-point-green {
        background: #24b47e;
        border-color: #fff;
      }
      .progress-point-green-notFill {
        border-color: #24b47e;
        background: #fff;
      }
      .progress-show-date-green {
        color: #24b47e;
      }
      .progress-line-green {
        border-top-color: #24b47e;
      }
      .progress-point-grey {
        background: #909090;
        border-color: #fff;
      }
      .progress-point-grey-notFill {
        border-color: #909090;
        background: #fff;
      }
      .progress-show-date-grey {
        color: #909090;
      }
      .progress-line-grey {
        border-top-color: #909090;
      }
    }
  }
}
</style>
