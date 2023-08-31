<template>
  <div class="list-wrapper">
    <div class="list-icon" v-if="imageSrc?.length">
      <svg-inline class="list-icon" :src="imageSrc" />
    </div>
    <div class="content">
      <div class="content-title-wrap">
        <h5 class="content-name">{{ name }}</h5>
        <span v-if="showDownload" @click="onDownloadClick">
          <svg-inline class="list-icon download-icon" src="download-icon" />
        </span>
      </div>
      <div class="information-wrap" v-if="informationMeta.length">
        <div
          class="item-wrap"
          v-for="(info, index) in informationMeta"
          :key="index"
        >
          <div class="item-key">{{ info.key }}: </div>
          <div class="item-value">{{ info.value }}</div>
        </div>
      </div>
    </div>
    <div class="actions">
      <div class="status" v-if="showStatus">
        <nitrozen-badge state="success" v-if="isActive">
          Active
        </nitrozen-badge>
        <nitrozen-badge state="error" v-else>Inactive</nitrozen-badge>
      </div>
      <div class="action-wrap" v-if="onEditClick || onDeleteClick">
        <div class="icon-wrap" @click="onEditClick">
          <svg-inline v-if="onEditClick" class="list-icon" src="edit-icon" />
        </div>
        <warning-dialog
          :confirmCallback="onDeleteClick"
          :message="confirmMessage"
          title="Confirmation"
          v-if="!!onDeleteClick"
        >
          <template v-slot:default>
            <div class="icon-wrap">
              <svg-inline class="list-icon" src="delete-icon" />
            </div>
          </template>
        </warning-dialog>
        <!-- <div class="icon-wrap" @click="onDeleteClick">
          <svg-inline
            v-if="onDeleteClick"
            class="list-icon"
            src="delete-icon"
          />
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import svgInline from "./inline-svg.vue";
import { NitrozenBadge } from "@gofynd/nitrozen-vue";
import WarningDialog from "./warning-dialog.vue";

export default {
  components: {
    "svg-inline": svgInline,
    "nitrozen-badge": NitrozenBadge,
    "warning-dialog": WarningDialog,
  },
  props: {
    confirmMessage: {
      type: String,
      default: "Are you sure you want to delete the template ?"  
    },
    imageSrc: {
      type: String,
      default: "",
    },
    showDownload: {
      type: Boolean,
      default: false,
    },
    onDownloadClick: {
      type: Function,
      default: () => {},
    },
    name: {
      type: String,
      default: "",
    },
    informationMeta: [],
    showStatus: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    onEditClick: {
      type: Function,
      default: () => {},
    },
    onDeleteClick: {
      type: Function,
      default: () => {},
    },
  },
};
</script>

<style scoped lang="less">
@secondaryColor: #9b9b9b;
@secondaryDark: #41434c;
@borderColor: #e0e0e0;
.list-wrapper {
  padding: 16px 24px;
  border: 1px solid @borderColor;
  overflow: scroll;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  gap: 12px;
  .list-icon {
    flex-grow: 0;
  }
  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 18px;
    .content-title-wrap {
      display: flex;
      align-items: center;
      gap: 7px;
      .content-name {
        font-weight: 600;
        font-size: 16px;
        line-height: 140%;
        margin: 0;
      }
      .list-icon {
      }
    }
    .information-wrap {
      display: flex;
      gap: 21px;
      .item-wrap {
        display: flex;
        align-items: center;
        gap: 8px;

        .item-key {
          font-weight: 400;
          font-size: 12px;
          line-height: 20px;
          color: @secondaryColor;
        }
        .item-value {
          font-weight: 400;
          font-size: 14px;
          line-height: 22px;
          color: @secondaryDark;
        }
      }
    }
    .download-icon {
      cursor: pointer;
    }
  }
  .actions {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    flex-grow: 0;
    gap: 16px;
    .status {
      .inactive_button {
        position: relative;
        border: 1px solid #eb5757;
        background-color: transparent;
        color: #eb5757;
        width: 74px;
        text-transform: uppercase;
        height: 22px;
        top: 7px;
        font-family: Inter;
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
      }
    }
    .action-wrap {
      display: flex;
      gap: 15px;
      .icon-wrap {
        cursor: pointer;
      }
    }
  }
}
</style>
