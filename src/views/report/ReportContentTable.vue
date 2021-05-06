<template>
  <div>
    <div class="report-content-box">
      <!-- 迭代列表 -->
      <div v-if="reportData.workType == HTTPINFOMAP.reportContentSprint">
        <div class="report-content-title">
          <span class="content-title"
            >{{ index + 1 }}.{{ $t('类型') }}:{{ $t('迭代列表') }}</span
          >
          <div class="fr">
            <el-button
              type="text"
              icon="co-icon-edit"
              @click="
                chooseBtn(HTTPINFOMAP.reportContentSprint, reportData.request)
              "
              >{{ $t('选择迭代') }}</el-button
            >
            <el-button
              type="text"
              icon="co-icon-delete"
              @click="
                deleteBtn(HTTPINFOMAP.reportContentSprint, reportData.request)
              "
              >{{ $t('删除') }}</el-button
            >
          </div>
        </div>
        <div
          v-for="(item, index) in reportData.contentDetails"
          :key="index"
          class="table-item"
        >
          <el-input
            v-model="item.titleName"
            class="report-title-input"
            @blur="inputBlur(HTTPINFOMAP.reportContentSprint)"
          ></el-input>
          <i
            class="co-icon-delete"
            :title="$t('删除该内容')"
            @click="
              deleteContent(
                HTTPINFOMAP.reportContentSprint,
                item,
                reportData.request,
              )
            "
          ></i>
          <div v-html="item.template"></div>
        </div>
      </div>
      <!-- 过滤器 -->
      <div v-if="reportData.workType == HTTPINFOMAP.reportContentFilter">
        <div class="report-content-title">
          <span class="content-title"
            >{{ index + 1 }}.{{ $t('类型') }}:{{ $t('过滤器') }}[{{
              fiflterText[reportData.request.workItemType]
            }}]</span
          >
          <div class="fr">
            <el-button
              type="text"
              icon="co-icon-edit"
              @click="
                chooseBtn(HTTPINFOMAP.reportContentFilter, reportData.request)
              "
              >{{ $t('选择过滤器') }}</el-button
            >
            <el-button
              type="text"
              icon="co-icon-delete"
              @click="deleteBtn(HTTPINFOMAP.reportContentFilter, reportData)"
              >{{ $t('删除') }}</el-button
            >
          </div>
        </div>
        <div
          v-for="(item, index) in reportData.contentDetails"
          :key="index"
          class="table-item"
        >
          <el-input
            v-model="item.titleName"
            class="report-title-input"
            @blur="inputBlur(HTTPINFOMAP.reportContentFilter)"
          ></el-input>
          <i
            class="co-icon-delete"
            :title="$t('删除该内容')"
            @click="
              deleteContent(
                HTTPINFOMAP.reportContentFilter,
                item,
                reportData.request,
              )
            "
          ></i>
          <div v-html="item.template"></div>
        </div>
      </div>
      <!-- 需求列表 -->
      <div v-if="reportData.workType == HTTPINFOMAP.reportContentRequirement">
        <div class="report-content-title">
          <span class="content-title"
            >{{ index + 1 }}.{{ $t('类型') }}:{{ $t('需求列表') }}</span
          >
          <div class="fr">
            <el-button
              type="text"
              icon="co-icon-edit"
              @click="
                chooseBtn(
                  HTTPINFOMAP.reportContentRequirement,
                  reportData.request,
                )
              "
              >{{ $t('选择需求') }}</el-button
            >
            <el-button
              type="text"
              icon="co-icon-delete"
              @click="
                deleteBtn(
                  HTTPINFOMAP.reportContentRequirement,
                  reportData.request,
                )
              "
              >{{ $t('删除') }}</el-button
            >
          </div>
        </div>
        <div class="table-item">
          <el-input
            v-model="reportData.titleContent"
            class="report-title-input"
            @blur="inputBlur(HTTPINFOMAP.reportContentRequirement)"
          ></el-input>
        </div>
        <div v-html="reportData.template"></div>
      </div>
      <!-- 缺陷列表 -->
      <div v-if="reportData.workType == HTTPINFOMAP.reportContentBug">
        <div class="report-content-title">
          <span class="content-title"
            >{{ index + 1 }}.{{ $t('类型') }}:{{ $t('缺陷列表') }}</span
          >
          <div class="fr">
            <el-button
              type="text"
              icon="co-icon-edit"
              @click="
                chooseBtn(HTTPINFOMAP.reportContentBug, reportData.request)
              "
              >{{ $t('选择缺陷') }}</el-button
            >
            <el-button
              type="text"
              icon="co-icon-delete"
              @click="
                deleteBtn(HTTPINFOMAP.reportContentBug, reportData.request)
              "
              >{{ $t('删除') }}</el-button
            >
          </div>
        </div>
        <div class="table-item">
          <el-input
            v-model="reportData.titleContent"
            class="report-title-input"
            @blur="inputBlur(HTTPINFOMAP.reportContentBug)"
          ></el-input>
        </div>
        <div v-html="reportData.template"></div>
      </div>
      <!-- 任务列表 -->
      <div v-if="reportData.workType == HTTPINFOMAP.reportContentTask">
        <div class="report-content-title">
          <span class="content-title"
            >{{ index + 1 }}.{{ $t('类型') }}:{{ $t('任务列表') }}</span
          >
          <div class="fr">
            <el-button
              type="text"
              icon="co-icon-edit"
              @click="
                chooseBtn(HTTPINFOMAP.reportContentTask, reportData.request)
              "
              >{{ $t('选择任务') }}</el-button
            >
            <el-button
              type="text"
              icon="co-icon-delete"
              @click="
                deleteBtn(HTTPINFOMAP.reportContentTask, reportData.request)
              "
              >{{ $t('删除') }}</el-button
            >
          </div>
        </div>
        <div class="table-item">
          <el-input
            v-model="reportData.titleContent"
            class="report-title-input"
            @blur="inputBlur(HTTPINFOMAP.reportContentTask)"
          ></el-input>
        </div>
        <div v-html="reportData.template"></div>
      </div>
      <!-- 需求列表 - 客户端 -->
      <div
        v-if="reportData.workType == HTTPINFOMAP.reportContentClientRequirement"
      >
        <div class="report-content-title">
          <span class="content-title"
            >{{ index + 1 }}.{{ $t('提测信息') }}</span
          >
          <div class="fr">
            <el-button
              type="text"
              icon="co-icon-edit"
              @click="
                chooseBtn(
                  HTTPINFOMAP.reportContentClientRequirement,
                  reportData.request,
                )
              "
              >{{ $t('选择需求') }}</el-button
            >
            <el-button
              type="text"
              icon="co-icon-delete"
              @click="
                deleteBtn(
                  HTTPINFOMAP.reportContentClientRequirement,
                  reportData.request,
                )
              "
              >{{ $t('删除') }}</el-button
            >
          </div>
        </div>
        <!-- <el-input v-model="reportData.titleContent" @blur="inputBlur(HTTPINFOMAP.reportContentClientRequirement)" class="mb15 mt15"></el-input> -->
        <template>
          <table class="custom-table">
            <tr>
              <th style="width: 12%">id</th>
              <th style="width: 44%">{{ $t('需求标题') }}</th>
              <th style="width: 44%">
                {{ $t('测试要点') }}/{{ $t('注意事项') }}
              </th>
            </tr>
            <tr v-for="(item, index) in reportData.contentDetails" :key="index">
              <td class="hover">{{ index + 1 }}</td>
              <td class="hover">{{ item.display.title }}</td>
              <td>
                <typed-form-item
                  v-model="
                    reportData.subDemand.data[item.id][
                      HTTPINFOMAP.reportContentClientRequirementNotice
                    ]
                  "
                  type="MULTI_TEXT"
                  :rows="1"
                  :placeholder="$t('请输入内容')"
                  @change="tableTdEdit"
                ></typed-form-item>
              </td>
            </tr>
          </table>
        </template>
      </div>
      <!-- 需求列表 - 服务端 -->
      <div
        v-if="reportData.workType == HTTPINFOMAP.reportContentServerRequirement"
      >
        <div class="report-content-title">
          <span class="content-title"
            >{{ index + 1 }}.{{ $t('提测信息') }}</span
          >
          <div class="fr">
            <el-button
              type="text"
              icon="co-icon-edit"
              @click="
                chooseBtn(
                  HTTPINFOMAP.reportContentServerRequirement,
                  reportData.request,
                )
              "
              >{{ $t('选择需求') }}</el-button
            >
            <el-button
              type="text"
              icon="co-icon-delete"
              @click="
                deleteBtn(
                  HTTPINFOMAP.reportContentServerRequirement,
                  reportData.request,
                )
              "
              >{{ $t('删除') }}</el-button
            >
          </div>
        </div>
        <!-- <el-input v-model="reportData.titleContent" @blur="inputBlur(HTTPINFOMAP.reportContentServerRequirement)" class="mb15 mt15"></el-input> -->
        <template>
          <table class="custom-table">
            <tr>
              <th style="width: 12%">{{ $t('序号') }}</th>
              <th>{{ $t('应用服务') }}ID</th>
              <th>{{ $t('分支') }}</th>
              <th>{{ $t('版本') }}</th>
              <th>{{ $t('修改内容') }}</th>
              <th>{{ $t('测试要点') }}/{{ $t('注意事项') }}</th>
            </tr>
            <tr v-for="(item, index) in reportData.contentDetails" :key="index">
              <td class="hover">{{ index + 1 }}</td>
              <td>
                <typed-form-item
                  v-model="
                    reportData.subDemand.data[item.id][
                      HTTPINFOMAP.reportContentServerRequirementId
                    ]
                  "
                  type="MULTI_TEXT"
                  :rows="1"
                  :placeholder="$t('请输入内容')"
                  @change="tableTdEdit"
                ></typed-form-item>
              </td>
              <td>
                <typed-form-item
                  v-model="
                    reportData.subDemand.data[item.id][
                      HTTPINFOMAP.reportContentServerRequirementBranch
                    ]
                  "
                  type="MULTI_TEXT"
                  :rows="1"
                  :placeholder="$t('请输入内容')"
                  @change="tableTdEdit"
                ></typed-form-item>
              </td>
              <td>
                <typed-form-item
                  v-model="
                    reportData.subDemand.data[item.id][
                      HTTPINFOMAP.reportContentServerRequirementVersion
                    ]
                  "
                  type="MULTI_TEXT"
                  :rows="1"
                  :placeholder="$t('请输入内容')"
                  @change="tableTdEdit"
                ></typed-form-item>
              </td>
              <td class="hover">{{ item.display.title }}</td>
              <td>
                <typed-form-item
                  v-model="
                    reportData.subDemand.data[item.id][
                      HTTPINFOMAP.reportContentServerRequirementNotice
                    ]
                  "
                  type="MULTI_TEXT"
                  :rows="1"
                  :placeholder="$t('请输入内容')"
                  @change="tableTdEdit"
                ></typed-form-item>
              </td>
            </tr>
          </table>
        </template>
      </div>
    </div>
    <!-- 更新所选需求 -->
    <work-item-choose
      v-if="showWorkItemChoose"
      :is-show="workItemDialogShow"
      :project-id="projectId"
      :selected-work-item.sync="reportData.ids"
      :work-item-type="workItemDialogType"
      @close="workItemDialogShow = false"
      @success="tableTdEdit"
    ></work-item-choose>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 报告内容-表格相关
 * @desc
 * @author panhui
 * @date
 */
