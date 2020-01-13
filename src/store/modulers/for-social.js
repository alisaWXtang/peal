/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
const state = {
  mockData: [],
};

const getters = {
  getMockData: (state) => state.mockData,
};

const mutations = {
  setMockData(state, res) {
    state.mockData = res;
  },
};

const actions = {
  // eslint-disable-next-line
  userLogOut({ commit }) {
    // todo
  },
};
export default {
  // namespaced: true 激活命名空间
  state,
  mutations,
  actions,
  getters,
};
