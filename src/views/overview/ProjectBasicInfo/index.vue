<template>
  <div
    class="project-info-wrap"
    :class="{ 'project-info-wrap-english': $isEnglish() }"
  >
    <div class="overview-header">
      <div class="title" :title="projectName">{{ projectName }}</div>
      <div v-if="editProjectInfoPowerInfoManage" @click="editProjectBasicInfo">
        <i class="iconfont icon-bianjikapian overview-icon"></i>
      </div>
    </div>
    <div class="project-risk-scrollar public-wrap">
      <div class="project-wrap">
        <div class="basic-info-wrap">
          <div class="list-item">
            <span class="title">{{ $t('负责人') }}：</span>
            <span class="value">{{
              projectBasicInfoObj.managerList | filterManagerList
            }}</span>
          </div>
          <div class="list-item">
            <span class="title">{{ $t('项目目标') }}：</span>
            <span class="value">{{ projectBasicInfoObj.target }}</span>
          </div>
          <div class="list-item">
            <span class="title">{{ $t('项目描述') }}：</span>
            <span class="value">{{ projectBasicInfoObj.description }}</span>
          </div>
        </div>
      </div>
      <co-divider></co-divider>
      <div class="risk-wrap">
        <div class="list-item add-risk-box">
          <div class="project-status-title">
            <div class="title">{{ $t('项目状态') }}：</div>
            <!-- 项目状态没有权限 -->
            <div
              v-if="!editProjectStatusPowerINfoManage"
              :style="{ background: projectBasicInfoObj.background }"
              class="dropdown-title cursor-text"
            >
              <span>{{ projectBasicInfoObj.statusDesc }}</span>
            </div>
            <!-- 项目状态 有权限-->
            <co-dropdown
              v-else
              size="medium"
              placement="bottom"
              trigger="click"
              @command="statusChangeHandle"
            >
              <div
                :style="{ background: projectBasicInfoObj.background }"
                class="dropdown-title"
              >
                <span>{{ projectBasicInfoObj.statusDesc }}</span>
                <i class="co-icon-arrow-down arrow-down-icon"></i>
              </div>
              <co-dropdown-menu slot="dropdown" class="dropdown-mune-width">
                <co-dropdown-item
                  v-for="item in projectStatusList"
                  :key="item.status"
                  :command="item"
                  >{{ item.desc }}</co-dropdown-item
                >
              </co-dropdown-menu>
            </co-dropdown>
          </div>

          <div
            v-if="createRiskPowerINfoManage"
            class="add-risk"
            @click="createRisk"
          >
            <i class="iconfont icon-tianjiakapian"></i>
            <span>{{ $t('新建风险') }}</span>
          </div>
        </div>
        <div class="list-item">
          <div class="title">{{ $t('项目风险') }}：</div>
          <!-- <div
            v-if="createRiskPowerINfoManage"
            class="add-risk"
            @click="createRisk"
          >
            <i class="co-icon-add-circle"></i>
            <span>{{ $t('新建风险') }}</span>
          </div> -->
          <div class="risk-list-box">
            <co-table
              :data="projectRiskList"
              :show-header="false"
              class="risk-table multiple-table"
              style="width: 100%"
            >
              <co-table-column width="62" class-name="status-column">
                <!-- 风险状态 -->
                <template slot-scope="scope">
                  <!-- 没有权限时 -->
                  <div
                    v-if="!editRiskPowerINfoManage"
                    :style="{ background: scope.row.background }"
                    class="dropdown-title cursor-text"
                  >
                    <span :style="{ color: scope.row.fontColor }">{{
                      scope.row.statusDesc
                    }}</span>
                  </div>
                  <!-- 有权限时 -->
                  <co-dropdown
                    v-else
                    size="medium"
                    placement="bottom"
                    trigger="click"
                    @command="riskStatusChangeHandle"
                  >
                    <div
                      :style="{ background: scope.row.background }"
                      class="dropdown-title"
                    >
                      <span :style="{ color: scope.row.fontColor }">{{
                        scope.row.statusDesc
                      }}</span>
                    </div>
                    <co-dropdown-menu
                      slot="dropdown"
                      class="dropdown-mune-width"
                    >
                      <co-dropdown-item
                        v-for="item in riskStatus"
                        :key="item.status"
                        :command="riskCommandValue(item, scope.row)"
                        >{{ item.desc }}</co-dropdown-item
                      >
                    </co-dropdown-menu>
                  </co-dropdown>
                </template>
              </co-table-column>
              <!-- 风险优先级 -->
              <co-table-column width="60" class-name="priority-column">
                <template slot-scope="scope">
                  <!-- 没有权限时 -->
                  <span
                    v-if="!editRiskPowerINfoManage"
                    class="statusbox-list-common cursor-text"
                    :style="{ '--color': scope.row.priority.color }"
                    >{{ scope.row.priority.literal }}
                  </span>
                  <!-- 有权限时 -->
                  <span
                    v-else
                    class="statusbox-list-common"
                    :style="{ '--color': scope.row.priority.color }"
                    @click="priorityClick($event, scope.row)"
                    >{{ scope.row.priority.literal }}</span
                  >
                </template>
              </co-table-column>
              <!-- 风险标题 -->
              <co-table-column :show-overflow-tooltip="true">
                <template slot-scope="scope">
                  <div class="title-box">
                    <div class="title" @click="editRiskHandle(scope.row)">
                      {{ scope.row.title }}
                    </div>
                    <div
                      v-if="deleteRiskPowerINfoManage"
                      class="delete overview-operation-public"
                    >
                      <i
                        class="co-icon-delete icon-delete"
                        @click="deleteRisk(scope.row)"
                      ></i>
                    </div>
                  </div>
                </template>
              </co-table-column>
            </co-table>
          </div>
        </div>
      </div>
      <GlobalSelect v-bind="SelectPriorityProps"></GlobalSelect>
      <RiskAddAndEditDialog
        v-if="riskDialogData.riskVisible"
        :type="riskDialogData.type"
        :risk-visible="riskDialogData.riskVisible"
        :risk-detail-info="riskDetailInfo"
        @beforeClose="riskDialogBeforeClose"
      ></RiskAddAndEditDialog>

      <project-creat-or-edit-dialog
        v-show="projecInfoDialogVisible"
        project-flag="edit"
        :edit-product-info="projectInfoDialogInfo"
        :dialog-visible.sync="projecInfoDialogVisible"
        :edit-project-success="editProjectSuccess"
      ></project-creat-or-edit-dialog>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 项目基本信息
 * @desc
 * @author wangling
 * @date 2020/04/08
 */
