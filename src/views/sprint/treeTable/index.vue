<template>
  <div style="width:600px; margin-left: 52px;">
    <el-table
      ref="multipleTable"
      :data="formatData"
      :row-style="showRow"
      class="multiple-table"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
      @select="onSelectFun"
      @sort-change="sortaChangeCallBack"
    >
      <el-table-column
        v-if="showCheckBox"
        type="selection"
        width="45"
        :selectable="selectableFunction"
      ></el-table-column>
      <el-table-column width="70" show-overflow-tooltip label="ID">
        <template slot-scope="scope">
          <span class="c-table-icon cp" @click="handleClickItem(scope.row)">{{
            getId(scope.row)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columns.length === 0"
        min-width="150"
        show-overflow-tooltip
        :label="$t('标题')"
      >
        <template slot-scope="scope">
          <global-input
            :init-value="getTitle(scope.row)"
            :on-change="
              value => {
                updateGlobalTitle(scope.row, value)
              }
            "
          >
            <span slot class="table-input-edit-text c-blue-hover">
              <span
                v-for="space in scope.row._level"
                :key="space"
                class="ms-tree-space"
              ></span>
              <span
                v-if="iconShow(0, scope.row)"
                class="tree-ctrl"
                @click="toggleExpanded(scope.$index)"
              >
                <i v-if="!scope.row._expanded" class="el-icon-plus"></i>
                <i v-else class="el-icon-minus"></i>
              </span>
              <span
                class="c-blue-hover cp"
                @click="handleClickItem(scope.row, $event)"
              >
                <span
                  :class="getworkItemTypeIcon(scope.row.data)"
                  class="c-table-icon cp"
                ></span
                >{{ getTitle(scope.row) }}</span
              >
            </span>
          </global-input>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(column, index) in columns"
        v-else
        :key="column.value"
        :label="column.text"
        :width="column.width"
      >
        <template slot-scope="scope">
          <!-- Todo -->
          <!-- eslint-disable-next-line vue/no-confusing-v-for-v-if -->
          <span
            v-for="space in scope.row._level"
            v-show="index === 0"
            :key="space"
            class="ms-tree-space"
          ></span>
          <span
            v-if="iconShow(index, scope.row)"
            class="tree-ctrl"
            @click="toggleExpanded(scope.$index)"
          >
            <i v-if="!scope.row._expanded" class="el-icon-plus"></i>
            <i v-else class="el-icon-minus"></i> </span
          >{{ scope.row[column.value] }}
        </template>
      </el-table-column>
      <slot></slot>
    </el-table>
  </div>
</template>
<script>
import treeToArray from '@/components/tree-table/eval'
import GlobalInput from '@/components/field-edit/GlobalInput.vue'

export default {
  name: 'TreeTable',
  components: {
    GlobalInput,
  },

  props: {
    /* eslint-disable */
    data: {
      type: [Array, Object],
      required: true,
    },

    columns: {
      type: Array,
      default: () => [],
    },

    evalFunc: Function,
    evalArgs: Array,
    // multipleSelection: Array,
    expandAll: {
      type: Boolean,
      default: false,
    },

    showCheckBox: {
      type: Boolean,
      default: false,
    },
    selectable: {
      type: Boolean,
      default: true,
    },

    ltype: {
      type: Number,
      default: null,
    },

    updateGlobalTitle: {
      type: Function,
      required: true,
    },

    sortaChangeCallBack: {
      type: Function,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      multipleSelection: [],
    }
  },
  watch: {
    selectable: {
      handler(val) {
        console.log(val)
        this.selectableFunction()
      },
      deep: true,
    },
  },

  computed: {
    // 格式化数据源
    formatData: function() {
      let tmp
      if (!Array.isArray(this.data)) {
        tmp = [this.data]
      } else {
        tmp = this.data
      }
      const func = this.evalFunc || treeToArray
      const args = this.evalArgs
        ? [].concat([tmp, this.expandAll], this.evalArgs)
        : [tmp, this.expandAll]
      return func.apply(null, args)
    },
  },

  methods: {
    getId(data) {
      if (data.id) {
        return data.id
      } else if (data.data.id) {
        return data.data.id
      } else if (data.display.id) {
        return data.display.id
      } else {
        return ''
      }
    },
    getTitle(data) {
      if (data.title) {
        return data.title
      } else if (data.data.title) {
        return data.data.title
      } else if (data.display.title) {
        return data.display.title
      } else {
        return ''
      }
    },
    getMultipleSelectData() {
      return this.multipleSelection
    },
    handleSelectionChange(val) {
      // console.log
      this.multipleSelection = val
      this.$emit('setMultipleSelection')
    },
    showRow: function(row) {
      const show = row.row.parent
        ? row.row.parent._expanded && row.row.parent._show
        : true
      row.row._show = show
      return show
        ? 'animation:treeTableShow 1s;-webkit-animation:treeTableShow 1s;'
        : 'display:none;'
    },
    // 切换下级是否展开
    toggleExpanded: function(trIndex) {
      const record = this.formatData[trIndex]
      record._expanded = !record._expanded
    },
    // 图标显示
    iconShow(index, record) {
      return index === 0 && record.children && record.children.length > 0
    },
    selectableFunction(row, index) {
      // if (row.data.sprintId == this.$getUrlParams().sprintId) {
      //   return false
      // }
      // 父需求可单独规划 取消与子需求联动
      // return true
      if (this.selectable) {
        return false
      }
      return true
    },
    onSelectFun(selection, row) {
      let select = false
      selection.forEach(item => {
        if (
          item &&
          item.data &&
          item.data.id == row.data.id &&
          item.data.workItemType == row.data.workItemType
        ) {
          select = true
        }
      })
      if (select) {
        //需求触发父需求的选中
        if (row.data.workItemType != 1 && row.data.workItemType != 3) {
          //任务触发父级
          this.$refs.multipleTable.toggleRowSelection(row.parent, true)
        }
      }
    },
    handleClickItem(row, e) {
      if (row.data && row.data.workItemType == 1) {
        this.$emit('seeTaskHandle', row.data, e)
      } else if (row.data && row.data.workItemType == 2) {
        if (this.ltype == 2) {
          this.$emit('seeTaskHandle', row.data, e)
        }
      } else {
        this.$emit('seeTaskHandle', row.data, e)
      }
    },
    getworkItemTypeIcon(row) {
      if (row != undefined) {
        if (row && row.workItemType == 1) {
          return 'iconfont icon-xuqiu'
        } else if (row && row.workItemType == 2) {
          // return 'iconfont icon-task'
          return 'co-icon-date'
        } else if (row && row.workItemType == 3) {
          // return 'iconfont icon-bug'
          return 'iconfont icon-quexian'
        }
      }
    },
  },
}
</script>
<style rel="stylesheet/css">
@keyframes treeTableShow {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@-webkit-keyframes treeTableShow {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
<style lang="scss" rel="stylesheet/scss" scoped>
$color-blue: #2196f3;
$space-width: 18px;

.ms-tree-space {
  position: relative;
  top: 1px;
  display: inline-block;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  width: $space-width;
  height: 14px;

  &::before {
    content: '';
  }
}

.processContainer {
  width: 100%;
  height: 100%;
}

table td {
  line-height: 26px;
}

.tree-ctrl {
  position: relative;
  cursor: pointer;
  color: #999999;
  margin-left: -$space-width;
}
</style>
