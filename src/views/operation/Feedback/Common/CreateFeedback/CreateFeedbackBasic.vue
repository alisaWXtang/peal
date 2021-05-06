<template>
  <div class="workitem-basic-info-box">
    <div
      v-for="item in fieldListAll"
      :key="item.attrName"
      class="workitem-basic-info-item"
      :data-key="item.attrName"
    >
      <ellipsis-block
        class="workitem-basic-info-item-label ellipsis-pure"
        :class="{ 'workitem-basic-info-item-label-pre': item.required }"
        :value="$t(item.fieldName) + ':'"
      ></ellipsis-block>
      <div
        v-if="item.fieldEditProps.readonly"
        class="workitem-basic-info-item-select-width workitem-basic-info-item-readonly"
      >
        {{ item.fieldEditProps.initName }}
      </div>
      <co-tooltip
        v-else
        :content="$t('必填项不能为空')"
        placement="top"
        :manual="true"
        :value="item.fieldEditProps.showEmptyNotice"
        popper-class="workitem-basic-info-item-tooltip"
      >
        <template v-if="item.attrName === 'currentProcessor'">
          <global-user-select
            v-if="currentProductId === productIdOther"
            :key="item.attrName"
            v-model="item.fieldEditProps.initValue"
            class="workitem-basic-info-item-select-width"
            :default-user-list="item.selectList"
            multiple
            :placeholder="$t('输入拼音/工号/姓名')"
            @change="
              value => {
                handleChange(item, value)
                fieldValidCheck(item, 2)
              }
            "
            @visibleChange="show => !show && fieldValidCheck(item)"
          />

          <el-select
            v-else
            v-model="item.fieldEditProps.initValue"
            :placeholder="$t('选择处理人')"
            class="workitem-basic-info-item-select-width"
            multiple
            @change="
              value => {
                handleChange(item, value)
                fieldValidCheck(item, 2)
              }
            "
            @visibleChange="show => !show && fieldValidCheck(item)"
          >
            <el-option
              v-for="user in item.selectList"
              :key="user.userId"
              :label="`${user.userName}(${user.userId})`"
              :value="user.userId"
            >
            </el-option>
          </el-select>
        </template>

        <global-user-select
          v-else-if="['proposers'].includes(item.attrName)"
          :key="item.attrName"
          v-model="item.fieldEditProps.initValue"
          class="workitem-basic-info-item-select-width"
          multiple
          :placeholder="$t('请选择')"
          @change="
            value => {
              handleChange(item, value)
              fieldValidCheck(item, 2)
            }
          "
          @visibleChange="show => !show && fieldValidCheck(item)"
        />
        <el-cascader
          v-else-if="['feedbackTypeId'].includes(item.attrName)"
          v-model="item.fieldEditProps.initValue"
          :options="item.fieldEditProps.selectValue"
          :props="{
            multiple: true,
            value: 'id',
            label: 'name',
            emitPath: false,
          }"
          :show-all-levels="false"
          class="workitem-basic-info-item-select-width"
          popper-class="cascader-custom-height"
          :placeholder="$t('请选择')"
          filterable
          @change="
            value => {
              handleChange(item, value)
              fieldValidCheck(item, 2)
            }
          "
          @visibleChange="show => !show && fieldValidCheck(item)"
        />
        <typed-form-item
          v-else
          v-model="item.fieldEditProps.initValue"
          popper-append-to-body
          class="workitem-basic-info-item-select-width"
          :popper-class="
            item.attrName === 'productId' ? 'select-popper-long' : ''
          "
          :disabled="item.fieldEditProps.disabled"
          :init-name="item.fieldEditProps.initName"
          :type="
            item.attrName === 'productId' ? 'PRODUCT_CHOICE' : item.attrValue
          "
          :select-list="item.fieldEditProps.selectValue"
          :filter-field="false"
          @change="
            value => {
              handleChange(item, value)
              fieldValidCheck(item, 2)
            }
          "
          @focus="getSelectOptionList(item)"
          @blur="fieldValidCheck(item)"
        />
      </co-tooltip>
    </div>
    <slot name="footer" />
  </div>
</template>
<script>
/**
 * @title 创建反馈基本信息
 * @desc 不能使用工作项基本信息通用组件：1. 内部字段存在联动关系，和工作项的如果杂糅在一起，组件复杂度会非常高 2. props 和内部请求参数都不同，后端数据不支持循环，且不支持通用接口
 * @desc 综合考虑，参考工作项基本信息，做成循环，有所调整，整体依赖 productId
 * @author heyunjiang
 * @date 2020.5.15
 */

