<template>
  <el-select
    ref="select"
    v-model="selectValue"
    v-bind="$attrs"
    :placeholder="placeholder"
    :remote="isProjectUserSelect"
    :remote-method="userRemoteSearch"
    :loading="loading"
    v-on="$listeners"
    @change="setSelected"
  >
    <div class="select-scroll">
      <el-option
        v-if="openClear && multiple"
        :label="$t('清除选中')"
        value=""
        @click.native="clearAll"
      ></el-option>
      <el-option
        v-if="openAll && multiple"
        :label="$t('全部')"
        value="all"
        @click.native="pickAll"
      ></el-option>
      <template v-if="$attrs.group">
        <el-option-group
          v-for="group in selectListVo"
          :key="group[$attrs['group-label-key']]"
          :label="group[$attrs['group-label-key']]"
        >
          <el-option
            v-for="data in group.children"
            :key="data.localValue"
            :value="data.localValue"
            :label="data.localLabel"
          >
            <span
              v-if="data.color"
              class="option-text"
              :style="{ 'background-color': data.color, color: '#fff' }"
              >{{ data.localLabel }}</span
            >
            <template v-else>{{ data.localLabel }}</template>
          </el-option>
        </el-option-group>
      </template>
      <template v-else>
        <el-option
          v-for="item in selectListVo"
          v-show="!((isUserSelect && item.status === 0) || item.hidden)"
          :key="item.localValue"
          :label="item.localLabel"
          :value="item.localValue"
        >
          <span
            v-if="item.color"
            class="option-text"
            :style="{ 'background-color': item.color, color: '#fff' }"
            >{{ item.localLabel }}</span
          >
          <template v-else>
            {{ item.localLabel }}
          </template>
        </el-option>
      </template>
    </div>
  </el-select>
</template>

<script>
/**
 * @title 过滤筛选select组件
 * @author chenxiaolong
 * @date 2020.11.06
 */
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import { projectUsers } from '@/service/statement'
export default {
  name: 'FilterSelect',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: [String, Number, Array],
      desc: 'v-model值',
    },
    labelKey: {
      type: String,
      default: 'label',
      desc: 'labelKey',
    },
    valueKey: {
      type: String,
      default: 'value',
      desc: 'value key',
    },
    selectList: {
      type: [Array, Object],
      required: true,
      desc: '候选项',
    },
    isUserSelect: {
      type: Boolean,
      default: false,
      desc: '是否是用户选择',
    },
    openAll: {
      type: Boolean,
      default: false,
      desc: '是否打开全选',
    },
    openClear: {
      type: Boolean,
      default: false,
      desc: '是否打开清空',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      projectId: this.$route.query.projectId,
      selectValue: [],
      originSelectList: [],
      selectListVo: [],
      loading: false,
    }
  },
  computed: {
    isProjectUserSelect() {
      return this.projectId && this.isUserSelect
    },
    multiple() {
      return this.$attrs.multiple
    },
    isGroup() {
      return this.$attrs.group
    },
  },
  watch: {
    value: {
      handler: function(val) {
        if (this.multiple) {
          this.selectValue =
            Array.isArray(val) && val.length ? [...val] : ['all']
        } else {
          this.selectValue = val
        }
      },
      immediate: true,
    },
    selectList: {
      handler: function(val) {
        this.selectListVo = val.map(item => {
          if (this.isGroup) {
            return {
              ...item,
              children: item.children.map(child => {
                return {
                  ...child,
                  localLabel: child[this.labelKey],
                  localValue: child[this.valueKey],
                }
              }),
            }
          }

          return {
            ...item,
            localLabel: item[this.labelKey],
            localValue: item[this.valueKey],
          }
        })
        this.originSelectList = cloneDeep(this.selectListVo)
      },
      immediate: true,
    },
    // 在有默认值时切换单选多选会报错
    multiple(multiple) {
      const value = this.value
      if (multiple) {
        this.selectValue = Array.isArray(value)
          ? [...value]
          : value
          ? [value]
          : []
      } else {
        this.selectValue = value
      }
    },
  },
  methods: {
    setSelected(val) {
      if (this.multiple && val.length > 1 && val[0] === 'all') {
        this.selectValue.splice(0, 1)
      }

      const selectValue =
        this.multiple &&
        this.selectValue.length === 1 &&
        this.selectValue.indexOf('all') > -1
          ? []
          : this.selectValue

      this.$nextTick(() => {
        this.$emit('change', selectValue)
      })
    },
    clearAll() {
      this.selectValue = ['all']
      this.$emit('change', [])
    },
    pickAll() {
      this.selectValue = ['all']
      this.$emit('change', [])
    },
    userRemoteSearch: debounce(function(query) {
      const selectValue = []
      if (Array.isArray(this.selectValue)) {
        for (const item of this.selectValue) {
          if (item === 'all' || !item) {
            continue
          }

          const data = this.originSelectList.find(obj => obj.userId === item)
          data && selectValue.push({ ...data, hidden: true })
        }
      } else if (this.selectValue) {
        const data = this.originSelectList.find(
          obj => obj.userId === this.selectValue,
        )

        data && selectValue.push({ ...data, hidden: true })
      }

      if (query) {
        this.loading = true
        this.getUserList(query)
          .then(userData => {
            if (userData) {
              this.selectListVo = [...selectValue, ...userData]
            }
          })
          .finally(() => {
            this.loading = false
          })
      } else {
        this.selectListVo = this.originSelectList
      }
    }, 300),
    // 获取用户
    async getUserList(query) {
      const res = await projectUsers({ query, projectId: this.projectId })
      const result = res?.data
      let userData = []
      if (res.status === 200 && result) {
        for (let index = 0; index < result.length; index++) {
          const user = result[index]
          if (user.status) {
            userData.push({
              ...user,
              localValue: user.userId,
              localLabel: `${user.userName}(${user.userId})`,
            })
          }
        }

        !query && (this.originSelectList = userData)
        this.selectListVo = userData
      }

      return userData
    },
  },
}
</script>

<style lang="scss" scoped>
.select-scroll {
  /deep/ .option-text {
    padding: 2px 5px;
    border-radius: 4px;
    line-height: 1;
  }
  /deep/ .el-select-group__title {
    color: $--color-primary;
    padding-left: 8px;
  }
  /deep/ .el-select-group__wrap::after {
    left: 8px;
    right: 8px;
  }
}
/deep/ .el-select {
  .el-select__tags {
    max-width: 252px !important;
  }
}
</style>
