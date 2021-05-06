<template>
  <el-popover v-model="visible" placement="bottom" width="400" trigger="click">
    <div style="height:400px;" class="table-customs-box" :class="className">
      <div class="table-customs-header">{{ $t('表头字段设置') }}</div>
      <div class="table-customs-content">
        <div class="draggar-box scrollbal-common">
          <div class="dragger-scrollbar">
            <div class="title-box">
              <h3 class="main-title">{{ $t('已显示') }}</h3>
              <div class="add-explain">{{ $t('可拖拽改变顺序') }}</div>
              <template v-for="item in otherDisplayField">
                <div
                  :key="item.attrName"
                  class="field-common display-not-draggar"
                >
                  {{ item.fieldName }}
                </div>
              </template>
            </div>
            <!-- 拖拽组件开始 拖拽1 -->
            <draggable
              :list="displayField"
              data-class="display"
              v-bind="options"
            >
              <transition-group
                type="transition"
                name="flip-list"
                tag="div"
                style="transition-box"
              >
                <div
                  v-for="(element, index) in displayField"
                  :key="element.attrName"
                  class="field-common display-yes-draggar"
                  @click="moveField(element, 'display', index)"
                >
                  {{ element.fieldName }}
                </div>
              </transition-group>
            </draggable>
            <!-- 拖拽组件结束 拖拽1 -->
          </div>
        </div>
        <div class="draggar-icon">
          <i class="el-icon-sort sort-icon"></i>
        </div>
        <div class="draggar-box scrollbal-common">
          <div class="dragger-scrollbar">
            <div class="title-box">
              <h3 class="main-title">{{ $t('未显示') }}</h3>
            </div>
            <!-- 拖拽组件开始 拖拽2 -->
            <draggable
              :list="hiddenField"
              :move="checkMove"
              data-class="hidden"
              v-bind="options"
            >
              <transition-group
                type="transition"
                name="flip-list"
                tag="div"
                style="transition-box"
              >
                <div
                  v-for="(element, index) in hiddenField"
                  :key="element.attrName"
                  class="field-common hidden-yes-draggar"
                  @click="moveField(element, 'hidden', index)"
                >
                  {{ element.fieldName }}
                </div>
              </transition-group>
            </draggable>
            <!-- 拖拽组件结束 拖拽2-->
          </div>
        </div>
      </div>
      <div class="table-customs-footer">
        <el-button type="primary" class="common-icon" @click="updateHandle">{{
          $t('提交')
        }}</el-button>
        <el-button class="common-icon" @click="cancelHandle">{{
          $t('取消')
        }}</el-button>
      </div>
    </div>
    <span slot="reference" class="table-customs-font">
      <el-tooltip
        class="item"
        effect="dark"
        :content="$t('表头设置')"
        placement="top-start"
        :open-delay="300"
      >
        <i class="el-icon-s-tools table-custom-field-icon"></i>
      </el-tooltip>
    </span>
  </el-popover>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title: 表头操作设置组件
 * @auth: 张昀
 * @date: 2020.6.22
 */
