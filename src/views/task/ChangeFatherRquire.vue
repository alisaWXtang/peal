<template>
  <el-dialog
    :visible="cloneRquireModalStatus"
    :title="$t('选择父需求')"
    custom-class="dialog-noanimate"
    width="750px"
    :modal-append-to-body="false"
    :before-close="closeModal"
  >
    <el-form :inline="true" @submit.native.prevent>
      <el-form-item class="header-input" :label="$t('所属项目') + ':'">
        <!-- <el-input placeholder="支持标题或ID搜索" v-model="searchInfo.title"></el-input> -->
        <span class="project-title">{{ projectName }}</span>
      </el-form-item>
      <el-form-item class="header-input" :label="$t('标题/ID') + ':'">
        <el-input
          v-model="searchInfo.title"
          v-focus
          :placeholder="$t('请输入标题/ID')"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          @click="
            searchRequrieList({
              pageSize: DEFAULT_PAGE_SIZE,
              pageNumber: DEFAULT_PAGE_NUMBER,
            })
          "
          >{{ $t('查询') }}</el-button
        >
      </el-form-item>
    </el-form>
    <div class="table-box-top">
      <el-table
        ref="assocRequireTableRef"
        v-loading="tableLoading"
        :element-loading-text="$t('拼命加载中')"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgb(255,255,255)"
        :data="requirementList"
        style="width: 100%; height: 100%"
      >
        <el-table-column width="50" align="center">
          <template slot-scope="scope">
            <el-radio v-model="localRequireId" :label="scope.row.id">{{
              null
            }}</el-radio>
          </template>
        </el-table-column>
        <el-table-column
          :label-width="$isEnglish() ? '130' : '90'"
          show-overflow-tooltip
          :label="$t('需求ID')"
          prop="id"
        >
          <template slot-scope="scope">
            <span @click.stop="assocItemClick(scope.row, 'requirement')">{{
              scope.row.id
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="display.title"
          show-overflow-tooltip
          :label="$t('需求标题')"
          min-width="180"
        >
          <template slot-scope="scope">
            <span @click.stop="assocItemClick(scope.row, 'requirement')">{{
              scope.row.display.title
            }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="display.projectName" show-overflow-tooltip label="所属项目" min-width="80">
        </el-table-column> -->
        <el-table-column
          prop="display.assignUser"
          show-overflow-tooltip
          :label="$t('处理人')"
          min-width="60"
        >
        </el-table-column>
        <el-table-column
          prop="display.status"
          show-overflow-tooltip
          :label="$t('状态')"
          width="80"
        ></el-table-column>
      </el-table>
    </div>
    <div class="table_b_f_b">
      <el-pagination
        v-show="requirementList && requirementList.length > 0"
        class="fr mr10"
        style="margin-top: 9px;margin-bottom: 24px;"
        :current-page="searchInfo.pageInfo.pageNumber"
        :page-sizes="[10, 20, 30]"
        :page-size="searchInfo.pageInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="searchInfo.pageInfo.totalRecords"
        @size-change="handleRequirementListPageSizeChange"
        @current-change="handleRequirementListPageNumChange"
      ></el-pagination>
    </div>
    <div class="fotter">
      <div class="fr">
        <co-button @click="cancel">取 消</co-button>
        <el-button type="primary" @click="updateRequirement">{{
          $t('确定')
        }}</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { i18n } from '@/i18n'
const DEFAULT_PAGE_NUMBER = 1
const DEFAULT_PAGE_SIZE = 10
import { taskUpdateParent } from '@/service/task'
import { parentAble } from '@/service/requirement'

export default {
  name: 'ChangeFatherRquire',
  props: {
    cloneRquireModalStatus: {
      type: Boolean,
      required: true,
    },

    closeModal: {
      type: Function,
      required: true,
    },

    projectId: {
      type: [String, Number],
      required: true,
    },

    taskId: {
      type: [String, Number],
      required: true,
    },

    projectName: {
      type: [String, Number],
      required: true,
      default: '', // 解决 projectName undefined 报错问题
    },
    requireId: {
      type: [String, Number],
      default: '',
      desc: '需求id，可用于回显',
    },
  },

  data() {
    return {
      DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_NUMBER,
      requirementList: [], // 可以选择的父需求列表
      searchInfo: {
        title: '',
        pageInfo: {
          pageNumber: DEFAULT_PAGE_NUMBER,
          pageSize: DEFAULT_PAGE_SIZE,
          totalRecords: 0,
        },
      },

      localRequireId: '', // 需求id
      tableLoading: false,
      confirm: 0,
    }
  },
  watch: {
    cloneRquireModalStatus() {
      this.localRequireId = this.requireId
      this.searchRequrieList()
    },
    requireId: {
      handler(val) {
        this.localRequireId = val
      },
      immediate: true,
    },
  },

  mounted() {
    this.searchRequrieList()
  },
  methods: {
    cancel() {
      this.closeModal && this.closeModal()
    },
    //更新父需求
    updateRequirement() {
      if (!this.localRequireId) {
        this.$message({ type: 'warning', message: i18n.t('请选择父需求') })
        return
      }

      // 需求没有改变不用更新
      if (this.localRequireId === this.requireId) {
        this.closeModal()
        return
      }

      taskUpdateParent({
        id: this.taskId,
        projectId: this.projectId,
        requireId: this.localRequireId,
      })
        .then(res => {
          if (res.status === 501) {
            this.$confirm(res.msg, {
              confirmButtonText: i18n.t('确定'),
              cancelButtonText: i18n.t('取消'),
              modal: false,
              type: 'warning',
            })
              .then(() => {
                this.confirm = 1
                this.updateRequirement()
              })
              .catch(() => {
                this.confirm = 0
              })
          } else if (res.status === 200) {
            this.$message({
              message: i18n.t('更新父需求成功'),
              type: 'success',
            })

            this.closeModal()
            this.$emit('updata')
          } else {
            this.$message({
              message: res.msg,
              type: 'error',
            })
          }
        })
        .catch(() => {
          //当没权限更新父需求时,需要关闭弹窗
          this.closeModal()
        })
    },
    // 选择需求 - 点击查询
    searchRequrieList({ pageNumber = DEFAULT_PAGE_NUMBER, pageSize } = {}) {
      const { pageInfo } = this.searchInfo
      this.tableLoading = true
      parentAble({
        title: this.searchInfo.title,
        pageInfo: {
          ...pageInfo,
          pageSize: pageSize != null ? pageSize : pageInfo.pageSize,
          pageNumber,
        },

        projectId: this.projectId,
        reqtId: this.taskId,
      }).then(res => {
        this.tableLoading = false
        if (res.status === 200) {
          this.searchInfo.pageInfo = res.data.pageInfo
          this.requirementList = res.data.result
        } else {
          this.$message({
            message: res.msg || i18n.t('没有满足条件的需求'),

            type: 'error',
          })

          this.requirementList = []
        }
      })
    },
    // 分页
    handleRequirementListPageSizeChange(pageSize) {
      this.searchRequrieList({ pageSize })
    },
    // 分页
    handleRequirementListPageNumChange(pageNumber) {
      this.searchRequrieList({ pageNumber })
    },
    assocItemClick() {},
  },
}
</script>
<style lang="scss" scoped>
.fotter {
  width: 100%;
  overflow: hidden;
}
.project-title {
  display: block;
  max-width: 280px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
