<template>
  <div id="solo-milepost-wrap" class="milepost-wrap public-wrap">
    <div class="overview-header">
      <div class="title">{{ $t('项目里程碑') }}</div>
      <div v-if="createPowerINfoManage">
        <i
          class="iconfont icon-tianjiakapian overview-icon"
          @click="createMilepost"
        ></i>
      </div>
    </div>
    <div
      v-loading="loading"
      class="milepost-container public-wrap"
      :class="{ 'no-milepost-list': !milepostList.length }"
    >
      <ul class="milepost-list">
        <li v-if="milepostList.length" class="start">
          <div class="node"></div>
        </li>
        <li v-else>
          {{ $t('暂无项目里程碑') }}，{{ $t('快来维护项目里程碑吧') }}
        </li>
        <li
          v-for="(item, index) in milepostList"
          :key="item.endTimePlan"
          :class="milestoneItemClass(item, index, milepostList.length)"
        >
          <!-- 不在已存在的日期上，显示出来 -->
          <div v-if="item.isToday" class="today">
            <div class="today_title">{{ $t('今天') }}</div>
            <div class="today_line"></div>
            <div v-if="!item.list" class="node"></div>
          </div>
          <div class="line">
            <i class="node" />
          </div>
          <div class="content-wrapper">
            <time>{{ item.endTimePlan }}</time>
            <template v-if="item.list">
              <div v-for="row in item.list" :key="row.id" class="title-box">
                <!-- <div class="title-box">
                    <co-tooltip
                      v-if="row.delay"
                      class="item"
                      effect="dark"
                      :content="$t('已过期')"
                      placement="top"
                    >
                      <div class="warning">
                        <i class="el-icon-warning"></i>
                      </div>
                    </co-tooltip>
                  </div> -->
                <!-- <div class="small-circle-box">
                  </div> -->
                <div class="small-circle"></div>

                <div class="popover-box">
                  <milepost-popover
                    :popover-data="row"
                    @deleteMilepost="deleteMilepost"
                  >
                    <div class="subject" @click="milepostClickHandle(row)">
                      {{ row.title }}
                    </div>
                  </milepost-popover>
                </div>
              </div>
            </template>
          </div>
          <!-- 一天只有一个里程碑 -->
          <!-- <template v-else>
              <milepost-popover
                :popover-data="item.list[0]"
                @deleteMilepost="deleteMilepost"
              >
                <span
                  class="line"
                  :class="statusClassEnum[item.list[0].status]"
                  @click="milepostClickHandle(item.list[0])"
                >
                  <span
                    class="diamond cursor-pointer"
                    :style="{ background: item.list[0].background }"
                  ></span>
                  <i
                    v-if="item.list[0].status === 2"
                    class="el-icon-check fa-check"
                  ></i>
                </span>
              </milepost-popover>
              <milepost-popover
                :popover-data="item.list[0]"
                @deleteMilepost="deleteMilepost"
              >
                <time
                  class="cursor-pointer"
                  :class="{ bad: item.list[0].delay }"
                  @click="milepostClickHandle(item.list[0])"
                  >{{ item.endTimePlan }}</time
                >
              </milepost-popover>
              <div class="title-box one-title">
                <co-tooltip
                  v-if="item.list[0].delay"
                  class="item"
                  effect="dark"
                  :content="$t('已过期')"
                  placement="top"
                >
                  <div class="warning">
                    <i class="el-icon-warning"></i>
                  </div>
                </co-tooltip>
                <div v-else class="small-circle-box">
                  <span class="small-circle"></span>
                </div>
                <div style="flex:1;">
                  <milepost-popover
                    :popover-data="item.list[0]"
                    @deleteMilepost="deleteMilepost"
                  >
                    <em
                      class="subject"
                      @click="milepostClickHandle(item.list[0])"
                      >{{ item.list[0].title }}</em
                    >
                  </milepost-popover>
                </div>
              </div>
            </template> -->
        </li>
      </ul>
      <milepost-dialog
        v-if="milepostVisible"
        :milepost-visible="milepostVisible"
        :type="milepostType"
        :milepost-detail-info="milepostDetailInfo"
        @beforeClose="beforeClose"
      ></milepost-dialog>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 里程碑
 * @desc
 * @author wangling
 * @date 2020/04/08
 */

