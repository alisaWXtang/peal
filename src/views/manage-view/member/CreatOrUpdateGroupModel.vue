<template>
  <el-dialog
    :title="title"
    width="420px"
    :visible.sync="showDialog"
    destroy-on-close
    class="model"
    close-on-click-modal
    @closed="afterClose"
  >
    <div class="model-input">
      <el-input
        v-model.trim="value"
        type="text"
        :placeholder="$t('请输入团队名称,限20字')"
        maxlength="20"
        size="small"
      ></el-input>
    </div>
    <div class="model-footer">
      <el-button size="small" @click="showDialog = false">{{
        $t('取消')
      }}</el-button>
      <el-button type="primary" size="small" @click="submitModel">{{
        $t('确定')
      }}</el-button>
    </div>
  </el-dialog>
</template>
<script>
/**
 * @title 创建 or 重命名团队
 * @desc 编辑弹窗
 * @author lili
 * @date 2020.4.16
 */
export default {
  name: 'CreatOrUpdateGroupModel',
  props: {
    content: {
      type: String,
      required: false,
      default: '',
      desc: '输入框值',
    },

    title: {
      type: String,
      required: true,
      default: '',
      desc: '弹窗名称',
    },

    showModel: {
      type: Boolean,
      required: true,
      default: false,
      desc: '弹窗是否显示',
    },
  },

  data() {
    return {
      value: '',
      showDialog: false,
    }
  },

  watch: {
    showModel(val) {
      this.showDialog = val
      if (val) {
        this.value = this.content
      }
    },
  },
  created() {},
  methods: {
    submitModel() {
      this.$emit('submitModel', { value: this.value })
    },
    afterClose() {
      this.value = ''
      this.$emit('update:showModel', false)
    },
  },
}
</script>
<style lang="scss" scoped>
.model {
  .model-input {
    padding: 0 10px;
    margin-bottom: 20px;
    /deep/ .el-input__inner {
      border: 1px solid #e5e5e5 !important;
    }
  }
  .model-footer {
    text-align: right;
  }
}
</style>
