<template>
    <span v-html="getSVG" class="inline-svg"></span>
  </template>
  <script>
  import __SVG from "../../assets/svgs.js";
  export default {
    props: {
      src: { type: String, required: true },
    },
    computed: {
      getSVG() {
        return __SVG[this.src];
      },
    },
  };
  </script>
  