import MilepostDialog from './MilepostDialog'
import MilepostPopover from './MilepostPopover'

export default {
  name: 'Milepost',
  components: {
    MilepostDialog,
    MilepostPopover,
  },

  mixins: [],
  props: {},
  data() {
    return {
      projectId: this.$getUrlParams().projectId,
      milepostVisible: false, //里程碑dialog 开启/关闭 状态
      milepostType: 'create', //里程碑dialog 类型
      statusClassEnum: {
        //节点状态样式,过期类名为bad
        1: 'todo',
        2: 'good',
        3: 'canceled',
      },

      milepostDetailInfo: {}, //里程碑详细信息 点击时传到弹窗里
    }
  },
  computed: {
    loading() {
      return this.$store.state.projectOverviewMilepost.loading
    },
    milepostList() {
      return this.$store.state.projectOverviewMilepost.milepostList
    },
    createPowerINfoManage() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_OVERVIEW_CREATE_MILESTONE',
        3,
        this.projectId,
      )
    },
    editPowerINfoManage() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_OVERVIEW_UPDATE_MILESTONE',
        3,
        this.projectId,
      )
    },
    selectedWorkItemType() {
      return this.$store.state.projectOverviewDynamic.projectDynamicInfo
        .workItemType
    },
  },

  watch: {},
  created() {
    this.$store.dispatch('getMilepostList', { projectId: this.projectId })
  },
  mounted() {},
  methods: {
    // 一天多个节点时，一个节点为延期状态就显示延期的类型
    isAddDelayClass(list) {
      return list.find(item => item.delay)
    },
    milestoneItemClass({ list, isToday }, index, len) {
      let cls = ''
      // 正常里程碑
      if (list) {
        cls = 'milepost-item'
      }
      // 今天 分割线
      if (isToday && !list) {
        cls += index + 1 === len ? ' milepost-item today-end' : ' today-middle'
      }
      // 延期
      if (list && list.find(item => item.delay)) {
        cls += ' delay'
      }

      // 待处理
      if (list && list.find(item => +item.status === 1)) {
        return cls + ' wait'
      }

      // 已完成
      if (list && list.find(item => +item.status === 2)) {
        return cls
      }

      // 已取消
      return cls + ' cancel'
    },
    // 删除里程碑请求
    async requestDeleteMilepost(id) {
      await this.$store.dispatch('deleteMilepost', {
        id: id,
        projectId: this.projectId,
      })

      // 项目动态随之更新
      this.$store.dispatch('getProjectDynamic', {
        projectId: this.projectId,
        workItemType: this.selectedWorkItemType,
        isQuery: true,
      })
    },
    //点击删除按钮  删除里程碑
    deleteMilepost(deleteId) {
      this.$confirm(i18n.t('是否要删除该里程碑？'), i18n.t('提示'), {
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      })
        .then(() => {
          this.requestDeleteMilepost(deleteId)
        })
        .catch(() => {})
    },
    // 点击操作  打开弹窗查看或编辑里程碑
    milepostClickHandle(row) {
      // 有权限到 编辑 没有权限到查看里程碑弹窗
      const milepostPower = this.editPowerINfoManage
      this.milepostType = milepostPower ? 'edit' : 'detail'
      this.milepostDetailInfo = {
        ...row,
        displayUserName: `${row.assignUserName}(${row.assignUser})`,
      }

      this.milepostVisible = true
    },
    // 创建里程碑
    createMilepost() {
      this.milepostType = 'create'
      this.milepostDetailInfo = {}
      this.milepostVisible = true
    },
    // dialog 关闭之前回调
    beforeClose() {
      this.closeDialog()
    },
    // 关闭dialog
    closeDialog() {
      this.milepostVisible = false
    },
  },
}
</script>
<style lang="scss" scoped>
.milepost-container {
  padding: 52px 0 16px;
  width: 100%;
  height: 120px;
  overflow: auto;

  // 暂无里程碑
  &.no-milepost-list {
    display: flex;
    justify-content: center;
    align-items: center;
    color: $--color-text-secondary;
  }

  .milepost-list {
    position: relative;
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;

    // 节点样式
    .node {
      display: inline-block;
      position: absolute;
      z-index: 1;
      top: -3px;
      right: -5px;
      width: 6px;
      height: 6px;
      padding: 2px;
      border-radius: 50%;
      background-color: #fff;

      &::after {
        content: '';
        display: block;
        width: 6px;
        height: 6px;
        background-color: $--color-primary;
        border-radius: 50%;
      }
    }

    .milepost-item {
      position: relative;
      width: 160px;
      flex-shrink: 0;

      .line {
        width: 100%;
        height: 4px;
        background-color: $--color-primary;
      }

      // 待处理
      &.wait {
        .line {
          background-color: #e5e5e5;
        }

        .node::after {
          background-color: #007aff;
        }
      }

      // 已取消
      &.cancel {
        .line {
          background-color: #e5e5e5;
        }

        .node::after {
          background-color: #e5e5e5;
        }
      }

      // 延期
      &.delay {
        .node::after {
          background-color: #ea3447;
        }

        time {
          height: 20px;
          line-height: 20px;
          padding: 0 12px;
          background: #f05462;
          color: #ea3447;
          background: rgba(234, 52, 71, 0.2);
          border-radius: 4px;
          display: inline-block;
        }
      }

      .content-wrapper {
        // 防止字被挡住
        position: relative;
        z-index: 3;
        margin-top: 14px;
        transform: translateX(50%);
        text-align: center;

        .title-box {
          display: flex;
          margin-top: 8px;
          padding: 0 12px;
          box-sizing: border-box;
          // justify-content: center;
          align-items: center;
          cursor: pointer;

          .small-circle {
            width: 4px;
            height: 4px;
            margin-right: 6px;
            border-radius: 50%;
            background-color: $--color-text-secondary;
          }

          .subject {
            font-size: 12px;
          }
        }

        .popover-box {
          text-align: left;
        }
      }
    }

    .today {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: absolute;
      top: 0;
      right: 0;
      z-index: 2;
      transform: translate3d(50%, -100%, 0);

      .today_title {
        padding: 0 6px;
        line-height: 24px;
        font-size: 12px;
        border-radius: 4px;
        color: #fff;
        word-break: keep-all;
        background-color: $--color-primary;
      }

      .today_line {
        height: 26px;
        width: 2px;
        background-color: $--color-primary;
      }

      .node {
        width: 4px;
        height: 4px;
        top: auto;
        bottom: -2px;
        right: 50%;
        margin: -4px;
        background-color: $--color-primary;

        &::after {
          width: 4px;
          height: 4px;
          background-color: #fff;
        }
      }
    }

    // 今日在中间，不显示线
    .today-middle {
      position: relative;
      width: 0;
      .line,
      .content-wrapper {
        display: none;
      }

      .today {
        left: 80px;

        .node {
          top: auto;
          right: 0;
        }
      }
    }

    .start {
      position: relative;
      left: 4px;
    }
  }
}
</style>
<style lang="scss" scoped>
// ::before,
// ::after {
//   box-sizing: border-box;
// }
// // 没有里程碑时，显示的样式
// .no-milepost-list {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   color: #666;
// }
// #solo-milepost-wrap .milepost-container {
//   width: 100%;
//   min-height: 150px;
//   max-height: 350px;
//   overflow: auto;
// }
// .milepost-container {
//   width: 100%;
//   overflow-y: auto;
//   padding: 36px 0 16px;
//   box-sizing: border-box;

