<template>
  <div id="project-setting" class="content-outer-box personal-management">
    <div class="x-arD">
      <div class="white-box table-outer-box">
        <el-tabs v-model="currentTab">
          <!--          <el-tab-pane :label="$t('关联业务管理')" name="biz">-->
          <!--            &lt;!&ndash; 关联业务管理 &ndash;&gt;-->
          <!--            <div class="tab-minheight">-->
          <!--              <div style="height:50px;">-->
          <!--                <span-->
          <!--                  class="tit fl"-->
          <!--                  style="font-size: 16px;font-weight:900;margin-top: 12px;"-->
          <!--                  >{{ $t('关联服务管理') }}</span-->
          <!--                >-->
          <!--                <el-input-->
          <!--                  v-if="currentTab == 'biz'"-->
          <!--                  v-model="relatedBusinessInfo.name"-->
          <!--                  v-focus-->
          <!--                  class="fl ml10 mt10"-->
          <!--                  style="width:200px;"-->
          <!--                  :placeholder="$t('请输入业务名称')"-->
          <!--                  clearable-->
          <!--                ></el-input>-->
          <!--                <el-button-->
          <!--                  class="fl mt10 ml10"-->
          <!--                  @click="queryRelatedBusinessBtn"-->
          <!--                  >{{ $t('查询') }}</el-button-->
          <!--                >-->
          <!--                <el-button-->
          <!--                  v-show="-->
          <!--                    $authFunction('FUNC_COOP_PROJ_MANG_BIZ_ASSOC', 3, projectId)-->
          <!--                  "-->
          <!--                  type="primary"-->
          <!--                  class="fr mt10"-->
          <!--                  @click="addRelatedBusiness"-->
          <!--                  >{{ $t('添加') }}</el-button-->
          <!--                >-->
          <!--              </div>-->
          <!--              <div style="">-->
          <!--                <el-table-->
          <!--                  :data="relatedBusinessData.results"-->
          <!--                  style="width: 100%;height: 100%;"-->
          <!--                >-->
          <!--                  <el-table-column-->
          <!--                    :label="$t('已关联服务')"-->
          <!--                    min-width="120"-->
          <!--                    prop="name"-->
          <!--                  ></el-table-column>-->
          <!--                  <el-table-column-->
          <!--                    v-if="-->
          <!--                      $authFunction(-->
          <!--                        'FUNC_COOP_PROJ_MANG_BIZ_DISASSOC',-->
          <!--                        3,-->
          <!--                        projectId,-->
          <!--                      )-->
          <!--                    "-->
          <!--                    :label="$t('操作')"-->
          <!--                    :width="$isEnglish() ? 100 : 60"-->
          <!--                  >-->
          <!--                    <template slot-scope="scope">-->
          <!--                      <el-button-->
          <!--                        v-show="-->
          <!--                          $authFunction(-->
          <!--                            'FUNC_COOP_PROJ_MANG_BIZ_DISASSOC',-->
          <!--                            3,-->
          <!--                            projectId,-->
          <!--                          )-->
          <!--                        "-->
          <!--                        type="text"-->
          <!--                        @click="deleteRelatedBusiness(scope.row)"-->
          <!--                        >{{ $t('删除') }}</el-button-->
          <!--                      >-->
          <!--                    </template>-->
          <!--                  </el-table-column>-->
          <!--                </el-table>-->
          <!--              </div>-->
          <!--              <div class="table_b_f_b">-->
          <!--                <el-pagination-->
          <!--                  class="fr mr10"-->
          <!--                  style="margin-top:4px;"-->
          <!--                  :pager-count="5"-->
          <!--                  :current-page="relatedBusinessData.pageInfo.pageNum"-->
          <!--                  :page-sizes="[20, 30, 50]"-->
          <!--                  :page-size="relatedBusinessData.pageInfo.pageSize"-->
          <!--                  layout="total, sizes, prev, pager, next"-->
          <!--                  :total="relatedBusinessData.total"-->
          <!--                  @size-change="handleSizeChange"-->
          <!--                  @current-change="handleCurrentChange"-->
          <!--                >-->
          <!--                </el-pagination>-->
          <!--              </div>-->
          <!--            </div>-->
          <!--          </el-tab-pane>-->
          <el-tab-pane :label="$t('人员管理')" name="user">
            <!-- 人员管理 -->
            <member-manage
              v-if="currentTab === 'user'"
              :project-id="projectId"
            ></member-manage>
          </el-tab-pane>
          <el-tab-pane :label="$t('角色设置')" name="role">
            <role-manage v-if="currentTab === 'role'"></role-manage>
          </el-tab-pane>
          <!-- <el-tab-pane label="缺陷字段管理" name="custom">
            <custom-field-management v-if="currentTab==='custom'"></custom-field-management>
          </el-tab-pane> -->

          <el-tab-pane :label="$t('工作流设置')" name="flow">
            <work-flow-setting v-if="currentTab === 'flow'"></work-flow-setting>
          </el-tab-pane>
          <el-tab-pane :label="$t('迭代阶段设置')" name="sprint">
            <sprint-stage-management
              v-if="currentTab === 'sprint'"
            ></sprint-stage-management>
          </el-tab-pane>
          <el-tab-pane :label="$t('自定义字段')" name="customField">
            <custom-field v-if="currentTab == 'customField'"></custom-field>
          </el-tab-pane>
          <el-tab-pane :label="$t('工作项模板')" name="customTemplates">
            <work-item-template
              v-if="currentTab == 'customTemplates'"
            ></work-item-template>
          </el-tab-pane>
          <el-tab-pane :label="$t('通知设置')" name="customNotifications">
            <custom-notifications
              v-if="currentTab == 'customNotifications'"
            ></custom-notifications>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <!-- 添加关联业务弹窗 -->
    <el-dialog
      :title="$t('添加关联服务')"
      class="el-dialog-350w"
      :before-close="relatedBusinessOut"
      :visible.sync="relatedBusinessDialogVisible"
      :modal-append-to-body="true"
      :close-on-click-modal="shadeBtn"
    >
      <div class="form-iterm-box">
        <el-form
          ref="relatedBusinessInfo"
          :model="relatedBusinessInfo"
          :label-width="$isEnglish() ? '110px' : '80px'"
        >
          <el-form-item :label="$t('服务名称')">
            <el-select
              v-model="relatedBusinessInfo.nameList"
              multiple
              filterable
              remote
              :placeholder="$t('请输入关键词')"
              :popper-append-to-body="false"
              :remote-method="searchRemoteRelatedBusiness"
              :loading="loading"
              style="width:100%;"
            >
              <el-option
                v-for="item in relatedBusinessList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 14px;">{{
                  item.id
                }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="relatedBusinessOut">{{ $t('关闭') }}</el-button>
        <el-button type="primary" @click="submitRelatedBusiness">{{
          $t('保存')
        }}</el-button>
      </span>
    </el-dialog>
    <!-- 人员管理弹窗 -->
    <el-dialog
      id="bizOpsMemberDialog"
      :title="managementTitle"
      class="el-dialog-350w"
      :before-close="closePersonnelDuty"
      :visible.sync="PersonnelManagementDialogVisible"
      :modal-append-to-body="true"
      :close-on-click-modal="shadeBtn"
      :width="$isEnglish() ? '450px' : '350px'"
    >
      <div class="form-iterm-box">
        <el-form
          ref="personnelManagementInfo"
          :model="personnelManagementInfo"
          :label-width="$isEnglish() ? '160px' : '80px'"
        >
          <el-form-item :label="$t('姓名/工号')">
            <co-input
              v-if="disabledPerson"
              disabled
              :value="personnelManagementnameList[0].userName"
            ></co-input>
            <el-select
              v-else
              v-model="personnelManagementInfo.personnelManagementName"
              v-focus
              :placeholder="$t('请输入姓名或工号')"
              multiple
              filterable
              remote
              :remote-method="searchPersonnelManagement"
              :loading="loading"
              style="width:100%;"
              :disabled="disabledPerson"
            >
              <template v-for="item in personnelManagementnameList">
                <el-option
                  :key="item.userId"
                  :label="item.userName"
                  :value="item.userId"
                >
                  <span style="float: left">{{ item.userName }}</span>
                  <span
                    style="float: right; color: #8492a6; font-size: 14px;"
                    >{{ item.userId }}</span
                  >
                </el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('职责')">
            <el-select
              v-model="personnelManagementInfo.personnelDuty"
              style="width:100%"
              multiple
              filterable
            >
              <el-option
                v-for="item in PersonnelDutylist"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closePersonnelDuty">{{ $t('关闭') }}</el-button>
        <el-button
          type="primary"
          @click="addPersonnelDuty(disabledPerson ? 'edit' : 'manage')"
          >{{ $t('保存') }}</el-button
        >
      </span>
    </el-dialog>
    <!-- //人员复制弹窗 -->
    <person-clone
      :visible.sync="cloneWorkFlowModalStatus"
      :project-id="projectId"
      type="personnel"
      @updatePerson="queryPersonnelManagement({ pageNumber: 1, pageSize: 20 })"
    ></person-clone>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
// 设置入口文件
// import CustomFieldManagement from './CustomFieldManagement'
// import ProjectInfoManagement from './ProjectInfoManagement'
import WorkFlowSetting from './WorkFlowSetting'
import RoleManage from './RoleManage'
// import SprintInfoCustom from 'pages/project/sprint/SprintInfoCustom.vue'
import SprintStageManagement from './SprintStageManagement'
import PersonClone from '@/components/biz/person-clone'
// import CustomSetting from './CustomSetting'
import CustomField from './CustomField'
import WorkItemTemplate from './workitem-template'
import CustomNotifications from './CustomNotifications'
import { debounce } from 'throttle-debounce'

import {
  projectManagementStaffList,
  projectManagementBizAvailable,
  projectManagementBizDisassoc,
  projectManagementBizAssoc,
  projectManagementBizList,
  projectManagementStaffRolesConfig,
  projectManagementStaffRemove,
  updateManageUpdate,
} from '@/service/project'
import { authRoleList } from '@/service/auth-custom'
import { userSearch } from '@/service/common/user'
import MemberManage from './MemberManage'

export default {
  name: 'ProjectSetting',
  components: {
    // CustomFieldManagement,
    // ProjectInfoManagement,
    WorkFlowSetting,
    // SprintInfoCustom,
    RoleManage,
    SprintStageManagement,
    PersonClone,
    // CustomSetting,
    CustomField,
    WorkItemTemplate,
    CustomNotifications,
    MemberManage,
  },

  data() {
    return {
      loading: false,
      personnelManagementnameList: [],
      relatedBusinessList: [],
      PersonnelDutylist: [],
      shadeBtn: false,
      modaltobody: false,
      relatedBusinessData: {
        results: [],
        pageInfo: { pageNum: 1, pageSize: 20 },
        total: 0,
        pages: 0,
      },

      personnelManagementData: {
        results: [],
        pageInfo: { pageNum: 1, pageSize: 15 },
        total: 0,
        pages: 0,
      },

      relatedBusinessDialogVisible: false,
      relatedBusinessInfo: { nameList: [] },
      personnelManagementInfo: {
        personnelDuty: [],
        personnelManagementName: [],
      },

      search: '',
      PersonnelManagementDialogVisible: false,
      disabledPerson: false,
      projectId: this.$getUrlParams().projectId,
      currentTab: 'user', // 当前展示的 tab,
      cloneWorkFlowModalStatus: false,
    }
  },

  computed: {
    managementTitle() {
      return i18n.t(this.disabledPerson ? '编辑项目人员' : '添加项目人员')
    },
  },
  // beforeRouteUpdate(to, from, next) {
  //   if (
  //     from.meta.customTempl &&
  //     to.path === '/project/setting' &&
  //     this.currentTab === 'customTemplates'
  //   ) {
  //     this.currentTab = 'biz'
  //   }
  //   next()
  // },
  watch: {
    currentTab(val) {
      this.countlyLog(`project_personalDetail_${val}`)
      if (this.currentTab === 'user') {
        this.queryPersonnelManagementBtn()
        this.PersonnelDutylist = []
        this.$nextTick(this.getPersonRoles)
      }
      // 从自定义工作项到其它 tab 时，需要切换路由
      if (
        this.currentTab !== 'customTemplates' &&
        this.$route.path !== '/project/setting'
      ) {
        this.$router.push(
          `/project/setting?projectId=${this.$getUrlParams().projectId}`,
        )
      }
    },
  },
  created() {
    this.searchPersonnelManagement = debounce(
      500,
      this.searchPersonnelManagement,
    )
  },
  mounted() {
    this.projectId = this.$getUrlParams().projectId
    this.queryRelatedBusiness({ pageNumber: 1, pageSize: 20 })
    this.queryPersonnelManagement({ pageNumber: 1, pageSize: 20 })
    this.$getUrlParams().key && this.$getUrlParams().key == 'sprint'
      ? (this.currentTab = 'sprint')
      : (this.currentTab = 'user')
    this.toTmplTab()
    // 监听人员管理中。触发的新角色创建事件
    window.addEventListener(
      'coteam.project_roleManage_addRole',
      this.addRoleListener,
    )
    // 清除事件
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener(
        'coteam.project_roleManage_addRole',
        this.addRoleListener,
      )
    })
  },

  methods: {
    // 监听新增角色
    addRoleListener() {
      this.currentTab = 'role'
    },
    // 通过url访问模板tab,tab切换为自定义模板
    toTmplTab() {
      if (this.$route.meta.customTempl) {
        this.currentTab = 'customTemplates'
      }
    },
    //复制项目成员
    copyProjectPerson() {
      this.cloneWorkFlowModalStatus = true
    },
    queryRelatedBusinessBtn() {
      this.relatedBusinessData.pageInfo.pageNum = 1
      this.queryRelatedBusiness({
        pageNumber: 1,
        pageSize: this.relatedBusinessData.pageInfo.pageSize,
      })
    },

    addRelatedBusiness() {
      this.relatedBusinessInfo.nameList = []
      projectManagementBizAvailable({
        query: null,
      }).then(res => {
        this.relatedBusinessList = res.data
      })
      this.relatedBusinessDialogVisible = true
    },

    searchRemoteRelatedBusiness(query) {
      this.loading = true
      projectManagementBizAvailable({
        query,
      }).then(res => {
        this.relatedBusinessList = res.data
        this.loading = false
      })
    },

    relatedBusinessOut() {
      this.relatedBusinessDialogVisible = false
    },

    submitRelatedBusiness() {
      if (this.relatedBusinessInfo.nameList.length == 0) {
        this.$message({ message: i18n.t('服务名称不能为空'), type: 'warning' })
        return
      }
      projectManagementBizAssoc({
        bizIds: this.relatedBusinessInfo.nameList,
        projectId: this.$getUrlParams().projectId,
      }).then(res => {
        if (res.status === 200) {
          this.$message({
            message: res.msg || i18n.t('添加成功'),
            type: 'success',
          })

          this.queryRelatedBusiness({
            pageNumber: this.relatedBusinessData.pageInfo.pageNum,
            pageSize: this.relatedBusinessData.pageInfo.pageSize,
          })

          this.relatedBusinessOut()
        } else {
          // this.$message({ message: res.msg || '添加失败', type: 'error' });
        }
      })
    },

    deleteRelatedBusiness(row) {
      // console.log(row);
      this.$confirm(i18n.t('此操作将删除该数据, 是否继续?'), i18n.t('提示'), {
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      })
        .then(() => {
          projectManagementBizDisassoc({
            bizId: row.id,
            projectId: this.$getUrlParams().projectId,
          }).then(res => {
            if (res.status === 200) {
              this.$message({
                message: res.msg || i18n.t('删除成功'),
                type: 'success',
              })

              this.queryRelatedBusiness({
                pageNumber: this.relatedBusinessData.pageInfo.pageNum,
                pageSize: this.relatedBusinessData.pageInfo.pageSize,
              })
            } else {
              // this.$message({ message: res.msg || '删除失败', type: 'error' });
            }
          })
        })
        .catch(() => {})
    },

    queryRelatedBusiness(payload) {
      let params = {
        projectId: this.$getUrlParams().projectId,
        pageInfo: {
          pageNumber: payload.pageNumber,
          pageSize: payload.pageSize,
        },

        query: this.relatedBusinessInfo.name,
      }

      projectManagementBizList(params).then(res => {
        this.relatedBusinessData.results = res.data.results
        this.relatedBusinessData.total = res.data.pageInfo.totalRecords

        this.personnelManagementData.pageInfo.pageNum = 1
        this.queryPersonnelManagement({
          pageNumber: 1,
          pageSize: this.personnelManagementData.pageInfo.pageSize,
        })
      })
    },

    handleSizeChange(val) {
      this.relatedBusinessData.pageInfo.pageSize = val
      this.relatedBusinessData.pageInfo.pageNum = 1
      this.queryRelatedBusiness({ pageNumber: 1, pageSize: val })
    },
    handleCurrentChange(val) {
      this.relatedBusinessData.pageInfo.pageNum = val
      this.queryRelatedBusiness({
        pageNumber: val,
        pageSize: this.relatedBusinessData.pageInfo.pageSize,
      })
    },

    queryPersonnelManagementBtn() {
      this.personnelManagementData.pageInfo.pageNum = 1
      this.queryPersonnelManagement({
        pageNumber: 1,
        pageSize: this.personnelManagementData.pageInfo.pageSize,
      })
    },

    addPersonnelManagement() {
      this.personnelManagementnameList = []
      this.personnelManagementInfo.personnelManagementName = []
      this.personnelManagementInfo.personnelDuty = []
      this.getPersonRoles()
      this.disabledPerson = false
      this.PersonnelManagementDialogVisible = true
    },

    getPersonRoles() {
      if (this.PersonnelDutylist.length > 0) {
        return
      }
      authRoleList().then(res => {
        this.PersonnelDutylist = res.data
      })
    },

    editPersonnelManagement(row) {
      // console.log(row);
      this.personnelManagementnameList = [row]
      this.personnelManagementInfo.personnelManagementName = [row.userId]
      this.getPersonRoles()
      row.roles.map(item => {
        this.personnelManagementInfo.personnelDuty.push(+item.roleId)
      })
      this.PersonnelManagementDialogVisible = true
      this.disabledPerson = true
    },

    searchPersonnelManagement(query) {
      this.query = query
      if (query !== '') {
        this.loading = true
        userSearch({ keyword: query }).then(res => {
          if (this.query === query) {
            this.loading = false
            this.personnelManagementnameList = res.data
          }
        })
      } else {
        this.loading = false
        this.personnelManagementnameList = []
      }
    },

    closePersonnelDuty() {
      this.personnelManagementInfo.personnelDuty = []
      this.personnelManagementInfo.personnelManagementName = []
      this.PersonnelManagementDialogVisible = false
    },

    async addPersonnelDuty(type = 'manage') {
      if (this.personnelManagementInfo.personnelManagementName.length === 0) {
        this.$message({ message: i18n.t('姓名/工号不能为空'), type: 'warning' })
        return
      } else if (this.personnelManagementInfo.personnelDuty.length === 0) {
        this.$message({ message: i18n.t('职责不能为空'), type: 'warning' })
        return
      } else if (
        this.personnelManagementInfo.personnelManagementName.length === 0 &&
        this.personnelManagementInfo.personnelDuty.length === 0
      ) {
        this.$message({
          message: `${i18n.t('姓名/工号不能为空')},${i18n.t('职责不能为空')}`,
          type: 'warning',
        })

        return
      }

      let params = {
        projectId: this.$getUrlParams().projectId,
        userIds: this.personnelManagementInfo.personnelManagementName,
        roles: this.personnelManagementInfo.personnelDuty,
      }

      let res = {}
      try {
        if (type === 'edit') {
          res = await updateManageUpdate(params)
        } else {
          res = await projectManagementStaffRolesConfig(params)
        }
      } catch (error) {
        res.status = 0
      }

      if (res.status === 200) {
        this.$message({
          message: res.msg || i18n.t('添加或修改成功'),
          type: 'success',
        })

        // 添加人员，清空关联用户
        this.$store.dispatch({
          type: 'clearAssignUserList',
        })

        this.closePersonnelDuty()
        this.queryPersonnelManagement({
          pageNumber: this.personnelManagementData.pageInfo.pageNum,
          pageSize: this.personnelManagementData.pageInfo.pageSize,
        })
      } else {
        this.$message({
          message: res.msg || i18n.t('添加或修改失败'),
          type: 'error',
        })
      }
    },

    delPersonnelManagement(delUser) {
      let params = {
        userId: delUser.userId,
        projectId: this.$getUrlParams().projectId,
      }

      this.$confirm(
        i18n.t('此操作会将') +
          '【' +
          delUser.userName +
          '】' +
          i18n.t('从项目中删除?'),
        i18n.t('提示'),
        {
          distinguishCancelAndClose: true,
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        },
      )
        .then(() => {
          projectManagementStaffRemove(params).then(res => {
            if (res.status === 200) {
              this.$message({
                message: res.msg || i18n.t('删除成功'),
                type: 'success',
              })

              // 删除人员，清空关联用户
              this.$store.dispatch({
                type: 'clearAssignUserList',
              })

              this.queryPersonnelManagement({
                pageNumber: this.personnelManagementData.pageInfo.pageNum,
                pageSize: this.personnelManagementData.pageInfo.pageSize,
              })
            } else {
              // this.$message({
              //   message: res.msg || '删除失败',
              //   type: 'error'
              // });
            }
          })
        })
        .catch(() => {})
    },

    queryPersonnelManagement(payload) {
      projectManagementStaffList({
        projectId: this.$getUrlParams().projectId,
        pageInfo: {
          pageNumber: payload.pageNumber,
          pageSize: payload.pageSize,
        },

        query: this.search,
      }).then(res => {
        this.personnelManagementData.results = res.data.results
        this.personnelManagementData.total = res.data.pageInfo.totalRecords
      })
    },

    handleOpsSizeChange(val) {
      this.personnelManagementData.pageInfo.pageSize = val
      this.personnelManagementData.pageInfo.pageNum = 1
      this.queryPersonnelManagement({ pageNumber: 1, pageSize: val })
    },

    handleOpsCurrentChange(val) {
      this.personnelManagementData.pageInfo.pageNum = val
      this.queryPersonnelManagement({
        pageNumber: val,
        pageSize: this.personnelManagementData.pageInfo.pageSize,
      })
    },

    arrayJoiner(inputArray) {
      let arr = []
      inputArray.map(item => {
        arr.push(item.roleName)
      })
      return arr.join(',')
    },

    fromBusiness(row) {
      if (row.fromBiz == true) {
        return i18n.t('是')
      }
      if (row.fromBiz == false) {
        return i18n.t('否')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.personal-management {
  padding: 24px;
}
</style>
