<template>
  <div class="sprint-wrap" :class="{ 'sprint-list__open': sprintListVisable }">
    <div
      v-show="sprintListVisable"
      id="sprintList"
      class="sprint-list-wrap content-outer-box"
    >
      <div v-if="!isSearch" class="sprint-title-box">
        <span>迭代列表</span>
        <span class="search-icon-btn" @click="searchChange">
          <i class="co-icon-search" />
        </span>
      </div>
      <div v-if="isSearch" class="sprint-search-box">
        <co-input
          v-model="searchInputValue"
          placeholder="请输入标题,按enter键搜索"
          prefix-icon="co-icon-search"
          style="width: 170px;"
          @keyup.enter.native="filterSprint"
        ></co-input>
        <span
          style="float: right;line-height: 28px;cursor: pointer;"
          @click="searchChange"
          >取消</span
        >
      </div>
      <div v-show="sprintListVisable" style="height: 100%;">
        <div class="sprint-list-title">
          <!--v-show="$authFunction('PROJ_SPRINT_ADD', 3, projectId)"-->
          <el-button
            v-show="
              $authFunction('PROJ_SPRINT_ADD', 3, $getUrlParams().projectId)
            "
            ref="createBtn"
            class="create-sprint"
            type="text"
            icon="el-icon-plus"
            @click="createSprint()"
            >{{ $t('创建迭代') }}
          </el-button>
          <el-popover
            ref="filter"
            class="filter-btn"
            placement="bottom-start"
            :title="$t('过滤迭代')"
            :width="$isEnglish() ? '400' : '300'"
            trigger="click"
          >
            <div class="popover-line"></div>
            <el-form
              ref="filterForm"
              :label-width="$isEnglish() ? '100px' : '75px'"
            >
              <el-form-item :label="$t('迭代名称')">
                <el-input v-model="filters.sprintName"></el-input>
              </el-form-item>
              <el-form-item :label="$t('创建人')">
                <global-user-select
                  v-if="projectId"
                  ref="globalUserSelect"
                  env-type="PROJECT"
                  :api-params="{ projectId }"
                  :popper-append-to-body="false"
                  class="global-user-selct"
                  value=""
                  :placeholder="$t('输入拼音/工号/姓名')"
                  @change="handleFilterCreateUser"
                ></global-user-select>
                <!-- <select-filter v-model="filters.createUser" :selectList="createUserData"></select-filter> -->
              </el-form-item>
              <el-form-item :label="$t('迭代状态')">
                <el-checkbox-group v-model="filters.filterStatus" size="medium">
                  <el-checkbox label="4">{{ $t('未开始') }}</el-checkbox>
                  <el-checkbox label="5">{{ $t('已开始') }}</el-checkbox>
                  <el-checkbox label="2"
                    >{{ $t('已完成') }}/{{ $t('已归档') }}</el-checkbox
                  >
                </el-checkbox-group>
              </el-form-item>
              <el-form-item style="text-align: right; margin-bottom: 0">
                <el-button size="small" @click="sprintFilterHide">{{
                  $t('取消')
                }}</el-button
                ><el-button
                  :disabled="disabledFilter"
                  size="small"
                  @click="filterSprint"
                  >{{ $t('过滤') }}</el-button
                >
              </el-form-item>
            </el-form>
            <!--<i slot="reference" class="sprint-filter iconfont icon-guolv"></i>-->
          </el-popover>
        </div>
        <!--        <div v-if="showFilterInfo" class="filter-tag">-->
        <!--          <el-tag type="info" closable @close="clearFilter">-->
        <!--            <span class="filter-tag-item" :title="filterInfo">{{-->
        <!--              filterInfo-->
        <!--            }}</span>-->
        <!--          </el-tag>-->
        <!--        </div>-->
        <div
          class="sprint-list-scroll scrollbal-common sprint-list-divbox"
          :class="{ 'filter-info__active': showFilterInfo }"
          @scroll="sprintListScroll"
        >
          <div v-if="!showFilterInfo" style="padding-bottom: 30px">
            <div
              v-for="row in sprintData[unArchivedKey]"
              :key="row.id"
              class="content"
              :class="{
                content__active: row.id == sprintId && !isArchivedBtn(row.id),
                'toggle-sprint': isArchivedBtn(row.id),
              }"
              @click="toSprintDetail(row.id)"
            >
              <div class="sprint-item sprint-item-top">
                <span class="sprint-name" :title="row.name">
                  <span class="sprint-name-title">{{ row.name }}</span>
                  <i
                    v-if="row.isLocked == 1"
                    class="iconfont icon-lock"
                    :title="$t('迭代已锁定')"
                  ></i>
                </span>
              </div>
              <div class="sprint-item sprint-item-middle">
                <div class="stage" style="display: inline-block">
                  <span class="content-item-p"
                    >{{ row.startTime || $t('未设置') }} ~{{
                      row.endTime || $t('未设置')
                    }}
                  </span>
                </div>
              </div>
              <div class="sprint-item sprint-item-bottom">
                <span
                  class="ui-tag-yellow"
                  :title="row.currentStageActual"
                  :class="{
                    'ui-tag-yellow-en': $isEnglish(),
                    'yellow-text': row.currentStageActual === '未开始',
                    'green-text': row.currentStageActual === '已开始',
                    'default-text': row.currentStageActual === '已完成',
                  }"
                  >{{ row.currentStageActual || '--' }}</span
                >
              </div>
            </div>
            <div class="content toggle-sprint">
              <div class="finished-sprint-wrap">
                <el-button
                  type="text"
                  :loading="toggleArchivedLoading"
                  @click.stop="toggleArchived"
                  >{{ isLoadArchived ? $t('隐藏') : $t('显示')
                  }}{{ $isEnglishDisplaySpace() }}{{ $t('归档迭代') }}
                  <i
                    class="el-icon-arrow-down icon-sprint-btn"
                    :class="{ 'icon-sprint-btn__active': isLoadArchived }"
                  />
                </el-button>
              </div>
            </div>
            <div
              v-for="row in sprintData[archivedKey]"
              :key="row.id"
              class="content"
              :class="{
                content__active: row.id == sprintId && !isArchivedBtn(row.id),
                'toggle-sprint': isArchivedBtn(row.id),
              }"
              @click="toSprintDetail(row.id)"
            >
              <div class="sprint-item sprint-item-top">
                <span class="sprint-name" :title="row.name">
                  <span class="sprint-name-title">{{ row.name }}</span>
                  <i
                    v-if="row.isLocked == 1"
                    class="iconfont icon-lock"
                    :title="$t('迭代已锁定')"
                  ></i>
                </span>
              </div>
              <div class="sprint-item sprint-item-middle">
                <div class="stage" style="display: inline-block">
                  <span class="content-item-p"
                    >{{ row.startTime || $t('未设置') }} ~{{
                      row.endTime || $t('未设置')
                    }}
                  </span>
                </div>
              </div>
              <div class="sprint-item sprint-item-bottom">
                <span class="ui-tag-yellow" :title="row.currentStageActual">{{
                  row.currentStageActual || '--'
                }}</span>
              </div>
            </div>
          </div>
          <div v-if="showFilterInfo">
            <div
              v-for="(row, index) in sprintData[allKey]"
              :key="index"
              class="content"
              :class="{
                content__active: row.id == sprintId && !isArchivedBtn(row.id),
                'toggle-sprint': isArchivedBtn(row.id),
              }"
              @click="toSprintDetail(row.id)"
            >
              <div class="sprint-item sprint-item-top">
                <span class="sprint-name" :title="row.name">
                  <span class="sprint-name-title">{{ row.name }}</span>
                  <i
                    v-if="row.isLocked == 1"
                    class="iconfont icon-lock"
                    :title="$t('迭代已锁定')"
                  ></i>
                </span>
              </div>
              <div class="sprint-item sprint-item-middle">
                <div class="stage" style="display: inline-block">
                  <span class="content-item-p"
                    >{{ row.startTime || $t('未设置') }} ~{{
                      row.endTime || $t('未设置')
                    }}
                  </span>
                </div>
              </div>
              <div class="sprint-item sprint-item-bottom">
                <span class="ui-tag-yellow" :title="row.currentStageActual">{{
                  row.currentStageActual || '--'
                }}</span>
              </div>
            </div>
          </div>
          <div
            v-if="canLoading"
            v-show="scrollLoading.visible"
            class="request-loading"
          >
            {{ scrollLoading.label }}
          </div>
        </div>
      </div>
      <sprint-creact-or-edit-dialog
        :dialog-form-title="dialogFormTitle"
        :dialog-form-visible.sync="dialogFormVisible"
        :sure-add-sprint="sureAddSprint"
        :sprint-edit-form="sprintForm"
        @guideBack="initGuide"
      ></sprint-creact-or-edit-dialog>
    </div>
    <div class="switch-btn-wrap" :class="{ width0: !sprintListVisable }">
      <div class="switch-btn" @click="onChangeSprintListVisable">
        <i class="icon el-icon-arrow-left"></i>
      </div>
    </div>
    <div id="sprintDetail" class="sprint-detail-wrap">
      <!-- 迭代详情页面 -->
      <div v-if="!sprintId && isNoData" class="sprint-detail-loading">
        <span v-html="sprintDetailLoading.label"></span>
      </div>
      <!-- :key="toSprintDetailDate"$route.query.sprintId $route.query.sprintId + '' [测试][迭代]工作项详情页评论TT推送链接，跳转至迭代页面，没有正常打开对应的详情页 -->
      <router-view
        v-if="sprintId && isRouterAlive"
        :key="$route.query.sprintId + ''"
        @change="onSprintDetailChange"
      ></router-view>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
