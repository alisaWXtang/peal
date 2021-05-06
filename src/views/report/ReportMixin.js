import { i18n } from '@/i18n'
/**
 * 报告 mixin
 * 说明：提供给报告、邮件预览使用
 */
// import { mapState } from 'vuex'
import HTTPINFOMAP from './HTTPINFOMAP'
import treeToArray from '@/components/tree-table/eval'
import reportService from '@/service/report'
import $http from '@/utils/http'
import reportApi from '@/api/report'
import { isEmpty } from '@/utils'
import { getRouterUrl, getRealUrl } from '@/utils/sub-app-util'

const workTypeMap = {
  1: i18n.t('需求'),
  2: i18n.t('任务'),
  3: i18n.t('缺陷'),
}

const data = () => {
  return {
    projectId: 0,
    shortCut: {
      saveDraft: 1,
      saveTemplate: 0,
    },

    // 报告表单信息
    reportInfo: {
      [HTTPINFOMAP.reportId]: null, // 报告单id
      [HTTPINFOMAP.reportTemplateId]: null, // 模板id 或者草稿id
      [HTTPINFOMAP.reportTypeId]: null, // 选择类型
      [HTTPINFOMAP.templateName]: null, // 草稿、模板名称
      [HTTPINFOMAP.mailTopicName]: null, // 发送信息 - 邮件主题
      [HTTPINFOMAP.mailRecipers]: [], // 发送信息 - 收件人
      [HTTPINFOMAP.mailOtherRecipers]: [], // 发送信息 - 抄送人
      [HTTPINFOMAP.reportContent]: [], // 报告内容 - 对象数组形式保存
    },
    loading: false,
  }
}
const computed = {
  reportContent() {
    return this.reportInfo[HTTPINFOMAP.reportContent]
  },
  params() {
    // 报告保存 发送 模板的传参
    return {
      projectId: this.projectId, // 项目id
      reportId: this.reportInfo[HTTPINFOMAP.reportId], // 报告id
      reportType: this.reportInfo[HTTPINFOMAP.reportTypeId], // 报告类型
      template: this.reportInfo[HTTPINFOMAP.reportTemplateId], //模板id
      title: this.reportInfo[HTTPINFOMAP.templateName],
      mailDetail: {
        mailTheme: this.reportInfo[HTTPINFOMAP.mailTopicName], //主题
        to: this.memberFormat(this.reportInfo[HTTPINFOMAP.mailRecipers]), // 收件人
        cc: this.memberFormat(this.reportInfo[HTTPINFOMAP.mailOtherRecipers]), // 抄送人
      },
      [HTTPINFOMAP.reportContent]: this.reportInfo[
        HTTPINFOMAP.reportContent
      ].map(item => {
        let obj = { ...item }
        delete obj.contentDetails
        delete obj.request
        return obj
      }),
    }
  },
  // ...mapState({
  //   urlFormat: state => state.pf.urlFormat,
  // }),
}

const mounted = function() {
  this.projectId = this.$getUrlParams()['projectId']
  this.reportInfo[HTTPINFOMAP.reportId] = this.$getUrlParams()['reportId']
}

