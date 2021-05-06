<template>
  <div ref="contentBox" class="content-outer-box file-info">
    <div>
      <el-form inline class="file-search" @submit.native.prevent>
        <el-form-item>
          <el-input
            v-model="search"
            v-focus
            clearable
            :class="{ 'z--en': $isEnglish() }"
            :placeholder="$t('请输文件名')"
            @clear="searchBtn"
            @keyup.enter.native="searchBtn"
          >
            <i
              slot="prefix"
              class="el-input__icon el-icon-search"
              @click="searchBtn"
            />
          </el-input>
        </el-form-item>
      </el-form>
      <!-- 分类编辑菜单 -->
      <div class="file-tab-box">
        <el-tabs v-model="docType" @tab-click="handleClick">
          <el-tab-pane :label="$t('上传的文档')" name="doc">
            <div
              class="file-doc-box"
              :style="{ height: `calc(100vh - ${contentOffsetTop}px)` }"
            >
              <div class="file-doc-left">
                <ul id="menu" ref="docMenu">
                  <li
                    v-if="
                      menuData.id !== 0 &&
                        menuData.folderType == 0 &&
                        $authFunction(
                          'FUNC_COOP_DOCUMENT_FOLDER_CREATE',
                          3,
                          $getUrlParams().projectId,
                        )
                    "
                    @click="createFolder"
                  >
                    {{ $t('创建文件夹') }}
                  </li>
                  <li
                    v-if="
                      menuData.folderType == 0 &&
                        $authFunction(
                          'FUNC_COOP_DOCUMENT_FOLDER_CREATE',
                          3,
                          $getUrlParams().projectId,
                        )
                    "
                    @click="creatChildFolder"
                  >
                    {{ $t('创建子文件夹') }}
                  </li>
                  <li
                    v-if="
                      menuData.id !== 0 &&
                        menuData.folderType == 0 &&
                        $authFunction(
                          'FUNC_COOP_DOCUMENT_FOLDER_UPDATE',
                          3,
                          $getUrlParams().projectId,
                        )
                    "
                    @click="editFolder"
                  >
                    {{ $t('修改文件夹名') }}
                  </li>
                  <li
                    v-if="
                      menuData.id !== 0 &&
                        menuData.folderType == 0 &&
                        $authFunction(
                          'FUNC_COOP_DOCUMENT_FOLDER_DELETE',
                          3,
                          $getUrlParams().projectId,
                        )
                    "
                    @click="deleteFolder"
                  >
                    {{ $t('删除文件夹') }}
                  </li>
                </ul>
                <div class="file-doc-left-title">{{ $t('文件夹列表') }}</div>
                <div
                  ref="fileDocLeftTree"
                  class="file-doc-left-tree scrollbal-common"
                >
                  <el-tree
                    ref="folderTree"
                    class="el-tree scrollbal-common left-tree-common"
                    :data="folderTree"
                    :props="defaultProps"
                    :highlight-current="true"
                    :draggable="true"
                    :allow-drag="decideNodeDrag"
                    :allow-drop="decideNodeDrop"
                    :expand-on-click-node="false"
                    node-key="key"
                    default-expand-all
                    :render-content="renderContent"
                    @node-drop="moveFolder"
                  >
                  </el-tree>
                </div>
              </div>
              <div class="right-btn-box">
                <el-upload
                  v-show="
                    selectFolder.folderType == 0 &&
                      (selectFolder.id >= 0 || selectFolder.id === -2)
                  "
                  class="upload-demo"
                  :action="uploadUrl"
                  :headers="uploadHeaders"
                  name="file"
                  style="display: inline-block;"
                  :data="{ documentFolderId: selectFolder.id }"
                  :show-file-list="false"
                  :on-success="uploadDocSuccess"
                  :on-error="uploadDocError"
                  :before-upload="fileValidCheck"
                  multiple
                >
                  <el-button
                    v-show="
                      $authFunction(
                        'FUNC_COOP_DOCUMENT_UPLOAD',
                        3,
                        $getUrlParams().projectId,
                      )
                    "
                    class="cursor-pointer file-plus-hover"
                    type="primary"
                    >{{ $t('上传') }}</el-button
                  >
                </el-upload>
              </div>
              <div class="file-doc-right fr">
                <div class="m10 file-doc-table">
                  <el-table
                    ref="table"
                    class="multiple-table"
                    :data="docList"
                    style="width: 100%;height: 100%;"
                    :height="tableMaxHeight + 30"
                    border
                  >
                    <el-table-column
                      prop="origName"
                      :label="$t('文件名')"
                      show-overflow-tooltip
                      min-width="240"
                    >
                      <template slot-scope="scope">
                        <span
                          v-if="scope.row.id != renameDocId"
                          :class="{ 'file-text': filePreviewAble(scope.row) }"
                          @click="handleFileNameClick(scope.row)"
                          >{{ scope.row.origName }}</span
                        >
                        <el-input
                          v-if="scope.row.id == renameDocId"
                          ref="rename"
                          v-model="renameName"
                          @keyup.native.enter="$refs.rename.blur()"
                          @blur="editDocName(scope.row, $event)"
                        ></el-input>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="size"
                      :label="$t('大小(kb)')"
                      min-width="80"
                    ></el-table-column>
                    <el-table-column
                      prop="createUser"
                      :label="$t('上传人')"
                      show-overflow-tooltip
                      min-width="150"
                    >
                      <template slot-scope="scope">
                        <span class="table-column-padding"
                          >{{ scope.row.userName }}({{
                            scope.row.createUser
                          }})</span
                        >
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="createTime"
                      :label="$t('上传时间')"
                      show-overflow-tooltip
                      min-width="200"
                    ></el-table-column>
                    <el-table-column
                      prop="name"
                      :label="$t('操作')"
                      width="340"
                    >
                      <template slot-scope="scope">
                        <el-button
                          type="text"
                          @click="downloadDoc(scope.row)"
                          >{{ $t('下载') }}</el-button
                        >
                        <el-button
                          v-if="
                            $authFunction(
                              'FUNC_COOP_DOCUMENT_UPDATE',
                              3,
                              $getUrlParams().projectId,
                            )
                          "
                          type="text"
                        >
                          <el-upload
                            action="/"
                            :show-file-list="false"
                            :before-upload="file => updateDoc(file, scope.row)"
                          >
                            {{ $t('更新') }}
                          </el-upload>
                        </el-button>
                        <el-button
                          v-show="
                            $authFunction(
                              'FUNC_COOP_DOCUMENT_RENAME',
                              3,
                              $getUrlParams().projectId,
                            )
                          "
                          type="text"
                          @click="openEditDocName(scope.row)"
                          >{{ $t('重命名') }}
                        </el-button>
                        <el-button
                          v-show="
                            $authFunction(
                              'FUNC_COOP_DOCUMENT_DELETE',
                              3,
                              $getUrlParams().projectId,
                            )
                          "
                          type="text"
                          @click="deleteDoc(scope.row)"
                          >{{ $t('删除') }}</el-button
                        >
                        <el-button
                          v-show="
                            $authFunction(
                              'FUNC_COOP_DOCUMENT_MOVE',
                              3,
                              $getUrlParams().projectId,
                            )
                          "
                          type="text"
                          @click="moveDoc(scope.row)"
                          >{{ $t('移动') }}</el-button
                        >
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
                          >{{ $t('保存至obox') }}</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                  <div class="content-footer">
                    <el-pagination
                      background
                      size="middle"
                      layout="total, prev, pager, next"
                      :current-page="pageInfo.pageNum"
                      :page-size="pageInfo.pageSize"
                      :page-count="pageInfo.pages"
                      :total="pageInfo.total"
                      @current-change="handleDocListCurrentChange"
                    >
                    </el-pagination>
                    <div class="pagination-custom">
                      <span>{{ $t('每页') }}</span>
                      &nbsp;&nbsp;
                      <el-input
                        v-model.number="filePageSize"
                        class="pagination-custom-input"
                        @change="handleDocListSizeChange"
                      ></el-input>
                      <span>{{ $t('条') }}</span>
                      &nbsp;&nbsp;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('工作项附件文档')" name="attachment">
            <file-work-item
              v-if="docType == 'attachment'"
              ref="fileWorkItem"
              :table-max-height="tableMaxHeight"
              @previewFile="workItemPreview"
            ></file-work-item>
          </el-tab-pane>
          <el-tab-pane :label="$t('接口文档')" name="api">
            <file-creat v-if="docType == 'api'" :key-word="search"></file-creat>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <!-- 创建,修改文件弹窗 -->
    <el-dialog
      :title="operationTitle"
      :visible.sync="dialogVisible"
      width="400px"
    >
      <span>{{ $t('文件夹名称') }}:</span>
      <el-input
        v-model="folderName"
        :placeholder="$t('请输入文件夹名称')"
        style="width:78%;"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="saveFolder">{{
          $t('确定')
        }}</el-button>
      </span>
    </el-dialog>
    <!-- 移动弹窗 -->
    <el-dialog
      :title="$t('移动至')"
      :visible.sync="moveVisible"
      :before-close="colseMoveDialog"
      width="20%"
    >
      <el-tree
        ref="moveFolderTree"
        :data="moveData.moveTreeData"
        node-key="id"
        :default-checked-keys="moveData.defaultCheckedKeys"
        :default-expanded-keys="moveData.defaultCheckedKeys"
        :props="defaultProps"
        show-checkbox
        :check-strictly="true"
        @check-change="checkChange"
      >
        <!--@node-click="handleNodeClick"-->
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="colseMoveDialog">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="moveSuerBtn">{{
          $t('确定')
        }}</el-button>
      </span>
    </el-dialog>
    <FilePreview
      v-if="showFileVisble"
      ref="filePreview"
      :file-info="activeItem"
      :is-document="isDocument"
      @delete="handleFileBeforeRemove(activeItem)"
      @close="handleFilePreviewClose"
    />
    <FileSaveToObox
      v-if="saveToOboxDialogVisible"
      :visible.sync="saveToOboxDialogVisible"
      :file-info="currentFileInfo"
      @close="saveToOboxDialogVisible = false"
    />
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 文档首页
 * @desc 状态：展示、编辑
 * @author panhui
 * @date 2019-8-20
 */
