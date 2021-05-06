<template>
  <div v-loading="loading" class="statement-container">
    <el-menu
      class="statement-menu"
      mode="horizontal"
      :default-active="`${workItemType}`"
      @select="changeView"
    >
      <el-menu-item
        v-for="item in typeMap"
        :key="item.name"
        :index="`${item.workItemType}`"
        >{{ item.name }}</el-menu-item
      >
    </el-menu>
    <div class="statement-operation">
      <el-button-group class="common-type">
        <el-button
          :type="common === 1 ? 'primary' : 'default'"
          @click="handleCommon(1)"
          >{{ $t('公开') }}</el-button
        >
        <el-button
          :type="common === 0 ? 'primary' : 'default'"
          @click="handleCommon(0)"
          >{{ $t('私有') }}</el-button
        >
      </el-button-group>

      <el-button
        v-show="common == commonMaps.private"
        ref="createBtn"
        type="primary"
        style="padding: 5px 11px 6px 11px;"
        @click="handleCreate"
        >{{ $t('新建报表') }}</el-button
      >
    </div>

    <el-row :gutter="15" class="statement-list">
      <draggable
        v-if="data.length"
        v-model="data"
        handle=".el-card__header"
        filter=".item-chart,.item-operation,.item-header"
        :force-fallback="true"
        :prevent-on-filter="false"
        @sort="dragSort"
        @clone="handleCloneItem"
      >
        <el-col
          v-for="item in data"
          :key="item.id"
          class="statement-item"
          :span="24"
          :md="24"
          :sm="24"
          :xs="24"
          :lg="12"
          :xl="12"
        >
          <chart-item
            :ref="`chartItem${item.id}`"
            :data="item"
            @chartClick="chartClick"
            @deleteChart="handleDeleteChart"
            @changeCommon="handleDeleteChart"
          ></chart-item>
        </el-col>
      </draggable>
      <div v-else class="empty-data">{{ $t('暂无数据') }}</div>
    </el-row>

    <new-statement-dialog
      :show.sync="show"
      :work-item-type="workItemType"
    ></new-statement-dialog>

    <data-show-dialog
      ref="dataDialogRef"
      :show.sync="showDialog"
      :ajax-params="dataAjaxParams"
      :chart-category="chartCategory"
      :chart-config="chartConfig"
      @workItemClick="handleWorkItemClick"
    ></data-show-dialog>

    <open-work-item-slide
      :id="activeItem.id"
      :slider-status.sync="showSlide"
      :work-item-type="activeItem.workItemType"
      :project-id="activeItem.projectId"
      @updateWorkInfoSuccess="updateWorkInfoSuccess"
    ></open-work-item-slide>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
import NewStatementDialog from './NewStatementDialog'
import OpenWorkItemSlide from '@/components/biz/open-work-item-slide'
import ChartItem from './components/ChartItem'
import draggable from 'vuedraggable'
// import debounce from 'lodash/debounce'
import { statementActions } from '@/store/action-types'
import {
  statementList,
  statementSort,
  statementDetail,
} from '@/service/statement'
import DataShowDialog from './components/DataShowDialog'
import { commonMaps } from './util'
import { statementMutations } from '@/store/mutation-types'
import { guide } from '@/store/mutation-types'
import { guideType, guideStep } from '../../components/guide/guideData'
import { WORKITEMCONST } from '@/utils/constant'

// 工作项类型
const localWorkItemTypes = {
  1: 'require',
  2: 'task',
  3: 'bug',
}

// 报表类型
const localCommonMaps = {
  1: 'open',
  0: 'private',
}

