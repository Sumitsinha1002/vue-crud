<template>
  <div>
    <loader v-if="loading" :helperText="'Verifying subscription'"></loader>
  </div>
</template>
<style></style>
<script>
import MainService from "../services/main-service";
import loader from "../components/common/loader.vue";
import { getCompanyBasePath } from "../helper/utils";
export default {
  name: "charge-state",
  components: {
    loader,
  },
  data() {
    return {
      loading: false,
      approved: false,
      subscription_id: null,
    };
  },
  beforeMount() {
    this.approved = this.$route.query.approved;
    this.subscription_id = this.$route.query.subscription_id;
    this.checkChargStatus();
  },
  methods: {
    checkChargStatus() {
      this.loading = true;
      MainService.updateSubscriptionStatus(this.subscription_id)
        .then(({ data }) => {
          if (data.status === "active") {
            this.$router.push(`${getCompanyBasePath(this.$route)}/`);
            this.$snackbar.global.showSuccess("Charge approved");
          } else {
            // TODO: add better handling page and show decline status on page. Ask user to continue back to pricing
            this.$snackbar.global.showError("Charge was declined");
            this.$router.push(`${getCompanyBasePath(this.$route)}/pricing`);
          }
        })
        .catch((err) => {
          this.$snackbar.global.showError(
            "Failed to verify subscription status",
            3000
          );
          console.log(err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
