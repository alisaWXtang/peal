<template>
  <div>
    <div class="mb20">
      <div v-if="filterInfo.type == 0" class="report-content-title">
        <span class="content-title">{{ $t('类型') }}:{{ $t('文本') }}</span>
        <div class="fr">
          <el-button type="text" @click="saveBtn(false)">{{
            $t('保存')
          }}</el-button>
          <el-button type="text" @click="cancleBtn(false)">{{
            $t('取消')
          }}</el-button>
        </div>
      </div>
      <div v-if="filterInfo.type == 0" class="report-text-edit">
        <tiny-mce :value="content" @watch="editHnadle($event)"></tiny-mce>
      </div>
      <!-- 遍历时展示 -->
      <div v-if="reportData.workType == 0" class="report-content-title">
        <span class="content-title"
          >{{ index + 1 }}.{{ $t('类型') }}:{{ reportData.titleContent }}</span
        >
        <div class="fr">
          <el-button
            v-if="!show"
            type="text"
            icon="co-icon-edit"
            @click="editBtn(reportData)"
            >{{ $t('编辑') }}</el-button
          >
          <el-button
            v-if="!show"
            type="text"
            icon="co-icon-delete"
            @click="deleteBtn(reportData)"
            >{{ $t('删除') }}</el-button
          >
          <el-button v-if="show" type="text" @click="saveBtn(reportData)">{{
            $t('保存')
          }}</el-button>
          <el-button v-if="show" type="text" @click="cancleBtn(reportData)">{{
            $t('取消')
          }}</el-button>
        </div>
      </div>
      <div v-if="reportData.workType == 0" class="report-text-edit">
        <div
          v-if="!show"
          class="edit-box-bug-inactive"
          v-html="reportData.contentDetails[0]"
        ></div>
        <tiny-mce
          v-if="show"
          :value="reportData.contentDetails[0]"
          @watch="editHnadle($event)"
        ></tiny-mce>
      </div>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import TinyMce from '@/components/tinymce'

export default {
  name: 'ReportContentText',
  components: { TinyMce },
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
      content: '',
      show: false,
    }
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    editHnadle(ev) {
      this.content = ev
      if (this.content) {
        this.$emit('textFun', {
          status: 'unadd',
          textShow: true,
          save: false,
          data: {
            workTitle: i18n.t('文本'),
            contents: this.content,
          },
        })
      }
    },
    //保存
    saveBtn(data) {
      if (data) {
        // if (!this.content) {
        //   return false
        // }
        this.$emit('tableFun', {
          type: 0,
          show: true,
          index: this.index,
          data: {
            workTitle: data.titleContent || i18n.t('文本'),
            contents: this.content,
          },
        })

        this.show = false
        this.content = ''
        //清空渲染的文本
        this.$emit('textFun', {
          status: 'unadd',
          textShow: false,
          data: {
            workTitle: data.titleContent || i18n.t('文本'),
            contents: this.content,
          },
        })
      } else {
        this.$emit('textFun', {
          status: 'add',
          data: {
            workTitle: i18n.t('文本'),
            contents: this.content,
          },
        })

        //清空渲染的文本
        this.$emit('textFun', {
          status: 'unadd',
          textShow: false,
          data: {
            workTitle: i18n.t('文本'),
            contents: '',
          },
        })

        this.filterInfo.type = -1
        this.$emit('update:filterInfo', this.filterInfo)
      }
    },
    //编辑
    editBtn() {
      this.show = true
    },
    deleteBtn(data) {
      this.$confirm(i18n.t('确认删除该报告内容?'), i18n.t('提示'), {
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      })
        .then(() => {
          this.$emit('textFun', {
            type: 6,
            show: true,
            index: this.index,
            data,
            status: 'delete',
          })
        })
        .catch(() => {})
    },
    cancleBtn(n) {
      if (n) {
        this.show = false
      } else {
        this.filterInfo.type = -1
        this.content = ''
        this.$emit('update:filterInfo', this.filterInfo)
      }
      //清空渲染的文本
      this.$emit('textFun', {
        status: 'unadd',
        textShow: false,
        data: {
          workTitle: i18n.t('文本'),
          contents: '',
        },
      })

      this.$message({
        type: 'success',
        message: i18n.t('取消成功'),
      })
    },
  },
}
</script>
<style lang="scss" scoped>
// .report-text-edit {
//   // margin-left:30px ;
//   padding: 0 5px;
// }
</style>
