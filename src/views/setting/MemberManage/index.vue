<template>
  <div>
    <!-- 人员管理 -->
    <div class="tab-minheight">
      <div class="header">
        <span class="title fl">{{ $t('人员管理') }}</span>
        <el-input
          v-model="search"
          v-focus
          class="searchInput fl ml10 mt10"
          :placeholder="$t('请输入人员名称')"
          clearable
        />
        <el-button class="fl mt10 ml10" @click="getMemberListBtn">{{
          $t('查询')
        }}</el-button>
        <el-button
          v-if="FUNC_COOP_PROJ_MANG_STAFF_CONFIG"
          class="fl mt10 ml10"
          type="primary"
          @click="addPersonnelManagement"
          >{{ $t('添加') }}</el-button
        >
        <!-- 批量导入 -->
        <el-dropdown
          v-if="FUNC_COOP_PROJ_MANG_STAFF_CONFIG"
          class="fl mt10 ml10"
          size="small"
          @command="handleCommand"
        >
          <el-button type="primary">
            {{ $t('批量导入') }}<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="project">{{
              $t('从项目导入')
            }}</el-dropdown-item>
            <el-dropdown-item command="department">{{
              $t('从部门导入')
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <!-- 成员列表 -->
      <el-table
        :border="personnelManagementData.results.length !== 0"
        :data="personnelManagementData.results"
        style="width: 100%;height: 100%;"
      >
        <el-table-column prop="userName" :label="$t('人员')" min-width="120">
          <template slot-scope="scope">{{
            `${scope.row.userName}(${scope.row.userId})`
          }}</template>
        </el-table-column>
        <el-table-column
          prop="department"
          :label="$t('部门')"
          min-width="180"
        />
        <el-table-column :label="$t('角色')" min-width="180">
          <template slot-scope="scope">
            {{ scope.row.roles | arrayJoiner }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="
            FUNC_COOP_PROJ_MANG_STAFF_CONFIG ||
              FUNC_COOP_PROJ_MANG_STAFF_REMOVE ||
              FUNC_COOP_PROJ_PRODUCT_MANAGER
          "
          :label="$t('操作')"
          width="120"
        >
          <template slot-scope="scope">
            <el-button
              v-show="FUNC_COOP_PROJ_MANG_STAFF_CONFIG"
              type="text"
              @click="editPersonnelManagement(scope.row)"
              >{{ $t('编辑') }}</el-button
            >
            <el-button
              v-show="FUNC_COOP_PROJ_MANG_STAFF_REMOVE"
              type="text"
              @click="delPersonnelManagement(scope.row)"
              >{{ $t('删除') }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        class="custom-pagination mr10"
        style="margin-top:4px;"
        :pager-count="5"
        :current-page="personnelManagementData.pageInfo.pageNum"
        :page-sizes="[15, 20, 30, 50]"
        :page-size="personnelManagementData.pageInfo.pageSize"
        layout="total, sizes, prev, pager, next"
        :total="personnelManagementData.total"
        @size-change="handleOpsSizeChange"
        @current-change="handleOpsCurrentChange"
      />
    </div>
    <!-- 从项目导入人员弹窗 -->
    <PersonClone
      :visible.sync="cloneDialogShow"
      :project-id="projectId"
      type="personnel"
      @updatePerson="updatePerson"
    />
    <!-- 添加人员弹窗 -->
    <AddMember
      :add-dialog-show="addDialogShow"
      :management-title="managementTitle"
      :personnel-dutylist="personnelDutylist"
      :user-info="userInfo"
      :is-edit="isEdit"
      @closePersonnelDuty="closePersonnelDuty('addDialogShow')"
      @confirm="addPersonnelDuty"
    />
    <!-- 批量从部门导入人员弹窗 -->
    <ImportDepartment
      :title="managementTitle"
      :show.sync="importDialogShow"
      @close="closePersonnelDuty('importDialogShow')"
      @confirm="addPersonnelDuty"
    />
    <!-- 选择项目角色弹框 -->
    <el-dialog
      :title="managementTitle"
      class="el-dialog-350w"
      :before-close="cancel"
      :visible.sync="selectRoleDialogShow"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      width="480px"
    >
      <el-form ref="form" :model="form" label-width="140px">
        <el-form-item :label="$t('选择项目角色') + ':'">
          <el-select
            v-model="roles"
            multiple
            filterable
            :popper-append-to-body="true"
          >
            <el-option
              v-for="item in personnelDutylist"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
            />
            <el-option class="new-role" value="" @click.native.stop="newRole"
              ><i class="el-icon-plus"></i> {{ $t('增加项目角色') }}</el-option
            >
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="next">{{ $t('下一步') }}</el-button>
        <el-button @click="cancel">{{ $t('取消') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AddMember from './AddMember'
import ImportDepartment from '../RoleManage/ImportDepartment'
import PersonClone from '@/components/biz/person-clone'
import { i18n } from '@/i18n'
import {
  projectManagementStaffList,
  projectManagementStaffRemove,
  updateManageUpdate,
  projectManagementStaffRolesConfig,
} from '@/service/project'
import { authRoleList } from '@/service/auth-custom'
export default {
  components: {
    AddMember,
    ImportDepartment,
    PersonClone,
  },
  filters: {
    // 人员是否来自服务
    fromBusiness(fromBiz) {
      return i18n.t(fromBiz ? '是' : '否')
    },
    // 人员角色拼接
    arrayJoiner(inputArray) {
      return inputArray.map(item => item.roleName).join(',')
    },
  },
  props: {
    projectId: {
      type: [Number, String],
      default: '',
    },
  },
  data() {
    return {
      personnelManagementData: {
        results: [],
        pageInfo: { pageNum: 1, pageSize: 15 },
        total: 0,
        pages: 0,
      }, // 获取人员列表数据
      personnelDutylist: [], // 角色列表
      roles: [], //选择的角色列表
      search: '', //搜索人员数据
      managementTitle: '', //添加人员弹框名称
      userInfo: null, //编辑人员的数据
      addDialogShow: false, //是否显示添加人员弹框
      cloneDialogShow: false, //导入项目人员弹框
      importDialogShow: false, //导入部门人员弹框
      selectRoleDialogShow: false, //选择项目角色弹框
      form: {},
      isEdit: false,
    }
  },
  computed: {
    FUNC_COOP_PROJ_MANG_STAFF_CONFIG() {
      return this.$authFunction(
        'FUNC_COOP_PROJ_MANG_STAFF_CONFIG',
        3,
        this.projectId,
      )
    },
    FUNC_COOP_PROJ_MANG_STAFF_REMOVE() {
      return this.$authFunction(
        'FUNC_COOP_PROJ_MANG_STAFF_REMOVE',
        3,
        this.projectId,
      )
    },
    FUNC_COOP_PROJ_MANG_BIZ_ASSOC() {
      return this.$authFunction(
        'FUNC_COOP_PROJ_MANG_BIZ_ASSOC',
        3,
        this.projectId,
      )
    },
    FUNC_COOP_PROJ_PRODUCT_MANAGER() {
      return this.$authFunction(
        'FUNC_COOP_PROJ_PRODUCT_MANAGER',
        3,
        this.projectId,
      )
    },
  },
  created() {
    this.getMemberList()
    this.getPersonRoles()
  },
  methods: {
    // 获取人员列表
    getMemberList() {
      projectManagementStaffList({
        projectId: this.projectId,
        pageInfo: {
          pageNumber: this.personnelManagementData.pageInfo.pageNum,
          pageSize: this.personnelManagementData.pageInfo.pageSize,
        },
        query: this.search,
      }).then(res => {
        this.personnelManagementData.results = res.data.results
        this.personnelManagementData.total = res.data.pageInfo.totalRecords

        if (res.data.pageInfo.pageNumber > 1 && !res.data.results.length) {
          this.personnelManagementData.pageInfo.pageNum =
            this.personnelManagementData.pageInfo.pageNum - 1
          this.getMemberList()
        }
        this.$nextTick(() => {
          document.querySelector('#project-setting') &&
            (document.querySelector('#project-setting').scrollTop = 0)
        })
      })
    },
    // 增加项目角色
    newRole() {
      const event = new CustomEvent('coteam.project_roleManage_addRole')
      window.dispatchEvent(event)
      this.selectRoleDialogShow = false
    },
    // 获取角色列表
    getPersonRoles() {
      authRoleList().then(res => {
        this.personnelDutylist = res.data
      })
    },
    // 搜索人员
    getMemberListBtn() {
      this.personnelManagementData.pageInfo.pageNum = 1
      this.getMemberList()
    },
    // 更改显示条数
    handleOpsSizeChange(val) {
      this.personnelManagementData.pageInfo.pageNum = 1
      this.personnelManagementData.pageInfo.pageSize = val
      this.getMemberList()
    },
    // 翻页
    handleOpsCurrentChange(val) {
      this.personnelManagementData.pageInfo.pageNum = val
      this.getMemberList()
    },
    // 删除成员
    delPersonnelManagement(delUser) {
      this.$confirm(
        `${i18n.t('此操作会将')}【${delUser.userName}】${i18n.t(
          '从项目中删除?',
        )}`,
        i18n.t('提示'),
        {
          distinguishCancelAndClose: true,
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        },
      )
        .then(async () => {
          const params = {
            userId: delUser.userId,
            projectId: this.$getUrlParams().projectId,
          }
          let res = {}
          try {
            res = await projectManagementStaffRemove(params)
          } catch (error) {
            res.status = 0
          }

          if (res.status === 200) {
            this.$message({
              message: res.msg || i18n.t('删除成功'),
              type: 'success',
            })
            this.getMemberList()
          }
        })
        .catch(() => {})
    },
    // 编辑人员
    editPersonnelManagement(row) {
      this.userInfo = row
      this.managementTitle = i18n.t('编辑人员')
      this.isEdit = true
      this.addDialogShow = true
    },
    // 选择批量导入人员方式
    handleCommand(command) {
      if (command === 'project') {
        //复制项目成员
        this.cloneDialogShow = true
      } else {
        this.managementTitle = i18n.t('批量导入项目成员')
        this.selectRoleDialogShow = true
      }
    },
    next() {
      if (!this.roles.length) {
        this.$message.warning(this.$t('请选择角色'))
        return
      }
      this.managementTitle = i18n.t('添加项目人员')
      this.importDialogShow = true
    },
    cancel() {
      this.roles = []
      this.selectRoleDialogShow = false
    },
    // 打开添加人员弹框
    addPersonnelManagement() {
      this.managementTitle = i18n.t('添加项目成员')
      this.addDialogShow = true
      this.isEdit = false
    },
    // 关闭添加人员弹框
    closePersonnelDuty(type) {
      this[type] = false
    },
    // 添加人员成功
    async addPersonnelDuty(params, single = false) {
      // 如果是数组 就是ImportDepartment组件触发的事件
      const isArray = params instanceof Array
      const paramsDto = isArray
        ? {
            userIds: params.map(item => item.userId),
            roles: this.roles,
          }
        : params

      let result = {}

      if (single) {
        result = await updateManageUpdate({
          ...paramsDto,
          projectId: this.projectId || this.getUrlParams().projectId,
        })
      } else {
        result = await await projectManagementStaffRolesConfig({
          ...paramsDto,
          projectId: this.projectId || this.getUrlParams().projectId,
        })
      }
      if (result?.status === 200) {
        this.$message({
          message: result.msg || i18n.t('添加或修改成功'),
          type: 'success',
        })
        this.getMemberListBtn()
      }
      if (isArray) {
        this.importDialogShow = false
        this.cancel()
      } else {
        this.addDialogShow = false
      }
    },
    //复制项目人员成功
    updatePerson() {
      this.getMemberListBtn()
      this.cloneDialogShow = false
    },
  },
}
</script>

<style lang="scss" scoped>
.custom-pagination {
  display: flex;
  justify-content: flex-end;
}

.tab-minheight {
  .header {
    height: 50px;
    .title {
      font-size: 16px;
      font-weight: 900;
      margin-top: 12px;
    }
    .searchInput {
      width: 200px;
    }
  }
}
.form-iterm-box {
  display: flex;
  align-items: center;
  .el-select {
    flex: 1;
  }
}

.new-role {
  color: $--color-primary;
  &::after {
    display: none;
  }
}
</style>
