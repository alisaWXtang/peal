<template>
  <div
    v-loading="loading"
    class="detail-content bug-content-box detail-content-show"
    :element-loading-text="$t('拼命加载中')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
  >
    <div v-if="isSlider" class="slide-header">
      <span class="taskinfo-title">{{ baseConfig.title }}</span>
      <div class="slide-header-right">
        <el-button type="text"><url-copy /></el-button>
        <slot name="headerBtns" />
        <el-button
          class="close-slide-btn"
          type="text"
          icon="el-icon-close"
          @click="sliderClose"
        />
      </div>
    </div>
    <el-row :gutter="10" class="detail-content-body">
      <el-col
        :xs="16"
        :sm="16"
        :md="16"
        :lg="16"
        :xl="18"
        style="position: relative"
        class="detail-col-left"
      >
        <div class="detail-content-left">
          <!-- 标题 -->
          <div class="detail-content-header">
            <span
              v-if="statusObject.titleInputShowActiveStatus === 'inactive'"
              class="detail-content-header-id"
            >
              <!-- 解决页面闪一下-1的问题 -->
              #{{ workItemId == -1 ? '' : workItemId }}
            </span>
            <ellipsis-block
              v-if="statusObject.titleInputShowActiveStatus === 'inactive'"
              :value="stashTitle"
              class="editable-field title-input-inactive"
              :class="{ 'title-input-inactive-full': isSlider }"
              @click="
                showActiveStatusControl('titleInputShowActiveStatus', 'active')
              "
            ></ellipsis-block>
            <el-input
              v-show="statusObject.titleInputShowActiveStatus === 'active'"
              ref="titleInput"
              v-model="stashTitle"
              class="title-input-active"
              :placeholder="$t('输入标题')"
              size="large"
              @blur="checkTitleChange('titleInputShowActiveStatus', 'inactive')"
            ></el-input>
            <div v-if="warningStatusTitle" class="warning warning-title">
              {{ $t('标题不能超过') }}{{ $isEnglishDisplaySpace() }}127{{
                $isEnglishDisplaySpace()
              }}{{ $t('个字符') }}！
            </div>
          </div>
          <div class="creat-title">
            <span>{{
              `${detailInfo.display.createUserName}(${detailInfo.data.createUser}) `
            }}</span
            >{{ $t('于') }} <span>{{ detailInfo.display.createTime }}</span
            >&nbsp;{{ $t('创建') }}
          </div>

          <div
            ref="showMorebox"
            class="detail-content-left-content"
            :class="{
              'detail-content-left-content-inactive':
                statusObject.taskDescShowActiveStatus === 'inactive',
              showMore: showMore && isShowmore,
            }"
          >
            <!-- 描述 -->
            <div
              ref="showMoresbox"
              :class="{ 'edit-fullscreen': statusObject.fullScreen }"
            >
              <span
                v-if="editAble"
                class="edit-box-bug-help-btn"
                :class="{
                  'edit-box-bug-help-btn-save-new':
                    statusObject.taskDescShowActiveStatus === 'active',
                }"
                @click="
                  showActiveStatusControl(
                    'taskDescShowActiveStatus',
                    taskDescShowActiveStatusValue,
                  )
                "
                >{{
                  statusObject.taskDescShowActiveStatus === 'inactive'
                    ? $t('编辑描述')
                    : $t('保存')
                }}</span
              >
              <span
                class="edit-box-bug-help-btn"
                :style="{
                  right: $isEnglish()
                    ? '50px'
                    : editAble
                    ? statusObject.taskDescShowActiveStatus === 'active'
                      ? '108px'
                      : '75px'
                    : '20px',
                }"
                @click="fullScreenMethod"
                >{{
                  !statusObject.fullScreen ? $t('全屏') : $t('退出全屏')
                }}</span
              >
              <span
                v-show="statusObject.taskDescShowActiveStatus === 'active'"
                class="edit-box-bug-help-btn-cancel"
                @click="editCancel"
                >{{ $t('取消') }}</span
              >
              <show-larger
                v-show="statusObject.taskDescShowActiveStatus === 'inactive'"
                :value="detailInfo.detail.content"
                :math-rom-id="workItemId"
              ></show-larger>
              <template
                v-if="statusObject.taskDescShowActiveStatus === 'active'"
              >
                <UserInputRestoreTips
                  v-if="workItemId"
                  action-type="edit"
                  :item-type="itemType"
                  :item-id="workItemId"
                  :original-value="detailInfo.detail.content"
                  @restore="restoreContent"
                >
                </UserInputRestoreTips>
                <tiny-mce
                  :min-heigt="minHeight"
                  :value="stashDesc"
                  @watch="editHnadle($event)"
                  @save="
                    showActiveStatusControl(
                      'taskDescShowActiveStatus',
                      taskDescShowActiveStatusValue,
                    )
                  "
                ></tiny-mce>
              </template>
            </div>
          </div>
          <div v-if="showTxtMore && isShowmore" class="textTaskbox">
            <div class="moreText" @click="showMoreBtn">
              -----------&nbsp;{{ $t('展示更多') }}&nbsp;-----------
            </div>
          </div>
        </div>
        <div
          v-if="hideTxtMore && isShowmore"
          class="moreText"
          @click="hideMoreBtn"
        >
          -----------&nbsp;{{ $t('收起更多') }}&nbsp;-----------
        </div>

        <div class="detail-content-left">
          <slot name="leftAdditional"></slot>
        </div>
        <div class="detail-content-footer">
          <slot name="footer"></slot>
        </div>
      </el-col>
      <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="6" class="detail-col-right">
        <slot name="right" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 哥伦布 - 反馈查看基础组件
 * @desc 所有反馈查看，都需要引用这个组件作为基础
 * @author heyunjiang
 * @date 2020.6.23
 */
