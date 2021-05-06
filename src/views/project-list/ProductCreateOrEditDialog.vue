<template>
  <!--创建项目，编辑项目-->
  <el-dialog
    :title="titleMap[projectFlag]"
    :visible.sync="dialogProjectVisible"
    class="el-dialog-640w"
    :close-on-click-modal="false"
    :modal-append-to-body="true"
    :append-to-body="true"
    @close="handleCloseProject"
  >
    <div class="form-iterm-box">
      <div v-if="projectFlag === 'creat'" class="pW">
        <div
          class="typeProjWra"
          :class="activeBor === '1' ? 'activeBorCs' : ''"
          @click="activeBor = '1'"
        >
          <div class="projTop">
            <svg class="iconCss" aria-hidden="true">
              <use xlink:href="#icon-chuangjianxinxiangmunew"></use>
            </svg>
            <span class="projT">{{ $t('创建新项目') }}</span>
          </div>
          <div class="projDes">{{ $t('创建空白项目') }}</div>
        </div>
        <div
          class="typeProjWra"
          :class="activeBor === '2' ? 'activeBorCs' : ''"
          @click="demoProJ"
        >
          <div class="projTop">
            <svg class="iconCss" aria-hidden="true">
              <use xlink:href="#icon-shilixiangmunew"></use>
            </svg>
            <span class="projT">{{ $t('示例项目') }}</span>
          </div>
          <div class="projDes">
            {{ ($t('示例项目'), $t('可帮助学习使用产品')) }}
          </div>
        </div>
      </div>
      <el-form
        ref="projectInfo"
        :model="projectInfo"
        :label-width="$isEnglish() ? '158px' : '86px'"
      >
        <el-form-item
          :label="$t('项目名称')"
          prop="name"
          :rules="[
            { required: true, message: $t('项目名称不能为空') },
            {
              min: 0,
              max: 255,
              message: $t('项目名称不能超过255个字符'),
              trigger: 'blur',
            },
            {
              min: 0,
              max: 255,
              message: $t('项目名称不能超过255个字符'),
              trigger: 'change',
            },
          ]"
        >
          <el-input
            v-model.trim="projectInfo.name"
            :maxlength="255"
            :disabled="!!editProductInfo.projectType && projectFlag === 'edit'"
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('负责人')"
          prop="adminUsers"
          :rules="{
            required: true,
            message: $t('负责人不能为空'),
            trigger: 'change',
          }"
        >
          <el-select
            v-model="projectInfo.adminUsers"
            clearable
            value-key="userId"
            width="100%"
            filterable
            remote
            multiple
            :multiple-limit="50"
            :remote-method="remoteMethod"
            :loading="searchLoading"
            @visible-change="selectVisibleChange"
          >
            <el-option
              v-for="item in managerList"
              :key="item.userId"
              :style="item.noHeight ? 'height:0' : ''"
              :label="item.userName + '(' + item.userId + ')'"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门" min-width="100" show-overflow-tooltip>
          <DepartmentCascader
            v-model="projectInfo.departmentIds"
            :show-all-levels="false"
            clearable
            :disabled="!!editProductInfo.projectType && projectFlag === 'edit'"
            :props="departmentCascaderProps"
            class="department-cascader"
          ></DepartmentCascader>
        </el-form-item>
        <el-form-item
          :label="$t('项目目标')"
          prop="target"
          :rules="[{ required: true, message: $t('项目目标不能为空') }]"
        >
          <el-input
            v-model="projectInfo.target"
            type="textarea"
            :maxlength="200"
            :autosize="{ minRows: 4, maxRows: 10 }"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('项目描述')" prop="description">
          <el-input
            v-model="projectInfo.description"
            type="textarea"
            :maxlength="200"
            :autosize="{ minRows: 4, maxRows: 10 }"
          ></el-input>
        </el-form-item>
        <el-form-item v-if="projectFlag === 'creat'" class="mb10">
          <span slot="label">
            {{ $t('复制模板') }}
            <el-tooltip class="item" effect="dark" placement="top">
              <i class="el-icon-info"></i>
              <div slot="content">
                {{ $t('从已有项目复制模板') }}，{{ $t('适用于项目成员') }}、{{
                  $t('角色')
                }}、{{ $t('权限') }}、{{ $t('工作项配置相同的项目') }}。
                <br />{{ $t('复制的数据包括') }}：{{ $t('人员') }}、{{
                  $t('角色权限')
                }}、{{ $t('工作流') }}、{{ $t('自定义字段') }}、{{
                  $t('工作项模板')
                }}、{{ $t('迭代阶段设置') }}。 <br />{{
                  $t('不被复制的数据包括')
                }}：{{ $t('工作项列表') }}、{{ $t('迭代列表') }}、{{
                  $t('报表')
                }}、{{ $t('报告') }}、{{ $t('过滤器') }}、{{ $t('文档') }}、{{
                  $t('与持续集成相关的配置')
                }}。
              </div>
            </el-tooltip>
          </span>
          <op-select
            v-model="projectInfo.copyId"
            :data="projectList"
            mode="element"
            :placeholder="$t('请从已有项目选择要复制的模版')"
            width="100%"
            :popper-append-to-body="true"
            label-attr="name"
            value-attr="id"
          ></op-select>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCloseProject">{{ $t('取消') }}</el-button>
      <el-button type="primary" :loading="loading" @click="submitProject">{{
        $t('确定')
      }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { i18n } from '@/i18n'
import { mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import uniqBy from 'lodash/uniqBy'
import OpSelect from '@/components/op-select'
import DepartmentCascader from '@/components/biz/department-cascader'

import {
  createProject,
  updateProject,
  createDemoProject,
} from '@/service/project-list'
import { userSearch } from '@/service/common/user'
/**
 * @title
 * @desc
 * @author wangling
 * @date
 */
export default {
  name: '',
  components: { OpSelect, DepartmentCascader },
  mixins: [],
  props: {
    dialogVisible: {
      type: Boolean,
      required: true,
      desc: '控制弹窗开关',
    },

    projectFlag: {
      type: String,
      required: false,
      default: 'creat',
      desc: '值为creat为创建，为edit时为编辑',
    },

    editProductInfo: {
      type: Object,
      required: false,
      desc: '编辑项目时传入，新建项目不用传入',
    },

    createProjectSuccess: {
      type: Function,
      required: false,
      desc: '创建项目成功时的回调函数',
    },

    editProjectSuccess: {
      type: Function,
      required: false,
      desc: '编辑项目更新成功时的回调函数',
    },

    projectList: {
      type: Array,
      required: false,
      desc: '项目列表',
    },
  },

  data() {
    return {
      dialogProjectVisible: false,
      loading: false,
      activeBor: '1',
      searchLoading: false,
      projectInfo: {
        departmentIds: '',
        name: '',
        target: '',
        adminUsers: '',
        description: '',
        copyId: '',
      },
      departmentCascaderProps: {
        checkStrictly: true,
        value: 'id',
        label: 'name',
        multiple: true,
        'show-all-levels': false,
        'collapse-tags': true,
        emitPath: false,
      },
      editProjectId: '',
      titleMap: {
        creat: i18n.t('创建项目'),
        edit: i18n.t('编辑项目'),
      },

      copyList: [],
      managerList: [],
    }
  },
  computed: {
    ...mapState({
      // 默认展示列表
      defaultList: state => state.gd.defaultManagerList,
      userInfo: state => state.gd.userInfo,
    }),
  },

  watch: {
    dialogVisible: {
      handler: async function(newValue) {
        if (newValue) {
          this.activeBor = '1'
          this.dialogProjectVisible = newValue
          this.defaultList.length === 0 &&
            (await this.$store.dispatch('getDefaultUserList'))
          this.$nextTick(async () => {
            this.$refs['projectInfo'].resetFields()
            this.copyList = cloneDeep(this.defaultList)
            if (this.projectFlag == 'edit') {
              let select = this.editProductInfo.adminUsers
              let list = this.differenceSet(select, this.copyList)
              this.projectInfo = {
                name: this.editProductInfo.name,
                target: this.editProductInfo.target,
                departmentIds: this.editProductInfo.departmentIds,
                adminUsers: select,
                description: this.editProductInfo.description,
              }
              this.copyList = [...list, ...this.copyList]
              this.editProjectId = this.editProductInfo.editProjectId
            } else {
              // 项目负责人默认选中本人
              let { userId, userName } = this.userInfo || {}
              let select = userId ? [{ userId, userName }] : []
              let list = this.differenceSet(select, this.copyList)
              // 获取用户部门信息
              const defDepartment = await this.$store.dispatch(
                'getUserDepartmentInfo',
              )
              // 非编辑时初始化清空保存的项目信息
              this.projectInfo = {
                departmentIds: defDepartment ? [defDepartment.id] : [],
                name: '',
                target: '',
                adminUsers: select,
                description: '',
                copyId: '',
              }

              this.copyList = [...list, ...this.copyList]
            }
            this.managerList = this.copyList
          })
        }
      },
      immediate: true,
    },
  },

  created() {},
  mounted() {},
  methods: {
    getDefDepId() {
      const { department } = this.userInfo || {}
      return department?.id
    },
    handleCloseProject() {
      this.loading = false
      this.dialogProjectVisible = false
      this.projectInfo = {
        name: '',
        target: '',
        adminUsers: '',
        description: '',
        copyId: '',
      }

      this.$emit('update:dialogVisible', false)
    },
    demoProJ() {
      this.activeBor = '2'
      this.handleCloseProject()
      this.$emit('changeLoadingWords', true)
      createDemoProject()
        .then(res => {
          if (res.status === 200) {
            this.$emit('changeLoadingWords', false)
            this.createProjectSuccess()
            this.$router.push('/project/list')
            this.$message({
              message: res.msg || i18n.t('创建示例项目成功'),
              type: 'success',
            })
          } else {
            this.$emit('changeLoadingWords', false)
          }
        })
        .catch(() => {
          this.$emit('changeLoadingWords', false)
          this.handleCloseProject()
        })
    },
    submitProject() {
      this.$refs['projectInfo'].validate(valid => {
        if (valid) {
          this.projectFlag == 'creat'
            ? this.handlerCreateProject()
            : this.handlerUpdateProject()
        }
      })
    },
    handlerCreateProject() {
      this.loading = true
      const params = {
        name: this.projectInfo.name,
        target: this.projectInfo.target, // 项目目标
        adminUsers: this.projectInfo.adminUsers.map(item => item.userId), // 项目负责人
        description: this.projectInfo.description,
        departmentIds: this.projectInfo.departmentIds,
        fromProjectId: this.projectInfo.copyId || '', // 复制项目id
      }
      createProject(params)
        .then(res => {
          this.loading = false
          if (res.status === 200) {
            this.handleCloseProject()
            this.createProjectSuccess()
            this.$router.push('/project/list')
            this.$message({
              message: res.msg || i18n.t('创建项目成功'),
              type: 'success',
            })
          } else {
            // this.$message({
            //   message: res.msg || "创建项目失败",
            //   type: "error"
            // });
          }
        })
        .catch(() => {
          this.handleCloseProject()
        })
    },
    handlerUpdateProject() {
      this.loading = true
      let params = cloneDeep(this.projectInfo)
      params.adminUsers = params.adminUsers.map(item => item.userId)
      updateProject({
        ...params,
        id: this.editProjectId,
        projectId: this.editProjectId,
      })
        .then(res => {
          this.loading = false
          if (res.status === 200) {
            //   this.getProjectList();
            this.handleCloseProject()
            this.editProjectSuccess()
            this.$message({
              message: res.msg || i18n.t('更新项目成功'),
              type: 'success',
            })
          } else {
            // this.$message({
            //   message: res.msg || "更新项目失败",
            //   type: "error"
            // });
          }
        })
        .catch(() => {
          this.handleCloseProject()
        })
    },
    // 搜素更多人员
    async remoteMethod(query) {
      if (query !== '') {
        this.searchLoading = true
        let select = this.projectInfo.adminUsers
        let list = []
        let res = await userSearch({
          keyword: query,
        })

        this.searchLoading = false
        if (res.status === 200) {
          let searchList = res.data.map(item => ({
            ...item,
            origin: 'remote',
          }))

          if (searchList?.length > 0) {
            list = this.differenceSet(select, searchList)
            this.managerList = [...searchList, ...list]
          } else {
            this.managerList = []
          }
        } else {
          this.managerList = [...list]
        }
      } else {
        let select = this.projectInfo.adminUsers
        let list = []
        for (let i = 0; i < select.length; i++) {
          if (select[i].origin === 'remote') {
            select[i].noHeight = true
            list.push(select[i])
          }
        }
        list = this.differenceSet(select, this.copyList)
        this.copyList = [...list, ...this.copyList]
        // 去重 - 前边会多次push相同userId的数据导致组件报错
        this.managerList = uniqBy(this.copyList, 'userId')
      }
    },
    selectVisibleChange(val) {
      !val && (this.managerList = this.copyList)
    },
    /**
     * 获取项目负责人列表
     */
    // async getProjectManager() {
    //   let result = { status: 0 }
    //   try {
    //     result = await $http.get($http.api.manageView.getDefaultUserList)
    //   } catch (_) {}
    //   if (result.status === 200) {
    //     this.defaultList = result.data
    //   }
    // },
    /**
     * 2 个数组求差集
     */
    differenceSet(target, origin) {
      return [...target]
        .filter(x => [...origin].every(y => y.userId !== x.userId))
        .map(item => ({
          ...item,
          noHeight: true,
        }))
    },
  },
}
</script>
<style lang="scss" scoped>
/deep/.el-dialog__body {
  padding-top: 16px;
}
/deep/.custom-select-wrap {
  border: none;
}
.pW {
  display: flex;
  margin-bottom: 24px;
  .typeProjWra + .typeProjWra {
    margin-left: 24px;
  }
  .activeBorCs {
    border-color: $--color-primary !important;
  }
  .typeProjWra {
    width: 192px;
    border: 1px solid #e5e5e5;
    padding: 12px 16px;
    border-radius: 6px;
    .projTop {
      display: flex;
      align-items: center;
    }
    .iconCss {
      width: 26px;
      height: 26px;
      vertical-align: center;
      fill: currentColor;
      overflow: hidden;
      margin-right: 8px;
    }
    .projT {
      color: $--color-black;
      font-size: 14px;
      margin-left: 5px;
    }
    .projDes {
      color: $textLight;
      font-size: 12px;
      line-height: 24px;
      margin-top: 5px;
    }
    &:hover {
      border-color: $--color-text-placeholder;
    }
  }
}
.department-cascader {
  width: 100%;
  /deep/ .el-cascader__tags .el-cascader__search-input {
    margin: 0 0 0 8px;
  }
}
</style>
