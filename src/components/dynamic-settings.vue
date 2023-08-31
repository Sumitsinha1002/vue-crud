<template>
  <div class="settings-container">
    <h5 class="title">Settings</h5>
    <div
      class="input-container"
      v-for="(setting, index) in selectedSettings"
      :key="index"
    >
      <!-- Number and text INPUTS -->
      <div v-if="setting.type === 'text' || setting.type === 'number'">
        <nitrozen-input
          v-if="setting.toShow ? inputValues[setting.toShow] ?? false : true"
          :type="setting.type"
          :placeholder="setting.placeholder || ''"
          :label="setting.label + (setting?.required ? ' *' : '')"
          :class="{
            'custom-input': true,
            'error-input': errorValidations[setting.id],
          }"
          v-model="inputValues[setting.id]"
          @keypress="() => setError(setting.id, false, currIndex)"
          @change="setting.type === 'number' ? handleNumberInputChange(setting, $event) : handleTextInputChange(setting, $event)"
          :showPrefix="!!setting?.prefix?.length"
          :prefix="setting?.prefix"
          :min="setting.type === 'number' ? null : null"
          :max="setting.type === 'number' ? MAX_CHARACTER : null"
        />
        <div class="error-message" v-if="errorValidations[setting.id]">
          This field is mandatory
        </div>
      </div>
      <!-- Dropdown INPUT -->
      <div v-if="setting.type === 'dropdown'">
        <nitrozen-dropdown
          :placeholder="setting.placeholder || ''"
          :value="inputValues[setting.id]"
          :items="setting.options"
          :label="setting.label + (setting?.required ? ' *' : '')"
          :tooltip="setting.tooltip"
          :multiple="setting.multiple || false"
          @change="(value) => handleDropdownChanges(value, setting.id)"
        ></nitrozen-dropdown>
        <div class="error-message" v-if="errorValidations[setting.id]">
          This field is mandatory
        </div>
      </div>
      <!-- Multiple input entry section -->
      <div v-if="setting.type === 'multiple-input'">
        <nitrozen-input
          :type="setting.type"
          :placeholder="setting.placeholder || ''"
          :label="setting.label + (setting?.required ? ' *' : '')"
          class="custom-input"
          v-model="multiselectValues[setting.id]"
          @change="($event) => handleMultipleInput($event, setting.id)"
          :showPrefix="!!setting?.prefix?.length"
          :prefix="setting?.prefix"
          :maxlength="MAX_INPUT_CHARACTER"
        />
        <div class="values-grid-container multiple-values">
          <div
            class="values-wrap multi-input-value-wrap"
            v-for="(value, index) in inputValues[setting.id]"
            :key="index"
          >
            <div class="input-value" :title="value">{{ value }}</div>
            <div @click="() => handleMultiInputDelete(index, setting.id)">
              <inline-svg class="close-inline" src="close-icon"></inline-svg>
            </div>
          </div>
        </div>
        <div class="error-message" v-if="errorValidations[setting.id]">
          This field is mandatory
        </div>
      </div>
      <!-- multi price input Section -->
      <div v-if="setting.type === 'multiple-select-input'">
        <nitrozen-input
          :type="setting.type"
          :placeholder="setting.placeholder || ''"
          :label="setting.label + (setting?.required ? ' *' : '')"
          class="custom-input"
          @click="handleMultiOptionClick"
        />
        <div class="values-grid-container multiple-values">
          <div
            class="values-wrap"
            v-for="(value, index) in inputValues[setting.id]"
            :key="index"
          >
            <span v-if="setting.id === 'imageRatio'">
              <span class="text" v-if="value">{{ value }}</span>
            </span>
            <span v-else>
              <div class="text">{{ value.option }}</div>
              <div class="price">₹{{ value.price }}</div>
            </span>
            <div @click="() => handleMultiInputDelete(index, setting.id)">
              <inline-svg class="close-inline" src="close-icon"></inline-svg>
            </div>
          </div>
        </div>
        <div class="error-message" v-if="errorValidations[setting.id]">
          This field is mandatory
        </div>
        <add-ratio-dialog
          v-if="setting.id === 'imageRatio'"
          ref="addOptionsRef"
          @confirm="(value) => handleOptionConfirm(setting.id, value)"
          :selected="inputValues[setting.id]"
        ></add-ratio-dialog>
        <add-option-dialog
          v-else
          ref="addOptionsRef"
          @confirm="(value) => handleOptionConfirm(setting.id, value)"
          :selected="inputValues[setting.id]"
        ></add-option-dialog>
      </div>
      <!-- Image Upload Section -->
      <div v-if="setting.type === 'image-upload'">
        <label
          :class="`label ${setting.required ? 'required-label' : ''}`"
          v-if="setting.label"
        >
          {{ setting.label }}
        </label>
        <image-upload
          :label="'image' + (setting?.required ? ' *' : '')"
          aspectRatio="*"
          :fileTypes="['png', 'jpeg', 'jpg', 'webp']"
          @save="(value) => handleStoreEvent(setting.id, value)"
          v-model="storeSplash.value"
          :fileName="'product-customization_image'"
          namespace="platform-extensions"
        ></image-upload>
        <div class="values-grid-container uploaded-image-wrap">
          <div
            class="image-grid"
            v-for="(imageData, index) in inputValues[setting.id]"
            :key="index"
          >
            <div class="image-text-wrap">
              <div class="image-wrap">
                <nitrozen-tooltip
                  v-if="imageData.name"
                  :tooltipText="imageData.name"
                  position="top"
                >
                </nitrozen-tooltip>
                <img :src="imageData.imageUrl" alt="image" />
                <div @click="() => handleImageDelete(setting.id, index)">
                  <inline-svg
                    class="close-inline"
                    src="close-icon"
                  ></inline-svg>
                </div>
              </div>
              <div class="image-name">
                {{
                  imageData.isAdditionalCost
                    ? currencyConvert(imageData.price)
                    : ""
                }}
              </div>
            </div>
          </div>
        </div>
        <div class="error-message" v-if="errorValidations[setting.id]">
          Images Required
        </div>
      </div>
      <!-- Toggle INPUT -->
      <div class="toggle-input" v-if="setting.type === 'toggle'">
        <label
          >{{ setting.label }} {{ setting?.required ? " *" : "" }}
          <nitrozen-tooltip
            v-if="setting.tooltip"
            :tooltipText="setting.tooltip"
            position="top"
          ></nitrozen-tooltip
        ></label>
        <nitrozen-toggle-btn
          class="toggle-position"
          :value="inputValues[setting.id] || false"
          @change="() => toggleChange(setting.id)"
        ></nitrozen-toggle-btn>
        <div class="error-message" v-if="errorValidations[setting.id]">
          This field is mandatory
        </div>
      </div>
      <!-- Radio Input Section -->
      <div class="radio-wrap" v-if="setting.type === 'radio'">
        <div class="radio-input-container" v-if="Array.isArray(setting.label)">
          <div
            v-for="(text, ind) in setting.label"
            :key="ind"
            :class="{ radio: true, selected: inputValues[setting.id] === text }"
          >
            <nitrozen-radio
              :selected="inputValues[setting.id] === text"
              @change="($event) => handleRadioClick($event, setting.id)"
              :text="text"
              :name="`${text}-${currIndex}`"
              :radioValue="text"
              :value="inputValues[setting.id]"
            >
              {{ text }}
            </nitrozen-radio>
          </div>
        </div>
        <div v-else>
          <nitrozen-radio
            :value="inputValues[setting.id]"
            :text="setting.label"
          >
            {{ setting.label }}
          </nitrozen-radio>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  NitrozenToggleBtn,
  NitrozenInput,
  NitrozenDropdown,
  // NitrozenButton,
  NitrozenRadio,
  NitrozenTooltip,
} from "@gofynd/nitrozen-vue";
import InlineSvg from "./common/inline-svg.vue";
import { mapActions, mapState } from "vuex";
import ImageUpload from "./common/image-uploader/index.vue";
import AddOptionDialog from "./add-option-dialog.vue";
import { currencyConvert } from "../helper/utils";
import { MAX_INPUT_CHARACTER } from "../helper/constants";
import AddRatioDialog from "./add-ratio-dialog.vue";
const config = {};
const MAX_CHARACTER = 100;
// const MINS_MAX_CHARACTER = MAX_CHARACTER - 1;
const getInitialValue = () => {
  const initialSplash = {
    showerror: false,
    value: config
      ? config.splash_image
        ? config.splash_image.secure_url
        : ""
      : "",
    errortext: "-",
  };
  return { initialSplash };
};
export default {
  components: {
    "nitrozen-toggle-btn": NitrozenToggleBtn,
    "nitrozen-input": NitrozenInput,
    "nitrozen-dropdown": NitrozenDropdown,
    // "nitrozen-button": NitrozenButton,
    "inline-svg": InlineSvg,
    "nitrozen-radio": NitrozenRadio,
    "image-upload": ImageUpload,
    "nitrozen-tooltip": NitrozenTooltip,
    "add-option-dialog": AddOptionDialog,
    AddRatioDialog,
  },
  props: {
    selectedSettings: null,
    type: null,
    currIndex: null,
    errorValidations: null,
    setError: null,
    setSaveBlock: null,
  },
  computed: {
    ...mapState(["settings"]),
  },
  data() {
    let { initialSplash } = getInitialValue();
    return {
      inputValues: {},
      multiselectValues: [],
      storeSplash: initialSplash,
      MAX_CHARACTER: MAX_CHARACTER,
      // MINS_MAX_CHARACTER: MINS_MAX_CHARACTER,
      MAX_INPUT_CHARACTER,
    };
  },
  watch: {
    selectedSettings() {
      this.setInputValues();
    },
    currIndex() {
      this.setInputValues();
    },
  },
  mounted() {
    this.setInputValues();
  },
  methods: {
    ...mapActions(["setSettings"]),
    currencyConvert,
    setInputValues() {
      this.inputValues =
        this.$store.getters?.getSettings?.[this.currIndex]?.dynamicSetting ||
        {};
    },
    getMin(setting) {
      if (setting.id === "maxCharacter")
        return this.inputValues["minCharacter"];
      return 0;
    },
    handleStoreEvent(id, data) {
      this.storeSplash.value = data.imageUrl;
      if (!this.inputValues[id]?.length) this.inputValues[id] = [];
      this.inputValues[id].push({
        imageUrl: data.imageUrl,
        name: data.altText,
        isAdditionalCost: data.additionalCost,
        price: data.price,
      });
      this.setToSettings();
    },
    handleMultiOptionClick() {
      this.$nextTick(() => {
        if (Array.isArray(this.$refs.addOptionsRef))
          this.$refs.addOptionsRef?.[0]?.openDialog();
        else this.$refs.addOptionsRef?.openDialog();
      });
    },
    handleOptionConfirm(id, value) {
      this.inputValues[id] = value;
      this.setToSettings();
      this.setError(id, false, this.currIndex);
    },
    // openPicker(id) {
    //   if (this.inputValues[id] === null) this.inputValues[id] = [];
    //   let picker = new components.AssetsPicker(EXT, {
    //     aspectRatio: "*",
    //     fileTypes: SUPPORTED_IMAGE_TYPES,
    //   });
    //   picker.subscribe(components.AssetsPicker.Actions.SELECT, (event) => {
    //     console.log(event);
    //     if (!this.inputValues[id]?.includes(event.data.data.config.assetUrl)) {
    //       this.inputValues[id].push(event.data.data.config.assetUrl);
    //     }
    //     this.setError(id, false, this.currIndex);
    //   });
    //   picker.dispatch();
    // },
    handleDropdownChanges(value, id) {
      this.inputValues[id] = value;
      this.inputValues = { ...this.inputValues };
      this.setToSettings();
      this.setError(id, false, this.currIndex);
    },
    handleTextInputChange(setting, event) {
      let value = event.target.value;
      this.inputValues[setting.id] = value;
      this.setToSettings();
    },
    handleNumberInputChange(setting, event) {
      let value = parseInt(event.target.value);
      if (value >= 0) {
        let isValid = true;
        if (
          setting.id === "minCharacter" &&
          this.inputValues["maxCharacter"] !== null &&
          this.inputValues["maxCharacter"] >= 0 &&
          value > this.inputValues["maxCharacter"]
        ) {
          isValid = false;
          this.$snackbar.global.showError(
            `Minimum cannot exceed ${this.inputValues["maxCharacter"]}`
          );
          this.inputValues["maxCharacter"] = this.inputValues["minCharacter"]
            ? this.inputValues["minCharacter"] + 1
            : 1;
        }
        if (setting.id === "maxCharacter" && value === 0) {
          isValid = false;
          this.$snackbar.global.showError(`Maximum cannot be 0`);
          this.inputValues["maxCharacter"] = this.inputValues["minCharacter"]
            ? this.inputValues["minCharacter"] + 1
            : 1;
        }
        if (
          setting.id === "maxCharacter" &&
          this.inputValues["minCharacter"] > value
        ) {
          isValid = false;
          this.$snackbar.global.showError(
            `Minimum cannot exceed ${this.inputValues["maxCharacter"]}`
          );
          this.inputValues["maxCharacter"] = this.inputValues["minCharacter"]
            ? this.inputValues["minCharacter"] + 1
            : 1;
        }
        if (!isValid) {
          this.setSaveBlock(true);
        }
      } else {
        value = null;
        this.inputValues[setting.id] = value;
      }
      this.setToSettings();
    },
    setToSettings() {
      this.settings[this.currIndex].dynamicSetting = this.inputValues;
      this.setSettings([...this.settings]);
    },
    handleMultipleInput($event, id) {
      if (!this.inputValues[id]) this.inputValues[id] = [];
      if (this.inputValues[id].includes($event.target.value)) {
        this.$snackbar.global.showError("Option already entered");
      } else {
        this.inputValues[id].push($event.target.value);
        this.multiselectValues[id] = "";
        this.setToSettings();
        this.setError(id, false, this.currIndex);
      }
    },
    handleMultiInputDelete(index, id) {
      this.inputValues[id].splice(index, 1);
      this.inputValues = { ...this.inputValues };
      this.setToSettings();
    },
    handleImageDelete(id, index) {
      this.inputValues[id].splice(index, 1);
      this.inputValues = { ...this.inputValues };
      this.setToSettings();
    },
    toggleChange(id) {
      this.inputValues[id] = isNaN(this.inputValues[id])
        ? true
        : !this.inputValues[id];
      this.setToSettings();
      this.setError(id, false, this.currIndex);
    },
    handleRadioClick(label, id) {
      this.inputValues[id] = label;
      this.inputValues = { ...this.inputValues };
      this.setToSettings();
    },
  },
};
</script>

