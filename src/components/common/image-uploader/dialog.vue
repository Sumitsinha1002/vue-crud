<template>
  <transition name="modal">
    <div v-bind:class="{ uploading: loading }">
      <!-- <loader
                v-if="visible && loading"
                class="loading uploading"
            ></loader>-->
      <nitrozen-dialog :class="{'client-application-dialog': isClientApplication}" ref="dialog" :title="title" @close="handleClose">
        <template slot="body">
          <div class="dialog-body">
            <mirage-image-uploader-panel
              :label="label"
              :fileTypes="fileTypes"
              :fileDomain="fileDomain"
              :maxSize="maxSize"
              :aspectRatio="aspectRatio"
              :minimumResolution="minimumResolution"
              :maximumResolution="maximumResolution"
              :recommendedResolution="recommendedResolution"
              :showGallery="showGallery"
              :value="imageURL"
              @input="imageURL = $event"
              @cropped="$setCropping(false, true)"
              :isHDNImage="isHDNImage"
              ref="imageuploaderpanel"
              :isClientApplication="isClientApplication"
            ></mirage-image-uploader-panel>
            <!-- <div class="dialog-saperator" v-if="showGallery"></div> -->
            <mirage-image-uploader-list
              v-if="visible && showGallery && !isClientApplication"
              :mediaFolder="mediaFolder"
              :namespace="namespace"
              :minimumResolution="minimumResolution"
              :tags="tags"
              @imageSelected="$setImage"
              ref="imageuploaderlist"
            ></mirage-image-uploader-list>
          </div>
        </template>
        <template slot="footer">
          <div class="footer-event" :class="{ 'left-align': !showGallery }">
            <nitrozen-button
              v-if="imageURL && !edit"
              :disabled="loading"
              theme="secondary"
              @click="$removeImage"
              >Delete</nitrozen-button
            >
            <nitrozen-button
              v-if="fileDomain == 'image' && imageURL && !edit"
              :disabled="loading || getMIMEType === 'image/svg+xml'"
              theme="secondary"
              @click="$setCropping(true)"
              >Edit</nitrozen-button
            >
            <nitrozen-button
              v-if="edit"
              theme="secondary"
              @click="$setCropping(false)"
              >Discard</nitrozen-button
            >
            <nitrozen-button
              v-if="edit"
              theme="secondary"
              @click="$refs.imageuploaderpanel.crop()"
              >Crop</nitrozen-button
            >
          </div>
          <div class="footer-saperator"></div>
          <div class="action-buttons">
            <div
              v-if="isHDNImage && !isCropped"
              title="Copy Image URL"
              class="copy"
              @click.stop="copyToClipboard"
            >
              <inline-svg src="copy"></inline-svg>
            </div>
            <nitrozen-button
              v-show="(!isHDNImage && !isEmpty) || isCropped"
              theme="secondary"
              :disabled="edit || loading"
              v-flat-btn
              @click="$uploadImage"
            >
              Upload
            </nitrozen-button>
            <nitrozen-button
              v-show="(isHDNImage || isEmpty) && !isCropped"
              theme="secondary"
              :disabled="edit || loading"
              v-flat-btn
              @click="$selectImage"
            >
              Select
            </nitrozen-button>
          </div>
        </template>
      </nitrozen-dialog>
    </div>
  </transition>
</template>

<script>
import { NitrozenButton, flatBtn, NitrozenDialog } from "@gofynd/nitrozen-vue";
import MirageImageUploaderPanel from "./panel.vue";
import MirageImageUploaderList from "./list.vue";
// import MirageImageUploaderList from './list.vue';
// import loader from '@/components/admin/common/adm-loader';
import InlineSvg from "../inline-svg.vue";
import { copyToClipboard, detectMobileWidth } from "../../../helper/utils.js";
import axios from "axios";
import mime from "mime-types";
import MainService from "../../../services/main-service";
import {
  constructSnackBar,
  getUpload,
} from "../../../helper/image-upload-helper";

