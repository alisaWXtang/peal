import { i18n } from '@/i18n'
/**
 * @title mixins
 * @author chenxiaolong
 * @date 2020.10.19
 */

import {
  chartTypes,
  summaryList,
  dimensions,
  defaultFilterMaps,
  customChartTypes,
  customDimensions,
  customSummaryList,
  chartCategories,
  dynamicFilterMaps,
} from '../../util'
import FilterComponent from '../Filter'
import cloneDeep from 'lodash/cloneDeep'
import ChartCommonMixins from '../../ChartCommonMixins'
export default {
  components: {
    FilterComponent,
  },

  mixins: [ChartCommonMixins],
  props: {
    data: {
      type: Object,
      required: true,
      default: () => {},
      desc: i18n.t('表单数据'),
    },
  },

  model: {
    prop: 'data',
    event: 'change',
  },

  data() {
    return {
      showChartTypeSelect: false, // 选择图表类别
      showDimensionYSelect: false, // 选择维度y轴
      showSummarySelect: false, // 选择汇总方式
      defaultFilterMaps: cloneDeep(defaultFilterMaps),
      chartCategories,
      filterMaps: [], // 可用筛选条件
      filterSelectMaps: [], // 已选择的筛选条件
      rules: {
        // 表单验证
        rowGroup: {
          required: true,
          message: i18n.t('选择维度'),
          trigger: 'blur',
        },
        colGroup: {
          required: true,
          message: i18n.t('请选择对比维度（Y轴）'),
          trigger: 'blur',
        },
      },

      readonlyFilters: [], // 设置筛选条件是否可读的数组
      projectId: this.$route.query.projectId,
      chartCategory: this.$route.query.chartCategory || 1,
      editorType: this.$route.query.editorType || 'created',
    }
  },
  computed: {
    // 是否编辑
    isEdit() {
      return this.editorType === 'updated'
    },
    // 类型
    workItemType() {
      return this.localForm.statisticsType || this.localForm.workItemType
    },
    localForm() {
      return this.data
    },
    // 汇总方式
    localSummayList() {
      const customSummarys = customSummaryList.filter(item =>
        item.categories.includes(chartCategories[Number(this.chartCategory)]),
      )
      return [...summaryList, ...customSummarys]
    },
    // 图表类型
    localChartTypes() {
      const customTypes = customChartTypes.filter(item =>
        item.categories.includes(chartCategories[Number(this.chartCategory)]),
      )

      return [...chartTypes, ...customTypes]
    },
    // 汇总名称
    localSummaryName() {
      const summaryType =
        this.localForm.summaryType || this.localForm.column[0]?.summaryType
      const summary = this.localSummayList.find(
        item => item.attrName === summaryType,
      )

      return summary?.name || ''
    },
    // 图表类型
    localChartName() {
      const chartType =
        this.localForm.chartType || this.localForm.column[0]?.chartType
      const chart = this.localChartTypes.find(
        item => item.attrName === chartType,
      )

      return chart?.name || '--'
    },
    // x轴维度options
    dimensionOptions() {
      const dimensionSet = new Set()
      const filterDimensions = dimensions.filter(item => {
        const flag = item.workItemType.includes(Number(this.workItemType))
        flag && dimensionSet.add(item.attrName)
        return flag
      })
      const filterCustomDimensions = customDimensions.filter(
        item =>
          item.categories.includes(
            chartCategories[Number(this.chartCategory)],
          ) && !dimensionSet.has(item.attrName),
      )

      return [...filterDimensions, ...filterCustomDimensions]
    },
  },

  watch: {
    workItemType: {
      // 重新获取筛选条件，并且清空原有的筛选条件，不考虑系统内部的报表
      handler: function(val) {
        if (val) {
          val = Number(val)
          const filters = []
          this.defaultFilterMaps.forEach(item => {
            item.workItemType.includes(val) && filters.push(item)
          })
          this.filterMaps = filters
        }

        this.filterSelectMaps = []
      },
      immediate: true,
    },

    'localForm.filters': function() {
      this.alreadeyFilters()
    },
    'localForm.column': function(val) {
      if (val && val[0]?.colGroup) {
        this.showDimensionYSelect = true
      }
    },
    'localForm.colGroup': function(val) {
      if (val) {
        this.showDimensionYSelect = true
      }
    },
  },

  mounted() {
    this.alreadeyFilters()
  },
  methods: {
    // 判断已有的过滤项
    alreadeyFilters() {
      if (this.localForm.filters) {
        const filters = []
        const readonlyFiltersSet = new Set(this.readonlyFilters)
        for (const filterIndex of this.localForm.filters) {
          const filter = this.filterMaps.find(
            item => item.attrName === filterIndex,
          )

          if (filter) {
            if (readonlyFiltersSet.has(filter.attrName)) {
              filter.readonly = true
            }

            filters.push(filter)
          }
        }

        this.filterSelectMaps = filters
      }
    },
    // 删除筛选
    handleCloseFilter(filter) {
      const tagIndex = this.localForm.filters.indexOf(filter.attrName)

      if (tagIndex > -1) {
        this.localForm.filters.splice(tagIndex, 1)

        this.localForm.filter[filter.attrName] = null
        const dynamicKeys = Object.keys(dynamicFilterMaps)

        // 清空动态过滤字段信息
        if (dynamicKeys.includes(filter.attrName)) {
          const { attrName, isDynamic } = dynamicFilterMaps[filter.attrName]
          this.localForm.filter[attrName] = null
          this.localForm.filter[isDynamic] = false
        }
      }
    },
    // 设置筛选
    handleChoiceFilters() {
      this.$refs.filtersSelect.focus()
      this.$refs.filtersSelect.visible = true
    },
    // 筛选条件变化
    filtersChange(val) {
      const select = []
      Array.isArray(val) &&
        val.forEach(item => {
          const filter = this.filterMaps.find(
            filterItem => filterItem.attrName === item,
          )

          filter && select.push(filter)
        })

      this.filterSelectMaps = select
    },
    // 选择汇总方式
    handleSummaryChoice() {
      this.showSummarySelect = true
      this.$nextTick(() => {
        this.$refs.summarySelect.focus()
        this.$refs.summarySelect.visible = true
      })
    },
    // 选择图表类型
    handleChartTypeChoice() {
      this.showChartTypeSelect = true
      this.$nextTick(() => {
        this.$refs.chartTypeSelect.focus()
        this.$refs.chartTypeSelect.visible = true
      })
    },
    // 选择图表类型后
    chartTypeVisibleChange(val) {
      !val && (this.showChartTypeSelect = false)
    },
    // 选择汇总方式后
    summaryVisibleChange(val) {
      if (!val) {
        this.showSummarySelect = false
        const summary = this.localSummayList.find(
          item => item.attrName === this.localForm.summaryType,
        )

        summary && (this.localForm.statisticsType = summary.workItemType)
      }
    },
    // 取消y轴维度
    cancelDimensionY() {
      this.showDimensionYSelect = false
      this.localForm.column[0].colGroup = ''
    },
    // 维度名称
    dimensionName(val) {
      const dimension = this.dimensionOptions.find(
        item => item.attrName === val,
      )

      return dimension?.name || ''
    },
  },
}
