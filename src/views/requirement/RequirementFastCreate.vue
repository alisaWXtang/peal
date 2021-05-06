<template>
  <div class="fast-create-content-box">
    <el-input
      v-model="sendRqueireInfo.title"
      v-focus
      class="fast-create-item"
      :placeholder="$t('输入标题,回车新建')"
      @keyup.enter.native="enterToSave"
    ></el-input>
    <el-select
      v-model="sendRqueireInfo.priority"
      class="fast-create-item-select"
    >
      <el-option
        v-for="(data, index) in priorityList"
        :key="index"
        :label="data.value"
        :value="data.key"
      >
        <template>
          <span style="float: left">
            <span
              class="mini-circle"
              :style="{ backgroundColor: data.color }"
            ></span
            >{{ data.literal }}
          </span>
        </template>
      </el-option>
    </el-select>
    <select-filter
      v-model="sendRqueireInfo.sprintId"
      class="fast-create-item-select"
      :select-list="sprintList"
      :popper-append-to-body="true"
      :placeholder="$t('请选择迭代')"
    />
    <select-filter
      v-model="sendRqueireInfo.assignUser"
      class="fast-create-item-select"
      :select-list="assignUserData"
      :popper-append-to-body="true"
      :placeholder="$t('请选择处理人')"
      :is-assign-user="true"
      :assign-user-choice-focus="false"
    ></select-filter>
    <span class="cursor-pointer c-blue" @click="saveRequir">{{
      $t('保存')
    }}</span>
    <span class="cursor-pointer c-blue" @click="cancleRequire">{{
      $t('取消')
    }}</span>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 快速创建需求组件
 * @desc
 * @author heyunjiang
 * @date
 */

import { getWorkItemDefaultTemplateDetail } from '@/service/project/projectCommon'
import ACTIONSTYPE from '@/store/action-types'
import { requirementCreate } from '@/service/requirement'
import { getUserList } from '@/service/project'
import { getListSprintName } from '@/service/sprint'
import { priorityList } from '@/service/bug'
let RESETSENDREQUIRE = {
  title: '',
  categoryId: 0,
  priority: null,
  sprintId: '',
  assignUser: '',
  innerProject: true,
  userDefinedAttrs: {},
}

