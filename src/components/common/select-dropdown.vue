<template>
  <div
    :class="{ 'custom-dropdown-container': true, disable: disable }"
    v-click-outside="closeDropdown"
  >
    <div
      :class="{ 'button-wrap': true, 'is-open': isDropdownOpen }"
      @click="toggleDropdown"
    >
      <div class="title">{{ title }}</div>
      <div class="icon-wrap">
        <inline-svg src="arrow-down"></inline-svg>
      </div>
    </div>
    <ul :class="{ options: true, show: isDropdownOpen }" v-if="isDropdownOpen">
      <li
        class="option"
        v-for="(option, index) in options"
        :key="index"
        @click="() => handleClick(option.value)"
      >
        {{ option.text }}
      </li>
    </ul>
  </div>
</template>

<script>
import inlineSvg from "./inline-svg.vue";
import clickOutside from "vue-click-outside";

export default {
  components: { "inline-svg": inlineSvg },
  directives: {
    clickOutside,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    options: null,
    disable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isDropdownOpen: false,
    };
  },
  methods: {
    handleClick(value) {
      this.$emit("click", value);
      this.closeDropdown();
    },
    toggleDropdown() {
      if (this.disable) {
        this.isDropdownOpen = false;
        return;
      }
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
  },
};
</script>
<style scoped lang="less">
@import "../../styles/main.less";
@primaryColor: #2e31be;
.custom-dropdown-container {
  position: relative;
  &.disable {
    opacity: 0.5;
    .button-wrap {
      cursor: no-drop;
    }
  }
  .button-wrap {
    border: 1px solid @primaryColor;
    color: @primaryColor;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-radius: 4px;
    font-weight: 700;
    font-size: 12px;
    line-height: 160%;
    cursor: pointer;
    .title {
      width: 77%;
      text-align: center;
    }
    .icon-wrap {
      border-left: 1px solid;
      height: 100%;
      ::v-deep svg {
        height: 100%;
        #prefix__Group-2 {
          g {
            stroke: @primaryColor;
          }
        }
      }
    }
  }
  .is-open {
    .icon-wrap {
      ::v-deep svg {
        transform: rotate(180deg);
      }
    }
  }
  .options {
    border: 1px solid @gray5;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    // display: none;
    position: absolute;
    background-color: @backgroundColor;
    list-style: none;
    padding: 0;
    margin: 0;
    z-index: 999;
    width: 100%;
    .option {
      font-weight: 400;
      font-size: 12px;
      line-height: 160%;
      padding: 16px 12px;
      cursor: pointer;
      &:not(:last-child) {
        border-bottom: 1px solid @gray5;
      }
      &:hover {
        background: @gray5;
      }
    }
    &.show {
      display: block;
      animation: dropdown-animation 0.3s ease-in-out forwards;
    }
  }
  @keyframes dropdown-animation {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
