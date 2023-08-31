import { getCompany, setCompany } from '../helper/utils';
import { isNode } from "browser-or-node";

let subscriptionDetail = null;
export const checkSubscription = (to, from, next) => {
  if (isNode) {
    return next();
  }
  const { params } = to;
  if (params.company_id) {
    setCompany(params.company_id);
  }
  import("../services/main-service").then(service => {
    service.default
      .getSubscriptionPlan()
      .then(({ data }) => {
        subscriptionDetail = data;
        if (
          subscriptionDetail &&
          subscriptionDetail.subscription &&
          subscriptionDetail.subscription.status === "active"
        ) {
          next();
        } else {
          next(`/company/${getCompany()}/pricing`);
        }
      })
      .catch(err => {
        console.log(err);
        next(`/company/${getCompany()}/pricing`);
      });
  });
};

export const routeGuard = (to, from, next) => {
  const { params } = to;
  if (params.company_id) {
    setCompany(params.company_id);
  }
  next();

};