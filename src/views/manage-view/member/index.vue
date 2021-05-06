<template>
  <div
    v-loading="memberViewLoading"
    class="manage-view__member"
    :class="{ 'manage-view__notManager': !isManager }"
  >
    <TwoColsLayout>
      <el-tabs
        slot="left"
        class="manage-left"
        :value="activeTab"
        stretch
        @tab-click="swithFilterType"
      >
        <el-tab-pane v-if="isManager" :label="$t('部门')" name="department">
          <div class="department"><CompanyList></CompanyList></div>
        </el-tab-pane>
        <el-tab-pane :label="$t('团队')" name="team">
          <div class="group">
            <select-list-without-border
              :add-btn-name="$t('创建团队')"
              :list-data="teamList"
              :menu-data="menuList"
              :active-id="teamId"
              @itemClick="chooseTeam"
              @add="showTeamEditModel"
              @menuClick="teamEdit"
            >
            </select-list-without-border>
          </div>
        </el-tab-pane>
      </el-tabs>
      <MemberList slot="right"></MemberList>
    </TwoColsLayout>
    <!-- 团队设置 -->
    <creat-or-update-group-model
      :content="teamName"
      :title="teamEditTitle"
      :show-model.sync="teamEditModel"
      @submitModel="submitTeamEdit"
    ></creat-or-update-group-model>
    <!-- 添加成员 -->
    <add-member-model
      :show-model.sync="teamManageModel"
      :left-list="alternativeList"
      :right-list="selectedList"
      :show-loading="showLoading"
      @submitModel="submitUpdateGroupPerson"
    ></add-member-model>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
