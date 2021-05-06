<template>
  <div class="footer-box">
    <div style="margin-bottom: 10px;">
      <el-tooltip
        :content="
          $t(
            `包含分支代码提交记录和工作项代码提交记录（提交代码添加 commitMessage 时，以 '#'' + '工作项 ID' 即可实现关联代码，比如 '#103890'`,
          )
        "
        placement="top-start"
      >
        <i class="el-icon-question"></i>
      </el-tooltip>
      <span>{{ $t('代码提交记录') }}：</span>
    </div>
    <el-radio-group v-if="!hiddeOnlyOneTab" v-model="activeBranchId">
      <el-radio-button
        v-for="item in footerDataFront"
        :key="item.branchInfo.id"
        :label="item.branchInfo.id"
      >
        <ellipsis-block
          class="branch-item-style"
          :value="
            item.branchInfo.developMode === 0
              ? item.branchInfo.originalBranch
              : item.branchInfo.featureBranch
          "
        ></ellipsis-block>
      </el-radio-button>
      <el-radio-button
        v-if="footerDataEnd.length > 0"
        :label="dropDownActiveId"
      >
        <ellipsis-block
          class="branch-item-end-style"
          :value="dropDownActiveOriginalBranch"
        ></ellipsis-block>
        <el-dropdown
          click="branch-item-end-dropdown"
          :show-timeout="0"
          @command="dropDownActiveIdChange"
        >
          <span class="el-dropdown-link">
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="item in footerDataEnd"
              :key="item.branchInfo.id"
              :command="item.branchInfo.id"
              >{{
                item.branchInfo.developMode === 0
                  ? item.branchInfo.originalBranch
                  : item.branchInfo.featureBranch
              }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-radio-button>
    </el-radio-group>
    <branch-commit-new
      :branch-id="activeBranchId"
      :project-id="projectId"
      :work-item-id="workItemId"
      :work-item-type="workItemType"
    ></branch-commit-new>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 代码提交记录查看盒子
 * @desc
 * @author heyunjiang
 * @date 2019.11.22
 */
import BranchCommitNew from './BranchCommitNew'
import { workItemCodeAssociation } from '@/service/code'

export default {
  name: 'FooterBar',
  components: {
    BranchCommitNew,
  },

  mixins: [],
  props: {
    footerData: {
      type: Array,
      required: true,
    },

    projectId: {
      type: [String, Number],
      required: true,
    },

    workItemId: {
      type: [Number, String],
      required: true,
    },

    workItemType: {
      type: [Number, String],
      required: true,
    },
  },

  data() {
    return {
      activeBranchId: null,
      maxRadioBtnNumber: 4, // 最多可以显示多少个 button
      dropDownActiveId: null, // 最右侧的下拉选中 id
      hiddeOnlyOneTab: true, // 如果没有关联分支，是否隐藏工作项提交记录这个 tab
    }
  },
  computed: {
    // 拼接之后的单选数据源
    footerDataReal() {
      return [
        ...this.footerData,
        {
          branchInfo: {
            originalBranch: i18n.t('工作项代码提交记录'),
            developMode: 0,
            id: 'workItem',
          },
        },
      ]
    },
    // 前面显示数据
    footerDataFront() {
      if (this.footerDataReal.length < this.maxRadioBtnNumber) {
        return this.footerDataReal
      }
      return this.footerDataReal.slice(0, this.maxRadioBtnNumber)
    },
    // 下拉可选数据
    footerDataEnd() {
      if (this.footerDataReal.length < this.maxRadioBtnNumber) {
        return []
      }
      return this.footerDataReal.slice(this.maxRadioBtnNumber)
    },
    // 下拉选中的 branch name
    dropDownActiveOriginalBranch() {
      if (!this.dropDownActiveId) {
        return ''
      }
      const result = this.footerDataEnd.find(
        item => item.branchInfo.id === this.dropDownActiveId,
      )

      return result
        ? result.branchInfo.developMode === 0
          ? result.branchInfo.originalBranch
          : result.branchInfo.featureBranch
        : ''
    },
  },

  watch: {
    footerDataReal() {
      if (
        !this.activeBranchId ||
        !this.footerDataReal.find(
          item => item.branchInfo.id === this.activeBranchId,
        )
      ) {
        this.activeBranchId = this.footerDataReal[0].branchInfo.id
      }
      if (this.footerDataReal.length === 1) {
        this.hiddeOnlyOneTab = true
        this.judgeShowWorkItem()
      } else {
        this.hiddeOnlyOneTab = false
      }
    },
    footerDataEnd() {
      if (
        this.footerDataEnd.length > 0 &&
        (!this.dropDownActiveId ||
          !this.footerDataEnd.find(
            item => item.branchInfo.id === this.dropDownActiveId,
          ))
      ) {
        this.dropDownActiveId = this.footerDataEnd[0].branchInfo.id
      }
    },
  },

  created() {},
  mounted() {
    this.computedRadioItemMaxLength()
    window.addEventListener('resize', this.computedRadioItemMaxLength)
  },
  destroyed() {
    window.removeEventListener('resize', this.computedRadioItemMaxLength)
  },
  methods: {
    // 计算最多可以显示多少个 radio button
    computedRadioItemMaxLength() {
      const parentWidth = this.$el.getBoundingClientRect().width - 10
      const radioItemWidth = 172 // 通过下面 .branch-item-style width 计算出来的
      this.maxRadioBtnNumber = Math.floor(parentWidth / radioItemWidth) - 1
    },
    // 下拉菜单选择项
    dropDownActiveIdChange(value) {
      this.dropDownActiveId = value
      this.activeBranchId = value
    },
    // 1. 没有关联分支 2. 没有工作项提交记录，则隐藏 el-radio-group
    async judgeShowWorkItem() {
      const result = await workItemCodeAssociation({
        workItemId: this.workItemId,
        workItemType: this.workItemType,
        pageNum: 1,
        pageSize: 10,
        projectId: +this.projectId,
      })

      if (
        result.status === 200 &&
        result.data &&
        result.data.gitCommits.total > 0
      ) {
        this.hiddeOnlyOneTab = false
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.footer-box {
  padding: 5px;
}
.branch-item-style {
  width: 140px;
  height: 16px;
  line-height: 16px;
}
.branch-item-end-style {
  width: 120px;
  height: 15px;
  line-height: 15px;
  font-size: 12px;
}
.el-dropdown-link {
  position: relative;
  top: -1px;
}
</style>
