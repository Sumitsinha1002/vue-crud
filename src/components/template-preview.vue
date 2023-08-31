<template>
  <div class="preview-container">
    <div class="header">
      <div :class="`left-section ${this.type}`">
        <div
          class="icon-wrap desktop-icon"
          @click="() => (this.type = 'desktop')"
        >
          <inline-svg
            :src="isMobilePreview ? 'laptop-icon' : 'selected-laptop-icon'"
          ></inline-svg>
        </div>
        <div
          :class="{ 'icon-wrap': true, selected: isMobilePreview }"
          @click="() => (this.type = 'mobile')"
        >
          <inline-svg src="phone-icon"></inline-svg>
        </div>
      </div>
      <div class="right-section">Live Preview</div>
    </div>
    <div class="preview-section">
      <span class="overlay"></span>
      <div :class="{ preview: true, 'mobile-preview': isMobilePreview }">
        <div class="left">
          <img
            v-if="isMobilePreview"
            src="../assets/pngs/mobile-item.png"
            alt="item-image"
          />
          <img v-else src="../assets/pngs/item.png" alt="item-image" />
          <div class="breadcrumb" v-if="isMobilePreview">
            Home / Unisex / Shirts / Houndstooth Jacquard Midi Dress + tie
          </div>
        </div>
        <div class="right">
          <h4 class="title">Houndstooth Jacquard Midi Dress + Tie</h4>
          <div class="text">Cupro Blend</div>
          <div class="ratings">4★ (200)</div>
          <div class="price">
            <h4 class="price">₹8,950.00</h4>
            <span class="offer">30% Off</span>
          </div>
          <div class="mrp-label">MRP: <span class="mrp">10,600</span></div>
          <div class="price-info">inclusive of all taxes</div>
          <div class="preview-product-customization" ref="previewRef">
            <product-customization
              :isPreview="true"
              :previewData="settings"
            ></product-customization>
          </div>
          <div class="color-selection">
            <div class="color selected">
              <div class="box white"></div>
            </div>
            <div class="color">
              <div class="box black"></div>
            </div>
          </div>
          <div class="size-wrapper">
            <div class="size-guide">
              <span class="label">Size UK 6 (selected)</span>
              <span class="guide">SIZE GUIDE</span>
            </div>
            <div class="sizes">
              <div class="size not-available">UK 4</div>
              <div class="size not-available">UK 5</div>
              <div class="size selected">UK 6</div>
              <div class="size">UK 7</div>
              <div class="size">UK 8</div>
              <div class="size">UK 9</div>
            </div>
          </div>
          <div class="description">
            Presenting the much loved Sanchi dress, in a range of new colours.
            Designed keeping in mind all body types, the Sanchi dress cinches
            the waist and ties.
          </div>
          <div class="button-wrap">
            <button class="buy-button button">BUY NOW</button>
            <button class="add-cart-button button">ADD TO BAG</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import inlineSvg from "./common/inline-svg.vue";
import ProductCustomizationNew from "../../bindings/product-customization/src/product-customization.vue";

export default {
  components: {
    "inline-svg": inlineSvg,
    "product-customization": ProductCustomizationNew,
  },
  props: {
    settings: null,
  },
  data() {
    return {
      type: "desktop",
    };
  },
  watch: {
    settings() {
      this.$nextTick(() => {
        this.setHeight();
      });
    },
  },
  computed: {
    isMobilePreview() {
      if (this.type === "mobile") return true;
      return false;
    },
  },
  mounted() {
    this.setHeight();
  },
  methods: {
    setHeight() {
      const previewWrap =
        this.$refs.previewRef?.getElementsByClassName("preview-wrapper")?.[0];
      const height = previewWrap?.getClientRects()?.[0]?.height;
      this.$refs.previewRef.style["height"] = height + "px";
    },
  },
};
</script>

<style scoped lang="less">
@import "../styles/main.less";
@previewBackground: #f9f7f4;
@disableColor: #bab9b9;

