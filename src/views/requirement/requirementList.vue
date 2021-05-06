<template>
  <div id="demandlist" class="content-outer-box requirement-list">
    <slide
      ref="side"
      v-loading="loading"
      :show="show"
      :after-close="contextmenuNone"
      :before-close="
        ({ cb }) => beforeSliderClose({ id: newviewShow ? -1 : requireId, cb })
      "
      :element-loading-text="$t('拼命加载中')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgb(255,255,255)"
      @click.stop
    >
      <div slot="task" class="silder-box">
        <RequirementCreate
          v-if="newviewShow && viewShow"
          :ref="currentCreateType"
          :current-category-id="currentCategoryId"
          :show="show"
          @HandleSide="contextmenuNone"
          @HandleAddSuccess="contextmenuNone"
        />
        <RequirementDetail
          v-if="!viewShow"
          :ref="currentCreateType"
          :project-id="rootNode.projectId"
          :work-item-id="requireId"
          :show="show"
          @HandleSide="contextmenuNone"
          @updateInfoSuccess="
            () => requirementListInitWithPageNumber(lastClickItemPageNumber)
          "
          @deleteSuccess="
            () => requirementListInitWithPageNumber(lastClickItemPageNumber)
          "
        />
      </div>
    </slide>
    <!--    <div v-show="isShow" id="menu" ref="menu" style="z-index: 4">-->
    <!--      <div-->
    <!--        v-show="activeCategoryEditShowId !== -1"-->
    <!--        class="menu cursor-pointer"-->
    <!--        @click="dialogHandle($event, 1)"-->
    <!--      >-->
    <!--        {{ $t('创建分类') }}-->
    <!--      </div>-->
    <!--      <div class="menu cursor-pointer" @click="dialogHandle($event, 2)">-->
    <!--        {{ $t('创建子分类') }}-->
    <!--      </div>-->
    <!--      <div-->
    <!--        v-show="activeCategoryEditShowId !== -1"-->
    <!--        class="menu cursor-pointer"-->
    <!--        @click="dialogHandle($event, 3)"-->
    <!--      >-->
    <!--        {{ $t('修改分类') }}-->
    <!--      </div>-->
    <!--      <div-->
    <!--        v-show="activeCategoryEditShowId !== -1"-->
    <!--        class="menu cursor-pointer"-->
    <!--        @click="dialogHandle($event, 4)"-->
    <!--      >-->
    <!--        {{ $t('删除分类') }}-->
    <!--      </div>-->
    <!--    </div>-->
    <div class="x-arD">
      <div
        ref="boxTop"
        v-loading="treeDataLoading"
        :element-loading-text="$t('拼命加载中')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgb(255,255,255)"
        :class="{
          'demand-classification': pageType === 'list',
          'demand-card': pageType === 'card',
        }"
      >
        <two-block-width-changer
          :init-left-width="224"
          fixed-left
          bar-type="tiny"
          expand-btn
          :is-show-left="pageType === 'list'"
        >
          <div slot="left" class="demand-classification-left">
            <p class="tree-header">
              {{ $t('需求分类') }}
            </p>
            <el-tree
              ref="tree"
              :data="listDataCount"
              lable="name"
              node-key="id"
              default-expand-all
              render-after-expand
              :expand-on-click-node="false"
              :draggable="true"
              :highlight-current="true"
              :allow-drag="allowDrag"
              class="el-tree scrollbal-common left-tree-common"
              :render-content="renderContent"
              @node-click="
                (data, node) => {
                  this.iconmoreEvent(node, data)
                }
              "
              @node-drop="finalNodeDrag"
            >
              <span />
            </el-tree>
          </div>
          <div
            ref="list"
            slot="right"
            class="demand-classification-right scrollbal-common el-table-hidden-scrollbar-box project-content"
            :class="{ 'right-padding': pageType === 'list' }"
          >
            <div class="header-content-box">
              <div class="form-area">
                <header-filter
                  ref="headerFilter"
                  :project-id="formInline.projectId"
                  :category-ids.sync="formInline.categoryIds"
                  :category-data="listDataCount"
                  :page-type.sync="pageType"
                  :order-by="formInline.orderBy"
                  @onCreate="onCreate"
                  @exportExcel="exportExcel"
                  @pageTypeChange="requirementListInit"
                  @orderChange="orderChange"
                  @requirementModel="requirementModel"
                  @onSubmit="onSubmit"
                  @uploadSuccess="requirementListInit"
                  @sprintTypeFun="sprintTypeFun"
                />
              </div>
              <div v-if="pageType === 'list'" class="center-box">
                <el-button
                  v-show="
                    $authFunction(
                      'FUNC_COOP_REQT_CREATE',
                      3,
                      formInline.projectId,
                    )
                  "
                  class="quick-create-r-button"
                  type="text"
                  icon="el-icon-plus"
                  @click="addFatherRquire"
                >
                  {{ $t('快速创建需求') }}
                </el-button>
              </div>
            </div>
            <div
              v-if="pageType === 'list'"
              id="table-box"
              ref="tableBox"
              class="table__container"
            >
              <header-operation
                :work-item-type="1"
                :check-items="checkItems"
                :is-all-checked="isAllChecked"
                @checkbox-change="handleOperationCheck"
                @seeTaskHandle="seeTaskHandle"
                @update-data="batchOperationCallback"
              ></header-operation>
              <table-header-custom-field
                v-if="pageType === 'list'"
                class="require-table-header-set"
                :project-id="formInline.projectId"
                :work-item-type="1"
                @updateDisplay="requirementListInit"
              />
              <tree-table
                id="requlist"
                ref="requirementTable"
                v-loading="tableLoading"
                :element-loading-text="$t('拼命加载中')"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(255,255,255, 1)"
                :data="treeData"
                title-sortable
                :eval-args="args"
                :expand-all="expandAll"
                :is-can-change-expand="true"
                :ltype="1"
                :is-checked="true"
                :sorta-change-call-back="sortaChangeCallBack"
                :class="{ 'tree-table-left-none': treeData.length == 0 }"
                :page-info="formInline.pageInfo"
                :update-global-title="
                  (info, value) => {
                    GlobalRequirementUpdate({
                      id: info.id,
                      title: value,
                      projectId: info.projectId || $getUrlParams().projectId,
                      cb: () =>
                        requirementListInitWithPageNumber(info.pageNumber),
                    })
                  }
                "
                @change-expand="changeExpand"
                @seeTaskHandle="seeTaskHandle"
                @cancleCreateRequire="cancleRequire"
                @scrollBottom="scrollBottom"
                @scrollTop="scrollTop"
                @selection-change="handleTableSelect"
              >
                <!-- elementui bug，如果自定义 el-table-column 会造成列顺序不一致 -->
                <el-table-column
                  v-for="(item, index) in currentTreeCustomFields"
                  :key="item.attrName + index"
                  :prop="item.attrName"
                  :label="item.fieldName"
                  :sortable="item.sortable ? 'custom' : false"
                  :width="
                    columnWidthMap[item.attrName] ||
                      columnWidthMap[item.attrValue] ||
                      (item.attrValue.indexOf('MEMBER_CHOICE') > -1
                        ? 180
                        : '') ||
                      ($isEnglish() ? 120 : 100)
                  "
                  show-overflow-tooltip
                >
                  <template slot="header">
                    <table-header
                      :value="item.fieldName"
                      :sortable="item.sortable"
                    />
                  </template>
                  <template slot-scope="scope">
                    <StateFlow
                      v-if="item.attrName === 'statusId'"
                      :project-id="formInline.projectId"
                      :status-id="scope.row.statusId"
                      :work-item-type="1"
                      :work-item-id="scope.row.id"
                      :update-data="
                        () =>
                          requirementListInitWithPageNumber(
                            scope.row.pageNumber,
                          )
                      "
                    >
                      <work-item-table-custom-column
                        :key="item.attrName + scope.row.id"
                        :scope="scope"
                        :field="item"
                        @selectClick="
                          e =>
                            GlobalSelectTargetClick(
                              scope.row,
                              e,
                              item.attrName,
                              () =>
                                requirementListInitWithPageNumber(
                                  scope.row.pageNumber,
                                ),
                              item,
                            )
                        "
                        @updateSuccess="
                          info =>
                            requirementListInitWithPageNumber(info.pageNumber)
                        "
                      />
                    </StateFlow>
                    <div v-else-if="item.attrName === 'categoryId'">
                      <!-- :value="String(scope.row.data.categoryId)" 处理未分类id 为0不能显示 -->
                      <el-cascader
                        v-if="currCategoryId === scope.row.id"
                        ref="cascader"
                        :value="String(scope.row.data.categoryId)"
                        :options="options"
                        :props="{
                          checkStrictly: true,
                          emitPath: false,
                        }"
                        :show-all-levels="false"
                        @visible-change="cancelCategoryChange"
                        @change="
                          handleChange(scope.row.id, scope.row.pageNumber)
                        "
                      ></el-cascader>
                      <span
                        v-else
                        class="current-hover"
                        @click="changeRequireCategory(scope.row.id, $event)"
                        >{{
                          scope.row.display.category.constructor === Array
                            ? scope.row.display.category[
                                scope.row.display.category.length - 1
                              ]
                            : scope.row.display.category
                        }}</span
                      >
                    </div>
                    <work-item-table-custom-column
                      v-else
                      :key="item.attrName + scope.row.id"
                      :scope="scope"
                      :field="item"
                      @selectClick="
                        e =>
                          GlobalSelectTargetClick(
                            scope.row,
                            e,
                            item.attrName,
                            () =>
                              requirementListInitWithPageNumber(
                                scope.row.pageNumber,
                              ),
                            item,
                          )
                      "
                      @updateSuccess="
                        info =>
                          requirementListInitWithPageNumber(info.pageNumber)
                      "
                    />
                  </template>
                </el-table-column>
                <template v-slot:createCtx>
                  <requirement-fast-create
                    :project-id="formInline.projectId"
                    :current-category-id="currentCategoryId"
                    @cancleRequire="cancleRequire"
                    @saveRequirSuccess="saveRequirSuccess"
                  />
                </template>
              </tree-table>
              <!--              <requirement-scrollbar :tree-data="treeData" />-->
            </div>
            <card-panel
              v-else
              v-loading="cardLoading"
              :element-loading-text="$t('数据加载中')"
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgb(255,255,255)"
              class="loading-position-top200"
              :project-id="formInline.projectId"
              :card-bord-data="cardBordData"
              :current-category-id="currentCategoryId"
              @opreateSuccess="requirementListInit"
              @slideClose="contextmenuNone"
            />
          </div>
        </two-block-width-changer>
      </div>
      <!--      <div v-if="pageType === 'card'" class="demand-card">-->
      <!--        <div class="form-area">-->
      <!--          <header-filter-->
      <!--            ref="headerFilter"-->
      <!--            :project-id="formInline.projectId"-->
      <!--            :category-ids.sync="formInline.categoryIds"-->
      <!--            :category-data="listDataCount"-->
      <!--            :page-type.sync="pageType"-->
      <!--            :order-by="formInline.orderBy"-->
      <!--            @onCreate="onCreate"-->
      <!--            @exportExcel="exportExcel"-->
      <!--            @pageTypeChange="requirementListInit"-->
      <!--            @orderChange="orderChange"-->
      <!--            @requirementModel="requirementModel"-->
      <!--            @onSubmit="onSubmit"-->
      <!--            @uploadSuccess="requirementListInit"-->
      <!--            @sprintTypeFun="sprintTypeFun"-->
      <!--            @clearTitle="clearTitle"-->
      <!--          />-->
      <!--        </div>-->
      <!--        <card-panel-->
      <!--          v-loading="cardPanelLoading"-->
      <!--          :element-loading-text="$t('数据加载中')"-->
      <!--          element-loading-spinner="el-icon-loading"-->
      <!--          element-loading-background="rgb(255,255,255)"-->
      <!--          class="loading-position-top200"-->
      <!--          :project-id="formInline.projectId"-->
      <!--          :card-bord-data="cardBordData"-->
      <!--          :current-category-id="currentCategoryId"-->
      <!--          @opreateSuccess="requirementListInit"-->
      <!--          @slideClose="contextmenuNone"-->
      <!--        />-->
      <!--      </div>-->
    </div>
    <!--自定义右键菜单html代码-->
    <el-dialog
      :title="title"
      :visible.sync="centerDialogVisible"
      width="460px"
      class="create-category-dialog"
      @close="cancelRequireName('ruleForm')"
    >
      <el-form
        v-if="dialogStatus !== 4"
        ref="ruleForm"
        :model="ruleForm"
        @submit.native.prevent
      >
        <el-form-item
          :label="$t('分类名称')"
          :label-width="getClassifyFormItemWidth()"
          class="mt15"
          prop="classificationName"
          :rules="[
            { required: true, message: '分类名称不能为空' },
            {
              min: 0,
              max: 64,
              message: '分类名称不能超过64个字符',
              trigger: 'blur',
            },
            {
              min: 0,
              max: 64,
              message: '分类名称不能超过64个字符',
              trigger: 'change',
            },
          ]"
        >
          <el-input
            ref="calageryInput"
            v-model.trim="ruleForm.classificationName"
            v-focus
            :placeholder="$t('请输入标题')"
          />
        </el-form-item>
      </el-form>
      <div v-if="dialogStatus == 4">{{ $t('确定删除该分类') }}?</div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureSendHandle('ruleForm')">{{
          $t('确定')
        }}</el-button>
        <el-button @click="cancelRequireName('ruleForm')">{{
          $t('取消')
        }}</el-button>
      </div>
    </el-dialog>
    <GlobalSelect v-bind="GlobalSelectProps" />
  </div>
