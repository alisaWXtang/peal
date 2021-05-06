<template>
  <div>
    <div class="f-w-700">
      {{ $t('配置流转状态附加字段')
      }}<el-tooltip class="item" effect="dark" placement="top-start">
        <div slot="content">
          <p>
            {{ $t('设置状态流转附加字段后') }}，{{
              $t('附加字段会在流转弹窗里展示')
            }}，{{ $t('供用户填写') }}。
          </p>
        </div>
        <i class="el-icon-question"></i> </el-tooltip
      ><el-button type="text" @click="addField"
        >+{{ $t('添加字段') }}</el-button
      >
    </div>
    <div class="el-table table-field">
      <table
        cellspacing="0"
        cellpadding="0"
        border="0"
        class="el-table__header el-table--border"
        style="width: 100%;"
      >
        <thead class="has-gutter">
          <tr>
            <th>
              <div class="cell">{{ $t('属性名称') }}</div>
            </th>
            <th>
              <div class="cell">
                {{ $t('默认值类型')
                }}<el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">
                    <p>{{ $t('无') }}：{{ $t('表示无默认值') }}。</p>
                    <p>{{ $t('固定值') }}：{{ $t('默认值固定为某个值') }}。</p>
                    <p>
                      {{ $t('字段值') }}：{{ $t('默认值为当前某个字段的值') }}。
                    </p>
                  </div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </div>
            </th>
            <th>
              <div class="cell">{{ $t('默认值') }}/{{ $t('默认字段') }}</div>
            </th>
            <th>
              <div class="cell">{{ $t('是否必填') }}</div>
            </th>
            <th>
              <div class="cell">{{ $t('删除') }}</div>
            </th>
          </tr>
          <tr
            v-for="(item, index) in additionalField"
            :key="item.attrName"
            class="el-table__row"
          >
            <td>
              <div class="cell">
                <span
                  v-if="item.attrName === comment"
                  class="comment-text-color"
                  >{{ item.fieldName }}</span
                >
                <el-select
                  v-else
                  v-model="item.attrName"
                  :placeholder="$t('请选择')"
                  @change="changeVal($event, index)"
                >
                  <el-option
                    v-for="field in allFields"
                    :key="field.attrName"
                    :label="field.fieldName"
                    :value="field.attrName"
                    :disabled="field.disabled"
                  >
                  </el-option>
                </el-select>
              </div>
            </td>
            <td>
              <div class="cell">
                <!-- <span v-if="!defaultValueType[index]"></span> -->
                <el-select
                  v-model="item.defaultValueType"
                  :placeholder="$t('请选择')"
                  @change="changeType($event, item.attrName, index)"
                >
                  <el-option
                    v-for="type in defaultValueType[index]"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  >
                  </el-option>
                </el-select>
              </div>
            </td>
            <td>
              <div v-if="item.defaultValueType !== NULL" class="cell">
                <tiny-mce
                  v-if="item.attrName === 'comment'"
                  :value="item.typedDefaultValue"
                  :max-heigt="200"
                  :min-heigt="200"
                  :toolbar="toolBar"
                  @watch="editComentLister($event, item)"
                ></tiny-mce>
                <typed-form-item
                  v-else-if="defaultValueOptions[index] === MEMBER_CHOICE"
                  v-model="item.typedDefaultValue"
                  :type="defaultValueOptions[index]"
                  :select-list="selectOptionList[index]"
                  @change="changeDefaultValue"
                >
                </typed-form-item>
              </div>
            </td>
            <td>
              <div class="cell">
                <el-checkbox
                  v-if="item.required !== NULL"
                  v-model="item.required"
                ></el-checkbox>
              </div>
            </td>
            <td>
              <div class="cell">
                <i
                  v-if="item.attrName !== comment"
                  class="el-icon-delete"
                  @click="itemDelete(index)"
                ></i>
              </div>
            </td>
          </tr>
        </thead>
      </table>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 配置流转状态附加字段
 * @desc attrValue 判断默认值类型 MEMBER_CHOICE 成员列表 COMMENT特指评论框
 * defaultValueTypeOptions 默认类型 没值-->空
 * @author huangmei
 * @date
 */
import { queryOptions } from '@/service/work-status-flow'

const TinyMce = () => import('@/components/tinymce')

