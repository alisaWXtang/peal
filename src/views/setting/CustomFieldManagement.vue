<template>
  <div class="tab-minheight">
    <span class="setting-tab-header">{{ $t('缺陷自定义字段配置管理') }}</span>
    <div class="checkbox-content">
      <el-checkbox
        v-for="item in dataList"
        :key="item.key"
        v-model="item.isChecked"
        class="checkbox-item"
        :label="item.label"
        :disabled="!isEditable"
        >{{ item.label }}</el-checkbox
      >
    </div>
    <div
      v-if="$authFunction('FUNC_COOP_PROJ_MANG_BIZ_ASSOC', 3, projectId)"
      class="checkbox-footer"
    >
      <el-button-group>
        <el-button
          v-show="!isEditable"
          class="checkbox-button"
          type="primary"
          @click="controllBtnClick"
          >{{ $t('编辑') }}</el-button
        >
        <el-button
          v-show="isEditable"
          class="checkbox-button"
          type="primary"
          @click="okBtnClick"
          >{{ $t('保存') }}</el-button
        >
        <el-button
          v-show="isEditable"
          class="checkbox-button"
          type="primary"
          @click="cancelBtnClick"
          >{{ $t('取消') }}</el-button
        >
      </el-button-group>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 缺陷自定义字段配置管理 - 已废弃
 * @desc 缺陷自定义字段配置管理
 * @author heyunjiang
 * @date 2019.4.24
 */

import BugCustomFieldsMixin from '../bugManagement/BugCustomFieldsMixin'

export default {
  name: 'CustomFieldManagement',
  components: {},
  mixins: [BugCustomFieldsMixin],
  props: {},
  data() {
    return {
      projectId: this.$getUrlParams().projectId,
      isEditable: false, // 是否可以编辑
      dataList: [], // 当前 model 数据
      OriginalDataList: [], // 原始数据，用于数据回滚
    }
  },
  computed: {},
  watch: {},
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      let result = await this.getCustomFiledInfo()
      if (result.status === 200) {
        let defKeys = Object.keys(result.data.def)
        let list = Object.keys(result.data.config)
          .filter(item => defKeys.includes(item))
          .map(item => {
            return {
              key: item,
              label: result.data.def[item].fieldName,
              isChecked: result.data.config[item],
            }
          })
        this.dataList = list.map(item => {
          return { ...item }
        })
        this.OriginalDataList = list.map(item => {
          return { ...item }
        })
      }
    },
    // 点击编辑
    controllBtnClick() {
      this.isEditable = !this.isEditable
    },
    // 点击确定
    async okBtnClick() {
      this.controllBtnClick()
      let config = {}
      this.dataList.forEach(item => {
        config[item.key] = item.isChecked
      })
      let result = await this.updateCustomFiledInfo(config)
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('更新成功'),
          type: 'success',
        })

        this.initData()
      } else {
        // this.$message({ message: result.msg || '更新失败', type: 'error' })
      }
    },
    // 点击取消
    cancelBtnClick() {
      this.dataList = this.OriginalDataList.map(item => {
        return { ...item }
      })
      this.controllBtnClick()
    },
  },
}
</script>
<style lang="scss" scoped>
.setting-tab-header {
  font-size: 16px;
  font-weight: 900;
  display: block;
  margin-top: 12px;
}
.tab-minheight {
  overflow: hidden;
}
.checkbox-content {
  clear: left;
  overflow: hidden;
  margin-top: 25px;
}
.checkbox-footer {
  margin-top: 20px;
}
</style>