export default {
  name: "mirage-image-uploader-dialog",
  components: {
    NitrozenButton,
    NitrozenDialog,
    "mirage-image-uploader-panel": MirageImageUploaderPanel,
    "mirage-image-uploader-list": MirageImageUploaderList,
    InlineSvg,
    // loader
  },
  directives: {
    flatBtn,
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
      type: [String, Array],
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
    tags: {
      type: Array,
      default: () => {
        return [];
      },
    },
    extensionSlug: {
      type: String,
    },
    isClientApplication: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    title() {
      return `Upload ${this.label}`;
    },
    aspectR() {
      if (this.aspectRatio == "*") {
        return;
      }
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
    isHDNImage() {
      return MainService.isHDNPath(this.imageURL);
    },
    isEmpty() {
      return this.imageURL == "";
    },
    getMIMEType() {
      try {
        const url = new URL(this.imageURL);
        let mimeString = mime.lookup(url.toString());
        if (mimeString) {
          return mimeString;
        }
        mimeString = this.imageURL.split(",")[0].split(":")[1].split(";")[0];
        return mimeString;
      } catch (e) {
        return "";
      }
    },
  },
  mounted() {
    this.$refs["dialog"].$on("close", () => {
      this.visible = false;
      this.edit = false;
      this.$refs.imageuploaderpanel
        ? (this.$refs.imageuploaderpanel.croppedImageFile = "")
        : () => {};
    });
    if (!this.$snackbar?.global) {
      this.$snackbar = constructSnackBar(this.$toasted);
    }
  },
  data: function () {
    return {
      loading: false,
      data: null, // use for data transfer
      imageURL: "",
      initialImageURL: "",
      edit: false,
      visible: false,
      isCropped: false,
    };
  },
  methods: {
    detectMobileWidth,
    open() {
      this.visible = true;
      this.imageURL = this.initialImageURL = this.value;
      this.$refs["dialog"].open({
        width: this.detectMobileWidth() ? "100%" : "950px",
        height: this.detectMobileWidth() ? "100%" : "632px",
        showCloseButton: true,
        dismissible: false,
      });
    },
    close(e) {
      this.$refs["dialog"].close(e);
    },
    $selectImage() {
      const imagePath =
        this.$refs.imageuploaderpanel.croppedImageFile || this.imageURL;
      let altText = "";
      let additionalCost = "";
      let price = null;
      if (!this.isClientApplication) {
        altText = this.$refs.imageuploaderlist.altText || "";
        additionalCost = this.$refs.imageuploaderlist.isAdditionCost || false;
        price = this.$refs.imageuploaderlist.addPriceText || null;
        // validation
        if (!imagePath?.length) {
          this.$snackbar.global.showError('Please select Image');
          return;
        }
        let isValid = true;
        if (!altText?.length) {
          this.$refs.imageuploaderlist.altTextErr = true;
          isValid = false;
        } else this.$refs.imageuploaderlist.altTextErr = false;
        if (additionalCost && !price) {
          this.$refs.imageuploaderlist.addPriceErr = true;
          isValid = false;
        } else this.$refs.imageuploaderlist.addPriceErr = false;
        if (!isValid) return;
        //
      }
      let payload = {
        imageUrl: imagePath,
        altText,
        additionalCost,
        price,
      };
      if (this.aspectRatio === "*") {
        payload.imageUrl = this.imageURL;
      }
      if (this.isClientApplication) {
        payload = payload.imageUrl;
      }
      console.log("imagePath ==", payload);
      if (this.initialImageURL == imagePath || this.aspectRatio === "*") {
        this.$emit("save", payload);
        this.close();
        return;
      }
      if (imagePath == "") {
        this.$emit("delete", imagePath);
        this.close("delete");
      }
      //   if (this.aspectRatio === "*") {
      //     this.$emit("save", {
      //       imageUrl: this.imageURL,
      //       altText,
      //       additionalCost,
      //       price,
      //     });
      //     this.close();
      //     return;
      //   }
      //adding below try catch block to prevent using pre-uploaded image without min-max and resolution check
      try {
        this.getMeta(this.imageURL).then((data) => {
          if (!this.validateMinimumResolution(data)) {
            this.$snackbar.global.showError(
              `Minimum required dimensions are ${this.minimumResolution.width} x ${this.minimumResolution.height}`
            );
            return;
          }
          if (!this.validateMaximumResolution(data)) {
            this.$snackbar.global.showError(
              `Maximum allowed dimensions are ${this.maximumResolution.width} x ${this.maximumResolution.height}`
            );
            return;
          }
          if (this.aspectR && this.getMIMEType != "image/svg+xml") {
            if (!this.checkRatioError(data)) return;
          }
          this.$emit("save", this.imageURL);
          this.close("save");
        });
      } catch (err) {
        console.log(err);
      }
    },
    checkRatioError(data) {
      if (Array.isArray(this.aspectR)) {
        const ratioNotMatching = [];
        this.aspectR?.forEach((ratio) => {
          const aspectQ = parseFloat((ratio.x / ratio.y).toFixed(2));
          const imageQ = parseFloat((data.width / data.height).toFixed(2));
          if (!(aspectQ <= imageQ + 0.01 && aspectQ >= imageQ - 0.01)) {
            ratioNotMatching.push(ratio);
          }
        });
        if (ratioNotMatching?.length === this.aspectR.length) {
          this.$snackbar.global.showError(
            `Aspect ratio not matching with ${ratioNotMatching
              .map(({ x, y }) => x + ":" + y)
              .join(", ")}, Please crop an image.`
          );
          return false;
        }
        return true;
      } else {
        const aspectQ = parseFloat(
          (this.aspectR.x / this.aspectR.y).toFixed(2)
        );
        const imageQ = parseFloat((data.width / data.height).toFixed(2));
        if (!(aspectQ <= imageQ + 0.01 && aspectQ >= imageQ - 0.01)) {
          this.$snackbar.global.showError(
            `Aspect ratio not matching with ${this.aspectRatio}, Please crop an image.`
          );
          return false;
        }
        return true;
      }
    },
    $uploadImage() {
      const imagePath =
        this.$refs.imageuploaderpanel.croppedImageFile || this.imageURL;
      var image = new Image();
      image.onload = () => {
        if (!this.validateMinimumResolution(image)) {
          this.$snackbar.global.showError(
            `Minimum required dimensions are ${this.minimumResolution.width} x ${this.minimumResolution.height}`
          );
          return;
        }
        if (!this.validateMaximumResolution(image)) {
          this.$snackbar.global.showError(
            `Maximum allowed dimensions are ${this.maximumResolution.width} x ${this.maximumResolution.height}`
          );
          return;
        }
        if (this.aspectR && this.getMIMEType != "image/svg+xml") {
          if (!this.checkRatioError(image)) return;
          //   const aspectQ = parseFloat(
          //     (this.aspectR.x / this.aspectR.y).toFixed(2)
          //   );
          //   const imageQ = parseFloat((image.width / image.height).toFixed(2));
          //   if (!(aspectQ <= imageQ + 0.01 && aspectQ >= imageQ - 0.01)) {
          //     console.log(aspectQ, imageQ);
          //     this.$snackbar.global.showError(
          //       `Aspect ratio not matching with ${this.aspectRatio}, Please crop an image.`
          //     );
          //     return;
          //   }
        }
        this.$setImage(this.resizeToMaximumResolution(image));
        if (this.namespace && /^data:/i.test(this.imageURL)) {
          this.uploadToPixelbin(this.dataURItoFile(this.imageURL)).then(
            (cdn_url) => {
              this.imageURL = cdn_url;
              this.isCropped = false;
              this.$snackbar.global.showSuccess("Image Uploaded");
            }
          );
        } else if (!this.isHDNImage) {
          console.log(this.isHDNImage, "this.isHDNImage");
          // download external image file and upload to HDN
          this.externalURIToFile(this.imageURL).then((file) => {
            if (file) {
              this.uploadToPixelbin(file).then((cdn_url) => {
                this.imageURL = cdn_url;
                this.isCropped = false;
                this.$snackbar.global.showSuccess("Image Uploaded");
              });
            } else {
              this.$snackbar.global.showError(
                `Failed to download external image`
              );
            }
          });
        }
      };
      image.src = imagePath;
      // image.src = this.getNonCORSHDNURL(imagePath);
    },
    dataURItoFile(dataURI) {
      try {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(",")[1]);

        // separate out the mime component
        var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);

        // create a view into the buffer
        var ia = new Uint8Array(ab);

        // set the bytes of the buffer to the correct values
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        // write the ArrayBuffer to a blob, and you're done
        var file = new File(
          [ab],
          `${this.fileName.replace(/ /g, "-")}.${mime.extension(mimeString)}`,
          { type: mimeString }
        );
        return file;
      } catch (err) {
        return dataURI;
      }
    },
    externalURIToFile(fileURI) {
      const nonCORSURL = this.getNonCORSHDNURL(fileURI, true);
      const filePath = new URL(fileURI).pathname;
      const fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
      return axios({
        type: "get",
        url: nonCORSURL,
        responseType: "blob",
      })
        .then((response) => {
          const f = response.data;
          return new File([f], fileName, {
            type: mime.contentType(fileName),
          });
        })
        .catch((err) => {
          console.error(err);
          return null;
        });
    },
    validateMinimumResolution(image) {
      if (
        this.minimumResolution &&
        this.getMIMEType != "image/svg+xml" &&
        (image.width < this.minimumResolution.width ||
          image.height < this.minimumResolution.height)
      ) {
        return false;
      }
      return true;
    },
    validateMaximumResolution(image) {
      if (
        this.maximumResolution &&
        this.getMIMEType != "image/svg+xml" &&
        (image.width > this.maximumResolution.width ||
          image.height > this.maximumResolution.height)
      ) {
        return false;
      }
      return true;
    },
    resizeToMaximumResolution(image) {
      // TODO: implement resizeToMaximumResolution without tanting canvas
      return image.src;
      // if (
      //     this.maximumResolution &&
      //     (image.naturalWidth > this.maximumResolution.width ||
      //         image.naturalHeight > this.maximumResolution.height)
      // ) {
      //     let canvas = document.createElement('canvas');

      //     console.log(image);
      //     canvas.width = this.maximumResolution.width;
      //     canvas.height = this.maximumResolution.height;
      //     canvas
      //         .getContext('2d')
      //         .drawImage(
      //             image,
      //             0,
      //             0,
      //             image.naturalWidth,
      //             image.naturalHeight,
      //             0,
      //             0,
      //             canvas.width,
      //             canvas.height
      //         );
      //     console.log(canvas);
      //     return canvas.toDataURL();
      // }
      // return image.src;
    },
    async getNonCORSHDNURL(path, any) {
      try {
        // to bypass HDN CORS issue
        if (MainService.isHDNPath(path) || any) {
          path = await MainService.getProxyURL(path);
          return `${path}`;
        }
        return path;
      } catch (err) {
        return path;
      }
    },
    $setCropping(edit, cropped = false) {
      this.$refs.imageuploaderpanel.cropping = edit;
      this.edit = edit;
      this.isCropped = cropped;
    },
    $setImage(e) {
      if (this.edit) {
        this.$snackbar.global.showError(`Can't change image in edit mode`);
        return;
      }
      this.imageURL = e;
      this.$refs.imageuploaderpanel.croppedImageFile = "";
    },
    $removeImage() {
      this.imageURL = "";
      this.$refs.imageuploaderpanel.croppedImageFile = "";
      if (this.$refs?.imageuploaderpanel?.$refs?.inputFile)
        this.$refs.imageuploaderpanel.$refs.inputFile.value = null;
    },
    handleClose() {
    if (this.$refs?.imageuploaderpanel?.$refs?.inputFile)
        this.$refs.imageuploaderpanel.$refs.inputFile.value = null;
    },
    uploadToPixelbin(file) {
      if (!this.namespace) return;
      if (file) {
        // let body = {
        //     file_name: file.name,
        //     content_type: file.type,
        //     size: file.size,
        //     tags: this.tags
        // };
        // if(this.extensionSlug){
        //     body.params = {
        //      extension_slug: this.extensionSlug
        //     }
        // }
        // let request = { body };
        this.loading = true;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("content_type", file.type);
        formData.append("tags", this.tags);
        formData.append("namespace", this.namespace);
        if (this.extensionSlug)
          formData.append("extension_slug", this.extensionSlug);
        //   return MainService.upload(formData)
        const upload = getUpload(this.isClientApplication);
        return upload(formData)
          .then(({ data }) => {
            if (data?.data?.cdn?.url) {
              return data.data.cdn.url;
            }
          })
          .catch((err) => {
            this.$snackbar.global.showError(
              err?.response?.data?.message
                ? err.response.data.message
                : "Failed to upload image"
            );
            console.log(err);
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    copyToClipboard() {
      copyToClipboard(this.imageURL);
      this.$snackbar.global.showInfo("URL copied to clipboard", 1000);
    },
    getMeta(url) {
      if (url == "") {
        this.$emit("save", url);
        this.close();
      }
      return new Promise((resolve) => {
        var img = new Image();
        img.addEventListener("load", function () {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        });
        img.src = url;
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../../styles/main.less";
.uploading {
  pointer-events: none;
}
::v-deep .nitrozen-dialog {
  @media @mobile {
    overflow-y: scroll;
  }
  .nitrozen-dialog-body {
    @media @mobile {
      min-height: auto;
    }
  }
}
.dialog-body {
  display: flex;
  gap: 24px;
  height: 88%;
  @media @mobile {
    display: block;
  }
  .image-uploader-panel {
    flex: 1;
  }
  .dialog-saperator {
    width: 48px;
  }
  .image-uploader-list {
    flex: 1;
    @media @mobile {
      margin-top: 24px;
    }
  }
}
.footer-event {
  width: 425px;
  display: flex;
  justify-content: flex-end;
  @media @mobile {
    width: 100%;
    justify-content: start;
  }
  ::v-deep button {
    font-size: 12px;
    .n-button-content {
      align-items: flex-start;
    }
  }
  &.left-align {
    justify-content: flex-start;
  }
}
.footer-saperator {
  flex: 1;
}
.action-buttons {
  display: flex;
  .copy {
    cursor: pointer;
    display: flex;
    width: 40px;
    height: 40px;
  }
}
.client-application-dialog {
    ::v-deep .nitrozen-dialog-body {
        @media @mobile {
            padding: 0;
        }
    }
}
</style>
