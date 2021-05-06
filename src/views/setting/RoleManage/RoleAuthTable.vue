<template>
  <div
    v-loading="loading"
    class="auth-box"
    element-loading-text
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
  >
    <header>{{ currentRoleInfo.value }}</header>
    <div>
      <el-table :data="authTable" style="width: 100%">
        <el-table-column
          prop="name"
          :label="$t('操作对象')"
          width="180"
        ></el-table-column>
        <el-table-column :label="$t('权限')" min-width="180">
          <template slot-scope="scope">
            <el-checkbox
              v-for="item in scope.row.authList"
              :key="item.authId"
              v-model="item.authorized"
              :disabled="!updateAble"
              class="auth-item-next-select"
              :title="item.authName"
              @change="
                value => {
                  itemSelect(scope.row)
                }
              "
              >{{ item.authName }}</el-checkbox
            >
          </template>
        </el-table-column>
        <el-table-column :label="$t('全选')" width="100">
          <template slot-scope="scope">
            <el-checkbox
              v-model="scope.row.operate"
              :disabled="!updateAble"
              @change="
                value => {
                  allSelect(value, scope.row)
                }
              "
            ></el-checkbox>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <footer>
      <el-button
        type="primary"
        :disabled="!updateAble"
        @click="updateAuthList"
        >{{ $t('保存') }}</el-button
      >
    </footer>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { mapActions } from 'vuex'
import { authFunctionList, authFunctionUpdate } from '@/service/auth-custom'
/**
 * @title
 * @desc
 * @author heyunjiang
 * @date
 */
export default {
  name: 'RoleAuthTable',
  components: {},
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
      authTable: [],
      loading: false,
    }
  },
  computed: {
    updateAble() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_SETTING_ROLE_MANAGE_FUNCTION_UPDATE',
        3,
        this.projectId,
      )
    },
  },

  watch: {
    currentRoleInfo() {
      if (this.currentRoleInfo.key) {
        this.getAuthList()
      }
    },
  },

  created() {},
  methods: {
    ...mapActions(['getUserInfo']),
    // 获取权限列表
    async getAuthList() {
      let result = {}
      try {
        this.loading = true
        result = await authFunctionList({
          projectId: this.projectId || this.$getUrlParams().projectId,
          roleId: this.currentRoleInfo.key,
        })
        const { status, data } = result || {}
        if (status === 200) {
          this.authTable = Object.keys(data).map(name => ({
            name,
            authList: data[name],
            operate: this.computedSelectAll(data[name]),
          }))
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    // 更新权限列表数据
    async updateAuthList() {
      let result = {}
      try {
        this.loading = true
        let functionIdList = []
        this.authTable.forEach(item => {
          item.authList.forEach(jtem => {
            jtem.authorized && functionIdList.push(jtem.authId)
          })
        })
        result = await authFunctionUpdate({
          projectId: this.projectId || this.$getUrlParams().projectId,
          roleId: this.currentRoleInfo.key,
          functionIdList,
        })
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '更新权限列表数据失败',
        //   type: 'error'
        // })
        return
      } else {
        this.$message({
          message: result.msg || i18n.t('更新权限列表数据成功'),

          type: 'success',
        })

        this.getAuthList()
        // 获取用户信息
        this.getUserInfo()
      }
    },
    // 某一项选中/反选 - 计算全选
    itemSelect(info) {
      info.operate = this.computedSelectAll(info.authList)
    },
    // 全选选中/反选 - 计算全选后续操作
    allSelect(value, info) {
      info.authList = info.authList.map(item => {
        return {
          ...item,
          authorized: value,
        }
      })
      info.operate = value
    },
    // 全选计算
    computedSelectAll(list) {
      if (!Array.isArray(list)) {
        return false
      }
      if (list.some(item => !item.authorized)) {
        return false
      }
      return true
    },
  },
}
</script>
<style lang="scss" scoped>
.auth-box {
  header {
    margin-bottom: 5px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
  }
  footer {
    margin: 10px 0;
    height: 50px;
    line-height: 50px;
    text-align: left;
  }
  .auth-item-next-select {
    margin: 0;
    display: inline-block;
    width: 150px;
    padding: 0 5px 0 0;
    box-sizing: border-box;
    /deep/ .el-checkbox__label {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
      position: relative;
      top: -2px;
    }
  }
}
</style>
