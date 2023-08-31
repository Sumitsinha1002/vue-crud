import { isBrowser } from "browser-or-node";
import * as XLSX from "xlsx";

let company_id = null;

export const setCompany = (companyId) => {
  company_id = companyId;
};

export const getCompany = () => {
  return company_id;
};

export const getCompanyBasePath = route => {
  return `/company/${route.params.company_id || getCompany()}`;
};

export const generateRoutesData = ({
  company_id,
  application_id,
  activeTab,
}) => {
  return {
    home: {
      route: `/company/${company_id}`,
      name: "Home",
    },
    feature: {
      route: `/company/${company_id}/application/${application_id}/features`,
      name: "Feature",
    },
    productCustomization: {
      route: `/company/${company_id}/application/${application_id}/product-customization`,
      name: "Product Customization",
    },
    bulkUpload: {
      route: `/company/${company_id}/application/${application_id}/product-customization?activeTab=${activeTab}`,
      name: "Bulk Upload",
    },
    manageCustomization: {
      route: `/company/${company_id}/application/${application_id}/manage-customization`,
      name: "Manage Customization",
    },
    editTemplate: {
      route: `/company/${company_id}/application/${application_id}/template/edit/:template_id`,
      name: "Edit Template",
    },
    createTemplate: {
      route: `/company/${company_id}/application/${application_id}/template`,
      name: "Create Template",
    },
  };
};

export const currencyConvert = (value, symbol='₹', locale='en-IN') => {
  if (typeof value === 'string') value = parseInt(value);
  return `${symbol} ${value.toFixed(2).toLocaleString(locale)}`;
}

export const transformRequestOptions = (params) => {
  let options = "";

  for (const key in params) {
    if (typeof params[key] !== "object" && params[key]) {
      const encodeVal = encodeURIComponent(params[key]);
      options += `${key}=${encodeVal}&`;
    } else if (Array.isArray(params[key])) {
      params[key].forEach((el) => {
        const encodeVal = encodeURIComponent(el);
        options += `${key}=${encodeVal}&`;
      });
    } else if (typeof params[key] === "object" && params[key]) {
      options += transformRequestOptions(params[key]);
    }
  }
  return options ? options.slice(0, -1) : options;
};

export const validateSettings = (settings, values) => {
  let validation = new Array(settings.length).fill().map(Object);
  let isValid = true;
  settings.forEach((setting, index) => {
    setting.forEach((config) => {
      const val = values[index][config.id];
      if (
        config.required &&
        (val === null ||
          (typeof val === "number" ? val < 0 : false) ||
          (typeof val === "string" || Array.isArray(val)
            ? !val.length
            : false) ||
          (typeof val === "object" ? isObjectEmpty(val) : false))
      ) {
        validation[index][config.id] = true;
        isValid = false;
        validation[index]["isValid"] = false;
      } else validation[index][config.id] = false;
    });
  });
  return { validation, isValid };
};

export const isObjectEmpty = (objectName) => {
  return (
    objectName &&
    Object.keys(objectName).length === 0 &&
    objectName.constructor === Object
  );
};

export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

export const formatFileSize = (size) => {
  if (size < 1024) {
    return `${size} bytes`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)}KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(0)}MB`;
  }
};

export const generateXLSX = (
  productIds = [],
  isProductId = true,
  fileName = "sample.xlsx"
) => {
  const workbook = XLSX.utils.book_new();
  const ids = isProductId
    ? [["Product UID"], ...productIds.map((productId) => [productId])]
    : productIds;
  const worksheet = XLSX.utils.aoa_to_sheet(ids);

  if (!worksheet.A1.c) worksheet.A1.c = [];
  worksheet.A1.c.push({ a: "SheetJS", t: "Please enter the product UID" });

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const blob = new Blob([xlsxBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  // Append the link element to the DOM and click it programmatically
  document.body.appendChild(link);
  link.click();
  // Remove the link element from the DOM
  document.body.removeChild(link);
  // Release the object URL
  window.URL.revokeObjectURL(url);
};

export const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Assuming you have a single sheet, get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert worksheet to JSON object
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      console.log(jsonData); // Use the retrieved JSON data as needed
      resolve(jsonData);
    };
    reader.onerror = (e) => {
      console.error(e);
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });
};

// IMAGE UPLOAD helpers
export const copyToClipboard = (str) => {
  const el = document.createElement("textarea"); // Create a <textarea> element
  el.value = str; // Set its value to the string that you want copied
  el.setAttribute("readonly", ""); // Make it readonly to be tamper-proof
  el.style.position = "absolute";
  el.style.left = "-9999px"; // Move outside the screen to make it invisible
  document.body.appendChild(el); // Append the <textarea> element to the HTML document
  const selected =
    document.getSelection().rangeCount > 0 // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0) // Store selection if found
      : false; // Mark as false to know no selection existed before
  el.select(); // Select the <textarea> content
  document.execCommand("copy"); // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el); // Remove the <textarea> element
  if (selected) {
    // If a selection existed before copying
    document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
    document.getSelection().addRange(selected); // Restore the original selection
  }
};
export const detectMobileWidth = () => {
  if (isBrowser) {
    if (window && window.screen.width <= 768) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
