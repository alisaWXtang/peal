<template>
  <el-form ref="form" class="config-form" :rules="rules" :model="localForm">
    <div class="label-piece">{{ $t('筛选') }}</div>
    <el-form-item
      v-for="filter in customFilterSelectMaps"
      :key="filter.attrName"
      class="form-group filter-item"
      :label="$t(filter.name)"
    >
      <div class="choice-time-type">
        <co-tag type="info" effect="dark"
          >{{
            localForm.filter.hasDynamicSprintIds
              ? $t('动态迭代')
              : $t('固定迭代')
          }}
          <i class="es-icon el-icon-arrow-down"></i
        ></co-tag>
        <el-select
          v-model="localForm.filter.hasDynamicSprintIds"
          :placeholder="$t('选择时间类型')"
          @change="val => changeSprintType(val, filter)"
        >
          <el-option :value="false" :label="$t('固定迭代')"></el-option>
          <el-option :value="true" :label="$t('动态迭代')"></el-option>
        </el-select>
      </div>

      <filter-select
        v-if="!localForm.filter.hasDynamicSprintIds"
        v-model="localForm.filter.sprintIds"
        filterable
        :multiple="true"
        clearable
        :disabled="filter.readonly"
        label-key="name"
        value-key="id"
        :group="true"
        group-label-key="name"
        :select-list="filter.selectList"
        :placeholder="$t(filter.placeholder) || $t('请选择')"
        popper-append-to-body
        open-all
        open-clear
      ></filter-select>

      <div v-else class="dynamic-time dynamic-sprint">
        <el-input-number
          v-model="localForm.filter.dynamicSprintIds.n"
          :min="1"
          :placeholder="$t('请输入')"
        ></el-input-number>
        <el-select
          v-model="localForm.filter.dynamicSprintIds.dynamicSprintIdsType"
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
    </el-form-item>
  </el-form>
</template>

<script>
/**
 * @title chartCategory 7 requireModify 自定义报表
 * @author chenxiaolong
 * @date 2020.10.15
 */
import { i18n } from '@/i18n'
import { projectHeaderFilterActionTypes } from '@/store/action-types'
import Mixins from './mixins'
import { synamicSprintTypes } from '../../util'
import FilterSelect from '../FilterSelect'
export default {
  name: 'RequireModify',
  components: {
    FilterSelect,
  },
  mixins: [Mixins],

  data() {
    return {
      synamicSprintTypes,
      customFilterSelectMaps: [],
    }
  },

  async mounted() {
    // 获取迭代列表
    await this.$store.dispatch(
      projectHeaderFilterActionTypes.GET_FILTER_HEADER_SPRINT_LIST,
      {
        projectId: this.projectId,
        includeUnplanned: true,
      },
    )
    const selectList =
      this.$store.state.projectCommonHeaderFilter.filterSprintList || []
    this.customFilterSelectMaps = [
      {
        name: i18n.t('迭代'),
        type: 'sprintId',
        readonly: false,
        attrName: 'sprintIds',
        selectList: selectList.map(item => {
          return {
            ...item,
            children: item.children.filter(child => !!child.id),
          }
        }),
        values: [],
      },
    ]
  },
  methods: {
    // 选择迭代类型
    changeSprintType(val) {
      if (val) {
        this.localForm.filter.sprintIds = null
        this.localForm.filter.dynamicSprintIds = {
          n: 1,
          dynamicSprintIdsType: 'LASTEST_NOTARCHIVED',
        }
      } else {
        this.localForm.filter.sprintIds = null
        this.localForm.filter.dynamicSprintIds = null
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import './common';
</style>
