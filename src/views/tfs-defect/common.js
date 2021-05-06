import { getUrlParams } from '@/utils'
// 取url上的团队/模块信息 做为树形控件默认选中值
export function getUrlCurrentNodeKey(urlInfo = getUrlParams()) {
  // 特殊处理：取团队id
  const urlTeamId = urlInfo?.teamId
  // 特殊处理：取模块id
  const urlModuleId = urlInfo?.moduleId
  let urlCurrentNodeId
  if (urlTeamId) {
    urlCurrentNodeId = urlModuleId ? `${urlTeamId}:${urlModuleId}` : urlTeamId
  }
  return urlCurrentNodeId
}
