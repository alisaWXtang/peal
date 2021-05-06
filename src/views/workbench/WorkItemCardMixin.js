/**
 * @title 工作项卡片 mixins
 * @author chenxiaolong
 * @date 2021.1.12
 */
import EllipsisBlock from '@/components/ellipsis-block'
import BaseCard from './components/BaseCard'
import * as workbenchService from '@/service/workbench'
import GlobalSelect from '@/components/field-edit/GlobalSelect'
import BaseFilter from './components/base-filter/BaseFilter'
import debounce from 'lodash/debounce'
import { iconMaps, orderMap } from './constant'
import { workbenchCardTypes, workItemsTypes } from './constant'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import { getParent, UpdateContainerUtil } from './util'
import WorkbenchWorker from './workbench.v1.worker'
import { workItemList as workItemListApi } from '@/api/workbench'
import { getRealUrl } from '@/utils/sub-app-util'
import { WORKITEMCONST } from '@/utils/constant'
const lineHeight = 40
const customFilters = {
  [workbenchCardTypes.todo]: [
    {
      attrName: 'prioritys',
    },
    {
      attrName: 'deadlines',
    },
    {
      attrName: 'startTimes',
    },
    {
      attrName: 'endTimes',
    },
  ],
  [workbenchCardTypes.create]: [
    {
      attrName: 'prioritys',
    },
    {
      attrName: 'statusClassifies',
    },
    {
      attrName: 'startTimes',
    },
    {
      attrName: 'endTimes',
    },
  ],
  [workbenchCardTypes.done]: [
    {
      attrName: 'prioritys',
    },
    {
      attrName: 'startTimes',
    },
    {
      attrName: 'endTimes',
    },
    {
      attrName: 'finishTimes',
    },
  ],
  [workbenchCardTypes.related]: [
    {
      attrName: 'statusClassifies',
    },
    {
      attrName: 'startTimes',
    },
    {
      attrName: 'endTimes',
    },
    {
      attrName: 'finishTimes',
    },
  ],
}

import slide from '@/components/slide-slip/NewSlide'
const FullScreenDisplay = () =>
  import(
    '@/views/workbench/components/full-screen-work-items/FullScreenDisplay'
  )
import StateFlow from '@/components/state-flow'
const RequirementDetail = () =>
  import('@/components/columbus-workitem-display/src/RequirementDetail')
const BugDetail = () =>
  import('@/components/columbus-workitem-display/src/BugDetail')
const TaskDetail = () =>
  import('@/components/columbus-workitem-display/src/TaskDetail')
import { parseResponse } from '@/utils/http'

