<template>
  <div class="empty-box">
    <div class="empty-content">
      <i class="el-icon-bell"></i>{{ $t('恭喜') }}，{{ $t('暂无缺陷') }}，{{
        $t('点击右侧')
      }}
      <code>"{{ $t('新建缺陷') }}"</code>{{ $t('创建一个吧') }}
    </div>
  </div>
</template>
<script>
// import { i18n } from '@/i18n'
/**
 * @title
 * @desc
 * @author heyunjiang
 * @date
 */
export default {
  name: 'EmptyResult',
  components: {},
  mixins: [],
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  methods: {},
}
</script>
<style lang="scss" scoped>
.empty-box {
  width: 100%;
  height: 100%;
  position: relative;
}
.empty-content {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  // display: none;
  display: inline-block;
  width: 400px;
  height: 200px;
  text-align: center;
  // border: 1px solid #ccc;
}
</style>
