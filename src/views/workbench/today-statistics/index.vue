<template>
  <div>
    <base-card
      v-show="!isFullScreen"
      ref="baseCard"
      shadow="never"
      class="todayStatistics"
    >
      <template slot="header">
        <div class="header-left">
          <div class="header-title">{{ $t('今日统计') }}</div>
        </div>
      </template>
      <div slot="content" class="todayStatistics-content">
        <StatisticsItem
          v-for="item in statisticsList"
          :key="item.title"
          :item-info="item"
          @setMode="setMode"
        />
      </div>
    </base-card>

    <full-screen-work-items
      v-if="isFullScreen"
      ref="fullScreenCard"
      :show="isFullScreen"
      :work-items-type="workItemsType"
      :card-height="fullCardHeight"
      @exit-full-screen="handleCloseFullScreen"
      @update-work-item-data="updateWorkItemData"
      @work-item-click="handleShowWorkItem"
    />

    <!-- 工作项滑窗 -->
    <slide
      v-if="show"
      ref="side"
      v-loading="loading"
      :show.sync="show"
      :popper-append-to-body="true"
      :element-loading-text="$t('拼命加载中')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgb(255,255,255)"
      @hide="beforeSliderClose({})"
      @click.stop
    >
      <div class="work-item-task">
        <bug-detail
          v-if="
            activeWorkItem.workItemType === 3 &&
              activeWorkItem.projectId != -1 &&
              show
          "
          ref="bug"
          :work-item-id="activeWorkItem.id"
          :project-id="activeWorkItem.projectId"
          :show="show"
          @HandleSide="handleSide"
          @deleteSuccess="updateWorkItemData"
          @updateInfoSuccess="updateWorkItemData"
        ></bug-detail>
        <task-detail
          v-if="activeWorkItem.workItemType === 2 && show"
          ref="task"
          :project-id="activeWorkItem.projectId"
          :work-item-id="activeWorkItem.id"
          :show="show"
          @HandleSide="handleSide"
          @deleteSuccess="updateWorkItemData"
          @updateInfoSuccess="updateWorkItemData"
        ></task-detail>
        <requirement-detail
          v-if="activeWorkItem.workItemType === 1 && show"
          ref="require"
          :project-id="activeWorkItem.projectId"
          :work-item-id="activeWorkItem.id"
          :show="show"
          @HandleSide="handleSide"
          @deleteSuccess="updateWorkItemData"
          @updateInfoSuccess="updateWorkItemData"
        ></requirement-detail>
      </div>
    </slide>
  </div>
</template>

<script>
import StatisticsItem from './Item'
import { workItemsTypes } from '@/views/workbench/constant'
import BaseCard from '../components/BaseCard'
import debounce from 'lodash/debounce'
import { getParent } from '../util'
import { UpdateContainerUtil } from '../util'
import { todayStatistics } from '@/api/workbench'
import { getRealUrl } from '@/utils/sub-app-util'
import WorkbenchWorker from '../workbench.v1.worker'
import { WORKITEMCONST } from '@/utils/constant'
import slide from '@/components/slide-slip/NewSlide'
const FullScreenWorkItems = () =>
  import(
    '@/views/workbench/components/full-screen-work-items/FullScreenWorkItems'
  )
const RequirementDetail = () =>
  import('@/components/columbus-workitem-display/src/RequirementDetail')
const BugDetail = () =>
  import('@/components/columbus-workitem-display/src/BugDetail')
const TaskDetail = () =>
  import('@/components/columbus-workitem-display/src/TaskDetail')
import { parseResponse } from '@/utils/http'

