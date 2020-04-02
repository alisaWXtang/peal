const Home = () => import("@/components/Home");
const Combo = () => import("@/components/Combo");
const SelfSelect = () => import("@/components/Self-selected");
const list = () => import("@/components/list");
const review = () => import("@/components/Review");
const config = () => import("@/components/Config");
const busmain = () => import("@/components/main");
const configCd = () => import("@/components/configCd");
const configC = () => import("@/components/configC");


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
  { path: "/", component: review, meta: { title: "珍珠" } },
  { path: "/config/:id", component: config, meta: { title: "配置管理" },children:[
    {
    path:'configCd',
    component:configCd,
    // name:'conCd'
    },
    {
      path:'configC',
      component:configC,
      // name:'conCd'
      },
] },

];
