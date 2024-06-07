<template>
    <CustomModal
      :show="show"
      :title="modalTitle"
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'900px'"
      @update:show="handleClose"
    >
      <template #body>
        <div class="modal-body">
          <div class="details-section">
            <div class="detail-item">
              <p>
                <strong>Nabídka:</strong>
                {{ offerDetails.offerGroup?.title }}
              </p>
            </div>
            <div class="detail-item">
              <p>
                <strong>Vytvořeno dne:</strong>
                {{ formatDate(offerDetails.offerGroup?.dateCreated) }}
              </p>
            </div>
          </div>
          <div class="scrollable-section">
            <div
              v-for="organization in offerDetails.offers"
              :key="organization.organization.id"
              class="organizations-section"
            >
              <div class="organization-item">
                <h3>{{ organization.organization.name }}</h3>
                <div v-if="organization.orderId" class="chip confirmed">
                  <span>Objednáno</span>
                </div>
                <div v-else class="chip pending">
                  <span>Čekající</span>
                </div>
              </div>
              <n-data-table
                :columns="itemColumns"
                :data="organization.items"
                class="item-table"
              ></n-data-table>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <n-button @click="handleClose" class="modal-close-button">Zavřít</n-button>
      </template>
    </CustomModal>
  </template>
  
  <script>
  import CustomModal from "../components/CustomModal.vue";
  import { ref, watch } from "vue";
  import { NButton, NDataTable } from "naive-ui";
  import { OfferApi } from "../api/openapi/api";
  import { getDefaultApiConfig } from "../utils/utils";
  
  export default {
    components: {
      CustomModal,
      NButton,
      NDataTable,
    },
    props: {
      show: Boolean,
      offerId: String,
    },
    emits: ["update:show"],
    setup(props, { emit }) {
      const offerApi = new OfferApi(getDefaultApiConfig());
      const offerDetails = ref({});
      const modalTitle = ref("");
  
      const loadOfferDetails = async (offerId) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          try {
            const response = await offerApi.offerOfferGroupDetailIdGet(offerId, {
              headers: { Authorization: `Bearer ${token}` },
            });
            offerDetails.value = response.data;
            modalTitle.value = `Detail nabídky: ${response.data.offerGroup?.title}`;
          } catch (error) {
            console.error("Failed to load offer details:", error);
          }
        }
      };
  
      const handleClose = () => {
        emit("update:show", false);
      };
  
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      };
  
      watch(() => props.offerId, (newOfferId) => {
        if (newOfferId) {
          loadOfferDetails(newOfferId);
        }
      }, { immediate: true });
  
      return {
        offerDetails,
        modalTitle,
        formatDate,
        handleClose,
        itemColumns: [
          { title: "Název položky", key: "name" },
          { title: "Popis", key: "description" },
          { title: "Množství", key: "quantity" },
          { title: "Jednotka", key: "unit" },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .modal-body {
    padding: 20px;
  }
  
  .details-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .detail-item {
    background-color: #f9f9f9;
    border-left: 5px solid #4caf50;
    padding: 10px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex: 1;
    margin-right: 10px;
  }
  
  .detail-item:last-child {
    margin-right: 0;
  }
  
  .detail-item p {
    margin: 0;
    color: #333;
    font-size: 16px;
  }
  
  .detail-item strong {
    font-weight: bold;
    color: #2c3e50;
  }
  
  .scrollable-section {
    max-height: 600px; /* Adjust this value as needed */
    overflow-y: auto;
    padding-right: 10px;
  }
  
  .organizations-section {
    margin-top: 20px;
  }
  
  .organization-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .chip {
    display: flex;
    align-items: center;
    padding: 0.5em 1em;
    border-radius: 16px;
    color: white;
    font-size: 0.875em;
    font-weight: bold;
    margin: 0.5em 0;
  }
  
  .confirmed {
    background-color: #4caf50;
  }
  
  .pending {
    background-color: #ffa500;
  }
  
  h3 {
    margin: 0;
  }
  
  .item-table {
    margin-top: 10px;
    width: 100%;
  }
  
  .modal-close-button {
    margin-right: 10px;
  }
  </style>
  