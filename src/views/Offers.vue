<template>
  <main id="offers-page">
    <div class="filter-container">
      <n-input
        v-model="filters.searchQuery"
        placeholder="Nabídka, popis..."
        @input="filterOffers"
        class="filter-input"
      />
    </div>

    <CustomTable
      :data="filteredOffers"
      :columns="columns"
      :pagination="pageSettings"
      :noPages="totalPages"
      @pageChanged="handlePageChange"
      class="offers-table"
    />

    <custom-modal
      :show="isModalVisible"
      :title="modalTitle"
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'900px'"
      @update:show="isModalVisible = $event"
    >
      <template #body>
        <div class="modal-body">
          <div class="details-section">
            <div class="detail-item">
              <p>
                <strong>Nabídka:</strong>
                {{ selectedOfferDetails.offerGroup?.title }}
              </p>
            </div>
            <div class="detail-item">
              <p>
                <strong>Vytvořeno dne:</strong>
                {{ formatDate(selectedOfferDetails.offerGroup?.dateCreated) }}
              </p>
            </div>
          </div>
          <div class="details-container">
            <div
              v-for="organization in selectedOfferDetails.offers"
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
        <n-button @click="closeModal" class="modal-close-button">Zavřít</n-button>
      </template>
    </custom-modal>
  </main>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import CustomTable from "../components/CustomTable.vue"; // Assuming CustomTable is correctly set up to replace NDataTable
import { ref, computed, onMounted, h } from "vue";
import { NButton, NInput } from "naive-ui";
import { OfferApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    CustomTable,
    NButton,
    NInput,
  },
  setup() {
    const offerApi = new OfferApi(getDefaultApiConfig());
    const filters = ref({ searchQuery: "" });
    const offers = ref([]);
    const filteredOffers = computed(() => {
      return offers.value.filter(offer =>
        offer.title.toLowerCase().includes(filters.value.searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(filters.value.searchQuery.toLowerCase())
      );
    });
    const isModalVisible = ref(false);
    const modalTitle = ref("");
    const selectedOfferDetails = ref({});
    const totalPages = ref(0);
    const pageSettings = ref({ Page: 1, NoOfItems: 30 });

    const loadOffers = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await offerApi.offerGetAllOffersPost(
            {
              Page: pageSettings.value.Page,
              NoOfItems: pageSettings.value.NoOfItems,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (Array.isArray(response.data)) {
            offers.value = response.data; // Make sure the 'items' and 'totalPages' are handled if that's how your API response is structured
            totalPages.value = response.data.totalPages; // This assumes totalPages is part of the response
          } else {
            console.error(
              "Received data is not in expected array format:",
              response.data
            );
            offers.value = [];
          }
        } catch (error) {
          console.error("Failed to load offers:", error);
          offers.value = [];
        }
      }
    };

    const handlePageChange = newPage => {
      pageSettings.value.Page = newPage;
      loadOffers();
    };

    const prepareOfferDetails = offer => {
      selectedOfferDetails.value = offer;
      modalTitle.value = `Detail nabídky: ${offer?.title}`;
      isModalVisible.value = true;
    };

    const closeModal = () => {
      isModalVisible.value = false;
    };

    const formatDate = dateString => {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    onMounted(loadOffers);

    return {
      filters,
      offers,
      filteredOffers,
      isModalVisible,
      modalTitle,
      selectedOfferDetails,
      closeModal,
      handlePageChange,
      prepareOfferDetails,
      formatDate,
      columns: [
        { title: "No.", key: "id", render: (row, index) => index + 1 },
        { title: "Nabídka", key: "title" },
        { title: "Popis", key: "description" },
        { title: "Vytvořeno dne", key: "dateCreated", render: formatDate },
        { title: "Detail", key: "action", render: (row) => h(NButton, { onClick: () => prepareOfferDetails(row) }, "Detail") },
      ],
      totalPages,
      pageSettings,
    };
  },
};
</script>
<style scoped>
/* General layout for the offers page */
#offers-page {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

/* Styling for the input container at the top */
.filter-container {
  margin-bottom: 20px;
}

/* Styling for the input field */
.filter-input {
  width: 100%;
  max-width: 600px; /* Limits the input field's width for better appearance */
}

/* Styling for the main offers data table */
.offers-table {
  width: 100%;
  margin-bottom: 20px;
}

/* Styling for item-specific data tables within the modal */
.item-table {
  margin-top: 10px;
  width: 100%;
}

/* Buttons in the modal's footer */
.modal-close-button,
.modal-add-button {
  margin-right: 10px;
}

/* Basic modal styling adjustments */
.custom-modal {
  --modal-content-padding: 20px;
}

/* Header for organizations listed in the modal */
.organization-header {
  font-weight: bold;
  margin-top: 20px;
}

/* Container for organization-specific items */
.organization-items {
  margin-bottom: 10px;
}

/* Container for fixed details at the top of the modal */
.details-section {
  flex-shrink: 0;
}

/* Container for scrollable organization details in the modal */
.organizations-section {
  flex-grow: 1;
  overflow-y: auto; /* Enables scrolling */
  margin-top: 20px;
}

/* Styling for the fixed details area */
.details-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Individual detail items */
.detail-item {
  background-color: #f9f9f9; /* Light grey for contrast */
  border-left: 5px solid #4caf50; /* Green accent line for emphasis */
  padding: 10px 20px;
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

/* Paragraphs in detail items */
.detail-item p {
  margin: 0; /* Remove default margin */
  color: #333; /* Dark grey for readability */
  font-size: 16px; /* Slightly larger text for clarity */
}

/* Strong elements in detail items */
.detail-item strong {
  font-weight: bold; /* Emphasize key labels */
  color: #2c3e50; /* Dark blue for additional emphasis */
}

.organization-item {
  display: flex;
  align-items: center; /* Aligns children vertically in the center */
  gap: 10px; /* Spacing between the name and the chip */
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
  background-color: #4caf50; /* Green background for confirmed orders */
}

.pending {
  background-color: #ffa500; /* Orange background for pending orders */
}

h3 {
  margin: 0; /* Removes margin to maintain alignment */
}

.item-table {
  margin-top: 10px; /* Space between tables and above content */
}
</style>