import draggable from 'vuedraggable'
import { mapActions } from 'vuex'
export default {
  name: 'TableHeaderCustomField',
  components: {
    draggable,
  },

  mixins: [],
  props: {
    viewType: {
      type: [Number, String],
      desc: '1项目视图，2成员视图',
    },

    className: {
      type: String,
      default: '',
    },

    defaultDisplay: {
      type: Array,
      desc: '默认展示字段',
    },
  },

  data() {
    return {
      otherDisplayField: [], //已显示数组，id和标题
      displayField: [], //已显示的数组,不包括id和标题
      hiddenField: [], ////未显示的数组
      visible: false, //弹窗的状态
      options: {
        //vuedraggable 公共属性配置
        animation: 0,
        group: 'field',
        class: 'dragger-content',
        ghostClass: 'ghost',
      },
    }
  },
  watch: {
    visible(newValue) {
      newValue && this.queryTableHeaderData()
    },
  },

  mounted() {
    this.queryTableHeaderData()
  },
  methods: {
    ...mapActions(['getTableHeaderData', 'saveTableHeaderData']),
    // 获取字段列表(显示和隐藏的)
    async queryTableHeaderData() {
      const res = await this.getTableHeaderData({ viewType: this.viewType })
      this.displayField = res && this.formatDisplayFiled(res.displayColumns)
      this.hiddenField = res && res.hiddenColumns
    },
    // 更新表头展示字段
    async updateHandle() {
      const displayColumns = this.otherDisplayField.concat(this.displayField)
      const res = await this.saveTableHeaderData({
        viewType: this.viewType,
        displayColumns,
      })

      if (res.status == 200) {
        this.$emit('updateDisplay', displayColumns)
        this.$message({
          message: i18n.t('更新成功'),
          type: 'success',
        })
      }
      this.cancelHandle()
    },
    // 过滤默认显示字段和可操作字段
    formatDisplayFiled(data) {
      const defaultDisplayMap = new Map()
      this.defaultDisplay.forEach(displayAttrName => {
        defaultDisplayMap.set(displayAttrName, displayAttrName)
      }) //需要默认显示的值
      let _notDefaultDisplay = []
      let _deaultDisplay = []
      data.forEach(item => {
        if (defaultDisplayMap.has(item.displayAttrName)) {
          _deaultDisplay.push(item)
        } else {
          _notDefaultDisplay.push(item)
        }
      })
      this.otherDisplayField = _deaultDisplay
      return _notDefaultDisplay
    },
    // 未显示顺序不能上下拖动
    checkMove(ev) {
      return (
        ev.from.parentNode.getAttribute('data-class') !==
        ev.to.parentNode.getAttribute('data-class')
      )
    },
    // 点击字段 移动 type有两个值，一个是display(点击已显示)，一个hidden(点击未显示),index是点击字段数组的下标
    moveField(data, type, index) {
      let removeArray, addArray, removeItem
      if (type == 'display') {
        removeArray = this.displayField
        addArray = this.hiddenField
      } else {
        removeArray = this.hiddenField
        addArray = this.displayField
      }
      removeItem = removeArray.splice(index, 1)
      addArray.push(removeItem[0])
    },
    // 取消
    cancelHandle() {
      this.visible = !this.visible
      this.displayField = []
      this.hiddenField = []
    },
  },
}
</script>

<style lang="scss" scoped>
.table-custom-field-icon.iconfont {
  font-size: 18px;
  cursor: pointer;
}
.table-custom-field-icon.iconfont:hover {
  color: #444;
}
.table-customs-font {
  background: #f1f4f9;
}
.table-customs-box {
  display: flex;
  flex-direction: column;
  .table-customs-header {
    height: 40px;
    text-align: center;
    line-height: 40px;
    border-bottom: 1px solid #d7d8d9;
  }
  .table-customs-content {
    flex-grow: 1;
    height: 0;
    margin: 6px;
    display: flex;
    .draggar-box {
      flex: 1 0 0;
      overflow-y: auto;
      background: #f4f6f873;
      .dragger-scrollbar {
        padding: 5px 10px;
        box-sizing: border-box;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        .title-box {
          .main-title {
            margin: 0;
            font-size: 14px;
            font-weight: 400;
          }
          .add-explain {
            color: #999999;
            font-size: 12px;
            margin-top: 4px;
          }
        }
        .field-common {
          padding: 6px 10px;
          margin: 10px 0px;
          font-size: 12px;
          border-radius: 4px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          &:not(.display-not-draggar) {
            cursor: pointer;
          }
        }
        .display-not-draggar {
          border: 1px dashed #333;
        }
        .display-yes-draggar {
          border: 1px dashed #5ed8ea;
        }
        .hidden-yes-draggar {
          border: 1px solid #ebecec;
        }
        .dragger-content {
          flex: 1;
          display: flex;
          > div {
            align-items: stretch;
            width: 100%;
          }
        }
      }
    }
    .draggar-icon {
      margin: 0 5px;
      align-self: center;
    }
    .sort-icon {
      transform: rotate(90deg);
      font-size: 18px;
      font-weight: 500;
      color: #898989;
    }
  }
  .table-customs-footer {
    border-top: 1px solid #d7d8d9;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 40px;
  }
}
// 拖拽动画
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
