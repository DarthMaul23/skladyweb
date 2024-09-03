<template>
  <n-button @click="$emit('back')" class="back-button">
    &larr; Zpět na všechny nabídky
  </n-button>
  <n-button @click="openConfirmModal()" class="cancel-button">
    Zrušit nabídku
  </n-button>
  <div class="selected-offer-view">
    <div class="offer-header">
      <h3>{{ offer.organization?.name }}</h3>
      <div :class="['status-chip', offer.orderId ? 'confirmed' : 'pending']">
        {{ offer.orderId ? "Objednáno" : "Čekající" }}
      </div>
    </div>
    <n-tabs>
      <n-tab-pane name="details" tab="Detail Nabídky">
        <div class="offer-description">
          <h4>Popis</h4>
          <p>{{ offer.description || "Není k dispozici" }}</p>
        </div>
        <div class="offer-items">
          <h4>Položky nabídky</h4>
          <n-data-table
            :columns="itemColumns"
            :data="offer.items"
            class="item-table"
          />
        </div>
      </n-tab-pane>
      <n-tab-pane name="communication" tab="Komentáře">
        <comments-section :offer-id="offer.id" />
      </n-tab-pane>
    </n-tabs>
  </div>
  <!-- Cancellation Confirmation Modal -->
  <confirmation-modal
    v-if="showConfirmModal"
    @on-confirm="cancelOffer"
    @close="showConfirmModal = false"
    title="Confirm Cancellation"
    message="Are you sure you want to cancel this offer?"
  />
</template>
<script>
import { NButton, NDataTable, NTabs, NTabPane } from "naive-ui";
import { ref, watch } from "vue";
import { OfferApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";
import CommentsSection from "./CommentsSectionComponent.vue";
import ConfirmationModal from "./ConfirmationModal.vue";

export default {
  name: "OfferDetailView",
  components: {
    NButton,
    NDataTable,
    CommentsSection,
    ConfirmationModal,
  },
  props: {
    offer: {
      type: Object,
      required: true,
    },
    itemColumns: {
      type: Array,
      required: true,
    },
  },
  emits: ["back"],
  setup(props, { emit }) {
    const showConfirmModal = ref(false);
    const offerApi = new OfferApi(getDefaultApiConfig());

    const cancelOffer = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await offerApi.offerCancelOfferPost(
             props.offerId,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("Offer cancellation successful:", response);
        } catch (error) {
          console.error("Failed to cancel offer:", error);
        }
      } else {
        console.error("Authentication token is missing.");
      }
    };

    const openConfirmModal = () => {
      showConfirmModal.value = true;
    };

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
    };

    return {
      showConfirmModal,
      openConfirmModal,
      closeConfirmModal,
      cancelOffer,
    };
  },
};
</script>
  
  <style scoped>
.selected-offer-view {
  border-radius: 8px;
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
  background-color: #ffa000;
  color: white;
}

.offer-description,
.offer-items {
  margin-bottom: 20px;
}

.offer-description h4,
.offer-items h4 {
  color: #008000;
  margin-bottom: 10px;
}

.item-table {
  margin-top: 10px;
  width: 100%;
}

.back-button {
  margin-top: 10px;
  margin-bottom: 20px;
  background-color: #008000;
  color: white;
}

.cancel-button {
  margin-top: 10px;
  margin-bottom: 20px;
  background-color: #c01010;
  color: white;
}
</style>