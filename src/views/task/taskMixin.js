import { assignUsersList, spritList, priorityList } from '@/service/bug'
const data = function() {
  return {}
}
const methods = {
  // 获取可指派人员列表
  getAssignUsersList(projectId) {
    return assignUsersList({
      projectId,
      query: '',
    })
  },
  // 获取迭代列表
  getSpritList() {
    return spritList({
      projectId: this.projectId,
      status: 1,
    })
  },
  // 获取严重程度列表
  getPriorityList(workItemType) {
    return priorityList({
      projectId: this.projectId, // 不用传 status
      workItemType,
    })
  },
  // 获取预计工时列表
  getExpectHourList() {
    return Promise.resolve({
      status: 200,
      msg: '',
      data: this.$store.state.pf.expectHourList,
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
