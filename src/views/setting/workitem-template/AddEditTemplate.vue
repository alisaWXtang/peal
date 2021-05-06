<template>
  <div
    v-loading="loading"
    class="create-wrap"
    element-loading-text=" "
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
  >
    <div class="edit-create-tmpl">
      <div class="basic-info">
        <div class="title">{{ $t('模板基本信息') }}</div>
        <div class="tmpl-form-wrap">
          <el-form
            ref="tmplTableInfo"
            :model="tmplTableInfo"
            class="demo-form-inline"
            :label-width="$isEnglish() ? '140px' : '80px'"
            :rules="rules"
          >
            <el-form-item
              :label="$t('模板名称') + ':'"
              :required="true"
              prop="name"
            >
              <div class="form-item-box">
                <el-input
                  v-model="tmplTableInfo.name"
                  class="temp-input"
                ></el-input>
                <span class="small-tips">&lt;50{{ $t('字符') }}</span>
              </div>
            </el-form-item>
            <el-form-item :label="$t('说明') + ':'" prop="description">
              <div class="form-item-box">
                <el-input
                  v-model="tmplTableInfo.description"
                  class="temp-input"
                ></el-input>
                <span class="small-tips">&lt;50{{ $t('字符') }}</span>
              </div>
            </el-form-item>
            <el-form-item :label="$t('标题') + ':'" prop="title">
              <div style="font-size:12px;" class="temp-input">
                {{ $t('创建') }}{{ workItemDisplayInfo
                }}{{ $t('标题会应用该内容') }},{{
                  $t('如将标题模板设置为')
                }}:*[{{ $t('品牌') }}] [{{ $t('区域') }}]{{ workItemDisplayInfo
                }}{{ $t('标题') }}(&lt;50{{ $t('字符') }})
              </div>
              <el-input
                v-model="tmplTableInfo.title"
                class="temp-input"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('描述内容') + ':'">
              <div class="custom-right-template temp-input">
                <tiny-mce
                  :value="tmplTableInfo.content"
                  min-heigt="200px"
                  @watch="editHnadle($event)"
                ></tiny-mce>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="display-field-setting">
        <div class="title-wrap">
          <div class="title">
            {{ $t('显示字段配置') }}
            <span>({{ $t('可拖拽字段进行排序') }})</span>
          </div>
          <div class="add-field" @click="handleAddField">
            +{{ $t('添加已有字段') }}
          </div>
        </div>
        <el-table
          :data="seletionField"
          row-key="fieldName"
          class="field-drag-table"
          row-class-name="field-tr"
        >
          <el-table-column
            :label="$t('字段名')"
            prop="fieldName"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div class="field-name-table">
                <i
                  class="iconfont icon-drag tmpl-btn-public"
                  style="color:#666;"
                ></i>
                <span class="field-name">{{ scope.row.fieldName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('是否必填')" width="100">
            <template slot-scope="scope">
              <el-checkbox
                v-model="scope.row.required"
                :disabled="!scope.row.optional"
              ></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('操作')"
            :width="$isEnglish() ? '100' : '80'"
          >
            <template slot-scope="scope">
              <i
                v-if="!scope.row.hideable"
                class="el-icon-close tmpl-btn-public not-allow-click"
              ></i>
              <i
                v-else
                class="el-icon-close tmpl-btn-public close-btn"
                @click="handleDeleteSeletionField(scope.row.fieldName)"
              ></i>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="field-opration">
      <el-button class="btn-public" @click="cancelHandle">{{
        $t('取消')
      }}</el-button>
      <el-button
        type="primary"
        class="btn-public"
        @click="updateTmplHandle('tmplTableInfo')"
        >{{ $t('保存') }}</el-button
      >
    </div>
    <!-- 这里不能加v-if，加了有问题，两个弹窗打开时，关闭顶层的弹窗，下面弹窗的遮罩层会在弹窗上面 -->
    <add-field-dialog
      :visible="visible"
      :work-item-type="workItemType"
      :project-id="projectId"
      :seletion-field.sync="seletionField"
      @handleBeforeClose="handleClose"
      @success="successHandle"
    ></add-field-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { debounce } from 'throttle-debounce'
import Sortable from 'sortablejs'
import AddFieldDialog from './AddFieldDialog'
import { getWorkItemType } from './workItemTemplateUtils'
import {
  getWorkItemDefaultTemplateDetail,
  getWorkItemTemplateDetail,
} from '@/service/project/projectCommon'
import {
  createWorkItemTemplate,
  updateWorkItemTemplate,
  getWorkItemTemplateList,
} from '@/service/project/workItemTemplate'
const TinyMce = () => import('@/components/tinymce')
let vm
export default {
  name: 'AddEditTemplate',
  components: {
    TinyMce,
    // Sortable,
    AddFieldDialog,
  },

  mixins: [],
  props: {},
  data() {
    // 检查工作项模板名称是否重名
    let checkName = (rule, value, callback) => {
      value = value.trim()
      const checkedResult = this.checkedTmplNameRepeat(value)
      checkedResult.then(innerValue => {
        if (innerValue) {
          return callback(new Error(rule.message))
        } else {
          callback()
        }
      })
    }
    // 检查工作项模板名称是否为空字符串
    let checkTrimStr = (rule, value, callback) => {
      value = value.trim()
      if (!value) {
        return callback(new Error(rule.message))
      } else {
        callback()
      }
    }
    return {
      workItemType: '', //工作项类型
      workItemDisplayInfo: '', //工作项页面展示信息
      projectId: this.$getUrlParams().projectId,
      visible: false, //已有字段弹窗
      mode: '', //当前页面时创建还是编辑, create,edit
      currentTmplName: '', //当前的模板名称,主要用于校验重名
      tmplTableInfo: {
        name: '',
        title: '',
        content: '',
        description: '',
      },

      type: '', //模板类型，后端返回
      seletionField: [],
      rules: {
        name: [
          {
            required: true,
            message: i18n.t('模板名称不能为空'),
            trigger: ['blur', 'change'],
          },

          {
            message: i18n.t('模板名称不能为空字符串'),
            trigger: 'blur',
            validator: checkTrimStr,
          },

          {
            message: i18n.t('模板名称不能重复'),
            trigger: 'blur',
            validator: checkName,
          },

          {
            min: 0,
            max: 49,
            message: i18n.t('长度不能超过49个字符'),
            trigger: ['blur', 'change'],
          },
        ],

        title: [
          {
            min: 0,
            max: 49,
            message: i18n.t('长度不能超过49个字符'),
            trigger: ['blur', 'change'],
          },
        ],

        description: [
          {
            min: 0,
            max: 49,
            message: i18n.t('长度不能超过49个字符'),
            trigger: ['blur', 'change'],
          },
        ],
      },

      loading: false, //新建/编辑模板,加载中
    }
  },
  created() {
    this.currentCreateOrEdit()
    this.workItemType = getWorkItemType(this.$route).workItemType
    this.workItemDisplayInfo = getWorkItemType(this.$route).workItemDisplayInfo
  },
  mounted() {
    this.getTemplateDetailInfo()
    this.rowDrop()
    vm = this
  },
  updated() {
    vm = this
  },
  methods: {
    // 失焦- 模板名称是否重名
    async checkedTmplNameRepeat(name) {
      const result = await this.requestGetWorkItemTemplateList()
      return this.isExistArray(result.data, name)
    },
    // 获取全部模板列表
    async requestGetWorkItemTemplateList() {
      return getWorkItemTemplateList({
        workItemType: this.workItemType,
        projectId: this.$getUrlParams().projectId,
      })
    },
    isExistArray(list, name) {
      return (
        list &&
        list.find(
          item => item.name === name && item.name !== this.currentTmplName,
        )
      )
    },
    // 当前是创建还是编辑模式
    currentCreateOrEdit() {
      const { operation } = this.$route.params || {}
      this.mode = operation === 'edit' ? 'edit' : 'create'
    },
    // 获取新建模板或者编辑模板的信息
    getTemplateDetailInfo() {
      const tmplId = this.$route.query.tmplId
      if (this.mode === 'create') {
        this.requestGetWorkItemDefaultTemplateDetail()
      } else if (this.mode === 'edit' && tmplId) {
        this.requestGetWorkItemTemplateDetail(tmplId)
      }
    },
    // 获取当前启用的默认模板
    async requestGetWorkItemDefaultTemplateDetail() {
      const result = await getWorkItemDefaultTemplateDetail({
        projectId: this.projectId,
        workItemType: this.workItemType,
        forCreateTmpl: true,
      })

      if (result.status === 200) {
        const { content, attrs, type } = result.data
        this.tmplTableInfo.content = content
        this.type = type
        Object.keys(attrs).forEach(function(item) {
          if (!attrs[item].required) {
            attrs[item].optional = true
          }
        })
        this.seletionField = attrs
      }
    },
    // 查询工作项模板详细信息
    async requestGetWorkItemTemplateDetail(tmplId) {
      const result = await getWorkItemTemplateDetail({
        projectId: this.projectId,
        id: tmplId,
      })

      if (result.status === 200) {
        const {
          id,
          name,
          title,
          content,
          description,
          attrs,
          type,
        } = result.data
        this.tmplTableInfo = { id, name, title, content, description }
        this.currentTmplName = name
        this.type = type
        Object.keys(attrs).forEach(function(item) {
          if (!attrs[item].required) {
            attrs[item].optional = true
          }
        })
        this.seletionField = attrs
      }
    },
    // 编辑器事件 handler
    editHnadle(data) {
      this.tmplTableInfo.content = data
    },
    // 行拖拽
    rowDrop() {
      // 此时找到的元素是要拖拽元素的父容器
      const tbody = document.querySelector('.field-drag-table tbody')
      const _this = this
      Sortable.create(tbody, {
        // 指定父元素下可被拖拽的子元素
        draggable: '.el-table__row',
        animation: 300,
        delay: 0,
        onEnd({ newIndex, oldIndex }) {
          const currRow = _this.seletionField.splice(oldIndex, 1)[0]
          _this.seletionField.splice(newIndex, 0, currRow)
          this.seletionField = _this.seletionField
        },
      })
    },
    // 删除字段
    handleDeleteSeletionField(fieldName) {
      const deleteIndex = this.seletionField.findIndex(item => {
        return item.fieldName === fieldName
      })
      this.seletionField.splice(deleteIndex, 1)
    },
    // 点击 添加已有字段 打开弹窗
    handleAddField() {
      this.visible = true
    },
    // 关闭 已有字段弹窗
    handleClose() {
      this.visible = false
    },
    // 已有字段弹窗更新回调函数
    successHandle() {
      this.handleClose()
    },
    // 跳转到自定义模板列表
    toTempList() {
      const currentType = this.$route.params.type
      this.$router.replace(
        `/project/setting/template/${currentType}?projectId=${
          this.$getUrlParams().projectId
        }`,
      )
    },
    // 点击取消
    cancelHandle() {
      this.toTempList()
    },
    //创建工作项模板请求
    async requestCreateWorkItemTemplate(info) {
      this.loading = true
      let result = {}
      try {
        result = await createWorkItemTemplate({
          ...info,
        })
      } catch (error) {
        result.status = 0
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('新增模板成功'),
          type: 'success',
        })

        this.toTempList()
      } else {
        //  this.$message({
        //   message: "新增失败",
        //   type: "error"
        // });
        this.toTempList()
      }
    },
    // 更新工作项模板请求
    async requestUpdateWorkItemTemplate(info) {
      this.loading = true
      let result = {}
      try {
        result = await updateWorkItemTemplate({
          ...info,
        })
      } catch (error) {
        result.status = 0
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('更新模板成功'),
          type: 'success',
        })

        this.toTempList()
      } else {
        // this.$message({
        //   message: "更新失败",
        //   type: "error"
        // });
        this.toTempList()
      }
    },
    updateTmplHandle: debounce(1000, true, tableForm => {
      vm.$refs[tableForm].validate(valid => {
        if (!valid) {
          return
        }
        const info = {
          projectId: vm.projectId,
          workItemType: vm.workItemType,
          ...vm.tmplTableInfo,
          attrs: vm.seletionField,
          type: vm.type,
        }

        if (vm.mode === 'create') {
          // 新建模板
          vm.requestCreateWorkItemTemplate(info)
        } else if (vm.mode === 'edit') {
          // 更新
          vm.requestUpdateWorkItemTemplate(info)
        }
      })
    }),
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/setting/workitem-variable.scss';
.create-wrap {
  min-height: calc(100vh - 224px);
}
.edit-create-tmpl {
  display: flex;
  margin-bottom: 20px;
  .title {
    font-size: 14px;
    margin: 10px 0;
    font-weight: 700;
  }
  .basic-info {
    width: 55%;
    box-sizing: border-box;
  }
  .display-field-setting {
    width: 45%;
    padding-left: 10px;
    box-sizing: border-box;
    .title-wrap {
      display: flex;
      justify-content: space-between;
      span {
        font-size: 12px;
        font-weight: 400;
        margin-left: 4px;
      }
    }
    .add-field {
      margin: 10px 0;
      color: $--color-primary;
      font-size: 12px;
      font-weight: 700;
      align-self: flex-end;
      cursor: pointer;
    }
  }
  /deep/.el-form-item__label,
  /deep/.el-form-item__content {
    font-size: 14px;
  }

  .demo-form-inline .temp-input,
  .temp-input {
    width: 84%;
  }
}
.field-opration {
  text-align: center;
  position: fixed;
  bottom: 20px;
  left: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  z-index: 999;
}
.field-drag-table .tmpl-btn-public {
  font-size: 12px;
  cursor: pointer;
}
.field-drag-table .not-allow-click {
  cursor: default;
  color: $disabled-font-color;
}
/deep/.field-tr {
  cursor: move;
}
/deep/.el-checkbox__input.is-disabled .el-checkbox__inner::after,
/deep/.el-checkbox__input.is-disabled .el-checkbox__inner {
  cursor: default;
}
/deep/.el-checkbox__input.is-disabled .el-checkbox__inner {
  border-color: $disabled-font-color;
}
/deep/.el-checkbox__input .el-checkbox__inner {
  border-color: $can-selected-border-color;
}
.field-name-table {
  display: flex;
}
.field-name {
  font-size: 12px;
  margin-right: 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.form-item-box {
  display: flex;
  .small-tips {
    white-space: nowrap;
  }
}
</style>
