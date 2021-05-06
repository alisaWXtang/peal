<template>
  <el-dialog
    :visible="cloneWorkFlowModalStatus"
    :title="$t('复制工作流')"
    custom-class="dialog-noanimate"
    :show-close="false"
    width="1200px"
    :modal-append-to-body="false"
  >
    <div
      v-loading="loadingObject.getting"
      class="clone-content-box"
      element-loading-text="loading"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255,255,255, 0.5)"
    >
      <div class="left-content">
        <el-input
          v-model="localfiltername"
          :placeholder="$t('请输入项目名称')"
        ></el-input>
        <el-radio-group
          v-model="filterInfo.type"
          class="filter-type"
          style="width: 100%;"
          @change="getProjectList"
        >
          <el-radio-button label="PROJECT" class="el-radio-button-50">{{
            $t('我的项目')
          }}</el-radio-button>
          <el-radio-button label="PUBLIC" class="el-radio-button-50">{{
            $t('公开的项目')
          }}</el-radio-button>
        </el-radio-group>
        <select-list
          :list-data="projectList"
          :active-obj="activeProject"
          :click-callback="setActiveItem"
        ></select-list>
      </div>
      <div class="right-content">
        <p>{{ $t('工作流预览') }}</p>
        <template v-for="item in workFlowInfo.transfers">
          <work-flow-setting-rule-item
            :key="item.def.statusId"
            :obj-data="item"
            :next-data-poor="workFlowInfo.defs"
            :deletable="false"
            :project-id="projectId"
          ></work-flow-setting-rule-item>
        </template>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="default" @click="closeModal">{{ $t('取消') }}</el-button>
      <el-button
        type="primary"
        :disabled="loadingObject.posting"
        @click="flowCopy"
        >{{ loadingObject.posting ? '应用中...' : $t('一键使用') }}</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 工作流复制组件
 * @desc 每次打开 modal 时会恢复初始状态
 * @author heyunjiang
 * @date 2019.6.24
 */
import SelectList from '@/components/select-list'
import WorkFlowSettingRuleItem from './WorkFlowSettingRuleItem'
import {
  queryReplicable,
  queryPreview,
  flowCopy2,
} from '@/service/work-status-flow'

export default {
  name: 'WorkFlowClone',
  components: {
    WorkFlowSettingRuleItem,
    SelectList,
  },

  mixins: [],
  props: {
    cloneWorkFlowModalStatus: {
      type: Boolean,
      required: true,
    },

    closeModal: {
      type: Function,
      required: true,
    },

    successCallback: {
      type: Function,
      required: false,
      default: () => {},
      desc: '复制成功回调',
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
  },

  data() {
    return {
      loadingObject: {
        getting: false,
        posting: false,
      },

      localfiltername: '', // 本地过滤
      // 过滤器
      filterInfo: {
        name: '', // 项目名称
        type: 'PROJECT', // 项目类型 PROJECT->我的项目 PUBLIC->公开的项目
      },
      // 项目列表 - 左侧
      workFlowProjectList: [],
      activeProject: { key: -1, value: null },
      // 工作流详情 - 右侧
      workFlowInfo: {
        defs: [],
        transfers: [],
      },
    }
  },
  computed: {
    projectList() {
      if (this.localfiltername.trim().length === 0) {
        return this.workFlowProjectList
      }
      return this.workFlowProjectList.filter(
        item => item.value.indexOf(this.localfiltername.trim()) !== -1,
      )
    },
  },

  watch: {
    // 当打开 modal 的时候，需要获取数据 - data cache
    cloneWorkFlowModalStatus(value) {
      if (value && this.workFlowProjectList.length === 0) {
        this.getProjectList()
      } else {
        this.resetInfo()
      }
    },
    // 当切换 type 的时候，需要清空数据
    workItemType() {
      this.workFlowProjectList = []
      this.filterInfo = {
        name: '',
        type: 'PROJECT',
      }

      this.activeProject = {
        key: -1,
        value: null,
      }
    },
    // 当切换 activeProject 时，需要更新右侧数据
    activeProject() {
      this.getWorkFlowData()
    },
  },

  mounted() {},
  methods: {
    // 重置基本信息
    resetInfo() {
      this.localfiltername = ''
    },
    // 获取可复制工作流项目列表数据
    async getProjectList() {
      this.loadingObject.getting = true
      const result = await queryReplicable({
        projectId: +this.projectId,
        workItemType: +this.workItemType || 1,
        ...this.filterInfo,
      })

      if (result.status === 200) {
        const dataarray = result.data.map(item => {
          return {
            key: item.projectId,
            value: item.projectName,
            ...item,
          }
        })
        this.workFlowProjectList = dataarray
        if (this.activeProject.key < 0 && dataarray.length > 0) {
          this.setActiveItem(dataarray[0])
        }
      } else {
        this.workFlowProjectList = []
      }
      this.loadingObject.getting = false
    },
    // 设置当前活跃工作流
    setActiveItem(item) {
      this.activeProject = { ...item }
    },
    // 获取流程数据
    async getWorkFlowData() {
      if (this.activeProject.key < 0) {
        return
      }
      this.loadingObject.getting = true
      const result = await queryPreview({
        ...this.activeProject,
      })

      this.loadingObject.getting = false
      if (result.status === 200) {
        this.workFlowInfo = {
          defs: result.data.defs,
          transfers: result.data.transfers,
        }
      } else {
        this.workFlowInfo = {
          defs: [],
          transfers: [],
        }
      }
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
    // 复制工作流
    async flowCopy() {
      const confirmResult = await this.confirmBeforeOperate(
        i18n.t(`确认应用当前工作流？`),
      )

      if (!confirmResult) {
        return false
      }
      if (this.activeProject.key < 0) {
        return
      }
      this.loadingObject.posting = true
      const result = await flowCopy2({
        workItemType: +this.workItemType,
        fromTmplId: +this.activeProject.tmplId,
        fromProjectId: +this.activeProject.projectId,
        toProjectId: +this.projectId,
        toTmplId: +this.tmplId,
      })

      this.loadingObject.posting = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('应用成功'),
          type: 'success',
        })

        this.successCallback && this.successCallback()
      } else {
        // this.$message({
        //   message: result.msg || '应用失败',
        //   type: 'error'
        // })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.clone-content-box {
  font-size: 0;
  width: 100%;
  background: $color-background-light-common;
  padding: 10px;
  box-sizing: border-box;
}
.left-content,
.right-content {
  display: inline-block;
  vertical-align: top;
  font-size: 14px;
  box-sizing: border-box;
  padding: 10px;
  // border: 1px solid $color-border-bar;
  background: white;
}
.left-content {
  width: 260px;
  .filter-type {
    margin: 10px 0;
  }
}
.right-content {
  width: calc(100% - 270px);
  margin-left: 10px;
}
</style>
