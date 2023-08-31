<template>
  <div class="products-container">
    <div class="all-products-wrap">
      <div class="filter-wrap">
        <div class="search-input input">
          <nitrozen-input
            v-model="search"
            type="text"
            :showSearchIcon="true"
            placeholder="Search by product by name"
            class="float-left"
          />
        </div>
        <!-- <div class="collection-input input">
          <nitrozen-dropdown
            placeholder="Collection"
            :value="collection"
            :items="collectionOptions"
            @change="handleCollectionChange"
          ></nitrozen-dropdown>
        </div> -->
        <div class="category-input input">
          <nitrozen-dropdown
            placeholder="Category"
            :value="category"
            :items="categoryOptions"
            label="category"
            @change="handleCategoryChange"
            @searchInputChange="handleCategorySearch"
            :multiple="true"
            :searchable="true"
            :enable_select_all="true"
          ></nitrozen-dropdown>
        </div>
        <div class="category-input input">
          <nitrozen-dropdown
            placeholder="Filter by Status"
            :value="status"
            :items="statusOptions"
            @change="handleStatusChange"
          ></nitrozen-dropdown>
        </div>
      </div>
    </div>
    <div class="action-wrap" v-if="products.length && !loader">
      <div class="input-wrap">
        <nitrozen-checkbox
          :showIcon="false"
          :value="isSelectedAll[this.PaginationConfig.current]"
          @change="
            () => handleSelectAll(!isSelectedAll[this.PaginationConfig.current])
          "
          state="default"
          text="Select All"
        >
          Select All (Total Selected: {{ [...selectedIdSet].length }})
        </nitrozen-checkbox>
      </div>
      <div class="select-wrap">
        <select-dropdown
          :disable="!isAnyProductSelected()"
          title="Customized selected"
          :options="customizeOptions"
          @click="(value) => handleCustomizeClick(value)"
        />
      </div>
    </div>
    <choose-template-dialog
      ref="chooseTemplateRef"
      v-if="isOpen"
      :productIds="getSelectedId()"
      @confirm="handleConfirm"
    ></choose-template-dialog>
    <div class="list-container" v-if="products.length && !loader">
      <!-- :isSelected="product.isSelected"
      :productImage="product.productImage"
      :productName="product.productName"
      :sku="product.sku"
      :brand="product.brand"
      :category="product.category"
      :templateName="product.templateName"
      :isCustomized="product.isCustomized"
      :slug="product.slug"
      :isActive="product.isActive"
      :productUID="product.id" -->
      <product-list
        v-for="(product, index) of products"
        :key="index"
        :product="product"
        :onEditClick="
          () => redirectToEditTemplate(product.templateId, product.id)
        "
        :onDeleteClick="() => onDeleteClickHandle(product.customizedProductId)"
        :chooseTemplateClick="() => handleChooseTemplate(product.id, false)"
        @change="(isSelected) => handleCheckBoxChange(index, isSelected)"
      />
      <nitrozen-pagination
        v-model="PaginationConfig"
        :pageSizeOptions="pageSizeOptions"
        class="PaginationConfig"
        @change="paginationChange"
      />
    </div>
    <div class="no-result" v-else-if="!loader">No Result Found</div>
    <loader :helperText="helperText" v-if="loader"></loader>
  </div>
</template>

<script>
import {
  NitrozenDropdown,
  NitrozenInput,
  NitrozenPagination,
  NitrozenCheckBox,
} from "@gofynd/nitrozen-vue";
import Loader from "../../components/common/loader.vue";
import ProductList from "../../components/product-list.vue";
import MainService from "../../services/main-service";
import SelectDropdown from "../../components/common/select-dropdown.vue";
import { CUSTOMIZED_DROPDOWN_OPTIONS } from "../../helper/constants";
import { debounce } from "../../helper/utils";
import ChooseTemplateDialog from "../../components/choose-template-dialog.vue";
import { mapActions } from "vuex";

