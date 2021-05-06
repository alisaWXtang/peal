<template>
  <div>
    <div
      v-loading.fullscreen.lock="loading"
      class="requirement-card scrollbal-common"
      element-loading-text=" "
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255,255,255, 0.1)"
    >
      <div
        v-for="item in requirementTypeData"
        :key="item.statusId"
        class="panel-box"
      >
        <div class="panel-box-header-common">
          <span class="panel-box-header-common-title">{{
            `${item.name}(${item.total})`
          }}</span>
          <i
            v-if="item.init && createItemAuth"
            class="iconfont icon-plus cursor-pointer"
            @click="addItem(item.statusId)"
          ></i>
          <el-tooltip
            class="item"
            effect="dark"
            :content="taskExpandText(item.statusId)"
            placement="top"
          >
            <i
              class="panel-box-header-common-icon-right iconfont"
              :class="{
                'icon-unfold': !opendRequirementPoor.includes(item.statusId),
                'icon-retract': opendRequirementPoor.includes(item.statusId),
              }"
              @click="tasksShowHandle(item.statusId)"
            ></i>
          </el-tooltip>
        </div>
        <div
          v-if="item.init && newRequirementStatus.show"
          class="panel-box-header-add"
        >
          <el-input
            v-model="newRequirementStatus.title"
            :placeholder="$t('请输入需求标题')"
            @change="saveRequir"
            @blur="saveRequir"
          ></el-input>
        </div>
        <div
          v-show="opendRequirementPoor.includes(item.statusId)"
          class="panel-box-header-detail"
        >
          <div class="panel-box-header-detail-requirement">
            {{ $t('需求') }}
          </div>
          <div
            v-for="ktem in item.taskLabelList"
            :key="ktem.statusId"
            class="panel-box-header-detail-task"
          >
            {{ `${$t('任务')}-${ktem.name}(${ktem.total})` }}
          </div>
        </div>
        <div
          v-vscroll
          class="panel-item-box scrollbal-common"
          @drop="e => requirementDropHandler(e, item)"
          @dragover.prevent
        >
          <CardInfiniteScroll
            :card-data="item.requirementBoardVOS"
            :is-panel-item-line="opendRequirementPoor.includes(item.statusId)"
          >
            <template scope="scope">
              <div class="panel-item-requirement-box">
                <div
                  class="panel-item-requirement card-box"
                  :class="{
                    'panel-item-finish': item.end,
                    'panel-item-cureent':
                      scope.row.requirement.id == selectedWorkItemId,
                  }"
                  :style="{
                    backgroundColor: scope.row.requirement.display.delayed
                      ? '#FDF1F2'
                      : '',
                  }"
                  draggable="true"
                  @dragstart="
                    e =>
                      dragStartDataInit(
                        e,
                        scope.row,
                        scope.row.requirement.id,
                        item.statusId,
                        'requirement',
                      )
                  "
                  @dragend="commonDragendHandle"
                >
                  <div
                    @click.stop="
                      workItemClickCallback(
                        scope.row.requirement.id,
                        'requirement',
                        'all',
                      )
                    "
                  >
                    <div class="card-item card-title">
                      {{ scope.row.requirement.display.title }}
                    </div>
                    <div
                      v-show="scope.row.requirement.endTime"
                      class="card-item card-end-time"
                    >
                      <span
                        :class="{
                          'card-time-red': !scope.row.requirement.display
                            .delayed,
                          'card-time-dalay':
                            scope.row.requirement.display.delayed,
                        }"
                        >{{
                          helperEndtime(scope.row.requirement.endTime)
                        }}</span
                      >
                      <div
                        v-show="helperChildEmpty(scope.row)"
                        class="card-time-common card-item-empty"
                      >
                        {{ helperUpdateTime(scope.row.requirement.updateTime)
                        }}{{ $t('更新') }}
                      </div>
                    </div>
                    <div class="card-item">
                      <span
                        v-html="
                          initNameStatus(
                            item.end
                              ? '#cec9c9'
                              : scope.row.requirement.display.detail.priority
                                  .color,
                            scope.row.requirement.display.detail.priority
                              .literal,
                          )
                        "
                      ></span>
                      <span
                        class="card-assignUser"
                        :class="{
                          'card-assignUser-exist-time':
                            helperChildEmpty(scope.row) &&
                            !scope.row.requirement.endTime,
                        }"
                        >{{ scope.row.requirement.display.assignUser }}</span
                      >
                      <div
                        v-show="
                          helperChildEmpty(scope.row) &&
                            !scope.row.requirement.endTime
                        "
                        class="card-time-common card-time-requirement-empty"
                      >
                        {{ helperUpdateTime(scope.row.requirement.updateTime)
                        }}{{ $t('更新') }}
                      </div>
                    </div>
                    <div
                      v-show="!helperChildEmpty(scope.row)"
                      class="card-item card-item-child"
                    >
                      <span
                        v-show="scope.row.requirementCount !== 0"
                        class="item-type"
                        @click.stop="childItemHandle(scope.row, 'requirement')"
                      >
                        <el-tooltip
                          class="item"
                          effect="dark"
                          :content="$t('子需求')"
                          placement="bottom"
                        >
                          <i class="iconfont icon-xuqiu"></i>
                        </el-tooltip>
                        <span
                          >{{ scope.row.requirementFinish }}/{{
                            scope.row.requirementCount
                          }}</span
                        >
                      </span>
                      <span
                        v-show="scope.row.taskCount !== 0"
                        class="item-type"
                        @click.stop="childItemHandle(scope.row, 'task')"
                      >
                        <el-tooltip
                          class="item"
                          effect="dark"
                          :content="$t('任务')"
                          placement="bottom"
                        >
                          <i class="iconfont icon-renwu"></i>
                        </el-tooltip>
                        <span
                          >{{ scope.row.taskFinish }}/{{
                            scope.row.taskCount
                          }}</span
                        >
                      </span>
                      <span
                        v-show="scope.row.defectCount !== 0"
                        class="item-type"
                        @click.stop="childItemHandle(scope.row, 'bug')"
                      >
                        <el-tooltip
                          class="item"
                          effect="dark"
                          :content="$t('缺陷')"
                          placement="bottom"
                        >
                          <i class="iconfont icon-quexian"></i>
                        </el-tooltip>
                        <span
                          >{{ scope.row.defectFinish }}/{{
                            scope.row.defectCount
                          }}</span
                        >
                      </span>
                      <div class="card-time-common card-time-requirement">
                        {{ helperUpdateTime(scope.row.requirement.updateTime)
                        }}{{ $t('更新') }}
                      </div>
                    </div>
                    <div class="card-start-time">
                      {{ $t('开始时间') }}：{{
                        scope.row.requirement.startTime || '--'
                      }}
                    </div>
                  </div>
                  <!-- 子需求、子任务、关联缺陷 -->
                  <div
                    v-if="
                      requireChildMap[scope.row.requirement.id] &&
                        requireChildMap[scope.row.requirement.id].activeType &&
                        requireChildMap[scope.row.requirement.id][
                          requireChildMap[scope.row.requirement.id].activeType
                        ] &&
                        requireChildMap[scope.row.requirement.id][
                          requireChildMap[scope.row.requirement.id].activeType
                        ].length > 0
                    "
                    class="panel-item-requirement-child-box scrollbal-common"
                  >
                    <template
                      v-if="
                        requireChildMap[scope.row.requirement.id].activeType ===
                          'requirement'
                      "
                    >
                      <div
                        v-for="ktem in requireChildMap[scope.row.requirement.id]
                          .requirement"
                        :key="ktem.workItemId"
                        class="panel-item-requirement card-box"
                        :class="{
                          'panel-item-cureent':
                            ktem.workItemId == selectedWorkItemId,
                        }"
                        @click.stop="
                          workItemClickCallback(
                            ktem.workItemId,
                            'requirement',
                            'requirement',
                          )
                        "
                      >
                        <div class="card-item card-title">{{ ktem.title }}</div>
                        <div class="card-item">
                          <span
                            v-html="
                              initNameStatus(
                                ktem.status.end ? '#cec9c9' : ktem.status.color,
                                ktem.status.statusName,
                              )
                            "
                          ></span>
                          <span class="card-assignUser">{{
                            ktem.assignUserName
                          }}</span>
                        </div>
                      </div>
                    </template>
                    <template
                      v-if="
                        requireChildMap[scope.row.requirement.id].activeType ===
                          'task'
                      "
                    >
                      <div
                        v-for="ktem in requireChildMap[scope.row.requirement.id]
                          .task"
                        :key="ktem.workItemId"
                        class="panel-item-requirement card-box"
                        :class="{
                          'panel-item-cureent':
                            ktem.workItemId == selectedWorkItemId,
                        }"
                        @click.stop="
                          workItemClickCallback(
                            ktem.workItemId,
                            'task',
                            item.statusId,
                          )
                        "
                      >
                        <div class="card-item card-title">
                          {{ ktem.title }}--{{ ktem.workItemId }}
                        </div>
                        <div class="card-item">
                          <span
                            v-html="
                              initNameStatus(
                                ktem.status.end ? '#cec9c9' : ktem.status.color,
                                ktem.status.statusName,
                              )
                            "
                          ></span>
                          <span class="card-assignUser">{{
                            ktem.assignUserName
                          }}</span>
                        </div>
                      </div>
                    </template>
                    <template
                      v-if="
                        requireChildMap[scope.row.requirement.id].activeType ===
                          'bug'
                      "
                    >
                      <div
                        v-for="ktem in requireChildMap[scope.row.requirement.id]
                          .bug"
                        :key="ktem.workItemId"
                        class="panel-item-requirement card-box"
                        :class="{
                          'panel-item-cureent':
                            ktem.workItemId == selectedWorkItemId,
                        }"
                        @click.stop="
                          workItemClickCallback(ktem.workItemId, 'bug', 'bug')
                        "
                      >
                        <div class="card-item card-title">{{ ktem.title }}</div>
                        <div class="card-item">
                          <span
                            v-html="
                              initNameStatus(
                                ktem.status.end ? '#cec9c9' : ktem.status.color,
                                ktem.status.statusName,
                              )
                            "
                          ></span>
                          <span class="card-assignUser">{{
                            ktem.assignUserName
                          }}</span>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <!-- 展开的任务泳道集合 -->
              <div
                v-show="opendRequirementPoor.includes(item.statusId)"
                class="panel-item-task-box"
              >
                <div
                  v-for="ktem in item.taskLabelList"
                  :key="ktem.statusId"
                  class="panel-item-task-poor scrollbal-common"
                  :class="{ 'panel-item-task-poor--en': $isEnglish() }"
                  @drop="
                    e =>
                      taskDropHandler(
                        e,
                        ktem,
                        scope.row.requirement.id,
                        item.statusId,
                      )
                  "
                  @dragover.prevent
                >
                  <template
                    v-if="
                      item.taskListObject[scope.row.requirement.id] &&
                        Array.isArray(
                          item.taskListObject[scope.row.requirement.id][
                            ktem.statusId
                          ],
                        )
                    "
                  >
                    <div
                      v-for="ltem in item.taskListObject[
                        scope.row.requirement.id
                      ][ktem.statusId]"
                      :key="ltem.id"
                      class="panel-item-task card-box"
                      :class="{
                        'panel-item-finish': ktem.end,
                        'panel-item-cureent': ltem.id == selectedWorkItemId,
                      }"
                      draggable="true"
                      @dragstart="
                        e =>
                          dragStartDataInit(
                            e,
                            ltem,
                            scope.row.requirement.id,
                            ktem.statusId,
                            'task',
                          )
                      "
                      @dragend="commonDragendHandle"
                      @click.stop="
                        workItemClickCallback(ltem.id, 'task', item.statusId)
                      "
                    >
                      <div class="card-item card-title">
                        {{ ltem.display.title }}
                      </div>
                      <div class="card-item">
                        <span
                          v-html="
                            initNameStatus(
                              ktem.end
                                ? '#cec9c9'
                                : ltem.display.detail.priority.color,
                              ltem.display.detail.priority.literal,
                            )
                          "
                        ></span>
                        <span class="card-assignUser">{{
                          ltem.display.assignUser
                        }}</span>
                        <div
                          class="item-task-update-time card-time-common card-time-task"
                        >
                          {{ helperUpdateTime(ltem.updateTime)
                          }}{{ $t('更新') }}
                        </div>
                      </div>
                      <div class="item-task-end-time">
                        <span>{{ helperEndtime(ltem.endTime) }}</span>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </CardInfiniteScroll>
          <!--          <div-->
          <!--            v-for="jtem in item.requirementBoardVOS"-->
          <!--            :key="jtem.requirement.id"-->
          <!--            class="panel-item"-->
          <!--            :class="{-->
          <!--              'panel-item-line': opendRequirementPoor.includes(item.statusId),-->
          <!--            }"-->
          <!--          >-->
          <!--            <div class="panel-item-requirement-box">-->
          <!--              <div-->
          <!--                class="panel-item-requirement card-box"-->
          <!--                :class="{-->
          <!--                  'panel-item-finish': item.end,-->
          <!--                  'panel-item-cureent':-->
          <!--                    jtem.requirement.id == selectedWorkItemId,-->
          <!--                }"-->
          <!--                :style="{-->
          <!--                  backgroundColor: jtem.requirement.display.delayed-->
          <!--                    ? '#FDF1F2'-->
          <!--                    : '',-->
          <!--                }"-->
          <!--                draggable="true"-->
          <!--                @dragstart="-->
          <!--                  e =>-->
          <!--                    dragStartDataInit(-->
          <!--                      e,-->
          <!--                      jtem,-->
          <!--                      jtem.requirement.id,-->
          <!--                      item.statusId,-->
          <!--                      'requirement',-->
          <!--                    )-->
          <!--                "-->
          <!--                @dragend="commonDragendHandle"-->
          <!--              >-->
          <!--                <div-->
          <!--                  @click.stop="-->
          <!--                    workItemClickCallback(-->
          <!--                      jtem.requirement.id,-->
          <!--                      'requirement',-->
          <!--                      'all',-->
          <!--                    )-->
          <!--                  "-->
          <!--                >-->
          <!--                  <div class="card-item card-title">-->
          <!--                    {{ jtem.requirement.display.title }}-->
          <!--                  </div>-->
          <!--                  <div-->
          <!--                    v-show="jtem.requirement.endTime"-->
          <!--                    class="card-item card-end-time"-->
          <!--                  >-->
          <!--                    <span-->
          <!--                      :class="{-->
          <!--                        'card-time-red': !jtem.requirement.display.delayed,-->
          <!--                        'card-time-dalay': jtem.requirement.display.delayed,-->
          <!--                      }"-->
          <!--                      >{{ helperEndtime(jtem.requirement.endTime) }}</span-->
          <!--                    >-->
          <!--                    <div-->
          <!--                      v-show="helperChildEmpty(jtem)"-->
          <!--                      class="card-time-common card-item-empty"-->
          <!--                    >-->
          <!--                      {{ helperUpdateTime(jtem.requirement.updateTime)-->
          <!--                      }}{{ $t('更新') }}-->
          <!--                    </div>-->
          <!--                  </div>-->
          <!--                  <div class="card-item">-->
          <!--                    <span-->
          <!--                      v-html="-->
          <!--                        initNameStatus(-->
          <!--                          item.end-->
          <!--                            ? '#cec9c9'-->
          <!--                            : jtem.requirement.display.detail.priority.color,-->
          <!--                          jtem.requirement.display.detail.priority.literal,-->
          <!--                        )-->
          <!--                      "-->
          <!--                    ></span>-->
          <!--                    <span-->
          <!--                      class="card-assignUser"-->
          <!--                      :class="{-->
          <!--                        'card-assignUser-exist-time':-->
          <!--                          helperChildEmpty(jtem) && !jtem.requirement.endTime,-->
          <!--                      }"-->
          <!--                      >{{ jtem.requirement.display.assignUser }}</span-->
          <!--                    >-->
          <!--                    <div-->
          <!--                      v-show="-->
          <!--                        helperChildEmpty(jtem) && !jtem.requirement.endTime-->
          <!--                      "-->
          <!--                      class="card-time-common card-time-requirement-empty"-->
          <!--                    >-->
          <!--                      {{ helperUpdateTime(jtem.requirement.updateTime)-->
          <!--                      }}{{ $t('更新') }}-->
          <!--                    </div>-->
          <!--                  </div>-->
          <!--                  <div-->
          <!--                    v-show="!helperChildEmpty(jtem)"-->
          <!--                    class="card-item card-item-child"-->
          <!--                  >-->
          <!--                    <span-->
          <!--                      v-show="jtem.requirementCount !== 0"-->
          <!--                      class="item-type"-->
          <!--                      @click.stop="childItemHandle(jtem, 'requirement')"-->
          <!--                    >-->
          <!--                      <el-tooltip-->
          <!--                        class="item"-->
          <!--                        effect="dark"-->
          <!--                        :content="$t('子需求')"-->
          <!--                        placement="bottom"-->
          <!--                      >-->
          <!--                        <i class="iconfont icon-xuqiu"></i>-->
          <!--                      </el-tooltip>-->
          <!--                      <span-->
          <!--                        >{{ jtem.requirementFinish }}/{{-->
          <!--                          jtem.requirementCount-->
          <!--                        }}</span-->
          <!--                      >-->
          <!--                    </span>-->
          <!--                    <span-->
          <!--                      v-show="jtem.taskCount !== 0"-->
          <!--                      class="item-type"-->
          <!--                      @click.stop="childItemHandle(jtem, 'task')"-->
          <!--                    >-->
          <!--                      <el-tooltip-->
          <!--                        class="item"-->
          <!--                        effect="dark"-->
          <!--                        :content="$t('任务')"-->
          <!--                        placement="bottom"-->
          <!--                      >-->
          <!--                        <i class="iconfont icon-renwu"></i>-->
          <!--                      </el-tooltip>-->
          <!--                      <span>{{ jtem.taskFinish }}/{{ jtem.taskCount }}</span>-->
          <!--                    </span>-->
          <!--                    <span-->
          <!--                      v-show="jtem.defectCount !== 0"-->
          <!--                      class="item-type"-->
          <!--                      @click.stop="childItemHandle(jtem, 'bug')"-->
          <!--                    >-->
          <!--                      <el-tooltip-->
          <!--                        class="item"-->
          <!--                        effect="dark"-->
          <!--                        :content="$t('缺陷')"-->
          <!--                        placement="bottom"-->
          <!--                      >-->
          <!--                        <i class="iconfont icon-quexian"></i>-->
          <!--                      </el-tooltip>-->
          <!--                      <span-->
          <!--                        >{{ jtem.defectFinish }}/{{ jtem.defectCount }}</span-->
          <!--                      >-->
          <!--                    </span>-->
          <!--                    <div class="card-time-common card-time-requirement">-->
          <!--                      {{ helperUpdateTime(jtem.requirement.updateTime)-->
          <!--                      }}{{ $t('更新') }}-->
          <!--                    </div>-->
          <!--                  </div>-->
          <!--                  <div class="card-start-time">-->
          <!--                    {{ $t('开始时间') }}：{{-->
          <!--                      jtem.requirement.startTime || '&#45;&#45;'-->
          <!--                    }}-->
          <!--                  </div>-->
          <!--                </div>-->
          <!--                &lt;!&ndash; 子需求、子任务、关联缺陷 &ndash;&gt;-->
          <!--                <div-->
          <!--                  v-if="-->
          <!--                    requireChildMap[jtem.requirement.id] &&-->
          <!--                      requireChildMap[jtem.requirement.id].activeType &&-->
          <!--                      requireChildMap[jtem.requirement.id][-->
          <!--                        requireChildMap[jtem.requirement.id].activeType-->
          <!--                      ] &&-->
          <!--                      requireChildMap[jtem.requirement.id][-->
          <!--                        requireChildMap[jtem.requirement.id].activeType-->
          <!--                      ].length > 0-->
          <!--                  "-->
          <!--                  class="panel-item-requirement-child-box scrollbal-common"-->
          <!--                >-->
          <!--                  <template-->
          <!--                    v-if="-->
          <!--                      requireChildMap[jtem.requirement.id].activeType ===-->
          <!--                        'requirement'-->
          <!--                    "-->
          <!--                  >-->
          <!--                    <div-->
          <!--                      v-for="ktem in requireChildMap[jtem.requirement.id]-->
          <!--                        .requirement"-->
          <!--                      :key="ktem.workItemId"-->
          <!--                      class="panel-item-requirement card-box"-->
          <!--                      :class="{-->
          <!--                        'panel-item-cureent':-->
          <!--                          ktem.workItemId == selectedWorkItemId,-->
          <!--                      }"-->
          <!--                      @click.stop="-->
          <!--                        workItemClickCallback(-->
          <!--                          ktem.workItemId,-->
          <!--                          'requirement',-->
          <!--                          'requirement',-->
          <!--                        )-->
          <!--                      "-->
          <!--                    >-->
          <!--                      <div class="card-item card-title">{{ ktem.title }}</div>-->
          <!--                      <div class="card-item">-->
          <!--                        <span-->
          <!--                          v-html="-->
          <!--                            initNameStatus(-->
          <!--                              ktem.status.end ? '#cec9c9' : ktem.status.color,-->
          <!--                              ktem.status.statusName,-->
          <!--                            )-->
          <!--                          "-->
          <!--                        ></span>-->
          <!--                        <span class="card-assignUser">{{-->
          <!--                          ktem.assignUserName-->
          <!--                        }}</span>-->
          <!--                      </div>-->
          <!--                    </div>-->
          <!--                  </template>-->
          <!--                  <template-->
          <!--                    v-if="-->
          <!--                      requireChildMap[jtem.requirement.id].activeType === 'task'-->
          <!--                    "-->
          <!--                  >-->
          <!--                    <div-->
          <!--                      v-for="ktem in requireChildMap[jtem.requirement.id].task"-->
          <!--                      :key="ktem.workItemId"-->
          <!--                      class="panel-item-requirement card-box"-->
          <!--                      :class="{-->
          <!--                        'panel-item-cureent':-->
          <!--                          ktem.workItemId == selectedWorkItemId,-->
          <!--                      }"-->
          <!--                      @click.stop="-->
          <!--                        workItemClickCallback(-->
          <!--                          ktem.workItemId,-->
          <!--                          'task',-->
          <!--                          item.statusId,-->
          <!--                        )-->
          <!--                      "-->
          <!--                    >-->
          <!--                      <div class="card-item card-title">-->
          <!--                        {{ ktem.title }}&#45;&#45;{{ ktem.workItemId }}-->
          <!--                      </div>-->
          <!--                      <div class="card-item">-->
          <!--                        <span-->
          <!--                          v-html="-->
          <!--                            initNameStatus(-->
          <!--                              ktem.status.end ? '#cec9c9' : ktem.status.color,-->
          <!--                              ktem.status.statusName,-->
          <!--                            )-->
          <!--                          "-->
          <!--                        ></span>-->
          <!--                        <span class="card-assignUser">{{-->
          <!--                          ktem.assignUserName-->
          <!--                        }}</span>-->
          <!--                      </div>-->
          <!--                    </div>-->
          <!--                  </template>-->
          <!--                  <template-->
          <!--                    v-if="-->
          <!--                      requireChildMap[jtem.requirement.id].activeType === 'bug'-->
          <!--                    "-->
          <!--                  >-->
          <!--                    <div-->
          <!--                      v-for="ktem in requireChildMap[jtem.requirement.id].bug"-->
          <!--                      :key="ktem.workItemId"-->
          <!--                      class="panel-item-requirement card-box"-->
          <!--                      :class="{-->
          <!--                        'panel-item-cureent':-->
          <!--                          ktem.workItemId == selectedWorkItemId,-->
          <!--                      }"-->
          <!--                      @click.stop="-->
          <!--                        workItemClickCallback(ktem.workItemId, 'bug', 'bug')-->
          <!--                      "-->
          <!--                    >-->
          <!--                      <div class="card-item card-title">{{ ktem.title }}</div>-->
          <!--                      <div class="card-item">-->
          <!--                        <span-->
          <!--                          v-html="-->
          <!--                            initNameStatus(-->
          <!--                              ktem.status.end ? '#cec9c9' : ktem.status.color,-->
          <!--                              ktem.status.statusName,-->
          <!--                            )-->
          <!--                          "-->
          <!--                        ></span>-->
          <!--                        <span class="card-assignUser">{{-->
          <!--                          ktem.assignUserName-->
          <!--                        }}</span>-->
          <!--                      </div>-->
          <!--                    </div>-->
          <!--                  </template>-->
          <!--                </div>-->
          <!--              </div>-->
          <!--            </div>-->
          <!--            &lt;!&ndash; 展开的任务泳道集合 &ndash;&gt;-->
          <!--            <div-->
          <!--              v-show="opendRequirementPoor.includes(item.statusId)"-->
          <!--              class="panel-item-task-box"-->
          <!--            >-->
          <!--              <div-->
          <!--                v-for="ktem in item.taskLabelList"-->
          <!--                :key="ktem.statusId"-->
          <!--                class="panel-item-task-poor scrollbal-common"-->
          <!--                :class="{ 'panel-item-task-poor&#45;&#45;en': $isEnglish() }"-->
          <!--                @drop="-->
          <!--                  e =>-->
          <!--                    taskDropHandler(e, ktem, jtem.requirement.id, item.statusId)-->
          <!--                "-->
          <!--                @dragover.prevent-->
          <!--              >-->
          <!--                <template-->
          <!--                  v-if="-->
          <!--                    item.taskListObject[jtem.requirement.id] &&-->
          <!--                      Array.isArray(-->
          <!--                        item.taskListObject[jtem.requirement.id][ktem.statusId],-->
          <!--                      )-->
          <!--                  "-->
          <!--                >-->
          <!--                  <div-->
          <!--                    v-for="ltem in item.taskListObject[jtem.requirement.id][-->
          <!--                      ktem.statusId-->
          <!--                    ]"-->
          <!--                    :key="ltem.id"-->
          <!--                    class="panel-item-task card-box"-->
          <!--                    :class="{-->
          <!--                      'panel-item-finish': ktem.end,-->
          <!--                      'panel-item-cureent': ltem.id == selectedWorkItemId,-->
          <!--                    }"-->
          <!--                    draggable="true"-->
          <!--                    @dragstart="-->
          <!--                      e =>-->
          <!--                        dragStartDataInit(-->
          <!--                          e,-->
          <!--                          ltem,-->
          <!--                          jtem.requirement.id,-->
          <!--                          ktem.statusId,-->
          <!--                          'task',-->
          <!--                        )-->
          <!--                    "-->
          <!--                    @dragend="commonDragendHandle"-->
          <!--                    @click.stop="-->
          <!--                      workItemClickCallback(ltem.id, 'task', item.statusId)-->
          <!--                    "-->
          <!--                  >-->
          <!--                    <div class="card-item card-title">-->
          <!--                      {{ ltem.display.title }}-->
          <!--                    </div>-->
          <!--                    <div class="card-item">-->
          <!--                      <span-->
          <!--                        v-html="-->
          <!--                          initNameStatus(-->
          <!--                            ktem.end-->
          <!--                              ? '#cec9c9'-->
          <!--                              : ltem.display.detail.priority.color,-->
          <!--                            ltem.display.detail.priority.literal,-->
          <!--                          )-->
          <!--                        "-->
          <!--                      ></span>-->
          <!--                      <span class="card-assignUser">{{-->
          <!--                        ltem.display.assignUser-->
          <!--                      }}</span>-->
          <!--                      <div-->
          <!--                        class="item-task-update-time card-time-common card-time-task"-->
          <!--                      >-->
          <!--                        {{ helperUpdateTime(ltem.updateTime) }}{{ $t('更新') }}-->
          <!--                      </div>-->
          <!--                    </div>-->
          <!--                    <div class="item-task-end-time">-->
          <!--                      &lt;!&ndash;                      <span&ndash;&gt;-->
          <!--                      &lt;!&ndash;                        :class="{&ndash;&gt;-->
          <!--                      &lt;!&ndash;                          'card-time-red': !ltem.display.delayed,&ndash;&gt;-->
          <!--                      &lt;!&ndash;                          'card-time-dalay': ltem.display.delayed,&ndash;&gt;-->
          <!--                      &lt;!&ndash;                        }"&ndash;&gt;-->
          <!--                      &lt;!&ndash;                        >{{ helperEndtime(ltem.endTime) }}</span&ndash;&gt;-->
          <!--                      &lt;!&ndash;                      >&ndash;&gt;-->
          <!--                      <span>{{ helperEndtime(ltem.endTime) }}</span>-->
          <!--                    </div>-->
          <!--                  </div>-->
          <!--                </template>-->
          <!--              </div>-->
          <!--            </div>-->
          <!--          </div>-->
        </div>
      </div>
    </div>
    <!-- 工作项滑窗 -->
    <slide
      :show="sliderWorkItemInfo.sliderStatus"
      :after-close="sliderClose"
      :before-close="
        ({ cb }) => beforeSliderClose({ id: sliderWorkItemInfo.info.id, cb })
      "
    >
      <div slot="task" class="taslinfo">
        <BugDetail
          v-if="sliderWorkItemInfo.type === 'bug'"
          ref="bug"
          :work-item-id="sliderWorkItemInfo.info.id"
          :project-id="projectId"
          :show="sliderWorkItemInfo.sliderStatus"
          @HandleSide="sliderClose"
          @updateInfoSuccess="workItemOpreateCallback"
          @deleteSuccess="workItemOpreateCallback"
        ></BugDetail>
        <TaskDetail
          v-if="sliderWorkItemInfo.type === 'task'"
          ref="task"
          :project-id="projectId"
          :work-item-id="sliderWorkItemInfo.info.id"
          :show="sliderWorkItemInfo.sliderStatus"
          @HandleSide="sliderClose"
          @updateInfoSuccess="workItemOpreateCallback"
          @deleteSuccess="workItemOpreateCallback"
        ></TaskDetail>
        <RequirementDetail
          v-if="sliderWorkItemInfo.type === 'requirement'"
          ref="requrire"
          :project-id="projectId"
          :work-item-id="sliderWorkItemInfo.info.id"
          :show="sliderWorkItemInfo.sliderStatus"
          @HandleSide="sliderClose"
          @updateInfoSuccess="workItemOpreateCallback"
          @deleteSuccess="workItemOpreateCallback"
        ></RequirementDetail>
      </div>
    </slide>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 需求看板
 * @desc 需求看板入口文件
 * @author heyunjiang
 * @date 2019.9.16
 */
