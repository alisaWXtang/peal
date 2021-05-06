<template>
  <el-dialog
    :visible.sync="modalStatu"
    width="1000px"
    class="AssocWorkItem"
    :title="dialogTitle"
    :modal-append-to-body="false"
    :close-on-click-modal="false"
  >
    <div v-if="projectId" class="form-box">
      <el-form :inline="true" class="form-box-top">
        <el-row :gutter="10">
          <el-col
            :xs="24"
            :sm="24"
            :md="getWidthPercentage(6)"
            :lg="getWidthPercentage(6)"
            :xl="getWidthPercentage(6)"
          >
            <el-form-item :label="$t('标题') + '：'">
              <el-input
                v-model="searchInfo.title"
                :placeholder="$t('支持标题或ID搜索')"
                class="header-input"
                :class="{ 'header-input-english': $isEnglish() }"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col
            v-if="workItemType === 1"
            :xs="24"
            :sm="24"
            :md="getWidthPercentage(9)"
            :lg="getWidthPercentage(9)"
            :xl="getWidthPercentage(9)"
          >
            <el-form-item :label="$t('需求分类') + '：'">
              <el-select
                v-model="searchInfo.categoryId"
                :placeholder="$t('选择需求分类')"
                class="header-input"
                :class="{ 'header-input-english': $isEnglish() }"
              >
                <el-option
                  key="all"
                  :label="$t('全部分类')"
                  value="all"
                ></el-option>
                <el-option
                  v-for="item in requirementCategoryList"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            :xs="24"
            :sm="24"
            :md="getWidthPercentage(9)"
            :lg="getWidthPercentage(9)"
            :xl="getWidthPercentage(9)"
          >
            <el-form-item :label="$t('关联迭代') + '：'">
              <el-select
                v-model="searchInfo.sprintId"
                :placeholder="$t('选择关联迭代')"
                class="header-input"
                :class="{ 'header-input-english': $isEnglish() }"
              >
                <el-option
                  :key="-1"
                  :label="$t('全部迭代')"
                  :value="-1"
                ></el-option>
                <el-option
                  v-for="item in sprintIdList"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="workItemType !== 1"
            :xs="24"
            :sm="24"
            :md="7"
            :lg="7"
            :xl="7"
          >
            <el-form-item :label="$t('处理人') + '：'">
              <el-select
                v-model="searchInfo.assignUser"
                :placeholder="$t('选择处理人')"
                class="header-input"
                :class="{ 'header-input-english': $isEnglish() }"
              >
                <el-option
                  key="all"
                  :label="$t('所有人')"
                  value="all"
                ></el-option>
                <el-option
                  v-for="item in assignUserList"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            :xs="24"
            :sm="24"
            :md="getWidthPercentage(6)"
            :lg="getWidthPercentage(6)"
            :xl="getWidthPercentage(6)"
          >
            <el-form-item :label="$t('状态') + '：'">
              <el-select
                v-model="searchInfo.statusId"
                :placeholder="$t('选择状态')"
                class="header-input"
                :class="{ 'header-input-english': $isEnglish() }"
              >
                <el-option
                  key="all"
                  :label="$t('全部状态')"
                  value="all"
                ></el-option>
                <el-option
                  v-for="item in statusList"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="3" :lg="3" :xl="3">
            <el-form-item>
              <el-button @click="searchBtnHandle">{{ $t('查询') }}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="table-box-top">
        <el-table
          ref="assocRequireTableRef"
          :data="assocRequireDataList"
          style="width: 100%;height: 100%;"
        >
          <el-table-column width="40">
            <!-- 全选功能只在添加时有 编辑操作时全选会清除掉已选数据 -->
            <template #header>
              <el-checkbox
                v-model="checkAll"
                :indeterminate="isIndeterminate"
                @click.native.prevent="handleCheckAllChange"
              ></el-checkbox>
            </template>
            <template slot-scope="scope">
              <el-checkbox
                :value="assocRequireInitData.includes(scope.row.id)"
                @change="
                  value => {
                    selectionChange(value, scope.row)
                  }
                "
              ></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column
            :label="firstLabel"
            show-overflow-tooltip
            :width="$isEnglish() ? 120 : 70"
            prop="id"
          >
            <!-- <template slot-scope="scope">
              <span class="c-blue cp">{{ scope.row.id }}</span>
            </template> -->
          </el-table-column>
          <el-table-column
            prop="display.title"
            show-overflow-tooltip
            :label="secondLabel"
            min-width="180"
          >
            <!-- <template slot-scope="scope">
              <span class="c-blue cp">{{ scope.row.display.title }}</span>
            </template> -->
          </el-table-column>
          <el-table-column
            prop="display.projectName"
            show-overflow-tooltip
            :label="$t('所属项目')"
            min-width="80"
          ></el-table-column>
          <el-table-column
            prop="display.assignUser"
            :label="$t('处理人')"
            min-width="60"
          >
          </el-table-column>
          <el-table-column
            prop="display.status"
            :label="$t('状态')"
            width="80"
          ></el-table-column>
        </el-table>
      </div>
      <div class="table_b_f_b">
        <div class="pagination-count">
          <template v-if="$isEnglish()">
            Total: {{ searchInfo.pageInfo.totalRecords }} Selected:
            {{ assocRequireInitData.length }}
          </template>
          <template v-else>
            共{{ searchInfo.pageInfo.totalRecords }}条，选中{{
              assocRequireInitData.length
            }}条
          </template>
        </div>
        <el-pagination
          v-show="assocRequireDataList && assocRequireDataList.length > 0"
          background
          class="fr mr10"
          :current-page="searchInfo.pageInfo.pageNumber"
          :page-sizes="[10, 20, 30]"
          :page-size="searchInfo.pageInfo.pageSize"
          layout="sizes, prev, pager, next, jumper"
          :total="searchInfo.pageInfo.totalRecords"
          @size-change="handleAssocRequirePageSizeChange"
          @current-change="handleAssocRequirePageNumChange"
        ></el-pagination>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <co-button @click="cancel">取 消</co-button>
      <el-button type="primary" @click="handleSureAssocRequrie">{{
        $t('确定')
      }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 报告内容 - 工作项选择
 * @desc 公共组件，已经可以复用，使用的模块：1. 提测单
 * @author heyunjiang
 * @date 2019.10.14
 */
import uniq from 'lodash/uniq'
import remove from 'lodash/remove'
import $http from '@/utils/http'
import { requirementCategoryList as requirementCategoryListService } from '@/service/requirement-category'
import { listAssocRequire as listAssocRequireApi } from '@/api/requirement'
import { mineTask as mineTaskApi } from '@/api/mine'
import { bugListApi } from '@/api/bug'

export default {
  name: 'WorkItemChoose',
  components: {},
  mixins: [],
  event: ['success', 'close'], // 支持的事件
  props: {
    // 项目 id
    projectId: {
      type: [Number, String],
      required: true,
    },

    isShow: {
      type: Boolean,
      required: true,
    },

    workItemType: {
      type: [String, Number],
      required: false,
      default: 1,
      desc: '需求 - 1， 任务 - 2， 缺陷 - 3',
    },

    selectedWorkItem: {
      type: Array,
      required: false,
      desc: i18n.t('当前选中的工作项值'),
      default: () => {
        return []
      },
    },
  },

  data() {
    return {
      checkAll: false,
      isIndeterminate: false,
      modalStatu: false,
      searchInfo: {
        projectId: '',
        categoryId: 'all',
        assignUser: 'all',
        statusId: 'all',
        sprintId: -1,
        title: null,
        isArchived: -1,
        pageInfo: {
          pageNumber: 1,
          pageSize: 10,
          totalRecords: 0,
          totalPages: 0,
        },
      },

      // projectList: [],
      requirementCategoryList: [], // 需求分类列表
      assocRequireDataList: [], // table 数据源
      assocRequireInitData: [], // table 选中的行数据
      typeName: {
        1: i18n.t('需求'),
        2: i18n.t('任务'),
        3: i18n.t('缺陷'),
      },
    }
  },
  computed: {
    dialogTitle() {
      return i18n.t('添加') + this.typeName[+this.workItemType]
    },
    firstLabel() {
      return this.typeName[+this.workItemType] + 'ID'
    },
    secondLabel() {
      return this.typeName[+this.workItemType] + i18n.t('标题')
    },
    assignUserList() {
      return this.$store.state.pf.PROJECTFIELDSELECTVALUES.assignUserList[
        +this.workItemType
      ]
    },
    statusList() {
      return this.$store.state.pf.PROJECTFIELDSELECTVALUES.statusIdList[
        +this.workItemType
      ]
    },
    sprintIdList() {
      return this.$store.state.pf.PROJECTFIELDSELECTVALUES.sprintIdList[
        +this.workItemType
      ]
    },
  },

  watch: {
    isShow() {
      this.modalStatu = this.isShow
      if (!this.isShow) {
        this.resetData()
      } else {
        // 初始化获取项目列表数据
        this.initHeaderFilter()
        this.searchAssocRequrie()
        this.assocRequireInitData = [...this.selectedWorkItem]
        this.handleCheckedChange()
      }
    },
    modalStatu() {
      if (!this.modalStatu) {
        this.resetData()
        this.$emit('close')
      }
    },
    selectedWorkItem() {
      this.assocRequireInitData = [...this.selectedWorkItem]
    },
    projectId() {
      this.searchInfo.projectId = +this.projectId
    },
  },

  mounted() {
    this.searchInfo.projectId = +this.projectId
    this.assocRequireInitData = [...this.selectedWorkItem]
  },
  methods: {
    getWidthPercentage(enValue = 10, zhValue = 7) {
      return this.$isEnglish() ? enValue : zhValue
    },
    // 切换 全选按钮
    handleCheckAllChange() {
      if (this.checkAll && this.isIndeterminate) {
        // 当前页部分选中时-全选当前页
        this.checkAll = true
        this.isIndeterminate = false
      } else if (this.checkAll && !this.isIndeterminate) {
        // 当前页全部选中时-取消全部选中
        this.checkAll = false
      } else {
        // 当前页无选中时-全选当前页
        this.checkAll = true
      }
      this.checkAll
        ? this.addAssocRequireInitData(this.assocRequireDataList)
        : this.removeAssocRequireInitData(this.assocRequireDataList)
      this.handleCheckedChange()
    },
    // 获取 数据列表id数组
    getIds(list) {
      return list.map(item => item.id)
    },
    // 添加 选中数据
    addAssocRequireInitData(adds) {
      const ids = this.getIds(adds)
      this.assocRequireInitData = uniq(this.assocRequireInitData.concat(ids))
    },
    // 移除 选中数据
    removeAssocRequireInitData(removes) {
      const ids = this.getIds(removes)
      remove(this.assocRequireInitData, item => ids.includes(item))
      this.assocRequireInitData = [...this.assocRequireInitData]
    },
    // event - 选中值变化
    selectionChange(selected, info) {
      if (selected) {
        this.assocRequireInitData = [...this.assocRequireInitData, info.id]
      } else {
        this.assocRequireInitData = this.assocRequireInitData.filter(
          item => item !== info.id,
        )
      }
      this.handleCheckedChange()
    },
    // 更新 全选checkbox状态
    handleCheckedChange() {
      const currentPageIds = this.getIds(this.assocRequireDataList)
      this.setCheckAll(currentPageIds)
      this.setIsIndeterminate(currentPageIds)
    },
    // 更新 全选状态
    setCheckAll() {
      this.checkAll = !!this.assocRequireInitData.length
    },
    // 更新 部分选中样式
    setIsIndeterminate(currentPageIds) {
      this.isIndeterminate =
        this.checkAll &&
        !currentPageIds.every(item => this.assocRequireInitData.includes(item))
    },
    // header filter 数据初始化
    initHeaderFilter() {
      if (this.assignUserList.length === 0) {
        this.$store.dispatch({
          type: 'initDataPROJECTFIELD',
          payload: {
            projectId: this.projectId,
            workItemType: this.workItemType,
          },
        })
      }
      this.getCategoryList()
    },
    // 获取需求分类列表
    async getCategoryList() {
      if (this.requirementCategoryList.length > 0) {
        return
      }
      const result = await requirementCategoryListService({
        projectId: this.projectId,
      })

      if (result.status !== 200 || result.data === null) {
        return false
      }
      this.requirementCategoryList = result.data.map(item => {
        let obj = {
          key: item.id,
          value: item.label,
          ...item,
        }

        delete obj.label
        return obj
      })
    },
    // 重置数据
    resetData() {
      this.searchInfo = {
        ...this.searchInfo,
        categoryId: 'all',
        assignUser: 'all',
        statusId: 'all',
        sprintId: -1,
        title: null,
        pageInfo: {
          ...this.searchInfo.pageInfo,
          pageNumber: 1,
        },
      }

      this.assocRequireDataList = []
      this.assocRequireInitData = []
    },
    // 点击查询
    searchBtnHandle() {
      this.searchInfo.pageInfo.pageNumber = 1
      this.searchAssocRequrie()
    },
    // 查询具体数据
    searchAssocRequrie() {
      let url = ''
      switch (+this.workItemType) {
        case 1:
          url = listAssocRequireApi
          break
        case 2:
          url = mineTaskApi
          break
        case 3:
          url = bugListApi
          break
      }

      let postObj = {
        ...this.searchInfo,
        statusId:
          this.searchInfo.statusId === 'all' ? '' : this.searchInfo.statusId,
      }

      if (+this.workItemType === 1) {
        delete postObj.assignUser
        postObj.categoryIds = []
        if (postObj.categoryId !== 'all') {
          postObj.categoryIds.push(postObj.categoryId)
        }
        delete postObj.categoryId
      } else {
        delete postObj.categoryId
        postObj.assignUser =
          postObj.assignUser === 'all' ? '' : postObj.assignUser
      }
      this.$nextTick(function() {
        $http
          .post(url, postObj)
          .then(result => {
            if (result.status === 200) {
              this.assocRequireDataList = result.data.result
              this.searchInfo.pageInfo.totalRecords =
                result.data.pageInfo.totalRecords
              this.searchInfo.pageInfo.totalPages =
                result.data.pageInfo.totalPages
              this.handleCheckedChange()
            } else {
              this.assocRequireDataList = []
            }
          })
          .catch(_ => _)
      })
    },
    // 分页 - 第几页
    handleAssocRequirePageNumChange(pageNum) {
      // 保存数据
      this.searchInfo.pageInfo.pageNumber = pageNum
      this.searchAssocRequrie()
    },
    // 分页 - 每页条数
    handleAssocRequirePageSizeChange(pageSize) {
      // 保存数据
      this.searchInfo.pageInfo.pageSize = pageSize
      this.searchAssocRequrie()
    },
    cancel() {
      this.modalStatu = false
    },
    // 点击确定
    handleSureAssocRequrie() {
      this.$emit('success', this.assocRequireInitData)
      this.$emit('update:selectedWorkItem', this.assocRequireInitData)
    },
  },
}
</script>
<style lang="scss" scoped>
.header-input {
  width: 170px;
  line-height: 30px;
}
.header-input-english {
  width: 140px;
}
.form-box-top {
  margin-bottom: 15px;
}
/deep/ .form-box-top .el-form-item > * {
  line-height: 40px;
}
.table_b_f_b {
  padding-top: 10px;
}
.pagination-count {
  display: inline-block;
  font-size: 12px;
  height: 24px;
  line-height: 24px;
}
</style>