import { mapState, mapMutations } from 'vuex'
import fileCreat from './fileCreat.vue'
import fileWorkItem from './fileWorkItem.vue'
import FilePreview from '@/components/file-preview/index.vue'
import FileSaveToObox from './fileSaveToObox.vue'
import { getRealUrl } from '@/utils/sub-app-util'
import { downloadFile } from '@/utils/index'

import {
  move,
  folderQuery,
  docQuery,
  folderDelete,
  folderCreate,
  folderUpdateName,
  documentUpdate,
  rename,
  docDelete,
  moveDocument,
} from '@/service/file'
import { sso } from '@oppo/helper-udp'
import { guideType } from '../../components/guide/guideData'
import { guide } from '@/store/mutation-types'

const isNormalFile = file => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(true)
    }
    reader.onerror = () => {
      resolve(false)
    }
    reader.readAsText(file)
  })
}
export default {
  name: 'FileInfo',
  components: {
    fileCreat,
    fileWorkItem,
    FilePreview,
    FileSaveToObox,
  },
  data() {
    return {
      uploadHeaders: {
        Authorization: sso.getAuthorization(),
      },
      filePageSize: 20,
      isDocument: true,
      activeItem: {},
      showFileVisble: false,
      tipsShow: true,
      search: '',
      docType: 'doc',
      projectId: 0,
      selectFolder: {},
      folderName: '',
      operationTitle: i18n.t('创建文件'),
      renameDocId: 0,
      renameName: '',
      breadcrumb: [],
      docTypeDes: {
        0: i18n.t('上传文档'),
        1: i18n.t('附件'),
        3: i18n.t('接口文档'),
      },

      menuData: {},
      dialogVisible: false,
      moveVisible: false,
      loading: false,
      uploadLoading: null,
      folderTree: [],
      defaultProps: {
        children: 'children',
        label: 'label',
      },
      docList: [],
      moveData: {}, //选择移动时的公共数据
      pageInfo: {
        pageSize: 20,
        pageNum: 1,
        total: 0,
        pages: 0,
      },
      contentOffsetTop: 0,
      tableMaxHeight: 500,

      saveToOboxDialogVisible: false,
      currentFileInfo: {},
    }
  },
  computed: {
    ...mapState({
      docSearchWord: state => state.fe.docSearchWord,
      filePreviewAuthList: state => state.pf.filePreviewAuthList,
    }),
    uploadUrl() {
      return getRealUrl('/api/coop/document/upload?projectId=' + this.projectId)
    },
  },

  watch: {},

  mounted() {
    this.projectId = this.$getUrlParams().projectId
    this.docType = this.$getUrlParams().docType
      ? this.$getUrlParams().docType
      : 'doc'
    this.getInitFolderTree()
    document.body.addEventListener('click', this.closePopMenu)
    this.getContentOffsetTop()
    if (this.$store.state.guide.guideType === guideType.document) {
      this.$store?.commit(guide.CHANGE_GUIDE_DIALOG_VISIBLE, true)
    }
  },
  beforeDestroy() {
    document.body.removeEventListener('click', this.closePopMenu)
    this.uploadLoading && this.uploadLoading.close()
  },
  methods: {
    saveDocToObox(row) {
      this.currentFileInfo = row
      this.saveToOboxDialogVisible = true
    },
    getContentOffsetTop() {
      // marginBottom为距离底部的距离
      let marginBottom = 132
      this.contentOffsetTop =
        this.$refs.contentBox.getBoundingClientRect().top + marginBottom
      this.$nextTick(() => {
        this.tableMaxHeight = this.$refs.contentBox.clientHeight - 230
      })
    },
    closePopMenu() {
      this.$refs.docMenu.style.display = 'none'
    },
    // 预览关闭时，执行列表刷新
    handleFilePreviewClose() {
      if (this.isDocument) {
        this.getDocumentList()
      } else {
        this.$refs.fileWorkItem.getWorkItemAttachmentList()
      }
      this.showFileVisble = false
    },
    //预览内执行删除操作
    handleFileBeforeRemove(item) {
      if (this.isDocument) {
        this.deleteDoc({
          id: item.id,
          origName: item.name,
        })
      } else {
        this.$refs.fileWorkItem.deleteAttachment(
          {
            origName: item.name,
            attachmentId: item.id,
            workItemType: item.workItemType,
            workItemId: item.workItemId,
          },
          () => {
            this.$refs.filePreview.dialogVisible = false
          },
        )
      }
    },
    ...mapMutations(['fileTypeKeysFun', 'changeDocSearchWord']),
    // 文件上传 - 名称控制
    async fileValidCheck(file) {
      // 新增文件名长度控制
      if (file.name && file.name.length > 230) {
        this.$message({
          message: i18n.t('文件名过长'),
          type: 'error',
        })

        return false
      }
      const isFile = await isNormalFile(file)
      if (isFile && file.size < 256 * 1024 * 1024) {
        this.uploadLoading = this.$loading({
          lock: true,
          text: i18n.t('文件上传中，请耐心等待'),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.2)',
        })
        return true
      }
      if (!isFile) {
        this.$message({
          message: i18n.t('暂不支持上传文件夹'),
          type: 'error',
        })

        throw false
      }
      if (file.size === 0) {
        this.$message({
          message: i18n.t('暂不支持上传空文件'),
          type: 'error',
        })

        throw false
      }
      this.$message({
        message: i18n.t('允许上传文件的大小上限为 256 M'),
        type: 'error',
      })

      throw false
    },
    // 文件是否可以预览
    filePreviewAble(file) {
      let format = file.origName.split('.').pop()
      return this.filePreviewAuthList.includes(format.toLowerCase())
    },
    // 工作项附件预览
    workItemPreview(item) {
      this.activeItem = item
      this.isDocument = false
      this.showFileVisble = true
      this.$nextTick(() => {
        this.$refs.filePreview.dialogVisible = true
      })
    },
    // 文件标题点击
    handleFileNameClick(file) {
      let typeName = file.origName.split('.').pop()
      if (!this.filePreviewAuthList.includes(typeName.toLowerCase())) return
      this.isDocument = true
      this.activeItem = {
        url: file.url,
        typeName: typeName,
        size: file.size,
        id: file.id,
        name: file.origName,
        documentFolderId: file.documentFolderId,
      }
      this.showFileVisble = true
      this.$nextTick(() => {
        this.$refs.filePreview.dialogVisible = true
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
    //文件分类tips显示
    showTip(scope, ev) {
      if (ev.target.clientWidth > 160) {
        this.tipsShow = false
      } else {
        this.tipsShow = true
      }
    },
    decideNodeDrag(node) {
      if (node.data.key > 0 && node.data.folderType == 0) {
        return true
      }
      return false
    },

    decideNodeDrop(draggingNode, dropNode, type) {
      if (
        dropNode.data.key >= 0 &&
        dropNode.data.folderType == 0 &&
        type == 'inner'
      ) {
        return true
      }
      return false
    },

    moveFolder(draggingNode, inNode) {
      move(
        {
          id: draggingNode.data.id,
          parentId: inNode.data.id,
        },
        { type: 'form' },
      ).then(res => {
        if (res.status == 200) {
          this.$message({
            type: 'success',
            message: i18n.t('移动成功'),
          })
          this.getFolderTree()
        }
      })
    },

    goToFolder(item) {
      this.selectFolder = item
      this.getNodeAllParent(this.$refs.folderTree.getNode(item.key))
      this.setCurrentNodeLight()
      this.getDocumentList()
    },

    setCurrentNodeLight() {
      this.$nextTick(() => {
        this.$refs.folderTree.setCurrentKey(this.selectFolder.key)
      })
    },

    handleDocListSizeChange(val) {
      if (Number(val) < 1 || !/^\d+$/.test(Number(val))) {
        this.$message({
          type: 'warning',
          message: i18n.t('每页条数必须大于0，并且是整数'),
        })
        this.filePageSize = 20
      }
      this.pageInfo.pageSize = this.filePageSize
      this.getDocumentList()
    },

    handleDocListCurrentChange(val) {
      this.pageInfo.pageNum = val
      this.getDocumentList(() => {
        this.$refs.table.$el
          .querySelector('.el-table__body-wrapper')
          .scrollTo(0, 0)
      })
    },

    uploadDocSuccess(response) {
      if (response.status == 200) {
        this.$message({
          type: 'success',
          message: `${i18n.t('上传成功')}!`,
        })
        this.getDocumentList()
        this.getFolderTree()
        this.uploadLoading.close()
      }
    },

    uploadDocError() {},

    getInitFolderTree() {
      folderQuery({ projectId: this.projectId }).then(res => {
        if (res.status == 200) {
          this.folderTree = res.data
          this.selectFolder = res.data[0]
          let array = []
          array.push(this.selectFolder)
          this.breadcrumb = array
          this.setCurrentNodeLight()
          this.getDocumentList()
        }
      })
    },

    getFolderTree() {
      folderQuery({ projectId: this.projectId }).then(res => {
        if (res.status == 200) {
          this.folderTree = res.data
          this.setCurrentNodeLight()
        }
      })
    },
    renderContent(h, { node, data }) {
      return (
        <div
          class="iconmorebox"
          on-click={() => this.HandleNode(data, node, event)}
        >
          <div class="text-pointer">
            <span>{data.label}</span>
          </div>
          {data.folderType == 0 && data.id >= 0 && (
            <div class="iconmore">
              <i class="iconfont icon-operate" />
            </div>
          )}
        </div>
      )
    },
    //文件分类事件
    HandleNode(data, node, ev) {
      if (ev.target.className.indexOf('iconfont icon-operate') !== -1) {
        this.operaBtn(data, ev)
        return
      } else {
        this.closePopMenu()
      }
      this.search = ''
      this.selectFolder = data
      this.getNodeAllParent(node)
      this.getDocumentList()
    },

    getNodeAllParent(node) {
      let temp = node
      let array = []
      while (temp) {
        if (temp.data.name) {
          array.push(temp.data)
        }
        temp = temp.parent
      }
      this.breadcrumb = array.reverse()
    },

    getDocumentList(callback) {
      this.loading = true
      docQuery({
        documentFolderId: this.selectFolder.id,
        keyWord: this.search,
        folderType: this.selectFolder.folderType,
        pageInfo: {
          pageNumber: this.pageInfo.pageNum,
          pageSize: this.pageInfo.pageSize,
        },
      })
        .then(res => {
          this.loading = false
          if (res.status == 200) {
            this.docList = res.data.result
            if (res.data.result.length === 0) {
              if (
                this.selectFolder.folderType === -1 &&
                this.selectFolder.id !== -1
              ) {
                this.getInitFolderTree()
              } else {
                this.getFolderTree()
              }
            }
            this.pageInfo.pageNum = res.data.pageInfo.pageNumber
            this.pageInfo.pageSize = res.data.pageInfo.pageSize
            this.pageInfo.pages = res.data.pageInfo.totalPages
            this.pageInfo.total = res.data.pageInfo.totalRecords
            // 如果最后一页的数据删除了则重新定位到前一页
            if (this.pageInfo.pageNum > 1 && this.docList.length === 0) {
              this.pageInfo.pageNum--
              this.getDocumentList()
            }
            callback && callback()
          }
        })
        .catch(() => {
          this.lading = false
        })
    },

    //分类更多选项
    operaBtn(data, ev) {
      ev.preventDefault()
      ev.stopPropagation()
      this.$refs.docMenu.style.display = 'block'
      this.$refs.docMenu.style.left = ev.clientX - 30 + 'px'
      this.$refs.docMenu.style.top = ev.clientY - 5 + 'px'
      this.menuData = data
    },
    //创建文件夹
    createFolder() {
      this.dialogVisible = true
      this.folderName = ''
      this.operationTitle = i18n.t('创建文件夹')
    },
    //创建子文件夹
    creatChildFolder() {
      this.dialogVisible = true
      this.folderName = ''
      this.operationTitle = i18n.t('创建子文件夹')
    },
    //修改文件夹
    editFolder() {
      this.dialogVisible = true
      this.operationTitle = i18n.t('修改文件夹')
      this.folderName = this.menuData.name
    },
    //删除文件夹
    deleteFolder() {
      this.$confirm('确认删除该文件夹及文件夹下的文档吗?', i18n.t('提示'), {
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      })
        .then(() => {
          folderDelete({ id: this.menuData.id }).then(res => {
            if (res.status == 200) {
              this.$message({
                type: 'success',
                message: `${i18n.t('删除成功')}!`,
              })

              if (this.selectFolder.key === this.menuData.key) {
                this.getInitFolderTree()
              } else {
                this.getFolderTree()
              }
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: i18n.t('已取消删除'),
          })
        })
    },
    //分类确定操作
    async saveFolder() {
      if (!this.folderName.trim()) {
        this.$message({
          type: 'info',
          message: i18n.t('输入内容为空'),
        })
        return false
      }
      if (this.operationTitle == i18n.t('创建文件夹')) {
        let res = await folderCreate({
          projectId: this.projectId,
          parentId: this.menuData.parentId,
          name: this.folderName,
        })
        if (res.status == 200) {
          this.$message({
            type: 'success',
            message: `${i18n.t('创建成功')}!`,
          })
        }
      } else if (this.operationTitle == i18n.t('创建子文件夹')) {
        let res = await folderCreate({
          projectId: this.projectId,
          parentId: this.menuData.id,
          name: this.folderName,
        })
        if (res.status == 200) {
          this.$message({
            type: 'success',
            message: `${i18n.t('创建成功')}!`,
          })
        }
      } else if (this.operationTitle == i18n.t('修改文件夹')) {
        let res = await folderUpdateName({
          id: this.menuData.id,
          name: this.folderName,
        })
        if (res.status == 200) {
          this.$message({
            type: 'success',
            message: `${i18n.t('修改成功')}!`,
          })
        }
      }
      this.dialogVisible = false
      this.getFolderTree()
    },
    //tab切换
    handleClick({ name }) {
      this.search = ''
      this.countlyLog(`project_fileDetail_${name}`)
      this.$router.replace({
        path: this.$route.path,
        query: { projectId: this.projectId, docType: this.docType },
      })

      if (this.docType === 'doc') {
        this.getInitFolderTree()
      }
    },
    //搜索确定
    searchBtn() {
      if (this.docType == 'doc') {
        this.getDocumentList()
      } else {
        this.changeDocSearchWord(this.search)
      }
    },
    //下载
    downloadDoc(row) {
      downloadFile(
        row.url +
          '?projectId=' +
          this.$getUrlParams().projectId +
          '&origName=' +
          encodeURIComponent(row.origName),
        row.origName,
      )
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
      data.append('documentId ', row.id)
      data.append('documentFolderId', row.documentFolderId)
      documentUpdate(data)
        .then(res => {
          this.getDocumentList()
          if (res.status === 200) {
            this.$message({
              type: 'success',
              message: i18n.t('文档更新成功') + '!',
            })
          }
          this.uploadLoading.close()
        })
        .catch(() => {
          this.uploadLoading.close()
        })

      return false
    },
    //重命名
    openEditDocName(row) {
      this.renameDocId = row.id
      this.renameName = row.name
      this.$nextTick(() => {
        this.$refs.rename.focus()
        // ['text', 'progress'].includes(this.inputType) && this.$refs.editable.focus();
        // this.inputType === 'time' && this.$refs.globalDatepicker.focus();
      })
      // scope.row.show = true;
      // //外部添加列表属性键值时需要获取最新数据重新渲染列表
      // this.list = JSON.parse(JSON.stringify(this.list))
      // this.$nextTick(() => {this.$refs['colTxt'].focus()})
    },
    //确认重命名
    editDocName(row) {
      if (this.renameName.trim() === '') {
        this.$message({
          type: 'warning',
          message: i18n.t('文件名不能为空'),
        })

        this.renameDocId = 0
        this.renameName = ''
        return false
      }
      if (this.renameName === row.name) {
        this.renameDocId = 0
        this.renameName = ''
        return false
      }
      if (this.renameDocId !== 0) {
        this.renameDocId = 0
        let name = this.renameName + row.format
        this.renameName = ''
        rename({ id: row.id, name: name }).then(res => {
          if (res.status == 200) {
            this.$message({
              type: 'success',
              message: i18n.t('更新成功'),
            })

            this.getDocumentList()
          }
        })
      }
      // scope.row.show = false;
      // //外部添加列表属性键值时需要获取最新数据重新渲染列表
      // this.list = JSON.parse(JSON.stringify(this.list))
    },
    //删除
    deleteDoc(row) {
      this.$confirm(`${i18n.t('确定移除')} ${row.origName}？`)
        .then(() => {
          docDelete({ id: row.id }).then(res => {
            if (res.status == 200) {
              this.$message({
                type: 'success',
                message: i18n.t('删除成功'),
              })

              this.getDocumentList()
              this.getFolderTree()
              if (this.$refs.filePreview) {
                this.$refs.filePreview.dialogVisible = false
              }
            }
          })
        })
        .catch(_ => _)
    },
    //移动
    moveDoc(row) {
      this.moveData.document = row
      this.moveData.moveTreeData = this.folderTree[0].children
      let arr = [row.documentFolderId]
      this.moveData.defaultCheckedKeys = arr
      this.moveVisible = true
      this.moveData.checkedId = row.documentFolderId
    },

    colseMoveDialog() {
      this.moveVisible = false
      this.moveData = {}
    },

    //移动tree事件
    handleNodeClick(data, checked) {
      if (checked == true) {
        this.moveData.checkedId = data.id
        this.$refs.moveFolderTree.setCheckedNodes([data])
      }
      // this.moveData.checkedKeys = [data.id]
      // if (checked===true){
      //   this.moveData.checkedId=data.id;
      //   this.$refs.moveFolderTree.setCheckedKeys([data.id]);
      //   this.moveData.checkedData=data;
      // } else {
      //   if (this.moveTreeData.checkedId===data.id){
      //     this.$refs.moveFolderTree.setCheckedKeys([data.id]);
      //   }
      // }
    },
    checkChange(data, checked) {
      if (checked) {
        let arr = [data.id]
        this.moveData.checkedId = data.id
        this.$refs.moveFolderTree.setCheckedKeys(arr)
      }
    },

    //确认移动
    moveSuerBtn() {
      this.moveVisible = false
      moveDocument(
        {
          id: this.moveData.document.id,
          folderId: this.moveData.checkedId,
        },
        { type: 'form' },
      ).then(res => {
        if (res.status === 200) {
          this.$message({
            type: 'success',
            message: i18n.t('移动成功'),
          })

          this.colseMoveDialog()
          if (this.selectFolder.folderType === 0) {
            this.getFolderTree()
          }
          this.getDocumentList()
        }
      })
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

#menu {
  display: none;
  list-style: none;
  position: fixed;
  background: #fff;
  padding: 0;
  z-index: 99999;
  border: 1px solid #e9eef6;
  box-shadow: 0 3px 12px 0 rgba(102, 102, 102, 0.15);
  border-radius: 4px;
  border-radius: 4px;
  overflow: hidden;
  li {
    cursor: pointer;
    padding: 7px 10px;
    &:hover {
      background: $color-font-active-common;
      color: #fff;
    }
  }
}
.right-btn-box {
  position: absolute;
  right: 0;
  top: -2px;
}
.lineshow {
  display: inline-block;
}
.file-tab-box {
  /deep/.el-tabs__content {
    padding-top: 40px;
  }
}
.file-doc-box {
  width: 100%;
  .file-doc-left {
    @extend .lineshow;
    height: 100%;
    background: #fff;
    width: 250px;
    border: 1px solid #dcdfe6;
    box-shadow: 0 2px 8px 0 rgba(102, 102, 102, 0.1);
    border-radius: 4px;
    border-radius: 4px;
    padding: 0 8px;
    box-sizing: border-box;
    .file-doc-left-title {
      font-size: 14px;
      padding: 16px 16px 12px;
      line-height: 19px;
      color: #333;
    }
    .file-doc-left-tree {
      height: calc(100% - 50px);
      overflow-x: hidden;
      overflow-y: auto;
      box-sizing: border-box;
    }
  }
  .file-doc-right {
    @extend .lineshow;
    height: 100%;
    width: calc(100% - 270px);
    border: 1px solid #dcdfe6;
    box-shadow: 0 2px 8px 0 rgba(102, 102, 102, 0.1);
    border-radius: 4px;
    position: relative;
    .file-doc-right-title {
      min-height: 28px;
      .detail-breadcrumb {
        float: left;
      }
    }

    .file-text {
      color: $--color-primary;
      cursor: pointer;
      margin-right: 10px;
    }
  }
}
.z--en {
  width: 200px;
}
.file-search {
  /deep/.el-form-item {
    margin-bottom: 0px;
  }
  position: absolute;
  z-index: 1;
  left: 24px;
  top: 79px;
  transform: translateY(-50%);
  .el-input {
    width: 250px;
  }
  /deep/.el-input__inner {
    padding-left: 28px;
  }
  /deep/.el-input__prefix {
    cursor: pointer;
  }
}
.file-info {
  padding: 10px 24px;
  box-sizing: border-box;
  position: relative;
}
</style>
