<template>
  <el-dialog
    v-loading="loading"
    class="save-to-obox-view"
    :title="$t('保存至obox')"
    :visible.sync="dialogVisible"
    width="800px"
  >
    <el-tree
      :props="defaultProps"
      :load="loadpFolder"
      lazy
      :highlight-current="true"
      @current-change="currentChange"
    ></el-tree>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
      <el-button type="primary" :disabled="!currentData.id" @click="saveFile">{{
        $t('上传')
      }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  uploadToObox,
  uploadToOboxOfAttachment,
  getFolderList,
  getChildrenFolderList,
} from '@/service/file'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'document',
    },
    fileInfo: {
      type: Object,
      default: () => {
        return {
          origName: '',
          id: '',
        }
      },
    },
  },
  data() {
    return {
      loading: false,
      defaultProps: {
        label: 'name',
        // children: 'zones',
        isLeaf: 'childFolderCount',
      },
      dialogVisible: this.visible,
      currentData: {
        name: '',
        id: '',
      },
    }
  },

  watch: {
    visible(value) {
      this.dialogVisible = value
    },
    dialogVisible(value) {
      if (!value) {
        this.$emit('close', value)
      }
    },
  },

  methods: {
    saveFile() {
      this.loading = true
      let uploadFunction = uploadToObox
      if (this.type === 'attachment') {
        uploadFunction = uploadToOboxOfAttachment
      }
      uploadFunction({
        id: this.fileInfo.id,
        folderId: this.currentData.id,
        workItemId: this.fileInfo.workItemId ? this.fileInfo.workItemId : '',
        workItemType: this.fileInfo.workItemType
          ? this.fileInfo.workItemType
          : '',
      })
        .then(res => {
          this.loading = false
          if (res.status === 200) {
            this.$message({
              message: this.$t('上传成功'),
              type: 'success',
            })
            this.dialogVisible = false
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    currentChange(data) {
      this.currentData = JSON.parse(JSON.stringify(data))
    },
    loadpFolder(node, resolve) {
      if (node.level === 0) {
        getFolderList()
          .then(res => {
            if (res.status === 200) {
              const resultData = []
              if (res.data.personFolder) {
                resultData.push({ name: '个人' })
              }
              if (res.data.teamFolder) {
                resultData.push({ name: '团队' })
              }
              if (res.data.publicFolder) {
                resultData.push({ name: '企业' })
              }
              resolve(resultData)
            } else {
              resolve([])
              this.dialogVisible = false
            }
          })
          .catch(() => {
            resolve([])
            this.dialogVisible = false
          })
      } else if (node.level === 1) {
        getFolderList()
          .then(res => {
            let resultData = res.data.publicFolder
            if (node.data.name === '个人') {
              resultData = res.data.personFolder
            } else if (node.data.name === '团队') {
              resultData = res.data.teamFolder
              resolve(
                resultData.map(item => {
                  item.name = item.teamName
                  item.id = item.folderId
                  return item
                }),
              )
              return
            }
            resolve(
              resultData.map(item => {
                item.name = item.Name
                item.id = item.Id
                return item
              }),
            )
          })
          .catch(() => {
            resolve([])
          })
      } else {
        getChildrenFolderList({
          topFolderId: node.data.id,
        })
          .then(res => {
            resolve(res.data)
          })
          .catch(() => {
            resolve([])
          })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.save-to-obox-view {
  /deep/ .el-dialog__body {
    max-height: 500px;
    overflow: auto;
  }
  /deep/ .is-current > .el-tree-node__content {
    position: relative;
    &::after {
      font-family: 'iconfont' !important;
      position: absolute;
      right: 5px;
      bottom: 0;
      top: 4px;
      color: $--color-primary;
      content: '\e614';
    }
  }
}
</style>
