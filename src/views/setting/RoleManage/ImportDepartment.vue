<template>
  <el-dialog
    :title="$t(title)"
    :visible.sync="localShow"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    width="680px"
    custom-class="roleMemberDialog"
    @closed="handleClose"
  >
    <div class="addMember">
      <!-- 左边选择成员部分 -->
      <div class="addMember-left">
        <!-- 顶部输入框 -->
        <div class="addMember-left-header">
          <el-input
            v-model="memberName"
            clearable
            size="medium"
            prefix-icon="el-icon-search"
            :placeholder="$t('请输入成员姓名、工号')"
            @input="searchPersonnelManagement"
            @keyup.native.enter="searchPersonnelManagement"
          />
        </div>
        <!-- 部门成员树 -->
        <div
          ref="leftContent"
          v-loading="getDepartmentLoading"
          class="addMember-left-content"
          :element-loading-text="$t('拼命加载中')"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgb(255,255,255)"
        >
          <div v-if="memberName" class="search-container">
            <template v-if="userList.length">
              <el-checkbox-group v-model="userIds">
                <el-checkbox
                  v-for="(item, index) in userList"
                  :key="item.userId"
                  class="user-item"
                  :label="item.userId"
                  @change="val => changeUser(val, item, index)"
                  ><span class="user-name">{{ item.name }}</span>
                  <span v-if="item.departmentName" style="user-org-name">
                    <i class="iconfont icon-zuzhi"></i>
                    {{ item.departmentName }}
                  </span></el-checkbox
                >
              </el-checkbox-group>
            </template>
            <div v-else class="empty-data">{{ $t('暂无数据') }}</div>
          </div>
          <el-tree
            v-show="!memberName"
            ref="tree"
            :data="department"
            show-checkbox
            highlight-current
            node-key="id"
            :default-expanded-keys="userDepartment"
            :props="props"
            @check="checkMember"
            @check-change="checkChange"
            @node-expand="nodeExpand"
          >
            <div
              slot-scope="{ node, data }"
              class="custom-tree-node"
              :class="{
                'current-user-node__observer':
                  data.id === currentUserOrigination.directDepartId,
              }"
              :title="node.label"
            >
              <template v-if="data.isUser">
                <span
                  ><i class="iconfont icon-renyuan-05"></i>
                  {{ node.label }}</span
                >
              </template>
              <template v-else>
                <span class="title"
                  ><i class="iconfont icon-zuzhi"></i> {{ node.label }}</span
                >
              </template>
            </div>
          </el-tree>
        </div>
      </div>
      <!-- 右边已有成员列表 -->
      <div class="addMember-right">
        <div class="addMember-right-title">
          {{ $t('已选') }}
          <span v-if="selectedMemberList.length"
            >({{ selectedMemberList.length }})</span
          >
        </div>
        <div class="addMember-right-selectedMemberList">
          <div v-for="item in selectedMemberList" :key="item.id" class="item">
            <span>{{ item.name }}</span>
            <i class="el-icon-close" @click="deleteMember(item.userId)" />
          </div>
        </div>
      </div>
    </div>
    <div class="BtnGroup">
      <el-button type="primary" :loading="confirmLoading" @click="confirm">{{
        $t('保存')
      }}</el-button>
      <el-button @click="localShow = false">{{ $t('关闭') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getM2DepartmentTree } from '@/service/global'
import { userSearch } from '@/service/common/user'
import uniqBy from 'lodash/uniqBy'
import debounce from 'lodash/debounce'
export default {
  name: 'AddPerson',
  props: {
    title: {
      type: String,
      dec: '弹框的标题',
      default: '',
    },
    show: {
      type: Boolean,
      dec: '控制弹框是否显示',
      default: false,
    },
  },
  data() {
    return {
      debounceTimer: null,
      treeRef: null, //树组件DOM实例
      memberName: '', //用户输入的成员姓名 | 工号
      getDepartmentLoading: false, //是否正在搜索用户所在部门中
      department: [], //搜索的用户所在部门可操作的数据
      userDepartment: [], //搜索的用户所在部门（树结构中默认展开此节点）
      selectedMemberList: [], //已选人员
      confirmLoading: false,
      currentUserOrigination: {}, // 当前用户的组织信息
      props: {
        label: 'name',
        children: 'children',
      },
      expandIds: [],
      userIds: [],
      userList: [],
      searchUserList: [],
    }
  },
  computed: {
    localShow: {
      get() {
        return this.show
      },
      set(val) {
        this.$emit('update:show', val)
      },
    },
  },
  watch: {
    show: {
      handler: function(val) {
        if (val) {
          this.getDepartment()
        }
      },
      immediate: true,
    },
  },
  methods: {
    // 关闭
    handleClose() {
      Object.assign(this.$data, this.$options.data())
      this.$emit('close')
    },
    nodeExpand() {
      if (this.memberName) return
      const ids = []
      Object.entries(this.$refs.tree.store.nodesMap).forEach(([key, item]) => {
        if (item.expanded) {
          ids.push(key)
        }
      })

      this.expandIds = ids
    },
    // 格式化数据
    formatData(data) {
      for (let index = 0; index < data.length; index++) {
        const element = data[index]

        if (!element.isUser && element.members?.length) {
          const members = element.members?.map(user => {
            return {
              ...user,
              name: `${user.userName}(${user.userId})`,
              id: user.userId,
              isUser: true,
            }
          })

          if (!element.children) {
            element.children = []
          }

          element.children.push(...members)
        }

        if (element.children?.length) {
          this.formatData(element.children)
        }
      }

      return data
    },
    //获取部门数据
    async getDepartment(init = true) {
      this.getDepartmentLoading = true
      let res = {}
      try {
        res = await getM2DepartmentTree()
      } catch (error) {
        res.status = 0
      }

      if (res.status === 200 && res.data) {
        this.department = this.formatData(res.data.departmentVOList)
        this.currentUserOrigination = res.data.currentUserOrganization
        await this.$nextTick()

        if (init) {
          const departIds = this.currentUserOrigination.directDepartIdPath.split(
            '/',
          )
          departIds.forEach(id => {
            if (this.$refs.tree.store.nodesMap[id]) {
              this.$refs.tree.store.nodesMap[id].expanded = true
              this.expandIds.push(id)
            }
          })

          await this.$nextTick()
          const currentNode = document.querySelector(
            '.current-user-node__observer',
          )

          if (currentNode) {
            this.currentObserver(currentNode)
          }
        } else {
          const expandSet = new Set(this.expandIds)
          Object.entries(this.$refs.tree.store.nodesMap).forEach(
            ([key, item]) => {
              item.expanded = expandSet.has(key)
            },
          )
        }
      }

      this.getDepartmentLoading = false
    },
    // 注册交叉观察者
    currentObserver(dom) {
      const root = this.$refs.leftContent.$el
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(item => {
            if (!item.isIntersecting) {
              this.$refs.leftContent.scrollTop = item.target.offsetTop - 10
            }

            observer.unobserve(item.target)
          })
        },
        {
          root,
          rootMargin: '0px 0px 0px 0px',
        },
      )
      observer.observe(dom)
    },
    checkChange(data, checked) {
      if (!checked) {
        const searchIndex = this.searchUserList.findIndex(
          item => item.userId === data.userId,
        )
        searchIndex > -1 && this.searchUserList.splice(searchIndex, 1)
      }
    },
    // 选择成员
    checkMember: debounce(function(sourceData, nodeData) {
      // 如果节点有children属性，则代表这是一个父节点，不用添加至已选择成员
      const { checkedNodes } = nodeData
      let nodes = checkedNodes.filter(item => item.isUser)
      this.selectedMemberList = uniqBy(
        [...nodes, ...this.searchUserList],
        'userId',
      )
    }, 200),
    // 删除已选择人员
    deleteMember(id) {
      const index = this.selectedMemberList.findIndex(
        user => user.userId === id,
      )
      index > -1 && this.selectedMemberList.splice(index, 1)
      const originIndex = this.searchUserList.findIndex(
        user => id === user.userId,
      )
      originIndex > -1 && this.searchUserList.splice(originIndex, 1)
      this.$refs.tree.setChecked(id)
      this.userIds = this.selectedMemberList.map(item => item.userId)
    },
    // 点击确定
    confirm() {
      if (this.selectedMemberList.length) {
        this.confirmLoading = true
        this.$emit('confirm', this.selectedMemberList)
      } else {
        this.$message.warning(this.$t('请选择用户'))
      }
    },
    // 搜索人员
    searchPersonnelManagement: debounce(async function() {
      this.userIds = this.selectedMemberList.map(item => item.userId)
      if (this.memberName !== '') {
        this.getDepartmentLoading = true
        let res = {}
        try {
          res = await userSearch({ keyword: this.memberName })
        } catch (error) {
          res.status = 0
        }

        if (res.status === 200 && res.data) {
          this.userList = res.data.map(item => {
            return {
              ...item,
              name: `${item.userName}(${item.userId})`,
            }
          })
        }

        this.getDepartmentLoading = false
      }
    }, 300),
    // 选择人员
    changeUser(val, item) {
      if (val) {
        this.selectedMemberList.unshift(item)
        this.$refs.tree.setChecked(item.userId, true)
        this.searchUserList.push(item)
      } else {
        const originIndex = this.selectedMemberList.findIndex(
          user => user.userId === item.userId,
        )
        this.deleteMember(item.userId, originIndex)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.search-container {
  height: 100%;
  overflow: auto;
  @include scrollbal-common;
}
.user-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  width: 100%;
  margin-left: 0;

  .user-name {
    flex: 0 0 auto;
    padding-right: 5px;
  }

  .user-org-name {
    flex: 0 0 auto;
  }
}

.custom-tree-node {
  width: calc(100% - 60px);

  .title {
    max-width: 100%;
    display: inline-block;
    @include no-wrap;
  }
}
.empty-data {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
}

/deep/.roleMemberDialog {
  padding: 0;
  .el-dialog__header {
    padding: 16px 24px;
  }
  .el-dialog__body {
    padding: 16px 0 0 0;
    .addMember {
      height: 500px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      &-left {
        width: calc(100% - 200px);
        height: 100%;
        margin-bottom: 10px;

        &-header {
          margin-bottom: 16px;
          .el-input {
            .el-input__inner {
              padding-left: 32px !important;
            }
            .el-icon-search {
              line-height: 36px !important;
            }
          }
        }
        &-content {
          height: calc(100% - 60px);
          overflow: auto;
          @include scrollbal-common;

          .el-checkbox-group {
            width: 100%;
          }
        }
      }
      &-right {
        width: 200px;
        height: 100%;
        padding-left: 16px;
        border-left: 1px solid #dfe3ed;
        margin-bottom: 10px;
        &-title {
          line-height: 36px;
          margin-bottom: 16px;
        }
        &-selectedMemberList {
          height: calc(100% - 52px);
          overflow-y: auto;
          padding-right: 10px;
          @include scrollbal-common;
          .item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            .el-icon-close {
              cursor: pointer;
            }
            &:hover {
              color: $--color-primary;
            }
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
    .BtnGroup {
      padding: 8px 24px;
      text-align: right;
      border-top: 1px solid #dfe3ed;
    }
  }
}

.origination-two-no-load {
  .el-tree-node__expand-icon {
    position: relative;
    left: -42px;
    bottom: 7px;
  }

  .title {
    position: relative;
    left: -16px;
  }
}
</style>
