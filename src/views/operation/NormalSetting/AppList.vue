<template>
  <div v-loading="loading" class="operation-product-wrap">
    <div class="operation-product-form">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item>
          <CustomInputLeft
            v-model="productName"
            :placeholder="$t('请输入产品名称搜索')"
            @search="onSearch"
          >
          </CustomInputLeft>
        </el-form-item>
      </el-form>
    </div>
    <co-row class="mb15">
      <co-col :span="24" class="co-col-table">
        <el-table
          :border="true"
          :data="productList"
          :max-height="productList.length > 0 ? tableHeight : 'auto'"
          style="width: 100%;height:100%"
        >
          <el-table-column min-width="400" prop="name" :label="$t('产品名称')">
          </el-table-column>
          <el-table-column
            min-width="300"
            :label="$t('反馈对接人')"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div class="dock-user">
                {{ scope.row.dockingUsers | filterDockingUser }}
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="200">
            <template slot="header">
              <span>{{ $t('设置') }}</span>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">
                  {{ $t('生成反馈入口链接后') }}，{{
                    $t('您可将该链接放入您产品的页面上')
                  }}，{{ $t('用户可通过该链接给您产品提交反馈') }}
                </div>
                <i class="co-icon-question copy-icon-question"></i>
              </el-tooltip>
            </template>
            <template v-if="scope.row.authToControl" slot-scope="scope">
              <span class="link-common" @click="setDockingUser(scope.row)">{{
                $t('设置对接人')
              }}</span>
              <co-divider direction="vertical" />
              <span class="link-common" @click="copeFeedbackLink(scope.row)">{{
                $t('生成反馈入口链接')
              }}</span>
            </template>
          </el-table-column>
        </el-table>
      </co-col>
    </co-row>
    <co-row>
      <co-col class="list__pagination" :span="24">
        <el-pagination
          :current-page="pageInfogation.pageNum"
          :page-sizes="pageSizeList"
          :page-size="pageInfogation.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageInfogation.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </co-col>
    </co-row>
    <co-dialog
      :title="$t('生成反馈入口链接')"
      :visible.sync="currentCopeFeedback.visible"
      width="800px"
      destroy-on-close
    >
      <div>{{ $t('反馈入口链接') }}</div>
      <div class="cope-wrap">
        <div class="cope-url">{{ currentCopeFeedback.copeLinkValue }}</div>
        <UrlCopy
          :custom-slot="true"
          :value="currentCopeFeedback.copeLinkValue"
          class="cope-link"
          >{{ $t('复制链接') }}</UrlCopy
        >
      </div>
    </co-dialog>
    <FeedbackManSetting
      :product-id="editProductId"
      :visible.sync="isFeedbackVisible"
      setting-type="inner"
      :default-interface-man-list="defaultDockingUsers"
    />
  </div>
</template>
<script>
/**
 * @title
 * @desc
 * @author heyunjiang
 * @date
 */
import CustomInputLeft from '@/components/custom-input-left'
import { operationMutationTypes } from '@/store/mutation-types'
import { operationActionTypes } from '@/store/action-types'
import UrlCopy from '@/components/url-copy'
import FeedbackManSetting from '@/components/biz/feedback-man-setting'
import { getRouterUrl } from '@/utils/sub-app-util'

export default {
  name: 'AppList',
  components: { CustomInputLeft, UrlCopy, FeedbackManSetting },
  filters: {
    // 过滤为 王玲(W9004667)这种格式
    filterDockingUser(userList) {
      return userList
        ?.map(item => `${item.userName}(${item.userId})`)
        ?.join('，')
    },
  },
  mixins: [],
  props: {},

  data() {
    return {
      visible: false, //反馈对接人链接弹窗
      productName: '',
      pageInfogation: {
        pageNum: 1,
        pageSize: 15,
        total: 0,
      },

      currentCopeFeedback: {
        visible: false, //反馈对接人链接弹窗
        copeLinkValue: '', //复制链接的链接值
      },
      pageSizeList: [15, 30, 50], // 可选的分页条数
      editProductId: '',
      isFeedbackVisible: false,
      defaultDockingUsers: [],
    }
  },
  computed: {
    productList() {
      return this.$store.state.operationProductList.productList
    },
    pageInfo() {
      return this.$store.state.operationProductList.pageInfo
    },
    loading() {
      return this.$store.state.operationProductList.loading
    },
    tableHeight() {
      return window.innerHeight - 250 + 'px'
    },
  },

  watch: {
    pageInfo(newVal) {
      this.pageInfogation = { ...newVal }
    },
  },

  mounted() {
    this.getProductList({ ...this.pageInfogation })
  },
  methods: {
    // 发送请求  产品列表
    getProductList({ pageNum, pageSize, name = this.productName } = {}) {
      const insetProductType = 0
      this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_INSIDE_PRODUCT_LIST,
        {
          payload: {
            type: insetProductType,
            pageNum: pageNum || this.pageInfo.pageNum,
            pageSize: pageSize || this.pageInfo.pageSize,
            name,
          },
        },
      )
    },
    onSearch(val) {
      this.getProductList({ name: val, pageNum: 1 })
      this.$store.commit(
        operationMutationTypes.UPDATE_OPERATION_INSIDE_PRODUCT_NAME,
        val,
      )
    },
    // 打开 设置对接人 弹窗
    setDockingUser({ id, dockingUsers }) {
      this.editProductId = id
      this.defaultDockingUsers = dockingUsers || []
      this.isFeedbackVisible = true
    },
    // 打开 复制反馈入口链接
    copeFeedbackLink(row) {
      const url = getRouterUrl(
        `/operation/feedback/inner?productId=${row.id}`,
        true,
      )
      this.currentCopeFeedback.visible = true
      this.currentCopeFeedback.copeLinkValue = url
    },
    // 分页 - pageNum
    handleCurrentChange(currentPage) {
      this.getProductList({ pageNum: currentPage })
    },
    // 分页 - pageSize
    handleSizeChange(pageSize) {
      this.getProductList({ pageSize, pageNum: 1 })
      this.$store.commit(
        operationMutationTypes.UPDATE_OPERATION_INSIDE_PRODUCT_PAGEINFO,
        { ...this.pageInfogation, pageNum: 1 },
      )
    },
  },
}
</script>
<style lang="scss" scoped>
.operation-product-wrap {
  padding-bottom: 20px;
  height: calc(100% - 46px) !important;
}
.cope-wrap {
  display: flex;
  line-height: 28px;
  font-size: 13px;
  margin-top: 10px;
  .cope-url {
    height: 28px;
    box-sizing: border-box;
    flex: 1;
    border: 1px solid #ececec;
    color: $--color-primary;
    padding: 0 6px;
  }
  .cope-link {
    height: 28px;
    padding: 0 15px;
    background-color: $--color-primary;
    color: #ffffff;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 10px;
  }
}
.list__pagination {
  text-align: right;
  display: flex;
  justify-content: flex-end;
}
.dock-user {
  white-space: normal;
}
.copy-icon-question {
  margin-left: 5px;
  cursor: pointer;
}
.operation-product-form {
  position: absolute;
  top: 10px;
  right: 20px;
}
.mb15 {
  height: calc(100% - 30px) !important;
}
.co-col-table {
  height: calc(100% - 30px) !important;
  overflow: hidden;
  /deep/.el-table {
    .el-table__body-wrapper {
      height: 100% !important;
    }
    border-width: 0 !important;
    th {
      border-right: 2px solid #fff !important;
    }
    td {
      border-right: none !important;
    }
  }
}
</style>
