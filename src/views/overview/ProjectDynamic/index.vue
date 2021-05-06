<template>
  <div class="project-dynamic-wrap">
    <div class="overview-header">
      <div class="title">{{ $t('项目动态') }}</div>
      <co-dropdown size="medium" @command="handleCommand">
        <co-button suffix-icon="co-icon-arrow-down"
          >{{ selectedType }}
          <!-- <i class="co-icon-arrow-down co-icon--right import-out"></i> -->
        </co-button>
        <co-dropdown-menu slot="dropdown">
          <div v-if="dynamicTypeList">
            <co-dropdown-item
              v-for="typeInfo in dynamicTypeList"
              :key="typeInfo.workItemType"
              :command="typeInfo"
              :class="
                selectedWorkItemType === typeInfo.workItemType
                  ? 'selected-dynamic-type'
                  : ''
              "
              >{{ typeInfo.type }}</co-dropdown-item
            >
          </div>
        </co-dropdown-menu>
      </co-dropdown>
    </div>
    <dynamic-list></dynamic-list>
  </div>
</template>
<script>
/**
 * @title 项目动态
 * @desc
 * @author liufeng
 * @date 2020/04/08
 */
import DynamicList from './DynamicList'
import { mapState } from 'vuex'
export default {
  name: 'ProjectDynamic',
  components: {
    DynamicList,
  },

  data() {
    return {
      projectId: this.$route.query.projectId,
    }
  },
  computed: {
    ...mapState({
      dynamicTypeList: state => state.projectOverviewDynamic.dynamicTypeList,
      selectedWorkItemType: state =>
        state.projectOverviewDynamic.projectDynamicInfo.workItemType,
    }),

    selectedType() {
      const selected = this.dynamicTypeList.find(
        item => item.workItemType === this.selectedWorkItemType,
      )

      return selected && selected.type
    },
  },

  methods: {
    handleCommand({ workItemType }) {
      this.$store.dispatch('getProjectDynamic', {
        projectId: this.projectId,
        workItemType: workItemType,
        isQuery: true,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.project-dynamic-wrap {
  display: flex;
  flex-direction: column;
}
.selected-dynamic-type {
  color: #fff;
  background-color: $--color-primary;
}
</style>
