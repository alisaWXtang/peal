import axios from "./http";

export default {
  getMockData() {
    return axios.get(
      `https://easy-mock.com/mock/59ab90efe0dc66334199b57b/dataHub/dataGet`,
    );
  },
};
