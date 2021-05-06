<template>
  <div>
    <base-card
      ref="baseCard"
      v-loading="cardLoading"
      shadow="never"
      :style="{ height: cardHeight, '--height': cardHeight }"
      :class="{ 'empty-card': !data.length }"
    >
      <template slot="header">
        <div class="header-left">
          <div v-show="!editCardName" class="header-title">
            {{ cardName }}
            <span>({{ pageInfo.total }})</span>
            <!-- <i class="el-icon-edit"></i> -->
          </div>
          <el-input
            v-show="editCardName"
            ref="editCardName"
            v-model="cardName"
            class="edit-card-name"
            maxlength="50"
            show-word-limit
            :placeholder="$t('输入卡片名称')"
            @blur="handleSaveCardName"
            @keyup.native.enter="editCardName = false"
          ></el-input>
        </div>
        <div class="header-right">
          <div :title="filterToolTipTitle">
            <base-filter
              ref="baseFilter"
              :filter-name="cardType"
              :filters-list="localFilters"
              :init-filter="true"
              @submitSearch="handleFilter"
            ></base-filter>
          </div>
          <div
            v-show="!isFullScreen"
            class="operation-icon"
            :title="$t('详情')"
            @click="handleOpenFullScreen"
          >
            <i
              class="iconfont icon-fangda
"
            ></i>
          </div>
          <div
            v-show="isFullScreen"
            class="operation-icon"
            :title="$t('退出详情')"
          >
            <i class="iconfont icon-suoxiao" @click="handleCloseFullScreen"></i>
          </div>
        </div>
      </template>
      <template slot="content">
        <template v-show="!isFullScreen">
          <el-table
            v-if="data.length"
            v-show="!isFullScreen"
            :data="data"
            highlight-current-row
            border
            :header-cell-style="{ background: '#F1F5F8' }"
            :height="tableHeight"
            class="data-table"
            @sort-change="sortChange"
          >
            <el-table-column
              prop="sprintName"
              :label="$t('迭代')"
              show-overflow-tooltip
              width="120px"
            >
            </el-table-column>
            <el-table-column
              prop="projectName"
              :label="$t('项目')"
              show-overflow-tooltip
              sortable="custom"
              width="140px"
            >
            </el-table-column>
            <el-table-column
              prop="sprintStatus"
              :label="$t('状态')"
              show-overflow-tooltip
              width="120px"
            >
            </el-table-column>
            <el-table-column prop="progress" :label="$t('进度')" width="180px">
              <template slot-scope="scope">
                <el-progress
                  :text-inside="true"
                  :stroke-width="14"
                  :percentage="scope.row.progress | progress"
                ></el-progress>
              </template>
            </el-table-column>
            <el-table-column
              prop="taskTotalHour"
              :label="$t('任务工时')"
              width="80px"
            >
              <template slot-scope="scope">
                {{ scope.row.taskTotalHour }}h
              </template>
            </el-table-column>
            <el-table-column
              prop="requireCompleteRate"
              show-overflow-tooltip
              :label="$t('需求完成率')"
              width="100px"
            >
            </el-table-column>
            <el-table-column
              prop="requireCompleteRate"
              :label="$t('缺陷解决率')"
              width="80px"
            >
            </el-table-column>
          </el-table>
          <div v-show="!data.length && !isFullScreen" class="empty-data">
            <img src="@/assets/workbench/empty.png" :alt="$t('暂无数据')" />
            <div v-if="init" class="desc">{{ $t('暂无数据') }}</div>
          </div>
        </template>
        <el-table
          v-show="isFullScreen"
          :data="fullData"
          highlight-current-row
          border
          :header-cell-style="{ background: '#F1F5F8' }"
          :height="fullTableHeight"
          class="data-table"
          @sort-change="sortChange"
        >
          <el-table-column
            prop="sprintName"
            :label="$t('迭代')"
            show-overflow-tooltip
            min-width="120"
          >
          </el-table-column>
          <el-table-column
            prop="projectName"
            :label="$t('项目')"
            show-overflow-tooltip
            sortable="custom"
            min-width="140"
          >
          </el-table-column>
          <el-table-column
            prop="sprintStatus"
            :label="$t('状态')"
            show-overflow-tooltip
            width="120px"
          >
          </el-table-column>
          <el-table-column prop="progress" :label="$t('进度')" width="180px">
            <template slot-scope="scope">
              <el-progress
                :text-inside="true"
                :stroke-width="14"
                :percentage="scope.row.progress | progress"
              ></el-progress>
            </template>
          </el-table-column>
          <el-table-column
            prop="taskTotalHour"
            :label="$t('任务工时')"
            width="80px"
          >
            <template slot-scope="scope">
              {{ scope.row.taskTotalHour }}h
            </template>
          </el-table-column>
          <el-table-column
            prop="requireCompleteRate"
            show-overflow-tooltip
            :label="$t('需求完成率')"
            width="100px"
          >
          </el-table-column>
          <el-table-column
            prop="requireCompleteRate"
            :label="$t('缺陷解决率')"
            width="80px"
          >
          </el-table-column>
        </el-table>
      </template>
      <template slot="footer">
        <el-pagination
          v-show="!isFullScreen"
          v-if="pageInfo.totalPage > 1"
          layout="prev, pager, next"
          :page-size="searchForm.pageSize"
          :current-page.sync="searchForm.pageNumber"
          :total="pageInfo.total"
          @current-change="getCardData"
        >
        </el-pagination>
        <el-pagination
          v-show="isFullScreen"
          class="work-items-pagination__content flex-right"
          background
          layout="total, prev, pager, next, sizes, jumper"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="fullSearchForm.pageSize"
          :current-page.sync="fullSearchForm.pageNumber"
          :total="fullPageInfo.total"
          @size-change="handleSizeChange"
          @current-change="getCardData"
        >
        </el-pagination>
      </template>
    </base-card>
  </div>
