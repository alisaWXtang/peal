<template>
  <div class="department-box">
    <company-tree
      class="department-tree-box"
      show-star
      :star-key-name="$t('我关注的成员')"
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
      defaultFilterInfo: state => state.manageViewMember.defaultFilterInfo,
      departmentId: state =>
        state.manageViewMember.filterInfo.departmentId || -1,
    }),
  },

  watch: {},
  created() {},
  mounted() {},
  methods: {
    // 单击某一项
    clickCallback(info) {
      if (this.departmentId !== info.id) {
        // toFollow：已关注的成员
        const filterInfo =
          info.id === -1
            ? {
                toFollow: true,
                departmentId: null,
              }
            : {
                toFollow: false,
                departmentId: info.id,
              }

        this.$store.dispatch('getMemberViewList', {
          ...this.defaultFilterInfo,
          ...filterInfo,
        })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.department-box {
  .department-tree-box {
    width: 100%;
    overflow-x: auto;
  }
  // /deep/ .el-tree {
  //   height: calc(100vh - 260px);
  //   overflow-y: auto;
  // }
}
</style>
