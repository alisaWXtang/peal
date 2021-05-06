<template>
  <div id="demandlist" ref="doctableList" class="file-table-style">
    <el-table
      v-if="contentHeight"
      ref="assocRequireTableRef"
      class="multiple-table"
      border
      :data="list"
      :height="contentHeight"
      style="width: 100%;"
    >
      <el-table-column prop="title" label="ID">
        <template slot-scope="scope">
          <span class="cp c-blue-hover" @click="interfaceUrlClick(scope.row)">{{
            scope.row.apiId
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" :label="$t('接口名称')">
        <template slot-scope="scope">
          <span class="cp c-blue-hover" @click="interfaceUrlClick(scope.row)"
            >{{ scope.row.apiName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="url" :label="$t('接口路径')">
        <template slot-scope="scope">
          <span
            class="file-font-style"
            :class="{
              'file-font-style-blue':
                ['GET', 'HEAD'].indexOf(scope.row.apiMethod) == -1,
              'file-font-style-green':
                ['GET', 'HEAD'].indexOf(scope.row.apiMethod) !== -1,
            }"
            >{{ scope.row.apiMethod }}
          </span>
          <span>{{ scope.row.apiPath }} </span>
        </template>
      </el-table-column>
      <el-table-column prop="count" :label="$t('接口分类')" width="280">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.apiTypeId"
            style="width:90%;"
            :disabled="
              !$authFunction(
                'FUNC_APIDOC_UPDATE_API_TYPE',
                3,
                $getUrlParams().projectId,
              )
            "
            @change="sortChangeEvent(scope.row)"
          >
            <el-option
              v-for="(item, index) in sortListData"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="count" :label="$t('状态')" width="180">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.apiStatus"
            style="width:25%;min-width: 80px;"
            :disabled="
              !$authFunction(
                'FUNC_APIDOC_UPDATE_API_STATUS',
                3,
                $getUrlParams().projectId,
              )
            "
            @change="statusChangeEvent(scope.row)"
          >
            <el-option
              v-for="(item, index) in statusList"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        prop="updateTime"
        :label="$t('修改时间')"
        width="180"
      ></el-table-column>
    </el-table>
    <el-pagination
      class="fr mr10"
      style="margin-top:4px;"
      :pager-count="5"
      :page-size="pageData.pageSize"
      :current-page="pageData.pageCurrent"
      layout="total, prev, pager, next"
      :total="pageData.total"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
    <GlobalSelect v-bind="GlobalSelectProps"></GlobalSelect>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { mapState, mapMutations } from 'vuex'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import GlobalSelect from '@/components/field-edit/GlobalSelect.vue'
import merge from 'webpack-merge'
import apiDoc from '@/service/file'
export default {
  name: 'FileTableList',
  components: {
    GlobalSelect,
  },
  mixins: [ProjectCommonMixin],
  props: {
    setId: {
      type: [Number, String],
      default: null,
    },
  },
  data() {
    return {
      contentHeight: 0,
      list: [],
      listData: {
        pageNum: 1,
        pageSize: 15,
      },

      pageData: {
        pageNum: 1,
        pageSize: 15,
        pageCurrent: 1,
      },

      diagloshow: false,
      editdiagloshow: false,
      fileName: '',
    }
  },
  computed: {
    ...mapState({
      defaultExpandedKeys: state => state.fe.defaultExpandedKeys,
      detailShow: state => state.fe.detailShow,
      interfaceUrlList: state => state.fe.interfaceUrlList,
      apiId: state => state.fe.apiId,
      apiTypeId: state => state.fe.apiTypeId,
      statusList: state => state.fe.statusList,
      sortListData: state => state.fe.sortListData,
      exId: state => state.fe.exId,
    }),
  },
  watch: {
    setId: function() {
      this.init()
      this.$router.push({
        query: merge(this.$route.query, { apiId: -1, apiTypeId: this.setId }),
      })
    },
    apiTypeId: function() {
      this.init()
    },
    exId: function() {
      this.init()
    },
  },
  mounted() {
    this.init()
    this.$nextTick(() => {
      this.contentHeight = this.$refs.doctableList
        ? this.$refs.doctableList.parentNode.clientHeight - 95
        : 0
    })
  },
  methods: {
    ...mapMutations([
      'defaultExpandedKeysFun',
      'filePageSwitch',
      'sortTotalFun',
      'fileApiId',
      'fileApiTypeId',
      'exIdFun',
    ]),

    //初始化
    init() {
      let apiTypeId = this.setId
      const apiClassId = this.$getUrlParams().apiClassId
      if (apiClassId) {
        if (apiTypeId == 0 || !apiTypeId || apiTypeId == '-1') {
          this.getAllSortList()
        } else if (apiTypeId != -1 && apiTypeId != '-1') {
          this.getSortList()
        }
      }
      if (!this.exId) {
        this.getAllSortList()
        this.exIdFun(true)
      }
    },
    //添加分类
    // confirmBtn(){

    // },
    // 获取分类列表
    getSortList() {
      this.listData.apiTypeId = this.setId || this.$getUrlParams().apiTypeId
      apiDoc.getApiList({ ...this.listData }).then(res => {
        if (res.data) {
          this.list = res.data.list
          this.pageData = {
            pageNum: res.data.pageNum,
            pageSize: res.data.pageSize,
            total: res.data.total,
            pageCurrent: res.data.pageNum,
          }

          this.sortTotalFun(res.data.total)
        }
      })
    },
    //选择分类change
    sortChangeEvent(item) {
      apiDoc
        .updateApiType(
          { apiId: item.apiId, apiTypeId: item.apiTypeId },
          { type: 'form' },
        )
        .then(res => {
          if (res.status == 200) {
            this.$emit('sortFun', true)
            this.$message({
              message: i18n.t('修改接口分类成功'),
              type: 'success',
            })

            this.init()
          }
        })
    },
    //updata选择状态
    statusChangeEvent(item) {
      apiDoc
        .updateApiStatus(
          { apiId: item.apiId, apiStatus: item.apiStatus },
          { type: 'form' },
        )
        .then(res => {
          if (res.status == 200) {
            this.$message({
              message: i18n.t('修改状态成功'),
              type: 'success',
            })
          }
        })
    },
    // 获取全部分类列表
    getAllSortList() {
      this.listData.apiClassId = this.$getUrlParams().apiClassId
      // if(!this.apiTypeId){return false}
      apiDoc.getAllApi({ ...this.listData }).then(res => {
        if (res.data) {
          this.list = res.data.list
          this.pageData = {
            pageNum: res.data.pageNum,
            pageSize: res.data.pageSize,
            total: res.data.total,
            pageCurrent: res.data.pageNum,
          }

          this.sortTotalFun(res.data.total)
        }
      })
    },
    // 分页参数改变
    handleCurrentChange(val) {
      this.listData.pageNum = val
      let apiTypeId = this.setId
      if (apiTypeId == 0 || !apiTypeId) {
        this.getAllSortList()
      } else if (apiTypeId != -1 && apiTypeId != '-1') {
        this.getSortList()
      }
      // (this.setId&&this.setId!=-1&&this.setId!='-1')?this.getSortList():this.getAllSortList();
    },
    //修改分类&状态
    // getprojectTable(){

    // },
    //接口详情跳转
    interfaceUrlClick(item) {
      this.$router.push({
        query: merge(this.$route.query, { apiTypeId: -1, apiId: item.apiId }),
      })

      this.filePageSwitch(false)
      let defaultExpandedKeys = []
      defaultExpandedKeys.push(item.apiId)
      this.defaultExpandedKeysFun(defaultExpandedKeys)
      // console.log(this.defaultExpandedKeys)
      this.fileApiId(item.apiId)
      this.fileApiTypeId(-1)
    },
  },
}
</script>

<style lang="scss" scoped>
.file-box {
  position: relative;
  .file-left-box {
    // position: absolute;
    width: 20%;
    min-width: 230px;
    height: 100%;
    min-height: 703px;
    border: 1px solid gainsboro;
    .file-left-btn-box {
      display: flex;
      .file-left-btn {
        flex: 1;
        height: 50px;
        text-align: center;
        line-height: 50px;
        // border-bottom: 1px solid gainsboro;
      }
      .left-btn-grey {
        background: gainsboro;
      }
    }
  }
  .file-right-box {
    width: 78%;
    height: 100%;
    min-height: 703px;
    border: 1px solid gainsboro;
  }
}
</style>
