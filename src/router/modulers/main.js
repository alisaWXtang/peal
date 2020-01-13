const Home = () => import("@/components/Home");
const Combo = () => import("@/components/Combo");
const SelfSelect = () => import("@/components/Self-selected");
const list = () => import("@/components/list");
const review = () => import("@/components/Review");

export default [
  { path: "/home", component: Home, meta: { title: "主页" } },
  { path: "/combo", component: Combo, meta: { title: "套餐" } },
  {
    path: "/self-selected",
    component: SelfSelect,
    meta: { title: "自选组合" },
  },
  { path: "/list", component: list, meta: { title: "循环" } },
  { path: "/", component: review, meta: { title: "珍珠" } },

];
