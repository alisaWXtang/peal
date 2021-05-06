<template>
  <div>
    <div v-if="filterInfo.type == 6">
      <div class="report-content-title">
        <span class="content-title">{{ $t('类型') }}:{{ $t('附件') }}</span>
        <div class="fr">
          <!-- <el-button type="primary">保存</el-button> -->
          <el-button type="text" icon="co-icon-delete" @click="deleteFun('')">{{
            $t('删除')
          }}</el-button>
        </div>
      </div>
      <div class="upload-container">
        <!-- <span>附件</span> -->
        <!-- <span class="report-add" @click="addFun">添加</span> -->
        <file-upload
          :file-updaload-box-status="fileListShow"
          :uploaded-file-list="fileDataList"
          :handle-file-delete="deleteAttachment"
          :detail-info-id="requireId"
          :handle-upload-success="handleUploadSuccess"
          :is-need-related-file="false"
          work-item-type="1"
          :add-file-text="1"
        ></file-upload>
      </div>
    </div>
    <div v-if="reportData.workType == 6">
      <div class="report-content-title">
        <span class="content-title"
          >{{ index + 1 }}{{ $t('类型') }}:{{ reportData.workTitle }}</span
        >
        <div class="fr">
          <!-- <el-button type="primary">保存</el-button> -->
          <el-button
            type="text"
            icon="co-icon-delete"
            @click="deleteFun(reportData)"
            >{{ $t('删除') }}</el-button
          >
        </div>
      </div>
      <div class="upload-container">
        <!-- <span>附件</span> -->
        <!-- <span class="report-add" @click="addFun">添加</span> -->
        <file-upload
          :file-updaload-box-status="fileListShow"
          :uploaded-file-list="reportData.contentDetails"
          :handle-file-delete="deleteAttachment"
          :detail-info-id="requireId"
          :handle-upload-success="handleUploadSuccess"
          :is-need-related-file="false"
          work-item-type="1"
          :add-file-text="1"
          @upDataUpload="upDataUpload"
        ></file-upload>
      </div>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import FileUpload from '@/components/file-upload'
import { attachmentDelete } from '@/service/attachment'

export default {
  name: 'ReportContentTable',
  components: { FileUpload },
  mixins: [],
  props: {
    filterInfo: {
      type: Object,
      required: false,
      desc: i18n.t('添加报告内容相关操作获得的信息'),
    },

    reportData: {
      type: Object,
      required: true,
    },

    index: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      fileListShow: true,
      fileDataList: [],
      requireId: 0,
    }
  },
  computed: {},
  watch: {
    fileDataList: {
      handler() {
        if (this.reportData.workType == 6) {
          // let arr = this.reportData.contentDetails.map((item)=>{
          //   return item.id;
          // })
          // // [...new Set(ary)]
          // this.$emit('handleUpload', {type:6,status:'cancle',index:this.index,data:{
          //   workTitle:'附件',
          //   enclosureIds:arr
          // }});
        } else {
          let fileDataList = this.fileDataList.map(item => {
            return item.id
          })
          this.$emit('handleUpload', {
            type: 6,
            index: this.index,
            data: {
              workTitle: i18n.t('附件'),
              enclosureIds: fileDataList,
            },
          })
        }
        this.filterInfo.type = -1
        this.$emit('update:filterInfo', this.filterInfo)
      },
      deep: true,
    },
  },

  created() {},
  methods: {
    //监听文件是否更新
    upDataUpload(val) {
      if (this.reportData.workType == 6) {
        let arr = []
        if (val) {
          arr = this.reportData.contentDetails.filter(item => {
            return item.id !== val
          })
          this.reportData.contentDetails = arr
          arr = arr.map(item => {
            return item.id
          })
        } else {
          this.reportData.contentDetails = [
            ...this.fileDataList,
            ...this.reportData.contentDetails,
          ]

          arr = this.reportData.contentDetails.map(item => {
            return item.id
          })
          this.fileDataList = []
        }
        this.$emit('handleUpload', {
          type: 6,
          status: 'cancle',
          index: this.index,
          data: {
            workTitle: i18n.t('附件'),
            enclosureIds: arr,
          },
        })
      }
    },
    //删除
    deleteFun(data) {
      if (data) {
        this.$confirm(i18n.t('确认删除该报告内容?'), i18n.t('提示'), {
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        })
          .then(() => {
            this.$emit('handleUpload', {
              type: 6,
              status: 'delete',
              index: this.index,
              data,
              choose: false,
            })
          })
          .catch(() => {})
      } else {
        this.filterInfo.type = -1
        this.$emit('update:filterInfo', this.filterInfo)
      }
    },
    handleUploadSuccess(res) {
      if (res.status !== 200) {
        this.$message({
          message: res.msg || i18n.t('文件上传失败'),
          type: 'error',
        })

        return
      }
      this.fileDataList.push(res.data)
      this.upDataUpload(false)
    },
    deleteAttachment(info) {
      if (this.requireId === -1) {
        return
      }
      let id = info.id
      attachmentDelete({
        attachmentId: id,
        workItemType: 1,
        workItemId: 1,
      }).then(ret => {
        if (ret.status == 200) {
          let oldList = this.fileDataList
          this.fileDataList = []
          oldList.forEach(attach => {
            if (attach.id != id) {
              this.fileDataList.push(attach)
            }
          })

          let arr = this.reportData.contentDetails.filter(item => {
            return item.id !== id
          })
          arr = arr.map(item => {
            return item.id
          })
          this.$emit('handleUpload', {
            type: 6,
            status: 'deletechild',
            index: this.index,
            data: {
              workTitle: i18n.t('附件'),
              enclosureIds: arr,
            },
          })

          // this.upDataUpload(id)
        } else {
          // this.$message({
          //   type: "error",
          //   message: ret.msg || "删除失败!"
          // });
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
// .report-text {
//   height: 37px;
//   background-color: transparent;
//   line-height: 37px;
//   margin: 22px 5px 0px;
//   padding-right: 5px;
// }
.report-add {
  color: #239ce2;
  cursor: pointer;
}
.upload-container {
  margin-top: 10px;
}

/deep/ {
  .el-upload-dragger {
    background-color: #fff;

    .el-upload__text {
      display: none;
    }
  }
  // .fileUploadBoxMini .el-upload {
  //   height: 20px !important;
  //   width: 150px !important;
  // }
}
</style>
