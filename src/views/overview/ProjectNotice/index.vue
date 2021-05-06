<template>
  <div class="project-notice-wrap" :class="{ fullscreen: isFullScreen }">
    <div class="overview-header">
      <div class="title">{{ $t('项目公告') }}</div>
      <div v-if="isPowerINfoManage" class="icon-box">
        <i
          v-show="!isFullScreen"
          class="iconfont icon-bianjikapian overview-icon"
          @click="handleClickEdit"
        ></i>
        <i
          v-show="!isEdit"
          class="iconfont fullscreen-icon overview-icon"
          :class="isFullScreen ? 'icon-suoxiao' : 'icon-fangda'"
          @click="onFullscreen"
        ></i>
      </div>
    </div>
    <div
      v-if="contentObj && contentObj.description && $i18n.locale === 'zh'"
      class="sub-title"
    >
      {{ contentObj.createUser }} {{ $t('于') }}
      {{
        contentObj.createTime != contentObj.updateTime
          ? dayjs(contentObj.updateTime).format($t('longDateFormat.LL')) +
            $t(' 更新')
          : dayjs(contentObj.createTime).format($t('longDateFormat.LL')) +
            $t(' 创建')
      }}
    </div>
    <div
      v-if="contentObj && contentObj.description && $i18n.locale === 'en'"
      class="sub-title"
    >
      {{
        contentObj.createTime != contentObj.updateTime
          ? $t(' 更新')
          : $t(' 创建')
      }}
      {{ contentObj.createUser }} {{ $t('于') }}
      {{
        contentObj.createTime != contentObj.updateTime
          ? dayjs(contentObj.updateTime).format($t('longDateFormat.LL'))
          : dayjs(contentObj.createTime).format($t('longDateFormat.LL'))
      }}
    </div>
    <div
      class="public-wrap"
      :class="{ 'mt-13': !(contentObj && contentObj.description) }"
    >
      <div v-show="isEdit" class="edit">
        <tiny-mce
          v-show="isEdit"
          class="tiny-mce-box"
          :value="contentText"
          :min-heigt="250"
          @watch="editNoticeContent($event)"
        ></tiny-mce>
        <div class="footer">
          <co-button @click="cancelEditContent">{{ $t('取消') }}</co-button>
          <co-button type="primary" @click="submitProjectNotice">{{
            $t('确定')
          }}</co-button>
        </div>
      </div>
      <div v-show="!isEdit" class="contents">
        <div
          v-html="(contentObj && contentObj.description) || $t('暂无项目公告')"
        ></div>
      </div>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 项目公告
 * @desc
 * @author wangling
 * @date 2020/04/08
 */
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import CONSTVARLIABLE from '@/store/mutation-types'
import TinyMce from '@/components/tinymce'

export default {
  name: 'ProjectNotice',
  components: { TinyMce },
  mixins: [],
  props: {
    projectId: {
      type: [String, Number],
      required: true,
      default: '',
      desc: '当前项目id',
    },
  },

  data() {
    return {
      contentText: '',
      isFullScreen: false,
    }
  },
  computed: {
    ...mapState({
      isEdit: state => state.projectOverviewNotice.isEdit,
      contentObj: state => state.projectOverviewNotice.noticeObj,
      selectedWorkItemType: state =>
        state.projectOverviewDynamic.projectDynamicInfo.workItemType,
    }),

    // 权限判断
    isPowerINfoManage() {
      return this.$authFunction(
        'FUNC_COOP_PROJECT_OVERVIEW_UPDATE_NOTICE',
        3,
        this.projectId,
      )
    },
  },

  watch: {},
  created() {},
  mounted() {
    this.getProjectNotice()
  },
  methods: {
    onFullscreen() {
      this.isFullScreen = !this.isFullScreen
    },
    editNoticeContent(content) {
      this.contentText = content
    },
    dayjs,
    // 展示编辑框
    handleClickEdit() {
      this.$store.commit(
        CONSTVARLIABLE.UPDATE_PROJECT_NOTICE_EDITSTATUS,
        !this.isEdit,
      )
      this.contentText = this.contentObj?.description || ''
    },
    // 取消编辑
    cancelEditContent() {
      this.$store.commit(CONSTVARLIABLE.UPDATE_PROJECT_NOTICE_EDITSTATUS, false)
    },
    // 获取项目公告
    getProjectNotice() {
      this.$store.dispatch('getProjectNotice', { projectId: this.projectId })
    },
    // 新建 or 更新项目公告
    async submitProjectNotice() {
      let oldVal = this.contentObj?.description ?? ''
      if (this.contentText !== oldVal) {
        let res = await this.$store.dispatch('postUpdateProjectNotice', {
          id: (this.contentObj && this.contentObj.id) || '',
          projectId: this.projectId,
          description: this.contentText,
        })

        if (res.status === 200) {
          this.$message({
            message: res.msg || i18n.t('发布成功'),
            type: 'success',
            duration: 2000,
          })

          this.$store.commit(CONSTVARLIABLE.UPDATE_PROJECT_NOTICE, res.data)
          this.$store.commit(
            CONSTVARLIABLE.UPDATE_PROJECT_NOTICE_EDITSTATUS,
            false,
          )

          this.$store.dispatch('getProjectDynamic', {
            projectId: this.projectId,
            workItemType: this.selectedWorkItemType,
            isQuery: true,
          })
        }
      } else {
        this.$store.commit(
          CONSTVARLIABLE.UPDATE_PROJECT_NOTICE_EDITSTATUS,
          false,
        )
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.fullscreen-icon {
  margin-left: 10px;
  // vertical-align: baseline;
  // cursor: pointer;
  // font-size: 22px;
  // &:hover {
  //   color: #249eef;
  // }
}
.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 15px;
  overflow: auto;
  z-index: 99999;
  background: #fff;
}
.sub-title {
  font-size: 12px;
  color: $--color-text-secondary;
  margin-top: 24px;
}
.contents {
  width: 100%;
  position: relative;
  div {
    word-break: break-all;
    // min-height: 200px;
  }
  /deep/ img {
    max-width: 100%;
  }
}
.tiny-mce-box {
  margin-top: 16px;
}
.edit {
  width: 100%;
  .footer {
    padding-top: 12px;
    text-align: right;
  }
}
.mt-13 {
  margin-top: 13px;
}
.icon-gaixie {
  vertical-align: baseline;
  font-weight: bolder;
  margin-right: 3px;
}
</style>
