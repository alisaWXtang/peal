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
 * @title 需求排序
 * @desc
 * @author heyunjiang
 * @date 2019.9.13
 */
import FieldEdit from '@/components/field-edit'
export default {
  name: 'OrderFilter',

  components: {
    FieldEdit,
  },

  mixins: [],
  model: {
    prop: 'currentorderBy',
    event: 'orderChange',
  },
  props: {
    currentorderBy: Array,
  },

  data() {
    return {
      isSortAsc: true, // 排序是否是升序
      FieldEditProps: {
        // FieldEdit 组件 prop
        fieldType: 'select',
        initValue: 'null',
        selectValue: [
          { key: 'null', value: i18n.t('默认排序') },
          { key: 'priority', value: i18n.t('优先级') },
          { key: 'sprintId', value: i18n.t('迭代') },
          { key: 'assignUser', value: i18n.t('处理人') },
          { key: 'categoryId', value: i18n.t('需求分类') },
          { key: 'startTime', value: i18n.t('开始时间') },
          { key: 'endTime', value: i18n.t('结束时间') },
        ],
      },
    }
  },
  computed: {
    headerIconClass: function() {
      return this.isSortAsc ? 'el-icon-arrow-down' : 'el-icon-arrow-up' // 后续再定方向
    },
  },

  watch: {
    currentorderBy() {
      if (this.currentorderBy) {
        if (this.currentorderBy.length !== 1) {
          return
        }
        this.isSortAsc = this.currentorderBy[0].order === 'DESC'
        this.FieldEditProps.initValue = this.currentorderBy[0].column
      }
    },
  },

  created() {},
  methods: {
    headerIconClick() {
      this.isSortAsc = !this.isSortAsc
      this.$nextTick(function() {
        this.onFilterChange(this.FieldEditProps.initValue)
      })
    },
    onFilterChange(value) {
      let order = null
      if (value !== 'null') {
        order = [
          {
            column: value,
            order: this.isSortAsc ? 'DESC' : 'ASC',
          },
        ]
      }

      this.FieldEditProps.initValue = value
      this.$emit('orderChange', order)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/ele-variables';
.custom-order-box {
  display: flex;
  align-items: center;
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
}
</style>
