<template>
  <div>

    <div class="feedback-content">
        <!--    选择反馈类型-->
        <div class="feedback-select">
          <van-cell-group :border="boderShow">
            <van-cell
              title
              is-link
              :value="typeContent"
              :value-class="isRtl? 'rtl': ''"
              :arrow-direction="isRtl? 'left': ''"
              @click="onClickSelect"
            >
              <template slot="title">
                <span class="custom-title">应用类型：</span>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
    </div>
    <van-popup
      v-model="show"
      class="feedback-pop"
      position="bottom"
      round
      close-icon-position="top-right"
      :style="{ height: '50%','padding-top':'50px',background: isNinghtMode? '#404040' : '#ffffff' }"
      :close-on-click-overlay="false"
      @open="openShowLink"
      @opened="openedShowLink"
      @close="closeShowLink"
    >
        <van-cell class="top-icon">
            <van-icon name="arrow-left" v-show="qidLink" @click="goBack" />
            <van-icon name="cross" @click="closePopup" />
        </van-cell>
      <van-cell-group v-if="showLink" title=""  :border="false" >
        <van-cell
          v-for="(item, index) in typesList"
          :key="index"
          :border="false"
          :title="item.name"
          @click="selectIsLink(item, item.name, item.id)"
        >
            <van-icon name="passed" v-if='!clicked.one' />
            <van-icon name="checked" v-else-if="clicked.one===item.name" />
        </van-cell>
      </van-cell-group>
      <van-cell-group v-if="qidLink" title="" :class="{ qidList: true, rtl: isRtl }" :border="false" :style="{ 'direction': (isRtl?'unset': '') }">
        <van-cell
          v-for="(item, index) in qidList"
          :key="index"
          :border="false"
          :title="item.name"
          @click="selectType(item.id, item.name)"
        >
            <van-icon name="passed" v-if='!clicked.two' />
            <van-icon name="checked" v-else-if="clicked.two===item.name" />
        </van-cell>
      </van-cell-group>
    </van-popup>

  </div>
</template>
<script>
import {
  NavBar,
  Search,
  Cell,
  CellGroup,
  Button,
  ActionSheet,
  Toast,
  Uploader,
  Popup,
  Picker,
  Field,
  Loading,
  RadioGroup,
  Radio,
  Checkbox,
  Skeleton,
  Dialog,
  NoticeBar,
  Icon
} from 'vant'
export default {
 components: {
    [Button.name]: Button,
    [Search.name]: Search,
    [Loading.name]: Loading,
    [NavBar.name]: NavBar,
    [Field.name]: Field,
    [Radio.name]: Radio,
    [Checkbox.name]: Checkbox,
    [Uploader.name]: Uploader,
    [Cell.name]: Cell,
    [Toast.name]: Toast,
    [ActionSheet.name]: ActionSheet,
    [CellGroup.name]: CellGroup,
    [RadioGroup.name]: RadioGroup,
    [Skeleton.name]: Skeleton,
    [Popup.name]: Popup,
    [Picker.name]: Picker,
    [Dialog.Component.name]: Dialog.Component,
    [NoticeBar.name]: NoticeBar,
    [Icon.name]: Icon
  },
  data() {
    return {
        typesList:[
            {
                name:'手表硬件',
                list:[
                    { name:'手表硬件-1',id:18348474 },
                    { name:'手表硬件-2',id:18348474 },
                    { name:'手表硬件-3',id:18348474 },
                ]
            },
            {
                name:'通知相关',
                list:[
                        { name:'通知相关-1',id:18348474 },
                        { name:'通知相关-2',id:18348474 },
                        { name:'通知相关-3',id:18348474 },
                    ]
            },
            {
                name:'手表表盘',
                list:[
                        { name:'手表表盘-1',id:18348474 },
                        { name:'手表表盘-2',id:18348474 },
                        { name:'手表表盘-3',id:18348474 },
                    ]
            },
            {
                name:'小红心'
            },
        ],
      boderShow:false,
      show:false,
      typeContent:'请选泽应用类型',
      qidLink:false,
      showLink:true,
      isRtl:false,
      types: [],
      qidList: [],
      announcement: [],
      dataForm: {
        types: '', // 一级id
        qid: '' // 二级id
      },
      isNinghtMode:false,
      fileList: [
        // { url: 'https://img.yzcdn.cn/vant/cat.jpeg' }
        // Uploader 根据文件后缀来判断是否为图片文件
        // 如果图片 URL 中不包含类型信息，可以添加 isImage 标记来声明
        // { url: 'https://cloud-image', isImage: true }
      ],
      clicked: {
          one: '',
          two: ''
      }, // 点的记录
      active: '',
    }
  },
  created() {
  },
  mounted() {
  },
  computed: {
  },
  methods: {
    onClickRight() {
    },
    onClickLeft(flag) {
    },
    resetSelectType() {
    },
    openShowLink() {
    },
    openedShowLink() {
    },
    closeShowLink() {
    },
    onClickSelect(flag) {
        const {one, two} = this.clicked;
        this.show = true
        if (two) {
            this.qidLink = true
            this.showLink = false
        } else {
            this.showLink = true
        }
    },
    // 选择类型 二级
    selectType(id, name, showLink) {
        this.clicked.two = name;
    },
    // 选择类型下级一级
    selectIsLink(list, name, id) {
        console.log(list);
        this.clicked.two = '';
        this.clicked.one = name;
        if (list.list) {
            this.qidList = list.list;
            this.qidLink = true;
            this.showLink = false;
        } else {
            this.clicked.two = ''
        }
    },
    onSelect(item) {
    },
    onCancel() {
    },
    goBack() {
        this.qidLink = false; //二级显示
        this.showLink = true; //一级显示
    },
    closePopup() {
        this.show = false;
        this.qidLink = false;
        if (this.clicked.two) {
            this.typeContent = `${this.clicked.one}/${this.clicked.two}`;
        } else if (this.clicked.one) {
            this.typeContent = this.clicked.one;
        }
    }
  }
}
</script>

