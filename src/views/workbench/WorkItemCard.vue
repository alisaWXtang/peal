<template>
  <div>
    <base-card
      ref="baseCard"
      v-loading="cardLoading"
      shadow="never"
      :show-footer="!isFullScreen"
      :style="{ height: cardHeight, '--height': cardHeight }"
      :class="{ 'empty-card': !totalList.length }"
    >
      <template slot="header">
        <div class="header-left">
          <div v-show="!editCardName" class="header-title">
            {{ cardName }} ({{ pageInfo.totalRecords }})
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
        <full-screen-display
          v-if="isFullScreen"
          ref="fullScreenCard"
          :show="isFullScreen"
          :card-height="cardHeight"
          :work-items-type="workItemType"
          :total-list="totalList"
          @work-item-click="handleShowWorkItem"
          @update-data="updateData"
          @sort-change="val => sortChange(val, 'fullScreen')"
        />
        <co-table
          v-show="!isFullScreen"
          v-if="totalList.length"
          ref="dataTable"
          v-loading="tableLoading"
          border
          :highlight-current-row="true"
          :header-cell-style="{ background: '#F0F3F7' }"
          :data="data"
          :height="tableHeight"
          class="data-table"
          @sort-change="sortChange"
        >
          <co-table-column
            prop="title"
            sortable="custom"
            min-width="140px"
            :label="$t('标题')"
          >
            <template v-slot="scope">
              <div class="table-title">
                <i class="iconfont" :class="[workItemIcon(scope.row)]"></i>
                <ellipsis-block
                  :value="scope.row.display.title"
                  class="title-text"
                  popper-class="coteam-workbench-tooltip"
                  @click="handleShowWorkItem(scope.row)"
                ></ellipsis-block>
                <span
                  v-if="scope.row.display.delayed"
                  class="delay-text danger"
                >
                  <el-tooltip
                    effect="dark"
                    placement="top"
                    popper-class="coteam-workbench-tooltip"
                  >
                    <div slot="content">
                      {{ $t('延期') }}
                      {{ $isEnglishDisplaySpace() }}
                      {{ scope.row.display.delayedDays
                      }}{{
                        $isEnglish()
                          ? ` ${computedDisplayDay(
                              scope.row.display.delayedDays,
                            )}`
                          : '天'
                      }}
                    </div>
                    <i class="el-icon-warning-outline"></i>
                  </el-tooltip>
                </span>
                <span
                  v-if="scope.row.display.toBeDelayedAfterToday"
                  class="delay-text warning"
                  type="warning"
                >
                  <el-tooltip
                    effect="dark"
                    :content="$t('今日到期')"
                    placement="top"
                    popper-class="coteam-workbench-tooltip"
                  >
                    <i class="el-icon-warning-outline"></i> </el-tooltip
                ></span>
              </div>
            </template>
          </co-table-column>
          <co-table-column
            prop="priority"
            sortable="custom"
            :label="$t('优先级')"
            min-width="100px"
          >
            <template v-slot="scope">
              <span
                class="work-item-level"
                :style="{ '--color': scope.row.display.detail.priority.color }"
                @click="
                  $event =>
                    GlobalSelectTargetClick(
                      scope.row,
                      $event,
                      'priority',
                      updateData,
                    )
                "
              >
                {{ scope.row.display.detail.priority.literal }}
              </span>
            </template>
          </co-table-column>
          <co-table-column
            v-if="cardType === 'workbench_my_done'"
            prop="finishTime"
            sortable="custom"
            min-width="130px"
            show-overflow-tooltip
            :label="$t('实际完成时间')"
          >
            <template v-slot="scope">
              {{ scope.row.display.finishTime || '--' }}
            </template>
          </co-table-column>
          <el-table-column
            v-else
            prop="endTime"
            sortable="custom"
            min-width="140px"
            show-overflow-tooltip
            :label="$t('预计结束时间')"
          >
            <template v-slot="scope">
              {{ scope.row.display.endTime || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="projectId"
            sortable="custom"
            :label="$t('项目')"
            show-overflow-tooltip
            min-width="120px"
          >
            <template v-slot="scope">
              {{ scope.row.display.projectName || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="statusId"
            sortable="custom"
            :label="$t('状态')"
            min-width="100px"
            fixed="right"
          >
            <template v-slot="scope">
              <state-flow
                :project-id="scope.row.projectId"
                :status-id="scope.row.statusId"
                :work-item-type="scope.row.workItemType"
                :work-item-id="scope.row.id"
                :update-data="updateData"
                :current-index="scope.$index"
                :bg-color="scope.row.display.detail.status.color"
                :border-color="scope.row.display.detail.status.color"
                :style="{ '--color': scope.row.display.detail.status.color }"
                :display-status="scope.row.display.status"
              ></state-flow>
            </template>
          </el-table-column>
        </co-table>
        <div v-show="!totalList.length && !isFullScreen" class="empty-data">
          <img src="@/assets/workbench/empty.png" :alt="$t('暂无数据')" />
          <div v-if="init" class="desc">{{ $t('暂无数据') }}</div>
        </div>
      </template>
      <template slot="footer">
        <el-pagination
          v-if="pageInfo.pages > 1"
          layout="prev, pager, next"
          :page-size="pageInfo.pageSize"
          :current-page.sync="pageInfo.pageNumber"
          :total="pageInfo.totalRecords"
          @current-change="handlePageChange"
        >
        </el-pagination>
      </template>
    </base-card>
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
          @deleteSuccess="updateData"
          @updateInfoSuccess="updateData"
        ></bug-detail>
        <task-detail
          v-if="activeWorkItem.workItemType === 2 && slideShow"
          ref="task"
          :project-id="activeWorkItem.projectId"
          :work-item-id="activeWorkItem.id"
          :show="slideShow"
          @HandleSide="handleSide"
          @deleteSuccess="updateData"
          @updateInfoSuccess="updateData"
        ></task-detail>
        <requirement-detail
          v-if="activeWorkItem.workItemType === 1 && slideShow"
          ref="require"
          :project-id="activeWorkItem.projectId"
          :work-item-id="activeWorkItem.id"
          :show="slideShow"
          @HandleSide="handleSide"
          @deleteSuccess="updateData"
          @updateInfoSuccess="updateData"
        ></requirement-detail>
      </div>
    </slide>

    <GlobalSelect v-bind="GlobalSelectProps"></GlobalSelect>
  </div>
</template>

<script>
/**
 * @title 我完成的
 * @author chenxiaolong
 * @date 2021.01.07
 */

import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import WorkItemCardMixin from '@/views/workbench/WorkItemCardMixin'
import { workbenchCardTypes } from './constant'

export default {
  name: 'WorkItemCard',
  mixins: [ProjectCommonMixin, WorkItemCardMixin],
  props: {
    type: {
      type: String,
      default: workbenchCardTypes.todo,
      validator: function(val) {
        return Object.values(workbenchCardTypes).includes(val)
      },
    },
  },
}
</script>
