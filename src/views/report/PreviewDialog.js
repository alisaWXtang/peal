import Vue from 'vue'
import ReportPreview from './ReportPreview'
const Component = Vue.extend(ReportPreview)

export default {
  instance: null,
  rootDom: null,
  show(props) {
    // 先清空上一次预览
    this.destroy()

    this.rootDom = document.querySelector('.sub-app-coteam')
    if (this.rootDom) {
      this.instance = new Component({
        propsData: {
          ...props,
          hidden: () => {
            this.destroy()
          },
        },
      }).$mount()

      this.rootDom.appendChild(this.instance.$el)
    }
  },
  destroy() {
    if (this.instance) {
      this.rootDom.removeChild(this.instance.$el)
      this.instance.$destroy()
      this.instance = null
    }
  },
}
