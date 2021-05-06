<template>
  <div class="workitem-basic-info-box">
    <template v-for="item in fieldList">
      <div
        v-if="item.key == 'currentProcessors'"
        :key="item.key"
        class="workitem-basic-info-item"
      >
        <ellipsis-block
          class="workitem-basic-info-item-label ellipsis-pure"
          :value="$t(item.fieldName) + ':'"
          :class="{ 'workitem-basic-info-item-label-pre': item.required }"
        ></ellipsis-block>
        <global-user-select
          v-if="showAssignUser"
          ref="globalUserSelect"
          class="global-user-select"
          :filter-invalid="true"
          value=""
          :is-focus="true"
          :placeholder="$t('输入拼音/工号/姓名')"
          @visibleChange="selectUserVisibleChange"
          @change="selectUserChange"
        ></global-user-select>
        <span
          v-else
          class="select-user"
          :title="item.fieldEditProps.initValueList"
          @click="handleSelectUser"
        >
          {{ item.fieldEditProps.initValueList }}
        </span>
      </div>
      <!-- 只读信息 -->
      <div
        v-else-if="item.readOnly"
        :key="item.key"
        class="workitem-basic-info-item"
      >
        <ellipsis-block
          class="workitem-basic-info-item-label ellipsis-pure"
          :value="$t(item.fieldName) + ':'"
          :class="{ 'workitem-basic-info-item-label-pre': item.required }"
        />
        <!-- 状态、创建人、反馈人需要特殊处理显示内容 -->
        <span
          v-if="item.attrName === 'status'"
          class="status-tag"
          :style="`color: ${item.color};border: 1px solid ${item.color}`"
          >{{ $t(item.fieldEditProps.initName) }}</span
        >
        <span
          v-else-if="item.attrName === 'createUser'"
          class="hover-basic-info-item-static workitem-basic-info-item-readonly"
          style="width:calc(100% - 123px);display:inline-block;margin-left: 10px;"
          >{{ item.fieldEditProps.initName }}({{
            item.fieldEditProps.initValue
          }})</span
        >
        <span
          v-else-if="item.attrName === 'proposers'"
          class="hover-basic-info-item-static workitem-basic-info-item-readonly"
          style="width:calc(100% - 123px);display:inline-block;margin-left: 10px;"
          :title="item.fieldEditProps.initValueList"
          >{{ item.fieldEditProps.initValueList }}</span
        >
        <span
          v-else-if="item.attrName === 'priority'"
          class="hover-basic-info-item-static workitem-basic-info-item-readonly status-tag"
          :style="
            `color: ${item.color};border: 1px solid ${item.color};width:auto;display:inline-block;margin-left: 10px;`
          "
          :title="item.fieldEditProps.initValueList"
          >{{ item.fieldEditProps.initName }}</span
        >
        <span
          v-else
          class="hover-basic-info-item-static workitem-basic-info-item-readonly"
          style="width:calc(100% - 123px);display:inline-block;margin-left: 10px;"
          >{{ item.fieldEditProps.initName }}</span
        >
      </div>
      <template v-else>
        <div :key="item.key" class="workitem-basic-info-item">
          <ellipsis-block
            class="workitem-basic-info-item-label ellipsis-pure"
            :value="$t(item.fieldName) + ':'"
            :class="{ 'workitem-basic-info-item-label-pre': item.required }"
          ></ellipsis-block>
          <!-- <ellipsis-block class="workitem-basic-info-item-select-width ellipsis-pure" v-if="item.readOnly" :value="item.fieldEditProps.initName"></ellipsis-block> -->
          <field-edit
            v-bind="item.fieldEditProps"
            :attr-name="item.attrName"
            :attr-color="item.color"
            :color-type="'font'"
            class="workitem-basic-info-item-select-width"
            :on-change="
              value => {
                if (item.fieldEditProps.multiple) {
                  return
                }
                updateInfoWhenShow(item, value)
              }
            "
            @FieldEditFieldClick="getSelectOptionList(item)"
            @inactive="
              value => {
                if (!item.fieldEditProps.multiple) {
                  return
                }
                updateInfoWhenShow(item, value)
              }
            "
          ></field-edit>
        </div>
      </template>
    </template>
    <slot name="footer" />
    <!-- <div class="workitem-basic-info-item" v-if="fieldListAll.length > currentFieldCount">
      <el-button type="text" @click="customHandle" style="padding-left: 0 !important;">{{fieldShowAll?'收起':'更多字段'}}</el-button>
    </div> -->
  </div>
