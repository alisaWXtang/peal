<template>
  <div class="defect-team-tree__container">
    <co-tree
      ref="tree"
      v-bind="$attrs"
      class="filter-tree scrollbal-common"
      :class="{ 'filter-tree-noicon': !showIcon }"
      node-key="key"
      :data="currentTreeData"
      :props="defaultProps"
      highlight-current
      empty-text=""
      :current-node-key="currentNodeKey"
      :render-content="renderContent"
      :default-expanded-keys="expandedKeys"
      v-on="$listeners"
    ></co-tree>
  </div>
</template>
<script>
/**
 * @title tfs团队/模块 树形控件
 * @author wuqian
 */
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'DefectTeamTree',
  props: {
    teamTreeData: {
      type: [Array],
      default: () => [],
      desc: '树形列表',
    },
    currentNodeKey: {
      type: [String],
      required: false,
      desc: '当前活跃的 key',
    },
    showSummaryCount: {
      type: [Boolean],
      required: false,
      desc: '是否显示 label 统计 count',
    },
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      currentTreeData: [],
      currentSummary: {},
    }
  },
  computed: {
    summary() {
      return this.$store.state.tfsDefect.summary
    },
    showIcon() {
      return this.currentTreeData.find(item => item.children?.length)
    },
    // 默认展开节点数组
    expandedKeys() {
      const keys = this._treeParentKey(
        this.currentTreeData,
        this.currentNodeKey,
      )
      return keys ? [keys] : []
    },
  },
  watch: {
    // teamTreeData(treeData) {
    //   this.currentTreeData = this.showSummaryCount ? this.getTeamTreeData({ tree: treeData, summary: this.summary }) : treeData;
    //   this.setCurrentKey();
    // },
    teamTreeData: {
      handler(treeData) {
        this.currentTreeData = this.showSummaryCount
          ? this.getTeamTreeData({ tree: treeData, summary: this.summary })
          : treeData
        this.setCurrentKey()
      },
      immediate: true,
    },
    currentNodeKey() {
      this.$refs.tree.setCurrentKey(this.currentNodeKey)
    },
    summary(summary) {
      if (isEqual(summary, this.currentSummary)) return
      this.currentSummary = { ...summary }
      if (this.showSummaryCount) {
        this.currentTreeData = this.getTeamTreeData({
          tree: this.teamTreeData,
          summary,
        })
        this.setCurrentKey()
      }
    },
  },
  methods: {
    setCurrentKey() {
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(this.currentNodeKey)
      })
    },
    getTeamTreeData({ tree, summary }) {
      const _tree = cloneDeep(tree)
      const setTreeNodeCount = tree => {
        tree.forEach(item => {
          item.count = summary[item.key]
          item.children?.length && setTreeNodeCount(item.children)
        })
      }
      setTreeNodeCount(_tree)
      return _tree
    },
    // 查找选中值的父节点 - 设置默认展开
    _treeParentKey(tree, key) {
      if (!Array.isArray(tree) || !tree.length) return
      const result = tree.find(item => item.key === key)
      let parentId
      if (result) {
        const nodeParentId = result.parentId
        parentId = nodeParentId ? `${nodeParentId}:${result.id}` : result.key
      } else {
        for (let i = 0; i < tree.length; i++) {
          const current = this._treeParentKey(tree[i].children, key)
          if (current) {
            parentId = current
            break
          }
        }
      }
      return parentId || ''
    },
    renderContent(h, { data }) {
      const getLabel = () => {
        return this.showSummaryCount
          ? `${data.name}(${data.count || 0})`
          : data.name
      }
      const style = this.showIcon
        ? 'width: calc(100% - 24px);'
        : 'width: calc(100% - 19px);'
      return (
        <span class="ellipsis-pure" style={style} title={getLabel()}>
          {getLabel()}
        </span>
      )
    },
  },
}
</script>
<style lang="scss" scoped>
// @import '@/base/style/ele-variables';
// 保持全局统一样式
.defect-team-tree__container {
  /deep/ .el-tree-node__content > .el-tree-node__expand-icon {
    padding: 0 6px 0 0;
  }

  /deep/ .el-tree-node__content {
    height: 32px;
    color: $--color-text-fine;

    &:hover {
      // color: $--color-primary;
      background-color: $--background-gray;
    }
  }

  /deep/
    .el-tree--highlight-current
    .el-tree-node.is-current
    > .el-tree-node__content {
    color: $--color-primary;
    background-color: $--color-primary-light-9;

    .el-tree-node__expand-icon:not(.is-leaf) {
      color: $--color-primary;
    }
  }
  // 隐藏 icon
  .filter-tree-noicon {
    /deep/ .el-tree-node__expand-icon.is-leaf {
      width: 15px;
      padding: 0;
    }
  }
}
</style>
