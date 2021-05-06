<template>
  <div id="feedbackFilter" class="feedback-filter__container">
    <div class="top__row mb10">
      <co-input
        v-model="filterInfo.title"
        class="feedback-filter-keyword"
        :placeholder="placeHolder"
        clearable
        @clear="onFilter"
        @keyup.native.enter="handleFilterThrottle"
      >
      </co-input>
      <div class="filter-right-container">
        <co-button
          v-if="showCreateFeedback"
          type="primary"
          @click="createFeedback"
        >
          {{ $t('创建反馈') }}
        </co-button>
        <co-divider v-if="showCreateFeedback" direction="vertical" />
        <filter-dialog
          ref="filterDialog"
          class="more-filter-dialog"
          :title="$t('过滤')"
        >
          <el-link
            slot="reference"
            :underline="false"
            class="el-button-text icon iconfont icon-guolv1 hover-filter"
            >{{ $t('过滤') }}
          </el-link>
          <div slot="content" class="filter-container">
            <div class="filter-item-container">
              <!-- 已选项标签 -->
              <!--              <BaseTags-->
              <!--                :tags="selectedTags"-->
              <!--                class="selected-tags-container"-->
              <!--                @handleCloseTag="handleCloseTag"-->
              <!--              />-->
              <co-form>
                <template v-for="(item, name) in filterItemsMap">
                  <co-form-item v-if="!item.hidden" :key="name">
                    <div>{{ item.name }}</div>
                    <FormItem
                      v-model="filterInfo[name]"
                      v-bind="item.props"
                      @change="onChangeFilterItem($event, name)"
                      @filterUser="onFilterUserThrottle"
                    />
                  </co-form-item>
                </template>
              </co-form>
            </div>
            <div class="filter-footer-container">
              <el-button type="primary" @click="resetFilter">
                {{ $t('清除过滤条件') }}
              </el-button>
              <el-button type="primary" @click="handleFilterThrottle">
                {{ $t('过滤') }}
              </el-button>
            </div>
          </div>
        </filter-dialog>
        <co-divider direction="vertical" />
        <div>
          <el-link
            :underline="false"
            class="el-button-text icon iconfont icon-daochu"
            @click="exportFeedback"
          >
            {{ $t('导出') }}
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * @title 反馈过滤
 * @author wuqian
 * @date 2020.5.2
 */
