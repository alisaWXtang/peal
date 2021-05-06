<template>
  <div>
    <div class="report-module-title">{{ $t('发送消息') }}</div>
    <el-form
      ref="messageForm"
      :model="messageForm"
      :rules="rules"
      :label-width="$isEnglish() ? '100px' : '80px'"
      size="medium"
      class="form-dynamic"
      @submit.native.prevent
    >
      <el-form-item
        ref="theme"
        class="l-h-30"
        prop="theme"
        :label="`${$t('邮件主题')}`"
      >
        <el-input
          v-model="messageForm.theme"
          :placeholder="$t('请输入邮件主题')"
        ></el-input>
      </el-form-item>
      <el-form-item
        ref="senderForm"
        class="l-h-30"
        prop="sender"
        :label="`${$t('收件人')}`"
      >
        <!-- <div class="member-list" @click="selectSenderCC('添加收件人', 'senderList')">
          <span v-if="!senderList.length" class="sender-placeholder">
            请选择收件人
          </span>
          显示工号和姓名
          <el-tag
            class="m-l-5"
            v-for="(tag, index) in senderList"
            :key="index"
            type="info"
            >
            <span>{{tag.userName}} ({{tag.userId}});</span>
            <i class="el-icon-error" @click.stop="deleteTag('senderList', index)"></i>
          </el-tag>
        </div> -->
        <global-user-select
          v-model="messageForm.sender"
          :placeholder="$t('可直接输入收件人姓名、工号、邮箱，限30人')"
          multiple
          :allow-custom="true"
          :max-count="30"
          :default-user-list="projectAllMember"
          env-type="DEFAULT"
        ></global-user-select>
        <i
          class="iconfont icon-tianjiarenyuan icon-position"
          @click="selectSenderCC($t('添加收件人'), 'senderList')"
        ></i>
      </el-form-item>
      <el-form-item class="l-h-30" :label="`${$t('抄送人')}`">
        <!-- <div class="member-list" @click="selectSenderCC('添加抄送人', 'carbonCopyList')">
          <span v-if="!carbonCopyList.length" class="sender-placeholder">
            请选择抄送人
          </span>
          <el-tag
            class="m-l-5"
            v-for="(tag, index) in carbonCopyList"
            :key="index"
            type="info"
            >
            <span>{{tag.userName}} ({{tag.userId}});</span>
            <i class="el-icon-error" @click.stop="deleteTag('carbonCopyList', index)"></i>
          </el-tag>
        </div> -->
        <global-user-select
          v-model="messageForm.copySender"
          :placeholder="$t('可直接输入收件人姓名、工号、邮箱，限30人')"
          multiple
          :allow-custom="true"
          :max-count="30"
          :default-user-list="projectAllMember"
          env-type="DEFAULT"
        ></global-user-select>
        <i
          class="iconfont icon-tianjiarenyuan icon-position"
          @click="selectSenderCC($t('添加抄送人'), 'carbonCopyList')"
        ></i>
      </el-form-item>
    </el-form>
    <!-- 人员弹窗 -->
    <!-- <el-dialog :title="title" class="el-dialog-350w"
      :before-close="closeDialog"
      :visible.sync="dialogVisible"
      :modal-append-to-body="true"
      :close-on-click-modal='false'>
      <div class="">
        <el-form label-width="80px">
          <el-form-item label="姓名/工号">
            <el-select v-model="personnalName"
              placeholder="请输入姓名或工号"
              :popper-append-to-body="false"
              multiple
              filterable
              remote
              reserve-keyword
              :remote-method="searchPerson"
              :loading="userloading"
              @change="changeVal">
              <template v-for="item in personnalList">
                <el-option v-if="item.status !== 0" :key="item.userId" :label="item.userName"
                :value="item.userId">
                <span style="float: left">{{ item.userName }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px;">{{ item.userId }}</span>
              </el-option>
              </template>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addPerson">保存</el-button>
        <el-button @click="closeDialog">关闭</el-button>
      </span>
    </el-dialog> -->
    <el-dialog
      :title="title"
      :before-close="closeDialog"
      :visible.sync="dialogVisible"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      width="700px"
    >
      <div class="list">
        <div class="role-list">
          <div class="list-title">{{ $t('项目角色') }}</div>
          <ul>
            <li
              v-for="(item, index) in roleList"
              v-show="item.defaultList.length > 0"
              :key="item.roleId"
              :class="{ active: item.active }"
              @click="switchMember(item.roleId, index)"
            >
              <span>{{ item.roleName }}</span>
              <div v-if="item.selectState">
                <i v-if="item.selectState === 'all'" class="el-icon-check"></i>
                <i v-else class="el-icon-minus"></i>
              </div>
            </li>
          </ul>
        </div>
        <div class="person-list">
          <div class="list-title">
            <span>{{ $t('人员预览') }}</span>
            <span>
              <el-button
                v-if="pickAll"
                type="primary"
                @click="selectAllMember"
                >{{ $t('勾选全部项目成员') }}</el-button
              >
              <el-button v-else type="primary" @click="cancelAllMember">{{
                $t('取消全部项目成员')
              }}</el-button>
              <el-button type="primary" @click="sureMember">{{
                $t('添加')
              }}</el-button>
            </span>
          </div>
          <el-table
            ref="memberTable"
            class="table member-table"
            height="400"
            :data="memberList"
            @selection-change="pickMember"
            @select="switchRole = false"
            @select-all="switchRole = false"
          >
            <el-table-column type="selection" align="center" width="100">
            </el-table-column>
            <el-table-column :label="$t('人员')" show-overflow-tooltip>
              <template slot-scope="scope"
                >{{ scope.row.userName }} ({{ scope.row.userId }})
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import GlobalUserSelect from '@/components/global-user-select'
import { userSearch } from '@/service/common/user'
import { projectManagementStaffList } from '@/service/project'
import { authRoleList } from '@/service/auth-custom'

export default {
  name: 'ReportHeader',
  components: {
    GlobalUserSelect,
  },

  mixins: [],
  props: {
    mailTopicName: String, //邮件主题
    mailRecipers: Array, // 收件人
    mailOtherRecipers: Array, // 抄送人
  },
  data() {
    return {
      dialogVisible: false,
      userloading: false,
      pickAll: true,
      projectAllMember: [], // 项目成员
      roleList: [], // 项目角色列表
      memberList: [], // 成员列表
      currentRoleId: '', // 当前角色id
      switchRole: false,
      list: [], //存放选中人员信息
      personnalName: [], //下拉框选中
      personnalList: [], //  人员列表
      title: '',
      dialogKey: 'senderList', //保存区分抄送人 发送人
      messageForm: {
        theme: this.mailTopicName,
        sender: this.mailRecipers || [],
        copySender: this.mailOtherRecipers || [],
      },

      rules: {
        theme: [
          {
            required: true,
            message: i18n.t('请输入邮件主题'),
            trigger: 'blur',
          },
        ],
        sender: [
          {
            required: true,
            message: i18n.t('请选择收件人'),
            trigger: 'change',
          },
        ],
      },
    }
  },
  watch: {
    'messageForm.theme'(val) {
      if (val) {
        this.$refs.theme.clearValidate()
      }
      this.$emit('update:mailTopicName', val)
    },
    mailTopicName(val) {
      this.messageForm.theme = val
    },
    mailRecipers: {
      deep: true,
      handler(val) {
        this.messageForm.sender = val
      },
    },

    mailOtherRecipers: {
      deep: true,
      handler(val) {
        this.messageForm.copySender = val
      },
    },

    'messageForm.sender'(val) {
      this.$emit('update:mailRecipers', val)
      val = val ? val : []
      if (val.length) {
        this.$refs.senderForm.clearValidate()
      }
    },
    'messageForm.copySender'(val) {
      this.$emit('update:mailOtherRecipers', val)
    },
    dialogVisible(val) {
      let count = 0
      if (val) {
        // 初始化
        let persons =
          this.dialogKey === 'senderList'
            ? this.responseParamsFormat(this.messageForm.sender)
            : this.responseParamsFormat(this.messageForm.copySender)
        if (persons.length > 0) {
          this.roleList.forEach(item => {
            item.select = []
            persons.forEach(jtem => {
              if (
                jtem.roles
                  .map(role => Number(role.roleId))
                  .includes(Number(item.roleId))
              ) {
                item.select.push(jtem)
                item.select.forEach(row => {
                  let list = this.memberList.find(jtem => {
                    return row.userId === jtem.userId
                  })
                  list &&
                    this.$nextTick(() => {
                      this.$refs.memberTable.toggleRowSelection(list, true)
                    })
                })
              }
              item.selectState =
                item.select.length > 0
                  ? item.select.length === item.defaultList.length
                    ? 'all'
                    : 'has'
                  : ''
            })
            item.selectState === 'all' && item.defaultList.length && count++
          })
        }
        count ===
          this.roleList.length -
            this.roleList.filter(i => i.defaultList.length === 0).length &&
          (this.pickAll = false)
      } else {
        // 重置
        this.cancelAllMember()
      }
    },
  },

  async mounted() {
    await this.postProjectMember()
    this.getProjectRole()
  },
  methods: {
    // dialog - 关闭
    closeDialog() {
      this.personnalName = []
      this.dialogVisible = false
    },
    changeVal(val) {
      const length = val.length - 1
      const val1 = val[length]
      for (let elem of this.personnalList.values()) {
        if (elem.userId === val1) {
          const obj = {
            userId: elem.userId,
            userName: elem.userName,
            userEmail: elem.userEmail,
          }

          this.list.push(obj)
        }
      }
    },
    // 保存人员
    addPerson() {
      const arr = this.personnalName.map(val => {
        for (let elem of this.list.values()) {
          if (elem.userId === val) {
            return elem
          }
        }
      })
      // 根据userId去重
      const userIdArr = this[this.dialogKey].map(v => v.userId)
      if (this[this.dialogKey].length) {
        for (let elem of arr.values()) {
          if (!userIdArr.includes(elem.userId)) {
            this[this.dialogKey].push(elem)
          }
        }
      } else {
        this[this.dialogKey].push(...arr)
      }

      this.dialogKey === 'senderList' && this.validateSender(this.dialogKey)
      this.closeDialog()
    },
    // dialog - 搜索人员 --> 发送人员
    async searchPerson(query) {
      if (query !== '') {
        this.userloading = true
        const res = await userSearch({
          keyword: query,
        })

        this.personnalList = res.data
        this.userloading = false
      }
    },
    // dialog - 搜索人员 --> 抄送人员
    selectSenderCC(title, key) {
      this.title = title
      this.dialogKey = key
      this.dialogVisible = true
      this.list = []
    },
    // 校验
    validateSender(key) {
      if (this[key].length) {
        this.$refs.senderForm.clearValidate()
      } else {
        this.$refs.senderForm.validate()
      }
    },
    // 删除
    deleteTag(key, index) {
      this[key].splice(index, 1)
      key === 'senderList' && this.validateSender(key)
    },
    // 获取项目内成员
    async postProjectMember() {
      const res = await projectManagementStaffList({
        pageInfo: {
          pageNum: 1,
          pageSize: 1000,
        },

        projectId: this.$route.query.projectId,
        query: '',
      })

      if (res.status === 200) {
        this.projectAllMember = res.data.results.map(item => {
          let temp = item
          delete temp.status
          return temp
        })
      }
    },
    // 获取项目内角色
    async getProjectRole() {
      const res = await authRoleList()
      if (res.status === 200) {
        let list = res.data
        let id
        if (list?.length) {
          list.forEach(item => {
            item.defaultList = []
            item.select = []
            item.selectState = ''
            this.projectAllMember.forEach(jtem => {
              if (
                jtem.roles
                  .map(role => Number(role.roleId))
                  .includes(Number(item.roleId))
              ) {
                item.defaultList.push(jtem)
              }
            })
          })
          id = list[0].roleId
          list[0].active = true
          this.roleList = list
          this.currentRoleId = id
          this.getMemberByRole(id)
        }
      }
    },
    // 切换角色
    switchMember(id, idx) {
      let current = this.roleList[idx]
      let select = current.select
      this.roleList.forEach(item => {
        this.$set(item, 'active', false)
      })
      this.$set(current, 'active', true)
      this.currentRoleId = id
      this.getMemberByRole(id)
      this.switchRole = true
      this.$nextTick(() => {
        select.forEach(row => {
          let list = this.memberList.find(jtem => {
            return row.userId === jtem.userId
          })
          list && this.$refs.memberTable.toggleRowSelection(list, true)
        })
      })
    },
    // 根据角色查找项目成员
    getMemberByRole(id) {
      for (let i = 0, len = this.roleList.length; i < len; i++) {
        if (Number(id) === Number(this.roleList[i].roleId)) {
          this.memberList = this.roleList[i].defaultList
          break
        }
      }
    },
    // 成员选择
    pickMember(data) {
      let currentSelect = []
      let changeList = []
      let count = 0
      for (let i = 0, len = this.roleList.length; i < len; i++) {
        if (Number(this.roleList[i].roleId) === Number(this.currentRoleId)) {
          currentSelect = this.roleList[i].select
          // 新增
          if (currentSelect.length < data.length) {
            if (currentSelect.length === 0) {
              changeList = data
            } else {
              changeList = data.filter(
                i => !currentSelect.some(j => j.userId === i.userId),
              )
            }
            this.selectOtherRoleMember(changeList)
          }
          // 取消
          if (currentSelect.length > data.length && !this.switchRole) {
            if (data.length === 0) {
              changeList = currentSelect
            } else {
              changeList = currentSelect.filter(
                i => !data.some(j => j.userId === i.userId),
              )
            }
            this.cancelOtherRoleMember(changeList)
          }
          data && (this.roleList[i].select = data)
          this.roleList[i].selectState =
            data.length > 0
              ? data.length === this.memberList.length
                ? 'all'
                : 'has'
              : ''
        }
        this.roleList[i].selectState === 'all' &&
          this.roleList[i].defaultList.length &&
          count++
      }
      this.pickAll = !(
        this.roleList.length -
          this.roleList.filter(i => i.defaultList.length === 0).length ===
        count
      )
    },
    // 人员选择联动-选中其他角色的同一人员
    selectOtherRoleMember(list) {
      for (let i = 0; i < this.roleList.length; i++) {
        if (this.roleList[i].roleId !== this.currentRoleId) {
          for (let j = 0; j < this.roleList[i].defaultList.length; j++) {
            for (let k = 0; k < list.length; k++) {
              if (
                list[k].userId === this.roleList[i].defaultList[j].userId &&
                !this.roleList[i].select
                  .map(jtem => jtem.userId)
                  .includes(list[k].userId)
              ) {
                this.roleList[i].select.push(list[k])
                this.roleList[i].selectState =
                  this.roleList[i].select.length > 0
                    ? this.roleList[i].select.length ===
                      this.roleList[i].defaultList.length
                      ? 'all'
                      : 'has'
                    : ''
                break
              }
            }
          }
        }
      }
    },
    // 人员选择联动-取消其他角色的同一人员
    cancelOtherRoleMember(list) {
      for (let i = 0; i < this.roleList.length; i++) {
        if (this.roleList[i].roleId !== this.currentRoleId) {
          let temp = []
          for (let j = 0; j < this.roleList[i].defaultList.length; j++) {
            for (let k = 0; k < list.length; k++) {
              if (list[k].userId === this.roleList[i].defaultList[j].userId) {
                temp.push(list[k])
                break
              }
            }
          }
          this.roleList[i].select = this.roleList[i].select.filter(
            m => !temp.find(n => n.userId === m.userId),
          )

          this.roleList[i].selectState =
            this.roleList[i].select.length > 0
              ? this.roleList[i].select.length ===
                this.roleList[i].defaultList.length
                ? 'all'
                : 'has'
              : ''
        }
      }
    },
    // 选择全部成员
    selectAllMember() {
      this.pickAll = false
      for (let i = 0, len = this.roleList.length; i < len; i++) {
        if (this.currentRoleId === this.roleList[i].roleId) {
          this.$nextTick(() => {
            this.roleList[i].select.forEach(row => {
              this.$refs.memberTable.toggleRowSelection(
                this.memberList.find(jtem => {
                  return row.userId === jtem.userId
                }),
                true,
              )
            })
          })
          break
        }
      }
      this.roleList.forEach(item => {
        item.selectState = 'all'
        item.select = item.defaultList
      })
    },
    // 取消全部成员
    cancelAllMember() {
      this.pickAll = true
      this.$refs.memberTable.clearSelection()
      this.roleList.forEach(item => {
        item.selectState = ''
        item.select = []
      })
    },
    // 添加
    sureMember() {
      let members = []
      let result = []
      let temp = {}
      this.roleList.forEach(item => {
        members = [...members, ...item.select]
      })
      // 去重
      for (let i = 0, len = members.length; i < len; i++) {
        if (!temp[members[i].userId]) {
          result.push(members[i])
          temp[members[i].userId] = true
        }
      }
      this.dialogKey === 'senderList'
        ? this.judgmentCount('sender', result)
        : this.judgmentCount('copySender', result)
      this.dialogVisible = false
    },
    // 判断人数
    judgmentCount(key, list) {
      const MAX = 30 // 收件人最多30个
      let notProjectMember = []
      notProjectMember = this.requestParamsFormat(this.messageForm[key])
      if (MAX - notProjectMember.length < list.length) {
        this.$alert(
          `项目外已选择${notProjectMember.length}人，项目内最多选择${MAX -
            notProjectMember.length}人`,
          i18n.t('提示'),
        )
      } else {
        this.messageForm[key] = [...list, ...notProjectMember]
      }
    },
    // 弹框人员数据格式化
    responseParamsFormat(list) {
      let result = []
      if (list?.length) {
        list
          .filter(
            i =>
              typeof i === 'object' &&
              i.userId !== i.userEmail &&
              i.userName !== i.userEmail,
          )
          .forEach(j => {
            for (let k = 0, len = this.projectAllMember.length; k < len; k++) {
              if (j.userId === this.projectAllMember[k].userId) {
                j.roles = this.projectAllMember[k].roles
                result.push(j)
                break
              }
            }
          })
      }
      return result
    },
    // 入参收件人、抄送人数据格式化
    requestParamsFormat(list = []) {
      let array = []
      if (list?.length) {
        array = list.filter(i => {
          if (typeof i === 'string') return true
          if (i && typeof i === 'object') {
            return !this.projectAllMember.some(j => j.userId === i.userId)
          }
        })
      }
      return array
    },
  },
}
</script>
<style lang="scss" scoped>
.border-padding-left {
  border-left: 2px solid #409eff;
  padding-left: 10px;
}
.form-dynamic {
  width: 60%;
  // margin-left: 30px;
  .l-h-30 {
    /deep/ {
      .el-form-item__content,
      .el-form-item__label {
        line-height: 30px !important;
      }
    }
  }
  .sender-placeholder {
    color: #c0c4cc;
    padding-left: 6px;
  }
  .icon-position {
    position: absolute;
    right: -25px;
    color: $--color-primary;
    top: 0;
  }
  .member-list {
    border: 1px solid #dde5ef;
    border-radius: 3px;
    min-height: 28px;
    cursor: pointer;
  }
  .m-l-5 {
    margin-left: 5px;
  }
  .el-icon-error {
    cursor: pointer;
  }
}
/deep/ .el-dialog {
  padding: 16px;
  .el-dialog__body {
    padding-bottom: 0;
  }
  .member-table {
    .el-checkbox__inner {
      width: 16px;
      height: 16px;
      &:after {
        height: 8px;
        left: 5px;
      }
    }
    .el-checkbox__input {
      &.is-indeterminate {
        .el-checkbox__inner {
          &:before {
            top: 6px;
          }
        }
      }
    }
  }
}
.list {
  display: flex;
  justify-content: space-around;
  .role-list {
    margin-right: 10px;
    flex-shrink: 0;
    ul {
      list-style: none;
      background: $--background-gray;
      border: 1px solid #dde5ef;
      border-radius: 3px;
      width: 200px;
      height: 400px;
      overflow: auto;
      padding: 10px 0;
      margin: 10px 0 0;
      li {
        width: 100%;
        list-style: none;
        height: 34px;
        line-height: 34px;
        color: $--color-text-fine;
        box-sizing: border-box;
        padding: 0 5px;
        display: flex;
        align-items: center;
        &.active {
          background-color: $--color-primary-light-9;
          color: $--color-primary;
          border-radius: 4px;
        }
        &:hover {
          background-color: #e2e9ef;
        }
        span {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 5px;
          cursor: pointer;
        }
        i {
          cursor: not-allowed;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          line-height: 16px;
          text-align: center;
          background-color: $--color-primary;
          color: #fff;
          border: 1px solid $--color-primary;
          border-radius: 2px;
          box-sizing: border-box;
          font-size: 12px;
        }
      }
    }
  }
  .person-list {
    flex: 1;
    .table {
      margin-top: 10px;
      border: 1px solid #dde5ef;
      border-radius: 3px;
    }
  }
  .list-title {
    display: flex;
    height: 20px;
    padding-left: 10px;
    justify-content: space-between;
    align-items: center;
    border-left: 2px solid $--color-primary;
    color: $--color-text-fine;
  }
}
</style>
