import { isBrowser } from "browser-or-node";
import root from "window-or-global";
import urlJoin from "url-join";
const env = root.env || {};

let headers = {};
let appInfo = {};
let companyId = null;

/**
 * Get common header options
 * @param {Boolean} appLevel set false for company level APIs
 */
export const getCommonHeaderOptions = (appLevel = true) => {
  const appHeader = {};
  if (appInfo && appInfo._id && appLevel) {
    appHeader["x-application-id"] = appInfo._id;
    console.log("appInfo._id", appInfo._id);
  }
  if (appInfo && appInfo.token && appLevel) {
    appHeader["x-application-token"] = appInfo.token;
  }
  let defaultHeader = isBrowser ? appHeader : {};
  return {
    headers: {
      "Content-Type": "application/json",
      "x-currency-code": "INR",
      ...defaultHeader,
      ...headers,
    },
  };
};

export const setAuthTokenHeader = (token) => {
  headers[env.AUTH_HEADER_NAME] = token;
};

export const setAppInfo = (app) => {
  root.config = {};
  root.config.application = app;
  appInfo = app;
  console.log(appInfo);
  console.log(appInfo.token);
  console.log(appInfo.enabled);
};
export const getAppInfo = () => {
  console.log(appInfo.token);
  console.log(appInfo.id);
  return appInfo;
};
export const setCompInfo = (compId) => {
  companyId = compId;
};
export const getCompInfo = () => {
  return companyId;
};

export function getUrlWithAppIdAndCompanyId(version, url) {
  const appData = getAppInfo();
  return urlJoin(
    url,
    version,
    "company",
    appData.company_id + "",
    "application",
    appData.id
  );
}
export function getUrlWithCompanyId(version, url) {
  const appData = getAppInfo();
  return urlJoin(url, version, "company", appData.company_id + "");
}

export function getBasePathWithCompanyId(version, url) {
  return urlJoin(url, version, "company", getCompInfo() + "");
}
