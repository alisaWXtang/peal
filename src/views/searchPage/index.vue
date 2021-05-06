<!--
 * @Descripttion:
 * @version:
 * @Author: lili
 * @Date: 2020-04-26 15:56:04
 * @LastEditors: lili
 * @LastEditTime: 2020-09-14 19:31:01
 -->
<template>
  <div class="search-page">
    <div class="search-page-content">
      <!-- <div class="search-top">
      <div class="back">
        <co-button type="text" @click="goBack">返回 >></co-button>
      </div>
    </div> -->
      <div class="search-wrap" :style="styleObj">
        <div class="space"></div>
        <div class="search-input">
          <div class="keyword">
            <co-input
              v-model.trim="keyword"
              placeholder="关键字搜索"
              type="text"
              @keyup.enter.native="handleSearch"
            ></co-input>
          </div>
          <div class="type">
            <co-select
              v-model="searchType"
              placeholder="请选择"
              @change="handleSelectChange"
            >
              <co-option label="全部" :value="null"></co-option>
              <co-option label="在需求中搜索" :value="1"></co-option>
              <co-option label="在任务中搜索" :value="2"></co-option>
              <co-option label="用缺陷中搜索" :value="3"></co-option>
            </co-select>
          </div>
          <div class="btn">
            <co-button type="primary" @click="handleSearch">搜索</co-button>
          </div>
        </div>
        <div class="notice">
          查找结果：找到 {{ pageInfo ? pageInfo.total : 0 }} 个相关工作项。
        </div>
      </div>
      <div ref="list" v-loading="loading" class="result">
        <div ref="box">
          <result-item
            v-for="item in resultList"
            :key="item.id"
            :item-data="item"
            :type="item.workItemType"
            @openSlide="openSlide(item)"
          ></result-item>
        </div>
        <div class="pagination">
          <el-pagination
            background
            :current-page="pageInfo.pageNum"
            :page-sizes="[15, 30, 50]"
            :page-size="pageInfo.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageInfo.total"
            @size-change="handlePageSizeChange"
            @current-change="handleCurrentPageChange"
          ></el-pagination>
        </div>
      </div>
      <work-item-detail
        :id.sync="workItemId"
        :slider-status.sync="sliderStatus"
        :work-item-type="workItemType"
        :project-id="projectId"
        @updateWorkInfoSuccess="updateWorkInfoSuccess"
      ></work-item-detail>
    </div>
  </div>
