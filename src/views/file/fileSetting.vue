<template>
  <div class="content-outer-box">
    <div
      class="file-box"
      :style="{ height: `calc(100vh - ${contentTop + 150}px)` }"
    >
      <div class="file-left-box fl ">
        <div v-if="hideSetTab" class="file-left-btn-box ">
          <span
            class="file-left-btn "
            style="background:#fff;"
            @click="handleRadioChange($t('接口'))"
            >{{ $t('接口列表') }}</span
          >
          <span
            class="file-left-btn left-btn-grey"
            @click="handleRadioChange($t('设置'))"
            >{{ $t('设置') }}</span
          >
        </div>
        <div class="file-left-box-title">
          <span>{{ $t('环境列表') }}</span>
          <i
            v-show="
              $authFunction('FUNC_APIDOC_ADD_ENV', 3, $getUrlParams().projectId)
            "
            class="el-icon-plus cursor-pointer"
            style="float: right;"
            @click="addConfirmBtn"
          ></i>
        </div>
        <!-- 环境列表 -->
        <ul class="file-list-box scrollbal-common">
          <li
            v-for="(item, $index) in list"
            :key="$index"
            :class="{ showCheck: $index == listIndex }"
            class="cursor-pointer"
            @click="switchListBtn($index)"
          >
            <span class="cursor-pointer">{{
              item.envName ? item.envName : $t('新环境')
            }}</span>
            <i
              v-show="$index == listIndex"
              v-if="
                $authFunction(
                  'FUNC_APIDOC_DELETE_ENV',
                  3,
                  $getUrlParams().projectId,
                )
              "
              class="el-icon-delete cursor-pointer"
              style="float: right;"
              @click="deleteListBtn(item)"
            ></i>
          </li>
        </ul>
      </div>
      <div class="file-right-box fr scrollbal-common">
        <div class="m30">
          <div class="data-left m10" style="width:90%;">
            <div class="mb10 mt10">
              <span style="color:red;">* </span>{{ $t('环境名称') }}
            </div>
            <el-input
              v-model="envItem.envName"
              :placeholder="$t('请输入')"
              style="width:100%;"
            ></el-input>
          </div>
          <div class="data-left m10" style="width:90%;">
            <div class="mb10 mt10">
              <span style="color:red;">* </span>{{ $t('环境域名') }}
            </div>
            <div>
              <el-select
                slot="prepend"
                v-model="protocol"
                style="width: 85px;display: inline-block;"
              >
                <el-option
                  v-for="item in domainrlList"
                  :key="item.key"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>

              <el-input
                v-model="domain"
                :placeholder="$t('请输入环境域名')"
                class="input-with-select"
                style="width: calc(100% - 90px);display: inline-block;"
              ></el-input>
            </div>
          </div>
          <div class="data-left m10" style="width:90%;">
            <div
              v-show="
                $authFunction(
                  'FUNC_APIDOC_UPDATE_ENV',
                  3,
                  $getUrlParams().projectId,
                ) &&
                  $authFunction(
                    'FUNC_APIDOC_ADD_ENV',
                    3,
                    $getUrlParams().projectId,
                  )
              "
              class="mb10 mt10"
            >
              Header
            </div>
            <el-button
              v-show="
                $authFunction(
                  'FUNC_APIDOC_UPDATE_ENV',
                  3,
                  $getUrlParams().projectId,
                ) &&
                  $authFunction(
                    'FUNC_APIDOC_ADD_ENV',
                    3,
                    $getUrlParams().projectId,
                  )
              "
              type="primary"
              @click="handleHeaderChange()"
              ><i class="el-icon-plus"></i>{{ $t('添加') }}</el-button
            >
            <div
              v-for="(item, $index) in envItem.headers"
              :key="$index"
              class="mt15"
            >
              <el-autocomplete
                v-model="item.name"
                class="inline-input"
                :fetch-suggestions="querySearch"
                :placeholder="$t('请输入内容')"
                style="width: 180px"
              ></el-autocomplete>
              <!--<el-select  style="width:180px;" v-model="item.name" @change="handleHeaderChange(envItem.headers,$index)">-->
              <!--<el-option v-for="item in headerList" :key="item.key" :label="item.label" :value="item.value"></el-option>-->
              <!--</el-select>-->
              <el-input
                v-model="item.value"
                :placeholder="$t('请输入参数')"
                style="width:180px"
              ></el-input>
              <i
                class="el-icon-delete cursor-pointer"
                style="margin-right: 20px"
                @click="deleteHeaderBtn($index)"
              ></i>
            </div>
          </div>
          <div class="data-left m10" style="width:90%;">
            <div
              v-show="
                $authFunction(
                  'FUNC_APIDOC_UPDATE_ENV',
                  3,
                  $getUrlParams().projectId,
                ) &&
                  $authFunction(
                    'FUNC_APIDOC_ADD_ENV',
                    3,
                    $getUrlParams().projectId,
                  )
              "
              class="mb10 mt10"
            >
              Cookie
            </div>
            <el-button
              v-show="
                $authFunction(
                  'FUNC_APIDOC_UPDATE_ENV',
                  3,
                  $getUrlParams().projectId,
                ) &&
                  $authFunction(
                    'FUNC_APIDOC_ADD_ENV',
                    3,
                    $getUrlParams().projectId,
                  )
              "
              type="primary"
              @click="handleCookieEvent()"
              ><i class="el-icon-plus"></i>{{ $t('添加') }}</el-button
            >
            <div
              v-for="(item, $index) in envItem.cookies"
              :key="$index"
              class="mt15"
            >
              <el-input
                v-model="item.name"
                :placeholder="$t('请输入参数')"
                style="width:180px;"
              ></el-input>
              <el-input
                v-model="item.value"
                :placeholder="$t('请输入参数')"
                style="width:180px;"
              ></el-input>
              <i
                class="el-icon-delete cursor-pointer"
                style="margin-right: 20px"
                @click="deleteCookiesBtn($index)"
              ></i>
            </div>
          </div>
          <!--<div class="data-left m10" style="width:80%;">-->
          <!--<div class="mb10 mt10">global：</div>-->
          <!--<div v-for="(item,$index) in addglobalList" :key="$index" class="mt15">-->
          <!--<el-input v-model="item.name" placeholder="请输入参数" style="width:180px;" @change='handleglobalEvent(item)'></el-input>-->
          <!--<el-input v-model="item.value" placeholder="请输入参数" style="width:50%;" class="fr"></el-input>-->
          <!--</div>-->
          <!--</div>-->
        </div>
        <!-- 保存 -->
        <div style="text-align: center;margin-top: 50px">
          <el-button
            v-show="
              $authFunction(
                'FUNC_APIDOC_UPDATE_ENV',
                3,
                $getUrlParams().projectId,
              ) &&
                $authFunction(
                  'FUNC_APIDOC_ADD_ENV',
                  3,
                  $getUrlParams().projectId,
                )
            "
            type="primary"
            @click="saveBtn"
            >{{ $t('保存') }}</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { mapState, mapMutations } from 'vuex'