</template>

<script type="text/jsx">
import { i18n } from '@/i18n'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import TreeTable from '@/components/tree-table'
import TwoBlockWidthChanger from '@/components/columbus-gantt-canvas/src/gantt-table/TwoBlockWidthChanger'
import slide from '@/components/slide-slip'
import GlobalSelect from '@/components/field-edit/GlobalSelect.vue'
// import GlobalInput from '@/components/feld-edit/GlobalInput.vue';
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import TinymceSaveMixin from '@/mixin/tinymce-save-mixin'
import WorkItemTableCustomColumn from '@/components/project/WorkItemTableCustomColumn'
import TableHeader from '@/components/ellipsis-block/TableHeader'
import StateFlow from '@/components/state-flow'
import { RequirementWorkItem } from '@/utils/project.config'
import { RequirementDetail } from '@/components/columbus-workitem-display'
import { RequirementCreate } from '@/components/columbus-workitem-create'
// import DemandView from './requirementView.vue';
import HeaderFilter from './HeaderFilter'
import CardPanel from './CardPanel'
// import NewView from './newrequirementView.vue';
import RequirementFastCreate from './RequirementFastCreate'
// import RequirementScrollbar from './RequirementScrollbar'
import TableHeaderCustomField from '@/components/project/table-header-custom-field'
import * as requirementCategoryService from '@/service/requirement-category'
import * as requirementService from '@/service/requirement'
import { requirementExport, requirementModel } from '@/api/requirement'
import { windowOpenUrl } from '@/utils/sub-app-util'
import { downloadFilePost } from '@/utils/index'

