/**
 * 反馈列表通用 mixin
 * time: 2020.05.15
 * author: lili
 */
import Slide from '@/components/slide-slip'
import FeedbackFilter from './FeedbackFilter'
import FeedbackList from './FeedbackList'
import FeedbackDetail from './FeedbackDetail'
import { mapState } from 'vuex'
import { OPERATION } from '@/utils/constant'
import operationApi from '@/api/operation'
import { operationMutationTypes } from '@/store/mutation-types'
import { operationActionTypes } from '@/store/action-types'
import TwoColsLayout from '@/components/two-cols-layout'
import LeftColSelect from '@/components/biz/left-col-select'
import TwoBlockWidthChanger from '@/components/columbus-gantt-canvas/src/gantt-table/TwoBlockWidthChanger'

const components = {
  Slide,
  FeedbackFilter,
  FeedbackList,
  FeedbackDetail,
  LeftColSelect,
  TwoColsLayout,
  TwoBlockWidthChanger,
}

const data = function() {
  return {
    showDetail: false,
    loading: false,
    currentFeedback: {
      data: {
        id: this.$route.query.feedbackId || -1,
      },
    }, // 当前查看的反馈
    leftColSelectData: [],
    currentFilterId: null,
  }
}

const computed = {
  ...mapState({
    filterList: state => state.operationFeedbackList.filterList,
    filterId: state => state.operationFeedbackList.filterId,
  }),
  layoutHeight() {
    return window.innerHeight - 180 + 'px'
  },
}

const watch = {
  filterList: {
    handler: function(filters) {
      this.leftColSelectData = filters.map(item => {
        return {
          ...item,
          title: item.filterName,
        }
      })
    },
    immediate: true,
  },
  filterId: {
    handler: function(val) {
      if (!val) return
      this.currentFilterId = val
      this.$router.replace({
        path: this.$route.path,
        query: { ...this.$route.query, filterId: this.filterId },
      })
    },
  },
}

const created = function() {}

const mounted = async function() {
  this.$route.query.feedbackId && (this.showDetail = true)
  // 反馈列表初始化函数
  await this.$store.dispatch(
    operationActionTypes.ACTION_OPERATION_FEEDBACK_INIT,
    {
      feedbackSource: OPERATION.ROUTER_FEEDBACK_SOURCE_MAP[this.$route.path],
    },
  )
  // 默认过滤器
  this.currentFilterId = this.filterId
  this.$router.replace({
    path: this.$route.path,
    query: { ...this.$route.query, filterId: this.currentFilterId },
  })
}

const methods = {
  onLeftColSelectChange(val) {
    this.$store.commit(
      operationMutationTypes.UPDATE_OPERATION_FEEDBACK_LIST_PAGEINFO,
      {
        pageInfo: {
          pageSize: 15,
          pageNumber: 1,
        },
      },
    )
    this.$store.dispatch(
      operationActionTypes.ACTION_OPERATION_FEEDBACK_SWITCH_FILTER,
      {
        filterId: val,
      },
    )
    this.$refs['feedbackFilter']?.closeFilterDialog()
    this.detailModalClosed()
    this.createModalClosed()
  },
  // 弹出详情slide
  showdetailModal(row, column) {
    if (['display.id', 'display.title'].includes(column.property)) {
      this.showDetail = true
      this.loading = !(
        this.currentFeedback && this.currentFeedback.data.id === row.data.id
      )
      this.currentFeedback = { ...row }
      this.$router.replace({
        query: {
          ...this.$route.query,
          feedbackId: row.data.id,
        },
      })
    }
  },
  // 关闭详情slide 回调
  detailModalClosed() {
    this.showDetail = false
    let originQuery = { ...this.$route.query }
    delete originQuery.feedbackId
    this.$router.replace({
      query: originQuery,
    })
  },
  // 导出反馈列表
  exportFeedback(args) {
    const {
      title,
      productIds,
      feedbackTypeIds,
      filterId,
      prioritys,
      statuses,
      createUsers,
      proposers,
      source,
      currentProcessors,
      createTimes,
      lastUpdateTimes,
      replyResults,
    } = args
    let list = {
      title,
      feedbackTypeIds,
      filterId,
      source,
      createTimes,
      lastUpdateTimes,
      replyResults,
    }
    paramsFormat('productIds', productIds)
    paramsFormat('prioritys', prioritys)
    paramsFormat('statuses', statuses)
    paramsFormat('createUsers', createUsers)
    paramsFormat('proposers', proposers)
    paramsFormat('currentProcessors', currentProcessors)
    paramsFormat('replyResults', replyResults)
    this.$fileDownLoadForGet(operationApi.exportFeedback.url, list, {})
    // TODO 去除多选条件下的'all'
    function paramsFormat(key, array) {
      if (array && array[0] !== 'all') {
        list[key] = array
      }
    }
  },
}
export default {
  components,
  data,
  computed,
  watch,
  created,
  mounted,
  methods,
}