<style scoped lang="less">
@import "../styles/main.less";
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  .title {
    font-weight: 700;
    font-size: 14px;
    line-height: 160%;
    margin: 0;
  }
  .input-container {
    .toggle-input {
      display: flex;
      justify-content: space-between;
    }
  }
  label {
    font-weight: 300;
    font-size: 12px;
    line-height: 160%;
  }
  .values-grid-container {
    // display: grid;
    // grid-template-columns: repeat(4, 1fr);
    // gap: 4px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  .uploaded-image-wrap {
    gap: 16px;
  }
  .image-grid {
    // width: 48px;
    // height: 48px;
    margin-top: 16px;
    .image-text-wrap {
      display: flex;
      flex-direction: column;
      .image-wrap {
        position: relative;
        width: 72px;
        height: 72px;
        &,
        img {
          width: 72px;
          height: 72px;
        }
        .close-inline {
          position: absolute;
          top: -10px;
          right: -10px;
        }
        ::v-deep .nitrozen-tooltip {
          position: absolute;
          width: 100%;
          height: 100%;
          .nitrozen-inline-svg {
            opacity: 0;
          }
          .nitrozen-tooltip-top {
            bottom: 106%;
            &::after {
              border-width: 8px;
            }
          }
        }
      }
      .image-name {
        font-weight: 500;
        font-size: 14px;
        line-height: 160%;
      }
    }
  }
  .multiple-values {
    margin-top: 8px;
    .values-wrap {
      justify-content: space-between;
      border: 1px solid #e5e5e5;
      display: flex;
      border-radius: 4px;
      padding: 8px;
      .text {
        margin-right: 8px;
      }
    }
    .multi-input-value-wrap {
      max-width: 100px;
      .input-value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .close-inline {
    cursor: pointer;
  }
  .radio-wrap {
    .radio-input-container {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      .radio {
        width: 100%;
        .nitrozen-radio-group {
          border: 1px solid @RoyalBlue;
          padding: 9.5px;
          border-radius: 4px;
          label {
            font-weight: 400;
            font-size: 14px;
            line-height: 150%;
          }
        }
        &.selected {
          background: @blue5;
        }
      }
    }
  }
}
.label {
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
  color: @DustyGray2;
}
.required-label {
  &::after {
    content: "*";
  }
}
</style>