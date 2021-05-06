# tfs 缺陷

## 过滤条件测试数据结构

data

```js
function genData() {
  return [
    {
      value: 1,
      label: '测试1',
    },
    {
      value: 2,
      label: '测试2',
    },
  ]
}
```

selectorGroup

```js
;[
  {
    key: 'parentCard',
    props: {
      selectedLabel: '父卡状态',
      multiple: true,
      data: genData(),
    },
  },
  {
    key: 'childCard',
    props: {
      selectedLabel: '子卡状态',
      multiple: true,
      data: genData(),
    },
  },
  {
    key: 'user',
    props: {
      selectedLabel: '处理人',
      multiple: true,
      data: genData(),
    },
  },
  {
    key: 'projectNo',
    props: {
      selectedLabel: '项目代号',
      multiple: true,
      data: genData(),
    },
  },
  {
    key: 'defectLevel',
    props: {
      selectedLabel: '缺陷等级',
      multiple: true,
      data: genData(),
    },
  },
  {
    key: 'more',
    props: {
      selectedLabel: '更多过滤条件',
      multiple: true,
      fixedLabel: true,
      canClearAll: false,
      showListSelectAll: false,
      showListClearAll: false,
      data: [
        {
          value: 'type',
          label: '缺陷类型',
        },
        {
          value: 'time',
          label: '创建时间',
        },
        {
          value: 'purpose',
          label: '测试工程师意见',
        },
      ],
    },
  },
]
```

moreSelectorGroup

```js
;[
  {
    key: 'type',
    hidden: true,
    props: {
      selectedLabel: '缺陷类型',
      multiple: true,
      canCancel: true,
    },
  },
  {
    key: 'time',
    componentType: 'time',
    hidden: true,
    props: {
      selectedLabel: '创建时间',
      mode: 'text',
      type: 'datetimerange',
      cancelable: true,
      valueFormat: 'yyyy-MM-dd HH:mm:ss',
    },
  },
  {
    key: 'purpose',
    hidden: true,
    props: {
      selectedLabel: '测试工程师意见',
      multiple: true,
      canCancel: true,
    },
  },
]
```
