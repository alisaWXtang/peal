<template>
  <div class="header-filter-container">
    <el-form ref="form" class="query-form" :model="form" inline>
      <!-- eslint-disable-next-line vue/valid-v-for -->
      <el-form-item
        v-for="item in localTopFiltersList"
        :key="item.attrName"
        class="static-form-item op-select"
        :title="$t(item.fieldName)"
      >
        <op-select
          v-if="item.attrName !== 'searchKey'"
          v-model="item.value"
          :selected-label="$t(item.fieldName)"
          mode="text"
          :default-selected="item.value"
          class="select-wrap"
          :data="item.selectList"
          label-attr="value"
          value-attr="key"
          :prefix-title="true"
          v-bind="item.attrs"
          @change="value => handleChange(item, value)"
        ></op-select>
        <typed-form-item
          v-else
          v-model="item.value"
          :class="{ 'search-input': item.attrName === 'searchKey' }"
          :type="item.attrValue"
          v-bind="item.attrs"
          :select-list="item.selectList"
          :filter-field="item.filterField"
          :popper-append-to-body="item.popperAppendToBody"
          :is-clearable="item.isClearable"
          :is-assign-user="item.isAssignUser"
          @change="
            value => {
              handleChange(item, value)
            }
          "
        ></typed-form-item>
      </el-form-item>

      <el-form-item class="static-form-item">
        <el-button
          class="more-field-btn"
          :class="{ active: showMoreField }"
          type="text"
          @click="moreFilterClick"
          >{{ $t('更多筛选') }} <i class="el-icon-arrow-down"></i
        ></el-button>
      </el-form-item>
      <el-form-item class="static-form-item">
        <el-button type="text" @click="clearAll"
          >{{ $t('清空条件') }} <i class="el-icon-delete"></i
        ></el-button>
      </el-form-item>
    </el-form>
    <div class="header-filter-more-field">
      <div v-show="showMoreField" class="more-field-select">
        <div class="header-container">
          <el-button
            type="text"
            class="add-more-field-btn"
            icon="el-icon-plus"
            @click="showMoreFieldDialog = true"
            >{{ $t('添加过滤条件') }}</el-button
          >
        </div>
        <div class="more-field-container">
          <el-form ref="form" class="more-field-form" :model="form" inline>
            <el-row :gutter="10">
              <el-col
                v-for="(item, index) in localMoreFiltersList"
                :key="item.attrName + item.id"
                class="custom-col-div"
                :span="6"
                :md="8"
                :sm="12"
                :xs="12"
              >
                <el-form-item class="more-field-form-item">
                  <div class="form-item-title">
                    <ellipsis-block
                      :key="renderKey"
                      :value="$t(item.fieldName)"
                      class="form-item-title_block"
                      popper-class="coteam-field-item-tooltip"
                    ></ellipsis-block>
                  </div>
                  <!-- 特殊处理--父需求 -->
                  <select-scroll
                    v-if="item.attrName === 'requireId'"
                    v-model="item.value"
                    :list="requireList"
                    :load="getRequireList"
                    value-key="id"
                    label-key="_label"
                    :loading="requireLoading"
                    :finished="requireFinished"
                    v-bind="item.attrs"
                    @load="getRequireList"
                  ></select-scroll>
                  <expect-hour
                    v-else-if="
                      ['expectHour', 'actualHour'].includes(item.attrName)
                    "
                    v-model="item.value"
                    class="workitem-basic-info-item-select-width"
                    v-bind="item.attrs"
                    :is-clearable="item.isClearable"
                    @chang="
                      value => {
                        handleChange(item, value)
                      }
                    "
                  >
                  </expect-hour>
                  <typed-form-item
                    v-else
                    v-model="item.value"
                    class="form-item-content"
                    :type="item.attrValue"
                    v-bind="item.attrs"
                    :select-list="item.selectList"
                    :filter-field="item.filterField"
                    :popper-append-to-body="item.popperAppendToBody"
                    :is-clearable="item.isClearable"
                    :is-assign-user="item.isAssignUser"
                    @change="
                      value => {
                        handleChange(item, value)
                      }
                    "
                  ></typed-form-item>
                  <i
                    v-if="!disableKeysSet.has(item.attrName)"
                    class="el-icon-error close-icon"
                    @click="deleteMoreField(item, index)"
                  ></i>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item class="more-field-operation-container">
                  <el-button type="default" @click="moreFilterClick">{{
                    $t('取消')
                  }}</el-button>
                  <el-button type="primary" @click="handleSearch">{{
                    $t('过滤')
                  }}</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
      <div class="more-field-display">
        <div class="left-display"></div>
        <div class="right-display">
          <div class="item">
            {{ $t('需求') }} ({{ statistics.requirementCount }})
          </div>
          <div class="item">{{ $t('任务') }} ({{ statistics.taskCount }})</div>
          <div class="item">{{ $t('缺陷') }} ({{ statistics.bugCount }})</div>
          <div class="item">
            <el-button
              type="text"
              class="export-btn"
              icon="el-icon-download"
              :disabled="!canExport"
              @click="handleExport"
              >{{ $t('导出') }}</el-button
            >
          </div>
        </div>
      </div>
    </div>

    <filter-field-select
      ref="filterSelect"
      :show.sync="showMoreFieldDialog"
      :default-selected="defaultSelectKeys"
      :project-ids="projectIds"
      :disable-list="disableKeys"
      @confirm="handleSelectMore"
    ></filter-field-select>
  </div>