import { mapState } from 'vuex'
import CONSTVARLIABLE from '@/store/mutation-types'
import cloneDeep from 'lodash/cloneDeep'
import TwoColsLayout from '@/components/two-cols-layout'
import SelectListWithoutBorder from '@/components/select-list/SelectListWithoutBorder'
import MemberList from './list'
import CreatOrUpdateGroupModel from './CreatOrUpdateGroupModel'
import AddMemberModel from './AddMemberModel'
import CompanyList from './CompanyList'
export default {
  name: 'MemberView',
  components: {
    TwoColsLayout,
    SelectListWithoutBorder,
    MemberList,
    CreatOrUpdateGroupModel,
    AddMemberModel,
    CompanyList,
  },

  data() {
    return {
      teamEditModel: false, // 是否显示创建团队弹窗
      teamEditType: 'new', // 编辑类型
      teamEditTitle: '创建团队', // 弹窗标题
      teamManageModel: false, // 是否显示添加成员弹窗
      teamName: '', // 团队名称
      currentId: '', // 当前操作团队id
      menuList: [
        {
          command: 'rename',
          title: i18n.t('重命名团队'),
          show: true,
        },

        {
          command: 'manage',
          title: i18n.t('管理成员'),
          show: true,
        },

        {
          command: 'remove',
          title: i18n.t('删除团队'),
          show: true,
        },

        {
          command: 'exit',
          title: i18n.t('退出团队'),
          show: false,
        },
      ],

      // 列表操作选项 command-命令，title-操作名称，show-是否是管理员可见
      showLoading: true, // 添加成员弹窗是否显示加载动画
    }
  },
  computed: {
    ...mapState({
      department: state => state.gd.department,
      isManager: state => state.gd.isManager,
      defaultFilterInfo: state => state.manageViewMember.defaultFilterInfo,
      teamId: state => state.manageViewMember.cacheFilterInfo.teamId,
      activeTab: state => state.manageViewMember.activeTab,
      teamList: state => state.manageViewMember.teamList,
      alternativeList: state => state.manageViewMember.alternativeList,
      selectedList: state => state.manageViewMember.selectedList,
      cacheFilterInfo: state => state.manageViewMember.cacheFilterInfo,
      filterInfo: state => state.manageViewMember.filterInfo,
      memberViewLoading: state => state.manageViewMember.memberViewLoading,
    }),
  },

  created() {
    // 初始化管理者视图 - 成员视图状态
    this.$store.dispatch('initMemberViewData')
  },
  methods: {
    // 切换团队与部门
    swithFilterType(t) {
      this.$store.commit(CONSTVARLIABLE.UPDATE_MANAGEVIEW_MEMBER_ACTIVETAB, {
        activeTab: t.name,
      })

      if (
        (t.name === 'team' && this.teamList?.length) ||
        (t.name === 'department' && this.department?.length)
      ) {
        this.$store.dispatch('getMemberViewList', {
          ...this.defaultFilterInfo,
        })
      }
    },
    // 切换团队
    async chooseTeam(obj) {
      let cacheFilterInfo = cloneDeep(this.cacheFilterInfo)
      await this.$store.dispatch('getMemberViewList', {
        ...this.defaultFilterInfo,
        teamId: obj.id,
      })

      const currentTeam = this.teamList.find(item => item.id === obj.id)
      this.$store.commit(
        CONSTVARLIABLE.UPDATE_MANAGEVIEW_MEMBER_VIEW_TEAM,
        currentTeam,
      )

      cacheFilterInfo.teamId = obj.id
      this.$store.commit(
        CONSTVARLIABLE.UPDATE_MANAGEVIEW_MEMBER_LIST_CACHE_FILTERINFO,
        {
          cacheFilterInfo,
        },
      )
    },
    // 创建团队
    showTeamEditModel() {
      this.teamEditModel = true
      this.teamEditType = 'new'
      this.teamEditTitle = i18n.t('创建团队')
      this.teamName = ''
    },
    // 删除团队
    deleteTeam(name) {
      // 当删除团队时正好是展示改团队成员列表时，该怎么操作？？？？
      this.$confirm(
        `${i18n.t('是否要删除')}"${name}"${i18n.t('团队')}？`,
        i18n.t('提示'),
        {
          type: 'warning',
          callback: async action => {
            if (action === 'confirm') {
              let res = await this.$store.dispatch('deleteTeam', {
                id: this.currentId,
              })

              if (res.status === 200) {
                this.$message({
                  type: 'success',
                  message: i18n.t('删除成功'),
                })

                await this.$store.dispatch('getGroupList')
                // TODO 删除选中的团队后，默认选中第一个团队
                this.currentId === this.teamId &&
                  this.teamList?.length > 0 &&
                  this.chooseTeam(this.teamList[0])
              }
            }
          },
        },
      )
    },
    // 退出团队
    exitTeam(name) {
      this.$confirm(
        `${i18n.t('是否要退出')}"${name}"${i18n.t('团队')}？`,
        i18n.t('提示'),
        {
          type: 'warning',
          callback: async action => {
            if (action === 'confirm') {
              let res = await this.$store.dispatch('exitTeam', {
                id: this.currentId,
              })

              if (res.status === 200) {
                this.$message({
                  type: 'success',
                  message: i18n.t('退出成功'),
                })

                await this.$store.dispatch('getGroupList')
                // TODO 退出选中的团队后，默认选中第一个团队
                this.currentId === this.teamId &&
                  this.teamList?.length > 0 &&
                  this.chooseTeam(this.teamList[0])
              }
            }
          },
        },
      )
    },
    // 团队操作
    teamEdit(obj) {
      const { command, id, name } = obj
      this.currentId = id
      if (command === 'rename') {
        // todo 重命名团队
        this.teamName = name
        this.teamEditModel = true
        this.teamEditType = 'update'
        this.teamEditTitle = i18n.t('重命名团队')
      } else if (command === 'manage') {
        // todo 团队管理
        this.teamManageModel = true
        this.showLoading = true
        this.getCurrentGroupPersonList()
      } else if (command === 'remove') {
        // todo 删除团队
        this.deleteTeam(name)
      } else {
        // todo 退出团队
        this.exitTeam(name)
      }
    },
    // 创建 or 重命名团队
    submitTeamEdit(obj) {
      if (obj.value) {
        this.teamName = obj.value
        this.teamEditType === 'new' && this.postCreateGroup()
        this.teamEditType === 'update' && this.postUpdateGroupName()
        this.teamEditModel = false
      } else {
        this.$alert(i18n.t('团队名称不能为空'), i18n.t('提示'), {
          showClose: false,
        })
      }
    },
    // 创建团队
    async postCreateGroup() {
      const res = await this.$store.dispatch('postCreateGroup', {
        name: this.teamName,
      })

      if (res.status === 200) {
        this.teamEditModel = false
        this.teamName = ''
        this.$store.dispatch('getGroupList')
        this.chooseTeam({ id: res.data })
        this.$message({
          type: 'success',
          message: i18n.t('创建成功'),
        })
      }
    },
    // 重命名团队
    async postUpdateGroupName() {
      const res = await this.$store.dispatch('postUpdateGroupName', {
        id: this.currentId,
        name: this.teamName,
      })

      if (res.status === 200) {
        this.teamEditModel = false
        this.teamName = ''
        this.$store.dispatch('getGroupList')
        this.$message({
          type: 'success',
          message: i18n.t('重命名成功'),
        })
      }
    },
    // 获取当前团队成员
    async getCurrentGroupPersonList() {
      await this.$store.dispatch('getGroupPersonList', {
        id: this.currentId,
      })

      this.showLoading = false
    },
    // 更新团队成员
    submitUpdateGroupPerson() {
      let userIdList = this.selectedList.map(item => item.userId)
      this.$store
        .dispatch('postUpdateGroupPerson', {
          id: this.currentId,
          userIdList,
        })
        .then(res => {
          if (res.status === 200) {
            this.currentId === this.teamId &&
              this.$store.dispatch('getMemberViewList')
            this.teamManageModel = false
            this.$message({
              type: 'success',
              message: i18n.t('更新成功'),
            })
          }
        })
    },
  },
}
</script>

<style scoped lang="scss">
ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;
}
.manage-left {
  .group {
    padding: 0 10px;
  }
  .department {
    padding: 0 10px;
  }
}
</style>