export default {
  components: {
    StatisticsItem,
    FullScreenWorkItems,
    BaseCard,
    slide,
    RequirementDetail,
    BugDetail,
    TaskDetail,
  },
  data() {
    return {
      loading: false,
      show: false,
      statisticsList: [
        {
          title: '今日已完成',
          class: 'icon-suoyoudaichuli1',
          attr: 'todayCompleteCount',
          count: '--',
          bgClass: 'completed',
          workItemsType: 'MY_DONE_OF_TODAY',
        },
        {
          title: '今日待办',
          class: 'icon-jinriyiwancheng1',
          attr: 'todayTodoCount',
          count: '--',
          todayDelayCount: 0,
          bgClass: 'pending',
          workItemsType: 'MY_TODO_OF_TODAY',
        },
        {
          title: '今日到期',
          class: 'icon-jinridaoqi1',
          attr: 'todayDeadLineCount',
          count: '--',
          bgClass: 'expired',
          workItemsType: 'MY_DUE_OF_TODAY',
        },
        {
          title: '所有待办',
          class: 'icon-jinridaichuli1',
          attr: 'allTotalTodoCount',
          count: '--',
          bgClass: 'pending-all',
          workItemsType: 'MY_TODO',
        },
      ],
      workItemsType: 'doneOfTody', //全屏组件Type
      isFullScreen: false, // 是否全屏
      mutationObserver: null,
      updateContainerUtil: null,
      todayStatisticsApi: getRealUrl(todayStatistics.url, { ssoToken: true }),
      worker: null,
      statisticsInfo: [],
      activeWorkItem: {
        id: null,
        projectId: null,
      },
      fullCardHeight: 0,
    }
  },
  watch: {
    statisticsInfo(val) {
      this.statisticsList.forEach(item => {
        item.count = val[item.attr]
        item.attr === 'todayTodoCount' &&
          (item.todayDelayCount = val.todayDelayCount)
      })
    },
  },
  created() {
    this.worker = new WorkbenchWorker()
    this.worker.onmessage = e => {
      const { event, res } = e.data

      if (event !== 'todayData') {
        return
      }

      parseResponse(
        { data: res },
        function() {},
        function() {},
      )

      if (res?.status === 200 && res?.data) {
        this.statisticsInfo = res.data
      }
    }
    this.updateData()
    this.$once('hook:beforeDestroy', () => {
      // 清除worker线程
      this.worker && this.worker.terminate()
    })
  },
  mounted() {
    // 适应主应用的高度
    const parent = getParent(this.$el)

    if (parent.className?.indexOf('vue-grid-item') > -1) {
      this.mainAppContainer = parent
      this.changeCardHeight(parent)
      this.initResize(parent)
    }

    this.updateContainerUtil = new UpdateContainerUtil({
      vm: this,
      cb: function() {
        this.updateData()
        this.$refs?.fullScreenCard?.getTableData()
      }.bind(this),
      eventTarget: 'workbench_full_screen.coteam',
    })
    this.updateContainerUtil.initListener()

    setTimeout(() => {
      this.copeLinkOpenSlide()
    })
  },
  beforeDestroy() {
    this.mutationObserver && this.mutationObserver.disconnect()
  },
  methods: {
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
      this.show = !this.show
    },
    handleSide() {
      if (this.show) {
        this.show = false
      }
    },
    handleShowWorkItem(workItem) {
      this.activeWorkItem = workItem
      this.show = true

      this.$nextTick(() => {
        this.loading = true

        setTimeout(() => {
          this.loading = false
        }, 500)
      })
    },
    // 观察父应用改变
    initResize(dom) {
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
            that.changeCardHeight(dom)
          }
        }
      }, 150)

      // 创建一个观察器实例并传入回调函数
      this.mutationObserver = new MutationObserver(callback.bind(this))
      // 以上述配置开始观察目标节点
      this.mutationObserver.observe(dom, config)
    },
    // 改变高度
    changeCardHeight(dom) {
      if (this.$el) {
        this.$el.style.height = dom.scrollHeight + 'px'
        this.$nextTick(() => {
          this.$refs?.fullScreenCard?.changeCardHeight(dom.scrollHeight)
        })
      }
    },
    updateData() {
      this.worker.postMessage({
        type: 'http',
        event: 'todayData',
        props: {
          method: 'get',
          url: this.todayStatisticsApi,
        },
      })
    },
    updateWorkItemData() {
      this.updateData()
      this.$refs?.fullScreenCard?.getTableData()
      this.updateContainerUtil?.triggerEvent()
    },
    setMode(type) {
      this.workItemsType = workItemsTypes[type]
      this.handleOpenFullScreen()
    },
    // slider 右侧滑窗关闭前判断
    async beforeSliderClose({ cb }) {
      ;['requrire', 'task', 'bug'].forEach(type => {
        const refComponent = this.$refs[type]
        refComponent && refComponent.setUserInputCache()
      })
      // 执行回调
      cb && cb()
    },
    // 打开全屏
    handleOpenFullScreen() {
      window.$udp.fullScreenHandle(true).then(
        () => {
          this.isFullScreen = true
          this.$nextTick(() => {
            this.$el.style.height = this.mainAppContainer.scrollHeight + 'px'
            this.fullCardHeight = this.mainAppContainer.scrollHeight
          })
        },
        () => {
          this.$message.error('全屏失败')
        },
      )
    },
    // 关闭全屏
    handleCloseFullScreen() {
      window.$udp.fullScreenHandle(false).then(
        () => {
          this.isFullScreen = false
          this.$nextTick(() => {
            this.$el.style.height = this.mainAppContainer.scrollHeight + 'px'
          })
        },
        () => {
          this.$message.error('关闭全屏失败')
        },
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.todayStatistics {
  border: none !important;
  height: 100%;
  box-sizing: border-box;

  /deep/ .el-card__body {
    overflow-x: auto;
  }

  ::-webkit-scrollbar {
    height: 5px;
  }

  /deep/ .el-card__header {
    margin-bottom: 0 !important;
  }

  &-header {
    margin-bottom: 40px;
    font-size: 16px;
    color: #333;
  }
  &-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 0;
  }
  /deep/ .el-card__body {
    height: calc(100% - 36px);
    display: flex;
    align-items: center;
    .base-card-container__content {
      width: 100%;
    }
  }
}
</style>
