<template>
  <div
    v-loading="loading"
    element-loading-text
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
  >
    <select-list
      :list-data="roleList"
      :active-obj="activeObj"
      :click-callback="clickCallback"
      :add-able="addAble"
      @edit="editCallback"
      @delete="deleteCallback"
      @add="addCallback"
    ></select-list>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import SelectList from '@/components/select-list'
import {
  authRoleList,
  authRoleUpdate,
  authRoleAdd,
  authRoleDelete,
} from '@/service/auth-custom'
export default {
  name: 'RoleList',
  components: {
    SelectList,
  },

  mixins: [],
  props: {
    projectId: {
      type: [String, Number],
      required: false,
    },
  },

  data() {
    return {
      roleList: [],
      activeObj: {},
      loading: false,
    }
  },
  computed: {
    addAble() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_SETTING_ROLE_MANAGE_ADD',
        3,
        this.projectId,
      )
    },
    deleteAble() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_SETTING_ROLE_MANAGE_DELETE',
        3,
        this.projectId,
      )
    },
    updateAble() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_SETTING_ROLE_MANAGE_UPDATE',
        3,
        this.projectId,
      )
    },
  },

  watch: {},
  mounted() {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      let result = {}
      try {
        this.loading = true
        result = await authRoleList({
          projectId: this.projectId || this.$getUrlParams().projectId,
        })
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '获取角色列表数据失败',
        //   type: 'error'
        // })
        return
      }
      this.roleList = result.data.map(item => {
        return {
          key: item.roleId,
          value: item.roleName,
          editable: !item.isSystem && this.updateAble,
          deleteAble: !item.isSystem && this.deleteAble,
          ...item,
        }
      })
      if (
        Object.keys(this.activeObj).length === 0 &&
        this.roleList.length > 0
      ) {
        this.activeObj = this.roleList[0]
        this.$emit('avtiveRoleChange', this.roleList[0])
      }
    },
    // 单击某一项
    clickCallback(info) {
      if (!this.activeObj.key || this.activeObj.key !== info.key) {
        this.activeObj = { ...info }
        this.$emit('avtiveRoleChange', info)
      }
    },
    // 更新某一项
    async editCallback(info) {
      let result = {}
      try {
        this.loading = true
        result = await authRoleUpdate({
          projectId: this.projectId || this.$getUrlParams().projectId,
          id: info.key,
          name: info.value,
        })
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '更新角色失败',
        //   type: 'error'
        // })
        return
      } else {
        this.$message({
          message: result.msg || i18n.t('更新角色成功'),
          type: 'success',
        })

        this.getRoleList()
      }
    },
    // 删除某一项
    async deleteCallback(info) {
      const confirmResult = await this.$confirmBeforeOperate(
        `${i18n.t('确认删除角色')}${info.value}${i18n.t('吗')}？`,
      )

      if (!confirmResult) {
        return false
      }
      let result = {}
      try {
        this.loading = true

        result = await authRoleDelete({
          roleId: info.key,
          projectId: this.projectId || this.$getUrlParams().projectId,
        })
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        this.$message({
          message: result.msg || i18n.t('删除角色失败'),
          type: 'error',
        })

        return
      } else {
        this.$message({
          message: result.msg || i18n.t('删除角色成功'),
          type: 'success',
        })

        this.activeObj = {}
        this.getRoleList()
      }
    },
    // 新增
    async addCallback(value) {
      let result = {}
      try {
        this.loading = true

        result = await authRoleAdd({
          name: value,
          projectId: this.projectId || this.$getUrlParams().projectId,
        })
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '新增角色失败',
        //   type: 'error'
        // })
        return
      } else {
        this.$message({
          message: result.msg || i18n.t('新增角色成功'),
          type: 'success',
        })

        this.getRoleList()
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