const attrValueToInputTypeMap = {
  SINGLE_TEXT: 'text',
  MULTI_TEXT: 'textarea',
  MEMBER_CHOICE: 'select',
  MULTI_MEMBER_CHOICE: 'select',
  LITE_DATE_ATTR: 'date',
  BOOLEAN_ATTR: 'select',
  INT_ATTR: 'number',
  FLOAT_ATTR: 'number',
  SINGLE_CHOICE: 'select',
  MULTI_CHOICE: 'select',
}

const productIdOther = -2 // 产品名称其他

import GlobalUserSelect from '@/components/global-user-select'
import { mapState } from 'vuex'
import { operationActionTypes } from '@/store/action-types'
import { isEmpty } from '@/utils'

export default {
  name: 'CreateFeedbackBasic',
  components: {
    GlobalUserSelect,
  },

  mixins: [],

  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: Object,
      required: true,
      desc: 'v-model 绑定的值',
    },

    basicTemplateArray: {
      type: Array,
      required: true,
      desc: '新建时，传入的模板基本信息列表',
    },
  },

  data() {
    return {
      fieldListAll: [], // 基本信息所有字段
      currentModelValue: {}, // 新建时，表单缓存数据，用于和 v-model 判断是否是外部主动更新
      currentProductId: null, // 当前选中的产品 id，用户选择产品反馈类型、处理人
      lastPriority: null, // 防抖
      lastEventHandle: null, // 防抖事件句柄
      productIdOther,
    }
  },
  computed: {
    ...mapState({
      productIdList: state => state.operationFeedbackList.productIdList,
      priorityList: state => state.operationFeedbackList.priorityList,
    }),

    userInfo() {
      const userInfo = this.$store.state.gd.userInfo
      return userInfo
    },

    productId() {
      return this.$getUrlParams().productId
    },
    // 默认选择项目
    defaultProductName() {
      const { type } = this.$route.query

      // 回显项目项目信息所需
      if (type === 'cicd') {
        return '哥伦布-持续集成'
      } else if (type === 'default') {
        return '哥伦布-项目协同'
      } else {
        return ''
      }
    },
  },

  watch: {
    // 当字段数组变化时，更新字段列表
    basicTemplateArray() {
      this.initList()
    },
    // 如果外部主动更新(比如缓存恢复)，则更新当前基本信息展示数据
    value() {
      // 去除更新死循环
      if (this.value !== this.currentModelValue) {
        this.initList()
      }
    },
    priorityList() {
      this.initList()
    },
    productIdList() {
      this.initList()
    },
    defaultProductName() {
      this.initList()
    },
  },
  created() {},
  mounted() {
    this.initList()
  },
  methods: {
    handleChange(field, value) {
      // 特殊字段处理 1 - 产品 id，需要清空反馈类型，改变当前处理人
      if (field.attrName === 'productId') {
        this.handleProductChange(value)
      }
      this.updateModel()
    },
    // 获取工作项基本信息字段列表
    async initList() {
      // 新建和编辑时，注意区分
      this.fieldListAll = this.setFieldInitData(this.basicTemplateArray)
      // 新建的时候，才触发更新 v-model
      this.updateModel()
    },
    // 根据模板设置字段 fieldEditProps 属性 - 新建
    setFieldInitData(fieldListAll) {
      const result = []
      fieldListAll.forEach(item => {
        const fieldEditProps = {}
        const ismultiple = ['MULTI_CHOICE', 'MULTI_MEMBER_CHOICE'].includes(
          item.attrValue,
        )

        const surportLocalSearch = [
          'MEMBER_CHOICE',
          'MULTI_MEMBER_CHOICE',
        ].includes(item.attrValue)

        let presetValue = {}
        try {
          presetValue = JSON.parse(item.presetValue) || {}
          // eslint-disable-next-line no-empty
        } catch (_) {}
        try {
          fieldEditProps.initValue =
            (item.userDefined
              ? this.value.userDefinedAttrs &&
                this.value.userDefinedAttrs[item.attrName]
              : this.value[item.attrName]) ||
            (presetValue.key == null
              ? this.$store.state.cm.customFieldInitTypeMap[item.attrValue]
              : presetValue.key)
          fieldEditProps.initName = presetValue.value
          // eslint-disable-next-line no-empty
        } catch (_) {}
        fieldEditProps.inputType = attrValueToInputTypeMap[item.attrValue]
        fieldEditProps.attrValueType = item.attrValue
        fieldEditProps.selectValue = []
        fieldEditProps.multiple = ismultiple
        fieldEditProps.localSearch = surportLocalSearch
        fieldEditProps.showEmptyNotice = item.fieldEditProps
          ? item.fieldEditProps.showEmptyNotice
          : false
        // 特殊处理1: 如果是指定产品创建反馈
        if (
          item.attrName === 'productId' &&
          (this.productId || this.defaultProductName)
        ) {
          if (this.productId) {
            fieldEditProps.readonly = true
            this.handleProductChange(this.productId)
          }

          fieldEditProps.initValue =
            fieldEditProps.initValue || parseInt(this.productId)
          item.fieldEditProps = fieldEditProps
          this.getProductList(item)
        }
        // 特殊处理2: 优先级
        if (item.attrName === 'priority') {
          item.fieldEditProps = fieldEditProps
          this.getPriorityList(item)
        }
        if (item.hiddenWhenCreate) {
          // 如果是在新建时不需要的字段，则不展示
          return
        }
        if (item.readonly) {
          // 如果是非项目字段，并且只读
          fieldEditProps.readonly = true
        }

        item.fieldEditProps = fieldEditProps
        result.push(item)
        // 如果外部主动更新 v-model ，则需要主动获取对应下拉列表的展示值
        if (
          this.value[item.attrName] &&
          this.value[item.attrName] !== presetValue.key
        ) {
          this.getSelectOptionList(item)
        }
      })
      return result
    },
    // 获取字段可选择值列表列表 - 在 for 循环里面执行 async 的一个场景
    async getSelectOptionList(field) {
      // 1. 如果不是 select 类型的，则跳过
      if (attrValueToInputTypeMap[field.attrValue] !== 'select') {
        return
      }
      // 产品列表
      if (field.attrName === 'productId') {
        this.getProductList(field)
        return false
      }
      // 优先级
      if (field.attrName === 'priority') {
        this.getPriorityList(field)
        return false
      }
      // 2. 如果是布尔
      if (['BOOLEAN_ATTR'].includes(field.attrValue)) {
        const list = [
          { key: true, value: '是' },
          { key: false, value: '否' },
        ]

        const fieldEditProps = {
          selectValue: list,
        }

        field.fieldEditProps = {
          ...field.fieldEditProps,
          ...fieldEditProps,
        }

        this.$forceUpdate()
        return
      }
    },
    // 获取产品列表
    async getProductList(field) {
      // 减少发起的请求，增加效率
      if (field.fieldEditProps.selectValue.length > 0) {
        return
      }
      const list = this.productIdList.map(item => {
        return {
          ...item,
          key: item.id,
          value: item.productName,
        }
      })
      field.fieldEditProps.selectValue = list
      if (this.productId) {
        field.fieldEditProps.initName = list.find(
          item => +item.key === +this.productId,
        )?.value
      }

      if (this.defaultProductName && !this.productId) {
        const product = list.find(
          item => item.productName.indexOf(this.defaultProductName) > -1,
        )

        if (product) {
          field.fieldEditProps.initName = product.value
          field.fieldEditProps.initValue = product.id
          this.handleProductChange(product.id)
        }
      }
      this.$forceUpdate()
      this.updateModel()
    },
    // 获取产品优先级列表
    async getPriorityList(field) {
      // 减少发起的请求，增加效率
      if (field.fieldEditProps.selectValue.length > 0) {
        return
      }
      const list = this.priorityList.map(item => {
        return {
          ...item,
          key: item.priority,
          value: item.literal,
        }
      })
      field.fieldEditProps.selectValue = list
      field.fieldEditProps.initValue = +field.fieldEditProps.initValue
      this.$forceUpdate()
      this.updateModel()
    },
    // 特殊处理 - 产品名称变更，需要获取产品信息，包括反馈类型列表、对接人信息
    async handleProductChange(productId) {
      this.currentProductId = productId
      // 如果选择产品 - 其他
      if (productId === 0) {
        return
      }
      const {
        dockingUsers,
        feedbackTypeTree,
      } = await this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_PRODUCTDETAIL_QUERY,
        { id: productId },
      )
      const { userId, userName } = this.userInfo

      const feedbackTypeIdField = this.fieldListAll.find(
        item => item.attrName === 'feedbackTypeId',
      )

      const currentProcessorField = this.fieldListAll.find(
        item => item.attrName === 'currentProcessor',
      )

      const proposersField = this.fieldListAll.find(
        item => item.attrName === 'proposers',
      )

      // 设置反馈类型可选值
      feedbackTypeIdField.fieldEditProps.selectValue = feedbackTypeTree
      feedbackTypeIdField.fieldEditProps.initValue = []
      // 如果当前产品为其他，则设置反馈类型不可选择
      if (productId === productIdOther) {
        feedbackTypeIdField.disabled = true
      } else {
        feedbackTypeIdField.disabled = false
      }

      currentProcessorField.selectList = dockingUsers

      if (this.currentProductId === this.productIdOther) {
        // 设置处理人默认为对接人
        currentProcessorField.fieldEditProps.initValue = dockingUsers
      } else {
        currentProcessorField.fieldEditProps.initValue = dockingUsers
          ? dockingUsers.map(item => item.userId)
          : []
      }

      // 设置反馈人

      proposersField.fieldEditProps.selectValue = userName
      proposersField.fieldEditProps.initValue = [userId]

      this.$forceUpdate()
      this.updateModel()
    },
    // 字段检测，必填项提示、progress ; @param priority 表示优先级，采用防抖实现
    fieldValidCheck(field, priority = 1) {
      // 第二次调用，但是优先级低了
      if (this.lastPriority && this.lastPriority > priority) {
        return false
      }
      // 第一次调用，或者优先级一样
      if (!this.lastPriority || priority <= this.lastPriority) {
        this.lastPriority = priority
      }
      this.lastEventHandle && clearTimeout(this.lastEventHandle)
      this.lastEventHandle = setTimeout(() => {
        let current = field.fieldEditProps.initValue
        const currentProcessorInitValue = -2
        // 1. 非空检测
        if (field.required && isEmpty(current)) {
          // 如果需要提示，则清除其他所有提示
          const listLength = this.fieldListAll.length
          for (let i = 0; i < listLength; i++) {
            const currentfield = this.fieldListAll[i]
            currentfield.fieldEditProps.showEmptyNotice =
              currentfield.attrName === field.attrName
          }
        } else if (field.required && !isEmpty(current)) {
          if (current === currentProcessorInitValue) {
            this.fieldListAll.forEach(item => {
              if (item.attrName === 'currentProcessor') {
                item.fieldEditProps.showEmptyNotice = false
              }
            })
          }
          field.fieldEditProps.showEmptyNotice = false
        }
        // 第一次：是为了更新 v-model 绑定的值
        this.$forceUpdate()
        this.lastEventHandle && clearTimeout(this.lastEventHandle)
        this.lastPriority = null
      }, 0)
    },
    // 校验必填项 - 用于全部字段校验，可以通过 $ref 访问
    checkFields() {
      let creatable = true
      const listLength = this.fieldListAll.length
      let dataKey = ''
      // 1. 保证提示第一个 2. 节约性能
      for (let i = 0; i < listLength; i++) {
        const field = this.fieldListAll[i]
        if (field.required && isEmpty(field.fieldEditProps.initValue)) {
          creatable && (field.fieldEditProps.showEmptyNotice = true)
          dataKey = field.attrName
          creatable = false
          break
        }
      }
      if (!creatable) {
        this.$forceUpdate()
        // 滚动到屏幕可以看见的区域
        try {
          let scrolltarget = this.$el.querySelector(
            '.workitem-basic-info-item[data-key="' + dataKey + '"]',
          )

          scrolltarget.previousElementSibling &&
            (scrolltarget = scrolltarget.previousElementSibling)
          scrolltarget.previousElementSibling &&
            (scrolltarget = scrolltarget.previousElementSibling)
          scrolltarget.previousElementSibling.scrollIntoView()
          // eslint-disable-next-line no-empty
        } catch (_) {}
      }
      return creatable
    },
    // 获取当前表单数据 - 注意区分固有字段和自定义字段
    getModelObj() {
      const systemAttrs = {},
        userDefinedAttrs = {}
      this.fieldListAll.forEach(item => {
        if (item.userDefined) {
          userDefinedAttrs[item.attrName] = item.fieldEditProps.initValue
        } else {
          systemAttrs[item.attrName] = item.fieldEditProps.initValue
        }
      })
      return {
        ...systemAttrs,
        userDefinedAttrs,
      }
    },
    // 更新 v-model 值
    updateModel() {
      this.currentModelValue = this.getModelObj()
      this.$emit('change', this.currentModelValue)
    },
  },
}
</script>
<style lang="scss" scoped>
.workitem-basic-info-item {
  // line-height: 28px;
  // height: 26px;
  height: auto;
  line-height: 22px;
  padding: 1px 0;
  font-size: $font-size-medium;

  // &.workitem-basic-info-item-select-multiple {
  //   padding: 5px 0 0;
  //   margin-bottom: -5px;
  //   height: auto;
  //   line-height: 26px;
  // }
  // lable
  .workitem-basic-info-item-label {
    height: 29px;
    line-height: 29px;
    display: inline-block;
    width: 90px;
    overflow: hidden;
    padding-left: 6px;
  }
  .workitem-basic-info-item-label-pre {
    position: relative;
    &:before {
      content: '*';
      color: red;
      position: absolute;
      top: 2px;
      left: -1px;
    }
  }
  .workitem-basic-info-item-select-width {
    width: calc(100% - 105px);
    overflow: hidden;
    box-sizing: border-box;
    padding-right: 1px;
    display: inline-block;
    /deep/ .input-typeed-class {
      width: 100%;
    }
  }
  .workitem-basic-info-item-readonly {
    height: 29px;
    line-height: 29px;
  }
}
</style>
