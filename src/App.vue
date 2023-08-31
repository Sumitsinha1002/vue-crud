<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import Vue from "vue";
export default {
  name: "app",
  mounted() {
    import(
      /*webpackChunkName:"nitrozen-snackbar" */ "@gofynd/nitrozen-vue/src/components/NSnackbar"
    ).then((NitrozenSnackbar) => {
      Vue.use(NitrozenSnackbar.default);
      Vue.snackbar.register("show", (message) => message, {
        position: "top-center",
        duration: 3000,
      });
      Vue.snackbar.register("showSuccess", (message) => message, {
        position: "top-center",
        duration: 3000,
        type: "success",
      });
      Vue.snackbar.register("showError", (message) => message, {
        position: "top-center",
        duration: 3000,
        type: "error",
      });
      Vue.snackbar.register("showWarning", (message) => message, {
        position: "top-center",
        duration: 3000,
        type: "warning",
      });
      Vue.snackbar.register("showInfo", (message) => message, {
        position: "top-center",
        duration: 3000,
        type: "info",
      });
    });
  },
};
</script>

<style lang="less">
@import "./../node_modules/@gofynd/nitrozen-vue/dist/nitrozen.css";
</style>
