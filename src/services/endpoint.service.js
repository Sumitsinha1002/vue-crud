import urlJoin from "url-join";
import root from "window-or-global";
import { getCommonHeaderOptions, getUrlWithAppIdAndCompanyId } from "./utils.service";
let envVars = root.env || {};

envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL = `${root.location.protocol}//${root.location.hostname}`;
// envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL = `${root.location.protocol}//${root.location.hostname}:${root.location.port}`;
if (
  root &&
  root.process &&
  root.process.env &&
  root.process.NODE_ENV == "test"
) {
  envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL = 'https://api.xyz.com';
}

const Endpoints = {
  GET_TEST_API() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/test-api')
  },
  GET_ALL_APPLICATIONS(){
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/applications')
  },
  SALES_CHANNEL_TOGGLE(){
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/template/channel')
  },
  // Not used
  GET_CONFIGURATION(entityType) {
    getCommonHeaderOptions();
    return (
      getUrlWithAppIdAndCompanyId("v1.0", envVars.HOST_MAIN_URL + `/api`) +
      `/configuration/entity/${entityType}/`
    );
  },
  GET_TEMPLATES() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/template/templates');
  },
  COMMON_TEMPLATE() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/template/template');
  },
  GET_PRODUCTS_LIST() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/catalog/product-list');
  },
  UPDATE_PRODUCT() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/catalog/product');
  },
  DELETE_PRODUCT() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/catalog/product');
  },
  GET_ALL_COLLECTIONS() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/catalog/all-collections');
  },
  GET_ALL_CATEGORIES() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/catalog/categories');
  },
  BULK_UPLOAD() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/catalog/product/bulk-upload');
  },
  CHECK_PRODUCTS() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/catalog/product/check-products');
  },
  UPLOAD_IMAGE() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/file-upload/upload');
  },
  GET_PROXY() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/file-upload/proxy');
  },
  BROWSE() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, '/api/v1/file-upload/browse');
  },

  SUBSCRIPTION(plan_id = "") {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, `/api/subscription/${plan_id}`);
  },
  SUBSCRIPTION_STATUS(subscription_id) {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, `/api/subscription/${subscription_id}/status/`);
  },
  PLANS() {
    return urlJoin(envVars.EXTENSION_PRODUCT_CUSTOMIZATION_MAIN_URL, `/api/subscription/plans`);
  }
};

export default Endpoints;