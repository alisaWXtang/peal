<template>
  <div class="role-box">
    <div class="role-list">
      <role-list
        :project-id="projectId"
        @avtiveRoleChange="avtiveRoleChange"
      ></role-list>
    </div>
    <div class="role-right">
      <div class="role-member">
        <role-member
          :project-id="projectId"
          :current-role-info="currentRoleInfo"
        ></role-member>
      </div>
      <div class="role-auth-table">
        <role-auth-table
          :project-id="projectId"
          :current-role-info="currentRoleInfo"
        ></role-auth-table>
      </div>
    </div>
  </div>
</template>
<script>
// import { i18n } from '@/i18n'
/**
 * @title 项目内角色管理 - 入口文件
 * @desc
 * @author heyunjiang
 * @date
 */
import RoleList from './RoleList'
import RoleMember from './RoleMember'
import RoleAuthTable from './RoleAuthTable'

export default {
  name: 'RoleManage',
  components: {
    RoleList,
    RoleMember,
    RoleAuthTable,
  },

  mixins: [],
  props: {},
  data() {
    return {
      projectId: this.$getUrlParams().projectId,
      currentRoleInfo: {},
    }
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    // 更新当前选中角色
    avtiveRoleChange(value) {
      this.currentRoleInfo = {
        ...value,
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.role-box {
  display: flex;
  .role-list {
    width: 200px;
  }
  .role-right {
    width: calc(100% - 200px);
    padding-left: 20px;
    box-sizing: border-box;
    .role-auth-table {
      margin-top: 20px;
    }
  }
}
</style>
