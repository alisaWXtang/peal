<template>
  <div class="content-outer-box">
    <div class="file-content">
      <div
        v-show="
          $authFunction('FUNC_APIDOC_ADD_CLASS', 3, $getUrlParams().projectId)
        "
        class="file-detali-box cursor-pointer"
        style="vertical-align: top;"
        @click="creatFile"
      >
        <div class="file-creat-box">
          <span class="file-creat-font"
            ><i class="el-icon-circle-plus-outline"></i
            >{{ $t('新建接口文档') }}</span
          >
        </div>
      </div>
      <div
        v-for="(item, index) in list"
        :key="index"
        class="file-detali-box cursor-pointer"
      >
        <div
          class="file-detali-box-top"
          style="width:97%;"
          :title="item.apiClassName"
          @click="toFilelist(item)"
        >
          <span class="file-dateli-font ">{{ item.apiClassName }}</span>
        </div>
        <!-- 显示更多 -->
        <div
          v-show="
            $authFunction(
              'FUNC_APIDOC_UPDATE_CLASS',
              3,
              $getUrlParams().projectId,
            ) ||
              $authFunction(
                'FUNC_APIDOC_DELETE_CLASS',
                3,
                $getUrlParams().projectId,
              )
          "
          class="file-more"
        >
          <el-popover
            placement="right"
            width="30;"
            trigger="click"
            popper-class="file-popper"
          >
            <el-button
              v-show="
                $authFunction(
                  'FUNC_APIDOC_UPDATE_CLASS',
                  3,
                  $getUrlParams().projectId,
                )
              "
              class="cursor-pointer file-plus-hover"
              type="text"
              @click="editEvent(item)"
              >{{ $t('编辑') }}</el-button
            >
            <el-button
              v-show="
                $authFunction(
                  'FUNC_APIDOC_DELETE_CLASS',
                  3,
                  $getUrlParams().projectId,
                )
              "
              class="cursor-pointer file-plus-hover"
              type="text"
              @click="deleteDoc(item)"
              >{{ $t('删除') }}</el-button
            >
            <span
              slot="reference"
              class="iconfont icon-operate fr"
              @click="moreEvent"
            >
            </span>
          </el-popover>
        </div>

        <div class="file-detali-box-bottom" @click="toFilelist(item)">
          <span class="file-user-font"
            >{{ item.createUserName }}({{ item.createUserId }})&nbsp;{{
              $t('于')
            }}&nbsp;{{ item.createTime | substringTime }}&nbsp;{{
              $t('创建')
            }}</span
          >
          <span class="file-user-font fr"
            >{{ item.apiCount }}{{ $t('个') }}</span
          >
        </div>
      </div>
    </div>
    <!-- 新建文档dialog -->
    <el-dialog
      :title="$t('新建接口文档')"
      :visible.sync="diagloshow"
      width="20%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="ruleForm" :model="ruleForm" @submit.native.prevent>
        <el-form-item
          :label="$t('文档名称')"
          :label-width="$isEnglish() ? '100px' : '80px'"
          prop="fileName"
          :rules="[
            {
              required: true,
              message: $t('文档名称不能为空'),
            },
            {
              min: 0,
              max: 80,
              message: $t('文档名称不能超过80个字符'),
              trigger: 'blur',
            },
            {
              min: 0,
              max: 80,
              message: $t('文档名称不能超过80个字符'),
              trigger: 'change',
            },
          ]"
        >
          <el-input
            ref="interfaceInput"
            v-model.trim="ruleForm.fileName"
            v-focus
            :placeholder="$t('请输入标题')"
            @keyup.native.enter="submitForm('ruleForm')"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancleBtn('ruleForm')">{{ $t('取消') }}</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="submitForm('ruleForm')"
          >{{ $t('确定') }}</el-button
        >
      </div>
    </el-dialog>
    <!-- 编辑名称 -->
    <el-dialog
      :title="$t('编辑名称')"
      :visible.sync="editdiagloshow"
      width="26%"
      :close-on-click-modal="false"
    >
      <el-form ref="editForm" :model="editForm" @submit.native.prevent>
        <el-form-item
          :label="$t('文档名称')"
          :label-width="$isEnglish() ? '100px' : '80px'"
          prop="fileName"
          :rules="[
            {
              required: true,
              message: $t('文档名称不能为空'),
            },
            {
              min: 0,
              max: 80,
              message: $t('文档名称不能超过80个字符'),
              trigger: 'blur',
            },
            {
              min: 0,
              max: 80,
              message: $t('文档名称不能超过80个字符'),
              trigger: 'change',
            },
          ]"
        >
          <el-input
            ref="interfaceInput"
            v-model.trim="editForm.fileName"
            v-focus
            :placeholder="$t('请输入标题')"
            @keyup.native.enter="editDoc"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editdiagloshow = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" :loading="loading" @click="editDoc">{{
          $t('确定')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { mapState, mapMutations } from 'vuex'
