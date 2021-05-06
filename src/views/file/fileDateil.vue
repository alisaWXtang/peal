<template>
  <div id="demandlist">
    <el-tabs
      v-model="activeName2"
      type="card"
      :before-leave="tabSwcith"
      @tab-click="handleClick"
    >
      <el-tab-pane :label="$t('预览')" name="view">
        <div v-if="activeName2 == 'view'" class="file-box">
          <!-- 基本信息 -->
          <div>
            <p class="file-right-box-title-font ">&nbsp;{{ $t('基本信息') }}</p>
            <ul>
              <li class="file-box-margin" style="padding-top: 0;">
                <span class="file-font-width">{{ $t('接口名称') }}：</span>
                <span>{{ interfaceList.apiName }}</span>
                <div class="fr">
                  <span class="file-font-width">{{ $t('接口ID') }}：</span>
                  <span style="display:inline-block;width:135px">{{
                    interfaceList.apiId
                  }}</span>
                </div>
              </li>
              <li>
                <span class="file-font-width"
                  >{{ $t('状')
                  }}<span style="visibility: hidden;">{{ $t('状态') }}</span
                  >{{ $t('态') }}：</span
                >
                <span
                  ><span
                    style="background:yellow;"
                    class="file-status"
                    :style="{
                      background: interfaceList.apiStatus ? '#57cf27' : 'red',
                    }"
                  ></span
                  >{{
                    interfaceList.apiStatus ? $t('已完成') : $t('未完成')
                  }}</span
                >
                <div class="fr">
                  <span class="file-font-width">{{ $t('创建人') }}：</span>
                  <span style="display:inline-block;width:135px"
                    >{{ interfaceList.createUserName }}({{
                      interfaceList.createUserId
                    }})</span
                  >
                </div>
              </li>
              <!-- <li><span class="file-font-width">Tag：</span><span>{{interfaceList.tag}}</span></li> -->
              <li>
                <span class="file-font-width">{{ $t('更新时间') }}：</span>
                <span style="display:inline-block;width:135px">{{
                  interfaceList.updateTime
                }}</span>
              </li>
              <li>
                <span class="file-font-width">{{ $t('接口路径') }}：</span>
                <span
                  class="file-font-style"
                  :class="{
                    'file-font-style-blue':
                      ['GET', 'HEAD'].indexOf(interfaceList.apiMethod) == -1,
                    'file-font-style-green':
                      ['GET', 'HEAD'].indexOf(interfaceList.apiMethod) !== -1,
                  }"
                  >{{ interfaceList.apiMethod }}</span
                >
                <span>{{ interfaceList.apiPath }}</span>
                <i
                  class="el-icon-news cursor-pointer file-api-copy"
                  :title="$t('复制路径')"
                  @click="copyApiPathFun"
                ></i>
                <div class="file-copy-box">
                  <div class="file-copy-mask"></div>
                  <input
                    id="apiPathValue"
                    type="text"
                    :value="interfaceList.apiPath"
                  />
                </div>
              </li>
              <li>
                <span class="file-font-width" style="margin-left: 10px;">
                  Mock{{ $t('地址') }}：</span
                >
                <a :href="interfaceList.mockUrl" target="_blank">{{
                  interfaceList.mockUrl
                }}</a>
              </li>
            </ul>
          </div>
          <div
            v-show="
              interfaceList.apiDesc !== null && interfaceList.apiDesc !== ''
            "
            class=" "
          >
            <p class="file-right-box-title-font ">&nbsp;{{ $t('备注') }}</p>
            <div v-html="interfaceList.apiDesc"></div>
          </div>
          <!-- 请求参数  -->
          <div v-show="reqParamsShow.allShow">
            <p class="file-right-box-title-font ">&nbsp;{{ $t('请求参数') }}</p>
            <div v-show="this.reqParamsShow.reqPathBoShow" class="mBr">
              <div class="mTB20 file-small-title">
                &nbsp;{{ $t('路径参数') }}
              </div>
              <el-table
                ref="pathBoList"
                :data="pathBoList"
                style="width: 80%;height: 100%;"
                border
              >
                <el-table-column
                  prop="name"
                  :label="$t('参数名称')"
                ></el-table-column>
                <el-table-column
                  prop="example"
                  :label="$t('示例')"
                ></el-table-column>
                <el-table-column
                  prop="queryDesc"
                  :label="$t('备注')"
                ></el-table-column>
              </el-table>
            </div>
            <div v-show="reqParamsShow.reqHeaderShow" class="mBr">
              <div class="mTB20 file-small-title">Headers：</div>
              <el-table
                ref="headerList"
                :data="headerList"
                style="width: 80%;height: 100%;"
                border
              >
                <el-table-column
                  prop="name"
                  :label="$t('参数名称')"
                ></el-table-column>
                <el-table-column
                  prop="value"
                  :label="$t('参数值')"
                ></el-table-column>
                <!-- <el-table-column prop="required" label="是否必须" ></el-table-column> -->
                <!-- <el-table-column prop="example" label="示例" ></el-table-column> -->
                <el-table-column
                  prop="headerDesc"
                  :label="$t('备注')"
                ></el-table-column>
              </el-table>
            </div>
            <div v-show="reqParamsShow.reqQueryShow" class="mBr">
              <div class="mTB20 file-small-title">Query：</div>
              <el-table
                ref="queryRequireList"
                :data="queryRequireList"
                style="width: 80%;height: 100%;"
                border
              >
                <el-table-column
                  prop="name"
                  :label="$t('参数名称')"
                ></el-table-column>
                <el-table-column prop="required" :label="$t('是否必须')">
                  <template slot-scope="scope">
                    <span
                      >{{ scope.row.required ? $t('必需') : $t('非必需') }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="example"
                  :label="$t('示例')"
                ></el-table-column>
                <el-table-column
                  prop="queryDesc"
                  :label="$t('备注')"
                ></el-table-column>
              </el-table>
            </div>
            <div v-show="reqParamsShow.reqBodyShow" class="mBr">
              <div class="mTB20 file-small-title">Body:</div>
              <!-- json -->
              <el-table
                v-show="interfaceList.reqBodyType == 'json'"
                style="width: 80%;height: 100%;"
                :data="reqBodyData"
                border
                row-key="id"
                default-expand-all
                :tree-props="{ children: 'properties' }"
              >
                <el-table-column
                  prop="fieldName"
                  :label="$t('名称')"
                  min-width="200"
                ></el-table-column>
                <el-table-column
                  prop="type"
                  :label="$t('类型')"
                  min-width="100"
                ></el-table-column>
                <el-table-column
                  prop="required"
                  :label="$t('是否必须')"
                  min-width="100"
                >
                  <template slot-scope="scope">
                    <span
                      >{{ scope.row.required ? $t('必需') : $t('非必需') }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="description"
                  :label="$t('备注')"
                  min-width="100"
                ></el-table-column>
              </el-table>
              <!-- from -->
              <el-table
                v-show="interfaceList.reqBodyType == 'form'"
                ref="fromList"
                :data="fromList"
                style="width: 80%;height: 100%;"
                border
              >
                <el-table-column
                  prop="name"
                  :label="$t('参数名称')"
                ></el-table-column>
                <el-table-column
                  prop="type"
                  :label="$t('参数类型')"
                ></el-table-column>
                <el-table-column prop="required" :label="$t('是否必须')">
                  <template slot-scope="scope">
                    <span
                      >{{ scope.row.required ? $t('必需') : $t('非必需') }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="example"
                  :label="$t('示例')"
                ></el-table-column>
                <el-table-column
                  prop="formDesc"
                  :label="$t('备注')"
                ></el-table-column>
              </el-table>
            </div>
          </div>
          <!-- 返回数据 -->
          <div class=" ">
            <p class="file-right-box-title-font">&nbsp;{{ $t('返回数据') }}</p>
            <div class="mBr">
              <el-table
                style="width: 80%;height: 100%;"
                :data="responseData"
                border
                row-key="id"
                default-expand-all
                :tree-props="{ children: 'properties' }"
              >
                <el-table-column
                  prop="fieldName"
                  :label="$t('名称')"
                  min-width="200"
                ></el-table-column>
                <el-table-column
                  prop="type"
                  :label="$t('类型')"
                  min-width="100"
                ></el-table-column>
                <el-table-column
                  prop="required"
                  :label="$t('是否必须')"
                  min-width="100"
                >
                  <template slot-scope="scope">
                    <span
                      >{{ scope.row.required ? $t('必需') : $t('非必需') }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="description"
                  :label="$t('备注')"
                  min-width="100"
                ></el-table-column>
              </el-table>
            </div>
          </div>
          <!-- 状态码 -->
          <div v-if="statusCodeList.length !== 0" class=" ">
            <p class="file-right-box-title-font">&nbsp;{{ $t('状态码') }}</p>
            <el-table
              ref="statusCodeList"
              :data="statusCodeList"
              style="width: 80%;height: 100%;"
              border
            >
              <el-table-column
                prop="code"
                :label="$t('状态码')"
              ></el-table-column>
              <el-table-column
                prop="codeExplain"
                :label="$t('状态码说明')"
              ></el-table-column>
            </el-table>
          </div>
          <div style="height: 200px"></div>
        </div>
      </el-tab-pane>
      <el-tab-pane
        v-if="
          $authFunction('FUNC_APIDOC_SAVE_INFO', 3, $getUrlParams().projectId)
        "
        :label="$t('编辑')"
        name="edit"
      >
        <file-edit
          v-if="activeName2 == 'edit'"
          :set-id="this.setId"
          @sortFun="sortChildFun"
        ></file-edit>
      </el-tab-pane>
      <el-tab-pane
        v-if="
          $authFunction(
            'FUNC_APIDOC_SAVE_RUN_DATA',
            3,
            $getUrlParams().projectId,
          )
        "
        :label="$t('运行')"
        name="run"
      >
        <file-run v-if="activeName2 == 'run'" :set-id="this.setId"></file-run>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
// import random from 'lodash/random'
// import TreeTable from '@/components/fileTreeTable'
import fileEdit from './fileEdit.vue'
import fileRun from './fileRun.vue'
import apiDoc from '@/service/file'
import {
  mapState,
  mapMutations,
  // mapActions
} from 'vuex'
export default {
  name: 'FileDateil',
  components: {
    fileEdit,
    fileRun,
  },
  props: {
    setId: {
      type: [Number, String],
      default: null,
    },
  },
  // mixins: [ProjectCommonMixin],
  data() {
    return {
      activeName2: 'view',
      // remarkContent:'备注备注.....',
      interfaceList: {
        apiName: '',
        apiMethod: '',
        createUserId: '',
        createUserName: '',
        apiPath: '',
        updateTime: '',
        apiStatus: '',
        mockUrl: '',
        apiDesc: '',
        reqBodyType: '',
        apiId: '',
      },

      // InitData:{},
      pathBoList: [],
      queryRequireList: [],
      headerList: [],
      fromList: [],
      statusCodeList: [],
      jsonTreeData: [],
      responseData: [],
      reqBodyData: [],
      reqParamsShow: {
        reqQueryShow: false,
        reqHeaderShow: false,
        reqBodyShow: false,
        reqPathBoShow: false,
        allShow: false,
      },
    }
  },
  computed: {
    ...mapState({
      // detailShow:state=>state.fe.detailShow,
      detailInitData: state => state.fe.detailInitData,
      apiId: state => state.fe.apiId,
      apiTypeId: state => state.fe.apiTypeId,
      watchData: state => state.fe.watchData,
      watchDataObj1: state => state.fe.watchDataObj1,
      editShow: state => state.fe.editShow,
    }),
  },
  watch: {
    apiId: function() {
      this.init()
    },
  },

  mounted() {
    if (this.$getUrlParams().apiId !== -1 && this.$getUrlParams().apiId) {
      this.init()
    }
  },
  methods: {
    ...mapMutations(['detailInitDataFun', 'watchDataFun', 'editShowFun']),
    //复制路径
    copyApiPathFun() {
      let target = document.getElementById('apiPathValue')
      // 选择内容
      target.focus()
      target.setSelectionRange(0, target.value.length)
      // 复制内容
      let succeed = ''
      try {
        succeed = document.execCommand('copy')
        this.$message.success('复制成功')
      } catch (e) {
        succeed = false
        this.$message.warning('复制失败')
      }
      return succeed
    },
    //监听名称和分类change是否触发
    sortChildFun() {
      this.$emit('sortFun', true)
    },
    //初始化数据
    init(str) {
      this.editShowFun(false)
      let apiId1 = this.apiId || this.$getUrlParams().apiId
      apiDoc.getApiInfo({ apiId: apiId1 }).then(res => {
        if (res.data) {
          this.detailInitDataFun(res.data)
          this.watchDataFun(JSON.parse(JSON.stringify(res.data)))
          let data = res.data
          str ? (this.activeName2 = 'run') : (this.activeName2 = 'view')
          this.interfaceList = {
            apiName: data.apiName,
            apiPath: data.apiPath,
            apiMethod: data.apiMethod,
            apiTypeId: data.apiTypeId,
            apiStatus: data.apiStatus,
            mockUrl: data.mockUrl,
            createUserName: data.createUserName,
            createUserId: data.createUserId,
            updateTime: data.updateTime,
            apiDesc: data.apiDesc,
            reqBodyType: data.reqBodyType,
            apiId: data.apiId,
          }

          this.pathBoList = data.reqPathBoList
          this.queryRequireList = data.reqQueryBoList
          this.headerList = data.reqHeadersBoList
          this.fromList = data.reqBodyFormBoList
          this.statusCodeList = data.statusCodeBoList
          if (data.reqBodyJson) {
            this.jsonTreeData.push(data.reqBodyJson)
          } else {
            this.jsonTreeData = []
          }
          // 递归list添加节点id 树形table渲染必须
          const setId = (list = [], parentId) => {
            list.forEach((item, index) => {
              item.id = parentId ? `${parentId}-${index}` : `${index}`
              if (item.properties) {
                setId(item.properties, item.id)
              }
            })
            return list
          }
          this.responseData = setId(data?.resBody?.properties)
          this.reqBodyData = setId(data?.reqBodyJson?.properties)
          this.reParamShow()
          // apiName
        }
      })
    },

    changArray(properties) {
      let newProperties = []
      for (let item in properties) {
        if (properties[item].type == 'array') {
          let childrenProperties = properties[item].properties
          properties[item].type = childrenProperties[0].type + ' [ ]'
          if (childrenProperties[0].properties) {
            properties[item].properties = this.changArray(
              childrenProperties[0].properties,
            )
          } else {
            properties[item].properties = []
          }
          newProperties.push(properties[item])
        } else if (properties[item].type == 'object') {
          properties[item].properties = this.changArray(
            properties[item].properties,
          )

          newProperties.push(properties[item])
        } else {
          newProperties.push(properties[item])
        }
      }
      return newProperties
    },

    reParamShow() {
      this.reqParamsShow.reqBodyShow = false
      this.reqParamsShow.reqQueryShow = false
      this.reqParamsShow.reqHeaderShow = false
      this.reqParamsShow.reqPathBoShow = false
      this.reqParamsShow.allShow = false

      if (
        ['GET', 'HEAD', 'OPTIONS'].indexOf(this.interfaceList.apiMethod) == -1
      ) {
        if (this.interfaceList.reqBodyType == 'form') {
          if (this.fromList.length !== 0) {
            this.reqParamsShow.reqBodyShow = true
          }
        }
        if (this.interfaceList.reqBodyType == 'json') {
          if (this.jsonTreeData.length !== 0) {
            this.reqParamsShow.reqBodyShow = true
          }
        }
      }
      if (this.pathBoList.length !== 0) {
        this.reqParamsShow.reqPathBoShow = true
      }
      if (this.queryRequireList.length !== 0) {
        this.reqParamsShow.reqQueryShow = true
      }
      if (this.headerList.length !== 0) {
        this.reqParamsShow.reqHeaderShow = true
      }
      if (
        this.reqParamsShow.reqBodyShow ||
        this.reqParamsShow.reqQueryShow ||
        this.reqParamsShow.reqHeaderShow ||
        this.reqParamsShow.reqPathBoShow
      ) {
        this.reqParamsShow.allShow = true
      }
    },

    //切换tab
    handleClick(tab) {
      if (this.editShow) {
        this.$confirm(`离开页面会丢失当前编辑的内容，确定要离开吗？`, {
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        })
          .then(() => {
            this.editShowFun(false)
            this.activeName2 = tab.name
          })
          .catch(() => {})
      }

      if (this.activeName2 == 'view') {
        this.init()
      }
      if (this.activeName2 == 'run') {
        this.init('run')
      }
    },
    //切换标签之前的钩子
    tabSwcith() {
      return !this.editShow
    },
  },
}
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  // margin: 0;
  padding: 0;
  width: 62%;
  // width: calc(100% - 250px);
  li {
    padding: 10px;
    position: relative;
    min-width: 500px;
  }
}
.file-right {
  display: inline-block;
  // position: absolute;
  // right: 0;
}
.file-status {
  display: inline-block;
  padding: 4px;
  margin: 0 5px;
  border-radius: 10px;
}
.file-api-copy {
  margin-left: 20px;
  font-size: 18px;
  vertical-align: middle;
  &:hover {
    color: #409eff;
  }
}
.file-copy-box {
  width: 20px;
  display: inline-block;
  position: relative;
  .file-copy-mask {
    width: 22px;
    height: 20px;
    background: #fff;
    position: absolute;
    top: 0;
  }
  #apiPathValue {
    width: 20px;
    color: #fff;
    border: none;
    &:focus {
      outline: 1px solid #fff;
    }
  }
}
</style>
