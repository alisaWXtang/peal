/**
 * @title 文档 mixin
 * @desc 文档公共方法
 * @time 2019.6.20
 * @author panhui
 */
import jsoneditor from 'jsoneditor/dist/jsoneditor.js'
import 'jsoneditor/dist/jsoneditor.css'

const data = function() {
  return {}
}
const methods = {
  // json-scheme转化为tree数据
  jsonToTree(jsonTreeData) {
    let obj = []
    obj.push(this.jsonPanda('root', jsonTreeData['root']))
    return obj
  },

  jsonPanda(field, datas) {
    let obj = {
      fieldName: '',
      type: '',
      label: '',
      required: '',
      description: '',
      mock: { mock: '' },
      properties: [],
    }

    obj.fieldName = field
    obj.label = field
    obj.type = datas.type
    obj.required = 0
    obj.description = ''
    obj.mock.mock = ''
    obj.properties = []
    if (field == 'items' && datas.type == undefined) {
      obj.type = 'string'
    }
    if (datas.type == 'array') {
      obj.properties.push(this.jsonPanda('items', datas.items))
    } else if (datas.type == 'object') {
      for (let x in datas.properties) {
        obj.properties.push(this.jsonPanda(x, datas.properties[x]))
      }
    } else {
      obj.required = 1
    }
    return obj
  },
  //jsontree转换为json格式
  dataJson(obj) {
    let objData = {}
    if (!obj) {
      return false
    }
    let datas = obj.properties
    if (obj.type == 'object' || obj.type == 'array') {
      if (datas.length > 0) {
        objData = this.arrData(datas)
      }
    } else {
      objData[obj.fieldName] = ''
      return objData
    }
    return objData
  },
  arrData(datas, obr, par) {
    let daObj = {}
    for (let i = 0; i < datas.length; i++) {
      if (obr == 'array' && ['object', 'array'].indexOf(datas[i].type) == -1) {
        return datas[i].fieldName
      } else if (datas[i].type == 'array') {
        if (obr == 'array') {
          par.push(
            this.arrData(
              datas[i].properties,
              datas[i].type,
              daObj[datas[i].fieldName],
            ),
          )
        } else {
          daObj[datas[i].fieldName] = []
        }
        if (datas[i].properties.length > 0) {
          daObj[datas[i].fieldName].push(
            this.arrData(
              datas[i].properties,
              datas[i].type,
              daObj[datas[i].fieldName],
            ),
          )
        }
      } else {
        daObj[datas[i].fieldName] = ''
      }
      if (datas[i].type == 'object') {
        daObj[datas[i].fieldName] = {}
        if (datas[i].properties.length > 0) {
          for (var j in datas[i].properties) {
            if (obr == 'array') {
              daObj[datas[i].properties[j].fieldName] = ''
              delete daObj[datas[i].fieldName]
            } else {
              daObj[datas[i].fieldName][datas[i].properties[j].fieldName] = ''
            }
            if (datas[i].properties[j].properties.length > 0) {
              if (datas[i].properties[j].type == 'array') {
                daObj[datas[i].fieldName][datas[i].properties[j].fieldName] = []
                daObj[datas[i].fieldName][
                  datas[i].properties[j].fieldName
                ].push(this.arrData(datas[i].properties[j].properties, 9))
              } else {
                this.arrData(
                  datas[i].properties[j].properties,
                  datas[i].properties[j].type,
                )
              }
            }
          }
        }
      }
    }
    return daObj
  },
  //返回数据校验
  checkData(obj, res) {
    let datas = obj.properties,
      dataObj = {},
      resObj = {}
    if (JSON.stringify(datas) == '[]') {
      return resObj
    }
    function list(params, parent) {
      for (let i = 0; i < params.length; i++) {
        if (parent) {
          dataObj[params[i].fieldName] = params[i].type + '-' + parent
        } else {
          dataObj[params[i].fieldName] = params[i].type + '-1'
        }
        if (params[i].properties.length > 0) {
          list(params[i].properties, params[i].fieldName)
        }
      }
    }
    list(datas, '')
    if (!res) {
      return false
    }

    if (this.typeof(res) == 'object') {
      for (let x in res) {
        let str = dataObj[x].split('-')
        if (str[0] !== this.typeof(res[x])) {
          resObj = { type: str[0], name: x }
          return resObj
        }
      }
    }
  },
  //检测数据类型
  typeof(obj) {
    let datas = Object.prototype.toString
      .call(obj)
      .replace('[object', '')
      .replace(']', '')
      .trim()
      .toLowerCase()
    return datas
  },

  //api文档json设置
  jsonSet(obj) {
    //id,mode,data
    let container = document.getElementById(obj.id)
    let options = {
      mode: obj.mode,
      mainMenuBar: false,
    }

    let editor = new jsoneditor(container, options, obj.data)
    return editor
  },
  //检测是否已编辑
  checkEdit() {
    this.editShowFun(true)
  },
}

export default {
  data,
  methods,
}