//   .milepost-list {
//     margin: 0;
//     padding: 0;
//     display: flex;

//     li {
//       position: relative;

//       // 节点样式
//       .circle {
//         display: inline-block;
//         position: absolute;
//         left: 13px;
//         width: 6px;
//         height: 6px;
//         padding: 2px;
//         border-radius: 50%;
//         background-color: #fff;

//         &::after {
//           content: '';
//           display: block;
//           width: 6px;
//           height: 6px;
//           background-color: #e5e5e5;
//           border-radius: 50%;
//         }
//       }
//     }

//     li.start {
//       .circle {
//         width: 20px;
//         height: 20px;
//         background: #1b9aee;
//         border-radius: 50%;
//       }
//     }
//     .today::after {
//       content: '';
//       display: block;
//       width: 2px;
//       height: 30px;
//       background: #1b9aee;
//       position: absolute;
//       top: -6px;
//       left: 50%;
//       transform: translateX(-50%);
//     }
//     .today {
//       width: 60px;
//       position: relative;
//       text-align: center;
//       flex-shrink: 0;
//       .today_line {
//         height: 3px;
//         background: #ddd;
//         position: relative;
//         line-height: 3px;
//         margin: 10px 0 15px;
//         display: block;
//       }
//       .today_title {
//         display: inline-block;
//         padding: 2px;
//         font-size: 12px;
//         border-radius: 5px;
//         background: #1b9aee;
//         color: #fff;
//         position: absolute;
//         top: -30px;
//         left: 50%;
//         transform: translateX(-50%);
//         white-space: nowrap;
//       }
//       .today_title::after {
//         content: '';
//         display: inline-block;
//         width: 0;
//         height: 0;
//         border: 5px solid transparent;
//         border-left-color: transparent;
//         border-right-color: transparent;
//         border-top-color: #1b9aee;
//         position: absolute;
//         left: 50%;
//         transform: translateX(-50%);
//         bottom: -10px;
//       }
//     }
//     li.milepost-item {
//       position: relative;
//       width: 140px;
//       text-align: center;
//       flex-shrink: 0;
//       word-break: break-all;
//       .title-box {
//         display: flex;
//         margin-top: 2px;
//         padding: 0 5px;
//         .subject {
//           text-align: left;
//           margin-left: 2px;
//         }
//       }
//       .title-box.multiple-title {
//         text-align: left;
//         .subject {
//           flex: 1;
//         }
//         .warning {
//           width: 16px;
//         }
//       }
//       time {
//         padding: 2px 5px;
//       }
//       em,
//       time {
//         display: block;
//         font-size: 13px;
//         font-style: normal;
//       }
//       .line {
//         display: block;
//         height: 3px;
//         background: #ddd;
//         position: relative;
//         line-height: 3px;
//         margin: 10px 0 15px 0;
//         z-index: 2;
//       }
//       .line.multiple::before,
//       .line.multiple::after,
//       .diamond {
//         display: inline-block;
//         width: 12px;
//         height: 12px;
//         margin-top: -5px;
//         content: '';
//         transform: rotate(-45deg);
//       }
//       .line.multiple::before,
//       .line.multiple::after {
//         border: 1px solid #999;
//         background: #fff;
//       }
//       .line.multiple::after {
//         margin-left: -8px;
//       }
//       .line.good .fa-check {
//         position: absolute;
//         left: 50%;
//         margin-left: -6px;
//         top: -5px;
//         color: #fff;
//         z-index: 10;
//         font-size: 13px;
//       }

//       .subject.bad,
//       time.bad {
//         color: #fff;
//         background: #f05462;
//         border-radius: 5px;
//         display: inline-block;
//       }
//       .subject:hover {
//         cursor: pointer;
//       }
//     }
//   }
//   ul {
//     margin: 0;
//     padding: 0;
//   }
//   li {
//     list-style: none;
//   }
//   .popover-box {
//     flex: 1;
//   }
//   .small-circle-box {
//     width: 16px;
//     display: flex;
//     justify-content: center;
//   }
//   .small-circle {
//     width: 4px;
//     height: 4px;
//     border-radius: 50%;
//     background: #606266;
//     margin: 8px 0 0 0;
//   }
// }
</style>
