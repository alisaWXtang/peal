<template>
  <div style="margin-top: -6px">
    <p style="margin: 4px 0">
      <span
        class="c-blue cp"
        type="text"
        style="font-size: 14px;"
        @click="assocBranchBtnClick"
        >{{ $t('关联分支') }}</span
      >
    </p>
    <branch-table
      ref="branchTableRef"
      :assoc-branch-dialog-modal-status="assocBranchDialogModalStatus"
      :work-item-id="workItemId"
      :project-id="projectId"
      :footer-data.sync="footerData"
      @showBranchCommits="showBranchCommits"
      @tabRelateditem="tabRelateditem"
    ></branch-table>
    <!-- <code-commit :workItemId="workItemId" :workItemType="workItemType" :projectId="projectId"></code-commit> -->
    <assoc-branch-dialog
      :modal-status.sync="assocBranchDialogModalStatus"
      :work-item-id="workItemId"
      @success="assocBranchSuccess"
    ></assoc-branch-dialog>
    <!-- <branch-commits :modalStatus.sync="BranchCommitsShow"  :branchId="branchId"></branch-commits> -->
    <footer-bar
      :footer-data="footerData"
      :project-id="projectId"
      :work-item-id="workItemId"
      :work-item-type="workItemType"
    ></footer-bar>
  </div>
</template>
<script>
// import { i18n } from '@/i18n'
/**
 * @title 代码分支入口
 * @desc
 * @author heyunjiang
 * @date 2019.11.6
 */

// import CodeCommit from '@/components/code-commit'
import BranchTable from './BranchTable'
import AssocBranchDialog from './AssocBranchDialog'
// import BranchCommits from './BranchCommits'
import FooterBar from './FooterBar'

export default {
  name: 'CodeBranch',
  components: {
    // CodeCommit,
    BranchTable,
    AssocBranchDialog,
    // BranchCommits,
    FooterBar,
  },

  mixins: [],
  props: {
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
      assocBranchDialogModalStatus: false, // 是否打开关联分支选择框
      BranchCommitsShow: false, // 是否展示分支提交记录
      branchId: 0, //分支id
      footerData: [], // 底部 tabs 数据源
    }
  },
  computed: {},
  watch: {
    assocBranchDialogModalStatus() {
      if (this.assocBranchDialogModalStatus === false) {
        this.$emit('tabRelateditem')
      }
    },
  },

  mounted() {},
  methods: {
    // 点击关联分支
    assocBranchBtnClick() {
      this.assocBranchDialogModalStatus = true
    },
    // 点击展示分支提交记录
    showBranchCommits(data) {
      this.BranchCommitsShow = true
      this.branchId = data.branchInfo.id
    },
    // 关联新分支回调函数 - 更新 table 数据
    assocBranchSuccess() {
      this.$refs.branchTableRef.getBranchTableData()
    },
    //解除分支，更新tab分支数量
    tabRelateditem() {
      this.$emit('tabRelateditem')
    },
  },
}
</script>
<style lang="scss" scoped></style>
