<template>
  <el-tabs
    id="tab-wrap"
    v-model="activeName"
    type="border-card"
    @tab-click="handleClick"
  >
    <el-tab-pane
      v-for="item in notificationTabList"
      :key="item.type"
      :label="item.label"
      :name="item.name"
      :type="item.type"
    >
      <custom-notification-table
        :work-item-type="item.type"
        :work-item-name="item.name"
      ></custom-notification-table>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 通知设置
 * @desc
 * @author wangling
 * @date 2020.05.07
 */
import CustomNotificationTable from './CustomNotificationTable'
import ACTIONCONSTVARLIABLE from '@/store/action-types'
export default {
  name: 'CustomNotifications',
  components: {
    CustomNotificationTable,
  },

  mixins: [],
  props: {},
  data() {
    return {
      projectId: this.$getUrlParams().projectId,
      activeName: 'requirement',
      notificationTabList: [
        {
          type: 1,
          label: i18n.t('需求通知'),
          name: 'requirement',
        },

        {
          type: 2,
          label: i18n.t('任务通知'),
          name: 'task',
        },

        {
          type: 3,
          label: i18n.t('缺陷通知'),
          name: 'bug',
        },
      ],
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    const requireWorkItemType = 1
    this.getNotificationList(requireWorkItemType)
  },
  methods: {
    // 获取通知列表数据
    getNotificationList(workItemType) {
      this.$store.dispatch(ACTIONCONSTVARLIABLE.GET_NOTIFICATIONS_LIST, {
        payload: {
          projectId: this.projectId,
          workItemType,
        },
      })
    },
    handleClick(tab) {
      this.getNotificationList(tab.$attrs.type)
    },
  },
}
</script>
<style lang="scss">
// #tab-wrap .is-active {
//   color: #007aff !important;
// }
</style>
