<template>
  <div>
    <breadcrumb />
    <span class="all-container">
      <div class="main-container">
        <div class="title-wrap">
          <div class="head-wrap">
            <div @click="handleBack">
              <inline-svg class="icon" src="back-icon"></inline-svg>
            </div>
            <h4 class="main-title">Features</h4>
          </div>
          <div class="toggle-button">
            <div class="g-text">{{ is_active ? "Active" : "Inactive" }}</div>
            <nitrozen-toggle-btn
              class="toggle-position"
              :value="is_active"
              @change="toggleSalesChannel"
            ></nitrozen-toggle-btn>
          </div>
        </div>
        <p class="description">Some details about new version creation</p>
        <div class="card-wrapper">
          <card
            :isUrl="true"
            logo="product-logo"
            content="Add Product Customization"
            description="Set up rules and configure the customisation on products"
            :onClick="handleClick"
            :meta="`/company/${this.$route.params.company_id}/application/${this.$route.params.application_id}/product-customization`"
          />
          <card
            :isUrl="true"
            logo="product-page-icon"
            content="Customisation Management"
            description="Set up custom template for products general settings"
            :onClick="handleClick"
            :meta="`/company/${this.$route.params.company_id}/application/${this.$route.params.application_id}/manage-customization`"
          />
          <!-- <card logo="analytic-icon" content="Analytics" description="Two lines about the analytics and how it helps." :onClick="handleClick" meta="/analytics" /> -->
        </div>
      </div>
      <div class="learning-links-wrap">
        <div class="head">Learning Links</div>
        <div class="link-wrap" @click="handleLearningClick">
          <div class="link-image">
            <img src="../assets/learning-link.png" alt="learning-image" />
          </div>
          <div class="link-meta">
            <div class="title">How to setup and use this extension?</div>
          </div>
        </div>
      </div>
    </span>
  </div>
</template>

<style scoped lang="less">
@import "../styles/main.less";
.all-container {
  display: flex;
  .main-container {
    margin-top: 0;
    flex-grow: 1;
  }
  .learning-links-wrap {
    width: 28%;
    background: @backgroundGray3;
    border: 1px solid @gray7;
    border-radius: 12px;
    padding: 24px;
    height: fit-content;
    box-sizing: border-box;
    font-family: "Inter";
    .head {
      color: @Mako;
      font-weight: 500;
      font-size: 15px;
      line-height: 140%;
      margin-bottom: 27px;
    }
    .title {
      font-weight: 500;
      font-size: 12px;
      line-height: 140%;
      color: #333;
    }
    .link-wrap {
      display: flex;
      gap: 12px;
      cursor: pointer;
      .link-image {
        img {
          width: 57px;
        }
      }
    }
  }
}
.main-container {
  .title-wrap {
    display: flex;
    align-content: center;
    justify-content: space-between;
    .head-wrap {
      display: flex;
      gap: 16px;
      .icon {
        cursor: pointer;
      }
    }
  }
  .toggle-button {
    display: flex;
    align-items: center;
    .g-text {
      font-weight: 600;
      font-size: 16px;
      line-height: 140%;
    }
  }
  .description {
    margin-top: 4px;
    margin-left: 40px;
  }
  .card-wrapper {
    margin-top: 24px;
  }
}
</style>

<script>
import { setCompInfo } from "@/services/utils.service";
import MainService from "@/services/main-service";
import { NitrozenToggleBtn } from "@gofynd/nitrozen-vue";
import Card from "../components/common/card.vue";
import InlineSvg from "../components/common/inline-svg.vue";
import Breadcrumb from "../components/common/breadcrumb.vue";
import { LEARNING_LINK_DEV, LEARNING_LINK_PROD, LEARNING_LINK_TEST } from '../helper/constants';

export default {
  components: {
    "nitrozen-toggle-btn": NitrozenToggleBtn,
    card: Card,
    "inline-svg": InlineSvg,
    breadcrumb: Breadcrumb,
  },
  data() {
    return {
      is_active: false,
      tagId: "",
    };
  },
  mounted() {
    setCompInfo(this.$route.params.company_id);
    this.getSalesChannelStatus();
  },
  methods: {
    handleBack() {
      // this.$router.go(-1);
      const pathToRedirect = `/company/${this.$route.params.company_id}`;
      if (this.$route.path !== pathToRedirect)
        this.$router.push(pathToRedirect);
    },
    handleClick(meta) {
      this.$router.push(meta);
    },
    handleLearningClick() {
      let toRedirect = LEARNING_LINK_PROD;
      if (window?.env?.env === 'development') toRedirect = LEARNING_LINK_DEV;
      else if (window?.env?.env === 'test') toRedirect = LEARNING_LINK_TEST;
      window.open(toRedirect, '_blank');
    },
    toggleSalesChannel() {
      this.is_active = !this.is_active;
      let data = {
        is_active: this.is_active,
        application_id: this.$route.params.application_id,
        company_id: this.$route.params.company_id,
        tag_id: this.tagId,
      };
      console.log("toggleSalesChannel", data);
      MainService.toggleSalesChannel(data)
        .then((res) => {
          if (res.data.status == "success") {
            this.$snackbar.global.showSuccess("Updated Successfully");
            this.is_active = res.data.data.is_active;
            this.tagId = res.data.data.tag_id;
          } else {
            this.$snackbar.global.showSuccess(res.data.message);
          }
        })
        .catch(() => {
          this.is_active = false;
          this.$snackbar.global.showError("Please try again");
        });
    },
    getSalesChannelStatus() {
      MainService.getSalesChannelStatus({
        application_id: this.$route.params.application_id,
        company_id: this.$route.params.company_id,
      })
        .then((res) => {
          if (res.data.status == "success") {
            this.is_active = res.data.data[0].is_active;
            this.tagId = res.data.data[0].tag_id;
          }
        })
        .catch(() => {
          this.is_active = false;
        });
    },
  },
};
</script>