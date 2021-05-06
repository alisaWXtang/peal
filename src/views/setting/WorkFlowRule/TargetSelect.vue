<template>
  <div style="font-size:15px;">
    <span class="state-title">{{ $t('流转目标状态') }}:</span>
    <span class="status-name">{{ currentRuleName }}</span>
    <!-- <el-select v-model="ruleName" placeholder="请选择">
      <el-option v-for="item in defs" :key="item.statusId" :label="item.name" :value="item.name"></el-option>
    </el-select>-->
  </div>
</template>
<script>
// import { i18n } from '@/i18n'
/**
 * @title 流转目标状态
 * @desc
 * @author wangling
 * @date
 */
export default {
  name: 'TargetSelect',
  components: {},
  mixins: [],
  props: {
    defs: {
      type: Array,
      required: true,
      desc: '工作流 table',
    },

    currentRuleName: {
      type: String,
      required: true,
      desc: '当前正在编辑的规则名字',
    },
  },

  data() {
    return {
      ruleName: '',
    }
  },
  computed: {},
  watch: {
    currentRuleName: {
      handler(name) {
        this.ruleName = name
      },
      immediate: true,
    },

    ruleName(name) {
      this.$emit('changeRuleName', name)
    },
  },

  created() {},
  methods: {},
}
</script>
<style lang="scss" scoped>
.status-name {
  font-weight: 700;
}
.state-title {
  font-weight: 700;
  font-style: 18px;
}
</style>
