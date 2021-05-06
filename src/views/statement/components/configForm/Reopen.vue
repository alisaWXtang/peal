<template>
  <el-form ref="form" class="config-form" :rules="rules" :model="localForm">
    <div class="form-group">{{ $t('数据设置') }}</div>
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
 * @title chartCategory 9 reopen 自定义报表
 * @author chenxiaolong
 * @date 2020.10.15
 */
import Mixins from './mixins'
import { statisticsUnits } from '../../util'
export default {
  name: 'Reopen',
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
