<template>
  <TwoColsLayout v-if="!isTeamEmpty" class="tfs-kanban__container">
    <div
      slot="left"
      class="team-tree-box"
      :style="{ height: layoutHeight - 60 + 'px' }"
    >
      <DefectTeamTree
        :team-tree-data="teamTreeData"
        :current-node-key="currentNodekey"
        @node-click="onNodeClick"
      ></DefectTeamTree>
    </div>
    <div slot="right" class="kanban-layout">
      <KanbanLayout ref="kanbanLayout"></KanbanLayout>
    </div>
  </TwoColsLayout>
  <DataEmptyPage
    v-else
    :style="{ height: layoutHeight + 'px' }"
    :img-src="emptyImg"
    msg="暂未查询到看板相关数据"
  ></DataEmptyPage>
</template>

<script>
import { mapState } from 'vuex'
import TwoColsLayout from '@/components/two-cols-layout'
import KanbanLayout from './KanbanLayout'
import DefectTeamTree from '../DefectTeamTree'
import DataEmptyPage from '../DataEmptyPage'
import { tfsDefectMutation } from '@/store/mutation-types'
import { tfsDefectAction } from '@/store/action-types'
import emptyImg from '@/assets/kanban-empty.png'
// import { kanbanTypes } from './util'
export default {
  name: 'KanbanRoot',
  components: { TwoColsLayout, KanbanLayout, DefectTeamTree, DataEmptyPage },
  data() {
    return {
      currentNodekey: null,
      emptyImg,
    }
  },
  computed: {
    ...mapState({
      currentKanbanTreeNodeKey: state =>
        state.tfsCommon.currentKanbanTreeNodeKey,
      filterInfo: state => state.tfsKanban.filterInfo,
      teamTreeData: state => state.tfsCommon.tfsModules,
      isTeamEmpty: state => state.tfsCommon.teamEmpty.isEmpty,
    }),
    layoutHeight() {
      return window.innerHeight - 108
    },
  },
  watch: {
    currentKanbanTreeNodeKey(val) {
      if (this.currentNodekey === val) return
      this.currentNodekey = val
    },
  },
  async mounted() {
    this.currentNodekey = this.currentKanbanTreeNodeKey
  },
  methods: {
    onNodeClick(treeNode) {
      if (treeNode.belongTeam) return
      this.$store.commit(tfsDefectMutation.UPDATE_TFS_MODULES_LIST, {
        currentKanbanTreeNodeKey: treeNode.key,
      })
      let filterInfo = {
        ...this.filterInfo,
        projectCodes: [],
      }
      // 选中团队
      if (treeNode.belongTeam) {
        filterInfo = {
          ...filterInfo,
          teamId: treeNode.id,
        }
        delete filterInfo.moduleId
      } else {
        filterInfo = {
          ...filterInfo,
          teamId: treeNode.parentId,
          moduleId: treeNode.id,
        }
      }
      this.$refs.kanbanLayout && (this.$refs.kanbanLayout.$el.scrollTop = 0)
      this.$store.dispatch(tfsDefectAction.GET_TSF_KANBAN_CARDS_DATA, {
        filterInfo,
      })
    },
  },
}
</script>
