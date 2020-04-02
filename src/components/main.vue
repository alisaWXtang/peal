<template>
<div>
  <Btpl/>
  <Ctpl/>
</div>
</template>
<script>
export default {
  name: 'TestBaiDu',
  components: {
    Btpl: () => import("@/components/B"),
    Ctpl: () => import("@/components/C"),
  },
};
</script>
