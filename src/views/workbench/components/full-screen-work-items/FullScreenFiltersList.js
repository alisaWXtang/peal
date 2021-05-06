import cloneDeep from 'lodash/cloneDeep'
import { workItemsTypes } from '@/views/workbench/constant'

const filtersList = [
  {
    attrName: 'searchKey',
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
  {
    attrName: 'deadlines',
  },
  {
    attrName: 'statusClassifies',
  },
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
]

function getFiltersList(workItemsType) {
  const list = []
  filtersList.forEach(item => {
    if (
      workItemsTypes.MY_TODO === workItemsType &&
      [
        'searchKey',
        'projectIds',
        'sprintIds',
        'deadlines',
        'prioritys',
        'startTimes',
        'endTimes',
      ].includes(item.attrName)
    ) {
      list.push(cloneDeep(item))
    } else if (
      workItemsTypes.MY_CREATED === workItemsType &&
      [
        'searchKey',
        'projectIds',
        'sprintIds',
        'statusClassifies',
        'prioritys',
        'startTimes',
        'endTimes',
      ].includes(item.attrName)
    ) {
      list.push(cloneDeep(item))
    } else if (
      workItemsTypes.MY_DONE === workItemsType &&
      [
        'searchKey',
        'projectIds',
        'sprintIds',
        'prioritys',
        'startTimes',
        'endTimes',
        'finishTimes',
      ].includes(item.attrName)
    ) {
      list.push(cloneDeep(item))
    } else if (
      workItemsTypes.MY_RELATED === workItemsType &&
      [
        'searchKey',
        'projectIds',
        'sprintIds',
        'statusClassifies',
        'prioritys',
        'startTimes',
        'endTimes',
      ].includes(item.attrName)
    ) {
      list.push(cloneDeep(item))
    } else if (
      workItemsTypes.MY_DONE_OF_TODAY === workItemsType &&
      [
        'searchKey',
        'projectIds',
        'sprintIds',
        'prioritys',
        'startTimes',
        'endTimes',
      ].includes(item.attrName)
    ) {
      list.push(cloneDeep(item))
    } else if (
      workItemsTypes.MY_TODO_OF_TODAY === workItemsType &&
      [
        'searchKey',
        'projectIds',
        'sprintIds',
        'prioritys',
        'startTimes',
        'endTimes',
      ].includes(item.attrName)
    ) {
      list.push(cloneDeep(item))
    } else if (
      workItemsTypes.MY_DUE_OF_TODAY === workItemsType &&
      [
        'searchKey',
        'projectIds',
        'sprintIds',
        'prioritys',
        'startTimes',
        'endTimes',
      ].includes(item.attrName)
    ) {
      list.push(cloneDeep(item))
    }
  })
  return list
}

export { getFiltersList }
