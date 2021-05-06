<template>
  <div class="list-flter__container">
    <div class="statis-time mr15">
      <span class="label">{{ $t('统计时间') }}</span>
      <CustomDate
        v-model="filterInfoCopy.daterange"
        popper-class="statis-time__popper"
        style="width: 260px;"
        type="daterange"
        :clearable="false"
        range-separator="-"
        :start-placeholder="$t('开始时间')"
        :end-placeholder="$t('结束时间')"
        :picker-options="pickerOptions"
        @change="handleFilterThrottle('daterange')"
      ></CustomDate>
    </div>
    <div class="filter-keywords mr15">
      <co-input
        v-model.trim="filterInfoCopy.keyword"
        class="keywords__input"
        :placeholder="$t('输入成员姓名/工号搜索')"
        @keyup.native.enter="handleFilterThrottle('keyword')"
      >
        <template v-slot:suffix>
          <div class="keywords__icon">
            <i
              v-if="filterInfoCopy.keyword"
              class="el-input__icon el-icon-close"
              @click="handleClearKeyword"
            ></i>
            <i v-if="filterInfoCopy.keyword" class="line"></i>
            <i
              class="el-input__icon el-icon-search"
              @click="handleFilterThrottle('keyword')"
            ></i>
          </div>
        </template>
      </co-input>
    </div>
  </div>
</template>
<script>
/**
 * @title 成员列表过滤组件
 * @desc 时间、关键字过滤
 * @author wuwqian
 * @date 2020.4.16
 */
import { i18n } from '@/i18n'
import debounce from 'lodash/debounce'
import { mapState } from 'vuex'
import CustomDate from '@/components/custom-date'
export default {
  name: 'MemberListFilter',
  components: {
    CustomDate,
  },
  data() {
    return {
      filterInfoCopy: {
        keyword: '',
        daterange: [],
      },

      pickerOptions: {
        shortcuts: [
          {
            text: i18n.t('最近一周'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
              picker.$emit('pick', [start, end])
            },
          },

          {
            text: i18n.t('最近一个月'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },

          {
            text: i18n.t('最近三个月'),
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
      },
    }
  },
  computed: {
    ...mapState({
      defaultJob: state => state.manageViewMember.defaultJob,
      defaultFilterInfo: state => state.manageViewMember.defaultFilterInfo,
      filterInfo: state => state.manageViewMember.filterInfo,
    }),
  },

  watch: {
    filterInfo(val) {
      this.filterInfoCopy = { ...val }
    },
  },

  created() {
    this.handleFilterThrottle = debounce(this.onChangeFilterInfo, 300)
  },
  mounted() {},
  methods: {
    handleClearKeyword() {
      this.filterInfoCopy.keyword = ''
      this.filterInfoCopy.keyword !== this.filterInfo.keyword &&
        this.handleFilterThrottle('keyword')
    },
    onChangeFilterInfo(filterKey) {
      let filterInfo
      if (filterKey === 'daterange') {
        filterInfo = {
          pageNumber: 1,
          groupId: this.defaultJob,
          daterange: this.filterInfoCopy.daterange,
          startDate:
            this.filterInfoCopy.daterange && this.filterInfoCopy.daterange[0],
          endDate:
            this.filterInfoCopy.daterange && this.filterInfoCopy.daterange[1],
        }
      }
      if (filterKey === 'keyword') {
        filterInfo = {
          pageNumber: 1,
          groupId: this.defaultJob,
          keyword: this.filterInfoCopy.keyword,
        }
      }
      this.$store.dispatch('getMemberViewList', filterInfo)
    },
  },
}
</script>
<style lang="scss" scoped>
.list-flter__container {
  display: flex;
  justify-content: flex-start;
  .statis-time {
    width: 320px;
    height: 28px;
    .label {
      padding-right: 10px;
      line-height: 28px;
    }
  }
  .filter-keywords {
    width: 250px;
    .keywords__input /deep/ .el-input__inner {
      padding-right: 50px !important;
    }
    .el-input__icon {
      cursor: pointer;
      width: 20px;
    }
    .keywords__icon {
      display: flex;
      .el-icon-close {
        font-size: 12px;
      }
      .line {
        margin: 6px 4px 6px 2px;
        display: inline-block;
        width: 1px;
        height: 16px;
        background-color: #bfbfbf;
      }
    }
  }
}
</style>