</template>
<script>
// import { getMainProps } from '@/main'
import { mapState, mapMutations } from 'vuex'
import debounce from 'lodash/debounce'
import workItemDetail from '@/components/biz/open-work-item-slide'
import resultItem from './resultItem'
export default {
  name: 'SearchPage',
  components: {
    workItemDetail,
    resultItem,
  },
  data() {
    return {
      keyword: '',
      searchType: null,
      loading: false,
      sliderStatus: false,
      workItemId: 0,
      workItemType: '',
      currentPage: 1,
      pageInfo: {
        pageNum: 1,
        pageSize: 15,
        pages: 0,
        total: 1,
      },
      projectId: '',
      styleObj: {},
    }
  },
  computed: {
    ...mapState({
      resultList: state => state.workItemManage.searchResultList, // 搜索结果
    }),
    // 显示高度
    tableBodyHeight() {
      return window.innerHeight - 248
    },
  },
  watch: {
    sliderStatus(val) {
      if (!val) {
        this.$router.replace({
          query: {
            keyword: this.keyword,
            searchType: this.searchType,
          },
        })
      }
    },
  },
  created() {
    // getMainProps().PubSub.subscribe('onSystemNoticeClosed', () => {
    //   this.calcOffsetHeight()
    // })
    this.calcOffsetHeight()
  },
  mounted() {
    const { keyword, searchType } = this.$route.query
    this.keyword = keyword
    this.searchType = searchType ? Number(searchType) : null
    this.calcOffsetHeight()
    window.removeEventListener('resize', this.calcOffsetHeight, false)
    window.addEventListener('resize', this.calcOffsetHeight, false)
    this.searchEvent()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calcOffsetHeight, false)
  },
  methods: {
    ...mapMutations({
      setSearchResult: 'UPDATE_SEARCH_RESULT',
    }),
    // 关键字搜索
    async searchEvent(scrollTop = true) {
      this.loading = true
      const res = await this.$store.dispatch('getWorkItemSearch', {
        pageNum: this.pageInfo.pageNum,
        pageSize: this.pageInfo.pageSize,
        workItemType: this.searchType,
        keyword: this.keyword,
      })
      if (res.status === 200) {
        let newList = res.data?.workItems || []
        this.setSearchResult(newList)
        this.$router.replace({
          query: {
            keyword: this.keyword,
            searchType: this.searchType,
          },
        })
        this.pageInfo = res.data?.pageInfo || this.pageInfo
        scrollTop && this.backTop()
        this.loading = false
      }
    },
    // 修改搜索关键字
    // handleInput: debounce(function(val) {
    //   this.keyword = val;
    //   this.searchEvent();
    // }, 500),
    // 修改搜索类型
    handleSelectChange(val) {
      this.searchType = val
      this.searchEvent()
    },
    // 手动搜索
    handleSearch: debounce(function() {
      this.pageInfo.pageNum = 1
      this.setSearchResult([])
      this.searchEvent()
    }, 500),
    //改变页码
    handlePageSizeChange(val) {
      this.pageInfo.pageSize = val
      this.searchEvent()
    },
    //改变当前页
    handleCurrentPageChange(val) {
      this.pageInfo.pageNum = val
      this.searchEvent()
    },
    // 返回
    goBack() {
      this.$router.go(-1)
    },
    // 打开详情
    openSlide(val) {
      const { id, projectId, workItemType } = val
      this.workItemId = id
      this.projectId = projectId
      this.workItemType = workItemType
      this.sliderStatus = true
    },
    //分页之后滚动条回到顶部位置
    backTop() {
      const el = document.getElementsByClassName('result')
      el[0].scrollTop = 0
    },
    // 工作项更新回调--重新获取数据
    updateWorkInfoSuccess() {
      this.searchEvent(false)
    },
    // 计算组件的偏移距离
    calcOffsetHeight() {
      // const { top, left } = document
      //   .querySelector('#main-content')
      //   .getBoundingClientRect()
      // console.log(left)
      this.styleObj = {
        // top: top + 'px',
        top: '64px',
        left: '10px',
        right: '15px',
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.search-page {
  background: #f0f2f5;
  height: 100%;
  overflow: hidden;
  .search-page-content {
    margin: 10px;
    background: #fff;
    border-radius: 10px;
    height: calc(100% - 20px);
    overflow: hidden;
  }
  .search-top {
    display: flex;
    align-items: center;
  }
  .search-wrap {
    height: 86px;
    .search-input {
      display: flex;
      align-items: center;
      padding: 10px 10px 0;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      background-color: #fff;
      .back {
        margin-right: 30px;
        height: 28px;
      }
      .keyword {
        width: 500px;
      }
      .type {
        width: 130px;
        //margin-left: -1px;
        margin-top: 2px;
        margin-right: 20px;
      }
    }
    .notice {
      font-size: 12px;
      color: #999;
      padding: 20px 10px 10px 15px;
      background-color: #fff;
      position: relative;
      &:after {
        display: block;
        content: '';
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 0;
        height: 1px;
        background-color: $--border-color-lighter;
      }
    }
  }
  .result {
    padding: 10px 10px 0;
    height: calc(100% - 86px);
    overflow-x: hidden;
  }
  .loading {
    padding: 20px 0;
    text-align: center;
    font-size: 12px;
    color: $--color-primary;
  }
  .pagination {
    text-align: right;
    height: 60px;
    .el-pagination {
      display: inline-block;
      margin-top: 10px;
    }
  }
}
</style>