let worker = null
export default {
  provide() {
    worker = new WorkbenchWorker()
    return {
      worker,
    }
  },
  components: {
    StateFlow,
    EllipsisBlock,
    BugDetail,
    TaskDetail,
    RequirementDetail,
    slide,
    BaseCard,
    GlobalSelect,
    BaseFilter,
    FullScreenDisplay,
  },
  data() {
    return {
      init: false, // 是否初始化
      // 表格数据
      workItemType: '',
      data: [],
      slideShow: false,
      loading: false,
      tableLoading: false,
      cardLoading: true,
      cardName: '', // 卡片名称
      copyCardName: '', // 卡片名称-备份
      editCardName: false, // 修改卡片名称
      // 搜素条件
      filterForm: {
        projectIds: [],
        workItemTypes: [],
        sprintIds: [],
        searchKey: '',
        orderBy: [],
        pageInfo: {
          pageNumber: 1,
          pageSize: 10,
        },
      },
      cardInitData: {
        [workbenchCardTypes.todo]: {
          cardName: '我的待办',
          workItemType: workItemsTypes.MY_TODO,
          // 搜素条件
          filterForm: {
            assignUser: this.$store.state.gd.userInfo.userId,
            statusClassifies: ['inProgress'],
          },
        },
        [workbenchCardTypes.create]: {
          cardName: '我创建的',
          workItemType: workItemsTypes.MY_CREATED,
          // 搜素条件
          filterForm: {
            deadlines: ['delay', 'dueToday', 'dueThisWeek', 'other'],
            createUser: this.$store.state.gd.userInfo.userId,
          },
        },
        [workbenchCardTypes.related]: {
          cardName: '我相关的',
          workItemType: workItemsTypes.MY_RELATED,
          // 搜素条件
          filterForm: {
            deadlines: ['delay', 'dueToday', 'dueThisWeek', 'other'],
            relevantUserIds: [this.$store.state.gd.userInfo.userId],
          },
        },
        [workbenchCardTypes.done]: {
          cardName: '我完成的',
          workItemType: workItemsTypes.MY_DONE,
          // 搜素条件
          filterForm: {
            deadlines: ['delay', 'dueToday', 'dueThisWeek', 'other'],
            assignUser: this.$store.state.gd.userInfo.userId,
            statusClassifies: ['done'],
          },
        },
      },
      filterValue: null,
      pageInfo: {
        pageNumber: 1,
        pageSize: 10,
        totalRecords: 0,
        pages: 1,
      },
      // 活动工作项
      activeWorkItem: {
        id: null,
        projectId: null,
      },
      isFullScreen: false, // 是否全屏
      tableHeight: 100, // 表格高度
      mainAppContainer: null, // 主应用直接容器
      totalList: [], // 总数据
      thisSort: [], // 当前卡片排序信息
      fullScreenSort: [], // 全屏排序
      mutationObserver: null,
      cardHeight: '100%', // 卡片高度
      cardHeightInit: false, // 高度是否初始化
      updateContainerUtil: null,
      sortNoEqual: true,
      workItemFilter: {},
      worker: null,
      workItemListApi: getRealUrl(workItemListApi.url, { ssoToken: true }),
      minContainerHeight: 0, // 小卡片容器高度
    }
  },
  computed: {
    // 计算筛选图表上的title提示
    filterToolTipTitle() {
      return this.$refs?.BaseFilter?.drawerShow ? '' : this.$t('筛选')
    },
    cardType() {
      return this.type
    },
    // 当前过滤器配置
    localFilters() {
      return [
        {
          attrName: 'searchKey',
        },
        {
          attrName: 'workItemTypes',
          hidden: false,
        },
        {
          attrName: 'projectIds',
          initValue(selectList) {
            const values = []
            selectList.forEach(item => {
              if (!item.completed) {
                values.push(item.id)
              }
            })

            return values
          },
        },
        {
          attrName: 'sprintIds',
          initValue(selectList) {
            const values = []
            selectList.map(item => {
              if (item.status === 1) {
                values.push(item.id)
              }
            })

            return values
          },
        },
        ...customFilters[this.type],
      ]
    },
  },
  watch: {
    editCardName(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.editCardName.focus()
        })
      }
    },
  },
  created() {
    if (this.cardInitData) {
      const initData = this.cardInitData[this.type] || {}
      for (const [key, value] of Object.entries(initData)) {
        if (Object.prototype.toString.call(value) === '[object Object]') {
          this[key] = { ...this[key], ...cloneDeep(value) }
        } else {
          this[key] = value
        }
      }
    }

    this.copyCardName = this.cardName
    this.workItemFilter = this.localFilters.find(
      item => item.attrName === 'workItemTypes',
    )
    this.worker = worker
    this.worker.onmessage = this.parseCardData
  },
  async mounted() {
    // this.getCardInfo()
    // 适应主应用的高度
    const parent = getParent(this.$el)

    if (parent?.className?.indexOf('vue-grid-item') > -1) {
      this.mainAppContainer = parent
      this.minContainerHeight = this.mainAppContainer.scrollHeight
      this.changeCardHeight()
      this.initResize()
    }

    this.updateContainerUtil = new UpdateContainerUtil({
      vm: this,
      cb: this.getCardData.bind(this, true),
      eventTarget: this.cardType + '.coteam',
    })
    this.updateContainerUtil.initListener()
    setTimeout(() => {
      this.copeLinkOpenSlide()
    })
  },
  beforeDestroy() {
    this.mutationObserver && this.mutationObserver.disconnect()
    // 清除worker线程
    this.worker && this.worker.terminate()
  },
  methods: {
    // 观察父应用改变
    initResize() {
      // 观察器的配置（需要观察什么变动）
      const config = {
        attributes: true,
        childList: false,
        subtree: false,
        attributeFilter: ['style', 'class'],
      }
      const that = this
      // 当观察到变动时执行的回调函数
      const callback = debounce(mutationsList => {
        // Use traditional 'for loops' for IE 11
        for (let mutation of mutationsList) {
          // style改变
          const styleChange =
            mutation.attributeName === 'style' &&
            this.mainAppContainer.className.indexOf('vue-resizable') > -1
          // class改变
          const classChange =
            mutation.attributeName === 'class' && !this.isFullScreen

          if (mutation.type === 'attributes' && (classChange || styleChange)) {
            this.minContainerHeight = this.mainAppContainer.scrollHeight
            that.changeCardHeight()
          }
        }
      }, 150)

      // 创建一个观察器实例并传入回调函数
      this.mutationObserver = new MutationObserver(callback.bind(this))
      // 以上述配置开始观察目标节点
      this.mutationObserver.observe(this.mainAppContainer, config)
    },
    // 改变高度
    changeCardHeight() {
      if (this.$refs.baseCard) {
        !this.isFullScreen && (this.cardHeight = this.minContainerHeight + 'px')
        this.$nextTick(() => {
          this.tableHeight = this.minContainerHeight - 66 + ''
          this.computedTableContent()
          this.cardHeightInit = true
        })
      }
    },
    // 复制链接打开弹窗
    copeLinkOpenSlide() {
      const hasSlide = document.querySelector(
        "[class*='work-item-box-slider-box']",
      )

      if (hasSlide) {
        return
      }

      const urlParams = this.$getUrlParams()
      const { bugId, requireId, taskId, projectId } = urlParams
      if (!bugId && !taskId && !requireId) {
        return
      }
      this.activeWorkItem = {
        id: bugId || requireId || taskId,
        projectId,
      }
      if (bugId) {
        this.activeWorkItem.workItemType = WORKITEMCONST.workItemTypeMap.bug
      }
      if (taskId) {
        this.activeWorkItem.workItemType = WORKITEMCONST.workItemTypeMap.task
      }
      if (requireId) {
        this.activeWorkItem.workItemType =
          WORKITEMCONST.workItemTypeMap.requirement
      }
      this.slideShow = !this.slideShow
    },
    // 计算表格展示内容
    computedTableContent() {
      const computedPageInfo = () => {
        const height = this.tableHeight - 48
        this.pageInfo.pageSize = Math.floor(height / lineHeight)
        this.pageInfo.pages = Math.ceil(
          this.pageInfo.totalRecords / this.pageInfo.pageSize,
        )
      }

      computedPageInfo()

      if (this.pageInfo.pages > 1) {
        this.tableHeight -= 34
        computedPageInfo()
      }

      this.handlePageChange(this.pageInfo.pageNumber)
    },
    // 工作项图表
    workItemIcon(workItem) {
      return iconMaps[workItem.workItemType]
    },
    // 获取卡片信息
    getCardInfo() {
      workbenchService.cardInfo({ key: this.cardType }).then(res => {
        if (res.status === 200 && res.data) {
          this.cardName = this.copyCardName =
            res.data.fieldValue || this.cardName
        }
      })
    },
    // 延时1天返回day 超过1天返回days
    computedDisplayDay(day) {
      return +day > 1 ? 'days' : 'day'
    },
    // 排序
    sortChange({ prop, order }, type = 'this') {
      if (order) {
        this.filterForm.orderBy = [
          {
            column: prop,
            order: orderMap[order],
          },
        ]
        if (type === 'this') {
          this.thisSort = this.filterForm.orderBy
        } else {
          this.fullScreenSort = this.filterForm.orderBy
        }
      } else {
        this.filterForm.orderBy = this.thisSort = this.fullScreenSort = []
      }

      this.sortNoEqual = isEqual(this.thisSort, this.fullScreenSort)

      this.getCardData(true)
    },
    // 更新数据
    updateData() {
      this.updateContainerUtil.triggerEvent()
      this.getCardData()
    },
    // 页码改变
    handlePageChange(value) {
      this.pageInfo.pageNumber =
        value > this.pageInfo.pages ? this.pageInfo.pages : value || 1
      const start = (this.pageInfo.pageNumber - 1) * this.pageInfo.pageSize
      const end = start + this.pageInfo.pageSize
      this.data = this.totalList.slice(start, end)
    },
    // worker message 回调函数
    parseCardData(e) {
      const { event, res } = e.data
      if (event !== 'workItemData' + this.type) {
        this.cardLoading = false
        return
      }

      parseResponse(
        { data: res },
        function() {},
        function() {},
      )

      if (res?.status === 200 && res?.data) {
        this.totalList = res.data
        this.pageInfo.totalRecords = res.data.length
        this.pageInfo.pages = Math.ceil(
          this.pageInfo.totalRecords / this.pageInfo.pageSize,
        )
      }

      this.changeCardHeight()
      this.cardLoading && (this.cardLoading = false)
      this.init = true
    },
    // 获取卡片数据
    getCardData(silent = false) {
      !this.cardLoading && !silent && (this.cardLoading = true)
      this.worker.postMessage({
        type: 'http',
        event: 'workItemData' + this.type,
        props: {
          method: 'post',
          url: this.workItemListApi,
          payload: this.filterForm,
        },
      })
    },
    // 筛选条件
    handleFilter(val) {
      const filters = {}
      val?.length &&
        val.forEach(item => {
          filters[item.key] = item.value
        })

      this.filterValue = filters
      this.filterForm = {
        ...this.cardInitData[this.type]?.filterForm,
        ...this.filterForm,
        ...filters,
      }
      this.getCardData()
    },
    // 关闭工作项弹窗
    handleSide() {
      if (this.slideShow) {
        this.slideShow = false
      }
    },
    // 保存卡片
    handleSaveCardName() {
      if (!this.cardName) {
        this.$message.warning(this.$t('请输入卡片名称'))
        this.editCardName = true
        return
      }

      if (!this.cardName.replace(/\s/g, '').length) {
        this.$message.warning(this.$t('卡片名称不能全为空格'))
        this.editCardName = true
        return
      }

      if (this.cardName !== this.copyCardName) {
        workbenchService
          .saveCardInfo({
            fieldValue: this.cardName,
            fieldName: this.cardType,
          })
          .then(res => {
            if (res.status === 200) {
              this.copyCardName = this.cardName
              this.editCardName = false
              this.$message.success(this.$t('修改卡片名称成功'))
            }
          })
      } else {
        this.editCardName = false
      }
    },
    // 展示工作项
    handleShowWorkItem(workItem) {
      this.activeWorkItem = workItem
      this.slideShow = true
      if (this.$refs['dataTable'])
        this.$refs['dataTable'].setCurrentRow(workItem)
      this.$nextTick(() => {
        this.loading = true

        setTimeout(() => {
          this.loading = false
        }, 500)
      })
    },
    // 打开全屏
    handleOpenFullScreen() {
      window.$udp.fullScreenHandle(true).then(
        () => {
          this.isFullScreen = true
          this.cardHeight = this.mainAppContainer.scrollHeight + 'px'
          this.$nextTick(() => {
            this.workItemFilter.hidden = true

            if (!this.sortNoEqual) {
              this.filterForm.orderBy = this.fullScreenSort
              this.getCardData(true)
            }
          })
        },
        () => {
          this.$message.error(this.$t('全屏失败'))
        },
      )
    },
    // 关闭全屏
    handleCloseFullScreen() {
      window.$udp.fullScreenHandle(false).then(
        () => {
          this.isFullScreen = false
          this.cardHeight = this.mainAppContainer.scrollHeight + 'px'
          this.cardLoading = true
          setTimeout(() => {
            this.workItemFilter.hidden = false
            if (!this.sortNoEqual) {
              this.filterForm.orderBy = this.thisSort
              this.getCardData(true)
            }
            this.cardLoading = false
          })
        },
        () => {
          this.$message.error(this.$t('关闭全屏失败'))
        },
      )
    },
  },
}
