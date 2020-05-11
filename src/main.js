import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import "vant/lib/index.css";
import "amfe-flexible/index.js";
import socialAjax from "./services/social-ajax";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/aliFont/iconfont.css';
import VueAwesomeSwiper from 'vue-awesome-swiper';
import 'swiper/css/swiper.css';


Vue.use(VueAwesomeSwiper /* { default options with global component } */);
Vue.use(ElementUI);
Vue.config.productionTip = false;
Vue.prototype.$ajax = socialAjax;

new Vue({
  render: (h) => h(App),
  store,
  router,
}).$mount("#app");