import HeaderOperation from '@/components/columbus-workitem-batch-operation/HeaderOperation'
import { guideStep, guideType } from '@/components/guide/guideData'
import { guide } from '@/store/mutation-types'

// 用于快速创建需求
let RESETINFO = {
  isNewAdd: true,
  priority: 80,
  startTime: '',
  id: 0,
  endTime: '',
  display: {
    title: '',
    status: '',
    assignUser: '',
  },

  assignUser: '',
  progress: null,
  sprintId: '',
  statusId: '',
  categoryId: 2,
  children: [],
  contentId: 1,
  createTime: '',
}

export default {
  name: 'RequirementList',
  components: {
    TreeTable,
    // DemandView,
    // NewView,
    slide,
    GlobalSelect,
    // GlobalInput,
    // EllipsisBlock,
    TableHeader,
    TwoBlockWidthChanger,
    HeaderFilter,
    CardPanel,
    WorkItemTableCustomColumn,
    RequirementFastCreate,
    StateFlow,
    // RequirementScrollbar,
    TableHeaderCustomField,
    RequirementDetail,
    RequirementCreate,
    HeaderOperation,
  },

  mixins: [ProjectCommonMixin, TinymceSaveMixin],
  provide() {
    return {
      getCategoryIds: () => {
        return this.formInline.categoryIds
      },
      updateCategoryIds: ids => {
        this.formInline.categoryIds = ids
      },
      onSubmit: (formInline, forceRequest = false) => {
        this.onSubmit(formInline, forceRequest)
      },
    }
  },
  data() {
    return {
      currCategoryId: '',
      options: [],
      viewShow: true,
      currentCreateType: 'requrire',
      lastClickItemPageNumber: 1, // 最近一次点击 list item 对应的 pageNumber，主要用于状态更新，右侧弹窗回调
      filterInfoCopy: null,
      cardBordData: [], // 看板模式数据源
      pageType: localStorage.getItem('requirementPageType') || 'list', // 页面模式 list card
      newviewShow: false,
      visible2: false,
      projectName: ' ',
      mineId: null,
      title: '创建分类名称',
      ruleForm: {
        classificationName: '',
      },

      parentId: null,
      isShow: false,
      args: [null, null, 'timeLine'],
      centerDialogVisible: false,
      expandAll: true,
      data: [],
      dialogStatus: 1,
      formInline: {
        projectId: this.$getUrlParams().projectId,
        title: null,
        assignUsers: [],
        isArchived: -1,
        sprintIds: [],
        statusIds: [],
        priorities: [],
        categoryIds: [],
        custom: {},
        orderBy: [
          {
            column: 'createTime',
            order: 'DESC',
          },
        ],

        pageInfo: {
          pageNumber: 1,
          pageSize: Math.floor(window.screen.availHeight / 34) + 10,
          totalRecords: 0,
          totalPages: 0,
        },
      },

      listData: [],
      rootNode: [
        {
          id: -1,
          label: i18n.t('全部分类'),
          name: i18n.t('全部分类'),
          parentId: 0,
          projectId: this.$getUrlParams().projectId,
          children: Array,
        },
      ],

      treeData: [],
      treeCustomFields: [], // 表示当前 tableList 需要展示哪些字段 add by heyunjiang on 2020.1.8
      treeSummaryData: [],

      //侧滑栏参数
      count: 0, //计数器为了保村上一次的Id
      restore: 1,
      preID: null, //记录上一次的ID
      show: false,
      requireId: null,
      loading: false,
      treeDataLoading: true,
      tableLoading: true,
      cardLoading: true,
      activeCategoryEditShowId: -1, // 左側需求分類當前選中項 0->未分類 -1 -> 全部分類
      showStausObj: {}, //状态数据
      statusShow: false, //状态展示
      // 快速创建需求的状态控制
      createRequireInfo: {
        status: false,
        ...RESETINFO,
      },
      // 已勾选的工作项
      checkItems: [],
      isAllChecked: false,
      startGuideState: false, // 用于第一次引导标记
    }
  },

  computed: {
    //当前的分类ID
    currentCategoryId() {
      return this.formInline.categoryIds[0] || ''
    },
    // 需求分类带数字
    listDataCount() {
      const listDataPre = cloneDeep(this.listData)
      const summaryData = this.treeSummaryData
      if (listDataPre.length > 0) {
        let rootCount = this.processCategoryNodeIterator(
          listDataPre[0],
          summaryData,
        )

        listDataPre[0].label = listDataPre[0].name + '(' + rootCount + ')'
        listDataPre[0].count = rootCount
      }
      return listDataPre
    },
    // 自定义 table 展示字段
    currentTreeCustomFields() {
      return this.treeCustomFields.filter(
        item => !['id', 'title'].includes(item.attrName),
      )
    },
    // 表格高度
    tableBodyHeight() {
      return window.innerHeight - 241
    },
  },
  watch: {
    pageType() {
      localStorage.setItem('requirementPageType', this.pageType)
      this.requirementListInit(true)
    },
    centerDialogVisible(newVal) {
      if (newVal) {
        // 需求分类弹窗聚焦
        this.$nextTick(() => {
          this.$refs.calageryInput &&
            this.$refs.calageryInput.$refs.input.focus()
        })
      }
    },
    // 当前需求分类选中样式
    listDataCount() {
      this.$nextTick(() => {
        let currentCategoryId = this.formInline.categoryIds[0]
        this.currentNodeKey = currentCategoryId
        this.$refs.tree && this.$refs.tree.setCurrentKey(currentCategoryId)
      })
    },
    '$route.query': function(val, oldVal) {
      if (val.requireId) {
        this.requireId = val.requireId
        this.$nextTick(() => {
          this.$refs.requirementTable?.initSetTableSelect()
        })
      }
      if (
        (oldVal.guideType === guideType.wholeProcess || !oldVal.guideType) &&
        val.guideType === guideType.requirement
      ) {
        this.startGuideCreate()
      }
    },
  },
  mounted() {
    this.init()
    // 因为初始化获取未归档的所有迭代 暂时屏蔽初始化逻辑 在组件过滤迭代id后更新列表
    // this.requirementListInit();
    this.isRqeuirementId = {
      id: this.$getUrlParams().requireId,
    }

    if (this.isRqeuirementId.id) {
      this.seeTaskHandle(this.isRqeuirementId)
    }
    // 获取自定义字段列表
    this.getCustomFieldList(1, this.$getUrlParams().projectId)

    // 监听需求拆分用户引导事件
    this.$bus.$on('G_requirementSplit', this.initGuide)

    // 监听切换引导模块内的大步骤
    this.$bus.$on('G_changeGuideStep', this.changeGuideStep)
  },
  beforeDestroy() {
    this.$bus.$off('G_requirementSplit', this.initGuide)
    this.$bus.$off('G_changeGuideStep', this.changeGuideStep)
  },
  beforeRouteLeave(to, from, next) {
    // 如果存在内容在编辑，则不能离开
    // if (this.sliderBeforeCloseData.title || this.sliderBeforeCloseData.desc) {
    //   return false;
    // }
    next()
  },
  methods: {
    changeGuideStep(item) {
      if (item.guideStep === guideStep.requirementSplit) {
        if (this.show) {
          this.contextmenuNone()
          setTimeout(() => {
            this.$store.commit(guide.RECOVERY_STEP)
            this.initGuide()
          }, 300)
        } else {
          this.initGuide()
        }
      }
      if (item.guideStep === guideStep.requirementCreate) {
        this.startGuideCreate()
      }
    },
    // 开始执行创建需求引导
    startGuideCreate() {
      if (this.show) {
        this.contextmenuNone()
        setTimeout(() => {
          this.$store.commit(guide.RECOVERY_STEP)
          this.$bus.$emit('G_requirementCreate')
        }, 300)
      } else {
        this.$bus.$emit('G_requirementCreate')
      }
    },
    // 开始执行拆分需求指引
    startGuideSplit() {
      if (
        this.$store.state.guide.guideType === guideType.requirement &&
        !this.startGuideState &&
        !this.show
      ) {
        this.startGuideState = true
        this.$bus.$emit('G_requirementCreate')
      }
    },
    initGuide() {
      if (!this.treeData.length) {
        this.$store.commit(guide.STEP_WARN, {
          warnMessage: '当前没有需求，请先创建需求，再继续浏览此步指引。',
          guideStep: guideStep.requirementSplit,
        })
        return
      }
      if (!this.$authFunction('FUNC_COOP_REQT_CREATE', 3, this.formInline.projectId)) {
        this.$store.commit(guide.STEP_WARN, {
          warnMessage:
            '你没有拆分需求权限，请在设置中添加权限，再继续浏览此步指引',
          guideStep: guideStep.requirementSplit,
        })
        return
      }
      let _this = this
      this.$store.commit(guide.START_GUIDE, {
        guideType: guideType.requirement,
        guideStep: guideStep.requirementSplit,
        step: 1,
        steps: {
          1: {
            dom: this.$refs.tableBox,
            nextCallback() {
              // 下一步回调，打开新建需求弹窗
              _this.seeTaskHandle(_this.treeData[0])
            },
            prevCallback() {
              _this.$bus.$emit('G_requirementSplitPrev')
            },
          },
        },
      })
    },
    // 表格中选择
    handleTableSelect(val) {
      this.checkItems = val
      // 快速创建需求 length + 1
      this.isAllChecked =
        this.$refs.requirementTable.formatData.length === val.length ||
        (this.$refs.requirementTable.formatData.length === val.length + 1 &&
          this.createRequireInfo.status)
    },
    // 批量操作勾选工作项
    handleOperationCheck(val) {
      if (!val) {
        this.$refs.requirementTable.$refs.multipleTable.clearSelection()
      } else {
        this.$refs.requirementTable.$refs.multipleTable.toggleAllSelection()
      }
    },
    changeExpand(value) {
      this.expandAll = value
    },
    getClassifyFormItemWidth() {
      return this.$i18n.locale === 'en' ? '180px' : '80px'
    },
    // 滚动到底部时
    scrollBottom(next = 1) {
      const { totalPages } = this.formInline.pageInfo
      if (next > totalPages) return
      this.requirementListInitWithPageNumber(
        next > totalPages ? totalPages : next,
      )
    },
    // 滚动到顶部时
    scrollTop(next = 1) {
      this.requirementListInitWithPageNumber(next < 1 ? 1 : next)
    },
    onRequirementListInit() {
      this.requirementListInitWithPageNumber(this.lastClickItemPageNumber)
    },
    // 排序
    orderChange(value) {
      this.formInline = {
        ...this.formInline,
        orderBy: value,
      }

      try {
        this.$refs.requirementTable.$refs.multipleTable.clearSort()
      } catch (e) {
        console.log(e)
      }

      this.$nextTick(this.requirementListInit)
    },
    changeRequireCategory(val, $event) {
      this.currCategoryId = val

      this.$nextTick(() => {
        document.elementFromPoint($event.clientX, $event.clientY).click()
      })
    },
    cancelCategoryChange(isChange) {
      if (!isChange) {
        this.currCategoryId = ''
      }
    },
    async handleChange(id, pageNumber) {
      let categoryId = this.$refs['cascader'][0].getCheckedNodes()[0].data
        .categoryId
      await requirementService.update({ id, categoryId })
      this.$message({
        message: i18n.t('更新成功'),
        type: 'success',
      })
      this.requirementListInitWithPageNumber(pageNumber)
      this.currCategoryId = ''
    },
    //获取迭代过滤器类型
    sprintTypeFun(val) {
      this.formInline.isArchived = val
      this.formInline.sprintIds = this.formInline.sprintIds.filter(
        item => item !== -3,
      )
    },
    // 快速创建需求成功回调
    saveRequirSuccess() {
      this.requirementListInit()
      this.cancleRequire()
    },
    //取消快速创建
    cancleRequire() {
      if (this.createRequireInfo.status) {
        const checkItems = cloneDeep(this.checkItems)
        this.treeData.shift()
        this.createRequireInfo.status = false
        this.createRequireInfo = {
          ...RESETINFO,
        }
        this.$refs.requirementTable?.$nextTick(() => {
          this.clearInvalidCheckWorkItem(checkItems)
        })
      }
    },
    //快去创建需求
    addFatherRquire() {
      if (this.createRequireInfo.status) {
        this.$message({
          type: 'warning',
          message: i18n.t('一次性只能创建一条需求'),
        })
        return
      }
      const checkItems = cloneDeep(this.checkItems)
      this.treeData.unshift(this.createRequireInfo)
      // this.getPriorityList();
      // this.getSprintList();
      // this.getAssignUser();
      this.createRequireInfo.status = true
      this.$refs.requirementTable?.$nextTick(() => {
        this.clearInvalidCheckWorkItem(checkItems)
      })
    },
    //取消需求分类
    cancelRequireName(formName) {
      this.$refs[formName].resetFields()
      this.centerDialogVisible = false
    },
    //拖拽完之后的回调
    async finalNodeDrag(node, lnode, type) {
      let that = this
      if (lnode.key === 0) {
        if (type === 'after' || type === 'inner') {
          this.$message({
            type: 'error',
            message: i18n.t('不能拖动到未分类之下'),
          })
          this.getRequirementCategory()
          this.requirementListInit()
          return
        }
      }
      if (lnode.key === -1 && type === 'before') {
        this.$message({
          type: 'error',
          message: i18n.t('不能拖到全部分类之外'),
        })
        this.getRequirementCategory()
        this.requirementListInit()
        return
      }
      if (type === 'inner' && lnode.key !== 0) {
        // inner 直接放入
        await dargInnerMove(node.key, lnode.key)
      } else {
        // 不同级 需要先把node挪到 lnode的父节点下
        if (node.level !== lnode.level && lnode.key !== -1) {
          await dargInnerMove(node.key, lnode.parent.key)
        }
        // 然后触发同级排序
        await dragAfterOrBeforeMove(node.key, lnode.key, type)
      }
      this.getRequirementCategory()
      this.requirementListInit()
      function dargInnerMove(id, targetId) {
        return requirementCategoryService
          .change({
            id: id,
            targetId: targetId,
          })
          .then(res => {
            if (res.status === 200) {
              that.$message({
                type: 'success',
                message: i18n.t('更改成功'),
              })
            }
          })
      }
      function dragAfterOrBeforeMove(id, targetId, position) {
        return requirementCategoryService
          .move({
            id,
            targetId,
            position,
          })
          .then(res => {
            if (res.status === 200 && node.level === lnode.level) {
              that.$message({
                type: 'success',
                message: i18n.t('更改成功'),
              })
            }
          })
      }
    },
    //禁止拖拽
    allowDrag(node) {
      if (node.key === -1 || node.key === 0) {
        return false
      } else {
        return true
      }
      // if ( node.level && node.level ===node.previousSibling.level ) {
      //   return true;
      // }
      // if( node.level && node.level == node.nextSibling.level&& node.nextSibling.key !==0){
      //   return true;
      // }
    },
    offsetLeft(obj) {
      var tmp = obj.offsetLeft
      var val = obj.offsetParent
      while (val != null) {
        tmp += val.offsetLeft
        val = val.offsetParent
      }
      return tmp
    },
    offsetTop(obj) {
      var tmp = obj.offsetTop
      var val = obj.offsetParent
      while (val != null) {
        tmp += val.offsetTop
        val = val.offsetParent
      }
      return tmp
    },
    // 下载模板
    requirementModel() {
      let projectId = this.$getUrlParams().projectId
      let url = requirementModel.url + '?projectId=' + projectId
      // window.open(url, '_blank')
      windowOpenUrl(url, '_blank', { ssoToken: true })
    },
    // 导出 excel
    async exportExcel(formInline) {
      // let projectId = this.$getUrlParams().projectId
      formInline = {
        ...this.formInline,
        ...formInline,
      }

      for (let i in formInline) {
        if (Array.isArray(formInline[i]) && formInline[i].length > 0) {
          if (formInline[i] === 'all') {
            formInline[i] = []
          }
        }
      }
      let url = `${requirementExport.url}?projectId=${
        this.$getUrlParams().projectId
      }`
      downloadFilePost(url, formInline, '导出需求.xlsx')
    },
    sortaChangeCallBack(obj) {
      if (obj.prop) {
        this.formInline = {
          ...this.formInline,
          orderBy: [
            {
              column: obj.prop,
              order: obj.order === 'descending' ? 'DESC' : 'ASC',
            },
          ],
        }
      } else {
        this.formInline = {
          ...this.formInline,
          orderBy: [],
        }
      }
      this.$nextTick(this.requirementListInit)
    },

    //新建需求
    onCreate() {
      this.seeTaskHandle('')
    },
    //需求分类编辑
    renderContent(h, { node, data }) {
      // let name = data.name
      return (
        <div
          class="iconmorebox"
          on-click={() => this.iconmoreEvent(node, data, event)}
        >
          <EllipsisBlock class="font-ellipsis" on-click={() => this.iconmoreEvent(node, data, event)} value={data.name}>
            <span class="cursor-pointer">{data.name}</span>
          </EllipsisBlock>
          <span>({data.count})</span>
          {data.id !== 0 && (
            <co-popover
              ref={"popover_" + data.id}
              popper-class="menu-popover"
              placement="right-start"
              trigger="hover"
              visible-arrow={false}
              on-show={() => this.showCoPopover(node, data)}
            >
              <div>
                <div v-show={this.activeCategoryEditShowId !== -1} class="menu cursor-pointer" on-click={() => this.dialogHandle(event, 1)}>
                  {this.$t('创建分类')}
                </div>
                <div class="menu cursor-pointer" on-click={() => this.dialogHandle(event, 2)}>
                  {this.$t('创建子分类')}
                </div>
                <div v-show={this.activeCategoryEditShowId !== -1} class="menu cursor-pointer" on-click={() => this.dialogHandle(event, 3)}>
                  {this.$t('修改分类')}
                </div>
                <div v-show={this.activeCategoryEditShowId !== -1} class="menu cursor-pointer" on-click={() => this.dialogHandle(event, 4)}>
                  {this.$t('删除分类')}
                </div>
              </div>
              <div class="iconmore" slot="reference">
                <i class="iconfont icon-operate" />
              </div>
            </co-popover>
          )}
        </div>
      )
    },
    // 点击需求分类
    iconmoreEvent(node, data) {
      // if (ev.target.className.indexOf('iconfont icon-operate') !== -1) {
      //   // 展开menu
      //   this.onMousnextHandle1(ev, data, node)
      //   return
      // }
      this.$nextTick(() => {
        this.$refs.tree && this.$refs.tree.setCurrentNode(data)
      })
      this.formInline = {
        ...this.formInline,
        categoryIds: data.id === -1 ? [] : [data.id],
      }

      this.categoryIds(data)

      this.show = this.isShow = false
      this.requirementListRefresh()
    },
    // 需求分类编辑 - 展示tool-tip
    renderToolTipEvent() {},
    //子分类请求
    categoryIds(data) {
      if (data.id) {
        this.formInline.categoryIds.push(data.id)
        for (let i = 0; i < data.children.length; i++) {
          this.formInline.categoryIds.push(data.children[i].id)
          if (data.children[i].children.length > 0) {
            this.categoryIds(data.children[i])
          }
        }
      }
    },

    //侧滑栏打开
    async seeTaskHandle(data) {
      this.projectName = this.$store.state.projectName
      this.viewShow = !data.id
      if (data.id) {
        let res = await this.$store.dispatch({
          type: 'getCurrentWorkItemDetailStack',
          payload: {
            workItemType: 1,
            id: data.id,
            projectId: this.formInline.projectId,
          },
        })

        if (res && res.status === 500) {
          this.show = false
          this.contextmenuNone()
          return false
        }
      }
      if (!data) {
        this.newviewShow = true
      }
      if (data && data.pageNumber) {
        this.lastClickItemPageNumber = data.pageNumber
      }
      this.$nextTick(() => {
        this.loading = true
        setTimeout(() => {
          this.loading = false
        }, 500)
      })

      if (this.count === 0) {
        this.preID = data.id
        this.show = !this.show
        this.requireId = data.id

        this.restore = Math.random() * 10
        this.count++
      } else {
        if (this.preID !== data.id) {
          this.preID = data.id
          // this.show = !this.show;
          this.requireId = data.id
          this.restore = Math.random() * 10
        } else {
          this.restore = Math.random() * 10
          this.preID = data.id
          this.count = 0
          this.show = !this.show
          this.requireId = data.id
        }
      }
      this.countlyLog(
        `createRequirement_newviewShow_${this.newviewShow}_viewShow_${this.viewShow}_show_${this.show}`,
      )
    },
    // 获取需求分类
    init() {
      const localStoragerequirementPageType = localStorage.getItem(
        'requirementPageType',
      )

      if (
        localStoragerequirementPageType &&
        ['list', 'card'].includes(localStoragerequirementPageType)
      ) {
        this.pageType = localStoragerequirementPageType
      }
    },
    // 在滑窗关闭后的回调 isForceReq 不检查下发参数变化强制刷新列表
    contextmenuNone(e, isForceReq = false) {
      // 是为了不让用户看到 -1
      setTimeout(() => {
        if (this.show) {
          this.show = false
          this.count = 0
          this.restore = Math.random() * 10
        }
        this.requireId = -1 // 清除保存的需求 id，保证再次点击相同的需求，可以更新数据 add by heyunjiang on 2019.8.1
        this.newviewShow = e
        this.isShow = false
        this.requirementListInit(false, isForceReq, {
          pageInfo: {
            ...this.formInline.pageInfo,
            pageNumber: this.lastClickItemPageNumber,
          },
        })
      }, 300)
    },
    showCoPopover(node, data) {
      this.parentId = data.parentId
      this.activeCategoryEditShowId = node.data.id
      this.mineId = data.id
    },
    //更改弹窗提示语
    dialogHandle(e, index) {
      this.centerDialogVisible = true
      this.dialogStatus = index
      if (this.dialogStatus === 1) {
        this.title = i18n.t('创建的分类名称')
      } else if (this.dialogStatus === 2) {
        this.title = i18n.t('创建的子分类的名称')
      } else if (this.dialogStatus === 3) {
        this.title = i18n.t('修改的名称分类名称')
      } else if (this.dialogStatus === 4) {
        this.centerDialogVisible = false
        this.$confirm(`${i18n.t('确定删除该分类？')}`, {
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        }).then(async () => {
          const result = await this.deleteRequirementCategory()
          if (result.status === 200) {
            this.$message({
              message: result.msg || i18n.t('需求删除成功'),
              type: 'success',
            })

            // 关闭当前 slider
            this.bugClose()
          } else {
            // this.$message({
            //   message: result.msg || "需求删除失败",
            //   type: "warning"
            // });
          }
        })

        this.title = i18n.t('删除分类')
      }

      this.isShow = false
    },
    // onMousnextHandle1(e, data, node) {
    //   e.preventDefault()
    //   document.getElementById('menu').style.display = 'block'
    //   this.$refs.menu.style.left = e.clientX - 30 + 'px'
    //   this.$refs.menu.style.top = e.clientY - 5 + 'px'
    //   this.parentId = data.parentId
    //   this.activeCategoryEditShowId = node.data.id
    //   this.mineId = data.id
    //   this.isShow = true
    // },
    sureSendHandle(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
          this.centerDialogVisible = false
          if (this.dialogStatus === 1) {
            this.addRequirementCategory()
          } else if (this.dialogStatus === 2) {
            this.parentId = this.mineId
            this.addRequirementCategory()
          } else if (this.dialogStatus === 3) {
            this.modifyRequirementCategory()
          } else {
            this.deleteRequirementCategory()
          }
          this.requirementListInit()
        }
      })
    },
    // 点击过滤
    onSubmit(formInline, forceRequest = false) {
      this.formInline = {
        ...this.formInline,
        ...formInline,
      }

      const { sprintIds, isArchived } = this.formInline
      // 特殊处理默认选中已归档和未归档状态
      if (Array.isArray(sprintIds) && sprintIds.length === 2) {
        const tempStr = sprintIds.join(',')
        if (
          isArchived === 0 &&
          (/0,unarchived/.test(tempStr) || /unarchived,0/.test(tempStr))
        ) {
          this.formInline.sprintIds = []
        }
      }
      this.formInline.sprintIds = this.formInline.sprintIds.filter(
        item => item !== 'all' && item !== 'unarchived' && item !== 'archived',
      )

      this.requirementListInit(true, forceRequest)
    },
    // 获取需求分类
    getRequirementCategory() {
      // 解决线上问题： 当打开需求详情的时候,在点击管理看板时，这个projectId为空
      let projectId =
        this.$getUrlParams().projectId || this.rootNode[0].projectId
      requirementCategoryService.tree({ projectId }).then(res => {
        if (!res.data) {
          return
        }
        // 根据displayOrder倒序排序
        ;(function sort(arr) {
          arr.sort((a, b) => b.displayOrder - a.displayOrder)
          for (let child of arr) {
            child.children && sort(child.children)
          }
        })(res.data)
        //todo cpp 这里应该获取自己的queryType=1
        // this.listData = [];
        this.rootNode = [
          //这个就是列表的数据
          {
            id: -1,
            label: i18n.t('全部分类'),
            name: i18n.t('全部分类'),
            parentId: 0,
            projectId: this.$getUrlParams().projectId,
            children: [],
          },
        ]

        // this.rootNode[0].children = [];
        res.data.forEach(node => {
          this.rootNode[0].children.push(node)
        })
        this.listData = this.rootNode
        function getCategoryOptions(list) {
          return list.map(({ label, children, id }) => ({
            label,
            value: String(id),
            categoryId: id,
            children:
              children.length === 0 ? null : getCategoryOptions(children),
          }))
        }
        this.options = getCategoryOptions(res.data)
      })
    },
    addRequirementCategory() {
      let projectId = this.$getUrlParams().projectId
      requirementCategoryService
        .create({
          projectId: projectId,
          name: this.ruleForm.classificationName,
          parentId: this.parentId,
        })
        .then(res => {
          //todo cpp 这里应该获取自己的queryType=1
          if (res.status === 200) {
            this.$message({ type: 'success', message: i18n.t('创建分类成功') })
          } else {
            this.$message({ type: 'error', message: res.msg })
          }
          this.cancelRequireName('ruleForm')
          this.requirementListInit()
        })
    },
    deleteRequirementCategory() {
      requirementCategoryService
        .deleteById({
          id: this.mineId,
        })
        .then(res => {
          //todo cpp 这里应该获取自己的queryType=1
          if (res.status === 200) {
            this.$message({ type: 'success', message: i18n.t('删除分类成功') })
          } else {
            this.$message({ type: 'error', message: res.msg })
          }
          this.requirementListInit()
        })
    },
    modifyRequirementCategory() {
      requirementCategoryService
        .modify({
          name: this.ruleForm.classificationName,
          id: this.mineId,
        })
        .then(res => {
          //todo cpp 这里应该获取自己的queryType=1
          if (res.status === 200) {
            this.$message({ type: 'success', message: i18n.t('修改分类成功') })
          } else {
            this.$message({ type: 'error', message: res.msg })
          }
          this.cancelRequireName('ruleForm')
          this.requirementListInit()
        })
    },
    /**
     * 获取过滤器信息 for tree, card
     * @param filterInfo 过滤信息
     */
    getFilterInfo(filterInfo = {}) {
      let formInline = {}
      Object.assign(
        formInline,
        {
          ...this.formInline,
          pageInfo: {
            ...this.formInline.pageInfo,
            pageNumber: 1,
          },
        },

        filterInfo,
      )
      for (let i in formInline) {
        if (Array.isArray(formInline[i]) && formInline[i].length > 0) {
          if (formInline[i] == 'all') {
            formInline[i] = []
          }
        }
      }
      formInline.sprintIds = formInline.sprintIds.filter(
        item => [-1, -2, -3, -4, -5].indexOf(item) == -1,
      )

      formInline.categoryIds = [...new Set(formInline.categoryIds)]
      return formInline
    },
    /**
     * 需求数据获取
     * @param fourceRequest 是否强制刷新列表 默认 true（false 时需要判断请求参数是否变化）by wuqian
     * @param filterInfo 过滤信息；通常用于更新 pageInfo，页面上下滚动、list快捷更新、侧窗关闭
     */
    requirementListInit(isLoading = false, fourceRequest, filterInfo = {}) {
      // if (
      //   !fourceRequest &&
      //   isEqual(this.filterInfoCopy, this.getFilterInfo(filterInfo)) &&
      //   !(Object.keys(filterInfo).length === 1 && filterInfo.pageInfo)
      // )
      //   return

      if (this.pageType === 'card') {
        this.getCardData(isLoading)
      } else {
        this.getTreeTable(filterInfo, true, true, isLoading)
      }
      this.getRequirementCategory()
    },
    /**
     * 需求数据获取
     * @param fourceRequest 是否强制刷新列表 默认 true（false 时需要判断请求参数是否变化）by wuqian
     * @param filterInfo 过滤信息；通常用于更新 pageInfo，页面上下滚动、list快捷更新、侧窗关闭
     */
    requirementListRefresh(fourceRequest = true, filterInfo = {}) {
      if (
        !fourceRequest &&
        isEqual(this.filterInfoCopy, this.getFilterInfo(filterInfo)) &&
        !(Object.keys(filterInfo).length === 1 && filterInfo.pageInfo)
      )
        return

      if (this.pageType === 'card') {
        this.getCardData()
      } else {
        this.getTreeTable(filterInfo, true, false)
      }
    },
    // 无限滚动 - 更新对应页数需求列表，
    requirementListInitWithPageNumber(pageNumber = 1) {
      this.requirementListInit(false, false, {
        pageInfo: {
          ...this.formInline.pageInfo,
          pageNumber,
        },
      })
    },
    // 批量操作修改回调
    async batchOperationCallback() {
      const pageInfo = this.formInline.pageInfo
      let res = {}
      const checkItems = cloneDeep(this.checkItems)
      const params = this.getFilterInfo({
        pageInfo: {
          ...this.formInline.pageInfo,
          pageNumber: 1,
          pageSize: pageInfo.pageNumber * pageInfo.pageSize,
        },
      })
      try {
        res = await requirementService.customTree(params, { cancelable: true })
        // eslint-disable-next-line no-empty
      } catch (_) {}
      this.treeDataLoading = false
      if (!res.data || !res.data.result) {
        return
      }
      const pageNumber = pageInfo.pageNumber
      for (let index = 1; index <= pageNumber; index++) {
        const start = (index - 1) * pageInfo.pageSize
        const end = start + pageInfo.pageSize
        const data = res.data.result.slice(start, end)

        if (index === pageInfo.pageNumber) {
          this.treeData = data
        } else {
          const originalDatas = this.$refs.requirementTable.pageTrCount[index]
            .cacheList
          this.$refs.requirementTable.pageTrCount[
            index
          ].cacheList = this.$refs.requirementTable
            .formatDataPreComputed(data, index)
            .map((item, index) => {
              const originData = originalDatas[index]
              return Object.assign({}, originData, item, item.data)
            })
        }
      }

      // 刷新父需求 解决需求列表修改需求或新建需求父需求过滤器不实时更新的问题
      this.$refs.headerFilter && this.$refs.headerFilter.getRequireList()
      // 更新分类
      this.treeSummaryData = res.data?.summary

      this.$refs.requirementTable?.$nextTick(() => {
        this.clearInvalidCheckWorkItem(checkItems)
      })
    },
    /**
     * 获取需求 - 树形数据
     * @param filterInfo 过滤信息，如果更换了过滤信息，则需要数据重置
     * @param isCustom 是否走自定义字段列表接口
     */
    async getTreeTable(
      filterInfo = {},
      isCustom = false,
      resetSummary = true,
      isLoading = true,
    ) {
      //this.formInline.projectId = this.$getUrlParams().projectId;
      // 只有完整的过滤条件变了才重置数据，只变 pageInfo 则不重置
      const checkItems = cloneDeep(this.checkItems)
      const changeFilterInfo =
        !isEqual(this.filterInfoCopy, this.getFilterInfo(filterInfo)) &&
        !(Object.keys(filterInfo).length === 1 && filterInfo.pageInfo)
      if (changeFilterInfo) {
        this.$refs.requirementTable &&
          this.$refs.requirementTable.tableInfinitedReset()
      }
      // this.treeDataLoading = true;
      // 终于知道上面的代码为什么要注释掉了，因为这儿设置tableLoading为true的话，由于列表数据会被多次请求，所以，会造成多次的loading效果
      if (isLoading) {
        this.tableLoading = true
      }
      let res = {}
      const params = this.getFilterInfo(filterInfo)
      try {
        const httpService = isCustom
          ? requirementService.customTree
          : requirementService.demandTreePage
        res = await httpService(params)
      } catch (_) {
        console.log('error')
      }
      this.treeDataLoading = false
      this.tableLoading = false
      this.startGuideSplit()
      if (!res.data || !res.data.result) {
        return
      }
      // this.setSystemFilterStorage(RequirementWorkItem, this.$getUrlParams().projectId);
      this.setStorageFilterTitle(RequirementWorkItem, params.title)
      this.formInline.pageInfo = res.data.pageInfo // 更新分页信息
      this.filterInfoCopy = cloneDeep(this.getFilterInfo(filterInfo))
      this.treeData = res.data.result
      this.treeCustomFields = res.data.fields
      this.createRequireInfo.status = false
      if (resetSummary) this.treeSummaryData = res.data.summary
      // 刷新父需求 解决需求列表修改需求或新建需求父需求过滤器不实时更新的问题
      this.$refs.headerFilter && this.$refs.headerFilter.getRequireList()
      this.currCategoryId = ''

      this.$refs.requirementTable?.$nextTick(() => {
        if (changeFilterInfo) {
          this.$refs.requirementTable.$refs.multipleTable.clearSelection()
        }
        this.clearInvalidCheckWorkItem(checkItems)
      })
    },
    // 清空不在列表中的勾选项
    async clearInvalidCheckWorkItem(checkItems = []) {
      /**
       * TODO https://github.com/ElemeFE/element/pull/18524
       * 组件bug
       */
      const localWorkItemsSet = new Set(checkItems.map(item => item.id))
      this.$refs.requirementTable.$refs.multipleTable.store.states.selection = this.$refs.requirementTable.formatData.filter(
        item => localWorkItemsSet.has(item.id),
      )
      this.$refs.requirementTable.$refs.multipleTable.store.updateAllSelected() //计算全
      await this.$refs.requirementTable.$refs.multipleTable.$nextTick()
      this.checkItems = this.$refs.requirementTable.$refs.multipleTable.store.states.selection
      // 快速创建需求 length + 1
      this.isAllChecked =
        this.$refs.requirementTable.formatData.length ===
          this.checkItems.length ||
        (this.$refs.requirementTable.formatData.length ===
          this.checkItems.length + 1 &&
          this.createRequireInfo.status)
    },
    // 获取需求 - 看板模式 - add by heyunjiang on 2019.9.19
    async getCardData(isCardLoading = true) {
      let result = { status: 0 }
      try {
        if (isCardLoading) {
          this.cardLoading = true
        }
        result = await requirementService.cardPoorList(this.getFilterInfo())
      } catch (_) {
        console.log('error')
      }
      this.treeDataLoading = this.cardLoading = false
      if (result.status === 200) {
        this.cardBordData = result.data || []
      }
    },
    processCategoryNodeIterator(nodeData, summaryData) {
      if (!nodeData) {
        return
      }

      nodeData.label = nodeData.name
      let categoryId = nodeData.id
      let selfCount = 0

      if (summaryData[categoryId]) {
        selfCount = summaryData[categoryId].count
      }

      let nodeCount = selfCount
      nodeData.children.forEach(child => {
        let childCount = this.processCategoryNodeIterator(child, summaryData)
        nodeCount = nodeCount + childCount
      })
      nodeData.count = nodeCount
      nodeData.label = nodeData.name + '(' + nodeCount + ')'
      return nodeCount
    },
  },
}
</script>

