/**
 * @title 过滤mixins
 * @author chenxiaolong
 * @date 2020.10.13
 */
import { projectHeaderFilterActionTypes } from '@/store/action-types'
// import { queryOptions } from '@/service/work-status-flow'
import {
  getProjectUsers,
  getPriorityList,
  queryOptions,
} from '@/service/project/projectCommon'
import { getRequireList } from '@/service/statement'
import { dynamicTimeMaps, synamicSprintTypes } from '../util'
export default {
  data() {
    return {
      dynamicTimeMaps,
      synamicSprintTypes,
    }
  },
  watch: {
    filterSelectMaps: function(val) {
      if (Object.keys(val).length) {
        for (const filter of val) {
          // 获取已有筛选条件的候选项
          this.visableChange(true, filter)
        }
      }
    },
  },

  methods: {
    // 删除过滤条件
    handleCloseFilter(filter) {
      this.$emit('deleteFilter', filter) // 删除过滤条件
    },
    // 选择迭代类型
    changeSprintType(val) {
      if (val) {
        this.filters.sprintIds = null
        this.filters.dynamicSprintIds = {
          n: 1,
          dynamicSprintIdsType: 'LASTEST_NOTARCHIVED',
        }
      } else {
        this.filters.sprintIds = null
        this.filters.dynamicSprintIds = null
      }
    },
    // 选择时间类型
    changeTimeType(val, filter) {
      this.filters[filter.attrName] = []

      if (val) {
        this.filters[this.dynamicTimeMaps[filter.attrName].attrName] = {
          n: 3,
          timeUnitType: 'MONTH',
        }
      } else {
        this.filters[this.dynamicTimeMaps[filter.attrName].attrName] = null
      }
    },
    // 筛选条件下拉框状态变化
    visableChange(visable, filter) {
      const isTime = Object.keys(dynamicTimeMaps).includes(filter.attrName)
      // 非处理人，创建人的options为空时，获取相关的options
      if (visable && !filter.selectList.length && !isTime) {
        if (
          ['assignUsers', 'createUsers', 'proposers'].includes(filter.attrName)
        ) {
          this.userList()
        } else if (filter.attrName === 'prioritys') {
          this.priorityList()
        } else if (filter.attrName === 'sprintIds') {
          this.getSprintList(filter)
        } else if (filter.attrName === 'requireIds') {
          this.getRequireList(filter)
        } else {
          this.queryOptions(filter)
        }
      }
    },
    // 用户列表
    userList() {
      getProjectUsers(this.projectId).then(res => {
        res.data.forEach(item => {
          item.key = item.userId
          item.value = `${item.userName}(${item.userId})`
        })
        ;['createUsers', 'proposers', 'assignUsers'].forEach(item => {
          const originalItem = this.filterSelectMaps.find(
            filter => filter.attrName === item,
          )

          originalItem && (originalItem.selectList = res.data)
        })
      })
    },
    // 优先级列表
    priorityList() {
      getPriorityList(this.projectId, this.workItemType).then(res => {
        const originalData = this.filterSelectMaps.find(
          item => item.attrName === 'prioritys',
        )

        if (originalData) {
          res.data.forEach(item => {
            ;(item.key = item.priority), (item.value = item.literal)
          })
          originalData.selectList = res.data
        }
      })
    },
    // 获取需求列表
    async getRequireList(filter) {
      let result = await getRequireList(this.$route.query.projectId)
      if (result.status && result.status === 200) {
        filter.selectList = result.data.map(item => {
          return {
            ...item,
            key: item.id,
            value: item.title,
          }
        })
      }
    },
    // 获取迭代列表
    async getSprintList(filter) {
      await this.$store.dispatch(
        projectHeaderFilterActionTypes.GET_FILTER_HEADER_SPRINT_LIST,
        {
          projectId: this.projectId,
          includeUnplanned: true,
        },
      )

      const selectList =
        this.$store.state.projectCommonHeaderFilter.filterSprintList || []
      filter.selectList = selectList.map(item => {
        return {
          ...item,
          children: item.children.filter(child => !!child.id),
        }
      })
    },
    // 查询下拉选项
    async queryOptions(filter) {
      const res = await queryOptions(
        this.projectId,
        this.workItemType,
        filter.type,
      )

      if (res.status === 200 && res.data) {
        filter.selectList = res.data.map(item => {
          return {
            ...item,
            key: item.value,
            value: item.label,
          }
        })
      }

      return res
    },
  },
}
