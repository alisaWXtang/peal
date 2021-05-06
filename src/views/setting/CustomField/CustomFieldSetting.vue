<template>
  <div
    v-loading="loading"
    element-loading-text=" "
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
  >
    <div class="header-btn">
      <div class="field-setting">{{ $t('字段配置') }}</div>
      <el-button
        v-show="
          $authFunction(
            'FUNC_COOP_PROJECT_USER_DEFINED_ATTR_CREATE',
            3,
            projectId,
          )
        "
        type="primary"
        @click="addField"
        >{{ $t('增加自定义字段') }}</el-button
      >
    </div>
    <el-table :data="customFieldList" style="width: 100%">
      <el-table-column
        prop="fieldName"
        :label="$t('字段名')"
        width="300"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="attrText"
        :label="$t('字段类型')"
        width="220"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :label="$t('默认值')" width="220" show-overflow-tooltip>
        <template slot-scope="scope">
          <span
            v-if="
              !['MULTI_CHOICE', 'MULTI_MEMBER_CHOICE'].includes(
                scope.row.attrValue,
              )
            "
            >{{
              (scope.row.presetValue && scope.row.presetValue.value) ||
                (scope.row.presetValue && scope.row.presetValue.key)
            }}</span
          >
          <span v-else>{{
            scope.row.presetValue && scope.row.presetValue.value
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="enabled"
        :label="$t('在以下模板中使用')"
        min-width="250"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span class="operatebtn link-common" @click="toTmplListPage">{{
            scope.row.tmpls | templateNameFormat
          }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" width="150">
        <template slot-scope="scope">
          <el-button
            v-show="fieldEditable"
            type="text"
            @click="editField(scope.row)"
            >{{ $t('编辑') }}</el-button
          >
          <el-button
            v-show="fieldDeletable && scope.row.deletable"
            type="text"
            @click="deleteField(scope.row)"
            >{{ $t('删除') }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <custom-field-dialog
      :dialog-moudle-show-status="dialogMoudleShowStatus"
      :dialog-moudle-operate-status="dialogMoudleOperateStatus"
      :dialog-info="dialogInfo"
      :project-id="projectId"
      :work-item-type="workItemType"
      @cancel="closeDialog"
      @success="operateCallback"
      @updateField="updateFieldInfo"
    ></custom-field-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 自定义字段
 * @desc
 * @author heyunjiang
 * @date 2019.8.23
 */
import CustomFieldDialog from './CustomFieldDialog'
import { customFieldDelete, customFieldUpdate } from '@/service/custom-field'
import { windowOpenRouter } from '@/utils/sub-app-util'

export default {
  name: 'CustomFieldSetting',
  components: {
    CustomFieldDialog,
  },
  filters: {
    // 模板名称显示
    templateNameFormat: function(tmpls) {
      if (!tmpls.length) {
        return '--'
      }
      let tmplArr = []
      tmpls.forEach(item => {
        tmplArr.push(item.tmplName)
      })
      return tmplArr.toString()
    },
  },

  mixins: [],
  props: {
    workItemType: {
      type: [String, Number],
      required: true,
      desc: '工作项类型',
    },

    projectId: [String, Number],
  },

  data() {
    return {
      dialogLoading: false, // 是否在添加/更新
      loading: false,
      dialogMoudleShowStatus: false, // 模态框是否打开
      dialogMoudleOperateStatus: 'add', // 新增 or update
      dialogInfo: {}, // 字段数据信息
    }
  },
  computed: {
    customFieldList() {
      const state = this.$store.state
      return state.pf.CUSTOMFIELDSELECTVALUES[
        state.pf.workItemTypeMap[this.workItemType]
      ].map(item => {
        let presetValue = ''
        try {
          presetValue = JSON.parse(item.presetValue) || {}
        } catch (e) {
          console.error(e)
        }
        return {
          ...item,
          presetValue,
        }
      })
    },
    fieldEditable() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_USER_DEFINED_ATTR_CREATE',
        3,
        this.projectId,
      )
    },
    fieldDeletable() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_USER_DEFINED_ATTR_DELETE',
        3,
        this.projectId,
      )
    },
    fieldEnable() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_USER_DEFINED_ATTR_UPDATE',
        3,
        this.projectId,
      )
    },
  },

  watch: {},

  mounted() {},
  methods: {
    // 在新标签打开模板页面
    toTmplListPage() {
      const urlTagMap = {
        1: 'require',
        2: 'task',
        3: 'bug',
      }

      const urlTag = urlTagMap[+this.workItemType] || 'require'
      windowOpenRouter(
        `/project/setting/template/${urlTag}?projectId=${
          this.$getUrlParams().projectId
        }`,
      )
    },
    // 获取自定义字段列表
    getCustomFieldList() {
      this.$store.dispatch({
        type: 'getCustomField',
        payload: {
          workItemType: this.workItemType,
          projectId: this.projectId,
        },
      })
    },
    // 点击 - 编辑字段
    editField(info) {
      this.dialogMoudleShowStatus = true
      this.dialogMoudleOperateStatus = 'update'
      const templateConfigs = info.tmpls.map(item => {
        return {
          templateId: item.tmplId,
          templateName: item.tmplName,
          standard: item.standard,
          required: item.required,
        }
      })
      this.dialogInfo = { ...info, templateConfigs: templateConfigs }
    },
    // 点击 - 删除字段
    async deleteField(info) {
      const confirmResult = await this.$confirmBeforeOperate(
        `${i18n.t('确认删除字段')}"${info.fieldName}"${i18n.t('吗')}？`,
        'custom_field_delete',
      )

      if (!confirmResult) {
        return false
      }
      let result = {}
      this.loading = true
      try {
        result = await customFieldDelete({
          id: info.id,
          projectId: this.projectId,
        })
      } catch (_) {
        result.status = 0
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          type: 'success',
          message: result.msg || i18n.t('删除成功'),
        })
      } else {
        // this.$message({type: 'error', message: result.msg || '删除失败'});
      }
      this.getCustomFieldList()
    },
    // 点击 - 新增字段
    addField() {
      this.dialogMoudleShowStatus = true
      this.dialogMoudleOperateStatus = 'add'
      this.dialogInfo = {}
    },
    // 更新字段 - 禁用/启用，名称修改，默认值修改
    async updateFieldInfo(info) {
      let result = {}
      this.loading = true
      try {
        result = await customFieldUpdate({
          id: info.id,
          enabled: info.enabled,
          fieldName: info.fieldName,
          templateConfigs: info.templateConfigs,
          presetValue: info.presetValue,
          projectId: this.projectId,
        })
      } catch (_) {
        result.status = 0
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          type: 'success',
          message: result.msg || i18n.t('更新成功'),
        })
      } else {
        // this.$message({type: 'error', message: result.msg || '更新失败'});
      }
      this.getCustomFieldList()
      info.cb && info.cb()
    },
    // 关闭 dialog
    closeDialog() {
      this.dialogMoudleShowStatus = false
    },
    // 新增成功回调函数
    operateCallback() {
      this.closeDialog()
      this.getCustomFieldList()
    },
  },
}
</script>
<style lang="scss" scoped>
.header-btn {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  .field-setting {
    font-size: 16px;
  }
}
</style>