import { operationActionTypes } from '@/store/action-types'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'
import FormItem from './FormItem'
import FilterDialog from '@/components/filter-dialog'
// import BaseTags from '@/components/base-tags'
export default {
  name: 'FeedbackFilter',
  components: { FormItem, FilterDialog },
  data() {
    return {
      filterItemsMap: {}, // 过滤项配置map
      filterInfo: {
        // 列表过滤信息
        title: '',
        productIds: [],
        feedbackTypeIds: [],
        prioritys: [],
        statuses: [],
        createUsers: [],
        createTimes: [],
        createTimlastUpdateTimeses: [],
        problemLevels: [],
      },
      filterId: null, // 过滤器id
      selectedTags: {},
    }
  },
  computed: {
    ...mapState({
      _filterInfo: state => state.operationFeedbackList.filterInfo,
      _filterItemsMap: state => state.operationFeedbackList.filterItemsMap,
      loading: state => state.operationFeedbackList.loading,
    }),
    showCreateFeedback() {
      return this.$route.name === 'operationFeedbackInner'
    },
    placeHolder() {
      return `${this.$i18n.t('请输入标题/ID')}${
        this.$route.name !== 'operationFeedback400'
          ? '/' + this.$i18n.t('移动互联网单号')
          : ''
      }`
    },
  },
  watch: {
    _filterInfo: {
      handler: function(val) {
        this.filterInfo = cloneDeep(val)
      },
      immediate: true,
    },
    _filterItemsMap: {
      handler: function(val) {
        this.filterItemsMap = val
      },
      immediate: true,
    },
  },
  created() {
    this.handleFilterThrottle = debounce(this.onFilter, 300)
    this.onFilterUserThrottle = debounce(this.onFilterUser, 300)
  },
  mounted() {},
  methods: {
    // 重置
    resetFilter() {
      this.filterInfo = cloneDeep(this._filterInfo)
      this.selectedTags = {}
    },
    // 切换过滤器
    onChangeFilter(val) {
      this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_SWITCH_FILTER,
        {
          filterId: val,
        },
      )
    },
    // 列表过滤
    onFilter() {
      this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_GET_FEEDBACK_LIST,
        {
          filterInfo: this.filterInfo,
          pageInfo: {
            pageNumber: 1,
          },
        },
      )
      this.$refs.filterDialog.handleClose()
    },
    // 创建人、当初处理人关键字搜索回调
    onFilterUser({ keyword, key }) {
      this.$store.dispatch(
        operationActionTypes.ACTION_OPERATION_FEEDBACK_USER_FILTER,
        { keyword, key },
      )
    },
    // 过滤项发生改变
    async onChangeFilterItem(value, key) {
      // 选中产品名称后查对应的反馈类型
      if (key === 'productIds') {
        // 清空选中的反馈类型
        this.filterInfo.feedbackTypeIds = []
        // 查反馈类型数据
        await this.$store.dispatch(
          operationActionTypes.ACTION_OPERATION_FEEDBACK_FILTERITEM_FEEDBACKTYPE_LIST,
          {
            productIds: value || null,
            isProductChange: true,
          },
        )
      }
      if (this.filterItemsMap[key].props.componentType === 'OpCascader') {
        const realValue = value.map(item => item.value)
        this.filterInfo[key] = realValue
        this.setSelectedTags(key, realValue, value)
      } else {
        this.filterInfo[key] = value
        this.setSelectedTags(key, value)
      }
      // this.onFilter()
    },
    // 设置选中的tags
    setSelectedTags(key, value, cascaderValues) {
      const filterItemObj = this.filterItemsMap[key]
      if (filterItemObj) {
        const {
          type,
          props: {
            data,
            valueAttr = 'id',
            labelAttr = 'name',
            selectedLabel,
            componentType,
          },
        } = filterItemObj
        let label = []
        if (componentType === 'OpCascader' && cascaderValues) {
          label = cascaderValues.map(item => item.label)
        } else {
          if (type === 'MULTI_CHOICE' || type === 'MULTI_MEMBER_CHOICE') {
            value.forEach(valueItem => {
              data.forEach(propsItem => {
                if (valueItem === propsItem[valueAttr]) {
                  label.push(propsItem[labelAttr])
                }
              })
            })
          } else if (type === 'LITE_DATE') {
            label = value ? value.join(` ${this.$i18n.t('至')} `) : ''
          } else {
            label = value
          }
        }
        this.$set(this.selectedTags, key, {
          name: selectedLabel,
          label,
          value,
          type: key,
        })
      }
    },
    // 创建反馈
    createFeedback() {
      this.$emit('create')
    },
    async handleCloseTag(key) {
      this.filterInfo[key] = []
      this.$set(this.selectedTags, key, {})
      if (key === 'productIds') {
        // 清空选中的反馈类型
        this.filterInfo.feedbackTypeIds = []
        this.$set(this.selectedTags, 'feedbackTypeIds', {})
        // 查反馈类型数据
        await this.$store.dispatch(
          operationActionTypes.ACTION_OPERATION_FEEDBACK_FILTERITEM_FEEDBACKTYPE_LIST,
          {
            productIds: null,
            isProductChange: true,
          },
        )
      }
    },
    closeFilterDialog() {
      this.selectedTags = {}
      this.$refs.filterDialog.handleClose()
    },
    // 导出反馈
    exportFeedback() {
      this.$emit('export', this.filterInfo)
    },
  },
}
</script>
<style lang="scss" scoped>
#feedbackFilter {
  .feedback-filter-keyword {
    width: auto;
    /deep/ .el-input__inner {
      padding-right: 30px;
      width: 230px;
    }
  }
}
.feedback-filter__container {
  .top__row {
    display: flex;
    justify-content: space-between;
  }
  .filter-right-container /deep/ {
    display: flex;
    align-items: center;
    .content-dialog-box {
      padding: 16px 0 0 0;
    }
    .header-wrap {
      padding: 0 24px;
    }
    .filter-container {
      height: calc(100% - 30px);
      display: flex;
      flex-direction: column;
      .filter-item-container {
        flex: 1;
        overflow: auto;
        padding: 0 24px;
        margin-top: 10px;
        .el-form-item {
          margin-bottom: 12px;
          .el-date-editor.el-input__inner {
            width: 100%;
            position: static;
          }
        }
      }
      .filter-footer-container {
        height: 60px;
        line-height: 60px;
        text-align: right;
        padding: 0 24px;
      }
    }
  }
  .footer__row {
    .el-form-item--mini.el-form-item {
      margin-bottom: 5px;
    }
  }
  .feedback-filter-select {
    /deep/ .content {
      font-size: 18px;
      font-weight: 700;
      line-height: 28px;
    }
  }
}
</style>
