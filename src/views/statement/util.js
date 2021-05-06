/**
 * @title 工具
 * @author chenxiaolong
 * @date 2020.10.09
 */

// 工作项类型
const workItemTypes = {
  require: 1, // 需求
  task: 2, // 任务
  bug: 3, // 缺陷
}

// 过滤器候选
const defaultFilterMaps = [
  {
    name: '需求分类',
    type: 'categoryId',
    readonly: false,
    values: [],
    placeholder: '选择分类',
    workItemType: [workItemTypes.require],
    attrName: 'categoryIds',
    selectList: [],
  },

  {
    name: '优先级',
    type: 'priority',
    readonly: false,
    attrName: 'prioritys',
    values: [],
    selectList: [],
    workItemType: [workItemTypes.require, workItemTypes.task],
  },

  {
    name: '创建人',
    type: 'creater',
    readonly: false,
    values: [],
    attrName: 'createUsers',
    selectList: [],
    workItemType: [workItemTypes.require, workItemTypes.task],
  },

  {
    name: '处理人',
    type: 'assignUser',
    readonly: false,
    attrName: 'assignUsers',
    values: [],
    selectList: [],
    workItemType: [
      workItemTypes.require,
      workItemTypes.task,
      workItemTypes.bug,
    ],
  },

  {
    name: '迭代',
    type: 'sprintId',
    readonly: false,
    attrName: 'sprintIds',
    values: [],
    selectList: [],
    workItemType: [
      workItemTypes.require,
      workItemTypes.task,
      workItemTypes.bug,
    ],
  },

  {
    readonly: false,
    values: [],
    selectList: [],
    type: 'missTest',
    attrName: 'missTests',
    name: '是否漏测',
    workItemType: [workItemTypes.bug],
  },

  {
    name: '开始时间',
    type: 'fixedTime',
    readonly: false,
    attrName: 'startTimes',
    values: [],
    selectList: [],
    workItemType: [
      workItemTypes.require,
      workItemTypes.task,
      workItemTypes.bug,
    ],
  },

  {
    name: '结束时间',
    type: 'fixedTime',
    readonly: false,
    attrName: 'endTimes',
    values: [],
    selectList: [],
    workItemType: [
      workItemTypes.require,
      workItemTypes.task,
      workItemTypes.bug,
    ],
  },

  {
    name: '创建时间',
    type: 'fixedTime',
    readonly: false,
    attrName: 'createTimes',
    values: [],
    selectList: [],
    workItemType: [
      workItemTypes.require,
      workItemTypes.task,
      workItemTypes.bug,
    ],
  },

  {
    name: '状态',
    type: 'statusId',
    readonly: false,
    attrName: 'statusIds',
    values: [],
    selectList: [],
    workItemType: [
      workItemTypes.bug,
      workItemTypes.require,
      workItemTypes.require,
    ],
  },

  {
    name: '原因',
    type: 'cause',
    readonly: false,
    attrName: 'causes',
    values: [],
    selectList: [],
    workItemType: [workItemTypes.bug],
  },

  {
    name: '严重程度',
    type: 'priority',
    readonly: false,
    attrName: 'prioritys',
    values: [],
    selectList: [],
    workItemType: [workItemTypes.bug],
  },
  {
    name: '缺陷来源',
    type: 'source',
    readonly: false,
    attrName: 'sources',
    values: [],
    selectList: [],
    workItemType: [workItemTypes.bug],
  },

  {
    name: '缺陷类型',
    type: 'type',
    attrName: 'types',
    readonly: false,
    values: [],
    selectList: [],
    workItemType: [workItemTypes.bug],
  },

  {
    name: '功能特性',
    type: 'functionCharacter',
    readonly: false,
    attrName: 'functionCharacters',
    values: [],
    selectList: [],
    workItemType: [workItemTypes.bug],
  },

  {
    name: '复现概率',
    type: 'reproduceProbability',
    readonly: false,
    attrName: 'reproduceProbabilitys',
    values: [],
    selectList: [],
    workItemType: [workItemTypes.bug],
  },

  {
    name: '重打开原因',
    type: 'reopenCause',
    readonly: false,
    attrName: 'reopenCauses',
    values: [],
    selectList: [],
    workItemType: [workItemTypes.bug],
  },

  {
    name: '打回原因',
    type: 'refuseCause',
    readonly: false,
    attrName: 'refuseCauses',
    values: [],
    selectList: [],
    workItemType: [workItemTypes.bug],
  },

  {
    name: '提出人',
    type: 'creater',
    readonly: false,
    values: [],
    attrName: 'createUsers',
    selectList: [],
    workItemType: [workItemTypes.bug],
  },

  {
    name: '实际完成时间',
    type: 'finishTimes',
    readonly: false,
    attrName: 'finishTimes',
    values: [],
    selectList: [],
    workItemType: [workItemTypes.require, workItemTypes.task],
  },

  {
    attrName: 'requireIds',
    name: '父需求',
    type: 'requireId',
    readonly: false,
    values: [],
    selectList: [],
    workItemType: [workItemTypes.task],
  },

  {
    attrName: 'findStages',
    name: '发现阶段',
    workItemType: [workItemTypes.bug],
    type: 'findStage',
    readonly: false,
    values: [],
    selectList: [],
  },

  {
    attrName: 'whetherUseCaseDiscoverys',
    name: '是否用例发现',
    workItemType: [workItemTypes.bug],
    type: 'whetherUseCaseDiscovery',
    readonly: false,
    values: [],
    selectList: [],
  },

  {
    attrName: 'finishTimes',
    name: '实际关闭时间',
    workItemType: [workItemTypes.bug],
    type: 'finishTimes',
    readonly: false,
    values: [],
    selectList: [],
  },
]

