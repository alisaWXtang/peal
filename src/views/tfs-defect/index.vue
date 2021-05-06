<template>
  <div class="tfs-defect__container">
    <div class="tfs-defect__title">
      <!-- 选择项目:oppo || realme -->
      <div class="tfs-defect__select">
        <span>{{ $t('集合') }}：</span>
        <co-select v-model="productType" @change="change">
          <co-option label="OPPO" :value="0" />
          <co-option label="realme" :value="1" />
        </co-select>
      </div>
      <!-- 菜单: 缺陷列表 || 看板 -->
      <co-menu
        mode="horizontal"
        :default-active="defaultActive"
        @select="changeView"
      >
        <co-menu-item index="/tfs/defect">{{ $t('缺陷列表') }}</co-menu-item>
        <co-menu-item index="/tfs/kanban">{{ $t('看板') }}</co-menu-item>
      </co-menu>
    </div>
    <router-view class="tfs-defect__content" />
  </div>
</template>
<script>
/**
 * @title tfs缺陷根模块
 * @author wuqian
 * @date 2020.8.5
 * @update 2020.12.25 罗健源
 */

// const countlyNameMap = {
//   '/tfs/defect': 'list',
//   '/tfs/kanban': 'kanban',
// }
import { tfsDefectAction } from '@/store/action-types'
import { tfsDefectMutation } from '@/store/mutation-types'
import TfsDefctEventBus from './eventBus.js'
export default {
  name: 'TfsDefect',
  data() {
    return {
      productType: 0, // oppo 0; realme: 1
    }
  },
  computed: {
    defaultActive() {
      const { meta = {}, path } = this.$route
      return meta.activeMenuPath || path
    },
  },
  watch: {
    '$route.path': {
      handler(path) {
        // 切换路由时添加参数
        let filterInfo = this.$parseRouteQuery()
        filterInfo.productType = this.productType
        this.$updateRouteQuery(filterInfo, { replace: true })
        this.initStore(path)
      },
    },
  },
  created() {
    //进入页面时，将请求模块次数置为0，检查url上是否带有ID
    this.$store.commit('setModuleCount', 0)
    //读取用户上次打开的页面
    this.$store.commit(tfsDefectMutation.UPDATE_TFS_MODE, localStorage.almMode)
    // 读取用户上次选择的集合，从url或者缓存中读取，如果都没有设置默认项目为oppo
    const filterInfo = this.$parseRouteQuery()
    if (filterInfo.productType === undefined) {
      filterInfo.productType = this.productType = localStorage.almProductType
        ? +localStorage.almProductType
        : 0
      this.$updateRouteQuery(filterInfo, { replace: true })
    } else {
      this.productType = filterInfo.productType
    }
    // 用户第一次进入时，缓存数据，防止不触发操作切换导航后，返回alm缺陷列表读取不到缓存
    localStorage.setItem('almMode', this.$route.path)
    localStorage.setItem('almProductType', this.productType)
    //初始化仓库
    this.initStore()
  },
  methods: {
    //初始化仓库
    async initStore() {
      await this.$store.dispatch(
        this.defaultActive === '/tfs/defect'
          ? tfsDefectAction.TFS_DEFECT_LIST_INIT
          : tfsDefectAction.TFS_DEFECT_KANBAN_INIT,
        this.productType,
      )
    },
    //切换路由
    changeView(path) {
      if (this.defaultActive !== path) {
        this.$router.push({ path: path })
        //提交当前激活的路由
        localStorage.setItem('almMode', path)
        this.$store.commit(tfsDefectMutation.UPDATE_TFS_MODE, path)
      }
    },
    //切换项目
    async change(val) {
      localStorage.setItem('almProductType', val)
      this.$updateRouteQuery({ productType: val }, { replace: true })
      await this.initStore()
      //通知更新列表
      TfsDefctEventBus.$emit(
        this.defaultActive === '/tfs/defect'
          ? 'defectChangeInit'
          : 'kanbanChangeInit',
        val,
      )
    },
  },
}
</script>
<style lang="scss" scoped>
.tfs-defect__container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .tfs-defect__title /deep/ {
    display: flex;
    padding-top: 7px;
    background-color: #fff;

    .tfs-defect__select {
      display: flex;
      align-items: center;
      padding: 0 0 0 20px;
      border-bottom: 1px solid #e6e6e6;

      .el-select {
        width: 80px;
        .el-input__inner {
          height: 40px;
          line-height: 40px;
          color: $--color-text-fine;
          border: none;
        }
      }
    }
    .el-menu--horizontal {
      flex: 1;

      .el-menu-item {
        height: 40px;
        line-height: 40px;
        color: $--color-text-regular;
        padding: 0 16px;

        &.is-active {
          color: $--color-primary;
        }
      }
    }
  }

  .tfs-defect__content /deep/ {
    flex-grow: 1;
    height: 0;
    overflow: hidden;

    .two-cols-layout__left {
      width: 300px;
      padding: 16px 24px;
      overflow-y: auto;
      box-sizing: border-box;
      border-right: 1px solid #e6e6e6;
    }

    &.left--hidden .two-cols-layout__left {
      width: 0;
      padding: 0;
      overflow: hidden;
    }

    .two-cols-layout__content {
      margin-left: -12px;
    }
  }
}
</style>
