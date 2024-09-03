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
        <n-tabs type="line" animated>
          <n-tab-pane name="details" tab="Detaily">
            <div class="details-section">
              <div class="detail-item">
                <p>
                  <strong>Nabídka:</strong>
                  {{ offerDetails.offerGroupTitle }}
                </p>
              </div>
              <div class="detail-item">
                <p>
                  <strong>Vytvořeno dne:</strong>
                  {{ formatDate(offerDetails.createdOn) }}
                </p>
              </div>
              <div class="detail-item">
                <p>
                  <strong>Organizace:</strong>
                  {{ offerDetails.organization?.name }}
                </p>
              </div>
            </div>
            <div class="scrollable-section">
              <div class="organization-item">
                <h3>{{ offerDetails.organization?.name }}</h3>
                <div v-if="offerDetails.ordered" class="chip confirmed">
                  <span>Objednáno</span>
                </div>
                <div v-else class="chip pending">
                  <span>Čekající</span>
                </div>
              </div>
              <n-data-table
                :columns="itemColumns"
                :data="offerDetails.items"
                class="item-table"
              ></n-data-table>
            </div>
            <div class="action-buttons" v-if="!offerDetails.ordered">
              <n-button class="order-button" @click="placeOrder" type="success">
                <span class="material-icons">shopping_cart</span>
                Objednat
              </n-button>
              <n-button class="reject-button" @click="declineOffer" type="error">
                <span class="material-icons">cancel</span>
                Odmítnout
              </n-button>
            </div>
          </n-tab-pane>
          <n-tab-pane name="comments" tab="Komentáře">
            <CommentsSection :offer-id="offerId" />
          </n-tab-pane>
        </n-tabs>
      </div>
    </template>
    <template #footer>
      <n-button @click="handleClose" class="modal-close-button">Zavřít</n-button>
    </template>
  </CustomModal>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import CommentsSection from './CommentsSectionComponent.vue';
import { ref, watch } from "vue";
import { NButton, NDataTable, NTabs, NTabPane } from "naive-ui";
import { OfferApi, OrderApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    CommentsSection,
    NButton,
    NDataTable,
    NTabs,
    NTabPane,
  },
  props: {
    show: Boolean,
    offerId: String,
  },
  emits: ["update:show"],
  setup(props, { emit }) {
    const offerApi = new OfferApi(getDefaultApiConfig());
    const orderApi = new OrderApi(getDefaultApiConfig());
    const offerDetails = ref({});
    const modalTitle = ref("");

    const loadOfferDetails = async (offerId) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await offerApi.offerOrganzationOfferDetailIdGet(offerId, {
            headers: { Authorization: `Bearer ${token}` },
          });
          offerDetails.value = response.data.offer;
          modalTitle.value = `Detail nabídky: ${response.data.offer.title}`;
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

    const placeOrder = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          await orderApi.orderPost(props.offerId, {
            headers: { Authorization: `Bearer ${token}` },
          });
          handleClose();
        } catch (error) {
          console.error("Failed to place order:", error);
        }
      }
    };

    const declineOffer = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          await offerApi.offerDeclinePost(props.offerId, {
            headers: { Authorization: `Bearer ${token}` },
          });
          handleClose();
        } catch (error) {
          console.error("Failed to decline offer:", error);
        }
      }
    };

    watch(
      () => props.offerId,
      (newOfferId) => {
        if (newOfferId) {
          loadOfferDetails(newOfferId);
        }
      },
      { immediate: true }
    );

    return {
      offerDetails,
      modalTitle,
      formatDate,
      handleClose,
      placeOrder,
      declineOffer,
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
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

.organization-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
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

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.order-button,
.reject-button {
  flex-basis: 48%;
}

.modal-close-button {
  margin-right: 10px;
}
</style>