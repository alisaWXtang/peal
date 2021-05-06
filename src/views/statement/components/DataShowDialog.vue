<template>
  <div class="dialog">
    <el-dialog
      :title="$t(title)"
      :visible.sync="showDataDialog"
      width="1200"
      :close-on-click-modal="false"
      class="es-dialog"
      :modal="false"
      @close="close"
    >
      <div>
        <div class="header">
          <el-button
            type="primary"
            :loading="exportLoading"
            :disabled="exportLoading || !exportable"
            icon="el-icon-download"
            @click="exportData"
            >{{ $t('导出数据') }}</el-button
          >
        </div>

        <el-table
          ref="dataTable"
          v-loading="loading"
          class="detail-tabel multiple-table"
          :data="data"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column
            v-for="(item, index) in fields"
            :key="item.attrName"
            :prop="item.key"
            :fixed="!index"
            :label="item.fieldName"
            show-overflow-tooltip
            :min-width="!index ? 180 : 100"
          >
            <template v-slot="scope">
              <div
                v-if="scope.row.detail.hasPermission && index === 0"
                class="click-item"
                @click="cellClick(scope.row)"
              >
                {{ scope.row.display[item.displayAttrName] || '--' }}
              </div>
              <span v-else>{{
                scope.row.display[item.displayAttrName]
                  | defaultDisplay(item.displayAttrName)
              }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="pageInfo.totalRecords"
          class="es-pagination"
          layout="total, prev, pager, next"
          :current-page.sync="pageInfo.pageNumber"
          :page-size="pageInfo.pageSize"
          :total="pageInfo.totalRecords"
          @current-change="getData"
        ></el-pagination>
        <div slot="footer"></div>
      </div>
    </el-dialog>
    <div v-if="show" class="custom-bg"></div>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 数据展示dialog
 * @desc 支持自定义header，导出，分页, 工作项详情等
 * @author  chenxiaolong
 * @time 2020.7.14
 */
// import OpenWorkItemSlide from '@/components/bizComponents/OpenWorkItemSlide/index'
import { getChartOtherData, exportData } from '@/service/statement'
import { dialogTypeValueMap } from '../util'
export default {
  name: 'DataShowDialog',
  components: {
    // OpenWorkItemSlide,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
      desc: i18n.t('是否显示'),
    },

    chartConfig: {
      type: Object,
      required: true,
      desc: i18n.t('图表配置数据'),
    },

    ajaxParams: {
      type: Object,
      required: true,
      desc: 'ajax接口参数',
    },

    chartCategory: {
      type: [Number, String],
      required: true,
      desc: i18n.t('报表类型'),
    },
  },

  filters: {
    defaultDisplay(text, field) {
      // 多选字段
      ;/^multi/.test(field) && (text = JSON.parse(text))

      if (
        !text ||
        text === 'undefined' ||
        (Array.isArray(text) && !text.length)
      ) {
        return '--'
      }

      return Array.isArray(text) ? text.join(',') : text
    },
  },

  data() {
    return {
      loading: false, // 表格加载状态
      exportLoading: false, // 导出状态
      pageInfo: {
        pageNumber: 1,
        pageSize: 10,
      },
      // 分页信息,
      query: {
        colKey: null,
        colGroup: '',
        colNameKey: '',
        summaryType: '',
        rowKey: '',
        rowGroup: '',
        pageInfo: {
          pageNumber: 1,
          pageSize: 10,
        },
      },

      workId: '', // 工作项id
      data: [], // 表格数据
      fields: [], // 字段
      exportable: false,

      title: '详情信息', // 标题
    }
  },
  computed: {
    showDataDialog: {
      get() {
        return this.show
      },
      set(val) {
        this.$emit('update:show', val)
      },
    },

    localQuery() {
      return {
        ...this.query,
        ...this.ajaxParams,
        projectId: this.$route.query.projectId,
      }
    },
  },

  watch: {
    show(val) {
      if (val) {
        this.getData()
        this.$nextTick(() => {
          // 滚动条恢复到左边
          this.$refs.dataTable.bodyWrapper.scrollLeft = 0
        })
      }
    },
  },

  methods: {
    // 获取数据
    getData() {
      this.loading = true
      this.localQuery.pageInfo.pageNumber = this.pageInfo.pageNumber
      getChartOtherData(this.chartCategory, {
        ...this.chartConfig,
        chartQueryRO: this.localQuery,
      })
        .then(res => {
          if (res.status === 200) {
            this.fields = res.data.fields
            this.data = res.data.result
            this.pageInfo = res.data.pageInfo
            this.exportable = res.data.exportable
            this.title = dialogTypeValueMap[res.data.type]
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 导出数据
    exportData() {
      this.exportLoading = true
      exportData(this.chartConfig.projectId, this.chartCategory, {
        ...this.chartConfig,
        chartQueryRO: this.localQuery,
      })
        .then(res => {
          const config = JSON.parse(res.config.data)
          const data = URL.createObjectURL(res.data)
          const a = document.createElement('a')
          a.href = data
          a.hidden = true
          a.download = config.name + '.xlsx'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
    // 表格点击
    cellClick(data) {
      this.$emit('workItemClick', data.detail)
    },
    close() {
      this.exportLoading = false
      this.pageInfo = this.$options.data().pageInfo
      this.data = []
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  margin-bottom: 10px;
}
.click-item {
  color: #333333;
  cursor: pointer;
  &:hover {
    color: $--color-primary;
  }
}
.es-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.dialog {
  .es-dialog {
    z-index: 1090 !important; // 覆盖dialog行内样式
  }

  .custom-bg {
    width: 100vw;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1070;
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
