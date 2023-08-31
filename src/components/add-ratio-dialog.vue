<template>
  <div class="add-option-wrap">
    <nitrozen-dialog
      ref="addOptionDialog"
      :class="{
        'add-option-dialog': true,
        'no-items': !items?.length,
      }"
      @close="handleClose"
      title="Add Options"
    >
      <template slot="body">
        <div class="body-wrap">
          <div class="item" v-for="(item, index) of items" :key="index">
            <nitrozen-input
              type="number"
              placeholder="Any number"
              label="Ratio X"
              class="custom-input"
              v-model="item.xRatio"
            />
            <nitrozen-input
              type="number"
              placeholder="Any number"
              label="Ratio Y"
              class="custom-input"
              v-model="item.yRatio"
            />
            <div
              class="icon-wrap"
              @click="($event) => deleteHandle($event, index)"
            >
              <inline-svg class="list-icon" src="delete-icon" />
            </div>
          </div>
          <div class="add-option" @click="handleAddOption">
            <inline-svg class="list-icon" src="plus-icon" />
            <span>Add Option</span>
          </div>
        </div>
      </template>
    </nitrozen-dialog>
  </div>
</template>

<script>
import { NitrozenDialog, NitrozenInput } from "@gofynd/nitrozen-vue";
import InlineSvg from "./common/inline-svg.vue";

const OPTION_TO_ADD = { xRatio: 1, yRatio: 1 };
export default {
  components: {
    "nitrozen-dialog": NitrozenDialog,
    "nitrozen-input": NitrozenInput,
    "inline-svg": InlineSvg,
  },
  props: {
    selected: [],
  },
  data() {
    const item = this.getItems() ?? [];
    return {
      items: [...item] ?? [],
      error: false,
    };
  },
  mounted() {
    if (!this.selected?.length) {
      this.handleAddOption();
    }
  },
  watch: {
    selected() {
      if (this.selected?.length) {
        this.items = this.getItems();
      }
    },
  },
  methods: {
    getItems() {
      return this.selected?.map((selected) => {
        return {
          xRatio: selected?.split(":")?.[0],
          yRatio: selected?.split(":")?.[1],
        };
      });
    },
    handleAddOption() {
      this.items.push({ ...OPTION_TO_ADD });
    },
    deleteHandle($event, index) {
      $event.preventDefault();
      $event.stopPropagation();
      this.items.splice(index, 1);
    },
    handleClose(label) {
      if (label === "Add") {
        const isValid = this.checkValid();
        if (isValid) {
            const result = [...this.items]?.map((item) => item.xRatio + ":" + item.yRatio)
            const uniqueItems = new Set(result)
            this.$emit(
              "confirm",
              [...uniqueItems]
            );
        }
        else this.$snackbar.global.showError("Please Enter Mandatory fields");
      }
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
      dialogConfig.positiveButtonLabel = "Add";
      this.$refs["addOptionDialog"].open(dialogConfig);
      this.$nextTick(() => {
        document.body.style.position = "";
      });
    },
    checkValid() {
      let isValid = true;
      this.items.forEach((item) => {
        if (!item.xRatio > 0 || !(item.yRatio >= 0)) isValid = false;
      });
      return isValid;
    },
  },
};
</script>

<style scoped lang="less">
@import "../styles/main.less";
.add-option-wrap {
  .body-wrap {
    border: 1px solid #e0e0e0;
    padding: 16px;
    border-radius: 4px;
    .item {
      display: flex;
      gap: 16px;
      align-items: flex-end;
    }
    .add-option {
      font-weight: 600;
      font-size: 12px;
      line-height: 17px;
      color: @RoyalBlue;
      display: flex;
      align-items: center;
      margin: 3px 0;
      cursor: pointer;
    }
    .custom-input {
      width: 224px;
    }
  }
}
::v-deep .nitrozen-dialog {
  width: fit-content !important;
}
::v-deep .nitrozen-dialog-header {
  .nitrozen-inline-svg {
    svg {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
