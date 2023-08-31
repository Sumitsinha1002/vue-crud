import { sdkUpload } from "../../bindings/product-customization/services/main.service";
import MainService from "../services/main-service";

// Picking the platform or application api to call
export const getUpload = (isClientApplication = false) => {
  return isClientApplication ? sdkUpload : MainService.upload;
};

// Helper function to image upload
export const constructSnackBar = (toast) => {
  return {
    global: {
      showSuccess: (t) => {
        toast.success(t, {
          position: "top-center",
          duration: 3000,
        });
      },
      showError: (t) =>
        toast.error(t, {
          position: "top-center",
          duration: 3000,
        }),
      ...toast,
    },
  };
};
