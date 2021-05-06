<template>
  <TwoColsLayout v-if="!isTeamEmpty" class="tfs-defect-list__container">
    <div slot="left" class="team-tree-box">
      <DefectTeamTree
        :team-tree-data="teamTreeData"
        :current-node-key="currentNodekey"
        show-summary-count
        :expand-on-click-node="false"
        @node-click="onNodeClick"
      ></DefectTeamTree>
    </div>
    <DefectList slot="right"></DefectList>
  </TwoColsLayout>
  <DataEmptyPage
    v-else
    :img-src="emptyImg"
    msg="暂未查询到缺陷列表相关数据"
  ></DataEmptyPage>
</template>
<script>
/**
 * @title tfs缺陷列表
 * @author wuqian
 * @date 2020.8.5
 */
import { mapState } from 'vuex'
import { tfsDefectMutation } from '@/store/mutation-types'
import { tfsDefectAction } from '@/store/action-types'
import TwoColsLayout from '@/components/two-cols-layout'
import DefectList from './DefectList'
import DefectTeamTree from '../DefectTeamTree'
import DataEmptyPage from '../DataEmptyPage'
import emptyImg from '@/assets/no-data.png'

export default {
  name: 'DefectListRoot',
  components: { TwoColsLayout, DefectList, DefectTeamTree, DataEmptyPage },
  data() {
    return {
      currentNodekey: null,
      emptyImg,
    }
  },
  computed: {
    ...mapState({
      currentListTreeNodeKey: state => state.tfsCommon.currentListTreeNodeKey,
      filterInfo: state => state.tfsDefect.filterInfo,
      teamTreeData: state => state.tfsCommon.tfsModules,
      isTeamEmpty: state => state.tfsCommon.teamEmpty.isEmpty,
    }),
    // layoutHeight() {
    //   return window.innerHeight - 108
    // },
  },
  watch: {
    currentListTreeNodeKey(val) {
      if (this.currentNodekey === val) return
      this.currentNodekey = val
    },
  },
  mounted() {
    this.currentNodekey = this.currentListTreeNodeKey
  },
  methods: {
    onNodeClick(treeNode) {
      this.$store.commit(tfsDefectMutation.UPDATE_TFS_MODULES_LIST, {
        key: 'currentListTreeNodeKey',
        treeNodeKey: treeNode.key,
      })
      let filterInfo = { ...this.filterInfo }
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
      this.$updateRouteQuery(filterInfo, { replace: true })
      this.$store.dispatch(tfsDefectAction.GET_TFS_DEFECT_LIST, {
        filterInfo,
        pageInfo: {},
      })
    },
  },
}
</script>
