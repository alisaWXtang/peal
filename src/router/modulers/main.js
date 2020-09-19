const Home = () => import("@/components/Home");
const Combo = () => import("@/components/Combo");
const SelfSelect = () => import("@/components/Self-selected");
const list = () => import("@/components/list");
const review = () => import("@/components/Review");
const config = () => import("@/components/Config");
const busmain = () => import("@/components/main");
const form = () => import("@/components/form");
const table = () => import("@/components/table");
const cascaderVant = () => import("@/components/cascaderVant");


export default [
  { path: "/home", component: Home, meta: { title: "主页" } },
  { path: "/combo", component: Combo, meta: { title: "套餐" } },
  { path: "/bus", component: busmain, meta: { title: "vue-bus" } },
  {
    path: "/self-selected",
    component: SelfSelect,
    meta: { title: "自选组合" },
  },
  { path: "/list", component: list, meta: { title: "循环" } },
  // { path: "/", component: review, meta: { title: "珍珠" } },
  // { path: "/", component: form, meta: { title: "表单验证" } },
  // { path: "/", component: table, meta: { title: "表单验证" } },
  { path: "/", component: cascaderVant, meta: { title: "cascaderVant" } },
  { path: "/config", component: config, meta: { title: "配置管理" } },

];
