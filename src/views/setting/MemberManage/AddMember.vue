<template>
  <!-- 人员管理弹窗 -->
  <el-dialog
    id="bizOpsMemberDialog"
    :title="managementTitle"
    class="el-dialog-350w"
    :before-close="closePersonnelDuty"
    :visible.sync="addDialogShow"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :width="$isEnglish() ? '450px' : '350px'"
  >
    <div class="form-iterm-box">
      <el-form :label-width="$isEnglish() ? '160px' : '80px'">
        <el-form-item :label="$t('姓名/工号')">
          <el-select
            v-model="userIds"
            v-focus
            :placeholder="$t('请输入姓名或工号')"
            :disabled="disabled"
            :popper-append-to-body="true"
            filterable
            remote
            clearable
            :remote-method="searchPersonnelManagement"
            :loading="loading"
            style="width:100%;"
            @change="changeUser"
          >
            <template v-for="item in userList">
              <el-option
                :key="item.userId"
                :label="item.userName"
                :value="item.userId"
              >
                <span style="float: left">{{ item.userName }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px;">{{
                  item.userId
                }}</span>
              </el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('职责')">
          <el-select
            v-model="roles"
            style="width:100%"
            multiple
            filterable
            :popper-append-to-body="true"
          >
            <el-option
              v-for="item in personnelDutylist"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closePersonnelDuty">{{ $t('关闭') }}</el-button>
      <el-button
        type="primary"
        :loading="confirmLoading"
        @click="addPersonnelDuty"
        >{{ $t('保存') }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { i18n } from '@/i18n'
import { userSearch } from '@/service/common/user'
import { userProjectRoles } from '@/service/project/projectCommon'
import debounce from 'lodash/debounce'
export default {
  name: 'AddMember',
  props: {
    addDialogShow: {
      type: Boolean,
      default: false,
    },
    personnelDutylist: {
      type: Array,
      dec: '角色列表',
      default: () => [],
    },
    managementTitle: {
      type: String,
      dec: '弹框名称',
      default: '',
    },
    userInfo: {
      type: Object,
      dec: '编辑人员数据',
      default: () => null,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      confirmLoading: false,
      disabled: false, //是否禁用选择
      loading: false, //是否搜索人员中
      userList: [], //搜索出的人员列表
      userIds: '', //选择用户列表
      roles: [], //选择的角色列表
    }
  },
  watch: {
    // 关闭弹框后数据初始化
    addDialogShow(bol) {
      !bol && Object.assign(this.$data, this.$options.data())
      if (bol && this.isEdit) {
        this.userList = [this.userInfo]
        this.userIds = this.userInfo.userId
        this.roles = this.userInfo.roles.map(item => +item.roleId)
        this.disabled = true
      }
    },
    // 监听是否编辑人员信息
    userInfo(data) {
      this.userList = [data]
      this.userIds = data.userId
      this.roles = data.roles.map(item => +item.roleId)
      this.disabled = true
    },
  },
  methods: {
    // 搜索人员
    searchPersonnelManagement: debounce(async function(query) {
      if (query !== '') {
        this.loading = true
        let res = {}
        try {
          res = await userSearch({ keyword: query })
        } catch (error) {
          res.status = 0
        }

        if (res.status === 200 && res.data) {
          this.userList = res.data
        }

        this.loading = false
      }
    }, 300),
    // 选择人员
    changeUser: debounce(async function(userId) {
      let res = {}
      try {
        res = await userProjectRoles({
          projectId: this.$route.query.projectId,
          userId,
        })
      } catch (error) {
        res.status = 0
      }

      if (res.status === 200 && res.data) {
        this.roles = res.data.map(item => item.groupId)
      }
    }, 300),
    // 关闭弹窗
    closePersonnelDuty() {
      this.$emit('closePersonnelDuty')
    },
    // 添加人员
    addPersonnelDuty() {
      if (this.roles.length && this.userIds.length) {
        this.confirmLoading = true
        this.$emit(
          'confirm',
          {
            userIds: [this.userIds],
            roles: this.roles,
          },
          true,
        )
      } else {
        this.$message({
          message: i18n.t(
            this.userIds.length ? '职责不能为空' : '姓名/工号不能为空',
          ),
          type: 'warning',
        })
      }
    },
  },
}
</script>
