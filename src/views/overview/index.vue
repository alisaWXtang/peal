<template>
  <div class="overview-wrap">
    <div class="overview-left-box">
      <!-- 里程碑 -->
      <milepost class="milepost-box public-box"></milepost>
      <!-- 项目动态 -->
      <project-dynamic class="project-dynamic-box public-box"></project-dynamic>
    </div>
    <div class="overview-right-box">
      <!-- 项目名称 -->
      <project-basic-info
        class="project-name-box public-box"
      ></project-basic-info>
      <!-- 项目公告 -->
      <project-notice
        class="project-notice-box public-box"
        :project-id="$route.query.projectId"
      ></project-notice>
    </div>
  </div>
</template>

<script>
/**
 * @title 概览页面
 * @desc
 * @author wangling
 * @date 2020/04/07
 */
import Milepost from './Milepost'
import ProjectBasicInfo from './ProjectBasicInfo'
import ProjectNotice from './ProjectNotice'
import ProjectDynamic from './ProjectDynamic'

export default {
  name: 'Overview',
  components: {
    Milepost,
    ProjectBasicInfo,
    ProjectNotice,
    ProjectDynamic,
  },

  mixins: [],
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {
    this.$store.dispatch('projectOverviewInitData')
  },
  mounted() {},
  methods: {},
}
</script>
<style lang="scss" scoped>
@mixin flexColum {
  display: flex;
  flex-direction: column;
}

// 此页面高度自动撑开
.sub-app-layout-container .overview-wrap.management-main-content {
  height: auto;
}

.overview-wrap {
  display: flex;
  padding: 16px;
  font-size: 14px;
  background-color: #fff;

  > .overview-left-box {
    @include flexColum;
    flex: 3;
    width: 0;
    // 里程碑样式
    > .milepost-box {
      height: 240px;
    }

    // 项目动态样式
    > .project-dynamic-box {
      // flex: 1;
      margin-top: 16px;
    }
  }
  > .overview-right-box {
    @include flexColum;
    flex: 2;
    width: 0;
    margin-left: 16px;

    // > .project-name-box {
    //   flex: 1;
    // }

    > .project-notice-box:not(.fullscreen) {
      // flex: 1;
      margin-top: 16px;
    }
  }

  /deep/.icon-gaixie {
    font-weight: bolder;
  }

  // 4大块的公共样式
  .public-box {
    // display: flex;
    // flex-direction: column;
    box-sizing: border-box;
    padding: 16px;
    border: 1px solid $--background-gray;
    box-shadow: 0 2px 8px 0 rgba(72, 81, 95, 0.08);
    border-radius: 4px;
    background: #fff;

    // /deep/.public-wrap {
    //   flex: 1;
    //   overflow: auto;
    // }
    /deep/.overview-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      .title {
        padding-left: 10px;
        font-size: 16px;
        color: $--color-text-fine;
        border-left: 3px solid $--color-primary;
      }
      .overview-icon {
        font-size: 18px;
        line-height: 16px;
        color: $--color-text-secondary;
        &:hover {
          cursor: pointer;
          color: $--color-primary;
        }
      }
    }
  }

  // 设置鼠标样式 默认
  /deep/.cursor-default:hover {
    cursor: default;
  }
  // 设置鼠标样式 文字
  /deep/.cursor-text:hover {
    cursor: default;
  }
  // 设置鼠标样式 点击
  /deep/.cursor-pointer:hover {
    cursor: pointer;
  }
}
</style>
