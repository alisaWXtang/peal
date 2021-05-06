<template>
  <div
    v-loading="loading"
    element-loading-text
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
  >
    <div v-if="currentType === 'list'" class="list-box">
      <header>
        <el-button
          v-show="
            $authFunction(
              'FUNC_COOP_PROJECT_SPRINT_TEMPLATE_ADD',
              3,
              projectId || $getUrlParams().projectId,
            )
          "
          type="primary"
          @click="addTem"
          >{{ $t('增加迭代模板') }}</el-button
        >
        <el-button v-if="showBack" type="text" @click="goBack">{{
          $t('返回')
        }}</el-button>
      </header>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column :label="$t('默认')" width="100">
          <template slot-scope="scope">
            <el-radio
              :value="scope.row.isDefault"
              :label="true"
              :disabled="!templateSettingAuth"
              @change="initRadioHandle(scope.row)"
              >{{ null }}</el-radio
            >
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('模板名称')"
          show-overflow-tooltip
          width="180"
        >
          <template slot-scope="scope">
            <div class="opreatebtns">
              <span @click="editTem(scope.row)">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('描述')"
          show-overflow-tooltip
          min-width="180"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('操作')" show-overflow-tooltip width="180">
          <template slot-scope="scope">
            <div class="opreatebtns">
              <span
                v-show="
                  $authFunction(
                    'FUNC_COOP_PROJECT_SPRINT_TEMPLATE_UPDATE',
                    3,
                    projectId || $getUrlParams().projectId,
                  )
                "
                @click="editTem(scope.row)"
                >{{ $t('编辑') }}</span
              >
              <span
                v-show="
                  $authFunction(
                    'FUNC_COOP_PROJECT_SPRINT_TEMPLATE_DELETE',
                    3,
                    projectId || $getUrlParams().projectId,
                  )
                "
                @click="deleteTem(scope.row)"
                >{{ $t('删除') }}</span
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else class="detail-box">
      <sprint-info-custom
        :template-id="currentSelectTemplateId"
        :type="currentType"
        @back="backList"
      ></sprint-info-custom>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import SprintInfoCustom from '@/views/sprint/SprintInfoCustom.vue'
import {
  sprintTemplateDelete,
  sprintTemplateList,
  sprintTemplateDefaultSetting,
} from '@/service/sprint'

export default {
  name: 'SprintStageManagement',
  components: {
    SprintInfoCustom,
  },

  mixins: [],
  props: {},
  data() {
    return {
      projectId: this.$getUrlParams().projectId,
      tableData: [
        {
          id: 1,
          name: '系统默认模板',
          isDefault: true,
          description: '系统自行创建',
        },

        { id: 2, name: 'sadf打发', isDefault: false, description: '打三分' },
      ],

      currentType: 'list', // list add update
      currentSelectTemplateId: -1, // -1 表示新建
      loading: false,
      showBack: false, // 是否展示返回按钮
    }
  },
  computed: {
    // 权限 - 是否可以设置迭代阶段模板
    templateSettingAuth() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_SPRINT_TEMPLATE_DEFAULT_SETTING',
        3,
        this.projectId,
      )
    },
  },

  watch: {},
  mounted() {
    this.getTemList()
    if (this.$getUrlParams().key && this.$getUrlParams().key === 'sprint') {
      this.showBack = true
    } else {
      this.showBack = false
    }
  },
  methods: {
    // 返回
    goBack() {
      this.$router.back()
    },
    // 操作前的确认
    async confirmBeforeOperate(text = '') {
      let result = null
      try {
        result = await this.$confirm(text, {
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        })
      } catch (_) {
        result = false
      }
      return result
    },
    // 获取模板列表
    async getTemList() {
      let result = {}
      try {
        this.loading = true
        result = await sprintTemplateList({
          projectId: this.projectId || this.$getUrlParams().projectId,
        })
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '获取迭代阶段模板列表数据失败',
        //   type: 'error'
        // })
        return
      }
      this.tableData = result.data.map(item => {
        return {
          ...item,
          isDefault: item.default,
        }
      })
    },
    // 点击编辑
    editTem(info) {
      this.currentSelectTemplateId = info.id
      this.currentType = 'update'
    },
    // 编辑返回
    backList() {
      this.currentType = 'list'
      this.getTemList()
    },
    addTem() {
      this.currentType = 'add'
      this.currentSelectTemplateId = -1
    },
    // 点击删除
    async deleteTem(info) {
      let result = await this.confirmBeforeOperate(
        `${i18n.t('确定删除模板')}${info.name}${i18n.t('吗')}？`,
      )

      if (!result) {
        return
      }

      result = {}
      try {
        this.loading = true
        result = await sprintTemplateDelete({
          templateId: info.id,
          projectId: this.projectId || this.$getUrlParams().projectId,
        })
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '删除失败',
        //   type: 'error'
        // })
      } else {
        this.$message({
          message: result.msg || i18n.t('删除成功'),
          type: 'success',
        })

        this.getTemList()
      }
    },
    // 更改模板默认
    async initRadioHandle(info) {
      let result = {}
      try {
        this.loading = true

        result = await sprintTemplateDefaultSetting({
          template: info.id,
          projectId: this.projectId || this.$getUrlParams().projectId,
          templateId: info.id,
        })
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '更改失败',
        //   type: 'error'
        // })
      } else {
        this.$message({
          message: result.msg || i18n.t('更改成功'),
          type: 'success',
        })

        this.getTemList()
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.list-box {
  header {
    margin-bottom: 10px;
  }
  .opreatebtns {
    span {
      display: inline-block;
      padding-right: 4px;
      color: $--color-primary;
      cursor: pointer;
      &:hover {
        color: $--color-primary-light-3;
      }
    }
  }
}
</style>