<style scoped lang="scss">

.feedback-pop {
    padding-top: 10px!important;
}
  .feedback-select{
    .van-hairline--top-bottom::after{
      border-top: 0;
    }
  }
  .feedback-content{
    margin-top: 46px;
    padding-bottom: 20px;
  }
  .notice-bar{
    margin: 0 10px 6px;
    padding-top: 8px;
    .announcementText{
      color: #000000;
      opacity: 0.3;
    }
    .volume{
      width: 16px;
      height: 16px;
      margin-right: 8px;
      margin-left: 4px;
    }
  }
  .uploadToast{
    /*background: #2AD181;*/
  }

  .cancelUpload{
    position: fixed;
    left: 50%;
    top: 50%;
    margin: 60px 0 0 -60px;
    width: 120px;
    height: 30px;
    font-size: 14px;
  }
  .success-text{
    padding-top: 50%;
    text-align: center;
  }
  .home-navbar {
      padding-top: 18px;
    .van-nav-bar__arrow {
      color: #05b570;
    }
    .van-hairline--bottom::after{
      border: none;
    }

    .nav-left-label {
      margin-left: 18px;
      color: #000000;
      font-size: 16px;
      font-weight: 700;
    }
    .nav-left-label.homeNull{
      font-size: 14px;
    }

    .van-nav-bar__left {
      .van-nav-bar__text {
        font-size: 16px;
        color: #000;
        font-weight: 700;
      }
    }
    .nav-right-label{
      color: #05b570;
    }

    .red-tip {
      margin-left: 0;
      margin-top: -18px;
      display: inline-block;
      text-align: center;
      background: red;
      color: #fff;
      font-size: 11px;
      height: 12px;
      line-height: 12px;
      border-radius: 4px;
      padding: 2px 6px;
      background-clip: padding-box;
      vertical-align: middle;
      font-style: normal;
    }

  }
  .qs-list h2 {
    text-align: left;
    font-size: 14px;
    padding-left: 20px;
  }

  .reply-con {
    display: flex;
    margin: 20px 0;
    padding: 0 20px;
    &:first-child{
      padding-right: 5px !important;
    }
    .van-cell{
      &::after{
        border: none;
      }
    }
  }

  .upload-wrap{
    .upload-icon{
      width: 60px;
      height: 60px;
    }
  }
  .upload-wrap.rtl{
    margin-right: 14px;
  }

  .reply-upload {
    padding: 0 20px 10px;
    margin-top: 60px;
    .reply-upload-info {
      font-size: 12px;
      color: #cccccc;
    }

    .replay-check {
      font-size: 14px;
    }
  }

  .submit-btn {
    margin: 20px 0 0 0;
    text-align: center;

    button {
      width: 68%;
      border-radius: 10px;
    }
  }
  .success-tips{
    font-size: 16px;
  }

  .isNinghtMode{
    .feedback-content{
      background: #1a1a1a !important;
    }
    .success-tips{
      color: #ffffff;
    }
    /*min-height: 800px;*/
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
    background: #1a1a1a;
    .home-navbar{
      background: #1a1a1a !important;
      .van-nav-bar{
        background: #1a1a1a !important;
        .nav-left-label{
          color: #ffffff !important;
        }
        .homeNull{
          color: #ffffff !important;
        }
      }
      .van-hairline--bottom::after{
        border-color: #1a1a1a !important;
      }
    }
    .qs-list{
      .van-cell{
        background: #1a1a1a !important;
        .custom-title{
          color: #ffffff !important;
        }
        .van-cell__value{
          color: #808180 !important;
        }
      }
      .van-hairline--top-bottom{
        &::after{
          border-color: #888888 !important;
        }
      }
      .reply-upload-info{
        color: #636363 !important;
      }
    }
    .van-popup{
      background: #404040 !important;
      .van-cell{
        background: #404040 !important;
        .van-cell__title{
          color: #ffffff !important;
        }
      }
    }
    .whiteskeleton{
      background: #fff;
      z-index: 2000;
    }
  }
</style>
