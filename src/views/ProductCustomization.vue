<template>
  <div>
    <breadcrumb />
    <div>
      <div
        :class="{
          'main-container': true,
          'bulk-update-container': activeGroupIndex == 1,
        }"
      >
        <div class="title-wrap">
          <div class="head-wrap">
            <div @click="handleBack" class="icon-wrap">
              <inline-svg class="icon" src="back-icon"></inline-svg>
            </div>
            <h4 class="main-title">Add Product</h4>
          </div>
          <p class="description">Some details about new version creation</p>
        </div>
        <nitrozen-tab
          class="group-tab"
          :activeIndex="activeGroupIndex"
          @tab-change="changeGroupIndex"
          :tabItem="tabs"
          :label="'name'"
        >
        </nitrozen-tab>
        <all-products v-if="activeGroupIndex == 0"></all-products>
      </div>
      <bulk-upload v-if="activeGroupIndex == 1"></bulk-upload>
    </div>
  </div>
</template>

<script>
import { NitrozenTab } from "@gofynd/nitrozen-vue";
import inlineSvg from "../components/common/inline-svg.vue";
import AllProducts from "./Tabs/AllProducts.vue";
import BulkUpload from "./Tabs/BulkUpload.vue";
import Breadcrumb from '../components/common/breadcrumb.vue';
import { toFeature } from '../helper/redirect';

export default {
  components: {
    "inline-svg": inlineSvg,
    "nitrozen-tab": NitrozenTab,
    "all-products": AllProducts,
    "bulk-upload": BulkUpload,
    "breadcrumb": Breadcrumb,
},
  data() {
    return {
      activeGroupIndex: this.$route.query.activeTab || 0,
      tabs: [{ name: "All Product" }, { name: "Bulk Update" }],
    };
  },
  methods: {
    handleBack() {
      // this.$router.go(-1);
      toFeature(this);
    },
    changeGroupIndex(item) {
      if (item.index !== this.activeGroupIndex) {
        this.activeGroupIndex = item.index;
        this.$router.replace({
          query: {
            ...this.$route.query,
            activeTab: this.activeGroupIndex,
          },
        });
      }
    },
  },
};
</script>

<style scoped lang="less">
@import "../styles/main.less";
.main-container {
  .title-wrap {
    .head-wrap {
      display: flex;
      .icon-wrap {
        cursor: pointer;
        margin-right: 16px;
      }
    }
    .description {
      margin-top: 4px;
      margin-left: 40px;
    }
  }
  .group-tab {
    margin-top: 24px;
    border-bottom: 1px solid @gray5;
    ::v-deep .nitrozen-tab {
      .nitrozen-tab-item {
        padding: 0 30px 10px 30px;
      }
    }
  }
}
.bulk-update-container {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
