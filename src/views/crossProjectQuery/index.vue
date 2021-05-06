<template>
  <div
    v-loading="pageLoading"
    class="cross-project-container"
    :element-loading-text="$t('拼命加载中')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgb(255,255,255)"
  >
    <HeaderFilter
      ref="headerFilter"
      :statistics="statistics"
      :can-export="pageInfo.totalRecords > 0"
      @export="handleExport"
      @search="handleSearch"
      @search-change="tableLoading = true"
    ></HeaderFilter>

    <div class="container__content">
      <!-- <table-header-field class="table-header-field"></table-header-field> -->
      <el-table
        ref="dataTable"
        v-loading="tableLoading"
        :data="data"
        style="width: 100%;"
        class="data-table"
        :element-loading-text="$t('拼命加载中')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgb(255,255,255)"
        border
        @sort-change="handleSort"
      >
        <el-table-column
          prop="id"
          label="ID"
          show-overflow-tooltip
          width="72"
          @click="handleShowWorkItem"
        >
          <template slot-scope="scope">
            <span
              class="id-text"
              @click.stop="handleShowWorkItem(scope.row)"
              v-html="scope.row.idHighLight || scope.row.id"
            ></span>
          </template>
        </el-table-column>
        <el-table-column
          key="2"
          prop="title"
          :label="$t('标题')"
          width="300"
          @click="handleShowWorkItem"
        >
          <template slot-scope="scope">
            <global-input
              :init-value="scope.row.title"
              class="table-title"
              :on-change="
                value => {
                  updateGlobalTitle(scope.row, value)
                }
              "
            >
              <i
                class="iconfont"
                :class="[iconMaps[scope.row.workItemType]]"
              ></i>
              <ellipsis-block
                :value="scope.row.titleHighLight || scope.row.display.title"
                :is-html="!!scope.row.titleHighLight"
                class="title-text"
                popper-class="coteam-workbench-tooltip"
                @click.stop="handleShowWorkItem(scope.row)"
              ></ellipsis-block>
              <span v-if="scope.row.display.delayed" class="delay-text danger">
                <i class="el-icon-warning-outline"></i>{{ $t('延期') }}
                {{ $isEnglishDisplaySpace() }}
                {{ scope.row.display.delayedDays
                }}{{
                  $isEnglish()
                    ? ` ${computedDisplayDay(scope.row.display.delayedDays)}`
                    : '天'
                }}</span
              >
              <span
                v-if="scope.row.display.toBeDelayedAfterToday"
                class="delay-text warning"
                type="warning"
                >{{ $t('今日到期') }}</span
              >
            </global-input>
          </template>
        </el-table-column>
        <el-table-column prop="content" :label="$t('描述')" min-width="280">
          <template slot-scope="scope">
            <span
              class="content-text"
              v-html="
                scope.row.contentHighLight || scope.row.display.content || '--'
              "
            ></span>
          </template>
        </el-table-column>
        <!-- elementui bug，如果自定义 el-table-column 会造成列顺序不一致 -->
        <el-table-column
          v-for="(item, index) in customFields"
          :key="item.attrName + index"
          :label="item.fieldName"
          :prop="item.attrName"
          :sortable="item.sortable ? 'custom' : false"
          :width="
            columnWidthMap[item.attrName] ||
              columnWidthMap[item.attrValue] ||
              (item.attrValue.indexOf('MEMBER_CHOICE') > -1 ? 180 : 100)
          "
          show-overflow-tooltip
        >
          <template slot="header">
            <table-header
              :value="item.fieldName"
              :sortable="item.sortable"
            ></table-header>
          </template>
          <template slot-scope="scope">
            <StateFlow
              v-if="item.attrName === 'statusId'"
              :project-id="scope.row.projectId"
              :status-id="scope.row.statusId"
              :work-item-type="scope.row.workItemType"
              :work-item-id="scope.row.id"
              :parent-info="scope.row"
              :update-data="getTableData"
            >
              <work-item-table-custom-column
                :key="item.attrName + scope.row.id"
                :scope="scope"
                :field="item"
                @selectClick="
                  e =>
                    GlobalSelectTargetClick(
                      scope.row,
                      e,
                      item.attrName,
                      () => getTableData,
                      item,
                    )
                "
                @updateSuccess="getTableData"
              ></work-item-table-custom-column>
            </StateFlow>
            <work-item-table-custom-column
              v-else
              :key="item.attrName + scope.row.id"
              :scope="scope"
              :field="item"
              @selectClick="e => onCustomColumnSelect(e, scope.row, item)"
              @updateSuccess="getTableData"
            ></work-item-table-custom-column>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="container__footer">
      <el-pagination
        class="flex-right"
        :current-page="pageInfo.pageNumber"
        :page-size="pageInfo.pageSize"
        background
        layout="total, prev, pager, next, jumper"
        :total="pageInfo.totalRecords"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>

    <!-- 工作项滑窗 -->
    <slide
      v-if="slideShow"
      ref="side"
      v-loading="loading"
      :show.sync="slideShow"
      :popper-append-to-body="true"
      :element-loading-text="$t('拼命加载中')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgb(255,255,255)"
      @hide="beforeSliderClose({})"
      @click.stop
    >
      <div class="work-item-task">
        <bug-detail
          v-if="
            activeWorkItem.workItemType === 3 &&
              activeWorkItem.projectId != -1 &&
              slideShow
          "
          ref="bug"
          :work-item-id="activeWorkItem.id"
          :project-id="activeWorkItem.projectId"
          :show="slideShow"
          @HandleSide="handleSide"
          @deleteSuccess="getTableData"
          @updateInfoSuccess="getTableData"
        ></bug-detail>
        <task-detail
          v-if="activeWorkItem.workItemType === 2 && slideShow"
          ref="task"
          :project-id="activeWorkItem.projectId"
          :work-item-id="activeWorkItem.id"
          :show="slideShow"
          @HandleSide="handleSide"
          @deleteSuccess="getTableData"
          @updateInfoSuccess="getTableData"
        ></task-detail>
        <requirement-detail
          v-if="activeWorkItem.workItemType === 1 && slideShow"
          ref="require"
          :project-id="activeWorkItem.projectId"
          :work-item-id="activeWorkItem.id"
          :show="slideShow"
          @HandleSide="handleSide"
          @deleteSuccess="getTableData"
          @updateInfoSuccess="getTableData"
        ></requirement-detail>
      </div>
    </slide>

    <GlobalSelect v-bind="GlobalSelectProps"></GlobalSelect>
  </div>
