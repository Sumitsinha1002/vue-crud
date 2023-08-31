<template>
  <div class="choose-template-wrap">
    <nitrozen-dialog
      ref="choose-template-dialog"
      :class="{
        'choose-template-dialog': true,
        'no-templates': !items?.length,
      }"
      @close="handleClose"
      title="Choose Template"
    >
      <template slot="body">
        <nitrozen-dropdown
          v-if="!loader && items?.length"
          placeholder="Choose Template"
          :value="selected"
          :items="generateOptions"
          label="Select Template"
          tooltip="Select Template to associate the selected product"
          @change="(value) => handleDropdownChanges(value)"
        ></nitrozen-dropdown>
        <div v-else-if="!loader " class="empty-list">
          <img src="../assets/add-page.png" alt="no-item-logo" />
          <div class="message-wrap">
            <h5 class="main-message">
              Seems you have not added any customisation template yet
            </h5>
          </div>
          <nitrozen-button
            class="add-button"
            theme="secondary"
            @click="redirectToManage"
            v-flat-btn
          >
            Add
          </nitrozen-button>
        </div>
      </template>
    </nitrozen-dialog>
  </div>
</template>

<script>
import {
  NitrozenDialog,
  NitrozenDropdown,
  NitrozenButton,
} from "@gofynd/nitrozen-vue";
import { toCreate } from "../helper/redirect";
import MainService from "../services/main-service";

export default {
  components: {
    "nitrozen-dialog": NitrozenDialog,
    "nitrozen-dropdown": NitrozenDropdown,
    "nitrozen-button": NitrozenButton,
  },
  data() {
    return {
      selected: null,
      items: [],
      loader: true,
    };
  },
  mounted() {
    this.getTemplateDetails();
    // this.openDialog();
  },
  computed: {
    generateOptions() {
      return this.items.map((item) => {
        return { text: item.template_name, value: item._id };
      });
    },
  },
  methods: {
    handleDropdownChanges(value) {
      this.selected = value;
    },
    redirectToManage() {
      toCreate(this);
    },
    getTemplateDetails() {
      this.loader = true;
      MainService.getTemplates({
        application_id: this.$route.params.application_id,
      })
        .then((res) => {
          this.items = res?.data?.data || [];
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.loader = false));
    },
    openDialog() {
      const dialogConfig = {
        width: "28rem",
        "border-radius": "12px",
        dismissible: true,
      };
      if (this.isMobile) {
        dialogConfig.height = "100%";
        dialogConfig.width = "100%";
        delete dialogConfig["border-radius"];
        dialogConfig.margin = "0%";
      }
      dialogConfig.showCloseButton = true;
      dialogConfig.neutralButtonLabel = "";
      dialogConfig.positiveButtonLabel = "Apply";
      this.$refs["choose-template-dialog"].open(dialogConfig);
      this.$nextTick(() => {
        document.body.style.position = "";
      });
    },
    handleClose(label) {
      if (label === "Apply") {
        if (!this.selected)
          this.$snackbar.global.showError("Please Select a Template");
        this.$emit("confirm", this.selected);
      }
    },
  },
};
</script>

<style scoped lang="less">
.choose-template-dialog {
  ::v-deep .nitrozen-dialog-body {
    overflow: initial;
  }
  ::v-deep .nitrozen-dialog {
    border-radius: 8px;
  }
  &.no-templates {
    ::v-deep .nitrozen-dialog-footer {
      display: none;
      .footer-event {
        gap: 10px;
      }
    }
  }
  ::v-deep .nitrozen-dialog-header {
    border-bottom: 0;
    padding: 24px;
    margin: 0;
    height: auto;
    font-weight: 600;
    font-size: 24px;
    line-height: 24px;
    .nitrozen-inline-svg {
      svg {
        width: 14px;
        height: 14px;
      }
    }
  }
  .empty-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 272px;
    text-align: center;
    padding: 24px;
    margin: auto;
    padding-bottom: 84px;
    .message-wrap {
      .main-message {
        margin: -32px 0 16px 0;
      }
      .no-list-p {
        line-height: 19.2px;
      }
    }
    // .add-button {
    //   margin-top: 16px;
    // }
  }
}
</style>
