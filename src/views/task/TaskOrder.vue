<template>
  <div class="custom-order-box">
    <field-edit
      v-bind="FieldEditProps"
      :on-change="onFilterChange"
      class="custom-order-input"
    ></field-edit>
    <span class="field-edit-asside">
      <i
        :class="headerIconClass"
        class="header-icon-class"
        @click="headerIconClick"
      ></i>
    </span>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 任务排序
 * @desc
 * @author heyunjiang
 * @date 2019.7.29
 */
import FieldEdit from '@/components/field-edit'
export default {
  name: 'TaskOrder',
  components: {
    FieldEdit,
  },

  mixins: [],
  props: {},
  data() {
    return {
      isSortAsc: true, // 排序是否是升序
      FieldEditProps: {
        // FieldEdit 组件 prop
        fieldType: 'select',
        initValue: 'null',
        selectValue: [
          { key: 'null', value: i18n.t('默认排序') },
          { key: 'createTime', value: i18n.t('创建时间') },
          { key: 'endTime', value: i18n.t('结束时间') },
          { key: 'updateTime', value: i18n.t('修改时间') },
          { key: 'priority', value: i18n.t('优先级') },
        ],
      },
    }
  },
  computed: {
    headerIconClass: function() {
      return this.isSortAsc ? 'co-icon-arrow-down' : 'co-icon-arrow-up' // 后续再定方向
    },
  },

  watch: {},
  created() {},
  methods: {
    headerIconClick() {
      this.isSortAsc = !this.isSortAsc
      this.$nextTick(function() {
        this.onFilterChange(this.FieldEditProps.initValue)
      })
    },
    onFilterChange(value) {
      let order =
        value !== 'null'
          ? [
              {
                column: value,
                order: this.isSortAsc ? 'DESC' : 'ASC',
              },
            ]
          : null
      this.FieldEditProps.initValue = value
      this.$emit('orderChange', order)
    },
  },
}
</script>
<style lang="scss" scoped>
.custom-order-box {
  display: flex;
  align-items: center;
  //padding-top: 2px;
  height: 28px;
  //width: 125px;
  color: #666666;
  font-size: 12px;
  &:hover {
    color: $--color-primary;
  }
}

.custom-order-input {
  //max-width: calc(100% - 25px) !important;
  width: 100%;
}
.field-edit-asside {
  display: flex;
  align-items: center;
}
.header-icon-class {
  cursor: pointer;
  color: #666666;
  font-size: 14px;
  padding-top: 5px;
}
</style>
