import TEMPLATE_TYPE_NAME from "../../global_constants.json";

export const GET_SETTINGS = () => ({
  [TEMPLATE_TYPE_NAME.text]: [
    {
      type: "toggle",
      label: "Mandatory",
      id: "mandatory",
      default: false,
      required: false,
    },
    {
      type: "toggle",
      label: "Alpha Numeric",
      id: "alphaNumeric",
      tooltip: "This is alpha numeric, so no special chars are allowed",
      default: false,
      required: false,
    },
    // [additional_price_changes]
    // {
    //   type: "toggle",
    //   label: "Additional Cost",
    //   id: "isAdditionalCost",
    //   default: false,
    //   required: false,
    // },
    // {
    //   type: "number",
    //   label: "Additional Cost",
    //   id: "additionalCost",
    //   prefix: "₹",
    //   required: false,
    //   toShow: "isAdditionalCost"
    // },
    {
      type: "number",
      label: "Minimum Character",
      id: "minCharacter",
      required: false,
    },
    {
      type: "number",
      label: "Maximum Character",
      id: "maxCharacter",
      required: false,
    },
  ],
  [TEMPLATE_TYPE_NAME.number]: [
    {
      type: "toggle",
      label: "Mandatory",
      id: "mandatory",
      default: false,
      required: false,
    },
    {
      type: "number",
      label: "Minimum Number",
      id: "minCharacter",
      required: false,
    },
    {
      type: "number",
      label: "Maximum Number",
      id: "maxCharacter",
      required: false,
    },
  ],
  [TEMPLATE_TYPE_NAME.imageUpload]: [
    {
      type: "toggle",
      label: "Mandatory",
      id: "mandatory",
      default: false,
      required: false,
    },
    {
      type: "dropdown",
      label: "Supported Images",
      multiple: true,
      id: "supportedImage",
      tooltip: "JPEG, JPG, PNG, WEBP are supported",
      options: [
        { text: "JPEG", value: "jpeg" },
        { text: "JPG", value: "jpg" },
        { text: "PNG", value: "png" },
        { text: "WEBP", value: "webp" },
      ],
      placeholder: "E.g JPEG",
      required: true,
    },
    // {
    //   type: "dropdown",
    //   label: "Image Ratio",
    //   multiple: true,
    //   id: "imageRatio",
    //   tooltip: "1:1 and 4:3 ratio's are supported",
    //   options: [
    //     { text: "1:1", value: "1:1" },
    //     { text: "4:3", value: "4:3" },
    //   ],
    //   placeholder: "E.g 1:1",
    //   required: true,
    // },
    {
      type: "multiple-select-input",
      label: "Image Ratio",
      default: ["1:1", "4:3"],
      placeholder: "E.g 1:1",
      id: "imageRatio",
      required: true,
    },
    {
      type: "number",
      label: "Max Image Height",
      id: "maxImageHeight",
      prefix: "PX",
      required: true,
    },
    {
      type: "number",
      label: "Max Image Width",
      id: "maxImageWidth",
      prefix: "PX",
      required: true,
    },
  ],
  [TEMPLATE_TYPE_NAME.dropdownImage]: [
    {
      type: "toggle",
      label: "Mandatory",
      id: "mandatory",
      default: false,
      required: false,
    },
    {
      type: "radio",
      label: [TEMPLATE_TYPE_NAME.gridView, TEMPLATE_TYPE_NAME.listView],
      id: "view",
      default: TEMPLATE_TYPE_NAME.gridView,
      required: false,
    },
    {
      type: "image-upload",
      label: "Images",
      id: "imageUpload",
      default: [],
      required: true,
    },
  ],
  [TEMPLATE_TYPE_NAME.dropdownText]: [
    {
      type: "multiple-input",
      label: "Input Options",
      id: TEMPLATE_TYPE_NAME.multiInputOptions,
      required: true,
    },
    // [additional_price_changes]
    // {
    //   type: "multiple-select-input",
    //   label: "Input Options",
    //   id: TEMPLATE_TYPE_NAME.multiSelectOption,
    //   required: true,
    // },
    {
      type: "toggle",
      label: "Mandatory",
      id: "mandatory",
      default: false,
      required: false,
    },
    {
      type: "radio",
      label: [TEMPLATE_TYPE_NAME.singleSelect, TEMPLATE_TYPE_NAME.multiSelect],
      id: "view",
      default: TEMPLATE_TYPE_NAME.singleSelect,
      required: false,
    },
  ],
});

export const INPUT_TYPES_OPTIONS = [
  { text: "Text", value: "text", logo: "text-fields-icon" },
  { text: "Number", value: "number", logo: "number" },
  {
    text: "Image Upload",
    value: "imageUpload",
    logo: "image-upload",
  },
  {
    text: "Image Selection",
    value: "dropdownImage",
    logo: "dropdown",
  },
  {
    text: "Text Selection",
    value: "dropdownText",
    logo: "dropdown",
  },
];

export const PLACEHOLDER_NOT_MANDATORY = ["dropdownImage"];

export const SUPPORTED_IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];

export const CUSTOMIZED_DROPDOWN_OPTIONS = [
  { text: "Choose Template", value: "chooseTemplate" },
  { text: "Create Template", value: "addManual" },
];

export const MAX_FILE_SIZE = 5240000;

export const BULK_UPLOAD_LEARN_MORE_LINK =
  "https://platform.fynd.com/help/docs/products/catalogue/exporting-catalogue-bkp";

export const MAX_INPUT_CHARACTER = 60;

export const LEARNING_LINK_DEV = "https://platform.fyndx5.de/help/docs/extensions/available-extensions/product-customization";
export const LEARNING_LINK_TEST = "https://platform.fyndx1.de/help/docs/extensions/available-extensions/product-customization";
export const LEARNING_LINK_PROD = "https://platform.fynd.com/help/docs/extensions/available-extensions/product-customization";