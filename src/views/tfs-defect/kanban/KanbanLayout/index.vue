<template>
  <div
    id="tfsKanbn"
    v-infinite-scroll="getData"
    v-loading="loading"
    class="tfs-kanban__container"
    :infinite-scroll-distance="40"
    :infinite-scroll-disabled="disable"
    :infinite-scroll-immediate="false"
  >
    <div class="kanban-box">
      <div class="top-filter header mb24">
        <div class="header-left">
          {{ $t('统计周期') }}
          <CustomDate
            v-model="currentFilterInfo.dateRange"
            class="custom-date"
            popper-class="statis-time__popper"
            type="daterange"
            clearable
            range-separator="-"
            :start-placeholder="$t('开始时间')"
            :end-placeholder="$t('结束时间')"
            :picker-options="pickerOptions"
            @change="onFilter('dataRange', $event)"
          ></CustomDate>
          {{ $t('项目代号') }}
          <el-select
            v-model="currentFilterInfo.projectCodes"
            class="project-code-select"
            multiple
            collapse-tags
            filterable
            clearable
            :placeholder="$t('选择项目代号')"
          >
            <el-option
              v-for="item in projectCodes"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
          <el-button class="submit-btn" @click="filterDebounce">{{
            $t('查询')
          }}</el-button>
        </div>
        <!-- <div class="header-right">
          <el-tooltip effect="dark" class="desc-tooltip" placement="bottom">
            <div slot="content">
              <p><strong>{{$t('当前DI值')}}：</strong>{{$t('版本前端遗留bug DI值 + 所有手机项目的通用bug总和DI值 + 适配测试各个手机项目特性bug DI值')}}</p>
              <p>(1) <strong>{{$t('版本前端遗留bug DI值')}}：</strong>{{$t('取至哥伦布自发布系统的最新发布版本的前端遗留DI值')}};</p>
              <p>(2) <strong>{{$t('所有手机项目的通用bug总和DI值')}}：</strong>{{$t('部门下所有手机项目属于共性问题的bug，根据共性问题的bug计算DI值。（共性bug是根据标题带有"共性问题"的算通用bug）')}}</p>
              <p>(3) <strong>{{$t('适配测试各个手机项目特性bug总和DI值')}}：</strong>{{$t('统计该部门下属于这个手机项目的所有特性bug，根据特性bug数据计算DI值（特性bug是根据除开共性bug以外的算特性bug）')}}</p>
              <p><strong>{{$t('DI值')}}</strong> = {{$t('阻塞问题 * 10 + 严重问题 * 3 + 普通问题 * 1 + 轻微问题 * 0.1')}}</p>
              <p><strong>{{$t('当前DI值超过标准值的天数')}}：</strong>{{$t('根据统计时间，计算手机项目的当前DI值超过标准值的天数之和。举例说明：有三个手机项目A、B、C')}}</p>
              <p>{{$t('业务X在项目A上，8月1日~8月4日 DI值超过80%，然后业务方在8月4日提交了新版本，8月5号在统计业务X在项目A上的DI值时，已经低于80%；但是后续手机项目适配测试在测试过程中，又提了一些BUG，导致在8月16日~8月20日 DI值又超过80%，而业务方在8月20日通过提交新版本，将DI值又降低到低于80%，后面一直保持低于80%的状态')}}；</p>
              <p>{{$t('则业务X在项目A上DI值超过80%的天数为：4+5=9天')}}；</p>
              <p>{{$t('那业务A在该月份DI值超过80%的天数为 项目A+项目B+项目C DI值超过80%的天数')}}</p>
            </div>
            <span><i class="el-icon-question"></i> {{$t('指标说明')}}</span>
          </el-tooltip>
        </div> -->
      </div>
      <div class="di-cards mb24">
        <DICards :data="DICardsData"></DICards>
      </div>
      <div v-if="currentFilterInfo.productType === 0" class="content-header">
        <el-radio-group v-model="viewModelLocal" @change="changeViewModel">
          <co-radio-button label="single">{{
            $t('单机型查看')
          }}</co-radio-button>
          <co-radio-button label="combination">{{
            $t('按整机项目查看')
          }}</co-radio-button>
        </el-radio-group>
      </div>
      <div v-if="isCardsEmpty" class="cards-empty">
        <div>
          <img
            src="@/assets/kanban-empty.png"
            :alt="$t('暂未查询到看板相关数据')"
          />
          <div>{{ $t('暂未查询到看板相关数据') }}</div>
        </div>
      </div>
      <div v-else class="project-code-cards mb24">
        <ProjectCodeCards
          :data="data"
          :product-type="currentFilterInfo.productType"
        ></ProjectCodeCards>
      </div>
      <div v-loading="localLoading"></div>
    </div>
  </div>