import {
  Input,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  ButtonGroup,
  Button,
  Row,
  Col,
} from '@heytap/cook-ui'
import TinyMce from '@/components/tinymce'
import ProjectCommonMixin from '@/mixin/ProjectCommonMixin'
import TinymceSaveMixin from '@/mixin/tinymce-save-mixin'
import WorkItemTemplateMixin from '@/mixin/WorkItemTemplateMixin'
import ShowLarger from '@/components/show-larger'
import UrlCopy from '@/components/url-copy'
import UserInputRestoreTips from '@/components/user-input-restore-tips'
import { setEditItemUserInputCache, getItemUserInputCache } from '@/utils/help'
import { removeFragmentSpace } from '@/utils'

export default {
  name: 'BaseDisplay',
  components: {
    [Input.name]: Input,
    [Dropdown.name]: Dropdown,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [ButtonGroup.name]: ButtonGroup,
    [Button.name]: Button,
    [Row.name]: Row,
    [Col.name]: Col,
    UserInputRestoreTips,
    TinyMce,
    ShowLarger,
    UrlCopy,
  },

  mixins: [ProjectCommonMixin, TinymceSaveMixin, WorkItemTemplateMixin],
  props: {
    detailInfo: {
      type: Object,
      required: true,
      desc: i18n.t('反馈详情'),
    },

    loading: {
      type: Boolean,
      required: false,
      default: false,
      desc: '组件 loading',
    },

    isShowmore: {
      type: Boolean,
      required: false,
      desc: i18n.t('是否需要展示更多功能'),
      default: false,
    },

    baseConfig: {
      type: Object,
      required: false,
      desc: i18n.t('常量配置'),
      default: () => {
        return {
          title: i18n.t('反馈详情'),
        }
      },
    },

    isSlider: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  data() {
    return {
      statusObject: {
        titleInputShowActiveStatus: 'inactive', // 标题是否编辑
        taskDescShowActiveStatus: 'inactive', // 描述是否编辑
        fullScreen: false, //全屏
      },
      stashTitle: '', // 当前编辑的标题
      stashDesc: '', // 当前编辑的描述
      minHeight: null, // 编辑框的初始高度

      showMore: false, // 展示更多
      showTxtMore: true, // 展示更多文字
      hideTxtMore: false, // 关闭展示更多文字
    }
  },

  computed: {
    // 是否可以编辑
    editAble() {
      return this.detailInfo.detail.editAble
    },
    workItemId() {
      return this.detailInfo.detail.id
    },
    // 警告状态-标题
    warningStatusTitle: function() {
      return (
        this.stashTitle.length > 127 &&
        this.statusObject.titleInputShowActiveStatus === 'active'
      )
    },
    // 反馈类型英文名
    itemType() {
      return 'feedback'
    },
    // 任务描述状态控制
    taskDescShowActiveStatusValue: function() {
      return this.statusObject.taskDescShowActiveStatus === 'inactive'
        ? 'active'
        : 'inactive'
    },
  },
  filters: {
    // 在英语界面下，时间在前，日期在后
    formatDateByEnglish(value) {
      let dateArr = value.split(' ') || []
      return dateArr.length === 2 ? `${dateArr[1]} ${dateArr[0]}` : value
    },
  },
  watch: {
    // 重置标题、描述
    detailInfo(newval, oldval) {
      if (newval?.detail?.id !== oldval?.detail?.id) {
        this.statusObject.taskDescShowActiveStatus = 'inactive'
      }
      this.resetInput()
      if (
        this.statusObject.taskDescShowActiveStatus === 'active' &&
        this.isDirty
      ) {
        this.setUserInputCache(oldval.detail.id)
      }
      // 当数据变化的时候，需要重新计算一次高度
      this.isShowmore && this.boxShowmore()
    },
    // 全屏控制 - slider box 滚动控制，用以去除滚动条
    statusObject: {
      handler(newInfo) {
        if (newInfo.fullScreen) {
          document.getElementById('contentBox').style.overflowY = 'hidden'
        } else {
          document.getElementById('contentBox').style.overflowY = ''
        }
      },
      deep: true,
    },
  },

  created() {
    window.addEventListener('beforeunload', this.pageUnloadHandler)
  },
  mounted() {
    this.resetInput()
    this.isShowmore && this.boxShowmore()
  },
  beforeDestroy() {
    this.pageUnloadHandler()
  },
  methods: {
    // http 错误统一处理
    httpErrorHandle(param) {
      this.$message({ message: param, type: 'error' })
    },
    // 反馈信息更新接口
    updateField(...args) {
      this.$emit('updateField', ...args)
    },
    // 重置标题、描述
    resetInput() {
      // 标题失去焦点之后就会更新
      this.stashTitle = this.detailInfo.detail.title
      // 描述如果在编辑状态，则不更新
      if (this.statusObject.taskDescShowActiveStatus === 'inactive') {
        this.stashDesc = this.detailInfo.detail.content
      }
    },
    // 标题、描述状态控制，更新标题、描述内容
    showActiveStatusControl(key, value) {
      if (!this.editAble) {
        return
      }
      this.statusObject[key] = value
      if (value === 'active') {
        switch (key) {
          case 'titleInputShowActiveStatus':
            this.$nextTick(function() {
              this.$refs.titleInput.focus()
            })
            break // 标题聚焦
          case 'taskDescShowActiveStatus':
            if (this.workItemType == 1) {
              this.sprintLock()
            }
            if (this.isShowmore) {
              this.showMore = false
              this.showTxtMore = false
              this.hideTxtMore = false
            }
            this.resetDirtyTag()
            break
        }
      }
      if (value === 'inactive') {
        // 更新数据
        switch (key) {
          case 'titleInputShowActiveStatus':
            this.updateField('title', this.stashTitle)
            break
          case 'taskDescShowActiveStatus':
            this.clearUserInputCache()
            this.updateField('content', this.stashDesc)
            break
        }
      }
    },
    // 标题变化检测
    checkTitleChange(key, value) {
      // 不能为空检测
      if (this.stashTitle.trim().length < 1) {
        this.httpErrorHandle(i18n.t('标题不能为空'))
        this.stashTitle = this.detailInfo.detail.title
        return false
      }
      // 没有改变检测
      if (this.stashTitle !== this.detailInfo.detail.title) {
        this.showActiveStatusControl(key, value)
      } else {
        this.statusObject[key] = value
      }
    },
    //是否全屏
    fullScreenMethod() {
      this.statusObject.fullScreen = !this.statusObject.fullScreen
      if (this.statusObject.fullScreen) {
        this.minHeight = document.documentElement.clientHeight
      } else {
        this.minHeight = null
      }
      // 由于富文本编辑器只在created时初始化，这样会影响富文本的高度变化，
      // 解决富文本只初始化一次
      if (this.statusObject.taskDescShowActiveStatus === 'active') {
        this.statusObject.taskDescShowActiveStatus = 'inactive'
        this.$nextTick(() => {
          this.statusObject.taskDescShowActiveStatus = 'active'
        })
      }
    },
    // 编辑器监听
    editHnadle(data) {
      this.stashDesc = data
      // 如果编辑了缓存，下次编辑时将内容改变为与原始内容相同，则不显示缓存信息
      const removeSpaceData = removeFragmentSpace(data)
      const removeOrigianlSpaceData = removeFragmentSpace(
        this.detailInfo.detail.content,
      )

      const chacheContent = getItemUserInputCache({
        actionType: 'edit',
        itemId: this.workItemId,
        itemType: this.itemType,
      })

      if (removeSpaceData === removeOrigianlSpaceData && chacheContent) {
        this.clearUserInputCache()
      }
      if (removeSpaceData !== removeOrigianlSpaceData) {
        this.addDirtyTag()
        this.saveTinymceContent({
          value: data,
          id: this.workItemId,
          type: this.itemType, // 需求、任务、缺陷
          isNew: false,
        })
      } else {
        this.resetDirtyTag()
      }
    },
    // 编辑器点击取消
    editCancel() {
      this.stashDesc = this.detailInfo.detail.content
      this.statusObject.taskDescShowActiveStatus = 'inactive'
      this.isShowmore && this.boxShowmore()
    },
    /* 展示更多 */
    // 展示更多
    showMoreBtn() {
      this.showMore = false
      this.showTxtMore = false
      this.hideTxtMore = true
    },
    // 收起更多
    hideMoreBtn() {
      this.showMore = true
      this.showTxtMore = true
      this.hideTxtMore = false
    },
    // 判断更多的盒子高度
    boxShowmore() {
      setTimeout(() => {
        let boxHeight =
          this.$refs.showMorebox && this.$refs.showMorebox.offsetHeight
        let boxsHeight =
          this.$refs.showMorebox && this.$refs.showMoresbox.offsetHeight
        this.showTxtMore = false
        this.showMore = false
        if (boxsHeight > boxHeight) {
          this.showTxtMore = true
          this.showMore = true
          this.hideTxtMore = false
        } else if (boxHeight > 349) {
          //this.hideTxtMore = true;
          this.showTxtMore = true
          this.showMore = true
          this.hideTxtMore = false
        }
        if (boxsHeight < 349) {
          this.hideTxtMore = false
        }
      }, 300)
    },
    /* 缓存 */
    addDirtyTag() {
      this.isDirty = true
    },
    resetDirtyTag() {
      this.isDirty = false
    },
    pageUnloadHandler() {
      this.setUserInputCache()
      window.removeEventListener('beforeunload', this.pageUnloadHandler)
    },
    // 关闭时验证是否需要保存内容，兼容直接切换整个详情
    setUserInputCache(id) {
      this.isDirty &&
        setEditItemUserInputCache(
          this.itemType,
          {
            content: this.stashDesc,
          },

          id || this.workItemId,
        )

      this.resetDirtyTag()
    },
    restoreContent(value) {
      this.stashDesc = value.content
    },
    clearUserInputCache() {
      this.resetDirtyTag()
      setEditItemUserInputCache(this.itemType, null, this.workItemId)
    },
    // 点击关闭按钮
    sliderClose() {
      if (this.stashDesc !== this.detailInfo.detail.content) {
        this.setUserInputCache()
      }
      this.removeTinymceContent(this.workItemId)
      this.$emit('HandleSide')
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/project/ProjectCommon.scss';
@import '@/style/mixin';
.edit-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background-color: white;
  z-index: 99999;
}
/deep/ .basic-title-input-active .el-input__inner {
  height: 26px;
  line-height: 26px;
}
.showMore {
  height: 349px;
  overflow: hidden;
  border-radius: 5px;
  padding: 0 1px;
}
.moreText {
  text-align: center;
  cursor: pointer;
  color: $--color-text-regular;
  width: 100%;
  font-weight: bold;
  opacity: 0.6;
  background: $--background-gray;
  line-height: 40px;
}
.textTaskbox {
  position: absolute;
  width: 100%;
  background: rgba(218, 210, 210, 0.5);
  bottom: 0;
  height: 40px;
  line-height: 40px;
}
.edit-box-bug-help-btn {
  z-index: 999;
  top: 8px !important;
}
</style>