export default {
  name: 'RequirementFastCreate',
  components: {},
  mixins: [],
  props: {
    projectId: {
      type: [String, Number],
      required: true,
    },

    currentCategoryId: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      RESETSENDREQUIRE,
      // 快速创建需求数据对象
      sendRqueireInfo: {
        ...RESETSENDREQUIRE,
      },

      priorityList: [], //优先级列表
      sprintList: [], //迭代列表
      assignUserData: [], //处理人
      templateInfo: {}, // 模板详情
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.init()

    const parent = this.$el.closest('.hidden-columns')
    if (parent) {
      this.$el.closest('.hidden-columns').style = 'z-index: inherit'
    }
  },
  methods: {
    // 按enter建保存快速创建需求
    enterToSave() {
      this.saveRequir()
    },
    // 获取需求分类
    async init() {
      this.getAssignUser()
      this.getSprintList()
      this.getPriorityList()
      this.templateInfo = await this.getDefaultTemplateInfoForFastCreate()
      this.sendRqueireInfo.title = this.templateInfo.title
    },
    //快速保存需求
    async saveRequir() {
      if (!this.sendRqueireInfo.title) {
        this.$message({ type: 'error', message: i18n.t('需求标题不能为空') })
        return
      }
      const requiredValid = await this.$store.dispatch(
        ACTIONSTYPE.VALIDTEMPLATEINFOFORFASTCREATE,
        {
          fieldsList: this.templateInfo.fieldsList.map(item => {
            // 忽略子需求状态、指派给的必填校验
            if (['statusId', 'assignUser'].includes(item.attrName)) {
              return {
                ...item,
                required: false,
              }
            }
            return item
          }),
          formInfo: this.sendRqueireInfo,
        },
      )

      if (requiredValid.fieldName) {
        this.$message({
          message: `${requiredValid.fieldName}${i18n.t('不能为空')}`,
          type: 'error',
        })

        return false
      }
      this.sendRqueireInfo.projectId = this.projectId
      this.sendRqueireInfo.categoryId = this.currentCategoryId
      // 获取自定义字段的默认值对象
      requirementCreate({
        ...this.templateInfo,
        ...this.sendRqueireInfo,
        userDefinedAttrs: {
          ...this.templateInfo.userDefinedAttrs,
          ...this.sendRqueireInfo.userDefinedAttrs,
        },
      }).then(ret => {
        if (ret.status === 200) {
          this.$message({
            message: ret.msg || i18n.t('添加需求成功'),
            type: 'success',
          })

          this.$emit('saveRequirSuccess')
          this.sendRqueireInfo = { ...this.RESETSENDREQUIRE }
        }
      })
    },
    //取消快速创建
    cancleRequire() {
      this.$emit('cancleRequire')
      this.sendRqueireInfo = { ...this.RESETSENDREQUIRE }
    },
    // 获取用户
    getAssignUser(value) {
      let projectId = this.projectId
      let query = value || null
      getUserList({ projectId, query }).then(res => {
        if (res.status === 200) {
          this.assignUserData = res.data.map(item => {
            return {
              key: item.userId,
              value: item.userName + '(' + item.userId + ')',
            }
          })
        }
      })
    },
    // 获取迭代列表
    getSprintList() {
      getListSprintName({
        projectId: this.projectId,
        status: 1,
      }).then(res => {
        if (res.status === 200) {
          this.sprintList = res.data.map(item => {
            return {
              value: item.name,
              key: item.id,
              id: item.id,
            }
          })
          this.sprintList.unshift({
            key: 0,
            value: i18n.t('未规划'),
          })
        }
      })
    },
    // 获取优先级
    getPriorityList() {
      let projectId = this.projectId
      priorityList({
        projectId,
        workItemType: 1,
      }).then(res => {
        if (res.status == 200) {
          this.priorityList = res.data.map(item => {
            return {
              value: item.literal,
              key: item.priority,
              color: item.color,
              ...item,
            }
          })
          this.$nextTick(() => {
            this.sendRqueireInfo.priority = 80
          })
        }
      })
    },
    // 默认模版基本信息 - 用于快速创建工作项、工作项分解等需要获取模板默认值的地方
    async getDefaultTemplateInfoForFastCreate(projectId, workItemType = 1) {
      let result = await getWorkItemDefaultTemplateDetail({
        projectId: +projectId,
        workItemType: +workItemType,
      })

      let obj = { userDefinedAttrs: {} }
      if (result.status === 200) {
        obj = {
          title: result.data.title,
          content: result.data.content,
          userDefinedAttrs: {},
        }
        ;(result.data.attrs || []).forEach(item => {
          let presetValue = {}
          try {
            presetValue = JSON.parse(item.presetValue) || {}
          } catch (_) {
            presetValue = {}
          }
          if (!item.userDefined) {
            obj[item.attrName] = presetValue.key
          } else {
            obj.userDefinedAttrs[item.attrName] = presetValue.key
          }
        })
        obj.tmplId = result.data.id
      }
      obj.fieldsList = result.data?.attrs || []
      return obj
    },
  },
}
</script>
<style lang="scss" scoped>
.fast-create-content-box {
  width: 10000px;
  z-index: 2;
  // background-color: #fff;
  height: 100%;
  top: 57px;
  position: relative;
  left: 15px;
  visibility: visible;
  display: flex;
  align-items: center;

  .fast-create-item,
  .fast-create-item-select {
    width: 200px;
    display: inline-block;
    margin-right: 10px;
  }
}
</style>
