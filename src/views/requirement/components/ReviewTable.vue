<template>
  <el-table
    v-loading="reviewListLoading"
    :data="reviewTableData"
    border
    class="review-table"
  >
    <el-table-column
      prop="id"
      :label="$t('评审单编号')"
      width="90"
      show-overflow-tooltip
    >
    </el-table-column>
    <el-table-column show-overflow-tooltip :label="$t('评审单名称')">
      <template slot-scope="scope">
        <div
          class="link-common text-ellipsis"
          @click="toReviewDetail(scope.row)"
        >
          {{ scope.row.title }}
        </div>
      </template>
    </el-table-column>
    <el-table-column
      v-if="operation"
      prop="projectName"
      show-overflow-tooltip
      :label="$t('项目名称')"
      width="180"
    >
    </el-table-column>
    <el-table-column
      prop="createUserName"
      width="90"
      :label="$t('创建人')"
      show-overflow-tooltip
    >
    </el-table-column>
    <co-table-column :label="$t('评审时间')" width="360" show-overflow-tooltip>
      <template slot-scope="scope">
        {{ scope.row.startTime }} {{ $t('至') }} {{ scope.row.endTime }}
      </template>
    </co-table-column>
    <el-table-column :label="$t('参与人员')" show-overflow-tooltip>
      <template slot-scope="scope"
        >{{ formatUsers(scope.row.users) }}
      </template>
    </el-table-column>
    <el-table-column prop="status.name" :label="$t('评审状态')" width="120">
      <template slot-scope="scope">
        <div :class="addClassNameToStatus(scope.row.status.statusId)">
          {{ scope.row.status.name }}
        </div>
      </template>
    </el-table-column>
    <el-table-column v-if="operation" :label="$t('操作')" width="100">
      <template slot-scope="scope">
        <i
          v-if="scope.row.editable"
          class="el-icon-delete icon-cursor"
          @click="deleteReview(scope.row)"
        ></i>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import { i18n } from '@/i18n'
import { windowOpenRouter } from '@/utils/sub-app-util'

/*
 * @Author: wnagling
 * @Date: 2020-06-05 15:19:22
 * @LastEditTime: 2020-06-05 15:19:31
 * @LastEditors: your name
 * @Description: 评审总览列表表格以及需求详情里的评审表格组件
 * @FilePath: \columbus_frontend\src\pages\Review\Requirement\ReviewTable.vue
 */
const statusClassNameMap = {
  2: 'status-pass',
  3: 'status-no-pass',
}

export default {
  name: 'ReviewTable',
  components: {},
  mixins: [],
  props: {
    reviewTableData: {
      type: Array,
      default: () => [],
      required: true,
    },

    operation: {
      type: Boolean,
      required: false,
      default: false,
      desc: '是否要操作栏',
    },

    isLoading: {
      type: Boolean,
      required: false,
      default: false,
      desc: '是否加loading',
    },
  },

  data() {
    return {}
  },
  computed: {
    // 评审总览列表loading
    reviewListLoading() {
      return this.isLoading && this.$store.state.review.reviewListLoading
    },
  },

  watch: {},
  created() {},
  mounted() {},
  methods: {
    // 评审状态添加类名
    addClassNameToStatus(statusId) {
      return statusClassNameMap[statusId]
    },
    // 格式化参与人员
    formatUsers(userList = []) {
      return userList.map(item => item.userName).join(',')
    },
    // 跳转到评审详情页面
    toReviewDetail(row) {
      windowOpenRouter(`/reviewAdmin/requirement/detail?id=${row.id}`, '_blank')
    },
    // 点击删除
    deleteReview(row) {
      this.$confirm(`${i18n.t('是否删除评审单')} "${row.title}"?`, {
        type: 'warning',
      })
        .then(() => {
          this.$emit('delete', row)
        })
        .catch(() => {})
    },
  },
}
</script>
<style lang="scss" scoped>
.review-table {
  margin: 6px 0px;
  width: 100%;
}
.text-ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
}
.icon-cursor {
  cursor: pointer;
}
</style>
