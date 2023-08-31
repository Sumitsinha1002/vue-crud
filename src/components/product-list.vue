<template>
  <div class="product-list-container">
    <div class="input-wrap">
      <nitrozen-checkbox
        :showIcon="false"
        :value="product.isSelected"
        @change="handleCheckChange"
        state="default"
      ></nitrozen-checkbox>
    </div>
    <div class="center">
      <div class="image-wrap" v-if="product.productImage?.length">
        <img :src="product.productImage" alt="product-image" />
      </div>
      <div v-else class="image-wrap">
        <img src="../assets/pngs/default-icon-listing.png" alt="default" />
      </div>
      <div class="description-wrap">
        <div class="title" v-if="product.productName?.length">
          {{ product.productName }} <span class="sku" v-if="product.sku"> | {{ product.sku }}</span>
          <span class="redirect-icon-wrap" @click="() => handleRedirect()">
            <inline-svg src="redirect-icon"></inline-svg>
          </span>
        </div>
        <div class="product-detail" v-if="product.templateName?.length">
          Customized template: {{ product.templateName }}
        </div>
        <!-- <div class="product-detail">Brand: {{ brand }}</div> -->
        <div class="product-detail">Category: {{ product.category }}</div>
      </div>
    </div>
    <div class="right not-customized" v-if="!product.isCustomized">
      <select-dropdown
        title="Customize"
        :options="customizeOptions"
        @click="(value) => handleCustomizeClick(value)"
      />
    </div>
    <div class="right" v-else>
      <div class="badge-wrap">
        <nitrozen-badge :state="product.isActive ? 'success' : 'error'">
          {{ product?.isActive ? "Active" : "Inactive" }}
        </nitrozen-badge>
        <nitrozen-badge state="success"> CUSTOMIZED </nitrozen-badge>
      </div>
      <div class="action-wrap" v-if="onEditClick || onDeleteClick">
        <div class="icon-wrap" @click="onEditClick">
          <inline-svg v-if="onEditClick" class="list-icon" src="edit-icon" />
        </div>
        <warning-dialog
          :confirmCallback="onDeleteClick"
          message="Are you sure you want to remove Customization ?"
          title="Confirmation"
        >
          <template v-slot:default>
            <div class="icon-wrap">
              <inline-svg class="list-icon" src="delete-icon" />
            </div>
          </template>
        </warning-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { NitrozenCheckBox, NitrozenBadge } from "@gofynd/nitrozen-vue";
import { CUSTOMIZED_DROPDOWN_OPTIONS } from "../helper/constants";
import SelectDropdown from "./common/select-dropdown.vue";
import inlineSvg from "./common/inline-svg.vue";
import WarningDialog from "./common/warning-dialog.vue";
import { mapActions } from "vuex";
export default {
  components: {
    "nitrozen-checkbox": NitrozenCheckBox,
    "nitrozen-badge": NitrozenBadge,
    "select-dropdown": SelectDropdown,
    "inline-svg": inlineSvg,
    "warning-dialog": WarningDialog,
  },
  props: {
    product: {
      type: {
        isSelected: {
          type: Boolean,
          default: false,
        },
        productImage: null,
        productName: {
          type: String,
          default: "",
        },
        sku: {
          type: String,
          default: "",
        },
        brand: {
          type: String,
          default: "",
        },
        category: {
          type: String,
          default: "",
        },
        templateName: {
          type: String,
          default: "",
        },
        isCustomized: {
          type: Boolean,
          default: false,
        },
        slug: {
          type: String,
          default: "",
        },
        isActive: {
          type: Boolean,
          default: false,
        },
        id: {
          type: String,
          default: '',
        }
      },
      default: {},
    },
    onDeleteClick: null,
    onEditClick: null,
    chooseTemplateClick: null,
  },
  computed: {
    getLink() {
      const appData = this.$store.getters?.getApplicationData;
      const ind = appData.findIndex(
        (val) => val._id == this.$route.params.application_id
      );
      if (appData[ind]?.domain.name) {
        return `https://${appData[ind]?.domain.name}/product/${this.product.slug}`;
      }
      return null;
    },
  },
  data() {
    return {
      customizeOptions: [...CUSTOMIZED_DROPDOWN_OPTIONS],
    };
  },
  methods: {
    ...mapActions(["setProductIds"]),
    handleCustomizeClick(value) {
      if (value === "addManual") this.redirectToCreateTemplate();
      else if (value === "chooseTemplate") this.chooseTemplateClick();
    },
    redirectToCreateTemplate() {
      this.setProductIds([this.product.id]);
      this.$router.push(
        `/company/${this.$route.params.company_id}/application/${this.$route.params.application_id}/template?create_new=true&publish=true`
      );
    },
    handleCheckChange() {
      this.$emit("change", !this.product.isSelected);
    },
    handleRedirect() {
      window.open(this.getLink, "_blank");
    },
  },
};
</script>

<style scoped lang="less">
@import "../styles/main.less";
.product-list-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px 18px;
  margin-bottom: 24px;
  .input-wrap {
    width: 18px;
    height: 18px;
  }
  .center {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    .image-wrap {
      img {
        border-radius: 50%;
        width: 70px;
        height: 70px;
      }
    }
    .description-wrap {
      .title {
        font-weight: 600;
        font-size: 14px;
        line-height: 21px;
        display: flex;
        align-items: center;
      }
      .product-detail {
        font-weight: 400;
        font-size: 12px;
        line-height: 21px;
        color: @subTitle;
      }
      .redirect-icon-wrap {
        margin-left: 9px;
        height: 16px;
        cursor: pointer;
      }
    }
  }
  .right {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 48px;
    .badge-wrap {
      display: flex;
      flex-direction: row;
      gap: 16px;
    }
    .action-wrap {
      display: flex;
      gap: 12px;
      justify-content: space-between;

      .icon-wrap {
        cursor: pointer;
      }
    }
    &.not-customized {
      min-width: 130px;
      ::v-deep .custom-dropdown-container {
        width: 100%;
      }
    }
  }
}
</style>
