<template>
  <div
    :class="{
      'select-wrap': true,
      'select-wrap_focus': isFocus,
    }"
  >
    <div
      v-if="mode === options.textMode"
      class="select-title"
      :class="{
        hidden: mode !== options.textMode,
        'select-title__active': propverVisible,
      }"
      @click="handleTitleClick"
    >
      <span class="content" :title="selectedTitle">{{ selectedTitle }}</span>
      <i
        v-if="showClearAll"
        class="select-title__icon el-icon-close"
        :class="{ 'icon-arrow-close__canClearAll': canClearAll }"
        @click.stop="onClear"
      ></i>
      <i
        class="select-title__icon el-icon-arrow-down"
        :class="{
          'icon-arrow-down__cancel': canCancel,
          'icon-arrow-down__canClearAll': canClearAll,
        }"
      ></i>
      <i
        v-if="canCancel"
        class="select-title__icon el-icon-close"
        @click.stop="handleCancleClick"
      ></i>
    </div>
    <el-select
      ref="select"
      v-model="selected"
      :placeholder="placeholder"
      :class="{ 'el-select-wrap': mode === options.textMode }"
      :multiple="multiple"
      clearable
      :popper-class="customClass"
      :popper-append-to-body="popperAppendToBody"
      @change="onSelectChange"
      @visible-change="onVisibleChange"
      @clear="onClear"
    >
      <!-- 过滤 -->
      <template v-if="filterable">
        <li class="search-input">
          <el-input
            ref="filterHandlePerson"
            v-model.trim="filterString"
            v-focus
            :placeholder="filterPlaceholder"
          ></el-input>
        </li>
      </template>
      <div class="select-scroll scrollbal-common">
        <template v-if="multiple && showListClearAll">
          <el-option
            :label="$t('清除选中')"
            value=""
            style="font-size: 12px;height: 30px;line-height: 30px;"
            @click.native="onClearAll"
          ></el-option>
        </template>
        <template v-if="multiple && showListSelectAll">
          <el-option :label="allLabel" :value="allValue"></el-option>
        </template>
        <!-- 分组 -->
        <template v-if="group">
          <el-option-group
            v-for="group in optionData"
            :key="group[groupLabelAttr]"
            :label="group[groupLabelAttr]"
          >
            <el-option
              v-for="item in group[groupChildAttr]"
              v-show="!item[hiddenAttr]"
              :key="item[valueAttr]"
              :value="item[valueAttr]"
            >
              <span>{{ item[labelAttr] }}</span>
            </el-option>
          </el-option-group>
        </template>
        <!-- 不分组 -->
        <template v-else>
          <el-option
            v-for="(item, index) in optionData"
            v-show="!item[hiddenAttr]"
            :key="isUserSelect ? item.userId : item.id || item.key || index"
            :class="{
              'select-option_invalid': item.status === 0 && isUserSelect,
              'select-option_noheight': item.noHeight,
            }"
            :value="item[valueAttr]"
            :label="item[labelAttr]"
          >
            <span
              v-if="colorAttr"
              v-html="createSpan(item[colorAttr], item[labelAttr])"
            ></span>
            <span v-else>{{ item[labelAttr] }}</span>
            <co-tag
              v-if="item.status === 0 && isUserSelect"
              type="info"
              class="invalid"
              effect="light"
              >{{ $t('已失效') }}</co-tag
            >
          </el-option>
        </template>
        <template v-if="!dataLength && currentLoading">
          <el-option label="加载中..." value="加载中..." disabled></el-option>
        </template>
        <template v-if="!dataLength && !currentLoading">
          <el-option
            :label="noDataLabel"
            :value="noDataLabel"
            disabled
          ></el-option>
        </template>
      </div>
    </el-select>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 通用选择器组件
 * @desc 使用 el-select 组件
 * @author wuqian
 * @date 2019.12.6
 */
