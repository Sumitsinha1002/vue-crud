<template>
  <div class="price-container">
    <loader v-if="pageLoading"></loader>
    <div class="top-banner">
      <div>
        <div class="banner-title">Pricing</div>
        <div class="banne-desc">
          Subscribe to below pricing plan in order continue using our features
        </div>
      </div>
    </div>
    <div class="plan-section">
      <div v-for="plan in plans" :key="plan._id" class="plan-data">
        <div class="plan-title cl-Mako">{{ plan.name }}</div>
        <div class="plan-price-data">
          <div class="plan-price">Rs.{{ plan.price.amount }} /</div>
          <div class="plan-price-desc cl-DustyGray2">
            {{ plan.yearly_plan ? ` year` : ` month` }}
          </div>
        </div>
        <div class="plan-features">
          <div
            v-for="(feature, index) in plan.features"
            :key="`feature-${index}`"
            class="feature-line"
          >
            <div class="feature-text cl-Mako">{{ feature }}</div>
          </div>
        </div>
        <nitrozen-button
          class="subscribe-btn"
          v-strokeBtn
          theme="secondary"
          @click="subscribeToPlan(plan._id)"
        >
          Subscribe
        </nitrozen-button>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
body {
  margin: 0;
  padding: 0;
}
.price-container {
  font-family: "Inter";
}
.top-banner {
  width: 100%;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e7eefe;
  color: #41434c;
  padding-bottom: 100px;
  .banner-title {
    text-align: center;
    font-size: 32px;
    font-weight: 700;
  }
  .banne-desc {
    margin-top: 10px;
    font-size: 15px;
    line-height: 20px;
    max-width: 500px;
  }
}
.plan-section {
  display: flex;
  justify-content: center;
  padding: 24px;
  .plan-data {
    padding: 40px 24px 50px;
    border-radius: 10px;
    margin: 15px;
    background: #fff;
    width: 260px;
    text-align: center;
    margin-top: -110px;
    box-shadow: 0 0 20px #f1f1f1;
    .plan-title {
      width: 100%;
      font-size: 25px;
      font-weight: 400;
      padding-bottom: 24px;
    }
    .plan-price-data {
      display: flex;
      justify-content: center;
      align-items: center;
      .plan-price {
        font-size: 30px;
        font-weight: 700;
      }
      .plan-price-desc {
        margin-left: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-top: 9px;
      }
    }
    .plan-features {
      padding: 20px 0;
      margin-bottom: 5px;

      .feature-line {
        text-align: center;
        align-items: center;
        padding: 14px 0 14px;
        &:after {
          content: "+";
          position: relative;
          bottom: -12px;
        }

        &:last-child:after {
          display: none;
        }
        .feature-text {
          text-align: left;
          margin-left: 8px;
          color: #41434c;
        }
      }
    }
  }
}
</style>
<script>
import loader from "../components/common/loader.vue";
import MainService from "../services/main-service";
import { NitrozenButton, strokeBtn } from "@gofynd/nitrozen-vue";

export default {
  name: "pricing-page",
  components: {
    NitrozenButton,
    loader,
  },
  directives: {
    strokeBtn,
  },
  data() {
    return {
      plans: [],
      pageLoading: false,
    };
  },
  beforeMount() {
    this.getPlans();
  },
  methods: {
    subscribeToPlan(plan_id) {
      this.pageLoading = true;
      MainService.subscribePlan(plan_id)
        .then(({ data }) => {
          if (data.confirm_url) {
            window.location.href = data.confirm_url;
          }
          this.pageLoading = false;
        })
        .catch((err) => {
          console.log(err);
          this.pageLoading = false;
        });
    },
    getPlans() {
      MainService.getPlans()
        .then(({ data }) => {
          this.plans = data.plans;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>
