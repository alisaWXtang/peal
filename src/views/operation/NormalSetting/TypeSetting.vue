<template>
  <div class="page-content__feedback">
    <columbus-tree
      v-if="treeData.length"
      class="tree-box"
      filter
      :tree-data="treeData"
      :current-node-key="typeid"
      @create="createItem"
      @update="updateItem"
      @delete="deleteItem"
      @node-click="info => (typeid = info.id)"
    />
    <co-dialog
      :title="title"
      :visible.sync="centerDialogVisible"
      width="400px"
      :close-on-click-modal="false"
      @close="_resetData"
    >
      <co-form
        v-if="centerDialogVisible"
        ref="typeForm"
        :model="typeForm"
        @submit.native.prevent
      >
        <co-form-item
          :label="$t('分类名称')"
          label-width="80px"
          class="mt15"
          prop="name"
          :rules="[
            { required: true, message: '分类名称不能为空' },
            {
              min: 0,
              max: 64,
              message: '分类名称不能超过64个字符',
              trigger: 'change',
            },
          ]"
        >
          <co-input
            v-model.trim="typeForm.name"
            v-focus
            :placeholder="$t('请输入标题')"
          ></co-input>
        </co-form-item>
      </co-form>
      <div slot="footer" class="dialog-footer">
        <co-button type="primary" @click="submit">{{ $t('确定') }}</co-button>
        <co-button @click="cancel">{{ $t('取消') }}</co-button>
      </div>
    </co-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title
 * @desc
 * @author heyunjiang
 * @date
 */
import columbusTree from '@/components/columbus-tree'
import { mapState } from 'vuex'
import { operationActionTypes } from '@/store/action-types'

export default {
  name: 'TypeSetting',
  components: {
    columbusTree,
  },

  mixins: [],
  props: {},
  data() {
    return {
      typeForm: { name: '' },
      isCreate: true, // dialog 是否是新建
      centerDialogVisible: false,
      itemInfo: {}, // 当前新建/编辑源信息
      typeid: null,
    }
  },
  computed: {
    ...mapState({
      treeData: state => state.operationFeedbackType.tree,
    }),

    title() {
      return this.isCreate ? i18n.t('创建子分类') : i18n.t('修改分类')
    },
  },

  watch: {},
  created() {},
  mounted() {
    this.$store.dispatch(
      operationActionTypes.ACTION_OPERATION_FEEDBACK_TYPETREE_QUERY,
      { type: 0 },
    )
  },
  methods: {
    _resetData(value = '') {
      this.typeForm.name = value
    },
    // 新建子分类
    createItem(info) {
      this._resetData()
      this.isCreate = true
      this.centerDialogVisible = true
      this.itemInfo = { ...info }
    },
    // 更新分类
    updateItem(info) {
      this._resetData(info.name)
      this.isCreate = false
      this.centerDialogVisible = true
      this.itemInfo = { ...info }
    },
    // 删除分类
    async deleteItem({ name, id, productId }) {
      const result = await this.confirmBeforeOperate(`确定删除分类"${name}"？`)
      if (!result) {
        return
      }
      this.typeid = this.getTreeParentId(this.treeData, id, null) // 如果删除某个节点，则保持其父节点活跃
      await this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_TYPETREE_DELETE,
        { id, productId },
      )
    },
    // 分类新建/更新
    submit() {
      this.$refs.typeForm.validate(async valid => {
        if (valid) {
          let payload = {}
          const id = +String(this.itemInfo.id).split('_')[0]
          if (this.isCreate) {
            payload = {
              productId: this.itemInfo.productId || id,
              parentId: this.itemInfo.productType === 'PRODUCT' ? 0 : id,
              name: this.typeForm.name,
            }
          } else {
            payload = {
              id: id,
              name: this.typeForm.name,
              productId: this.itemInfo.productId || id,
            }
          }
          if (
            await this.$store.dispatch(
              this.isCreate
                ? operationActionTypes.ACTION_OPERATION_FEEDBACK_TYPETREE_CREATE
                : operationActionTypes.ACTION_OPERATION_FEEDBACK_TYPETREE_UPDATE,
              payload,
            )
          ) {
            this.cancel()
          }
        }
      })
    },
    cancel() {
      this.centerDialogVisible = false
      this._resetData()
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
    // 查找父 id，不依赖树 node.parentId
    getTreeParentId(treeArray, childId, parentId) {
      if (!Array.isArray(treeArray) || !treeArray.length) return false
      // 如果能找到子节点
      if (treeArray.find(item => item.id === childId)) {
        return parentId
      } else {
        // 如果找不到，则遍历children
        let findOne = false
        for (let i = 0; i < treeArray.length; i++) {
          if (Array.isArray(treeArray[i].children)) {
            const result = this.getTreeParentId(
              treeArray[i].children,
              childId,
              treeArray[i].id,
            )

            if (result) {
              findOne = result
              break
            }
          }
        }
        return findOne
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.page-content__feedback {
  .tree-box {
    width: 100%;
    height: calc(100vh - 305px);
    /deep/.el-input {
      width: 220px !important;
      position: absolute;
      top: 10px;
      right: 20px;
    }
  }
}
</style>
