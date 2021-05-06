/**
 * @title 用于解决主线程压力问题
 * @author chenxiaolong
 * @date 2020.01.21
 * @desc webpack 对worker没有热更新，修改后需要修改文件名称才可以
 */

import axios from 'axios'

/**
 * @param type: 事件类型 [http]
 * @param props: 参数
 */
const messageMaps = {
  http: httpReq,
}
addEventListener('message', e => {
  /**
   * type 类型
   * event: 事件
   * props: 参数
   */
  const { type, props, event } = e.data
  messageMaps[type] && messageMaps[type](props, event)
})

async function httpReq(
  { method = 'get', url, payload = {}, ...otherConfig } = {},
  event,
) {
  const config = {
    url,
    method,
    ...otherConfig,
  }

  if (method.toUpperCase() === 'GET') {
    config.params = payload
  } else {
    config.data = payload
  }

  const res = await axios(config)
  postMessage({ type: 'http', event, res: res.data })
}
