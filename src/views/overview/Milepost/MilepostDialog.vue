<template>
  <co-dialog
    :title="dialogTitleEnum[type]"
    :visible="milepostVisible"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :width="$isEnglish() ? '840px' : '640px'"
    :before-close="beforeClose"
  >
    <div v-loading="loading">
      <co-form
        ref="milepostForm"
        :model="milepostForm"
        class="milepost-from"
        :label-width="$isEnglish() ? '210px' : '110px'"
        :rules="rules"
      >
        <co-form-item :label="$t('标题')" prop="title">
          <co-input
            v-model.trim="milepostForm.title"
            :maxlength="49"
            :placeholder="$t('请输入里程碑标题，字数限制49字符')"
            :disabled="!detailPower"
          ></co-input>
        </co-form-item>
        <co-form-item :label="$t('描述')" prop="description">
          <co-input
            v-model.trim="milepostForm.description"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :disabled="!detailPower"
          ></co-input>
        </co-form-item>
        <co-form-item :label="$t('处理人')" prop="displayUserName">
          <co-select
            v-model="milepostForm.displayUserName"
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
        <co-form-item :label="$t('预计完成时间')" prop="endTimePlan">
          <custom-date
            v-model="milepostForm.endTimePlan"
            class="basic-title-input-active"
            value-format="yyyy-MM-dd"
            :disabled="!detailPower"
          ></custom-date>
        </co-form-item>
        <co-form-item :label="$t('实际完成时间')" prop="endTimeActual">
          <custom-date
            v-model="milepostForm.endTimeActual"
            class="custom-date-actual"
            value-format="yyyy-MM-dd"
            :disabled="!detailPower"
          ></custom-date>
        </co-form-item>
        <co-form-item :label="$t('状态')" prop="status">
          <co-select
            v-model="milepostForm.status"
            :placeholder="$t('请选择状态')"
            :disabled="!detailPower"
            @change="statusChange"
          >
            <co-option
              v-for="item in milepostStatusList"
              :key="item.status"
              :label="item.desc"
              :value="item.status"
            ></co-option>
          </co-select>
        </co-form-item>
      </co-form>
      <div v-if="detailPower" slot="footer" class="dialog-footer">
        <co-button @click="beforeClose">{{ $t('取消') }}</co-button>
        <co-button type="primary" @click="submitForm('milepostForm')">{{
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
import dayjs from 'dayjs'
import debounce from 'lodash/debounce'
import { mapState } from 'vuex'
import CustomDate from '@/components/custom-date'

const dialogTitleEnum = {
  create: i18n.t('新建里程碑'),
  edit: i18n.t('编辑里程碑'),
  detail: i18n.t('查看里程碑'),
}

// 重置form表单
const initMilepostForm = {
  title: '',
  projectId: '',
  description: '',
  assignUser: '',
  displayUserName: '',
  endTimePlan: '',
  endTimeActual: '',
  status: 1,
}

export default {
  name: 'MilepostDialog',
  components: {
    CustomDate,
  },
  mixins: [],
  props: {
    type: {
      type: String,
      required: true,
      desc: '该属性判断弹窗的类型: create(新建), edit(编辑), detail(详情)',
    },

    milepostVisible: {
      type: Boolean,
      required: true,
      desc: 'dialog弹窗关闭还是开启',
    },

    milepostDetailInfo: {
      type: Object,
      required: true,
      desc: '编辑或查看里程碑时数据',
    },
  },

  data() {
    return {
      projectId: this.$getUrlParams().projectId,
      dialogTitleEnum: dialogTitleEnum,
      milepostForm: {},
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

        endTimePlan: {
          required: true,
          message: i18n.t('预计完成时间不能为空'),
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
    // 里程碑状态列表
    milepostStatusList() {
      return this.$store.state.projectInfoAndRisk.statusOptions.milepostStatus
    },
    ...mapState({
      loading: state => state.projectOverviewMilepost.loading,
      selectedWorkItemType: state =>
        state.projectOverviewDynamic.projectDynamicInfo.workItemType,
    }),
  },

  watch: {
    milepostVisible(visible) {
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
    // 初始化form表单
    initForm() {
      let displayUserName = ''
      // 由于前面没有用到通过id查询的接口,为了兼容通过id查询的接口
      if (this.type !== 'create') {
        displayUserName =
          this.milepostDetailInfo.displayUserName ||
          `${this.milepostDetailInfo.assignUserName}(${this.milepostDetailInfo.assignUser})`
      }
      this.milepostForm = {
        ...initMilepostForm,
        ...this.milepostDetailInfo,
        displayUserName,
      }
    },
    // 重置form表单
    resetForm() {
      this.milepostForm = {
        ...initMilepostForm,
      }
    },
    // 处理人下拉框隐藏时，清空
    assignUserVisibleChange(visible) {
      if (!visible) {
        this.filterAssignUser = ''
      }
    },
    // 判断结束时间是否是未来，如果不是返回true,反之则返回false
    checkEndTime() {
      if ([null, ''].includes(this.milepostForm.endTimeActual)) {
        return true
      }
      // 获取当前日期
      const nowTime = new Date(dayjs().format('YYYY-MM-DD'))

      const endTime = new Date(this.milepostForm.endTimeActual)

      if (endTime > nowTime) {
        this.$message({
          message: i18n.t('里程碑的实际完成时间不能设为未来时间！'),
          type: 'error',
        })
      }

      return endTime <= nowTime
    },
    changeAssignUser(value) {
      const currentAssignUser = this.assignUserFilterList?.find(item => {
        return item.value === value
      })
      this.milepostForm.assignUser = currentAssignUser?.userId
      this.milepostForm.assignUserName = currentAssignUser?.userName
    },
    // 发送新增里程碑请求
    async requestCreateMilepost() {
      await this.$store.dispatch('createMilepost', this.milepostForm)
      // 项目动态随之更新
      this.$store.dispatch('getProjectDynamic', {
        projectId: this.projectId,
        workItemType: this.selectedWorkItemType,
        isQuery: true,
      })

      this.beforeClose()
    },
    // 发送更新请求
    async requestUpdateMilepost() {
      await this.$store.dispatch('updateMilepost', this.milepostForm)
      // 项目动态随之更新
      this.$store.dispatch('getProjectDynamic', {
        projectId: this.projectId,
        workItemType: this.selectedWorkItemType,
        isQuery: true,
      })

      this.beforeClose()
    },
    //点击确认  创建/编辑里程碑
    submitForm: debounce(function(milepostForm) {
      this.submitFormDebounce(milepostForm)
    }, 1000),
    submitFormDebounce(milepostForm) {
      this.$refs[milepostForm].validate(valid => {
        if (!valid || !this.checkEndTime()) {
          return false
        }
        // 创建里程碑
        if (this.type === 'create') {
          this.milepostForm.projectId = this.projectId
          this.requestCreateMilepost()
          //编辑里程碑
        } else if (this.type === 'edit') {
          this.requestUpdateMilepost()
        }
      })
    },
    statusChange(value) {
      // 已完成状态
      const completeStatusNum = 2
      // 获取当前日期
      const now = dayjs().format('YYYY-MM-DD')
      if (+value === completeStatusNum && !this.milepostForm.endTimeActual) {
        this.milepostForm.endTimeActual = now
      }
    },
    // 弹窗关闭前
    beforeClose() {
      this.$emit('beforeClose')
    },
  },
}
</script>
<style lang="scss" scoped>
.hidden-option {
  height: 0;
  overflow: hidden;
}
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
  overflow-y: auto;
  min-height: 60px;
}

/deep/ .el-date-editor {
  width: 100%;
}

// .complete-time {
//   display: flex;
//   justify-content: space-between;
//   .end-time-actual {
//     display: flex;
//     .custom-date-actual {
//       margin-left: 10px;
//     }
//   }
// }
</style>
