<template>
  <div class="main">
    <div class="top searchTop" @click="linkDetail">
      <p class="id" v-html="itemData.idHighLight || itemData.id"></p>
      <i :class="['iconfont', 'type-icon', icon, iconColor]"></i>&nbsp;
      <p class="title" v-html="itemData.titleHighLight || itemData.title"></p>
    </div>
    <div class="content workitem_search_content">
      <div
        @click="linkDetail"
        v-html="itemData.contentHighLight || itemData.content"
      ></div>
    </div>
    <div class="summary">
      <span>所属项目：{{ itemData.projectName }}</span>
      <span>工作项类型：{{ itemData.workItemTypeName }}</span>
      <span>处理人：{{ itemData.dynamicAssignUserName }}</span>
      <span>状态：{{ itemData.statusName }}</span>
      <span>创建时间：{{ itemData.createTime }}</span>
    </div>
  </div>
</template>
<script>
/**
 * title:
 * desc: 关键字搜索结果展示组件
 */
export default {
  name: 'ResultItem',
  props: {
    type: {
      type: [String, Number],
      required: true,
      desc: '搜索类型',
    },
    itemData: {
      type: Object,
      required: true,
      desc: '列表数据',
    },
  },
  data() {
    return {}
  },
  computed: {
    icon() {
      const iconObj = {
        // 1: 'icon-requirement',
        // 2: 'icon-task',
        // 3: 'icon-bug',
        1: 'iconfont icon-xuqiu',
        2: 'iconfont icon-renwu',
        3: 'iconfont icon-quexian',
      }
      return iconObj[this.type]
    },
    iconColor() {
      const iconObj = {
        1: 'requirement',
        2: 'task',
        3: 'bug',
      }
      return iconObj[this.type]
    },
  },
  methods: {
    // 跳转详情
    linkDetail() {
      this.$emit('openSlide')
    },
  },
}
</script>
<style>
.searchTop span {
  color: #ea3447;
}
.workitem_search_content span {
  color: #ea3447;
}
</style>
<style lang="scss" scoped>
.main {
  padding: 5px 15px 10px;
  border-bottom: 1px solid $--border-color-lighter;
  color: #333;
  /deep/ em {
    font-style: normal !important;
    color: $--color-danger;
  }
  .top {
    padding: 5px 0 10px 0;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    font-weight: bolder;
    p {
      padding: 0;
      margin: 0;
    }
    .id {
      padding-right: 15px;
      flex-shrink: 0;
    }
    .title {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    span {
      color: #f00;
    }
  }
  .content {
    font-size: 12px;
    word-break: break-all;
    width: 100%;
    /deep/ img {
      max-width: 100%;
    }
    p {
      padding: 0;
      margin: 0;
      display: inline;
    }
    span {
      color: #f00;
    }
    div {
      display: inline;
      cursor: pointer;
    }
  }
  .summary {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #999;
    margin-top: 20px;
    span {
      margin-right: 70px;
    }
  }
  .requirement {
    /*color: #4b80f3;*/
    color: $--color-primary;
  }
  .task {
    color: #007aff;
  }
  .bug {
    color: #e66863;
  }
  .type-icon {
    font-weight: 100;
  }
}
</style>
