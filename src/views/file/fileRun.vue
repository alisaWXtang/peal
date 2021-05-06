<template>
  <div class="file-box" @mousewheel="mouseEnterEvn($event)">
    <div>
      <div class="file-run-box">
        <el-alert
          title="该功能仅支持chrome浏览器"
          type="warning"
          description="请下载并安装好chorme浏览器后在桌面找到浏览器快捷图标并点击鼠标右键的属性一栏，在属性页面中的目标输入框末尾加上   --args --disable-web-security --user-data-dir 点击应用确定后重新打开浏览器"
          show-icon
        >
        </el-alert>
        <div class="mTB">
          <el-select v-model="apiMethod" style="width:7%;" :disabled="true">
            <el-option
              v-for="item in interfaceUrlList"
              :key="item.key"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-select v-model="headerUrl" style="width:38%;" @change="headerFun">
            <el-option
              v-for="item in getClassEnv"
              :key="item.envDomain"
              :label="item.showName"
              :value="item.envDomain"
            >
            </el-option>
            <el-option value="">
              <el-button type="primary" @click="setDailog">{{
                $t('环境配置')
              }}</el-button>
            </el-option>
          </el-select>
          <el-input
            v-model="apiPath"
            style="width: calc(38% - 10px);"
            :disabled="true"
          ></el-input>
          <el-button v-if="sendBtnDis" @click="sendBtn">{{
            $t('发送')
          }}</el-button>
          <!-- <el-button  :disabled="true" v-if="!sendBtnDis" title="请使用chorme浏览器">发送</el-button> -->
          <el-button type="primary" @click="saveBtn">{{
            $t('保存')
          }}</el-button>
        </div>

        <el-collapse v-model="activeNames">
          <el-collapse-item
            v-if="JSON.stringify(pathList) !== '[]'"
            title="PATH PARAMETERS"
            name="4"
          >
            <div class="mTB">
              <div
                v-for="(item, $index) in pathList"
                :key="$index"
                class="mb10"
              >
                <el-input
                  v-model="item.name"
                  style="width:180px;"
                  :disabled="true"
                ></el-input>
                <span>=</span>
                <el-input
                  v-model="item.value"
                  style="width:calc(90% - 158px);"
                  :placeholder="$t('参数值')"
                  :disabled="item.show"
                ></el-input>
              </div>
            </div>
          </el-collapse-item>
          <el-collapse-item
            v-if="JSON.stringify(queryRequireList) !== '[]'"
            title="QUERY PARAMETERS"
            name="1"
          >
            <div class="mTB">
              <div
                v-for="(data, $index) in queryRequireList"
                :key="$index"
                class="mb10"
              >
                <el-input
                  v-model="data.name"
                  style="width:180px;"
                  :disabled="true"
                ></el-input>
                <el-checkbox
                  true-label="1"
                  false-label="0"
                  :disabled="true"
                  :checked="data.required == '1'"
                ></el-checkbox>
                <span class="file-space">=</span>
                <el-input
                  v-model="data.value"
                  style="width: calc(90% - 189px);"
                ></el-input>
              </div>
            </div>
          </el-collapse-item>
          <el-collapse-item
            v-if="JSON.stringify(headerList) !== '[]'"
            title="HEADERS"
            name="2"
          >
            <div class="mTB">
              <div
                v-for="(item, $index) in headerList"
                :key="$index"
                class="mb10"
              >
                <el-input
                  v-model="item.name"
                  style="width:180px;"
                  :disabled="true"
                ></el-input>
                <span>=</span>
                <el-input
                  v-model="item.value"
                  style="width:calc(90% - 158px);"
                  :disabled="item.show"
                ></el-input>
              </div>
            </div>
          </el-collapse-item>
          <el-collapse-item v-show="showBody" title="BODY" name="3">
            <div v-if="resdataShow == 'form'" class="mTB">
              <div
                v-for="(item, $index) in fromList"
                :key="$index"
                class="mb10"
              >
                <el-input
                  v-model="item.name"
                  style="width:180px;"
                  :disabled="true"
                ></el-input>
                <span>=</span>
                <el-input
                  v-model="item.value"
                  style="width:calc(90% - 158px);"
                ></el-input>
              </div>
            </div>
            <!-- <div v-show="resdataShow=='json'"> -->
            <div
              v-show="resdataShow == 'json'"
              id="bodyParam"
              style="width:100%;height:250px;"
              @mouseenter="mouseEnterEvn($event)"
              @click="clickEvent($event)"
              @mousewheel="mouseEnterEvn($event)"
            ></div>
            <!-- </div> -->
          </el-collapse-item>
        </el-collapse>
        <div class="file-border-bottom">
          <span>Response</span>
        </div>
        <div v-if="status">
          <div class="file-massage" :style="styleObject">
            <span>{{ status }}</span>
          </div>
          <div
            v-show="JSON.stringify(resStr) !== '{}'"
            class="file-massage-tip"
          >
            <span
              >{{ $t('提示') }}:{{ resStr.name }}{{ $t('的值应该为')
              }}{{ resStr.type }}{{ $t('类型') }}</span
            >
          </div>
        </div>

        <div>
          <div style="width:35%;" class="file-body">Headers</div>
          <div style="width:55%;" class="file-body">Body</div>
          <div style="width:34%;position: relative;" class="file-body">
            <!-- <div  style="width:calc(100% - 50px);height:250px;" class="file-mask1"></div> -->
            <div id="headerCon" style="width:98%;height:250px;"></div>
          </div>
          <div
            style="width:63%;position: relative;"
            class="file-body file-body-content"
          >
            <!-- <div class="file-mask" style="width:calc(100% - 100px);height:250px;margin-left: 20px;"></div> -->
            <div
              id="bodyCon"
              style="width:98%;height:250px;margin-left: 20px;"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <!-- 环境配置 -->
    <el-dialog
      :title="$t('环境配置')"
      :visible.sync="httpHeadershow"
      width="950px"
      :close-on-click-modal="false"
    >
      <div class="date-container">
        <file-setting @showDailog="showDailog"></file-setting>
      </div>
      <div slot="footer" class="dialog-footer">
        <!-- <el-button @click="httpHeadershow=false">取 消</el-button>
          <el-button type="primary" @click="confirmBtn">确 定</el-button> -->
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { mapState, mapMutations } from 'vuex'
import fileMixin from './fileMixin.js'
import fileSetting from './fileSetting.vue'
const axios = require('axios')
import apiDoc from '@/service/file'
export default {
  name: 'FileRun',
  components: { fileSetting },
  mixins: [fileMixin],
  data() {
    return {
      apiMethod: '',
      apiPath: '',
      headerUrl: '',
      httpHeadershow: false,
      activeNames: ['1', '2', '3', '4'],
      hedData: {},
      resData: {},
      reqData: {},
      titleName: '',
      headerList: [],
      pathList: [],
      pubilcHeader: [], //存储公共header变量
      headerRes: [],
      getClassEnv: [], //获取环境
      queryRequireList: [],
      fromList: [],
      reqBodyJson: [],
      status: '',
      resdataShow: '',
      hedContent: '',
      resContent: '',
      reqContent: '',
      envData: {},
      cookieData: [],
      headerData: [], //存储header类型
      resBody: null,
      resStr: {},
      reqBodyJsonMock: '',
      sendBtnDis: true,
      cookieValue: '', //全局环境单独设置的cookie键值
      childData: '', //获取未改变值
      showBody: true,
    }
  },
  computed: {
    ...mapState({
      apiId: state => state.fe.apiId,
      detailInitData: state => state.fe.detailInitData,
      detailShow: state => state.fe.detailShow,
      interfaceUrlList: state => state.fe.interfaceUrlList,
      // getClassEnv:state=>state.fe.getClassEnv,
    }),
    styleObject: function() {
      let color = {
        '2': '#00a854',
        '3': '#f56a00',
        '4': '#f56a00',
        '5': '#d24e4e',
      }

      return {
        'background-color': color[this.status.toString().charAt(0)],
      }
    },
  },
  watch: {
    httpHeadershow: function(newVal) {
      if (!newVal) {
        this.headerUrl = this.childData
        this.hideSetTabFun(true)
        this.getEnvById()
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.init()
      this.getEnvById()
      this.reqContent = this.jsonSet({
        id: 'bodyParam',
        mode: 'code',
        data: this.reqData,
      })

      this.hedContent = this.jsonSet({
        id: 'headerCon',
        mode: 'code',
        data: this.hedData,
      })

      this.resContent = this.jsonSet({
        id: 'bodyCon',
        mode: 'code',
        data: this.resData,
      })
    })
    this.getBrowserInfo()
    // console.log(browserInfo.browserName + "的版本是：" + browserInfo.versionInfo)
    // if(browserInfo.browserName !== "chrome"){
    //   this.sendBtnDis = false
    // }
  },

  methods: {
    ...mapMutations(['hideSetTabFun']),
    //初始化
    init() {
      apiDoc
        .getRunData({
          projectId: this.$getUrlParams().projectId,
          apiId: this.$getUrlParams().apiId,
        })
        .then(res => {
          if (res.status == 200) {
            let data = res.data
            this.queryRequireList = data.runQuery || []
            this.headerRes = data.runHeader
            this.headerList.push(...this.headerRes)
            this.pathList = data.runPath || []
            this.fromList = data.runBodyForm
            this.apiMethod = data.apiMethod
            this.apiPath = data.apiPath
            this.resdataShow = data.reqBodyType
            this.reqBodyJsonMock = data.reqBodyJsonMock
            if (data.reqBodyJsonMock) {
              this.$nextTick(() => {
                this.reqContent.set(data.reqBodyJsonMock)
              })
            }
            this.globalData(data)
            if (['GET', 'HEAD', 'OPTIONS'].indexOf(this.apiMethod) !== -1) {
              this.showBody = false
            } else if (
              JSON.stringify(this.reqBodyJsonMock) !== '{}' ||
              JSON.stringify(this.fromList) !== '[]'
            ) {
              this.showBody = true
            } else {
              this.showBody = false
            }
          }
        })
        .catch(() => {
          this.pubilcPageShow()
          this.pageShow()
        })
    },
    //展示环境配置弹窗
    setDailog() {
      this.childData = this.headerUrl
      this.httpHeadershow = true
      this.hideSetTabFun(false)
    },
    //全局配置参数
    globalData(data) {
      if (data.envId == 0) {
        this.headerUrl = this.getClassEnv[0].envDomain
      }
      this.getClassEnv.forEach(el => {
        if (el.envId == data.envId) {
          this.headerUrl = el.envDomain
        }
        if (el.envDomain == this.headerUrl) {
          this.pubilcHeader.push(...el.headers)
          this.envData = el
          this.cookieData = el.cookies
          this.headerData = el.headers
        }
      })
      // this.childData = this.headerUrl
      this.globalCookie()
      if (JSON.stringify(this.pubilcHeader) !== '[]') {
        this.pubilcHeader.forEach(el => {
          el.show = true
        })
        this.headerList.push(...this.pubilcHeader)
      }
    },

    //获取编辑页面编辑数据
    pageShow() {
      let data = this.detailInitData
      if (!data) {
        return false
      }
      this.queryRequireList = data.reqQueryBoList
      this.headerList = data.reqHeadersBoList
      this.pathList = data.reqPathBoList
      this.fromList = data.reqBodyFormBoList //reqBodyJson
      this.reqBodyJson = data.reqBodyJson
      if (this.getClassEnv[0]) {
        this.headerUrl = this.getClassEnv[0].envDomain
      }
    },
    //页面公共区域展示
    pubilcPageShow() {
      let data = this.detailInitData
      this.resdataShow = data.reqBodyType
      this.apiMethod = data.apiMethod
      this.apiPath = data.apiPath
      this.resBody = data.resBody
      if (this.resdataShow == 'json') {
        if (!this.dataJson(data.reqBodyJson)) {
          return false
        }
        this.$nextTick(() => {
          this.reqContent.set(this.dataJson(data.reqBodyJson))
        })
      }
    },
    //检测浏览器信息
    getBrowserInfo() {
      let sysObj = {}
      let browserInfo = navigator.userAgent.toLowerCase()
      let regular = /(msie|firefox|chrome|opera|version).*?([\d.]+)/
      let vsMsg = browserInfo.match(regular)
      sysObj.browserName = vsMsg[1].replace(/version/, "'safari")
      sysObj.versionInfo = vsMsg[2]
      return sysObj
    },
    //根据配置路径添加全局发送携带参数
    headerFun() {
      this.getClassEnv.forEach(el => {
        if (el.envDomain == this.headerUrl) {
          this.envData = el
          this.cookieData = el.cookies
          this.headerData = el.headers
          this.headerListFun(this.headerData)
        }
      })
    },
    //全局header和当前接口header合并
    headerListFun(arr) {
      this.headerList = []
      this.pubilcHeader = []
      this.pubilcHeader.push(...arr)

      if (JSON.stringify(this.pubilcHeader) !== '[]') {
        this.pubilcHeader.forEach(el => {
          el.show = true
        })
        this.headerList.push(...this.pubilcHeader)
      }
      this.headerList.push(...this.headerRes)
      this.globalCookie()
    },
    //隐藏环境配置弹窗
    showDailog(n) {
      this.httpHeadershow = n.show
      let data = n.data
      this.$nextTick(() => {
        this.headerUrl = data.envDomain
        this.cookieData = data.cookies
        // this.headerData = data.headers
        this.headerListFun(data.headers)
        // this.headerList = [];
        // this.pubilcHeader = [];

        // this.pubilcHeader.push(...this.headerData)

        // if(JSON.stringify(this.pubilcHeader) !== '[]'){
        //   this.pubilcHeader.forEach((el)=>{
        //     el.show = true;
        //   })
        //   this.headerList.push(...this.pubilcHeader)
        // }
        // this.headerList.push(...this.headerRes)
        // this.globalCookie()
      })
    },
    //保存
    saveBtn() {
      let obj = {
        envId: this.envData.envId,
        apiId: this.$getUrlParams().apiId,
        runQuery: JSON.parse(JSON.stringify(this.queryRequireList)),
        runHeader: JSON.parse(JSON.stringify(this.headerRes)),
        runBodyForm: JSON.parse(JSON.stringify(this.fromList)),
        reqBodyJsonMock: JSON.parse(JSON.stringify(this.reqContent.get())),
      }
      apiDoc.saveRunData(obj).then(res => {
        if (res.status == 200) {
          this.$message({
            message: i18n.t('保存成功'),
            type: 'success',
          })
        }
      })
    },
    //保存运行数据转换
    // dataChange(data){
    //   // 声明cache变量，便于匹配是否有循环引用的情况
    //   let cache = [];
    //   let str = JSON.stringify(data, function(key, value) {
    //     if (typeof value === 'object' && value !== null) {
    //       if (cache.indexOf(value) !== -1) {
    //           // 移除
    //         return;
    //       }
    //         // 收集所有的值
    //       cache.push(value);
    //     }
    //     return value;
    //   });
    //   cache = null;
    //   return JSON.parse(str);
    //   // return data;
    // },
    //发送
    sendBtn() {
      let data = {},
        params = {},
        headers = {},
        pathUrl = ''
      if (!this.headerUrl) {
        this.$message({
          message: i18n.t('请输入地址'),
          type: 'error',
        })
        return false
      }
      if (this.apiPath) {
        pathUrl = this.urlChange(this.apiPath, this.pathList)
      }
      if (this.queryRequireList.length > 0) {
        params = this.dataChange(this.queryRequireList)
      }
      if (this.fromList.length > 0) {
        data = this.dataChange(this.fromList)
        let formData = new FormData()
        if (data) {
          if (data.toString().indexOf('FormData') === -1) {
            for (let paramsKey in data) {
              formData.append(paramsKey, data[paramsKey])
            }
          } else {
            formData = data
          }
        }
        data = formData
      }
      let reqConArr = Object.keys(this.reqContent.get())

      if (reqConArr.length !== 0) {
        data = this.reqContent.get()
      }
      if (this.headerList.length > 0) {
        headers = this.dataChange(this.headerList)
      }

      let response = axios({
        method: this.apiMethod,
        url: pathUrl,
        timeout: 5000,
        params,
        maxRedirects: 0,
        baseURL: this.headerUrl,
        withCredentials: true,
        data,
        headers,
      })
      // axios.interceptors.request.use(config=> {
      //   config.headers.Authorization = 'JSESSIONID=1C6F8DADCDA2948271A31460A607DF8E; SESSION=373d88cb-707a-4e57-9ce3-88ae615f7b31; user=W9001075'
      //   return config
      // })

      response
        .then(res => {
          this.hedData = res.headers
          this.hedContent.set(this.hedData)
          this.resContent.set(res.data)
          this.status = res.status
          console.log(this.resBody, res.data)
          this.resStr = this.checkData(this.resBody, res.data)
        })
        .catch(e => {
          console.log(e)
          if (!e.response) {
            return false
          }
          this.hedData = e.response.headers
          this.hedContent.set(this.hedData)
          this.resContent.set(e.response.data)
          this.status = e.response.status
        })
    },
    //全局cookie
    globalCookie() {
      //配置环境公共部分获取cookie自定义参数
      this.cookieValue = ''
      if (JSON.stringify(this.cookieData) !== '[]') {
        this.cookieData.forEach(ele => {
          this.cookieValue += ele.name + '=' + ele.value + ';'
        })
      }
      let flagArr = [],
        obj = {}
      this.headerList.forEach(el => {
        if (el.name == 'Cookie') {
          flagArr.push(el.value)
        }
      })
      if (JSON.stringify(flagArr) == '[]' && this.cookieValue) {
        obj = { name: 'Cookie', value: this.cookieValue, show: true }
        this.headerList.push(obj)
      }
    },
    //转换为请求数据
    dataChange(arr) {
      let data = {},
        str = '',
        ar = [],
        pubStr = ''

      pubStr = this.cookieValue
      arr.forEach(item => {
        if (item.name == 'Cookie') {
          ar.push(item.value)
          if (ar.length > 0) {
            str += item.value + ';'
            data[item.name] = str
          }
        }
        data[item.name] = item.value
      })
      if (pubStr) {
        str = str.concat(pubStr)
      }
      document.cookie = str
      delete data['Cookie']
      return data
    },
    //转换请求地址
    urlChange(url, arr) {
      arr.forEach(item => {
        url = url.replace('{' + item.name + '}', item.value)
      })
      return url
    },

    //请求环境名
    getEnvById() {
      apiDoc
        .getClassEnv({
          apiClassId: this.$getUrlParams().apiClassId,
        })
        .then(res => {
          res.data.forEach(el => {
            el.showName = el.envName + '：' + el.envDomain
          })
          this.getClassEnv = res.data
        })
    },
    //监听bodyjosn编辑框禁止全局滚动
    mouseEnterEvn() {
      setTimeout(() => {
        document
          .getElementById('bodyParam')
          .getElementsByClassName('ace_scrollbar')[0].style['padding-left'] =
          '100%'
      }, 400)
    },
    //鼠标离开bodyjosn编辑框时恢复全局开启可滚动
    clickEvent() {
      document
        .getElementById('bodyParam')
        .getElementsByClassName('ace_scrollbar')[0].style['padding-left'] = '0'
      setTimeout(() => {
        document
          .getElementById('bodyParam')
          .getElementsByClassName('ace_scrollbar')[0].style['padding-left'] =
          '100%'
      }, 1000)
    },
  },
}
</script>