.preview-container {
  border: 1px solid @gray5;
  border-radius: 4px;
  width: 100%;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 15px;
    .left-section {
      display: flex;
      gap: 4px;
      &.mobile {
        .desktop-icon {
          padding: 3px;
        }
      }
      .icon-wrap {
        cursor: pointer;
      }
      .selected {
        ::v-deep svg {
          background: @gray4;
          border: 1px solid @gray6;
          box-sizing: border-box;
        }
      }
    }
  }
  .preview-section {
    background: @backgroundGray;
    padding: 38px;
    position: relative;
    .overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      background: transparent;
      z-index: 99;
      top: 0;
      left: 0;
    }
    .preview {
      // width: max-content;
      width: 60%;
      margin: auto;
      padding: 24px;
      display: flex;
      gap: 24px;
      background-color: @previewBackground;
      border-radius: 8px;
      .left {
        display: block;
      }
      .right {
        height: 100%;
        overflow: auto;
        .title {
          font-weight: 400;
          font-size: 16px;
          line-height: 18px;
          letter-spacing: -0.02em;
          margin: 0;
          margin-bottom: 2px;
        }
        .text {
          font-weight: 400;
          font-size: 7px;
          line-height: 10px;
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }
        .ratings {
          font-weight: 400;
          font-size: 7px;
          opacity: 0.9;
          margin-bottom: 12px;
        }
        .price {
          font-size: 14px;
          line-height: 16px;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 4px;
          .price {
            margin: 0;
          }
          .offer {
            font-weight: 400;
            font-size: 8px;
            line-height: 11px;
            letter-spacing: -0.02em;
            color: #b24141;
          }
        }
        .mrp-label {
          font-weight: 400;
          font-size: 7px;
          line-height: 10px;
          letter-spacing: -0.02em;
          .mrp {
            font-weight: 400;
            font-size: 6px;
            line-height: 8px;
            text-decoration-line: line-through;
            color: #8e8c8a;
          }
        }
        .price-info {
          font-weight: 400;
          font-size: 6px;
          line-height: 8px;
          color: #8e8c8a;
        }
        .preview-product-customization {
          ::v-deep .preview-wrapper {
            scale: 60%;
            transform-origin: top left;
          }
        }
        .color-selection {
          display: flex;
          gap: 4px;
          margin-top: 6px;
          .color {
            &.selected {
              border: 0.5px solid #d4d2d1;
            }
            .box {
              width: 20px;
              height: 20px;
              margin: 4px;
              border: 0.5px solid #d4d2d1;
              &.black {
                background: black;
              }
              &.white {
                background: white;
              }
            }
          }
        }
        .size-wrapper {
          margin-top: 10px;
          .size-guide {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 6px;
            .label {
              font-weight: 400;
              font-size: 6px;
              line-height: 8px;
            }
            .guide {
              font-weight: 500;
              font-size: 7px;
              line-height: 10px;
              letter-spacing: -0.02em;
              text-decoration-line: underline;
              text-transform: uppercase;
            }
          }
          .sizes {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            .size {
              border: 0.5px solid #d4d2d1;
              color: #26201a;
              font-size: 7px;
              padding: 6px 12px;
              position: relative;
              &.not-available {
                color: @disableColor;
                &::before {
                  content: "";
                  position: absolute;
                  top: 48%;
                  left: -3px;
                  right: 0px;
                  height: 1px;
                  background-color: #bab9b9;
                  transform: rotate(26deg);
                  width: 46px;
                }
              }
              &.selected {
                background: #e7ded3;
              }
            }
          }
        }
        .description {
          font-weight: 400;
          font-size: 7px;
          line-height: 10px;
          letter-spacing: -0.02em;
          margin-top: 12px;
          // max-width: 300px;
        }
        .button-wrap {
          width: 100%;
          margin-top: 24px;
          display: flex;
          gap: 6px;
          flex-direction: column;
          .button {
            font-size: 9px;
            padding: 12px;
            width: 100%;
            border-radius: 2px;
            border-color: black;
          }
          .buy-button {
            color: white;
            background-color: black;
          }
          .add-cart-button {
            background-color: white;
            border: 1px solid black;
            color: black;
          }
        }
      }
    }
  }
  .mobile-preview {
    &.preview {
      flex-direction: column;
      width: 30%;
    }
    .left {
      display: flex;
      flex-direction: row;
      img {
        width: 100%;
      }
    }
  }
}
</style>
