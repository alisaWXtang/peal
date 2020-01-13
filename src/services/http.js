import axios from "axios";
import { Notify } from "vant";

axios.baseURL = {};
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.interceptors.request.use((config) => config, (err) => Promise.reject(err));
axios.interceptors.response.use(
  (res) => {
    // 全局统一出错处理
    if (!res.data.ok) {
      if (res.data.errMsg) {
        Notify(res.data.errMsg || "报错了");
      }
      return false;
    }
    return res.data.data;
  },
  (error) => Promise.reject(error.response),
);
export default axios;