</template>
<script>
/**
 * @title tfs看板
 * @author wuqian
 * @date 2020.8.27
 * @update 2020.12.29 罗健源
 */
import { mapState } from 'vuex'
import { i18n } from '@/i18n'
import DICards from './DICards'
import ProjectCodeCards from './ProjectCodeCards'
import CustomDate from '@/components/custom-date'
import { tfsDefectAction } from '@/store/action-types'
import { tfsDefectMutation } from '@/store/mutation-types'
import debounce from 'lodash/debounce'
import { kanbanTypes } from '../util'
import TfsDefctEventBus from '@/views/tfs-defect/eventBus.js'
import { getDateString } from '@/utils'

export default {
  name: 'KanbanLayout',
  components: { DICards, ProjectCodeCards, CustomDate },
  data() {
    return {
      lastSingleOrCombination: kanbanTypes.single, // 最后一次的看板模式
      currentFilterInfo: {
        dateRange: this.getLatestMonthTime(),
        singleOrCombination: kanbanTypes.single,
        projectCodes: [],
        pageNumber: 1,
        pageSize: 10,
        productType: undefined,
      },
      data: [],
      localLoading: false,
      kanbanTypes,
      pickerOptions: {
        shortcuts: [
          {
            text: i18n.t('最近一周'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: i18n.t('最近一个月'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: i18n.t('最近三个月'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: i18n.t('最近一年'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 360)
              picker.$emit('pick', [start, end])
            },
          },
        ],
      },
      viewModelLocal: 'single',
    }
  },
  computed: {
    ...mapState({
      currentKanbanTreeNodeKey: state =>
        state.tfsCommon.currentKanbanTreeNodeKey,
      filterInfo: state => state.tfsKanban.filterInfo,
      DICardsData: state => state.tfsKanban.DICards,
      isCardsEmpty: state => state.tfsKanban.isCardsEmpty,
      isLoad: state => state.tfsKanban.isInitOk,
      projectCodes: state => state.tfsKanban.projectCodes,
      viewModel: state => state.tfsKanban.viewModel,
      loading: state => state.tfsKanban.loading,
      cardsData: state => state.tfsKanban.projectCards,
    }),
    // 总页数计算
    totalPage() {
      return Math.ceil(this.cardsData.length / this.currentFilterInfo.pageSize)
    },
    disable() {
      return (
        this.localLoading || this.totalPage < this.currentFilterInfo.pageNumber
      )
    },
  },
  watch: {
    filterInfo: {
      handler: function(val) {
        this.data = []
        this.currentFilterInfo = {
          ...this.currentFilterInfo,
          ...val,
          pageNumber: 1,
        }
        this.getData()
      },
      deep: true,
    },
    isLoad(isLoad) {
      if (!isLoad) return
      if (
        this.currentKanbanTreeNodeKey &&
        this.currentKanbanTreeNodeKey !== '-1'
      ) {
        const ids = this.currentKanbanTreeNodeKey.split(':')
        if (ids[0]) {
          this.currentFilterInfo.teamId = ids[0]
        }
        if (ids[1]) {
          this.currentFilterInfo.moduleId = ids[1]
        }
      }
      //watch load执行与初始化
      this.currentFilterInfo.productType = this.$parseRouteQuery().productType
      this.currentFilterInfo.pageNumber = 1
      this.$store.dispatch(tfsDefectAction.GET_TSF_KANBAN_CARDS_DATA, {
        filterInfo: this.currentFilterInfo,
      })
    },
    viewModel(value) {
      this.viewModelLocal = value
    },
  },
  created() {
    this.currentFilterInfo = {
      ...this.currentFilterInfo,
      ...this.filterInfo,
    }
    this.filterDebounce = debounce(
      () => {
        this.onFilter()
      },
      300,
      { leading: true },
    )
  },
  mounted() {
    //更新请求数据，清空筛选数据
    TfsDefctEventBus.$on('kanbanChangeInit', productType => {
      // 看板模式，如果切换到oppo时读取最后一次的看板模式，realme直接设置单机型查看
      this.currentFilterInfo.singleOrCombination =
        productType === 1 ? kanbanTypes['single'] : this.lastSingleOrCombination
      this.currentFilterInfo.pageNumber = 1
      this.currentFilterInfo.productType = productType
      this.currentFilterInfo.projectCodes = []
      this.currentFilterInfo.dateRange = this.getLatestMonthTime()
      this.$updateRouteQuery({ productType }, { replace: true })
      //更新store中的参数
      this.$store.commit(
        tfsDefectMutation.UPDATE_TFS_KANBAN_VIEW_MODEL,
        this.currentFilterInfo.singleOrCombination ? 'combination' : 'single',
      )
      this.$store.commit(tfsDefectMutation.UPDATE_TFS_KANBAN_FILTERINFO, {
        filterInfo: this.currentFilterInfo,
      })
    })
  },
  beforeDestroy() {
    TfsDefctEventBus.$off('kanbanChangeInit')
  },
  methods: {
    // 获取最近一月时间区间
    getLatestMonthTime() {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [getDateString(start), getDateString(end)]
    },
    onFilter(type, value) {
      // 清空时设置默认一个月
      if (type === 'dataRange' && !value) {
        this.currentFilterInfo.dateRange = this.getLatestMonthTime()
      }
      this.currentFilterInfo.pageNumber = 1
      this.$store.dispatch(tfsDefectAction.GET_TSF_KANBAN_CARDS_DATA, {
        filterInfo: this.currentFilterInfo,
      })
    },
    // 改变查看模式
    changeViewModel(viewModel) {
      // 设置最后一次的查看模式
      this.currentFilterInfo.singleOrCombination = this.lastSingleOrCombination =
        kanbanTypes[viewModel]
      this.currentFilterInfo.projectCodes = []
      this.$store.dispatch(tfsDefectAction.GET_TSF_KANBAN_CARDS_DATA, {
        filterInfo: this.currentFilterInfo,
      })
      this.$store.commit(
        tfsDefectMutation.UPDATE_TFS_KANBAN_VIEW_MODEL,
        viewModel,
      )
    },
    getData() {
      if (this.disable) return

      const { pageNumber, pageSize } = this.currentFilterInfo
      const start = (pageNumber - 1) * pageSize
      const end = start + pageSize
      this.localLoading = true
      this.data.push(...this.cardsData.slice(start, end))
      ++this.currentFilterInfo.pageNumber
      this.localLoading = false
    },
  },
}
</script>
<style lang="scss" scoped>
.mb24 {
  margin-bottom: 24px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .project-code-select {
    width: 200px;
  }

  .header-right {
    flex: 0 0 auto;
  }
}

.content-header {
  margin-bottom: 20px;
}

#tfsKanbn {
  /deep/ .custom-date {
    position: static;
    width: 260px;
    margin-right: 8px;
    .el-range__icon {
      margin-left: -5px;
      float: left;
    }
    &.el-date-editor {
      .el-range-input {
        padding: 0;
        width: calc(50% - 30px);
      }
    }
  }
  /deep/ .el-card {
    &.is-always-shadow {
      box-shadow: 0 2px 4px 0 rgba(102, 102, 102, 0.15);
    }
  }
}
.tfs-kanban__container {
  padding: 16px;
  height: calc(100vh - 108px);
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
  .submit-btn {
    vertical-align: middle;
    margin-left: 10px;
  }
}
.cards-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 150px;
  img {
    width: 300px;
  }
}
</style>
