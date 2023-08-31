<template>
  <div>
    <breadcrumb />
    <div class="application main-container">
      <div class="section-heading">
        <h3>Sales Channel</h3>
        <p>
          Here’s a list of sales channels for which the extension is either active
          or inactive
        </p>
      </div>
      <div class="search">
        <NitrozenInput
          v-model="search"
          type="text"
          :search="trueData"
          :showSearchIcon="trueData"
          placeholder="Search Sales Channel"
          class="float-left"
        />
      </div>
      <div class="card-wrapper" v-if="this.applications.items">
        <card
          v-for="(item, i) in this.filteredApplications"
          :key="i"
          :logo="item.logo.secure_url"
          :content="item.name"
          :description="item.domain.name"
          :onClick="(item) => onClickApplication(item, status[item._id])"
          :showStatus="true"
          :isActive="status?.[item._id]?.is_active || false"
          :meta="item"
        />
      </div>
      <NitrozenPagination
        v-if="applications.page"
        v-model="PaginationConfig"
        :pageSizeOptions="pageSizeOptions"
        class="PaginationConfig"
        @change="paginationChange"
      />
      <loader :helperText="helperText" v-if="this.loader"></loader>
    </div>
  </div>
</template>
<script>
import {
  NitrozenInput,
  NitrozenPagination,
} from "@gofynd/nitrozen-vue";
import MainService from "./../services/main-service";
import loader from "./../components/common/loader.vue";
import card from "./../components/common/card.vue";
import { setAppInfo } from "../services/utils.service";
import Breadcrumb from '../components/common/breadcrumb.vue';
import { mapActions } from "vuex";

export default {
  name: "Application",
  components: {
    loader,
    NitrozenInput,
    NitrozenPagination,
    card,
    'breadcrumb': Breadcrumb
  },
  data() {
    return {
      trueData: true,
      status: {},
      filters: [{ text: "All", value: "all" }],
      loader: true,
      search: "",
      selectedFilter: "all",
      helperText: "Loading...",
      applications: {
        items: [],
      },
      PaginationConfig: {
        limit: 12,
        total: 1,
        current: 1,
      },
      pageSizeOptions: [12, 24, 48, 96],
    };
  },
  computed: {
    filteredApplications() {
      return this.applications.items.filter(
        (c) => c.name.toLowerCase().indexOf(this.search) > -1
      );
    },
  },
  mounted() {
    this.getApplications();
    this.getSalesChannelStatus();
  },
  methods: {
    ...mapActions(["setApplicationData"]),
    paginationChange(e) {
      this.PaginationConfig = e;
      this.getApplications();
    },
    getApplications() {
      const params = {
        page_no: this.PaginationConfig.current,
        page_size: this.PaginationConfig.limit,
        company_id: this.$route.params.company_id,
      };
      MainService.getAllApplications(params)
        .then(({ data }) => {
          this.PaginationConfig.current = data.page.current;
          this.PaginationConfig.total = data.page.item_total;
          this.applications = data;
          this.setApplicationData(data?.items);
          this.loader = false;
        })
        .catch(() => {
          this.loader = false;
        });
    },
    onClickApplication(item, status) {
      this.$store.state.applications_name = item.name;
      // this.$router.push(
      //   `/company/${this.$route.params.company_id}/${app_id}/messenger/notification-templates`
      // );
      console.log('active', item, status, this.applications.items)
      const domainName =
        item.domains &&
        item.domains.length > 0 &&
        item.domains[0].name;
      const app = {
        company_id: item.company_id,
        id: item._id || item.id,
        domain: domainName,
        token: item.token,
        enabled: status?.is_active || false,
      };
      setAppInfo(app);
      this.$router.push(
        `/company/${this.$route.params.company_id}/application/${item._id || item.id}/features`
      );
    },
    getSalesChannelStatus() {
      MainService.getSalesChannelStatus({
        company_id: this.$route.params.company_id,
      })
        .then(({ data }) => {
          const active = data.data.reduce(
            (obj, cur) => ({ ...obj, [cur.application_id]: cur }),
            {}
          );
          this.status = active;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>
<style lang="less">
@import "../styles/main.less";
.section-heading h3 {
  margin-top: 0;
  font-style: normal;
  line-height: 28px;
  font-weight: 600;
  font-size: 20px;
  color: #41434c;
  margin-bottom: 15px;
}
.section-heading p {
  margin-top: 0;
  font-size: 14px;
  margin-bottom: 20px;
  font-family: Inter, sans-serif;
  color: #666666;
}
.search {
  margin-bottom: 25px !important;
  width: 49%;
}
/* .float-left 
{
    float: left;
} */
.float-right {
  float: right;
}
.filter-box {
  width: 310px;
  display: table-footer-group;
}
.filter-box .nitrozen-dropdown-label {
  position: relative;
  top: 8px;
}
.filter-box .nitrozen-select-wrapper {
  width: 250px;
  float: right;
}
.columns-4 {
  grid-template-columns: 25% 25% 25% 25%;
  width: calc(100% - 54px);
}
.card-main {
  display: grid;
  grid-column-gap: 18px;
}
.card-innerbox {
  margin-bottom: 24px;
}
.card-box {
  border: 1px solid #e4e5e6;
  border-radius: 10px;
  overflow: hidden;
  padding: 20px;
  background-color: #fff;
  height: 100%;
  box-sizing: border-box;
  position: relative;
}
.card-logo {
  min-height: 60px;
}
.card-logo img {
  max-width: 52px;
}
.select-widget {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
.select-widget .inline-svg {
  float: right;
  height: 35px;
  width: 35px;
  font-size: 15px;
  transform: rotate(180deg);
  padding: 6px 6px;
  display: block;
  border-radius: 20%;
  border: 1px solid #dedede;
  box-sizing: border-box;
  transform: rotate(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-content {
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
  margin-top: 10px;
}
.card-content h4 {
  margin: 0;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 15px;
  color: #41434c;
}
.card-content p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: @DustyGray3;
  font-family: Inter, sans-serif;
}
.inactive_button {
  position: relative;
  border: 1px solid #eb5757;
  background-color: transparent;
  color: #eb5757;
  width: 74px;
  text-transform: uppercase;
  height: 22px;
  top: 7px;
  font-family: Inter;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
}
.card-innerbox a {
  display: block;
  width: 100%;
  outline: none;
  text-decoration: none;
  box-sizing: border-box;
}
.button-container {
  width: 100%;
  float: left;
  cursor: pointer;
}
.mt {
  margin-top: 40px;
}
.status {
  padding-bottom: 4px;
}
</style>
