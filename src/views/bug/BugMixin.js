// import { i18n } from '@/i18n'
/**
 * @title 缺陷 mixin
 * @desc 包含指派人、有效迭代列表、全部状态、严重程度、缺陷原因等 select 的数据
 * @desc 待优化点：全局数据缓存，有的组件内部使用了局部缓存数据，换地方有需要重新获取
 * @time 2019.4.16
 * @author heyunjiang
 */
import * as bugService from '@/service/bug'
const data = function() {
  return {}
}
const methods = {
  // 获取可指派人员列表
  getAssignUsersList(query) {
    return bugService.assignUsersList({
      projectId: this.projectId,
      query: query ? query : '',
    })
  },
  // 获取迭代列表
  getSpritList() {
    return bugService.spritList({
      projectId: this.projectId,
      status: 1,
    })
  },
  // 获取全部状态列表
  getAllStatusList() {
    return bugService.allStatusList({
      projectId: this.projectId, // 不用传 status
      workItemType: 3,
    })
  },
  // 获取严重程度列表
  getPriorityList() {
    return bugService.priorityList({
      projectId: this.projectId, // 不用传 status
      workItemType: 3,
    })
  },
  // 获取原因列表
  getCauseList() {
    return bugService.causeList({
      projectId: this.projectId, // 不用传 status
    })
  },
  // http 错误统一处理
  httpErrorHandle(param) {
    this.$message({ message: param, type: 'error' })
  },
}

export default {
  data,
  methods,
}
