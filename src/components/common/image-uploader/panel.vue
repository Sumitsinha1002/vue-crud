<template>
  <div
    class="image-uploader-panel"
    :class="{ highlight, 'client-application': isClientApplication }"
    @drop.prevent.stop="onDrop"
    @dragenter.prevent.stop="highlight = true"
    @dragover.prevent.stop="highlight = true"
    @dragleave.prevent.stop="highlight = false"
  >
    <div
      class="image-uploader-panel-error"
      :class="{ 'full-error': !showGallery }"
      v-if="showError"
    >
      <span
        @click="showError = false"
        class="image-uploader-panel-error-close"
        title="Close"
      >
        <inline-svg src="cross-white"></inline-svg>
      </span>
      <span class="image-uploader-panel-error-message">
        {{ errorMessage }}
      </span>
    </div>
    <input
      type="file"
      name="inputFile"
      ref="inputFile"
      :accept="acceptedMIMETypesString"
      @change="handleFile($event.target.files)"
    />

    <!-- <div v-if="value && fileDomain === 'image'"> -->
    <div
      class="image-cropper"
      :class="{ 'full-width': !showGallery }"
      v-if="value && cropping"
      ref="cropperdiv"
    >
      <div class="dimensions">{{ dimensions.x }} x {{ dimensions.y }}</div>
      <cropper
        ref="cropper"
        :src="src"
        :stencilProps="stencilProps"
        class="cropImgSize"
        areaClassname="image-cropper__area"
        backgroundClassname="image-cropper__background"
        imageClassname="image-cropper__image"
        @change="$cropperChange"
      ></cropper>
    </div>
    <div
      class="image-preview"
      :class="{ 'full-width': !showGallery }"
      v-else-if="value"
    >
      <div class="dimensions">
        {{ dimensions.x }} x {{ dimensions.y }}
        {{ getMIMEType(value) == "image/svg+xml" ? "(SVG)" : "" }}
      </div>
      <img
        :src="croppedImageFile || value"
        @error="$imagePreviewError"
        ref="previewImage"
        @load="showDimensions($event)"
      />
    </div>
    <!-- </div> -->
    <!-- <div v-if="value && fileDomain === 'video'">
            <div class="video-preview">
                <video-player :options="videoOptions" />
            </div>
        </div>-->
    <div v-else class="container">
      <div class="upload-image">
        <!-- <img src="/public/admin/assets/admin/pngs/upload.png" /> -->
        <inline-svg src="upload-icon"></inline-svg>
      </div>
      <span class="text-md">Drag and drop a {{ label }} here</span>

      <nitrozen-button
        class="upload-button"
        v-stroke-btn
        theme="secondary"
        @click="$refs.inputFile.click()"
        >Select File</nitrozen-button
      >
      <span class="text-md or-text">Or</span>
      <div class="text-md url-title">upload via URL</div>
      <nitrozen-input
        class="image-url"
        type="url"
        placeholder="Enter image URL"
        :value="value"
        @blur="$onInpurURLChange"
        @keyup.enter="$onInpurURLChange"
        @error="$emit('input', '')"
      ></nitrozen-input>
      <div class="input-info">You can enter public url of the image here</div>
    </div>
    <span class="meta-info pad-t-12"
      >Accepted image types: {{ fileTypes.join(", ") }}</span
    >
    <span class="meta-info">
      Max image size: {{ formatBytes(maxSize * 1024) }},
    </span>
    <span class="meta-info" v-if="aspectR && !Array.isArray(aspectR)">
      Aspect ratio: {{ aspectR.x }}:{{ aspectR.y }}
    </span>
    <span class="select-ratio-wrapper" v-if="aspectR?.[0] && value && cropping">
      <span class="ratio-label">Available ratios: </span>
      <span
        v-for="(ratio, index) in aspectR"
        :key="index"
        @click="() => (selectedRatio = ratio)"
      >
        <span
          :class="{
            'ratio-value': true,
            'selected-ratio':
              selectedRatio?.x == ratio.x && selectedRatio?.y == ratio.y,
          }"
          >{{ ratio.x }} : {{ ratio.y }}</span
        >
      </span>
    </span>
    <loader v-if="loading"></loader>
  </div>
</template>

<script>
/* eslint-disable */
import { NitrozenButton, NitrozenInput, strokeBtn } from "@gofynd/nitrozen-vue";
import { Cropper } from "vue-advanced-cropper";
import loader from "../loader.vue";
import InlineSvg from "../inline-svg.vue";
import mime from "mime-types";
import MainService from "../../../services/main-service";
import { formatBytes } from "../../../helper/utils";
import { constructSnackBar } from "../../../helper/image-upload-helper";