</template>

<script>
/**
 * @title 跨项目查询--首页
 * @author chenxiaolong
 * @date 2021.4.14
 */
import { iconMaps } from '@/views/workbench/constant'
import { defaultHeaderCustomFields } from './constant'
import HeaderFilter from './components/filter/HeaderFilter'
import EllipsisBlock from '@/components/ellipsis-block'
import GlobalInput from '@/components/field-edit/GlobalInput.vue'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import StateFlow from '@/components/state-flow'
import TableHeader from '@/components/ellipsis-block/TableHeader'
import WorkItemTableCustomColumn from '@/components/project/WorkItemTableCustomColumn'
import GlobalSelect from '@/components/field-edit/GlobalSelect.vue'
import { WORKITEMCONST } from '@/utils/constant'
// import TableHeaderField from './components/TableHeaderField'
import slide from '@/components/slide-slip/NewSlide'
import ExportBox from '@/components/columbusExporter'
import cloneDeep from 'lodash/cloneDeep'
import { queryData } from '@/service/cross-project'
import { queryData as queryDataUrl } from '@/api/cross-project'
const RequirementDetail = () =>
  import('@/components/columbus-workitem-display/src/RequirementDetail')
const BugDetail = () =>
  import('@/components/columbus-workitem-display/src/BugDetail')
const TaskDetail = () =>
  import('@/components/columbus-workitem-display/src/TaskDetail')
