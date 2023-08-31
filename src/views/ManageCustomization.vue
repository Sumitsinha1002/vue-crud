<template>
  <div>
    <breadcrumb />
    <div class="main-container">
      <div class="title-wrap">
        <div @click="handleBack">
          <inline-svg class="icon" src="back-icon"></inline-svg>
        </div>
        <h4 class="main-title">Manage Customisation</h4>
      </div>
      <p class="description">Some details about new version creation</p>
      <div
        class="list-container"
        v-if="filteredList?.length || state !== 'initial'"
      >
        <div class="create-and-search-wrap">
          <div class="create-template">
            <h6 class="template-title">Customisation Templates</h6>
            <NitrozenButton
              :rounded="false"
              theme="secondary"
              @click="handleNewClick"
              v-flat-btn
            >
              Create New
            </NitrozenButton>
          </div>
          <div class="template-search" v-if="!loader">
            <nitrozen-input
              autocomplete="off"
              type="text"
              placeholder="Search by name"
              :disabled="false"
              validationMessage=""
              showSearchIcon
              prefix=""
              custom
              @input="handleSearchChange"
              :value="searchText"
            />
          </div>
        </div>
        <template v-if="!loader">
          <div class="list-and-page-wrap" v-if="filteredList?.length">
            <list-card
              v-for="(template, index) of filteredList"
              :key="index"
              :name="template.name"
              :informationMeta="template.informationMeta"
              :isActive="template.isActive"
              :showStatus="true"
              :onEditClick="() => onEditClickHandle(template.id)"
              :onDeleteClick="() => onDeleteClickHandle(template.id)"
            />
            <div class="pagination-wrap">
              <NitrozenPagination
                v-model="PaginationConfig"
                :pageSizeOptions="pageSizeOptions"
                class="PaginationConfig"
                @change="handlePagination"
              />
            </div>
          </div>
          <div v-else>No result found</div>
        </template>
        <loader helperText="Loading..." v-else></loader>
      </div>
      <div v-else class="empty-list">
        <img src="../assets/add-page.png" alt="no-item-logo" />
        <div class="message-wrap">
          <h5 class="main-message">
            You have not added any customisation template yet
          </h5>
          <p class="description no-list-p">
            Once you will add custom templates they will appear here
          </p>
        </div>
        <NitrozenButton
          class="add-button"
          theme="secondary"
          @click="handleNewClick"
          v-flat-btn
          >Add</NitrozenButton
        >
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import {
  NitrozenButton,
  NitrozenPagination,
  NitrozenInput,
} from "@gofynd/nitrozen-vue";
import MainService from "../services/main-service";
import InlineSvg from "../components/common/inline-svg.vue";
import ListCard from "../components/common/list-card.vue";
import DateFormat from "date-format";
import Loader from "../components/common/loader.vue";
import { mapActions } from "vuex";
import { toFeature } from "../helper/redirect";
import { debounce } from "../helper/utils";
import Breadcrumb from '../components/common/breadcrumb.vue';

const DEFAULT_PAGE = {
  limit: 10,
  total: 1,
  current: 1,
};
export default {
  components: {
    NitrozenButton,
    "inline-svg": InlineSvg,
    "list-card": ListCard,
    NitrozenPagination,
    "nitrozen-input": NitrozenInput,
    loader: Loader,
    "breadcrumb": Breadcrumb
  },
  data() {
    return {
      filteredList: [],
      PaginationConfig: { ...DEFAULT_PAGE },
      pageSizeOptions: [10, 20, 50],
      searchText: "",
      state: "",
      loader: true,
      debounceTemplateDetail: null,
    };
  },
  mounted() {
    this.getTemplateDetails();
    this.debounceTemplateDetail = debounce(
      () => this.getTemplateDetails(),
      500
    );
  },
  methods: {
    ...mapActions(["resetState"]),
    handleSearchChange(value) {
      this.searchText = value;
      this.PaginationConfig = { ...DEFAULT_PAGE };
      this.debounceTemplateDetail();
    },
    handleBack() {
      //   this.$router.go(-1);
      toFeature(this);
    },
    handlePagination(e) {
      this.PaginationConfig = e;
      this.getTemplateDetails();
    },
    onEditClickHandle(template_id) {
      this.$router.push(
        `/company/${this.$route.params.company_id}/application/${this.$route.params.application_id}/template/edit/${template_id}`
      );
    },
    resetList() {
      this.PaginationConfig = { ...DEFAULT_PAGE };
      this.getTemplateDetails();
    },
    onDeleteClickHandle(template_id) {
      MainService.deleteTemplate({ template_id })
        .then((res) => {
          this.$snackbar.global.showSuccess("Deleted Successfully");
          console.log(res);
        })
        .catch((err) => {
          this.$snackbar.global.showError("Delete Failed");
          console.log(err);
        })
        .finally(() => {
          this.resetList();
        });
    },
    getDataFormat(data) {
      return data?.map((template) => {
        const date = DateFormat("dd MM yyyy", new Date(template.updated_at));
        const templateSize = Object.keys(
          template.template_configuration
        )?.length;
        return {
          name: template.template_name,
          id: template._id,
          informationMeta: [
            {
              key: "Custom Fields",
              value: templateSize || 0,
            },
            {
              key: "Last Modified by",
              value: template.modified_by,
            },
            {
              key: "Last Modified on",
              value: date,
            },
          ],
          isActive: template.is_active,
        };
      });
    },
    getTemplateDetails() {
      const params = {
        page_no: this.PaginationConfig.current,
        page_size: this.PaginationConfig.limit,
        company_id: this.$route.params.company_id,
        application_id: this.$route.params.application_id,
        q: this.searchText,
      };
      MainService.getTemplates(params)
        .then((res) => {
          if (this.state === "") this.state = "initial";
          else if (this.state === "initial") this.state = "loaded";
          this.filteredList = this.getDataFormat(res.data?.data);
          this.PaginationConfig.current = res.data?.page?.current;
          this.PaginationConfig.total = res.data?.page?.item_total;
        })
        .catch((err) => {
          console.log("template err", err);
        })
        .finally(() => {
          this.loader = false;
        });
    },
    handleNewClick() {
      this.$router.push(
        `/company/${this.$route.params.company_id}/application/${this.$route.params.application_id}/template`
      );
    },
  },
};
</script>

<style scoped lang="less">
@F8Color: #f8f8f8;
.main-container {
  .description {
    margin-left: 40px;
  }
  .title-wrap {
    display: flex;
    gap: 16px;
    .icon {
      cursor: pointer;
    }
  }
  .list-container {
    margin-top: 24px;
    .create-and-search-wrap {
      margin-bottom: 16px;
      .create-template {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        justify-content: space-between;
        .template-title {
          margin: 0;
          font-weight: 600;
          font-size: 14px;
          line-height: 130%;
        }
      }
      .template-search {
        padding: 12px;
        background: @F8Color;
      }
    }
    .list-and-page-wrap {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }
  .empty-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    max-width: 272px;
    margin: auto;
    margin-top: 24px;
    text-align: center;
    .message-wrap {
      .main-message {
        margin: -32px 0 12px 0;
      }
      .no-list-p {
        line-height: 19.2px;
      }
    }
    .add-button {
      margin-top: 16px;
    }
  }
}
</style>
