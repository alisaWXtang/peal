<template>
  <div class="manage-view">
    <co-menu
      mode="horizontal"
      :default-active="$route.path"
      @select="changeView"
    >
      <co-menu-item index="/manage-view/project">{{
        $t('项目总览')
      }}</co-menu-item>
      <co-menu-item index="/manage-view/member">{{
        $t('成员总览')
      }}</co-menu-item>
    </co-menu>
    <router-view class="manage-view__content"></router-view>
  </div>
</template>

<script>
// import { i18n } from '@/i18n'
// import Member from './Member'
// import Project from './Project'

export default {
  name: 'ManageView',
  // components: {
  //   Project,
  //   Member,
  // },
  data() {
    return {}
  },

  methods: {
    changeView(path) {
      this.$router.push(path)
    },
  },
}
</script>

<style lang="scss" scoped>
.manage-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;

  .el-menu--horizontal {
    border-bottom: none;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
    z-index: 1;

    & > .el-menu-item {
      height: 48px;
      line-height: 48px;

      &:not(.is-active) {
        color: $--color-text-regular;
      }
    }
  }

  .manage-view__content {
    flex: 1;
    height: 0;

    /deep/ .two-cols-layout {
      height: 100%;

      .two-cols-layout__left {
        width: 220px;
        background-color: $--background-gray;
        border-right: 1px solid #e5e5e5;
        box-sizing: border-box;

        & > .el-tabs {
          display: flex;
          flex-direction: column;
          height: 100%;

          .el-tabs__header {
            padding-top: 8px;

            .el-tabs__nav-wrap::after {
              background-color: #e5e5e5;
            }
          }

          .el-tabs__content {
            flex: 1;
            height: 0;
            overflow-y: auto;
          }
        }
      }

      .two-cols-layout__content {
        margin-left: -12px;

        & > div {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 16px 24px;
          box-sizing: border-box;
        }

        .common-table {
          width: 100%;
          border: none;
          border-radius: 0;

          th {
            border-right: 2px solid #ffffff;
          }

          td {
            border-right: none;
          }

          &:before,
          &:after {
            display: none;
          }
        }
      }
    }
  }

  // 只有一个 tab 时文字不高亮
  .manage-view__notManager {
    /deep/ .two-cols-layout__left .el-tabs__item {
      color: $--color-text-fine;
    }
  }
}
</style>
