<template>
  <el-form ref="form" class="config-form" :rules="rules" :model="localForm">
    <div class="form-group">{{ $t('数据设置') }}</div>
    <el-form-item :label="$t('时间间隔')">
      <el-select
        v-model="localForm.statisticUnits"
        :placeholder="$t('选择时间间隔')"
      >
        <el-option
          v-for="item in statisticsUnits"
          :key="item.value"
          :label="$t(item.name)"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('统计周期')">
      <div class="choice-time-type">
        <co-tag :title="$t('选择时间类型')" type="info" effect="dark"
          >{{ localForm.hasDynamicTimes ? $t('动态周期') : $t('固定周期') }}
          <i class="es-icon el-icon-arrow-down"></i
        ></co-tag>
        <el-select
          v-model="localForm.hasDynamicTimes"
          :placeholder="$t('选择时间类型')"
        >
          <el-option :value="false" :label="$t('固定周期')"></el-option>
          <el-option :value="true" :label="$t('动态周期')"></el-option>
        </el-select>
      </div>
      <custom-date
        v-if="!localForm.hasDynamicTimes"
        v-model="localForm.times"
        type="daterange"
        :start-placeholder="$t('请选择')"
        :end-placeholder="$t('请选择')"
        class="time-select-class"
      ></custom-date>
      <div v-else class="dynamic-time">
        <el-input-number
          v-model="localForm.dynamicTimes.n"
          :min="1"
          :placeholder="$t('请输入')"
        ></el-input-number>
        <el-select
          v-model="localForm.dynamicTimes.timeUnitType"
          :placeholder="$t('选择类别')"
        >
          <el-option value="YEAR" :label="$t('年')"></el-option>
          <el-option value="MONTH" :label="$t('月')"></el-option>
          <el-option value="WEEK" :label="$t('周')"></el-option>
          <el-option value="DAY" :label="$t('日')"></el-option>
        </el-select>
        <span>{{ $t('内') }}</span>
      </div>
    </el-form-item>

    <el-divider></el-divider>
    <div class="label-piece">{{ $t('筛选') }}</div>
    <div class="metric-container form-group">
      <el-select
        ref="filtersSelect"
        v-model="localForm.filters"
        class="metric-select"
        multiple
        clearable
        @change="filtersChange"
      >
        <el-option
          v-for="item in filterMaps"
          :key="item.name"
          :label="$t(item.name)"
          :value="item.attrName"
        ></el-option>
      </el-select>
      <el-button
        class="button-new-tag"
        round
        plain
        type="primary"
        size="mini"
        @click="handleChoiceFilters"
        >{{ $t('设置筛选条件') }}</el-button
      >
      <el-tag
        v-for="tag in filterSelectMaps"
        :key="tag.name"
        size="small"
        closable
        :disable-transitions="false"
        @close="handleCloseFilter(tag)"
        >{{ $t(tag.name) }}</el-tag
      >
    </div>
    <filter-component
      class="form-group"
      :filter-select-maps="filterSelectMaps"
      :filters="localForm.filter"
      :work-item-type="workItemType"
      :project-id="projectId"
      @deleteFilter="handleCloseFilter"
    ></filter-component>
  </el-form>
</template>

<script>
/**
 * @title chartCategory 4 defectStatusRun 自定义报表
 * @author chenxiaolong
 * @date 2020.10.15
 */
import Mixins from './mixins'
import CustomDate from '@/components/custom-date'
import { statisticsUnits } from '../../util'
export default {
  name: 'DefectStatusRun',
  components: {
    CustomDate,
  },
  mixins: [Mixins],
  data() {
    return {
      statisticsUnits,
    }
  },
}
</script>

<style lang="scss" scoped>
@import './common';
</style>
