<template>
  <div
    v-loading="loading"
    class="statement-editor-container"
    :class="{ 'sidebar-closed': sidebarClosed }"
    :element-loading-text="$t('数据加载中...')"
  >
    <div class="container-header">
      <div class="header-operation">
        <el-tooltip
          v-if="systematic == 1"
          effect="dark"
          :content="form.tips"
          placement="top"
        >
          <el-button
            type="text"
            class="opeartion-item question"
            icon="el-icon-question"
            >{{ $t('如何读此报表') }}</el-button
          >
        </el-tooltip>

        <el-dropdown size="medium" @command="handleCommand">
          <i class="el-icon-more opeartion-item"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-download" command="download">{{
              $t('保存图片')
            }}</el-dropdown-item>
            <el-dropdown-item
              v-if="!isDetail"
              icon="el-icon-document"
              command="export"
              >{{ $t('导出表格') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="canShare && !isDetail"
              icon="el-icon-share"
              command="share"
              >{{
                common === commonMaps.open
                  ? $t('取消共享')
                  : $t('共享给项目组成员')
              }}</el-dropdown-item
            >
            <el-dropdown-item
              v-if="
                !systematic && form.createUser === currentUserId && !isDetail
              "
              icon="el-icon-delete"
              command="delete"
              >{{ $t('删除报表') }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          type="text"
          class="opeartion-item"
          icon="el-icon-close"
          :title="$t('返回列表')"
          @click="goList"
        ></el-button>
      </div>
    </div>
    <div class="container-content">
      <div class="content-left scrollbal-common">
        <el-card shadow="never" class="chart-display">
          <div
            class="chart-name-no-detail"
            :class="{ 'chart-name': !isDetail }"
          >
            <span v-if="!editName || isDetail" @click="handleEditName"
              >{{ form.name || $t('未命名报表') }}
              <i v-if="!isDetail" class="el-icon-edit"></i
            ></span>
            <el-input
              v-else
              ref="chartNameInput"
              v-model="form.name"
              maxlength="50"
              show-word-limit
              :placeholder="$t('请输入名称')"
              @blur="editName = false"
              @keyup.enter.native="editName = false"
            ></el-input>
          </div>
          <chart-display
            ref="chartDisplay"
            :chart-data="originalChart"
            :extra-options="extraOptions"
            @click="chartClick"
          >
            <div slot="empty" class="data-empty">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-Charts"></use>
              </svg>
              <span>{{ $t('暂无图表数据') }}~</span>
            </div>
          </chart-display>
          <el-alert v-show="pieSmartAlert" class="chart-alert" type="warning">
            {{ $t('检测到当前维度过多，建议使用柱状图或者折线图。') }}
          </el-alert>
        </el-card>
        <!-- 占比图不显示数据表格 -->
        <el-card v-if="showDataTable" shadow="never" class="datatable-display">
          <data-table
            :data="tableData"
            :is-empty="emptyData"
            @cell-click="cellClick"
          >
            <template v-slot:empty>
              <div class="data-empty">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-zu"></use>
                </svg>
                <span>{{ $t('暂无表格') }}</span>
              </div>
            </template>
          </data-table>
        </el-card>
      </div>
      <div class="content-right">
        <div class="switch-btn-wrap">
          <div class="switch-btn" @click="changeSidebarStatus">
            <i class="icon el-icon-arrow-left"></i>
          </div>
        </div>
        <div>
          <el-card
            shadow="never"
            class="config-form-container scrollbal-common"
          >
            <!-- eslint-disable-next-line vue/require-component-is -->
            <component
              :is="configFormComponent"
              ref="configForm"
              :data="form"
              class="config-form"
              :class="{ 'lock-form': isDetail }"
            ></component>
          </el-card>
          <el-card shadow="never" class="config-form-submit-container">
            <div class="config-form-container_bottom">
              <el-button
                icon="el-icon-refresh"
                plain
                round
                :loading="loading"
                :disabled="isDetail"
                @click="refreshChartData"
                >{{ $t('预览图表') }}</el-button
              >
              <div>
                <el-button
                  v-if="editorType === 'updated'"
                  type="text"
                  :loading="submitLoading"
                  :disabled="isDetail"
                  @click="handleNewCreate"
                  >{{ $t('另存为') }}</el-button
                >
                <el-button
                  type="primary"
                  size="mini"
                  :loading="submitLoading"
                  :disabled="isDetail"
                  @click="handleSubmit('cover')"
                  >{{ submitLoading ? $t('保存中...') : $t('保存') }}</el-button
                >
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <data-show-dialog
      ref="dataDialogRef"
      :show.sync="showDialog"
      :ajax-params="dataAjaxParams"
      :chart-category="chartCategory"
      :chart-config="form"
      @workItemClick="handleWorkItemClick"
    ></data-show-dialog>

    <open-work-item-slide
      :id="activeItem.id"
      :slider-status.sync="showSlide"
      :work-item-type="activeItem.workItemType"
      :project-id="activeItem.projectId"
      @updateWorkInfoSuccess="updateWorkInfoSuccess"
    ></open-work-item-slide>

    <el-dialog
      :title="$t('保存报表')"
      :visible.sync="dialogVisible"
      width="480px"
      @close="closeDialog"
    >
      <el-form ref="form" :model="newForm" :rules="rules">
        <el-form-item :label="$t('报表名称')" prop="name">
          <el-input
            v-model="newForm.name"
            class="new-chart-name"
            maxlength="50"
            show-word-limit
            :placeholder="$t('请填写报表名称')"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button :disabled="submitLoading" @click="dialogVisible = false">{{
          $t('取消')
        }}</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="dialogSubmit"
          >{{ $t('确定') }}</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 报表设置
 * @author chenxiaolong
 * @time 2020.7.1
 */
import ChartDisplay from './components/chartDisplay/ChartDisplay'
import DataTable from './components/DataTable'
import OpenWorkItemSlide from '@/components/biz/open-work-item-slide'
import DataShowDialog from './components/DataShowDialog'
// import { getCookie } from '@/utils'
import isEqual from 'lodash/isEqual'
// import findKey from 'lodash/findKey'
import cloneDeep from 'lodash/cloneDeep'
import {
  summaryList,
  configForm,
  chartCategories,
  commonMaps,
  systematicMaps,
} from './util'
import ChartCommonMixins from './ChartCommonMixins'
import {
  getChartDataById,
  getChartDataByParams,
  statementDetail,
  statementCreate,
  statementUpdate,
} from '@/service/statement'
import CommponentMaps, {
  Custom,
  RequireModify,
  FlowDiagram,
  StayTime,
  Delay,
  DefectStatusRun,
  WorkItemTimeIndicator,
  Ratio,
  WorkItemThroughput,
  Reopen,
  EffectiveDefect,
} from './components/configForm'

export default {
  name: 'StatementEditor',
  components: {
    ChartDisplay,
    DataTable,
    OpenWorkItemSlide,
    DataShowDialog,
    Custom,
    RequireModify,
    FlowDiagram,
    StayTime,
    Delay,
    DefectStatusRun,
    WorkItemTimeIndicator,
    Ratio,
    WorkItemThroughput,
    Reopen,
    EffectiveDefect,
  },
  mixins: [ChartCommonMixins],

  data() {
    return {
      loading: false, // 是否处于加载
      submitLoading: false, // 是否提交
      sidebarClosed: false, // 是否关闭侧边栏
      editName: false, // 是否编辑名称
      configChange: false, // 配置参数是否改变
      originalForm: {}, // 配置源数据,
      showDialog: false, // 是否显示信息详情
      dataAjaxParams: {}, // 数据透视接口参数
      dialogConfigCol: {}, // 详情自定义表格配置数据
      form: cloneDeep(configForm),
      // 跳转页面的参数
      editorType: this.$route.query.editorType || 'created', // created => 新增 updated 编辑 deleted 删除，statementList  根据类型确定是否刷新页面，以及设置滚动条的位置
      originalChart: {
        data: [],
      },
      // 报表数据
      saveSuccess: false, // 是否保存成功
      tableData: [], // 表格数据
      projectId: this.$route.query.projectId,
      systematic: this.$route.query.systematic || 0,
      chartCategory: this.$route.query.chartCategory || 1,
      common: this.$route.query.common,
      commonMaps,
      extraOptions: {
        xAxis: {
          axisLabel: {
            interval: 0,
          },
        },
      },
      showSlide: false, // 是否显示slide
      activeItem: {
        // 当前点击的工作项
        workItemType: '',
        projectId: '',
        id: '',
      },
      dialogVisible: false,
      rules: {
        name: [
          { required: true, message: i18n.t('请输入名称'), trigger: 'blur' },
        ],
      },
      newForm: {
        // 另存为表单
        name: '',
      },
    }
  },
  computed: {
    currentUserId() {
      return this.$store.state.gd.userInfo.userId
    },
    // 圆饼图智能提示
    pieSmartAlert() {
      const { data } = this.originalChart
      const isPie =
        (this.form.column && this.form.column[0]?.chartType === 'PieChart') ||
        this.form.chartType === 'PieChart'
      return data[0]?.values?.length > 30 && isPie
    },
    // 是否是详情模式
    isDetail() {
      return this.editorType === 'detail'
    },
    emptyData() {
      return (
        !this.originalChart?.data.length ||
        !this.originalChart.data[0]?.values?.length
      )
    },
    canShare() {
      const baseAuth = this.editorType === 'updated' && !this.systematic

      // 关闭权限
      if (this.common == commonMaps.open) {
        return this.originalForm.createUser === this.currentUserId && baseAuth
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
    configFormComponent() {
      return CommponentMaps[chartCategories[Number(this.chartCategory)]]
    },
    // 是否显示数据表格
    showDataTable() {
      // 老版数据表格不显示数据表格
      return chartCategories[Number(this.chartCategory)] !== 'ratio'
    },
  },

  watch: {
    statementId: {
      handler: function(val) {
        if (val) {
          this.getStatement()
        }
      },
      immediate: true,
    },

    form: {
      handler: function(val) {
        if (!isEqual(this.originalForm, val)) {
          this.configChange = true
        } else {
          this.configChange = false
        }
      },
      deep: true,
    },
  },

  created() {
    const { projectId, workItemType } = this.$route.query
    // 设置默认值
    this.form.column[0].summaryType = summaryList[workItemType - 1].attrName
    this.form.statisticsType = workItemType
    this.form.projectId = projectId
    this.activeItem = {
      ...this.activeItem,
      projectId,
      workItemType,
    }
  },
  mounted() {
    // 数据埋点处理
    this.countlyLog(`project_statement_editor_${this.editorType}`)
    if (['updated', 'detail'].includes(this.editorType)) {
      this.initData()
    } else {
      this.originalForm = cloneDeep(this.form)
    }

    // 工作项展开
    const querySet = new Set(Object.keys(this.$route.query))
    let queryKey
    const canShowSlide = ['requireId', 'bugId', 'taskId'].some(item => {
      const isHas = querySet.has(item)

      if (isHas) {
        queryKey = item
      }

      return isHas
    })

    if (canShowSlide) {
      this.activeItem.id = this.$route.query[queryKey]
      this.showSlide = true
    }

    // 从报表列表跳转过来scrollTop异常
    // this.$nextTick(() => {
    //   document.querySelector('.project-content').scrollTop = 0
    // })
    // 注册beforeunload事件
    window.addEventListener('beforeunload', this.unloadPage)
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.unloadPage)
  },
  beforeRouteLeave(to, from, next) {
    // 判断是否可以离开
    if (to.path === '/403') {
      next()
    } else {
      const canLeave = this.unloadPage(next)
      if (canLeave) {
        next()
      }
    }
  },
  methods: {
    // 初始化数据
    initData() {
      this.loading = true
      Promise.all([this.getStatement(), this.getChartDataById()])
        .then(res => {
          if (res[0]?.status === 200 && res[1]?.status === 200) {
            this.form = res[0]?.data
            this.originalForm = cloneDeep(this.form)
            this.originalChart = res[1]?.data
            this.tableData = this.generateDataTable(res[1]?.data)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 工作项点击
    handleWorkItemClick(data) {
      this.activeItem = data
      this.showSlide = true
    },
    // 操作详情成功后刷新数据
    updateWorkInfoSuccess() {
      this.$refs.dataDialogRef.getData()
      this.refreshChartData()
    },
    // 获取报表配置详情
    async getStatement() {
      // 获取报表数据
      const { projectId, statementId } = this.$route.query
      return await statementDetail(projectId, statementId)
    },
    // 获取报表数据通过id
    async getChartDataById() {
      const { projectId, statementId, chartCategory = 1 } = this.$route.query
      console.log(this.$route.query)
      return await getChartDataById(projectId, statementId, chartCategory)
    },
    // 获取报表数据通过配置参数
    async getChartDataByParams() {
      const { chartCategory = 1 } = this.$route.query
      console.log('this.form', this.form)
      return await getChartDataByParams(chartCategory, this.form)
    },
    // 刷新图表数据
    refreshChartData() {
      // 校验报表是否填写正确
      this.$refs.configForm.$refs.form.validate(valid => {
        if (valid) {
          !this.showSlide && (this.loading = true)
          this.getChartDataByParams()
            .then(res => {
              if (res.status === 200) {
                this.originalChart = res.data
                this.tableData = this.generateDataTable(res.data)
              }
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          this.$message.warning(i18n.t('请先进行数据设置'))
        }
      })
    },
    // 退出页面
    unloadPage(argument) {
      if (!isEqual(this.originalForm, this.form)) {
        // 判断是否是关闭窗口的beforeunload
        if (argument && argument.constructor === BeforeUnloadEvent) {
          argument.returnValue = i18n.t(
            '提示：还没有保存页面数据，确认要离开吗?',
          )
          return
        } else {
          this.$confirm(i18n.t('还没有保存页面数据，确认要离开吗?'), {
            confirmButtonText: i18n.t('保存报表'),
            cancelButtonText: i18n.t('暂不保存'),
            cancelButtonClass: 'el-button--danger is-plain',
            closeOnClickModal: false,
            type: 'warning',
          })
            .then(() => {
              const { statementId } = this.$route.query
              this.handleSubmit(statementId ? 'cover' : '').then(() => {
                if (this.saveSuccess) {
                  argument ? argument() : this.goList()
                }
              })
            })
            .catch(() => {
              argument ? argument() : this.goList()
            })

          return false
        }
      }

      return true
    },
    // 另存为
    handleNewCreate() {
      this.newForm.name = this.form.name
      this.dialogVisible = true
    },
    // dialog submit
    dialogSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          this.form.name = this.newForm.name
          this.handleSubmit('new').finally(() => {
            this.submitLoading = false
          })
        }
      })
    },
    // 关闭dialog
    closeDialog() {
      this.$refs.form.resetFields()
    },
    // 保存
    async handleSubmit(type) {
      if (!this.validateName()) {
        return
      }

      let isValid = false
      this.$refs.configForm.$refs.form.validate(valid => {
        isValid = valid
      })

      if (isValid) {
        if (this.editorType === 'updated' && type === 'cover') {
          await this.updateStatement()
        } else {
          await this.createStatement()
          this.dialogVisible = false
        }
      } else {
        this.$message.warning(i18n.t('请先进行数据设置'))
      }
    },
    // 校验名称
    validateName() {
      if (!this.form.name) {
        this.$message.warning(i18n.t('请填写报表名称'))
        return false
      }

      if (!this.form.name.replace(/\s/g, '').length) {
        this.$message.warning(i18n.t('名称不能全为空格'))
        return false
      }

      return true
    },
    // 新建报表
    async createStatement() {
      this.submitLoading = true
      // 在创建以及编辑的情况下nameCode置空
      const res = await statementCreate(this.chartCategory, {
        ...this.form,
        nameCode: '',
      })

      if (res.status === 200 && res.data) {
        this.$message.success(i18n.t('新建报表成功'))

        // 在创建模式下，新建报表修改url
        if (this.editorType === 'created') {
          this.form = res.data
          this.originalForm = cloneDeep(this.form)
          this.editorType = 'updated'
          this.statementId = res.data.id
          this.systematic = systematicMaps.outer
          this.saveSuccess = true
          this.$router.replace({
            name: 'StatementEditor',
            query: {
              projectId: this.projectId,
              workItemType: res.data.statisticsType,
              statementId: res.data.id,
              common: this.common || commonMaps.private,
              chartCategory: this.chartCategory,
              editorType: 'updated',
              systematic: this.systematic,
            },
          })
        } else {
          // 在编辑模式下，配置数据恢复为初始数据
          this.form = cloneDeep(this.originalForm)
        }
      }

      this.submitLoading = false
    },
    // 编辑报表
    async updateStatement() {
      this.submitLoading = true
      const { chartCategory = 1 } = this.$route.query
      const res = await statementUpdate(chartCategory, {
        ...this.form,
        nameCode: '',
      })

      if (res.status === 200) {
        this.$message.success(i18n.t('编辑报表成功'))
        this.originalForm = cloneDeep(this.form)
        this.saveSuccess = true
      }

      this.submitLoading = false
    },
    // 返回列表
    goList() {
      const { projectId, workItemType, common, statementId } = this.$route.query
      const query = {
        projectId,
        workItemType,
        common,
        editorType: this.saveSuccess ? this.editorType : 'normal',
      }

      // 更新追加参数
      if (this.editorType === 'updated') {
        query.chartId = statementId
      }

      this.$router.push({
        name: 'StatementChartContainer',
        query,
      })
    },
    // 改变侧边栏状态
    changeSidebarStatus() {
      this.sidebarClosed = !this.sidebarClosed
      this.$nextTick(() => {
        this.$refs.chartDisplay?.myChart?.resize()
      })
    },
    // 图表点击事件
    chartClick(data) {
      this.dataAjaxParams = data.data.queryParams
      this.showDialog = true
    },
    // 表格点击事件
    cellClick(data) {
      this.dataAjaxParams = data.queryParams
      this.showDialog = true
    },
    // 指令
    handleCommand(command) {
      const commandMap = {
        download: this.handleDownloadImg,
        export: this.exportStatement,
        share: this.shareStatement,
        delete: this.handleDeleteStatement,
      }

      commandMap[command] && commandMap[command]()
    },
    // 分享图表
    shareStatement() {
      const common =
        this.common == commonMaps.open ? commonMaps.private : commonMaps.open
      this.setCommon(this.originalForm.id, common, () => {
        this.originalForm.common = this.common = this.form.common = common
      })
    },
    // 下载图片
    handleDownloadImg() {
      const title = this.form.name || i18n.t('报表')
      const element = this.$refs.chartDisplay.$el
      this.downloadImg(element, title)
    },
    // 导出表格()
    exportStatement() {
      this.exportCvs(this.originalChart)
    },
    // 删除
    handleDeleteStatement() {
      const { projectId, workItemType, common, statementId } = this.$route.query
      this.deleteStatement(statementId, () => {
        this.$router.push({
          name: 'StatementChartContainer',
          query: {
            workItemType,
            editorType: 'deleted',
            common,
            projectId,
          },
        })
      })
    },
    // 编辑名称
    handleEditName() {
      this.editName = true
      this.$nextTick(() => {
        this.$refs.chartNameInput.focus()
        this.$refs.chartNameInput.visible = true
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.data-empty {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  color: #888;
  font-size: 14px;

  img {
    width: 125px;
  }

  svg {
    font-size: 50px;
  }

  span {
    margin-top: 10px;
  }
}

.lock-form {
  pointer-events: none;

  /deep/ .el-input__suffix-inner {
    pointer-events: none;
  }
}
.new-chart-name /deep/ .el-input__count {
  color: $--color-primary;
}
.new-chart-name /deep/ .el-input__inner {
  padding-right: 50px !important; // 覆盖#app下的样式
}

.chart-alert {
  margin-top: 10px;
}

.statement-editor-container {
  height: 100%;
  overflow: hidden;
  /*position: relative;*/
  /*padding-top: 40px;*/

  .container-header {
    /*position: absolute;*/
    /*right: 0;*/
    /*top: 0;*/
    text-align: right;
    margin: 8px 0;
    .header-operation {
      i {
        font-size: 16px;
      }
      /deep/ .el-button > i {
        font-size: 16px;
      }
    }

    .opeartion-item {
      color: #666666;
      cursor: pointer;
      margin-left: 10px;

      &.question {
        /deep/ span {
          margin-left: 3px;
        }
      }

      &:hover {
        color: $--color-primary;
      }
    }
  }

  .container-content {
    display: flex;
    height: calc(100% - 44px);
    /*background-color: red;*/
    /*height: calc(100vh - 155px);*/
    /*overflow: hidden;*/

    .content-left {
      height: 100%;
      /*height: calc(100% - 33px);*/
      overflow: auto;
      flex: 1 1 auto;
      max-width: calc(100% - 350px); // 解决表格min-width影响的不可收缩

      .chart-display {
        min-height: 400px;
        margin-bottom: 10px;

        /deep/ .el-card__body {
          padding: 18px 24px;
        }
        .chart-name-no-detail {
          text-align: center;
          margin-bottom: 20px;
          line-height: 28px;
        }
        .chart-name {
          text-align: center;
          cursor: pointer;
          margin-bottom: 20px;
          line-height: 28px;
          &:hover {
            color: $--color-primary;

            i {
              display: inline-block;
            }
          }

          /deep/ .el-input {
            max-width: 300px;

            .el-input__inner {
              padding-right: 50px !important; // 覆盖#app下样式
            }
            .el-input__count {
              color: $--color-primary;
            }
          }
        }
      }
      .datatable-display {
        min-height: calc(100% - 498px);
        /*background-color: #00b09b;*/
      }
    }

    .content-right {
      width: 350px;
      padding-left: 15px;
      flex-grow: 0;
      flex-flow: 0;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;

      .config-form-container {
        /*height: calc(100vh - 240px);*/
        height: calc(100vh - 260px);
        width: 100%;
        position: relative;
        /*overflow-y: auto;*/
        overflow: auto;
        margin-right: -17px;

        /deep/ .el-card__body {
          padding: 0;
          position: relative;
        }

        .config-form {
          padding: 24px 24px 24px 24px;
        }
      }

      .config-form-submit-container {
        /deep/ .el-card__body {
          padding: 24px 16px;
        }

        .config-form-container_bottom {
          box-sizing: border-box;
          height: 24px;
          padding: 18px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      }

      .switch-btn {
        position: absolute;
        width: 10px;
        height: 70px;
        left: 5px;
        top: 50%;
        margin-top: -35px;
        z-index: 99;
        padding: 27px 0;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        background-color: rgba(212, 219, 226, 0.8);
        cursor: pointer;
        border-top-left-radius: 7px;
        border-bottom-left-radius: 7px;
        transition: 0.5s all ease;

        .icon {
          color: #fff;
          width: 10px;
          font-size: 12px;
          transition: 0.5s all ease;
          transform: rotate(180deg);
        }
      }
    }
  }

  &.sidebar-closed {
    .content-left {
      max-width: calc(100% - 15px);
    }

    .container-content .content-right {
      width: 0;

      .switch-btn .icon {
        transform: rotate(0deg);
        transition: 0.5 all ease;
      }
    }

    .config-form-container,
    .config-form-submit-container {
      width: 0;
      transform: translateX(350px);
      height: 0;
      border: none;
    }
  }
}
</style>
