<template>
  <el-form ref="form" class="config-form" :rules="rules" :model="localForm">
    <div class="form-group">{{ $t('数据设置') }}</div>
    <el-form-item v-if="localForm.statisticUnits" :label="$t('时长统计单位')">
      <el-select
        v-model="localForm.statisticUnits"
        :placeholder="$t('选择时间间隔')"
      >
        <el-option :label="$t('小时')" :value="3"></el-option>
        <el-option :label="$t('天')" :value="4"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="localForm.interval" :label="$t('时间间隔')">
      <el-select v-model="localForm.interval" :placeholder="$t('选择时间间隔')">
        <el-option
          v-for="item in statisticsUnits"
          :key="item.value"
          :label="$t(item.name)"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-form-item>
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
          :disabled="item.readonly"
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
        :closable="!tag.readonly"
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
 * @title chartCategory 8 workItemTimeIndicator 自定义报表
 * @author chenxiaolong
 * @date 2020.10.15
 */
import Mixins from './mixins'
import { statisticsUnits } from '../../util'
export default {
  name: 'WorkItemTimeIndicator',
  mixins: [Mixins],
  data() {
    return {
      statisticsUnits,
      readonlyFilters: ['statusIds'], // 状态不可编辑删除
    }
  },
}
</script>

<style lang="scss" scoped>
@import './common';
</style>
