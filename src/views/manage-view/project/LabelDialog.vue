<template>
  <co-dialog
    v-loading="loading"
    :title="dialogTitle"
    width="420px"
    :visible.sync="currentVisible"
    close-on-click-modal
    @closed="resetDate"
  >
    <el-input
      v-model.trim="currentValue.name"
      style="width: 100%;"
      maxlength="20"
      size="small"
      :placeholder="$t('请输入标签名称，字数控制20字以内')"
      @keyup.native.enter="submit"
    ></el-input>
    <div slot="footer">
      <co-button size="small" @click="closeDialog">{{ $t('取消') }}</co-button>
      <co-button type="primary" size="small" @click="submit">{{
        $t('确定')
      }}</co-button>
    </div>
  </co-dialog>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 项目标签新建/编辑
 * @desc
 * @author heyunjiang
 * @date 2020.4.15
 */
import debounce from 'lodash/debounce'

export default {
  name: 'LabelDialog',
  components: {},
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      required: true,
    },

    value: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      currentVisible: this.visible,
      currentValue: {
        id: this.value.id,
        name: this.value.name,
      },

      loading: false,
    }
  },
  computed: {
    dialogTitle() {
      return this.currentValue.id
        ? i18n.t('编辑项目标签')
        : i18n.t('创建项目标签')
    },
  },

  watch: {
    value() {
      this.currentValue = { ...this.value }
    },
    visible() {
      this.currentVisible = this.visible
    },
    currentVisible() {
      if (this.currentVisible !== this.visible) {
        this.$emit('update:visible', this.currentVisible)
      }
    },
  },

  created() {},
  mounted() {},
  methods: {
    submit: debounce(async function() {
      if (this.currentValue.name?.length === 0) {
        this.$message({
          type: 'warning',
          message: '标签名称不能为空',
        })

        return
      }
      this.loading = true
      const type = this.currentValue.id
        ? 'projectUpdateLabel'
        : 'projectAddLabel'
      await this.$store.dispatch(type, this.currentValue)
      this.closeDialog()
    }, 300),
    closeDialog() {
      this.currentVisible = false
      this.loading = false
    },
    // 数据重置 - 关闭 dialog 时
    resetDate() {
      this.currentValue = {
        id: null,
        name: '',
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
