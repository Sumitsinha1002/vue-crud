<template>
  <div>
    <breadcrumb />
    <div class="main-container">
      <!-- Template Head section -> goBack, templateStatus, cancel and Save -->
      <div class="title-container">
        <div class="title-wrap">
          <div class="icon-wrap" @click="handleBack">
            <inline-svg class="icon" src="back-icon"></inline-svg>
          </div>
          <h4 class="main-title">Template Configuration</h4>
          <n-toggle-button
            :value="templateStatus"
            size="medium"
            name="n-toggle-button"
            @change="() => setTemplateStatus(!templateStatus)"
          ></n-toggle-button>
        </div>
        <div class="button-wrap">
          <warning-dialog
            btnText="Cancel"
            message="Are you sure want to cancel ?"
            @confirm="() => handleBack(this)"
          ></warning-dialog>
          <nitrozen-button
            v-if="!isPublish || createNew"
            :rounded="false"
            theme="secondary"
            @click="handleSave"
            v-flat-btn
          >
            {{ actionBtnText }}
          </nitrozen-button>
          <warning-dialog
            v-else
            :vFlatBtn="true"
            :vStrokeBtn="false"
            btnTheme="secondary"
            title="Edit Template"
            :btnText="actionBtnText"
            message="Modifying this template will impact all the products linked to it. Are you certain you wish to edit this template, or would you prefer to create a new template?"
            neutralButtonLabel="Continue Editing Template"
            positiveButtonLabel="Create New Template"
            @cancel="onEditTemplate"
            @confirm="onCreateNewTemplate"
          ></warning-dialog>
        </div>
      </div>
      <div class="customization-container">
        <div class="customization-wrap">
          <!-- Template name section -->
          <div class="name-wrap">
            <div class="title">Customisation Name</div>
            <label>Template Name *</label>
            <nitrozen-input
              type="text"
              placeholder="Enter a name"
              :disabled="false"
              validationMessage=""
              prefix=""
              custom
              :value="templateName"
              :maxlength="MAX_INPUT_CHARACTER"
              :class="{ 'error-input': templateNameError }"
              @change="handleTemplateChange"
              @keypress="handleTemplateChange"
            />
            <!-- @change="($event) => setTemplateName($event.target.value)" -->
            <div class="error-message" v-if="templateNameError">
              This field is mandatory
            </div>
          </div>
          <!-- Entire template create/edit section -->
          <div class="custom-field-wrap">
            <div class="main-title">Custom Fields & Settings</div>
            <div class="description">Description for this step goes here</div>
            <draggable
              v-model="settings"
              @change="(data) => handleDragChange(data)"
            >
              <transition-group name="fade" tag="div" class="container">
                <div
                  class="configuration-wrap"
                  v-for="(item, index) in settings"
                  :key="index"
                >
                  <div
                    class="head-wrap accordion-head"
                    @click="() => toggleAccordion(index)"
                  >
                    <div
                      class="draggable"
                      :class="{ dragging: item.dragging || false }"
                    >
                      <inline-svg
                        class="drag-icon"
                        src="draggable-icon"
                      ></inline-svg>
                    </div>
                    <div
                      class="config-title"
                      :title="
                        item.customFieldName?.length
                          ? item.customFieldName
                          : 'Field Name & Type'
                      "
                    >
                      {{
                        item.customFieldName?.length
                          ? item.customFieldName
                          : "Field Name & Type"
                      }}
                    </div>
                    <div @click="($event) => handleDeleteClick($event, index)">
                      <inline-svg src="delete-icon"></inline-svg>
                    </div>
                  </div>
                  <transition name="fade">
                    <div
                      :class="`input-wrap accordion-body ${
                        item?.isOpen ? 'accordion-open' : 'accordion-close'
                      }`"
                      v-show="item?.isOpen"
                    >
                      <div class="type-selection-wrap">
                        <!-- Name of the Field -->
                        <div>
                          <nitrozen-input
                            autocomplete="off"
                            type="text"
                            placeholder="E.g Print Name"
                            :disabled="false"
                            validationMessage=""
                            prefix=""
                            custom
                            v-model="item.customFieldName"
                            @input="(val) => handleFieldChange(val, index)"
                            showTooltip
                            label="Custom Field Label *"
                            tooltipText="Name of the field (Mandatory)"
                            @keypress="
                              () => setError('customFieldName', false, index)
                            "
                            :maxlength="MAX_INPUT_CHARACTER"
                            :class="{
                              'error-input':
                                item.errors?.customFieldName || false,
                            }"
                          />
                          <div
                            class="error-message"
                            v-if="item.errors?.customFieldName || false"
                          >
                            <!-- This field is mandatory -->
                            {{ item.errors?.message || "This field is mandatory" }}
                          </div>
                        </div>
                        <!-- Type Selection -->
                        <div class="dropdown-wrap">
                          <nitrozen-dropdown
                            :class="`type-dropdown ${item.customType}`"
                            placeholder="Text"
                            :disabled="false"
                            v-model="item.customType"
                            :items="inputTypes"
                            label="Input Type *"
                            tooltip="Type of the Input (Mandatory)"
                            custom
                            @change="(data) => editSettingType(index, data)"
                          ></nitrozen-dropdown>
                        </div>
                        <div
                          v-if="!placeholderNeeded.includes(item.customType)"
                        >
                          <nitrozen-input
                            autocomplete="off"
                            type="text"
                            placeholder="E.g Enter Name"
                            :disabled="false"
                            validationMessage=""
                            prefix=""
                            custom
                            v-model="item.customFieldPlaceholder"
                            showTooltip
                            label="Custom Field Placeholder *"
                            tooltipText="placeholder"
                            :maxlength="MAX_INPUT_CHARACTER"
                            @keypress="
                              () =>
                                setError('customFieldPlaceholder', false, index)
                            "
                            :class="{
                              'error-input':
                                item.errors?.customFieldPlaceholder || false,
                            }"
                          />
                          <div
                            class="error-message"
                            v-if="item.errors?.customFieldPlaceholder || false"
                          >
                            This field is mandatory
                          </div>
                        </div>
                        <!-- SETTINGS display section based on the type selection -->
                        <div>
                          <dynamic-settings
                            ref="settings"
                            :selectedSettings="selectedSettings[index]"
                            :type="item.customType"
                            :currIndex="index"
                            :errorValidations="item.errors || {}"
                            :setError="setError"
                            :setSaveBlock="setSaveBlock"
                          />
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </transition-group>
            </draggable>
            <div class="add-btn-wrap">
              <nitrozen-button
                :rounded="false"
                theme="secondary"
                @click="handleAddAnother"
                v-stroke-btn
              >
                Add Another
              </nitrozen-button>
            </div>
          </div>
        </div>
        <div class="template-preview-container">
          <template-preview :settings="getPreviewData"></template-preview>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  NitrozenButton,
  NitrozenToggleBtn,
  NitrozenInput,
  NitrozenDropdown,
} from "@gofynd/nitrozen-vue";
import { mapState, mapActions } from "vuex";
import InlineSvg from "../components/common/inline-svg.vue";
import WarningDialog from "../components/common/warning-dialog.vue";
import {
  GET_SETTINGS,
  INPUT_TYPES_OPTIONS,
  MAX_INPUT_CHARACTER,
  PLACEHOLDER_NOT_MANDATORY,
} from "../helper/constants";
import draggable from "vuedraggable";
import DynamicSettings from "../components/dynamic-settings.vue";
import { validateSettings } from "../helper/utils";
import TemplatePreview from "../components/template-preview.vue";
import MainService from "../services/main-service";
import {
  toBulkUpload,
  toManageCustomization,
  toAddProduct,
} from "../helper/redirect";
import Breadcrumb from "../components/common/breadcrumb.vue";

const DEFAULT_CUSTOM_TYPE = "text";

const getConfiguration = () => ({
  customFieldName: "",
  customFieldPlaceholder: "",
  customType: DEFAULT_CUSTOM_TYPE,
  dragging: false,
  isOpen: false,
  errors: {},
});

export default {
  components: {
    "nitrozen-button": NitrozenButton,
    "n-toggle-button": NitrozenToggleBtn,
    "nitrozen-input": NitrozenInput,
    "inline-svg": InlineSvg,
    "nitrozen-dropdown": NitrozenDropdown,
    "template-preview": TemplatePreview,
    "warning-dialog": WarningDialog,
    draggable,
    "dynamic-settings": DynamicSettings,
    breadcrumb: Breadcrumb,
  },
  data() {
    return {
      templateNameError: false,
      inputTypes: [...INPUT_TYPES_OPTIONS],
      isEdit: false,
      templateId: null,
      selectedSettings: [],
      actionBtnText: "Save",
      createNew: false,
      isPublish: false,
      isBulkUpload: false,
      placeholderNeeded: [...PLACEHOLDER_NOT_MANDATORY],
      blockSave: false,
      MAX_INPUT_CHARACTER,
    };
  },
  computed: {
    ...mapState([
      "templateName",
      "templateStatus",
      "settings",
      "selectedProductIds",
    ]),
    getPreviewData() {
      const data = [...this.settings]?.map((setting) => {
        const settingCopy = {
          ...setting,
          dynamicSetting: { ...setting.dynamicSetting },
        };
        delete settingCopy.dragging;
        delete settingCopy.errors;
        delete settingCopy.isOpen;
        const dynamicSetting = settingCopy.dynamicSetting;
        delete settingCopy.dynamicSetting;
        return { ...settingCopy, ...dynamicSetting };
      });
      return data;
    },
  },
  mounted() {
    if (this.$route.query?.bulk_upload) {
      this.isBulkUpload = true;
    }
    if (this.$route.query?.publish) {
      this.isPublish = JSON.parse(this.$route.query?.publish);
      this.actionBtnText = "Publish";
    }
    if (
      this.$route.query?.create_new &&
      JSON.parse(this.$route.query?.create_new)
    ) {
      this.templateId = this.$route.params?.template_id || "";
      this.createNew = true;
      // this.isPublish = true;
      // this.actionBtnText = "Publish";
      if (this.templateId) {
        this.isEdit = true;
        this.getTemplateDetail();
      }
    } else if (this.$route.params?.template_id?.length) {
      this.isEdit = true;
      this.templateId = this.$route.params?.template_id;
      this.getTemplateDetail();
    } else {
      this.handleAddAnother();
    }
  },
  destroyed() {
    this.resetState();
  },
  methods: {
    ...mapActions([
      "setTemplateName",
      "setTemplateStatus",
      "setSettings",
      "resetState",
    ]),
    handleTemplateChange($event) {
      this.setTemplateName($event.target.value);
      this.templateNameError = false;
    },
    handleDragChange(data) {
      const { oldIndex, newIndex } = data.moved;
      const movedItem = this.settings.splice(oldIndex, 1)[0];
      this.settings.splice(newIndex, 0, movedItem);
      this.setSettings([...this.settings]);
    },
    handleBack() {
      this.$router.go(-1);
      // toManageCustomization(this);
    },
    // redirectToManageTemplate() {
    //   toManageCustomization(this);
    // this.$router.push(
    //   `/company/${this.$route.params.company_id}/application/${this.$route.params.application_id}/manage-customization`
    // );
    // },
    handleFieldChange(val, index) {
      const customFieldNames = this.settings.map(setting => setting.customFieldName);
      customFieldNames.splice(index, 1);
      if (customFieldNames.includes(val)) {
        this.settings[index].errors.customFieldName = true;
        this.settings[index].errors.message = 'Already field name exist';
      } else {
        this.settings[index].errors.customFieldName = false;
        this.settings[index].errors.message = null;
      }
      this.setSettings([...this.settings]);
    },
    getTemplateDetail() {
      MainService.getTemplate({
        _id: this.templateId,
        application_id: this.$route.params.application_id,
      })
        .then((res) => {
          this.setTemplateData(res.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    setTemplateData(data) {
      if (data) {
        this.setTemplateName(data.template_name);
        this.setTemplateStatus(data.is_active);
        data.template_configuration.forEach((config, index) => {
          this.handleAddAnother();
          this.editSettingType(index, config.customType);
          this.settings[index]["customFieldName"] = config.customFieldName;
          this.settings[index]["customFieldPlaceholder"] =
            config.customFieldPlaceholder;
          this.settings[index]["customType"] = config.customType;
          delete config.customFieldName;
          delete config.customFieldPlaceholder;
          delete config.customType;
          delete config.template_name;
          this.settings[index]["dynamicSetting"] = { ...config };
        });
        this.setSettings([...this.settings]);
      }
    },
    setError(key, value = false, index = null) {
      this.settings[index].errors[key] = value;
      this.settings = { ...this.settings };
    },
    toggleAccordion(index) {
      this.settings[index].isOpen = !this.settings[index]?.isOpen;
      this.settings = [...this.settings];
    },
    validateTemplate(data) {
      // Checking the template name is present or not.
      if (!this.templateName?.length) {
        this.templateNameError = true;
      } else this.templateNameError = false;
      let isConfigValid = true;
      // To check the fields on Template.vue (customFieldName and customFieldPlaceholder)
      this.settings?.forEach((setting) => {
        if (!setting.customFieldName?.length || setting.errors["customFieldName"]) {
          isConfigValid = false;
          setting.errors["customFieldName"] = true;
          setting.errors["isValid"] = false;
        } else setting.errors["customFieldName"] = false;
        if (
          !this.placeholderNeeded.includes(setting.customType) &&
          !setting.customFieldPlaceholder?.length
        ) {
          if (!setting.customFieldPlaceholder?.length) {
            isConfigValid = false;
            setting.errors["customFieldPlaceholder"] = true;
            setting.errors["isValid"] = false;
          } else setting.errors["customFieldPlaceholder"] = false;
        }
        setting.errors = { ...setting.errors };
      });
      // Checking settings are valid or not
      const { validation, isValid } = validateSettings(
        this.selectedSettings,
        data
      );
      if (!isValid) {
        this.settings.forEach((setting, index) => {
          setting.errors = { ...setting.errors, ...validation[index] };
        });
      }
      // open the accordion if it has ERROR
      if (!isConfigValid || !isValid) {
        this.settings.forEach((setting) => {
          if (setting?.errors?.isValid === false) setting.isOpen = true;
        });
      }
      this.settings = { ...this.settings };
      return !this.templateNameError && isConfigValid && isValid;
    },
    onEditTemplate() {
      this.isEdit = true;
      this.createNew = false;
      this.handleSave();
    },
    onCreateNewTemplate() {
      this.isEdit = false;
      this.createNew = false;
      this.handleSave();
    },
    setSaveBlock(val = false) {
      this.blockSave = val;
    },
    handleSave() {
      console.log("on save", this.settings);
      const data = this.settings?.map((setting) => {
        return {
          customFieldName: setting.customFieldName,
          customFieldPlaceholder: setting.customFieldPlaceholder || "",
          customType: setting.customType,
          ...setting.dynamicSetting,
        };
      });
      const isValid = this.validateTemplate(data);
      if (!this.settings?.length) {
        this.$snackbar.global.showError("Need minimum one setting");
        return;
      }
      if (isValid && !this.blockSave) {
        // Just edit the template
        if (this.isEdit && !this.createNew) {
          MainService.updateTemplate(
            {
              template_id: this.templateId,
              is_active: this.templateStatus,
              template_configuration: data,
              template_name: this.templateName?.trim(),
            },
            {
              application_id: this.$route.params.application_id,
              company_id: this.$route.params.company_id,
            }
          )
            .then((res) => {
              if (res.data) {
                this.$snackbar.global.showSuccess("Updated Successfully");
                if (this.isPublish && this.isBulkUpload) toBulkUpload(this);
                else if (this.isPublish) toAddProduct(this);
                else toManageCustomization(this);
              } else {
                this.$snackbar.global.showError("Update Failed");
              }
            })
            .catch((err) => {
              if (err?.response?.data?.message) {
                this.$snackbar.global.showError(err.response.data.message);
              } else {
                this.$snackbar.global.showError("Update Failed");
                console.log(err);
              }
            });
        } else {
          MainService.createTemplate({
            company_id: this.$route.params.company_id,
            application_id: this.$route.params.application_id,
            is_active: this.templateStatus,
            template_configuration: data,
            template_name: this.templateName?.trim(),
          })
            .then((res) => {
              if (this.isPublish) {
                if (this.selectedProductIds?.length && res.data?.data?._id) {
                  this.publishTemplate(res.data.data._id);
                } else {
                  this.$snackbar.global.showError(
                    "Something wend wrong while publishing"
                  );
                }
              } else {
                this.$snackbar.global.showSuccess("Created Successfully");
              }
              if (this.isPublish && this.isBulkUpload) toBulkUpload(this);
              else if (this.isPublish) toAddProduct(this);
              else toManageCustomization(this);
            })
            .catch((err) => {
              if (err?.response?.data?.message) {
                this.$snackbar.global.showError(err.response.data.message);
              } else {
                this.$snackbar.global.showError("Create Failed");
                console.log("template creation error --- ", err);
              }
            });
        }
      } else {
        if (!this.blockSave) this.$snackbar.global.showError("Please Enter Mandatory Fields");
      }
      if (this.blockSave) this.setSaveBlock(false);
    },
    publishTemplate(templateId) {
      const body = {
        template_id: templateId,
        product_ids: this.selectedProductIds,
        application_id: this.$route.params.application_id,
        company_id: this.$route.params.company_id,
        is_bulk_upload: this.isBulkUpload,
      };
      if (this.isBulkUpload && this.$route.query?.bulk_id) {
        body["bulk_upload_id"] = this.$route.query.bulk_id;
      }
      if (this.isBulkUpload && this.$route.query?.file_name) {
        body["file_name"] = this.$route.query.file_name;
      }
      MainService.updateProduct(body)
        .then((res) => {
          console.log("published successfully", res);
          this.$snackbar.global.showSuccess(
            "Created and Published Successfully"
          );
        })
        .catch((err) => {
          console.log(err);
          this.$snackbar.global.showError("Publishing Failed");
        });
    },
    getDefaultValues(typeSetting) {
      const values = {};
      typeSetting.forEach((setting) => {
        const hasProperty = Object.prototype.hasOwnProperty.call(
          setting,
          "default"
        );
        values[setting.id] = hasProperty ? setting.default : null;
        return values;
      });
      return values;
    },
    handleAddAnother() {
      const getConfig = getConfiguration();
      const typeSetting = GET_SETTINGS()[getConfig.customType];
      this.settings.push({
        ...getConfig,
        dynamicSetting: this.getDefaultValues(typeSetting),
      });
      this.selectedSettings.push(typeSetting);
      this.setSettings([...this.settings]);
    },
    handleDeleteClick($event, index) {
      $event?.preventDefault();
      this.settings.splice(index, 1);
      this.selectedSettings.splice(index, 1);
      this.selectedSettings = [...this.selectedSettings];
      this.setSettings([...this.settings]);
    },
    editSettingType(index, type = DEFAULT_CUSTOM_TYPE) {
      const getSetting = GET_SETTINGS()[type];
      this.selectedSettings[index] = getSetting;
      this.settings[index].dynamicSetting = this.getDefaultValues(getSetting);
      this.setSettings([...this.settings]);
    },
  },
};
</script>

<style scoped lang="less">
@import "../styles/main.less";

.main-container {
  .title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 33px;
    .title-wrap {
      display: flex;
      .icon-wrap {
        margin-right: 12px;
        cursor: pointer;
      }
      .nitrozen-toggle-container {
        margin-left: 35px;
      }
    }
    .main-title {
    }
    .button-wrap {
      display: flex;
      gap: 16px;
    }
  }
  .customization-container {
    display: flex;
    flex-direction: row;
    gap: 26px;
    .customization-wrap {
      min-width: 394px;
      width: 33%;
      .name-wrap {
        padding: 24px 16px;
        border-radius: 8px;
        border: 1px solid @gray5;
        .title {
          font-weight: 500;
          font-size: 18px;
          line-height: 140%;
          margin-bottom: 16px;
        }
      }
      .custom-field-wrap {
        margin-top: 24px;
        padding: 24px 16px;
        border-radius: 8px;
        border: 1px solid @gray5;
        .configuration-wrap {
          margin-top: 16px;
          border: 1px solid @gray5;
          border-radius: 8px;
          .input-wrap {
            padding: 24px 24px 12px 24px;
            .type-selection-wrap {
              display: flex;
              flex-direction: column;
              gap: 24px;
              .dropdown-wrap {
                .type-dropdown {
                  ::v-deep .nitrozen-select__trigger {
                    &::before {
                      content: "";
                      width: 25px;
                      background-repeat: no-repeat;
                      height: 20px;
                    }
                    > span {
                      width: 100%;
                      padding-left: 10px;
                    }
                  }
                  ::v-deep [data-value="text"] .nitrozen-option-image img {
                    content: url("../assets/text-fields.svg");
                  }
                  ::v-deep [data-value="number"] .nitrozen-option-image img {
                    content: url("../assets/number.svg");
                  }
                  ::v-deep
                    [data-value="imageUpload"]
                    .nitrozen-option-image
                    img {
                    content: url("../assets/image-upload.svg");
                  }
                  ::v-deep
                    [data-value="dropdownImage"]
                    .nitrozen-option-image
                    img,
                  ::v-deep
                    [data-value="dropdownText"]
                    .nitrozen-option-image
                    img {
                    content: url("../assets/dropdown.svg");
                  }
                  &.text {
                    ::v-deep .nitrozen-select__trigger::before {
                      background: url("../assets/text-fields.svg") no-repeat;
                    }
                  }
                  &.number {
                    ::v-deep .nitrozen-select__trigger::before {
                      background: url("../assets/number.svg") no-repeat;
                    }
                  }
                  &.imageUpload {
                    ::v-deep .nitrozen-select__trigger::before {
                      background: url("../assets/image-upload.svg") no-repeat;
                    }
                  }
                  &.dropdownImage,
                  &.dropdownText {
                    ::v-deep .nitrozen-select__trigger::before {
                      background: url("../assets/dropdown.svg") no-repeat;
                    }
                  }
                }
              }
              ::v-deep .n-input-label-container {
                .n-input-label {
                  flex: 3;
                }
                .n-input-maxlength {
                  flex: 1;
                }
              }
            }
          }
          .head-wrap {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 6.5px;
            border-bottom: 1px solid @gray5;
            height: 23px;
            .drag-icon {
              cursor: pointer;
            }
            .config-title {
              font-weight: 600;
              font-size: 16px;
              line-height: 24px;
              flex-grow: 1;
              margin-left: 16px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
          .accordion-head {
            cursor: pointer;
          }
          .accordion-body {
            transition: height 0.3s ease-in-out;
            overflow: initial;
          }

          .accordion-open {
            height: "auto";
          }

          .accordion-close {
            height: 0;
            padding: 0;
            overflow: hidden;
          }

          .fade-enter-active,
          .fade-leave-active {
            transition: opacity 0.3s ease-in-out;
          }

          .fade-enter,
          .fade-leave-to {
            opacity: 0;
          }
        }
        .add-btn-wrap {
          display: flex;
          justify-content: flex-end;
          margin-top: 20.55px;
        }
      }
    }
    .template-preview-container {
      width: 67%;
    }
  }
  label {
    font-weight: 400;
    font-size: 12px;
    line-height: 160%;
    color: @secondaryColor;
  }
  .container {
    display: flex;
    flex-direction: column;
  }
}
</style>