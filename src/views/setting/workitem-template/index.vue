<template>
  <div>
    <router-view v-if="isTmplPath()"></router-view>
    <el-tabs
      v-else
      v-model="currentTmplTab"
      type="border-card"
      class="tab-wrap"
      @tab-click="handleTabClick"
    >
      <el-tab-pane
        v-for="(item, index) in tabList"
        :key="index"
        :label="item.label"
        :name="item.name"
      >
        <router-view
          v-if="currentTmplTab === item.name"
          :current-tmpl-tab="currentTmplTab"
        ></router-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title
 * @desc
 * @author wangling
 * @date
 */
export default {
  name: '',
  components: {},
  mixins: [],
  props: {},
  data() {
    return {
      currentTmplTab: 'require',
      tabList: [
        {
          name: 'require',
          label: i18n.t('需求模板'),
        },

        {
          name: 'task',
          label: i18n.t('任务模板'),
        },

        {
          name: 'bug',
          label: i18n.t('缺陷模板'),
        },
      ],
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    if (!this.isTmplPath()) {
      this.byUrlTabChange()
      this.goToPage(this.currentTmplTab)
    }
  },
  methods: {
    isTmplPath() {
      const params = ['require', 'task', 'bug']
      return (
        this.$route.meta.templDetail && params.includes(this.$route.params.type)
      )
    },
    goToPage(path) {
      this.$router.replace(
        `/project/setting/template/${path}?projectId=${
          this.$getUrlParams().projectId
        }`,
      )
    },
    // 根据路由地址改变tab当前选项
    byUrlTabChange() {
      const path = this.$route.path
      switch (path) {
        case '/project/setting/template/require':
          this.currentTmplTab = 'require'
          break
        case '/project/setting/template/task':
          this.currentTmplTab = 'task'
          break
        case '/project/setting/template/bug':
          this.currentTmplTab = 'bug'
          break
      }
    },
    // 点击tab,切换路由
    handleTabClick() {
      this.goToPage(this.currentTmplTab)
    },
  },
}
</script>
<style lang="scss" scoped>
// /deep/.tab-wrap .is-active {
//   color: $--color-primary !important;
// }
</style>
