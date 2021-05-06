<template>
  <base-card shadow="never" class="viewRecords">
    <template slot="header">
      <div class="header-left">
        <div class="header-title">
          {{ $t('我的项目') }}
        </div>
      </div>
      <div class="header-right">
        <el-button
          type="text"
          class="more"
          @click.stop="openApp({ path: '/project/list' })"
          >{{ viewRecordsList.length ? $t('更多') : $t('去创建') }}
          <i class="co-icon-arrow-right"
        /></el-button>
      </div>
    </template>
    <template slot="content">
      <div class="viewRecords-content">
        <template v-if="viewRecordsList.length"
          ><viewRecordsItem
            v-for="item in viewRecordsList"
            :key="item.id"
            :item-info="item"
            @openApp="openApp"
          />
        </template>
        <div v-else-if="!viewRecordsList.length && init" class="empty">
          {{ $t('暂无项目') }}
        </div>
      </div>
    </template>
  </base-card>
</template>

<script>
import viewRecordsItem from './viewRecordsItem'
import BaseCard from '../components/BaseCard'
import WorkbenchWorker from '../workbench.v1.worker'
import { getViewRecords } from '@/api/workbench'
import { parseResponse } from '@/utils/http'
import { getRealUrl, getRouterUrl } from '@/utils/sub-app-util'
import localstorageUtil from '@/utils/localstorage'

export default {
  components: {
    viewRecordsItem,
    BaseCard,
  },
  data() {
    return {
      getViewRecordsApi: getRealUrl(getViewRecords.url, { ssoToken: true }),
      viewRecordsList: localstorageUtil.getItem('viewRecords') || [],
      worker: null,
      init: false,
    }
  },
  created() {
    this.worker = new WorkbenchWorker()
    this.worker.onmessage = e => {
      const { event, res = {} } = e.data

      if (event !== 'viewRecord') {
        return
      }

      parseResponse(
        { data: res },
        function() {},
        function() {},
      )

      if (res.status === 200 && res.data) {
        this.viewRecordsList = res.data
        localstorageUtil.setItem('viewRecords', res.data)
        this.init = true
      }
    }
    this.worker.postMessage({
      type: 'http',
      event: 'viewRecord',
      props: {
        url: this.getViewRecordsApi,
        method: 'get',
        payload: { number: 4 },
      },
    })
    this.$once('hook:beforeDestroy', () => {
      // 清除worker线程
      this.worker && this.worker.terminate()
    })
  },
  methods: {
    openApp(params) {
      const { path, query = {} } = params
      const url = getRouterUrl(path)
      this.$router.push({ path: url, query })
    },
  },
}
</script>

<style lang="scss" scoped>
.viewRecords {
  /deep/ .el-card__body {
    overflow-x: auto;
    &::-webkit-scrollbar {
      width: 5px !important;
      height: 5px !important;
    }
  }
  /deep/ .base-card-container__header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
      font-size: 16px;
      color: #333;
    }
    .more {
      font-size: 14px;
      color: $--color-text-regular;
      line-height: 20px;
      cursor: pointer;
      .co-icon-arrow-right {
        margin-left: 2px;
        color: #999;
      }

      :hover {
        color: $--color-primary;

        i {
          color: currentColor;
        }
      }
    }
  }
  &-content {
    display: flex;
    align-items: center;
    padding: 6px 0;
    .viewRecordsItem {
      flex: 0 0 207px;
      margin: 0 8px;

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .empty {
    display: flex;
    align-items: center;
    min-height: 50px;
    margin: auto;
    font-size: 14px;
    color: $--color-text-secondary;
  }
}
</style>
