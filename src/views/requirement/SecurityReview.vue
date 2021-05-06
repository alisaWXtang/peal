<template>
  <div class="requrie-review-box">
    <el-dropdown
      trigger="hover"
      placement="bottom-start"
      @command="selectedReviewHandle"
    >
      <el-button type="text" class="btn-font">+{{ $t('发起评审') }}</el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="item in review_list"
          :key="item.id"
          :disabled="item.disabled"
          :command="item.id"
          >{{ item.text }}</el-dropdown-item
        >
      </el-dropdown-menu>
    </el-dropdown>
    <template>
      <el-table
        :data="requirementReviewList"
        style="width: 100%"
        border
        class="review-table"
      >
        <el-table-column :label="$t('评审单名称')">
          <template slot-scope="scope">
            <a :href="scope.row.display.url" target="_black">{{
              scope.row.name
            }}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('评审单编号')">
          <template slot-scope="scope">
            <a :href="scope.row.display.url" target="_black">{{
              scope.row.code
            }}</a>
          </template>
        </el-table-column>
        <el-table-column
          prop="display.type"
          :label="$t('评审类型')"
        ></el-table-column>
        <el-table-column :label="$t('提审人姓名')" width="140">
          <template slot-scope="scope">
            <div>
              <span v-if="scope.row.display.reviewer"
                >{{ scope.row.display.reviewer }}({{
                  scope.row.reviewer
                }})</span
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column
          width="160"
          prop="reviewDate"
          :label="$t('提审时间')"
        ></el-table-column>
        <el-table-column
          prop="display.status"
          :label="$t('评审状态')"
        ></el-table-column>
        <el-table-column
          prop="display.result"
          :label="$t('评审结果')"
        ></el-table-column>
      </el-table>
    </template>
  </div>
</template>
<script>
import { queryByRequirement } from '@/service/requirement'
/**
 * @title
 * @desc
 * @author wangling
 * @date 2019/11/19
 */
export default {
  name: 'SecurityReview',
  components: {},
  mixins: [],
  props: {
    projectId: {
      type: [String, Number],
      required: true,
      desc: '项目id',
    },

    requirementId: {
      type: [String, Number],
      required: true,
      desc: '需求id',
    },
  },

  data() {
    return {
      popoverIsShow: false, //popover状态
      bindEventDom: null,
      review_list: [
        {
          id: 0,
          text: '隐私合规评审',
          disabled: false,
          url: '',
        },

        {
          id: 1,
          text: '安全需求评审',
          disabled: false,
          url: '',
        },
      ],

      requirementReviewList: [],
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getReviewList()
  },
  mounted() {},
  methods: {
    // 评审列表数据

    async getReviewList() {
      let obj = {
        projectId: this.projectId,
        requirementId: this.requirementId,
      }

      let res = await queryByRequirement(obj)

      if (res.status === 200) {
        this.requirementReviewList = res.data.items
        this.review_list = res.data.buttons || []
        this.review_list = this.review_list.map((item, index) => {
          return {
            ...item,
            id: index,
          }
        })
      }
    },
    selectedReviewHandle(command) {
      window.open(this.review_list[command].url)
    },
  },
}
</script>
<style lang="scss" scoped>
.requrie-review-box {
  margin-top: -3px;
}
.review-table {
  margin: 6px 0px;
}
.review-table a {
  color: $color-font-active-common;
  cursor: pointer;
}
.review-dropdown {
  color: $color-font-active-common;
  cursor: pointer;
  font-size: 14px;
}
// 更改hover的样式
.el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: $color-text-hover;
  color: #fff;
}
.btn-font {
  font-size: 14px;
}
</style>
