<template>
  <div
    v-loading="loading"
    class="memeber-manage-box"
    element-loading-text
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
  >
    <div class="member__header">
      <span class="header-title">{{ $t('角色成员') }}：{{ memberCount }}</span>
      <el-button v-show="addAble" slot="reference" type="text" @click="addUser"
        >+{{ $t('添加成员') }}</el-button
      >
    </div>
    <div class="member-list">
      <el-tag
        v-for="member in members"
        :key="member.key"
        class="member-list-item"
        :type="member.type"
        size="small"
      >
        <span>{{ member.value }}({{ member.key }})</span>
        <span
          v-show="deleteAble"
          class="member-delete cursor-pointer"
          @click="deleteMember(member)"
          ><i class="el-icon-delete"></i
        ></span>
      </el-tag>
    </div>

    <add-person
      :title="$t('添加成员')"
      :show.sync="PersonnelManagementDialogVisible"
      @close="closePersonnelDuty"
      @confirm="addPersonnelDuty"
    ></add-person>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { mapActions } from 'vuex'
import { projectManagementStaffList } from '@/service/project'
import {
  authMemberList,
  authMemberDelete,
  authMemberAdd,
} from '@/service/auth-custom'
import { userSearch } from '@/service/common/user'
import { debounce } from 'throttle-debounce'
import AddPerson from './ImportDepartment'

export default {
  name: 'RoleMember',
  components: { AddPerson },
  mixins: [],
  props: {
    projectId: {
      type: [String, Number],
      required: false,
    },

    currentRoleInfo: {
      type: Object,
      required: true,
      desc: '当前选中角色',
    },
  },

  data() {
    return {
      // 项目内成员数据信息
      projectUsers: {
        list: [],
        pageInfo: { pageNum: 1, pageSize: 1000 },
      },

      members: [], // 当前角色成员列表
      loading: false,
      updatable: false, // 是否可以更新，用以控制在切换左侧列表时，导致的 popover 关闭触发的更新机制
      PersonnelManagementDialogVisible: false, // 添加成员 dialog
      personnelManagementName: [],
      personnelManagementnameList: [],
      userloading: false,
    }
  },
  computed: {
    // 权限 - 是否可以添加
    addAble() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_SETTING_ROLE_MANAGE_STAFF_ADD',
        3,
        this.projectId,
      )
    },
    // 权限 - 是否可以删除
    deleteAble() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_SETTING_ROLE_MANAGE_STAFF_DELETE',
        3,
        this.projectId,
      )
    },
    // 人员数量统计
    memberCount() {
      return this.members.length
    },
  },

  watch: {
    currentRoleInfo() {
      this.updatable = false
      if (this.currentRoleInfo.key) {
        this.getSelectedMemberList()
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
    this.getMemberList()
    if (this.currentRoleInfo.key) {
      this.getSelectedMemberList()
    }
  },
  methods: {
    ...mapActions(['getUserInfo']),
    // popover 打开
    beforeUpdate() {
      this.updatable = true
    },
    // popover 关闭
    afterClose() {
      this.$nextTick(this.updateMember)
    },
    // 获取项目内成员列表
    async getMemberList() {
      let result = {}
      try {
        this.loading = true
        result = await projectManagementStaffList({
          projectId: this.projectId || this.$getUrlParams().projectId,
          pageInfo: { ...this.projectUsers.pageInfo },
          query: '',
        })
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '获取项目成员数据失败',
        //   type: 'error'
        // })
        return
      }
      this.projectUsers.list = result.data.results.map(item => {
        return {
          key: item.userId,
          value: item.userName,
          ...item,
        }
      })
      this.generateListSelect()
    },
    // 获取当前角色对应的成员列表
    async getSelectedMemberList() {
      let result = {}
      try {
        this.loading = true
        result = await authMemberList({
          projectId: this.projectId || this.$getUrlParams().projectId,
          roleId: this.currentRoleInfo.key,
        })
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '获取角色成员数据失败',
        //   type: 'error'
        // })
        return
      }
      this.members = result.data.map(item => {
        return {
          key: item.userId,
          value: item.userName,
          type: 'success',
          ...item,
        }
      })
      this.generateListSelect()
    },
    // 删除成员
    async deleteMember(info) {
      const confirmResult = await this.$confirmBeforeOperate(
        `${i18n.t('确认删除成员')}${info.value}${i18n.t('吗')}？`,
      )

      if (!confirmResult) {
        return false
      }
      let result = {}
      try {
        this.loading = true
        result = await authMemberDelete({
          roleId: this.currentRoleInfo.key,
          userId: info.key,
        })
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '删除成员失败',
        //   type: 'error'
        // })
        return
      } else {
        this.$message({
          message: result.msg || i18n.t('删除成员成功'),
          type: 'success',
        })

        // 删除人员，清空关联用户
        this.$store.dispatch({
          type: 'clearAssignUserList',
        })

        this.getSelectedMemberList()
        this.getUserInfo()
      }
    },
    // 更新成员
    async updateMember(user_poor = []) {
      // if(!this.updatable) {return ;}
      let result = {}
      try {
        this.loading = true
        result = await authMemberAdd(
          {
            roleId: this.currentRoleInfo.key,
            projectId: this.projectId || this.$getUrlParams().projectId,
          },
          [...this.members.map(item => item.key), ...user_poor],
        )
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '更新成员失败',
        //   type: 'error'
        // })
        return
      } else {
        this.$message({
          message: result.msg || i18n.t('更新成员成功'),
          type: 'success',
        })

        // 更新人员，清空关联用户
        this.$store.dispatch({
          type: 'clearAssignUserList',
        })

        this.getSelectedMemberList()
        this.getUserInfo()
        this.closePersonnelDuty()
      }
    },
    // 更新所有人员列表是否选中值
    generateListSelect() {
      if (this.projectUsers.list.length === 0) {
        return
      }
      const selectedMemberIds = this.members.map(item => item.key)
      this.projectUsers.list = this.projectUsers.list.map(item => {
        return {
          ...item,
          selected: selectedMemberIds.includes(item.key) ? true : false, // selectedMemberIds.includes(item.key)
        }
      })
    },
    // dialog - 点击添加成员
    addUser() {
      this.PersonnelManagementDialogVisible = true
    },
    // dialog - 关闭
    closePersonnelDuty() {
      this.personnelManagementName = []
      this.PersonnelManagementDialogVisible = false
    },
    // dialog - 搜索人员
    searchPersonnelManagement(query) {
      this.query = query
      if (query !== '') {
        this.userloading = true
        userSearch({ keyword: query }).then(res => {
          if (this.query === query) {
            this.personnelManagementnameList = res.data
            this.userloading = false
          }
        })
      } else {
        this.loading = false
        this.personnelManagementnameList = []
      }
    },
    // 保存人员
    addPersonnelDuty(list) {
      this.updateMember(list.map(item => item.userId))
      this.PersonnelManagementDialogVisible = false
    },
  },
}
</script>
<style lang="scss" scoped>
.memeber-manage-box {
  .member__header {
    .header-title {
      font-size: 16px;
    }
  }
  .member-list {
    margin-top: 5px;
    .member-list-item {
      margin-right: 10px;
      font-size: 14px;
    }
    .member-delete {
      padding: 0 5px;
      &:hover {
        color: $--color-primary;
      }
    }
  }
}
.member-item-next-select {
  margin: 0 10px 0 0;
}
</style>
