<template>
  <div ref="apiView" class="content-outer-box">
    <div>
      <!-- <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;" @change="handleRadioChange">
          <el-radio-button label="接口">接口</el-radio-button>
          <el-radio-button label="设置">设置</el-radio-button>
        </el-radio-group> -->
      <!-- <span>文档名：</span> -->
    </div>
    <span class="file-back" @click="backBtn"
      ><i class="el-icon-arrow-left"></i><i class="el-icon-arrow-left"></i
      >{{ $t('返回') }}</span
    >
    <div class="file-header-title">{{ apiClassName }}</div>
    <file-setting
      v-if="isCollapse == $t('设置')"
      :content-top="contentTop"
      @setValue="setValue"
    ></file-setting>
    <div
      v-if="isCollapse == $t('接口')"
      class="file-box"
      :style="{ height: `calc(100vh - ${contentTop + 70}px)` }"
    >
      <div class="file-left-box">
        <div class="file-left-btn-box left-btn-grey">
          <span
            class="file-left-btn "
            :class="{ 'left-btn-grey': bthGrayShow }"
            @click="handleRadioChange($t('接口'))"
            >{{ $t('接口列表') }}</span
          >
          <span
            class="file-left-btn "
            :class="{ 'left-btn-grey': !bthGrayShow }"
            style="background:#fff;"
            @click="handleRadioChange($t('设置'))"
            >{{ $t('设置') }}</span
          >
        </div>
        <div v-if="bthGrayShow" class="api-search">
          <el-input
            v-model="filterText"
            :placeholder="$t('搜索接口/ID')"
            class="mt10 ml10 fl"
            style="width:60%;"
          ></el-input>
          <el-button
            v-show="
              $authFunction(
                'FUNC_APIDOC_ADD_TYPE',
                3,
                $getUrlParams().projectId,
              )
            "
            type="primary"
            class="add-type-button ml5 mt10 fl "
            @click="addsortBtn"
            >{{ $t('添加分类') }}</el-button
          >
        </div>
        <div v-if="!bthGrayShow" style="padding: 10px;background: #f3f4f6;">
          <el-input
            v-model="testGatherName"
            :placeholder="$t('请输入内容')"
            style="width:60%;"
          ></el-input>
          <el-button type="primary" @click="addTestGatherBtn">{{
            $t('添加集合')
          }}</el-button>
        </div>
        <div class="left-content-body scrollbal-common">
          <!-- <el-scrollbar class="scrollbar-apidoc-tree"> -->
          <el-tree
            ref="tree"
            :data="list"
            node-key="keyId"
            class="el-tree scrollbal-common left-tree-common"
            :current-node-key="currentNodeKey"
            :default-expanded-keys="defaultExpandedKeys"
            :props="defaultProps"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            :highlight-current="true"
          >
            <div
              slot-scope="scope"
              class="iconmorebox"
              style="height: 31px;"
              @click="HandleNode(scope, $event)"
            >
              <span
                :title="scope.node.label"
                style="height: 31px;line-height: 31px;"
              >
                <i
                  v-if="
                    scope.data.apiListBoList &&
                      scope.node.label == $t('全部接口')
                  "
                  class="iconfont icon-folder "
                ></i>
                <i
                  v-if="
                    scope.data.apiListBoList &&
                      scope.node.label !== $t('全部接口')
                  "
                  class="iconfont icon-folder-open"
                ></i>
                <span
                  class="file-font-ellipsis"
                  :class="{
                    'font-max-width': scope.data.apiListBoList,
                    'font-min-width': !scope.data.apiListBoList,
                  }"
                  >{{ scope.node.label }}</span
                >
              </span>
              <div
                v-show="
                  scope.data.apiListBoList && scope.data.name !== $t('全部接口')
                "
                class="iconmore1"
              >
                <i
                  v-show="
                    $authFunction(
                      'FUNC_APIDOC_ADD_API',
                      3,
                      $getUrlParams().projectId,
                    )
                  "
                  class="el-icon-plus"
                  style="width:20px"
                  :title="$t('添加接口')"
                  @click.stop="addInterfaceBtn(scope)"
                ></i>
                <i
                  v-show="
                    $authFunction(
                      'FUNC_APIDOC_UPDATE_TYPE',
                      3,
                      $getUrlParams().projectId,
                    )
                  "
                  class="el-icon-edit"
                  style="width:20px"
                  :title="$t('修改分类')"
                  @click.stop="fixSortBtn(scope)"
                ></i>
                <i
                  v-show="
                    $authFunction(
                      'FUNC_APIDOC_DELETE_TYPE',
                      3,
                      $getUrlParams().projectId,
                    )
                  "
                  class="el-icon-delete"
                  :title="$t('删除分类')"
                  @click.stop="deleteSortBtn(scope)"
                ></i>
              </div>
              <div v-show="!scope.data.apiListBoList" class="iconmore1">
                <i style="visibility: hidden;">{{ $t('占') }}s</i>
                <i
                  v-show="
                    $authFunction(
                      'FUNC_APIDOC_DELETE_API',
                      3,
                      $getUrlParams().projectId,
                    )
                  "
                  class="el-icon-delete"
                  style="width:20px"
                  :title="$t('删除接口')"
                  @click.stop="deleteSortBtn(scope)"
                ></i>
              </div>
              <!-- <div style="clear: both;"></div> -->
            </div>
          </el-tree>
          <!-- </el-scrollbar> -->
        </div>
      </div>
      <div class="file-right-box">
        <div v-if="detailShow">
          <div v-if="bthGrayShow" class="file-right-box-title">
            <span class="file-right-box-title-font"
              >&nbsp;{{ selectedAPIName }}有({{ sortTotal }}){{
                $t('个')
              }}</span
            >
            <div class="fr btn-wrap">
              <el-button
                v-show="
                  $authFunction(
                    'FUNC_APIDOC_EXPORT_API_DOC',
                    3,
                    $getUrlParams().projectId,
                  )
                "
                class="cursor-pointer file-plus-hover"
                type="primary"
                @click="showExportDialog = true"
                >{{ $t('导出') }}</el-button
              >
              <el-dropdown
                v-show="
                  $authFunction(
                    'FUNC_APIDOC_IMPORT_API_DOC',
                    3,
                    $getUrlParams().projectId,
                  )
                "
                class="dp-import"
                @command="handleImportCommand"
              >
                <el-button
                  type="primary"
                  class="cursor-pointer file-plus-hover"
                >
                  {{ $t('导入')
                  }}<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="YAPI"
                    >yapi{{ $t('导入') }}</el-dropdown-item
                  >
                  <el-dropdown-item command="SWAGGER"
                    >swagger{{ $t('导入') }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
              <el-button
                v-show="
                  $authFunction(
                    'FUNC_APIDOC_ADD_API',
                    3,
                    $getUrlParams().projectId,
                  )
                "
                type="primary"
                @click="addInterfaceBtn"
                >{{ $t('添加接口') }}</el-button
              >
            </div>
            <div style="clear: both;"></div>
          </div>
          <div v-if="!bthGrayShow" class="file-right-box-title">
            <span class="file-right-box-title-font">{{ $t('测试集合') }}</span>
          </div>
        </div>
        <table-list
          v-if="detailShow"
          :set-id="apiTypeId"
          :ex-id="exId"
          @sortFun="sortChildFun"
        ></table-list>
        <file-dateil
          v-if="!detailShow"
          :set-id="apiId"
          @sortFun="sortChildFun"
        ></file-dateil>
      </div>
    </div>
    <!-- 添加分类&修改分类 -->
    <el-dialog
      :title="sortTitle"
      :visible.sync="addDiagloshow"
      width="24%"
      :close-on-click-modal="false"
    >
      <div class="date-container">
        <div class="data-left m10">
          <span class="data-icon file-font-width"
            ><span style="color:red;">*</span>{{ $t('分类名') }}：</span
          >
          <el-input
            v-model="fileName"
            :placeholder="$t('请输入分类名')"
            style="width:60%;"
          ></el-input>
        </div>
        <div class="data-left m10">
          <span class="data-icon file-font-width">{{ $t('备注') }}：</span>
          <el-input
            v-model="fileDesc"
            :placeholder="$t('请输入备注')"
            style="width:60%;"
          ></el-input>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDiagloshow = false">{{ $t('取消') }}</el-button>
        <el-button
          v-if="sortTitle == $t('添加分类名')"
          type="primary"
          @click="saveSortBtn"
          >{{ $t('确定') }}</el-button
        >
        <el-button v-else type="primary" @click="saveFixSortBtn">{{
          $t('确定')
        }}</el-button>
      </div>
    </el-dialog>
    <!-- 添加接口-->
    <el-dialog
      :title="$t('添加接口')"
      :visible.sync="addInterfaceshow"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="date-container">
        <div class="data-left m10">
          <span class="data-icon file-font-width"
            ><span style="color:red;">*</span>{{ $t('选择分类') }}：</span
          >
          <!-- <el-input v-model="interfaceArr.apiTypeId" placeholder="接口分类" style="width:60%;"></el-input> -->
          <el-select
            v-model="interfaceArr.apiTypeId"
            :placeholder="$t('选择分类')"
            style="width:60%;"
            @change="sortChangeEvent"
          >
            <el-option
              v-for="(item, index) in sortListData"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <div class="data-left m10">
          <span class="data-icon file-font-width"
            ><span style="color:red;">*</span>{{ $t('接口名称') }}：</span
          >
          <el-input
            v-model="interfaceArr.apiName"
            :placeholder="$t('接口名称')"
            style="width:60%;"
          ></el-input>
        </div>
        <div class="data-left m10">
          <span class="data-icon file-font-width"
            ><span style="color:red;">*</span>{{ $t('接口路径') }}：</span
          >
          <el-select v-model="interfaceArr.apiMethod" style="width:80px;">
            <el-option
              v-for="item in interfaceUrlList"
              :key="item.key"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-input
            v-model="interfaceArr.apiPath"
            placeholder="/path"
            style="width:40%;"
          ></el-input>
        </div>
        <div class="data-icon m10">
          <span style="visibility: hidden;">{{ $t('注意') }}</span
          >{{ $t('注') }}:{{ $t('详细的接口数据可以在编辑页面中添加') }}
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addInterfaceshow = false">{{
          $t('取消')
        }}</el-button>
        <el-button type="primary" @click="savePathBtn">{{
          $t('确定')
        }}</el-button>
      </div>
    </el-dialog>

    <!-- 导入-->
    <el-dialog
      :title="`${fileTpye.toLowerCase()}${$t('导入接口')}`"
      :visible.sync="importDocShow"
      width="480px"
      :close-on-click-modal="false"
    >
      <div class="date-container" style="margin-bottom: 20px">
        <div class="data-left m10">
          <span class="data-icon file-font-width"
            ><span class="color-red">* </span>{{ $t('选择分类') }}：</span
          >
          <el-select
            v-model="selectedAPIType"
            class="type-select"
            :placeholder="$t('请选择分类')"
          >
            <el-option
              v-for="item in sortListData"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="data-left m10">
          <span class="data-icon file-font-width">{{ $t('公共路径') }}：</span>
          <el-input
            v-model="commonPath"
            :placeholder="$t('请输入公共路径')"
            style="width:60%;"
          ></el-input>
        </div>
        <div class="data-left m10">
          <span class="data-icon file-font-width"
            ><span class="color-red">* </span>json{{ $t('文件') }}：</span
          >
          <el-upload
            :disabled="!selectedAPIType"
            class="upload-comp"
            :action="importUrl"
            name="file"
            :data="uploadData"
            :show-file-list="false"
            :on-success="importDocSuccess"
            :on-error="importDocError"
            :before-upload="fileValidCheck"
            :headers="importHeaders"
            accept=".json"
            multiple
          >
            <el-button
              v-show="
                $authFunction(
                  'FUNC_APIDOC_IMPORT_API_DOC',
                  3,
                  $getUrlParams().projectId,
                )
              "
              :disabled="!selectedAPIType"
              class="cursor-pointer file-plus-hover"
              type="primary"
              >{{ $t('选择文件') }}</el-button
            >
          </el-upload>
          <span class="example-link" @click="downLoadJson">{{
            $t('导入示例模板')
          }}</span>
        </div>
        <div class="data-icon m10">
          <span style="visibility: hidden;">{{ $t('注意') }}</span
          >{{ $t('注') }}:{{ $t('若有公共路径') }}，{{
            $t('请先输入公共路径')
          }}，{{ $t('如无则直接选择') }}.json{{ $t('文件') }}
        </div>
      </div>
    </el-dialog>
    <export-dialog
      v-if="showExportDialog"
      :show-dialog="showExportDialog"
      :tree-data="treeList"
      @closeDialog="showExportDialog = false"
    />
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { mapState, mapMutations } from 'vuex'
import TableList from './fileTableList.vue'
import fileDateil from './fileDateil.vue'
import fileSetting from './fileSetting.vue'
import exportDialog from './exportDialog'
import apiDoc from '@/service/file'
import { getRealUrl } from '@/utils/sub-app-util'
import { getAuthorization } from '@oppo/helper-sso'