const methods = {
  // url 路径转换
  urlFormat(url) {
    return getRouterUrl(url, true)
    // return typeof url === 'string' &&
    //   this.urlFormat.some(item => url.startsWith(item))
    //   ? url
    //   : false
  },
  // 邮件预览
  emailPreview() {
    this.previewReport(this.reportInfo[HTTPINFOMAP.reportId])
    // window.open(
    //   location.origin +
    //     '/report/ReportPreview?projectId=' +
    //     this.$route.query.projectId +
    //     '&reportId=' +
    //     this.reportInfo[HTTPINFOMAP.reportId],
    //   '_blank',
    // )

    // this.$router.push({ path: '/report/ReportPreview', query: {...this.$route.query, reportId: this.reportInfo[HTTPINFOMAP.reportId] } })
  },
  // 取消 清空新建报告的值
  pageTypeChange(type) {
    if (type === 'new') {
      this.$router.push({
        path: '/report/edit',
        query: {
          ...this.$route.query,
          reportId: this.reportInfo[HTTPINFOMAP.reportId],
        },
      })
    } else if (type === 'list') {
      this.$router.push({
        path: '/report',
        query: { projectId: this.$route.query.projectId },
      })
    } else if (type === 'draft') {
      this.$router.push({
        path: '/report/edit',
        query: {
          ...this.$route.query,
          reportId: this.reportInfo[HTTPINFOMAP.reportId],
          type: 'draft',
        },
      })
    }
  },
  // 创建报告 - 生成报告id
  async createReport() {
    let result = { status: 0 }
    this.loading = true
    try {
      result = await reportService.createReport({
        projectId: this.projectId,
      })
    } catch (e) {
      console.log(e)
    }
    this.loading = false
    if (result.status === 200) {
      this.reportInfo[HTTPINFOMAP.reportId] = result.data[HTTPINFOMAP.reportId]
      return true
    }
    return false
  },
  // 保存模板 草稿
  saveTemplate(params, url = 'saveTemplate', router = false) {
    $http.post(reportApi[url], { ...params }).then(result => {
      if (result.status === 200) {
        // 发送 email 提示
        if (url === 'sendEmail') {
          this.$message({
            type: 'success',
            message: i18n.t('操作成功'),
          })
        }

        // 跳转列表
        if (router) {
          this.pageTypeChange('list')
        }
        // 数据处理
        result.data && this.getReportInfoResultHandle(result.data)
      } else if (result.status === 418) {
        this.$message.error(result.msg || '系统错误')
      }
    })
  },
  // 获取报告详情
  async queryReport(reportId) {
    let result = { status: 0 }
    this.loading = true
    try {
      result = await reportService.queryReport({
        projectId: +this.projectId,
        [HTTPINFOMAP.reportId]: reportId
          ? +reportId
          : +this.reportInfo[HTTPINFOMAP.reportId],
      })
    } catch (e) {
      console.log(e)
    }
    this.loading = false
    if (result.status === 200) {
      // 数据处理
      this.getReportInfoResultHandle(result.data)
      return true
    }
    return false
  },
  // 获取报告内容处理
  getReportInfoResultHandle(info) {
    this.reportInfo = {
      ...this.reportInfo,
      [HTTPINFOMAP.reportTypeId]: info.measurementType,
      [HTTPINFOMAP.mailTopicName]: info.mailTheme,
      [HTTPINFOMAP.mailRecipers]: this.emailFormat(info.mailSendTo),
      [HTTPINFOMAP.mailOtherRecipers]: this.emailFormat(info.mailCopy),
      [HTTPINFOMAP.reportContent]: info.contentText.map(item => {
        let obj = {
          ...item,
          ...item.request,
        }

        // 如果为客户端模板
        if (HTTPINFOMAP.reportContentClientRequirement === obj.type) {
          obj.subDemand = item.request.subDemand
          obj.contentDetails.forEach(jtem => {
            if (!obj.subDemand.data[jtem.id]) {
              obj.subDemand.data[jtem.id] = {
                [HTTPINFOMAP.reportContentClientRequirementNotice]: null,
              }
            }
          })
        }
        // 如果为服务端模板
        if (HTTPINFOMAP.reportContentServerRequirement === obj.type) {
          obj.contentDetails.forEach(jtem => {
            obj.subDemand = item.request.subDemand
            if (!obj.subDemand.data[jtem.id]) {
              obj.subDemand.data[jtem.id] = {
                [HTTPINFOMAP.reportContentServerRequirementId]: null,
                [HTTPINFOMAP.reportContentServerRequirementBranch]: null,
                [HTTPINFOMAP.reportContentServerRequirementVersion]: null,
                [HTTPINFOMAP.reportContentServerRequirementNotice]: null,
              }
            }
          })
        }
        return obj
      }),
      ...info,
    }

    this.generateTemplate()
  },
  // 发送消息数据处理
  getSendMessage(fisrtData) {
    this.reportInfo[HTTPINFOMAP.mailTopicName] = fisrtData.mailTheme
    this.reportInfo[HTTPINFOMAP.mailRecipers] = fisrtData.mailSendTo || []
    this.reportInfo[HTTPINFOMAP.mailOtherRecipers] = fisrtData.mailCopy || []
  },
  // 更新报告类型和模板
  async updateReportHeader(typeId, templateId) {
    try {
      // 切换类型不传模板id  切换模板不传类型id
      const res = await reportService.updateReport({
        type: typeId,
        [HTTPINFOMAP.reportId]: this.reportInfo[HTTPINFOMAP.reportId],
        templateId,
      })

      if (res.status === 200) {
        // 数据处理
        this.getReportInfoResultHandle(res.data)
        return true
      }
    } catch (e) {
      console.log(e)
    }
  },
  // 更新报告内容
  updateReportContent() {
    this.$nextTick(() => {
      this.saveTemplate(
        {
          ...this.params,
          shortCut: 1,
        },

        'queryDraft',
      )
    })
  },
  // 生成报告内容 - 所有报告内容
  generateTemplate() {
    this.reportInfo[HTTPINFOMAP.reportContent] = this.reportInfo[
      HTTPINFOMAP.reportContent
    ].map(item => {
      let template = ''
      switch (item.workType) {
        case HTTPINFOMAP.reportContentText:
          template = this._generateTextTemplate(item)
          break
        case HTTPINFOMAP.reportContentFilter:
          template = this._generateFilterTemplate(item)
          break
        case HTTPINFOMAP.reportContentSprint:
          template = this._generateSprintTemplate(item)
          break
        case HTTPINFOMAP.reportContentRequirement:
          template = this._generateRequirementTemplate(item)
          break
        case HTTPINFOMAP.reportContentTask:
          template = this._generateTaskTemplate(item)
          break
        case HTTPINFOMAP.reportContentBug:
          template = this._generateBugTemplate(item)
          break
        case HTTPINFOMAP.reportContentClientRequirement:
          template = this._generateRequirementClientTemplate(item)
          break
        case HTTPINFOMAP.reportContentServerRequirement:
          template = this._generateRequirementServerTemplate(item)
          break
        case HTTPINFOMAP.reportContentAttach:
          template = this._generateAttachTemplate(item)
          break
      }

      return {
        ...item,
        template,
      }
    })
  },
  // template - 文本
  _generateTextTemplate({ contents, titleContent }) {
    let str = `<div style="margin-right: 5px;width: calc(100% - 5px);">${contents}</div>`
    if (titleContent.length > 0 && titleContent !== i18n.t('文本')) {
      str = `<div class="custom-table-title">${titleContent}</div>${str}`
    }
    return str
  },
  // template - 过滤器
  _generateFilterTemplate(info) {
    const { contentDetails, workItemType } = info
    let func = '_generateRequirementTemplate'
    switch (+workItemType) {
      case 1:
        func = '_generateRequirementTemplate'
        break
      case 2:
        func = '_generateTaskTemplate'
        break
      case 3:
        func = '_generateBugTemplate'
        break
    }

    const strArr = []
    contentDetails.forEach(item => {
      let tree = item.list
      if (+workItemType === 1) {
        tree = treeToArray(tree)
      }
      const str =
        `<div class="custom-table-title">${i18n.t('过滤器')}[${
          workTypeMap[workItemType]
        }]</div>` +
        this[func](
          {
            contentDetails: tree,
            titleContent: item.titleName,
          },

          true,
        )

      item.template = str
      strArr.push(str)
    })
    return strArr
  },
  // template - 迭代
  _generateSprintTemplate(info) {
    const { contentDetails } = info
    const strArr = []
    contentDetails.forEach(item => {
      const tree = item.list.tree
      const titleName = item.titleName
      let str = `<div class="custom-table-box"><div class="custom-table-title">${i18n.t(
        '迭代列表',
      )}</div>`
      str += `<div class="custom-table-title-child-title">${titleName}</div>`
      str += `<table class="custom-table"><tr><th style="width: 100px">ID</th>
        <th class="custom-table-tr-title">${i18n.t('标题')}</th>
        <th style="width: 120px">${i18n.t('优先级')}</th>
        <th style="width: 120px">${i18n.t('状态')}</th>
        <th style="width: 120px">${i18n.t('处理人')}</th>
        <th style="width: 150px">${i18n.t('任务总工时')}</th>
        <th style="width: 150px">${i18n.t('开始时间')}</th>
        <th style="width: 150px">${i18n.t('结束时间')}</th></tr>`
      let array = treeToArray(tree)
      array.forEach(jtem => {
        str += `<tr>
          <td class="hover" style="width: 100px">${jtem.data.id}</td>
          <td class="hover custom-table-tr-title">`
        for (let i = 1; i < jtem._level; i++) {
          str += `<span class="custom-table-tree-space"></span>`
        }
        str += `<a href=${this.urlFormat(jtem.data.display.url) || '#'} title=${
          jtem.data.display.title
        }>${jtem.data.display.title}</a></td>
          <td style="width: 120px">${jtem.data.display.priority}</td>
          <td style="width: 120px">${jtem.data.display.status}</td>
          <td style="width: 120px">${jtem.data.display.assignUser}</td>
          <td style="width: 150px">${jtem.data.expectHour / 8 + i18n.t('天') ||
            '--'}</td>
          <td style="width: 150px">${jtem.data.startTime || '--'}</td>
          <td style="width: 150px">${jtem.data.endTime || '--'}</td>
        </tr>`
      })
      str += '</table></div>'
      item.template = str
      strArr.push(str)
    })
    return strArr
  },
  // template - 需求
  _generateRequirementTemplate(info, inFilter = false) {
    const { contentDetails, titleContent } = info
    let str = `<div class="custom-table-box"><div class="${
      inFilter ? 'custom-table-title-child-title' : 'custom-table-title'
    }">${titleContent || ''}</div>`
    str += `<table class="custom-table"><tr><th style="width: 100px">ID</th>
      <th class="custom-table-tr-title">${i18n.t('标题')}</th>
      <th style="width: 120px">${i18n.t('优先级')}</th>
      <th style="width: 120px">${i18n.t('状态')}</th>
      <th style="width: 120px">${i18n.t('需求分类')}</th>
      <th style="width: 120px">${i18n.t('处理人')}</th>
      <th style="width: 150px">${i18n.t('迭代')}</th>
      <th style="width: 150px">${i18n.t('开始时间')}</th>
      <th style="width: 150px">${i18n.t('结束时间')}</th></tr>`
    contentDetails.forEach(item => {
      str += `<tr>
        <td class="hover" style="width: 100px">${item.id}</td>
        <td class="hover custom-table-tr-title"><a href=${this.urlFormat(
          item.display.url,
        ) || '#'} title=${item.display.title}>${item.display.title}</a></td>
        <td style="width: 120px">${item.display.priority}</td>
        <td style="width: 120px">${item.display.status}</td>
        <td style="width: 120px">${item.display.category}</td>
        <td style="width: 120px">${item.display.assignUser}</td>
        <td style="width: 150px">${item.display.sprint}</td>
        <td style="width: 150px">${item.startTime || '--'}</td>
        <td style="width: 150px">${item.endTime || '--'}</td>
      </tr>`
    })
    str += '</table></div>'
    return str
  },
  // template - 任务
  _generateTaskTemplate(info, inFilter = false) {
    const { contentDetails, titleContent } = info
    let str = `<div class="custom-table-box"><div class="${
      inFilter ? 'custom-table-title-child-title' : 'custom-table-title'
    }">${titleContent || ''}</div>`
    str += `<table class="custom-table"><tr><th style="width: 100px">${i18n.t(
      '任务ID',
    )}</th>
      <th class="custom-table-tr-title">${i18n.t('任务标题')}</th>
      <th style="width: 120px">${i18n.t('优先级')}</th>
      <th style="width: 120px">${i18n.t('状态')}</th>
      <th style="width: 150px">${i18n.t('处理人')}</th>
      <th style="width: 150px">${i18n.t('迭代')}</th>
      <th style="width: 150px">${i18n.t('结束时间')}</th></tr>`
    contentDetails.forEach(item => {
      str += `<tr>
        <td class="hover" style="width: 100px">${item.id}</td>
        <td class="hover custom-table-tr-title"><a href=${this.urlFormat(
          item.display.url,
        ) || '#'} title=${item.display.title}>${item.display.title}</a></td>
        <td style="width: 120px">${item.display.priority}</td>
        <td style="width: 120px">${item.display.status}</td>
        <td style="width: 150px">${item.display.assignUser}</td>
        <td style="width: 150px">${item.display.sprint}</td>
        <td style="width: 150px">${item.endTime || '--'}</td>
      </tr>`
    })
    str += '</table></div>'
    return str
  },
  // template - 缺陷
  _generateBugTemplate(info, inFilter = false) {
    const { contentDetails, titleContent } = info
    let str = `<div class="custom-table-box"><div class="${
      inFilter ? 'custom-table-title-child-title' : 'custom-table-title'
    }">${titleContent || ''}</div>`
    str += `<table class="custom-table"><tr><th style="width: 100px">ID</th>
      <th class="custom-table-tr-title">${i18n.t('标题')}</th>
      <th style="width: 120px">${i18n.t('严重程度')}</th>
      <th style="width: 120px">${i18n.t('状态')}</th>
      <th style="width: 120px">${i18n.t('缺陷原因')}</th>
      <th style="width: 120px">${i18n.t('处理人')}</th>
      <th style="width: 150px">${i18n.t('所属迭代')}</th>
      <th style="width: 150px">${i18n.t('创建时间')}</th>
      <th style="width: 150px">${i18n.t('修改时间')}</th></tr>`
    contentDetails.forEach(item => {
      str += `<tr>
        <td class="hover" style="width: 100px">${item.id}</td>
        <td class="hover custom-table-tr-title"><a href=${this.urlFormat(
          item.display.url,
        ) || '#'} title=${item.display.title}>${item.display.title}</a></td>
        <td style="width: 120px">${item.display.priority}</td>
        <td style="width: 120px">${item.display.status}</td>
        <td style="width: 120px">${item.display.cause}</td>
        <td style="width: 120px">${item.display.assignUser}</td>
        <td style="width: 150px">${item.display.sprint}</td>
        <td style="width: 150px">${item.createTime || '--'}</td>
        <td style="width: 150px">${item.updateTime || '--'}</td>
      </tr>`
    })
    str += '</table></div>'
    return str
  },
  // template - 需求 - 客户端
  _generateRequirementClientTemplate(info) {
    const { contentDetails, subDemand } = info
    let str = `<div class="custom-table-box"><div class="custom-table-title">${i18n.t(
      '提测信息',
    )}</div>`
    str += `<table class="custom-table"><tr><th style="width: 12%">${i18n.t(
      '序号',
    )}</th>
      <th style="width: 44%" class="custom-table-tr-title">${i18n.t(
        '需求标题',
      )}</th><th style="width: 44%">${i18n.t('测试要点')}/${i18n.t(
      '注意事项',
    )}</th></tr>`
    contentDetails.forEach((item, index) => {
      str += `<tr>
        <td class="hover" style="width: 12%">${index + 1}</td>
        <td class="hover custom-table-tr-title" style="width: 44%"><a href=${this.urlFormat(
          item.display.url,
        ) || '#'} title=${item.display.title}>${item.display.title}</a></td>
        <td style="width: 44%" title=${subDemand.data[item.id][
          HTTPINFOMAP.reportContentClientRequirementNotice
        ] || '--'}>${subDemand.data[item.id][
        HTTPINFOMAP.reportContentClientRequirementNotice
      ] || '--'}</td>
      </tr>`
    })
    str += '</table></div>'
    return str
  },
  // template - 需求 - 服务端
  _generateRequirementServerTemplate(info) {
    const { contentDetails, subDemand } = info
    let str = `<div class="custom-table-box"><div class="custom-table-title">${i18n.t(
      '提测信息',
    )}</div>`
    str += `<table class="custom-table"><tr><th style="width: 12%">${i18n.t(
      '序号',
    )}</th><th>${i18n.t('应用服务ID')}</th><th>${i18n.t(
      '分支',
    )}</th><th>${i18n.t('版本')}</th>
      <th class="custom-table-tr-title">${i18n.t('修改内容')}</th><th>${i18n.t(
      '测试要点',
    )}/${i18n.t('注意事项')}</th></tr>`
    contentDetails.forEach((item, index) => {
      str += `<tr>
        <td class="hover" style="width: 12%">${index + 1}</td>
        <td title=${subDemand.data[item.id][
          HTTPINFOMAP.reportContentServerRequirementId
        ] || '--'}>${subDemand.data[item.id][
        HTTPINFOMAP.reportContentServerRequirementId
      ] || '--'}</td>
        <td title=${subDemand.data[item.id][
          HTTPINFOMAP.reportContentServerRequirementBranch
        ] || '--'}>${subDemand.data[item.id][
        HTTPINFOMAP.reportContentServerRequirementBranch
      ] || '--'}</td>
        <td title=${subDemand.data[item.id][
          HTTPINFOMAP.reportContentServerRequirementVersion
        ] || '--'}>${subDemand.data[item.id][
        HTTPINFOMAP.reportContentServerRequirementVersion
      ] || '--'}</td>
        <td class="hover custom-table-tr-title"><a href=${this.urlFormat(
          item.display.url,
        ) || '#'} title=${item.display.title}>${item.display.title}</a></td>
        <td>${subDemand.data[item.id][
          HTTPINFOMAP.reportContentServerRequirementNotice
        ] || '--'}</td>
      </tr>`
    })
    str += '</table></div>'
    return str
  },
  // template - 附件
  _generateAttachTemplate(info) {
    const { contentDetails, titleContent } = info
    let str = `<div class="custom-table-box"><div class="custom-table-title">${titleContent ||
      ''}</div>`
    contentDetails.forEach(item => {
      str += `<p>
        <a href="${getRealUrl(item.url + '?preview=true', {
          ssoToken: true,
        })}" target="_blank">${item.origName}</a>
        <span>${item.display.createUser}&nbsp;${i18n.t('在')}</span>
        <span>${item.createTime}&nbsp;${i18n.t('上传')}</span>
      </p>`
    })
    str += '</div>'
    return str
  },
  // 获取所有项字符串
  getAllItemHtml() {
    const url = this.urlFormat('/report?projectId=' + this.projectId)
    const contentPreStr = `<h4>${i18n.t('创建人')}${this.reportInfo.userCount &&
      this.reportInfo.userCount.createUser}, ${i18n.t(
      '进入',
    )} <a href="${url}">【${this.reportInfo.userCount &&
      this.reportInfo.userCount.projectName}】</a></h4>`
    const htmlArr = this.reportInfo[HTTPINFOMAP.reportContent].map(item => {
      if (item.template && typeof item.template === 'string') {
        return item.template
      } else if (item.template && Array.isArray(item.template)) {
        return item.template.join('')
      } else {
        return ''
      }
    })
    return contentPreStr + htmlArr.join('')
  },
  // 当用户没有点击保存时单独获取输入值
  getUserInputValue() {
    let count = 0 // 处于编辑状态的个数
    this.reportInfo.reportContent.forEach((item, index) => {
      let current = this.$refs['reportContent'].$refs[`edit_${index}`]
      if (current && !isEmpty(current) && current[0].show) {
        item.contents = current[0].content
        count += 1
      }
    })
    let add = this.$refs['reportContent'].$refs['add']
    if (add) {
      this.reportInfo.reportContent = [
        ...this.reportInfo.reportContent,
        {
          type: HTTPINFOMAP.reportContentText,
          workTitle: i18n.t('文本'),
          contents: add.content,
        },
      ]

      count += 1
    }
    return count
  },
  // 收件人，抄送人数据格式化
  memberFormat(list) {
    return list.map(item => {
      if (typeof item === 'string') {
        return {
          userName: '',
          userId: '',
          userEmail: item,
        }
      } else {
        let { userName, userId, userEmail } = item
        if (userId === userEmail && userName === userEmail) {
          userId = ''
          userName = ''
        }
        return {
          userName,
          userId,
          userEmail,
        }
      }
    })
  },
  // 手动输入邮箱数据格式化
  emailFormat(list) {
    if (list?.length) {
      return list.map(item => {
        let { userName, userId, userEmail } = item
        if (userId === '') {
          userId = userEmail
          userName = userEmail
        }
        return {
          userName,
          userId,
          userEmail,
        }
      })
    } else {
      return []
    }
  },
}

export default {
  data,
  computed,
  mounted,
  methods,
}
