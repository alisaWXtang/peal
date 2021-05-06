<template>
  <div
    v-loading="getLoading"
    element-loading-text=" "
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
    class="header-fiter-box-comon"
  >
    <el-form :inline="true" class="main-form">
      <div>
        <el-form-item>
          <FilterSelect
            v-model="filterTypeValue"
            storage-visible-key="filterSelectTip"
            custom-class="custom_select_popper"
            :data="customFilterList"
            @change="
              customFilterChoose(filterTypeValue, filterChangeType.switch)
            "
            @deleteItem="filterDeleteClick"
            @defaultItem="defaultFilter"
          ></FilterSelect>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterData.title"
            clearable
            :placeholder="$t('请输入标题/ID,按enter键搜索')"
            class="header-filter-formitem-input"
            @clear="filterClick"
            @keyup.enter.native="filterClick"
          ></el-input>
        </el-form-item>
      </div>
      <div>
        <el-form-item class="right-button-distance">
          <el-button
            v-show="$authFunction('FUNC_COOP_TASK_CREATE', 3, projectId)"
            type="primary"
            icon="co-icon-add"
            class="el-button-text"
            @click="newTaskBtnClick"
            >{{ $t('新建任务') }}</el-button
          >
        </el-form-item>
        <el-form-item class="right-cut-off-rule right-distance">
          <el-dropdown>
            <el-link
              :underline="false"
              suffix-icon="co-icon-arrow-down"
              class="el-button-text"
            >
              {{ viewTypeNotice }}
            </el-link>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item>
                <span
                  :class="viewType === 'status' ? 'page-type' : ''"
                  @click="viewChang('status')"
                  >{{ $t('状态视图') }}</span
                >
              </el-dropdown-item>
              <el-dropdown-item>
                <span
                  :class="viewType === 'members' ? 'page-type' : ''"
                  @click="viewChang('members')"
                  >{{ $t('人员视图') }}</span
                >
              </el-dropdown-item>
              <el-dropdown-item>
                <span
                  :class="viewType === 'list' ? 'page-type' : ''"
                  @click="viewChang('list')"
                  >{{ $t('列表视图') }}</span
                >
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-form-item>
        <el-form-item
          v-if="orderBtnShow"
          class="right-cut-off-rule right-distance"
        >
          <task-order @orderChange="orderChange"></task-order>
        </el-form-item>
        <el-form-item class="right-cut-off-rule right-distance">
          <filter-dialog
            ref="filterDialog"
            :filter-elements="filterElements"
            title="过滤"
          >
            <el-link
              slot="reference"
              :class="isFilter ? 'filter-click' : ''"
              :underline="false"
              class="el-button-text icon iconfont icon-guolv1 hover-filter"
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
                <div class="filter-item-wrap">
                  <div>{{ $t('迭代') }}</div>
                  <op-group-select
                    v-model="filterData.sprintIds"
                    :data="sprintFilterList"
                    :selected-label="$t('迭代')"
                    custom-class="custom_select_popper"
                    mode="text"
                    label-attr="name"
                    value-attr="id"
                    width="100%"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('迭代'),
                          value,
                          'sprintIds',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'sprintIds')
                      }
                    "
                    @click="getProjectSprintList"
                  />
                </div>
                <div class="filter-item-wrap">
                  <div>{{ $t('处理人') }}</div>
                  <op-select
                    v-model="filterData.assignUsers"
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
                    :popper-append-to-body="true"
                    width="100%"
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
                  />
                </div>
                <div class="filter-item-wrap">
                  <div>{{ $t('状态') }}</div>
                  <op-select
                    v-model="filterData.statusIds"
                    :selected-label="$t('状态')"
                    custom-class="custom_select_popper"
                    mode="text"
                    :data="statusFilterList"
                    label-attr="statusName"
                    value-attr="statusId"
                    color-attr="color"
                    :multiple="true"
                    :group="false"
                    :popper-append-to-body="true"
                    width="100%"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('状态'),
                          value,
                          'statusIds',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'statusIds')
                      }
                    "
                  />
                </div>
                <div class="filter-item-wrap">
                  <div>{{ $t('优先级') }}</div>
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
                    :popper-append-to-body="true"
                    width="100%"
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
                  />
                </div>
                <div class="filter-item-wrap">
                  <div>{{ $t('创建人') }}</div>
                  <op-select
                    v-model="filterData.createUsers"
                    :selected-label="$t('创建人')"
                    custom-class="custom_select_popper"
                    :is-user-select="true"
                    :filter-placeholder="$t('输入拼音/工号/姓名')"
                    mode="text"
                    :data="assignUserFilterList"
                    label-attr="value"
                    value-attr="userId"
                    :multiple="true"
                    :group="false"
                    :popper-append-to-body="true"
                    width="100%"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('创建人'),
                          value,
                          'createUsers',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'createUsers')
                      }
                    "
                  />
                </div>
                <!-- 渲染静态选中项 -->
                <template v-for="item in selectedStaticCustomFilter">
                  <div :key="item.key" class="filter-item-wrap">
                    <div>{{ item['fieldName'] }}</div>
                    <more-form-item
                      v-model="filterData[item.key]"
                      :type="item.attrValue"
                      :popper-append-to-body="true"
                      :filter-field="true"
                      :selected-label="item['fieldName']"
                      :select-list="
                        item.key === 'parentRequireIds' ||
                        item.key === 'requireIds'
                          ? requirementFilterList
                          : []
                      "
                      :assign-user-filter-list="
                        item.key === 'relevantUsers' ? assignUserFilterList : []
                      "
                      :delay-select-list="
                        item.key === 'delayTypes' ? delaySelectList : []
                      "
                      @setFilterDataLabel="
                        (value, label, clearFun) => {
                          setFilterDataLabel(
                            tags,
                            item['fieldName'],
                            value,
                            item.key,
                            label,
                            clearFun,
                          )
                        }
                      "
                      @change="onMoreFilterChange"
                      @cancel="onCustomCancel"
                    />
                  </div>
                </template>
                <!-- 渲染自定义选中项 -->
                <template v-for="item in selectedCUSTOMFIELDVALUES">
                  <div :key="item.key" class="filter-item-wrap">
                    <div>{{ item['fieldName'] }}</div>
                    <more-form-item
                      v-model="filterData.userDefinedAttrs[item.key]"
                      :selected-label="item.value"
                      :popper-append-to-body="true"
                      :type="
                        item.attrValue === 'LITE_DATE_ATTR'
                          ? 'LITE_DATE_RANGE_ATTR'
                          : item.attrValue
                      "
                      :select-list="item.fieldEditProps.selectValue"
                      :filter-field="true"
                      :item="item"
                      @setCustomTags="
                        (value, label, clearFun) => {
                          setFilterDataLabel(
                            tags,
                            item['fieldName'],
                            value,
                            item.key,
                            label,
                            clearFun,
                          )
                        }
                      "
                      @change="onMoreFilterChange"
                      @cancel="onCustomCancel"
                    />
                  </div>
                </template>
                <MoreFilter
                  v-model="moreFilter"
                  :selected-label="$t('更多过滤条件')"
                  custom-class="custom_select_popper"
                  owner="task"
                  :multiple="true"
                  :data="FieldEditProps"
                  :state-fixed-custom-field-list="
                    stateAndFixedAndCustomFieldList
                  "
                  :default-field-list="defaultFieldList"
                  @change="onMoreSelectChange"
                  @cancelValue="onMoreSelectCancelVal"
                >
                  <el-link slot="text" :underline="false" class="more-filter">
                    {{ $t('更多过滤条件') }}
                  </el-link>
                </MoreFilter>
              </div>
              <div class="footer-button-box">
                <el-button @click="onClearFilter">清空条件</el-button>
                <el-button @click="filterSaveClick">保存过滤器</el-button>
                <el-button type="primary" @click.stop="handlerFilter"
                  >过滤</el-button
                >
              </div>
            </div>
          </filter-dialog>
        </el-form-item>
        <el-form-item>
          <el-dropdown>
            <el-link
              :underline="false"
              suffix-icon="co-icon-arrow-down"
              class="el-button-text"
            >
              {{ $t('更多操作') }}
            </el-link>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <!-- <el-dropdown-item>
                <span @click="taskModel">{{ $t('下载导入模板') }}</span>
              </el-dropdown-item> -->
              <el-dropdown-item
                v-show="
                  $authFunction('FUNC_COOP_TASK_EXCEL_INPUT', 3, projectId)
                "
                @click.native="ImpVaildDialogShow = true"
              >
                <!-- <el-upload
                  :action="importObject.importUrl"
                  :data="importObject.importData"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="uploadSuccess"
                  multiple
                  :before-upload="fileValidCheck"
                > -->
                <span type="primary">{{ $t('导入任务') }}</span>
                <!-- </el-upload> -->
              </el-dropdown-item>
              <el-dropdown-item
                v-show="
                  $authFunction('FUNC_COOP_TASK_EXPORT', 3, projectId) &&
                    changeStatus === '2'
                "
                @click.native="exportSelectDialogShow = true"
              >
                <span>{{ $t('导出') }}Excel</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-form-item>
      </div>
    </el-form>
    <el-dialog
      ref="elDialogBox"
      :title="$t('保存过滤器')"
      :visible.sync="filterSaveDialog.status"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="400px"
      class="save-filter-dialog"
    >
      <el-form @submit.native.prevent>
        <el-form-item
          class="header-input"
          :label="$t('过滤器名称')"
          label-width="90px"
        >
          <el-input
            v-model.trim="filterSaveDialog.name"
            :placeholder="$t('请输入过滤器名称')"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox
            v-show="$authFunction('FUNC_COOP_FILTER_PUBLIC', 3, projectId)"
            v-model="filterSaveDialog.isProjectFilter"
            size="medium"
            class="checkout-item"
            ><span
              >{{ $t('设置为项目过滤器') }}，{{
                $t('项目的所有成员可使用该过滤器')
              }}</span
            ></el-checkbox
          >
          <el-checkbox
            v-model="filterSaveDialog.isDefaultFilter"
            size="medium"
            class="checkout-item"
            ><span>{{ $t('设为我的默认过滤器') }}</span></el-checkbox
          >
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="postFilterCustomInfo">{{
          $t('确定')
        }}</el-button>
      </span>
    </el-dialog>
    <!-- 导入结果 -->
    <ImportDialog
      :visible.sync="importDialogVisible"
      :result.sync="importResult"
      :destroy-on-close="true"
    ></ImportDialog>
    <!-- 导出选择弹窗 -->
    <ExportSelectDialog
      :visible.sync="exportSelectDialogShow"
      :work-item-type="workItemType"
      :project-id="projectId"
      @exportExcelPassValue="exportExcelPassValue"
    ></ExportSelectDialog>
    <!-- 导入验证弹窗 -->
    <ImportValidDialog
      :visible.sync="ImpVaildDialogShow"
      :title="2"
      @imported="filterClick(true)"
    ></ImportValidDialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 任务顶部过滤器
 * @desc
 * @author heyunjiang
 * @date
 */

