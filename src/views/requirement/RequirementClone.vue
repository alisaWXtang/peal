<template>
  <el-dialog
    :visible="cloneRequirementModalStatus"
    :title="$t('复制需求')"
    custom-class="dialog-noanimate"
    :show-close="false"
    :width="$isEnglish() ? '700px' : '550px'"
    :modal-append-to-body="false"
  >
    <div>
      <el-form :label-width="$isEnglish() ? '40%' : '35%'" class="modal-form">
        <el-form-item :label="$t('复制需求到')">
          <el-select
            v-model="form.toProjectId"
            :placeholder="$t('请选择目标项目')"
            :popper-append-to-body="true"
          >
            <el-option
              v-for="item in projectList"
              :key="item.id"
              :value="item.id"
              :label="
                item.name +
                  (item.id === +projectId ? `(${$t('当前项目')})` : '')
              "
              >{{ item.name
              }}{{
                item.id === +projectId ? `(${$t('当前项目')})` : ''
              }}</el-option
            >
            <el-option v-if="canloadmore" value="0" disabled>
              <div
                class="showmore"
                @click="changePageination(projectListPageInfo.pageNumber + 1)"
              >
                {{ $t('更多') }}
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('创建人')">
          <el-radio v-model="form.keepCreateUser" :label="true">{{
            $t('保留原需求的创建人')
          }}</el-radio>
          <el-radio v-model="form.keepCreateUser" :label="false"
            >{{ $t('我') }}({{ userInfo.userName }})</el-radio
          >
        </el-form-item>
        <el-form-item :label="$t('复制子需求和任务')">
          <el-radio v-model="form.copyChild" :label="true">{{
            $t('是')
          }}</el-radio>
          <el-radio v-model="form.copyChild" :label="false">{{
            $t('否')
          }}</el-radio>
        </el-form-item>
      </el-form>
      <p class="center notice">
        ({{ $t('注') }}：{{ $t('复制后的需求和任务状态都为初始状态') }})
      </p>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="default" @click="closeModal">{{ $t('取消') }}</el-button>
      <el-button
        type="primary"
        :disabled="loadingObject.posting"
        @click="saveCopy"
        >{{ $t('保存') }}{{ loadingObject.posting ? '中...' : '' }}</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
/**
 * @title 需求复制组件
 * @desc 项目列表采用分页(vuex 缓存)；每次打开 modal 时会恢复初始状态
 * @author heyunjiang
 * @date 2019.6.20
 */
import { mapState } from 'vuex'
import { projectMineList } from '@/service/project'
// import { requirementCopy } from '@/service/requirement'

export default {
  name: 'RequirementClone',
  inject: {
    isInjectFromMine: {
      default: false,
    },

    refreshList: {
      default: () => () => {},
    },
  },

  components: {},
  mixins: [],
  props: {
    requireId: {
      type: [Number, String],
      required: true,
    },

    projectId: {
      type: [Number, String],
      required: true,
    },

    cloneRequirementModalStatus: {
      type: Boolean,
      required: true,
    },

    closeModal: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      loadingObject: {
        getting: false,
        posting: false,
      },

      form: {
        toProjectId: +this.projectId,
        keepCreateUser: true,
        copyChild: true,
      },

      projectListPageInfo: {
        pageNumber: 1,
        pageSize: 100,
      },

      userInfo: {},
      projectList: [],
    }
  },
  computed: {
    ...mapState({
      projectInfo: state => state.pf.ProjectInfo.mine, // 获取进行中项目的列表信息
    }),
    canloadmore() {
      return this.projectList.length < this.projectInfo.pageInfo.totalRecords
    },
  },

  watch: {
    // 当打开 modal 的时候，需要初始化分页信息，然后再获取数据
    cloneRequirementModalStatus(value) {
      if (value) {
        this.changePageination()
      }
    },
  },

  mounted() {
    this.userInfo = this.$store.state.gd.userInfo
  },
  methods: {
    // 获取项目列表数据，分页信息依赖当前组件的 projectListPageInfo
    async getProjectList() {
      this.loadingObject.getting = true
      const result = await projectMineList()
      if (result.status === 200) {
        let count = 0
        this.projectList = result.data.filter(project => !project.completed)
        for (let i = 0; i < this.projectList.length; i++) {
          if (
            Number(this.form.toProjectId) === Number(this.projectList[i].id)
          ) {
            count++
            break
          }
        }
        // 当上次的项目不是管理员时，选择当前项目
        count === 0 &&
          (this.form.toProjectId = Number(this.$route.query.projectId))
      }
      this.loadingObject.getting = false
    },
    // 更新分页信息，用于初始化及更多获取
    changePageination(pageNumber = 1) {
      this.projectListPageInfo = {
        pageNumber: pageNumber,
        pageSize: this.projectListPageInfo.pageSize,
      }

      this.$nextTick(this.getProjectList)
    },
    // 复制需求
    async saveCopy() {
      // 复制成功后打开复制后的需求,同项目下复制
      if (this.form.toProjectId === this.projectId) {
        this.$emit('cloneInProject', {
          ...this.form,
          projectId: this.projectId,
          workItemId: this.requireId,
          workItemType: 1,
        })
        this.$emit('update:cloneModalStatus', false)
        return
      }

      this.loadingObject.posting = true
      const result = await this.$store.dispatch('copyWorkItemContent', {
        ...this.form,
        projectId: this.projectId,
        workItemId: this.requireId,
        workItemType: 1,
      })

      this.loadingObject.posting = false
      if (result.status === 200) {
        this.closeModal()
        // 是否是在工作台操作，是则刷新列表
        if (this.isInjectFromMine && typeof this.refreshList === 'function') {
          this.refreshList()
        }

        // 复制成功后打开复制后的需求
        if (this.form.toProjectId === this.projectId) {
          const { query, name } = this.$route
          this.$router.push({
            name: name,
            query: {
              ...query,
              requireId: result.data,
            },
          })
        }
      } else {
        // this.$message({
        //   message: result.msg || '复制需求失败',
        //   type: 'error'
        // })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.showmore {
  cursor: pointer;
  text-align: center;
  &:hover {
    color: $--color-primary;
  }
}
</style>
