<template>
  <div>
    <el-dialog
      :title="$t('选择迭代')"
      :visible.sync="filterInfo.show"
      width="32%"
    >
      <div
        class="report-filter-mask mb15"
        :class="{ 'report-filter-mask-english': $isEnglish() }"
      >
        <span>{{ $t('显示对象') }}：</span>
        <el-checkbox
          v-model="isShowRequire"
          size="medium"
          true-label="1"
          false-label="0"
          >{{ $t('需求') }}</el-checkbox
        >
        <el-checkbox
          v-model="isShowTask"
          size="medium"
          true-label="1"
          false-label="0"
          >{{ $t('任务') }}</el-checkbox
        >
      </div>
      <div
        class="report-filter-mask mb15"
        :class="{ 'report-filter-mask-english': $isEnglish() }"
      >
        <span>{{ $t('选择迭代') }}：</span>
        <sprint-tree-multiple-select
          v-model="sprintValue"
        ></sprint-tree-multiple-select>
      </div>

      <span slot="footer" class="dialog-footer">
        <co-button @click="cancel">取 消</co-button>
        <el-button type="primary" @click="sureBtn">{{ $t('确定') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 报告内容-迭代选择
 * @desc
 * @author panhui
 * @date
 */
import SprintTreeMultipleSelect from '@/components/project/SprintTreeMultipleSelect'
export default {
  name: 'ReportContentSprintChoose',
  components: { SprintTreeMultipleSelect },
  mixins: [],
  props: {
    filterInfo: {
      type: Object,
      required: false,
      desc: i18n.t('添加报告内容相关操作获得的信息'),
    },
  },

  data() {
    return {
      // filterList:[],
      sprintValue: [],
      isShowRequire: '1',
      isShowTask: '0',
    }
  },
  computed: {},
  watch: {
    filterInfo: {
      handler(newVal) {
        if (newVal.choose) {
          this.sprintValue = newVal.data.sprintIds
          this.isShowRequire = newVal.data.isShowRequire + ''
          this.isShowTask = newVal.data.isShowTask + ''
        } else {
          this.sprintValue = []
        }
      },
      deep: true,
    },
  },

  created() {},
  mounted() {
    if (!this.filterInfo.data) {
      return false
    }
    this.sprintValue = this.filterInfo.data.sprintIds
    this.isShowRequire = this.filterInfo.data.isShowRequire + ''
    this.isShowTask = this.filterInfo.data.isShowTask + ''
  },
  methods: {
    cancel() {
      this.filterInfo.show = false
    },
    //确定
    sureBtn() {
      if (this.sprintValue.length == 0) {
        this.$message(i18n.t('请选择迭代选项'))
        return false
      }
      this.filterInfo.show = false
      if (this.filterInfo.choose) {
        this.$emit('sprintChoose', {
          status: 'edit',
          index: this.filterInfo.index,
          data: {
            workTitle: i18n.t('迭代列表'),
            sprintIds: this.sprintValue,
            isShowRequire: parseInt(this.isShowRequire),
            isShowTask: parseInt(this.isShowTask),
          },
        })
      } else {
        this.$emit('sprintChoose', {
          status: 'add',
          data: {
            workTitle: i18n.t('迭代列表'),
            sprintIds: this.sprintValue,
            isShowRequire: parseInt(this.isShowRequire),
            isShowTask: parseInt(this.isShowTask),
          },
        })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.report-filter-mask {
  span {
    display: inline-block;
    width: 78px;
    text-align: end;
  }
}
.report-filter-mask-english span {
  width: 100px;
}
</style>
