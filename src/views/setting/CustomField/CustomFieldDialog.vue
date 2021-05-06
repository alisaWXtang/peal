<template>
  <div
    v-loading="loading"
    class="custom-dialog"
    element-loading-text=" "
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
  >
    <el-dialog
      :title="dialogName"
      custom-class="custom-field-dialog"
      :visible.sync="dialogMoudleShowStatus"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="600px"
      :append-to-body="true"
    >
      <div v-if="dialogMoudleShowStatus" class="form-iterm-box">
        <el-form
          :model="formInfo"
          :label-width="$isEnglish() ? '100px' : '130px'"
        >
          <el-form-item
            :label="$t('字段名称')"
            prop="fieldName"
            :rules="[{ required: true, message: $t('字段名称不能为空') }]"
          >
            <el-input
              v-model="formInfo.fieldName"
              :disabled="
                !formInfo.deletable && dialogMoudleOperateStatus === 'update'
              "
            ></el-input>
          </el-form-item>
          <el-form-item
            :label="$t('字段类型')"
            prop="attrType"
            :rules="[{ required: true }]"
          >
            <el-select
              v-model="formInfo.attrType"
              :popper-append-to-body="true"
              :disabled="dialogMoudleOperateStatus !== 'add'"
              @change="fieldTypeChange"
            >
              <el-option
                v-for="item in attrTypeList"
                :key="item.attrType"
                :value="item.attrType"
                :label="item.attrText"
              ></el-option>
            </el-select>
            <div
              v-show="[10, 11].includes(formInfo.attrType)"
              class="select-box"
            >
              <div ref="optionBoxRef" class="select-box-option-item-box">
                <div
                  v-for="item in selectOptionList"
                  :key="item.key"
                  class="select-box-option-item"
                >
                  <el-input
                    v-model="item.value"
                    class="select-box-option-item-input"
                    :disabled="!item.isNew"
                    @change="addSelectOptionChange(item)"
                    @focus="getSelectOptionValue(item)"
                  ></el-input>
                  <span
                    v-show="fieldDeletable"
                    class="select-box-option-item-delete cursor-pointer"
                    @click="deleteSelectOption(item)"
                    ><i class="el-icon-delete"></i
                  ></span>
                </div>
              </div>
              <div>
                <span
                  v-show="fieldAddable"
                  class="link-common select-box-btnitem"
                  @mousedown="addSelectOption"
                  >{{ $t('增加字段选项') }}</span
                >
                <!-- <span class="link-common select-box-btnitem" @click="deleteSelectOptionAll">删除字段全部选项</span> -->
              </div>
            </div>
          </el-form-item>
          <el-form-item :label="$t('默认值')">
            <typed-form-item
              v-model="formInfo.presetValue"
              :popper-append-to-body="true"
              :type="defaultInputAttrValue"
              :select-list="selectOptionList"
            ></typed-form-item>
            <span class="link-common" @click="resetPresetValue">{{
              $t('清空默认值')
            }}</span>
          </el-form-item>
          <el-form-item v-if="tmplTableVisible" :label="$t('在以下模板中使用')">
            <field-selected-tmpl-table
              :tmpl-all-list="tmplAllList"
              :selection-tmpl-list="formInfo.templateConfigs"
              @selectedChange="tmplSelectCallback"
            >
            </field-selected-tmpl-table>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{ $t('取消') }}</el-button>
        <el-button
          v-show="
            $authFunction(
              'FUNC_COOP_PROJECT_USER_DEFINED_ATTR_CREATE',
              3,
              projectId,
            )
          "
          type="primary"
          @click="handleSubmit"
          >{{ $t('确定') }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 自定义字段 add/update dialog
 * @desc
 * @author heyunjiang
 * @date 2019.8.27
 * @update 2020.3.11 王玲
 */
import cloneDeep from 'lodash/cloneDeep'
import FieldSelectedTmplTable from './FieldSelectedTmplTable'
import { getFieldWorkItemTemplateList } from '@/service/project/workItemTemplate'
import {
  customFieldTypes,
  customFieldChoices,
  customFieldChoicesDelete,
  customFieldChoicesAdd,
  customFieldChange,
  customFieldCreate,
  customFieldUpdate,
} from '@/service/custom-field'
import { assignUsersList } from '@/service/bug'

const dialogInfoInit = {
  attrType: 1,
  attrValue: 'SINGLE_TEXT',
  fieldName: '',
  presetValue: '',
  choices: [],
  tmpls: [],
  templateConfigs: [],
}

export default {
  name: 'CustomFieldDialog',
  components: {
    FieldSelectedTmplTable,
  },

  mixins: [],
  props: {
    dialogMoudleShowStatus: Boolean,
    dialogMoudleOperateStatus: String,
    dialogInfo: Object,
    projectId: [String, Number],
    workItemType: {
      type: [String, Number],
      required: true,
      desc: '工作项类型',
    },

    tmplTableVisible: {
      type: Boolean,
      default: true,
      required: false,
      desc: '在以下模板中使用是否显示，false为不显示',
    },
  },

  data() {
    return {
      disalogStatus: false,
      formInfo: { ...dialogInfoInit },
      attrTypeList: [], // 字段可选类型列表
      selectOptionList: [], // 字段类型为单选、多选时的选项值
      selectOptionIndex: 1, // 字段选项值 key
      loading: false,
      memberList: [], // 人员列表
      tmplAllList: [], //全部工作项模板列表
      hasAddOption: false, // 是否新加option
    }
  },
  computed: {
    dialogName() {
      return this.dialogMoudleOperateStatus === 'add'
        ? i18n.t('新增字段')
        : i18n.t('更新字段')
    },
    // 当前字段类型 attrValue
    defaultInputAttrValue() {
      const item = this.attrTypeList.find(
        attr => attr.attrType === this.formInfo.attrType,
      )
      return item?.attrValue || 'SINGLE_TEXT'
    },
    fieldAddable() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_USER_DEFINED_ATTR_CHOICE_CREATE',
        3,
        this.projectId,
      )
    },
    fieldDeletable() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_USER_DEFINED_ATTR_CHOICE_DELETE',
        3,
        this.projectId,
      )
    },
  },

  watch: {
    dialogInfo() {
      this.formInfoReset()
      if (this.tmplTableVisible) {
        this.getWorkItemTemplateList()
      }
    },
    dialogMoudleShowStatus() {
      this.disalogStatus = this.dialogMoudleShowStatus

      if (!this.disalogStatus) {
        this.formInfo = { ...dialogInfoInit }
      }
    },
    selectOptionList(newVal, oldVal) {
      if (newVal.length > oldVal.length) {
        this.$nextTick(() => {
          const el = this.$refs.optionBoxRef
          if (el) {
            el.scrollTop = el.scrollHeight
          }
        })
      }
    },
  },

  mounted() {
    this.formInfoReset()
    this.getAttrTypeList()
    // 获取工作项全部模板,当tmplTableVisible为fasle时，是在工作项模板页面，不需要列表
    if (this.tmplTableVisible) {
      this.getWorkItemTemplateList()
    }
  },
  methods: {
    // 工作项全部模板
    async getWorkItemTemplateList() {
      const result = await getFieldWorkItemTemplateList({
        workItemType: this.workItemType,
        projectId: this.projectId,
      })

      if (result.status === 200) {
        this.tmplAllList = result.data
      }
    },
    //在以下模板中使用,选中的模板值
    tmplSelectCallback(selectionList) {
      this.formInfo.templateConfigs = selectionList
    },
    // form 表单重置
    formInfoReset() {
      const obj = cloneDeep(Object.assign({}, dialogInfoInit, this.dialogInfo))
      obj.presetValue = this.dialogInfo.presetValue
        ? this.dialogInfo.presetValue.key
        : this.$store.state.cm.customFieldInitTypeMap[obj.attrValue]
      this.formInfo = obj
      this.selectOptionList = []
      this.selectOptionIndex = 1
      // 如果当前字段为 更新 + select，则获取字段可选择字段的 list
      if (
        ['SINGLE_CHOICE', 'MULTI_CHOICE'].includes(this.dialogInfo.attrValue)
      ) {
        this.getSelectOptionList()
      }
      // 如果当前字段为 更新 + 人员列表
      this.getAssignUsersList()
    },
    // 获取可选择字段类型列表
    async getAttrTypeList() {
      if (this.attrTypeList.length > 0) {
        return
      }
      let result = {}
      try {
        result = await customFieldTypes()
      } catch (_) {
        result.status = 0
      }
      if (result.status === 200) {
        this.attrTypeList = result.data
      }
    },
    // 获取字段可选择值列表列表
    async getSelectOptionList(attrName) {
      let result = {}
      this.loading = true
      try {
        result = await customFieldChoices({
          projectId: this.projectId,
          workItemType: this.workItemType,
          attrName: attrName || this.dialogInfo.attrName,
        })
      } catch (_) {
        result.status = 0
      }
      this.loading = false
      if (result.status === 200) {
        this.selectOptionList = result.data.map(item => {
          return {
            ...item,
            key: item.choice,
            value: item.value,
            isNew: true,
          }
        })
        const length = this.selectOptionList.length
        this.selectOptionIndex = length + 1

        // 解决新增字段点击增加字段按钮导致的闪烁
        if (this.hasAddOption) {
          this.selectOptionList.push({
            key: this.selectOptionIndex + 1,
            value: '',
            isNew: true,
            isAdd: true,
          })
          this.hasAddOption = false
        }
      }
    },
    // 删除全部选项
    async deleteSelectOptionAll() {
      if (this.dialogMoudleOperateStatus === 'add') {
        this.selectOptionList = []
      } else {
        // 发起请求删除
        const confirmResult = await this.confirmBeforeOperate(
          `${i18n.t('确认删除全部字段值吗？')}`,
        )

        if (!confirmResult) {
          return false
        }
        this.deleteFieldOption({ all: true })
      }
    },
    // 删除选项时,如果是删除的是默认值,清除默认值
    defaultSelectedIsExist(info) {
      if (this.defaultInputAttrValue === 'MULTI_CHOICE') {
        this.formInfo.presetValue = this.formInfo.presetValue.filter(
          item => item !== info.key,
        )
      } else if (this.defaultInputAttrValue === 'SINGLE_CHOICE') {
        this.formInfo.presetValue =
          this.formInfo.presetValue === info.key
            ? null
            : this.formInfo.presetValue
      }
    },

    // 删除选项
    async deleteSelectOption(info) {
      if (!info.isNew || info.value.length === 0) {
        this.selectOptionList = this.selectOptionList.filter(
          item => item.key !== info.key,
        )
      } else if (this.selectOptionList.length <= 1) {
        this.$message({
          type: 'error',
          message: i18n.t('至少保留一个选项'),
        })
      } else {
        // 发起请求删除
        const confirmResult = await this.confirmBeforeOperate(
          `${i18n.t('确认删除字段值')}"${info.value}"${i18n.t('吗')}？`,
        )
        if (!confirmResult) {
          return false
        }
        this.deleteFieldOption({ id: info.id })
      }
      this.defaultSelectedIsExist(info)
    },
    // 删除选项 - 更新时才能调用这个接口，新建时不允许调用
    async deleteFieldOption(obj) {
      let result = {}
      this.loading = true
      try {
        result = await customFieldChoicesDelete({
          projectId: this.projectId,
          workItemType: this.workItemType,
          ...obj,
        })
      } catch (_) {
        result.status = 0
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          type: 'success',
          message: result.msg || i18n.t('删除字段值成功'),
        })
      } else {
        // this.$message({type: 'error', message: result.msg || '删除字段值失败'});
      }
      this.getSelectOptionList()
    },
    // 新增时，字段类型切换
    fieldTypeChange() {
      if ([10, 11].includes(this.formInfo.attrType)) {
        this.selectOptionList = [
          {
            key: this.selectOptionIndex,
            value: '',
            isNew: true,
          },
        ]
      }
      if (
        ['MEMBER_CHOICE', 'MULTI_MEMBER_CHOICE'].includes(
          this.defaultInputAttrValue,
        )
      ) {
        this.selectOptionList = this.memberList
      }
      this.formInfo.presetValue = this.$store.state.cm.customFieldInitTypeMap[
        this.defaultInputAttrValue
      ]
    },
    // 重置默认值
    resetPresetValue() {
      this.formInfo.presetValue = this.$store.state.cm.customFieldInitTypeMap[
        this.defaultInputAttrValue
      ]
    },
    // 点击 - 增加字段选项
    addSelectOption() {
      if (
        this.dialogMoudleOperateStatus === 'update' &&
        this.selectOptionList.find(item => !item.value)
      ) {
        this.$message({
          type: 'warning',
          message: i18n.t('已经增加了一个字段选项，请先填写'),
        })
        return
      }

      // 解决新增字段点击增加字段按钮导致的闪烁
      const hasAdd = this.selectOptionList.find(item => item.isAdd)
      if (this.dialogMoudleOperateStatus === 'update' && hasAdd) {
        this.hasAddOption = true
        return
      }

      this.selectOptionIndex++
      this.selectOptionList = [
        ...this.selectOptionList,
        {
          key: this.selectOptionIndex,
          value: '',
          isNew: true,
          isAdd: true,
        },
      ]
    },
    // 获取修改前的可选字段
    getSelectOptionValue(info) {
      this.beforeValue = info.value
    },
    // 增加字段选项 - 更新时，发起请求增加可选字段
    async addSelectOptionChange(info) {
      if (this.dialogMoudleOperateStatus === 'add' || info.value.length < 1) {
        return
      }
      let result = {}
      this.loading = true
      if (this.beforeValue.length === 0) {
        try {
          result = await customFieldChoicesAdd({
            projectId: this.projectId,
            workItemType: this.workItemType,
            attrName: this.formInfo.attrName,
            choice: info.value,
          })
        } catch (_) {
          result.status = 0
        }
        this.loading = false
        if (result.status === 200) {
          this.$message({
            type: 'success',
            message: result.msg || i18n.t('新增字段值成功'),
          })
          // 新增字段值成功后，重新获取字段
          this.getSelectOptionList()
        }
      }
      if (
        this.dialogMoudleOperateStatus === 'update' &&
        info.value !== this.beforeValue &&
        this.beforeValue.length !== 0
      ) {
        var res = await customFieldChange({
          projectId: this.projectId,
          id: info.id,
          choice: info.value,
        })
        if (res.status === 200) {
          this.$message({
            type: 'success',
            message: result.msg || i18n.t('修改字段值成功'),
          })
          // 修改成功后，重新获取字段
          this.getSelectOptionList()
        }
      }
    },
    // dialog - 点击取消
    handleClose() {
      this.$emit('cancel')
      this.formInfoReset()
    },
    // 获取自定义字段列表
    getCustomFieldList() {
      return this.$store.dispatch({
        type: 'getCustomField',
        payload: {
          workItemType: this.workItemType,
          projectId: this.projectId,
        },
      })
    },
    // 新建项目时，最开始id不对，这里获取id
    async getFieldId() {
      const result = await this.getCustomFieldList()
      if (result.status !== 200) {
        return
      }
      const fieldList = result.data.attrs
      fieldList.forEach(item => {
        if (item.fieldName === this.formInfo.fieldName) {
          this.formInfo.id = item.id
        }
      })
    },
    // dialog - 点击确定 - 新增/更新字段
    async handleSubmit() {
      if (this.formInfo.fieldName.length < 1) {
        this.$message({ type: 'warning', message: i18n.t('字段名称不能为空') })
        return
      }
      if (this.dialogMoudleOperateStatus === 'add') {
        this.addFiled()
      } else {
        // 解决线上一个bug，在新建项目时，编辑模块等字段会更新错误，原因是新建项目时获取的id不对
        if (this.formInfo.projectId === 0) {
          await this.getFieldId()
        }

        const StringifyPresetValue = JSON.stringify({
          key: this.formInfo.presetValue,
          value: this.generateDefaultValueString(),
        })

        this.$emit('updateField', {
          ...this.formInfo,
          presetValue: StringifyPresetValue,
          cb: () => {
            this.formInfoReset()
            this.$emit('cancel')
          },
        })
      }
    },
    // 新增字段
    async addFiled() {
      if (
        this.selectOptionList.filter(item => item.value.length > 0).length <
          1 &&
        ['SINGLE_CHOICE', 'MULTI_CHOICE'].includes(this.defaultInputAttrValue)
      ) {
        this.$message({
          type: 'warning',
          message: i18n.t('多选/单选可选值数量至少 > 1'),
        })

        return
      }

      const StringifyPresetValue = JSON.stringify({
        key: this.formInfo.presetValue, // 如果是多选、单选，则新建时保存的是临时的 key ,需要在后续做个转换，转换成服务器提供的key
        value: this.generateDefaultValueString(),
      })

      let result = {}
      this.loading = true
      try {
        result = await customFieldCreate({
          ...this.formInfo,
          presetValue: StringifyPresetValue,
          attrValue: this.defaultInputAttrValue,
          choices: this.selectOptionList
            .filter(item => item.value.length > 0)
            .map(item => item.value),
          projectId: this.projectId,
          enabled: true,
          workItemType: this.workItemType,
        })
        if (result.status === 418) {
          this.$message({
            type: 'error',
            message: i18n.t(result.msg),
          })
        }
      } catch (_) {
        result.status = 0
      }
      if (result.status === 200) {
        // 更新默认值数据
        if (
          ['SINGLE_CHOICE', 'MULTI_CHOICE'].includes(this.formInfo.attrValue)
        ) {
          await this.replacePresetValue(StringifyPresetValue, result.data)
        }
        this.$message({
          type: 'success',
          message: result.msg || i18n.t('新增成功'),
        })

        this.formInfoReset()
        this.$emit('success', result.data)
      } else {
        // this.$message({type: 'error', message: result.msg || '新增失败'});
      }
      this.loading = false
    },
    // 生成默认值字符串
    generateDefaultValueString() {
      let presetValueName = ''
      switch (this.defaultInputAttrValue) {
        case 'MEMBER_CHOICE':
        case 'SINGLE_CHOICE':
          try {
            presetValueName = this.selectOptionList.find(
              item => item.key === this.formInfo.presetValue,
            )?.value
          } catch (e) {
            console.error(e)
          }
          break
        case 'MULTI_MEMBER_CHOICE':
        case 'MULTI_CHOICE':
          presetValueName = []
          this.selectOptionList.forEach(item => {
            if (this.formInfo.presetValue.includes(item.key)) {
              presetValueName.push(item.value)
            }
          })
          presetValueName = presetValueName.join(',')
          break
        case 'BOOLEAN_ATTR':
          switch (this.formInfo.presetValue) {
            case true:
              presetValueName = i18n.t('是')
              break
            case false:
              presetValueName = i18n.t('否')
              break
            default:
              presetValueName = ''
          }

          break
        default:
          presetValueName = this.formInfo.presetValue
      }

      return presetValueName
    },
    // 获取人员列表
    async getAssignUsersList() {
      // 减少发起的请求，增加效率
      if (this.memberList.length > 0) {
        this.selectOptionList = this.memberList
        return
      }
      const result = await assignUsersList({
        projectId: this.projectId,
        query: '',
      })

      if (result.status && result.status === 200) {
        const list = result.data.map(item => {
          return {
            ...item,
            key: item.userId,
            value: item.userName + '(' + item.userId + ')',
          }
        })
        this.memberList = list
        this.selectOptionList = list
      }
    },
    // 新建成功之后：多选、单选 对应的 presetValue 更新，此刻需要更新成服务器真实保存的 key 值
    async replacePresetValue(StringifyPresetValue, successInfo) {
      await this.getSelectOptionList(successInfo.attrName)
      const presetValue = JSON.parse(StringifyPresetValue)
      const updateObj = { ...presetValue }
      // 如果是单选
      if (this.formInfo.attrValue === 'SINGLE_CHOICE') {
        this.selectOptionList.forEach(item => {
          if (item.value === presetValue.value) {
            updateObj.key = item.key
          }
        })
      }
      // 如果是多选
      if (this.formInfo.attrValue === 'MULTI_CHOICE') {
        updateObj.key = []
        this.selectOptionList.forEach(item => {
          if (presetValue.value.includes(item.value)) {
            updateObj.key.push(item.key)
          }
        })
      }
      // 发起请求更新默认值
      const result = await customFieldUpdate({
        ...successInfo,
        presetValue: JSON.stringify(updateObj),
      })

      return result
    },
  },
}
</script>

<style lang="scss" scoped>
.custom-dialog {
  z-index: 3;
}
.select-box {
  .select-box-btnitem {
    margin-right: 10px;
  }
  .select-box-option-item-box {
    @include scrollbal-common;
    max-height: 300px;
    overflow-y: hidden;

    &:hover {
      overflow-y: auto;
    }

    &:not(:empty) {
      margin-top: 10px;
    }

    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    .select-box-option-item {
      margin-bottom: 5px;
      .select-box-option-item-input {
        width: 200px;
      }
      .select-box-option-item-delete {
        padding: 0 5px;
        &:hover {
          color: #409eff;
        }
      }
    }
  }
}
</style>
