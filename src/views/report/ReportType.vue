<template>
  <div>
    <div class="report-module-title">{{ $t('报告类型与模板') }}</div>
    <el-form
      :model="typeTemplate"
      size="medium"
      class="report-type-form"
      label-width="80px"
    >
      <el-form-item :label="`${$t('选择类型')}`">
        <el-select
          v-model="typeTemplate.type"
          :placeholder="$t('请选择类型')"
          @change="typeChange"
        >
          <el-option
            v-for="item in typeList"
            :key="item.type"
            :label="item.display"
            :value="item.type"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="`${$t('选择模板')}`">
        <el-select
          v-model="typeTemplate.template"
          popper-class="report-group-select"
          :placeholder="$t('请选择模板')"
          @change="templateChange"
        >
          <el-option-group
            v-for="group in templateList"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.templateId"
              :label="item.title"
              :value="item.templateId"
              class="template-item"
            >
              <span>{{ item.title }}</span>
              <span
                v-show="item.auth"
                class="cursor-pointer icon-float-right"
                @click.stop="deleteItem(item)"
                >&nbsp;&nbsp;<i
                  class="el-icon-delete"
                  :title="$t('删除模板')"
                ></i
              ></span>
            </el-option>
          </el-option-group>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import {
  typeList as typeListService,
  reportTemplates as reportTemplatesService,
  deleteTemplate as deleteTemplateService,
} from '@/service/report'

export default {
  name: 'ReportType',
  components: {},
  mixins: [],
  props: {
    reportTypeId: String, //选择类型
    reportId: [Number, String], // // 模板id 或者草稿id
    templateId: [Number, String],
  },

  data() {
    return {
      oldTemplateVal: '',
      typeTemplate: {
        type: this.reportTypeId,
        template: '',
      },

      typeList: [],
      templateList: [],
    }
  },
  computed: {
    authTemplate() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_REPORT_DETAIL_DELETE',
        3,
        this.$getUrlParams().projectId,
      )
    },
  },

  watch: {
    'typeTemplate.template'(newVal, oldVal) {
      this.oldTemplateVal = oldVal
    },
  },

  async created() {
    await this.getTypes()
    await this.getTemplates()
    const { type } = this.$getUrlParams()
    // 报告 查默认模板内容
    if (type !== 'draft') {
      this.typeTemplate.template &&
        this.$emit('updateReportHeader', null, this.typeTemplate.template)
    }
  },
  methods: {
    //  下拉列表--类型 取第一个值
    async getTypes() {
      try {
        const res = await typeListService()
        const list = res.data
        this.typeList = list
        if (!this.typeTemplate.type) {
          const [firstItem] = list
          this.typeTemplate.type = firstItem.type
          this.$emit('update:reportTypeId', firstItem.type)
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 切换类型时，设置默认模板,系统模板和自定义模板，切换选择类型时，默认要选中自定义模板的第一项，当自定义模板为空时，则去找系统模板的第一项
    getDefaultTemplateItem(data) {
      let tmplObj = {}
      const tmplTypeArr = Object.keys(data)
      const lastTmplAttrs = tmplTypeArr[tmplTypeArr.length - 1]
      const firstTmplAttrs = tmplTypeArr[0]
      const lastTmplList = data[lastTmplAttrs]
      const firstTmplList = data[firstTmplAttrs]
      if (lastTmplList?.length) {
        tmplObj = lastTmplList[0]
      } else {
        if (firstTmplList.length) {
          tmplObj = firstTmplList[0]
        }
      }
      return tmplObj
    },
    //  下拉列表--模板
    async getTemplates(opt = true) {
      try {
        this.templateList = []
        const params = {
          projectId: this.$getUrlParams().projectId,
          type: this.typeTemplate.type,
        }

        const res = await reportTemplatesService(params)
        const data = res.data
        const firstItem = this.getDefaultTemplateItem(res.data)
        // 切换类型切换模板
        opt && (this.typeTemplate.template = firstItem?.templateId)
        this.templateList = []
        for (let [key, val] of Object.entries(data)) {
          const obj = {
            label: key,
            options: val.map(v => ({
              ...v,
              auth: key === i18n.t('系统模版') ? false : this.authTemplate,
            })),
          }

          this.templateList.push(obj)
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 删除下拉框的选项
    async deleteItem(info) {
      const { templateId, title } = info
      const result = await this.$confirmBeforeOperate(
        `${i18n.t('确定删除')}“${title}”${i18n.t('模板吗')}？`,
      )
      if (!result) {
        return
      }
      try {
        const res = await deleteTemplateService({
          templateId,
        })
        if (res.status === 200) {
          this.$message({
            type: 'success',
            message: i18n.t('删除成功'),
          })

          const opt = templateId === this.typeTemplate.template
          await this.getTemplates(opt)
          this.typeTemplate.template &&
            this.$emit('updateReportHeader', null, this.typeTemplate.template)
        } else {
          this.$message({
            type: 'error',
            message: i18n.t('系统错误'),
          })
        }
      } catch (e) {
        this.$message({
          type: 'error',
          message: i18n.t('系统错误'),
        })
      }
    },
    // 类型change
    async typeChange(value) {
      this.$emit('update:reportTypeId', value)
      await this.getTemplates()
      this.$emit(
        'updateReportHeader',
        value,
        this.typeTemplate.template || null,
      )
    },
    // 切换模板
    templateChange(value) {
      this.$confirm(
        i18n.t('是否更换模板？更换模板不会保存您原先编辑的内容'),
        i18n.t('提示'),
        {
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        },
      )
        .then(() => {
          this.$message({
            type: 'success',
            message: i18n.t('切换模板成功') + '!',
          })

          this.$emit('update:reportTemplateId', value)
          // 更新报告
          this.$emit('updateReportHeader', null, value)
        })
        .catch(() => {
          this.typeTemplate.template = this.oldTemplateVal
        })
    },
  },
}
</script>
<style lang="scss" scoped>
// .border-padding-left {
//   border-left: 2px solid #409eff;
//   padding-left: 10px;
// }
// .form-inline {
//   margin-left: 40px;
// }

.report-type-form {
  /deep/ .el-select {
    width: 445px;
  }

  .item-float-left {
    float: left;
  }
  .icon-float-right {
    float: right;
    color: #8492a6;
    font-size: 14px;
    line-height: 35px;
  }
  .icon-float-right:hover {
    color: #409eff;
  }
}

.template-item {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}
</style>
