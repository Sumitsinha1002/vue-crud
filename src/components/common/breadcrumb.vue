<template>
  <div class="breadcrumb-container">
    <div
      :class="{ 'breadcrumb-wrap': true, 'current-wrap': breadcrumb.current }"
      v-for="(breadcrumb, index) in breadCrumbs"
      :key="index"
      @click="() => (breadcrumb.current ? null : handleRedirect(breadcrumb))"
    >
      <div>{{ breadcrumb.name }}</div>
      <div v-if="breadCrumbs.length - 1 !== index">
        <inline-svg src="right-grey-arrow-2"></inline-svg>
      </div>
    </div>
  </div>
</template>

<script>
import InlineSvg from "./inline-svg.vue";
export default {
  components: {
    "inline-svg": InlineSvg,
  },
  computed: {
    breadCrumbs() {
      if (typeof this.$route.meta.breadCrumb === "function") {
        return this.$route.meta.breadCrumb.call(this, this.$route);
      }
      return this.$route.meta.breadCrumb;
    },
  },
  methods: {
    handleRedirect(breadcrumb) {
      this.$router.push(breadcrumb.route);
    },
  },
};
</script>

<style scoped lang="less">
@import "../../styles/main.less";
.breadcrumb-container {
  font-family: "Inter";
  display: flex;
  gap: 8px;
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
  color: @secondaryColor;
  margin: 24px;
  .breadcrumb-wrap {
    display: flex;
    cursor: pointer;
    gap: 6px;
  }
  .current-wrap {
    font-weight: 600;
    font-size: 12px;
    line-height: 140%;
    color: @titlePrimary;
    cursor: default;
  }
}
</style>
