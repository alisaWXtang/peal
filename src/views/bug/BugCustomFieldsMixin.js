// import { i18n } from '@/i18n'
/**
 * @title 缺陷自定义字段 mixin
 * @desc 包含获取自定义字段配置、更新自定义字段配置、获取自定义字段的可选择值
 * @desc 自定义字段的 select 都是只需要获取一次的，如果后续有需要获取当前最新值，则需要增加一个判断逻辑
 * @time 2019.4.16
 * @update 2019.5.27
 * @author heyunjiang
 */

import * as bugService from '@/service/bug'

const data = function() {
  return {
    CUSTOMFIELD: {}, // 自定义字段数据信息 - old，后期将会移除，请勿再使用该字段 - add by heyunjiang
    FIELDOBJECT: {
      CUSTOM: {}, // 自定义字段，用于：缺陷详情、过滤器选择更多、设置缺陷字段管理
      FIXED: {}, // 固定字段，用于：缺陷基本信息固定字段扩展
      AUTO_HIDE: {}, // 动态字段，用于：缺陷基本信息动态字段扩展
    },
  }
}
const methods = {
  sleep(time) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  },
  // 获取自定义字段配置信息
  getCustomFiledInfo(projectId) {
    // return window.$http.get(window.$http.api.bug_info.getCustomFiledInfo, {
    //   projectId: projectId || this.projectId,
    // })
    return bugService.customFieldInfo({
      projectId: projectId || this.projectId,
    })
  },
  // 更新自定义字段配置信息
  updateCustomFiledInfo(config) {
    // return window.$http.post(window.$http.api.bug_info.updateCustomFiledInfo, {
    //   projectId: this.projectId,
    //   config,
    // })
    return bugService.updateCustomFiledInfo({
      projectId: this.projectId,
      config,
    })
  },
  // 获取自定义字段的可选择值
  getCustomFiledSelectList(fieldId, projectId) {
    // return window.$http.get(
    //   window.$http.api.bug_info.getCustomFiledSelectList,
    //   {
    //     projectId: projectId || this.projectId,
    //     fieldId,
    //   },
    // )
    return bugService.getCustomFiledSelectList({
      projectId: projectId || this.projectId,
      fieldId,
    })
  },
  // 入口，获取自定义字段列表信息, obj.preload = true 表示需要预加载 select 数据信息，否则可以再点击时加载, refresh 表示强制更新 session 数据了
  async getCustomInfo(obj = {}) {
    if (!obj.detailInfo) {
      obj.detailInfo = { display: {} }
    }
    let result = await this.getCustomFiledInfo(obj.projectId)
    if (result.status !== 200) {
      return false
    }
    this.generateCUSTOMFIELD(result.data, obj.detailInfo)
    // 预加载数据
    if (obj.preload) {
      await this.preloadCustomSelectInfo(obj)
    }
  },
  // 预加载自定义字段 select 信息数据, 只包含
  async preloadCustomSelectInfo(obj) {
    await this.sleep(300)
    // 第一层循环 FIELDOBJECT
    Object.keys(this.FIELDOBJECT).forEach(item => {
      // 第二层循环
      Object.keys(this.FIELDOBJECT[item]).forEach(jtem => {
        if (this.FIELDOBJECT[item][jtem].choice) {
          this.getCustomFiledSelectList(this.FIELDOBJECT[item][jtem].key)
            .then(ktem => {
              if (ktem.status !== 200) {
                return
              }
              let arr = ktem.data.choices.map(ltem => {
                return {
                  key: ltem.fieldValue,
                  value: ltem.fieldDisplay,
                  ...ltem,
                }
              })
              this.FIELDOBJECT[item][jtem].fieldEditProps.selectValue = arr
              // 如果需要设置默认值
              if (obj.setInitData && arr.length > 0) {
                let sessionValues = { custom: {} }
                if (sessionStorage.getItem('LASTBUGCREATE')) {
                  sessionValues = JSON.parse(
                    sessionStorage.getItem('LASTBUGCREATE'),
                  )
                }
                let sessionValue = null
                if (item === 'FIXED') {
                  sessionValue = sessionValues[jtem] || arr[0].key
                } else {
                  sessionValue = sessionValues.custom[jtem] || arr[0].key
                }
                this.FIELDOBJECT[item][
                  jtem
                ].fieldEditProps.initValue = sessionValue
                // data[key].fieldEditProps.initValue = sessionStorage.getItem('custom') ? (JSON.parse(sessionStorage.getItem('custom'))[index][key]): arr[0].key;
              }
            })
            .catch(_ => _)
        }
      })
    })
  },
  // 自定义字段、固定字段下拉框值，点击获取
  async getBasicCustomFiledSelectListOnClick(key, isStatic, type = 'CUSTOM') {
    let customFiled = !isStatic ? this.FIELDOBJECT[type] : this.fieldEditObject
    if (customFiled[key].fieldEditProps.selectValue.length === 0) {
      let result = await this.getCustomFiledSelectList(key)
      if (result.status === 200) {
        customFiled[key].fieldEditProps.selectValue = result.data.choices.map(
          item => {
            return {
              key: item.fieldValue,
              value: item.fieldDisplay,
              ...item,
            }
          },
        )

        // 增加未设置预留 - add by heyunjiang
        // if(['functionCharacter', 'source', 'reproduceProbability'].includes(key) && this.detailType==='show') {
        //   customFiled[key].fieldEditProps.selectValue.unshift({
        //     key: 0,
        //     value: '未设置'
        //   })
        // }
      }
    }
  },
  // 封装 FIELDOBJECT 数据结构
  generateCUSTOMFIELD(predata, detailInfo) {
    const def = predata.def
    // 初始化
    this.FIELDOBJECT = {
      CUSTOM: {},
      FIXED: {},
      AUTO_HIDE: {},
    }

    Object.keys(def).forEach(item => {
      let obj = {
        label: def[item].fieldName,
        key: item,
        choice: def[item].choice,
        type: def[item].type || 'CUSTOM',
        fieldEditProps: {
          initValue: detailInfo[item] || '',
          initName: detailInfo.display[item] || '',
          selectValue: [],
        },
      }

      // 如果是 input ，则增加一个 inputType 字段
      !def[item].choice && (obj.inputType = 'text')
      // 向后兼容，如果有 type 字段，则扩展该字段
      if (def[item].type && this.FIELDOBJECT[def[item].type]) {
        let setStatus = true
        switch (def[item].type) {
          case 'CUSTOM':
            if (!predata.config[item]) {
              setStatus = false
            }
            break
          case 'AUTO_HIDE':
            if (!detailInfo[item]) {
              setStatus = false
              if (['refuseCause', 'reopenCause'].includes(item)) {
                this.$set(this.FIELDOBJECT.FIXED, item, obj)
              }
            }
            break
          default:
            break
        }

        if (def[item].type === 'CUSTOM') {
          return
        } // 不再使用旧的 CUSTOM 字段
        setStatus && this.$set(this.FIELDOBJECT[def[item].type], item, obj)
      }
      // 如果在 config 里面有设置，则展示
      if (predata.config[item]) {
        this.$set(this.CUSTOMFIELD, item, obj)
      }
    })
  },
}

export default {
  data,
  methods,
}
