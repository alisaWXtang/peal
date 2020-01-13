<template>
  <div id="list">
    <section class="cat-menu">
      <h5>行业:</h5>
      <ul class="cat-item-list">
        <li
          v-for="(item,index) in typeList"
          :class="typeIndex == index?'activeStyle':''"
          @click="changeActive('1',index)"
          :key="index"
        >{{item}}</li>
      </ul>
    </section>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      typeList: ["全部", "旅游", "旅游", "旅游"],
    };
  },
  methods: {
    changeActive(source, index) {
      if (source == "1") {
        if (index != this.typeIndex) {
          this.getAllList(this.typeList[index]);
        }
        this.typeIndex = index;
      } else if (source == "2") {
        if (index != this.sizeIndex) {
          this.getAllList(this.sizeList[index]);
        }
        this.sizeIndex = index;
      } else if (source == "3") {
        if (index != this.specialIndex) {
          this.getAllList(this.specialList[index]);
        }
        this.specialIndex = index;
      }
    },
  },
};
</script>

<style scoped>
.activeStyle {
  color: #fff;
  background: #00cc99;
  border: none;
}
</style>
