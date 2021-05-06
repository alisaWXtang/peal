<template>
  <el-card
    :ref="`chartCard${data.id}`"
    v-loading="loading"
    class="chart-card"
    shadow="hover"
  >
    <div slot="header">
      <div class="header-left">
        <span class="item-header" @click="handleEdit"
          >{{ originalChart.chartDefinition.chartName }}
        </span>
        <el-tooltip
          v-if="data.systematic"
          effect="dark"
          :content="chartForm.tips"
          placement="top"
        >
          <i
            class="co-icon-question"
            style="padding-top: 3px;color: #999999;"
          ></i>
        </el-tooltip>
      </div>
      <div class="item-operation">
        <i
          v-if="canEdit"
          class="el-icon-edit-outline operation-full"
          :title="$t('编辑报表')"
          @click="handleEdit"
        ></i>
        <i
          v-else
          class="el-icon-view operation-full"
          :title="$t('查看报表')"
          @click="handleEdit"
        ></i>
        <el-dropdown size="medium" @command="handleCommand">
          <i class="el-icon-more operation-more"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-download" command="download">{{
              $t('保存图片')
            }}</el-dropdown-item>
            <el-dropdown-item
              v-if="canShare()"
              icon="el-icon-turn-off"
              command="setCommon"
              >{{
                data.common === commonMaps.open
                  ? $t('取消共享')
                  : $t('共享给项目组成员')
              }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="canExportData"
              icon="el-icon-document"
              command="export"
              >{{ $t('导出表格') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="canDelete()"
              icon="el-icon-delete"
              command="delete"
              >{{ $t('删除报表') }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="item-chart">
      <chart-display
        :ref="`chart${data.id}`"
        :chart-data="originalChart"
        :extra-options="extraOptions"
        :finished.sync="finished"
        class="custom-chart-item"
        @click="handleChartClick"
      ></chart-display>
    </div>
  </el-card>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 列表中图表item
 * @author chenxiaolong
 * @date 2020.10.10
 */
import ChartDisplay from './chartDisplay/ChartDisplay'
import ChartCommonMixins from '../ChartCommonMixins'
import { getChartDataById, statementDetail } from '@/service/statement'
import { commonMaps, chartCategories } from '../util'
// import { getCookie } from '@/utils'
// import { statementMutations } from '@/store/mutation-types'
export default {
  name: 'ChartItem',
  components: {
    ChartDisplay,
  },
  mixins: [ChartCommonMixins],

  props: {
    data: {
      type: Object,
      default: () => {},
      required: true,
      desc: i18n.t('图表数据'),
    },
  },

  data() {
    return {
      loading: false,
      projectId: this.$route.query.projectId,
      originalChart: {
        chartDefinition: {},
        data: [],
      },
      finished: false, // 是否加载完毕
      commonMaps,
      chartForm: {}, // 图表配置数据
      extraOptions: {
        xAxis: {
          axisLabel: {
            interval: 0,
          },
        },
      },
    }
  },
  computed: {
    currentUserId() {
      return this.$store.state.gd.userInfo.userId
    },
    canEdit() {
      if (this.data.common) {
        return this.data.createUser === this.currentUserId
      }

      return true
    },
    // 是否可以导出数据
    canExportData() {
      return chartCategories[this.data.chartCategory] !== 'ratio'
    },
  },
  mounted() {
    this.getChartData()
    this.getStatement()
  },
  methods: {
    // 获取图表详情
    getChartData() {
      this.loading = true
      getChartDataById(this.projectId, this.data.id, this.data.chartCategory)
        .then(res => {
          if (res.status === 200 && res.data) {
            this.originalChart = res.data
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 获取报表配置详情
    getStatement() {
      statementDetail(this.projectId, this.data.id).then(res => {
        if (res.status === 200 && res.data) {
          // 保存图表配置数据
          this.chartForm = this.data._cacheForm = res.data
        }
      })
    },
    // 共享显示判断
    canShare() {
      const baseAuth = !this.data.systematic

      // 关闭权限
      if (this.data.common == commonMaps.open) {
        return this.data.createUser === this.currentUserId && baseAuth
      } else {
        // 打开权限
        const auth = this.$authFunction(
          'FUNC_COOP_CHART_UPDATE_COMMON',
          3,
          this.projectId,
        )

        return auth && baseAuth
      }
    },
    // chart图表点击事件
    handleChartClick(data) {
      this.$emit('chartClick', { clickData: data, chartData: this.data })
    },
    // 设置表格
    handleEdit() {
      const editorType = this.canEdit ? 'updated' : 'detail'
      this.$router.push({
        name: 'StatementEditor',
        query: {
          projectId: this.projectId,
          workItemType: this.data.statisticsType,
          statementId: this.data.id,
          common: this.data.common,
          chartCategory: this.data.chartCategory,
          editorType: editorType,
          systematic: this.data.systematic,
        },
      })
    },
    // 执行下拉框选择
    handleCommand(command) {
      const commandMap = {
        download: this.handleDownloadImg,
        export: this.exportStatement,
        delete: this.handleDeleteStatement,
        setCommon: this.handleSetCommon,
      }

      commandMap[command] && commandMap[command]()
    },
    // 共享
    handleSetCommon() {
      const common =
        this.data.common === commonMaps.open
          ? commonMaps.private
          : commonMaps.open
      this.setCommon(this.data.id, common)
    },
    // 导出表格
    exportStatement() {
      this.exportCvs(this.originalChart)
    },
    // 删除报表
    handleDeleteStatement() {
      this.deleteStatement(this.data.id, () => {
        this.$emit('deleteChart', this.data.id)
      })
    },
    // 下载图片
    handleDownloadImg() {
      const title =
        this.originalChart.chartDefinition.chartName || i18n.t('报表')
      const element = this.$refs[`chartCard${this.data.id}`].$el
      this.downloadImg(element, title)
    },
    // 是否可以删除
    canDelete() {
      return (
        !this.data.systematic && this.data.createUser === this.currentUserId
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.custom-chart-item {
  height: 350px;
}

.chart-card {
  margin-bottom: 15px;
  overflow: visible;
  i {
    font-size: 16px;
  }

  .item-header {
    cursor: pointer;
    margin-right: 10px;
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: #333333;

    &:hover {
      color: $--color-primary;
    }
  }

  /deep/ .el-card__header {
    cursor: move;
    padding: 16px;
    border-bottom: 1px solid #e5e5e5;

    i {
      outline: unset;
    }

    & > div {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-left {
        width: calc(100% - 80px);
        display: flex;

        .item-header {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: calc(100% - 35px);
        }
      }
    }
  }

  .operation-full {
    margin-right: 10px;
    cursor: pointer;
    color: #999999;

    &:hover {
      color: $--color-primary;
    }
  }

  .operation-more {
    cursor: pointer;
    padding: 1px 3px;
    color: #999999;

    &:hover {
      color: $--color-primary;
    }
  }
}
</style>
