<template>
  <div v-if="dialogVisible">
    <el-dialog
      :title="dialogFormTitle"
      :visible.sync="dialogVisible"
      class="el-dialog-580w"
      :modal-append-to-body="false"
      @close="closeDialog"
    >
      <div v-if="dialogVisible" class="form-iterm-box">
        <el-form
          ref="sprintForm"
          :model="sprintForm"
          :label-width="$isEnglish() ? '140px' : '80px'"
        >
          <!-- wangling -->
          <el-form-item :label="$t('所属项目')" prop="projectName">
            <!--            <span v-if="$getUrlParams().projectId">{{-->
            <!--              currentProjectName-->
            <!--            }}</span>-->
            <el-input
              v-if="$getUrlParams().projectId"
              v-model.trim="currentProjectName"
              :placeholder="$t('输入迭代名称')"
              disabled
              class="disable-input"
            ></el-input>
            <el-select
              v-else
              v-model="currentProjectName"
              :placeholder="$t('请选择')"
              :popper-append-to-body="false"
              style="width:166px;"
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in projectNameList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            ref="nameInput"
            :label="$t('迭代名称')"
            prop="name"
            :rules="[
              { required: true, message: $t('迭代名称不能为空') },
              {
                min: 0,
                max: 40,
                message: $t('迭代名称不能超过40个字符'),
                trigger: 'change',
              },
            ]"
          >
            <el-input
              v-model.trim="sprintForm.name"
              v-focus
              autocomplete="off"
              :placeholder="$t('输入迭代名称')"
            ></el-input>
          </el-form-item>

          <el-form-item
            v-if="dialogFormVisible"
            :label="$t('开始时间')"
            prop="startTime"
            :rules="SprintStartTimeRules"
            class="date_start"
          >
            <custom-date
              v-model="sprintForm.startTime"
              style="width:100%;"
              @change="manualValidate('startTime')"
            ></custom-date>
          </el-form-item>
          <el-form-item
            v-if="dialogFormVisible"
            :label="$t('结束时间')"
            prop="endTime"
            :rules="SprintEndTimeRules"
            class="date_start"
          >
            <custom-date
              v-model="sprintForm.endTime"
              style="width:100%;"
              @change="manualValidate('endTime')"
            ></custom-date>
          </el-form-item>
          <el-form-item :label="$t('负责人')" prop="endTime">
            <select-filter
              v-model="sprintForm.chargeUser"
              :select-list="assignUserData"
              :is-assign-user="true"
              :assign-user-choice-focus="false"
              :placeholder="$t('请选择负责人')"
            ></select-filter>
          </el-form-item>
          <el-form-item :label="$t('迭代描述')" prop="sprintDesc">
            <el-input
              v-model="sprintForm.sprintDesc"
              type="textarea"
              autocomplete="off"
              :rows="3"
              :max="200"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div v-if="sprintForm.id > 0" slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="updateSprint()">{{
          $t('确定')
        }}</el-button>
      </div>
      <div v-else slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">{{ $t('取消') }}</el-button>
        <el-button
          ref="submitBtn"
          type="primary"
          :disabled="disabledAdd"
          @click="addSprint()"
          >{{ $t('确定') }}</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import CustomDate from '@/components/custom-date'
import * as sprintService from '@/service/sprint'
import * as projectService from '@/service/project'
import { guide } from '@/store/mutation-types'
import { guideType, guideStep } from '@/components/guide/guideData'

