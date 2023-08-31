<template>
  <div class="card-container">
    <div class="card-box">
      <div class="card-logo" v-if="logo">
        <inline-svg v-if="isUrl" class="arrow" :src="logo"></inline-svg>
        <img v-else :src="logo" alt="card-logo" />
      </div>
      <div class="card-content" v-if="content || description">
        <h4 v-if="content">{{ content }}</h4>
        <p v-if="description">{{ description }}</p>
      </div>
      <div class="mt">
        <div class="status" v-if="showStatus">
          <nitrozen-badge state="success" v-if="isActive">
            Active
          </nitrozen-badge>
          <nitrozen-badge state="error" v-else>Inactive</nitrozen-badge>
        </div>
        <div class="button-container" @click="onClick(meta)">
          <div class="select-widget float-right">
            <inline-svg class="arrow" :src="'long-left-arrow'"></inline-svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { NitrozenBadge } from "@gofynd/nitrozen-vue";
import inlineSvg from "@/components/common/inline-svg.vue";

export default {
  name: "Card",
  components: {
    NitrozenBadge,
    "inline-svg": inlineSvg,
  },
  props: {
    logo: {
      type: String,
      default: "",
    },
    isUrl: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    onClick: {
      type: Function,
    },
    showStatus: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    meta: null,
  },
};
</script>

<style scoped lang="less">
@import "../../styles/main.less";
.card-container {
  margin-bottom: 24px;
  width: 266px;
  .card-box {
    border: 1px solid #e4e5e6;
    border-radius: 10px;
    overflow: hidden;
    padding: 20px;
    background-color: #fff;
    height: 100%;
    box-sizing: border-box;
    position: relative;
  }
  .card-main {
    display: grid;
    grid-column-gap: 18px;
  }
  .card-innerbox {
    margin-bottom: 24px;
  }
  .card-logo {
    min-height: 60px;
  }
  .card-logo img {
    max-width: 52px;
  }
  .select-widget {
    position: absolute;
    right: 20px;
    bottom: 20px;
  }
  .select-widget .inline-svg {
    float: right;
    height: 35px;
    width: 35px;
    font-size: 15px;
    transform: rotate(180deg);
    padding: 6px 6px;
    display: block;
    border-radius: 20%;
    border: 1px solid #dedede;
    box-sizing: border-box;
    transform: rotate(180deg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card-content {
    background-color: #fff;
    width: 100%;
    box-sizing: border-box;
    margin-top: 10px;
  }
  .card-content h4 {
    margin: 0;
    margin-bottom: 5px;
    font-weight: 600;
    font-size: 15px;
    color: #41434c;
  }
  .card-content p {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: @DustyGray3;
    font-family: Inter, sans-serif;
  }
  .inactive_button {
    position: relative;
    border: 1px solid #eb5757;
    background-color: transparent;
    color: #eb5757;
    width: 74px;
    text-transform: uppercase;
    height: 22px;
    top: 7px;
    font-family: Inter;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
  }
  .card-innerbox a {
    display: block;
    width: 100%;
    outline: none;
    text-decoration: none;
    box-sizing: border-box;
  }
  .button-container {
    width: 100%;
    float: left;
    cursor: pointer;
  }
  .mt {
    margin-top: 40px;
  }
  .status {
    padding-bottom: 4px;
  }
}
</style>
