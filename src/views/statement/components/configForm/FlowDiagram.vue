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
          v-model="localForm.summaryType"
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
      prop="rowGroup"
      :rules="[{ required: true, message: $t('请选择维度') }]"
    >
      <el-select
        v-model="localForm.rowGroup"
        :disabled="true"
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
    <el-form-item
      v-if="showDimensionYSelect && localForm.colGroup"
      class="form-group dimension-y"
      :label="$t('对比维度（Y轴）')"
    >
      <el-select
        v-model="localForm.colGroup"
        disabled
        :placeholder="$t('对比维度（Y轴）')"
      >
        <template v-for="item in dimensionOptions">
          <!-- 过滤x轴维度 -->
          <el-option
            v-if="item.attrName !== localForm.rowGroup"
            :key="item.attrName"
            :label="$t(item.name)"
            :value="item.attrName"
          ></el-option>
        </template>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('时间间隔')">
      <el-select v-model="localForm.interval">
        <el-option :label="$t('天')" value="DAY"></el-option>
        <el-option :label="$t('周')" value="WEEK"></el-option>
        <el-option :label="$t('月')" value="MONTH"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('统计周期')">
      <div class="choice-time-type">
        <co-tag :title="$t('选择时间类型')" type="info" effect="dark"
          >{{ localForm.hasDynamicTimes ? $t('动态时间') : $t('固定时间') }}
          <i class="es-icon el-icon-arrow-down"></i
        ></co-tag>
        <el-select
          v-model="localForm.hasDynamicTimes"
          :placeholder="$t('选择时间类型')"
          @change="changeTimeType"
        >
          <el-option :value="false" :label="$t('固定时间')"></el-option>
          <el-option :value="true" :label="$t('动态时间')"></el-option>
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
    <div class="form-group flex">
      {{ $t('图表类型') }}
      <span class="form-value-display">
        <i class="iconfont icon-line"></i>
        {{ $t(localChartName) }}
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
 * @title chartCategory 3 flowDiagram 自定义报表
 * @author chenxiaolong
 * @date 2020.10.15
 */
import Mixins from './mixins'
import CustomDate from '@/components/custom-date'
export default {
  name: 'FlowDiagram',
  components: {
    CustomDate,
  },
  mixins: [Mixins],
  methods: {
    // 同期周期类型改变
    changeTimeType(val) {
      this.localForm.times = []

      if (val) {
        this.localForm.dynamicTimes = {
          n: 1,
          timeUnitType: 'DAY',
        }
      } else {
        this.localForm.dynamicTimes = null
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import './common';
</style>
