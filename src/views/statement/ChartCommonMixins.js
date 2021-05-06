import { i18n } from '@/i18n'
/**
 * @title mixins
 * @author chenxiaolong
 * @date 2020.10.10
 */
import html2canvas from 'html2canvas'
import { statementDelete, chartSetCommon } from '@/service/statement'
import { commonMaps } from './util'

const methods = {
  /**
   * @title 生成表格数据
   * @param {*} chartData | 报表数据
   * @return
   * [
   *  {
   *    key: '需求变更',
   *    value: '',
   *  },
   *  {
   *    key: '需求插入',
   *    value: '',
   *  }
   * ]
   */
  generateDataTable(chartData) {
    const data = []
    // 数据以及额外数据计算
    ;['data', 'extraData'].forEach(itemKey => {
      chartData[itemKey].forEach(dataItem => {
        const item = []
        const values = dataItem.values
        let canQuery = false
        if (itemKey === 'data') {
          const colField = chartData.chartDefinition.colFields.find(
            field =>
              field.data === dataItem.colKey &&
              field.colGroup === dataItem.colGroup &&
              field.summaryType === dataItem.summaryType,
          )
          if (colField) {
            canQuery = colField.clickable
            // 插入第一列数据
            item.push({
              key: 'metics',
              value: colField.display,
            })
          }
        } else {
          item.push({
            key: 'metics',
            value: dataItem.colNameKey,
          })
        }

        const { colGroup, colKey, colNameKey, summaryType } = dataItem
        values.forEach(value => {
          const rowField = chartData.chartDefinition.rowFields.find(
            field => value.rowKey === field.data,
          )

          if (rowField) {
            item.push({
              key: rowField.display,
              value: value.value,
              canQuery,
              queryParams: {
                colGroup,
                colKey,
                colNameKey,
                summaryType,
                rowKey: value.rowKey,
                rowGroup: value.rowGroup,
              },
            })
          }
        })

        data.push(item)
      })
    })

    return data
  },

  // 共享设置
  setCommon(chartId, common, successFn) {
    let title = ''
    let message = ''

    if (common == commonMaps.open) {
      title = i18n.t('设置项目共享报表，项目内所有成员可看见该报表。')
      message = i18n.t('该报表移至公共区域')
    } else {
      title = i18n.t('是否关闭共享该报表？')
      message = i18n.t('该报表移至私有区域')
    }
    this.$confirm(title, {
      type: 'warning',
    })
      .then(() => {
        chartSetCommon(chartId, common).then(res => {
          if (res.status === 200) {
            this.$message.success(message)
            successFn && successFn()
            this.$emit('changeCommon', chartId)
          }
        })
      })
      .catch(() => {})
  },

  // 下载图片
  downloadImg(element, title) {
    html2canvas(element).then(canvas => {
      canvas.toBlob(blob => {
        const data = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = data
        a.hidden = true
        a.download = `${title}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })
    })
  },

  /**
   *
   * @param {Number,String} chartId | 报表id
   * @param {Function} fn | 回调函数
   */
  deleteStatement(chartId, fn) {
    this.$confirm(i18n.t('确定要删除该报表吗？'), {
      confirmButtonText: i18n.t('确定'),
      cancelButtonText: i18n.t('取消'),
      type: 'warning',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = i18n.t('执行中...')
          statementDelete(chartId)
            .then(res => {
              if (res.status === 200) {
                this.$message.success(i18n.t('删除报表成功'))
                fn()
              }
            })
            .finally(() => {
              instance.confirmButtonText = i18n.t('确定')
              instance.confirmButtonLoading = false
              done()
            })
        } else {
          done()
        }
      },
    })
  },

  // 生成导出表格数据
  generateExportData(chartData) {
    // 数据以及额外数据计算
    const titles = ['']
    const titlesSet = new Set(titles)
    let str = ''

    ;['data', 'extraData'].forEach(itemKey => {
      chartData[itemKey].forEach(dataItem => {
        const temp = []
        const values = dataItem.values
        let colField
        if (itemKey === 'data') {
          colField = chartData.chartDefinition.colFields.find(
            field =>
              field.data === dataItem.colKey &&
              field.colGroup === dataItem.colGroup &&
              field.summaryType === dataItem.summaryType,
          )
          if (colField) {
            temp.push(colField.display)
          }
        } else {
          temp.push(dataItem.colNameKey)
        }

        values.forEach(value => {
          const rowField = chartData.chartDefinition.rowFields.find(
            field => value.rowKey === field.data,
          )

          if (rowField) {
            if (!titlesSet.has(rowField.data)) {
              titles.push(rowField.display + '\t') // 添加制表符，避免xlsx文件内部格式化
              titlesSet.add(rowField.data)
            }

            temp.push(value.value)
          }
        })

        str += temp.join() + '\n'
      })
    })

    return titles.join() + '\n' + str
  },

  /**
   * @title 导出cvs
   * @param {*} chartData
   *
   */
  exportCvs(chartData) {
    const str = this.generateExportData(chartData)
    const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str)
    const downloadLink = document.createElement('a')
    downloadLink.hidden = true
    downloadLink.href = uri
    downloadLink.download =
      new Date().toISOString().substring(0, 10) +
      `-${chartData.chartDefinition.chartName}.csv`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  },
}

export default {
  methods,
}
