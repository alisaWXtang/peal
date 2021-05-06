<template>
  <div class="feedback-setting page-content__feedback">
    <two-block-width-changer
      :init-left-width="248"
      fixed-left
      bar-type="tiny"
      expand-btn
    >
      <div slot="left">
        <LeftColSelect
          :default-active="$route.name"
          :data="leftColSelectData"
          @change="onLeftColSelectChange"
        />
      </div>
      <div slot="right" class="page-content__feedback--right">
        <div class="operation-feedback__content">
          <router-view />
        </div>
      </div>
    </two-block-width-changer>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 运营 - 设置
 * @author wuqian
 * @time 2020.5.2
 */
import TwoBlockWidthChanger from '@/components/columbus-gantt-canvas/src/gantt-table/TwoBlockWidthChanger'
import LeftColSelect from '@/components/biz/left-col-select'
export default {
  name: 'Setting',
  components: {
    TwoBlockWidthChanger,
    LeftColSelect,
  },

  data() {
    return {
      leftColSelectData: [
        {
          id: 'settingNormal',
          title: i18n.t('内部用户反馈设置'),
        },
        {
          id: 'setting400',
          title: i18n.t('400工单反馈设置'),
        },
        {
          id: 'settingNotice',
          title: i18n.t('反馈通知设置'),
        },
      ],
    }
  },
  computed: {
    layoutHeight() {
      return window.innerHeight - 180 + 'px'
    },
  },

  watch: {},
  created() {},
  mounted() {},
  methods: {
    onLeftColSelectChange(path) {
      this.$router.push(path)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../common.scss';
/deep/.feedback-setting {
  .page-content__feedback--right {
    padding-top: 10px;
    padding-bottom: 10px;
    height: calc(100% - 36px) !important;
  }
}
</style>
