<template>
  <div id="demandlist" class="demand-view">
    <div class="file-box" @click="fileEdiGloal">
      <!-- 基本设置 -->
      <div>
        <p class="file-right-box-title-font ">&nbsp;{{ $t('基本设置') }}</p>
        <ul class="file-box-pad">
          <li class="file-box-margin">
            <span class="file-font-width"
              ><span style="color:red;">*</span>{{ $t('接口名称') }}：</span
            >
            <el-input
              v-model="interfaceList.apiName"
              :placeholder="$t('接口名称')"
              style="width:70%;"
              @change="checkEdit"
            ></el-input>
            <span v-show="interfaceList.apiName.length == 0" style="color:red;"
              >{{ $t('请输入接口名称') }}!</span
            >
          </li>
          <li>
            <span class="file-font-width"
              ><span style="color:red;">*</span>{{ $t('选择分类') }}：</span
            >
            <el-select
              v-model="interfaceList.apiTypeId"
              style="width:70%;"
              @change="checkEdit"
            >
              <el-option
                v-for="item in sortListData"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </li>
          <li>
            <span class="file-font-width"
              ><span style="color:red;">*</span>{{ $t('接口路径') }}：</span
            >
            <el-select
              v-model="interfaceList.apiMethod"
              style="width:80px;"
              @change="checkParamGroup"
            >
              <el-option
                v-for="item in interfaceUrlList"
                :key="item.key"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
            <el-input
              v-model="interfaceList.apiPath"
              :placeholder="$t('接口名称')"
              style="width: calc(67% - 39px);"
              @input="startEdit"
              @change="checkEdit"
            ></el-input>
            <span v-show="interfaceList.apiPath.length == 0" style="color:red;"
              >{{ $t('请输入接口路径') }}!</span
            >
            <ul style="margin-left: 94px">
              <li
                v-for="(data, index) in pathBoList"
                :key="index"
                style="padding: 0; margin: 0"
              >
                <el-input
                  v-model="data.name"
                  disabled
                  style="width:calc(20% - 10px);"
                  :placeholder="$t('参数名称')"
                  @change="checkEdit"
                ></el-input>
                <el-input
                  v-model="data.example"
                  style="width:calc(20% - 10px);"
                  :placeholder="$t('参数示例')"
                  autosize
                  @change="checkEdit"
                ></el-input>
                <el-input
                  v-model="data.queryDesc"
                  style="width:calc(40% - 10px);"
                  :placeholder="$t('备注')"
                  autosize
                  @change="checkEdit"
                ></el-input>
              </li>
            </ul>
          </li>
          <li>
            <span class="file-font-width"
              ><span style="color:red;">*</span>{{ $t('状态') }}：</span
            >
            <el-select
              v-model="interfaceList.apiStatus"
              style="width:70%;"
              @change="checkEdit"
            >
              <el-option
                v-for="item in statusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </li>
        </ul>
      </div>
      <!-- 请求参数设置  -->
      <div style="overflow: auto;">
        <p class="file-right-box-title-font ">&nbsp;{{ $t('请求参数设置') }}</p>
        <div class="file-tab">
          <el-radio-group
            v-model="paramSet"
            style="margin-bottom: 20px;"
            @click="paramSetClick"
          >
            <el-radio-button
              v-if="
                ['GET', 'HEAD', 'OPTIONS'].indexOf(interfaceList.apiMethod) ==
                  -1
              "
              label="Body"
              >Body</el-radio-button
            >
            <el-radio-button label="Query">Query</el-radio-button>
            <el-radio-button label="Headers">Headers</el-radio-button>
          </el-radio-group>
        </div>
        <div class="file-edit-block">
          <div class="mTB file-btn-box">
            <div
              v-if="
                paramSet == 'Body' &&
                  ['GET', 'HEAD', 'OPTIONS'].indexOf(interfaceList.apiMethod) ==
                    -1
              "
              style="margin-bottom: 15px;"
            >
              <el-radio-group v-model="interfaceList.reqBodyType">
                <el-radio label="form">form</el-radio>
                <el-radio label="json">json</el-radio>
                <!-- <el-radio label="file">file</el-radio>
                    <el-radio label="raw">raw</el-radio> -->
              </el-radio-group>
            </div>
            <el-button
              v-if="paramSet == 'Query'"
              type="primary"
              @click="addQueryBtn"
              >{{ $t('添加') }}Query{{ $t('参数') }}</el-button
            >
            <el-button
              v-if="paramSet == 'Headers'"
              type="primary"
              @click="addHeadersBtn"
              >{{ $t('添加') }}Headers</el-button
            >
            <el-button
              v-if="interfaceList.reqBodyType == 'json' && paramSet == 'Body'"
              type="primary"
              @click="addJsonBtn"
              >{{ $t('导入') }}json</el-button
            >
            <el-button
              v-if="
                interfaceList.reqBodyType == 'form' &&
                  paramSet == 'Body' &&
                  ['GET', 'HEAD', 'OPTIONS'].indexOf(interfaceList.apiMethod) ==
                    -1
              "
              type="primary"
              @click="addFormBtn"
              >{{ $t('添加') }}form{{ $t('参数') }}</el-button
            >
            <!-- Query批量 -->
            <span
              v-if="paramSet == 'Query'"
              class="file-btn-font fr cursor-pointer"
              @click="addBatchQueryshow"
              >{{ $t('批量添加') }}</span
            >
            <!-- form批量 -->
            <span
              v-if="interfaceList.reqBodyType == 'form' && paramSet == 'Body'"
              class="file-btn-font fr cursor-pointer"
              @click="addBatchFormshow"
              >{{ $t('批量添加') }}</span
            >
            <!-- 添加Query参数 -->
            <ul v-if="paramSet == 'Query'" class="file-box-pad">
              <li v-for="(data, $index) in queryRequireList" :key="$index">
                <el-input
                  v-model="data.name"
                  style="width:calc(27% - 10px);"
                  :placeholder="$t('参数名称')"
                  @change="checkEdit"
                ></el-input>
                <el-select
                  v-model="data.required"
                  style="width:calc(17% - 10px);"
                  @change="checkEdit"
                >
                  <el-option
                    v-for="item in requireList"
                    :key="item.key"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-input
                  v-model="data.example"
                  style="width:calc(27% - 10px);"
                  :placeholder="$t('参数示例')"
                  type="textarea"
                  autosize
                  @change="checkEdit"
                ></el-input>
                <el-input
                  v-model="data.queryDesc"
                  style="width:calc(27% - 10px);"
                  :placeholder="$t('备注')"
                  type="textarea"
                  autosize
                  @change="checkEdit"
                ></el-input>
                <i
                  class="el-icon-delete cursor-pointer"
                  @click="queryDelete(data, $index)"
                ></i>
              </li>
            </ul>
            <!-- 添加Headers -->
            <ul v-if="paramSet == 'Headers'" class="file-box-pad">
              <li v-for="(data, $index) in headerList" :key="$index">
                <el-autocomplete
                  v-model="data.name"
                  :placeholder="$t('参数名称')"
                  :fetch-suggestions="querySearch"
                  style="width: 17%;"
                >
                  <!--<el-option v-for="item in headerRequireList" :key="item.value" :label="item.label" :value="item.value"></el-option>-->
                </el-autocomplete>
                <el-input
                  v-model="data.value"
                  :placeholder="$t('参数值')"
                  style="width:31%;"
                  type="textarea"
                  autosize
                  @change="checkEdit"
                ></el-input>
                <el-input
                  v-model="data.headerDesc"
                  style="width:47%;"
                  :placeholder="$t('备注')"
                  type="textarea"
                  autosize
                  @change="checkEdit"
                ></el-input>
                <i
                  class="el-icon-delete cursor-pointer"
                  @click="headerDelete(data, $index)"
                ></i>
              </li>
            </ul>
            <!-- 添加body -->
            <div
              v-if="interfaceList.reqBodyType == 'json' && paramSet == 'Body'"
              class="file-json-tree file-box-pad"
            >
              <!-- json编辑 -->
              <json-tree :jsondata="jsonTreeData"></json-tree>
            </div>
            <!-- 添加form参数 -->
            <ul
              v-if="interfaceList.reqBodyType == 'form' && paramSet == 'Body'"
              class="file-box-pad"
            >
              <li v-for="(data, $index) in fromList" :key="$index">
                <el-input
                  v-model="data.name"
                  style="width:calc(17% - 10px);"
                  placeholder="name"
                  @change="checkEdit"
                ></el-input>
                <el-select
                  v-model="data.type"
                  style="width:calc(16% - 10px);"
                  @change="checkEdit"
                >
                  <el-option
                    v-for="item in fromTypeList"
                    :key="item.key"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-select
                  v-model="data.required"
                  style="width:calc(16% - 10px);"
                  @change="checkEdit"
                >
                  <el-option
                    v-for="item in requireList"
                    :key="item.key"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-input
                  v-model="data.example"
                  style="width:calc(17% - 10px);"
                  :placeholder="$t('参数示例')"
                  type="textarea"
                  autosize
                  @change="checkEdit"
                ></el-input>
                <el-input
                  v-model="data.formDesc"
                  style="width:calc(27% - 10px);"
                  :placeholder="$t('备注')"
                  type="textarea"
                  autosize
                  @change="checkEdit"
                ></el-input>
                <i
                  class="el-icon-delete cursor-pointer"
                  @click="formDelete(data, $index)"
                ></i>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- 返回数据设置  -->
      <div class=" " style="overflow: auto;">
        <p class="file-right-box-title-font ">&nbsp;{{ $t('返回数据设置') }}</p>
        <div class="file-tab">
          <el-radio-group
            v-model="importResponseType"
            class="mb20"
            @click="paramSetClick"
          >
            <el-radio-button label="JSON">JSON</el-radio-button>
            <el-radio-button label="RAW">RAW</el-radio-button>
          </el-radio-group>
        </div>
        <div
          v-if="importResponseType === 'JSON'"
          class="file-json-tree file-box-pad mTB"
        >
          <!-- json编辑 -->
          <el-button
            type="primary"
            style="margin-bottom: 25px;"
            @click="addBodyJsonBtn"
            >{{ $t('导入') }}json</el-button
          >
          <json-tree :jsondata="responseData"></json-tree>
        </div>
        <div v-else-if="importResponseType === 'RAW'" class="file-box-pad mTB">
          <el-input
            v-model="rawDataStructure"
            type="textarea"
            class="raw-textarea"
            :rows="4"
            @blur="onRawBlur"
          />
          <p v-if="!rawIsVaild" class="error">{{ $t('数据错误') }}</p>
        </div>
      </div>
      <!-- 状态码   -->
      <div class=" ">
        <p class="file-right-box-title-font ">&nbsp;{{ $t('状态码') }}</p>
        <div class="file-edit-block mTB file-btn-box">
          <el-button type="primary" @click="addStatusCodeBtn">{{
            $t('添加')
          }}</el-button>
          <ul class="file-box-pad">
            <!-- json编辑 -->
            <li v-for="(data, $index) in statusCodeList" :key="$index">
              <el-input
                v-model="data.code"
                style="width:calc(27% - 10px);"
                :placeholder="$t('状态码')"
                @change="checkEdit"
              ></el-input>
              <el-input
                v-model="data.codeExplain"
                :placeholder="$t('说明')"
                style="width:calc(27% - 10px);"
                @change="checkEdit"
              ></el-input>
              <i
                class="el-icon-delete cursor-pointer"
                @click="statusCodeDelete(data, $index)"
              ></i>
            </li>
          </ul>
        </div>
      </div>
      <!-- 备注 -->
      <div class="">
        <p class="file-right-box-title-font ">&nbsp;{{ $t('备注') }}</p>
        <tiny-mce
          :value="interfaceList.apiDesc"
          :plugins="tinymcePlugins"
          :toolbar="tinymceToolbar"
          @watch="editHnadle($event)"
        ></tiny-mce>
        <input v-model="apiDesc" type="text" style="display:none;" />
      </div>
      <div style="height: 30px"></div>
      <!-- 保存  -->
      <div class="file-fixed">
        <div class="file-tab">
          <el-button type="primary" @click="saveBtn">{{
            $t('保存')
          }}</el-button>
        </div>
      </div>
    </div>
    <div style="clear:both;"></div>

    <!-- 批量添加参数 -->
    <el-dialog
      :title="$t('批量添加参数')"
      :visible.sync="addBatchshow"
      width="24%"
      :close-on-click-modal="false"
    >
      <div class="date-container">
        <div class="data-left m10">
          <el-input
            v-model="batchParam"
            placeholder="name:string"
            type="textarea"
          ></el-input>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addBatchshow = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="addBatchConfirmBtn">{{
          $t('确定')
        }}</el-button>
      </div>
    </el-dialog>
    <!-- json导入 -->
    <el-dialog
      title="JSON导入"
      :visible.sync="jsonShow"
      width="440px"
      :close-on-click-modal="false"
    >
      <div class="date-container">
        <div
          v-if="jsonShow"
          id="jsoneditor"
          style="width:400px;height:400px;"
        ></div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="jsonShow = false">{{ $t('取消') }}</el-button>
        <el-button v-if="jsonimport" type="primary" @click="jsonConfirmBtn">{{
          $t('确定')
        }}</el-button>
        <el-button
          v-if="!jsonimport"
          type="primary"
          @click="jsonBodyConfirmBtn"
          >{{ $t('确定') }}</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import fileMixin from './fileMixin.js'