export default {
  name: 'AttrachField',
  components: { TinyMce },
  mixins: [],
  props: {
    allFields: {
      type: Array,
      default: () => [],
    },
    curreentAdditionalFields: {
      type: Object,
      default: () => {},
    },
    userFields: {
      type: Array,
      default: () => [],
    },
    // eslint-disable-next-line vue/require-default-prop
    workItemType: [String, Number],
    // eslint-disable-next-line vue/require-default-prop
    projectId: [String, Number],
  },

  data() {
    return {
      defaultValueOptions: [], // 默认值选项
      defaultValueType: [], // 存放默认类型
      selectOptionList: [], // 固定值的默认值选项
      additionalField: this.curreentAdditionalFields.value.fields.map(item => {
        return {
          ...item,
          originalDefaultValueType: item.defaultValueType,
          originalTypedDefaultValue: item.typedDefaultValue,
        }
      }), // 已经添加的字段
      NULL: 'NULL', // 代表空 与后台同步
      MEMBER_CHOICE: 'MEMBER_CHOICE', // 成员列表
      comment: 'comment', // 评论key
      COMMENT: 'COMMENT', // 评论 attrValue
      FIELD: 'FIELD', // 字段值key
      CONST: 'CONST', // 固定值key
      toolBar: 'undo redo | table',
    }
  },
  computed: {
    nameList() {
      // 存放选中的值
      const nameList = this.additionalField.map(v => v.attrName)
      this.disableSelect(nameList)
      return nameList
    },
  },

  watch: {
    // 选中的attrName
    nameList: {
      deep: true,
      handler(newVal) {
        this.disableSelect(newVal)
      },
    },

    additionalField: {
      deep: true,
      handler(newVal) {
        const obj = this.curreentAdditionalFields.value
        obj.fields = newVal
          .filter(v => v.attrName)
          .map(v => ({
            ...v,
            defaultValue: v.typedDefaultValue,
          }))

        this.$emit('curreentAdditionalFields', obj)
      },
    },
  },

  mounted() {
    this.defaultValueType = this.additionalField.map(
      v => v.defaultValueTypeOptions,
    )

    this.defaultValueOptions = this.additionalField.map(v => v.attrValue)
    // 初始化 changeType
    this.additionalField.forEach((v, index) => {
      this.changeType(v.defaultValueType, v.attrValue, index, false)
    })
  },
  methods: {
    addField() {
      if (this.additionalField.length < this.allFields.length) {
        const obj = {
          attrName: '',
          fieldName: '',
          // defaultValueTypeOptions: null,
          defaultValueType: null,
          // defaultValue: “,
          required: this.NULL,
          delete: false,
        }

        this.additionalField.push(obj)
      } else {
        this.$message({
          type: 'info',
          message: i18n.t('已经添加到极限'),
        })
      }
    },
    // 更改评论内容
    editComentLister(data, item) {
      item.typedDefaultValue = data
      this.additionalField = [...this.additionalField]
    },
    // 属性名称change 对应的默认类型defaultValueType 默认值/默认字段defaultValue required 初始化null
    changeVal(value, index) {
      this.additionalField[index].defaultValueType = this.NULL
      this.additionalField[index].defaultValue = null
      this.additionalField[index].required = null
      this.allFields.forEach(v => {
        if (v.attrName === value) {
          this.defaultValueType[index] = v.defaultValueTypeOptions
          this.defaultValueOptions[index] = v.attrValue
          // this.additionalField[index].defaultValueType = this.defaultValueOptions[index][0].value
        }
      })
    },
    // 默认类型change FIELD 字段值 NULL 空的 CONST 固定值  defaultValue 是否初始化默认值
    async changeType(value, attrName, index, defaultValue = true) {
      defaultValue && (this.additionalField[index].defaultValue = null)
      if (attrName === this.comment) {
        this.defaultValueOptions[index] = this.COMMENT
        // 处理人
      } else {
        this.defaultValueOptions[index] = this.MEMBER_CHOICE
        // 处理人 字段值
        if (value === this.FIELD) {
          this.selectOptionList[index] = this.userFields.map(v => ({
            key: v.attrName,
            value: v.fieldName,
          }))

          // 处理人 固定值
        } else if (value === this.CONST) {
          const res = await this.getList(this.nameList[index])
          this.selectOptionList[index] = res.map(v => ({
            key: v.value,
            value: v.label,
          }))
        }
        // 当默认值类型切换的时候，默认值也要改变
        const {
          defaultValueType,
          originalDefaultValueType,
          originalTypedDefaultValue,
        } = this.additionalField[index]
        this.additionalField[index].typedDefaultValue =
          defaultValueType === originalDefaultValueType
            ? originalTypedDefaultValue
            : ''
        this.$forceUpdate()
      }
    },
    itemDelete(index) {
      this.additionalField.splice(index, 1)
    },
    // 添加是否选中
    disableSelect(arr) {
      this.allFields.forEach(v => {
        if (arr.includes(v.attrName)) {
          v.disabled = true
        } else {
          v.disabled = false
        }
      })
    },
    // projectId workItemType attrName 固定值的下拉选项
    async getList(attrName) {
      const res = await queryOptions({
        projectId: this.projectId,
        workItemType: this.workItemType,
        attrName,
        pageSize: 1e4,
        pageNum: 1,
      })

      return res.data
    },
  },
}
</script>
<style lang="scss" scoped>
.f-w-700 {
  font-weight: 700;
}
.table-field {
  margin-top: 10px;
  tr {
    height: 40px;
  }
  .comment-text-color {
    color: #606266;
    padding-left: 9px;
  }
  .el-icon-delete {
    cursor: pointer;
  }
}
</style>
