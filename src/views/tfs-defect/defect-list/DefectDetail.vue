<template>
  <div class="tfs-defect-detail">
    <el-dialog
      title="缺陷详细信息"
      :visible="visible"
      :close-on-click-modal="false"
      width="50%"
      @close="onClose"
    >
      <el-form class="detail-form" label-width="80px">
        <el-form-item class="title-form-item" label="标题">
          <div class="content">{{ data && data.title }}</div>
        </el-form-item>
        <el-form-item label="具体描述">
          <div
            class="content desc-content"
            :class="{ fullscreen: isFullScreen }"
          >
            <span
              ref="dataContent"
              class="dataContent"
              v-html="data && data.content"
            ></span>
            <i
              class="fullscreen-icon iconfont"
              :class="isFullScreen ? 'icon-tuichuquanping' : 'icon-quanping'"
              @click="onFullscreen"
            ></i>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-link :href="data && data.url" target="_blank" :underline="false">
          <el-button type="primary">查看详情</el-button>
        </el-link>
      </div>
    </el-dialog>
  </div>
</template>
<script>
/**
 * @title 缺陷详细信息组件
 * @author wuqian
 * @date 2020.8.11
 */
export default {
  name: 'DefectDetail',
  props: {
    data: {
      type: Object,
      default: () => {
        return {}
      },
    },
    visible: {
      type: Boolean,
    },
  },
  data() {
    return {
      isFullScreen: false,
    }
  },
  mounted() {
    this.$nextTick(() => {
      const hmtl = document.getElementsByClassName('dataContent')[0]
      const aList = hmtl.querySelectorAll('a')
      aList.forEach(item => {
        item.setAttribute('target', '_black')
      })
    })
  },
  methods: {
    onFullscreen() {
      this.isFullScreen = !this.isFullScreen
    },
    onClose() {
      this.$emit('update:visible', false)
      this.isFullScreen = false
    },
  },
}
</script>
<style lang="scss" scoped>
.tfs-defect-detail {
  .detail-form {
    overflow-y: auto;
    max-height: 450px;
    .title-form-item {
      /deep/ .el-form-item__label {
        line-height: 40px;
      }
    }
    .content {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 5px 20px;
    }
    .desc-content {
      position: relative;
      padding: 20px;
      .fullscreen-icon {
        cursor: pointer;
        position: absolute;
        top: 2px;
        right: 6px;
        font-size: 20px;
      }
    }
    .fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
      z-index: 99999;
      border: 0;
      border-radius: 0;
      background: #fff;
    }
  }
  // .dialog-footer {
  //   text-align: center;
  // }
}
</style>
