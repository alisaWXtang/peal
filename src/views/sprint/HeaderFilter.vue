<template>
  <div
    v-loading="getLoading"
    class="header-fiter-box-comon"
    element-loading-text=" "
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
    :class="{ 'header-fiter-box-comon-en': $isEnglish() }"
  >
    <div class="header-filter-content sprint-header-filter-item__content">
      <el-form :inline="true">
        <!--        <el-form-item-->
        <!--          :label-width="$isEnglish() ? '20px' : '70px'"-->
        <!--          class="header-filter-item"-->
        <!--        >-->
        <!--          <el-input-->
        <!--            v-model="filterData.title"-->
        <!--            v-focus-->
        <!--            :placeholder="$t('请输入标题/ID,按enter键搜索')"-->
        <!--            class="header-filter-item-top"-->
        <!--            style="margin: 0 15px"-->
        <!--            @keyup.enter.native="filterClick"-->
        <!--          ></el-input>-->
        <!--          <el-button type="primary" @click="filterClick">{{-->
        <!--            $t('过滤')-->
        <!--          }}</el-button>-->
        <!--        </el-form-item>-->
        <el-form-item
          v-show="changeStatus == 1"
          style="float: left;margin-left: 20px;"
          label="处理人："
        >
          <op-select
            v-model="filterData.assignUsers"
            popper-append-to-body
            style="max-width: 180px;min-width: 80px;"
            :width="$isEnglish() ? '280' : '200'"
            :selected-label="$t('处理人')"
            custom-class="custom_select_popper"
            :is-user-select="true"
            :filter-placeholder="$t('输入拼音/工号/姓名')"
            mode="text"
            :data="assignUserFilterList"
            label-attr="value"
            value-attr="userId"
            :multiple="true"
            :group="false"
            @change="handlerFilter"
          ></op-select>
        </el-form-item>

        <div
          v-show="changeStatus != 1"
          style="position: absolute;right: 86px;top: 5px;"
        >
          <filter-dialog
            ref="filterDialog"
            :filter-elements="filterElements"
            title="过滤"
            :dis-x="24"
            :dis-y="24"
          >
            <el-link
              slot="reference"
              :class="isFilter ? 'filter-click' : ''"
              :underline="false"
              class="el-button-text icon iconfont icon-guolv1 hover-filter"
              style="font-size: 14px;"
              >{{ $t('过滤') }}
            </el-link>
            <div slot="content" class="header-base-filter-box">
              <div class="header-content-box">
                <!-- 已选项标签 -->
                <!--                <div class="checked-tag-box">-->
                <!--                  <BaseTags-->
                <!--                    :tags="tags"-->
                <!--                    @handleCloseTag="-->
                <!--                      type => {-->
                <!--                        handleCloseTag(type)-->
                <!--                      }-->
                <!--                    "-->
                <!--                  />-->
                <!--                </div>-->
                <!--  选择框-->
                <!-- 需求变更 - 如果存在需求则提供需求状态 -->
                <div v-if="workItemType.req" class="filter-item-wrap">
                  <div class="filter-item-title">{{ $t('需求状态') }}</div>
                  <op-select
                    v-model="filterData.reqtStatusIds"
                    :width="$isEnglish() ? '260' : '200'"
                    :selected-label="$t('需求状态')"
                    custom-class="custom_select_popper"
                    mode="text"
                    :data="requireStatusFilterList"
                    label-attr="statusName"
                    value-attr="statusId"
                    color-attr="color"
                    :multiple="true"
                    :group="false"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('需求状态'),
                          value,
                          'reqtStatusIds',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'reqtStatusIds')
                      }
                    "
                  ></op-select>
                </div>
                <!-- 需求变更 - 如果存在任务，则提供任务状态 -->
                <div v-if="workItemType.task" class="filter-item-wrap">
                  <div class="filter-item-title">{{ $t('任务状态') }}</div>
                  <op-select
                    v-model="filterData.taskStatusIds"
                    :width="$isEnglish() ? '260' : '200'"
                    :selected-label="$t('任务状态')"
                    custom-class="custom_select_popper"
                    mode="text"
                    :data="taskStatusFilterList"
                    label-attr="statusName"
                    value-attr="statusId"
                    color-attr="color"
                    :multiple="true"
                    :group="false"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('任务状态'),
                          value,
                          'taskStatusIds',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'taskStatusIds')
                      }
                    "
                  ></op-select>
                </div>
                <div v-if="workItemType.bug" class="filter-item-wrap">
                  <div class="filter-item-title">{{ $t('缺陷状态') }}</div>
                  <op-select
                    v-model="filterData.defectStatusIds"
                    :width="$isEnglish() ? '260' : '200'"
                    :selected-label="$t('缺陷状态')"
                    custom-class="custom_select_popper"
                    mode="text"
                    :data="bugStatusFilterList"
                    label-attr="statusName"
                    value-attr="statusId"
                    color-attr="color"
                    :multiple="true"
                    :group="false"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('缺陷状态'),
                          value,
                          'defectStatusIds',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'defectStatusIds')
                      }
                    "
                  ></op-select>
                </div>
                <div
                  v-if="
                    workItemType.bug || workItemType.req || workItemType.task
                  "
                  class="filter-item-wrap"
                >
                  <div class="filter-item-title">{{ $t('处理人') }}</div>
                  <op-select
                    v-model="filterData.assignUsers"
                    :width="$isEnglish() ? '280' : '200'"
                    :selected-label="$t('处理人')"
                    custom-class="custom_select_popper"
                    :is-user-select="true"
                    :filter-placeholder="$t('输入拼音/工号/姓名')"
                    mode="text"
                    :data="assignUserFilterList"
                    label-attr="value"
                    value-attr="userId"
                    :multiple="true"
                    :group="false"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('处理人'),
                          value,
                          'assignUsers',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'assignUsers')
                      }
                    "
                  ></op-select>
                </div>
                <div
                  v-if="
                    workItemType.bug || workItemType.req || workItemType.task
                  "
                  class="filter-item-wrap"
                >
                  <div class="filter-item-title">{{ $t('优先级') }}</div>
                  <op-select
                    v-model="filterData.priorities"
                    :selected-label="$t('优先级')"
                    custom-class="custom_select_popper"
                    mode="text"
                    :data="prioritiesFilterList"
                    label-attr="literal"
                    value-attr="priority"
                    color-attr="color"
                    :multiple="true"
                    :group="false"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('优先级'),
                          value,
                          'priorities',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'priorities')
                      }
                    "
                  ></op-select>
                </div>
                <div
                  v-if="workItemType.priority === 2 || workItemType.bug"
                  class="filter-item-wrap"
                >
                  <div class="filter-item-title">{{ $t('严重程度') }}</div>
                  <op-select
                    v-model="filterData.priorities"
                    :width="$isEnglish() ? '260' : '200'"
                    :selected-label="$t('严重程度')"
                    custom-class="custom_select_popper"
                    mode="text"
                    :data="bugPrioritiesFilterList"
                    label-attr="literal"
                    value-attr="priority"
                    color-attr="color"
                    :multiple="true"
                    :group="false"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('严重程度'),
                          value,
                          'priorities',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'priorities')
                      }
                    "
                  ></op-select>
                </div>
                <!-- 延期 -->
                <div
                  v-if="
                    workItemType.bug || workItemType.req || workItemType.task
                  "
                  class="filter-item-wrap"
                >
                  <div class="filter-item-title">{{ $t('延期类型') }}</div>
                  <op-select
                    v-model="filterData.delayTypes"
                    :width="$isEnglish() ? '280' : '200'"
                    :selected-label="$t('延期类型')"
                    custom-class="custom_select_popper"
                    :filter-placeholder="$t('输入延期类型')"
                    mode="text"
                    :data="delayTypesFilterList"
                    label-attr="label"
                    value-attr="value"
                    :multiple="true"
                    :group="false"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('延期类型'),
                          value,
                          'delayTypes',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'delayTypes')
                      }
                    "
                  ></op-select>
                </div>

                <!-- <el-form-item v-if="workItemType.priority === 3">
                  <op-select
                    v-model="filterData.priorities"
                    selected-label="优先级"
                    mode="text"
                    :data="userPrioritiesFilterList"
                    label-attr="value"
                    value-attr="key"
                    color-attr="color"
                    :multiple="true"
                    :group="false"
                    @change="
                      value => {
                        onFilterChange(value, 'priorities')
                      }
                    "
                  ></op-select>
                </el-form-item> -->
              </div>
              <div class="footer-button-box">
                <el-button @click="onClearFilter">清空条件</el-button>
                <el-button
                  type="primary"
                  style="border: 1px solid $--color-primary;"
                  @click.stop="handlerFilter"
                  >过滤</el-button
                >
              </div>
            </div>
          </filter-dialog>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script>