import moment from 'dayjs'
export default {
  name: 'CrossProjectQuery',
  components: {
    HeaderFilter,
    EllipsisBlock,
    GlobalInput,
    StateFlow,
    TableHeader,
    WorkItemTableCustomColumn,
    GlobalSelect,
    // TableHeaderField,
    slide,
    RequirementDetail,
    BugDetail,
    TaskDetail,
  },
  mixins: [ProjectCommonMixin],
  data() {
    return {
      data: [],
      projectId: this.$getUrlParams().projectId,
      iconMaps,
      customFields: cloneDeep(defaultHeaderCustomFields),
      slideShow: false,
      activeWorkItem: {},
      tableLoading: false,
      loading: false,
      form: {
        pageInfo: {
          pageNum: 1,
          pageSize: 20,
        },
        keyword: this.$getUrlParams().keyword || '',
        workItemType: [],
        projectId: [],
        assignUser: [],
        orderBy: { column: 'createTime', order: 'DESC' },
        projectField: [],
      },
      pageInfo: {
        pageNumber: 1,
        pageSize: 20,
        totalRecords: 0,
      },
      pageLoading: true,
      statistics: {
        requirementCount: 0,
        taskCount: 0,
        bugCount: 0,
      },
      container: document.querySelector('.udp-wrapper'),
    }
  },
  computed: {
    exportHeaderFields() {
      const customFields = this.customFields.map(item => {
        return {
          key: item.displayAttrName || item.attrName,
          header: item.fieldName,
        }
      })

      return [
        {
          key: 'id',
          header: 'ID',
        },
        {
          key: 'title',
          header: '标题',
        },
        {
          key: 'content',
          header: '描述',
        },
        ...customFields,
      ]
    },
  },
  watch: {},
  mounted() {
    const header = this.$refs.headerFilter.$el
    this.minHeaderFilterHeight = header.offsetHeight
    setTimeout(() => {
      this.copeLinkOpenSlide()
    })
  },
  methods: {
    // 复制链接打开弹窗
    copeLinkOpenSlide() {
      const hasSlide = document.querySelector(
        "[class*='work-item-box-slider-box']",
      )

      if (hasSlide) {
        return
      }

      const urlParams = this.$getUrlParams()
      const { bugId, requireId, taskId, projectId } = urlParams
      if (!bugId && !taskId && !requireId) {
        return
      }
      this.activeWorkItem = {
        id: bugId || requireId || taskId,
        projectId,
      }
      if (bugId) {
        this.activeWorkItem.workItemType = WORKITEMCONST.workItemTypeMap.bug
      }
      if (taskId) {
        this.activeWorkItem.workItemType = WORKITEMCONST.workItemTypeMap.task
      }
      if (requireId) {
        this.activeWorkItem.workItemType =
          WORKITEMCONST.workItemTypeMap.requirement
      }
      this.slideShow = !this.slideShow
    },
    // 延时1天返回day 超过1天返回days
    computedDisplayDay(day) {
      return +day > 1 ? 'days' : 'day'
    },
    handleSide() {
      this.slideShow = false
    },
    // 展示工作项详情
    handleShowWorkItem(item) {
      this.activeWorkItem = item
      this.slideShow = true
    },
    // 查询
    handleSearch(val) {
      const projectIds = this.$refs.headerFilter.projectIds
      const workItemTypeIds = this.$refs.headerFilter.workItemTypeIds
      const systemAttrs = {}
      const statusAttrs = {}
      const sprintMaps = {}
      const userDefinedAttrs = {}
      let requireIds = []
      let hasSprintZero = false
      val.forEach(item => {
        if (item.key === 'searchKey') {
          this.form.keyword = item.value
        } else if (
          ['defectStatusIds', 'requireStatusIds', 'taskStatusIds'].includes(
            item.key,
          )
        ) {
          this.formatStatusValue(statusAttrs, item)
        } else if (item.key === 'sprintId') {
          hasSprintZero = item.value.includes(0)
          item.presetList.length &&
            item.presetList.forEach(sprint => {
              if (sprintMaps[sprint.projectId]) {
                sprintMaps[sprint.projectId].push(sprint.key)
              } else {
                sprintMaps[sprint.projectId] = []
                sprintMaps[sprint.projectId].push(sprint.key)
              }
            })
        } else if (item.key === 'categoryId') {
          this.formatCategory(systemAttrs, item)
        } else if (item.key === 'requireId') {
          requireIds = item.value
        } else if (item.isUserDefined) {
          this.formatUserDefinedValue(userDefinedAttrs, item)
        } else if (
          ['LITE_DATE_RANGE_ATTR', 'DATE_ATTR', 'LITE_DATE_ATTR'].includes(
            item.attrValue,
          )
        ) {
          this.formatDateValue(systemAttrs, item)
        } else if (!['projectId', 'workItemType'].includes(item.key)) {
          systemAttrs[item.key] = item.value
        }
      })

      const projectField = []
      projectIds.forEach(projectId => {
        workItemTypeIds.forEach(workItemType => {
          const hasUserDefined =
            userDefinedAttrs[projectId] &&
            userDefinedAttrs[projectId][workItemType]
              ? Object.keys(userDefinedAttrs[projectId][workItemType]).length
              : false
          const sprintId = hasSprintZero
            ? [...(sprintMaps[projectId] || []), ...[0]]
            : sprintMaps[projectId] || []
          // 状态，迭代，自定义字段其中一个不为空，新建一个对象
          if (
            statusAttrs[projectId]?.[workItemType]?.length ||
            hasUserDefined ||
            sprintId?.length ||
            requireIds.length
          ) {
            const obj = {
              projectId,
              workItemType,
              status:
                statusAttrs[projectId] && statusAttrs[projectId][workItemType]
                  ? statusAttrs[projectId][workItemType]
                  : [],
              sprintId,
              userDefinedAttrs:
                userDefinedAttrs[projectId] &&
                userDefinedAttrs[projectId][workItemType]
                  ? userDefinedAttrs[projectId][workItemType]
                  : {},
            }

            if (requireIds.length) {
              if (workItemType === WORKITEMCONST.workItemTypeMap.requirement) {
                obj.parentId = requireIds
              } else {
                obj.requireId = requireIds
              }
            }

            projectField.push(obj)
          }
        })
      })
      this.form = {
        pageInfo: {
          pageNum: 1,
          pageSize: 20,
        },
        keyword: this.form.keyword,
        orderBy: this.form.orderBy,
        workItemType: workItemTypeIds,
        projectField,
        projectId: projectIds,
        ...systemAttrs,
      }
      this.getTableData()
    },
    // 格式化状态
    formatStatusValue(statusAttrs, item) {
      function pushValue(field) {
        if (statusAttrs[field.projectId]) {
          if (statusAttrs[field.projectId][item.workItemType]) {
            statusAttrs[field.projectId][item.workItemType].push(field.statusId)
          } else {
            statusAttrs[field.projectId][item.workItemType] = {}
            statusAttrs[field.projectId][item.workItemType] = [field.statusId]
          }
        } else {
          statusAttrs[field.projectId] = {}
          statusAttrs[field.projectId][item.workItemType] = [field.statusId]
        }
      }
      const isArray = Array.isArray(item.value)
      isArray &&
        item.presetList.length &&
        item.presetList.forEach(field => {
          if (field.mergeList?.length) {
            field.mergeList.forEach(itm => {
              pushValue(itm)
            })
          } else {
            pushValue(field)
          }
        })

      if (!isArray) {
        if (statusAttrs[item.projectId]) {
          statusAttrs[item.projectId][item.workItemType] = item.value
        } else {
          statusAttrs[item.projectId] = {}
          statusAttrs[item.projectId][item.workItemType] = item.value
        }
      }
    },
    formatCategory(systemAttrs, item) {
      systemAttrs[item.key] = []
      item.presetList.forEach(field => {
        if (field.mergeList?.length) {
          field.mergeList.forEach(itm => {
            systemAttrs[item.key].push(itm.id)
          })
        } else {
          systemAttrs[item.key].push(field.id)
        }
      })
    },
    // 格式化时间
    formatDateValue(systemAttrs, item) {
      // 时间转换为时间戳
      if (['DATE_ATTR', 'LITE_DATE_ATTR'].includes(item.attrValue)) {
        systemAttrs[item.key] = new Date(item.value).getTime()
      } else if ('LITE_DATE_RANGE_ATTR' === item.attrValue) {
        if (item.value.length) {
          systemAttrs[item.key] = [
            new Date(item.value[0]).getTime(),
            new Date(item.value[1]).getTime(),
          ]
        } else {
          systemAttrs[item.key] = []
        }
      }
    },
    // 格式化自定义字段
    formatUserDefinedValue(userDefinedAttrs, item) {
      function pushValue(field) {
        if (userDefinedAttrs[field.projectId]) {
          if (userDefinedAttrs[field.projectId][item.workItemType]) {
            userDefinedAttrs[field.projectId][item.workItemType][
              field.attrName
            ].push(field.choice)
          } else {
            userDefinedAttrs[field.projectId][item.workItemType] = {}
            userDefinedAttrs[field.projectId][item.workItemType][
              field.attrName
            ] = [field.choice]
          }
        } else {
          userDefinedAttrs[field.projectId] = {}
          userDefinedAttrs[field.projectId][item.workItemType] = {}
          userDefinedAttrs[field.projectId][item.workItemType][
            field.attrName
          ] = [field.choice]
        }
      }
      const isArray = Array.isArray(item.value)
      isArray &&
        item.presetList.length &&
        item.presetList.forEach(field => {
          if (field.mergeList?.length) {
            field.mergeList.forEach(itm => {
              pushValue(itm)
            })
          } else {
            pushValue(field)
          }
        })

      if (!isArray) {
        if (userDefinedAttrs[item.projectId]) {
          userDefinedAttrs[item.projectId][item.workItemType][item.key] =
            item.value
        } else {
          userDefinedAttrs[item.projectId] = {}
          userDefinedAttrs[item.projectId][item.workItemType] = {}
          userDefinedAttrs[item.projectId][item.workItemType][item.key] =
            item.value
        }
      }
    },
    formatProjectField() {},
    async getTableData() {
      this.pageLoading = false
      this.tableLoading = true
      let res = {}
      // 无项目用户处理
      if (!this.form.projectId.length) {
        this.form.projectId = [-1]
      }
      try {
        res = await queryData(this.form)
      } catch (error) {
        res.status === 200
      }

      if (res.status === 200) {
        if (res.data) {
          this.pageInfo = res.data.pageInfo
          this.data = res.data.workItemExtends.map(item => {
            if (item.titleHighLight) {
              item.titleHighLight = item.titleHighLight.replace(
                /<span/g,
                '<span class="search-match-text"',
              )
            }

            if (item.idHighLight) {
              item.idHighLight = item.idHighLight.replace(
                /<span/g,
                '<span class="search-match-text"',
              )
            }

            if (item.contentHighLight) {
              const index = item.contentHighLight.indexOf('<span')
              if (index > 5) {
                item.contentHighLight = item.contentHighLight.slice(
                  index - 5,
                  item.contentHighLight.length,
                )
              }
              item.contentHighLight = item.contentHighLight.replace(
                /<span/g,
                '<span class="search-match-text"',
              )
            }

            return {
              ...item.workItem,
              ...item,
              display: {
                ...item.workItem.display,
                createTime: moment(item.workItem.createTime).format(
                  'YYYY-MM-DD HH:mm:ss',
                ),
              },
              detail: item.workItem.display.detail,
            }
          })

          if (this.form.pageInfo.pageNum === 1) {
            this.statistics = {
              requirementCount: res.data.requirementCount || 0,
              taskCount: res.data.taskCount || 0,
              bugCount: res.data.defectCount || 0,
            }
          }
        } else {
          this.data = []
          this.pageInfo.pageNumber = 1
          this.pageInfo.totalRecords = 0
          this.statistics = {
            requirementCount: 0,
            taskCount: 0,
            bugCount: 0,
          }
        }
      }

      this.tableLoading = false
    },
    // 点击列的内容
    onCustomColumnSelect(e, row, item) {
      // 所属需求/父需求 需要弹框处理
      if (item.attrName === 'requireId') {
        this.currentSelected = row
        this.showRequireDialog = true
      } else {
        this.GlobalSelectTargetClick(
          row,
          e,
          item.attrName,
          this.getTableData,
          item,
        )
      }
    },
    // 排序
    handleSort({ prop, order }) {
      const orderMaps = {
        ascending: 'ASC',
        descending: 'DESC',
      }
      this.form.orderBy = {
        column: prop === 'statusId' ? 'status' : prop,
        order: orderMaps[order],
      }
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.form.pageInfo.pageNum = val
      this.getTableData()
      this.$nextTick(() => {
        this.container &&
          (document.querySelector('.udp-wrapper').scrollTop =
            this.$refs.headerFilter.$el.offsetHeight + 'px')
      })
    },
    // 导出数据
    handleExport() {
      const exportBox = ExportBox.install(this, {
        exportUrl: queryDataUrl.url,
        requestPayload: this.form,
        headers: this.exportHeaderFields,
        title: this.$t('导出数据'),
        pageInfo: this.pageInfo,
        formatDataFn: item => {
          return item.workItem.display
        },
      })
      exportBox.once('closed', () => {})
    },
    // 更新标题
    updateGlobalTitle(info, value) {
      let originInfo = { ...info }
      let cb = () => {
        this.getTableData()
      }
      let updatefunc = this.GlobalRequirementUpdate
      switch (+originInfo.workItemType) {
        case 1:
          updatefunc = this.GlobalRequirementUpdate
          break
        case 2:
          updatefunc = this.GlobalTaskUpdate
          break
        case 3:
          updatefunc = this.GlobalBugUpdate
          break
      }

      updatefunc({
        id: originInfo.id,
        title: value,
        projectId: originInfo.projectId,
        cb,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.cross-project-container {
  /deep/ .search-match-text {
    color: $--color-primary;
    font-weight: bold;
  }

  .content-text {
    max-width: 100%;
    @include no-wrap;
  }

  .data-table {
    /deep/ .el-table__body-wrapper,
    /deep/ .el-table__empty-block {
      min-height: 710px;
    }
  }
  // height: 100%;
  background-color: #fff;
  padding: 0 20px;

  .container__content {
    position: relative;
  }

  .container__footer {
    padding-top: 8px;
    padding-bottom: 16px;
  }

  .table-header-field {
    position: absolute;
    top: 5px;
    right: 0;
    z-index: 2;
    line-height: 40px;
    height: 40px;
    background: #f1f4f9;
    width: 40px;
    text-align: center;
    cursor: pointer;
  }

  /deep/ .el-table {
    overflow: unset;
    .el-table__header-wrapper {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .id-text {
      &:hover {
        color: $--color-primary;
        cursor: pointer;
      }
    }

    .el-table__body-wrapper {
      @include scrollbal-common;
    }

    .el-table__empty-img {
      > span {
        display: none;
      }
      display: block;
      width: 200px;
      height: 135px;
      background-image: url('~@/assets/workbench/empty.png');
      background-position: top;
      filter: grayscale(1);
      opacity: 0.4;
    }

    td {
      padding: 7px 0;
    }
    th {
      padding: 4px 0;
    }

    th[class*='el-table']:not(:last-child) {
      border-right: 2px solid #fff;
    }

    th .cell {
      display: flex;
      align-items: center;
    }

    .el-table__header thead > tr:first-child {
      height: 48px;
    }

    tbody tr {
      height: 40px;
    }

    .el-table__body tr > td {
      padding: 6px 0 5px 0;
    }

    tr {
      th:first-child,
      td:first-child {
        padding-left: 24px;
      }

      th:last-child,
      td:last-child {
        padding-right: 24px;
      }
    }
    .table-id {
      cursor: pointer;
      &:hover {
        color: $--color-primary;
      }
    }
    .table-title {
      display: flex;
      align-items: center;

      > i {
        margin-right: 5px;
        flex: 0 0 auto;
      }

      .table-input-edit-icon {
        left: 0;
        margin-left: 5px;
      }

      .title-text {
        max-width: 100%;
        flex: 0 1 auto;
        display: inherit;
        height: 24px;
        @include no-wrap;

        &:hover {
          color: $--color-primary;
        }
      }

      .delay-text {
        flex: 0 0 auto;
        margin-left: 8px;
        display: flex;
        align-items: center;

        > i {
          margin-right: 2px;
        }

        &.danger {
          color: $--color-danger;
        }

        &.warning {
          color: $--color-warning;
        }
      }
    }
    .icon-xuqiu {
      color: $--color-primary;
      margin-right: 6px;
    }
    .icon-renwu {
      color: #007aff;
      margin-right: 6px;
    }
    .icon-quexian {
      color: #ea3447;
      margin-right: 6px;
    }

    .work-item-level,
    .statusbox-list-common {
      cursor: pointer;
      color: var(--color);
      border: 1px solid var(--color);
      border-radius: 4px;
      display: inline-block;
      padding: 0;
      font-size: 12px;
      text-align: center;
      width: 40px;
      height: 24px;
      &:hover {
        color: #fff;
        background-color: var(--color);
      }
    }

    .statusbox-list-common {
      line-height: 24px;
    }

    .pop-trigger {
      padding: 0 5px;
      color: var(--color);
      background-color: #fff;
      width: 64px;
      height: 24px;
      font-size: 12px;

      &:hover {
        color: #fff;
        background-color: var(--color);
      }

      .witem-btn__container {
        line-height: normal;
        i {
          display: none;
        }

        .title {
          min-width: 100%;
        }
      }
    }
  }
}
</style>
