import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Feature from "../views/Feature.vue";
import ManageCustomization from "../views/ManageCustomization.vue";
import ProductCustomization from "../views/ProductCustomization.vue";
import Template from "../views/Template.vue";
import { checkSubscription, routeGuard } from "./guard";
import { generateRoutesData } from "../helper/utils";
Vue.use(VueRouter);

const routes = [
  {
    path: "/company/:company_id/",
    name: "Home",
    beforeEnter: checkSubscription,
    component: Home,
    meta: {
      breadCrumb(route) {
        const { company_id, application_id } = route.params;
        const routesData = generateRoutesData({ company_id, application_id });
        return [{ ...routesData.home, current: true }];
      },
    },
  },
  {
    path: "/company/:company_id/application/:application_id/features",
    name: "Features",
    beforeEnter: checkSubscription,
    component: Feature,
    meta: {
      breadCrumb(route) {
        const { company_id, application_id } = route.params;
        const routesData = generateRoutesData({ company_id, application_id });
        return [routesData.home, { ...routesData.feature, current: true }];
      },
    },
  },
  {
    path: "/company/:company_id/application/:application_id/product-customization",
    name: "ProductCustomization",
    beforeEnter: checkSubscription,
    component: ProductCustomization,
    meta: {
      breadCrumb(route) {
        const { company_id, application_id } = route.params;
        const { activeTab } = route.query;
        const routesData = generateRoutesData({
          company_id,
          application_id,
          activeTab,
        });
        const breadcrumb = [routesData.home, routesData.feature];
        if (activeTab == 1)
          breadcrumb.push({ ...routesData.bulkUpload, current: true });
        else
          breadcrumb.push({
            ...routesData.productCustomization,
            current: true,
          });
        return breadcrumb;
      },
    },
    // pathToRegexpOptions: { strict: true },
  },
  {
    path: "/company/:company_id/application/:application_id/manage-customization",
    name: "ManageCustomization",
    beforeEnter: checkSubscription,
    component: ManageCustomization,
    meta: {
      breadCrumb(route) {
        const { company_id, application_id } = route.params;
        const routesData = generateRoutesData({ company_id, application_id });
        return [
          routesData.home,
          routesData.feature,
          { ...routesData.manageCustomization, current: true },
        ];
      },
    },
  },
  {
    path: "/company/:company_id/application/:application_id/template/edit/:template_id",
    name: "Template",
    beforeEnter: checkSubscription,
    component: Template,
    meta: {
      breadCrumb(route) {
        const { company_id, application_id, template_id } = route.params;
        const routesData = generateRoutesData({
          company_id,
          application_id,
          template_id,
        });
        return [
          routesData.home,
          routesData.feature,
          { ...routesData.editTemplate, current: true },
        ];
      },
    },
  },
  {
    path: "/company/:company_id/application/:application_id/template",
    beforeEnter: checkSubscription,
    component: Template,
    meta: {
      breadCrumb(route) {
        const { company_id, application_id } = route.params;
        const routesData = generateRoutesData({
          company_id,
          application_id,
        });
        return [
          routesData.home,
          routesData.feature,
          { ...routesData.createTemplate, current: true },
        ];
      },
    },
  },
  {
    path: "/company/:company_id/pricing",
    component: () =>
      import(
        /* webpackChunkName: "application" */
        "../views/Pricing.vue"
      ),
    meta: {
      name: "Pricing page",
    },
    beforeEnter: routeGuard,
  },
  {
    path: "/company/:company_id/subscription-status",
    component: () =>
      import(
        /* webpackChunkName: "application" */
        "../views/SubscriptionStatus.vue"
      ),
    meta: {
      name: "Subscription Status",
    },
    beforeEnter: routeGuard,
  },
];
const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
