<template>
  <div
    v-if="!isAbnormity"
    class="content-outer-box bug-container"
    :class="{
      'bug-detail-container-en': $isEnglish() && !statusManage.isFullList,
    }"
  >
    <div class="bug-content">
      <!-- <div class="count-expand-wrap">
        <ExpansionFoldButton
          class="expansion-fold-btn"
          :default-fold="foldStatus"
          @toggle="onToggleSummary"
        ></ExpansionFoldButton>
      </div> -->
      <div
        v-if="!isSingleBugExhibition"
        ref="headerBox"
        class="header-box border-box"
      >
        <header-count
          v-show="!bugSummaryFoldStatus"
          :summary="bugInfo.summary"
          :update-shortcut-info="updateShortcutInfo"
          :shortcut="shortcutFilterInfo.shortcut"
        ></header-count>
        <header-filter
          :project-id="commonFilterInfo.projectId"
          :list-statu="statusManage.isFullList"
          :filter-init-data="filterInfo"
          :bug-edit-slide-status="statusManage.bugEditSlideStatus"
          @newBug="rightSliderHandle"
          @filterOpenChange="headerFilterOpenChange"
          @sprintTypeFun="sprintTypeFun"
          @listStatuChange="listStatuChange"
          @refeshBug="refeshBug"
          @filterClick="updateFilterInfo"
          @bugExport="bugExport"
        ></header-filter>
      </div>
      <div
        v-if="!statusManage.isFullList"
        ref="bugContentBox"
        class="body-box body-box-detail"
      >
        <div v-if="!isSingleBugExhibition" class="left-box">
          <left-list
            :bug-list="bugInfo.bugList"
            :active-bug-info="activeBugInfo"
            :change-active-bug-info="changeActiveBugInfo"
            :update-common-info="updateCommonInfo"
            :common-filter-info="commonFilterInfo"
          ></left-list>
          <div class="left-content-footer">
            <div class="pagination-custom">
              <el-button type="text" @click="goToFirstPage">{{
                $t('首页')
              }}</el-button>
              &nbsp;&nbsp;
              <span>{{ $t('每页') }}</span>
              <el-input
                v-model.number="bugInfo.pageInfo.pageSize"
                class="pagination-custom-input el-input-lowheight"
                :class="{ 'pagination-custom-input-en': $isEnglish() }"
                @change="leftContentPagasizeChange"
              ></el-input>
              <span>{{ $t('条') }}</span>
              &nbsp;
              <span
                >{{ $t('共') }}{{ $isEnglishDisplaySpace()
                }}{{ bugInfo.pageInfo.totalRecords
                }}{{ $isEnglishDisplaySpace() }}{{ $t('条') }}</span
              >
            </div>
            <el-pagination
              v-if="bugInfo.pageInfo.totalPages > 0"
              small
              class="fr"
              layout="prev, next"
              :current-page="bugInfo.pageInfo.pageNumber"
              :page-size="bugInfo.pageInfo.pageSize"
              :page-count="bugInfo.pageInfo.totalPages"
              @current-change="leftContentPagainationChange"
            >
            </el-pagination>
          </div>
        </div>
        <div
          class="detail-box scrollbal-common"
          :class="{ 'detail-box-full': isSingleBugExhibition }"
        >
          <!-- <bug-detail :projectId="commonFilterInfo.projectId" v-if="bugInfo.bugList.length > 0 || isSingleBugExhibition" :activeBugInfo="activeBugInfo" :buginfoData="buginfoData"
              :operateCallback="getBugList" ref="bugDetail" detailType="show" :assocClickCallback="assocClickCallback"
              :isReadyForUpdate="statusManage.isReadyForUpdate" @refeshBug="refeshBug"></bug-detail> -->
          <BugDetail
            v-if="bugInfo.bugList.length > 0 || isSingleBugExhibition"
            :work-item-id="activeBugInfo.id"
            :project-id="commonFilterInfo.projectId"
            :assoc-click-callback="assocClickCallback"
            :is-slider="false"
            show
            @updateInfoSuccess="getBugList"
            @deleteSuccess="refeshBug"
          ></BugDetail>
          <empty-result
            v-if="bugInfo.bugList.length === 0 && !loadingStatus.bugListLoading"
          ></empty-result>
        </div>
      </div>
      <div v-if="statusManage.isFullList" class="body-box">
        <div v-if="!isSingleBugExhibition" class="funnlist-box">
          <full-list
            ref="fullList"
            :full-list-loading="fullListLoading"
            :project-id="commonFilterInfo.projectId"
            :bug-list="bugInfo.bugList"
            :current-bug-list-custom-fields="currentBugListCustomFields"
            :change-active-bug-info="changeActiveBugInfo"
            :update-common-info="updateCommonInfo"
            :common-filter-info="commonFilterInfo"
          ></full-list>
          <div class="left-content-footer">
            <el-pagination
              v-if="bugInfo.pageInfo.totalPages > 0"
              background
              class="fr"
              size="middle"
              layout="total, prev, pager, next"
              :total="bugInfo.pageInfo.totalRecords"
              :current-page="bugInfo.pageInfo.pageNumber"
              :page-size="bugInfo.pageInfo.pageSize"
              :page-count="bugInfo.pageInfo.totalPages"
              @current-change="leftContentPagainationChange"
            >
            </el-pagination>
            <div class="pagination-custom">
              <span>{{ $t('每页') }}</span>
              &nbsp;&nbsp;
              <el-input
                v-model.number="bugInfo.pageInfo.pageSize"
                class="pagination-custom-input"
                @change="leftContentPagasizeChange"
              ></el-input>
              <span>{{ $t('条') }}</span>
              &nbsp;&nbsp;
              <!--              <span-->
              <!--                >{{ $t('共') }}{{ $isEnglishDisplaySpace()-->
              <!--                }}{{ bugInfo.pageInfo.totalRecords-->
              <!--                }}{{ $isEnglishDisplaySpace() }}{{ $t('条') }}-->
              <!--              </span>-->
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 新建 -->
    <slide
      v-if="!isSingleBugExhibition"
      :show="statusManage.bugEditSlideStatus"
      :after-close="() => rightSliderHandle(false)"
      :before-close="({ cb }) => beforeSliderClose({ id: -3, cb })"
    >
      <div slot="task" class="taslinfo silder-box">
        <!-- <bug-detail :ref="currentCreateType" :projectId="commonFilterInfo.projectId" v-if="statusManage.bugEditSlideStatus" detailType="editable" :rightSliderHandle="rightSliderHandle"
          :operateCallback="getBugList" :titleNotice.sync="sliderBeforeCloseData.title"
          :descNotice.sync="sliderBeforeCloseData.desc" :listStatu="statusManage.isFullList" @handleOk="handleDetailOk"></bug-detail> -->
        <BugCreate
          :ref="currentCreateType"
          :show="statusManage.bugEditSlideStatus"
          @HandleSide="() => rightSliderHandle(false)"
          @HandleAddSuccess="
            () => {
              getBugList()
              rightSliderHandle(false)
            }
          "
          @handleOk="handleDetailOk"
        ></BugCreate>
      </div>
    </slide>
    <!-- 关联项滑窗 -->
    <slide
      :show="assocInfo.assocSliderStatus"
      :after-close="assocSliderClose"
      :before-close="
        ({ cb }) => beforeSliderClose({ id: assocInfo.info.id, cb })
      "
    >
      <div slot="task" class="taslinfo silder-box">
        <BugDetail
          v-if="assocInfo.type === 'defect'"
          ref="bug"
          :work-item-id="assocInfo.info.id"
          :project-id="assocInfo.info.projectId || $getUrlParams().projectId"
          :show="assocInfo.assocSliderStatus"
          :assoc-item-open="assocBug"
          @HandleSide="assocSliderClose"
          @updateInfoSuccess="getBugList"
          @deleteSuccess="refeshBug"
        ></BugDetail>
        <TaskDetail
          v-if="assocInfo.type === 'task'"
          ref="task"
          :project-id="assocInfo.info.projectId || $getUrlParams().projectId"
          :work-item-id="assocInfo.info.id"
          :show="assocInfo.assocSliderStatus"
          :assoc-item-open="assocBug"
          @HandleSide="assocSliderClose"
          @deleteSuccess="assocSliderClose"
        ></TaskDetail>
        <RequirementDetail
          v-if="assocInfo.type === 'requirement'"
          ref="requrire"
          :project-id="assocInfo.info.projectId || $getUrlParams().projectId"
          :work-item-id="assocInfo.info.id"
          :show="assocInfo.assocSliderStatus"
          :assoc-item-open="assocBug"
          @HandleSide="assocSliderClose"
          @deleteSuccess="assocSliderClose"
        ></RequirementDetail>
      </div>
    </slide>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 缺陷管理 - 中心控制模块
 * @desc 模块架构设计：分四个模块，中心控制模块 + 3个布局模块，共享数据抽离，通过中心控制模块控制
 * @desc 共享数据：过滤查询条件、当前展示的缺陷信息
 * @desc 约定：1. 采用右侧飘窗实现新建 2. 飘窗实现其他缺陷的预览及编辑，同需求、任务一致
 * @author heyunjiang
 * @date 2019-3-4
 * @update 2019.4.12 增加缺陷列表 statusManage.isFullList
 */