Auth: Lei.j1ang、武乾
Created: 2018/1/19-14:54
update: 2020.1.7
*/
// import FieldEdit from '@/components/field-edit'
import GlobalUserSelect from '@/components/global-user-select/src/GlobalUserSelect'
import * as sprintService from '@/service/sprint'
import * as projectService from '@/service/project'

// import SprintDetail from './sprintDetail'
import SprintCreactOrEditDialog from './SprintCreactOrEditDialog'

import flatten from 'lodash/flatten'
import cloneDeep from 'lodash/cloneDeep'

import { guideType, guideStep } from '@/components/guide/guideData'
import { guide } from '@/store/mutation-types'

const StatusEnum = {
  archived: 2,
  unArchived: 1,
  all: 0,
}

const LoadEnum = {
  loading: '', // loading重复了
  noInfo: `<i class="el-icon-bell"></i> ${i18n.t(
    '暂无迭代详情，点击左侧',
  )} <code> "${i18n.t('创建迭代')}"</code>  ${i18n.t(
    '创建或者在左侧列表中选中一个吧',
  )}`,
}

export default {
  name: 'SprintList',
  components: {
    // FieldEdit,
    // SprintDetail,
    SprintCreactOrEditDialog,
    GlobalUserSelect,
  },
  provide() {
    return {
      reload: this.reload,
    }
  },

  data() {
    const scrollLoadEnum = {
      loading: i18n.t('数据加载中') + '...',
      archivedNoData: i18n.t('暂无归档迭代'),
      noMore: i18n.t('没有更多了'),
      noData: i18n.t('暂无数据'),
    }

    return {
      isRouterAlive: true, // 刷新路由
      isSearch: false, // 搜索状态
      searchIng: false, // 处于搜索中
      searchInputValue: '',
      sprintDetailLoading: {
        visible: true,
        label: LoadEnum.loading,
      },

      scrollLoading: {
        visible: true,
        label: scrollLoadEnum.loading,
      },

      scrollLoadingCopy: {
        visible: true,
        label: scrollLoadEnum.loading,
      },

      showFilterInfo: false, // 显示过滤项
      isLoadArchived: false,
      toggleArchivedLoading: false, // 显示/隐藏归档迭代按钮loading
      sprintdialogVisible: false,
      sprintListVisable: true,
      sprintFilterVisible: false,
      toSprintDetailDate: '',
      filters: {
        sprintName: '',
        createUser: '',
        filterStatus: ['2', '4', '5'],
      },

      filtersCopy: {
        sprintName: '',
        createUser: '',
        filterStatus: ['2', '4', '5'],
      },

      sprintStatus: StatusEnum.unArchived,
      projectId: 0,
      sprintId: 0,
      unArchivedPageInfo: {
        currenPage: 1,
        totalPage: 0,
        totalRecord: 0,
      },

      totalPage: 0,
      currenPage: 1,
      pageSize: 10,
      totalRecord: 0,
      assignUserData: [],
      createUserData: [],
      assignUser: 0,
      dialogFormVisible: false,
      dialogFormTitle: '创建迭代',
      timeout: null,
      sprintForm: {
        id: 0,
        projectId: '',
        name: '',
        startTime: '',
        endTime: '',
        chargeUser: '',
        sprintDesc: '',
      },

      params: {
        status: '',
        projectId: '',
        page: this.currenPage,
      },

      archivedKey: StatusEnum.archived,
      unArchivedKey: StatusEnum.unArchived,
      allKey: StatusEnum.all,
      createUsersList: [],
      // 前端迭代列表数据暂存list
      sprintData: {
        [StatusEnum.archived]: [], // 未归档迭代列表
        [StatusEnum.unArchived]: [], // 已归档迭代列表
        [StatusEnum.all]: [], // 过滤后的迭代列表
      },
      sprintDataCopy: {
        [StatusEnum.archived]: [], // 已归档迭代列表
        [StatusEnum.unArchived]: [], // 未归档迭代列表
        [StatusEnum.all]: [], // 过滤后的迭代列表
      },
      scrollLoadEnum,
    }
  },
  computed: {
    userData() {
      return this.$store.state.gd.userInfo
    },
    // 是否显示 “显示/隐藏归档迭代” 操作按钮
    showToggleSprintBtn() {
      return (
        (!this.isNoData && this.hasLoadAllUnArchivedSprints) ||
        this.noUnArchivedSprints
      )
    },
    // 是否加载列表滚动loading效果
    canLoading() {
      // 场景1：未归档列表 且 界面渲染了“显示/隐藏归档迭代” 操作按钮时 不显示滚动loading信息 需求：（存在“显示归档迭代” 操作按钮就表示未归档数据已经全部加载）
      // 场景2：已归档列表 过滤列表都显示滚动loading信息
      return this.sprintStatus === StatusEnum.unArchived
        ? !this.showToggleSprintBtn
        : true
    },
    // 是否灰化过滤按钮
    disabledFilter() {
      // 迭代名称 创建人 迭代状态都未选中时返回true
      return (
        !this.filters.sprintName.trim() &&
        !this.filters.createUser &&
        !this.filters.filterStatus.length
      )
    },
    // 列表是否有数据
    isNoData() {
      const noFilterNoData =
        !this.showFilterInfo &&
        !this.sprintData[StatusEnum.archived].length &&
        !this.sprintData[StatusEnum.unArchived].length
      const filterNoData =
        this.showFilterInfo && !this.sprintData[StatusEnum.all].length
      return noFilterNoData || filterNoData
    },
    // 跟据过滤选中的创建人id返回创建人名称
    createUserLabel() {
      const users =
        this.createUserData.filter(item => {
          return item.key == this.filters.createUser
        }) || []
      return users.length && users[0].userName ? users[0].userName : ''
    },
    filterInfo() {
      return `${i18n.t('过滤')}：${this.filters.sprintName.trim()} ${
        this.createUserLabel
      } ${this.filterStatusLabel}`
    },
    filterStatusLabel() {
      const FilterStatusEnum = {
        2: `${i18n.t('已结束')}/${i18n.t('已归档')}`,
        4: i18n.t('未开始'),
        5: i18n.t('已开始'),
      }
      return this.filters.filterStatus
        .map(item => {
          return FilterStatusEnum[item]
        })
        .join(' ')
    },
    // 未归档列表是否完全加载
    hasLoadAllUnArchivedSprints() {
      return (
        this.unArchivedPageInfo.currenPage === this.unArchivedPageInfo.totalPage
      )
    },
    // 没有未归档数据
    noUnArchivedSprints() {
      return this.unArchivedPageInfo.totalRecord === 0
    },
    currentRouter() {
      return this.$route.path
    },
  },

  watch: {
    '$route.query'(val) {
      if (val.sprintId) {
        this.sprintId = val.sprintId
      }
    },
  },

  async mounted() {
    this.projectId = this.$getUrlParams().projectId
    this.sprintId = this.$getUrlParams().sprintId
    this.params.projectId = this.projectId
    this.params.status = this.sprintStatus
    this.sprintDetailLoading.label = LoadEnum.loading
    // 创建人列表
    this.getAssignUser()
    // 初始化加载一页数据
    this.initLoad()
    // // 800ms 后设置loading状态
    // this.setLoadStatus();
    this.$bus.$on('G_changeGuideStep', this.changeGuideStep)
    this.$bus.$on('G_sprintPlanPrev', this.createSprint)
    this.$bus.$on('G_splitPlanning', this.canGuide)
    this.$bus.$on('G_changeGuideType', this.changeGuideType)
    this.initGuidePrev()
  },
  beforeDestroy() {
    this.$bus.$off('G_changeGuideStep', this.changeGuideStep)
    this.$bus.$off('G_sprintPlanPrev', this.createSprint)
    this.$bus.$off('G_splitPlanning', this.canGuide)
    this.$bus.$off('G_changeGuideType', this.changeGuideType)
  },
  methods: {
    changeGuideType(item) {
      if (
        !this.sprintData[this.unArchivedKey].length &&
        !this.sprintData[this.archivedKey].length &&
        item.guideType === guideType.sprintProgress
      ) {
        this.$store.commit(guide.STEP_WARN, {
          warnMessage: '当前没有迭代，请先创建迭代，再继续浏览此步指引。',
          guideStep: guideStep.sprintPlanning,
        })
        this.$store.commit(guide.UPDATE_GUIDE_STEP, guideStep.progressOverview)
      }
      if (item.guideType === guideType.sprint) {
        this.initGuide()
      }
    },
    canGuide() {
      if (!this.sprintData[this.unArchivedKey].length) {
        this.$store.commit(guide.STEP_WARN, {
          warnMessage: '当前没有迭代，请先创建迭代，再继续浏览此步指引。',
          guideStep: guideStep.sprintPlanning,
        })
        return
      }
    },
    initGuidePrev() {
      if (this.$store.state.guide.guideType !== guideType.sprint) return
      if (
        this.$store.state.guide.guideStep !== guideStep.sprintPlanning &&
        this.$store.state.guide.guideStep !== guideStep.taskSplit
      ) {
        this.$store.commit(guide.RECOVERY_STEP)
        this.initGuide()
      }
    },
    // 刷新路由
    reload() {
      this.isRouterAlive = false
      this.$nextTick(() => {
        this.isRouterAlive = true
      })
    },
    initGuide() {
      let _this = this
      if (
        !this.$authFunction(
          'PROJ_SPRINT_ADD',
          3,
          this.$getUrlParams().projectId,
        )
      ) {
        this.$store.commit(guide.STEP_WARN, {
          warnMessage:
            '你没有创建迭代权限，请在设置中添加权限，再继续浏览此步指引',
          guideStep: guideStep.sprintCreate,
        })
        return
      }
      this.$store.commit(guide.RECOVERY_STEP)
      this.$store.commit(guide.START_GUIDE, {
        guideType: guideType.sprint,
        guideStep: guideStep.sprintCreate,
        step: 1,
        steps: {
          1: {
            dom: this.$refs.createBtn,
            nextCallback() {
              // 下一步回调，打开新建迭代弹窗
              _this.createSprint()
            },
          },
        },
      })
    },
    async changeGuideStep(item) {
      if (this.dialogFormVisible) {
        this.dialogFormVisible = false
        await setTimeout(() => {}, 50)
      }
      if (item.guideStep === guideStep.sprintCreate) {
        // 开始第一步指引
        this.initGuide()
        return
      }
      if (
        [
          guideStep.sprintPlanning,
          guideStep.progressOverview,
          guideStep.sprintBurnOut,
          guideStep.taskSplit,
        ].includes(item.guideStep)
      ) {
        if (!this.sprintData[this.unArchivedKey].length) {
          this.$store.commit(guide.STEP_WARN, {
            warnMessage: '当前没有迭代，请先创建迭代，再继续浏览此步指引。',
            guideStep: item.guideStep,
          })
          return
        }
      }
      if (item.guideStep === guideStep.bugCreate) {
        this.$router.push({
          path: '/bug/list',
          query: {
            projectId: this.$getUrlParams().projectId,
            guideType: guideType.bug,
          },
        })
      }
    },
    searchChange() {
      if (this.isSearch) {
        this.searchInputValue = ''
        if (this.searchIng) {
          this.clearFilter()
        }
      }
      this.isSearch = !this.isSearch
    },
    // 过滤迭代创建人
    handleFilterCreateUser(val) {
      if (val && val.userId) {
        this.filters.createUser = val.userId
      }
    },
    // 5s内接口不返回信息 改成 success
    setLoadStatus() {
      // 初始化时清除timeout 避免内存泄露
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.sprintDetailLoading.label = LoadEnum.noInfo
      }, 5000)
    },
    // 清除过滤项操作
    async clearFilter() {
      this.searchIng = false
      this.setLoadStatus()
      // 复原loading提示信息
      this.scrollLoading = cloneDeep(this.scrollLoadingCopy)
      // 隐藏过滤项
      this.showFilterInfo = false
      // 复原 "显示/隐藏归档迭代" 操作按钮状态
      this.isLoadArchived = false
      // 清除过滤条件
      this.filters = cloneDeep(this.filtersCopy)
      // 清除过滤条件时 显示未归档迭代数据
      this.sprintStatus = StatusEnum.unArchived
      this.currenPage = 1
      this.totalPage = 0
      this.sprintData = cloneDeep(this.sprintDataCopy)
      await this.loadSprintData()
      // 跳转到第一条数据
      this.toFirstSprintDetail()
    },
    // 监听详情页状态改变
    async onSprintDetailChange({ type, sprintId, projectId }) {
      if (!type || !sprintId || !projectId) return
      const indexMap = this.findSprintById(sprintId)
      switch (type) {
        // 删除
        case 'delete':
          this.deleteSprint(indexMap)
          break
        // 归档
        case 'archived':
          this.archivedSprint(indexMap)
          break
        case 'rollback':
          this.rollbackSprint(indexMap)
          break
        default: {
          const params = {
            projectId: this.projectId,
            page: this.indexToPage(indexMap.index),
            status: indexMap.status,
          }

          await this.updateSprintList(params)
        }
      }
    },
    async rollbackSprint({ index }) {
      this.sprintData[StatusEnum.archived] &&
        this.sprintData[StatusEnum.archived].splice(index, 1)
      const params = {
        projectId: this.projectId,
        page: 1,
        size: this.pageSize,
        status: StatusEnum.unArchived,
      }

      // 这里只刷新未归档数据列表第一页的数据
      const { results } = await this.getPageList(params)
      this.sprintData[StatusEnum.unArchived] = results
      this.toSprintDetail(this.sprintId)
    },
    // 归档迭代
    async archivedSprint({ index, status }) {
      // 归档迭代后隐藏无数据提示
      this.scrollLoading.visible = false
      if (!this.showFilterInfo && !this.isLoadArchived) {
        this.deleteSprint({ index, status })
        return
      }
      // 移除当前列表未归档迭代
      this.sprintData[status].splice(index, 1)
      // 非过滤情况 如果显示归档列表 更新归档列表第一条数据
      if (!this.showFilterInfo && this.isLoadArchived) {
        const params = {
          projectId: this.projectId,
          page: 1,
          size: 1,
          status: StatusEnum.archived,
        }

        const { results } = await this.getPageList(params)
        if (results && results[0]) {
          this.sprintData[StatusEnum.archived].unshift(results[0])
          this.toSprintDetail(this.sprintId)
        }
        return
      }
      // 过滤情况 暂时做刷新列表处理 因为不知道归档后迭代的后端数据分页位置 实在没办法解决这种情况
      if (this.showFilterInfo) {
        this.filterSprint()
      }
    },
    // 通过id找到该迭代在前端迭代列表的索引 和 status
    findSprintById(id) {
      const indexMap = {}
      if (this.sprintStatus === StatusEnum.all) {
        this.sprintData[StatusEnum.all].forEach((item, index) => {
          if (item.id == id) {
            Object.assign(indexMap, { status: StatusEnum.all, index })
          }
        })
      } else {
        ;[StatusEnum.archived, StatusEnum.unArchived].forEach(status => {
          this.sprintData[status].forEach((item, index) => {
            if (item.id == id) {
              Object.assign(indexMap, { status, index })
            }
          })
        })
      }
      return indexMap
    },
    indexToPage(index) {
      // index迭代在列表位置
      return Math.ceil((index + 1) / this.pageSize)
    },
    // 初始化执行
    async initLoad() {
      this.sprintData = cloneDeep(this.sprintDataCopy)
      await this.loadSprintData()
      // 选中路由迭代或者第一条列表的数据
      const unArchiveds = this.sprintData[StatusEnum.unArchived]
      let sprintId = ''
      if (unArchiveds.length) {
        sprintId =
          this.$getUrlParams().sprintId ||
          (unArchiveds && unArchiveds[0] && unArchiveds[0].id)
      } else {
        // 获取已归档迭代数据
        await this.toggleArchived()
        const archiveds = this.sprintData[StatusEnum.archived]
        sprintId =
          this.$getUrlParams().sprintId ||
          (archiveds && archiveds[0] && archiveds[0].id)
      }
      this.sprintDetailLoading.label = LoadEnum.noInfo
      if (!sprintId) {
        if (
          this.$store.state.guide.guideType === guideType.bug ||
          this.$store.state.guide.guideType === guideType.sprintProgress
        ) {
          this.$store.commit(guide.STEP_WARN, {
            warnMessage: '当前没有迭代，请先创建迭代，再继续浏览此步指引。',
            guideStep: guideStep.bugTrack,
          })
          if (this.$store.state.guide.guideType === guideType.sprintProgress) {
            this.$store.commit(
              guide.UPDATE_GUIDE_STEP,
              guideStep.progressOverview,
            )
          }
        }
        return
      }
      this.toSprintDetail(sprintId, true)
      // this.toSprintDetail(sprintId, false) // [测试][迭代]工作项详情页评论TT推送链接，跳转至迭代页面，没有正常打开对应的详情页(true改为false)
    },
    // 选中列表第一条迭代
    toFirstSprintDetail() {
      // 过滤状态跟非过滤状态选中的情况不一样
      const status = this.showFilterInfo
        ? StatusEnum.all
        : StatusEnum.unArchived
      // 非过滤选中未归档列表第一条数据  过滤状态选中过滤列表第一条数据
      const sprintId =
        this.sprintData[status] &&
        this.sprintData[status][0] &&
        this.sprintData[status][0].id
      if (!sprintId) return
      this.toSprintDetail(sprintId)
    },
    // 更新当前页迭代列表数据
    async updateSprintList(params) {
      const { pageInfo, results } = await this.getPageList(params)
      if (!pageInfo || !results) return
      const index = (params.page - 1) * this.pageSize
      this.sprintData[params.status].splice(index, this.pageSize, results)
      // results为数组 填充到 this.sprintData[params.status] 后降维
      this.sprintData[params.status] = flatten(this.sprintData[params.status])
    },
    // 新增迭代
    async addSprint() {
      // 迭代列表请求参数
      let params
      // 新增迭代后 将数据填充到那个列表的状态
      let status
      // 过滤时 新增迭代后 填充更新后的第一条数据
      if (this.sprintStatus === StatusEnum.all) {
        status = StatusEnum.all
        params = Object.assign(
          {
            projectId: this.projectId,
            page: 1,
            size: 1,
            status: status,
          },
          this.filters,
        )
      } else {
        // 非过滤时 新增迭代后 未归档列表填充更新后的第一条数据
        status = StatusEnum.unArchived
        params = {
          projectId: this.projectId,
          page: 1,
          size: 1,
          status: StatusEnum.unArchived,
        }
      }
      const { results } = await this.getPageList(
        status === StatusEnum.all ? this.createFilterMo(params) : params,
      )
      if (results && results[0]) {
        this.sprintData[status].unshift(results[0])
      }
    },
    // 删除迭代
    deleteSprint({ status, index }) {
      // 前端移除第index个元素
      this.sprintData[status].splice(index, 1)
      // 判断是否删除未归档列表的数据 并且删除完列表是否为空
      if (
        status === StatusEnum.unArchived &&
        !this.sprintData[StatusEnum.unArchived].length
      ) {
        // 归档迭代列表是否打开 且 归档迭代列表是否有数据 -> 选中第一条数据
        if (
          this.isLoadArchived &&
          this.sprintData[StatusEnum.archived].length
        ) {
          this.toSprintDetail(this.sprintData[StatusEnum.archived][0].id)
        } else {
          this.toSprintDetail()
        }
        return
      }
      // 删除后 如果第index个元素存在则选中
      if (this.sprintData[status][index]) {
        this.toSprintDetail(this.sprintData[status][index].id)
        return
      }
      // 删除后 第index个元素不存在 如果前一个元素存在则选中
      if (this.sprintData[status][index - 1]) {
        // 如果第index个元素不存在则选中前一个
        this.toSprintDetail(this.sprintData[status][index - 1].id)
        return
      }
      // 删除后 无数据
      if (!this.sprintData[status].length) {
        this.toSprintDetail()
      }
    },
    // 切换列表 显示/隐藏归档 按钮
    async toggleArchived() {
      this.toggleArchivedLoading = true
      this.isLoadArchived = !this.isLoadArchived
      if (this.isLoadArchived) {
        this.scrollLoading.label = this.scrollLoadEnum.loading
        this.currenPage = 1
        this.totalPage = 1
        this.sprintStatus = StatusEnum.archived
        await this.loadSprintData()
        this.toggleArchivedLoading = false
      } else {
        this.currenPage = this.unArchivedPageInfo.currenPage
        this.totalPage = this.unArchivedPageInfo.totalPage
        this.sprintStatus = StatusEnum.unArchived
        this.sprintData[StatusEnum.archived] = []
        this.toggleArchivedLoading = false
      }
    },
    // 判断是否加载列表数据
    isload() {
      let state = false
      // 情况1：没有全部加载未归档数据
      if (
        this.sprintStatus === StatusEnum.unArchived &&
        this.currenPage < this.totalPage
      ) {
        state = true
      }
      // 情况2：没有全部加载已归档数据并且按钮为切换为隐藏归档数据
      if (
        this.sprintStatus === StatusEnum.archived &&
        this.currenPage < this.totalPage &&
        this.isLoadArchived
      ) {
        state = true
      }
      // 情况3：过滤迭代列表
      if (
        this.sprintStatus === StatusEnum.all &&
        this.currenPage < this.totalPage
      ) {
        state = true
      }
      return state
    },
    // 列表滚动方法
    sprintListScroll(event) {
      // 迭代列表距离滚动区域底部的距离
      const scrollBottom =
        event.target.scrollHeight -
        event.target.scrollTop -
        event.target.clientHeight
      // 监听滚动条是否到底部
      if (scrollBottom <= 1 && this.isload()) {
        // 加载数据之前显示滚动loading
        this.scrollLoading.visible = true
        // 加载当前页数据
        if (this.sprintStatus === StatusEnum.all) {
          this.loadFilterData()
        } else {
          this.loadSprintData()
        }
      }
    },
    setUnArchivedPageInfo({ currenPage, totalPage, totalRecord }) {
      if (this.sprintStatus === StatusEnum.unArchived) {
        // 保存未归档当前分页以及总页
        Object.assign(this.unArchivedPageInfo, {
          currenPage: currenPage || 1,
          totalPage: totalPage || 0,
          totalRecord: totalRecord || 0,
        })
      }
    },
    // 设置当前列表分页
    setSprintListPageInfo({ currenPage, totalPage, totalRecord }) {
      this.setUnArchivedPageInfo({ currenPage, totalPage, totalRecord })
      this.currenPage = currenPage
      this.totalPage = totalPage
      this.totalRecord = totalRecord
    },
    // 后台分页mo数据 转换为前端vm数据
    pageInfoVm(mo) {
      return {
        currenPage: mo.pageNumber,
        pageSize: mo.pageSize,
        totalPage: mo.totalPages,
        totalRecord: mo.totalRecords,
      }
    },
    // 过滤迭代列表
    async filterSprint() {
      if (this.searchInputValue) {
        this.searchIng = true
        this.$refs.filter.doClose()
        this.setLoadStatus()
        // loading提示信息回退
        this.scrollLoading = cloneDeep(this.scrollLoadingCopy)
        this.currenPage = 1
        this.totalPage = 0
        this.sprintStatus = StatusEnum.all
        this.emptySprintData(StatusEnum.all)
        const results = await this.loadFilterData()
        if (results && results[0]) {
          this.toSprintDetail(results[0].id)
        }
      } else {
        this.clearFilter()
      }
    },
    // 情况某种迭代列表数据
    emptySprintData(status) {
      this.sprintData[status] = []
    },
    // 加载过滤列表数据
    async loadFilterData() {
      if (this.currenPage < this.totalPage) {
        this.currenPage++
      }
      this.filters.sprintName = this.searchInputValue
      const params = Object.assign(
        {
          projectId: this.projectId,
          status: StatusEnum.all,
          page: this.currenPage,
        },

        this.filters,
      )

      this.showFilterInfo = true
      const { pageInfo, results } = await this.getPageList(
        this.createFilterMo(params),
      )

      if (!pageInfo || !results) return
      this.setSprintListPageInfo(this.pageInfoVm(pageInfo))
      this.appendSprintData(results)
      return results
    },
    // 加载迭代列表数据
    async loadSprintData() {
      if (this.currenPage < this.totalPage) {
        this.currenPage++
      }
      // 迭代列表查询参数
      const params = {
        projectId: this.projectId,
        page: this.currenPage,
        status: this.sprintStatus,
      }

      const { pageInfo, results } = await this.getPageList(params)
      if (!pageInfo || !results) return
      this.setSprintListPageInfo(this.pageInfoVm(pageInfo))
      this.appendSprintData(results)
    },
    // 暂存列表数据
    appendSprintData(data) {
      // 填充新数据到已缓存数据列表的末尾
      if (
        this.sprintStatus === StatusEnum.unArchived ||
        this.sprintStatus === StatusEnum.archived ||
        this.sprintStatus === StatusEnum.all
      ) {
        this.sprintData[this.sprintStatus] = this.sprintData[
          this.sprintStatus
        ].concat(data)
      }
      const { scrollLoadEnum } = this
      // 填充数据前判断是否是未归档迭代或者过滤迭代列表 及 数据是否加载完毕
      if (
        this.sprintStatus === StatusEnum.archived &&
        this.totalPage &&
        this.totalPage === this.currenPage
      ) {
        Object.assign(this.scrollLoading, {
          visible: true,
          label: scrollLoadEnum.noMore,
        })
      }
      if (
        this.sprintStatus === StatusEnum.all &&
        this.totalPage &&
        this.totalPage === this.currenPage
      ) {
        Object.assign(this.scrollLoading, {
          visible: true,
          label: scrollLoadEnum.noMore,
        })
      }
      if (!this.totalPage && this.sprintStatus === StatusEnum.archived) {
        Object.assign(this.scrollLoading, {
          visible: true,
          label: scrollLoadEnum.archivedNoData,
        })
      }
      if (!this.totalPage && this.sprintStatus === StatusEnum.all) {
        Object.assign(this.scrollLoading, {
          visible: true,
          label: scrollLoadEnum.noData,
        })
      }
      // 如果是首页数据 不显示滚动loading
      if (this.currenPage <= 1) {
        this.scrollLoading.visible = false
      }
    },
    createFilterMo(vm) {
      return {
        projectId: vm.projectId,
        status: +vm.status,
        page: +vm.page,
        size: +vm.size || this.pageSize,
        sprintName: vm.sprintName,
        createUser: vm.createUser,
        statusArr:
          (Array.isArray(vm.filterStatus) &&
            vm.filterStatus.map(item => +item)) ||
          [],
      }
    },
    sprintFilterHide() {
      this.$refs.filter.doClose()
    },
    isArchivedBtn(val) {
      return val === 'archivedBtn'
    },
    onChangeSprintListVisable() {
      this.sprintListVisable = !this.sprintListVisable
    },
    // 锁定迭代和解绑迭代的方法
    isLockSprint(row) {
      const id = row.id
      const name = row.name
      const val = row.isLocked
      if (val) {
        this.unLockSprint(id, name)
      } else {
        this.lockSprint(id, name)
      }
    },
    async getPageList(params) {
      return await sprintService.pageList(params).then(res => {
        if (!res.data) {
          return {
            results: [],
            pageInfo: {},
          }
        }
        return res.data
      })
    },
    getSprintList() {
      this.params.page = 1
      this.params.status = this.sprintStatus
      this.getPageList(this.params)
    },
    // 获取用户
    getAssignUser(value) {
      const projectId = this.$getUrlParams().projectId
      const query = value || null
      projectService.getUserList({ projectId, query }).then(res => {
        // todo cpp 这里应该获取自己的queryType=1
        this.assignUserData = res.data.map(item => {
          return {
            key: item.userId,
            value: item.userName + '(' + item.userId + ')',
            userName: item.userName,
          }
        })
        this.createUserData = [...this.assignUserData]
        const data = this.userData.userId
        const user = this.assignUserData.find(n => n.key == data)
        this.sprintForm.chargeUser = user.key
      })
    },
    handleAssignerChange(value) {
      this.requirement.assignUser = value
      this.prepareUpdateRequire(
        this.field.assignUser,
        this.requirement.assignUser,
      )

      // this.sendUpdateRequireRequest();
    },
    // 新增迭代 创建迭代成功
    async sureAddSprint() {
      const params = {
        projectId: this.projectId,
        page: 1,
        status: StatusEnum.unArchived,
      }

      // 新增后更新迭代列表
      await this.addSprint(params)
      // 选中新增后的迭代
      this.toFirstSprintDetail()
    },
    sendAddSprintRequest() {
      sprintService.addSprint(this.sprintForm).then(res => {
        if (res.status == 200) {
          this.getSprintList()
          this.$message({
            message: res.msg || i18n.t('添加迭代成功'),
            type: 'success',
          })
        } else {
          // this.$message({ message: res.msg || "添加失败", type: "error" });
        }
      })
    },
    sendUpdateSprintRequest() {
      sprintService.updateSprint(this.sprintForm).then(res => {
        if (res.status == 200) {
          this.getSprintList()
          this.$message({
            message: res.msg || i18n.t('修改迭代成功'),
            type: 'success',
          })
        } else {
          // this.$message({ message: res.msg || "修改失败", type: "error" });
        }
      })
    },
    toSprintDetail(sprintId, replace = false) {
      this.sprintId = sprintId
      this.toSprintDetailDate = Date.parse(new Date())
      if (replace) {
        this.$router.replace({
          name: 'sprintDetail',
          query: {
            ...this.$route.query, // [测试][迭代]工作项详情页评论TT推送链接，跳转至迭代页面，没有正常打开对应的详情页(增加)
            sprintId: sprintId,
            projectId: this.projectId,
          },
        })
      } else {
        this.$goToPage(this, 'sprintDetail', {
          // ...this.$route.query,
          sprintId: sprintId,
          projectId: this.projectId,
        })
      }
    },
    createSprint() {
      this.dialogFormVisible = true
      this.dialogFormTitle = i18n.t('创建迭代')
      this.sprintForm.id = 0
    },
    editSprint(id) {
      this.dialogFormTitle = i18n.t('编辑迭代')
      const params = { sprintId: id }
      sprintService.getBaseInfo(params).then(res => {
        this.$nextTick(() => {
          this.sprintForm = res.data
          this.dialogFormVisible = true
        })
      })
    },
    lockSprint(id, name) {
      this.$confirm(
        `${i18n.t('确定锁定迭代')}['${name}']${i18n.t('吗')}？`,
      ).then(() => {
        sprintService
          .sprintLock({ sprintId: id }, { type: 'form' })
          .then(res => {
            if (res.msg == i18n.t('需要执行强制锁定')) {
              this.$confirm(
                i18n.t(
                  '迭代每个阶段的计划日期尚没有完全确定，是否强制锁定迭代?',
                ),
                i18n.t('提示'),
                {
                  confirmButtonText: i18n.t('确定'),
                  cancelButtonText: i18n.t('取消'),
                  type: 'warning',
                },
              ).then(() => {
                this.forceLockSpring(id)
              })
            } else {
              this.$message({
                message: res.msg || i18n.t('操作成功'),
                type: 'success',
              })

              this.getPageList(this.params)
            }
          })
          .catch(() => {})
      })
    },
    // 强制锁定
    forceLockSpring(id) {
      sprintService
        .sprintForceLock({ sprintId: id }, { type: 'form' })
        .then(res => {
          if (res.status === 200) {
            this.$message({
              message: res.msg || i18n.t('操作成功'),
              type: 'success',
            })

            this.getPageList(this.params)
          }
        })
    },
    unLockSprint(id, name) {
      this.$confirm(`${i18n.t('确定解锁迭代')}['${name}']${i18n.t('吗')}？`)
        .then(() => {
          sprintService
            .sprintUnlock({ sprintId: id }, { type: 'form' })
            .then(res => {
              this.$message({
                message: res.msg || i18n.t('操作成功'),
                type: 'success',
              })

              this.getPageList(this.params)
            })
        })
        .catch(() => {})
    },
    async stopSprint(row) {
      const results = await sprintService.sprintHasUnfinishedItem({
        projectId: row.projectId,
        sprintId: row.id,
      })

      if (results.status === 200 && results.data === true) {
        this.sprintdialogVisible = true
        this.sprinrow = row
      }
      if (results.status === 200 && results.data === false) {
        // this.$confirm("迭代结束后，迭代会进行归档，请确认，是否要结束该迭代？", "提示", {
        //   confirmButtonText: "确定",
        //   cancelButtonText: "取消",
        //   type: "warning"
        // }).then(() => {
        // }).catch(() => {
        // });
        this.$confirm(
          `${i18n.t('归档迭代')}['${row.name}']${i18n.t('后')}，${i18n.t(
            '其所含需求/任务将默认不在列表展示，但能过滤搜索出来，确认归档此迭代吗？',
          )}`,
          i18n.t('提示'),
          {
            confirmButtonText: i18n.t('确定'),
            cancelButtonText: i18n.t('取消'),
            type: 'warning',
          },
        )
          .then(() => {
            sprintService
              .stopSprint({ sprintId: row.id }, { type: 'form' })
              .then(res => {
                this.$message({
                  message: res.msg || i18n.t('操作成功'),
                  type: 'success',
                })

                window.location.reload()
              })
          })
          .catch(() => {})
      }
    },
    planSprint(row) {
      this.$goToPage(this, 'sprintPlan', {
        projectId: row.projectId,
        sprintId: row.id,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
@import './sprint';
@import '@/style/ele-variables';

$detail-content-height: 100%;

.filter-btn {
  display: flex;
  align-items: center;
}
.request-loading {
  color: #999;
  padding: 5px 0;
  text-align: center;
}
.popover-line {
  border-bottom: 1px solid #dde5ef;
  margin-bottom: 12px;
}

.filter-info__active {
  height: 727px !important;
}

.icon-lock {
  vertical-align: middle;
  margin-left: 2px;
}

.sprint-name-title {
  max-width: calc(100% - 20px);
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  /*font-weight: 700;*/
  vertical-align: middle;
  font-size: 14px;
  color: #333333;
}

.filter-form {
  margin-top: 17px;
}

.width0 {
  width: 0 !important;
}

.filter-tag {
  margin-top: 10px;
}
.sprint-detail-loading {
  padding-top: 300px;
  text-align: center;
}
.sprint-detail-nodata {
  padding-top: 344px;
  text-align: center;
}
.toggle-sprint {
  height: 28px !important;
  background: #ebeef5;
  padding: 0 10px !important;
}

.sprint-wrap {
  position: relative;
  width: 100%;
  // height: calc(100vh - 170px);
  height: calc(100vh - 112px) !important;
  // height: 100vh;87
  overflow: hidden !important;
  //margin: -20px 0;
  .switch-btn-wrap {
    width: 10px;
    height: $detail-content-height;
    float: left;
    background-color: #ffffff;
    position: relative;
  }
  .switch-btn {
    position: absolute;
    width: 10px;
    height: 70px;
    left: 0;
    top: 50%;
    margin-top: -35px;
    z-index: 3;
    padding: 27px 0;
    box-sizing: border-box;
    background-color: #f7fafc;
    cursor: pointer;
    border-top-right-radius: 7px;
    border-bottom-right-radius: 7px;
    .icon {
      font-size: 10px;
      color: #999990;
      width: 10px;
      transform: rotate(180deg);
    }
  }
}
.sprint-list__open {
  .sprint-list-wrap {
    position: relative;
    width: $leftList-width !important;
    // height: $detail-content-height;
    height: 100%;
    /*padding: 24px 14px;*/
  }
  .switch-btn {
    left: 0;
    .icon {
      transform: rotate(0);
    }
  }
  .sprint-detail-wrap {
    margin-left: 230px;
    height: $detail-content-height;
  }
}
.sprint-list-wrap {
  width: 0;
  /*background-color: #f7fafc;*/
  background-color: $--background-gray;
  float: left;
  .sprint-list-title {
    display: flex;
    justify-content: space-between;
    border: solid #ebeef5;
    border-width: 0 0 1px 0;
    /*padding: 4px 10px 4px 0;*/
    box-sizing: border-box;
    padding: 0 10px;
  }
  .sprint-list-scroll {
    @include scroll;
    height: calc(100% - 43px);
    overflow-x: hidden;
    margin: 0 0 0 10px;
    .sprint-item {
      display: flex;
      align-items: center;
      /*height: 30px;*/
      /*margin-right: 20px;*/
    }
  }
}
.sprint-detail-wrap {
  min-width: 726px;
  height: $detail-content-height;
  box-sizing: border-box;
  background-color: #fff;
}
/deep/ .el-checkbox {
  margin-left: 5px;
  margin-right: 30px;
}
.create-sprint {
  display: flex;
  align-items: center;
}
.sprint-filter {
  font-size: 14px;
  line-height: 1;
  color: $--color-primary;
  cursor: pointer;
  outline: none;
}
.lh30 {
  line-height: 30px;
}
.lh40 {
  line-height: 40px;
}
.content__active {
  /*background-color: rgb(222, 235, 255);*/
  background-color: $--color-primary;
  border-radius: 4px;
  opacity: 0.9;
  color: #ffffff;
  .sprint-name-title {
    color: #ffffff;
  }
  .ui-tag-yellow {
    color: #ffffff;
    font-size: 12px;
  }
}
.finished-sprint-wrap {
  /*padding: 5px 0;*/
  height: 29px;
  overflow: hidden;
  line-height: 29px;
  .el-button {
    color: #666666;
    font-size: 12px;
  }
  .el-button.is-loading {
    background-color: #ebeef5;
    color: #666666;
  }
  .el-button.is-loading:before {
    background-color: transparent;
  }
  span {
    cursor: pointer;
  }
}
.content {
  padding: 10px;
  width: 180px;
  position: relative;
  /*height: 90px;*/
  border: 0;
  border-bottom-width: 1px;
  border-style: solid;
  border-color: #ebeef5;
  cursor: pointer;
  font-family: MicrosoftYaHei;
  font-size: 12px;
  .content-item-p {
    margin: 0;
    /*height: 26px;*/
    /*line-height: 26px;*/
    margin: 4px 0;
    display: inline-block;
    min-width: 160px;
  }

  .progress-user {
    width: 270px;
    display: inline-block;
    position: relative;
    right: -30px;
    // position: absolute;
    // right: 25%;
    // bottom: 5px;
  }

  .dateTips {
    color: #fff;
    border-radius: 8px;
    padding: 1px 4px;
    font-size: 12px;
    background: #f0a100;
  }

  .dateTipsred {
    color: #fff;
    border-radius: 8px;
    padding: 1px 4px;
    font-size: 12px;
    background: #fa0b00;
  }

  .sprint-desc {
    height: 26px;
    line-height: 26px;
    padding-left: 20px;
    margin: 0;
  }
}

.font-desgin {
  font-size: 14px;
  color: #333;
  font-weight: 700;
}

.sprint-name {
  width: 100%;
  overflow: hidden;
  position: relative;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress {
  width: 100px;
  height: 18px;
  display: inline-block;
  border-radius: 0% !important;
  position: relative;
  top: -2px;
}

.ml30 {
  margin-left: 30px;
}

.ml77 {
  margin-left: 77px;
}

.progress-tip {
  font-size: 15px;
  padding-bottom: 3px;
  margin-right: 5px;
}

.ui-tag-yellow {
  display: inline-block;
  max-width: 75px;
  line-height: 20px;
  box-sizing: border-box;
  /*color: #f0a100;*/
  padding-right: 10px;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: middle;
  position: relative;
}
.ui-tag-yellow-en {
  max-width: 190px;
}
.yellow-text {
  color: #ff722e;
}
.green-text {
  color: $--color-primary;
}
.default-text {
  color: #999999;
}
.filter-tag-item {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sprint-title-box {
  font-family: MicrosoftYaHei;
  font-size: 14px;
  color: #292f3a;
  height: 28px;
  line-height: 28px;
  padding: 10px 14px 0 14px;
  .search-icon-btn {
    float: right;
    cursor: pointer;
    color: #666666;
    &:hover {
      color: $--color-primary;
    }
  }
}
.sprint-search-box {
  padding: 10px 10px 0 10px;
  /deep/ .el-input__inner {
    padding-left: 22px;
    font-size: 12px;
  }
}
</style>
<style>
.sprint-filter-pop {
  width: auto !important;
}
</style>