import JsonTree from './fileJsonTree.vue'
import isNil from 'lodash/isNil'
import isArray from 'lodash/isArray'
import { mapState, mapMutations } from 'vuex'
import TinyMce from '@/components/tinymce'
import apiDoc from '@/service/file'
let GenerateSchema = require('generate-schema')
export default {
  name: 'FileEdit',
  components: {
    TinyMce,
    JsonTree,
  },
  mixins: [fileMixin],
  props: {
    setId: {
      type: [Number, String],
      default: null,
    },
  },
  data() {
    return {
      activeName2: 'view',
      interfaceList: {
        apiId: '',
        apiPath: '',
        apiTypeId: '',
        apiName: '',
        apiStatus: i18n.t('未完成'),
        apiMethod: 'POST',
        apiDesc: '',
      },

      paramSet: 'Query',
      importResponseType: 'JSON',
      showTag: false,
      setTagList: [],
      //header参数设置
      headerList: [{ name: '', value: '', headerDesc: '' }],
      requireList: [
        { key: 1, value: 1, label: i18n.t('必需') },
        { key: 0, value: 0, label: i18n.t('非必需') },
      ],

      //from选择类型
      fromTypeList: [
        { key: 'file', value: 'file', label: 'file' },
        { key: 'text', value: 'text', label: 'text' },
      ],

      //statusCode
      statusCodeList: [],
      //添加from参数
      fromList: [
        { name: '', type: '', required: ' ', example: '', formDesc: '' },
      ],

      queryRequireList: [
        { name: '', required: '', example: '', queryDesc: '' },
      ],

      pathBoList: [{ name: '', example: '', queryDesc: '' }],

      //批量添加list
      jsonTreeData: [
        {
          fieldName: 'root',
          type: 'object',
          mock: { mock: '' },
          description: '',
          properties: [],
        },
      ],

      responseData: [
        {
          fieldName: 'root',
          type: 'object',
          mock: { mock: '' },
          description: '',
          properties: [],
        },
      ],
      rawDataStructure: '',

      jsonData: {},
      jsonflag: {},
      addBatchshow: false,
      jsonShow: false,
      batchParam: '',
      jsonTREEData: {},
      BatchQueryshow: false,
      BatchFormshow: false,
      count: 0, //公共计数器
      jsonimport: true, //区分json导入
      apiDesc: 'apidociseditor', //监听备注
      tinymcePlugins: 'lists image table wordcount paste autoresize fullscreen',
      tinymceToolbar:
        'undo redo | bold italic forecolor backcolor bullist  numlist  lists  imageCustom  fullscreen table',
    }
  },
  computed: {
    ...mapState({
      detailInitData: state => state.fe.detailInitData,
      interfaceUrlList: state => state.fe.interfaceUrlList,
      headerRequireList: state => state.fe.headerRequireList,
      apiId: state => state.fe.apiId,
      apiTypeId: state => state.fe.apiTypeId,
      statusList: state => state.fe.statusList,
      sortListData: state => state.fe.sortListData,
    }),
    rawIsVaild() {
      try {
        const result = JSON.parse(this.rawDataStructure)
        return this.vaildRawStructure(result)
      } catch (err) {
        return false
      }
    },
  },
  watch: {
    detailInitData: function() {
      this.init()
    },
    apiDesc: function(newVal, oldVal) {
      if (oldVal !== 'apidociseditor') {
        if (newVal !== oldVal) {
          this.editShowFun(true)
        }
      }
    },
    responseData: {
      handler: function(val) {
        this.rawDataStructure = JSON.stringify(val)
      },
      deep: true,
    },
  },

  mounted() {
    this.init()
  },
  updated() {
    this.fileEdiGloal()
  },

  methods: {
    ...mapMutations(['watchDataFun', 'watchDataObjFun', 'editShowFun']),

    querySearch(queryString, cb) {
      var restaurants = this.headerRequireList
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },

    //初始化数据
    init() {
      let data = this.detailInitData
      if (!data) {
        return false
      }
      this.interfaceList = {
        apiId: data.apiId,
        apiName: data.apiName,
        reqBodyType: data.reqBodyType,
        apiPath: data.apiPath,
        apiMethod: data.apiMethod,
        apiTypeId: data.apiTypeId,
        apiStatus: data.apiStatus,
        apiDesc: data.apiDesc,
      }

      this.queryRequireList = data.reqQueryBoList
      this.pathBoList = data.reqPathBoList

      this.headerList = data.reqHeadersBoList
      this.fromList = data.reqBodyFormBoList
      this.statusCodeList = data.statusCodeBoList
      this.jsonTreeData[0].properties = []
      if (data.reqBodyJson) {
        this.jsonTreeData[0].properties = data.reqBodyJson.properties
        this.jsonTreeData[0].type = data.reqBodyJson.type
        this.jsonTreeData[0].description = data.reqBodyJson.description
      }
      this.responseData[0].properties = []
      if (data.resBody) {
        this.responseData[0].properties = data.resBody.properties
        this.responseData[0].type = data.resBody.type
        this.responseData[0].description = data.resBody.description
      }
      if (
        this.interfaceList.apiMethod == 'GET' ||
        this.interfaceList.apiMethod == 'HEAD' ||
        this.interfaceList.apiMethod == 'OPTIONS'
      ) {
        this.paramSet = 'Query'
      } else {
        this.paramSet = 'Body'
      }
    },
    checkParamGroup() {
      if (
        (this.interfaceList.apiMethod == 'GET' ||
          this.interfaceList.apiMethod == 'HEAD' ||
          this.interfaceList.apiMethod == 'OPTIONS') &&
        this.paramSet == 'Body'
      ) {
        this.paramSet = 'Query'
      }
      if (
        !(
          this.interfaceList.apiMethod == 'GET' ||
          this.interfaceList.apiMethod == 'HEAD' ||
          this.interfaceList.apiMethod == 'OPTIONS'
        ) &&
        this.paramSet !== 'Body'
      ) {
        this.paramSet = 'Body'
      }
      this.checkEdit()
    },
    //判断接口路径input是否获取焦点
    startEdit() {
      const apiPathList = []
      // eslint-disable-next-line no-useless-escape
      this.interfaceList.apiPath.split(/[\/#?]/).map(s => {
        // eslint-disable-next-line no-useless-escape
        const t = s.match(/\:(.*)$|\{([^{}]*)\}/)
        if (t) {
          apiPathList.push({
            name: t[1] || t[2],
            example: '',
            queryDesc: '',
          })
        }
      })
      this.pathBoList = apiPathList
    },
    //tag显示
    showTagEvent() {
      this.showTag = true
      this.taglList.push({ key: '2', value: '', label: '' })
    },
    //添加tag
    addTag() {
      this.taglList.push({ key: '2', value: '', label: '' })
    },
    //tag设置
    tagConfirmBtn() {
      this.showTag = false
    },
    //删除tag
    tagDelete() {},
    //body header query 切换
    paramSetClick() {},
    //添加Headers
    addHeadersBtn() {
      this.headerList.push({
        name: ''.value,
        value: '',
        example: '',
        headerDesc: '',
      })
    },
    //删除header
    headerDelete(data, index) {
      this.headerList.splice(index, 1)
    },

    //添加statusCode
    addStatusCodeBtn() {
      this.statusCodeList.push({ code: ''.value, codeExplain: '' })
    },
    //删除statusCode
    statusCodeDelete(data, index) {
      this.statusCodeList.splice(index, 1)
    },
    //添加Query参数
    addQueryBtn() {
      this.count++
      let obj = { name: '', required: 1, example: '', queryDesc: '' }
      this.queryRequireList.push(obj)
    },
    //删除query
    queryDelete(data, index) {
      this.queryRequireList.splice(index, 1)
    },
    //添加form
    addFormBtn() {
      this.count++
      this.fromList.push({
        name: 'field' + this.count,
        type: 'text',
        required: 1,
        example: '',
        formDesc: '',
      })
    },
    //删除form
    formDelete(data, index) {
      this.fromList.splice(index, 1)
    },
    //Query批量
    addBatchQueryshow() {
      this.addBatchshow = true
      this.BatchQueryshow = true
    },
    //Form批量
    addBatchFormshow() {
      this.addBatchshow = true
      this.BatchFormshow = true
    },
    //添加批量参数
    addBatchConfirmBtn() {
      let arr = this.batchParam.split(/[(\r\n)\r\n]+/)
      let list = []
      if (this.BatchFormshow) {
        this.fromList = []
        arr.forEach(item => {
          let itemArr = []
          itemArr = item.replace(/：/g, ':').split(':')
          if (itemArr[0] !== '') {
            list.push({
              name: itemArr[0],
              required: 1,
              example: itemArr[1] || '',
              formDesc: '',
              type: '',
            })
          }
        })
        this.fromList.push(...list)
        this.BatchFormshow = false
      }
      if (this.BatchQueryshow) {
        this.queryRequireList = []
        arr.forEach(item => {
          let regArr = []
          regArr = item.replace(/：/g, ':').split(':')
          if (regArr[0] !== '') {
            list.push({
              name: regArr[0],
              required: 1,
              example: regArr[1] || '',
              queryDesc: '',
            })
          }
        })
        this.queryRequireList.push(...list)
        this.BatchQueryshow = false
      }
      this.addBatchshow = false
      this.batchParam = ''
    },

    //json导入btn
    addJsonBtn() {
      this.jsonimport = true
      this.jsonShow = true
      this.$nextTick(() => {
        this.jsonflag = this.jsonSet({ id: 'jsoneditor', mode: 'code' })
      })
    },
    addBodyJsonBtn() {
      this.jsonimport = false
      this.jsonShow = true
      this.$nextTick(() => {
        this.jsonflag = this.jsonSet({ id: 'jsoneditor', mode: 'code' })
      })
    },
    //json导入
    jsonConfirmBtn() {
      this.jsonTreeData = this.jsonChange()
    },
    //json body导入
    jsonBodyConfirmBtn() {
      this.responseData = this.jsonChange()
    },
    //处理json body导入数据
    jsonChange() {
      if (this.jsonflag.get()) {
        let obj = {}
        obj['root'] = this.jsonflag.get()
        let schema = GenerateSchema.json(obj)
        this.jsonTREEData.root = schema
        let data = this.jsonToTree(this.jsonTREEData.root.properties)
        this.jsonShow = false
        return data
      }
    },
    //备注
    editHnadle(data) {
      this.interfaceList.apiDesc = data
      this.apiDesc = data
    },
    // 保存
    saveBtn() {
      for (var i in this.interfaceList) {
        if (i !== 'apiStatus' && i !== 'apiDesc') {
          if (!this.interfaceList[i]) {
            return false
          }
        }
      }
      if (!this.interfaceList.apiName.replace(/\s+/g, '')) {
        this.interfaceList.apiName = ''
        return false
      }
      if (!this.interfaceList.apiPath.startsWith('/')) {
        this.$message({
          message: i18n.t('path第一位必需为 /, 只允许由 字母数字-/_:.! 组成'),
          type: 'error',
        })

        return false
      }
      // RAW校验格式，不通过阻止保存操作
      if (this.importResponseType === 'RAW' && !this.rawIsVaild) {
        return false
      }
      this.dataCheck(this.queryRequireList)
      this.dataCheck(this.pathBoList)

      this.dataCheck(this.headerList)
      this.dataCheck(this.fromList)
      this.dataStatusCode(this.statusCodeList)
      let obj = this.AllData()
      apiDoc.saveApiInfo({ ...obj }).then(res => {
        if (res.status == 200) {
          this.$message({
            message: i18n.t('保存成功'),
            type: 'success',
          })

          this.editShowFun(false)
          // this.editSaveFun(true);
          this.$emit('sortFun', true)
          this.watchDataObjFun({})
        }
      })
    },
    //校验列表
    dataCheck(arr) {
      if (arr.length > 0) {
        arr.forEach((item, index) => {
          if (!item['name']) {
            arr.splice(index, 1)
            this.dataCheck(arr)
          }
        })
      }
    },
    //校验statusCode
    dataStatusCode(arr) {
      if (arr.length > 0) {
        arr.forEach((item, index) => {
          if (!item['code']) {
            arr.splice(index, 1)
            this.dataStatusCode(arr)
          }
        })
      }
    },
    //未保存数据
    AllData() {
      let obj = {}
      obj = {
        ...this.interfaceList,
        reqQueryBoList: this.dataChange(this.queryRequireList),
        reqPathBoList: this.dataChange(this.pathBoList),
        reqHeadersBoList: this.dataChange(this.headerList),
        reqBodyFormBoList: this.dataChange(this.fromList),
        reqBodyJson: this.dataChange(this.jsonTreeData[0]),
        resBody: this.dataChange(this.responseData[0]),
        statusCodeBoList: this.statusCodeList,
      }

      return obj
    },
    //保存请求数据转换
    dataChange(data) {
      // 声明cache变量，便于匹配是否有循环引用的情况
      let cache = []
      let str = JSON.stringify(data, function(key, value) {
        if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
            // 移除
            return
          }
          // 收集所有的值
          cache.push(value)
        }
        return value
      })
      cache = null
      if (isNil(str)) {
        this.$message.error(this.$t('数据错误'))
      }
      return JSON.parse(str)
      // return data;
    },
    onRawBlur() {
      if (this.rawIsVaild) {
        this.responseData = JSON.parse(this.rawDataStructure)
      }
    },
    // 校验RAW数据结构
    vaildRawStructure(data) {
      const fields = ['fieldName', 'type', 'mock', 'description', 'properties']
      return data.every(d =>
        fields.every(f => {
          if (f === 'mock') {
            return Object.prototype.toString.call(d[f]) === '[object Object]'
          } else if (f === 'properties') {
            return (
              isArray(d[f]) && (!d[f].length || this.vaildRawStructure(d[f]))
            )
          } else {
            return f in d
          }
        }),
      )
    },
    //全局监听
    fileEdiGloal() {
      let obj = this.AllData()
      this.watchDataObjFun(obj)
    },
  },
}
</script>

<style lang="scss" scoped>
.demand-view {
  padding-bottom: 80px;
}
.file-box {
  ul {
    list-style: none;
    // margin: 0;
    padding: 0;
    // width: 70%;
    li {
      padding: 6px 0;
      margin: 3px 0;
    }
  }
}
.file-edit-block {
  background: #f3f4f6;
}
.file-border-warn {
  border: 1px solid red;
  border-radius: 3px;
  display: inline-block;
}
.file-box-pad {
  // padding: 0 9%;
  overflow: auto;
  background: #f3f4f6;
  .raw-textarea {
    /deep/ .el-textarea__inner {
      height: auto !important;
    }
  }
  .error {
    margin: 0;
    color: red;
  }
}
.file-tab {
  text-align: center;
  height: 60px;
  z-index: 199;
  line-height: 60px;
  .el-button {
    margin-top: 10px;
  }
}
.file-btn-box {
  // width: 80%;
  .file-btn-font {
    color: #409eff;
  }
}
.file-fixed {
  position: fixed;
  bottom: 26px;
  right: 17px;
  width: calc(100% - 337px);
  background-color: #fff;
  /*margin-left: 20px;*/
}
.file-json-tree {
  margin: 10px 0;
  min-width: 1000px;
}
</style>
