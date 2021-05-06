<template>
  <div
    v-loading="loading"
    :element-loading-text="$t('数据拼命加载中')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgb(255,255,255)"
  >
    <div class="flow-header">
      <span
        v-for="item in types"
        :key="item.workItemType"
        class="flow-header-item"
        :class="{ 'flow-header-item-active': item.workItemType === activeType }"
        @click="headerCardChange(item.workItemType)"
        >{{ item.name }}{{ $t('工作流') }}</span
      >
    </div>
    <div class="flow-table-box">
      <div class="flow-table-header">
        <el-button
          v-if="$authFunction('FUNC_COOP_STATUS_CONFIG_CREATE', 3, projectId)"
          type="primary"
          @click="statusAddClickHandle"
          >{{ $t('新加工作流程') }}</el-button
        >
        <el-button
          v-if="$authFunction('FUNC_COOP_STATUS_CONFIG_PUBLIC', 3, projectId)"
          type="text"
          @click="setPublicClickHandle"
          >{{ asPublic ? $t('取消公开') : $t('设为公开') }}</el-button
        >
        <el-button
          v-if="
            $authFunction('FUNC_COOP_STATUS_CONFIG_REPLICATE', 3, projectId)
          "
          type="text"
          @click="cloneDialogHandle"
          >{{ $t('复制其他项目工作流') }}</el-button
        >
      </div>
      <div class="flow-table-body">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column
            :label="$t('工作流名称')"
            show-overflow-tooltip
            min-width="240"
          >
            <template slot-scope="scope">
              <el-input
                v-if="scope.row.isnew"
                v-model="scope.row.name"
                :placeholder="$t('请输入工作流名称')"
              ></el-input>
              <global-input
                v-if="auth && !scope.row.isnew"
                :init-value="scope.row.name"
                :on-change="
                  value => {
                    updateStatu({
                      name: value,
                      tmplId: scope.row.tmplId,
                      statusId: scope.row.statusId,
                    })
                  }
                "
              >
                <span slot class="table-input-edit-text cp c-blue-hover">{{
                  scope.row.name
                }}</span>
              </global-input>
              <span v-if="!auth && !scope.row.isnew">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="activeType !== 3"
            show-overflow-tooltip
            align="center"
            width="150"
          >
            <template v-slot:header
              >{{ $t('状态阶段') }}
              <el-tooltip
                v-show="activeType === 1 || activeType === 2"
                effect="dark"
                placement="top"
              >
                <i class="el-icon-question stage-tooltip"></i>
                <div slot="content">
                  {{ $t('状态阶段为度量所需的阶段，包括：') }}
                  <span v-for="(stage, index) of stages" :key="index">
                    {{ stage.desc
                    }}<span v-if="index < stages.length - 1">{{
                      $isEnglish() ? ',' : '、'
                    }}</span>
                  </span>
                  <span v-if="!$isEnglish()">这几个阶段。</span>
                </div>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <span
                v-if="!scope.row._setStage && !scope.row.isnew"
                class="requirement-stage"
                @click="handleChoiceStage(scope.row)"
                >{{ scope.row.stageDesc }}</span
              >
              <el-select
                v-else
                ref="stageSelect"
                v-model="scope.row.stage"
                :placeholder="$t('选择状态阶段')"
                @visible-change="val => !val && (scope.row._setStage = 0)"
                @change="val => stageChange(val, scope.row)"
              >
                <el-option
                  v-for="(item, index) in stages"
                  :key="index"
                  :label="item.desc"
                  :value="item.name"
                >
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('起始状态')" align="center" width="100">
            <template slot-scope="scope">
              <el-radio
                :value="scope.row.init"
                :disabled="initStatusDisable(scope)"
                :label="true"
                @change="initRadioHandle(scope.row)"
                >{{ null }}</el-radio
              >
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('结束状态')"
            show-overflow-tooltip
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              <el-checkbox
                v-model="scope.row.end"
                :disabled="endStatusDisable(scope)"
                @change="
                  value => {
                    endCheckboxHandle(value, scope.row)
                  }
                "
              ></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('状态颜色')"
            show-overflow-tooltip
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              <el-color-picker
                v-model="scope.row.color"
                :disabled="!auth"
                popper-class="flow-table-body-colorPicker"
                class="flow-table-body-coloritem"
                @change="
                  value => {
                    colorChooseerHandle(value, scope.row)
                  }
                "
              ></el-color-picker>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('排序权重')"
            show-overflow-tooltip
            align="center"
            :width="$isEnglish() ? 120 : 100"
          >
            <template slot-scope="scope">
              <el-input
                v-if="scope.row.isnew"
                v-model="scope.row.order"
                :placeholder="$t('请输入工作流权重')"
              ></el-input>
              <global-input
                v-if="auth && !scope.row.isnew"
                :init-value="scope.row.order"
                :on-change="
                  value => {
                    updateStatu({
                      order: +value,
                      tmplId: scope.row.tmplId,
                      statusId: scope.row.statusId,
                    })
                  }
                "
              >
                <span slot class="table-input-edit-text cp c-blue-hover">{{
                  scope.row.order
                }}</span>
              </global-input>
              <span v-if="!scope.row.isnew && !auth">{{
                scope.row.order
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('操作')"
            show-overflow-tooltip
            align="center"
            :width="$isEnglish() ? 120 : 100"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.isnew && auth"
                type="text"
                @click="newStatusRecordSaveHandle(scope.row)"
                >{{ $t('保存') }}</el-button
              >
              <el-button
                v-if="scope.row.isnew && auth"
                type="text"
                @click="newStatusRecordCancelHandle"
                >{{ $t('取消') }}</el-button
              >
              <el-button
                v-if="!scope.row.isnew && !scope.row.preset && deleteAble"
                type="text"
                @click="deleteStatu(scope.row)"
                >{{ $t('删除') }}</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="flow-staturule-box">
      <div class="flow-staturule-box-header">
        <div>{{ $t('流转状态设置') }}</div>
        <work-flow-chart :transfers="workFlowInfo[activeType].transfers">
          <span>{{ $t('查看流程图') }}</span>
        </work-flow-chart>
      </div>
      <template v-for="item in workFlowInfo[activeType].transfers">
        <work-flow-setting-rule-item
          :key="item.def.statusId"
          :obj-data="item"
          :next-data-poor="workFlowInfo[activeType].defs"
          :add-item="addItem"
          :remove-item="removeItem"
          :project-id="projectId"
        ></work-flow-setting-rule-item>
      </template>
    </div>
    <work-flow-rule-table
      :transfers="workFlowInfo[activeType].transfers"
      :roles="workFlowInfo[activeType].roles"
      :project-id="projectId"
      :user-fields="workFlowInfo[activeType].userFields"
      :work-item-type="activeType"
      @editorRule="editorRule"
    ></work-flow-rule-table>
    <work-flow-rule-dialog
      :add-rule-modal-status.sync="addRuleModalStatus"
      :project-id="projectId"
      :work-item-type="activeType"
      :tmpl-id="tmplId"
      :current-editor-rule-name="currentEditorRuleName"
      :work-flow-info="workFlowInfo"
      @success="workflowRuleSuccess"
    ></work-flow-rule-dialog>
    <work-flow-clone
      :clone-work-flow-modal-status="cloneWorkFlowModalStatus"
      :close-modal="cloneDialogHandle"
      :project-id="projectId"
      :work-item-type="activeType"
      :tmpl-id="tmplId"
      :success-callback="workflowCloneSuccess"
    ></work-flow-clone>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 工作流状态设置
 * @desc
 * @author heyunjiang
 * @date 2019.10.19
 */
import GlobalInput from '@/components/field-edit/GlobalInput.vue'
import WorkFlowSettingRuleItem from './WorkFlowSettingRuleItem'
import WorkFlowClone from './WorkFlowClone'
import WorkFlowRuleTable from './WorkFlowRuleTable'
import WorkFlowRuleDialog from './WorkFlowRuleDialog'
import WorkFlowChart from '@/components/project/WorkFlowChart'
import cloneDeep from 'lodash/cloneDeep'
import {
  configStages,
  queryWorkStautsFow,
  workStautsFowStatuCreate,
  workStautsFowStatuUpdate,
  workStautsFowStatuDelete,
  workStautsFowRuleDelete,
  workStautsFowRuleCreate,
  workStautsFowFlowPublic,
} from '@/service/work-status-flow'

export default {
  name: 'WorkFlowSetting',
  components: {
    WorkFlowSettingRuleItem,
    GlobalInput,
    WorkFlowClone,
    WorkFlowRuleTable,
    WorkFlowRuleDialog,
    WorkFlowChart,
  },

  mixins: [],
  props: {},
  data() {
    return {
      projectId: +this.$getUrlParams().projectId,
      types: [
        { name: i18n.t('需求'), workItemType: 1 },
        { name: i18n.t('任务'), workItemType: 2 },
        { name: i18n.t('缺陷'), workItemType: 3 },
      ],

      activeType: 1, // 默认需求是活跃
      // 工作流数据
      workFlowInfo: {
        1: {
          defs: [], // 工作流 table
          transfers: [], // 工作流状态流转
          roles: [], // 工作流角色权限列表
          allFields: [], //工作流所有附加字段列表
          userFields: [], //工作流所有人员字段
        },
        2: {
          defs: [], // 工作流 table
          transfers: [], // 工作流状态流转
          roles: [], // 工作流角色权限列表
          allFields: [], //工作流所有附加字段列表
          userFields: [], //工作流所有人员字段
        },
        3: {
          defs: [], // 工作流 table
          transfers: [], // 工作流状态流转
          roles: [], // 工作流角色权限列表
          allFields: [], //工作流所有附加字段列表
          userFields: [], //工作流所有人员字段
        },
      },

      configStages: [], // 配置状态流映射
      tmplId: 1, // 当前模板 id ，不能确定是不是等同于 activeType
      asPublic: false, // 当前工作流是否已经公开
      loading: false,
      cloneWorkFlowModalStatus: false, // 复制工作流是否展示 dialog
      addRuleModalStatus: false, // 添加/编辑流转自定义规则是否展示 dialog
      currentEditorRuleName: '', //当前编辑流转自定义规则的名字
    }
  },
  computed: {
    // 权限 - 是否可以更新
    auth() {
      return this.$authFunction(
        'FUNC_COOP_STATUS_CONFIG_UPDATE',
        3,
        this.projectId,
      )
    },
    // 表格数据
    tableData() {
      const data = cloneDeep(this.workFlowInfo[this.activeType].defs)

      // 需求工作流以及任务工作流处理状态阶段
      if ([1, 2].includes(this.activeType) && data.length && this.stages) {
        data.forEach(item => {
          const stageItem = this.stages.find(stage => stage.name === item.stage)

          if (stageItem) {
            item.stageDesc = stageItem.desc
          } else {
            item.stageDesc = item.stage
          }
        })
      }

      return data
    },
    // tooltip文字
    stageTooltip() {
      if (this.activeType === 1) {
        return this.requirementTooltip
      } else if (this.activeType === 2) {
        return this.taskTooltip
      } else {
        return ''
      }
    },
    // 状态阶段
    stages() {
      if (this.activeType === 1) {
        return this.configStages['requirementStage']
      } else if (this.activeType === 2) {
        return this.configStages['taskStage']
      } else {
        return []
      }
    },
    // 权限 - 是否可以删除
    deleteAble() {
      return this.$authFunction(
        'FUNC_COOP_STATUS_CONFIG_DELETE',
        3,
        this.projectId,
      )
    },
  },

  watch: {
    activeType() {
      this.$nextTick(this.init)
    },
  },

  mounted() {
    this.getConfigStages()
    this.init()
  },
  methods: {
    init() {
      this.getWorkFlowInfo()
    },
    // 获取状态阶段配置
    getConfigStages() {
      configStages().then(res => {
        if (res.status === 200) {
          this.configStages = res.data
        }
      })
    },
    // 起始状态可设置禁用
    initStatusDisable(scope) {
      return (
        !this.auth ||
        (this.activeType === 1 &&
          ['REQT_ONLINE', 'REQT_CANCELED'].includes(scope.row.stage)) ||
        (this.activeType === 2 &&
          ['TASK_COMPLETED', 'TASK_CANCELED'].includes(scope.row.stage))
      )
    },
    // 结束状态可设置禁用
    endStatusDisable(scope) {
      return (
        !this.auth ||
        // 需求工作流选择“已上线”阶段，系统默认勾选结束态，但可取消勾选结束态。系统需判断整个工作流里面需至少存在一个结束态，否则不能取消结束态勾选，并给与用户提示。
        // (this.activeType === 1 && ['REQT_ONLINE'].includes(scope.row.stage)) ||
        (this.activeType === 2 && ['TASK_COMPLETED'].includes(scope.row.stage))
      )
    },
    // 需求工作流选择状态阶段
    handleChoiceStage(row) {
      this.$set(row, '_setStage', 1)
      this.$nextTick(() => {
        this.$refs.stageSelect.focus()
        this.$refs.stageSelect.visible = true
      })
    },
    // 工作阶段改变
    stageChange(stage, data) {
      // 更新状态阶段
      // const stageItem = this.stages.find(item => item.name === stage)

      // 特殊阶段默认值映射，其中需求工作流中，需求池对应起始状态，已完成对应结束状态,任务工作流中未开始对应起始状态，已上线对应结束状态
      if (data.isnew) {
        data.init = false
        data.end = false
        data.cancel = false
      }

      ;['REQT_POOL', 'TASK_NOT_START'].includes(stage) && (data.init = true)
      ;['REQT_ONLINE', 'TASK_COMPLETED'].includes(stage) && (data.end = true)

      if (!data.isnew) {
        this.updateStatu({
          stage,
          tmplId: data.tmplId,
          statusId: data.statusId,
          init: data.init,
          end: data.end,
          cancel: data.cancel,
        })
      }
    },
    // 获取工作流信息
    async getWorkFlowInfo() {
      this.loading = true
      let result = {}
      try {
        result = await queryWorkStautsFow({
          projectId: +this.projectId,
          workItemType: +this.activeType,
        })
      } catch (e) {
        console.error(e)
      }
      this.loading = false
      if (result.status === 200) {
        this.workFlowInfo[this.activeType] = {
          defs: result.data.defs,
          transfers: result.data.transfers,
          roles: result.data.roles,
          allFields: result.data.allFields,
          userFields: result.data.userFields,
        }

        this.tmplId = result.data.tmplId
        this.asPublic = result.data.asPublic
      } else {
        this.workFlowInfo[this.activeType] = {
          defs: [],
          transfers: {},
          roles: [],
          allFields: [],
          userFields: [],
        }
      }
    },
    // 新加工作流程 - 点击新加工作流程
    statusAddClickHandle() {
      const isExistNewItem =
        this.workFlowInfo[this.activeType].defs.filter(item => item.isnew)
          .length > 0
      if (isExistNewItem) {
        this.$message({
          message: i18n.t('一次只可新增一条数据'),
          type: 'error',
        })
        return
      }

      const defaultItem = {
        name: '',
        preset: false,
        color: '#038fec',
        init: false,
        end: false,
        cancel: false,
        order: 0,
        isnew: true,
      }

      // 需求工作流以及任务工作流中新增stage状态阶段字段
      ;[1, 2].includes(this.activeType) && (defaultItem.stage = '')

      this.workFlowInfo[this.activeType].defs.push(defaultItem)
    },
    // 新加工作流程 - 点击保存
    async newStatusRecordSaveHandle(info) {
      if (info.name.trim().length === 0) {
        this.$message({ message: i18n.t('名称不能为空'), type: 'error' })
        return false
      }
      if (info.name.trim().length > 10) {
        this.$message({
          message: i18n.t('名称字数不能超过10个'),
          type: 'error',
        })
        return false
      }

      // 需求工作流以及任务工作流处理状态阶段，判断状态阶段
      if ([1, 2].includes(this.activeType) && !info.stage) {
        this.$message.error(i18n.t('请选择状态阶段'))

        return false
      }

      delete info.isnew
      delete info.preset
      this.loading = true
      let result = {}
      try {
        result = await workStautsFowStatuCreate({
          ...info,
          order: +info.order,
          projectId: this.projectId,
          tmplId: this.tmplId,
        })
      } catch (e) {
        console.error(e)
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('新增成功'),
          type: 'success',
        })
      } else {
        this.$message({
          message: result.msg || i18n.t('新增失败'),
          type: 'error',
        })
      }
      this.getWorkFlowInfo()
    },
    // 新加工作流程 - 点击取消
    newStatusRecordCancelHandle() {
      this.workFlowInfo[this.activeType].defs = this.workFlowInfo[
        this.activeType
      ].defs.filter(item => !item.isnew)
      this.getWorkFlowInfo()
    },
    // 更新工作流程 - 取色器点击取值
    colorChooseerHandle(color, info) {
      if (!info.isnew) {
        this.updateStatu({
          color,
          tmplId: info.tmplId,
          statusId: info.statusId,
        })
      }
    },
    // 新增/更新工作流程 - 起始状态
    initRadioHandle(info) {
      if (!this.auth) {
        return false
      }
      this.tableData.forEach(item => {
        if (item.statusId === info.statusId) {
          item.init = true
        } else {
          item.init = false
        }
      })
      if (!info.isnew) {
        this.updateStatu({
          init: true,
          tmplId: info.tmplId,
          statusId: info.statusId,
        })
      }
    },
    // 新增/更新工作流程 - 结束状态
    endCheckboxHandle(value, info) {
      if (!this.auth) {
        return false
      }
      if (!info.isnew) {
        this.updateStatu({
          end: value,
          tmplId: info.tmplId,
          statusId: info.statusId,
        })
      }
    },
    // 新增/更新工作流程 - 取消状态 - 单选
    cancelRadioHandle(info) {
      if (!this.auth) {
        return false
      }
      this.tableData.forEach(item => {
        if (item.statusId === info.statusId) {
          item.cancel = true
        } else {
          item.cancel = false
        }
      })
      if (!info.isnew) {
        this.updateStatu({
          cancel: true,
          tmplId: info.tmplId,
          statusId: info.statusId,
        })
      }
    },
    // 新增/更新工作流程 - 取消状态 - 多选
    cancelCheckboxHandle(value, info) {
      if (!this.auth) {
        return false
      }
      if (!info.isnew) {
        this.updateStatu({
          cancel: value,
          tmplId: info.tmplId,
          statusId: info.statusId,
        })
      }
    },
    // 更新工作流程 - 更新数据
    async updateStatu(info = {}) {
      let result = {}
      if (info?.name?.trim().length > 10) {
        this.$message({
          message: i18n.t('名称字数不能超过10个'),
          type: 'error',
        })
        return false
      }
      this.loading = true
      try {
        result = await workStautsFowStatuUpdate({
          ...info,
          projectId: this.projectId,
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
      } else {
        result.msg &&
          this.$message({
            showClose: true,
            message: result.msg,
            type: 'error',
          })
      }
      this.getWorkFlowInfo()
    },
    // 删除工作流程
    async deleteStatu(info = {}) {
      const deleteResult = await this.confirmBeforeOperate(
        `${i18n.t('确认删除状态')}-${info.name}`,
      )

      if (!deleteResult) {
        return false
      }
      this.loading = true
      let result = {}
      try {
        result = await workStautsFowStatuDelete({
          ...info,
          projectId: this.projectId,
        })
      } catch (_) {
        result = _
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('删除成功'),
          type: 'success',
        })
      } else {
        this.$message({
          message: result.msg || i18n.t('删除失败'),
          type: 'error',
        })
      }
      this.getWorkFlowInfo()
    },
    // 操作前的确认
    async confirmBeforeOperate(text = '') {
      let result = null
      try {
        result = await this.$confirm(text, {
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        })
      } catch (_) {
        result = false
      }
      return result
    },
    // 流转状态 - 新增
    async addItem(target, source) {
      this.loading = true
      let result = {}
      try {
        result = await workStautsFowRuleCreate({
          projectId: this.projectId,
          tmplId: source.tmplId,
          fromId: source.statusId,
          toId: target.statusId,
        })
      } catch (e) {
        console.error(e)
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('新增成功'),
          type: 'success',
        })
      } else {
        this.$message({
          message: result.msg || i18n.t('新增失败'),
          type: 'error',
        })
      }
      document.documentElement.click()
      this.getWorkFlowInfo()
    },
    // 流转状态 - 删除
    async removeItem(target, source) {
      this.loading = true
      let result = {}
      try {
        result = await workStautsFowRuleDelete({
          projectId: this.projectId,
          tmplId: source.tmplId,
          fromId: source.statusId,
          toId: target.statusId,
        })
      } catch (_) {
        result = _
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('删除成功'),
          type: 'success',
        })
      } else {
        this.$message({
          message: result.msg || i18n.t('删除失败'),
          type: 'error',
        })
      }
      document.documentElement.click()
      this.getWorkFlowInfo()
    },
    // 切换顶部 header
    headerCardChange(activeType) {
      this.activeType = activeType
    },
    // 复制工作流 - 开/关 dialog
    cloneDialogHandle() {
      this.cloneWorkFlowModalStatus = !this.cloneWorkFlowModalStatus
    },
    // 复制工作流 - 成功回调
    workflowCloneSuccess() {
      this.getWorkFlowInfo()
      this.cloneDialogHandle()
    },
    // 工作流公开/关闭公开, 增加 try catch 是为了处理服务器 500 错误，以后都增加一个
    async setPublicClickHandle() {
      const msg = this.asPublic ? i18n.t('取消') : i18n.t('设置')
      const confirmResult = await this.confirmBeforeOperate(
        `${i18n.t('你确定')}${msg}${i18n.t('当前工作流公开')}`,
      )

      if (!confirmResult) {
        return false
      }
      this.loading = true
      let result = {}
      try {
        result = await await workStautsFowFlowPublic({
          projectId: this.projectId,
          tmplId: this.tmplId,
          workItemType: this.activeType,
          toPublic: !this.asPublic,
        })
      } catch (e) {
        console.error(e)
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || msg + i18n.t('成功'),
          type: 'success',
        })

        this.asPublic = !this.asPublic
      } else {
        this.$message({
          message: result.msg || msg + i18n.t('失败'),
          type: 'error',
        })
      }
    },

    // 自定义工作流编辑
    editorRule(info) {
      this.addRuleModalStatus = true
      this.currentEditorRuleName = info.def.name
    },
    //  自定义工作流成功
    workflowRuleSuccess() {
      this.addRuleModalStatus = false
      this.getWorkFlowInfo()
    },
  },
}
</script>
<style lang="scss" scoped>
.requirement-stage {
  display: inline-block;
  padding: 1px 3px;
  border: 1px solid transparent;

  &:hover {
    cursor: pointer;
    border: 1px solid #ccc;
  }
}

// 头部
.flow-header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  margin: 10px 0 20px;
  .flow-header-item {
    font-size: $font-size-large;
    color: $color-font-inactive-common;
    height: 70px;
    line-height: 70px;
    width: 200px;
    text-align: center;
    cursor: pointer;
    border: 1px solid #dcdfe6;
    padding: 8px 15px;
    border-radius: 4px;
    background: #e8e8e8;
  }
  .flow-header-item-active {
    border: 1px solid $--color-primary;
    background: #fff;
  }
}
// 表格
.flow-table-box {
  .flow-table-header {
    margin: 10px 0;
  }
  .flow-table-body {
    .flow-table-body-coloritem {
      position: relative;
      top: 2px;
    }
  }
  .operatebtn {
    cursor: pointer;
    color: $color-font-active-common;
  }
}
// 流转状态设置
.flow-staturule-box {
  margin-top: 20px;
  .flow-staturule-box-header {
    // height: 40px;
    // line-height: 40px;
    font-size: $font-size-medium-x;
    position: relative;
    display: flex;
    align-items: flex-end;
  }
}
</style>
