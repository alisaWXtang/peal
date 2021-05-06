<template>
  <div class="header-fiter-box-comon">
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
            @clear="filterClick(true)"
            @keyup.enter.native="filterClick(true)"
          ></el-input>
        </el-form-item>
      </div>
      <div>
        <el-form-item class="right-button-distance">
          <el-button
            v-show="$authFunction('FUNC_COOP_DEFECT_CREATE', 3, projectId)"
            ref="createBtn"
            type="primary"
            icon="co-icon-add"
            class="el-button-text"
            @click="onCreate"
            >{{ $t('新建缺陷') }}</el-button
          >
        </el-form-item>
        <el-form-item class="right-cut-off-rule right-distance">
          <el-dropdown>
            <el-link
              :underline="false"
              class="el-button-text"
              suffix-icon="co-icon-arrow-down"
            >
              {{ pageTypeNotice }}
            </el-link>
            <co-dropdown-menu slot="dropdown" class="dropdown-menu">
              <co-dropdown-item>
                <span
                  :class="listStatu ? '' : 'page-type'"
                  @click="pageTypeChange(true)"
                  >{{ $t('详情模式') }}</span
                >
              </co-dropdown-item>
              <co-dropdown-item>
                <span
                  :class="listStatu ? 'page-type' : ''"
                  @click="pageTypeChange(false)"
                  >{{ $t('列表模式') }}</span
                >
              </co-dropdown-item>
            </co-dropdown-menu>
          </el-dropdown>
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
                  <div>{{ $t('原因') }}</div>
                  <op-select
                    v-model="filterData.causes"
                    :selected-label="$t('原因')"
                    custom-class="custom_select_popper"
                    mode="text"
                    :data="causeList"
                    label-attr="literal"
                    value-attr="cause"
                    :multiple="true"
                    :group="false"
                    :popper-append-to-body="true"
                    width="100%"
                    @setFilterDataLabel="
                      (value, label, clearFun) => {
                        setFilterDataLabel(
                          tags,
                          $t('原因'),
                          value,
                          'causes',
                          label,
                          clearFun,
                        )
                      }
                    "
                    @change="
                      value => {
                        onFilterChange(value, 'causes')
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
                    mode="text"
                    :is-user-select="true"
                    :filter-placeholder="$t('输入拼音/工号/姓名')"
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
                    @valueInvalid="
                      value => {
                        onValueInvalid(value, 'assignUsers')
                      }
                    "
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
                    @valueInvalid="
                      value => {
                        onValueInvalid(value, 'assignUsers')
                      }
                    "
                  />
                </div>
                <!-- 渲染固定选中项 -->
                <template v-for="item in selectedFixedCustomFilter">
                  <div :key="item.key" class="filter-item-wrap">
                    <div>{{ item['fieldName'] }}</div>
                    <more-form-item
                      v-model="filterData[item.key + 's']"
                      :type="item.key + 's'"
                      :popper-append-to-body="true"
                      :filter-field="true"
                      :selected-label="item['fieldName']"
                      :select-list="item.selectValue"
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
                      :select-list="selectDataConfig(item.key)"
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
                  owner="bug"
                  :multiple="true"
                  :default-field-list="defaultFieldList"
                  :state-fixed-custom-field-list="
                    stateAndFixedAndCustomFieldList
                  "
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
          <el-dropdown
            v-show="
              $authFunction(
                'FUNC_COOP_DEFECT_EXPORT',
                3,
                $getUrlParams().projectId || projectId,
              ) ||
                $authFunction(
                  'FUNC_COOP_DEFECT_EXCEL_MODEL',
                  3,
                  $getUrlParams().projectId || projectId,
                ) ||
                $authFunction(
                  'FUNC_COOP_DEFECT_EXCEL_INPUT',
                  3,
                  $getUrlParams().projectId || projectId,
                )
            "
            placement="bottom"
          >
            <el-link
              :underline="false"
              suffix-icon="co-icon-arrow-down"
              class="el-button-text"
            >
              {{ $t('更多操作') }}
            </el-link>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
              <el-dropdown-item
                v-show="
                  $authFunction(
                    'FUNC_COOP_DEFECT_EXPORT',
                    3,
                    $getUrlParams().projectId || projectId,
                  )
                "
                @click.native="exportSelectDialogShow = true"
                ><span>{{ $t('导出缺陷') }}</span></el-dropdown-item
              >
              <!-- <el-dropdown-item
                v-show="
                  $authFunction(
                    'FUNC_COOP_DEFECT_EXCEL_MODEL',
                    3,
                    $getUrlParams().projectId || projectId,
                  )
                "
                ><span @click="dropdownBug">{{
                  $t('下载导入模板')
                }}</span></el-dropdown-item
              > -->
              <el-dropdown-item
                v-show="
                  $authFunction(
                    'FUNC_COOP_DEFECT_EXCEL_INPUT',
                    3,
                    $getUrlParams().projectId || projectId,
                  )
                "
                @click.native="ImpVaildDialogShow = true"
              >
                <!-- <el-upload
                  class="upload-demo"
                  :action="importObject.importUrl"
                  :data="importObject.importData"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="uploadSuccess"
                  :before-upload="fileValidCheck"
                  multiple
                > -->
                <span type="primary">{{ $t('导入缺陷') }}</span>
                <!-- </el-upload> -->
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
      :other-attrs="otherAttrs"
      @exportExcelPassValue="exportExcelPassValue"
    ></ExportSelectDialog>
    <!-- 导入验证弹窗 -->
    <ImportValidDialog
      :visible.sync="ImpVaildDialogShow"
      :title="3"
      @imported="filterClick(true)"
    ></ImportValidDialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 缺陷顶部过滤器
 * @desc
 * @author heyunjiang
 * @date
 */

// import SprintMultipleSelect from '@/components/sprint-multiple-select' //SprintMultipleSelect
// import searchSprintTreeMultipleSelect from '@/components/search-sprint-tree-multiple-select' //SprintMultipleSelect
// import FieldEdit from '@/components/field-edit'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import FilterCommonMixin from '@/mixin/FilterCommonMixin'
import BugCustomFieldsMixin from './BugCustomFieldsMixin' // 后续放弃使用，暂时使用，保留 FIXED， AUTO_HIDE 2个字段
import ExportSelectDialog from '@/components/ExportSelectDialog'
import OpGroupSelect from '@/components/op-group-select'
import FilterSelect from '@/components/filter-select'
import OpSelect from '@/components/op-select'
// import OpMoreSelect from '@/components/op-more-select'
import MoreFormItem from '@/components/op-more-select/formItem'
import cloneDeep from 'lodash/cloneDeep'
// import TableHeaderCustomField from '@/pages/project/TableHeaderCustomField'
// import FilterFunctionTips from '@/components/biz/filter-function-tips'
import ImportDialog from '@/components/import-dialog'
// import HeaderBaseFilter from '@/views/bug/components/HeaderBaseFilter'
import FilterDialog from '@/components/filter-dialog'
import MoreFilter from '@/components/more-filter'
// import BaseTags from '@/components/base-tags'
import { FilterChangeType } from '@/utils/project.config'
import { causeList } from '@/service/bug'
import { bugImportApi, bugModelApi } from '@/api/bug'
import { getRequirementList } from '@/service/task'
import { getRealUrl, windowOpenUrl } from '@/utils/sub-app-util'
import { getUploadHeaders } from '@/utils'
import { queryOptions } from '@/service/work-status-flow'
import ImportValidDialog from '@/components/ImportValidDialog'
import { guide } from '@/store/mutation-types'
import { guideStep, guideType } from '../../components/guide/guideData'

export default {
  name: 'HeaderFilter',
  components: {
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
    MoreFilter,
    ExportSelectDialog,
    ImportValidDialog,
  },

  mixins: [ProjectCommonMixin, FilterCommonMixin, BugCustomFieldsMixin],
  props: {
    listStatu: Boolean,
  },

  data() {
    return {
      uploadHeaders: getUploadHeaders(),
      filterElements: [],
      importDialogVisible: false,
      ImpVaildDialogShow: false,
      exportSelectDialogShow: false,
      importResult: {},
      filterChangeType: FilterChangeType,
      filterPropverVisible: false, // 过滤器选择框显隐
      moreFilter: [], // 更多过滤器默认展开项
      workItemType: 3,
      filterDataCopy: {},
      otherAttrs: [
        { fieldName: '验证时间(天)', attrName: 'acceptedDays' },
        { fieldName: '修复时长(天)', attrName: 'fixedDays' },
        { fieldName: '关闭时长(天)', attrName: 'closedDays' },
        { fieldName: '关联工作项', attrName: 'assocItems' },
        { fieldName: '各状态流转时间', attrName: 'statusTransfer' },
      ],
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
      },
      // 过滤器表单
      filterData: {
        title: '',
        sprintIds: [],
        assignUsers: [],
        statusIds: [],
        priorities: [],
        causes: [],
        createUsers: [],
        createTimes: [],
        updateTimes: [],
        finishTimes: [],
        endTimes: [],
        relevantUsers: [],
        startTimes: [],
        parentRequireIds: [],
        requireIds: [],
        delayTypes: [],
        userDefinedAttrs: {},
        missTests: [],
      },
      isFilter: false, // 是否已过滤
      causeList: [], // 原因列表
      // importObject: {
      //   importUrl: bugImportApi.url,
      //   importData: {
      //     projectId: this.projectId,
      //   },
      // },
      fixedFieldValues: [],
      missTests: [],
    }
  },
  computed: {
    // 固定字段的 values 数组
    // fixedFieldValues() {
    //   this.getFixedFileds()
    //   return this.fixedFieldList.filter(fixedItem => {
    //     return Object.keys(this.FIELDOBJECT.FIXED).includes(fixedItem.key)
    //   })
    // },
    pageTypeNotice() {
      return this.listStatu ? i18n.t('列表模式') : i18n.t('详情模式')
    },
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
        label = i18n.t('全部缺陷')
      }
      return label
    },
    importObject() {
      const url = bugImportApi.url
      const config = {
        importUrl: getRealUrl(url),
        importData: {
          projectId: this.projectId,
        },
      }
      return config
    },
  },

  watch: {
    'FIELDOBJECT.FIXED'() {
      this.getFixedFileds()
      this.fixedFieldValues = this.fixedFieldList.filter(fixedItem => {
        return Object.keys(this.FIELDOBJECT.FIXED).includes(fixedItem.key)
      })
    },
    selectedFixedCustomFilter() {
      this.setSelectedFixedCustomFilter()
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

  async created() {
    this.missTests = await this.getMissTestList()
  },

  mounted() {
    this.filterElements.push(this.$refs.elDialogBox.$el)
    this.initData()
    this.getCauseList()
    this.getCustomInfo({ refresh: true })
    setTimeout(() => {
      this.initGuide()
    }, 300)
    this.$bus.$on('G_bugCreate', this.initGuide)
  },
  beforeDestroy() {
    this.$bus.$off('G_bugCreate', this.initGuide)
  },
  methods: {
    initGuide() {
      if (this.$store.state.guide.guideType === guideType.bug) {
        // 如果有临时索引，则表明是跟踪缺陷点击上一步
        if (this.$store.state.guide.stepIndex === 5) {
          this.onCreate()
          return
        }
        if (!this.$authFunction('FUNC_COOP_DEFECT_CREATE', 3, this.projectId)) {
          this.$store.commit(guide.STEP_WARN, {
            warnMessage:
              '你没有创建缺陷权限，请在设置中添加权限，再继续浏览此步指引',
            guideStep: guideStep.bugCreate,
          })
          return
        }
        this.$store.commit(guide.RECOVERY_STEP)
        let _this = this
        this.$store.commit(guide.START_GUIDE, {
          guideType: guideType.bug,
          guideStep: guideStep.bugCreate,
          step: 1,
          steps: {
            1: {
              dom: this.$refs.createBtn,
              nextCallback() {
                // 下一步
                _this.onCreate()
              },
            },
          },
        })
      }
    },
    // 获取是否漏测
    async getMissTestList() {
      let res = {}
      try {
        res = await queryOptions({
          projectId: this.projectId,
          attrName: 'missTest',
          workItemType: this.workItemType,
        })
      } catch (_) {
        res.status = 0
      }
      if (res.status === 200) {
        return res.data
      }
      return []
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
    // 缺陷表头字段自定义更新回调函数
    updateDisplayHandle() {
      this.$emit('reinitTableList')
    },
    setUserCustomFilterHandle() {
      // if (!isEqual(this.filterData, this.filterDataCopy)) {
      //   this.filterTypeValue = 'all'
      // }
      this.filterTypeValue = 'all'
    },
    exportExcelPassValue(val) {
      this.$emit('bugExport', val)
    },
    // 页面模式切换
    pageTypeChange(type) {
      if (this.listStatu === type) {
        this.$emit('listStatuChange')
      }
    },
    // 更多过滤条件取消 x 项时 删除对应http下发参数
    onMoreSelectCancelVal(val) {
      if (this.filterData[val]) {
        // 静态过滤器
        this.$set(this.filterData, val, [])
      } else if (this.filterData[val + 's']) {
        // 固定过滤器
        this.$set(this.filterData, val + 's', [])
      } else {
        // 自定义过滤器
        delete this.filterData.userDefinedAttrs[val]
      }
      // this.onChangeFilter()
    },
    onMoreSelectChange(val) {
      this.FieldEditProps.onChange(val)
    },
    setSelectedFixedCustomFilter() {
      this.selectedFixedCustomFilter.forEach((item, index, arr) => {
        arr[index].selectValue = this.FIELDOBJECT.FIXED[item.key]
          ? this.FIELDOBJECT.FIXED[item.key].fieldEditProps.selectValue
          : []
      })
    },
    onMoreFilterChange() {
      this.setUserCustomFilterHandle()
      // vm.$emit('onSubmit', vm.copyFilterDataRemoveAll(vm.filterData));
      // this.onChangeFilter()
      // 手动选择过滤条件清掉url带的过滤器id
      this.filterItemChange()
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
    // 选中数据失效后用有效数据查询列表
    onValueInvalid(value, type) {
      const filterData = cloneDeep(this.filterData)
      filterData[type] = value
      this.$emit('filterClick', this.copyFilterDataRemoveAll(null, filterData))
    },
    _deepClone(source) {
      if (!source && typeof source !== 'object') {
        throw new Error('error arguments', 'shallowClone')
      }
      const targetObj = source?.constructor === Array ? [] : {}
      Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === 'object') {
          targetObj[keys] = source[keys].constructor === Array ? [] : {}
          targetObj[keys] = this._deepClone(source[keys])
        } else {
          targetObj[keys] = source[keys]
        }
      })
      return targetObj
    },
    onCustomCancel(val) {
      this.selectedFixedCustomFilter.forEach((item, index) => {
        if (item.key + 's' === val) {
          this.selectedFixedCustomFilter.splice(index, 1)
          delete this.filterData[val]
        }
      })
      this.selectedStaticCustomFilter.forEach((item, index) => {
        if (item.key === val) {
          this.selectedStaticCustomFilter.splice(index, 1)
          this.$set(this.filterData, val, [])
        }
      })
      this.selectedCUSTOMFIELDVALUES.forEach((item, index) => {
        if (item.key === val) {
          this.selectedCUSTOMFIELDVALUES.splice(index, 1)
          delete this.filterData.userDefinedAttrs[val]
        }
      })
      this.moreFilter = this.selectedStaticCustomFilter.concat(
        this.selectedCUSTOMFIELDVALUES,
        this.selectedFixedCustomFilter,
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
      this.$emit('sprintTypeFun', val)
    },
    // 增加固定字段 - filterData key
    getFixedFileds() {
      Object.keys(this.FIELDOBJECT.FIXED).forEach(item => {
        const isChoice = this.FIELDOBJECT.FIXED[item].choice
        const key = isChoice ? item + 's' : item
        const value = isChoice
          ? !this.filterData[key] || this.filterData[key].length === 0
            ? ['all']
            : this.filterData[key]
          : ''
        this.getBasicCustomFiledSelectListOnClick(item, false, 'FIXED')
        this.$set(this.filterData, key, value)
      })
    },
    // 获取原因列表
    async getCauseList() {
      if (this.causeList.length > 0) {
        return
      }
      let result = {}
      try {
        result = await causeList({
          projectId: this.projectId,
        })
      } catch (_) {
        result.status = 0
      }
      if (result.status === 200) {
        this.causeList = result.data
      }
    },
    // 获取需求列表
    async getRequireList() {
      let result = await getRequirementList({
        filterType: 3,
        projectId: this.projectId,
      })
      if (result.status && result.status === 200) {
        this.requirementFilterList = result.data.map(item => ({
          ...item,
          key: item.id,
          value: item.title,
        }))
      }
    },
    // 下拉数据配置
    selectDataConfig(key) {
      const mapping = {
        priorities: this.prioritiesFilterList,
        requireIds: this.requirementFilterList,
        missTests: this.missTests,
      }
      return mapping[key] || []
    },
    // 点击过滤
    filterClick(fourceRequest) {
      this.filterDataCopy = cloneDeep(this.filterData)
      this.$emit(
        'filterClick',
        this.copyFilterDataRemoveAll(this.filterData),
        fourceRequest,
      )
    },
    // 改变过滤条件
    onChangeFilter() {
      this.filterDataCopy = cloneDeep(this.filterData)
      this.$emit('filterClick', this.copyFilterDataRemoveAll(true))
    },
    // 点击 - 创建缺陷
    onCreate() {
      this.$emit('newBug', true)
      this.$store.commit(guide.UPDATE_STEP_VISIBLE, false)
    },
    // 点击 - 下载导入模板
    requirementModel() {
      this.$emit('requirementModel')
    },
    //下载缺陷模板
    dropdownBug() {
      let projectId = this.$getUrlParams().projectId
      let url = bugModelApi.url + '?projectId=' + projectId
      // window.open(url, '_blank')
      windowOpenUrl(url, '_blank')
    },
    // 上传成功
    uploadSuccess(res) {
      const result = {}
      if (res.status === 200) {
        result.type = 'success'
        result.msg = res.msg || i18n.t('上传成功')
        this.$emit('refeshBug')
      } else {
        res.data?.succNum && this.$emit('refeshBug')
        result.type = 'warn'
        const url = res.data ? getRealUrl(res.data.url) : res.data?.url
        const link = url
          ? `，下载 <a class="common__a" href="${url}" target="_blank">错误文件</a> 查看导入失败原因。`
          : ''
        result.msg = `<span>${res.msg || i18n.t('上传失败')}${link}</span>`
      }
      this.importResult = result
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
    // 点击过滤
    handlerFilter() {
      this.onChangeFilter()
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
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/project/ProjectCommon';
@import '@/style/mixin';
// @import '@/style/ele-variables';
// @mixin ellipsis {
//   overflow: hidden !important;
//   text-overflow: ellipsis;
//   white-space: nowrap;
// }

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
.select-filter-wrap {
  position: relative;
  display: inline-block;
  line-height: 0;
  margin-top: 5px;
}
.page-type {
  color: $--color-primary;
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
    color: $color-font-white-common;
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
.main-form {
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: space-between;

  .el-form-item {
    margin-bottom: 0;
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
.header-filter-content .top .el-form-item {
  float: left;
  margin-bottom: 0;
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