import HTTPINFOMAP from './HTTPINFOMAP'
import { debounce } from 'throttle-debounce'
import WorkItemChoose from './WorkItemChoose'
let vm

export default {
  name: 'ReportContentTable',
  components: {
    WorkItemChoose,
  },

  mixins: [],
  props: {
    reportData: {
      type: Object,
      required: true,
    },

    index: {
      type: Number,
      required: true,
    },

    projectId: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      HTTPINFOMAP,
      input: '',
      title: '',
      fiflterText: {
        1: i18n.t('需求'),
        2: i18n.t('任务'),
        3: i18n.t('缺陷'),
      },
      workItemDialogShow: false, // 需求、缺陷、任务选择 dialog status
    }
  },
  computed: {
    // 当前需要展示的工作项类型
    workItemDialogType() {
      let type = -1
      switch (this.reportData.workType) {
        case this.HTTPINFOMAP.reportContentTask:
          type = 2
          break
        case this.HTTPINFOMAP.reportContentBug:
          type = 3
          break
        case this.HTTPINFOMAP.reportContentRequirement:
          type = 1
          break
        case this.HTTPINFOMAP.reportContentServerRequirement:
          type = 1
          break
        case this.HTTPINFOMAP.reportContentClientRequirement:
          type = 1
          break
        default:
      }

      return type
    },
    showWorkItemChoose() {
      return [
        this.HTTPINFOMAP.reportContentTask,
        this.HTTPINFOMAP.reportContentBug,
        this.HTTPINFOMAP.reportContentRequirement,
        this.HTTPINFOMAP.reportContentServerRequirement,
        this.HTTPINFOMAP.reportContentClientRequirement,
      ].includes(this.reportData.workType)
    },
  },

  watch: {},
  mounted() {
    vm = this
  },
  updated() {
    vm = this
  },
  methods: {
    //选择编辑
    chooseBtn(val, data) {
      switch (val) {
        case this.HTTPINFOMAP.reportContentSprint:
          this.$emit('tableFun', {
            type: val,
            show: true,
            index: this.index,
            data,
            choose: 'true',
          })

          break
        case this.HTTPINFOMAP.reportContentFilter:
          this.$emit('tableFun', {
            type: val,
            show: true,
            index: this.index,
            data,
            choose: 'true',
          })

          break
        case this.HTTPINFOMAP.reportContentRequirement:
        case this.HTTPINFOMAP.reportContentBug:
        case this.HTTPINFOMAP.reportContentTask:
        case this.HTTPINFOMAP.reportContentClientRequirement:
        case this.HTTPINFOMAP.reportContentServerRequirement:
          this.workItemDialogShow = true
          break
        default:
      }
    },
    //删除
    deleteBtn(val, data) {
      this.$confirm(i18n.t('确认删除该报告内容?'), i18n.t('提示'), {
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      })
        .then(() => {
          this.$emit('tableFun', {
            type: val,
            show: true,
            index: this.index,
            data: data.request,
            choose: 'false',
          })
        })
        .catch(() => {})
    },
    //删除子内容
    deleteContent(val, data, parentInfo) {
      switch (val) {
        case this.HTTPINFOMAP.reportContentSprint:
          {
            let sprintIds = parentInfo.sprintIds.filter(item => {
              return item !== data.id
            })
            this.$emit('tableFun', {
              type: val,
              show: false,
              text: 'deleteContent',
              index: this.index,
              info: { sprintIds },
            })
          }
          break
        case this.HTTPINFOMAP.reportContentFilter:
          {
            let fiterIds = parentInfo.fiterIds.filter(item => {
              return item !== data.id
            })
            this.$emit('tableFun', {
              type: val,
              show: false,
              text: 'deleteContent',
              index: this.index,
              info: { fiterIds: fiterIds },
            })
          }
          break
        default:
      }
    },
    //title编辑之后
    inputBlur(val) {
      switch (val) {
        case this.HTTPINFOMAP.reportContentSprint:
        case this.HTTPINFOMAP.reportContentFilter:
          {
            let arr = this.reportData.contentDetails.map(item => {
              return { name: item.titleName, id: item.id }
            })
            this.$emit('tableFun', {
              type: val,
              show: false,
              text: 'edit',
              index: this.index,
              workTitle: this.reportData.titleContent,
              titleEdit: arr,
            })
          }

          break
        default:
          this.$emit('tableFun', {
            type: val,
            show: false,
            index: this.index,
            workTitle: this.reportData.titleContent,
          })
      }
    },
    // 编辑 table 内容
    tableTdEdit: debounce(300, true, () => {
      vm.$emit('tableEditableUpdate', vm.index)
      vm.workItemDialogShow = false
    }),
  },
}
</script>
<style lang="scss" scoped>
/deep/ .report-content-box {
  .custom-table-title,
  .custom-table-title-child-title {
    display: none;
  }
  .custom-table {
    margin-left: 5px;
  }
}
// .report-text {
//   height: 37px;
//   background-color: transparent;
//   line-height: 37px;
//   margin: 22px 5px 10px;
//   padding-right: 5px;
// }

.table-item {
  .report-title-input {
    width: 350px;
    margin: 0 5px 10px;
  }
  .co-icon-delete {
    display: none;
    float: right;
    line-height: 28px;
    padding: 0 3px;
    color: $--color-text-secondary;
    cursor: pointer;

    &:hover {
      color: $--color-primary;
    }
  }

  &:hover .co-icon-delete {
    display: block;
  }
}
// .report-text-close {
//   font-weight: bold;
//   color: red;
//   font-size: 16px;
//   margin-left: 5px;
// }
</style>
