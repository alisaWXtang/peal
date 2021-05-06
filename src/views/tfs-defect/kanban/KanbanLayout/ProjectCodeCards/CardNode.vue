<template>
  <div class="card-node__container">
    <el-card
      class="box-card"
      :class="{
        'box-card__red':
          cardData.beyondStandard || cardData.blockedProblem.count > 0,
        'mul-box-card': viewModel === 'combination',
      }"
    >
      <div slot="header" class="clearfix project-name">
        <span
          >{{ $t('项目代号')
          }}<span class="project-code" :title="cardData.projectId">{{
            cardData.projectId
          }}</span></span
        >
      </div>
      <div
        class="card-node__content"
        :class="{ 'mul-card-node__content': viewModel === 'combination' }"
      >
        <div>
          <div class="content-item">
            <div class="count-container">
              <span class="count-item"
                >{{ $t('阻塞') }}：<el-link
                  v-if="cardData.blockedProblem.count"
                  class="link"
                  :underline="false"
                  :type="cardData.blockedProblem.linkType || 'primary'"
                  @click="() => $emit('defect-number-click', data, 'block')"
                  >{{ cardData.blockedProblem.count }}</el-link
                >
                <span v-else>{{ cardData.blockedProblem.count }}</span></span
              >
              <span class="count-item"
                >{{ $t('严重') }}：<span
                  :class="{ able: cardData.criticalNum > 0 }"
                  @click="$emit('defect-number-click', data, 'critical')"
                  >{{ cardData.criticalNum || 0 }}</span
                ></span
              >
            </div>
            <div class="count-container">
              <span class="count-item"
                >{{ $t('普通') }}：<span
                  :class="{ able: cardData.majorNum > 0 }"
                  @click="$emit('defect-number-click', data, 'major')"
                  >{{ cardData.majorNum || 0 }}</span
                ></span
              >
              <span class="count-item"
                >{{ $t('轻微') }}：<span
                  :class="{ able: cardData.minorNum > 0 }"
                  @click="$emit('defect-number-click', data, 'minor')"
                  >{{ cardData.minorNum || 0 }}</span
                ></span
              >
            </div>
          </div>
          <div class="content-item">
            {{ $t('当前DI值') }}：
            <el-tooltip
              class="item"
              effect="dark"
              placement="top"
              :open-delay="300"
            >
              <i class="iconfont icon-wenhao"></i>
              <div slot="content">
                {{ $t('当前DI值超过标准DI值的80%时，当前DI值会标红') }}
                <br /><br />{{
                  $t(
                    'DI值=阻塞问题 * 10 + 严重问题 * 3 + 普通问题 * 1 + 轻微问题 * 0.1',
                  )
                }}
                <br /><br />{{
                  $t(
                    '当前DI值=版本前端遗留BUG DI值 + 所有手机项目的通用BUG总和DI值 + 适配测试各个手机项目特性BUG DI值',
                  )
                }}
              </div>
            </el-tooltip>
            <el-tooltip
              v-if="
                isFinite(+cardData.currentDI.count) &&
                  +cardData.currentDI.count > 0
              "
              class="item"
              effect="dark"
              placement="top"
              :open-delay="300"
            >
              <el-link
                class="link"
                :underline="false"
                :type="cardData.currentDI.linkType || 'primary'"
                target="_blank"
                @click="toDefectList('currentDI')"
                >{{ cardData.currentDI.count || 0 }}</el-link
              >
              <div slot="content">{{ getCurrentDiTitle() }}</div>
            </el-tooltip>
            <span v-else>{{ cardData.currentDI.count }}</span>
          </div>
          <div class="content-item">
            {{ $t('标准DI值') }}：{{ cardData.standardDI || 0 }}
          </div>
          <div class="content-item">
            {{ $t('前端遗留DI值') }}：{{ cardData.legacyDi || 0 }}
          </div>
          <div class="content-item">
            {{ $t('去除待验证后DI值') }}：<el-link
              class="link"
              :underline="false"
              :type="'primary'"
              target="_blank"
              @click="toDefectList('lossVerifyCurrentDi')"
              >{{ cardData.lossVerifyCurrentDi || 0 }}</el-link
            >
          </div>
          <div class="content-item">
            {{ $t('当前DI值超过标准值80%的天数') }}：
            <span v-if="cardData.excessP80DIDays === '--'">{{
              cardData.excessP80DIDays
            }}</span>
            <span v-else>{{ cardData.excessP80DIDays }}{{ $t('天') }}</span>
          </div>
          <div class="content-item content-item-last">
            {{ $t('当前DI值超过标准值的天数') }}：
            <span v-if="cardData.excessDIDays === '--'">{{
              cardData.excessDIDays
            }}</span>
            <span v-else>{{ cardData.excessDIDays }}{{ $t('天') }}</span>
          </div>
        </div>
        <div v-if="viewModel === 'combination'" class="chart-container">
          <chart-display
            :data="cardData"
            @chartClick="
              (data, type) => $emit('defect-number-click', data, type)
            "
          ></chart-display>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script>
