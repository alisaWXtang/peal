<template>
  <div
    v-loading="loading"
    class="manage-view__project"
    :class="{ 'manage-view__notManager': !isManager }"
  >
    <TwoColsLayout>
      <co-tabs
        slot="left"
        class="department"
        :value="activeTab"
        stretch
        @tab-click="handleTabClick"
      >
        <co-tab-pane v-if="isManager" :label="$t('部门')" name="department">
          <company-list></company-list>
        </co-tab-pane>
        <co-tab-pane :label="$t('项目标签')" name="tag">
          <label-list @labelManage="labelManage"></label-list>
        </co-tab-pane>
      </co-tabs>
      <ProjectList
        slot="right"
        @labelManage="labelManage"
        @onGoingSprintCountClick="onGoingSprintCountClick"
        @participantsCountClick="participantsCountClick"
      ></ProjectList>
    </TwoColsLayout>
    <label-project
      :id="labelIdforProject"
      :visible.sync="labelProjectDialogVisible"
    ></label-project>
    <!-- 弹窗组件 -->
    <pop-list
      v-if="ifShowTablePopList"
      pop-list-type="sprintPop"
      :show-over-tip="showOverFlowTip"
      @popListCurrentChange="popListCurrentChange"
    >
    </pop-list>
  </div>
</template>

<script>
/**
 * @title 管理者视图 - 项目视图
 * @desc 这里取代了原项目列表
 * @author heyunjiang
 * @date 2020.4.10
 */
import { mapState } from 'vuex'
import CONSTVARLIABLE from '@/store/mutation-types'
import PopList from '@/components/pop-list'
import TwoColsLayout from '@/components/two-cols-layout'
import ProjectList from './list'
import LabelList from './LabelList'
import CompanyList from './CompanyList'
import LabelProject from './LabelProject'

export default {
  name: 'ProjectView',
  components: {
    TwoColsLayout,
    ProjectList,
    LabelList,
    CompanyList,
    LabelProject,
    PopList,
  },

  data() {
    return {
      labelProjectDialogVisible: false, // 标签选择项目 dialog
      labelIdforProject: null, // 标签 id
      // 迭代弹窗是所选的项目id，用于分页展示的参数
      popListSelectedProjectId: null,
      // 弹窗内容是否隐藏
      showOverFlowTip: true,
    }
  },
  computed: {
    ...mapState({
      activeTab: state => state.manageViewProject.activeTab,
      loading: state => state.manageViewProject.loading,
      isManager: state => state.gd.isManager,
    }),

    ifShowTablePopList() {
      return this.$store.state.manageViewPopList.ifShowTablePopList
    },
  },

  mounted() {
    // 初始化
    this.$store.dispatch('projectInitData')
  },
  methods: {
    // 点击左侧顶部 tab 切换
    handleTabClick({ name }) {
      this.countlyLog(`manage_project_${name}`)
      // 更新当前活跃 tab
      this.$store.commit({
        type: CONSTVARLIABLE.UPDATE_MANAGEVIEW_PROJECT_ACTIVETAB,
        activeTab: name,
      })

      // 更新项目列表
      this.$store.dispatch('getManageViewProjectList', {
        filterInfo: {
          status: -1,
          keyword: '',
          pageInfo: {
            ...this.$store.state.manageViewProject.filterInfo.pageInfo,
            pageNumber: 1,
          },
        },
      })
    },
    // 管理标签
    labelManage(id) {
      this.labelIdforProject = id
      this.labelProjectDialogVisible = true
    },
    // 查看迭代
    onGoingSprintCountClick(info) {
      this.showOverFlowTip = true
      const {
        data: { projectId },
      } = info
      this.popListSelectedProjectId = projectId
      this.$store.dispatch('getProjectSprintPopList', { projectId })
    },
    // 查看人员
    participantsCountClick(info) {
      this.showOverFlowTip = false
      const {
        data: { projectId },
      } = info
      this.$store.dispatch('getProjectParticipatePopList', { projectId })
    },
    // 弹窗分页请求
    async popListCurrentChange(num) {
      await this.$store.dispatch('getProjectSprintPopList', {
        projectId: this.popListSelectedProjectId,
        pageNumber: num,
        isPagination: true,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
// .department {
//   height: 100%;
// }
</style>
