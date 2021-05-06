<template>
  <el-dialog
    :title="$t(title)"
    :visible.sync="dialogVisible"
    width="1000"
    @close="close"
  >
    <div>
      <el-form ref="form" inline :model="form">
        <el-form-item>
          <el-select v-model="form.category" @change="getData">
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="form.severitys"
            multiple
            collapse-tags
            :placeholder="$t('缺陷等级')"
            @change="getData"
          >
            <el-option
              v-for="item in priorityList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.keyword"
            :placeholder="$t('输入ID、标题搜索')"
            @keyup.native.enter="getData"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="default" icon="el-icon-search" @click="search">{{
            $t('查询')
          }}</el-button>
          <el-button
            type="primary"
            icon="el-icon-download"
            :loading="exportLoading"
            :disabled="exportLoading"
            @click="exportData"
            >{{ $t('导出') }}</el-button
          >
        </el-form-item>
      </el-form>
      <div class="tips">{{ getCurrentDiTitle() }}</div>
      <el-table
        v-if="show"
        v-loading="loading"
        class="es-table"
        :data="list"
        :default-sort="defaultSort"
        max-height="500px"
        @sort-change="sortChange"
      >
        <el-table-column
          prop="idStr"
          show-overflow-tooltip
          label="ID"
          width="80px"
        >
        </el-table-column>
        <el-table-column prop="title" width="260px" :label="$t('标题')">
          <template v-slot="scope">
            <el-link
              style="display: inline"
              type="primary"
              :underline="false"
              target="_blank"
              :href="getTfsDefectUrl(scope.row)"
            >
              {{ scope.row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="projectId"
          :label="$t('项目代号')"
        ></el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="severity"
          :label="$t('缺陷等级')"
          width="120px"
        >
          <template v-slot="scope">{{ scope.row.display.severity }} </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="prop"
          width="120px"
          :label="$t('缺陷类型')"
        >
          <template v-slot="scope">
            {{ scope.row.display.defectType }}
          </template>
        </el-table-column>
        <el-table-column
          prop="assignUser"
          show-overflow-tooltip
          :label="$t('指派给')"
          width="120px"
        >
          <template v-slot="scope"
            >{{ scope.row.display.assignUser }}
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('状态')">
          <template v-slot="scope">
            {{ scope.row.display.status }}
          </template>
        </el-table-column>
        <el-table-column
          prop="moduleId"
          show-overflow-tooltip
          :label="$t('模块')"
        >
          <template v-slot="scope">{{ scope.row.display.module }} </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          sortable="custom"
          :label="$t('创建时间')"
          width="160px"
        >
        </el-table-column>
      </el-table>
      <div class="footer">
        <el-pagination
          v-if="pageTotal"
          :current-page.sync="form.pageInfo.pageNumber"
          :page-size.sync="form.pageInfo.pageSize"
          :page-sizes="[10, 20, 30, 40, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageTotal"
          class="es-pagination"
          @current-change="getData"
          @size-change="sizeChange"
        ></el-pagination>
      </div>
    </div>
  </el-dialog>
</template>

<script>
/**
 * @title di详情查看
 * @author chenxiaolong
 * @date 2020.10.26
 */
import { getRelatedTioDiData, getFilterOptions } from '@/service/tfsDefect'
// import { tfsDefectAction } from '@/store/action-types'
import { i18n } from '@/i18n'
import { defectKanban } from '@/api/tfs-defect'
export default {
  name: 'DiShowDialog',
  props: {
    show: {
      type: Boolean,
      required: true,
      desc: i18n.t('是否显示'),
    },

    data: {
      type: Object,
      required: true,
      desc: i18n.t('缺陷相关数据'),
    },

    type: {
      type: String,
      required: true,
      default: 'currentDI',
      desc: i18n.t('当前展示数据类型'),
    },
  },

  data() {
    return {
      list: [], // 表格数据
      pageTotal: 0,
      form: {
        category: 'ALL',
        severitys: [],
        keyword: '',
        order: 1,
        pageInfo: {
          pageNumber: 1,
          pageSize: 10,
        },
      },

      defaultSort: {
        prop: 'createTime',
        order: 'descending',
      },

      loading: false,
      exportLoading: false,
      priorityList: [], // 缺陷等级列表
      categories: [], // 分类
      exportUrl: '', // 导出地址
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.show
      },
      set(val) {
        this.$emit('update:show', val)
      },
    },
    title() {
      return this.type === 'currentDI'
        ? '当前DI值缺陷列表'
        : '去除待验证后DI值列表'
    },
    lossDIorDI() {
      return this.type === 'currentDI' ? 60 : 70 // 当前di值 60， 去除待验证后DI值 70
    },
  },
  mounted() {
    this.getFilters()
  },
  methods: {
    // 获取筛选条件
    getFilters() {
      Promise.all([
        getFilterOptions({ datasource: 'severity' }),
        getFilterOptions({ datasource: 'defectCategory' }),
      ]).then(res => {
        if (res[0]?.status === 200 && res[1]?.status === 200) {
          this.priorityList = res[0].data
          this.categories = res[1].data
        }
      })
    },
    // 改变每页参数
    sizeChange(size) {
      this.form.pageInfo = {
        pageSize: size,
        pageNumber: 1,
      }
      this.getData()
    },
    // 搜索
    search() {
      this.form.pageInfo.pageNumber = 1
      this.getData()
    },
    // 获取数据
    getData() {
      this.loading = true
      const {
        teamId,
        moduleId,
        projectId: projectCode,
        productType,
      } = this.data
      getRelatedTioDiData({
        teamId,
        moduleId,
        productType,
        projectCodes: projectCode.split('/').filter(item => !!item),
        lossDIorDI: this.lossDIorDI,
        ...this.form,
      })
        .then(res => {
          if (res.status === 200) {
            this.list = res.data.data
            const { pageNumber, pageSize } = res.data.pageInfo
            this.form.pageInfo = {
              pageNumber,
              pageSize,
            }

            this.pageTotal = res.data.pageInfo.totalRecords
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 导出数据
    exportData() {
      this.exportLoading = true
      const {
        teamId,
        moduleId,
        projectId: projectCode,
        productType,
      } = this.data
      const requestObj = {
        teamId,
        moduleId,
        productType,
        projectCodes: projectCode.split('/').filter(item => !!item),
        lossDIorDI: this.lossDIorDI,
        ...this.form,
      }
      this.$fileDownLoadForGet(defectKanban.exportData.url, requestObj)
      this.exportLoading = false
    },
    // 描述语
    getCurrentDiTitle() {
      return this.type === 'currentDI'
        ? `${i18n.t('项目代号')}(${this.data.projectId}) ${i18n.t(
            '当前DI值',
          )}(${this.data.currentDi}) = ${i18n.t('前端遗留DI值')}(${
            this.data.legacyDi
          }) + ${i18n.t('特性问题DI值')}(${this.data.featureDi}) + ${i18n.t(
            '共性问题DI值',
          )}(${this.data.commonDi})`
        : `${i18n.t('项目代号')}(${this.data.projectId}) ${i18n.t(
            '去除待验证后DI值',
          )}(${this.data.lossVerifyCurrentDi}) = ${i18n.t('前端遗留DI值')}(${
            this.data.legacyDi
          }) + ${i18n.t('特性问题DI值')}(${this.data.lossFeatureDi}) + ${i18n.t(
            '共性问题DI值',
          )}(${this.data.lossCommonDi})`
    },
    // tfs缺陷url
    getTfsDefectUrl(row) {
      return row.display?.detail?.url || ''
    },
    // 关闭
    close() {
      this.form = this.$options.data().form
      this.list = []
    },
    // 排序
    sortChange({ order }) {
      this.form.order = order === 'ascending' ? 2 : 1
      this.getData()
    },
  },
}
</script>

<style lang="scss" scoped>
.tips {
  margin-bottom: 16px;
  color: #999999;
}

.es-pagination {
  text-align: right;
  margin-top: 10px;
}

.es-table {
  /deep/ .el-table__body-wrapper {
    @include scrollbal-common;
  }
}
</style>