export default {
  name: 'StatementChartContainer',
  components: {
    NewStatementDialog,
    ChartItem,
    draggable,
    DataShowDialog,
    OpenWorkItemSlide,
  },

  data() {
    return {
      workItemType: '1',
      commonMaps,
      showSlide: false, // 是否显示slide
      activeItem: {
        // 当前点击的工作项
        workItemType: '',
        projectId: '',
        id: '',
      },
      loading: false,
      show: false, //是否显示新建dialog
      showDialog: false, // 是否显示透视图表
      dataAjaxParams: {}, // 透视图表数据接口参数
      chartCategory: 1, // 当前图表分类
      chartConfig: {}, // 当前图表配置数据
      scrollTop: 0, // 滚动的高度
      projectContent: null, // 项目容器
      common: 0, // 是否公开
      data: [], // 报表列表
      typeMap: [
        {
          workItemType: 1,
          type: 'requirement',
          name: i18n.t('需求统计'),
        },

        {
          workItemType: 2,
          type: 'task',
          name: i18n.t('任务统计'),
        },

        {
          workItemType: 3,
          type: 'bug',
          name: i18n.t('缺陷统计'),
        },
      ],

      projectId: this.$route.query.projectId,
    }
  },
  mounted() {
    const tabObj = this.$store.state.statement.tabActiveObj
    this.common = tabObj.common
    this.workItemType = tabObj.workItemType
    this.scrollTop = this.$store.state.statement.scrollTop
    this.activeItem = {
      ...this.activeItem,
      workItemType: this.workItemType,
      projectId: this.projectId,
    }
    this.init()
    // this.projectContent = document.querySelector('.project-content')
    // this.projectContent.addEventListener('scroll', this.scrollListener)
    this.initGuide()
  },
  beforeDestroy() {
    // this.projectContent.removeEventListener('scroll', this.scrollListener)
  },
  methods: {
    async initGuide() {
      await setTimeout(() => {}, 100)
      if (this.$store.state.guide.guideType === guideType.bug) {
        this.workItemType = WORKITEMCONST.workItemTypeMap.bug
        let _this = this
        this.$store.commit(guide.START_GUIDE, {
          guideType: guideType.bug,
          guideStep: guideStep.bugTrack,
          step: 2,
          steps: {
            2: {
              dom: this.$refs.createBtn,
              nextCallback() {
                // 下一步
              },
              prevCallback() {
                // 上一步
                _this.$router.push({
                  path: '/sprint/detail',
                  query: {
                    guideType: guideType.bug,
                    projectId: _this.$getUrlParams().projectId,
                    // stepIndex: 5,
                  },
                })
              },
            },
          },
        })
      }
    },
    // 初始化数据
    async init() {
      /**
       * created => 新增 updated 编辑 deleted 删除，statementList
       * 根据类型确定是否刷新页面，以及设置滚动条的位置
       */
      const { editorType } = this.$route.query
      await this.getStatementList()
      // 工作项展开
      const querySet = new Set(Object.keys(this.$route.query))
      let queryKey
      const canShowSlide = ['requireId', 'bugId', 'taskId'].some(item => {
        const isHas = querySet.has(item)

        if (isHas) {
          queryKey = item
        }

        return isHas
      })

      if (canShowSlide) {
        this.activeItem.id = this.$route.query[queryKey]
        this.showSlide = true
      }

      // if (editorType === 'updated' || this.scrollTop) {
      if (editorType === 'updated') {
        this.$nextTick(() => {
          console.log(2222222222222)
          // this.projectContent.scrollTop = this.scrollTop
        })
      }
    },
    // 工作项点击
    handleWorkItemClick(data) {
      this.activeItem = data
      this.showSlide = true
    },
    // 操作详情成功后刷新数据
    updateWorkInfoSuccess() {
      this.$refs.dataDialogRef.getData()
      this.init()
      this.$nextTick(() => {
        const chartItemRef = this.$refs[`chartItem${this.chartConfig.id}`]?.[0]
        chartItemRef && chartItemRef.getChartData()
      })
    },
    // 获取数据
    async getStatementList() {
      // 数据埋点处理
      this.countlyLog(
        `project_statement_list_${
          localWorkItemTypes[Number(this.workItemType)]
        }_${localCommonMaps[Number(this.common)]}`,
      )
      !this.showSlide && (this.loading = true)
      const res = await statementList(
        this.projectId,
        this.workItemType,
        this.common,
      )

      if (res.status === 200 && res.data) {
        this.data = res.data
      }

      this.loading = false
    },
    changeView(active) {
      this.workItemType = active
      const { name } = this.$route
      this.$router.push({
        name,
        query: {
          projectId: this.projectId,
          workItemType: active,
          common: this.common,
        },
      })
      this.$store.dispatch(statementActions.UPDATE_STATEMENT_TAB_OBJ, {
        common: this.common,
        workItemType: this.workItemType,
      })
      this.getStatementList()
    },
    // 创建报表
    handleCreate() {
      this.$router.push({
        name: 'StatementEditor',
        query: {
          projectId: this.projectId,
          workItemType: this.workItemType,
          common: this.common,
        },
      })
    },
    // 获取滚动容器的高度
    scrollListener(e) {
      this.scrollTop = e?.srcElement?.scrollTop || e.scrollTop || 0
      this.$store.commit(
        statementMutations.CONTAINER_LIST_SCROLL_TOP,
        this.scrollTop,
      )
    },
    // 删除chart
    handleDeleteChart(id) {
      const index = this.data.findIndex(item => item.id === id)

      if (index !== -1) {
        this.data.splice(index, 1)
      }
    },
    // 选择是否公有
    handleCommon(val) {
      this.common = val
      const { name } = this.$route
      this.$router.push({
        name,
        query: {
          projectId: this.projectId,
          workItemType: this.workItemType,
          common: this.common,
        },
      })
      this.$store.dispatch(statementActions.UPDATE_STATEMENT_TAB_OBJ, {
        common: this.common,
        workItemType: this.workItemType,
      })
      this.getStatementList()
    },
    // 拖动排序
    dragSort() {
      const chartIds = this.data.map(item => item.id)
      statementSort({
        projectId: this.projectId,
        statisticsType: this.workItemType,
        chartIds,
        common: this.common,
      }).then(res => {
        if (res.status === 200) {
          this.$message.success(i18n.t('列表排序成功'))
        }
      })
    },
    // 图表点击事件
    chartClick(data) {
      this.chartCategory = data.chartData.chartCategory
      this.dataAjaxParams = data.clickData.data.queryParams

      // 判断图表是否已经获取配置参数
      if (data.chartData._cacheForm) {
        this.chartConfig = data.chartData._cacheForm
        this.showDialog = true
      } else {
        statementDetail(this.projectId, data.chartData.id).then(res => {
          if (res.status === 200 && res.data) {
            this.chartConfig = res.data
            data.chartData._cacheForm = res.data
            this.showDialog = true
          }
        })
      }
    },
    // 在拖动元素中拷贝canvas
    handleCloneItem(e) {
      const oldCanvas = e.item.getElementsByTagName('canvas')?.[0]

      if (oldCanvas) {
        const newCanvas = document.createElement('canvas')
        const context = newCanvas.getContext('2d')
        //set dimensions
        newCanvas.width = oldCanvas.width
        newCanvas.height = oldCanvas.height

        //apply the old canvas to the new one
        context.drawImage(oldCanvas, 0, 0)

        // nextTick 不可用
        setTimeout(() => {
          document
            .querySelector('.sortable-fallback .chart-container>div')
            .appendChild(newCanvas)
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.statement-container {
  /*min-height: calc(100vh - 150px);*/
  /*height: calc(100vh - 150px);*/
  margin-top: 16px;
  /*overflow-x: hidden;*/

  .statement-menu {
    /*margin-top: 20px;*/
    .el-menu-item {
      color: #666666;
      font-family: MicrosoftYaHei;
      &:hover {
        color: $--color-primary;
      }
    }
    .el-menu-item.is-active {
      color: $--color-primary;
    }
  }

  .statement-operation {
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .el-button {
      font-family: PingFangSC-Regular;
    }
    .common-type {
      .el-button {
        padding: 5px 17px 6px 17px;
      }
      .el-button--primary {
        color: $--color-primary;
        background-color: #ebf3ff;
        border-color: $--color-primary;
      }
      .el-button--default {
        /*  color: #666666;*/
        /*  background-color: #ffffff;*/
        /*border-color: #e5e5e5;*/
      }
    }
    .el-button-group .el-button--primary:last-child {
      border-left-color: $--color-primary;
    }
    .el-button-group .el-button--default:last-child {
      border-left-color: $--color-primary;
    }
  }

  /deep/ .el-loading-mask {
    z-index: 1060 !important; // 覆盖#app下的样式
  }
}

.empty-data {
  font-size: 14px;
  color: #999999;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

//放置占位符的类名
.sortable-ghost {
  opacity: 0;
}

// 拖动元素
.sortable-fallback {
  opacity: 1 !important; // 复写drag下的行内样式
}
</style>
