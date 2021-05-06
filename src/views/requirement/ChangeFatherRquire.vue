<template>
  <el-dialog
    v-loading="dialogLoading"
    :visible="cloneRquireModalStatus"
    :title="$t('选择父需求')"
    custom-class="dialog-noanimate"
    :modal-append-to-body="false"
    :before-close="closeModal"
  >
    <el-form :inline="true" @submit.native.prevent>
      <el-form-item class="header-input" :label="$t('所属项目') + ':'">
        <!-- <el-input placeholder="请输入需求标题关键字" v-model="searchInfo.title"></el-input> -->
        <span class="project-title" :title="currentProjectName">{{
          currentProjectName
        }}</span>
      </el-form-item>
      <el-form-item class="header-input" :label="$t('标题/ID') + ':'">
        <el-input
          v-model="searchInfo.title"
          v-focus
          :placeholder="$t('请输入标题/ID')"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="searchRequrieList({ isFilterInit: true })">{{
          $t('查询')
        }}</el-button>
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
        style="width: 100%;height: 100%;"
      >
        <el-table-column width="50" align="center">
          <template slot-scope="scope">
            <el-radio v-model="required" :label="scope.row.id">{{
              null
            }}</el-radio>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          :label="$t('需求ID')"
          prop="id"
          :label-width="$isEnglish() ? '130' : '90'"
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
      <div class="fr ">
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
import * as requirementService from '@/service/requirement'
import { workItemTabRelated } from '@/service/project'
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

    oriParentId: {
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
  },

  data() {
    return {
      requirementList: [], // 可以选择的父需求列表
      searchInfo: {
        title: '',
        pageInfo: {
          pageNumber: 1,
          pageSize: 10,
          totalRecords: 0,
        },
      },

      required: '',
      confirm: 0,
      dialogLoading: false, // 请求父需求更新API时，加loading效果
      tableLoading: false,
      isShowtips: false, //更改父需求提示
    }
  },

  computed: {
    currentProjectName() {
      return this.projectName || this.$store.state.projectName
    },
  },
  watch: {
    cloneRquireModalStatus() {
      this.searchRequrieList()
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
    async updateRequirement() {
      this.dialogLoading = true
      if (!this.required) {
        this.$message({ type: 'warning', message: i18n.t('请选择父需求') })
        this.dialogLoading = false
        return
      }
      const result = await workItemTabRelated({
        projectId: this.projectId,
        workItemId: this.required,
        workItemType: 1, // 1表示需求类型
      })

      if (result.status === 200) {
        const { taskCount, defectCount } = result.data
        this.isShowtips = taskCount || defectCount
      }
      if (this.isShowtips) {
        this.$confirm(
          i18n.t('选择父需求后，父需求下的任务和缺陷会移动到子需求下！'),
          i18n.t('提示'),
          {
            confirmButtonText: i18n.t('确定'),
            cancelButtonText: i18n.t('取消'),
            type: 'warning',
          },
        )
          .then(() => {
            requirementService
              .requirementUpdateParent({
                id: this.taskId,
                oriParentId: this.oriParentId,
                newParentId: this.required,
                confirm: this.confirm,
                projectId: this.projectId,
              })
              .then(selftRes => {
                if (selftRes.status === 501) {
                  this.$confirm(selftRes.msg, {
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
                } else if (selftRes.status === 200) {
                  this.$message({
                    message: i18n.t('更新父需求成功'),
                    type: 'success',
                  })

                  this.closeModal()
                  this.$emit('updata')
                } else {
                  this.$message({
                    message: selftRes.msg,
                    type: 'error',
                  })
                }
              })
              .catch(() => {
                // 没权限修改时，需要关闭弹窗
                this.closeModal()
              })
          })
          .catch(() => {
            this.closeModal()
          })
      } else {
        requirementService
          .requirementUpdateParent({
            id: this.taskId,
            oriParentId: this.oriParentId,
            newParentId: this.required,
            confirm: this.confirm,
            projectId: this.projectId,
          })
          .then(selfRes => {
            if (selfRes.status === 501) {
              this.$confirm(selfRes.msg, {
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
            } else if (selfRes.status === 200) {
              this.$message({
                message: i18n.t('更新父需求成功'),
                type: 'success',
              })

              this.closeModal()
              this.$emit('updata')
            } else {
              this.$message({
                message: selfRes.msg,
                type: 'error',
              })
            }
          })
          .catch(() => {
            // 当没有权限时，更新父需求需要关闭弹窗
            this.closeModal()
          })
      }
      this.dialogLoading = false
    },
    setDefaultPageInfo() {
      Object.assign(this.searchInfo.pageInfo, {
        pageNumber: 1,
        pageSize: 10,
        totalRecords: 0,
      })
    },
    // 选择需求 - 点击查询
    // @option.isFilterInit 是否点击查询按钮触发的过滤
    searchRequrieList(option = {}) {
      if (option.isFilterInit) {
        // 每次查询分页初始为第一页 解决有可能查询不到数据的问题
        this.setDefaultPageInfo()
      }
      this.tableLoading = true
      requirementService
        .parentTableReqt({
          title: this.searchInfo.title,
          pageInfo: this.searchInfo.pageInfo,
          projectId: this.projectId,
          reqtId: this.taskId,
        })
        .then(res => {
          this.tableLoading = false
          if (res.status === 200) {
            this.searchInfo.pageInfo = res.data.pageInfo
            this.requirementList = res.data.result
            // this.projectName = this.requirementList[0]&&this.requirementList[0].display.projectName;
          } else {
            // this.$message({
            //   message: res.msg || '没有满足条件的需求',
            //   type: 'error'
            // })
            this.requirementList = []
          }
        })
    },
    // 分页
    handleRequirementListPageSizeChange(pageSize) {
      this.searchInfo.pageInfo.pageSize = pageSize
      this.searchRequrieList()
    },
    // 分页
    handleRequirementListPageNumChange(pageNum) {
      this.searchInfo.pageInfo.pageNumber = pageNum
      this.searchRequrieList()
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
