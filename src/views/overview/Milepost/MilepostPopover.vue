<template>
  <el-popover
    trigger="hover"
    :open-delay="300"
    popper-class="one-milepost-popover"
    placement="top"
  >
    <div class="one-milepost-detail">
      <div class="popover-milepost-line">
        <div class="title">{{ $t('标题') }}:</div>
        <div class="content">{{ popoverData.title }}</div>
      </div>
      <div class="popover-milepost-line">
        <div class="title">{{ $t('处理人') }}:</div>
        <div class="content">{{ popoverData.assignUserName }}</div>
      </div>
      <div class="popover-milepost-line">
        <div class="title">{{ $t('预计完成时间') }}:</div>
        <div class="content">{{ popoverData.endTimePlan }}</div>
      </div>
      <div class="popover-milepost-line">
        <div class="title">{{ $t('状态') }}:</div>
        <div class="content">{{ popoverData.statusDesc }}</div>
      </div>
      <div
        v-if="deletePowerINfoManage"
        class="popover-milepost-line delete-box"
      >
        <span
          class="delete overview-operation-public"
          @click="deleteMilepost"
          >{{ $t('删除') }}</span
        >
      </div>
    </div>
    <div slot="reference">
      <slot></slot>
    </div>
  </el-popover>
</template>
<script>
/**
 * @title 里程碑popover
 * @desc
 * @author wangling
 * @date 2020/4/11
 */
export default {
  name: 'MilepostPopover',
  components: {},
  mixins: [],
  props: {
    popoverData: {
      type: Object,
      required: true,
      desc: 'popover数据',
    },
  },

  data() {
    return {
      projectId: this.$getUrlParams().projectId,
    }
  },
  computed: {
    deletePowerINfoManage() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_OVERVIEW_DELETE_MILESTONE',
        3,
        this.projectId,
      )
    },
  },

  watch: {},
  created() {},
  mounted() {},
  methods: {
    deleteMilepost() {
      this.$emit('deleteMilepost', this.popoverData.id)
    },
  },
}
</script>
<style lang="scss" scoped>
// 概览页面popover样式
.el-popper.one-milepost-popover {
  padding: 10px;
  color: #606266;
  .co-icon-delete:hover {
    cursor: pointer;
  }
  .popover-milepost-line {
    display: flex;
    margin-bottom: 5px;
    .title {
      width: 90px;
      margin-right: 5px;
      text-align: left;
    }
    .content {
      flex: 1;
    }
  }
  .delete-box {
    margin: 8px 0 0;
    justify-content: flex-end;
  }
}

.delete {
  display: inline-block;
  padding: 3px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  &:hover {
    cursor: pointer;
  }
}
.delete:hover {
  border-color: $--color-primary;
}
.overview-operation-public:hover {
  color: $--color-primary;
}
</style>
