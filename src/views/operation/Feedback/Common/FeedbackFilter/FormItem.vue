<template>
  <div>
    <OpSelect
      v-if="componentType === 'OpSelect'"
      v-model="value_"
      v-bind="$attrs"
      custom-class="custom_select_popper"
      :popper-append-to-body="true"
      :remote-method="onFilter"
      @change="onChange"
    />
    <CustomDate
      v-if="componentType === 'CustomDate'"
      v-model="value_"
      v-bind="$attrs"
      popper-class="statis-time__popper"
      :popper-append-to-body="true"
      :picker-options="pickerOptions"
      :start-placeholder="$t('开始时间')"
      :end-placeholder="$t('结束时间')"
      @change="onChange"
    />
    <OpCascader
      v-if="componentType === 'OpCascader'"
      v-model="value_"
      v-bind="$attrs"
      :popper-append-to-body="true"
      :options="$attrs.options || $attrs.data"
      :clearable="false"
      is-need-label
      @change="onChange"
    />
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 反馈列表过滤项组件
 * @desc 支持选择器、日期选择器、级联选择器
 * @author wuqian
 * @date 2020.5.14
 */
import OpSelect from '@/components/op-select'
import CustomDate from '@/components/custom-date'
import OpCascader from '@/components/op-cascader'
export default {
  name: 'FormItem',
  components: { OpSelect, CustomDate, OpCascader },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    componentType: {
      type: String,
    },

    value: {
      type: [String, Number, Array],
    },
  },

  data() {
    return {
      value_: '',
      pickerOptions: {
        shortcuts: [
          {
            text: i18n.t('最近一周'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
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
      },
    }
  },

  computed: {},
  watch: {
    value: {
      handler: function(val) {
        this.value_ = val
      },
      immediate: true,
    },
  },

  created() {},
  mounted() {},
  methods: {
    onChange() {
      this.$emit('change', this.value_)
    },
    onFilter(val) {
      const key = this.$attrs?.parent?.key
      // 远端搜索的人员字段
      const remoteUserKeys = ['createUsers', 'currentProcessors', 'proposers']
      if (remoteUserKeys.includes(key)) {
        this.$emit('filterUser', {
          key,
          keyword: val,
        })
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