// 是有公有map
const commonMaps = {
  open: 1,
  private: 0,
}

// 汇总方式
const summaryList = [
  {
    workItemType: workItemTypes.require,
    name: '按需求数',
    attrName: 'requireCount',
  },

  {
    workItemType: workItemTypes.task,
    name: '按任务数',
    attrName: 'taskCount',
  },

  {
    workItemType: workItemTypes.bug,
    name: '按缺陷数',
    attrName: 'defectCount',
  },
]

// 自定义汇总方式-> 系统内部报表
const customSummaryList = [
  {
    name: '延期需求数',
    attrName: 'delayRequireCount',
    categories: ['delay'],
  },

  {
    name: '平均停留时长',
    attrName: 'consumingTimeAverage',
    categories: ['stayTime'],
  },
  {
    name: '延期任务数',
    attrName: 'delayTaskCount',
    categories: ['delay'],
  },
]

// 图表类型
const chartTypes = [
  {
    name: '柱状图',
    type: 'histogram',
    attrName: 'BarChart',
  },

  {
    name: '圆饼图',
    type: 'pie',
    attrName: 'PieChart',
  },

  {
    name: '折线图',
    type: 'line',
    attrName: 'LineChart',
  },
]

// 自定义图表类型
const customChartTypes = [
  {
    name: '折线流积图',
    type: 'line',
    attrName: 'FlowChart',
    categories: ['flowDiagram'],
  },
]

// 对比维度
const dimensions = [
  {
    attrName: 'priority',
    name: '优先级',
    workItemType: [workItemTypes.require, workItemTypes.task],
  },

  {
    attrName: 'sprintId',
    name: '迭代',
    workItemType: [
      workItemTypes.require,
      workItemTypes.task,
      workItemTypes.bug,
    ],
  },

  {
    attrName: 'missTest',
    name: '是否漏测',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'createUser',
    name: '创建人',
    workItemType: [workItemTypes.require, workItemTypes.task],
  },

  {
    attrName: 'assignUser',
    name: '处理人',
    workItemType: [
      workItemTypes.require,
      workItemTypes.task,
      workItemTypes.bug,
    ],
  },

  {
    attrName: 'createTime',
    name: '创建时间',
    workItemType: [
      workItemTypes.require,
      workItemTypes.task,
      workItemTypes.bug,
    ],
  },

  {
    attrName: 'startTime',
    name: '开始时间',
    workItemType: [
      workItemTypes.require,
      workItemTypes.task,
      workItemTypes.bug,
    ],
  },

  {
    attrName: 'endTime',
    name: '结束时间',
    workItemType: [
      workItemTypes.require,
      workItemTypes.task,
      workItemTypes.bug,
    ],
  },

  {
    attrName: 'statusId',
    name: '状态',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'cause',
    name: '原因',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'priority',
    name: '严重程度',
    workItemType: [workItemTypes.bug],
  },
  {
    attrName: 'source',
    name: '缺陷来源',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'type',
    name: '缺陷类型',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'functionCharacter',
    name: '功能特性',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'reproduceProbability',
    name: '复现概率',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'reopenCause',
    name: '重打开原因',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'refuseCause',
    name: '打回原因',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'createUser',
    name: '提出人',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'findStage',
    name: '发现阶段',
    workItemType: [workItemTypes.bug],
  },

  {
    attrName: 'finishTime',
    name: '关闭时间',
    workItemType: [workItemTypes.bug],
  },

  {
    name: '阶段',
    attrName: 'stage',
    workItemType: [workItemTypes.require, workItemTypes.task],
  },
]

