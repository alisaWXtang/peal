<template>
  <div>
    <div class="time-box">
      <div
        v-for="(item, index) in operationLogDataList"
        :key="item.id"
        class="time-item"
        :class="{ 'after-time-line': index < operationLogDataList.length - 1 }"
      >
        <span v-if="item.changeType == 200">
          <div class="time-item-time">{{ item.changeTime }}</div>
          <span class="time-item-light">{{ item.opUserName }}</span
          >{{ $t('把')
          }}<span class="time-item-light">{{ item.changeField }}</span
          >{{ $t('从')
          }}<span class="time-item-light">
            <span
              class="time-item-light srpint-log-underline"
              @click="viewRequireRevise(item.origValue)"
              >{{ $t('原内容') }}
            </span> </span
          >{{ $t('置为') }}
          <span class="time-item-light">
            <span
              class="time-item-light srpint-log-underline"
              @click="viewRequireRevise(item.changeValue)"
              >{{ $t('新内容') }}</span
            >
          </span>
        </span>
        <span
          v-else-if="
            item.changeType == 220 ||
              item.changeType == 225 ||
              item.changeType == 230 ||
              item.changeType == 235
          "
        >
          <div class="time-item-time">{{ item.changeTime }}</div>
          <span class="time-item-light">{{ item.opUserName }}</span
          >{{ $t('在')
          }}<span class="time-item-light">{{ item.changeField }}</span>
          <span class="time-item-light">{{ item.changeValue }}</span>
        </span>
        <span v-else>
          <div class="time-item-time">{{ item.changeTime }}</div>
          <span class="time-item-light">{{ item.opUserName }}</span
          >{{ $t('把') }}
          <span class="time-item-light">{{ item.changeField }}</span
          >{{ $t('从') }}
          <span class="time-item-light">{{ item.origValue || '--' }}</span
          >{{ $t('置为') }}
          <span class="time-item-light">{{ item.changeValue }}</span>
        </span>
      </div>
      <div class="load-more" @click="loadMore">
        {{
          operationLogPageInfo.isMore ? $t('查看更早数据') : $t('已无更多数据')
        }}
      </div>
    </div>
    <el-dialog
      :title="$t('需求内容详情')"
      :visible.sync="revisedDialogVisible"
      class=" issuedialog"
      :modal-append-to-body="false"
    >
      <div
        id="reviseDetail"
        class="form-iterm-box"
        :modal-append-to-body="false"
      ></div>
    </el-dialog>
  </div>
</template>
<script>
import { reviseDetail as reviseDetailOfRequirementService } from '@/service/requirement'
import { getList as getListOfOperationLogService } from '@/service/operation-log'
export default {
  name: 'SprintLog',
  props: {},
  data() {
    return {
      operationLogDataList: [],
      operationLogPageInfo: {
        pageNum: 0,
        pageSize: 10,
        isMore: false,
      },

      revisedDialogVisible: false,
      loadMoreCallback: this.loadMoreOperationLogDataList, // 加载更多
      sprintId: 0,
    }
  },
  mounted() {
    this.sprintId = this.$getUrlParams().sprintId
    this.loadMoreOperationLogDataList()
  },
  methods: {
    viewRequireRevise(reviseId) {
      reviseDetailOfRequirementService({ id: reviseId }).then(res => {
        if (res.status == 200) {
          this.revisedDialogVisible = true
          this.$nextTick(() => {
            let elementById = document.getElementById('reviseDetail')
            elementById.innerHTML = res.data.content
          })
        }
      })
    },
    loadMore() {
      this.operationLogPageInfo.isMore && this.loadMoreCallback()
    },
    loadMoreOperationLogDataList() {
      this.operationLogPageInfo.pageNum = this.operationLogPageInfo.pageNum + 1
      this.getOperationLogDataList()
    },
    getOperationLogDataList() {
      getListOfOperationLogService({
        workItemType: 5,
        workItemId: this.sprintId,
        pageNum: this.operationLogPageInfo.pageNum,
        pageSize: this.operationLogPageInfo.pageSize,
      }).then(res => {
        if (this.operationLogPageInfo.pageNum > 1) {
          this.operationLogDataList = [
            ...this.operationLogDataList,
            ...res.data.list,
          ]
        } else {
          this.operationLogDataList = res.data.list
        }
        this.operationLogPageInfo.pageSize = res.data.pageSize
        this.operationLogPageInfo.pageNum = res.data.pageNum
        this.operationLogPageInfo.isMore =
          res.data.total >
          this.operationLogPageInfo.pageNum * this.operationLogPageInfo.pageSize
      })
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/common';

$timeLineWidth: 40px; // 连接线宽度

.time-box {
  // padding: 10px;
  .time-item {
    padding: 10px 10px 10px 20px;
    margin-left: 130px;
    font-size: $font-size-medium;
    position: relative;
    font-family: MicrosoftYaHei;

    &:before {
      content: '';
      position: absolute;
      top: 17px;
      left: 5px;
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 3px;
      background-color: $color-gray-common;
    }

    .time-item-time {
      position: absolute;
      top: 12px;
      left: -130px;
      display: inline-block;
      width: 130px;
      text-align: left;
      font-size: $font-size-small-s;
      color: $color-background-weight-common;
    }

    .time-item-light {
      color: $color-font-active-common;
      margin: 0 12px;
      & .srpint-log-underline {
        cursor: pointer;
        border-bottom: 1px solid $color-font-active-common;
        padding-bottom: 1px;
      }
    }
  }

  .load-more {
    display: inline-block;
    margin-left: 120px;
    margin-top: 10px;
    transform: translateX(-30px);
    color: $color-gray-common;
    font-size: $font-size-medium;
    cursor: pointer;
  }
}

.after-time-line:after {
  content: '';
  position: absolute;
  top: 25px;
  left: 7px;
  width: 2px;
  height: 22px;
  background-color: $color-gray-common;
}
</style>