import axios from 'axios'

export default {
  name: 'FileCreat',
  //mixins: [ProjectCommonMixin],
  components: { TableList, fileDateil, fileSetting, exportDialog },
  data() {
    return {
      isCollapse: i18n.t('接口'),
      list: [],
      treeList: [], // 导出弹窗中的树形数据
      defaultProps: {
        children: 'apiListBoList',
        label: 'name',
      },

      importUrl: '',
      nodeArr: [], //分类默认选中
      bthGrayShow: true,
      interfaceArr: {
        apiMethod: 'GET',
        apiTypeId: '',
        apiName: '',
        apiPath: '',
      },
      importHeaders: {
        language: i18n.locale,
        Authorization: getAuthorization(),
        'x-site-domain': `${location.origin}/micro-app/coteam`,
      },
      diagloshow: false,
      addDiagloshow: false,
      addInterfaceshow: false,
      importDocShow: false,
      commonPath: '',
      fileName: '',
      filterText: '',
      fileDesc: '',
      testGatherName: '',
      sortTitle: i18n.t('添加分类'),
      apiClassId: 0,
      // defaultExpandedKeys:[],
      apiClassName: '',
      selectedAPIType: +this.$route.query.apiTypeId,
      selectedAPIName: this.$t('全部接口'),
      fileTpye: 'YAPI', // SWAGGER or YAPI
      showExportDialog: false,
      exId: true,
      contentTop: 0,
    }
  },
  computed: {
    uploadData() {
      return {
        apiClassId: this.$getUrlParams().apiClassId,
        commonPath: this.commonPath,
        apiTpyeId: this.selectedAPIType || 0,
        fileTpye: this.fileTpye,
      }
    },
    ...mapState({
      defaultExpandedKeys: state => state.fe.defaultExpandedKeys,
      apiId: state => state.fe.apiId,
      apiTypeId: state => state.fe.apiTypeId,
      detailShow: state => state.fe.detailShow,
      interfaceUrlList: state => state.fe.interfaceUrlList,
      sortTotal: state => state.fe.sortTotal,
      sortListData: state => state.fe.sortListData,
      watchData: state => state.fe.watchData,
      watchDataObj1: state => state.fe.watchDataObj1,
      detailInitData: state => state.fe.detailInitData,
      editShow: state => state.fe.editShow,
    }),
    templateLink() {
      return this.fileTpye === 'SWAGGER'
        ? getRealUrl('/static/swagger-template.json')
        : getRealUrl('/static/json-template.json')
    },
    currentNodeKey() {
      const query = this.$route.query
      const apiId = +query.apiId
      const apiTypeId = +query.apiTypeId
      if (apiId < 0 && apiTypeId > 0) {
        return 0 - apiTypeId
      } else if (apiId > 0 && apiTypeId < 0) {
        return apiId
      } else {
        return 0
      }
    },
  },
  watch: {
    apiClassId: function(val) {
      if (val) {
        this.getApiTypeList()
        this.getAllType()
      } else {
        this.$router.push({
          path: '/file/fileInfo',
          query: {
            projectId: this.$getUrlParams().projectId,
          },
        })
      }
    },
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    '$route.query': {
      handler(val) {
        if (val.apiTypeId && +val.apiTypeId > 0 && this.sortListData.length) {
          this.selectedAPIType = +val.apiTypeId
          this.selectedAPIName = this.sortListData.find(
            s => s.value === this.selectedAPIType,
          ).label
        } else {
          this.selectedAPIType = ''
          this.selectedAPIName = this.$t('全部接口')
        }
      },
      immediate: true,
      deep: true,
    },
    currentNodeKey(val) {
      this.$refs.tree.setCurrentKey(val)
    },
  },
  mounted() {
    if (this.$getUrlParams().apiTypeId) {
      this.selectedAPIType = +this.$getUrlParams().apiTypeId
    }
    this.importUrl = getRealUrl(
      '/api/apidoc/import?projectId=' + this.$getUrlParams().projectId,
    )
    this.apiClassId = this.$getUrlParams().apiClassId
    if (this.apiClassId) {
      this.getApiClassInfo()
    }
    this.fileApiTypeId(
      this.$getUrlParams().apiTypeId ? this.$getUrlParams().apiTypeId : 0,
    )

    this.fileApiId(this.$getUrlParams().apiId ? this.$getUrlParams().apiId : -1)
    // let isSetting=this.$getUrlParams().isCollapse;
    // if (isSetting==2){
    //   this.isCollapse='设置'
    // }
    if (this.apiTypeId || this.apiId) {
      this.apiTypeId !== '-1'
        ? this.filePageSwitch(true)
        : this.filePageSwitch(false)
    }
    if (this.apiClassId) {
      this.getApiTypeList()
      this.getAllType()
    }
    this.$nextTick(() => {
      this.contentTop = this.$refs.apiView
        ? this.$refs.apiView.getBoundingClientRect().top
        : 0
    })
  },
  methods: {
    renderContent() {},
    ...mapMutations([
      'defaultExpandedKeysFun',
      'filePageSwitch',
      'fileApiId',
      'fileApiTypeId',
      'sortListDataFun',
      'detailInitDataFun',
      'watchDataFun',
      'watchDataObjFun',
      'editShowFun',
      'exIdFun',
    ]),

    // 文件上传 - 名称控制
    fileValidCheck(file) {
      // 新增文件名长度控制
      if (file.name && file.name.length > 230) {
        this.$message({
          message: i18n.t('文件名过长'),
          type: 'error',
        })

        return false
      }
      return true
    },
    //返回
    backBtn() {
      this.$goToPage(this, 'fileInfo', {
        projectId: this.$getUrlParams().projectId,
        docType: 'api',
      })
    },
    //设置跳转
    handleRadioChange(data) {
      this.isCollapse = data
      if (
        this.isCollapse == i18n.t('设置') &&
        this.$getUrlParams().isCollapse
      ) {
        this.fileApiTypeId(0)
        this.fileApiId(-1)
        this.$router.push({
          query: {
            projectId: this.$getUrlParams().projectId,
            apiClassId: this.apiClassId,
            isCollapse: 2,
          },
        })
      } else {
        // this.filePageSwitch(true)
        //处理数据操作时,页面没有实时渲染
        // this.fileApiTypeId('-1');
        // this.exIdFun(false)
        // this.getApiTypeList();
        // this.getAllType();
      }
    },
    setValue(setValue) {
      this.isCollapse = setValue
    },
    // 设置
    // setBtn(){
    //   this.isCollapse == "设置"
    //   this.handleRadioChange()
    // },
    getApiClassInfo() {
      apiDoc.getOneClass({ apiClassId: this.apiClassId }).then(res => {
        if (res.status == 200) {
          this.apiClassName = res.data.apiClassName
        }
      })
    },

    //选择导入类型
    handleImportCommand(type) {
      this.fileTpye = type
      this.commonPath = ''
      this.getAllType()
      this.importDocShow = true
    },

    importDocSuccess(response) {
      if (response.status == 200) {
        this.importDocShow = false
        this.commonPath = ''
        this.$message({
          message: i18n.t('导入成功'),
          type: 'success',
        })

        this.fileApiTypeId(
          this.$getUrlParams().apiTypeId ? this.$getUrlParams().apiTypeId : 0,
        )

        this.fileApiId(
          this.$getUrlParams().apiId ? this.$getUrlParams().apiId : -1,
        )

        if (this.apiTypeId || this.apiId) {
          this.apiTypeId !== '-1'
            ? this.filePageSwitch(true)
            : this.filePageSwitch(false)
        }
        this.getApiClassInfo()
        this.getApiTypeList()
        this.getAllType()
        this.exIdFun(false)
        // this.$nextTick(()=>{
        //   // this.$refs.doctableList.init()
        //   console.log(this.$refs)
        // });
      } else {
        this.$message({
          message: response.msg,
          type: 'error',
        })
      }
    },
    // 获取文档
    // getDoc(){
    //   $http.get($http.api.apidoc.get_class,{projectId:this.projectId}).then(res =>{
    //     this.list=res.data;
    //   }).catch(e =>{

    //   })
    // },
    importDocError() {
      this.$message({
        message: i18n.t('上传失败'),
        type: 'error',
      })
    },
    //监听table list的分类change是否触发
    sortChildFun(item) {
      if (item) {
        this.getApiTypeList()
      }
    },
    //过滤节点
    filterNode(value, data) {
      if (value) {
        let result =
          data.name.indexOf(value) !== -1 || `${data.id}`.indexOf(value) !== -1
        if (data.apiPath) result = result || data.apiPath.indexOf(value) !== -1
        return result
      }
      return true
    },

    getApiTypeList() {
      apiDoc.getType({ apiClassId: this.apiClassId }).then(res => {
        this.treeList = [...res.data]
        this.list = res.data
        this.list.unshift({
          name: i18n.t('全部接口'),
          id: '',
          keyId: 0,
          apiTypeDesc: i18n.t('全部接口'),
          apiListBoList: [],
        })
        this.initTreeData(this.list)
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(this.currentNodeKey)
        })
      })
    },

    initTreeData(arr) {
      let defaultExpandedKeys = []
      arr.forEach(item => {
        item.keyId = 0 - item.id
        if (item.id == parseInt(this.apiTypeId)) {
          defaultExpandedKeys.push(item.keyId)
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey(item.keyId)
          })
        }
        if (item.apiListBoList && item.apiListBoList.length > 0) {
          item.apiListBoList.forEach(item1 => {
            item1.keyId = item1.id
            if (item1.id == parseInt(this.apiId)) {
              defaultExpandedKeys.push(item.keyId)
              this.$nextTick(() => {
                this.$refs.tree.setCurrentKey(item.keyId)
              })
            }
          })
        }
      })
      this.defaultExpandedKeysFun(defaultExpandedKeys)
    },

    showSelected(scope) {
      if (scope.data.apiListBoList !== undefined) {
        if (scope.data.id == this.apiTypeId) {
          return true
        }
      } else {
        if (scope.data.id == this.apiId) {
          return true
        }
      }
      return false
    },

    //获取全部分类
    getAllType() {
      apiDoc.getAllType({ apiClassId: this.apiClassId }).then(res => {
        if (res.data.length > 0) {
          res.data.forEach(item => {
            item['label'] = item.apiTypeName
            item['value'] = item.apiTypeId
          })
          this.$nextTick(() => {
            this.selectedAPIName =
              res.data.find(d => d.value === this.selectedAPIType)?.label ||
              this.$t('全部接口')
          })
        }
        // this.interfaceSortList=res.data;
        this.sortListDataFun(res.data)
      })
    },
    updateShow(index, type) {
      this.list[index].type = !type
    },

    //接口列表
    interfaceListBtn() {
      this.bthGrayShow = true
    },
    //测试集合
    testGatherBtn() {
      this.bthGrayShow = false
    },
    //添加集合
    addTestGatherBtn() {},
    //添加分类
    addsortBtn() {
      this.fileName = ''
      this.fileDesc = ''
      this.addDiagloshow = true
      this.sortTitle = i18n.t('添加分类名')
      // this.filePageSwitch(true)
    },
    //确认添加分类
    saveSortBtn() {
      console.log(
        this.$getUrlParams().apiTypeId,
        'this.$getUrlParams().apiTypeId',
      )
      console.log(this.list, 'this.list')
      if (!this.fileName.trim()) {
        this.$message({
          message: `${i18n.t('分类名不能为空')}!`,
          type: 'error',
        })

        return false
      }
      apiDoc
        .saveType({
          apiClassId: this.$getUrlParams().apiClassId,
          apiTypeName: this.fileName,
          apiTypeDesc: this.fileDesc,
        })
        .then(res => {
          if (res.status == 200) {
            this.$message({
              message: i18n.t('接口分类添加成功'),
              type: 'success',
            })

            this.fileName = ''
            this.fileDesc = ''
            this.getApiTypeList()
            this.getAllType()
            this.addDiagloshow = false
          }
        })
    },
    //添加接口
    addInterfaceBtn(item) {
      this.addInterfaceshow = true
      this.getAllType()
      if (item.data) {
        this.interfaceArr.apiTypeId = item.data.id
      } else {
        this.interfaceArr.apiTypeId = ''
      }
    },
    //选择分类change
    sortChangeEvent() {},
    // 修改分类
    fixSortBtn(item) {
      this.sortTitle = i18n.t('修改分类名')
      this.addDiagloshow = true
      this.fileName = item.data.name
      this.fileDesc = item.data.apiTypeDesc
      this.editorApiTypeId = item.data.id
      this.initPage(item.data)
    },
    //保存修改分类
    saveFixSortBtn() {
      if (!this.fileName.trim()) {
        this.$message({
          message: `${i18n.t('分类名不能为空')}!`,
          type: 'error',
        })

        return false
      }
      apiDoc
        .updateType({
          apiTypeId: this.editorApiTypeId,
          apiTypeName: this.fileName,
          apiTypeDesc: this.fileDesc,
        })
        .then(res => {
          if (res.status == 200) {
            this.$message({
              message: i18n.t('接口分类修改成功'),
              type: 'success',
            })

            this.getApiTypeList()
            this.getAllType()
            this.addDiagloshow = false
          }
        })
    },
    //保存接口
    savePathBtn() {
      for (var i in this.interfaceArr) {
        if (!this.interfaceArr[i]) {
          this.$message({
            message: `${i18n.t('必填项不能为空!')}!`,
            type: 'error',
          })

          return false
        }
      }
      if (!this.interfaceArr.apiName.trim()) {
        this.$message({
          message: `${i18n.t('必填项不能为空!')}!`,
          type: 'error',
        })

        return false
      }
      if (!this.interfaceArr.apiPath.startsWith('/')) {
        this.$message({
          message: i18n.t('path第一位必需为 /, 只允许由 字母数字-/_:.! 组成'),
          type: 'error',
        })

        return false
      }
      apiDoc
        .createApi({
          apiTypeId: this.apiTypeId,
          ...this.interfaceArr,
        })
        .then(res => {
          if (res.status == 200) {
            this.$message({
              message: i18n.t('创建接口成功'),
              type: 'success',
            })

            this.interfaceArr.apiMethod = 'GET'
            this.interfaceArr.apiName = ''
            this.interfaceArr.apiPath = ''
            this.interfaceArr.apiTypeId = ''
            this.getApiTypeList()
            this.initPage(res.data, null)
            this.addInterfaceshow = false
          }
        })
    },
    // 删除分类
    deleteSortBtn(item) {
      const projectId = this.$getUrlParams().projectId
      if (item.data.apiListBoList !== undefined) {
        this.$confirm(
          `确定删除此接口分类吗？该操作会删除该分类下所有接口，接口删除后无法恢复`,
          {
            confirmButtonText: i18n.t('确定'),
            cancelButtonText: i18n.t('取消'),
            type: 'warning',
          },
        ).then(async () => {
          let formData = new FormData()
          formData.set('apiTypeId', item.data.id)
          formData.set('projectId', projectId)
          apiDoc.deleteType(formData, { type: 'form' }).then(res => {
            if (res.status === 200) {
              this.$message({
                message: i18n.t('删除分类成功'),
                type: 'success',
              })

              this.getApiTypeList()
              this.initPage(this.list[0], null)
            }
          })
        })
      } else {
        this.$confirm(
          `确定删除此接口吗？该操作会删除该接口，接口删除后无法恢复`,
          {
            confirmButtonText: i18n.t('确定'),
            cancelButtonText: i18n.t('取消'),
            type: 'warning',
          },
        ).then(async () => {
          let formData = new FormData()
          formData.set('apiId', item.data.id)
          formData.set('projectId', projectId)
          apiDoc.deleteApi(formData, { type: 'form' }).then(res => {
            if (res.status === 200) {
              this.$message({
                message: i18n.t('删除接口成功'),
                type: 'success',
              })

              this.initPage(item.node.parent.data, null)
              this.getApiTypeList()
            }
          })
        })
      }
    },
    HandleNode(scope, ev) {
      if (
        ['el-icon-plus', 'el-icon-edit', 'el-icon-delete'].indexOf(
          ev.target.className,
        ) !== -1
      ) {
        return false
      }
      if (this.editShow) {
        this.$confirm(`离开页面会丢失当前编辑的内容，确定要离开吗？`, {
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        })
          .then(() => {
            this.filterText = ''
            let defaultExpandedKeys = []
            defaultExpandedKeys.push(scope.node.key)
            if (scope.data.apiListBoList) {
              scope.node.parent.childNodes.forEach(childNode => {
                if (childNode.key !== scope.node.key) {
                  childNode.expanded = false
                }
              })
            }
            let data = scope.data,
              node = scope.node
            this.editShowFun(false)
            this.defaultExpandedKeysFun(defaultExpandedKeys)
            this.initPage(data, node)
          })
          .catch(() => {})
      } else {
        this.filterText = ''
        let defaultExpandedKeys = []
        defaultExpandedKeys.push(scope.node.key)
        if (scope.data.apiListBoList) {
          scope.node.parent.childNodes.forEach(childrenNode => {
            if (childrenNode.key !== scope.node.key) {
              childrenNode.expanded = false
            }
          })
        }
        let data = scope.data,
          node = scope.node
        this.editShowFun(false)
        this.defaultExpandedKeysFun(defaultExpandedKeys)
        this.initPage(data, node)
      }
    },
    //init页面渲染
    initPage(data) {
      //处理数据操作时,页面没有实时渲染
      // let arr = JSON.parse(JSON.stringify(this.list))
      // this.list = arr;
      let obj = {}
      if (data.apiListBoList) {
        this.fileApiTypeId(data.id)
        this.fileApiId(-1)
        obj = { apiId: -1, apiTypeId: data.id }
        this.filePageSwitch(true)
      } else {
        this.fileApiTypeId(-1)
        this.fileApiId(data.id)
        obj = { apiId: data.id, apiTypeId: -1 }
        this.filePageSwitch(false)
      }
      if (data.name == i18n.t('全部接口')) {
        window.history.replaceState(
          null,
          null,
          '?projectId=' +
            this.$getUrlParams().projectId +
            '&apiClassId=' +
            this.$getUrlParams().apiClassId,
        )
      } else {
        window.history.replaceState(
          null,
          null,
          '?projectId=' +
            this.$getUrlParams().projectId +
            '&apiClassId=' +
            this.$getUrlParams().apiClassId +
            '&apiId=' +
            obj.apiId +
            '&apiTypeId=' +
            obj.apiTypeId,
        )
      }
    },
    downLoadJson(url) {
      url = this.templateLink
      let fileName = 'json文件导入模板'
      let result = ''
      axios.get(url, {}, { credentials: 'include' }).then(response => {
        result = JSON.stringify(response)
        var datastr = `data:text/json;charset=utf-8,${result}`
        var downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute('href', datastr)
        downloadAnchorNode.setAttribute('download', fileName + '.json')
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.content-outer-box {
  padding: 16px;
}
.scrollbar-apidoc-tree {
  height: 660px;
  width: 250px;
}
.file-back {
  color: $--color-primary;
  cursor: pointer;
  display: inline-block;
  margin-right: 10px;
}
.left-content-body {
  height: calc(100% - 100px);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 8px;
}
.file-font-ellipsis {
  width: 185px;
  // width: calc(100% + 120px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: bottom;
}

.file-header-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  display: inline-block;
}
.file-box {
  position: relative;
  overflow: hidden;
  display: flex;
  .file-left-box {
    width: 285px;
    min-width: 230px;
    background: $--background-gray;
    border: 1px solid #f3f4f6;
    margin-right: 15px;
    box-shadow: 0 2px 8px 0 rgba(102, 102, 102, 0.1);
    border-radius: 4px;
    border-radius: 4px;
    overflow: hidden;
    .api-search {
      height: 50px;
      background: $--background-gray;
      .add-type-button {
        height: 30px;
      }
    }

    .file-left-btn-box {
      display: flex;
      .file-left-btn {
        flex: 1;
        height: 50px;
        text-align: center;
        // padding: 0 10px;
        cursor: pointer;
        line-height: 50px;
        font-size: 16px;
        // border-bottom: 1px solid gainsboro;
      }
    }
    .left-btn-grey {
      background: $--background-gray;
    }
  }
  .file-right-box {
    flex: 1;
    height: 100%;
    padding: 0 10px;
    border: 1px solid #f3f4f6;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
    .file-right-box-title {
      padding: 10px 0;
      .file-right-box-title-font {
        font-size: 22px;
        font-weight: 500;
        padding-left: 15px;
        border-left: $--color-primary 4px solid;
      }
    }
  }
}
.file-font-width {
  width: 90px;
  display: inline-block;
  text-align: right;
}
.iconmorebox {
  position: relative;
  &:hover {
    .iconmore1 {
      display: flex;
    }
  }
}
.iconmore1 {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  justify-content: flex-end;
  align-items: center;
  i {
    width: 20px;
    text-align: center;
  }
}
.icon-folder-open {
  margin-right: 5px;
}
.font-max-width {
  max-width: 155px;
}
.font-min-width {
  max-width: 210px;
}

.example-link {
  margin-left: 10px;
  color: $font-color-hover;
  text-decoration: underline;
  cursor: pointer;
}
.color-red {
  color: red;
}
.type-select {
  width: 60%;
}
.upload-comp {
  display: inline-block;
}
.btn-wrap {
  display: flex;
  align-items: center;
  .dp-import {
    margin: 0 10px;
  }
}
</style>
