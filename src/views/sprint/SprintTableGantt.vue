<template>
  <div id="table-gantt" ref="tableGanttBox" class="table-gantt-box">
    <!--    <div-->
    <!--      v-show="!showGantt"-->
    <!--      ref="scrollbarbox"-->
    <!--      class="scrollbar-box"-->
    <!--      :class="{ 'fixed-top': isScrollbarFixed }"-->
    <!--    >-->
    <!--      <div-->
    <!--        ref="scrollbarleft"-->
    <!--        class="scrollbar-item scrollbal-common scrollbar-left"-->
    <!--      >-->
    <!--        <div ref="scrollbarleftcontent" class="scrollbar-content"></div>-->
    <!--      </div>-->
    <!--      <div-->
    <!--        ref="scrollbarright"-->
    <!--        class="scrollbar-item scrollbal-common scrollbar-right"-->
    <!--      >-->
    <!--        <div ref="scrollbarrightcontent" class="scrollbar-content"></div>-->
    <!--      </div>-->
    <!--    </div>-->
    <!-- <div class="scrollbal-common" :class="{'sprint-table-gantt-scroll': scrollOption && scrollOption.overflowY}" :style="{'height': scrollOption && scrollOption.height + 'px' || 'auto'}"> -->
    <two-block-width-changer
      ref="TwoBlockWidthChanger"
      :icon-text="$t('甘特图')"
      :init-left-width="initLeftWidth"
      :show-right="enableCollspan"
      :is-show-gantt="isShowGantt"
      @rightVisableChange="onRightVisableChange"
      @dragend="refreshScrollBarWidth"
    >
      <div ref="tableGanttLeft" slot="left" class="table-gantt-left">
        <tree-table
          ref="treeTable"
          :user-id="userId"
          :data="treeData"
          :expand-all="expandAll"
          :is-can-change-expand="true"
          :is-checked="false"
          :ltype="2"
          :table-height="tableHeight"
          :update-global-title="updateGlobalTitle"
          :sorta-change-call-back="sortaChangeCallBack"
          :expand-change-call-back="expandChangeCallBack"
          @change-expand="changeExpand"
          @seeTaskHandle="seeTaskHandle"
        >
          <el-table-column
            :label="$t('优先级')"
            prop="priority"
            sortable="custom"
            show-overflow-tooltip
            :width="$isEnglish() ? 100 : 90"
          >
            <template slot-scope="scope">
              <span
                class="cursor-pointer none-box-shadow"
                @click.stop="
                  e =>
                    GlobalSelectTargetClick(
                      scope.row.data,
                      e,
                      'priority',
                      getBaseList,
                    )
                "
                v-html="
                  initNameStatus(
                    scope.row.data.display.detail.priority.color,
                    scope.row.data.display.detail.priority.literal,
                  )
                "
              ></span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('状态')"
            prop="statusId"
            sortable="custom"
            show-overflow-tooltip
            width="120"
          >
            <template slot-scope="scope">
              <StateFlow
                :project-id="$getUrlParams().projectId"
                :status-id="scope.row.data.statusId"
                :work-item-type="scope.row.data.workItemType || 3"
                :work-item-id="scope.row.data.id"
                :parent-info="scope.row.data"
                :update-data="
                  scope.row.data.workItemType == null
                    ? updateData
                    : () => updateData(scope.row.data)
                "
              >
                <span
                  class="cursor-pointer status_name none-box-shadow"
                  v-html="
                    initNameStatus(
                      scope.row.data.display.detail.status.color,
                      scope.row.data.display.status,
                    )
                  "
                  >{{ scope.row.data.display.status }}
                </span>
              </StateFlow>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('处理人')"
            prop="assignUser"
            sortable="custom"
            show-overflow-tooltip
            width="100"
          >
            <template slot-scope="scope">
              <global-user-select
                v-if="scope.row.data._isAssignUserChoice"
                env-type="PROJECT"
                :api-params="{ projectId: scope.row.data.projectId }"
                :filter-invalid="true"
                :is-focus="true"
                :value="assignUserChoice.value"
                :placeholder="$t('输入拼音/工号/姓名')"
                @visibleChange="
                  val => selectUserVisibleChange(val, scope.row.data)
                "
                @change="val => selectUserChange(val, scope.row.data)"
              ></global-user-select>
              <span
                v-if="!scope.row.data._isAssignUserChoice"
                class="select-user"
                @click="handleAssignUserChoice(scope.row.data)"
                >{{ scope.row.data.display.assignUser }}</span
              >
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('需求工时')"
            prop="requireExpectHour"
            show-overflow-tooltip
            width="90"
          >
            <template slot-scope="scope">
              {{
                scope.row.data.requireExpectHour > 0
                  ? scope.row.data.requireExpectHour + 'h'
                  : '--'
              }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('任务总工时')"
            prop="expectHour"
            show-overflow-tooltip
            width="90"
          >
            <template slot-scope="scope">
              {{
                scope.row.data.expectHour > 0
                  ? scope.row.data.expectHour + 'h'
                  : '--'
              }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('开始时间')"
            prop="startTime"
            sortable="custom"
            show-overflow-tooltip
            width="125"
          >
            <template slot-scope="scope"
              >{{ scope.row.data.startTime || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('结束时间')"
            prop="endTime"
            sortable="custom"
            show-overflow-tooltip
            width="125"
          >
            <template slot-scope="scope"
              >{{ scope.row.data.endTime || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('创建人')"
            prop="createUser"
            sortable="custom"
            show-overflow-tooltip
            width="100"
          >
            <template slot-scope="scope"
              >{{ scope.row.data.display.createUser }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('创建时间')"
            prop="createTime"
            sortable="custom"
            show-overflow-tooltip
            width="125"
          >
            <template slot-scope="scope"
              >{{ scope.row.data.createTime | formatDate('YYYY-MM-DD') }}
            </template>
          </el-table-column>
        </tree-table>
      </div>
      <div
        ref="tableGanttRight"
        slot="right"
        :class="{
          'table-gantt-box-right-empty': ganttProps.tasks.length === 0,
        }"
        class="table-gantt-right"
      >
        <Gantt
          v-show="ganttVisable && ganttProps.tasks.length > 0"
          v-bind="ganttProps"
        ></Gantt>
        <div
          v-if="ganttProps.tasks.length === 0"
          class="table-gantt-box-right-empty-text"
        >
          {{ $t('暂无数据') }}
        </div>
      </div>
    </two-block-width-changer>
    <GlobalSelect v-bind="GlobalSelectProps"></GlobalSelect>
    <!-- </div> -->
  </div>
</template>
<script>
/**
 * @title table && gantt 组件
 * @desc
 * @author heyunjiang
 * @date 2019.5.7
 */
import treeTable from '@/components/tree-table/ganttTable'
import treeToArray from '@/components/tree-table/eval'
import GlobalSelect from '@/components/field-edit/GlobalSelect.vue'
import TwoBlockWidthChanger from '@/components/two-block-width-changer'
import StateFlow from '@/components/state-flow'
import GlobalUserSelect from '@/components/global-user-select/src/GlobalUserSelect'
// import GlobalInput from '../../tool/FieldEdit/GlobalInput.vue'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import Gantt from './Gantt.vue'
import dayjs from 'dayjs'

const BUGLIST = 'bugList'
const REQUIREMENT = 'requirementList'

export default {
  name: 'SprintTableGantt',
  components: {
    treeTable,
    GlobalSelect,
    // GlobalInput,
    Gantt,
    TwoBlockWidthChanger,
    StateFlow,
    GlobalUserSelect,
  },
  filters: {
    formatDate(value, format) {
      if (!value) return '--'
      return dayjs(value).format(format)
    },
  },

  mixins: [ProjectCommonMixin],
  props: {
    updateData: {
      type: Function,
    },

    treeData: {
      type: Array,
      required: true,
      desc: '树形数据源',
    },

    dateList: {
      type: Array,
      required: false,
      desc: '日期数据源，如果为甘特图展示，则需要传 dateList',
    },

    seeTaskHandle: {
      type: Function,
      required: true,
      desc: '点击某条数据查看详情，使用原有方法就行了',
    },

    sortaChangeCallBack: {
      type: Function,
      required: true,
      desc: 'table 排序',
    },

    getBaseList: {
      type: Function,
      required: true,
      desc: '更新列表数据',
    },

    showGantt: {
      type: Boolean,
      required: false,
      default: false,
      desc: '是否展示甘特图',
    },

    hasGantt: {
      type: Boolean,
      required: false,
      default: false,
      desc: '是否有甘特图功能',
    },

    userId: {
      type: [String, Number],
      desc: '处理人id号',
    },

    scrollOption: {
      type: [Object],
      desc: '内部滚动属性',
    },

    tableHeight: {
      type: [String, Number],
      // default: 'auto',
    },

    enableCollspan: {
      type: Boolean,
      required: false,
      default: false,
    },

    isShowGantt: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      ganttVisable: false,
      expandAll: true, // 是否展开所有子数据
      treeArrayData: [], // treeData 经过 treeToArray 处理后的数据
      hiddenChildKeys: [], // 已经展示的后代key
      ganttProps: {
        tasks: [],
        dateList: [],
        scrollCallback: () => {},
        hoverCallback: this.ganttHoverCallback,
        activeRow: -1,
        tableRowHeight: 0, // 左侧需求列表高度，用于甘特图确定行高度（windows和mac下左侧table行高度差一像素，不动态取会导致甘特图错位 ）
      },
      tableGanttLeftTable: null, // 左侧 table container
      tableGanttLeftTableWrapper: null, // 左侧 table body
      ganttContainer: null, // 甘特图整体容器
      ganttBox: null, // 甘特图 svg 容器
      lastScrollTime: new Date().getTime(),
      tableGanttLeftTableTrs: [],
      isScrollbarFixed: false, // 是否固定顶部滚动条 fix
      updateKey: null,
      assignUserChoice: {
        value: '',
      },
    }
  },
  computed: {
    initLeftWidth() {
      if (!this.treeData.length) {
        return { width: '100%' }
      } else {
        return !this.showGantt ? '100%' : '50%'
      }
    },
  },

  watch: {
    treeData(val) {
      // this.updateKey = new Date().getTime()
      if (!this.hasGantt || this.showGantt || !val.length) {
        return
      }
      this.ganttProps.dateList = this.getDateListForRender()
      const treeArrayData = treeToArray.apply(null, [
        this.treeData,
        this.expandAll,
      ])

      this.treeArrayData = treeArrayData
      this.generateTasks(treeArrayData)
      this.$nextTick(() => {
        this.tableGanttLeftTableTrs = Array.from(
          this.tableGanttLeftTable.querySelectorAll('tr'),
        )

        this.$refs.TwoBlockWidthChanger.refreshMiddleLineHeight()
        // this.refreshScrollBarContentWidth()
        // 设置顶部滚动条盒子宽度为具体 px 值
        // this.$refs.scrollbarbox.style.width =
        //   this.$refs.tableGanttBox.getBoundingClientRect &&
        //   this.$refs.tableGanttBox.getBoundingClientRect().width + 'px'
        this.ganttProps.tableRowHeight =
          this.$el.querySelector('.el-table__row') &&
          this.$el.querySelector('.el-table__row').clientHeight
      })
    },
    ganttVisable(val) {
      if (val) {
        const treeArrayData = treeToArray.apply(null, [
          this.treeData,
          this.expandAll,
        ])

        this.treeArrayData = treeArrayData
        this.generateTasks(treeArrayData)
        this.$nextTick(() => {
          this.tableGanttLeftTableTrs = Array.from(
            this.tableGanttLeftTable.querySelectorAll('tr'),
          )

          this.$refs.TwoBlockWidthChanger.refreshMiddleLineHeight()
          // this.refreshScrollBarContentWidth()
          // 设置顶部滚动条盒子宽度为具体 px 值
          // this.$refs.scrollbarbox.style.width =
          //   this.$refs.tableGanttBox.getBoundingClientRect &&
          //   this.$refs.tableGanttBox.getBoundingClientRect().width + 'px'
          this.ganttProps.tableRowHeight =
            this.$el.querySelector('.el-table__row') &&
            this.$el.querySelector('.el-table__row').clientHeight
          const rightGanttDom = this.$refs.tableGanttRight.childNodes[0]
            .children[0]
          const leftTableDom = this.$refs.tableGanttLeft.childNodes[0]
            .childNodes[2]
          rightGanttDom.scrollTop = leftTableDom.scrollTop
          this.initTableScroll()
        })
      }
    },
  },

  mounted() {
    this.init()
  },
  destroyed() {
    this.uninit()
  },
  methods: {
    changeExpand(value) {
      this.expandAll = value
    },
    onRightVisableChange(visable) {
      this.ganttVisable = visable
    },
    // 初始化左右列表联动滚动事件
    initTableScroll() {
      const rightGanttDom = this.$refs.tableGanttRight.childNodes[0].children[0]
      const leftTableDom = this.$refs.tableGanttLeft.childNodes[0].childNodes[2]
      const rightScrollEvent = () => {
        leftTableDom.scrollTop = rightGanttDom.scrollTop
      }
      const leftScrollEvent = () => {
        rightGanttDom.scrollTop = leftTableDom.scrollTop
      }
      // 鼠标移入区域绑定滚动事件 解决无限循环滚动
      rightGanttDom.addEventListener('mouseenter', () => {
        rightGanttDom.addEventListener('scroll', rightScrollEvent)
        leftTableDom.removeEventListener('scroll', leftScrollEvent)
      })
      leftTableDom.addEventListener('mouseenter', () => {
        leftTableDom.addEventListener('scroll', leftScrollEvent)
        rightGanttDom.removeEventListener('scroll', rightScrollEvent)
      })
    },
    handleTableStatusClick(info, e, workItemId) {
      if (info.workItemType === 3) {
        // this.showActiveStatus(e, info);
        this.$emit('bugStatusChange', { e, info })
      } else {
        // this.GlobalSelectTargetClick(info, e, 'statusId', this.getBaseList)
        this.$emit('taskRequireSuccess', { e, info, workItemId })
      }
    },
    getDateListForRender() {
      const MIN_GANTT_COLS = 50
      const { dateList } = this
      if (dateList.length >= MIN_GANTT_COLS) {
        return dateList
      }
      const sourceLen = dateList.length
      const sourceEndPoint = dateList[sourceLen - 1]
      let currentAddDate = sourceEndPoint
        ? new Date(sourceEndPoint.date)
        : new Date()
      dateList.length === 0 &&
        currentAddDate.setDate(currentAddDate.getDate() + 1)
      let needToAddCount = MIN_GANTT_COLS - sourceLen
      const getDayPoint = date => {
        const dateStr = date
          .toISOString()
          .replace(/(\d{4}-\d{2}-\d{2}).*/, '$1')
        const weekDay = date.getDay()
        const week = weekDay === 0 ? 7 : weekDay
        const workday = week !== 6 && week !== 7
        return {
          date: dateStr,
          week,
          workday,
        }
      }
      while (needToAddCount > 0) {
        dateList.push(getDayPoint(currentAddDate))
        currentAddDate.setDate(currentAddDate.getDate() + 1)
        needToAddCount--
      }
      return dateList
    },
    uninit() {
      window.removeEventListener('scroll', this.scrollHandle)
    },
    // 初始化
    init() {
      if (this.showGantt) {
        return
      }
      this.uninit()
      this.tableGanttLeftTableWrapper = this.$refs.tableGanttLeft.querySelector(
        '.el-table__body-wrapper',
      )

      const tableGanttLeftTable = this.$refs.tableGanttLeft.querySelector(
        '.el-table__body',
      )

      this.ganttContainer = this.$refs.tableGanttRight.querySelector(
        '.gantt-container',
      )

      this.ganttBox = this.$refs.tableGanttRight.querySelector('.gantt')
      this.tableGanttLeftTable = tableGanttLeftTable
      // 初始化鼠标滚动事件
      // tableGanttLeftTable.removeEventListener('wheel', this.ganttTableScrollEvent)
      // tableGanttLeftTable.addEventListener('wheel', this.ganttTableScrollEvent)
      // 初始化中间栏拖拽事件
      // this.$nextTick(this.initMiddleLineProxyEvent)
      // window.addEventListener('resize', this.initMiddleLineProxyEvent)
      // 初始化鼠标悬浮事件
      tableGanttLeftTable.removeEventListener(
        'mouseover',
        this.tableHoverEventHandle,
      )

      tableGanttLeftTable.addEventListener(
        'mouseover',
        this.tableHoverEventHandle,
      )

      // 初始化鼠标移出事件
      tableGanttLeftTable.removeEventListener(
        'mouseout',
        this.tableMouseoutEventHandle,
      )

      tableGanttLeftTable.addEventListener(
        'mouseout',
        this.tableMouseoutEventHandle,
      )

      // 初始化顶部滚动条滚动事件
      // this.$refs.scrollbarleft.removeEventListener(
      //   'scroll',
      //   this.scrollbarleftScrollEvent,
      // )
      //
      // this.$refs.scrollbarleft.addEventListener(
      //   'scroll',
      //   this.scrollbarleftScrollEvent,
      // )
      //
      // this.$refs.scrollbarright.removeEventListener(
      //   'scroll',
      //   this.scrollbarrightScrollEvent,
      // )
      //
      // this.$refs.scrollbarright.addEventListener(
      //   'scroll',
      //   this.scrollbarrightScrollEvent,
      // )

      // window 滚动设置顶部滚动条固定
      // window.addEventListener('scroll', this.scrollHandle);
      this.$parent.$parent.$parent.$refs?.tableGanttBody?.addEventListener(
        'scroll',
        this.scrollHandle,
      )
    },
    // 封装 this.ganttProps.tasks
    generateTasks(tableData) {
      if (!tableData.length) {
        this.ganttProps.tasks = []
      }
      this.ganttProps.tasks = tableData.map(item => {
        // 是否是需求
        let isRequirement =
          item.data.workItemType && item.data.workItemType === 1 ? true : false
        let { start, end } = this.compareStarAndEndTime(
          item.data.startTime,
          item.data.endTime,
        )

        // 如果是需求则需要计算起止时间
        let cbj = {}
        if (isRequirement) {
          // cbj = this.getStartAndEndForRequirement(item)
          // 如果是需求，则增加绘制一条实际开始结束时间
          cbj.realStart = item.data.taskStartTime || null
          cbj.realEnd = item.data.taskEndTime || null
        }
        let obj = {
          id: item.data.key + '',
          name: item.data.display.assignUser,
          start,
          end,
          barLength: item.data.barLength,
          startPosition: item.data.startPosition,
          progress: 100,
          custom_class: 'bar-milestone', // optional
          ...cbj,
          isDelay: item.data.display && item.data.display.delayed,
          isParent: isRequirement, // 是否是需求，放在最后面，是避免被 cbj 中的 isRequirement 冲销掉了
        }
        if (item.parent) {
          obj.dependencies = item.parent.data.key + ''
        }
        return obj
      })
      this.$emit('ganttDataIsNull', this.ganttProps.tasks)
    },
    // 全局更新标题 - add by heyunjiang on 2019.5.7
    updateGlobalTitle(info, value) {
      let originInfo = {}
      if (info.data) {
        originInfo = { ...info.data }
      } else {
        let workItemType = 1
        switch (this.$route.name) {
          case REQUIREMENT:
            workItemType = info.workItemType || 1
            break
          case BUGLIST:
            workItemType = info.workItemType || 3
            break
        }

        originInfo = { ...info, workItemType }
      }
      let cb = this.getBaseList,
        updatefunc = this.GlobalRequirementUpdate
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
        projectId: originInfo.projectId || this.$getUrlParams().projectId,
        cb,
      })
    },
    // 全局更新时间 input - 迭代 - add by heyunjiang on 2019.5.7
    GlobalInputTimeUpdate(info, value, key, cb) {
      let func = this.GlobalRequirementUpdate
      switch (+info.workItemType) {
        case 1:
          func = this.GlobalRequirementUpdate
          break
        case 2:
          func = this.GlobalTaskUpdate
          break
        case 3:
          func = this.GlobalBugUpdate
          break
      }

      func({
        [key]: value,
        id: info.id,
        projectId: info.projectId,
        cb,
      })
    },
    // [已废弃] -  获取需求及对应后代的所有时间
    getChildsTime(item) {
      let times = []
      let obj = this.compareStarAndEndTime(
        item.data.startTime,
        item.data.endTime,
      )

      // 如果是有效时间
      if (obj.start) {
        times = [...times, obj.start, obj.end]
      }
      // 如果是有后代
      if (
        item.children &&
        Array.isArray(item.children) &&
        item.children.length > 0
      ) {
        item.children.forEach(jtem => {
          times = [...times, ...this.getChildsTime(jtem)]
        })
      }
      return times
    },
    // 获取需求及对应后代的key
    getChildskey(item) {
      let keys = []
      keys.push(item?.data?.key + '')
      // 如果是有后代
      if (
        item.children &&
        Array.isArray(item.children) &&
        item.children.length > 0
      ) {
        item.children.forEach(jtem => {
          keys = [...keys, ...this.getChildskey(jtem)]
        })
      }
      return keys
    },
    // 比较起止时间问题
    compareStarAndEndTime(start, end) {
      let obj = {}
      if (new Date(start) > new Date(end)) {
        obj = {
          start: null,
          end: null,
        }
      } else {
        obj = {
          start,
          end,
        }
      }
      // if(new Date() > new Date(end)) {
      //   obj.isDelay = true;
      // } else {
      //   obj.isDelay = false;
      // }
      return obj
    },
    // [已废弃] - 左侧 table 滚动监听事件
    ganttTableScrollEvent() {
      if (
        Math.abs(
          this.ganttContainer.scrollTop - this.tableGanttLeftTable.scrollTop,
        ) > 10
      ) {
        this.ganttContainer.scrollTop = this.tableGanttLeftTable.scrollTop
      }
    },
    // [已废弃] - 甘特图滚动监听事件
    scrollCallback(top) {
      if (!this.tableGanttLeftTable) {
        return
      }
      if (Math.abs(top - this.tableGanttLeftTable.scrollTop) > 10) {
        this.tableGanttLeftTable.scrollTop = top
      }
    },
    // 收缩回调事件
    expandChangeCallBack(key, expanded) {
      const needShowTableDataSource = this.treeArrayData.filter(
        item => item.data.key + '' === key,
      )

      let childsKeys = this.getChildskey(needShowTableDataSource[0]).filter(
        item => item !== key,
      )

      if (!expanded) {
        childsKeys = [...new Set([...this.hiddenChildKeys, ...childsKeys])]
      } else {
        childsKeys = this.hiddenChildKeys.filter(
          item => !childsKeys.includes(item),
        )
      }
      this.hiddenChildKeys = childsKeys
      this.generateTasks(
        this.treeArrayData.filter(
          item => !childsKeys.includes(item.data.key + ''),
        ),
      )
    },
    // 鼠标悬浮 - table 事件
    tableHoverEventHandle(e) {
      let num = null
      for (let i = 0; i < this.tableGanttLeftTableTrs.length; i++) {
        if (this.tableGanttLeftTableTrs[i].contains(e.target)) {
          num = i
          break
        }
      }
      if (/\D/.test(num)) {
        return
      }
      this.table_row_active_set(num)
      this.ganttProps.activeRow = num
    },
    // 鼠标悬浮 - table 移出事件
    tableMouseoutEventHandle() {
      this.table_row_active_set(this.tableGanttLeftTableTrs.length)
      this.ganttProps.activeRow = this.tableGanttLeftTableTrs.length
    },
    // 鼠标悬浮 - table 选中行设置，允许传入一个大的 num 用于移除所有行的 el-table-active
    table_row_active_set(num) {
      if (/\D/.test(num)) {
        return
      }
      this.tableGanttLeftTableTrs.forEach((item, index) => {
        const className = item.getAttribute('class')
        if (className.indexOf('el-table-active') > -1 && num !== index) {
          item.setAttribute('class', className.replace(' el-table-active', ''))
        }
        if (index === num) {
          if (className.indexOf('el-table-active') > -1) {
            return
          }
          item.setAttribute('class', `${className} el-table-active`)
        }
      })
    },
    // 鼠标悬浮 - 甘特图
    ganttHoverCallback(num) {
      this.table_row_active_set(num)
    },
    // 顶部滚动条 - 计算滚动条内容宽度
    // refreshScrollBarContentWidth() {
    //   // this.$refs.scrollbarleftcontent.style.width =
    //   //   this.tableGanttLeftTable.getBoundingClientRect().width + 'px'
    //   this.$refs.scrollbarrightcontent.style.width =
    //     this.$refs.tableGanttRight
    //       .querySelector('.gantt')
    //       .getBoundingClientRect().width + 'px'
    // },
    // 顶部滚动条 - 计算滚动条宽度
    refreshScrollBarWidth(width) {
      console.log(width)
      //   this.$refs.scrollbarleft.style.width = width
      //   this.$refs.scrollbarright.style.width = 'calc(100% - ' + width + ')'
    },
    // 顶部滚动条 - 左侧滚动事件
    // scrollbarleftScrollEvent() {
    //   this.tableGanttLeftTableWrapper.scrollLeft = this.$refs.scrollbarleft.scrollLeft
    // },
    // 顶部滚动条 - 右侧滚动事件
    // scrollbarrightScrollEvent() {
    //   this.$refs.tableGanttRight.querySelector(
    //     '.gantt-container',
    //   ).scrollLeft = this.$refs.scrollbarright.scrollLeft
    // },
    // 顶部滚动条 - 固定
    scrollHandle() {
      const sourceElement = this.$refs.tableGanttLeft
      if (sourceElement.getBoundingClientRect().top <= 14) {
        this.isScrollbarFixed = true
      } else {
        this.isScrollbarFixed = false
      }
    },
    // 控制显示用户选择
    handleAssignUserChoice(data) {
      this.$set(data, '_isAssignUserChoice', 1)
    },
    // 选择用户数据改变
    selectUserChange(val, item) {
      let cb = this.getBaseList
      const updatefuncMap = {
        1: this.GlobalRequirementUpdate,
        2: this.GlobalTaskUpdate,
        3: this.GlobalBugUpdate,
      }

      updatefuncMap[item.workItemType]({
        id: item.id,
        projectId: item.projectId || this.$getUrlParams().projectId,
        assignUser: val.userId,
        clearFields: [],
        cb,
      })
    },
    // 选择用户失去焦点时触发事件
    selectUserVisibleChange(val, item) {
      !val && (item._isAssignUserChoice = 0)
    },
    // 获取当前高亮行
    getCurrentRow(items, currentId) {
      return items.find(item => {
        const flag = item.data.id == currentId
        if (flag) {
          return item
        }
        return item.children && this.getCurrentRow(item.children, currentId)
      })
    },
    // 高亮当前选择行
    localSetCurrentRow(currentId) {
      const currentItem = this.getCurrentRow(this.treeData, currentId)
      if (currentItem) {
        this.$nextTick(() => {
          this.$refs.treeTable.$refs.multipleTable?.setCurrentRow(currentItem)
        })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.select-user {
  display: inline-block;
  padding: 1px 3px;
  border: 1px solid transparent;
  cursor: pointer;

  &:hover {
    border: 1px solid #eee;
  }

  &:focus {
    outline: unset;
  }
}

.bug-table {
  height: 630px;
  /deep/ .el-table__body-wrapper {
    max-height: 605px !important;
    overflow-y: auto;
  }
}

.sprint-table-gantt-scroll {
  overflow-y: auto;
}
.table-gantt {
  height: 630px;
}
// 滚动条样式
.scrollbar-box {
  position: relative;
  display: inline-block;
  width: 100%;
  z-index: 2;
  .scrollbar-item {
    float: left;
    height: 10px;
    width: 50%;
    overflow-x: auto;
    overflow-y: hidden;
    .scrollbar-content {
      background: transparent;
      height: 1px;
    }
  }
}
// 甘特图左侧 table 样式
.table-gantt-box {
  width: 100%;
  overflow: hidden;
  position: relative;
  font-size: 0;
  height: 100%;
  .table-gantt-box-right-empty {
    border: 1px solid #eef0f6;
    position: relative;
    height: 126px;
    .table-gantt-box-right-empty-text {
      position: absolute;
      top: 0;
      text-align: center;
      color: #c9cace;
      height: 126px;
      line-height: 126px;
      width: 100%;
      font-size: 14px;
    }
  }
}
.fixed-top {
  position: fixed;
  top: 0;
}
.table-gantt-left {
  height: 100%;
}
.table-gantt-right {
  height: 100%;
}
</style>
<style lang="scss">
// 去掉自带的滚动条
#table-gantt {
  .is-scrolling-left,
  .gantt-container,
  .el-table__body-wrapper {
    overflow: hidden;
  }
}
#app .el-table__body-wrapper::-webkit-scrollbar-thumb {
  border-radius: 0;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.1);
}
#table-gantt .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
#table-gantt .el-table__body-wrapper::-webkit-scrollbar-track {
  background: #eee;
}
.status_name {
  display: inline-block;
  vertical-align: middle;
  border-radius: 4px;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  box-sizing: border-box;
  color: #fff;
}
</style>
