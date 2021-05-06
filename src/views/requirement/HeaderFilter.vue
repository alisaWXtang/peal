<template>
  <div
    class="header-fiter-box-comon"
    :class="{ 'header-filter-box-english': $isEnglish() }"
  >
    <div class="header-filter-top-box">
      <el-form :inline="true" class="first-form">
        <div>
          <el-form-item class="form-item-bottom">
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
            />
          </el-form-item>
          <el-form-item class="form-item-bottom">
            <el-input
              id="require_title_input"
              v-model="filterData.title"
              class="require-title-input"
              clearable
              :placeholder="$t('请输入标题/ID,按enter键搜索')"
              @clear="filterClick"
              @keyup.enter.native="filterClick"
            ></el-input>
          </el-form-item>
        </div>
        <div>
          <el-form-item class="right-button-distance form-item-bottom">
            <el-button
              v-show="$authFunction('FUNC_COOP_REQT_CREATE', 3, projectId)"
              ref="createButton"
              type="primary"
              icon="co-icon-add"
              class="el-button-text"
              @click="onCreate"
              >{{ $t('新建需求') }}</el-button
            >
          </el-form-item>
          <el-form-item
            class="right-cut-off-rule right-distance form-item-bottom"
          >
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
                    :class="pageType === 'card' ? 'page-type' : ''"
                    @click="pageTypeChange('card')"
                    >{{ $t('看板视图') }}</span
                  >
                </co-dropdown-item>
                <co-dropdown-item>
                  <span
                    :class="pageType === 'list' ? 'page-type' : ''"
                    @click="pageTypeChange('list')"
                    >{{ $t('树状视图') }}</span
                  >
                </co-dropdown-item>
              </co-dropdown-menu>
            </el-dropdown>
          </el-form-item>
          <el-form-item
            v-show="isCardPageType"
            class="right-cut-off-rule right-distance form-item-bottom"
          >
            <order-filter
              v-model="currentorderBy"
              @orderChange="orderChange"
            ></order-filter>
          </el-form-item>
          <el-form-item
            class="right-cut-off-rule right-distance form-item-bottom"
          >
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
                  <div class="checked-tag-box">
                    <div v-if="isCardPageType">
                      <co-tag color="rgba(5, 181, 112, 0.1)">
                        {{ categoryLable }}
                      </co-tag>
                    </div>
                    <!--                    <BaseTags-->
                    <!--                      :tags="tags"-->
                    <!--                      @handleCloseTag="-->
                    <!--                        type => {-->
                    <!--                          handleCloseTag(type)-->
                    <!--                        }-->
                    <!--                      "-->
                    <!--                    />-->
                  </div>
                  <!--  选择框-->
                  <div v-show="isCardPageType" class="filter-item-wrap">
                    <div>{{ $t('需求分类') }}</div>
                    <el-cascader
                      ref="catgory"
                      v-model="categoryId"
                      class="select-filter-item-box"
                      :options="categoryAoData"
                      :show-all-levels="false"
                      :change-on-select="true"
                      :props="categoryProps"
                      @change="handleCatgoryChange"
                    ></el-cascader>
                  </div>
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
                      @click.native="countlyHandle('sprintIds')"
                      @click="getProjectSprintList"
                    />
                  </div>
                  <div class="filter-item-wrap">
                    <div>{{ $t('处理人') }}</div>
                    <op-select
                      v-model="filterData.assignUsers"
                      custom-class="custom_select_popper"
                      :is-user-select="true"
                      :selected-label="$t('处理人')"
                      mode="text"
                      :filter-placeholder="$t('输入拼音/工号/姓名')"
                      :data="assignUserFilterList"
                      :popper-append-to-body="true"
                      label-attr="value"
                      value-attr="userId"
                      :multiple="true"
                      :group="false"
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
                      @click.native="countlyHandle('assignUsers')"
                    />
                  </div>
                  <div class="filter-item-wrap">
                    <div>{{ $t('状态') }}</div>
                    <op-select
                      v-model="filterData.statusIds"
                      custom-class="custom_select_popper"
                      mode="text"
                      :data="statusFilterList"
                      :popper-append-to-body="true"
                      label-attr="statusName"
                      value-attr="statusId"
                      color-attr="color"
                      :multiple="true"
                      :group="false"
                      width="100%"
                      :selected-label="$t('状态')"
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
                      @click.native="countlyHandle('statusIds')"
                    />
                  </div>
                  <div class="filter-item-wrap">
                    <div>{{ $t('优先级') }}</div>
                    <op-select
                      v-model="filterData.priorities"
                      custom-class="custom_select_popper"
                      mode="text"
                      :data="prioritiesFilterList"
                      :popper-append-to-body="true"
                      label-attr="literal"
                      value-attr="priority"
                      color-attr="color"
                      :multiple="true"
                      :group="false"
                      width="100%"
                      :selected-label="$t('优先级')"
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
                      @click.native="countlyHandle('priorities')"
                    />
                  </div>
                  <div class="filter-item-wrap">
                    <div>{{ $t('创建人') }}</div>
                    <op-select
                      v-model="filterData.createUsers"
                      custom-class="custom_select_popper"
                      :is-user-select="true"
                      :filter-placeholder="$t('输入拼音/工号/姓名')"
                      mode="text"
                      :data="assignUserFilterList"
                      :popper-append-to-body="true"
                      label-attr="value"
                      value-attr="userId"
                      :multiple="true"
                      :group="false"
                      width="100%"
                      :selected-label="$t('创建人')"
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
                      @click.native="countlyHandle('createUsers')"
                    />
                  </div>
                  <!-- 渲染静态选中项 -->
                  <template v-for="item in selectedStaticCustomFilter">
                    <div
                      v-if="item.attrValue !== 'priorities'"
                      :key="item.key"
                      class="filter-item-wrap"
                    >
                      <div>{{ item['fieldName'] }}</div>
                      <more-form-item
                        v-model="filterData[item.key]"
                        :type="item.attrValue"
                        :popper-append-to-body="true"
                        :filter-field="true"
                        :selected-label="item['fieldName']"
                        :select-list="
                          item.key === 'parentRequireIds'
                            ? requirementFilterList
                            : []
                        "
                        :assign-user-filter-list="
                          item.key === 'relevantUsers'
                            ? assignUserFilterList
                            : []
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
                    :custom-field-list="customFieldList"
                    :state-fixed-custom-field-list="
                      stateAndFixedAndCustomFieldList
                    "
                    :static-field-list="staticFieldList"
                    :default-field-list="defaultFieldList"
                    owner="requirement"
                    :is-card-page-type="isCardPageType"
                    :multiple="true"
                    @change="onMoreSelectChange"
                    @cancelValue="onMoreSelectCancelVal"
                    @click.native="countlyHandle('more')"
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
          <el-form-item class="form-item-bottom">
            <el-dropdown>
              <el-link
                :underline="false"
                suffix-icon="co-icon-arrow-down"
                class="el-button-text"
              >
                {{ $t('更多操作') }}
              </el-link>
              <el-dropdown-menu slot="dropdown" class="dropdown-menu">
                <el-dropdown-item
                  v-show="$authFunction('FUNC_COOP_REQT_EXPORT', 3, projectId)"
                  @click.native="exportSelectDialogShow = true"
                >
                  <span>{{ $t('导出需求') }}</span>
                </el-dropdown-item>
                <el-dropdown-item
                  v-show="
                    $authFunction('FUNC_COOP_REQT_EXCEL_INPUT', 3, projectId)
                  "
                  @click.native="ImpVaildDialogShow = true"
                >
                  <span type="primary">{{ $t('导入需求') }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-form-item>
        </div>
      </el-form>
    </div>
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
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox
            v-show="$authFunction('FUNC_COOP_FILTER_PUBLIC', 3, projectId)"
            v-model="filterSaveDialog.isProjectFilter"
            size="medium"
            class="checkout-item"
          >
            <span
              >{{ $t('设置为项目过滤器') }}，{{
                $t('项目的所有成员可使用该过滤器')
              }}</span
            >
          </el-checkbox>
          <el-checkbox
            v-model="filterSaveDialog.isDefaultFilter"
            size="medium"
            class="checkout-item"
          >
            <span>{{ $t('设为我的默认过滤器') }}</span>
          </el-checkbox>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="postFilterCustomInfo">
          {{ $t('确定') }}
        </el-button>
      </span>
    </el-dialog>
    <!-- 导入结果 -->
    <ImportDialog
      :visible.sync="importDialogVisible"
      :result.sync="importResult"
      :destroy-on-close="true"
    />
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
      :title="1"
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

import { debounce } from 'throttle-debounce'
import cloneDeep from 'lodash/cloneDeep'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import FilterCommonMixin from '@/mixin/FilterCommonMixin'
import OrderFilter from './OrderFilter'

import FilterSelect from '@/components/filter-select'
import OpGroupSelect from '@/components/op-group-select'
// import OpMoreSelect from '@/components/op-more-select'
import MoreFormItem from '@/components/op-more-select/formItem'
import OpSelect from '@/components/op-select'
// import FilterFunctionTips from '@/components/biz/filter-function-tips'
import ImportDialog from '@/components/import-dialog'
import MoreFilter from '@/components/more-filter'
// import BaseTags from '@/components/base-tags'
// import HeaderBaseFilter from '@/views/requirement/components/HeaderBaseFilter'
import FilterDialog from '@/components/filter-dialog'
import ExportSelectDialog from '@/components/ExportSelectDialog'

import ImportValidDialog from '@/components/ImportValidDialog'
import { FilterChangeType } from '@/utils/project.config'
import { requirementImport } from '@/api/requirement'
import { getRequirementList } from '@/service/task'
import { getRealUrl } from '@/utils/sub-app-util'
import { sso } from '@oppo/helper-udp'
import { guide } from '@/store/mutation-types'
import { guideType, guideStep } from '@/components/guide/guideData'

const { getAuthorization } = sso

let vm

export default {
  name: 'HeaderFilter',
  components: {
    OrderFilter,
    OpGroupSelect,
    OpSelect,
    // OpMoreSelect,
    MoreFormItem,
    FilterSelect,
    // FilterFunctionTips,
    ImportDialog,
    MoreFilter,
    // BaseTags,
    // HeaderBaseFilter,
    FilterDialog,
    ExportSelectDialog,
    ImportValidDialog,
  },

  mixins: [ProjectCommonMixin, FilterCommonMixin],
  props: {
    categoryIds: {
      type: Array,
      required: false,
      default: () => [],
      desc: '需求分类',
    },

    categoryData: {
      type: Array,
      required: false,
      default: () => [],
      desc: '需求分类数据源',
    },

    pageType: {
      type: String,
      required: false,
      default: 'list',
      desc: '页面模式',
    },

    orderBy: {
      type: Array,
      required: true,
      desc: '排序',
    },
  },

  data() {
    return {
      exportSelectDialogShow: false,
      ImpVaildDialogShow: false,
      importDialogVisible: false,
      filterElements: [],
      importResult: {},
      filterChangeType: FilterChangeType,
      filterPropverVisible: false,
      categoryVisible: false,
      moreFilter: [],
      workItemType: 1,
      requirementFilterList: [],
      categoryLable: '',
      tags: {
        sprintIds: {},
        assignUsers: {},
        statusIds: {},
        priorities: {},
        createUsers: {},
        createTimes: {},
        startTimes: {},
        endTimes: {},
        parentRequireIds: {},
        finishTimes: {},
        relevantUsers: {},
      },
      // 过滤器表单
      filterData: {
        title: '',
        sprintIds: [],
        assignUsers: [],
        parentRequireIds: [],
        statusIds: [],
        priorities: [],
        createUsers: [],
        createTimes: [],
        startTimes: [],
        endTimes: [],
        finishTimes: [],
        updateTimes: [],
        requireIds: [],
        relevantUsers: [],
        // relevantUsers: [],
        userDefinedAttrs: {},
        delayTypes: [],
      },

      filterDataCopy: {},
      isFilter: false, // 是否已过滤
      importObject: {
        importUrl: requirementImport.url,
        importData: {
          projectId: this.projectId,
        },
      },
      importHeaders: {
        Authorization: getAuthorization(),
      },
      categoryId: [-1], // 需求分类选中数据
      categoryProps: {
        value: 'id',
        label: 'label',
      },

      currentorderBy: [{ column: 'createTime', order: 'DESC' }],
    }
  },
  computed: {
    // 需求分类数据源
    categoryAoData() {
      return this.categoryAoDataHanle(this.categoryData)
    },
    // 切换图标 class name
    pageTypeIcon() {
      let name = 'iconfont '
      name += this.pageType === 'list' ? 'icon-buglist' : 'icon-buginfo'
      return name
    },
    pageTypeNotice() {
      return this.pageType === 'list' ? i18n.t('树状视图') : i18n.t('看板视图')
    },
    // 是否是卡片模式
    isCardPageType() {
      return this.pageType === 'card'
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
      if (label === '') {
        label = i18n.t('全部需求')
      }
      return label
    },
    importUrl() {
      return getRealUrl(this.importObject.importUrl)
    },
  },

  watch: {
    // 列表模式的需求分类选中同步
    categoryIds() {
      this.categoryId =
        this.categoryIds.length > 0
          ? [
              ...this.syncCategoryId(this.categoryData, this.categoryIds[0]),
              this.categoryIds[0],
            ]
          : [-1]
    },
    // 排序同步
    orderBy() {
      this.currentorderBy = this.orderBy
    },
    categoryData(val) {
      let id = this.categoryId[this.categoryId.length - 1]
      this.getChildNodes(id, val)
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

  mounted() {
    vm = this
    this.filterElements.push(this.$refs.elDialogBox.$el)
    // 解决刷新浏览器后自定义过滤器获取不到默认值 $nextTick无效
    setTimeout(() => {
      this.initData()
      this.getRequireList()
    }, 0)

    // 监听创建需求弹窗内的第一步的上一步
    this.$bus.$on('G_requirementSplitPrev', this.guidePrev)
    this.$bus.$on('G_requirementCreate', this.initGuide)
  },
  beforeDestroy() {
    this.$bus.$off('G_requirementSplitPrev', this.guidePrev)
    this.$bus.$off('G_requirementCreate', this.initGuide)
  },
  methods: {
    guidePrev() {
      vm.onCreate()
      // 回转上一场景
      this.$store.commit(guide.UPDATE_STEP_INDEX, 4)
    },
    initGuide(step = 1) {
      let _this = this
      if (this.$store.state.guide.guideType === guideType.requirement) {
        if (!this.$authFunction('FUNC_COOP_REQT_CREATE', 3, this.projectId)) {
          this.$store.commit(guide.STEP_WARN, {
            warnMessage:
              '你没有创建需求权限，请在设置中添加权限，再继续浏览此步指引',
            guideStep: guideStep.requirementCreate,
          })
          return
        }
        this.$store.commit(guide.START_GUIDE, {
          guideType: guideType.requirement,
          guideStep: guideStep.requirementCreate,
          step: step,
          steps: {
            1: {
              dom: this.$refs.createButton,
              nextCallback() {
                // 下一步回调，打开新建需求弹窗
                _this.onCreate()
              },
            },
          },
        })
      }
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
    // 获取赛选的需求列表
    getRequirementList(projectId) {
      return getRequirementList({
        projectId,
        filterType: 1,
      })
    },
    exportExcelPassValue(val) {
      this.$emit('exportExcel', val)
    },
    // 获取需求列表
    async getRequireList() {
      let result = await this.getRequirementList()
      if (result.status && result.status === 200) {
        this.requirementFilterList = result.data.map(item => {
          return {
            ...item,
            key: item.id,
            value: item.title,
          }
        })
      }
    },
    // 更多过滤条件选中回调
    onMoreSelectChange(val) {
      this.FieldEditProps.onChange(val)
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
    //埋点
    countlyHandle(type) {
      this.countlyLog(`project_requirementDetail_${type}`)
    },
    setUserCustomFilterHandle() {
      // if (!isEqual(this.filterData, this.filterDataCopy)) {
      //   this.filterTypeValue = 'all'
      // }
      this.filterTypeValue = 'all'
    },
    onMoreFilterChange() {
      this.setUserCustomFilterHandle()
      // this.onChangeFilter()
      // 手动选择过滤条件清掉url带的过滤器id
      this.filterItemChange()
    },
    handleTitleClick() {
      this.$refs.filterSelect.$el.click()
    },
    // 点击需求分类区域触发
    handleCatgoryClick() {
      // 打开下拉框
      this.$refs.catgory.$el.click()
    },
    onVisibleChange() {
      this.filterPropverVisible = !this.filterPropverVisible
    },
    // 取消过滤项
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
          delete this.filterData.userDefinedAttrs[val]
        }
      })
      this.moreFilter = this.selectedStaticCustomFilter.concat(
        this.selectedCUSTOMFIELDVALUES,
      )

      // this.onChangeFilter()
    },
    // 点击过滤
    filterClick(forceRequest) {
      return debounce(300, true, () => {
        vm.filterDataCopy = cloneDeep(vm.filterData)
        vm.$emit(
          'onSubmit',
          vm.copyFilterDataRemoveAll(vm.filterData),
          forceRequest,
        )
      })()
    },
    // 改变过滤条件
    onChangeFilter() {
      return debounce(300, true, () => {
        vm.filterDataCopy = cloneDeep(vm.filterData)
        vm.$emit('onSubmit', vm.copyFilterDataRemoveAll(true))
      })()
    },
    // 点击 - 创建需求
    onCreate() {
      this.$emit('onCreate')
    },
    // 点击 - 下载导入模板
    requirementModel() {
      this.$emit('requirementModel')
    },
    // 点击 - 导出需求
    exportExcel() {
      this.$emit('exportExcel', this.formInline)
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
        // const url = res.data?.url
        // let url = res.data?.url
        const url = res.data ? getRealUrl(res.data.url) : res.data?.url
        const link = url
          ? `，下载 <a class="common__a" href="${url}" target="_blank">错误文件</a> 查看导入失败原因。`
          : ''
        result.msg = `<span>${res.msg || i18n.t('上传失败')}${link}</span>`
      }
      this.importResult = result
    },
    handleExceed() {},
    //判断已归档还是未归档
    recordFun(val) {
      this.$emit('sprintTypeFun', val)
    },
    // 需求分类 - handle
    handleCatgoryChange() {
      if (this.categoryId.length === 0) {
        return
      }
      let id = this.categoryId[this.categoryId.length - 1]
      let childIds = this.getChildCategoryIds(
        this.getChildNodes(id, this.categoryAoData),
      )

      this.$emit('update:categoryIds', id === -1 ? [] : [id, ...childIds])
      this.filterClick()
    },
    // 获取对应 id 的所有子节点
    getChildNodes(id, nodeLists) {
      let children = []
      for (let i = 0; i < nodeLists.length; i++) {
        if (nodeLists[i].id === id) {
          children = nodeLists[i].children || []
          this.categoryLable = nodeLists[i].label
          break
        } else if (nodeLists[i].children && nodeLists[i].children.length > 0) {
          const list = this.getChildNodes(id, nodeLists[i].children)
          if (list.length > 0) {
            children = list
          }
        }
      }
      return children
    },
    // 子分类请求
    getChildCategoryIds(childNodes) {
      let ids = []
      childNodes.forEach(item => {
        ids.push(item.id)
        if (item.children && item.children.length > 0) {
          ids = [...ids, ...this.getChildCategoryIds(item.children)]
        }
      })
      return ids
    },
    // 需求分类数据源空 children 数据处理
    categoryAoDataHanle(categoryData = []) {
      const list = categoryData.map(item => {
        let obj = { ...item }
        if (!obj.children) {
          return obj
        }

        if (obj.children.length === 0) {
          delete obj.children
        } else {
          obj.children = this.categoryAoDataHanle(obj.children)
        }
        return obj
      })
      return list
    },
    // 页面模式切换
    pageTypeChange(type) {
      if (this.pageType !== type) {
        this.$emit(
          'update:pageType',
          this.pageType === 'list' ? 'card' : 'list',
        )
      }
    },
    // 排序变化
    orderChange(info) {
      this.$emit('orderChange', info)
    },
    // 需求分类 id 同步 - 查找父 id 集合
    syncCategoryId(categoryIdsPro, categoryId) {
      let parentId = 0
      const getParentId = (categoryIds, selfCategoryId) => {
        if (categoryIds.length === 0) {
          return
        }
        if (selfCategoryId === 0) {
          parentId = -1
          return
        }
        // 如果当前id找到，则返回其父 id
        if (categoryIds.find(item => item.id === selfCategoryId)) {
          parentId = categoryIds.find(item => item.id === selfCategoryId)
            .parentId
        } else {
          categoryIds.forEach(item => {
            if (item.children && item.children.length > 0) {
              getParentId(item.children, selfCategoryId)
            }
          })
        }
      }
      getParentId(categoryIdsPro, categoryId)
      if (parentId === -1) {
        return [parentId]
      } else {
        return [...this.syncCategoryId(categoryIdsPro, parentId), parentId]
      }
    },
    // 修改tags数据
    setFilterDataLabel(updateData, name, value, type, label, clearFun) {
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
        statusIds: {},
        priorities: {},
        createUsers: {},
        createTimes: {},
        startTimes: {},
        endTimes: {},
        parentRequireIds: {},
        finishTimes: {},
        relevantUsers: {},
      }
    },
    handlerFilter() {
      if (this.isCardPageType) {
        this.filterClick()
      } else {
        this.onChangeFilter()
      }
      this.$refs.filterDialog.handleClose()
    },
    handleCloseTag(type) {
      if (this.tags[type].clearFun) this.tags[type].clearFun()
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/project/ProjectCommon';
.requirement-category__label {
  position: relative;
  top: 1px;
  margin-right: 4px;
  line-height: 20px;
  font-size: 14px;
  white-space: nowrap;
}
@mixin ellipsis {
  overflow: hidden !important;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.require-title-input {
  width: 196px;
}
.select-wrap {
  position: relative;
  display: inline-block;
  line-height: 0;
  vertical-align: middle;
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
    color: $color-font-active-common;
  }
}
.select-filter-wrap {
  position: relative;
  display: inline-block;
  line-height: 0;
  margin-top: 5px;
}
@mixin active {
  color: $--color-primary;
  border: $borderSolid;
  background: #e6fafa;
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
.page-type {
  color: $--color-primary;
}
.requirement-category-english {
  max-width: 200px;
  padding: 5px 3px;
}
.select-title__icon {
  margin-left: 10px;
}
.requirement-category {
  display: flex;
  align-items: center;
}
.select-title__active {
  @include active;
}
.first-form {
  display: flex;
  justify-content: space-between;
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
.catgoryStyle {
  margin-top: 5px;
  cursor: pointer !important ;
  &:hover {
    background-color: rgb(223, 226, 231);
  }
  /deep/ .el-form-item__content {
    line-height: 30px !important;
  }
}
.header-filter-content .top .el-form-item {
  float: left;
  margin-bottom: 0;
}
.form-item-bottom {
  margin-bottom: 0;
  /deep/ .editable-field {
    &:hover {
      box-shadow: none;
    }
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
    margin-bottom: 12px;
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
  /deep/ .el-dialog {
    z-index: 2002;
  }
  /deep/ .el-checkbox {
    font-weight: normal;
  }
}
.dropdown-menu {
  .el-dropdown-menu__item {
    font-size: 14px;
  }
}
</style>
