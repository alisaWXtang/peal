<template>
  <el-dialog
    class="new-statement-dialog"
    :title="$t('新建报表')"
    :visible.sync="dialogVisible"
    width="800"
  >
    <div class="container">
      <div class="sidebar">
        <el-menu :default-active="activeIndex" @select="handleSelect">
          <el-menu-item index="1">{{ $t('自定义报表') }}</el-menu-item>
          <el-menu-item index="2">{{ $t('工作项属性分布报表') }}</el-menu-item>
          <el-menu-item index="3">{{
            $t('工作项属性分布比较报表')
          }}</el-menu-item>
          <el-menu-item index="4">{{ $t('新增工作项趋势报表') }}</el-menu-item>
          <el-menu-item index="5">{{ $t('工作项累计趋势报表') }}</el-menu-item>
          <el-menu-item index="6">{{
            $t('工作项属性分布趋势报表')
          }}</el-menu-item>
        </el-menu>
      </div>
      <div class="content">
        <div class="card-item" @click="handleCreate">
          <div class="title">{{ $t('自定义报表') }}</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { i18n } from '@/i18n'
/**
 * @title 新建报表dialog
 * @author chenxiaolong
 * @time 2020.7.2
 */
export default {
  name: 'NewStatementDialog',
  props: {
    show: {
      required: true,
      type: Boolean,
      desc: i18n.t('是否显示'),
    },

    workItemType: {
      required: true,
      type: [Number, String],
      desc: '报表类型 1=>需求 2=>任务 3=>缺陷',
    },
  },

  data() {
    return {
      activeIndex: '1',
      projectId: this.$route.query.projectId,
    }
  },
  computed: {
    dialogVisible: {
      get: function() {
        return this.show
      },
      set: function(val) {
        this.$emit('update:show', val)
      },
    },
  },

  methods: {
    handleSelect(val) {
      console.log(val)
    },
    handleCreate() {
      this.dialogVisible = false
      this.$router.push({
        path: '/statement/StatementEditor',
        query: { projectId: this.projectId, workItemType: this.workItemType },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.new-statement-dialog {
  /deep/ .el-dialog {
    padding: 16px 0 0 0;

    .el-dialog__header {
      padding: 0 24px 16px 24px;
    }

    .el-dialog__body {
      padding: 0;
    }
  }
}
.container {
  display: flex;
  position: relative;
  align-items: flex-start;

  .sidebar {
    height: 460px;
    border-right: 1px solid #dde5ef;
    overflow-y: auto;
    flex: 0 0 200px;

    ul {
      border: none;

      li {
        margin: 0;
        border-radius: 0;
        height: 48px;
        line-height: 48px;

        &.is-active::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 2px;
          background-color: #409eff;
        }
      }
    }
  }

  .content {
    flex: 1 1 auto;
    padding: 16px;
    height: 460px;
    overflow-y: auto;
    box-sizing: border-box;

    .card-item {
      display: inline-block;
      box-sizing: border-box;
      margin-right: 10px;
      margin-bottom: 10px;
      padding: 16px;
      height: 100px;
      width: 180px;
      font-size: 0;
      color: #fff;
      cursor: pointer;
      background: linear-gradient(to right, #00b09b, #96c93d);
      border: 1px solid #ccc;
      border-radius: 4px;
      transition: 0.3s all ease;

      &:hover {
        box-shadow: 0 26px 40px -24px rgba(0, 36, 100, 0.3);
        transition: 0.3s all ease;
      }

      .title {
        font-size: 14px;
        font-weight: bold;
      }
    }
  }
}
</style>
