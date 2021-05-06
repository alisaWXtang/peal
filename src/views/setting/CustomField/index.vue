<template>
  <el-tabs v-model="currentTab" type="border-card" @tab-click="customChoose">
    <el-tab-pane
      v-for="(item, index) in tabDataType"
      :key="index"
      :label="item.label"
      :name="item.name"
    >
      <custom-field-setting
        v-if="currentTab == item.name"
        :project-id="projectId"
        :work-item-type="currentTab"
      ></custom-field-setting>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 自定义字段
 * @desc
 * @author wangling
 * @date 2020-03-10
 */
import CustomFieldSetting from './CustomFieldSetting'

export default {
  name: 'CustomField',
  components: {
    CustomFieldSetting,
  },

  mixins: [],
  props: {},
  data() {
    return {
      currentTab: '1',
      tabDataType: [
        {
          label: i18n.t('需求字段'),
          name: '1',
        },

        {
          label: i18n.t('任务字段'),
          name: '2',
        },

        {
          label: i18n.t('缺陷字段'),
          name: '3',
        },
      ],

      projectId: this.$getUrlParams().projectId,
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.queryDescTmpl(this.currentTab)
  },
  methods: {
    customChoose() {
      this.queryDescTmpl(this.currentTab)
    },
    //获取自定义模板内容
    async queryDescTmpl(workItemType) {
      await this.$store.dispatch({
        type: 'getCustomField',
        payload: { workItemType: workItemType },
      })
    },
  },
}
</script>
<style lang="scss" scoped></style>