</template>

<script>
/**
 * @title 迭代概览卡片
 * @author chenxiaolong
 * @date 2021.4.26
 */

import { workbenchCardTypes, lineHeight } from '../constant'
import { getRealUrl } from '@/utils/sub-app-util'
import WorkItemCardMixin from '@/views/workbench/WorkItemCardMixin'
import { parseResponse } from '@/utils/http'
import { sprintCard } from '@/api/workbench'
export default {
  name: 'SprintCard',
  components: {},

  filters: {
    progress(val) {
      return Number(val.replace('%', ''))
    },
  },
  mixins: [WorkItemCardMixin],

  data() {
    return {
      pageInfo: {
        pageNo: 1,
        pageSize: 10,
        total: 0,
        totalPage: 1,
      },
      fullPageInfo: {
        pageNo: 1,
        pageSize: 10,
        total: 0,
        totalPage: 1,
      },
      type: workbenchCardTypes.sprint, // 卡片类型
      cardName: '迭代概览',
      data: [],
      cardHeight: '100%',
      // 搜素条件
      searchForm: {
        projectIds: [],
        sprintIds: [],
        sprintName: '',
        pageSize: 0,
        pageNumber: 1,
        // _0降序 _1升序 1_项目 2_状态
        order: 10,
      },
      fullData: [],
      fullSearchForm: {
        projectIds: [],
        sprintIds: [],
        sprintName: '',
        pageSize: 20,
        pageNumber: 1,
        // _0降序 _1升序 1_项目 2_状态
        order: 10,
      },
      fullScreenInit: false,
      fullTableHeight: 600,
      url: getRealUrl(sprintCard.url, { ssoToken: true }),
    }
  },

  computed: {
    // 当前过滤器配置
    localFilters() {
      return [
        {
          attrName: 'searchKey',
          fieldName: '迭代名称',
        },
        {
          attrName: 'projectIds',
          initValue(selectList) {
            const values = []
            selectList.forEach(item => {
              if (!item.completed) {
                values.push(item.id)
              }
            })

            return values
          },
        },
        {
          attrName: 'sprintIds',
          initValue(selectList) {
            const values = []
            selectList.map(item => {
              if (item.status === 1) {
                values.push(item.id)
              }
            })

            return values
          },
        },
      ]
    },
  },
  watch: {
    'searchForm.pageSize': function() {
      this.init && this.getCardData()
    },
  },
  mounted() {},

  methods: {
    // 筛选条件
    handleFilter(val) {
      const filters = {}
      val?.length &&
        val.forEach(item => {
          if (item.key === 'searchKey') {
            filters.sprintName = item.value
          } else {
            filters[item.key] = item.value
          }
        })

      this.filterValue = filters
      this.searchForm = {
        ...this.searchForm,
        ...filters,
      }
      this.fullSearchForm = {
        ...this.searchForm,
        pageSize: this.fullSearchForm.pageSize,
        pageNumber: this.fullSearchForm.pageNumber,
        order: this.fullSearchForm.order,
      }
      this.getCardData()
    },
    // 排序
    sortChange({ prop, order }) {
      if (order) {
        const field = prop === 'sprintStatus' ? 20 : 10
        const desc = order === 'descending' ? 1 : 0
        if (this.isFullScreen) {
          this.fullSearchForm.order = field + desc
        } else {
          this.searchForm.order = field + desc
        }
      } else {
        if (this.isFullScreen) {
          this.fullSearchForm.order = 10
        } else {
          this.searchForm.order = 10
        }
      }
      this.getCardData()
    },
    handleSizeChange(val) {
      this.fullSearchForm.pageSize = val
      this.getCardData()
    },
    parseCardData(e) {
      const { event, res } = e.data
      if (event !== 'workItemData' + this.type) {
        this.cardLoading = false
        return
      }

      parseResponse(
        { data: res },
        function() {},
        function() {},
      )

      if (res.status === 200 && res.data) {
        if (this.isFullScreen) {
          this.fullData = res.data.data
          this.fullPageInfo = {
            pageNo: res.data.pageNo,
            pageNumber: res.data.pageNumber,
            total: res.data.total,
            totalPage: res.data.totalPage,
          }
          this.fullScreenInit = true
        } else {
          this.data = res.data.data

          this.pageInfo = {
            pageNo: res.data.pageNo,
            pageNumber: res.data.pageNumber,
            total: res.data.total,
            totalPage: res.data.totalPage,
          }
        }
      }

      this.cardLoading && (this.cardLoading = false)
      this.init = true
    },
    // 计算表格展示内容
    computedTableContent() {
      const computedPageInfo = () => {
        const height = this.tableHeight - 48
        this.searchForm.pageSize = Math.floor(height / lineHeight)
      }

      computedPageInfo()

      if (!this.init || this.pageInfo.totalPage > 1) {
        this.tableHeight -= 34
        computedPageInfo()
      }
    },
    async getCardData() {
      this.cardLoading = true
      this.worker.postMessage({
        type: 'http',
        event: 'workItemData' + this.type,
        props: {
          method: 'post',
          url: this.url,
          payload: this.isFullScreen ? this.fullSearchForm : this.searchForm,
        },
      })
    },
    // 打开全屏
    handleOpenFullScreen() {
      this.$udp.fullScreenHandle(true).then(
        () => {
          this.isFullScreen = true
          this.cardHeight = this.mainAppContainer.scrollHeight + 'px'
          this.fullTableHeight = this.mainAppContainer.scrollHeight - 140
          !this.fullScreenInit && this.getCardData()
        },
        () => {
          this.$message.error('全屏失败')
        },
      )
    },
    // 关闭全屏
    handleCloseFullScreen() {
      this.$udp.fullScreenHandle(false).then(
        () => {
          this.isFullScreen = false
          this.cardHeight = this.mainAppContainer.scrollHeight + 'px'
        },
        () => {
          this.$message.error('关闭全屏失败')
        },
      )
    },
  },
}
</script>
