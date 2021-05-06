/**
 * 报告组件字段与 api 字段的 map 映射
 * 只在需要做 http ajax 交互的的时候需要使用到
 */

export default {
  reportTemplateId: 'reportTemplateId', // 模板id 或者草稿id
  reportId: 'id', // 报告单id
  reportTypeId: 'reportTypeId', // 选择类型
  mailTopicName: 'mailTopicName', // 发送信息 - 邮件主题
  mailRecipers: 'mailRecipers', // 发送信息 - 收件人
  mailOtherRecipers: 'mailOtherRecipers', // 发送信息 - 抄送人
  reportContent: 'reportContent', // 报告内容 - 对象数组形式保存
  templateName: 'templateName', // 报告内容 - 模板名称
  reportContentText: 0, // 报告内容 - 文本
  reportContentFilter: 1, // 报告内容 - 过滤器
  reportContentSprint: 2, // 报告内容 - 迭代
  reportContentRequirement: 3, // 报告内容 - 需求
  reportContentTask: 4, // 报告内容 - 任务
  reportContentBug: 5, // 报告内容 - 缺陷
  reportContentAttach: 6, // 报告内容 - 附件
  reportContentClientRequirement: 7, // 报告内容 - 需求客户端
  reportContentServerRequirement: 8, // 报告内容 - 需求服务端
  reportContentClientRequirementNotice: 'notice', // // 报告内容 - 需求客户端 - 字段名 - 测试要点/注意事项
  reportContentServerRequirementId: 'id', // // 报告内容 - 需求服务端 - 字段名 - 应用服务ID
  reportContentServerRequirementBranch: 'branch', // // 报告内容 - 需求服务端 - 字段名 - 分支
  reportContentServerRequirementVersion: 'version', // // 报告内容 - 需求服务端 - 字段名 - 版本
  reportContentServerRequirementNotice: 'notice', // // 报告内容 - 需求服务端 - 字段名 - 测试要点/注意事项
}