export default {
  name: 'SprintCreactOrEditDialog',
  components: {
    CustomDate,
  },
  mixins: [],
  props: {
    dialogFormTitle: {
      type: String,
      require: true,
      desc: '迭代title,是创建迭代还是编辑迭代',
    },

    dialogFormVisible: {
      type: Boolean,
      desc: '弹窗隐藏或者显示',
    },

    sprintEditForm: {
      type: Object,
      required: false,
      desc: '迭代数据',
    },

    sureUpdateSprint: {
      type: Function,
      required: false,
      desc: '编辑迭代更新成功回调函数',
    },

    sureAddSprint: {
      type: Function,
      required: false,
      desc: '新建迭代成功回调函数',
    },
  },

  data() {
    //结束时间不能为空
    const validateSprintStartTime = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(i18n.t('开始时间不能为空')))
      } else {
        if (this.sprintForm.endTime !== '') {
          this.$refs.sprintForm.validateField('endTime')
        }
        callback()
      }
    }
    const validateSprintEndTime = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(i18n.t('结束时间不能为空')))
      } else if (value < this.sprintForm.startTime) {
        callback(new Error(i18n.t('结束时间不能早于开始时间')))
      } else {
        callback()
      }
    }
    return {
      SprintStartTimeRules: [
        { required: true, validator: validateSprintStartTime, trigger: 'blur' },
      ],

      SprintEndTimeRules: [
        { required: true, validator: validateSprintEndTime, trigger: 'blur' },
      ],

      disabledAdd: false, // 防止多次提交
      dialogVisible: false,
      assignUserData: [],
      sprintForm: {
        id: 0,
        projectId: '',
        name: '',
        startTime: '',
        endTime: '',
        chargeUser: '',
        sprintDesc: '',
      },

      firstProjectName: '',
      projectNameList: [],
      currentProjectName: this.$store.state.projectName,
    }
  },
  computed: {},
  watch: {
    dialogFormVisible: {
      handler: function(newValue) {
        this.dialogVisible = newValue
      },
      immediate: true,
    },

    sprintEditForm: {
      handler: function(editForm) {
        if (editForm && this.dialogFormTitle == i18n.t('编辑迭代')) {
          //   this.sprintForm = {
          //     id: editForm.id,
          //     projectId: editForm.projectId,
          //     name: editForm.name,
          //     startTime: editForm.startTime,
          //     endTime: editForm.endTime,
          //     chargeUser: this.sprintForm.chargeUser || editForm.chargeUser,
          //     sprintDesc: editForm.sprintDesc
          //   };
          this.sprintForm = { ...editForm }
        }
      },
      deep: true,
      immediate: true,
    },

    dialogVisible: {
      handler: function(newValue) {
        let projectId = this.$getUrlParams().projectId
        if (
          newValue &&
          this.dialogFormTitle == i18n.t('创建迭代') &&
          !projectId
        ) {
          this.getProjectList()
        }

        if (projectId) {
          this.getAssignUser()
          this.currentProjectName = this.$store.state.projectName
        }

        if (this.dialogFormTitle == i18n.t('创建迭代')) {
          if (newValue) {
            this.initGuide()
            return
          }
          this.$store.commit(guide.STOP_STEP)
        }
      },
      immediate: true,
    },
  },

  created() {},
  methods: {
    initGuide() {
      if (
        this.$store.state.guide.guideType === guideType.sprint &&
        this.dialogVisible === true
      ) {
        let stepIndex = this.$store.state.guide.stepIndex || 2
        if (this.$store.state.guide.stepIndex) {
          this.$store.commit(guide.RECOVERY_STEP)
        }
        if (this.dialogFormVisible === false) {
          this.dialogFormVisible = true
          this.sprintForm.id = 0
        }
        this.$nextTick(() => {
          let _this = this
          this.$store.commit(guide.START_GUIDE, {
            guideType: guideType.sprint,
            guideStep: guideStep.sprintCreate,
            step: stepIndex,
            steps: {
              2: {
                dom: this.$refs.nameInput,
                prevCallback() {
                  // 回到上一步
                  _this.closeDialog()
                  // 兼容用户主动关闭结束的指引
                  setTimeout(() => {
                    _this.$emit('guideBack')
                  }, 50)
                },
              },
              3: {
                dom: this.$refs.submitBtn,
                nextCallback() {
                  // 下一步回调
                  _this.closeDialog()
                  // 兼容用户主动关闭结束的指引
                  _this.$store.commit(
                    guide.UPDATE_GUIDE_STEP,
                    guideStep.sprintPlanning,
                  )
                  setTimeout(() => {
                    _this.$bus.$emit('G_splitPlanning')
                  }, 50)
                },
              },
            },
          })
        })
      }
    },
    manualValidate(keyName) {
      this.$refs.sprintForm.validateField(keyName)
    },
    //获取用户
    getAssignUser(projectId1) {
      let projectId = projectId1 || this.$getUrlParams().projectId
      this.userData = this.$store.state.gd.userInfo
      // let query = value || null;
      projectService.getUserList({ projectId }).then(res => {
        //todo cpp 这里应该获取自己的queryType=1
        const { data } = res
        this.assignUserData = Array.isArray(data)
          ? data.map(item => {
              return {
                key: item.userId,
                value: item.userName + '(' + item.userId + ')',
              }
            })
          : []
        let user =
          this.assignUserData.find(n => n.key == this.userData.userId) || {}
        if (this.dialogFormTitle == i18n.t('创建迭代')) {
          this.sprintForm.chargeUser = user.key
        }
      })
    },
    // 获取项目列表
    getProjectList() {
      projectService.projectList().then(res => {
        if (res.status == 200) {
          let projectList =
            res.data &&
            res.data.map(item => {
              return {
                id: item.id,
                name: item.name,
              }
            })
          this.sprintForm.projectId = projectList[0].id
          //   每次创建完，选择第一个项目做准备
          this.firstProjectName = projectList[0].name
          this.currentProjectName = projectList[0].name
          this.projectNameList = projectList
          this.getAssignUser(projectList[0].id)
        }
      })
    },
    handleProjectChange(id) {
      this.sprintForm.projectId = id
      this.getAssignUser(id)
    },
    //   迭代编辑更新
    updateSprint() {
      this.$refs['sprintForm'].validate(validate => {
        if (validate) {
          this.sprintForm.projectId = this.$getUrlParams().projectId
          this.sendUpdateSprintRequest()
        }
      })
    },
    // 迭代编辑更新发生请求
    sendUpdateSprintRequest() {
      sprintService.updateSprint(this.sprintForm).then(res => {
        if (res.status == 200) {
          this.sureUpdateSprint && this.sureUpdateSprint()
          this.$message({
            message: res.msg || i18n.t('修改迭代成功'),
            type: 'success',
          })

          this.$emit('change', 'edit')
        } else {
          this.$message({
            message: res.msg || i18n.t('修改失败'),
            type: 'error',
          })
        }
        this.closeDialog()
      })
    },
    //   迭代新建
    addSprint() {
      this.$refs['sprintForm'].validate(validate => {
        if (validate) {
          this.disabledAdd = true
          this.sprintForm.projectId =
            this.$getUrlParams().projectId || this.sprintForm.projectId
          this.sendAddSprintRequest()
        }
      })
    },
    // 迭代新建发送请求
    sendAddSprintRequest() {
      let projectId = this.sprintForm.projectId
      sprintService
        .addSprint(this.sprintForm)
        .then(res => {
          if (res.status == 200) {
            this.$message({
              message: res.msg || i18n.t('添加迭代成功'),
              type: 'success',
            })

            this.sureAddSprint && this.sureAddSprint()

            this.$router.push(`/sprint/list?projectId=${projectId}`)
          } else {
            // this.$message({ message: res.msg || "添加失败", type: "error" });
          }
          this.disabledAdd = false
          this.closeDialog()
        })
        .catch(() => {
          this.disabledAdd = false
        })
    },
    clearSprintForm() {
      this.sprintForm = {
        id: 0,
        projectId: '',
        name: '',
        startTime: '',
        endTime: '',
        chargeUser: this.sprintForm.chargeUser,
        sprintDesc: '',
      }

      this.currentProjectName = this.firstProjectName
    },
    closeDialog() {
      this.$emit('update:dialogFormVisible', false)
      this.clearSprintForm()
    },
  },
}
</script>
<style lang="scss" scoped>
/deep/ .el-dialog {
  border-radius: 8px;
}
/deep/ .el-input.is-disabled .el-input__inner {
  color: #666666;
  border: 1px solid #e5e5e5;
}
/deep/ .el-input__inner {
  border-radius: 4px;
}
/deep/ .el-dialog__footer {
  padding: 0 0 10px;
}
</style>
