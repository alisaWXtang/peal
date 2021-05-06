<template>
  <el-dialog
    :title="$t('接口导出')"
    :visible="dialogVisible"
    width="800px"
    class="export-dialog"
    :append-to-body="true"
    :destroy-on-close="true"
    @close="closeDialog"
  >
    <div class="export-content">
      <div class="content-item">
        <label>{{ $t('导出类型') }}：</label>
        <el-select
          v-model="exportTypeValue"
          :placeholder="$t('请选择导出类型')"
        >
          <el-option
            v-for="item in exportTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div class="content-item mt10">
        <label class="as-top">{{ $t('接口列表') }}：</label>
        <div class="api-list">
          <div class="select-all-box">
            <el-checkbox v-model="checkedAll" @change="onChangeSelectAll">{{
              $t('全选')
            }}</el-checkbox>
          </div>
          <el-tree
            ref="apiTreeRef"
            :data="newTreeData"
            show-checkbox
            node-key="id"
            :props="treeProps"
            @check="onCheck"
          >
          </el-tree>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">{{ $t('取消') }}</el-button>
      <el-button
        type="primary"
        :loading="exportBtnLoading"
        @click="handleExport"
        >{{ $t('导出') }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import api from '@/api/file'
import axios from 'axios'
import { getRealUrl } from '@/utils/sub-app-util'
import { getAuthorization } from '@oppo/helper-sso'

export default {
  name: 'FileExportDialog',
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    treeData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      exportTypes: [
        {
          value: 'html',
          label: 'html',
        },
        {
          value: 'json',
          label: 'json',
        },
      ],
      selectedIds: [],
      exportTypeValue: 'html',
      exportBtnLoading: false,
      checkedAll: false,
      treeProps: {
        children: 'apiListBoList',
        label: 'name',
      },
    }
  },
  computed: {
    dialogVisible() {
      return this.showDialog
    },
    newTreeData() {
      return this.treeData.filter(item => {
        return item.apiListBoList.length
      })
    },
    treeLeafLength() {
      return this.treeData.reduce((len, d) => len + d.apiListBoList.length, 0)
    },
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog')
    },
    onChangeSelectAll(val) {
      if (val) {
        const parentIds = this.treeData.map(d => d.id)
        this.$refs.apiTreeRef.setCheckedKeys(parentIds)
      } else {
        this.$refs.apiTreeRef.setCheckedKeys([])
      }
    },
    onCheck(data, { checkedNodes }) {
      this.selectedIds = checkedNodes.reduce(
        (arr, item) => (item.apiPath ? [...arr, item.id] : arr),
        [],
      )
      console.log(this.selectedIds, this.treeData)
      this.checkedAll = this.selectedIds.length === this.treeLeafLength
    },
    // 导出
    async handleExport() {
      this.selectedIds = this.$refs.apiTreeRef.getCheckedKeys(true)
      if (!this.selectedIds.length) {
        this.$message.error(`${this.$t('请勾选需要导出的接口文档')}！`)
        return
      }
      this.exportBtnLoading = true
      try {
        let url = null
        if (this.exportTypeValue === 'json') {
          url =
            api.apiDoc.exportApiJson.url +
            '?projectId=' +
            this.$getUrlParams().projectId
        } else {
          url =
            api.apiDoc.exportApiDoc.url +
            '?projectId=' +
            this.$getUrlParams().projectId
        }
        let res = await axios.post(
          getRealUrl(url),
          {
            apiClassId: this.$route.query.apiClassId,
            apiIds: this.selectedIds,
          },
          {
            headers: {
              Accept: 'content-disposition',
              Authorization: getAuthorization(),
            },
          },
        )
        // 获取文件名
        // const fileName = decodeURI(
        //   res.headers['content-disposition']?.split('filename=')[1] ||
        //     ('api' + this.exportTypeValue === 'json' ? '.json' : '.html'),
        // )
        console.log(res)
        const fileName =
          this.exportTypeValue === 'json' ? 'api.json' : 'api.html'
        const file =
          this.exportTypeValue === 'json' ? JSON.stringify(res.data) : res.data
        this.download(file, fileName)
        this.exportBtnLoading = false
      } catch (error) {
        this.exportBtnLoading = false
        this.$message.error(this.$t('未知错误'))
      }
    },
    // 处理下载流
    download(content, fileName) {
      const blob = new Blob([content]) // 创建一个类文件对象：Blob对象表示一个不可变的、原始数据的类文件对象
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName)
      } else {
        const url = window.URL.createObjectURL(blob) // URL.createObjectURL(object)表示生成一个File对象或Blob对象
        const dom = document.createElement('a') // 设置一个隐藏的a标签，href为输出流，设置download
        dom.style.display = 'none'
        dom.href = url
        dom.setAttribute('download', fileName) // 指示浏览器下载url,而不是导航到它；因此将提示用户将其保存为本地文件
        document.body.appendChild(dom)
        dom.click()
        document.body.removeChild(dom) // 移除
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.export-dialog {
  /deep/ .el-dialog {
    height: 70vh;
    display: flex;
    flex-direction: column;

    .el-dialog__body {
      flex: 1;
      overflow-y: auto;
    }

    .el-dialog__footer {
      padding-top: 16px;
    }
  }

  .export-content {
    .content-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      label {
        width: 80px;
      }

      .as-top {
        align-self: flex-start;
      }

      .select-all-box {
        margin: 0 0 5px 24px;
      }

      /deep/ .el-select {
        width: 200px;
      }
    }
  }
}
</style>
