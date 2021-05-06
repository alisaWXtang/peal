<template>
  <div class="auth-page">
    <div class="content clearfix">
      <div class="left">
        <i class="iconfont icon-lock"></i>
      </div>
      <div class="right">
        <div class="item">{{ tips }}</div>
        <div v-if="showReturnBtn" class="item">
          {{ $t('请点击') }}
          <router-link to="/project/list">{{
            $t('返回项目列表页')
          }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { guide } from '@/store/mutation-types'
import { getprojectDemo } from '@/service/project'

const PageTypeEnum = {
  noAuth: 'noAuth', // 无权限
  deleted: 'deleted', // 已删除
  noAuth_tfs: 'noAuth_tfs', // tfs无权限
}
export default {
  name: 'NoAuthPage',
  data() {
    return {
      projectName: '', // 项目名
      users: '', // 管理员
      type: '', // 权限页面类型
      msg: '',
    }
  },
  computed: {
    ...mapState({
      noAuthData: state => state.noAuthData,
    }),
    // 是否展示返回按钮
    showReturnBtn() {
      return this.type !== 'noAuth_tfs'
    },
    tips() {
      const tipsMap = {
        noAuth: {
          // 项目级无权限
          en: `You are not a member of project [${this.projectName}] and have no access to the resource. Contact following people [${this.users}] to add you to the project`,
          zh: `抱歉，您不在项目【${this.projectName}】中，无权限访问该资源，请联系以下人员将您添加进项目中：${this.users}。`,
        },
        noAuth_tfs: {
          // tfs无权限
          en: this.msg,
          zh: this.msg,
        },
        deleted: {
          //  已删除
          en: `Project [${this.projectName}] has been deleted by ${this.users}.`,
          zh: `抱歉，项目（${this.projectName}）已被${this.users}删除，无法访问。`,
        },
        system: {
          en: `Sorry, system permissions are not in effect.`,
          zh: `抱歉，系统权限暂未生效，请返回首页。`,
        },
      }
      const typeEnumKeys = Object.keys(PageTypeEnum)
      const type = typeEnumKeys.includes(this.type) ? this.type : 'system'
      return tipsMap[type][this.$i18n.locale]
    },
  },

  created() {
    const { type } = this.noAuthData

    if (type) {
      this.parseStorageResonse()
    } else {
      this.$router.replace('/project/list')
    }
  },
  mounted() {
    // 如果存在缓存的用于引导的项目id 则重置为null
    if (this.$store.state.guide.projectId) {
      getprojectDemo().then(res => {
        if (res.data) {
          this.$store.commit(guide.UPDATE_GUIDE_PROJECT_ID, res.data.id)
        } else {
          this.$store.commit(guide.UPDATE_GUIDE_PROJECT_ID, null)
        }
      })
    }
  },
  methods: {
    parseStorageResonse() {
      const { type, data } = this.noAuthData
      const { ext, msg } = data || {}

      this.projectName = ext?.projectName
      this.type = type
      // 解析无权限相关 user
      if (this.type === PageTypeEnum.noAuth) {
        let usersStr = ''
        ext?.users &&
          ext.users.map(item => {
            usersStr += `${item.userName}(${item.userId})， `
          })
        this.users = usersStr.slice(0, -2)
        return
      }
      // 解析已删除相关user
      if (this.type === PageTypeEnum.deleted) {
        this.users = ext
          ? `${ext?.opUser?.userName}（${ext?.opUser?.userId}）`
          : ''
        return
      }
      // 解析无权限提示信息
      this.msg = ext || msg
    },
  },
}
</script>

<style lang="scss" scoped>
.icon-lock {
  font-size: 40px;
}
.auth-page {
  width: 100%;
  .content {
    margin-top: 300px;
    text-align: left;
    display: flex;
    justify-content: center;
    .left {
      width: 50px;
      height: 65px;
    }
    .right {
      height: 65px;
      .item {
        margin: 10px 0;
      }
    }
  }
}
</style>
