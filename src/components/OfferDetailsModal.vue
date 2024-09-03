<template>
  <CustomModal
    :show="show"
    :title="modalTitle"
    :header-bg-color="'#008000'"
    :modal-width="'1200px'"
    :modal-height="'900px'"
    @update:show="handleClose"
  >
    <template #body>
      <div class="modal-body">
        <div v-if="!selectedOfferId" class="all-offers-view">
          <div class="offer-summary">
            <div class="summary-item">
              <h4>Nabídka</h4>
              <p>{{ offerDetails.offerGroup?.title }}</p>
            </div>
            <div class="summary-item">
              <h4>Vytvořeno dne</h4>
              <p>{{ formatDate(offerDetails.offerGroup?.dateCreated) }}</p>
            </div>
          </div>
          <div class="scrollable-section">
            <div
              v-for="organization in offerDetails.offers"
              :key="organization.organization.id"
              class="organization-card"
            >
              <div class="organization-header">
                <div class="organization-chip">
                  <h3>{{ organization.organization.name }}</h3>
                </div>
                <div :class="['status-chip', organization.orderId ? 'confirmed' : 'pending']">
                  {{ organization.orderId ? 'Objednáno' : 'Čekající' }}
                </div>
              </div>
              <n-data-table
                :columns="itemColumns"
                :data="organization.items"
                class="item-table"
              />
              <div class="button-container">
                <n-button 
                  @click="selectOffer(organization.organization.id)"
                  class="detail-button"
                >
                  Detail Nabídky
                </n-button>
              </div>
            </div>
          </div>
        </div>
        <OfferDetailViewComponent
          v-else
          :offer="selectedOfferDetails"
          :itemColumns="itemColumns"
          @back="backToAllOffers"
        />
      </div>
    </template>
    <template #footer>
      <n-button @click="handleClose" class="close-button">Zavřít</n-button>
    </template>
  </CustomModal>
</template>
<script>
import CustomModal from "../components/CustomModal.vue";
import OfferDetailViewComponent from "../components/OfferDetailViewComponent.vue";
import { ref, watch } from "vue";
import { NButton, NDataTable } from "naive-ui";
import { OfferApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    OfferDetailViewComponent,
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
    const selectedOfferId = ref(null);
    const selectedOfferDetails = ref(null);
    const modalTitle = ref("");

    const loadOfferDetails = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await offerApi.offerOfferGroupDetailIdGet(
            props.offerId,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          offerDetails.value = response.data;
          modalTitle.value = `Detail nabídky: ${response.data.offerGroup?.title}`;
        } catch (error) {
          console.error("Failed to load offer details:", error);
        }
      }
    };

    const selectOffer = (offerId) => {
      selectedOfferId.value = offerId;
      const selectedOffer = offerDetails.value.offers.find(
        offer => offer.organization.id === offerId
      );
      selectedOfferDetails.value = selectedOffer;
      modalTitle.value = `Detail nabídky: ${selectedOffer.organization.name}`;
    };

    const backToAllOffers = () => {
      selectedOfferId.value = null;
      selectedOfferDetails.value = null;
      modalTitle.value = `Detail nabídky: ${offerDetails.value.offerGroup?.title}`;
    };

    const handleClose = () => {
      offerDetails.value = {};
      selectedOfferId.value = null;
      selectedOfferDetails.value = null;
      emit("update:show", false);
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    watch(
      () => props.show,
      (newShow) => {
        if (newShow) {
          loadOfferDetails();
        }
      },
      { immediate: false }
    );

    return {
      offerDetails,
      selectedOfferId,
      selectedOfferDetails,
      modalTitle,
      formatDate,
      handleClose,
      selectOffer,
      backToAllOffers,
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
  padding: 10px;
  background-color: #f5f5f5;
  color: #333;
}

.offer-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-item h4 {
  color: #008000;
  margin: 0 0 5px 0;
}

.summary-item p {
  margin: 0;
  font-size: 1.1em;
}

.scrollable-section {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.organization-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.organization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.organization-header h3 {
  margin: 0;
  color: #2c3e50;
}

.organization-chip {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 1.0em;
  font-weight: bold;
  background-color: #008000;
}

.organization-chip h3{
  color: white;
}

.status-chip {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: bold;
}

.confirmed {
  background-color: #008000;
  color: white;
}

.pending {
  background-color: #FFA000;
  color: white;
}

.item-table {
  margin-top: 10px;
  width: 100%;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.detail-button {
  background-color: #008000;
  color: white;
}

.selected-offer-view {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.offer-header h3 {
  margin: 0;
  color: #2c3e50;
}

.offer-description, .offer-items {
  margin-bottom: 20px;
}

.offer-description h4, .offer-items h4 {
  color: #008000;
  margin-bottom: 10px;
}

.back-button {
  margin-top: 20px;
  background-color: #008000;
  color: white;
}

.close-button {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

/* Ensure proper spacing for n-data-table */
:deep(.n-data-table) {
  margin-top: 10px;
}

:deep(.n-data-table-th) {
  background-color: #f0f0f0;
}
</style>