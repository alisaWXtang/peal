<template>
  <el-form ref="form" class="config-form" :rules="rules" :model="localForm">
    <div class="label-piece">{{ $t('筛选') }}</div>
    <div class="header-btn">
      <el-button-group>
        <el-button
          :type="activeName === 'numerator' ? 'primary' : 'default'"
          @click="activeName = 'numerator'"
          >{{ $t('分子筛选') }}</el-button
        >
        <el-button
          :type="activeName !== 'numerator' ? 'primary' : 'default'"
          @click="activeName = 'denominator'"
          >{{ $t('分母筛选') }}</el-button
        >
      </el-button-group>
    </div>
    <template v-if="activeName === 'numerator'">
      <div class="metric-container form-group">
        <el-select
          ref="filtersSelect"
          v-model="localForm.numeratorFilters"
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
          disable-transitions
          @close="handleCloseFilter('numeratorFilters', 'numeratorFilter', tag)"
          >{{ $t(tag.name) }}</el-tag
        >
      </div>
      <filter-component
        class="form-group"
        :filter-select-maps="filterSelectMaps"
        :filters="localForm.numeratorFilter"
        :work-item-type="workItemType"
        :project-id="projectId"
        @deleteFilter="
          filter =>
            handleCloseFilter('numeratorFilters', 'numeratorFilter', filter)
        "
      ></filter-component>
    </template>
    <template v-else>
      <div class="metric-container form-group">
        <el-select
          ref="filtersSelect"
          v-model="localForm.denominatorFilters"
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
          disable-transitions
          closable
          @close="
            handleCloseFilter('denominatorFilters', 'denominatorFilter', tag)
          "
          >{{ $t(tag.name) }}</el-tag
        >
      </div>
      <filter-component
        class="form-group"
        :filter-select-maps="filterSelectMaps"
        :filters="localForm.denominatorFilter"
        :work-item-type="workItemType"
        :project-id="projectId"
        @deleteFilter="
          filter =>
            handleCloseFilter('denominatorFilters', 'denominatorFilter', filter)
        "
      ></filter-component>
    </template>
  </el-form>
</template>

<script>
/**
 * @title chartCategory 5 ratio 自定义报表 => 占比图
 * @author chenxiaolong
 * @date 2020.10.15
 */
import { dynamicFilterMaps } from '../../util'
import Mixins from './mixins'
export default {
  name: 'Ratio',
  mixins: [Mixins],
  data() {
    return {
      activeName: 'numerator',
      numeratorFilters: [],
      denominatorFilters: [],
    }
  },
  watch: {
    'localForm.denominatorFilters': function(val) {
      if (val) {
        this.denominatorFilters = this.filterMaps.filter(item =>
          val.includes(item.attrName),
        )
      } else {
        this.denominatorFilters = []
      }
      this.filterSelectMaps = this.denominatorFilters
    },
    'localForm.numeratorFilters': function(val) {
      if (val) {
        this.numeratorFilters = this.filterMaps.filter(item =>
          val.includes(item.attrName),
        )
      } else {
        this.numeratorFilters = []
      }
      this.filterSelectMaps = this.numeratorFilters
    },
    activeName(val) {
      if (val === 'numerator') {
        this.filterSelectMaps = this.numeratorFilters
      } else {
        this.filterSelectMaps = this.denominatorFilters
      }
    },
  },
  methods: {
    // 删除筛选
    handleCloseFilter(filtersKey, filterKey, filter) {
      const filters = this.localForm[filtersKey]
      const tagIndex = filters.indexOf(filter.attrName)

      if (tagIndex > -1) {
        filters.splice(tagIndex, 1)

        this.localForm[filterKey][filter.attrName] = null
        const dynamicKeys = Object.keys(dynamicFilterMaps)

        // 清空动态过滤字段信息
        if (dynamicKeys.includes(filter.attrName)) {
          const { attrName, isDynamic } = dynamicFilterMaps[filter.attrName]
          this.localForm[filterKey][attrName] = null
          this.localForm[filterKey][isDynamic] = false
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import './common';
.header-btn {
  pointer-events: auto;
  margin-bottom: 20px;
}
</style>