import TaskOrder from './TaskOrder'
// import searchSprintTreeMultipleSelect from '@/pages/commonComponents/searchSprintTreeMultipleSelect'; //SprintMultipleSelect
// import SprintMultipleSelect from '@/pages/commonComponents/SprintMultipleSelect';
// import FieldEdit from '@/pages/tool/FieldEdit';
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import FilterCommonMixin from '@/mixin/FilterCommonMixin'
import ImportValidDialog from '@/components/ImportValidDialog'
import OpGroupSelect from '@/components/op-group-select'
import FilterSelect from '@/components/filter-select'
import OpSelect from '@/components/op-select'
// import OpMoreSelect from '@/components/op-more-select'
import MoreFormItem from '@/components/op-more-select/formItem'
import cloneDeep from 'lodash/cloneDeep'
// import TableHeaderCustomField from '@/pages/project/TableHeaderCustomField';
// import FilterFunctionTips from '@/components/biz/filter-function-tips'
import ImportDialog from '@/components/import-dialog'
import MoreFilter from '@/components/more-filter'
// import HeaderBaseFilter from '@/views/task/components/HeaderBaseFilter'
import FilterDialog from '@/components/filter-dialog'
// import BaseTags from '@/components/base-tags'
import ExportSelectDialog from '@/components/ExportSelectDialog'
import { FilterChangeType } from '@/utils/project.config'
import { taskImportApi } from '@/api/task'
import { getUploadHeaders } from '@/utils'
import { getRealUrl } from '@/utils/sub-app-util'
export default {
  name: 'HeaderFilter',
  components: {
    TaskOrder,
    // SprintMultipleSelect,
    // FieldEdit,
    // searchSprintTreeMultipleSelect,
    OpGroupSelect,
    OpSelect,
    // OpMoreSelect,
    MoreFormItem,
    // TableHeaderCustomField,
    FilterSelect,
    // FilterFunctionTips,
    ImportDialog,
    // HeaderBaseFilter,
    FilterDialog,
    // BaseTags,
    ExportSelectDialog,
    MoreFilter,
    ImportValidDialog,
  },

  mixins: [ProjectCommonMixin, FilterCommonMixin],
  props: {
    orderBtnShow: {
      type: Boolean,
      required: false,
      default: false,
      desc: '是否展示排序',
    },
    changeStatus: {
      type: String,
      required: true,
      default: '1',
      desc: '列表模式展示导出',
    },
  },

  data() {
    return {
      uploadHeaders: getUploadHeaders(),
      importDialogVisible: false,
      ImpVaildDialogShow: false,
      exportSelectDialogShow: false,
      filterElements: [],
      importResult: {},
      filterChangeType: FilterChangeType,
      filterPropverVisible: false,
      workItemType: 2,
      moreFilter: [],
      filterDataCopy: {},
      currentOwner: 'task',
      viewType: 'status',
      tags: {
        sprintIds: {},
        assignUsers: {},
        requireIds: {},
        statusIds: {},
        priorities: {},
        createUsers: {},
        createTimes: {},
        startTimes: {},
        finishTimes: {},
        endTimes: {},
        relevantUsers: {},
      },
      // 过滤器表单
      filterData: {
        title: '',
        sprintIds: [],
        assignUsers: [],
        requireIds: [],
        statusIds: [],
        priorities: [],
        createUsers: [],
        createTimes: [],
        startTimes: [],
        finishTimes: [],
        endTimes: [],
        relevantUsers: [],
        userDefinedAttrs: {},
        updateTimes: [],
        parentRequireIds: [],
        delayTypes: [],
      },
      isFilter: false, // 是否已过滤
      importObject: {
        importUrl: getRealUrl(taskImportApi.url),
        importData: {
          projectId: this.projectId,
        },
      },
    }
  },
  computed: {
    filterTypeLabel() {
      let label = ''
      this.customFilterList.forEach(group => {
        group.options.forEach(item => {
          if (item.key === this.filterTypeValue) {
            label = item.value
          }
        })
      })
      if (label == '') {
        label = i18n.t('全部任务')
      }
      return label
    },
    viewTypeNotice() {
      if (this.viewType === 'status') {
        return i18n.t('状态视图')
      } else if (this.viewType === 'members') {
        return i18n.t('人员视图')
      }
      return i18n.t('列表视图')
    },
  },

  watch: {
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
  mounted() {
    this.filterElements.push(this.$refs.elDialogBox.$el)
    setTimeout(() => {
      this.initData()
    }, 0)
  },
  methods: {
    // 点击 - 下载导入模板
    taskModel() {
      this.$emit('taskModel')
    },
    // 上传成功
    uploadSuccess(res) {
      const result = {}
      if (res.status === 200) {
        result.type = 'success'
        result.msg = res.msg || i18n.t('上传成功')
        this.$emit('uploadSuccess')
      } else {
        res.data?.succNum && this.$emit('uploadSuccess')
        result.type = 'warn'
        const url = res.data ? getRealUrl(res.data.url) : res.data?.url
        const link = url
          ? `，下载 <a class="common__a" href="${url}" target="_blank">错误文件</a> 查看导入失败原因。`
          : ''
        result.msg = `<span>${res.msg || i18n.t('上传失败')}${link}</span>`
      }
      this.importResult = result
    },
    // 文件上传 - 名称控制
    fileValidCheck(file) {
      // 新增文件名长度控制
      if (file.name && file.name.length > 230) {
        this.$message({
          message: i18n.t('文件名过长'),
          type: 'error',
        })

        return false
      }
      this.importDialogVisible = true
      return true
    },
    // 更多过滤条件取消 x 项时 删除对应http下发参数
    onMoreSelectCancelVal(val) {
      if (this.filterData[val]) {
        this.$set(this.filterData, val, [])
      } else {
        delete this.filterData.userDefinedAttrs[val]
      }
      // this.onChangeFilter()
    },
    onMoreFilterChange() {
      this.setUserCustomFilterHandle()
      // this.onChangeFilter()
      // 手动选择过滤条件清掉url带的过滤器id
      this.filterItemChange()
    },
    setUserCustomFilterHandle() {
      // if (!isEqual(this.filterData, this.filterDataCopy)) {
      //   this.filterTypeValue = 'all'
      // }
      this.filterTypeValue = 'all'
    },
    onFilterChange(value, type) {
      if (type === 'sprintIds') {
        // 这里重构前的业务逻辑 但是调用会报错 先注释
        // this.recordFun(value);
      } else {
        this.handleSelectChange(value, type)
      }
      this.setUserCustomFilterHandle()
      // this.onChangeFilter()
      // 手动选择过滤条件清掉url带的过滤器id
      this.filterItemChange()
    },
    onMoreSelectChange(val) {
      this.FieldEditProps.onChange(val)
    },
    onCustomCancel(val) {
      this.selectedStaticCustomFilter.forEach((item, index) => {
        if (item.key === val) {
          this.selectedStaticCustomFilter.splice(index, 1)
          this.$set(this.filterData, val, [])
        }
      })
      this.selectedCUSTOMFIELDVALUES.forEach((item, index) => {
        if (item.key === val) {
          this.selectedCUSTOMFIELDVALUES.splice(index, 1)
        }
        delete this.filterData.userDefinedAttrs[val]
      })
      this.moreFilter = this.selectedStaticCustomFilter.concat(
        this.selectedCUSTOMFIELDVALUES,
      )

      // this.onChangeFilter()
    },
    handleTitleClick() {
      this.$refs.filterSelect.$el.click()
    },
    onVisibleChange() {
      this.filterPropverVisible = !this.filterPropverVisible
    },
    //判断已归档还是未归档
    recordFun(val) {
      // console.log(val)
      this.$emit('sprintTypeFun', val)
    },
    // 点击过滤
    filterClick(forceRequest) {
      this.filterDataCopy = cloneDeep(this.filterData)
      this.$emit(
        'filterClick',
        this.copyFilterDataRemoveAll(this.filterData),
        forceRequest,
      )
    },
    // 改变过滤条件
    onChangeFilter() {
      this.filterDataCopy = cloneDeep(this.filterData)
      this.$emit('filterClick', this.copyFilterDataRemoveAll(true))
    },
    // 新建任务
    newTaskBtnClick() {
      this.$emit('newTaskBtnClick')
    },
    exportExcelPassValue(val) {
      this.$emit('exportExcel', val)
    },
    // 排序变化
    orderChange(info) {
      this.$emit('orderChange', info)
    },
    handleCloseTag(type) {
      if (this.tags[type].clearFun) this.tags[type].clearFun()
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
    clearAllTag() {
      this.tags = {
        sprintIds: {},
        assignUsers: {},
        requireIds: {},
        statusIds: {},
        priorities: {},
        createUsers: {},
        createTimes: {},
        startTimes: {},
        finishTimes: {},
        endTimes: {},
        relevantUsers: {},
      }
    },
    // 点击过滤
    handlerFilter() {
      this.onChangeFilter()
      this.$refs.filterDialog.handleClose()
    },
    viewChang(type) {
      if (this.viewType !== type) {
        this.viewType = type
        this.$emit('viewChang', type)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/project/ProjectCommon';
.main-form {
  display: flex;
  justify-content: space-between;
}
.page-type {
  color: $--color-primary;
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
    color: $--color-primary;
  }
}
.select-filter-wrap {
  position: relative;
  display: inline-block;
  line-height: 0;
  margin-top: 5px;
}

.select-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  border-radius: 3px;
  box-sizing: border-box;
  height: 32px;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
  max-width: 150px;
  &:hover {
    @include active;
  }
  .content {
    @include ellipsis;
    font-size: 16px;
    line-height: 28px;
  }
  .el-icon-close {
    border-radius: 50%;
    background-color: #6b778c;
    color: #fff;
    padding: 2px;
    transform: scale(0.7);
    &:hover {
      background-color: #344563;
    }
  }
}
.select-title__icon {
  margin-left: 10px;
}
.select-title__active {
  @include active;
}

/deep/ .selecter {
  position: absolute;
  top: 0;
  visibility: hidden;
  width: 0;
  .el-select__tags {
    display: none;
    background-color: transparent;
  }
}

.header-fiter-box-comon {
  margin-bottom: 12px;
  height: 28px;
  .el-form-item {
    margin-bottom: 0;
  }
  /deep/ .editable-field:hover {
    box-shadow: none;
  }
}
.dropdown-ref {
  display: flex;
  align-items: center;
}
.import-out {
  height: 12px;
  line-height: 12px;
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
    margin-bottom: 8px;
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
.save-filter-dialog {
  /deep/ .el-checkbox {
    font-weight: normal;
  }
}
.dropdown-menu {
  .el-dropdown-menu__item {
    font-size: 14px;
    height: 30px;
    line-height: 30px;
  }
}
</style>
