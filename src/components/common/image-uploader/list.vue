<template>
  <div class="image-uploader-list">
    <div class="top-section">
      <div class="alt-text-wrap">
        <nitrozen-input
          type="text"
          placeholder="Image alt Text"
          :value="altText"
          :maxlength="MAX_INPUT_CHARACTER"
          @change="onAltTextChange"
        ></nitrozen-input>
        <div class="error-message" v-if="altTextErr">
          This field is mandatory
        </div>
      </div>
      <!-- [additional_price_changes] -->
      <!-- <div class="toggle-button">
        <div class="g-text">{{ "Additional Cost" }}</div>
        <nitrozen-toggle-btn
          class="toggle-position"
          :value="isAdditionCost"
          @change="handleAdditionalCostChange"
        ></nitrozen-toggle-btn>
      </div>
      <div :class="{'price-wrap': true, 'is-price-wrap': !isAdditionCost}">
        <nitrozen-input
          type="number"
          label="Add Price"
          :showPrefix="true"
          prefix="₹"
          :value="addPriceText"
          @change="onAddPriceChange"
        ></nitrozen-input>
        <div class="error-message" v-if="addPriceErr">
          This field is mandatory
        </div>
      </div> -->
    </div>
    <div class="bottom-section">
      <!-- <nitrozen-dropdown
        class="input-field"
        placeholder="Select Images Source"
        :items="imageSources"
        v-model="imageSource"
      ></nitrozen-dropdown> -->
      <nitrozen-input
        v-show="imageSource != 'namespace_images' || this.namespace"
        class="input-field"
        :showSearchIcon="true"
        type="search"
        :placeholder="`Search ${
          imageSource != 'namespace_images' ? imageSource : ''
        } images`"
        v-model="searchText"
        @input="debounceInput"
      ></nitrozen-input>
      <div class="no-result" v-if="filteredImageList.length == 0 && !loading">
        <img src="../../../assets/pngs/empty_state.png" alt="no-item-logo" />
        No Result Found
      </div>
      <div v-else class="image-list" @scroll="$handleScroll">
        <div
          v-for="(item, i) in filteredImageList"
          :key="i"
          class="image-list-item"
          :title="item.text || ''"
          @click="$selectImage(item.secure_url)"
        >
          <img
            :src="item.thumbnail_url"
            :alt="item.text || item.secure_url"
            @error="$imageError($event, item)"
            @load="$imageLoad($event, item)"
            :ref="`image`"
          />
          <div class="image-meta" @mouseover="calculateDimensions(item)">
            <span class="dimensions" v-if="$refs.image && $refs.image[i]">
              {{ item.naturalDimensions }}
            </span>
          </div>
        </div>
      </div>
      <loader v-if="loading"></loader>
    </div>
  </div>
</template>

<script>
import {
  NitrozenInput,
  //  NitrozenToggleBtn
} from "@gofynd/nitrozen-vue";
import loader from "../loader.vue";
import { debounce } from "../../../helper/utils";
import MainService from "../../../services/main-service";
import { constructSnackBar } from "../../../helper/image-upload-helper";
import { MAX_INPUT_CHARACTER } from "../../../helper/constants";

const imageSources = [
  {
    text: "My Images",
    value: "namespace_images",
    onlyApp: false,
  },
  {
    text: "Brands",
    value: "brands",
    onlyApp: true,
  },
  {
    text: "Collections",
    value: "collections",
    onlyApp: true,
  },
  {
    text: "Products",
    value: "products",
    onlyApp: true,
  },
];
export default {
  name: "mirage-image-uploader-list",
  components: {
    "nitrozen-input": NitrozenInput,
    // "nitrozen-toggle-btn": NitrozenToggleBtn,
    // "nitrozen-dropdown": NitrozenDropdown,
    loader,
  },
  props: {
    mediaFolder: {
      default: "",
    },
    minimumResolution: {
      type: Object,
    },
    namespace: {
      type: String,
    },
    tags: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  computed: {
    imageSources() {
      return imageSources.filter((i) => {
        if (!this.applicationId) {
          return !i.onlyApp;
        }
        return true;
      });
    },
    filteredImageList() {
      let filteredImageList = [];
      if (
        this.searchText &&
        this.imageSource != "products" &&
        !this.namespace
      ) {
        filteredImageList = this.imageList.filter((i) => {
          if (!i) console.log(i);
          return (
            i.secure_url &&
            i.text &&
            i.text.toLowerCase().includes(this.searchText.toLowerCase())
          );
        });
      } else {
        filteredImageList = this.imageList.filter((a) => a.secure_url);
      }
      filteredImageList = filteredImageList.map((i) => {
        try {
          const imageURL = i.secure_url;
          i.thumbnail_url = i.secure_url;
          const url = new URL(imageURL);
          if (MainService.isHDNPath(imageURL)) {
            // prepare get original image url
            const sizeToReplace = this.hdnSizes.find((hs) => {
              return imageURL.includes(hs);
            });
            if (sizeToReplace) {
              i.secure_url = imageURL.replace(
                `/${sizeToReplace}/`,
                "/original/"
              );
            }
            i.thumbnail_url = i.secure_url.replace(
              "/original/",
              `/resize-h:90,w:0/`
            );
          } else if (url.hostname == "res.cloudinary.com") {
            i.thumbnail_url = i.secure_url.replace(
              "/upload/",
              `/upload/c_thumb,h_90/`
            );
          }
        } catch (err) {
          return i;
        }
        return i;
      });
      return filteredImageList;
    },
  },
  watch: {
    imageSource() {
      this.$loadImages();
    },
  },
  data: function () {
    return {
      loading: false,
      imageSource: "namespace_images",
      searchText: "",
      imageList: [],
      productPagination: { current: 0, has_next: true }, // for product images
      Pagination: { page: 0, nextPage: 1, limit: 16 }, // for grindor images
      // hdns: MainService.hdns(),
      hdnSizes: ["540x0", "240x0", "50x0", "720x0", "360x0"],
      applicationId: this.$route.params.applicationId,
      altText: "",
      altTextErr: false,
      addPriceText: "",
      addPriceErr: false,
      isAdditionCost: false,
      MAX_INPUT_CHARACTER,
    };
  },
  mounted() {
    this.$loadImages();
    const source = imageSources.find((s) => {
      return s.value === "namespace_images";
    });
    source && (source.text = "Product Customization");
    if (!this.$snackbar?.global) {
      this.$snackbar = constructSnackBar(this.$toasted);
    }
  },
  methods: {
    onAltTextChange($event) {
      this.altText = $event.target.value;
      this.altTextErr = false;
    },
    onAddPriceChange($event) {
      this.addPriceText = $event.target.value;
      this.addPriceErr = false;
    },
    handleAdditionalCostChange() {
      this.isAdditionCost = !this.isAdditionCost;
    },
    debounceInput: debounce(function (e) {
      switch (this.imageSource) {
        case "namespace_images":
          if (!this.namespace) return;
          this.imageList = [];
          this.Pagination = Object.assign({}, this.Pagination, {
            page: 0,
            nextPage: 1,
            search: e,
          });
          this.getMyImages();
          break;
        case "products":
          this.imageList = [];
          this.productPagination = { current: 0, has_next: true };
          this.getProducts(e);
          break;
      }
      // call search function
    }, 500),
    // not used getNaturalDimensions
    getNaturalDimensions(i) {
      const img = this.$refs.image[i];
      return `${img.naturalWidth}x${img.naturalHeight}`;
    },
    calculateDimensions(item) {
      if (!item.naturalDimensions) {
        this.getMeta(item.secure_url).then((data) => {
          item.naturalDimensions = data;
          item.__ob__.dep.notify();
        });
      }
    },
    getMeta(url) {
      return new Promise((resolve) => {
        var img = new Image();
        img.addEventListener("load", function () {
          resolve(`${img.naturalWidth}x${img.naturalHeight}`);
        });
        img.src = url;
      });
    },
    $loadImages() {
      this.imageList = [];
      this;
      if (this.imageSource !== "namespace_images") {
        this.Pagination = { page: 0, nextPage: 1, limit: 16 };
      }
      switch (this.imageSource) {
        case "namespace_images":
          this.getMyImages();
          break;
        // case "brands":
        //   this.getBrands();
        //   break;
        // case "collections":
        //   this.getCollection();
        //   break;
        case "products":
          this.getProducts();
          break;
      }
      // this.getCategories();
    },
    getMyImages() {
      if (!this.namespace) {
        console.warn("namespace is required");
      } else {
        if (this.Pagination.nextPage == null) return;
        this.Pagination.page += 1;
        this.Pagination.tags = this.tags;
        this.loading = true;
        const query = {
          namespace: this.namespace,
          page: this.Pagination.page,
          application_id: this.$route.params.application_id,
        };
        MainService.explore(query)
          .then(({ data }) => {
            data.items = data.items.map((f) => {
              return {
                text: f.file_name,
                secure_url: f.cdn.url,
                ...f,
              };
            });
            this.imageList = this.imageList.concat(data.items);
            this.Pagination.nextPage = data.nextPage;
            if (this.imageList && this.imageList.length === 0) {
              this.showNoImageText = true;
            }
          })
          .catch((err) => {
            console.log(err);
            this.showNoImageText = false;
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },

    /**
     * images data API's
     */
    // getBrands(q = "") {
    //   this.loading = true;
    //   return BrandPageService.fetchBrands({
    //     page: 1,
    //     page_size: 200,
    //     q,
    //   })
    //     .then((res) => {
    //       // logo
    //       const logos = res.data.data
    //         ? res.data.data.map((b) => {
    //             return { text: b.name, ...b.logo };
    //           })
    //         : [];
    //       // image
    //       const images = res.data.data
    //         ? res.data.data.map((b) => {
    //             return { text: b.name, ...b.image };
    //           })
    //         : [];
    //       const entityData = [...logos, ...images];
    //       this.imageList = this.imageList.concat(entityData);
    //       return entityData;
    //     })
    //     .catch((ex) => {
    //       this.$snackbar.global.showError(
    //         `Failed to load Brand image ${
    //           ex && ex.message ? " : " + ex.message : ""
    //         }`
    //       );
    //       return [];
    //     })
    //     .finally(() => {
    //       this.loading = false;
    //     });
    // },
    // getCollection() {
    //   this.loading = true;
    //   return AdminCollectionService.fetchCollections({
    //     page_no: 1,
    //     page_size: 200,
    //   })
    //     .then((res) => {
    //       const landscape = res.data.items
    //         ? res.data.items.map((c) => {
    //             return { text: c.name, ...c.banners.landscape };
    //           })
    //         : [];
    //       const portrait = res.data.items
    //         ? res.data.items.map((c) => {
    //             return { text: c.name, ...c.banners.portrait };
    //           })
    //         : [];
    //       const logos = res.data.items
    //         ? res.data.items.map((c) => {
    //             return { text: c.name, ...c.banners.logo };
    //           })
    //         : [];
    //       const entityData = [...landscape, ...portrait, ...logos];
    //       this.imageList = this.imageList.concat(entityData);
    //       return entityData;
    //     })
    //     .catch((ex) => {
    //       this.$snackbar.global.showError(
    //         `Failed to load Collection image ${
    //           ex && ex.message ? " : " + ex.message : ""
    //         }`
    //       );
    //       return [];
    //     })
    //     .finally(() => {
    //       this.loading = false;
    //     });
    // },
    getProducts() {
      if (!this.productPagination.has_next) {
        return;
      }
      this.loading = true;

      return MainService.getProductsList({
        q: this.searchText,
        page: this.productPagination.current + 1,
        page_size: 10,
        image_size: "large",
      })
        .then(({ data }) => {
          this.productPagination = data.page;
          const entityData = [];
          //   const landscape = data.items.map((i) => {
          //     i.medias.map((img) => {
          //       if (img.type === "image") {
          //         entityData.push({ text: i.name, secure_url: img.url, ...img });
          //       }
          //     });
          //   });
          this.imageList = this.imageList.concat(entityData);
          return entityData;
        })
        .catch((ex) => {
          this.$snackbar.global.showError(
            `Failed to load Product image ${
              ex && ex.message ? " : " + ex.message : ""
            }`
          );
          return [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // getCategories(q = "") {
    //   this.loading = true;
    //   return CategoryService.fetchCategories({
    //     page: 1,
    //     page_size: 200,
    //     q,
    //   })
    //     .then((res) => {
    //       const categories = {
    //         l1_category: [],
    //         l2_category: [],
    //         category: [],
    //       };

    //       Object.keys(res.data.data).map((s) => {
    //         res.data.data[s].items.forEach((l1) => {
    //           categories["l1_category"].push(l1);
    //           l1.childs.forEach((l2) => {
    //             categories["l2_category"].push(l2);
    //             l2.childs.forEach((l3) => {
    //               categories["category"].push(l3);
    //             });
    //           });
    //         });
    //       });
    //       const l1_category = categories["l1_category"].map((b) => {
    //         return { text: b.name, ...b.image };
    //       });
    //       const l2_category = categories["l2_category"].map((b) => {
    //         return { text: b.name, ...b.image };
    //       });
    //       const category = categories["category"].map((b) => {
    //         return { text: b.name, ...b.image };
    //       });
    //       const entityData = [...l1_category, ...l2_category, ...category];
    //       this.imageList = this.imageList.concat(entityData);
    //       return entityData;
    //     })
    //     .catch((ex) => {
    //       this.$snackbar.global.showError(
    //         `Failed to load Category image ${
    //           ex && ex.message ? " : " + ex.message : ""
    //         }`
    //       );
    //       return [];
    //     })
    //     .finally(() => {
    //       this.loading = false;
    //     });
    // },
    $handleScroll(e) {
      let imageListElement = e.srcElement;
      if (
        parseInt(imageListElement.scrollTop + imageListElement.offsetHeight) ===
        imageListElement.scrollHeight
      ) {
        switch (this.imageSource) {
          case "namespace_images":
            if (
              !this.namespace ||
              (this.imageList && this.imageList.length === 0)
            ) {
              return;
            }
            this.getMyImages();
            break;
          case "products":
            this.getProducts();
            break;
        }
      }
    },
    $selectImage(url) {
      this.$emit("imageSelected", url);
    },
    $imageError(e, item) {
      console.error(e);
      item.secure_url = "";
    },
    $imageLoad(e, item) {
      item.__ob__.dep.notify();
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../../styles/main.less";
.image-uploader-list {
  display: flex;
  flex-direction: column;
  // height: 480px;
  gap: 25px;
  .top-section {
    display: flex;
    flex-direction: column;
    .toggle-button {
      display: flex;
      justify-content: space-between;
      margin-top: 17px;
    }
    .price-wrap {
      margin-top: 12px;
    }
    .is-price-wrap {
      display: none;
    }
  }
  .bottom-section {
    height: 100%;
    border: 1px solid @gray5;
    padding: 12px;
    border-radius: 4px;
    .no-result {
      text-align: center;
    }
  }
  .input-field {
    margin-bottom: 12px;
    ::v-deep .nitrozen-select-wrapper {
      z-index: 3;
    }
  }
  .not-found {
    width: 400px;
    padding: 0px;
    @media @mobile {
      width: 100%;
    }
  }
  .image-list {
    overflow: auto;
    .mirage-scrollbar;
    .image-list-item {
      display: inline-block;
      cursor: pointer;
      margin: 7px;
      width: 90px;
      height: 90px;
      overflow: hidden;
      position: relative;
      img {
        width: auto;
        height: 90px;
        display: block;
        margin: 0 auto;
      }
      &:hover {
        box-shadow: 0 9px 13px 0 rgba(221, 221, 221, 0.5);
        .image-meta {
          visibility: visible;
          opacity: 1;
        }
      }
      .image-meta {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(29, 106, 154, 0.72);
        color: #fff;
        visibility: hidden;
        opacity: 0;

        /* transition effect. not necessary */
        transition: opacity 0.2s, visibility 0.2s;
        .dimensions {
          position: absolute;
          font-size: 10px;
          bottom: 0;
          right: 2px;
        }
      }
    }
  }
}
</style>