const DEFAULT_PAGE = {
  limit: 10,
  total: 1,
  current: 1,
};
const STATUS_OPTIONS = [
  { text: "Customized", value: "customized" },
  { text: "All", value: "all" },
];
export default {
  components: {
    "nitrozen-input": NitrozenInput,
    "nitrozen-dropdown": NitrozenDropdown,
    "nitrozen-pagination": NitrozenPagination,
    "nitrozen-checkbox": NitrozenCheckBox,
    "product-list": ProductList,
    loader: Loader,
    "select-dropdown": SelectDropdown,
    "choose-template-dialog": ChooseTemplateDialog,
  },
  data() {
    return {
      isOpen: false,
      selectedIdSet: new Set(),
      chooseSelectedId: [],
      isAllProduct: false,
      // isSelectedAll: false,
      isSelectedAll: {},
      customizeOptions: [...CUSTOMIZED_DROPDOWN_OPTIONS],
      search: "",
      // collectionOptions: [],
      // collection: "",
      categoryOptions: [],
      category: "",
      statusOptions: [...STATUS_OPTIONS],
      status: "all",
      products: [],
      loader: true,
      helperText: "Loading...",
      PaginationConfig: { ...DEFAULT_PAGE },
      pageSizeOptions: [10, 20, 50],
      searchDebounce: null,
      categoryDebounce: null,
    };
  },
  watch: {
    search() {
      if (this.searchDebounce && (this.search.length >= 3 || this.search.length === 0)) this.searchDebounce();
    },
  },
  computed: {
    selectedIds() {
      return [...this.selectedIdSet];
    },
  },
  mounted() {
    this.getFilterOptions();
    this.getProductsDetails();
    this.searchDebounce = debounce(() => this.getProductsDetails(), 500);
    this.categoryDebounce = debounce(this.getCategoryData, 400);
  },
  methods: {
    ...mapActions(["setProductIds"]),
    paginationChange(e) {
      this.PaginationConfig = e;
      this.getProductsDetails();
    },
    isAnyProductSelected() {
      return [...this.selectedIdSet].length > 0;
    },
    getSelectedId() {
      if (!this.isAllProduct) {
        return this.chooseSelectedId;
      } else {
        return [...this.selectedIdSet];
      }
    },
    handleCustomizeClick(value) {
      if (this.selectedIds?.length) {
        if (value === "addManual") {
          // Setting Ids to VUEx
          this.setProductIds(this.selectedIds);
          this.redirectToCreateTemplate();
        } else if (value === "chooseTemplate") {
          this.handleChooseTemplate(this.selectedIds);
        }
      } else {
        this.$snackbar.global.showError("Please select the product");
      }
    },
    handleSelectAll(selectedState) {
      this.$set(
        this.isSelectedAll,
        this.PaginationConfig.current,
        selectedState
      );
      this.products.map((product) => {
        if (selectedState) {
          this.selectedIdSet.add(product.id);
        } else {
          this.selectedIdSet.delete(product.id);
          // const ind = this.selectedIds.findIndex((id) => id === product.id);
          // this.selectedIds.splice(ind, 1);
        }
        product.isSelected = selectedState;
      });
      this.products = [...this.products];
    },
    redirectToCreateTemplate() {
      this.setProductIds(this.selectedIds);
      this.$router.push(
        `/company/${this.$route.params.company_id}/application/${this.$route.params.application_id}/template?create_new=true&publish=true`
      );
    },
    redirectToEditTemplate(templateId, productId) {
      this.setProductIds([productId]);
      this.$router.push(
        `/company/${this.$route.params.company_id}/application/${this.$route.params.application_id}/template/edit/${templateId}?create_new=false&publish=true`
      );
    },
    resetList() {
      this.PaginationConfig = { ...DEFAULT_PAGE };
      this.getProductsDetails();
    },
    getFilterOptions() {
      // this.getAllCollections();
      this.getCategoryData();
    },
    handleStatusChange(value) {
      this.status = value;
      this.resetList();
    },
    handleCategoryChange(value) {
      this.category = value;
      this.resetList();
    },
    handleCategorySearch(searchObj) {
      this.categoryDebounce({ q: searchObj.text });
    },
    handleCollectionChange(value) {
      this.collection = value;
      this.resetList();
    },
    getCategoryData(params = {}) {
      return MainService.getAllCategoryData({ level: "3", ...params })
        .then((res) => {
          if (res?.data?.data?.items) {
            // To persist the old data
            const selectedData = [];
            this.categoryOptions.map((category) => {
              if (this.category.includes(category.value)) {
                selectedData.push(category);
              }
            });
            const resData = [];
            res.data.data.items?.forEach((item) => {
              const isAvailable = selectedData.filter(
                (data) => data.value === item.uid
              ).length;
              if (!isAvailable)
                resData.push({ text: item.name, value: item.uid });
            });
            this.categoryOptions = resData;
            this.categoryOptions.splice(0, 0, ...selectedData);
          }
          console.log("get category = ", res?.data);
          return res.data;
        })
        .catch((err) => {
          console.log("error = ", err);
        });
    },
    // getAllCollections() {
    //   return MainService.getAllCollections({
    //     application_id: this.$route.params.application_id,
    //   })
    //     .then((res) => {
    //       if (res?.data?.data?.items) {
    //         this.collectionOptions = res.data.data.items?.map((item) => {
    //           return { text: item.name, value: item.uid };
    //         });
    //       } else {
    //         this.$snackbar.global.showError("Failed fetching collections");
    //       }
    //       console.log("all collections = ", res.data);
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // },
    resetSelected() {
      this.isSelectedAll = {};
      this.selectedIdSet = new Set();
    },
    handleConfirm(templateId) {
      console.log("handleConfirm", templateId, this.getSelectedId());
      if (templateId) {
        const body = {
          template_id: templateId,
          product_ids: this.getSelectedId(),
          application_id: this.$route.params.application_id,
          company_id: this.$route.params.company_id,
        };
        MainService.updateProduct(body)
          .then((res) => {
            console.log("success", res);
            this.$snackbar.global.showSuccess("Updated Successfully");
            this.getProductsDetails();
            this.resetSelected();
            this.handleSelectAll(false);
          })
          .catch((err) => {
            console.log(err);
            this.$snackbar.global.showError("Error while Updating");
          });
      }
    },
    onDeleteClickHandle(productId) {
      if (productId) {
        MainService.deleteProduct({ id: productId })
          .then((res) => {
            console.log("deleted", res);
            this.$snackbar.global.showSuccess("Deleted Successfully");
            this.getProductsDetails();
          })
          .catch((err) => {
            console.log(err);
            this.$snackbar.global.showError("Error while Deleting");
          });
      }
    },
    handleChooseTemplate(productId, isAllProduct=true) {
      this.isOpen = true;
      this.isAllProduct = isAllProduct;
      if (isAllProduct) {
        this.selectedIdSet = Array.isArray(productId) ? new Set(productId) : new Set([productId]);
        this.setProductIds(this.selectedIds);
      } else {
        this.chooseSelectedId = [productId];
      }
      this.$nextTick(() => {
        this.$refs.chooseTemplateRef.openDialog();
      });
    },
    handleCheckBoxChange(index, isSelected) {
      this.products[index].isSelected = isSelected;
      this.products = [...this.products];
      if (isSelected) {
        this.selectedIdSet.add(this.products[index].id);
      } else {
        // const ind = this.selectedIds.findIndex(
        //   (id) => id === this.products[index].id
        // );
        // if (ind >= 0) this.selectedIds.splice(ind, 1);
        this.selectedIdSet.delete(this.products[index].id);
      }
      this.selectedIdSet = new Set([...this.selectedIdSet]);
      if (!this.isAnyProductSelected())
        this.isSelectedAll[this.PaginationConfig.current] = false;
    },
    getProductsDetails() {
      this.loader = true;
      const params = {
        q: this.search,
        status: this.status,
        pageNo: this.PaginationConfig.current,
        pageSize: this.PaginationConfig.limit,
        applicationId: this.$route.params.application_id,
      };
      if (this.category?.length) params["categoryIds"] = this.category;
      MainService.getProductsList(params)
        .then((data) => {
          this.PaginationConfig.current = data.data?.page?.current;
          this.PaginationConfig.total = data.data?.page?.item_total;
          this.products = this.getDataFormat(data?.data?.items) || {};
          this.loader = false;
        })
        .catch((err) => {
          this.loader = false;
          console.log("err", err);
        });
    },
    getDataFormat(products = []) {
      return products?.map((product) => {
        const image = product.images?.length ? product.images[0].url : "";
        return {
          productName: product.name,
          isSelected: this.selectedIdSet.has(product.uid) ? true : false,
          id: product.uid,
          productImage: image,
          brand: product.brand?.name || "",
          category: product.category_slug,
          isCustomized: product.is_customized,
          templateId: product.template_id,
          customizedProductId: product.customized_product_id,
          slug: product.slug,
          isActive: product.is_active,
          templateName: product.template_name,
        };
      });
    },
  },
};
</script>

<style scoped lang="less">
@import "../../styles/main.less";
.products-container {
  .all-products-wrap {
    .filter-wrap {
      background: @backgroundGray2;
      padding: 12px;
      gap: 16px;
      display: flex;
      margin-top: 24px;
      .input {
        width: 100%;
      }
      .search-input {
      }
      .category-input {
        ::v-deep .nitrozen-dropdown-label {
          display: none;
        }
        ::v-deep .nitrozen-option {
          display: block !important;
        }
      }
    }
  }
  .action-wrap {
    display: flex;
    margin: 24px 0;
    justify-content: space-between;
    align-items: center;
    .input-wrap {
      height: 18px;
      margin-left: 16px;
    }
    .select-wrap {
      width: 180px;
      ::v-deep .button-wrap {
        height: 40px;
      }
    }
  }
  .no-result {
    text-align: center;
    margin: 24px;
    font-weight: 600;
    font-size: 16px;
    line-height: 140%;
  }
}
</style>