<style lang="scss" scoped>
// 解决空数据时表头checkbox还能勾选
.tree-table-left-none {
  /deep/ .el-checkbox.is-disabled {
    &.is-checked .el-checkbox__inner {
      background-color: #edf2fc;
      border-color: #dcdfe6;
      &::after {
        border-color: transparent;
      }
    }
  }
}
/deep/ .c-blue-hover:hover {
  .icon-xuqiu {
    color: $--color-icon-xuqiu !important;
  }
}
.requirement-list {
  overflow: hidden;
  width: 100%;
  height: calc(100vh - 112px);
}
.x-arD {
  height: 100%;
}
.demand-card {
  padding: 24px;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .loading-position-top200 {
    flex: 1;
    overflow: hidden;
  }
}
.number {
  margin-left: 5px;
  font-size: 14px;
  font-weight: normal;
}
.tree-header {
  margin: 0 0 16px 0;
  padding: 0 10px;
  line-height: 1;
  font-size: 14px;
  color: #000;
}
#menu {
  /*设置为0 隐藏自定义菜单*/
  height: auto;
  overflow: hidden;
  /*隐藏溢出的元素*/
  background-color: #fff;
  position: fixed;
  /*自定义菜单相对与body元素进行定位*/
  z-index: 2;
  border: 1px solid #eef0f6;
}