</template>
<script>
/**
 * @title 反馈详情基本信息组件 - from WorkItemBasicInfoDisplay
 * @function 1. 当前处理人已被特殊处理，包括样式
 * @function 2. 对 回复结果 特殊处理
 * @author heyunjiang
 * @date 2020.3.24
 * @update 2020.8.18 支持更改值
 */
import { i18n } from '@/i18n'
import FieldEdit from '@/components/field-edit'
import GlobalUserSelect from '@/components/global-user-select'
import { operationActionTypes } from '@/store/action-types'
import { mapState } from 'vuex'
import { USER_INFO } from '@/utils/constant'
import { getStorage, isEmpty } from '@/utils'
import {
  updateFeedback,
  getReplyList,
  updateReply,
} from '@/service/operation/feedback'
import { queryOptions } from '@/service/work-status-flow'

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

const cascaderAttr = ['feedbackTypeId']

export default {
  name: 'FeedbackDetailBasic',
  components: {
    FieldEdit,
    GlobalUserSelect,
  },

  mixins: [],
  props: {
    detail: {
      type: Object,
      required: true,
      desc: '反馈详情',
    },
  },

  data() {
    return {
      currentFieldCount: 12, // 当前展示的字段个数
      fieldShowAll: true,
      fieldListAll: [], // 基本信息所有字段
      lastUpdateField: null, // 最近一次更新的字段信息
      currentUser: getStorage(USER_INFO),
      showAssignUser: false, // 是否展示处理人组件
      closeDetail: false,
    }
  },
  created() {},
  computed: {
    ...mapState({
      productIdList: state => state.operationFeedbackList.productIdList,
      priorityList: state => state.operationFeedbackList.priorityList,
    }),
    // 当前展示的基本信息列表
    fieldList() {
      if (this.fieldShowAll) {
        return this.fieldListAll
      } else {
        return this.fieldListAll.slice(0, this.currentFieldCount)
      }
    },
    // 判断处理人是否可以编辑
    canSelectProcessors() {
      return (
        this.detail.data.status == 1 &&
        this.detail.data.currentProcessors.includes(this.currentUser.userId)
      )
    },
    productId() {
      return this.detail?.data.productId
    },
  },

  watch: {
    detail: {
      handler: function() {
        this.initList()
      },
      deep: true,
    },
  },

  mounted() {
    this.initList()
  },
  methods: {
    // 特殊处理 - 处理人 - 更新处理人
    async selectUserChange(val) {
      let { data } = this.detail
      let result
      if (val && val.userId) {
        try {
          result = await updateFeedback({
            id: data.id || this.detail.detail.id,
            currentProcessors: [val.userId],
            source: data.source,
          })
        } catch (_) {
          result.status = 0
        }
        if (result.status === 200) {
          let userId = this.currentUser
          this.$message.success(result.msg || i18n.t('修改处理人成功'))
          if (
            !data.proposers.includes(userId) &&
            data.createUser !== userId &&
            val.userId !== userId
          ) {
            this.$emit('HandleSide')
          }
          this.$store.dispatch(
            operationActionTypes.ACTION_OPERATION_FEEDBACK_GET_FEEDBACK_LIST,
          )
          this.$emit('updateSuccess')
        }
      }
    },
    // 特殊处理 - 处理人 - 选择处理组件状态变化
    selectUserVisibleChange(val) {
      !val && (this.showAssignUser = false)
    },
    // 特殊处理 - 处理人 - 选择处理人-前置行为
    handleSelectUser() {
      if (this.canSelectProcessors) {
        this.showAssignUser = true
      }
    },

    // 获取工作项基本信息字段列表
    async initList() {
      this.fieldListAll = this.setFieldInitData()
      this.$forceUpdate()
    },
    // 将 detail 转换成 list
    _generateBasicList() {
      // 这里和接口对不上，是为了和工作项保持一致，所以在 store action 中做了处理
      const { data, display, detail, fields = [] } = this.detail
      const fieldListAll =
        fields.map(
          ({
            attrName,
            required,
            fieldName,
            displayAttrName,
            attrValue = 'SINGLE_CHOICE',
            readOnly = false,
          }) => {
            let initName = display[displayAttrName || attrName]
            initName = isEmpty(initName) ? '' : initName
            initName = Array.isArray(initName) ? initName.join(',') : initName
            initName = String(initName)
            const color = detail?.status?.color || '#ff9f90'
            return {
              attrValue,
              fieldName,
              required,
              readOnly,
              attrName,
              key: attrName,
              initValue:
                data[attrName] === null
                  ? this.$store.state.cm.customFieldInitTypeMap[attrValue]
                  : data[attrName],
              initName,
              color,
            }
          },
        ) || []
      return fieldListAll
    },
    // 根据模板设置字段 fieldEditProps 属性 - 展示
    setFieldInitData() {
      const fieldListAll = this._generateBasicList()
      const result = []
      fieldListAll.forEach(item => {
        const fieldEditProps = {}
        const ismultiple = ['MULTI_CHOICE', 'MULTI_MEMBER_CHOICE'].includes(
          item.attrValue,
        )

        const surportLocalSearch =
          ['MEMBER_CHOICE', 'MULTI_MEMBER_CHOICE'].includes(item.attrValue) ||
          ['productId'].includes(item.attrName)

        fieldEditProps.initValue = item.initValue
        fieldEditProps.initName = item.initName
        fieldEditProps.inputType = cascaderAttr.includes(item.attrName)
          ? 'cascader'
          : attrValueToInputTypeMap[item.attrValue]
        fieldEditProps.attrValueType = item.attrValue
        fieldEditProps.selectValue = []
        fieldEditProps.multiple = ismultiple
        fieldEditProps.localSearch = surportLocalSearch
        fieldEditProps.envType = 'GLOBAL'
        // 当前处理人、反馈人为只读状态时，需要处理添加工号
        if (
          item.attrName === 'currentProcessors' ||
          (item.attrName === 'proposers' && item.readOnly)
        ) {
          fieldEditProps.initValueList =
            item.initName === '--'
              ? item.initName
              : item.initName
                  .split(',')
                  .map(
                    (valueItem, index) =>
                      `${valueItem}(${item.initValue[index]})`,
                  )
                  .join('，')
        }
        item.fieldEditProps = fieldEditProps
        result.push(item)
      })
      return result
    },
    // 获取字段可选择值列表列表
    async getSelectOptionList(field) {
      // 1. 如果不是 select 类型的，则跳过
      if (attrValueToInputTypeMap[field.attrValue] !== 'select') {
        return
      }
      // 2. 如果是人员选择，则去拿人员选择数据
      if (['MEMBER_CHOICE', 'MULTI_MEMBER_CHOICE'].includes(field.attrValue)) {
        // this.getAssignUsersList(field);
        return
      }
      // 3. 如果是布尔
      if (field.attrValue === 'BOOLEAN_ATTR') {
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
      // 4. 如果是回复结果
      if (field.attrName === 'replyResult') {
        this.getReplyList(field)
        return
      }
      // 5. 产品列表
      if (field.attrName === 'productId') {
        this.getProductList(field)
        return false
      }
      // 6. 优先级
      if (field.attrName === 'priority') {
        this.getPriorityList(field)
        return false
      }
      // 7. 反馈类型
      if (field.attrName === 'feedbackTypeId') {
        this.getFeedbackType(field)
        return false
      }
      // 8. 其他类型
      let result = {}
      let addtionalParams = {}
      try {
        result = await queryOptions({
          projectId: this.projectId,
          workItemType: this.workItemType,
          attrName: field.attrName,
          ...addtionalParams,
        })
      } catch (_) {
        result.status = 0
      }
      if (result.status === 200) {
        const list = result.data.map(item => {
          let obj = {
            ...item,
            key: item.value,
            value: item.label,
          }

          delete obj.label
          return obj
        })
        const fieldEditProps = {
          selectValue: list,
        }

        field.fieldEditProps = {
          ...field.fieldEditProps,
          ...fieldEditProps,
        }

        this.$forceUpdate()
      }
      return true
    },

    // 特殊字段处理 - 获取产品列表
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
      this.$forceUpdate()
    },
    // 特殊字段处理 - 获取产品优先级列表
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
      this.$forceUpdate()
    },
    // 特殊字段处理 - 获取反馈类型列表
    async getFeedbackType(field) {
      const productId = this.detail.data.productId

      const {
        feedbackTypeTree,
      } = await this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_PRODUCTDETAIL_QUERY,
        { id: productId },
      )
      field.fieldEditProps = {
        ...field.fieldEditProps,
        selectValue: feedbackTypeTree.map(item => {
          return {
            ...item,
            key: item.id,
            value: item.name,
          }
        }),
      }
      this.$forceUpdate()
    },
    // 特殊字段处理 - 获取回复结果列表
    async getReplyList(field) {
      let result = {}
      try {
        result = await getReplyList({
          productId: this.productId,
        })
        // eslint-disable-next-line no-empty
      } catch (_) {}
      if (result.status !== 200) {
        return
      }

      const list = result.data.map(item => {
        return {
          value: item.replyName,
          key: item.replyNum,
          ...item,
        }
      })
      const fieldEditProps = {
        selectValue: list,
      }
      field.fieldEditProps = {
        ...field.fieldEditProps,
        ...fieldEditProps,
      }
      this.$forceUpdate()
    },
    // 特殊字段处理 - 更新回复结果
    async updateReply(obj) {
      let result = {}
      try {
        result = await updateReply({
          id: this.detail.data.id || this.detail.detail.id,
          source: this.detail.data.source,
          ...obj,
        })
        // eslint-disable-next-line no-empty
      } catch (_) {}
      if (result.status !== 200) {
        return
      }
      this.$message.success(result.msg || '修改回复结果成功')
      this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_GET_FEEDBACK_LIST,
      )
      this.$emit('updateSuccess')
    },
    // 恢复最近一次操作字段的状态
    lastFieldReset() {
      if (!this.lastUpdateField) {
        return
      }
      this.lastUpdateField.key += 's'
      this.lastUpdateField = null
      this.$forceUpdate()
    },
    // 更新字段值
    updateInfoWhenShow(item, value) {
      item && (this.lastUpdateField = item)
      if (item.required && isEmpty(value)) {
        this.$message({
          message: '必填项不能清空',
          type: 'warning',
        })

        item.key += 's'
        this.$forceUpdate()
        return
      }
      const obj = item.userDefined
        ? {
            userDefinedAttrs: {
              [item.attrName]: value,
            },
          }
        : {
            [item.attrName]: value,
          }
      if (item.attrName === 'replyResult') {
        this.updateReply(obj)
        return
      }
      this.$emit('updateField', obj)
    },
    // 展开/收起自定义字段
    customHandle() {
      this.fieldShowAll = !this.fieldShowAll
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/global.scss';
.global-user-select {
  max-width: calc(100% - 105px);
  line-height: 26px;
  padding-left: 5px;
  box-sizing: border-box;
  display: inline-block;
  vertical-align: top;
}

.select-user {
  display: inline-block;
  padding: 1px 8px;
  margin-left: 10px;
  max-width: calc(100% - 130px);
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  &:hover {
    border: 1px solid #eee;
  }

  &:focus {
    outline: unset;
  }
}

.workitem-basic-info-item {
  padding: 0;
  font-size: $font-size-medium;
  margin-bottom: 10px;
  // &.workitem-basic-info-item-select-multiple {
  //   padding: 5px 0 0;
  //   margin-bottom: -5px;
  //   height: auto;
  //   line-height: 26px;
  // }
  // lable
  .workitem-basic-info-item-label {
    height: 26px;
    line-height: 26px;
    display: inline-block;
    width: 95px;
    overflow: hidden;
    padding-left: 7px;
    vertical-align: top;
    box-sizing: border-box;
  }
  .workitem-basic-info-item-label-pre {
    &:before {
      content: '*';
      color: red;
      position: absolute;
      top: 2px;
      left: 0;
    }
  }
  .workitem-basic-info-item-select-width {
    max-width: calc(100% - 110px);
    height: 26px;
    line-height: 26px;
    padding-left: 5px;
    box-sizing: border-box;
    display: inline-block;
    vertical-align: top;
    margin-left: 10px;
  }
  .hover-basic-info-item-static {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100% - 59px);
    padding-left: 10px;
    cursor: pointer;
  }
  .workitem-basic-info-item-readonly {
    position: relative;
    top: 3px;
    cursor: unset;
  }
  .status-tag {
    display: inline-block;
    border-radius: 5px;
    padding: 0 12px;
    color: #fff;
    margin-left: 15px;
    line-height: 26px;
  }
}
</style>
