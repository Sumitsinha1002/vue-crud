<template>
  <div>
    <div class="image-uploader-container" v-if="!isClientApplication">
      <slot name="image-uploader">
        <div class="image-uploader">
          <div class="no-image" @click.stop="openDialog">
            <inline-svg src="plus-icon" class="add-image"></inline-svg>
            <span class="label">{{ text }}</span>
          </div>
        </div>
      </slot>
      <slot name="image-uploader-meta">
        <div class="image-uploader-meta">
          <span class="meta-info">
            Only <span class="uppercase">{{ fileTypes.join(", ") }}</span> are
            supported.
          </span>
          <span class="meta-info" v-if="maximumResolution">
            Image Resolution of {{ maximumResolution }},
          </span>
          <span class="meta-info">
            Aspect ratio of
            {{
              aspectRatio
                ? aspectRatio == "*"
                  ? "Original"
                  : aspectRatio
                : "1:1"
            }}
          </span>
          <span class="meta-info">
            and max size of {{ formatBytes(maxSize * 1024) }}
          </span>
        </div>
      </slot>
      <loader class="image-uploading" v-if="loading"></loader>
    </div>
    <div v-else class="upload-btn-wrap">
      <button class="upload-button" @click.stop="openDialog">
        <inline-svg src="upload-icon-1"></inline-svg>
        {{ buttonText ? buttonText : 'Upload Image' }}
      </button>
    </div>
    <mirage-image-uploader-dialog
      v-if="!isPreview"
      ref="dialog"
      :label="label"
      :fileTypes="fileTypes"
      :maxSize="maxSize"
      :aspectRatio="aspectRatio"
      :minimumResolution="minimumResolution"
      :maximumResolution="maximumResolution"
      :recommendedResolution="recommendedResolution"
      :mediaFolder="mediaFolder"
      :namespace="namespace"
      :fileName="fileName"
      :showGallery="showGallery"
      @delete="$emit('delete', $event)"
      @save="$emit('save', $event)"
      v-model="locVal"
      extensionSlug="product-customization"
      :isClientApplication="isClientApplication"
    ></mirage-image-uploader-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import loader from "../loader.vue";
import mirageimageuploaderdialog from "./dialog.vue";
import { formatBytes } from "../../../helper/utils";
import InlineSvg from "../inline-svg.vue";
import { constructSnackBar } from "../../../helper/image-upload-helper";

export default {
  name: "mirage-image-uploader",
  components: {
    "mirage-image-uploader-dialog": mirageimageuploaderdialog,
    loader,
    "inline-svg": InlineSvg,
  },
  props: {
    label: {
      type: String,
    },
    text: {
      type: String,
      default: "Upload",
    },
    aspectRatio: {
      type: String,
    },
    minimumResolution: {
      type: Object,
    },
    maximumResolution: {
      type: Object,
    },
    recommendedResolution: {
      type: Object,
    },
    value: {
      type: String,
    },
    fileTypes: {
      type: Array,
      default: () => {
        return ["png", "jpeg"];
      },
    },
    maxSize: {
      type: Number, // in KB
      default: 2048,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    mediaFolder: {
      type: String,
    },
    namespace: {
      type: String,
    },
    fileName: {
      type: String,
    },
    showGallery: {
      type: Boolean,
      default: true,
    },
    isClientApplication: {
      type: Boolean,
      default: false,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    buttonText: {
      type: String,
      default: 'Image Upload'
    }
  },
  data() {
    return {
      locVal: this.value,
    };
  },
  mounted() {
    if (!this.$snackbar?.global) {
      this.$snackbar = constructSnackBar(this.$toasted);
    }
  },
  watch: {
    locVal(newVal) {
      this.value = newVal;
    },
  },
  methods: {
    formatBytes,
    openDialog() {
      this.$refs.dialog.open();
    },
    $imageError(e) {
      // handle error
      // this.$emit('input', '');
      console.error(e);
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../../styles/main.less";

.image-uploader-container {
  display: flex;
  .image-uploader {
    width: 60px;
    height: 60px;
    border: 1px dashed @RoyalBlue;
    border-radius: @BorderRadius;
    .image {
      //   width: 80px;
      //   height: 60px;
      img {
        width: auto;
        height: 80px;
        display: block;
        margin: 0 auto;
      }
      .edit-image {
        position: relative;
        display: inline-block;
        cursor: pointer;
        left: 65px;
        top: -20px;
      }
    }
    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: @Snow;
      cursor: pointer;
      .add-image {
        height: 60%;
        align-items: center;
        display: flex;
        ::v-deep {
          svg {
            // width: 60px;
            // height: 60px;
            #prefix__Group {
              stroke: #d5daff;
            }
          }
        }
      }

      .label {
        color: @RoyalBlue;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
  .image-uploader-meta {
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    padding: 12px;
    background-color: @Alabaster2;
    flex: 1;
    align-items: center;
    .meta-info {
      color: @DustyGray2;
      // font-size: 13px;
      // line-height: 20px;
      font-weight: 400;
      font-size: 9px;
      line-height: 140%;
    }
  }
  .image-uploading {
    padding: 0;
    position: absolute;
    height: 82px;
    width: 82px;
    background: white;
    opacity: 0.6;
    img {
      height: 82px;
    }
  }
  .uppercase {
    text-transform: uppercase;
  }
}
.upload-btn-wrap {
  width: 180px;
  height: 48px;

  .upload-button {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    letter-spacing: -0.02em;
    background: white;
    border: 0.8px solid #d4d1d1;
    border-radius: 4px;
    width: 100%;
    height: 100%;
    justify-content: center;
    gap: 4px;
    text-transform: uppercase;
  }
}
</style>