// import draggable from 'vuedraggable'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import TinymceSaveMixin from '@/mixin/tinymce-save-mixin'
// import RequireDetail from '@/pages/project/requirement/requirementView';
// import BugDetail from '@/pages/project/bugManagement/BugDetail';
import {
  BugDetail,
  TaskDetail,
  RequirementDetail,
} from '@/components/columbus-workitem-display'
import slide from '@/components/slide-slip'
import * as requirementService from '@/service/requirement'
import { taskUpdate } from '@/service/task'
import CardInfiniteScroll from './CardInfiniteScroll'

const nowYear = new Date().getFullYear()

export default {
  name: 'CardPanel',
  components: {
    // draggable,
    TaskDetail,
    RequirementDetail,
    BugDetail,
    slide,
    CardInfiniteScroll,
  },

  mixins: [ProjectCommonMixin, TinymceSaveMixin],
  props: {
    projectId: {
      type: [String, Number],
    },

    cardBordData: {
      type: Array,
      required: true,
      desc: '需求看板数据源',
    },

    currentCategoryId: {
      type: [String, Number],
      required: false,
      default: '',
    },
  },

  data() {
    return {
      opendRequirementPoor: [], // 已经展开的需求泳道
      poorStatusIdTasksMap: {}, // 泳道对应的任务列表数据
      requireChildMap: {}, // 需求对应的子需求、缺陷
      loading: false,
      // 通用滑块-滑块信息-需求详情、任务详情、缺陷详情
      sliderWorkItemInfo: {
        sliderStatus: false,
        type: '',
        updateType: 'all',
        info: {},
      },

      // 快速创建需求
      newRequirementStatus: {
        show: false,
        title: '',
      },

      selectedWorkItemId: '', //当前点击选中工作项
    }
  },
  computed: {
    // 需求看板对象数据
    requirementTypeData() {
      const poorStatusIdTasksMap = this.poorStatusIdTasksMap
      return this.cardBordData.map(item => {
        return {
          ...item,
          taskLabelList:
            (poorStatusIdTasksMap[item.statusId] &&
              poorStatusIdTasksMap[item.statusId].taskLabelList) ||
            [],
          taskListObject:
            (poorStatusIdTasksMap[item.statusId] &&
              poorStatusIdTasksMap[item.statusId].taskListObject) ||
            {},
        }
      })
    },
    // 快速创建需求权限
    createItemAuth() {
      return this.$authFunction('FUNC_COOP_REQT_CREATE', 3, this.projectId)
    },
  },

  watch: {
    // 当看板数据更新时，则同步更新所有展开的任务列表数据
    cardBordData() {
      this.opendRequirementPoor.forEach(statusId =>
        this.getTasksForRequirementPoor(statusId),
      )
    },
    '$route.query': function({ requireId }) {
      if (requireId) {
        this.selectedWorkItemId = requireId
        this.sliderWorkItemInfo.info.id = requireId
      }
    },
  },

  mounted() {
    this.copeLinkOpenSlide()
  },
  methods: {
    // 复制链接打开子任务，和子缺陷
    copeLinkOpenSlide() {
      const urlParams = this.$getUrlParams()
      const bugId = urlParams.bugId
      const taskId = urlParams.taskId
      let id = bugId || taskId
      let updateType = ''
      let type = ''
      if (!bugId && !taskId) {
        return
      }
      if (bugId) {
        type = 'bug'
        updateType = 'bug'
      }
      if (taskId) {
        type = 'task'
        updateType = 'task'
      }
      this.workItemClickCallback(id, type, updateType)
    },
    // 按钮点击 - 展开/收起需求poor
    tasksShowHandle(statusId) {
      // 展开 or 关闭
      const isopen = this.opendRequirementPoor.includes(statusId)
      if (isopen) {
        this.opendRequirementPoor = this.opendRequirementPoor.filter(
          item => item !== statusId,
        )
      } else {
        this.opendRequirementPoor = [...this.opendRequirementPoor, statusId]
      }
      if (!isopen) {
        const requirementPoor = this.requirementTypeData.find(
          item => item.statusId === statusId,
        )

        // 如果展开的泳道还没有数据，则发起请求获取数据，更新 poorStatusIdTasksMap 对象
        if (requirementPoor && requirementPoor.taskLabelList.length === 0) {
          this.getTasksForRequirementPoor(statusId)
        }
      }
    },
    // 提示文字、
    taskExpandText(statusId) {
      return this.opendRequirementPoor.includes(statusId)
        ? i18n.t('收起任务卡片')
        : i18n.t('展开任务卡片')
    },
    // 按钮点击 - 快速增加需求
    addItem() {
      this.newRequirementStatus = {
        show: !this.newRequirementStatus.show,
        title: '',
      }
    },
    // 按钮点击 - 卡片数字 - 子需求、任务、缺陷
    childItemHandle(info, type = 'requirement') {
      // 隐藏
      if (
        this.requireChildMap[info.requirement.id] &&
        this.requireChildMap[info.requirement.id].activeType === type
      ) {
        this.requireChildMap[info.requirement.id].activeType = ''
      } else {
        if (this.requireChildMap[info.requirement.id]) {
          this.requireChildMap[info.requirement.id] = {
            ...this.requireChildMap[info.requirement.id],
            activeType: type,
          }
        } else if (!this.requireChildMap[info.requirement.id]) {
          this.requireChildMap[info.requirement.id] = {
            activeType: type,
          }
        }
        // 需要获取数据
        switch (type) {
          case 'requirement':
            this.getRequirementChildren(info.requirement.id, 1)
            break
          case 'task':
            this.getRequirementChildren(info.requirement.id, 2)
            break
          case 'bug':
            this.getRequirementChildren(info.requirement.id, 3)
            break
        }
      }
    },
    /**
     * 通用滑块 - 点击工作项弹出滑块
     * @param id - 工作项 id
     * @param type - 工作项类型，分为 requirement, task, defect ，用于右侧滑窗类型控制
     * @param updateType - 更新类型 all - 一级需求， requirement - 子需求 task - 子任务 bug - 关联缺陷
     */
    workItemClickCallback(id, type, updateType) {
      this.selectedWorkItemId = id
      this.sliderWorkItemInfo = {
        sliderStatus: true,
        type,
        updateType,
        info: { id },
      }
    },
    // 通用滑块 - 关闭滑块
    sliderClose() {
      this.sliderWorkItemInfo = {
        sliderStatus: false,
        type: '',
        updateType: this.sliderWorkItemInfo.updateType || 'all',
        info: {},
      }

      this.$emit('slideClose')
    },
    /**
     * 通用滑块 - 操作成功之后回调处理函数
     * 1. 操作一级需求：更新所有泳道需求列表、更新所有展开后代需求的对应type后代列表
     * 2. 操作展开任务：更新所有泳道需求列表、更新所有展开后代需求的对应type后代列表
     * 3. 操作需求下面的子需求、子任务、缺陷：更新所有泳道需求列表、更新所有展开后代需求的对应type后代列表
     */
    workItemOpreateCallback() {
      const { updateType } = this.sliderWorkItemInfo
      const requireIds = Object.keys(this.requireChildMap)
      this.$emit('opreateSuccess')
      switch (updateType) {
        case 'all':
          requireIds.forEach(item => {
            this.getRequirementChildren(item, 1)
            this.getRequirementChildren(item, 2)
            this.getRequirementChildren(item, 3)
          })
          break
        // 当更改点击数字展开的需求、任务、缺陷时，则更新所有已经展开的一级需求的对应后代
        case 'requirement':
          requireIds.forEach(item => this.getRequirementChildren(item, 1))
          break
        case 'bug':
          requireIds.forEach(item => this.getRequirementChildren(item, 3))
          break
        default:
          requireIds.forEach(item => this.getRequirementChildren(item, 2))
      }
    },
    // 拖拽 - 需求、任务拖拽初始化数据设置
    dragStartDataInit(e, info, requirementId, prePoorId, type = 'requirement') {
      e.dataTransfer.dropEffect = 'move'
      e.dataTransfer.setData('info', JSON.stringify(info))
      e.dataTransfer.setData('requirementId', requirementId)
      e.dataTransfer.setData('prePoorId', prePoorId)
      e.dataTransfer.setData('type', type)
    },
    // 拖拽 - 任务泳道 drop 事件处理
    taskDropHandler(
      e,
      targetPoorInfo,
      targetRequirementId,
      requirementStatusId,
    ) {
      const preInfo = JSON.parse(e.dataTransfer.getData('info'))
      const preRequirementId = +e.dataTransfer.getData('requirementId')
      const prePoorId = +e.dataTransfer.getData('prePoorId')
      // 非任务、同一任务泳道不做任何处理
      if (
        e.dataTransfer.getData('type') !== 'task' ||
        prePoorId === targetPoorInfo.statusId
      ) {
        return
      }
      // 共同需求 id 不匹配
      if (targetRequirementId !== preRequirementId) {
        this.$message({ type: 'error', message: i18n.t('不能跨需求拖动任务') })
        return
      }
      this.updateTask(
        preInfo.id,
        {
          statusId: targetPoorInfo.statusId,
        },

        requirementStatusId,
        preRequirementId,
      )
    },
    // 拖拽 - 需求泳道 drop 事件处理
    requirementDropHandler(e, targetPoorInfo) {
      const preInfo = JSON.parse(e.dataTransfer.getData('info'))
      const prePoorId = +e.dataTransfer.getData('prePoorId')
      // 非需求、同一需求泳道不做任何处理
      if (
        e.dataTransfer.getData('type') !== 'requirement' ||
        prePoorId === targetPoorInfo.statusId
      ) {
        return
      }
      this.updateRequirement(preInfo.requirement.id, {
        statusId: targetPoorInfo.statusId,
      })
    },
    // 拖拽 - 需求/任务拖拽结束数据清除
    commonDragendHandle(event) {
      event.dataTransfer.clearData()
    },
    // ajax - 获取需求泳道对应的任务 lists
    async getTasksForRequirementPoor(statusId) {
      let ids = []
      const requirementPoor = this.requirementTypeData.find(
        item => item.statusId === statusId,
      )

      if (requirementPoor) {
        ids = requirementPoor.requirementBoardVOS.map(
          item => item.requirement.id,
        )
      }
      // 如果已经展开的泳道，没有对应的需求，则清空数据
      if (ids.length === 0) {
        this.poorStatusIdTasksMap = {
          ...this.poorStatusIdTasksMap,
          [statusId]: {
            taskLabelList: [],
            taskListObject: {},
          },
        }

        return
      }

      let result = { status: 0 }
      this.loading = true
      try {
        result = await requirementService.cardPoorTasks(ids)
      } catch (_) {
        console.log('error')
      }
      this.loading = false
      if (result.status === 200) {
        this.poorStatusIdTasksMap = {
          ...this.poorStatusIdTasksMap,
          [statusId]: {
            taskLabelList: result.data.status,
            taskListObject: result.data.task,
          },
        }
      }
    },
    // ajax - 获取需求下面的子需求、任务、缺陷
    async getRequirementChildren(reqtId, workItemType = 1) {
      let result = { status: 0 }
      this.loading = true
      try {
        result = await requirementService.cardPoorChildren({
          projectId: this.projectId,
          reqtId,
          workItemType,
        })
      } catch (_) {
        console.log('error')
      }
      this.loading = false
      if (result.status === 200) {
        let keyName = 'requirement'
        switch (workItemType) {
          case 1:
            keyName = 'requirement'
            break
          case 2:
            keyName = 'task'
            break
          case 3:
            keyName = 'bug'
            break
        }

        this.requireChildMap = {
          ...this.requireChildMap,
          [reqtId]: {
            ...this.requireChildMap[reqtId],
            [keyName]: result.data,
          },
        }
      }
    },
    // ajax - 更新需求
    // 更新成功之后：1. 更新所有需求卡片 2. 更新父需求需求的对应type后代列表 3. 更新展开的任务泳道
    async updateRequirement(id, obj = {}) {
      let postObj = {
        id,
        projectId: +this.projectId,
        ...obj,
      }

      let result = { status: 0 }
      this.loading = true
      try {
        result = await requirementService.update(postObj)
      } catch (_) {
        console.log('error')
      }
      this.loading = false

      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('更新成功'),
          type: 'success',
        })

        this.$emit('opreateSuccess')
        Object.keys(this.requireChildMap).forEach(item => {
          this.getRequirementChildren(item, 1)
        })
      } else {
        // this.$message.error(result.msg)
        // this.httpErrorHandle && this.httpErrorHandle(result.msg || '更新失败')
      }
    },
    // ajax - 更新任务
    // 更新成功之后：1. 更新所有需求卡片 2. 更新当前泳道内的任务列表 3. 更新父需求需求的对应type后代列表
    async updateTask(id, obj = {}, requirementStatusId, requirementId) {
      // NOSONAR
      let postObj = {
        id,
        projectId: +this.projectId,
        ...obj,
      }
      let result = { status: 0 }
      this.loading = true
      try {
        result = await taskUpdate(postObj)
      } catch (_) {
        console.log('error')
      }
      this.loading = false

      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('更新成功'),
          type: 'success',
        })

        requirementId && this.getRequirementChildren(requirementId, 2) // 只更新任务列表即可，其他可以不用管
        this.$emit('opreateSuccess')
      } else {
        // this.httpErrorHandle && this.httpErrorHandle(result.msg || '更新失败')
      }
    },
    // ajax - 快速创建需求
    async saveRequir() {
      // 暂时用 loading 来实现，后续换成节流函数
      if (!this.newRequirementStatus.title || this.loading) {
        return
      }
      let result = { status: 0 }
      this.loading = true
      try {
        result = await requirementService.requirementCreate({
          title: this.newRequirementStatus.title,
          projectId: this.projectId,
          categoryId: this.currentCategoryId,
          ...this.getCustomFieldsPresetValues(1),
        })
      } catch (_) {
        console.log('error')
      }
      this.loading = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('添加需求成功'),
          type: 'success',
        })

        this.newRequirementStatus = {
          show: false,
          title: '',
        }

        this.$emit('opreateSuccess')
      } else {
        // this.$message({ message: result.msg || "添加需求失败", type: "error" });
      }
    },
    // 辅助函数
    helperEndtime(time) {
      if (!time) {
        return time
      }
      return (
        (time.indexOf(nowYear) !== -1
          ? time.replace(nowYear + '-', '')
          : time) + i18n.t('截止')
      )
    },
    helperUpdateTime(time) {
      if (!time) {
        return time
      }
      return time.split(' ')[0]
    },
    helperChildEmpty(info) {
      return (
        info.requirementCount === 0 &&
        info.taskCount === 0 &&
        info.defectCount === 0
      )
    },
  },
}
</script>
<style lang="scss" scoped>
@import './CardPanel';
.panel-item-cureent {
  border: 1px solid $--color-primary;
}
.panel-item-box {
  height: 100%;
}
</style>
