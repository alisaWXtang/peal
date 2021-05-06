<template>
  <div>
    <div class="report-select-box">
      <div class="report-select__head">
        <div class="report-module-title">{{ $t('报告内容') }}</div>
        <div class="report-select">
          <el-dropdown trigger="click" size="medium" @command="handleCommand">
            <span class="el-dropdown-link">
              {{ $t('添加报告内容') }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="HTTPINFOMAP.reportContentText">{{
                $t('文本')
              }}</el-dropdown-item>
              <el-dropdown-item :command="HTTPINFOMAP.reportContentFilter">{{
                $t('过滤器')
              }}</el-dropdown-item>
              <el-dropdown-item :command="HTTPINFOMAP.reportContentSprint">{{
                $t('迭代列表')
              }}</el-dropdown-item>
              <el-dropdown-item
                :command="HTTPINFOMAP.reportContentRequirement"
                >{{ $t('需求列表') }}</el-dropdown-item
              >
              <el-dropdown-item :command="HTTPINFOMAP.reportContentTask">{{
                $t('任务列表')
              }}</el-dropdown-item>
              <el-dropdown-item :command="HTTPINFOMAP.reportContentBug">{{
                $t('缺陷列表')
              }}</el-dropdown-item>
              <el-dropdown-item :command="HTTPINFOMAP.reportContentAttach">{{
                $t('附件')
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <!-- 过滤器 -->
      <report-content-filter
        v-if="filterInfo.type == HTTPINFOMAP.reportContentFilter"
        :filter-info.sync="filterInfo"
        @filterFun="filterFun"
      ></report-content-filter>
      <!-- 迭代列表 -->
      <report-content-sprint-choose
        v-if="filterInfo.type == HTTPINFOMAP.reportContentSprint"
        :filter-info="filterInfo"
        @sprintChoose="sprintChoose"
      ></report-content-sprint-choose>
      <!-- 文本 -->
      <report-content-text
        v-if="filterInfo.type == HTTPINFOMAP.reportContentText"
        ref="add"
        :filter-info.sync="filterInfo"
        :report-data="unfilterInfo"
        :index="0"
        @textFun="textFun"
      ></report-content-text>
      <!-- 附件上传 -->
      <report-content-file
        v-if="filterInfo.type == HTTPINFOMAP.reportContentAttach"
        :filter-info.sync="filterInfo"
        :report-data.sync="unfilterInfo"
        :index="0"
        @handleUpload="handleUpload"
      ></report-content-file>
      <!-- 展示报告内容 -->
      <div v-for="(item, index) in reportContent" :key="index">
        <!-- 文本 -->
        <report-content-text
          v-if="item.workType == HTTPINFOMAP.reportContentText"
          :ref="`edit_${index}`"
          :index="index"
          :filter-info.sync="unfilterInfo"
          :report-data="item"
          @textFun="textFun"
          @tableFun="tableFun"
        ></report-content-text>
        <!-- 附件上传 -->
        <report-content-file
          v-if="item.workType == HTTPINFOMAP.reportContentAttach"
          :report-data="item"
          :index="index"
          :filter-info.sync="unfilterInfo"
          @handleUpload="handleUpload"
          @tableFun="tableFun"
        ></report-content-file>
        <!-- 迭代/任务/缺陷/需求表格渲染 -->
        <report-content-table
          v-if="
            item.workType !== HTTPINFOMAP.reportContentText &&
              item.workType !== HTTPINFOMAP.reportContentAttach
          "
          :report-data="item"
          :index="index"
          :project-id="projectId"
          @tableFun="tableFun"
          @tableEditableUpdate="tableEditableUpdate"
        ></report-content-table>
      </div>
      <!-- 新建选择需求 -->
      <work-item-choose
        :is-show="workItemDialogShow"
        :project-id="projectId"
        :work-item-type="workItemDialogType"
        @close="filterInfo.show = false"
        @success="workItemAdd"
      ></work-item-choose>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 报告内容入口文件
 * @desc
 * @author panhui
 * @date 2019.10.10
 */
import ReportContentFilter from './ReportContentFilter'
import ReportContentText from './ReportContentText'
import ReportContentFile from './ReportContentFile'
import ReportContentTable from './ReportContentTable'
import HTTPINFOMAP from './HTTPINFOMAP'
import ReportContentSprintChoose from './ReportContentSprintChoose'
import WorkItemChoose from './WorkItemChoose'

export default {
  name: 'ReportContent',
  components: {
    ReportContentFilter,
    ReportContentText,
    ReportContentSprintChoose,
    ReportContentTable,
    ReportContentFile,
    WorkItemChoose,
  },

  mixins: [],
  props: {
    reportContent: {
      type: Array,
    },

    projectId: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      textContent: null,
      unfilterInfo: { type: -1, show: false },
      HTTPINFOMAP,
      filterInfo: { type: -1, show: false },
      filterInfoLits: [], //添加报告信息
      tableData: null,
    }
  },
  computed: {
    // 需求、缺陷、任务选择 dialog status
    workItemDialogShow() {
      return (
        [
          HTTPINFOMAP.reportContentTask,
          HTTPINFOMAP.reportContentBug,
          HTTPINFOMAP.reportContentRequirement,
          HTTPINFOMAP.reportContentClientRequirement,
          HTTPINFOMAP.reportContentServerRequirement,
        ].includes(this.filterInfo.type) && this.filterInfo.show
      )
    },
    // 当前需要展示的工作项类型
    workItemDialogType() {
      let type = -1
      switch (this.filterInfo.type) {
        case this.HTTPINFOMAP.reportContentTask:
          type = 2
          break
        case this.HTTPINFOMAP.reportContentBug:
          type = 3
          break
        case this.HTTPINFOMAP.reportContentRequirement:
          type = 1
          break
      }

      return type
    },
  },

  watch: {
    reportContent() {
      // console.log('reportContent hello', this.reportContent)
    },
  },

  mounted() {},
  methods: {
    //获取下拉值
    handleCommand(command) {
      this.filterInfo = { type: command, show: true, list: [] }
      if (this.textContent && this.textContent) {
        this.$emit('update:reportContent', [
          ...this.reportContent,
          {
            type: HTTPINFOMAP.reportContentText,
            ...this.textContent,
          },
        ])

        this.$emit('updateReportContent')
        this.textContent = null
      }
    },
    //表格发生编辑或者删除时触发对应操作
    tableFun(val) {
      // let reportContent = JSON.parse(JSON.stringify(this.reportContent))
      //当choose为true时触发选择表格编辑的弹窗
      if (val.choose == 'true') {
        this.filterInfo = { ...val }
      } else if (val.choose == 'false') {
        // 当choose为false时触发选择表格删除
        this.reportContent.splice(val.index, 1)
        this.$emit('update:reportContent', [...this.reportContent])
        this.$emit('updateReportContent')
      }
      if (val.text == 'edit') {
        this.reportContent[val.index] = {
          ...this.reportContent[val.index],
          type: val.type,
          titleEdit: val.titleEdit,
        }

        this.$emit('update:reportContent', [...this.reportContent])
        this.$emit('updateReportContent')
      }
      //删除子内容
      if (val.text == 'deleteContent') {
        this.reportContent[val.index] = {
          ...this.reportContent[val.index],
          ...val.info,
        }

        this.$emit('update:reportContent', [...this.reportContent])
        this.$emit('updateReportContent')
      }
      //渲染的文本信息在编辑时
      if (val.data) {
        if (val.data.contents) {
          this.reportContent[val.index] = {
            type: val.type,
            ...val.data,
          }

          this.$emit('update:reportContent', [...this.reportContent])
          this.$emit('updateReportContent')
        }
      }
      if (val.workTitle && !val.text) {
        this.reportContent[val.index] = {
          ...this.reportContent[val.index],
          workTitle: val.workTitle,
        }

        this.$emit('update:reportContent', [...this.reportContent])
        this.$emit('updateReportContent')
      }
    },
    //获取文本信息
    textFun(val) {
      switch (val.status) {
        case 'add':
          this.$emit('update:reportContent', [
            ...this.reportContent,
            {
              type: HTTPINFOMAP.reportContentText,
              ...val.data,
            },
          ])

          this.$emit('updateReportContent')
          break
        case 'unadd':
          val.textShow
            ? (this.textContent = val.data)
            : (this.textContent = null)
          val.save &&
            !val.save &&
            this.$emit('update:reportContent', [
              ...this.reportContent,
              {
                type: HTTPINFOMAP.reportContentText,
                ...val.data,
              },
            ])

          break
        case 'delete':
          this.reportContent.splice(val.index, 1)
          this.$emit('update:reportContent', [...this.reportContent])
          this.$emit('updateReportContent')
          break
        default:
      }
    },
    //获取过滤器信息
    filterFun(val) {
      if (val.status == 'add') {
        this.$emit('update:reportContent', [
          ...this.reportContent,
          {
            type: HTTPINFOMAP.reportContentFilter,
            ...val.data,
          },
        ])
      } else if (val.status == 'edit') {
        this.reportContent[val.index] = {
          ...this.reportContent[val.index],
          ...val.data,
        }

        this.$emit('update:reportContent', [...this.reportContent])
      }
      this.$emit('updateReportContent')
    },
    //获取迭代列表信息
    sprintChoose(val) {
      if (val.status == 'add') {
        this.$emit('update:reportContent', [
          ...this.reportContent,
          {
            type: HTTPINFOMAP.reportContentSprint,
            ...val.data,
          },
        ])
      } else if (val.status == 'edit') {
        this.reportContent[val.index] = {
          ...this.reportContent[val.index],
          ...val.data,
        }

        this.$emit('update:reportContent', [...this.reportContent])
      }
      this.$emit('updateReportContent')
    },
    //附件上传
    handleUpload(val) {
      // let reportContent = JSON.parse(JSON.stringify(this.reportContent))
      if (val.status == 'cancle') {
        this.reportContent[val.index] = {
          ...this.reportContent[val.index],
          ...val.data,
        }

        this.$emit('update:reportContent', [...this.reportContent])
      } else if (val.status == 'delete') {
        this.reportContent.splice(val.index, 1)
        this.$emit('update:reportContent', [...this.reportContent])
      } else if (val.status == 'deletechild') {
        this.reportContent[val.index] = {
          ...this.reportContent[val.index],
          ...val.data,
        }

        this.$emit('update:reportContent', [...this.reportContent])
      } else {
        this.$emit('update:reportContent', [
          ...this.reportContent,
          {
            type: HTTPINFOMAP.reportContentAttach,
            ...val.data,
          },
        ])
      }
      this.$emit('updateReportContent')
    },
    // 工作项点击确定
    workItemAdd(value) {
      this.filterInfo.show = false
      let workTitle = i18n.t('需求')
      switch (this.workItemDialogType) {
        case 1:
          workTitle = i18n.t('需求')
          break
        case 2:
          workTitle = i18n.t('任务')
          break
        case 3:
          workTitle = i18n.t('缺陷')
          break
      }

      this.$emit('update:reportContent', [
        ...this.reportContent,
        {
          type: this.filterInfo.type,
          ids: [...value],
          workTitle: workTitle + i18n.t('列表'),
          // subDemand: {
          //   data: {}
          // }
        },
      ])

      this.$emit('updateReportContent')
    },
    // 客户端、服务端编辑内容
    tableEditableUpdate() {
      this.$emit('update:reportContent', this.reportContent)
      this.$emit('updateReportContent')
    },
  },
}
</script>
<style lang="scss" scoped>
.border-padding-left {
  margin: 0;
  border-left: 2px solid #409eff;
  padding-left: 10px;
}
.report-select__head {
  // display: flex;
  // align-items: center;
  .el-dropdown-link {
    cursor: pointer;
    color: $--color-primary;
  }
}
.report-select-box {
  // margin-bottom: 5%;
  .report-text {
    margin: 22px 0 16px;

    .report-content-title {
      color: $--color-text-fine;
    }

    .el-button {
      color: $--color-text-secondary;

      &:hover {
        color: $--color-primary;
      }
    }
  }

  // 每种类型的标题
  /deep/ .report-content-title {
    margin: 22px 0 16px;

    .content-title {
      padding-left: 8px;
      color: $--color-text-fine;
      border-left: 2px solid $--color-primary;
      border-radius: 0.5px;
    }

    .el-button {
      color: $--color-text-secondary;

      &:hover {
        color: $--color-primary;
      }
    }
  }
}
// .report-select {
//   margin-left: 10px;
// }
</style>

<style lang="scss">
// 过滤器弹窗颜色覆盖
.report-group-select .el-select-group__title {
  color: $--color-primary;
}
</style>