import apiDoc from '@/service/file'
export default {
  name: 'FileCreat',
  //mixins: [ProjectCommonMixin],
  components: {},
  filters: {
    substringTime(time) {
      return time ? time.substring(0, 10) : ''
    },
  },
  data() {
    return {
      list: [],
      ruleForm: {
        fileName: '',
      },
      editForm: {
        fileName: '',
      },
      listLoading: false,
      diagloshow: false,
      editdiagloshow: false,
      isShowTip: false, //显示文档名称提示
      projectId: 0,
      apiClassId: 0,
      importUrl: '',
      loading: false,
    }
  },
  computed: {
    ...mapState({
      apiId: state => state.fe.apiId,
      docSearchWord: state => state.fe.docSearchWord,
    }),
  },

  watch: {
    docSearchWord: function() {
      this.getDoc()
    },
    diagloshow(newValue) {
      if (newValue) {
        this.assocInputGetFocus('interfaceInput')
      }
    },
    editdiagloshow(newValue) {
      if (newValue) {
        this.assocInputGetFocus('editFileName')
      }
    },
  },
  mounted() {
    this.projectId = this.$getUrlParams().projectId
    this.importUrl = '/api/apidoc/import?projectId=' + this.projectId
    this.initApiClassList()
  },
  methods: {
    //编辑和新建接口input获取焦点
    assocInputGetFocus(inputName) {
      this.$nextTick(() => {
        const interfaceInput = this.$refs[inputName]
        interfaceInput && interfaceInput.$refs.input.focus()
      })
    },
    ...mapMutations([
      'filePageSwitch',
      'fileApiId',
      'fileApiTypeId',
      'sortListDataFun',
      'changeDocSearchWord',
    ]),

    initApiClassList() {
      if (this.docSearchWord.trim() !== '') {
        this.changeDocSearchWord('')
      } else {
        this.getDoc()
      }
    },

    importDocError() {
      this.$message({
        message: i18n.t('上传失败'),
        type: 'error',
      })
    },

    importDocSuccess(response) {
      if (response.status == 200) {
        this.$message({
          message: i18n.t('导入成功'),
          type: 'success',
        })

        this.getDoc()
      } else {
        this.$message({
          message: response.msg,
          type: 'error',
        })
      }
    },

    exportDoc(item) {
      window.location.href =
        '/api/apidoc/export?projectId=' +
        this.projectId +
        '&apiClassId=' +
        item.apiClassId
    },

    //编辑文档
    editDoc() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.loading = true
          apiDoc
            .updateClass({
              apiClassId: this.apiClassId,
              apiClassName: this.editForm.fileName,
            })
            .then(res => {
              this.loading = false
              if (res.status === 200) {
                this.$message({
                  message: i18n.t('修改成功'),
                  type: 'success',
                })
                this.editdiagloshow = false
                this.editForm.fileName = ''
                this.getDoc()
              }
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          return false
        }
      })
    },
    //删除文档
    deleteDoc(item) {
      this.hideTips()
      this.$confirm('删除文档将无法恢复，确定删除！', i18n.t('提示'), {
        distinguishCancelAndClose: true,
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      }).then(() => {
        apiDoc
          .deleteClass({
            apiClassId: item.apiClassId,
          })
          .then(res => {
            if (res.status == 200) {
              this.$message({
                message: i18n.t('删除成功'),
                type: 'success',
              })

              this.getDoc()
            }
          })
      })
    },
    //创建文档验证
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.createDoc(formName)
        } else {
          return false
        }
      })
    },
    //创建文档
    createDoc() {
      this.loading = true
      apiDoc
        .saveClass({
          projectId: this.projectId,
          apiClassName: this.ruleForm.fileName,
        })
        .then(res => {
          this.loading = false
          if (res.status === 200) {
            this.$message({
              message: i18n.t('新建成功'),
              type: 'success',
            })

            this.diagloshow = false
            this.ruleForm.fileName = ''
            this.getDoc()
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 获取文档
    getDoc() {
      this.listLoading = true
      apiDoc
        .getClass({
          projectId: this.projectId,
          keyWord: this.docSearchWord,
        })
        .then(res => {
          this.listLoading = false
          this.list = res.data
        })
    },

    creatFile() {
      this.diagloshow = true
      this.ruleForm.fileName = ''
    },
    cancleBtn(formName) {
      this.$refs[formName].resetFields()
      this.diagloshow = false
    },
    editEvent(item) {
      this.editForm.fileName = item.apiClassName || ''
      this.apiClassId = item.apiClassId
      this.editdiagloshow = true
      this.hideTips()
    },
    deleteEvent() {},
    moreEvent() {},
    //隐藏tips
    hideTips() {
      let classList = [...document.getElementsByClassName('file-popper')]
      classList.forEach(el => {
        el.style.display = 'none'
      })
    },
    // 跳转至文档详情列表
    toFilelist(item) {
      this.filePageSwitch(true)
      this.$goToPage(this, 'fileList', {
        projectId: this.$getUrlParams().projectId,
        apiClassId: item.apiClassId,
      })
    },
    //弹窗关闭前的回调
    handleClose() {},
  },
}
</script>
<style lang="scss">
.file-popper {
  min-width: 60px;
  padding: 0;
  border-radius: 4px;
  .el-button {
    width: 100%;
  }
}
</style>
<style lang="scss" scoped>
.file-plus-hover {
  display: block;
  margin-left: 1px;
  &:hover {
    background: #d5ebfc;
  }
}
.file-content {
  min-height: 700px;
  display: inline-block;
  // flex-wrap: wrap;
  .file-creat-box {
    text-align: center;
    line-height: 100px;
  }

  .file-detali-box {
    width: 300px;
    height: 106px;
    margin: 4px 10px;
    padding: 0 10px;
    border-radius: 5px;
    border: 1px solid #ececec;
    display: inline-block;
    position: relative;
    .file-more {
      position: absolute;
      top: 23px;
      right: 10px;
    }
    &:hover {
      // color: #3c85d2;
      background: #ececec;
      // border: 1px solid #3c85d2;
      box-shadow: 1px 6px 10px #c9c7c7;
    }
    .file-creat-font {
      font-size: 22px;
      font-weight: 600;
      color: $--color-primary;
      i {
        transform: scale(1.2);
        padding: 5px;
      }
    }

    .file-detali-box-top {
      padding: 20px 0;
      .file-dateli-font {
        font-size: 22px;
        font-weight: 600;
        width: 282px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
      }
    }
    .file-detali-box-bottom {
      .file-user-font {
        // font-size: 22px;
        // font-weight: 600;
      }
    }
  }
}
</style>
