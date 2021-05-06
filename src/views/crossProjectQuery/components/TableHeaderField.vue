<template>
  <el-popover v-model="visible" placement="bottom" width="780" trigger="click">
    <div class="table-header-field-box">
      <div class="header">
        <div class="title">{{ $t('表头字段设置') }}</div>
        <i class="el-icon-close close-icon" @click="handleCancel"></i>
      </div>
      <div class="content">
        <div class="content__header">
          <div class="left">{{ $t('可选字段') }}</div>
          <div class="right">
            <span>{{ $t('当前选定字段') }}</span>
            <span>
              <el-button type="text">{{ $t('恢复默认值') }}</el-button></span
            >
          </div>
        </div>
        <div class="content__body">
          <div class="field-list-container">
            <div class="field-type-container">
              <div class="title">{{ $t('系统字段') }}</div>
              <div class="list">
                <el-checkbox
                  v-for="item in systemFields"
                  :key="item.attrName"
                  v-model="item.display"
                  >{{ item.name }}</el-checkbox
                >
              </div>
            </div>
            <div class="field-type-container">
              <div class="title">{{ $t('需求自定义字段') }}</div>
              <div class="list">
                <el-checkbox
                  v-for="item in requirementCustomFields"
                  :key="item.attrName"
                  v-model="item.display"
                  >{{ item.name }}</el-checkbox
                >
              </div>
            </div>
            <div class="field-type-container">
              <div class="title">{{ $t('任务自定义字段') }}</div>
              <div class="list">
                <el-checkbox
                  v-for="item in taskCustomFields"
                  :key="item.attrName"
                  v-model="item.display"
                  >{{ item.name }}</el-checkbox
                >
              </div>
            </div>
            <div class="field-type-container">
              <div class="title">{{ $t('缺陷自定义字段') }}</div>
              <div class="list">
                <el-checkbox
                  v-for="item in bugCustomFields"
                  :key="item.attrName"
                  v-model="item.display"
                  >{{ item.name }}</el-checkbox
                >
              </div>
            </div>
          </div>
          <div class="selected-container">
            <!-- 拖拽组件开始 拖拽2 -->
            <vuedraggable
              :list="displayFields"
              v-bind="draggableOptions"
              @start="drag = true"
              @end="drag = false"
            >
              <transition-group
                type="transition"
                tag="div"
                :name="!drag ? 'flip-list' : null"
              >
                <div
                  v-for="element in displayFields"
                  :key="element.attrName"
                  class="field-common "
                  :title="element.fieldName"
                >
                  <i class="iconfont icon-drag tmpl-btn-public"></i>
                  <span class="field-name">{{ element.fieldName }}</span>
                  <i class="el-icon-close close-icon"></i>
                </div>
              </transition-group>
            </vuedraggable>
            <!-- 拖拽组件结束 拖拽2-->
          </div>
        </div>
        <div class="content__footer">
          <el-button type="default" @click="handleCancel">{{
            $t('取消')
          }}</el-button>
          <el-button type="primary">{{ $t('确定') }}</el-button>
        </div>
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
        <i class="co-icon-setting table-custom-field-icon"></i>
      </el-tooltip>
    </span>
  </el-popover>
</template>

<script>
/**
 * @title 表头字段选择
 * @author chenxiaolong
 * @date 2021.4.15
 */
import vuedraggable from 'vuedraggable'
export default {
  name: 'TableHeaderField',
  components: {
    vuedraggable,
  },
  props: {},
  data() {
    return {
      displayFields: [
        {
          attrName: 'test',
          fieldName: 'test',
        },
        {
          attrName: 'test1',
          fieldName: 'test1',
        },
        {
          attrName: 'test2',
          fieldName: 'test',
        },
        {
          attrName: 'test111',
          fieldName: 'test1',
        },
        {
          attrName: 'test3',
          fieldName: 'test',
        },
        {
          attrName: 'test4',
          fieldName: 'test1',
        },
        {
          attrName: 'tes5',
          fieldName: 'test',
        },
        {
          attrName: 'test6',
          fieldName: 'test1',
        },
        {
          attrName: 'tes7',
          fieldName: 'test',
        },
        {
          attrName: 'test8',
          fieldName: 'test1',
        },
        {
          attrName: 'tes9',
          fieldName: 'test',
        },
        {
          attrName: 'test10',
          fieldName: 'test1',
        },
      ], //已显示的数组,不包括id和标题
      systemFields: [],
      requirementCustomFields: [],
      taskCustomFields: [],
      bugCustomFields: [],
      localConfigField: [],
      configField: [],
      visible: false,
      drag: false,
    }
  },
  computed: {
    // draggable公共属性
    draggableOptions() {
      return {
        forceFallback: true,
        filter: '.close-icon',
      }
    },
  },
  methods: {
    // 取消
    handleCancel() {
      this.visible = !this.visible
      this.displayField = []
      this.hiddenField = []
    },
  },
}
</script>
<style lang="scss" scoped>
.table-header-field-box {
  padding: 16px 24px;
  margin: -24px;
  width: 100%;
  height: 588px;

  .header {
    padding-bottom: 15px;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-family: MicrosoftYaHei;
      font-size: 16px;
      color: #333333;
      line-height: 24px;
    }

    .close-icon {
      font-size: 16px;
      cursor: pointer;

      &:hover {
        color: $--color-primary;
      }
    }
  }

  .content {
    .content__header {
      background: $--background-gray;
      border-radius: 4px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      margin-top: 16px;

      .right {
        > span:first-child {
          margin-right: 15px;
        }
      }
    }

    .content__body {
      display: flex;
      height: 435px;
      padding-bottom: 12px;

      .field-list-container {
        flex: 0 0 510px;
        border-right: 1px solid #e5e5e5;
        height: 100%;
        overflow-y: auto;
        padding-left: 16px;
        @include scrollbal-common;

        .field-type-container {
          margin-bottom: 24px;

          &:first-child {
            margin-top: 16px;
          }
        }

        .title {
          font-size: 12px;
          color: $--color-text-fine;
        }
      }

      .selected-container {
        height: 100%;
        overflow-y: auto;
        flex: 1 0 auto;
        @include scrollbal-common;

        .field-common {
          padding: 0 16px;
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          cursor: move;

          &:first-child {
            margin-top: 16px;
          }

          .close-icon {
            cursor: pointer;
          }

          .field-name {
            @include no-wrap;
            display: inline-block;
            width: 128px;
            padding-left: 4px;
          }

          i {
            flex: 0 0 auto;
          }
        }
      }
    }

    .content__footer {
      display: flex;
      justify-content: flex-end;
    }
  }
}

//放置占位符的类名
.sortable-ghost {
  opacity: 0;
}

.sortable-chosen {
  background-color: $--color-primary-light-3;
  color: #fff;
}

// 拖动元素
.sortable-fallback {
  opacity: 1 !important; // 复写drag下的行内样式
}
</style>
