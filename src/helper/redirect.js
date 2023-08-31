export const toFeature = (self) => {
  const pathToRedirect = `/company/${self.$route.params.company_id}/application/${self.$route.params.application_id}/features`;
  if (self.$route.path !== pathToRedirect) self.$router.push(pathToRedirect).catch(() => {})
};

export const toAddProduct = (self) => {
  const pathToRedirect = `/company/${self.$route.params.company_id}/application/${self.$route.params.application_id}/product-customization`;
  if (self.$route.path !== pathToRedirect) self.$router.push(pathToRedirect).catch(() => {});
};

export const toManageCustomization = (self) => {
  const pathToRedirect = `/company/${self.$route.params.company_id}/application/${self.$route.params.application_id}/manage-customization`;
  if (self.$route.path !== pathToRedirect) self.$router.push(pathToRedirect).catch(() => {});
};

export const toCreate = (self) => {
  const pathToRedirect = `/company/${self.$route.params.company_id}/application/${self.$route.params.application_id}/template`;
  if (self.$route.path !== pathToRedirect) self.$router.push(pathToRedirect);
};

export const toBulkUpload = (self) => {
  const pathToRedirect = `/company/${self.$route.params.company_id}/application/${self.$route.params.application_id}/product-customization?activeTab=1`;
  if (self.$route.path !== pathToRedirect) self.$router.push(pathToRedirect);
}
