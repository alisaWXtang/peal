<template>
  <el-dialog
    :visible="addRuleModalStatus"
    :title="$t('流转权限/流转自定义规则')"
    :show-close="false"
    width="1200px"
    :modal-append-to-body="false"
  >
    <div
      v-loading="loading"
      element-loading-text
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255,255,255, 0.5)"
    >
      <target-select
        :defs.sync="defs"
        :current-rule-name="currentRuleName"
        @changeRuleName="changeRuleName"
      ></target-select>
      <role-manage
        v-if="addRuleModalStatus"
        :checked-role-list.sync="currentRoles"
        :checked-person-list.sync="currentUserFields"
        :role-list.sync="roles"
        :person-list.sync="userFields"
      ></role-manage>
      <attrach-field
        v-if="addRuleModalStatus"
        :all-fields.sync="allFields"
        :user-fields.sync="userFields"
        :curreent-additional-fields.sync="curreentAdditionalFields"
        :project-id="projectId"
        :work-item-type="workItemType"
      ></attrach-field>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button type="default" @click="cancel">{{ $t('取消') }}</el-button>
      <el-button type="primary" @click="success">{{ $t('确定') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { i18n } from '@/i18n'
import TargetSelect from './WorkFlowRule/TargetSelect'
import RoleManage from './WorkFlowRule/RoleManage'
import AttrachField from './WorkFlowRule/AttrachField'
import { deepClone } from '@/utils'
import { ruleUpdate } from '@/service/work-status-flow'

export default {
  name: 'WorkFlowRuleDialog',
  components: {
    TargetSelect,
    RoleManage,
    AttrachField,
  },

  mixins: [],
  props: {
    addRuleModalStatus: {
      type: Boolean,
      required: true,
      desc: 'dialog status control',
    },

    projectId: {
      type: [String, Number],
      required: true,
      desc: '项目 id',
    },

    workItemType: {
      type: [String, Number],
      required: true,
      desc: '当前工作流类型',
    },

    tmplId: {
      type: [String, Number],
      required: true,
      desc: '当前工作流模板 id',
    },

    currentEditorRuleName: {
      type: String,
      required: true,
      desc: '当前工作流名称',
    },

    workFlowInfo: {
      type: Object,
      required: true,
      desc: '工作流所有数据',
    },
  },

  data() {
    return {
      currentRuleName: '', //当前流转目标值
      transfers: [], // 工作流状态流转
      defs: [], //工作流 table
      roles: [], // 工作流角色权限列表
      allFields: [], //工作流所有附加字段列表
      userFields: [], //工作流所有人员字段
      curreentAdditionalFields: {}, //当前编辑流转自定义规则默认的附加字段
      currentUserFields: [], //当前编辑流转自定义规则默认的人员字段
      currentRoles: [], //当前编辑流转自定义规则默认的成员角色字段
      loading: false,
      toId: '',
    }
  },
  computed: {},
  watch: {
    currentEditorRuleName(newValue) {
      this.currentRuleName = newValue
    },
    // 获取当前流转状态的值
    currentRuleName() {
      this.updateCurrentData(this.currentRuleName)
    },
    workFlowInfo: {
      handler() {
        let workFlowInfo = deepClone(this.workFlowInfo[this.workItemType])
        this.transfers = deepClone(workFlowInfo.transfers)
        this.defs = workFlowInfo.defs
        this.roles = workFlowInfo.roles
        // 配置流转状态附加字段->属性名称->下拉列表 不包括‘状态’、’延期类型‘字段
        this.allFields = workFlowInfo.allFields.filter(
          // item => item.fieldName !== i18n.t('状态'),
          item =>
            ![
              i18n.t('状态'),
              i18n.t('延期类型'),
              i18n.t('实际完成时间'),
              i18n.t('实际关闭时间'),
            ].includes(item.fieldName),
        )

        this.userFields = workFlowInfo.userFields
        if (this.currentRuleName) {
          this.updateCurrentData(this.currentRuleName)
        }
      },
      deep: true,
      immediate: true,
    },
  },

  created() {},
  mounted() {},
  methods: {
    success() {
      this.updateRules()
    },
    cancel() {
      // 重新获取值
      let workFlowInfo = deepClone(this.workFlowInfo[this.workItemType])
      this.transfers = deepClone(workFlowInfo.transfers)
      this.updateCurrentData(this.currentRuleName)
      this.$emit('update:addRuleModalStatus', false)
    },
    // 目前没有，最开始流转状态可以改变时写的
    changeRuleName(name) {
      this.currentRuleName = name
    },
    // 更新流转规则
    async updateRules() {
      this.loading = true
      let result = {}
      try {
        result = await ruleUpdate({
          projectId: this.projectId,
          tmplId: this.tmplId,
          toId: this.toId,
          fromId: 0,
          fields: this.curreentAdditionalFields,
          authority: {
            value: {
              roles: this.currentRoles,
              fields: this.currentUserFields,
            },
          },
        })
      } catch (e) {
        console.error(e)
      }
      this.loading = false
      if (result.status && result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('更新成功'),
          type: 'success',
        })

        this.$emit('success')
      } else {
        // this.$message({ message: result.msg || "更新失败", type: "error" });
        // this.$emit("update:addRuleModalStatus", false);
      }
    },
    updateCurrentData(currentRuleName) {
      let currentTransfers = this.transfers.filter(
        item => item.def.name == currentRuleName,
      )[0]
      if (currentTransfers) {
        this.curreentAdditionalFields = currentTransfers.defaultRule.fields
        this.currentRoles = currentTransfers.defaultRule.authority.value.roles
        this.currentUserFields =
          currentTransfers.defaultRule.authority.value.fields
        this.toId = currentTransfers.defaultRule.toId
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
