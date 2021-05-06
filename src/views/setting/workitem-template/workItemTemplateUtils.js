import { i18n } from '@/i18n'
/**
 * 这个文件主要是工作项模板的通用方法
 */

//  获取工作项类型： 1-需求 2-任务 3-缺陷
export function getWorkItemType(route) {
  const path = route.params.type
  let workItemType = ''
  let workItemDisplayInfo = ''
  switch (path) {
    case 'require':
      workItemType = 1
      workItemDisplayInfo = i18n.t('需求')
      break
    case 'task':
      workItemType = 2
      workItemDisplayInfo = i18n.t('任务')
      break
    case 'bug':
      workItemType = 3
      workItemDisplayInfo = i18n.t('缺陷')
      break
  }

  return { workItemType, workItemDisplayInfo }
}
