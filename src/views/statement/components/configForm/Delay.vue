<template>
  <el-form ref="form" class="config-form" :rules="rules" :model="localForm">
    <div class="label-piece">{{ $t('图表设置') }}</div>
    <div class="form-group flex">
      {{ $t('汇总方式') }}
      <span v-if="!showSummarySelect" class="form-value-display">{{
        $t(localSummaryName)
      }}</span>
      <span v-else class="form-value-display">
        <el-select
          ref="summarySelect"
          v-model="localForm.column[0].summaryType"
          :placeholder="$t('选择汇总方式')"
          @visible-change="summaryVisibleChange"
        >
          <el-option
            v-for="item in localSummayList"
            :key="item.attrName"
            :label="$t(item.name)"
            :value="item.attrName"
          ></el-option>
        </el-select>
      </span>
    </div>
    <div class="form-group">{{ $t('数据设置') }}</div>
    <el-form-item
      class="form-group"
      :label="$t('对比维度（X轴）')"
      prop="row.rowGroup"
      :rules="[{ required: true, message: $t('请选择维度') }]"
    >
      <el-select
        v-model="localForm.row.rowGroup"
        :disabled="localForm.rowDefinitionEditable === false"
        :placeholder="$t('对比维度（X轴）')"
      >
        <el-option
          v-for="item in dimensionOptions"
          :key="item.attrName"
          :label="$t(item.name)"
          :value="item.attrName"
        ></el-option>
      </el-select>
    </el-form-item>
    <!-- 在未选择饼状图时，可新增对比维度 -->
    <div
      v-if="
        !showDimensionYSelect &&
          localForm.column[0].chartType !== 'PieChart' &&
          localForm.column[0].colGroupEditable
      "
      class="form-group"
    >
      <el-button
        type="primary"
        plain
        round
        @click="showDimensionYSelect = true"
        >{{ $t('增加对比维度') }}</el-button
      >
    </div>
    <el-form-item
      v-else-if="
        showDimensionYSelect && localForm.column[0].chartType !== 'PieChart'
      "
      class="form-group dimension-y"
      :label="$t('对比维度（Y轴）')"
    >
      <i
        class="el-icon-error close-btn"
        :title="$t('删除')"
        @click="cancelDimensionY"
      ></i>
      <el-select
        v-model="localForm.column[0].colGroup"
        :placeholder="$t('对比维度（Y轴）')"
      >
        <el-option
          v-for="item in dimensionOptions"
          :key="item.attrName"
          :label="$t(item.name)"
          :value="item.attrName"
        ></el-option>
      </el-select>
    </el-form-item>
    <div class="form-group flex">
      {{ $t('图表类型') }}
      <span
        v-if="!showChartTypeSelect"
        class="form-value-display choice-chart"
        @click="handleChartTypeChoice"
      >
        <i
          class="iconfont"
          :class="{
            'icon-pie': localForm.column[0].chartType === 'PieChart',
            'icon-line': localForm.column[0].chartType === 'LineChart',
            'icon-chart': localForm.column[0].chartType === 'BarChart',
          }"
        ></i
        >{{ $t(localChartName) }} <i class="es-icon el-icon-arrow-down"></i>
      </span>
      <span v-else class="form-value-display">
        <el-select
          ref="chartTypeSelect"
          v-model="localForm.column[0].chartType"
          :placeholder="$t('选择图表类型')"
          @visible-change="chartTypeVisibleChange"
        >
          <template v-for="item in localChartTypes">
            <el-option
              v-if="!(item.type === 'PieChart' && localForm.column[0].colGroup)"
              :key="item.attrName"
              :label="$t(item.name)"
              :value="item.attrName"
            >
              <i
                class="iconfont"
                :class="{
                  'icon-pie': item.type === 'pie',
                  'icon-line': item.type === 'line',
                  'icon-chart': item.type === 'histogram',
                }"
              ></i>
              <span>{{ $t(item.name) }}</span>
            </el-option>
          </template>
        </el-select>
      </span>
    </div>
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
 * @title chartCategory 6 delay 自定义报表
 * @author chenxiaolong
 * @date 2020.10.15
 */
import Mixins from './mixins'
export default {
  name: 'Delay',
  mixins: [Mixins],
}
</script>

<style lang="scss" scoped>
@import './common';
</style>