</template>

<script>
/**
 * @title 跨项目查询--头部查询组件
 * @author chenxiaolong
 * @date 2021.4.14
 */
import TypedFormItem from '@/components/typed-form-item'
import FilterFieldSelect from '../fieldSelect/FilterFieldSelect'
import mixin from './mixin'
import EllipsisBlock from '@/components/ellipsis-block'
import OpSelect from '@/components/op-select'
import SelectScroll from '@/components/select-scroll'
import ExpectHour from '@/components/expect-hour'
export default {
  name: 'HeaderFilter',
  components: {
    TypedFormItem,
    FilterFieldSelect,
    OpSelect,
    SelectScroll,
    EllipsisBlock,
    ExpectHour,
  },
  mixins: [mixin],
  props: {
    statistics: {
      type: Object,
      desc: '统计数据',
    },
    canExport: {
      type: Boolean,
      default: false,
      desc: '是否可以导出',
    },
  },
}
</script>

<style lang="scss" scoped>
.header-filter {
  &-container {
    padding: 16px 0 12px 0;

    .query-form {
      .static-form-item {
        margin-bottom: 16px;

        .select-wrap {
          position: relative;
          display: inline-block;
          line-height: 0;
          vertical-align: middle;
          border: none;

          /deep/ .content {
            max-width: 126px;
          }
        }

        .search-input {
          /deep/ input {
            padding-right: 30px;
          }
        }

        /deep/ .el-form-item__content {
          // width: 240px;
          .el-select__tags-text {
            max-width: 110px;
          }
        }

        &:not(:last-child) {
          margin-right: 24px;
        }
      }
    }
  }

  &-more-field {
    position: relative;

    .more-field-select {
      background: $--background-gray;
      border-radius: 4px;
      padding: 16px;

      .header-container {
        padding-bottom: 11px;
      }

      .more-field-operation-container {
        /deep/ .el-form-item__content {
          margin-left: 110px;
        }
      }

      .add-more-field-btn {
        font-size: 12px;
      }

      .more-field-container {
        .more-field-form {
          margin-bottom: -20px;
        }
        .el-form-item {
          margin-bottom: 20px;

          /deep/ .el-form-item__label {
            @include no-wrap;
          }

          /deep/ .el-form-item__content {
            width: 350px;
            display: flex;
            line-height: normal;
            align-items: center;

            .form-item-title {
              text-align: right;
              display: inline-block;
              width: 110px;
              padding-right: 12px;
              @include no-wrap;
              box-sizing: border-box;
              flex-shrink: 0;

              .form-item-title_block {
                max-width: 100%;
              }
            }

            .form-item-content {
              flex-grow: 1;
              width: 240px;
            }
          }
        }
        .more-field-form-item {
          /deep/ .el-date-editor {
            position: relative;
            line-height: normal;
          }

          /deep/ .el-select__tags-text {
            max-width: 110px;
          }

          .close-icon {
            display: none;
            position: absolute;
            right: -5px;
            top: -5px;
            cursor: pointer;
          }

          &:hover {
            .close-icon {
              display: block;
            }
          }
        }
      }
    }

    .more-field-display {
      display: flex;
      justify-content: space-between;
      width: 100%;

      .left-display {
        display: flex;
        align-items: center;

        .filter-item:first-child {
          margin-left: 8px;
        }

        .filter-item:not(:first-child) {
          margin-left: 12px;

          .close-icon {
            margin-left: 4px;
            cursor: pointer;

            &:hover {
              color: $--color-primary;
            }
          }
        }
        .clear-all {
          margin-left: 40px;
        }
      }

      .right-display {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: right;

        .item:not(:first-child) {
          margin-left: 16px;
        }
      }
    }
  }
}

.more-field-btn,
.export-btn {
  color: $--color-text-regular;

  &:hover {
    color: $--color-primary;
  }

  &.is-disabled {
    color: $--color-text-disable;
    &:hover {
      color: $--color-text-disable;
    }
  }

  .el-icon-arrow-down {
    transition: all 0.2s ease;
  }

  &.active {
    .el-icon-arrow-down {
      transform: rotate(180deg);
    }
  }
}

@media only screen and (min-width: 1575px) {
  .custom-col-div {
    width: 25%;
  }
}

@media only screen and (min-width: 1905px) {
  .custom-col-div {
    width: 20%;
  }
}
</style>
