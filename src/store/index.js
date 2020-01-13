import Vue from "vue";
import Vuex from "vuex";
import global from "./modulers/for-social";

Vue.use(Vuex);
export default new Vuex.Store({
  modules: { global },
});