import { inputFocusPublic } from '@/utils/focusPublicUtil.js'
import { getUserListReq } from '@/service/project'
import { cloneDeep, debounce } from 'lodash'
export default {
  name: 'OpSelect',
  components: {},
  model: {
    prop: 'defaultSelected',
    event: 'change',
  },

  props: {
    // 选择器模式: text element
    mode: {
      type: String,
      default() {
        return 'text'
      },
    },

    // 是否多选
    multiple: {
      type: Boolean,
      default() {
        return false
      },
    },

    // 是否分组
    group: {
      type: Boolean,
      default() {
        return false
      },
    },

    // 选择器标记
    selectedLabel: {
      type: String,
      default() {
        return ''
      },
    },

    // 取消按钮
    canCancel: {
      type: Boolean,
      default() {
        return false
      },
    },

    // 清除所选项
    canClearAll: {
      type: Boolean,
      default() {
        return false
      },
    },

    // 选择器宽度
    width: {
      type: [String, Number],
      default() {
        return '200'
      },
    },

    // 显示的原始数据
    data: {
      type: Array,
      default() {
        return []
      },
    },

    // 默认选中值
    defaultSelected: {
      type: [String, Array, Number],
      default() {
        return ''
      },
    },

    // 分组时子树属性
    groupChildAttr: {
      type: String,
      default() {
        return 'children'
      },
    },

    groupLabelAttr: {
      type: String,
      default() {
        return 'label'
      },
    },

    // 数据项 label 属性
    labelAttr: {
      type: String,
      default() {
        return 'label'
      },
    },

    // 数据项 value属性
    valueAttr: {
      type: String,
      default() {
        return 'value'
      },
    },

    // 隐藏选项属性
    hiddenAttr: {
      type: String,
      default() {
        return 'hidden'
      },
    },

    // 数据项 背景色属性
    colorAttr: {
      type: String,
    },

    // 全选项的 value
    allValue: {
      type: String,
      default() {
        return 'all'
      },
    },

    // 全选项的 label
    allLabel: {
      type: String,
      default() {
        return i18n.t('全部')
      },
    },

    // 是否可过滤
    filterable: {
      type: Boolean,
      default() {
        return true
      },
    },

    // 过滤框 placeholder
    filterPlaceholder: {
      type: String,
      default() {
        return i18n.t('搜索')
      },
    },

    // 选择框 placeholder
    placeholder: {
      type: String,
      default() {
        return i18n.t('搜索')
      },
    },

    customClass: {
      type: String,
      desc: '自定义 Select 下拉框的类名',
    },

    // 无数据提示信息
    noDataLabel: {
      type: String,
      default() {
        return i18n.t('无数据')
      },
    },

    afterVisible: {
      type: Function,
      default() {
        return null
      },
    },

    loading: {
      type: Boolean,
      default() {
        return false
      },
    },

    // 是否远程搜索
    remote: {
      type: Boolean,
      default() {
        return false
      },
    },

    // 远程搜索函数
    remoteMethod: {
      type: Function,
      default: () => {},
    },

    isUserSelect: {
      type: Boolean,
      default: false,
      desc: '是否为人员选择使用，用于显示人员失效状态',
    },

    popperAppendToBody: {
      type: Boolean,
      default: false,
      desc: '是否填充到body元素中',
    },
    // 固定label
    fixedLabel: {
      type: Boolean,
      default() {
        return false
      },
    },
    // 列表全选选项
    showListSelectAll: {
      type: Boolean,
      default() {
        return true
      },
    },
    // 列表清除选项
    showListClearAll: {
      type: Boolean,
      default() {
        return true
      },
    },
    //是否是ALM缺陷用户选择
    almUserSelect: {
      type: Boolean,
      default: false,
    },
    //是否是ALM缺陷项目代号
    almProjectIds: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      copyAlmProjectIds: [],
      currentLoading: false,
      // 组件默认配置
      options: {
        elMode: 'element', // element样式
        textMode: 'text', // 哥伦布自定义样式
      },
      search: '',
      selected: ['all'],
      filterString: '', // 过滤字段
      optionData: [], // 组件下拉列表数据
      optionDataOrigin: [], // 组件下拉列表原始数据
      selectedTitle: this.allLabel, // 选中后显示的标题
      propverVisible: false, // 下拉框显隐
      focusTimer: null, //定时器时间,
      isFocus: false,
    }
  },

  computed: {
    projectId() {
      return this.$store.state.pf.ProjectId
    },
    pr24() {
      return (
        !this.canCancel && (!this.selected.length || this.selected[0] === 'all')
      )
    },
    showClearAll() {
      if (this.multiple) {
        return (
          this.canClearAll && this.selected.length && this.selected[0] !== 'all'
        )
      } else {
        return this.canClearAll && this.selected
      }
    },
    dataLength() {
      return this.optionData.filter(item => !item[this.hiddenAttr]).length
    },
  },
  watch: {
    loading(val) {
      this.currentLoading = val
    },
    // 初始化 this.optionData
    data: {
      handler: function(val) {
        //如果是ALM缺陷下用的用户选择，只取30个用户显示
        this.optionData = this.almUserSelect ? val.slice(0, 30) : [...val]
        this.optionDataOrigin = [...val]
        if (this.remote) this.currentLoading = false
        if (this.almProjectIds && val.length && this.copyAlmProjectIds.length) {
          this.selected = this.copyAlmProjectIds
          this.setSelectedTitle(this.selected)
        }
      },
      immediate: true,
    },

    // 监听过滤操作
    filterString(val) {
      if (this.remote) {
        this.optionData = []
        this.optionDataOrigin = []
        this.currentLoading = true
        this.remoteMethod(val)
        return
      }

      if (this.isUserSelect) {
        this.userRemoteSearch(val)
        return
      }

      if (val) {
        // 原始数据中过滤包含 val 的数据子项（分组模式时不过滤组名）
        const arr = this.filterData(this.optionDataOrigin, val)
        this.optionData = this.almUserSelect ? arr.slice(0, 30) : [...arr]
        // element-ui 模式时 每次过滤情况选中 避免选中值显示是 id 的问题
        if (this.mode === this.options.elMode && this.selected) {
          this.$emit('change', this.multiple ? [] : null)
        }
      } else {
        // 过滤为空时恢复数据
        this.optionData = this.almUserSelect
          ? this.optionDataOrigin.slice(0, 30)
          : [...this.optionDataOrigin]
      }
    },
    /**
     * @desc 初始化 this.selected 设置默认选中
     * 传入的 defaultSelected 为引用类型 不然没法监听变化
     * 单选：this.selected | String  多选 this.selected | Array
     */
    defaultSelected: {
      handler: function(val) {
        if (this.almProjectIds) this.copyAlmProjectIds = val
        // 兼容多选模式默认值为非数组
        if (this.multiple && !Array.isArray(val)) {
          val = val ? [val] : []
        }
        if (Array.isArray(val) && !val.length) {
          this.selected = [this.allValue]
          this.setSelectedTitle(null, this.allLabel)
          return
        }
        // 初始设置 this.selected
        this.selected = this.filterSelectedValue(val)
        // 过滤后选中有变化 emit change
        if (this.selected?.length !== val?.length) {
          this.$emit('valueInvalid', this.selected)
        }
        // 设置默认选中
        this.setSelected(this.selected)
      },
      immediate: true,
    },
  },
  methods: {
    // 清除选中
    onClear() {
      this.selected = this.multiple ? [] : ''
      this.setSelectedTitle(null, this.allLabel)
      this.$emit('change', this.selected)
    },
    onClearAll() {
      this.selected = []
      this.setSelected(this.selected)
    },
    // 点击取消按钮回调
    handleCancleClick() {
      this.onClear()
      this.$emit('cancel')
    },
    createSpan(color = 'black', label) {
      // NOSONAR
      return `<span class="statusbox-list-common" style="background-color: ${color}">${label}</span>`
    },
    // 根据原始数据的数据项过滤选中值
    filterSelectedValue(val) {
      if (!this.data.length) {
        return this.multiple ? [this.allValue] : []
      }
      if (Array.isArray(val) && val[val.length - 1] === this.allValue)
        return val
      // 暂存所有子数据项value，优化搜索最大时间复杂度O(n3)
      const dataValues = []
      if (this.group) {
        // 分组模式
        // 降维
        this.data.forEach(group => {
          const children = group[this.groupChildAttr]
          children.forEach(item => {
            // 兼容选中 id = 0
            if (item[this.valueAttr] || item[this.valueAttr] === 0) {
              dataValues.push(item[this.valueAttr])
            }
          })
        })
      } else {
        // 不分组模式
        this.data.forEach(item => {
          // 兼容选中 id = 0
          if (item[this.valueAttr] || item[this.valueAttr] === 0) {
            dataValues.push(item[this.valueAttr])
          }
        })
      }
      // 过滤
      if (Array.isArray(val)) {
        return val.filter(item => {
          return dataValues.includes(item)
        })
      } else {
        return dataValues.includes(val) ? val : ''
      }
    },
    // 点击标题区域触发
    handleTitleClick() {
      // 打开下拉框
      this.$refs.select.$el.click()
      this.afterVisible()
    },
    // 选中下拉列表值触发
    onSelectChange(val) {
      if (this.multiple) {
        this.setSelected(val)
        this.selected =
          !this.selected.length ||
          this.selected[this.selected.length - 1] === ''
            ? []
            : this.selected
      } else {
        this.selected = val
      }
      this.$emit('change', this.selected)
    },
    // 下拉框出现/隐藏时触发
    onVisibleChange(isVisible) {
      this.isFocus = isVisible
      // input聚焦
      inputFocusPublic(isVisible, 'filterHandlePerson', this.focusTimer, this)
      this.propverVisible = isVisible
      if (!this.propverVisible) {
        this.filterString = ''
        // 选中为空的场景 标题部分为全部
        if (this.multiple && !this.selected.length) {
          this.setSelected(['all'])
          return
        }
        if (!this.multiple && !this.selected) {
          this.setSelectedTitle(null, this.allLabel)
          return
        }
      }
    },
    // 选中数据项时执行
    setSelected(val) {
      if (this.mode !== this.options.textMode) return
      // 全选操作
      if (this.multiple && this.isHandleAll(val)) {
        this.selected = [this.allValue]
        this.setSelectedTitle(null, this.allLabel)
        return
      }
      // 单选没有选中值时显示全部
      if (!this.multiple && !val) {
        this.setSelectedTitle(null, this.allLabel)
        return
      }
      // 非全选操作移除全部
      if (this.multiple && this.isHandleItem(val)) {
        this.selected.splice(0, 1)
      }
      // text 模式动态改变 select-title 区域选中项内容
      this.setSelectedTitle(this.selected)
    },
    isHandleAll(val) {
      return val && val[val.length - 1] === this.allValue
    },
    isHandleItem(val) {
      return val && val[0] === this.allValue && val.length > 1
    },
    // 显示选中项内容
    setSelectedTitle(val, title = '全部') {
      if (this.fixedLabel) {
        this.selectedTitle = this.selectedLabel
        return
      }
      // const label = this.selectedLabel
      //   ? `${this.$i18n.t(this.selectedLabel)}: `
      //   : ''
      // 根据list value找到key作为title
      if (val) {
        title = this.searchLabels(Array.isArray(val) ? val : [val]).join(', ')
      }
      // 选中项内容
      this.selectedTitle = title
    },
    // 遍历原始数据, 由选中的 value 查找选中项 label（注：遍历过程中需要注意选中顺序，以队列方式查找）
    searchLabels(values) {
      const labels = []
      if (!values.length) return labels
      if (values[0] === this.allValue) return [this.allLabel]
      if (this.group) {
        // 分组模式
        this.data.forEach(group => {
          const children = group[this.groupChildAttr]
          children.forEach(item => {
            const indexOf = values.indexOf(item[this.valueAttr])
            if (indexOf !== -1) {
              // 模拟队列 保证选中项 label 在页面的显示顺序
              labels[indexOf] = item[this.labelAttr]
            }
          })
        })
        // 数组去假值 (弊端：0 也会被过滤)
        return labels.filter(Boolean)
      } else {
        // 不分组模式
        this.data.forEach(item => {
          const indexOf = values.indexOf(item[this.valueAttr])
          if (indexOf !== -1) {
            // 模拟队列 保证选中项 label 在页面的显示顺序
            labels[indexOf] = item[this.labelAttr]
          }
        })
        return labels
      }
    },
    /**
     * @title 前端过滤算法
     * 分组过滤：从树 groupChildAttr 子节点的 labelAttr 属性中 过滤所有包含 val 的数据项
     * 不分组过滤：从数组 labelAttr 属性中 过滤所有包含 val 的数据项
     */
    filterData(source, val) {
      // 过滤逻辑
      const filteredList = []
      if (this.group) {
        // 分组过滤
        source.forEach((group, i) => {
          const children = group[this.groupChildAttr]
          if (children) {
            const nGroup = cloneDeep(group)
            nGroup[this.groupChildAttr] = []
            filteredList.push(nGroup)
          }
          children.forEach(item => {
            if (item[this.labelAttr] && item[this.labelAttr].includes(val)) {
              filteredList[i][this.groupChildAttr].push(item)
            }
          })
        })
        // 剔除子树中列表为空的数据项 避免界面只显示分组的组名 但是没有数据项
        const noEmptyList = []
        filteredList.forEach(item => {
          if (item[this.groupChildAttr].length) {
            noEmptyList.push(item)
          }
        })
        return noEmptyList
      } else {
        // 不分组过滤
        source.forEach(item => {
          if (item[this.labelAttr] && item[this.labelAttr].includes(val)) {
            filteredList.push(item)
          }
        })
        return filteredList
      }
    },
    userRemoteSearch: debounce(function(query) {
      const params = {
        query,
        projectId: this.projectId,
      }

      if (query) {
        getUserListReq({
          params,
        }).then(res => {
          const result = res.data
          let userData = []
          if (result.status === 200) {
            userData = result.data.map(item => {
              return {
                ...item,
                key: item.userId,
                value: `${item.userName}(${item.userId})`,
              }
            })
          } else {
            this.$message.error(i18n.t('获取数据出错'))
          }
          this.optionData = userData
        })
      } else {
        this.optionData = this.optionDataOrigin
      }
    }, 500),
  },
}
</script>
<style lang="scss" scoped>
@mixin ellipsis {
  overflow: hidden !important;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.select-scroll {
  margin-top: 6px;
  min-height: 400px;
  overflow: auto;
}

.select-wrap_focus {
  position: relative;
  line-height: 0;
  vertical-align: middle;

  /deep/ .el-select-wrap {
    visibility: visible;

    .el-select__tags {
      display: none;
    }

    > div.el-input {
      visibility: hidden;
    }

    .el-select-dropdown {
      min-width: 200px;

      .el-select-dropdown__item > span {
        padding-right: 28px;
      }
    }
  }

  .select-option_noheight {
    height: 0;
  }

  .select-option_invalid {
    color: #bfbfbf;
    padding-right: 50px !important;

    span:first-child {
      padding-right: 10px !important;
    }

    span:last-child {
      padding-right: 5px !important;
      background-color: #eee;
      color: #666666;
      border: 1px solid #f5f5f5;
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
    line-height: 1;
  }

  .select-title__icon {
    margin-left: 10px;
  }

  .el-icon-close {
    border-radius: 50%;
    background-color: #999;
    border: 1px solid #999;
    color: #fff;
    padding: 2px;
    transform: scale(0.7);
  }

  .icon-arrow-down__cancel {
    right: 25px !important;
  }
  .icon-arrow-down__canClearAll {
    right: 5px !important;
  }
  .icon-arrow-close__canClearAll {
    right: 22px !important;
  }
  .pr24 {
    padding-right: 24px !important;
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

.el-select-dropdown__item {
  padding-right: 20px !important;
}

/deep/ .el-select-wrap {
  position: absolute;
  top: 0;
  visibility: hidden;
  width: 0;
  .el-select__tags {
    display: none;
    background-color: transparent;
  }
}

// popper 样式
.search-input {
  padding: 0 10px;
}
</style>