export default {
  name: "mirage-image-uploader-panel",
  components: {
    NitrozenButton,
    NitrozenInput,
    Cropper,
    "inline-svg": InlineSvg,
    loader,
  },
  props: {
    label: {
      type: String,
      default: "image",
    },
    fileTypes: {
      type: Array,
      default: () => {
        return ["png", "jpeg"];
      },
    },
    fileDomain: {
      type: String,
      default: "image",
    },
    maxSize: {
      type: Number, // in KB
      default: 2048,
    },
    aspectRatio: {
      type: String,
      default: "1:1",
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
    showGallery: {
      type: Boolean,
      default: true,
    },
    value: {
      type: String,
    },
    isHDNImage: {
      type: Boolean,
      default: true,
    },
    isClientApplication: {
      type: Boolean,
      default: false,
    },
  },
  directives: {
    strokeBtn,
  },
  data: function () {
    return {
      loading: false,
      cropping: false,
      croppedImageFile: "",
      highlight: false,
      showError: false,
      errorMessage: "",
      image: null,
      imageURL: "",
      dimensions: { x: 0, y: 0 },
      selectedRatio: null,
      //   hdns: GrindorService.hdns,
      src: undefined,
      //   videoOptions: {
      //     autoplay: false,
      //     controls: true,
      //     width: 360,
      //     height: 270,
      //     sources: [
      //       {
      //         src: "https://res.cloudinary.com/dwzm9bysq/video/upload/v1587625799/ark/production/order/video_file/null/5dda683944ef371d6c106480/product_VID-20200415-WA0001.mp4",
      //         type: "video/mp4",
      //       },
      //     ],
      //   },
      mimeType: "",
    };
  },
  computed: {
    acceptedMIMETypes() {
      return this.fileTypes.map((type) => `${this.fileDomain}/${type}`);
    },
    acceptedMIMETypesString() {
      return this.acceptedMIMETypes.toString();
    },
    aspectR() {
      return this.getAspectRatio();
    },
    stencilProps() {
      const aspectRatio = this.getAspectRatio();
      if (aspectRatio && aspectRatio?.[0]?.x) {
        const ratio = this.selectedRatio?.x
          ? this.selectedRatio
          : aspectRatio[0];
        return {
          aspectRatio: ratio.x / ratio.y,
        };
      } else if (!aspectRatio) {
        return {
          aspectRatio: 1,
        };
      } else {
        return {
          aspectRatio: aspectRatio.x / aspectRatio.y,
        };
      }
    },
  },
  watch: {
    value(newVal, oldVal) {
      this.updateImageSrc();
      if (this.minimumResolution) {
        var img = new Image();
        img.onload = () => {
          if (!this.validateDimensions(img)) {
            this.$snackbar.global.showError(
              `Selected image don't have minimum required dimensions i.e. ${this.minimumResolution.width} x ${this.minimumResolution.height}`
            );
            this.$emit("input", oldVal);
          }
        };
        img.src = newVal;
      }
    },
    aspectRatio() {
      this.setDefaultRatio();
    },
    cropping(newVal) {
      // to find out image extension from url
      if (newVal && this.value.startsWith("http")) {
        if (this.value.endsWith(".jpeg") || this.value.endsWith(".jpg")) {
          this.mimeType = "image/jpeg";
        } else if (this.value.endsWith(".png")) {
          this.mimeType = "image/png";
        } else {
          this.mimeType = "";
        }
      }
    },
  },
  mounted() {
    if (!this.$snackbar?.global) {
      this.$snackbar = constructSnackBar(this.$toasted);
    }
    this.setDefaultRatio();
  },
  methods: {
    formatBytes,
    getAspectRatio() {
      if (this.aspectRatio == "*") {
        return;
      }
      // const splitted = this.aspectRatio.split(":");
      // const x = +splitted[0];
      // const y = +splitted[1];
      // return { x, y };
      if (Array.isArray(this.aspectRatio)) {
        return this.aspectRatio?.map((ratio) => {
          const splitted = ratio.split(":");
          const x = +splitted[0];
          const y = +splitted[1];
          return { x, y };
        });
      } else {
        const splitted = this.aspectRatio.split(":");
        const x = +splitted[0];
        const y = +splitted[1];
        return { x, y };
      }
    },
    setDefaultRatio() {
      const ratio = this.aspectR;
      this.selectedRatio = ratio?.[0] ? ratio[0] : ratio;
    },
    updateImageSrc() {
      try {
        if (!this.isHDNImage && this.value && !this.isClientApplication) {
          if (this.value.startsWith("data:image")) {
            this.src = this.value;
          } else {
            // For external urls to bypass CORS issue
            MainService.getProxyURL({ url: this.value }).then((res) => {
              console.log("in response", res, typeof res.data);
              const buffer = Buffer.from(res.data);
              const base64String = buffer.toString("base64");
              this.src = `data:image/png;base64,${base64String}`;
            });
          }
        } else {
          this.src = this.value;
        }
      } catch (err) {
        this.src = this.value;
      }
    },
    crop() {
      let image = new Image();
      image.src = this.$refs.cropper
        .getResult()
        .canvas.toDataURL(this.mimeType);
      image.onload = () => {
        if (!this.validateDimensions(image)) {
          this.$snackbar.global.showError(
            `Minimum required dimensions are ${this.minimumResolution.width} x ${this.minimumResolution.height}`
          );
          return;
        }
        if (this.aspectR) {
          if (Array.isArray(this.aspectR)) {
            const ratioNotMatching = [];
            this.aspectR?.map((ratio) => {
              const aspectQ = parseFloat((ratio.x / ratio.y).toFixed(2));
              let imageQ = parseFloat((image.width / image.height).toFixed(2));
              if (!(aspectQ <= imageQ + 0.01 && aspectQ >= imageQ - 0.01)) {
                console.log(aspectQ, imageQ);
                ratioNotMatching.push(ratio);
              }
            });
            if (ratioNotMatching?.length === this.aspectR.length) {
              this.$snackbar.global.showError(
                `Aspect ratio not matching with ${ratioNotMatching
                  .map(({ x, y }) => x + ":" + y)
                  .join(", ")}`
              );
              return;
            }
          } else {
            const aspectQ = parseFloat(
              (this.aspectR.x / this.aspectR.y).toFixed(2)
            );
            let imageQ = parseFloat((image.width / image.height).toFixed(2));
            if (!(aspectQ <= imageQ + 0.01 && aspectQ >= imageQ - 0.01)) {
              console.log(aspectQ, imageQ);
              this.$snackbar.global.showError(
                `Aspect ratio not matching with ${this.aspectRatio}`
              );
              return;
            }
          }
        }
        this.croppedImageFile = image.src;
        this.$emit("cropped");
      };
    },
    onDrop(e) {
      this.highlight = false;
      const files = e.dataTransfer.files;
      // TODO: allow only one image
      this.handleFile(files);
    },
    handleFile(files) {
      const file = this.getValidFile(files);
      const reader = new FileReader();
      reader.onload = () => {
        // convert image file to base64 string
        this.$emit("input", reader.result);
        this.mimeType = file.type;
        this.file = null;
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    },
    $cropperChange(e) {
      this.dimensions = {
        x: Math.floor(e.coordinates.width),
        y: Math.floor(e.coordinates.height),
      };
    },
    getValidFile(files) {
      if (files.length > 1) {
        this.errorMessage = "You have selected more than one files";
        this.showError = true;
        return null;
      }
      if (files.length == 1) {
        const file = [...files][0];
        if (!this.acceptedMIMETypes.includes(file.type)) {
          this.errorMessage = `${file.type} file type not supported`;
          this.showError = true;
          return null;
        }
        if (file.size > this.maxSize * 1024) {
          this.errorMessage = `Image size exceeds maximum allowable size. i.e. ${formatBytes(
            this.maxSize * 1024
          )}`;
          this.showError = true;
          return null;
        }
        return file;
      }
    },
    validateDimensions(img) {
      if (
        this.minimumResolution &&
        this.getMIMEType(img.src) != "image/svg+xml" &&
        (img.width < this.minimumResolution.width ||
          img.height < this.minimumResolution.height)
      ) {
        return false;
      }
      return true;
    },
    showDimensions(e) {
      this.dimensions = {
        x: e.target.naturalWidth,
        y: e.target.naturalHeight,
      };
    },
    getMIMEType(imageURL) {
      try {
        const url = new URL(imageURL);
        let mimeString = mime.lookup(url.toString());
        if (mimeString) {
          return mimeString;
        }
        mimeString = imageURL.split(",")[0].split(":")[1].split(";")[0];
        return mimeString;
      } catch (e) {
        return "";
      }
    },
    $onInpurURLChange(e) {
      this.imageURL = e.target.value;
      this.$emit("input", e.target.value);
    },
    $imagePreviewError() {
      this.$snackbar.global.showError("Not a valid image URL");
      this.$emit("input", "");
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../../styles/main.less";
.image-uploader-panel {
  display: flex;
  width: auto;
  background-color: @blue5;
  border-radius: @BorderRadius;
  flex-direction: column;
  align-items: center;
  width: 50%;
  height: 100%;
  // min-height: 400px;
  padding: 24px;
  // height: 480px;
  // border: 1px dashed @Iron;
  &.client-application {
    @media @mobile {
      width: calc(100% - 48px);
    }
  }
  @media @mobile {
    height: auto;
    min-height: 240px;
  }
  .dimensions {
    display: inline-block;
    position: absolute;
    bottom: 25px;
    left: 26px;
    // background: @White;
    padding: 0 6px;
    z-index: 1;
    @media @mobile {
      left: 40px;
      // top: 200px;
    }
  }
  .image-cropper {
    display: flex;
    justify-content: center;
    flex: 1;
    background-color: #4d4d4e96;
    .cropImgSize {
      max-width: 425px;
      max-height: 480px;
    }
    ::v-deep .image-cropper__area {
      max-width: 425px;
      max-height: 480px;
      .vue-square-handler {
        width: 4px;
        height: 4px;
      }
      .vue-handler-wrapper--east,
      .vue-handler-wrapper--west {
        .vue-square-handler {
          height: 45px;
          border-radius: 4px;
        }
      }
      .vue-handler-wrapper--north,
      .vue-handler-wrapper--south {
        .vue-square-handler {
          width: 45px;
          border-radius: 4px;
        }
      }
    }
    ::v-deep .image-cropper__background {
      background: #4d4d4e96;
      opacity: 0.59 !important;
      max-width: 425px;
      max-height: 480px;
    }
    ::v-deep .image-cropper__image {
      max-width: 425px;
      max-height: 480px;
    }

    &.full-width {
      .cropImgSize {
        max-width: 900px;
      }
      ::v-deep .image-cropper__area {
        max-width: 900px;
      }
      ::v-deep .image-cropper__background {
        max-width: 900px;
      }
      ::v-deep .image-cropper__image {
        max-width: 900px;
      }
    }
  }
  .image-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background: white;
    max-width: 425px;
    max-height: 480px;
    overflow: hidden;
    img {
      max-width: 425px;
      max-height: 480px;
    }
    &.full-width {
      max-width: 900px;
      img {
        max-width: 900px;
      }
    }
  }
  .image-uploader-panel-error {
    width: 330px;
    height: 406px;
    padding: 48px;
    background-color: #4d4d4e;
    color: white;
    font-size: 16px;
    position: absolute;
    z-index: 1;
    opacity: 0.96;
    display: flex;
    align-items: center;
    .image-uploader-panel-error-close {
      display: inline-block;
      position: absolute;
      top: 12px;
      right: 12px;
      cursor: pointer;
    }
    .image-uploader-panel-error-message {
      text-align: center;
      width: 100%;
    }
  }
  .full-error {
    width: auto;
    right: 0;
    left: 0;
  }
  input[type="file"] {
    display: none;
  }
  .container {
    display: flex;
    flex-direction: column;
    // margin: 24px;
    // padding: 24px;
    width: 100%;
    height: 100%;
    // background-color: @White;
    border: 2px dashed #d7d7d7;
    border-radius: @BorderRadius;
    align-items: center;
    color: #61636a;
    font-size: 16px;
    line-height: 23px;
    text-align: center;
    .upload-image {
      width: 100%;
      margin-bottom: 13px;
      margin-top: 39px;
    }
    .upload-button {
      margin: 12px;
    }
    .image-url {
      margin: 9px 0 8px;
    }
    // .meta-info {
    //   color: @DustyGray3;
    //   font-weight: 400;
    //   font-size: 12px;
    //   line-height: 21px;
    //   padding-top: 12px;
    // }
    .input-info {
      font-weight: 400;
      font-size: 12px;
      line-height: 17px;
      color: @DustyGray2;
      margin-bottom: 14px;
    }
  }

  &.highlight {
    .container {
      border: 1px dashed @RoyalBlue;
    }
  }
  .meta-info {
    color: @DustyGray3;
    font-weight: 400;
    font-size: 12px;
    line-height: 21px;
    // padding-top: 12px;
  }
  .text-md {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
  }
  .or-text {
    color: @DustyGray3;
  }
  .url-title {
    color: @gray3;
  }
  .pad-t-12 {
    padding-top: 12px;
  }
  .select-ratio-wrapper {
    display: flex;
    gap: 6px;
    height: 30px;
    align-items: center;
    .ratio-label {
      color: @DustyGray3;
    }
    .ratio-value {
      padding: 4px 10px;
      border-radius: 3px;
      cursor: pointer;
    }
    .selected-ratio {
      border: 1px solid @RoyalBlue;
      color: white;
      background: @RoyalBlue;
    }
  }
}
</style>
