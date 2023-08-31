<template>
  <div class="progress-bar-container">
    <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    <div class="progress-label">{{ progress }}% Complete</div>
  </div>
</template>

<script>
export default {
  props: {
    progress: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped lang="less">
@import "../../styles/main.less";
.progress-bar-container {
  position: relative;
  display: flex;
  flex-direction: column;
  // align-items: end;
  .progress-bar {
    width: 0;
    height: 6px;
    border-radius: 4px;
    background-color: @RoyalBlue;
    transition: width 0.3s ease-in-out;
  }
  .progress-label {
    font-weight: 600;
    font-size: 12px;
    line-height: 130%;
    color: @RoyalBlue;
    text-align: right;
  }
}
</style>
