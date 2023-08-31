<template>
  <div>
    <div v-if="$slots.default" @click="openTestDialog">
      <slot />
    </div>
    <nitrozen-button
      v-else-if="vFlatBtn"
      :theme="btnTheme"
      class="dialog-btn"
      @click="openTestDialog"
      v-flat-btn
      >
      {{ btnText }}
    </nitrozen-button>
    <nitrozen-button
      v-else-if="vStrokeBtn"
      :theme="btnTheme"
      class="dialog-btn"
      @click="openTestDialog"
      v-stroke-btn
      >
      {{ btnText }}
    </nitrozen-button>
    <nitrozen-dialog
      ref="custom-dialog"
      class="custom-dialog"
      :title="title"
      @close="handleClose"
    >
      <template slot="body">
        <div>{{ message }}</div>
      </template>
    </nitrozen-dialog>
  </div>
</template>

<script>
import { NitrozenDialog, NitrozenButton } from "@gofynd/nitrozen-vue";

export default {
  name: "warning-dialog",
  props: {
    vStrokeBtn: {
      type: Boolean,
      default: true,
    },
    vFlatBtn: {
      type: Boolean,
      default: false,
    },
    btnTheme: {
      type: String,
      default: "secondary",
    },
    btnText: {
      type: String,
      default: "open",
    },
    message: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "confirmation",
    },
    neutralButtonLabel: {
      type: String,
      default: 'cancel',
    },
    positiveButtonLabel: {
      type: String,
      default: 'confirm',
    },
    confirmCallback: null,
  },
  components: {
    "nitrozen-dialog": NitrozenDialog,
    "nitrozen-button": NitrozenButton,
  },
  methods: {
    openTestDialog() {
      const dialogConfig = {
        width: "40rem",
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
      dialogConfig.neutralButtonLabel = this.neutralButtonLabel;
      dialogConfig.positiveButtonLabel = this.positiveButtonLabel;
      this.$refs["custom-dialog"].open(dialogConfig);
      this.$nextTick(() => {
        document.body.style.position = '';
      });
    },
    handleClose(label) {
      if (label === this.positiveButtonLabel) {
        this.$emit("confirm");
        if (this.confirmCallback) this.confirmCallback()
      } else if (label === this.neutralButtonLabel) {
        this.$emit("cancel");
      }
    },
  },
};
</script>

<style scoped lang="less">
.custom-dialog {
  ::v-deep .nitrozen-dialog {
    width: 22rem;
  }
}
</style>
