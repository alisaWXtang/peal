<template>
  <co-dialog
    :title="dialogTitleEnum[type]"
    :visible="riskVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="$isEnglish() ? '700px' : '640px'"
    :before-close="beforeClose"
  >
    <div v-loading="loading">
      <co-form
        ref="riskForm"
        :model="riskForm"
        class="risk-from"
        :label-width="$isEnglish() ? '140px' : '80px'"
        :rules="rules"
      >
        <co-form-item :label="$t('标题')" prop="title">
          <co-input
            v-model.trim="riskForm.title"
            :maxlength="49"
            :placeholder="$t('请输入风险标题')"
            :disabled="!detailPower"
          ></co-input>
        </co-form-item>
        <co-form-item :label="$t('描述')" prop="description">
          <co-input
            v-model.trim="riskForm.description"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :disabled="!detailPower"
          ></co-input>
        </co-form-item>
        <co-form-item :label="$t('处理人')" prop="displayUserName">
          <co-select
            v-model="riskForm.displayUserName"
            :placeholder="$t('请选择')"
            :disabled="!detailPower"
            @visible-change="assignUserVisibleChange"
            @change="changeAssignUser"
          >
            <div class="search-box">
              <co-input
                v-model.trim="filterAssignUser"
                :placeholder="$t('搜索')"
                :disabled="!detailPower"
              ></co-input>
            </div>

            <div class="assign-list-box">
              <co-option
                v-for="item in assignUserFilterList"
                :key="item.userId"
                :label="item.value"
                :value="item.value"
                :class="{ 'hidden-option': item.hidden }"
              ></co-option>
            </div>
            <co-option
              v-if="!assignUserFilterList.length"
              style="text-align:center;"
              :label="$t('无数据')"
              :value="$t('无数据')"
              :disabled="true"
            >
            </co-option>
          </co-select>
        </co-form-item>
        <co-form-item :label="$t('优先级')" prop="priority">
          <co-select
            v-model="riskForm.priority"
            :placeholder="$t('请选择优先级')"
            :disabled="!detailPower"
          >
            <co-option
              v-for="item in priorityList"
              :key="item.key"
              :label="item.value"
              :value="item.key"
            ></co-option>
          </co-select>
        </co-form-item>
        <co-form-item :label="$t('状态')" prop="status">
          <co-select
            v-model="riskForm.status"
            :placeholder="$t('请选择状态')"
            :disabled="!detailPower"
          >
            <co-option
              v-for="item in riskStatus"
              :key="item.status"
              :label="item.desc"
              :value="item.status"
            ></co-option>
          </co-select>
        </co-form-item>
      </co-form>
      <div v-if="detailPower" slot="footer" class="dialog-footer">
        <co-button @click="beforeClose">{{ $t('取消') }}</co-button>
        <co-button type="primary" @click="submitForm('riskForm')">{{
          $t('确定')
        }}</co-button>
      </div>
    </div>
  </co-dialog>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 里程碑弹窗
 * @desc
 * @author wangling
 * @date 2020/04/10
 */
import debounce from 'lodash/debounce'
import { mapState } from 'vuex'

const dialogTitleEnum = {
  create: i18n.t('新建风险'),
  edit: i18n.t('编辑风险'),
  detail: i18n.t('查看风险'),
}

// 重置form表单
const initRiskForm = {
  title: '',
  projectId: '',
  description: '',
  assignUser: '',
  priority: '',
  displayUserName: '',
  status: 1,
}

