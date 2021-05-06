<template>
  <div>
    <el-form-item
      v-for="filter in filterSelectMaps"
      :key="filter.attrName"
      class="form-group filter-item"
      :label="$t(filter.name)"
    >
      <i
        v-if="!filter.readonly"
        class="el-icon-error close-btn"
        :title="$t('删除')"
        @click="handleCloseFilter(filter)"
      ></i>
      <!-- 简单时间框 -->
      <template
        v-if="
          ['createTimes', 'startTimes', 'endTimes', 'finishTimes'].includes(
            filter.attrName,
          )
        "
      >
        <div class="choice-time-type">
          <co-tag :title="$t('选择时间类型')" type="info" effect="dark"
            >{{
              filters[dynamicTimeMaps[filter.attrName].isDynamic]
                ? $t('动态时间')
                : $t('固定时间')
            }}
            <i class="es-icon el-icon-arrow-down"></i
          ></co-tag>
          <el-select
            v-model="filters[dynamicTimeMaps[filter.attrName].isDynamic]"
            :placeholder="$t('选择时间类型')"
            @change="val => changeTimeType(val, filter)"
          >
            <el-option :value="false" :label="$t('固定时间')"></el-option>
            <el-option :value="true" :label="$t('动态时间')"></el-option>
          </el-select>
        </div>
        <custom-date
          v-if="!filters[dynamicTimeMaps[filter.attrName].isDynamic]"
          v-model="filters[filter.attrName]"
          type="daterange"
          :start-placeholder="$t('请选择')"
          :end-placeholder="$t('请选择')"
          class="time-select-class"
        ></custom-date>
        <div v-else class="dynamic-time">
          <el-input-number
            v-model="filters[dynamicTimeMaps[filter.attrName].attrName].n"
            :min="1"
            :placeholder="$t('请输入')"
          ></el-input-number>
          <el-select
            v-model="
              filters[dynamicTimeMaps[filter.attrName].attrName].timeUnitType
            "
            :placeholder="$t('选择类别')"
          >
            <el-option value="YEAR" :label="$t('年')"></el-option>
            <el-option value="MONTH" :label="$t('月')"></el-option>
            <el-option value="WEEK" :label="$t('周')"></el-option>
            <el-option value="DAY" :label="$t('日')"></el-option>
          </el-select>
          <span>{{ $t('内') }}</span>
        </div>
      </template>
      <!-- 迭代 -->
      <template v-else-if="filter.attrName === 'sprintIds'">
        <div class="choice-time-type">
          <co-tag :title="$t('选择时间类型')" type="info" effect="dark"
            >{{
              filters.hasDynamicSprintIds ? $t('动态迭代') : $t('固定迭代')
            }}
            <i class="es-icon el-icon-arrow-down"></i
          ></co-tag>
          <el-select
            v-model="filters.hasDynamicSprintIds"
            :placeholder="$t('选择时间类型')"
            @change="val => changeSprintType(val, filter)"
          >
            <el-option :value="false" :label="$t('固定迭代')"></el-option>
            <el-option :value="true" :label="$t('动态迭代')"></el-option>
          </el-select>
        </div>

        <filter-select
          v-if="!filters.hasDynamicSprintIds"
          v-model="filters[filter.attrName]"
          filterable
          :multiple="true"
          clearable
          :disabled="filter.readonly"
          label-key="name"
          value-key="id"
          :group="true"
          group-label-key="name"
          :select-list="filter.selectList"
          :is-user-select="
            ['assignUsers', 'createUsers'].includes(filter.attrName)
          "
          :placeholder="filter.placeholder || $t('请选择')"
          popper-append-to-body
          open-all
          open-clear
          @visableChange="visable => visableChange(visable, filter)"
        ></filter-select>
        <div v-else class="dynamic-time dynamic-sprint">
          <el-input-number
            v-model="filters.dynamicSprintIds.n"
            :min="1"
            :placeholder="$t('请输入')"
          ></el-input-number>
          <el-select
            v-model="filters.dynamicSprintIds.dynamicSprintIdsType"
            :placeholder="$t('选择类别')"
          >
            <el-option
              v-for="item in synamicSprintTypes"
              :key="item.attrName"
              :value="item.attrName"
              :label="$t(item.name)"
            ></el-option>
          </el-select>
        </div>
      </template>
      <filter-select
        v-else
        v-model="filters[filter.attrName]"
        filterable
        :multiple="true"
        clearable
        :disabled="filter.readonly"
        label-key="value"
        value-key="key"
        :select-list="filter.selectList"
        :is-user-select="
          ['assignUsers', 'createUsers'].includes(filter.attrName)
        "
        :placeholder="filter.placeholder || $t('请选择')"
        popper-append-to-body
        open-all
        open-clear
        @visableChange="visable => visableChange(visable, filter)"
      ></filter-select>
    </el-form-item>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 过滤字段组件
 * @author chenxiaolong
 * @date 2020.10.13
 */
import FilterMixins from './FilterMixins'
import FilterSelect from './FilterSelect'
import CustomDate from '@/components/custom-date'
export default {
  name: 'FilterComponent',
  components: {
    FilterSelect,
    CustomDate,
  },

  mixins: [FilterMixins],
  props: {
    filterSelectMaps: {
      type: [Object, Array],
      required: true,
      desc: i18n.t('已选择的过滤器候选项'),
    },

    filters: {
      type: Object,
      required: true,
      desc: i18n.t('原始过滤条件'),
    },

    workItemType: {
      type: [Number, String],
      required: true,
      desc: '类型 1 => 需求 2 => 任务 3 => 缺陷',
    },

    projectId: {
      type: [Number, String],
      required: true,
      desc: '项目id',
    },
  },
}
</script>

<style lang="scss" scoped>
.filter-item {
  /deep/ .el-select .el-select__tags {
    max-width: 255px !important;
  }
  .close-btn {
    position: relative;
    left: -5px;
    top: 1px;
    display: none;
    cursor: pointer;
  }

  &:hover {
    .close-btn {
      display: inline;
      color: $--color-primary;
    }
  }
}

.time-select-class {
  position: relative !important; // 修改#app下的全局样式
  width: 100%;
}

.dynamic-time {
  display: flex;
  align-items: center;
  width: 100%;
  *:first-child {
    flex: 0 0 130px;
  }

  *:not(:first-child) {
    margin-left: 10px;
  }
}

.choice-time-type {
  width: 100px;
  position: relative;
  float: right;

  .es-icon {
    font-size: 12px;
  }

  .el-tag {
    position: absolute;
    background-color: #666666;
    border: 1px solid #666666;
    top: 2px;
    right: 0;
    cursor: pointer;
    height: 26px;
    line-height: 26px;
  }

  .el-select {
    position: absolute;
    top: 5px;
    width: 100%;
    right: 0;
    opacity: 0;
    height: 22px;
    /deep/ .el-input {
      height: 20px;
    }
  }
}
</style>
