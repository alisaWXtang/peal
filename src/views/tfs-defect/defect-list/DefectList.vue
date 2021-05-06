<template>
  <div class="tfs-defect-list">
    <DefectListFilter
      :is-load="isLoad"
      @change="queryDefectList"
      @clear="queryDefectList"
    ></DefectListFilter>
    <div v-if="tableHeight" class="defect-list-container">
      <el-table
        :key="listKey"
        class="tfs-defect-table"
        :data="defectList"
        :max-height="tableHeight"
        row-key="id"
        border
        :indent="0"
        :default-expand-all="expandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column
          min-width="200"
          prop="idStr"
          label="ID"
          show-overflow-tooltip
          class-name="table-cell-content"
        ></el-table-column>
        <el-table-column min-width="220" prop="title" label="标题">
          <template #default="scope">
            <el-link
              class="getTfsDefectUrl"
              type="primary"
              :underline="false"
              target="_blank"
              :href="getTfsDefectUrl(scope.row)"
              :title="scope.row.title"
            >
              {{ scope.row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          #default="scope"
          min-width="80"
          show-overflow-tooltip
          label="缺陷描述"
        >
          <el-link
            type="primary"
            :underline="false"
            @click="onShowDetailDialog(scope.row)"
            >查看描述</el-link
          >
        </el-table-column>
        <el-table-column
          min-width="100"
          prop="display.module"
          show-overflow-tooltip
          label="模块"
        ></el-table-column>
        <el-table-column
          min-width="180"
          prop="display.assignUser"
          show-overflow-tooltip
          label="指派给"
        ></el-table-column>
        <el-table-column
          min-width="80"
          prop="display.status"
          show-overflow-tooltip
          label="状态"
        ></el-table-column>
        <el-table-column
          min-width="80"
          prop="projectId"
          show-overflow-tooltip
          label="项目代号"
        ></el-table-column>
        <el-table-column
          min-width="110"
          prop="display.severity"
          show-overflow-tooltip
          label="缺陷等级"
        ></el-table-column>
        <el-table-column
          min-width="110"
          prop="display.correctedBuglevel"
          show-overflow-tooltip
          label="缺陷等级修正"
        ></el-table-column>
        <el-table-column
          min-width="180"
          prop="display.testerSuggestion"
          show-overflow-tooltip
          label="测试工程师意见"
        ></el-table-column>
        <el-table-column
          min-width="120"
          prop="display.defectType"
          show-overflow-tooltip
          label="缺陷类型"
        ></el-table-column>
        <el-table-column
          min-width="160"
          prop="createTime"
          show-overflow-tooltip
          label="创建时间"
        ></el-table-column>
        <el-table-column
          #default="scope"
          width="200"
          prop="createTime"
          label="操作"
          fixed="right"
        >
          <el-button
            type="text"
            :disabled="!!scope.row.columbusDefectId"
            @click="synchronizationDefect(scope.row)"
            >{{
              scope.row.columbusDefectId ? '已复制' : '复制到哥伦布'
            }}</el-button
          >
          <el-button
            v-if="scope.row.columbusDefectId"
            type="text"
            @click="
              getDefectDetail(
                scope.row.columbusDefectId,
                scope.row.columbusProjectId,
              )
            "
            >缺陷ID：{{ scope.row.columbusDefectId }}</el-button
          >
        </el-table-column>
      </el-table>
      <div class="list-pagination-container">
        <el-pagination
          class="list-pagination"
          background
          :current-page="currentPageInfo.pageNumber"
          :page-sizes="[15, 30, 50, 100]"
          :page-size="currentPageInfo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalRecords"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
      <DefectDetail
        v-if="defectDetailProps.visible"
        v-bind.sync="defectDetailProps"
      ></DefectDetail>
      <!-- 同步缺陷 -->
      <slide :show="slideShow" :after-close="afterClose">
        <div slot="task" class="taslinfo">
          <BugCreate
            v-if="createBug"
            ref="bug"
            :show="slideShow"
            from-other-detail-type="AlmToDefect"
            :other-detail-content="otherDetailContent"
            :other-detail-title="otherDetailTitle"
            :preset-value="presetValue"
            :alm-defect-id="almDefectId"
            :alm-defect-create-user="almDefectCreateUser"
            :alm-product-type="almProductType"
            @HandleSide="close('createBug')"
            @synchronizationSuccess="
              synchronizationSuccess('createBug', 'refush')
            "
          />
          <BugDetail
            v-if="getBug"
            ref="bug"
            :show="slideShow"
            :work-item-id="columbusDefectId"
            :project-id="columbusProjectId"
            assoc-item-open="bug"
            @HandleSide="close('getBug')"
            @updateInfoSuccess="synchronizationSuccess('getBug')"
            @deleteSuccess="synchronizationSuccess('getBug')"
          />
        </div>
      </slide>
    </div>
  </div>
</template>
<script>
/**
 * @title 缺陷列表过滤组件
 * @author wuqian
 * @date 2020.8.5
 */

//alm缺陷严重程度和哥伦布的对应
const synchronizationValueMap = {
  10: 80,
  20: 70,
  30: 90,
  40: 100,
}
const valueTextMap = {
  70: '轻微',
  80: '普通',
  90: '严重',
  100: '阻塞',
}

import { mapState } from 'vuex'
import DefectDetail from './DefectDetail'
import DefectListFilter from './DefectListFilter'
import { BugCreate } from '@/components/columbus-workitem-create'
import { BugDetail } from '@/components/columbus-workitem-display'
import { tfsDefectAction } from '@/store/action-types'
import slide from '@/components/slide-slip'
export default {
  name: 'DefectList',
  components: { DefectListFilter, DefectDetail, BugCreate, BugDetail, slide },
  data() {
    return {
      keyword: '',
      tableHeight: null,
      defectDetailProps: {
        visible: false,
        title: '',
        content: '',
      },
      currentPageInfo: {},
      expandAll: true,
      listKey: Date.now(),
      slideShow: false,
      createBug: false,
      getBug: false,
      otherDetailContent: '', //同步缺陷的内容
      otherDetailTitle: '', //同步缺陷的标题
      presetValue: null, //同步缺陷的严重程度值
      almDefectCreateUser: '', //缺陷创建者工号
      almDefectId: '', //缺陷ID
      columbusDefectId: '', //哥伦布中的缺陷ID
      columbusProjectId: '', //哥伦布中的缺陷项目ID
    }
  },
  computed: {
    ...mapState({
      defectList: state => state.tfsDefect.defectList,
      pageInfo: state => state.tfsDefect.pageInfo,
      totalRecords: state => state.tfsDefect.totalRecords,
      isLoad: state => state.tfsDefect.isInitOk,
    }),
    almProductType() {
      const { productType } = this.$route.query
      return productType || undefined
    },
  },
  watch: {
    pageInfo(val) {
      this.currentPageInfo = { ...val }
    },
    defectList() {
      this.slideShow = false
      this.createBug && (this.createBug = false)
      console.log('hide 1112222')
      this.getBug && (this.getBug = false)
    },
  },
  mounted() {
    // 去除上下 padding 16 + 10；搜索栏 32；分页器 32；上下margin 16 + 10；共计：116
    this.tableHeight = this.$el.clientHeight - 116

    this.currentPageInfo = { ...this.pageInfo }
    // 跳转自看板DI 折叠树形列表子节点
    const from = this.$parseRouteQuery()?.from
    if (from && from === 'kanban_di') {
      this.expandAll = false
      this.listKey = Date.now()
    }
  },
  methods: {
    // tfs缺陷url
    getTfsDefectUrl(row) {
      return row.display?.detail?.url || ''
    },
    fetchData(payload) {
      this.$store.dispatch(tfsDefectAction.GET_TFS_DEFECT_LIST, {
        pageInfo: this.currentPageInfo,
        ...payload,
      })
    },
    handleSizeChange(val) {
      this.currentPageInfo = {
        pageNumber: 1,
        pageSize: val,
      }
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.currentPageInfo.pageNumber = val
      this.fetchData()
    },
    queryDefectList(filterInfo) {
      this.fetchData({
        pageInfo: {}, // {} 表示默认分页
        filterInfo,
      })
    },
    // 打开查看描述弹窗
    onShowDetailDialog(row) {
      this.defectDetailProps = {
        visible: true,
        data: {
          title: row.title,
          content: row.content,
          url: this.getTfsDefectUrl(row),
        },
      }
    },
    // 同步缺陷
    synchronizationDefect(data) {
      const url = data.display?.detail?.url
      // 映射alm缺陷严重程度在哥伦布中的值
      const key = synchronizationValueMap[data.severity]
      const value = valueTextMap[key]
      // 重新设置新建缺陷模板中presetValue值
      this.presetValue = JSON.stringify({ key, value })
      this.otherDetailTitle = data.title
      this.almDefectId = data.id
      this.almDefectCreateUser = data.createUser
      if (url) {
        this.otherDetailContent = `<p>&nbsp;&nbsp;ALM链接：${url}<br></p>${data.content}`
      } else {
        this.otherDetailContent = data.content
      }
      this.slideShow = this.createBug = true
    },
    // 查看缺陷详情
    getDefectDetail(columbusDefectId, columbusProjectId) {
      console.log('getDetail 1111')
      this.columbusDefectId = columbusDefectId
      this.columbusProjectId = columbusProjectId
      this.slideShow = this.getBug = true
    },
    //关闭抽屉后的回调函数 需要手动设置控制弹框变量
    afterClose() {
      this.close(this.createBug ? 'createBug' : 'getBug')
    },
    // 关闭弹框
    close(attr) {
      //清空数据
      if (attr === 'createBug') {
        this.almDefectCreateUser = this.almDefectId = this.otherDetailTitle = this.otherDetailContent =
          ''
        this.presetValue = null
      } else {
        this.columbusDefectId = this.columbusProjectId = ''
      }
      this.slideShow = false
      this[attr] = false
    },
    // 操作缺陷成功回调函数
    synchronizationSuccess(attr, refush) {
      if (refush) {
        this.handleCurrentChange(this.currentPageInfo.pageNumber)
        this.close(attr)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.tfs-defect-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 24px 10px;
  box-sizing: border-box;

  .defect-list-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex-grow: 1;
    height: 0;
    padding-top: 16px;
  }

  .list-pagination-container {
    height: 32px;
    overflow: hidden;
  }
  .list-pagination {
    float: right;
  }
  /deep/ .tfs-defect-table {
    width: 100%;
    margin-bottom: 10px;
    border: none;
    border-radius: 0;

    th {
      border-right: 2px solid #ffffff;
    }

    td {
      border-right: none;
    }

    &:before,
    &:after {
      display: none;
    }

    .table-cell-content .cell {
      padding-left: 33px;
    }
    .el-table__expand-icon {
      margin-left: -23px;
    }
    .getTfsDefectUrl {
      display: inline;
    }

    .el-button--text:not(.is-disabled) {
      color: $--color-primary;
    }
  }

  // 修改展开和收起图标
  /deep/ .el-table .el-table__expand-icon .co-icon-arrow-right:before {
    font-size: 16px;
    content: '\e6a6';
  }
  /deep/ .el-table .el-table__expand-icon--expanded {
    transform: rotate(0);
    .co-icon-arrow-right:before {
      content: '\e718';
    }
  }
}
</style>
