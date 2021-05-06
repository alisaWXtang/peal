<template>
  <div class="left-content">
    <div class="left-content-header border-box">
      <span class="field-edit-asside">{{ $t('排列方式') }}：</span>
      <field-edit
        v-bind="FieldEditProps"
        :on-change="onFilterChange"
      ></field-edit>
      <span class="field-edit-asside"
        ><i
          :class="headerIconClass"
          class="header-icon-class"
          @click="headerIconClick"
        ></i
      ></span>
    </div>
    <div class="left-content-body scrollbal-common">
      <div
        v-for="item in bugList"
        :key="item.id"
        class="bug-card-simple"
        :class="{ 'bug-active': item.id === +activeBugInfo.id }"
        @click="cardClick(item)"
      >
        <p :class="'bug-card-title bug-card-simple-' + item.id">
          ID:{{ item.id }}
          <span
            class="bug-card-simple-status ellipsis statusbox-list-common"
            :style="{ '--color': item.display.detail.status.color }"
            :title="item.display.detail.status.statusName"
            >{{ item.display.detail.status.statusName }}
          </span>
        </p>
        <p>{{ item.display.title }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 缺陷左侧列表
 * @author heyunjiang
 * @date 2019-3-4
 */
import FieldEdit from '@/components/field-edit'
export default {
  name: 'LeftList',
  components: {
    FieldEdit,
  },

  props: {
    bugList: {
      type: Array,
      required: true,
    },

    activeBugInfo: {
      type: Object,
      required: true,
    },

    changeActiveBugInfo: {
      type: Function,
      required: true,
    },

    updateCommonInfo: {
      type: Function,
      desc: '该函数用于更新当前列表数据，并且会更新到当前活跃项所对应的页数',
    },

    commonFilterInfo: Object,
  },

  data() {
    return {
      isSortAsc: true, // 排序是否是升序
      FieldEditProps: {
        // FieldEdit 组件 prop
        fieldType: 'select',
        initValue: 'createTime',
        selectValue: [
          { key: 'createTime', value: i18n.t('创建时间') },
          { key: 'updateTime', value: i18n.t('修改时间') },
          { key: 'priority', value: i18n.t('严重程度') },
          { key: 'statusId', value: i18n.t('状态') },
        ],
      },
    }
  },
  computed: {
    headerIconClass: function() {
      return this.isSortAsc ? 'el-icon-arrow-down' : 'el-icon-arrow-up' // 后续再定方向
    },
  },

  watch: {
    bugList() {
      /**
       * 在该声明周期内部实现滚动到制定元素功能
       * 如果列表存在当前活跃的缺陷项，则滚动，否则不滚动
       */
      this.scrollToElement()
    },
  },

  created: function() {
    this.updateInitValue()
  },
  mounted: function() {
    this.scrollToElement()
  },
  methods: {
    updateInitValue() {
      this.isSortAsc =
        this.commonFilterInfo.orderBy[0].order === 'DESC' ? true : false
      this.FieldEditProps.initValue = this.commonFilterInfo.orderBy[0].column
    },
    // 让当前展示条目滚动到可视区域内
    scrollToElement() {
      let isIn = this.bugList.filter(item => item.id === this.activeBugInfo.id)
      if (isIn.length === 0) {
        return false
      }
      setTimeout(() => {
        let currentElement = document.querySelector(
          '.bug-card-simple-' + isIn[0].id,
        )

        if (currentElement && currentElement.scrollIntoViewIfNeeded) {
          currentElement.scrollIntoViewIfNeeded() // webkit 浏览器自带的方法
        } else {
          // currentElement.scrollIntoView() // 其他浏览器自带的方法，该方法在火狐下有体验问题，暂时屏蔽
        }
      })
    },
    headerIconClick() {
      this.isSortAsc = !this.isSortAsc
      this.$nextTick(function() {
        this.onFilterChange(this.FieldEditProps.initValue)
      })
    },
    cardClick(info) {
      window.scrollTo(0, 0) // 回到顶部，不再有抖动
      this.changeActiveBugInfo(info)
    },
    onFilterChange(value) {
      this.FieldEditProps.initValue = value
      this.updateCommonInfo({
        orderBy: [
          {
            column: value,
            order: this.isSortAsc ? 'DESC' : 'ASC',
          },
        ],

        pageInfo: {
          pageSize: this.commonFilterInfo.pageInfo.pageSize,
          pageNumber: 1,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/style/bug/BugCommon';
$leftHeaderHeight: 28px;
.left-content {
  height: calc(100% - 30px);
}
.left-content-header {
  height: $leftHeaderHeight;
  line-height: $leftHeaderHeight;
  margin: 6px 10px;
  .field-edit-asside {
    display: inline-block;
    overflow: hidden;
  }
  .header-icon-class {
    cursor: pointer;
    &:hover {
      background-color: $color-gray-common;
    }
  }
}
.left-content-body {
  height: calc(100% - 40px);
  overflow-x: hidden;
  overflow-y: auto;
  .bug-active {
    background-color: rgba($--color-primary, 0.1);
    p {
      // text-decoration: underline;
    }
  }
  .bug-card-simple {
    height: 80px;
    padding: 16px;
    box-sizing: border-box;
    // border-bottom: 1px solid $--background-gray;
    position: relative;
    cursor: pointer;
    &:hover {
      @extend .bug-active;
    }
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 16px;
      right: 16px;
      height: 1px;
      background-color: $--background-gray;
    }

    p {
      @extend .list-item-ellipsis;
      margin: 0;
      font-size: 14px;
      // color: $color-font-active-jira;

      &.bug-card-title {
        margin-bottom: 16px;
      }
    }
    .bug-card-simple-status {
      position: absolute;
      right: 20px;
      top: 12px;
      padding: 2px 16px;
      height: 26px;
      line-height: 21px;
      display: inline-block;
      max-width: 12em;
      .mini-circle {
        margin: 0 2px 0 0;
        // width: 8px;
        // height: 8px;
        // border-radius: 4px;
        // top: -1px;
      }
    }
  }
}
</style>