import OpSelect from '@/components/op-select'
import * as bugService from '@/service/bug'
import { queryOptions } from '@/service/work-status-flow'
import FilterDialog from '@/components/filter-dialog'
// import BaseTags from '@/components/base-tags'

export default {
  name: 'HeaderFilter',
  components: {
    OpSelect,
    FilterDialog,
    // BaseTags,
  },

  props: {
    projectId: {
      type: [Number, String],
      required: true,
    },
    changeStatus: {
      type: String,
      default: '',
    },
    workItemType: {
      type: Object,
      required: false,
      default: () => {
        return { req: true, task: true, bug: true }
      },
    },
  },

  data() {
    return {
      filterElements: [], // 过滤组件
      isFilter: false, // 是否已过滤
      requireStatusFilterList: [], // 需求状态选项列表
      taskStatusFilterList: [], // 任务状态选项列表
      bugStatusFilterList: [], // 缺陷状态选项列表
      assignUserFilterList: [], // 处理人选项列表
      delayTypesFilterList: [], //延期类型选项列表
      prioritiesFilterList: [], // 优先级选项列表
      bugPrioritiesFilterList: [], // 缺陷优先级选项列表
      userPrioritiesFilterList: [], // 成员视图优先级选项列表
      tags: {
        sprintIds: {},
        assignUsers: {},
        // requireIds: {},
        statusIds: {},
        priorities: {},
        causes: {},
        createUsers: {},
        createTimes: {},
        updateTimes: {},
        finishTimes: {},
        delayTypes: {},
      },
      // 过滤器表单
      filterData: {
        reqtStatusIds: [],
        taskStatusIds: [],
        defectStatusIds: [],
        priorities: [],
        assignUsers: [],
        title: '',
        delayTypes: [],
      },

      causeList: [], // 原因列表
      getLoading: false,
    }
  },
  computed: {},
  watch: {
    requireTaskData() {
      for (let i = 0; i < this.requireTaskData.length; i++) {
        this.causeList.push(this.requireTaskData[i].data)
      }
    },
    workItemType: {
      deep: true,
      handler() {
        if (this.workItemType.priority !== 3) {
          if (!this.workItemType.req) {
            this.filterData.reqtStatusIds = []
            if (this.tags.reqtStatusIds) {
              this.handleCloseTag('reqtStatusIds')
            }
          }
          if (!this.workItemType.task) {
            this.filterData.taskStatusIds = []
            if (this.tags.taskStatusIds) {
              this.handleCloseTag('taskStatusIds')
            }
          }
          if (!this.workItemType.bug) {
            this.filterData.defectStatusIds = []
            if (this.tags.defectStatusIds) {
              this.handleCloseTag('defectStatusIds')
            }
          }
          if (
            !this.workItemType.req &&
            !this.workItemType.task &&
            !this.workItemType.bug
          ) {
            // this.clearAllTag()
            this.onClearFilter()
            this.filterClick()
          }
        }
      },
    },
    filterData: {
      handler(val) {
        let state = this.hasValue(val)
        let custom = false
        if (val['userDefinedAttrs']) {
          custom = this.hasValue(val['userDefinedAttrs'])
        }
        this.isFilter = state || custom
      },
      deep: true,
    },
  },

  created() {},
  mounted() {
    // this.filterElements.push(this.$refs.elDialogBox.$el) // 保存过滤器
    this.getFilterListData()
  },
  methods: {
    handleCloseTag(type) {
      if (this.tags[type].clearFun) this.tags[type].clearFun()
    },
    // 点击过滤
    handlerFilter() {
      // this.onChangeFilter()
      this.filterClick()
      this.$refs.filterDialog.handleClose()
    },
    clearAllTag() {
      this.tags = {
        sprintIds: {},
        assignUsers: {},
        // requireIds: {},
        statusIds: {},
        priorities: {},
        causes: {},
        createUsers: {},
        createTimes: {},
        updateTimes: {},
        finishTimes: {},
      }
    },
    // 判断是否有过滤条件
    hasValue() {
      for (let key in this.filterData) {
        const item = this.filterData[key]
        if (Array.isArray(item)) {
          if (item.length && item[0] !== 'all') {
            return true
          }
        } else if (typeof item === 'string') {
          if (item !== '' && item) {
            return true
          }
        }
      }
      return false
    },
    onClearFilter() {
      this.clearAllTag()
      this.filterData = {
        reqtStatusIds: [],
        taskStatusIds: [],
        defectStatusIds: [],
        priorities: [],
        assignUsers: [],
        delayTypes: [],
        title: '',
      }
      // this.filterClick()
      // this.$refs.filterDialog.handleClose()
    },
    onFilterChange() {
      // console.log('filterData!!!!!!!!!!', this.filterData)
      console.log('onFilterChange')
      // this.filterClick()
    },
    // 修改tags数据
    setFilterDataLabel(updateData, name, value, type, label, clearFun) {
      // console.log(123123, value, type, label)
      this.$set(updateData, type, {
        ...updateData[type],
        name,
        label,
        value,
        type,
        clearFun,
      })
    },
    // 获取原因列表
    async getCauseList() {
      let result = {}
      try {
        result = await bugService.causeList({
          projectId: this.projectId,
        })
      } catch (_) {
        result.status = 0
      }
      if (result.status === 200) {
        this.causeList = result.data
      }
    },
    // 获取需求状态过滤选项列表数据
    async getRequireStatusFilterList() {
      let result = await bugService.allStatusList({
        projectId: +this.projectId,
        workItemType: 1,
      })

      if (result.status === 200) {
        this.requireStatusFilterList = result.data.map(item => {
          return {
            key: item.statusId,
            value: item.statusName,
            ...item,
          }
        })
      }
    },
    // 获取任务状态过滤选项列表数据
    async getTaskStatusFilterList() {
      let result = await bugService.allStatusList({
        projectId: +this.projectId,
        workItemType: 2,
      })

      if (result.status === 200) {
        this.taskStatusFilterList = result.data.map(item => {
          return {
            key: item.statusId,
            value: item.statusName,
            ...item,
          }
        })
      }
    },
    // 获取缺陷状态过滤选项列表数据
    async getBugStatusFilterList() {
      let result = await bugService.allStatusList({
        projectId: +this.projectId,
        workItemType: 3,
      })

      if (result.status === 200) {
        this.bugStatusFilterList = result.data.map(item => {
          return {
            key: item.statusId,
            value: item.statusName,
            ...item,
          }
        })
      }
    },
    // 获取处理人过滤选项列表数据
    async getAssignUserFilterList() {
      let result = await bugService.assignUsersList({
        projectId: this.projectId,
      })

      if (result.status === 200) {
        this.assignUserFilterList = result.data.map(item => {
          return {
            key: item.userId,
            value: item.userName + '(' + item.userId + ')',
            ...item,
          }
        })
      }
    },

    // 获取延期过滤选项列表数据
    async getdelayFilterList() {
      let result = await queryOptions({
        projectId: this.projectId,
        workItemType: 1,
        attrName: 'delayType',
      })

      if (result.status === 200) {
        this.delayTypesFilterList = result.data.map(item => {
          return {
            key: item.value,
            value: item.value,
            ...item,
          }
        })
      }
    },

    // 获取优先级过滤选项列表数据
    async getPrioritiesFilterList() {
      let result = await bugService.priorityList({
        projectId: this.projectId,
        workItemType: 1,
      })

      if (result.status === 200) {
        this.prioritiesFilterList = result.data.map(item => {
          return {
            key: item.priority,
            value: item.literal,
            ...item,
          }
        })
      }
      let res = await bugService.priorityList({
        projectId: this.projectId,
        workItemType: 3,
      })

      if (res.status === 200) {
        this.bugPrioritiesFilterList = res.data.map(item => {
          return {
            key: item.priority,
            value: item.literal,
            ...item,
          }
        })
      }
      if (res.status === 200 && result.status === 200) {
        this.userPrioritiesFilterList = []
        let resList = res.data.map(item => {
          return {
            key: item.priority,
            value: item.literal,
            ...item,
          }
        })
        let resultList = result.data.map(item => {
          return {
            key: -item.priority,
            value: item.literal,
            ...item,
          }
        })
        this.userPrioritiesFilterList = resultList.concat(resList)
      }
    },
    // 获取缺陷优先级过滤选项列表数据
    async getBugPrioritiesFilterList() {
      let result = await bugService.priorityList({
        projectId: this.projectId,
        workItemType: 3,
      })

      if (result.status === 200) {
        this.bugPrioritiesFilterList = result.data.map(item => {
          return {
            key: item.priority,
            value: item.literal,
            ...item,
          }
        })
      }
    },
    // 获取过滤选项列表数据
    getFilterListData() {
      this.getRequireStatusFilterList()
      this.getTaskStatusFilterList()
      this.getAssignUserFilterList()
      this.getdelayFilterList()
      this.getPrioritiesFilterList()
      this.getBugStatusFilterList()
    },
    // 过滤处理
    filterClick() {
      let data = { ...this.filterData }
      data.reqtStatusIds = data.reqtStatusIds.filter(item => {
        return item != 'all'
      })
      data.taskStatusIds = data.taskStatusIds.filter(item => {
        return item != 'all'
      })
      data.defectStatusIds = data.defectStatusIds.filter(item => {
        return item != 'all'
      })
      data.priorities = data.priorities.filter(item => {
        return item != 'all'
      })
      data.assignUsers = data.assignUsers.filter(item => {
        return item != 'all'
      })
      data.delayTypes = data.delayTypes.filter(item => {
        return item != 'all'
      })
      data.priorities = data.priorities.map(item => {
        return Math.abs(item)
      })
      data.priorities = [...new Set(data.priorities)]
      // 需求变更 - 如果同时存在需求和任务，则不提供需求状态和任务状态 add by heyunjiang on 2020.1.22
      // if (this.workItemType.req && this.workItemType.task) {
      //   delete data.reqtStatusIds
      //   delete data.taskStatusIds
      // }
      this.$emit('filterClick', data)
      // this.$refs.filterDialog.handleClose()
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/project/ProjectCommon';
@mixin ellipsis {
  overflow: hidden !important;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.header-filter-item-option-label {
  display: inline-block;
  height: auto;
  width: calc(100% - 30px);
  vertical-align: top;
}
.header-filter-item-option-delete {
  padding: 0 3px;
  &:hover {
    color: #409eff;
  }
}
.header-base-filter-box {
  padding-top: 16px;
  height: calc(100% - 60px);
  overflow-y: auto;
  .checked-tag-box {
    div {
      line-height: 0;
    }
    span {
      margin-bottom: 8px;
      border-width: 0;
      border-radius: 4px;
      color: $--color-primary;
      font-size: 12px;
      width: auto;
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-right: 22px;
      /deep/ i {
        position: absolute;
        right: 5px;
        top: 6px;
      }
    }
  }
  .filter-item-wrap {
    margin-bottom: 20px;
    .filter-item-title {
      margin-bottom: 4px;
    }
    &:hover {
      /deep/ .el-icon-close {
        display: block;
      }
    }
  }
  .select-filter-item-box {
    width: 100%;
    /deep/ .el-input__inner {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      height: 30px;
      padding: 0 12px;
      &:hover {
        border-color: $--color-primary;
        color: #666666;
      }
    }
    /deep/ .el-input__suffix {
      color: #bfbfbf;
      right: 9px;
    }
  }
  .footer-button-box {
    position: absolute;
    right: 24px;
    bottom: 16px;
  }
  .more-filter {
    color: $--color-primary;
  }
  .select-wrap_focus {
    //border-color: $--color-primary;
    color: #666666;
  }
}
.select-filter-wrap {
  position: relative;
  display: inline-block;
  line-height: 0;
  margin-top: 5px;
}

.select-title {
  padding: 0px 24px 5px 10px;
  border-radius: 3px;
  height: 20px;
  line-height: 20px;
  transition: all 0.2s;
  cursor: pointer;
  &:hover {
    background-color: rgb(223, 226, 231);
  }
  .content {
    @include ellipsis;
    display: inline-block;
    min-width: 64px;
  }
  .el-icon-arrow-down {
    right: 5px;
    top: 50%;
    margin-top: -7px;
  }
  .el-icon-close {
    border-radius: 10%;
    background-color: #6b778c;
    color: #fff;
    font-weight: 700;
    padding: 2px;
    right: 5px;
    top: 6px;
    transform: scale(0.8);
    &:hover {
      background-color: #344563 !important;
    }
  }
}
.select-title__active {
  background-color: rgb(52, 69, 99) !important;
  color: #fff;
}

/deep/ .selecter {
  top: 0;
  visibility: hidden;
  width: 0;
  .el-select__tags {
    display: none;
    background-color: transparent;
  }
}
/deep/ .select-title {
  padding: 5px 24px 5px 10px;
}
.header-fiter-box-comon-en {
  margin-bottom: 10px;
  z-index: 1;
}
.el-form-item {
  margin-bottom: 0;
}
.hover-filter {
  /deep/ .el-link--inner {
    margin-left: 6px !important;
  }
}
</style>