// import TableList from "./fileTableList.vue";
// import fileDateil from "./fileDateil.vue";
import apiDoc from '@/service/file'
export default {
  name: 'FileList',
  //mixins: [ProjectCommonMixin],
  props: {
    contentTop: {
      type: Number,
      default: 100,
    },
  },
  data() {
    return {
      list: [],
      listIndex: 0,
      protocol: 'http://',
      domain: '',
      isCollapse: '',
      domainrlList: [
        { key: 'http://', value: 'http://' },
        { key: 'https://', value: 'https://' },
      ],

      headerList: [
        { key: 'Accept', value: 'Accept', label: 'Accept' },
        {
          key: 'Accept-Charset',
          value: 'Accept-Charset',
          label: 'Accept-Charset',
        },
      ],

      apiClassId: 0,
      envItem: { headers: [], cookies: [] },
    }
  },
  computed: {
    ...mapState({
      detailShow: state => state.fe.detailShow,
      interfaceUrlList: state => state.fe.interfaceUrlList,
      headerRequireList: state => state.fe.headerRequireList,
      hideSetTab: state => state.fe.hideSetTab,
    }),
  },

  mounted() {
    this.apiClassId = this.$getUrlParams().apiClassId
    this.getEnvById()
  },
  methods: {
    ...mapMutations(['filePageSwitch', 'fileApiTypeId', 'fileApiId']),
    //初始化
    initList() {},
    //设置跳转
    handleRadioChange(data) {
      this.isCollapse = data
      if (this.isCollapse == i18n.t('设置')) {
        this.fileApiTypeId(0)
        this.fileApiId(-1)
        this.$router.push({
          query: {
            projectId: this.$getUrlParams().projectId,
            apiClassId: this.$getUrlParams().apiClassId,
            isCollapse: 2,
          },
        })
      } else {
        this.filePageSwitch(true)
        this.$router.push({
          query: {
            projectId: this.$getUrlParams().projectId,
            apiClassId: this.$getUrlParams().apiClassId,
          },
        })

        this.$emit('setValue', data)
      }
    },
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

    getEnvById() {
      apiDoc.getClassEnv({ apiClassId: this.apiClassId }).then(res => {
        this.list = res.data
        // this.getClassEnvFun(res.data)
        if (this.list) {
          this.list.push({
            envId: '',
            apiClassId: this.apiClassId,
            envName: '',
            envDomain: '',
            headers: [],
            cookies: [],
          })
        }
        this.switchListBtn(this.listIndex)
      })
    },

    //确认添加列表
    addConfirmBtn() {
      this.listIndex = this.list.length
      this.list.push({
        envId: '',
        apiClassId: this.apiClassId,
        envName: '',
        envDomain: '',
        headers: [],
        cookies: [],
      })

      this.envItem = this.list[this.listIndex]
      this.switchListBtn(this.listIndex)
    },
    // 删除列表
    deleteListBtn() {
      this.$confirm(`确定删除该环境？`, {
        confirmButtonText: i18n.t('确定'),
        cancelButtonText: i18n.t('取消'),
        type: 'warning',
      }).then(() => {
        if (this.envItem.envId) {
          apiDoc
            .deleteClassEnv({
              envId: this.envItem.envId,
            })
            .then(res => {
              if (res.status == 200) {
                this.listIndex = 0
                this.getEnvById()
                this.$message({
                  message: i18n.t('修改成功'),
                  type: 'success',
                })
              }
            })
        } else {
          this.list.splice(this.listIndex, 1)
          this.switchListBtn(0)
          this.$message({
            message: i18n.t('修改成功'),
            type: 'success',
          })
        }
      })
    },
    //切换列表
    switchListBtn(index) {
      this.listIndex = index
      this.envItem = this.list[this.listIndex]
      this.protocol = this.envItem.envDomain
        ? this.envItem.envDomain.split('//')[0] + '//'
        : ''
      this.domain = this.envItem.envDomain
        ? this.envItem.envDomain.split('//')[1]
        : ''
    },
    //header切换
    handleHeaderChange() {
      // if (!this.envItem.headers){
      //   this.envItem.headers=[];
      // }
      this.envItem.headers.push({ name: '', value: '' })
    },
    //删除header
    deleteHeaderBtn(index) {
      this.envItem.headers.splice(index, 1)
    },
    //cookie输入
    handleCookieEvent() {
      // if (!this.envItem.cookies){
      //   this.envItem.cookies=[];
      // }
      this.envItem.cookies.push({ name: '', value: '' })
    },

    deleteCookiesBtn(index) {
      this.envItem.cookies.splice(index, 1)
    },
    saveBtn() {
      if (this.envItem.envName == '') {
        this.$message({
          message: i18n.t('环境名称不能为空'),
          type: 'warning',
        })

        return
      }
      this.envItem.envDomain = this.protocol + this.domain
      if (
        this.protocol == '' ||
        this.domain == '' ||
        this.envItem.envDomain == ''
      ) {
        this.$message({
          message: i18n.t('环境域名不能为空'),
          type: 'warning',
        })

        return
      }
      //删除键为空的header
      this.envItem.headers = this.envItem.headers.filter(
        item => item.name !== '',
      )

      //删除键为空的cookie
      this.envItem.cookies = this.envItem.cookies.filter(
        item => item.name !== '',
      )

      if (this.envItem.envId) {
        apiDoc.updateClassEnv(this.envItem).then(res => {
          if (res.status === 200) {
            this.$message({
              message: i18n.t('保存成功'),
              type: 'success',
            })
            this.getEnvById()
            this.$emit('showDailog', { show: false, data: this.envItem })
          }
          // this.$emit('childByValue', this.envItem)
        })
      } else {
        apiDoc.saveClassEnv(this.envItem).then(res => {
          if (res.status === 200) {
            this.$message({
              message: i18n.t('保存成功'),
              type: 'success',
            })

            this.$emit('showDailog', { show: false, data: this.envItem })
            this.getEnvById()
          }
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
  // width: 70%;
  li {
    padding: 10px;
  }
}
.showCheck {
  background: #eef7fe;
  color: $--color-primary;
  border-right: 2px solid $--color-primary;
}
.content-outer-box {
  padding: 0 !important;
}
.file-box {
  position: relative;
  .file-left-box {
    // position: absolute;
    width: 285px;
    min-width: 230px;
    height: 100%;
    overflow: hidden;
    // overflow-y: auto;
    border: 1px solid #f3f4f6;
    .file-left-box-title {
      font-size: 16px;
      padding: 10px;
      overflow: hidden;
      background: #f3f4f6;
    }
    .file-list-box {
      overflow-y: auto;
      height: calc(100% - 88px);
    }
    .file-left-btn-box {
      display: flex;
      .file-left-btn {
        flex: 1;
        height: 50px;
        cursor: pointer;
        font-size: 16px;
        text-align: center;
        line-height: 50px;
        // border-bottom: 1px solid gainsboro;
      }
      .left-btn-grey {
        background: #f3f4f6;
      }
    }
  }
  .file-right-box {
    width: calc(100% - 325px);
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    padding: 0 10px;
    border: 1px solid #f3f4f6;
    .file-right-box-title {
      padding: 10px 0;
      .file-right-box-title-font {
        font-size: 22px;
        font-weight: 500;
        border-left: #3c85d2 4px solid;
      }
    }
  }
}
.file-font-width {
  width: 90px;
  display: inline-block;
  text-align: right;
}
</style>