// 自定义维度
const customDimensions = [
  {
    name: '状态',
    attrName: 'statusId',
    categories: ['custom', 'stayTime', 'flowDiagram'],
  },

  {
    name: '统计周期',
    attrName: 'day',
    categories: ['flowDiagram', 'workItemThroughput', 'defectStatusRun'],
  },

  {
    name: '创建人',
    attrName: 'createUser',
    categories: ['custom'],
  },

  {
    name: '处理人',
    attrName: 'assignUser',
    categories: ['custom'],
  },
]

// 时间类型
const timeUnits = {
  second: 1,
  minute: 2,
  hour: 3,
  day: 4,
  week: 5,
  month: 6,
  year: 7,
}

// 系统内部时间类型
const statisticsUnits = [
  {
    name: '天',
    value: timeUnits.day,
  },

  {
    name: '周',
    value: timeUnits.week,
  },

  {
    name: '月',
    value: timeUnits.month,
  },
]

// 数据详情title
const dialogTypeValueMap = {
  REQT: '需求详情',
  TASK: '任务详情',
  DFCT: '缺陷详情',
  MODIFY: '需求变更详情',
  TIME: '时长详情',
}

// 报表配置参数结构示例
const configForm = {
  name: '', // 名称
  projectId: '',
  statisticsType: workItemTypes.require, // 类型
  row: {
    rowGroup: '', // 对比维度x轴
  },
  rowDefinitionEditable: true, // 对比维度x轴是否可修改
  column: [
    {
      summaryType: 'requireCount', // 汇总方式("defectCount"/"taskCount"/"requireCount")
      summaryTypeEditable: true, // 汇总方式是否可修改
      chartType: 'BarChart',
      chartTypeEditable: true, // 图表类型是否可修改
      colGroup: '', // 对比维度Y轴
      colGroupEditable: true, // 对比维度Y轴是否可修改
      positive: true,
    },
  ],

  columnEditable: true,
  filters: [],
  //<--- ratio 筛选条件
  denominatorFilter: {},
  numeratorFilter: {},
  // --->
  filter: {
    id: '',
    ids: [],
    requireId: '',
    requireIds: [],
    hasDynamicCreateTimes: false, // 是否使用动态创建时间
    dynamicCreateTimes: null,
    hasDynamicUpdateTimes: false,
    hasDynamicStartTimes: false,
    hasDynamicEndTimes: false,
    hasDynamicFinishTimes: false,
    hasDynamicSprintIds: false,
    dynamicUpdateTimes: null,
    dynamicStartTimes: null,
    dynamicEndTimes: null,
    dynamicFinishTimes: null,
    dynamicSprintIds: null,
  },
}

const synamicSprintTypes = [
  {
    attrName: 'LASTEST_NOTARCHIVED',
    name: '未归档',
  },

  {
    attrName: 'LASTEST_ARCHIVED',
    name: '已归档',
  },
]

// 报表系统类型
const systematicMaps = {
  inner: 1,
  outer: 0,
}

// 动态时间映射
const dynamicTimeMaps = {
  createTimes: {
    isDynamic: 'hasDynamicCreateTimes',
    attrName: 'dynamicCreateTimes',
  },

  updateTimes: {
    isDynamic: 'hasDynamicUpdateTimes',
    attrName: 'dynamicUpdateTimes',
  },

  startTimes: {
    isDynamic: 'hasDynamicStartTimes',
    attrName: 'dynamicStartTimes',
  },

  endTimes: {
    isDynamic: 'hasDynamicEndTimes',
    attrName: 'dynamicEndTimes',
  },

  finishTimes: {
    isDynamic: 'hasDynamicFinishTimes',
    attrName: 'dynamicFinishTimes',
  },
}

// 动态过滤字段
const dynamicFilterMaps = {
  ...dynamicTimeMaps,
  sprintIds: {
    isDynamic: 'hasDynamicSprintIds',
    attrName: 'dynamicSprintIds',
  },
}

// 图表类型
const chartCategories = {
  1: 'custom',
  2: 'stayTime',
  3: 'flowDiagram',
  4: 'defectStatusRun',
  5: 'ratio',
  6: 'delay',
  7: 'requireModify',
  8: 'workItemTimeIndicator',
  9: 'reopen',
  10: 'workItemThroughput',
  11: 'effectiveDefect',
}

export {
  chartTypes,
  customChartTypes,
  commonMaps,
  statisticsUnits,
  systematicMaps,
  customDimensions,
  configForm,
  chartCategories,
  dimensions,
  dialogTypeValueMap,
  dynamicTimeMaps,
  dynamicFilterMaps,
  defaultFilterMaps,
  synamicSprintTypes,
  summaryList,
  customSummaryList,
}
