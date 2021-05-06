<template>
  <div>
    <div class="create-template">
      <span
        v-if="authObject.createAuth"
        class="create-btn"
        @click="createWorkTmpl"
        >+{{ $t('新增') }}{{ workItemDisplay }}</span
      >
      <span class="create-des"
        >({{ $t('默认模板在创建工作项时应用') }},{{
          $t('查看编辑页面的显示字段与创建时应用的模板一致')
        }}。)</span
      >
    </div>
    <el-table :data="workItemtmplList" stripe style="width: 100%">
      <el-table-column :label="$t('默认')" width="80" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-radio
            v-model="tmplActive"
            :label="scope.row.id"
            :disabled="!authObject.setActiveAuth"
            @change="activeChange(scope.row.id)"
            ><span></span
          ></el-radio>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('模板名称')"
        width="300"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span class="link-common" @click="toDetailOrEditTmpl(scope.row)">{{
            scope.row.name
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('说明')"
        min-width="350"
        prop="description"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :label="$t('操作')" width="120" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button
            v-if="authObject.updateAuth && isNotEventTracking(scope.row.type)"
            type="text"
            @click="editWorkTmpl(scope.row)"
            >{{ $t('编辑') }}</el-button
          >
          <el-button
            v-if="authObject.deleteAuth && !scope.row.systemTmpl"
            type="text"
            @click="deleteWorkTmpl(scope.row)"
            >{{ $t('删除') }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { mapActions } from 'vuex'
import {
  setWorkItemDefaultTemplate,
  deleteWorkItemTemplate,
  getWorkItemTemplateList,
} from '@/service/project/workItemTemplate'

export default {
  name: 'WorkItemTemplateTable',
  components: {},
  props: {
    currentTmplTab: {
      type: String,
      required: true,
      desc: '当前tab,require task bug',
    },
  },

  data() {
    return {
      projectId: this.$getUrlParams().projectId, //项目id
      workItemType: '', //工作项模板,1需求, 2任务, 3缺陷
      workItemDisplay: '', //工作项模板展示文字中文
      tmplActive: '',
      workItemtmplList: [],
      authObject: {
        //权限
        createAuth: false,
        setActiveAuth: false,
        updateAuth: false,
        deleteAuth: false,
      },
    }
  },
  computed: {},
  watch: {
    // 为了解决,当把权限撤销时,按钮第一次的状态不会改变的问题，如果是刷新进来的,就重新调用下用户权限接口
    $route: {
      handler(to, from) {
        if (!from) {
          this.isFlushToPage()
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.initAuth()
    this.getCurrentWorkItemType()
    this.requestGetTemplateList()
  },

  methods: {
    ...mapActions(['getUserInfo']),
    // 工作项模板列表是否是刷新进来的
    async isFlushToPage() {
      if (this.$route.meta.customTempl && !this.$route.meta.templDetail) {
        await this.getUserInfo()
        this.initAuth()
      }
    },
    // 缺陷初始化
    initAuth() {
      this.initcreateAuth()
      this.initsetActiveAuth()
      this.initupdateAuth()
      this.initdeleteAuth()
    },
    initcreateAuth() {
      this.authObject.createAuth = this.$authFunction(
        'FUNC_COOP_WORKITEM_TMPL_CREATE',
        3,
        this.$getUrlParams().projectId,
      )
    },
    initsetActiveAuth() {
      this.authObject.setActiveAuth = this.$authFunction(
        'FUNC_COOP_WORKITEM_TMPL_SET_ACTIVE',
        3,
        this.$getUrlParams().projectId,
      )
    },
    initupdateAuth() {
      this.authObject.updateAuth = this.$authFunction(
        'FUNC_COOP_WORKITEM_TMPL_UPDATE',
        3,
        this.$getUrlParams().projectId,
      )
    },
    initdeleteAuth() {
      this.authObject.deleteAuth = this.$authFunction(
        'FUNC_COOP_WORKITEM_TMPL_DELETE',
        3,
        this.$getUrlParams().projectId,
      )
    },
    // 获取模板列表
    async requestGetTemplateList() {
      const result = await getWorkItemTemplateList({
        projectId: this.projectId,
        workItemType: this.workItemType,
      })

      if (result.status === 200) {
        this.workItemtmplList = result.data
        // 获取当前选中模板,应该写在这里，先写在下面
        this.getActiveTmplId()
      }
    },
    contentPagainationChange(pageNum) {
      this.pageInfo.pageNum = pageNum
      this.requestGetTemplateList()
    },
    // 获取当前默认启用模板的模板id
    getActiveTmplId() {
      this.workItemtmplList.forEach(item => {
        if (item.active) {
          this.tmplActive = item.id
        }
      })
    },
    // 当前工作项类型
    getCurrentWorkItemType() {
      switch (this.currentTmplTab) {
        case 'require':
          this.workItemDisplay = i18n.t('需求模板')
          this.workItemType = 1
          break
        case 'task':
          this.workItemDisplay = i18n.t('任务模板')
          this.workItemType = 2
          break
        case 'bug':
          this.workItemDisplay = i18n.t('缺陷模板')
          this.workItemType = 3
          break
      }
    },
    async activeChange(id) {
      // 调用更新默认模板的方法
      let result = {}
      try {
        result = await setWorkItemDefaultTemplate({
          id,
          projectId: this.$getUrlParams().projectId,
        })
      } catch (error) {
        result.status = 0
      }
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('更新默认模板成功'),
          type: 'success',
        })
      } else {
        // this.$message({
        //   message: result.msg || "更新默认模板失败",
        //   type: "error"
        // });
        await this.getUserInfo()
        this.initAuth()
        this.requestGetTemplateList()
      }
    },
    // 创建模板
    createWorkTmpl() {
      this.toDetailTmplPage('create')
    },
    // 编辑模板
    editWorkTmpl(row) {
      this.toDetailTmplPage('edit', row.id)
    },
    // 删除模板
    async deleteWorkTmpl(row) {
      this.$confirm(
        `${i18n.t('确定要删除模板')}
"${row.name}"${i18n.t('吗')}
？`,
        i18n.t('删除提示'),
        {
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        },
      )
        .then(() => {
          this.requestDeleteWorkTmpl(row)
        })
        .catch(async () => {
          await this.getUserInfo()
          this.initAuth()
        })
    },
    // 删除模板请求
    async requestDeleteWorkTmpl(row) {
      let result = {}
      try {
        result = await deleteWorkItemTemplate({
          id: row.id,
          projectId: this.$getUrlParams().projectId,
        })
      } catch (error) {
        result.status = 0
      }
      if (result.status === 200) {
        this.$message({
          type: 'success',
          message: `${i18n.t('删除成功')}!`,
        })

        this.requestGetTemplateList()
      } else {
        // this.$message({
        //   type: "error",
        //   message: result.msg || "删除失败"
        // });
        await this.getUserInfo()
        this.initAuth()
      }
    },
    // 跳转到新建,编辑或详情模板页面，type:create/edit/detail,id:模板id(和查看页面编辑,需要传)
    toDetailTmplPage(type, id) {
      let path = `/project/setting/template/${this.currentTmplTab}/${type}`
      let query = {
        projectId: this.$getUrlParams().projectId,
      }

      if (['detail', 'edit'].includes(type)) {
        query.tmplId = id
      }
      this.$router.push({ path, query })
    },
    // 是否为埋点需求,true 不是埋点需求， false 是埋点需求
    isNotEventTracking(type) {
      const eventTrackingType = 0
      return type === eventTrackingType
    },
    // 有权限去编辑页面，没权限去查看页面
    toDetailOrEditTmpl(row) {
      const isAuthority =
        this.$authFunction(
          'FUNC_COOP_WORKITEM_TMPL_UPDATE',
          3,
          this.$getUrlParams().projectId,
        ) && this.isNotEventTracking(row.type)
      isAuthority
        ? this.toDetailTmplPage('edit', row.id)
        : this.toDetailTmplPage('detail', row.id)
    },
  },
}
</script>
<style lang="scss" scoped>
.create-template {
  margin-bottom: 16px;
  .create-btn {
    color: $--color-primary;
    font-size: 14px;
    font-weight: 700;
    &:hover {
      cursor: pointer;
    }
  }
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.pagination-custom {
  align-items: center;
}
.pagination-custom-input {
  width: 45px;
  display: inline-block;
}
/deep/.el-radio__input.is-disabled .el-radio__inner,
/deep/.el-radio__input.is-disabled + span.el-radio__label,
/deep/.el-radio__input.is-disabled .el-radio__inner::after {
  cursor: default;
}
</style>
