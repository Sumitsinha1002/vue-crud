<template>
  <div class="wrap-container">
    <!-- UPLOAD Section -->
    <div class="main-container top-container">
      <div class="bulk-upload-container">
        <div
          :class="{
            'head-wrap': true,
            'accordion-head': true,
            'is-open': isOpen,
          }"
        >
          <div class="title">
            <div class="sub-heading">Import Products</div>
            <div class="label content-wrap">
              <span>Need help in importing?</span
              ><span class="link" @click="handleRedirect">Learn Here</span>
            </div>
          </div>
          <div class="right">
            <nitrozen-button
              theme="secondary"
              @click="downloadSample"
              v-stroke-btn
              :disabled="!isDropEnable"
            >
              Download Sample
            </nitrozen-button>
            <div class="icon-wrap" @click="toggleAccordion">
              <inline-svg src="arrow-down"></inline-svg>
            </div>
          </div>
        </div>
        <transition name="fade">
          <div
            :class="`file-container accordion-body ${
              isOpen ? 'accordion-open' : 'accordion-close'
            }`"
            v-show="isOpen"
          >
            <div class="upload-head-wrap">
              <div class="sub-heading">Import Products</div>
              <!-- <div
                :class="`link content-wrap ${isDropEnable ? '' : 'disable'}`"
              >
                <inline-svg src="history-icon"></inline-svg>
                <span>Upload History</span>
              </div> -->
            </div>
            <div
              :class="{
                'drop-area': true,
                'drop-disable': !isDropEnable,
                dragging: isDragOver,
              }"
              @dragenter="handleDragEnter"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
            >
              <div class="choose-file">
                <input
                  class="choose-file-input"
                  type="file"
                  @change="handleFileUpload"
                  accept=".xlsx"
                  :disabled="!isDropEnable"
                  ref="fileInput"
                />
                <inline-svg src="big-plus-icon"></inline-svg>
                <div class="link link-text">Choose File</div>
              </div>
              <p class="info">
                Drag and drop a file here(max. file size:
                {{ formatFileSize(MAX_FILE_SIZE) }})
              </p>
              <div class="label">Accepted File Type: .xlsx</div>
            </div>
            <div class="file-details" v-if="this.file">
              <inline-svg src="file-icon"></inline-svg>
              <div class="progress-wrap">
                <div class="text">
                  <div class="download-wrap">
                    <span>{{ this.file?.name }}</span>
                    <span
                      v-if="!showProgress"
                      @click="onDownloadCurrentProgress"
                    >
                      <svg-inline
                        class="list-icon download-icon"
                        src="download-icon"
                      />
                    </span>
                  </div>
                  <div class="action" @click="resetUpload">
                    <inline-svg src="close-icon"></inline-svg>
                  </div>
                </div>
                <progress-bar v-if="showProgress" :progress="apiProgress" />
                <template v-if="!showProgress">
                  <div class="message success-message" v-if="!importError">
                    <inline-svg src="success-icon"></inline-svg>
                    <span>Import Completed</span>
                  </div>
                  <div class="message fail-message" v-else>
                    <inline-svg src="error-icon"></inline-svg>
                    <span>Import Error</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <!-- FILE SUMMARY Section -->
    <div
      class="main-container summary-container"
      v-if="verifiedProductIds?.length || errorIds?.length"
    >
      <div class="summary-wrap">
        <div class="sub-heading">File Summary</div>
        <div class="label">
          Total Records: <span class="count">{{ recordCount }}</span>
          <span class="summary-message">{{ message }}</span>
        </div>
      </div>
      <div class="select-section">
        <select-dropdown
          title="Customize"
          :options="customizeOptions"
          @click="handleCustomizeClick"
        ></select-dropdown>
      </div>
    </div>
    <choose-template-dialog
      ref="chooseTemplateBulkRef"
      v-if="isDialogOpen"
      @confirm="handleConfirm"
    ></choose-template-dialog>

    <!-- Product Customisation History LIST -->
    <div class="history-container main-container">
      <div class="sub-heading-2">Product Customisation History</div>
      <div>
        <div class="search-input">
          <nitrozen-input
            v-model="search"
            type="text"
            :showSearchIcon="true"
            placeholder="Search by name"
            class="float-left"
          />
        </div>
        <div class="list-wrap" v-if="filteredList?.length">
          <list-card
            v-for="(xlsHistory, index) of filteredList"
            imageSrc="xls-icon"
            :showDownload="true"
            :onDownloadClick="() => handleDownload(xlsHistory)"
            :key="index"
            :name="xlsHistory.name"
            :informationMeta="xlsHistory.informationMeta"
            :isActive="xlsHistory.isActive"
            :showStatus="true"
            :onEditClick="
              () =>
                onEditClickHandle(
                  xlsHistory.templateId,
                  xlsHistory.productIds,
                  xlsHistory.id
                )
            "
            :onDeleteClick="() => onDeleteClickHandle(xlsHistory.id)"
            confirmMessage="Are you sure you want to delete the file along with the product's associated"
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
        <div v-else class="no-result">No Result Found.</div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  NitrozenButton,
  NitrozenInput,
  NitrozenPagination,
} from "@gofynd/nitrozen-vue";
import InlineSvg from "../../components/common/inline-svg.vue";
import {
  debounce,
  generateXLSX,
  readFile,
  formatFileSize,
} from "../../helper/utils";
import MainService from "../../services/main-service";
import SelectDropdown from "../../components/common/select-dropdown.vue";
import {
  BULK_UPLOAD_LEARN_MORE_LINK,
  CUSTOMIZED_DROPDOWN_OPTIONS,
  MAX_FILE_SIZE,
} from "../../helper/constants";
import { mapActions } from "vuex";
import ChooseTemplateDialog from "../../components/choose-template-dialog.vue";
import ProgressBar from "../../components/common/progress-bar.vue";
import ListCard from "../../components/common/list-card.vue";
import DateFormat from "date-format";
import SvgInline from "../../components/common/inline-svg.vue";

const DEFAULT_PAGE = {
  limit: 10,
  total: 1,
  current: 1,
};
export default {
  components: {
    "nitrozen-button": NitrozenButton,
    "nitrozen-input": NitrozenInput,
    "inline-svg": InlineSvg,
    SelectDropdown,
    "choose-template-dialog": ChooseTemplateDialog,
    "progress-bar": ProgressBar,
    "list-card": ListCard,
    NitrozenPagination,
    "svg-inline": SvgInline,
  },
  data() {
    return {
      isOpen: true,
      file: null,
      fileData: null,
      verifiedProductIds: [],
      productIdsToModify: [],
      errorIds: [],
      importError: false,
      wrongImport: false,
      isDragOver: false,
      isDropEnable: true,
      customizeOptions: [...CUSTOMIZED_DROPDOWN_OPTIONS],
      isDialogOpen: false,
      apiProgress: 0,
      showProgress: false,
      search: "",
      filteredList: [],
      PaginationConfig: { ...DEFAULT_PAGE },
      pageSizeOptions: [10, 20, 50],
      debounceSearch: null,
      MAX_FILE_SIZE: MAX_FILE_SIZE,
    };
  },
  computed: {
    recordCount() {
      if (
        this.productIdsToModify?.length - this.verifiedProductIds?.length ===
        0
      )
        return this.verifiedProductIds?.length;
      else
        return `${this.verifiedProductIds.length}/${this.productIdsToModify.length}`;
    },
    message() {
      if (
        this.productIdsToModify?.length - this.verifiedProductIds?.length !==
        0
      )
        return "Product uploaded successfully [Partial upload]";
      return "";
    },
  },
  watch: {
    search(newVal) {
      this.searchText = newVal;
      this.PaginationConfig = { ...DEFAULT_PAGE };
      this.debounceSearch();
    },
  },
  mounted() {
    this.getBulkUploadHistory();
    this.debounceSearch = debounce(() => this.resetList(), 500);
  },
  methods: {
    ...mapActions(["setProductIds"]),
    formatFileSize,
    resetUpload() {
      this.file = null;
      this.fileData = null;
      this.verifiedProductIds = [];
      this.productIdsToModify = [];
      this.errorIds = [];
      this.importError = false;
      this.wrongImport = false;
      this.isDropEnable = true;
      this.$refs.fileInput.value = null;
    },
    toggleAccordion() {
      this.isOpen = !this.isOpen;
    },
    downloadSample() {
      // sample xlsx download
      generateXLSX(["75807254", "73407254"]);
    },
    onDownloadCurrentProgress() {
      const dataToGenerate = [...this.fileData];
      dataToGenerate.forEach((data, index) => {
        if (index !== 0) { // to skip the title
          if (this.wrongImport) {
            dataToGenerate[index][1] = "something went wrong! Make sure to upload correct product UID";
          } else {
            if (this.errorIds.includes(data[0])) dataToGenerate[index][1] = "product UID not found";
            else dataToGenerate[index][1] = "success";
          }
        } else dataToGenerate[index][1] = "Remark";
      });
      generateXLSX(dataToGenerate, false, this.file?.name);
    },
    async handleFileUpload(event) {
      if (event.target.files[0]) {
        if (event.target.files[0]?.size <= this.MAX_FILE_SIZE) {
          this.file = event.target.files[0]; // Get the selected file
          this.fileData = await readFile(event.target.files[0]);
          this.verifyUploadedProductIds();
        } else {
          this.$snackbar.global.showError(
            `File size should not exceed ${formatFileSize(this.MAX_FILE_SIZE)}`
          );
        }
      }
    },
    handleDragEnter(event) {
      event.preventDefault();
      this.isDragOver = true;
    },
    handleDragOver(event) {
      event.preventDefault();
      this.isDragOver = true;
    },
    handleDragLeave(event) {
      event.preventDefault();
      this.isDragOver = false;
    },
    async handleDrop(event) {
      event.preventDefault();
      this.isDragOver = false;

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        if (files?.[0]?.size <= this.MAX_FILE_SIZE) {
          this.file = files[0]; // Get the dropped file
          this.fileData = await readFile(files[0]);
          this.isDropEnable = false;
          this.verifyUploadedProductIds();
        } else {
          this.$snackbar.global.showError(
            `File size should not exceed ${formatFileSize(this.MAX_FILE_SIZE)}`
          );
        }
      }
    },
    handleDownload(xlsHistory) {
      generateXLSX([...xlsHistory.productIds], true, xlsHistory.name);
    },
    handlePagination(e) {
      this.PaginationConfig = e;
      this.getBulkUploadHistory();
    },
    formatData(history) {
      return history?.map((data) => {
        const date = DateFormat("dd MM yyyy", new Date(data.updated_at));
        return {
          name: data.name || "",
          id: data._id,
          productIds: data.product_ids,
          templateId: data.template_id,
          informationMeta: [
            {
              key: "Products",
              value: data.product_ids?.length || 0,
            },
            {
              key: "Last Modified by",
              value: data.modified_by,
            },
            {
              key: "Last Modified on",
              value: date,
            },
          ],
          isActive: data.is_active,
        };
      });
    },
    getBulkUploadHistory() {
      const params = {
        page_no: this.PaginationConfig.current,
        page_size: this.PaginationConfig.limit,
        company_id: this.$route.params.company_id,
        application_id: this.$route.params.application_id,
        q: this.search,
        sort: 'desc',
      };
      MainService.getBulkUpload(params)
        .then((res) => {
          if (res.data.status === "success") {
            this.filteredList = this.formatData(res.data.data);
            this.PaginationConfig.current = res.data?.page?.current;
            this.PaginationConfig.total = res.data?.page?.item_total;
          } else {
            this.$snackbar.global.showError("Something went wrong");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    resetList() {
      this.PaginationConfig = { ...DEFAULT_PAGE };
      this.getBulkUploadHistory();
    },
    onEditClickHandle(templateId, productIds, id) {
      this.setProductIds(productIds);
      this.$router.push(
        `/company/${this.$route.params.company_id}/application/${this.$route.params.application_id}/template/edit/${templateId}?create_new=true&publish=true&bulk_upload=true&bulk_id=${id}`
      );
    },
    onDeleteClickHandle(id) {
      MainService.deleteBulkUpload({ id })
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
    verifyUploadedProductIds() {
      this.isDropEnable = false;
      if (!this.fileData) {
        return; // No file selected or dropped
      }
      console.log("data =", this.fileData);
      const productIds = [];
      this.fileData?.forEach((data, index) => {
        if (index !== 0 && data[0]) {
          return productIds.push(`${data[0]}`);
        }
      });
      this.productIdsToModify = [...productIds];
      this.showProgress = true;
      MainService.checkProducts(
        {
          product_ids: productIds,
        },
        (progressEvent) => {
          this.apiProgress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
        }
      )
        .then((res) => {
          console.log("res for check products = ", res);
          if (res.data.status === "success") {
            this.verifiedProductIds = [
              ...res?.data?.data?.items.map((item) => {
                const index = productIds.indexOf(`${item.uid}`);
                if (index >= 0) productIds.splice(index, 1);
                return item.uid;
              }),
            ];
            if (productIds?.length) {
              this.importError = true;
              this.errorIds = productIds;
            }
          } else {
            this.$snackbar.global.showError("Something went wrong");
          }
        })
        .catch((err) => {
          console.log(err);
          this.importError = true;
          this.wrongImport = true;
        })
        .finally(() => {
          // To hide the progress
          setTimeout(() => (this.showProgress = false), 1300);
        });
    },
    redirectToCreateTemplate() {
      this.$router.push(
        `/company/${this.$route.params.company_id}/application/${this.$route.params.application_id}/template?create_new=true&publish=true&bulk_upload=true&file_name=${this.file?.name}`
      );
    },
    handleChooseTemplate() {
      this.isDialogOpen = true;
      this.$nextTick(() => {
        this.$refs.chooseTemplateBulkRef.openDialog();
      });
    },
    handleConfirm(templateId) {
      if (templateId) {
        const body = {
          template_id: templateId,
          product_ids: this.verifiedProductIds,
          application_id: this.$route.params.application_id,
          company_id: this.$route.params.company_id,
          is_bulk_upload: true,
          file_name: this.file?.name || "",
        };
        MainService.updateProduct(body)
          .then((res) => {
            console.log("success", res);
            this.resetList();
            this.resetUpload();
            this.$snackbar.global.showSuccess("Updated Successfully");
            // this.getProductsDetails();
          })
          .catch((err) => {
            console.log(err);
            this.$snackbar.global.showError("Error while Updating");
          });
      }
    },
    handleCustomizeClick(value) {
      if (this.verifiedProductIds?.length) {
        if (value === "addManual") {
          // Setting Ids to VUEx
          this.setProductIds(this.verifiedProductIds);
          this.redirectToCreateTemplate();
        } else if (value === "chooseTemplate") {
          this.handleChooseTemplate();
        }
      } else {
        this.$snackbar.global.showError("Please select the product");
      }
    },
    handleRedirect() {
      window.open(BULK_UPLOAD_LEARN_MORE_LINK, "_blank");
    }
  },
};
</script>

<style scoped lang="less">
@import "../../styles/main.less";
.wrap-container {
  .accordion-head {
    // cursor: pointer;
  }
  .accordion-body {
    transition: height 0.3s ease-in-out;
    overflow: initial;
  }
  .accordion-open {
    height: "auto";
  }
  .accordion-close {
    height: 0;
    padding: 0;
    overflow: hidden;
  }
}
.top-container {
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  padding-top: 0;
}
.summary-container {
  display: flex;
  justify-content: space-between;
  .select-section {
    width: 134px;
  }
  .summary-wrap {
    .count {
      font-weight: 600;
      font-size: 14px;
      line-height: 130%;
    }
    .summary-message {
      font-weight: 400;
      font-size: 14px;
      line-height: 150%;
      margin-left: 2px;
    }
  }
}
.bulk-upload-container {
  .head-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 48px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 24px;
    .title {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .right {
      display: flex;
      align-items: center;
      gap: 24px;
    }
  }
  .file-container {
    width: 100%;
    .upload-head-wrap {
      display: flex;
      justify-content: space-between;
      padding-top: 24px;
      padding-bottom: 16px;
      .link.content-wrap.disable {
        opacity: 0.4;
      }
    }
    .drop-area {
      padding: 39.5px;
      text-align: center;
      border: 1px dashed rgba(46, 49, 190, 0.5);
      border-radius: 4px;
      background: rgba(240, 244, 255, 0.5);
      .choose-file {
        .choose-file-input {
          position: absolute;
          height: 51px;
          left: 50%;
          transform: translate(-50%);
          opacity: 0;
          cursor: pointer;
        }
        .link-text {
          font-size: 16px;
        }
      }
      .info {
        font-weight: 400;
        font-size: 12px;
        line-height: 160%;
        margin-top: 4px;
        margin-bottom: 8px;
      }
    }
    .drop-disable {
      background: @backgroundGray2;
      border: 1px dashed @gray5;
      border-radius: 4px;
      .link-text,
      .info,
      .label {
        color: @DustyGray4;
      }
      .choose-file {
        ::v-deep .inline-svg {
          path {
            fill: @DustyGray4;
          }
        }
      }
    }
    .dragging {
      opacity: 0.4;
    }

    .file-details {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-top: 16px;

      .progress-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
        .text {
          font-weight: 600;
          font-size: 12px;
          line-height: 130%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .download-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          .download-icon {
            cursor: pointer;
          }
        }
        .message {
          display: flex;
          align-items: center;
          font-weight: 600;
          font-size: 12px;
          line-height: 130%;
          gap: 4px;
          ::v-deep {
            .inline-svg {
              height: 18px;
            }
          }
        }
        .success-message {
          color: @successText;
        }
        .error-message {
          color: @errorText;
        }
      }
      .action {
        cursor: pointer;
      }
    }
  }
  .content-wrap {
    display: flex;
    align-items: center;
    gap: 2px;
    ::v-deep .inline-svg {
      height: 18px;
    }
  }
}
.history-container {
  .search-input {
    background: #f8f8f8;
    padding: 12px;
    border-radius: 4px;
    margin-top: 16px;
  }
  .no-result {
    text-align: center;
    margin: 24px;
    font-weight: 600;
    font-size: 16px;
    line-height: 140%;
  }
}
// common class styles
.sub-heading {
  font-weight: 600;
  font-size: 18px;
  line-height: 130%;
}
.sub-heading-2 {
  font-weight: 600;
  font-size: 14px;
  line-height: 130%;
}
.label {
  font-weight: 400;
  font-size: 12px;
  line-height: 160%;
  color: @DustyGray2;
}
.link {
  font-weight: 700;
  font-size: 12px;
  line-height: 160%;
  color: @RoyalBlue;
}
.is-open {
  .icon-wrap {
    cursor: pointer;
    ::v-deep svg {
      transform: rotate(180deg);
    }
  }
}
</style>
