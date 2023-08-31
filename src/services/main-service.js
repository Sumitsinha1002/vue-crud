/* eslint-disable */
"use strict";

import URLS from "./endpoint.service";
import axios from "axios";
import { getCompany } from "../helper/utils";
// import { getCommonHeaderOptions } from "./utils.service";
import ApiService from "./api.service";
import root from "window-or-global";

axios.interceptors.request.use((config) => {
  config.headers["x-company-id"] = getCompany();
  return config;
});

const MainService = {
  getTestApi(params = {}) {
    return axios.get(URLS.GET_TEST_API());
  },
  getAllApplications(params = {}) {
    const options = {
      params: params,
    };
    return ApiService.get(URLS.GET_ALL_APPLICATIONS(), options);
  },
  getConfiguration(params = {}) {
    return ApiService.get(URLS.GET_CONFIGURATION(params));
  },
  toggleSalesChannel(params = {}) {
    const options = {
      data: params,
    };
    return ApiService.post(URLS.SALES_CHANNEL_TOGGLE(), options);
  },
  getSalesChannelStatus(params = {}) {
    const options = {
      params: params,
    };
    return ApiService.get(URLS.SALES_CHANNEL_TOGGLE(), options);
  },
  getTemplates(params = {}) {
    const options = {
      params,
    };
    return ApiService.get(URLS.GET_TEMPLATES(), options);
  },
  getTemplate(params = {}) {
    const options = {
      params,
    };
    return ApiService.get(URLS.COMMON_TEMPLATE(), options);
  },
  createTemplate(params = {}) {
    const options = {
      data: params,
    };
    return ApiService.post(URLS.COMMON_TEMPLATE(), options);
  },
  deleteTemplate(params = {}) {
    const options = {
      data: params,
    };
    return ApiService.del(URLS.COMMON_TEMPLATE(), options);
  },
  updateTemplate(data = {}, params = {}) {
    const options = {
      data,
      params,
    };
    return ApiService.put(URLS.COMMON_TEMPLATE(), options);
  },
  getProductsList(params = {}) {
    const options = {
      params,
    };
    return ApiService.get(URLS.GET_PRODUCTS_LIST(), options);
  },
  updateProduct(params = {}) {
    const options = {
      data: params,
    };
    return ApiService.put(URLS.UPDATE_PRODUCT(), options);
  },
  deleteProduct(params = {}) {
    const options = {
      data: params,
    };
    return ApiService.del(URLS.DELETE_PRODUCT(), options);
  },
  deleteBulkUpload(params = {}) {
    const options = {
      data: params,
    };
    return ApiService.del(URLS.BULK_UPLOAD(), options);
  },
  checkProducts(params = {}, onDownloadProgress) {
    const options = {
      data: params,
      onDownloadProgress,
    };
    return ApiService.post(URLS.CHECK_PRODUCTS(), options);
  },
  getBulkUpload(params = {}) {
    const options = {
      params,
    };
    return ApiService.get(URLS.BULK_UPLOAD(), options);
  },
  getAllCollections(params = {}) {
    const options = {
      params,
    };
    return ApiService.get(URLS.GET_ALL_COLLECTIONS(), options);
  },
  getAllCategoryData(params = {}) {
    const options = {
      params,
    };
    return ApiService.get(URLS.GET_ALL_CATEGORIES(), options);
  },
  upload(data) {
    const options = {
      data,
    };
    return ApiService.post(URLS.UPLOAD_IMAGE(), options);
  },
  hdns() {
    let envVars =
      { ...(root.env || {}), ...(process.env || {}), ...(window.env || {}) } ||
      {};
    return envVars.cdn_item_base_path
      ? [envVars.cdn_item_base_path, ...envVars.old_cdn_base_urls.split(',')]
      : [envVars.cdn_item_domains];
  },
  getDisplayName(namespace) {
    const displayName = this.namespaceToDisplayNameMapping[namespace];
    if (displayName) {
      return displayName;
    } else {
      return "Images";
    }
  },
  isHDNPath(path) {
    try {
      const url = new URL(path);
      let isValid = false;
      this.hdns().forEach((ele) => {
        if (ele && url.href.includes(ele)) {
          isValid = true;
        }
      });
      return isValid;
    } catch (e) {
      return false;
    }
  },
  getProxyURL(params) {
    const options = {
      params,
    };
    return ApiService.get(URLS.GET_PROXY(), options, { responseType: 'arraybuffer' });
  },
  explore(params) {
    const options = {
      params,
    };
    return ApiService.get(URLS.BROWSE(), options);
  },

  subscribePlan(plan_id, body) {
    const options = {
      data: body,
    };
    return axios.post(URLS.SUBSCRIPTION(plan_id), options);
  },
  getSubscriptionPlan() {
    return axios.get(URLS.SUBSCRIPTION());
  },
  updateSubscriptionStatus(subscription_id) {
    return axios.post(URLS.SUBSCRIPTION_STATUS(subscription_id));
  },
  getPlans() {
    return axios.get(URLS.PLANS());
  },
};

export default MainService;