// import FieldEdit from '@/pages/tool/FieldEdit'
import GlobalSelect from '@/components/field-edit/GlobalSelect'
import ProjectCreatOrEditDialog from '@/views/project-list/ProductCreateOrEditDialog'
import RiskAddAndEditDialog from './riskAddAndEditDialog'

export default {
  name: 'ProjectBasicInfo',
  components: {
    // FieldEdit,
    GlobalSelect,
    RiskAddAndEditDialog,
    ProjectCreatOrEditDialog,
  },

  filters: {
    filterManagerList(list) {
      let displayManager = []
      list &&
        list.forEach(item => {
          displayManager.push(`${item.userName}`)
        })
      return displayManager.join(',')
    },
  },

  mixins: [],
  props: {},

  data() {
    return {
      projectId: this.$getUrlParams().projectId,
      SelectPriorityProps: {
        //优先级属性
        show: false,
        colorType: 'bg',
        initValue: '',
        selectValue: [],
        target: document.documentElement,
        onChange: this.priorityChange,
        onOtherClose: this.prioritytSelectClose,
      },

      currentriskInfo: {}, //点击优先级以及状态时保存当前的风险项
      detailriskInfo: {}, //点击标题时保存的风险项
      projectBasicInfoObj: {
        //项目基本信息
        display: {
          managerList: [],
        },
      },

      riskDialogData: {
        //新增编辑弹窗数据
        type: 'create',
        riskVisible: false,
      },

      riskDetailInfo: {}, //打开弹窗 编辑查看时数据
      projectInfoDialogInfo: {}, //修改项目基本信息弹窗数据
      projecInfoDialogVisible: false, //编辑项目信息弹窗状态
    }
  },
  computed: {
    // 获取项目名称
    projectName() {
      return this.$store.state.projectName
    },
    // 项目基本信息对象
    projectBasicInfo() {
      return this.$store.state.projectInfoAndRisk.projectBasicInfo
    },
    // 优先级列表
    priorityList() {
      return this.$store.state.projectInfoAndRisk.priorityList
    },
    // 风险列表
    projectRiskList() {
      return this.$store.state.projectInfoAndRisk.projectRiskList
    },
    // 风险状态列表
    riskStatus() {
      return this.$store.state.projectInfoAndRisk.statusOptions.riskStatus
    },
    // 项目状态列表
    projectStatusList() {
      return this.$store.state.projectInfoAndRisk.statusOptions.projectStatus
    },
    // 创建风险权限
    createRiskPowerINfoManage() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_OVERVIEW_CREATE_RISK',
        3,
        this.projectId,
      )
    },
    // 编辑风险权限
    editRiskPowerINfoManage() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_OVERVIEW_UPDATE_RISK',
        3,
        this.projectId,
      )
    },
    //删除风险权限
    deleteRiskPowerINfoManage() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_OVERVIEW_DELETE_RISK',
        3,
        this.projectId,
      )
    },
    //项目状态编辑
    editProjectStatusPowerINfoManage() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_OVERVIEW_UPDATE_PROJECT',
        3,
        this.projectId,
      )
    },
    // 项目编辑权限
    editProjectInfoPowerInfoManage() {
      return this.$authFunction('FUNC_COOP_PROJECT_UPDATE', 3, this.projectId)
    },
    selectedWorkItemType() {
      return this.$store.state.projectOverviewDynamic.projectDynamicInfo
        .workItemType
    },
  },

  watch: {
    projectBasicInfo(newVal) {
      this.projectBasicInfoObj = newVal
    },
  },

  created() {
    this.getProjectBasicInfo()
    this.$store.dispatch('queryRiskList', {
      projectId: this.projectId,
    })
  },
  mounted() {},
  methods: {
    // 编辑项目信息
    editProjectBasicInfo() {
      this.projectInfoDialogInfo = {
        ...this.projectBasicInfoObj,
        adminUsers: this.projectBasicInfoObj.managerList,
        editProjectId: this.projectBasicInfoObj.id,
      }

      this.projecInfoDialogVisible = true
    },
    // 发送请求 获取项目基本信息
    getProjectBasicInfo() {
      return this.$store.dispatch('getProjectQueryInfo', {
        id: this.projectId,
      })
    },
    // 项目状态改变 发生更新请求
    statusChangeHandle(info) {
      const endStatusNum = 2
      if (this.projectBasicInfoObj.status === info.status) {
        return
      }

      // 如果是已结束时
      if (info.status === endStatusNum) {
        this.$confirm(
          `${i18n.t('确认结束项目')}-${this.projectName}-${i18n.t(
            '吗',
          )}？${i18n.t('结束项目后不允许再创建需求、任务、迭代、缺陷等功能')}`,
          {
            confirmButtonText: i18n.t('确定'),
            cancelButtonText: i18n.t('取消'),
            type: 'warning',
          },
        )
          .then(() => {
            this.$store
              .dispatch('updateProjectInfo', {
                status: info.status,
                id: +this.projectId,
              })
              .then(() => {
                // 项目动态随之更新
                this.$store.dispatch('getProjectDynamic', {
                  projectId: this.projectId,
                  workItemType: this.selectedWorkItemType,
                  isQuery: true,
                })
              })
          })
          .catch(() => {})
      } else {
        this.$store
          .dispatch('updateProjectInfo', {
            status: info.status,
            id: +this.projectId,
          })
          .then(() => {
            // 项目动态随之更新
            this.$store.dispatch('getProjectDynamic', {
              projectId: this.projectId,
              workItemType: this.selectedWorkItemType,
              isQuery: true,
            })
          })
      }
    },
    // 编辑或查看风险弹窗,有权限去编辑 无权限去查看
    editRiskHandle(row) {
      const riskPower = this.editRiskPowerINfoManage
      this.riskDialogData.type = riskPower ? 'edit' : 'detail'
      this.riskDetailInfo = {
        ...row,
        priority: row.priority.priority,
        displayUserName: `${row.assignUserName}(${row.assignUser})`,
      }

      this.riskDialogData.riskVisible = true
    },
    // 新增风险 打开弹窗
    createRisk() {
      this.riskDialogData.type = 'create'
      this.riskDetailInfo = {}
      this.riskDialogData.riskVisible = true
    },
    // 更新风险请求
    async updateRiskRequset(obj) {
      await this.$store.dispatch('updateRisk', {
        id: this.currentriskInfo.id,
        projectId: this.projectId,
        description: this.currentriskInfo.description,
        ...obj,
      })

      // 项目动态随之更新
      this.$store.dispatch('getProjectDynamic', {
        projectId: this.projectId,
        workItemType: this.selectedWorkItemType,
        isQuery: true,
      })
    },
    // 关闭弹窗
    riskDialogBeforeClose() {
      this.riskDialogData.riskVisible = false
    },
    // 更新请求 优先级 点击选项时
    priorityChange(priority) {
      if (this.currentriskInfo.priority.priority === priority) {
        return
      }
      this.updateRiskRequset({ priority })
    },
    // 优先级 点击外面关闭
    prioritytSelectClose() {
      this.SelectPriorityProps.show = false
      this.SelectPriorityProps.target = document.documentElement
    },
    // 优先级 点开弹窗
    priorityClick(e, info) {
      this.SelectPriorityProps.target = e.target
      this.SelectPriorityProps.initValue = info.priority.priority
      this.SelectPriorityProps.selectValue = this.priorityList
      this.currentriskInfo = info
      this.SelectPriorityProps.show = true
    },
    // 更新请求 风险状态改变
    riskStatusChangeHandle(obj) {
      const { command, row } = obj
      this.currentriskInfo = row
      // 选中当前值时，不作处理
      if (command.status === this.currentriskInfo.status) {
        return
      }
      this.updateRiskRequset({ status: command.status })
    },
    // 风险状态 当下拉框改变传多个值
    riskCommandValue(command, row) {
      return {
        command,
        row,
      }
    },
    // 删除风险
    deleteRisk(row) {
      this.$confirm(i18n.t('是否要删除该风险?'), {
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      })
        .then(() => {
          this.$store
            .dispatch('deleteRisk', {
              id: row.id,
              projectId: this.projectId,
            })
            .then(() => {
              // 项目动态随之更新
              this.$store.dispatch('getProjectDynamic', {
                projectId: this.projectId,
                workItemType: this.selectedWorkItemType,
                isQuery: true,
              })
            })
        })
        .catch(() => {})
    },
    // 编辑项目成功
    async editProjectSuccess() {
      await this.getProjectBasicInfo()
      this.$store.dispatch('modifyProjectName', {
        projectName: this.projectBasicInfoObj.name,
      })

      this.$store.dispatch('getProjectListAll')
      this.projecInfoDialogVisible = false
      // 项目动态随之更新
      this.$store.dispatch('getProjectDynamic', {
        projectId: this.projectId,
        workItemType: this.selectedWorkItemType,
        isQuery: true,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
$title-width: 70px;
.project-risk-scrollar {
  width: 100%;
  // min-height: 340px;
  // max-height: 440px;
  overflow: auto;
  padding: 24px 0;
  box-sizing: border-box;
}
.overview-header {
  .title {
    flex: 1;
    white-space: nowrap;
    width: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-right: 20px;
  }
}
.list-item {
  // margin-bottom: 10px;
  line-height: 28px;

  // .title {
  // }

  // 项目状态左侧
  .project-status-title {
    display: flex;
    align-items: center;

    .el-dropdown {
      padding-left: 8px;
    }
  }

  // 风险列表
  .risk-list-box {
    flex: 1;
  }
}
.list-item .title,
.risk-list .status {
  width: $title-width;
  text-align: left;
  white-space: nowrap;
  margin-right: 6px;
}

// 项目基本信息样式
.basic-info-wrap {
  padding: 0 12px;
  .list-item {
    display: flex;
    .title {
      display: inline-block;
    }
    .value {
      word-break: break-all;
    }
  }
}
.el-divider--horizontal {
  margin: 16px 0;
}
// 风险相关样式
.risk-wrap {
  padding: 0 12px;
  // border-top: 1px solid #e5e4e2;
  .list-item {
    display: flex;
    align-items: flex-start;
    .select-box {
      width: 100px;
    }
  }
  .add-risk-box {
    justify-content: space-between;
    margin-bottom: 16px;

    .add-risk {
      color: $--color-primary;
      cursor: pointer;

      .iconfont {
        margin-right: 6px;
        font-size: 14px;
      }
    }
  }
  .title-box {
    display: flex;
    flex: 1;
    align-items: flex-end;
    color: #606266;
    &:hover {
      cursor: pointer;
      .icon-delete {
        display: inline !important;
      }
    }
    .title {
      flex: 1;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 0;
      margin-right: 5px;
    }
    .delete {
      width: 20px;
      .icon-delete {
        display: none;
        &:hover {
          color: $--color-primary;
        }
      }
    }
  }
  .dropdown-title {
    font-size: 14px;
    padding: 0 9px;
    height: 28px;
    line-height: 28px;
    border-radius: 4px;
    color: #fff;
    &:hover {
      cursor: pointer;
    }
    .arrow-down-icon {
      margin-left: 5px;
    }
  }
  .statusbox-list-common:hover {
    cursor: pointer;
  }
  // 去掉表格边框
  /deep/.risk-table.el-table::before {
    height: 0;
  }
  /deep/.risk-table.el-table {
    .el-table__empty-block {
      display: none;
    }
    td {
      padding: 4px 0;
      text-align: left;
    }
    .status-column {
      padding-left: 8px;
    }
    .priority-column .statusbox-list-common {
      display: inline;
    }
    td {
      border: none;
    }
    .cell {
      padding-left: 0;
      padding-right: 0;
    }
  }
}

//下拉框宽度
.dropdown-mune-width {
  min-width: 110px;
  /deep/.el-dropdown-menu__item {
    text-align: center;
  }
}
.icon-gaixie {
  font-weight: bolder;
}
.project-info-wrap-english .list-item .title {
  width: 130px;
}
</style>
