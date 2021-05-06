<template>
  <div class="content-outer-box">
    <div class="file-box">
      <el-table
        ref="table"
        class="multiple-table"
        :data="attachmentList"
        style="width: 100%;"
        :height="tableMaxHeight + 60"
        border
      >
        <el-table-column
          prop="origName"
          :label="$t('文件名')"
          show-overflow-tooltip
          min-width="300"
        >
          <template slot-scope="scope">
            <span
              :class="{ 'file-text': filePreviewAble(scope.row) }"
              @click="handleFileNameClick(scope.row)"
              >{{ scope.row.origName }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="size"
          :label="$t('大小(kb)')"
          min-width="80"
        ></el-table-column>
        <el-table-column
          prop="workItemTypeName"
          :label="$t('工作项类型')"
          min-width="100"
        ></el-table-column>
        <el-table-column
          prop="title"
          :label="$t('工作项')"
          min-width="240px"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span class="file-text" @click="goToWorkItemDetail(scope.row)">{{
              scope.row.title
            }}</span>
            <!-- <el-button type="text" @click="goToWorkItemDetail(scope.row)">{{
              scope.row.title
            }}</el-button> -->
          </template>
        </el-table-column>
        <el-table-column
          prop="createUser"
          :label="$t('上传人')"
          min-width="170"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span class="table-column-padding"
              >{{ scope.row.userName }}({{ scope.row.createUser }})</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          :label="$t('上传时间')"
          min-width="160"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column :label="$t('操作')" :width="$isEnglish() ? 320 : 240">
          <template slot-scope="scope">
            <el-button type="text" @click="downloadAttachment(scope.row)">{{
              $t('下载')
            }}</el-button>
            <el-button type="text">
              <el-upload
                v-if="
                  $authFunction(
                    'FUNC_COOP_DOCUMENT_UPDATE',
                    3,
                    $getUrlParams().projectId,
                  )
                "
                action="/"
                :show-file-list="false"
                :before-upload="file => updateDoc(file, scope.row)"
              >
                <span>{{ $t('更新') }}</span>
              </el-upload>
            </el-button>
            <el-button type="text" @click="deleteAttachment(scope.row)">{{
              $t('删除')
            }}</el-button>
            <el-button
              v-show="
                $authFunction(
                  'FUNC_COOP_DOCUMENT_SAVE_OBOX',
                  3,
                  $getUrlParams().projectId,
                )
              "
              type="text"
              @click="saveDocToObox(scope.row)"
            >
              {{ $t('保存至obox') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table_b_f_b content-footer">
        <el-pagination
          background
          size="middle"
          :current-page="pageInfo.pageNum"
          :page-size="pageInfo.pageSize"
          layout="total, prev, pager, next"
          :page-count="pageInfo.pages"
          :total="pageInfo.total"
          @size-change="handleAttachmentListSizeChange"
          @current-change="handleAttachmentListCurrentChange"
        >
        </el-pagination>
        <div class="pagination-custom">
          <span>{{ $t('每页') }}</span>
          &nbsp;&nbsp;
          <el-input
            v-model.number="filePageSize"
            class="pagination-custom-input"
            @change="handleAttachmentListSizeChange"
          ></el-input>
          <span>{{ $t('条') }}</span>
          &nbsp;&nbsp;
        </div>
      </div>
    </div>

    <FileSaveToObox
      v-if="saveToOboxDialogVisible"
      :visible.sync="saveToOboxDialogVisible"
      :file-info="currentFileInfo"
      type="attachment"
      @close="saveToOboxDialogVisible = false"
    />
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { mapState, mapMutations } from 'vuex'
import { downloadFile } from '@/utils/index.js'
import FileSaveToObox from './fileSaveToObox.vue'

import {
  attachmentUpdate,
  attachmentList,
  attachmentDelete,
} from '@/service/file'
export default {
  name: 'FileInfo',
  components: {
    FileSaveToObox,
  },
  props: {
    tableMaxHeight: {
      type: Number,
      default: 500,
    },
  },
  data() {
    return {
      filePageSize: 20,
      loading: false,
      uploadLoading: null,
      pageInfo: {
        pageSize: 20,
        pageNum: 1,
        total: 0,
        pages: 0,
      },

      attachmentList: [],

      saveToOboxDialogVisible: false,
      currentFileInfo: {},
    }
  },
  computed: {
    ...mapState({
      docSearchWord: state => state.fe.docSearchWord,
      filePreviewAuthList: state => state.pf.filePreviewAuthList,
    }),
  },

  watch: {
    docSearchWord: function() {
      this.getWorkItemAttachmentList()
    },
  },

  mounted() {
    this.initAttachmentList()
  },
  beforeDestroy() {
    this.uploadLoading && this.uploadLoading.close()
  },
  methods: {
    saveDocToObox(row) {
      this.currentFileInfo = JSON.parse(JSON.stringify(row))
      this.currentFileInfo.id = row.attachmentId // 要的是文档id
      this.saveToOboxDialogVisible = true
    },
    updateDoc(file, row) {
      if (file.size > 1024 * 1024 * 256) {
        this.$message({
          message: i18n.t('允许上传文件的大小上限为 256 M'),
          type: 'error',
        })
        return
      }
      this.uploadLoading = this.$loading({
        lock: true,
        text: i18n.t('文件上传中，请耐心等待'),
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.2)',
      })
      let data = new FormData()
      data.append('file', file)
      data.append('workItemType', row.workItemType)
      data.append('workItemId', row.workItemId)
      data.append('attachmentId', row.attachmentId)
      attachmentUpdate(data)
        .then(res => {
          this.getWorkItemAttachmentList()
          this.uploadLoading.close()
          if (res.status === 200) {
            this.$message({
              type: 'success',
              message: i18n.t('文档更新成功') + '!',
            })
          }
        })
        .catch(() => {
          this.uploadLoading.close()
        })
      return false
    },
    ...mapMutations(['changeDocSearchWord']),
    // 文件是否可以预览
    filePreviewAble(file) {
      let format = file.format || file.url.split('.').pop()
      format = format.replace(/\./, '')
      return this.filePreviewAuthList.includes(format.toLowerCase())
    },
    // 文件标题点击
    handleFileNameClick(file) {
      if (!this.filePreviewAuthList.includes(file.origName.split('.').pop()))
        return
      this.$emit('previewFile', {
        url: file.url,
        typeName: file.origName.split('.').pop(),
        size: file.size,
        id: file.attachmentId,
        name: file.origName,
        workItemType: file.workItemType,
        workItemId: file.workItemId,
      })
    },
    // 文件预览
    handleFilePreview({ typeName, url }) {
      if (
        !this.filePreviewAuthList.includes(typeName && typeName.toLowerCase())
      ) {
        this.$message({
          type: 'warning',
          message: i18n.t('当前文档格式暂时不支持预览'),
        })

        return
      }
      window.open(url + '?preview=true')
    },

    initAttachmentList() {
      if (this.docSearchWord.trim() !== '') {
        this.changeDocSearchWord('')
      } else {
        this.getWorkItemAttachmentList()
      }
    },

    goToWorkItemDetail(row) {
      if (row.workItemType == 1) {
        this.$goToPage(this, 'requirementList', {
          projectId: this.$getUrlParams().projectId,
          requireId: row.workItemId,
        })
      } else if (row.workItemType == 2) {
        this.$goToPage(this, 'taskView', {
          projectId: this.$getUrlParams().projectId,
          taskId: row.workItemId,
        })
      } else if (row.workItemType == 3) {
        this.$goToPage(this, 'bugList', {
          projectId: this.$getUrlParams().projectId,
          bugId: row.workItemId,
        })
      }
    },

    getWorkItemAttachmentList(callback) {
      this.loading = true
      attachmentList({
        keyWord: this.docSearchWord,
        page: this.pageInfo.pageNum,
        size: this.pageInfo.pageSize,
      })
        .then(res => {
          this.loading = false
          if (res.status == 200) {
            callback && callback()
            this.pageInfo.total = res.data.total
            this.pageInfo.pages = res.data.pages
            this.attachmentList = res.data.list
            // 如果最后一页的数据删除了则重新定位到前一页
            if (this.pageInfo.pageNum > 1 && this.attachmentList.length === 0) {
              this.pageInfo.pageNum--
              this.getWorkItemAttachmentList()
            }
          }
        })
        .catch(() => {
          this.loading = false
        })
    },

    handleAttachmentListCurrentChange(val) {
      this.pageInfo.pageNum = val
      this.getWorkItemAttachmentList(() => {
        this.$refs.table.$el
          .querySelector('.el-table__body-wrapper')
          .scrollTo(0, 0)
      })
    },

    handleAttachmentListSizeChange(val) {
      if (Number(val) < 1 || !/^\d+$/.test(Number(val))) {
        this.$message({
          type: 'warning',
          message: i18n.t('每页条数必须大于0，并且是整数'),
        })
        this.filePageSize = 20
      }
      this.pageInfo.pageSize = this.filePageSize
      this.getWorkItemAttachmentList()
    },
    //下载
    downloadAttachment(scope) {
      downloadFile(
        scope.url +
          '?projectId=' +
          this.$getUrlParams().projectId +
          '&origName=' +
          scope.origName,
        scope.origName,
      )
    },
    //删除
    deleteAttachment(scope, callback) {
      this.$confirm(`${i18n.t('确定移除')} ${scope.origName}？`)
        .then(() => {
          attachmentDelete({
            attachmentId: scope.attachmentId,
            workItemType: scope.workItemType,
            workItemId: scope.workItemId,
          }).then(res => {
            if (res.status == 200) {
              this.$message({
                type: 'success',
                message: res.msg || `${i18n.t('删除成功')}!`,
              })
              this.getWorkItemAttachmentList()
              callback && callback()
            }
          })
        })
        .catch(_ => _)
    },
  },
}
</script>

<style lang="scss" scoped>
.content-footer {
  height: 32px;
  margin-top: 8px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;
  .pagination-custom {
    font-size: 14px;
    color: #bfbfbf;
    box-sizing: border-box;
    .pagination-custom-input {
      display: inline-block;
      width: 45px;
      margin: 0 5px;
      /deep/ .el-input__inner {
        color: #bfbfbf;
        text-align: center;
      }
    }
  }
}
.file-box {
  .file-text {
    color: $--color-primary;
    margin-right: 10px;
    cursor: pointer;
  }
}
</style>
