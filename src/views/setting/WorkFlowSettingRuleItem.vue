<template>
  <div class="flow-staturule-box-item">
    <span
      class="flow-staturule-box-item-self ellipsis"
      :style="{ backgroundColor: objData.def.color }"
      >{{ objData.def.name }}</span
    >
    <span class="flow-staturule-box-line"></span>
    <div class="flow-staturule-box-item-next">
      <el-tag
        v-for="tag in objData.rules"
        :key="tag.toId"
        size="medium"
        class="flow-staturule-box-item-next-item"
        :color="$colorValid(tag.toStatusColor)"
        :disable-transitions="false"
        >{{ tag.toStatusName }}
        <i
          v-if="deleteAble"
          class="el-icon-delete"
          @click="handleDelete(tag)"
        ></i>
      </el-tag>
      <el-popover
        placement="right"
        width="400"
        transition="auto"
        trigger="click"
        @hide="handleUpdate"
      >
        <div>
          <template v-for="item in nextList">
            <el-checkbox
              :key="item.statusId"
              class="flow-staturule-box-item-next-select"
              :value="item.selected"
              @change="
                value => {
                  handleChange(value, item)
                }
              "
              >{{ item.name }}</el-checkbox
            >
          </template>
        </div>
        <el-button
          v-if="addAble"
          slot="reference"
          class="edit-flow"
          type="warning"
          icon="el-icon-edit"
          circle
        ></el-button>
      </el-popover>
    </div>
  </div>
</template>
<script>
// import { i18n } from '@/i18n'
/**
 * @title 流转状态设置 - 单项组件
 * @desc
 * @author heyunjiang
 * @date
 */
export default {
  name: 'WorkFlowSettingRuleItem',
  components: {},
  mixins: [],
  props: {
    projectId: {
      type: [String, Number],
      required: true,
      desc: '项目 id',
    },

    objData: {
      type: Object,
      required: true,
      desc: '流转状态数据',
    },

    nextDataPoor: {
      type: Array,
      required: true,
      desc: '可流转数据选择池',
    },

    cb: {
      type: Function,
      required: false,
      desc: '操作成功之后的回调函数，后续可用于批量设置处理',
    },

    addItem: {
      type: Function,
      required: false,
      default: () => {},
      desc: '新增',
    },

    removeItem: {
      type: Function,
      required: false,
      default: () => {},
      desc: '删除',
    },

    deletable: {
      type: Boolean,
      required: false,
      default: true,
      desc: '是否拥有删除、新增权限',
    },
  },

  data() {
    return {
      nextList: [],
    }
  },
  computed: {
    // 权限 - 是否可以添加
    addAble() {
      return (
        this.deletable &&
        this.$authFunction(
          'FUNC_COOP_STATUS_CONFIG_RULE_CREATE',
          3,
          this.projectId,
        )
      )
    },
    // 权限 - 是否可以删除
    deleteAble() {
      return (
        this.deletable &&
        this.$authFunction(
          'FUNC_COOP_STATUS_CONFIG_RULE_DELETE',
          3,
          this.projectId,
        )
      )
    },
  },

  watch: {
    objData() {
      this.generateNextList()
    },
  },

  mounted() {
    this.generateNextList()
  },
  methods: {
    // 当选择框隐藏时，触发回调
    handleUpdate() {
      this.cb && this.cb(this.nextList, this.objData.def)
    },
    // checkbox 框选择时触发
    handleChange(select, info) {
      if (select) {
        // 表示新增
        this.addItem(info, this.objData.def)
      } else {
        // 表示删除
        this.removeItem(info, this.objData.def)
      }
    },
    // 点击 icon 删除
    handleDelete(info) {
      this.removeItem({ ...info, statusId: info.toId }, this.objData.def)
    },
    // 生成 nextList popover
    generateNextList() {
      this.nextList = this.nextDataPoor.map(item => {
        return {
          ...item,
          selected:
            this.objData.rules.filter(jtem => jtem.toId === item.statusId)
              .length > 0
              ? true
              : false,
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-flow {
  margin-top: -2px;
  transform: scale(0.75);
  vertical-align: middle;
}
.flow-staturule-box-item {
  margin: 30px 0 25px;
  position: relative;
  // 左侧自身
  .flow-staturule-box-item-self {
    display: inline-block;
    padding: 5px;
    width: 80px;
    text-align: center;
    color: $color-font-white-common;
    border-radius: 2px;
    vertical-align: top;
  }
  // 连接线 (后面提取到 global.scss 中去)
  .flow-staturule-box-line {
    display: inline-block;
    position: relative;
    top: 3px;
    vertical-align: middle;
    height: 1px;
    width: 50px;
    background-color: $color-gray-common;
    vertical-align: middle;
    &:after {
      content: '';
      position: absolute;
      right: 0;
      height: 10px;
      width: 10px;
      border-top: 1px solid $color-gray-common;
      border-right: 1px solid $color-gray-common;
      transform: rotate(45deg) translate(-4px, -3px);
    }
  }
  // 右侧可流转状态块
  .flow-staturule-box-item-next {
    display: inline-block;
    max-width: calc(100% - 150px);
    vertical-align: top;
    .flow-staturule-box-item-next-item {
      color: $color-font-white-common;
      margin: 0 5px 5px;
      .el-icon-delete {
        color: $color-font-white-common;
        cursor: pointer;
      }
    }
  }
}
.flow-staturule-box-item-next-select {
  margin: 0 30px 5px 0;
}
</style>
