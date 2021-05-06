<template>
  <el-table
    ref="tempTable"
    :data="tmplList"
    class="tmplList"
    style="width: 100%"
    height="250"
    @selection-change="handleSelectionChange"
  >
    <el-table-column width="40" type="selection" class-name="my-selection">
    </el-table-column>
    <el-table-column :label="$t('在以下模板中使用')">
      <template slot-scope="scope">
        {{ scope.row.templateName }}
      </template>
    </el-table-column>
    <el-table-column width="180" :label="$t('是否必填')" align="center">
      <template slot-scope="scope">
        <el-checkbox
          v-model="scope.row.required"
          @change="handleSelectedChange(scope.row)"
        ></el-checkbox>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'FieldSelectedTmplTable',
  props: {
    tmplAllList: {
      type: Array,
      required: true,
      desc: '全部模板列表',
    },

    selectionTmplList: {
      type: Array,
      required: false,
      // default: () => [],
      desc: '当前字段需要在哪些模板中显示',
    },
  },
  data() {
    return {
      tmplList: [], //格式化后数据
      selectionTmp: [], //选中模板
      isAllSelected: false,
    }
  },
  computed: {
    // 必填半选
    indeterminate() {
      const selectList = this.tmplList.filter(item => {
        return item.required
      })
      return selectList.length < this.tmplList.length && selectList.length !== 0
    },
  },
  watch: {
    selectionTmp: {
      handler(newVal) {
        this.$emit('selectedChange', newVal)
      },
      deep: true,
    },
  },
  mounted() {
    this.formatTemlData()
    this.defaultSelect()
    this.handleSelectedChange()
  },
  methods: {
    //所有模板数据转化为选中的格式
    formatTemlData() {
      this.tmplList = this.tmplAllList.map(item => {
        const result = this.includeInArray(
          this.selectionTmplList,
          'templateId',
          item.id,
        )
        const noEisit = {
          templateId: item.id,
          templateName: item.name,
          required: false,
        }
        return result ? result : noEisit
      })
    },
    //点击选中的模板
    handleSelectionChange(selection) {
      this.selectionTmp = selection
    },
    //默认选中模板
    defaultSelect() {
      this.tmplList.forEach((item, index) => {
        const result = this.includeInArray(
          this.selectionTmplList,
          'templateId',
          item.templateId,
        )
        if (result) {
          this.$nextTick(() => {
            this.$refs.tempTable.toggleRowSelection(this.tmplList[index])
          })
        }
      })
    },
    includeInArray(arr, attr, value) {
      return arr.find(item => {
        return item[attr] == value
      })
    },
    // 是否必填表头的状态改变
    handleSelectedChange() {
      const requiredList = this.tmplList.filter(item => {
        return item.required
      })
      this.isAllSelected =
        requiredList.length == this.tmplList.length &&
        this.tmplList.length !== 0
    },
  },
}
</script>

<style scoped lang="scss">
/deep/ .my-selection .cell {
  overflow: visible !important;
}
.tmplList {
  /deep/ .el-table__header-wrapper {
    .el-checkbox__input {
      display: none !important;
    }
  }
}
</style>
