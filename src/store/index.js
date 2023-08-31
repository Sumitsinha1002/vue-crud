import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    templateName: "",
    templateStatus: true,
    settings: [],
    selectedProductIds: [],
    applicationData: [],
  },
  mutations: {
    SET_TEMPLATE_NAME(state, data) {
      state.templateName = data;
    },
    SET_SETTINGS(state, data) {
      state.settings = data;
    },
    SET_TEMPLATE_STATUS(state, data) {
      state.templateStatus = data;
    },
    SET_PRODUCT_IDS(state, data) {
      state.selectedProductIds = data;
    },
    SET_APPLICATION_DATA(state, data) {
      state.applicationData = data;
    },
    RESET_STATE(state) {
      Object.assign(state, {
        templateName: "",
        templateStatus: true,
        settings: [],
        selectedProductIds: [],
      });
    },
  },
  actions: {
    setTemplateName({ commit }, data) {
      commit("SET_TEMPLATE_NAME", data);
    },
    setTemplateStatus({ commit }, data) {
      commit("SET_TEMPLATE_STATUS", data);
    },
    setSettings({ commit }, data) {
      commit("SET_SETTINGS", data);
    },
    setProductIds({ commit }, data) {
      commit("SET_PRODUCT_IDS", data);
    },
    setApplicationData({ commit }, data) {
      commit("SET_APPLICATION_DATA", data);
    },
    resetState({ commit }) {
      commit("RESET_STATE");
    },
  },
  getters: {
    getAllTemplateData(state) {
      return {
        templateName: state.templateName,
        templateStatus: state.templateStatus,
        settings: state.settings,
      };
    },
    getSettings(state) {
      return state.settings;
    },
    getApplicationData(state) {
      return state.applicationData;
    },
  },
});
