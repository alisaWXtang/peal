<template>
  <div class="setting-400">
    <co-table
      v-loading="listLoading"
      :border="true"
      :data="list"
      :max-height="tableHeight"
    >
      <co-table-column prop="name" :label="$t('名称')" width="300" />
      <co-table-column :label="$t('反馈对接人')">
        <template slot-scope="scope"
          >{{ scope.row.dockingUsers | addSep }}
        </template>
      </co-table-column>
      <co-table-column :label="$t('操作')" width="100">
        <template v-if="scope.row.authToControl" slot-scope="scope">
          <co-button
            class="setting-btn"
            type="text"
            @click="editInterfaceMan(scope.row)"
          >
            {{ $t('设置对接人') }}
          </co-button>
        </template>
      </co-table-column>
    </co-table>
    <div class="pagination">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[15, 30, 50]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <FeedbackManSetting
      :product-id="editProductId"
      :visible.sync="visible"
      setting-type="400"
      :default-interface-man-list="defaultDockingUsers"
    ></FeedbackManSetting>
  </div>
</template>

<script>
import { operationActionTypes } from '@/store/action-types'
import FeedbackManSetting from '@/components/biz/feedback-man-setting'

export default {
  name: 'Setting400',
  filters: {
    addSep(value) {
      return Array.isArray(value)
        ? value
            .map((item = {}) => {
              const { userId, userName } = item
              return `${userName}(${userId})`
            })
            .join('、')
        : ''
    },
  },
  components: {
    FeedbackManSetting,
  },

  data() {
    return {
      activeName: 'interfaceMan',
      visible: false,
      editProductId: '',
      defaultDockingUsers: [],
    }
  },
  computed: {
    list() {
      return this.$store.state.operationSetting400.list
    },
    total() {
      return this.$store.state.operationSetting400.total
    },
    listLoading() {
      return this.$store.state.operationSetting400.listLoading
    },
    tableHeight() {
      return window.innerHeight - 200 + 'px'
    },
  },

  watch: {
    activeName(val) {
      this.countlyLog(`operation_setting400_${val}`)
    },
  },

  created() {
    this.fetchList()
  },

  methods: {
    confirmSetting() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { interfaceManList } = this.settingForm
          this.updateLoading = true
          this.$store
            .dispatch({
              type: operationActionTypes.UPDATE_INTERFACE_MAN,
              payload: {
                list: interfaceManList.map(item => item?.userId),
                ...this.settingForm,
              },
            })
            .finally(() => {
              this.updateLoading = false
            })
        }
      })
    },
    editInterfaceMan({ id, dockingUsers }) {
      this.editProductId = id
      this.defaultDockingUsers = dockingUsers || []
      this.visible = true
    },
    fetchList({ pageNum = 1, pageSize = 15 } = {}) {
      this.$store.dispatch({
        type: operationActionTypes.FETCH_400_PRODUCT_LIST,
        payload: { pageNum, pageSize },
      })
    },
    handleSizeChange(pageSize) {
      this.fetchList({ pageSize })
    },
    handleCurrentChange(pageNum) {
      this.fetchList({ pageNum })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../common.scss';
.setting-400 {
  width: 100%;
  /deep/ .el-table {
    min-height: calc(100% - 36px);
    overflow: auto;
    .setting-btn {
      &.el-button--text:not(.is-disabled) {
        color: $--color-primary;
      }
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
