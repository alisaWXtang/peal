<template>
  <div class="label-box">
    <select-list-without-border
      :add-btn-name="$t('创建项目标签')"
      :list-data="labelList"
      :menu-data="menuList"
      :active-id="labelId"
      @itemClick="clickCallback"
      @add="addItem"
      @menuClick="menuClick"
    ></select-list-without-border>
    <label-dialog
      :visible.sync="labelDialogVisible"
      :value="labelDialogValue"
    ></label-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 项目标签列表
 * @desc
 * @author heyunjiang
 * @date 2020.4.13
 */

// import SelectList from '@/pages/tool/SelectList'
import SelectListWithoutBorder from '@/components/select-list/SelectListWithoutBorder'
import LabelDialog from './LabelDialog'
import { mapState } from 'vuex'

export default {
  name: 'LabelList',
  components: {
    // SelectList,
    SelectListWithoutBorder,
    LabelDialog,
  },

  mixins: [],
  props: {},
  data() {
    return {
      labelDialogVisible: false, // 标签编辑 dialog
      labelDialogValue: {
        id: null,
        name: '',
      },

      menuList: [
        {
          command: 'rename',
          title: i18n.t('重命名标签'),
        },

        {
          command: 'manage',
          title: i18n.t('管理标签'),
        },

        {
          command: 'remove',
          title: i18n.t('删除标签'),
        },
      ],
    }
  },
  computed: {
    ...mapState({
      labelList: state => state.manageViewProject.labelList,
      labelId: state => state.manageViewProject.filterInfo.labelId,
    }),
  },

  watch: {},
  mounted() {},
  methods: {
    // 单击某一项
    clickCallback(info) {
      if (this.labelId !== info.id) {
        this.$store.dispatch({
          type: 'getManageViewProjectList',
          filterInfo: {
            labelId: info.id,
            status: -1,
            keyword: '',
            pageInfo: {
              ...this.$store.state.manageViewProject.filterInfo.pageInfo,
              pageNumber: 1,
            },
          },
        })
      }
    },
    // 点击新增
    addItem() {
      this.labelDialogVisible = true
    },
    // 右侧菜单点击
    async menuClick({ command, id, name }) {
      switch (command) {
        case 'manage':
          this.$emit('labelManage', id)
          break
        case 'rename':
          this.labelDialogValue = { id, name }
          this.labelDialogVisible = true
          break
        case 'remove':
          {
            const result = await this.confirmBeforeOperate(
              `${i18n.t('确定删除标签')}"${name}"？`,
            )

            if (!result) {
              return
            }
            this.$store.dispatch('projectdeleteLabel', { id })
          }
          break
      }
    },
    // 操作前的确认
    async confirmBeforeOperate(text = '') {
      let result = null
      try {
        result = await this.$confirm(text, { type: 'warning' })
      } catch (_) {
        result = false
      }
      return result
    },
  },
}
</script>
<style lang="scss" scoped>
.label-box {
  position: relative;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}
</style>