<style lang="scss" scoped>
.showCheck {
  background: #eef7fe;
  color: $--color-primary;
  border-right: 2px solid $--color-primary;
}
#bodyParam {
  .ace_editor {
    overflow: auto;
  }
}
.file-box {
  position: relative;
  .file-space {
    display: inline-block;
    margin-left: 10px;
  }
  .file-border-bottom {
    border-bottom: 1px solid #ebeef5;
    padding: 15px 20px;
    background: #f9f9f9;
  }
  .file-massage {
    border-bottom: 1px solid #ebeef5;
    padding: 10px 20px;
    // background: #f56a00;
    background-color: #00a854;
    span {
      color: #fff;
      font-size: 18px;
    }
  }
  // .file-tip-green{

  // }
  .file-massage-tip {
    padding: 10px 20px;
    border: 1px solid #fff07a;
    background-color: #fffee6;
  }
  .file-body {
    display: inline-block;
    padding: 10px 0;
  }
  .file-body-content {
    border-left: 1px solid #c6c6c7;
  }
}
.file-right-box {
  width: calc(100% - 290px);
  height: 100%;
  min-height: 703px;
  padding: 0 10px;
  border: 1px solid #f3f4f6;
}
.file-mask {
  position: absolute;
  left: 5rem;
  z-index: 999;
}
.file-mask1 {
  position: absolute;
  left: 3rem;
  z-index: 999;
}
.date-container {
  max-height: 705px;
  overflow: auto;
}
</style>
