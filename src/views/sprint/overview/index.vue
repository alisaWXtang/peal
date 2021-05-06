<template>
  <div class="page-overview">
    <co-card class="box-card">
      <div ref="firstGuideDom" class="title">进度概览</div>
      <progress-overview
        :sprint-info="sprintInfo"
        @delayNumberClick="delayNumberClick"
      />
    </co-card>
    <co-card class="box-card">
      <!--      <div class="title">迭代阶段</div>-->
      <sprint-stage
        :sprint-info="sprintInfo"
        @dateUpdate="dateUpdate"
        @templateUpdate="templateUpdate"
        @changHandleTask="changHandleTask"
        @archivedSuccess="archivedSuccess"
        @delayNumberClick="delayNumberClick"
        @onEditChange="onEditChange"
      />
    </co-card>
    <co-card ref="progressDom" class="box-card big-box">
      <div class="title">
        进度图
      </div>
      <progress-map @sprintBurnPrev="sprintBurnPrev" />
    </co-card>
    <co-card class="box-card">
      <div class="title">
        <AnnotationTooltip icon="co-icon-question-solid">
          <div slot="toolContent">
            <p>
              代码统计：提交代码添加 commitMessage 时，以 '#'' + '工作项 ID'
              即可实现关联代码，比如 '#103890'，且关联的工作项属于该迭代。
            </p>
          </div>
          代码统计
        </AnnotationTooltip>
      </div>
      <code-statistics />
    </co-card>
  </div>
</template>

<script>
import ProgressOverview from './components/ProgressOverview'
import SprintStage from './components/SprintStage'
import CodeStatistics from './components/CodeStatistics'
import ProgressMap from './components/ProgressMap'
import { guide } from '@/store/mutation-types'
import { guideStep, guideType } from '../../../components/guide/guideData'
import AnnotationTooltip from '@/components/annotation-tooltip'
export default {
  name: 'OverviewIndex',
  components: {
    ProgressOverview,
    SprintStage,
    CodeStatistics,
    ProgressMap,
    AnnotationTooltip,
  },
  props: {
    sprintInfo: {
      type: Object,
      required: true,
      desc: '迭代详情展示',
    },
  },
  mounted() {
    this.$bus.$on('G_changeGuideStep', this.changeGuideStep)
    // 避免渲染缓慢定位出错
    setTimeout(() => {
      this.initGuide()
    }, 300)
  },
  beforeDestroy() {
    this.$bus.$off('G_changeGuideStep', this.changeGuideStep)
  },
  methods: {
    sprintBurnPrev() {
      this.$bus.$emit('G_sprintScroll', {
        offsetTop: 0,
      })
      setTimeout(() => {
        this.initGuide()
      }, 100)
    },
    changeGuideStep(item) {
      if (item.guideStep === guideStep.bugCreate) {
        this.$router.push({
          path: '/bug/list',
          query: {
            projectId: this.$getUrlParams().projectId,
            guideType: guideType.bug,
          },
        })
        return
      }
      if (item.guideStep === guideStep.progressOverview) {
        this.$bus.$emit('G_sprintScroll', { offsetTop: 0 })
        setTimeout(() => {
          this.initGuide()
        }, 50)
        return
      }
      if (item.guideStep === guideStep.sprintBurnOut) {
        this.guideToBurnOut()
        return
      }
      if (item.guideStep === guideStep.bugTrack) {
        this.$bus.$emit('G_bugTrack')
        return
      }
    },
    async initGuide() {
      let _this = this
      if (this.$store.state.guide.guideType === guideType.sprintProgress) {
        this.$store.commit(guide.RECOVERY_STEP)
        this.$store.commit(guide.START_GUIDE, {
          guideType: guideType.sprintProgress,
          guideStep: guideStep.progressOverview,
          step: 1,
          steps: {
            1: {
              dom: this.$refs.firstGuideDom,
              nextCallback() {
                // 下一步
                _this.guideToBurnOut()
              },
            },
          },
        })
        return
      }
      if (this.$store.state.guide.guideType === guideType.bug) {
        this.$bus.$emit('G_bugTrack')
        return
      }
    },
    guideToBurnOut() {
      this.$bus.$emit('G_sprintScroll', this.$refs.progressDom)
      setTimeout(() => {
        this.$bus.$emit('G_sprintBurnOut')
      }, 50)
    },
    dateUpdate() {
      this.$emit('getSprintInfo')
    },
    templateUpdate() {
      this.$emit('getSprintInfo')
    },
    changHandleTask() {
      this.$emit('changHandleTask')
    },
    archivedSuccess() {
      this.$emit('onArchivedSuccess')
    },
    delayNumberClick(type) {
      this.$emit('delayNumberClick', type)
    },
    onEditChange(data) {
      this.$emit('onEditChange', data)
    },
  },
}
</script>

<style scoped lang="scss">
.page-overview {
  width: 100%;
  .box-card {
    border: 1px solid $--background-gray;
    box-shadow: 0 2px 8px 0 rgba(12, 37, 77, 0.08);
    border-radius: 4px;
    margin-top: 24px;
    /deep/ .el-card__body {
      padding: 20px;
    }
    &:first-child {
      margin-top: 0;
    }
    .title {
      border-left: 2.5px solid $--color-primary;
      font-family: MicrosoftYaHei;
      font-size: 16px;
      color: #333333;
      padding-left: 12.5px;
      margin-bottom: 32px;
    }
  }
}
</style>