// .current-category-hover {
//   padding: 1px 4px;
//   border: 1px solid transparent;
//   display: inline-block;
//   &:hover {
//     box-sizing: border-box;
//     border: 1px solid #dcdcdc;
//     cursor: pointer;
//     padding: 1px 4px;
//   }
// }

.demand-classification {
  overflow: hidden;
  width: 100%;
  height: 100%;
  .left-box-top {
    position: fixed;
    top: 0;
  }
  /deep/ .block-box-right {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
  }
}
/deep/ .block-box-left {
  background-color: $--background-gray;
}

.demand-classification-left {
  height: 100%;
  min-height: 403px;
  min-width: 200px;
  width: 100%;
  padding: 24px 8px;
  box-sizing: border-box;
  //border: 1px solid #eee;

  .el-tree-node__content {
    background: $color-font-active-common;

    .iconmore {
      color: #c4bc2c !important;

      &:hover {
        display: inline-block;
      }
    }
  }
}

.demand-classification-right {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .header-content-box {
    //height: 63px;
    //margin-bottom: 12px;
    padding-bottom: 12px;
  }
  .table__container {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
}

.right-padding {
  padding: 20px 20px 20px 8px;
}

.require-table-header-set {
  position: absolute;
  top: 8px;
  right: 0;
  z-index: 2;
  line-height: 40px;
  height: 40px;
  background: $--background-gray;
  width: 40px;
  text-align: center;
}

// /deep/.el-tree--highlight-current
//   .el-tree-node.is-current
//   > .el-tree-node__content,
// .require-tree-active {
//   color: $color-font-active-common;
//   font-weight: bold;
//   background: transparent;
// }
.el-tree {
  background-color: transparent;
  width: 100%;
  height: calc(100% - 24px);
  overflow-y: auto;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  /deep/ .iconmorebox {
    display: flex;
  }
}

.form-area {
  //margin-bottom: 16px;
}
.center-box {
  margin-top: 16px;
  .quick-create-r-button {
    padding: 0;
    /deep/ span {
      margin-left: 3px;
    }
  }
}
.create-category-dialog {
  /deep/ .el-dialog__header {
    padding: 0 0 16px 0;
  }
}
</style>
<style lang="scss">
.menu-popover {
  font-size: 14px;
  padding: 8px 0;
  .menu {
    line-height: 36px;
    margin: 0 10px;
    padding: 0 13px;
    color: #666666;
    cursor: pointer;
    &:hover {
      background-color: #f1f4f9;
      color: #666666;
    }
  }
}
</style>