/**
 * @title 卡片 node
 * @author wuqian
 * @date 2020.9.7
 */
import merge from 'lodash/merge'
import isFinite from 'lodash/isFinite'
import { i18n } from '@/i18n'
import { mapState } from 'vuex'
import ChartDisplay from './ChartDisplay'

const createDefData = () => {
  return {
    beyondStandard: false,
    blockedProblem: {
      count: 0,
      linkType: 'primary',
    },

    currentDI: {
      count: 0,
      linkType: 'primary',
    },

    standardDI: 0,
    excessP80DIDays: '0',
    excessDIDays: '0',
  }
}

export default {
  name: 'CardNode',
  components: {
    ChartDisplay,
  },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      cardData: createDefData(),
    }
  },
  computed: {
    ...mapState({
      viewModel: state => state.tfsKanban.viewModel,
    }),
    // count() {
    //   const { majorNum, minorNum, criticalNum, blockedProblem } = this.cardData
    //   return
    // }
  },
  watch: {
    data(val) {
      this.cardData = merge(createDefData(), val)
    },
  },

  created() {
    this.cardData = merge(createDefData(), this.data)
  },
  methods: {
    isFinite,
    // 跳转到当前项目的tfs缺陷列表
    toDefectList(type) {
      this.$emit('diClick', this.data, type)
    },
    getCurrentDiTitle() {
      return `${i18n.t('前端遗留DI值')}(${this.cardData.legacyDi}) + ${i18n.t(
        '共性问题DI值',
      )}(${this.cardData.commonDi}) + ${i18n.t('特性问题DI值')}(${
        this.cardData.featureDi
      })`
    },
  },
}
</script>
<style lang="scss" scoped>
$type: mul;
.card-node__container {
  display: inline-block;
  margin-right: 16px;
  margin-bottom: 16px;
  .iconfont {
    cursor: pointer;
    font-size: 14px;
  }
}
.project-code {
  font-size: 12px;
  padding-left: 8px;
}
.link {
  vertical-align: baseline;
  pointer-events: auto;
}
.box-card {
  width: 285px;

  .project-name {
    @include no-wrap;
  }

  &.#{$type}-box-card {
    width: 374px;
  }

  .#{$type}-card-node__content {
    display: flex;
    justify-content: space-between;
  }

  border: 1px solid #e5e5e5;
  box-sizing: border-box;
  border-radius: 6px;
  .content-item {
    color: #666;
    word-break: break-all;
    margin-bottom: 14px;

    .count-container {
      margin-bottom: 14px;

      .count-item {
        display: inline-block;
        width: 90px;
        pointer-events: none;

        .able {
          cursor: pointer;
          color: $--color-primary;
          pointer-events: auto;
        }
      }
    }
  }
  .content-item-last {
    margin-bottom: 0;
  }
  /deep/ .el-card__header {
    background: $--color-primary-light-9;
  }
  /deep/ .el-card__header,
  /deep/ .el-card__body {
    padding: 16px;
  }
}
.box-card__red {
  border: 1px solid #ec808d;
  /deep/ .el-card__header {
    background-color: #feedef;
    border-bottom: 1px solid #ec808d;
  }
}
</style>
