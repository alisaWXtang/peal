<template>
  <div class="department-box">
    <company-tree
      class="department-tree-box"
      show-star
      :star-key-name="$t('我关注的项目')"
      :current-node-key="departmentId"
      @node-click="clickCallback"
    ></company-tree>
  </div>
</template>
<script>
/**
 * @title 部门组件树
 * @desc
 * @author heyunjiang
 * @date 2020.4.13
 */
import CompanyTree from '@/components/biz/company-tree'
import { mapState } from 'vuex'

export default {
  name: 'CompanyList',
  components: {
    CompanyTree,
  },

  mixins: [],
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapState({
      departmentId: state => {
        return state.manageViewProject.filterInfo.departmentId ?? -1
      },
    }),
  },

  watch: {},
  created() {},
  mounted() {},
  methods: {
    // 单击某一项
    clickCallback(info) {
      if (this.departmentId !== info.id) {
        this.$store.dispatch({
          type: 'getManageViewProjectList',
          filterInfo: {
            departmentId: info.id === -1 ? null : info.id,
            toFollow: info.id === -1,
            status: -1,
            keyword: '',
            pageInfo: {
              ...this.$store.state.manageViewProject.filterInfo.pageInfo,
              pageNumber: 1,
            },
          },
        })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.department-box {
  padding: 0 10px;
  .department-tree-box {
    width: 100%;
    overflow-x: auto;
  }
  /deep/ .el-tree {
    height: calc(100vh - 260px);
    overflow-y: auto;
  }
}
</style>
