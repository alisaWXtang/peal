<template>
  <div class="data-table-container">
    <div class="title">{{ $t('详情表') }}</div>
    <slot v-if="isEmpty" name="empty">
      <div class="empty">
        <span>{{ $t('暂无表格数据') }}</span>
      </div>
    </slot>
    <el-table
      v-else
      :data="data"
      border
      max-height="700px"
      cell-class-name="cell-display"
      :span-method="arraySpanMethod"
      class="data-table scrollbal-common"
      :class="{ 'overflow-table': isOverflowTable }"
      style="width: 100%"
    >
      <template v-for="item in rows">
        <el-table-column
          :key="item.key"
          :fixed="!item.index"
          :label="item.name"
          align="center"
          min-width="120"
        >
          <template v-slot="scope">
            <div
              v-if="
                data[scope.$index][item.index].canQuery &&
                  data[scope.$index][item.index].value &&
                  data[scope.$index][item.index].value !== '0'
              "
              class="click-item"
              @click="cellClick(data[scope.$index][item.index])"
            >
              {{ data[scope.$index][item.index].value }}
            </div>
            <span v-else class="no-click-item">{{
              data[scope.$index][item.index].value
            }}</span>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 数据表格用户报表数据展示
 * @author chenxiaolong
 * @time 2020/7/3
 */
import { chartCategories } from '../util'
export default {
  name: 'DataTable',
  props: {
    data: {
      type: [Array, Object],
      required: true,
      desc: i18n.t('表格数据'),
    },

    isEmpty: {
      type: Boolean,
      required: true,
      desc: i18n.t('是否为空'),
    },
  },

  data() {
    return {
      isOverflowTable: false,
    }
  },

  computed: {
    // 获取数据表头
    rows() {
      if (this.data[0]) {
        return this.data[0].map((item, index) => {
          return {
            key: `${item.key}${index}`,
            name: item.key === 'metics' ? '' : item.key,
            index,
          }
        })
      }

      return []
    },
  },

  methods: {
    cellClick(data) {
      // 获取数据
      this.$emit('cell-click', data)
    },
    // 合计行列, 特殊处理仅停留时长报表
    arraySpanMethod({ rowIndex, columnIndex }) {
      if (
        'stayTime' === chartCategories[this.$route.query.chartCategory] &&
        columnIndex === 1 &&
        rowIndex === 2
      ) {
        this.isOverflowTable = true
        return {
          rowspan: 1,
          colspan: this.rows.length - 1,
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.title {
  text-align: center;
  margin-bottom: 16px;
}

.click-item {
  color: $--color-primary;
  cursor: pointer;
}

.no-click-item {
  color: #666666;
  cursor: default;
}
.data-table-container {
  min-height: 243px;
  position: relative;
  .empty {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

.overflow-table {
  /deep/ table {
    overflow: hidden;
  }
}
</style>