export default {
  name: 'RiskAddAndEditDialog',
  components: {},
  mixins: [],
  props: {
    type: {
      type: String,
      required: true,
      desc: '该属性判断弹窗的类型: create(新建), edit(编辑), detail(详情)',
    },

    riskVisible: {
      type: Boolean,
      required: true,
      desc: 'dialog弹窗关闭还是开启',
    },

    riskDetailInfo: {
      type: Object,
      required: true,
      desc: '编辑或查看风险数据',
    },
  },

  data() {
    return {
      projectId: this.$getUrlParams().projectId,
      dialogTitleEnum: dialogTitleEnum,
      riskForm: {},
      rules: {
        title: [
          { required: true, message: i18n.t('标题不能为空'), trigger: 'blur' },
          {
            max: 49,
            message: i18n.t('标题长度不能大于49个字符'),
            trigger: 'blur',
          },
        ],

        displayUserName: {
          required: true,
          message: i18n.t('处理人不能为空'),
          trigger: 'change',
        },

        priority: {
          required: true,
          message: i18n.t('优先级不能为空'),
          trigger: 'change',
        },

        status: {
          required: true,
          message: i18n.t('状态不能为空'),
          trigger: 'change',
        },
      },

      filterAssignUser: '', //处理人搜索
    }
  },
  computed: {
    // 是否是查看详情 查看详情
    detailPower() {
      return this.type !== 'detail'
    },
    // 处理人
    assignUserFilterList() {
      let assignUsersList = this.$store.state.projectOverviewMilepost
        .assignUsersList
      if (this.filterAssignUser.trim().length === 0) {
        return assignUsersList
      }
      return assignUsersList.map(item => {
        return {
          ...item,
          hidden: item.value.indexOf(this.filterAssignUser) === -1,
        }
      })
    },
    // 风险状态列表
    riskStatus() {
      return this.$store.state.projectInfoAndRisk.statusOptions.riskStatus
    },
    // 优先级列表
    priorityList() {
      return this.$store.state.projectInfoAndRisk.priorityList
    },
    ...mapState({
      loading: state => state.projectOverviewMilepost.loading,
      selectedWorkItemType: state =>
        state.projectOverviewDynamic.projectDynamicInfo.workItemType,
    }),
  },

  watch: {
    riskVisible(visible) {
      if (!visible) {
        this.resetForm()
      } else {
        this.initForm()
      }
    },
  },

  created() {
    this.requestAssignUsersList()
  },
  mounted() {
    this.initForm()
  },
  methods: {
    // 获取用户列表
    requestAssignUsersList() {
      if (this.type === 'detail') {
        return
      }
      this.$store.dispatch('getAssignUsersList', {
        projectId: this.$getUrlParams().projectId,
      })
    },
    changeAssignUser(value) {
      const currentAssignUser = this.assignUserFilterList?.find(item => {
        return item.value === value
      })
      this.riskForm.assignUser = currentAssignUser?.userId
      this.riskForm.assignUserName = currentAssignUser?.userName
    },
    // 处理人下拉框隐藏时，清空
    assignUserVisibleChange(visible) {
      if (!visible) {
        this.filterAssignUser = ''
      }
    },
    // 初始化form表单
    initForm() {
      let displayUserName = ''
      if (this.type !== 'create') {
        displayUserName =
          this.riskDetailInfo.displayUserName ||
          `${this.riskDetailInfo.assignUserName}(${this.riskDetailInfo.assignUser})`
      }
      this.riskForm = {
        ...initRiskForm,
        ...this.riskDetailInfo,
        displayUserName,
      }
    },
    // 重置form表单
    resetForm() {
      this.riskForm = {
        ...initRiskForm,
      }
    },
    // 发送新增风险请求
    async requestCreateRisk() {
      await this.$store.dispatch('createRisk', this.riskForm)
      // 项目动态随之更新
      this.$store.dispatch('getProjectDynamic', {
        projectId: this.projectId,
        workItemType: this.selectedWorkItemType,
        isQuery: true,
      })

      this.beforeClose()
    },
    // 发送更新风险请求
    async requestUpdateRisk() {
      await this.$store.dispatch('updateRisk', this.riskForm)
      // 项目动态随之更新
      this.$store.dispatch('getProjectDynamic', {
        projectId: this.projectId,
        workItemType: this.selectedWorkItemType,
        isQuery: true,
      })

      this.beforeClose()
    },
    //点击确认  创建/编辑里程碑
    submitForm: debounce(function(riskForm) {
      this.submitFormDebounce(riskForm)
    }, 1000),
    submitFormDebounce(riskForm) {
      this.$refs[riskForm].validate(valid => {
        if (!valid) {
          return false
        }
        // 创建风险
        if (this.type === 'create') {
          this.riskForm.projectId = this.projectId
          this.requestCreateRisk()
          //编辑风险
        } else if (this.type === 'edit') {
          this.requestUpdateRisk()
        }
      })
    },
    // 弹窗关闭前
    beforeClose() {
      this.$emit('beforeClose')
    },
  },
}
</script>
<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
.search-box {
  text-align: center;
  padding: 10px 20px;
}
.assign-list-box {
  max-height: 150px;
  min-height: 60px;
  overflow-y: auto;
}
.hidden-option {
  height: 0;
  overflow: hidden;
}
</style>