import HeaderCount from './HeaderCount'
import HeaderFilter from './HeaderFilter'
import LeftList from './LeftList'
import FullList from './FullList'
// import BugDetail from './BugDetail'
import {
  BugDetail,
  TaskDetail,
  RequirementDetail,
} from '@/components/columbus-workitem-display'
import { BugCreate } from '@/components/columbus-workitem-create'
import EmptyResult from './EmptyResult'
// import TaskDetail from '../task/taskDetail'
// import RequireDetail from '../requirement/requirementView'
import slide from '@/components/slide-slip'
import StringView from '@/utils/string-view'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import TinymceSaveMixin from '@/mixin/tinymce-save-mixin'
// import TwoBlockWidthChanger from '@/components/two-block-width-changer'
// import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
// import ExpansionFoldButton from '@/components/expansion-fold-button'
import { BugWorkItem } from '@/utils/project.config'
import { bugListCustom } from '@/service/bug'
import { bugExportApi } from '@/api/bug.js'
import { downloadFilePost } from '@/utils/index'
import { guideStep, guideType } from '../../components/guide/guideData'

const bugId = 'bugId'
const create = 'create'

export default {
  name: 'BugManagementContainer',
  components: {
    HeaderCount,
    HeaderFilter,
    LeftList,
    BugDetail,
    BugCreate,
    slide,
    TaskDetail,
    RequirementDetail,
    FullList,
    EmptyResult,
    // TwoBlockWidthChanger,
    // ExpansionFoldButton,
  },

  mixins: [ProjectCommonMixin, TinymceSaveMixin],
  provide() {
    return {
      onSubmit: (formInline, forceRequest = false) => {
        this.updateFilterInfo(formInline, forceRequest)
      },
    }
  },
  data() {
    return {
      fullListLoading: true,
      foldStatus: null,
      currentCreateType: 'bug',
      // assocBug区分是否是点击关联下面的工作项，主要是为了不让关联工作项改变页面的url,默认是"",值为bug就是通过关联工作项打开的
      assocBug: '',
      filterInfoCopy: null,
      // 所有搜索通用信息
      commonFilterInfo: {
        // 全局过滤信息
        orderBy: [
          { column: 'createTime', order: 'DESC' }, // 默认创建时间、降序排序
        ], // 排序方式，每个项包含 排序字段、ASC|DESC
        projectId: 0, // 项目 id
        pageInfo: {
          // 缺陷分页获取列表信息使用 - 用于设置初始信息
          pageNumber: 1,
          pageSize: 20,
        },
      },

      // 快捷搜索过滤信息
      shortcutFilterInfo: {
        shortcut: {
          // 快捷搜索
          created: false, // 我创建的
          assigned: false, // 分配给我的
          toSolve: false, // 待我解决的
          toAccept: false, // 待我验证的
        },
      },

      // 过滤器搜索信息
      filterInfo: {
        title: null, // 缺陷标题
        statusIds: [], // 缺陷状态列表
        priorities: [], // 缺陷优先级|严重程度
        sprintIds: [], // 关联迭代 id
        causes: [], // 缺陷原因列表
        assignUsers: [], // 指派人，即处理人
        createUsers: [], // 创建人
        isArchived: 0,
        // sources: [], // 缺陷来源
        // functionCharacters: [], // 功能特性
        // reproduceProbabilitys: [] // 复现概率
      },
      buginfoData: [],
      // 缺陷列表信息
      bugInfo: {
        pageInfo: {
          // 缺陷分页信息信息 - 用于分页器，通过双向数据绑定更新
          pageNumber: 1,
          pageSize: 20,
          totalPages: 0,
          totalRecords: 0,
        },

        bugList: [], // 缺陷列表
        bugListCustomFields: [], // 表示当前 tableList 需要展示哪些字段 add by heyunjiang on 2020.1.10
        summary: {
          ONGOING: { number: 0 },
          TODO: { number: 0 },
          DONE: { number: 0 },
          TOTAL: { number: 0 },
        },
      },

      activeBugInfo: {}, // 当前展示的缺陷信息
      // 状态统一管理
      statusManage: {
        isFullList: localStorage.getItem('bugManagementPageType') === 'true', // 是否满屏展示缺陷列表
        bugEditSlideStatus: false, // 新建缺陷右侧划入编辑状态
        isHeaderFilterOpen: false, // 是否展开过滤器
        isReadyForUpdate: false, // 是否更新缺陷附属内容
      },
      SELFJDUGE: {
        // 内部判断逻辑
        safyCodes: [200], // 返回的 status 只有在这个范围内才是正常的
      },
      loadingStatus: {
        // loading 统一管理
        bugListLoading: true,
      },

      // 缺陷页面右侧通用滑块-滑块信息-需求详情、任务详情、缺陷详情
      assocInfo: {
        assocSliderStatus: false,
        type: '',
        info: {},
      },
      count: 0,
      // funnlistBoxHeight: '100px',
    }
  },

  computed: {
    bugSummaryFoldStatus() {
      return this.$store.state.bugManage.bugSummaryFoldStatus
    },
    // 只传 bugId
    isSingleBugExhibition() {
      return !this.$getUrlParams()['projectId'] && this.$getUrlParams()[bugId]
    },
    // 是否是异常状态，bugId 和 projectId 都不传
    isAbnormity() {
      return !this.$getUrlParams()[bugId] && !this.$getUrlParams()['projectId']
    },
    // 自定义 table 展示字段
    currentBugListCustomFields() {
      return this.bugInfo.bugListCustomFields.filter(
        item => !['id', 'title'].includes(item.attrName),
      )
    },
  },
  watch: {
    // 切换详情模式和列表模式时，把模式保留下来，主要是详情模式关闭右侧弹窗保留bugid，而列表模式不保留
    'statusManage.isFullList'(newValue) {
      this.$store.commit('updateDefectDisplayMode', newValue)
    },
    '$route.query': function({ bugId }) {
      if (bugId) {
        this.activeBugInfo = {
          id: bugId,
        }
      }
    },
  },
  created: function() {
    if (this.$getUrlParams()['projectId']) {
      this.commonFilterInfo.projectId = this.$getUrlParams().projectId // 拿url后面跟的 projectId
      this.bugInfo.bugList = []
      sessionStorage.setItem('bugSelectType', 'refresh')
      // 恢复过滤器信息 - 用于顶部统计数字点击后数据恢复
      // this.rebackFilterInfo(this.getUrlParams()['projectId']);
      // 初次进入，如果传了 bugId ，则更新当前展示的缺陷信息
      if (this.$getUrlParams()[bugId]) {
        this.changeActiveBugInfo({ id: +this.$getUrlParams()[bugId] })
        this.getBugListForBugId(+this.$getUrlParams()[bugId])
      } else {
        // this.getBugList()
      }
    }
  },
  mounted: function() {
    // this.funnlistBoxHeightGenerate()
    // 从其他地方跳转过来，新建缺陷
    if (this.$getUrlParams()[create]) {
      this.rightSliderHandle(true)
    }
    this.foldStatus = this.bugSummaryFoldStatus
    this.$bus.$on('G_changeGuideStep', this.changeGuideStep)
  },
  beforeDestroy() {
    this.$bus.$off('G_changeGuideStep', this.changeGuideStep)
  },

  beforeRouteUpdate(to, from, next) {
    this.count++
    if (to.query[bugId] !== this.activeBugInfo.id) {
      this.changeActiveBugInfo({ id: to.query[bugId] })
    }
    next()
  },
  beforeRouteLeave(to, from, next) {
    // if (this.statusManage.bugEditSlideStatus) {
    //   this.statusManage.bugEditSlideStatus = false;
    // }
    // 如果存在内容在编辑，则不能离开
    // if (this.sliderBeforeCloseData.title || this.sliderBeforeCloseData.desc) {
    //   return false;
    // }
    next()
  },
  methods: {
    changeGuideStep(item) {
      if (item.guideStep === guideStep.bugTrack) {
        this.$router.push({
          path: '/sprint/detail',
          query: {
            guideType: guideType.bug,
            projectId: this.$getUrlParams().projectId,
          },
        })
        return
      }
      if (item.guideStep === guideStep.bugCreate) {
        if (this.statusManage.bugEditSlideStatus) {
          this.rightSliderHandle(false)
          setTimeout(() => {
            this.$bus.$emit('G_bugCreate')
          }, 500)
          return
        }
        this.$bus.$emit('G_bugCreate')
      }
    },
    onToggleSummary(val) {
      this.$store.commit('updateBugSummaryFoldStatus', val)
    },
    handleDetailOk(id) {
      if (this.statusManage.isFullList) {
        this.statusManage.bugEditSlideStatus = false
      } else {
        this.$router.push(
          `/bug/list?projectId=${
            this.$getUrlParams()['projectId']
          }&bugId=${id}`,
        )
      }
    },
    //获取迭代过滤器类型
    sprintTypeFun(val) {
      this.filterInfo.isArchived = val
    },
    //更新当前缺陷列表选中信息
    refeshBug() {
      this.activeBugInfo = {}
      this.getBugList()
    },
    /**
     * @desc 获取缺陷列表
     * @param { type } optional, 更新方式： shortcut -> 快捷搜索, filter -> 过滤器搜索，如果没有传，则获取上一次的查询方式
     * @param fourceRequest 是否强制刷新列表 默认 true（false 时需要判断请求参数是否变化）
     * @param  silent 是否静默加载 不启用loading
     */
    getBugList(type, fourceRequest, silent = false) {
      const filterInfo = this.getFilterInfo(type)
      // if (!fourceRequest && isEqual(filterInfo, this.filterInfoCopy)) return
      !silent &&
        (this.loadingStatus.bugListLoading = this.fullListLoading = true)
      bugListCustom(filterInfo).then(res => {
        this.loadingStatus.bugListLoading = this.fullListLoading = false
        if (this.SELFJDUGE.safyCodes.includes(res.status)) {
          if (
            !res.data ||
            !res.data.result ||
            !Array.isArray(res.data.result)
          ) {
            return false
          }
          if (
            res.data.result.length === 0 &&
            this.commonFilterInfo.pageInfo.pageNumber > 1
          ) {
            this.commonFilterInfo.pageInfo.pageNumber =
              res.data.pageInfo.totalPages
            this.getBugList(type, fourceRequest)
          }
          this.setStorageFilterTitle(BugWorkItem, filterInfo.title)
          this.filterInfoCopy = cloneDeep(filterInfo)
          this.bugInfo.pageInfo = res.data.pageInfo
          this.bugInfo.bugList = res.data.result.map(item => {
            return {
              ...item.data,
              ...item,
              display: {
                ...item.display,
                detail: item.detail,
              },
            }
          })
          this.bugInfo.bugListCustomFields = res.data.fields
          // this.buginfoData = res.data.result
          res.data.summary && (this.bugInfo.summary = res.data.summary)
          // if (res.data.statusts && res.data.statusts.length > 0) {
          //   this.filterInfo = {
          //     ...this.filterInfo,
          //     statusIds: res.data.statusts.map(item => item)
          //   }
          // }
          // 设置当前活跃信息：初始化、快捷方式切换、过滤器选择
          // if (Object.keys(this.activeBugInfo).length === 0 || ['refresh', 'shortcut'].includes(type)) {
          //   this.activeBugInfo = this.bugInfo.bugList.length > 0 ? this.bugInfo.bugList[0] : {}
          // }
          // 如果路由没有带bugId 默认选中第一条数据
          if (!this.$getUrlParams().bugId || this.count !== 3) {
            this.activeBugInfo =
              this.bugInfo.bugList.length > 0 ? this.bugInfo.bugList[0] : {}
          }

          this.$nextTick(() => {
            this.$refs.fullList?.localSetCurrentRow()
          })
        }
      })
    },
    // 获取过滤信息
    getFilterInfo(type) {
      let filterInfo = this.commonFilterInfo
      if (!type) {
        type = sessionStorage.getItem('bugSelectType') || 'norefresh'
      } else {
        sessionStorage.setItem('bugSelectType', type)
      }
      switch (type) {
        case 'shortcut':
          filterInfo = {
            ...filterInfo,
            ...this.shortcutFilterInfo,
            ...this.filterInfo,
          }
          break
        default:
          filterInfo = { ...filterInfo, ...this.filterInfo }
      }

      if (filterInfo.sprintIds) {
        filterInfo.sprintIds = filterInfo.sprintIds.filter(
          item =>
            [-1, -2, -3, -4, -5].indexOf(item) == -1 &&
            item !== 'all' &&
            item !== 'unarchived' &&
            item !== 'archived',
        )
      }
      return filterInfo
    },
    // 获取缺陷列表 - 并且跳转到对应缺陷的页数 - 为了实现定位到缺陷那一页
    getBugListForBugId(TBugId) {
      if (!TBugId) {
        this.getBugList()
        return
      }
      let filterInfo = this.commonFilterInfo
      let type = sessionStorage.getItem('bugSelectType') || 'refresh'
      switch (type) {
        case 'shortcut':
          filterInfo = { ...filterInfo, ...this.shortcutFilterInfo }
          break
        default:
          filterInfo = { ...filterInfo, ...this.filterInfo }
      }

      this.loadingStatus.bugListLoading = true
      bugListCustom({
        ...filterInfo,
        queryId: TBugId,
      })
        .then(res => {
          if (this.SELFJDUGE.safyCodes.includes(res.status)) {
            this.bugInfo.pageInfo = res.data.pageInfo
            this.bugInfo.bugList = res.data.result.map(item => {
              return {
                ...item.data,
                ...item,
                display: {
                  ...item.display,
                  detail: item.detail,
                },
              }
            })
            this.bugInfo.bugListCustomFields = res.data.fields
            res.data.summary && (this.bugInfo.summary = res.data.summary)
            if (
              Object.keys(this.activeBugInfo).length === 0 &&
              res.data.result.length > 0
            ) {
              this.activeBugInfo = this.bugInfo.bugList[0]
            }
          }
          this.loadingStatus.bugListLoading = this.fullListLoading = false
        })
        .catch(e => {
          console.error(i18n.t('项目缺陷信息失败') + e)
        })
    },
    // 更新当前活跃 bug 信息
    changeActiveBugInfo: function(activeBugInfo) {
      this.assocBug = ''
      this.activeBugInfo = activeBugInfo
      if (!activeBugInfo || !activeBugInfo.id) {
        this.assocInfo.assocSliderStatus = false
      }
      // 如果是列表模式，则展开通用
      if (this.statusManage.isFullList && activeBugInfo && activeBugInfo.id) {
        setTimeout(() => {
          this.assocInfo = {
            assocSliderStatus: true,
            type: 'defect',
            info: { ...activeBugInfo },
          }
        }, 0)
      }
    },
    // 新建-右侧滑块控制
    rightSliderHandle(bool) {
      this.$nextTick(() => {
        this.statusManage.bugEditSlideStatus = bool
      })
    },
    // 过滤器更新-更新过滤过滤器信息
    updateFilterInfo(newFilter, fourceRequest = false) {
      // newFilter增加固定字段参数 解决Object.assign(this.filterInfo, newFilter)时 如果newFilter无相关参数 this.filterInfo中会保存旧值 导致过滤数据有问题
      const fixed = [
        'types',
        'sources',
        'reproduceProbabilitys',
        'functionCharacters',
      ]

      fixed.forEach(key => {
        if (!Object.keys(newFilter).includes(key)) {
          newFilter[key] = []
        }
      })
      // 强赋值 影响原来作用域 导致取消缺陷更多过滤条件时自动执行FieldEditProps.onChange 换成Object.assign
      // this.filterInfo = { ...this.filterInfo, ...newFilter }
      Object.assign(this.filterInfo, newFilter)
      this.commonFilterInfo = {
        ...this.commonFilterInfo,
        pageInfo: {
          pageNumber: 1,
          pageSize: this.commonFilterInfo.pageInfo.pageSize,
        },
      }

      // 保存过滤器信息到 localstorage 里面
      // localStorage.setItem('bugFilterInfo_' + this.commonFilterInfo.projectId, JSON.stringify(this.filterInfo));
      // this.$nextTick(function () {
      // })
      setTimeout(() => {
        this.getBugList('refresh', fourceRequest)
        this.count++
      }, 0)
    },
    // 过滤器更新-更新快捷查询信息
    updateShortcutInfo(newFilter, type = 'shortcut') {
      this.shortcutFilterInfo.shortcut = {
        ...this.shortcutFilterInfo.shortcut,
        ...newFilter,
      }

      this.commonFilterInfo = {
        ...this.commonFilterInfo,
        pageInfo: {
          pageNumber: 1,
          pageSize: this.commonFilterInfo.pageInfo.pageSize,
        },
      }

      this.$nextTick(function() {
        this.getBugList(type)
        this.count++
      })
    },
    // 过滤器更新-更新通用过滤信息
    updateCommonInfo(newFilter) {
      this.commonFilterInfo = { ...this.commonFilterInfo, ...newFilter }
      this.$nextTick(function() {
        this.getBugList()
      })
    },
    // 过滤器更新-展开过滤器
    headerFilterOpenChange(value) {
      this.statusManage.isHeaderFilterOpen = value
      // this.$nextTick(this.funnlistBoxHeightGenerate)
    },
    // 缺陷列表高度
    // funnlistBoxHeightGenerate() {
    //   const top = this.$refs.headerBox.offsetHeight + 140
    //   this.funnlistBoxHeight = 'calc(100vh - ' + top + 'px)'
    // },
    goToFirstPage() {
      this.bugInfo.pageInfo.pageNumber = 1
      this.updateCommonInfo({
        pageInfo: {
          pageSize: this.bugInfo.pageInfo.pageSize,
          pageNumber: this.bugInfo.pageInfo.pageNumber,
        },
      })
    },
    // 缺陷列表分页-分页信息变化数据获取-页数
    leftContentPagainationChange(num) {
      this.updateCommonInfo({
        pageInfo: {
          pageSize: this.bugInfo.pageInfo.pageSize,
          pageNumber: num,
        },
      })
    },
    // 缺陷列表分页-分页信息变化数据获取-每页条数
    leftContentPagasizeChange(num) {
      if (Number(num) < 1 || !/^\d+$/.test(Number(num))) {
        this.$message({
          type: 'warning',
          message: i18n.t('每页条数必须大于0，并且是整数'),
        })

        this.updateCommonInfo({
          pageInfo: {
            pageSize: this.commonFilterInfo.pageInfo.pageSize,
            pageNumber: 1,
          },
        })
      } else {
        this.updateCommonInfo({
          pageInfo: {
            pageSize: num,
            pageNumber: 1,
          },
        })
      }
    },
    // 缺陷页面右侧通用滑块 - 弹出滑块
    assocClickCallback(info, type) {
      this.assocBug = 'bug'
      this.assocInfo = {
        assocSliderStatus: true,
        type,
        info: { ...info },
      }
    },
    // 缺陷页面右侧通用滑块 - 关闭滑块
    assocSliderClose() {
      this.assocInfo.assocSliderStatus = false // 修复详情组件获取不到 workItemId 问题
      // this.assocInfo = {
      //   assocSliderStatus: false,
      //   type: '',
      //   info: {}
      // };

      // 更新缺陷附属内容
      this.statusManage.isReadyForUpdate = !this.statusManage.isReadyForUpdate
      // close 弹窗时是去除 url 里的 bugId
      this.$router.replace({
        path: this.$route.path,
        query: { ...this.$route.query, bugId: undefined },
      })
    },
    // 缺陷列表状态/详情状态切换
    listStatuChange() {
      this.statusManage.isFullList = !this.statusManage.isFullList
      localStorage.setItem(
        'bugManagementPageType',
        this.statusManage.isFullList,
      )

      // 切换到列表模式时,去除url里的bugId
      if (this.statusManage.isFullList) {
        this.$router.replace({
          path: this.$route.path,
          query: { ...this.$route.query, bugId: undefined },
        })
      } else {
        // 切换到详情模式时，需要在url里加上bugId,
        // 当从详情->列表->详情时，这里的bugId会为undefined,为undefined时，默认选中bug列表中的第一个
        if (!this.activeBugInfo.id) {
          this.activeBugInfo =
            this.bugInfo.bugList.length > 0 ? this.bugInfo.bugList[0] : {}
        }
        this.$router.replace({
          path: this.$route.path,
          query: { ...this.$route.query, bugId: this.activeBugInfo.id },
        })
      }
    },
    encodeString(str) {
      return encodeURIComponent(new StringView(str).toBase64())
    },
    // 缺陷导出
    bugExport(val) {
      let filterInfo = this.getFilterInfo()
      // filterInfo.exportUrl = window.location.origin + getRouterUrl()
      const postInfo = {
        projectId: filterInfo.projectId,
        filterInfo: filterInfo,
        ...val,
      }
      //
      // const url =
      //   bugExportApi.url +
      //   '?projectId=' +
      //   postInfo.projectId +
      //   '&request=' +
      //   postInfo.request
      // // window.open(url, '_blank')
      // windowOpenUrl(url, '_blank')

      // const filterInfo = this.getFilterInfo()
      // this.$fileDownLoadForGet(bugExportApi.url, filterInfo, {
      //   projectId: filterInfo.projectId,
      // })

      let url = `${bugExportApi.url}?projectId=${
        this.$getUrlParams().projectId
      }`
      downloadFilePost(url, postInfo, '导出缺陷.xlsx')
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/style/bug/BugCommon';
// $bottomContentHeight: calc(100vh - 150px);
$bottomContentHeight: 100%;
$leftListWidth: 100%;
$detailBoxWidth: 100%;
/deep/ .block-box .block-box-left {
  border: none;
}
.bug-container {
  height: 100%;

  .bug-content {
    display: flex;
    height: 100%;
    flex-direction: column;
    padding: 20px 24px 24px 24px;
    box-sizing: border-box;

    .header-box {
      height: 104px;
    }

    .body-box {
      flex: 1;
      overflow: hidden;

      &.body-box-detail {
        display: flex;

        /* 左侧缺陷列表 */
        .left-box {
          width: 310px;
          // width: $leftListWidth;
          height: $bottomContentHeight;
          padding: 0;
          margin-right: 16px;
          overflow: hidden;
          box-sizing: border-box;
          position: relative;
          border-radius: 4px;
          border: 1px solid #dcdfe6;
          box-shadow: 0 2px 8px 0 rgba(102, 102, 102, 0.1);
          .left-content-footer {
            position: absolute;
            bottom: 0;
            height: 30px;
            border-top: 1px solid $color-border-common;
            width: 100%;
            padding: 0 8px;
            box-sizing: border-box;
            .pagination-custom {
              float: left;
              width: 210px;
              font-size: 14px;
              // padding: 3px 0;
              line-height: 30px;
              box-sizing: border-box;
              .pagination-custom-input {
                display: inline-block;
                width: 45px;
                margin: 0 5px;
                /deep/ input {
                  height: 22px;
                }
              }
              .pagination-custom-input-en {
                width: 32px;
              }
            }

            /deep/ .el-pagination {
              height: 30px;

              .btn-prev,
              .btn-next {
                padding: 0;
              }
            }
          }
        }

        /* 右侧缺陷详情 */
        .detail-box {
          flex: 1;
          border-radius: 4px;
          border: 1px solid #dcdfe6;
          box-shadow: 0 2px 8px 0 rgba(102, 102, 102, 0.1);
          // width: $detailBoxWidth;
          height: $bottomContentHeight;
          margin: 0;
          box-sizing: border-box;
          overflow-x: auto; // 为什么这里需要加 x-hidden 才能正常展示需要的布局
        }
      }

      /* 全屏列表 */
      .funnlist-box {
        padding: 0;
        margin: 0;
        height: 100%;

        .left-content-footer {
          height: 32px;
          margin-top: 8px;
          box-sizing: border-box;
          display: flex;
          justify-content: flex-end;
          .pagination-custom {
            //display: inline-block;
            //width: 190px;
            font-size: 14px;
            color: #bfbfbf;
            box-sizing: border-box;
            // padding: 3px 0;
            box-sizing: border-box;
            .pagination-custom-input {
              display: inline-block;
              width: 45px;
              margin: 0 5px;
              /deep/ .el-input__inner {
                color: #bfbfbf;
                text-align: center;
              }
            }
          }
        }
      }
    }
  }
}

.detail-box-full {
  width: 100%;
}

/* 重写 App.vue 一些全局样式 */
// #app .content-box {
//   margin-bottom: 0;
// }
.count-expand-wrap {
  position: relative;
  .expansion-fold-btn {
    position: absolute;
    top: -25px;
    left: 50%;
    margin-left: -25px;
  }
}
</style>
