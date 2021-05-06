<template>
  <div
    id="dateWrap"
    class="date-wrap"
    :class="{ 'date-wrap__mode': mode === 'text' }"
  >
    <div
      v-if="mode === 'text'"
      class="select-title"
      :class="{
        hidden: mode !== 'text',
        'select-title__active': propverVisible,
      }"
      @click="handleTitleClick"
    >
      <span class="content">{{ dateValue | toDateString }}</span>
      <i
        v-if="canClearable"
        class="select-title__icon el-icon-close"
        @click.stop="handleClearClick"
      ></i>
      <i class="select-title__icon el-icon-arrow-down"></i>
      <i
        v-if="cancelable"
        class="select-title__icon el-icon-close"
        @click.stop="handleCancleClick"
      ></i>
    </div>
    <date-picker
      v-if="isCustom"
      ref="datepickercustom"
      v-model="dateValue"
      :popper-class="popperClass"
      size="mini"
      prefix-icon="clean-icon"
      :class="{ 'text-mode': mode === 'text' }"
      :type="type"
      v-bind="$attrs"
      :picker-options="_pickerOptions"
      v-on="$listeners"
      @focus="onFocus"
      @blur="onBlur"
    >
    </date-picker>
    <el-date-picker
      v-if="!isCustom"
      ref="datepickercustom"
      v-model="dateValue"
      v-bind="$attrs"
      v-on="$listeners"
      @focus="onFocus"
      @blur="onBlur"
    >
    </el-date-picker>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 过滤日期组件
 * @function1 日期增加今天、明天、可清空等功能
 * @function2 日期做周末、节假日标注功能
 * @author wuqian
 * @date 2019.12.19
 */
import DatePicker from '@/components/date-picker/src/picker/date-picker'

export default {
  name: 'CustomDate',
  components: {
    DatePicker,
  },
  filters: {
    toDateString(val) {
      if (Array.isArray(val)) {
        return val.length > 1
          ? `${val[0]} ${i18n.t('至')} ${val[1]}`
          : i18n.t('全部')
      } else {
        return val || i18n.t('全部')
      }
    },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Date, Array],
    disabledDate: {
      type: Function,
      required: false,
    },
    popperClass: {
      type: String,
      default: 'el-date-default-popper-class',
    },
    mode: {
      type: String,
      default: 'input',
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
    selectedLabel: {
      type: String,
      default: i18n.t('已选项'),
    },
    type: {
      type: String,
      default: 'daterange',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    cancelable: {
      type: Boolean,
      default: false,
    },
    pickerOptions: {
      type: Object,
    },
  },
  data() {
    return {
      dateValue: this.value,
      selectedTitle: '',
      propverVisible: false,
      rangeType: ['datetimerange', 'daterange'],
    }
  },
  computed: {
    _pickerOptions() {
      if (this.pickerOptions) {
        return this.pickerOptions
      }
      let obj = {
        shortcuts: [
          {
            text: i18n.t('最近一周'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: i18n.t('最近一个月'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: i18n.t('最近三个月'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
      }
      if (this.disabledDate) {
        obj.disabledDate = this.disabledDate
      }
      return obj
    },
    canClearable() {
      if (Array.isArray(this.dateValue)) {
        return this.clearable && this.dateValue.length
      } else {
        return this.clearable && this.dateValue
      }
    },
  },
  watch: {
    value() {
      this.dateValue = this.value
    },
  },
  methods: {
    onFocus() {
      this.propverVisible = true
    },
    onBlur() {
      this.propverVisible = false
    },
    handleTitleClick() {
      if (!this.isCustom) {
        this.$refs.datepickercustom.$el.children[0].focus()
      } else {
        this.$refs.datepickercustom.$el.click()
      }
    },
    handleCancleClick() {
      // this.dateValue = "";
      this.handleClearClick()
      this.$emit('cancel')
    },
    focus() {
      this.$refs.datepickercustom.focus()
    },
    handleClearClick() {
      this.dateValue = this.rangeType.includes(this.type) ? [] : ''
      this.$emit('change', this.dateValue)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/project/ProjectCommon.scss';
@mixin ellipsis {
  overflow: hidden !important;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.date-wrap {
  line-height: 0;
}
#dateWrap {
  .text-mode {
    width: 0;
    height: 0;
    border: 0;
    box-sizing: border-box;
    /deep/ * {
      width: 0;
      height: 0;
      border: 0;
      &:before {
        content: '';
      }
    }
    /deep/ .el-range-separator {
      display: none;
    }
  }
}

.select-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  border-radius: 3px;
  box-sizing: border-box;
  height: 32px;
  line-height: 32px;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid $--border-color-base;

  &:hover {
    border: 1px solid $--color-primary;
  }
  .content {
    @include ellipsis;
  }
  .el-icon-close {
    border-radius: 50%;
    background-color: #999;
    border: 1px solid #999;
    color: #fff;
    padding: 2px;
    transform: scale(0.7);
  }

  .el-icon-arrow-down {
    transition: transform 0.3s;
  }
}
.select-title__active {
  .el-icon-arrow-down {
    transform: rotate(180deg);
  }
}
.select-title__icon {
  margin-left: 10px;
}
</style>
