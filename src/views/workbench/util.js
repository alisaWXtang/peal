/**
 * @title 统用工具函数
 * @author chenxiaolong
 * @date 2020.01.18
 */

// 获取元素的目标祖先元素
export function getParent(el) {
  return el.closest('.vue-grid-item')
}

/**
 * @title 用户全局事件监听处理
 */
export class UpdateContainerUtil {
  /**
   *
   * @param {*} props
   * {
   *    vm: vNode
   *    cb: (),
   *    eventTarget: 目标事件,
   *    listenerEvent: 监听事件
   * }
   */
  constructor(props) {
    this.props = props
    const { onGlobalStateChange, setGlobalState, container } = window.$udp || {}
    this.onGlobalStateChange = onGlobalStateChange
    this.setGlobalState = setGlobalState
    this.container = container
  }

  // 监听事件
  initListener() {
    this.props.vm.$bus.$on('onGlobalStateChange', ({ state, prev }) => {
      if (
        state.updateEvent.time !== prev.updateEvent.time &&
        state.updateEvent.source.container !== this.container &&
        state.updateEvent.source.event.indexOf('.coteam') > -1
      ) {
        typeof this.props.cb === 'function' && this.props.cb()
      }
    })
  }

  // 触发事件
  triggerEvent() {
    this.setGlobalState({
      updateEvent: {
        source: {
          container: this.container,
          event: this.props.eventTarget,
        },
        time: Date.now(),
      },
    })
  }
}
