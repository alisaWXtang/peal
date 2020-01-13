import Vue from "vue";
import VueRouter from "vue-router";
import main from "./modulers/main";

Vue.use(VueRouter);

const routes = [...main];

const router = new VueRouter({
  routes,
});

router.afterEach((route) => {
  let documentTitle = "社会保险";
  route.matched.forEach((path) => {
    if (path.meta.title) {
      documentTitle = ` ${path.meta.title}`;
    }
  });
  document.title = documentTitle;
});
export default router;
