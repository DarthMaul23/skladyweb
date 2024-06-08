<template>
  <main id="offers-page">
    <div class="filter-container">
      <n-input
        v-model="filters.searchQuery"
        placeholder="Nabídka, popis..."
        @update:value="filterOffers"
        class="filter-input"
      />
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredOffers"
      class="offers-table"
    >
      <template v-slot:action="{ row }">
        <n-button @click="prepareOfferDetails(row)">Details</n-button>
      </template>
    </n-data-table>

    <OfferDetailsModalOrganization
      :show="isModalVisible"
      :offerId="selectedOfferId"
      @update:show="isModalVisible = $event"
    />
  </main>
</template>

<script>
import { ref, computed, onMounted, h } from "vue";
import { NButton, NInput } from "naive-ui";
import { OfferApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";
import OfferDetailsModalOrganization from "../components/OfferDetailsModalOrganization.vue";

export default {
  components: {
    NButton,
    NInput,
    OfferDetailsModalOrganization,
  },
  setup() {
    const offerApi = new OfferApi(getDefaultApiConfig());
    const filters = ref({ searchQuery: "" });
    const offers = ref([]);
    const filteredOffers = computed(() => {
      return offers.value.filter(offer => {
        const title = offer.offerGroupTitle || "";
        const description = offer.offerGroupDescription || "";
        return (
          title.toLowerCase().includes(filters.value.searchQuery.toLowerCase()) ||
          description.toLowerCase().includes(filters.value.searchQuery.toLowerCase())
        );
      });
    });
    const isModalVisible = ref(false);
    const selectedOfferId = ref(null);
    const totalPages = ref(0);
    const pageSettings = ref({ Page: 1, NoOfItems: 30 });

    const loadOffers = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await offerApi.offerOrganizationOffersGet(
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (Array.isArray(response.data)) {
            const flattenedOffers = response.data.flatMap(group => 
              group.offers.map(offer => ({
                ...offer,
                offerGroupTitle: group.offerGroup.title,
                offerGroupDescription: group.offerGroup.description,
                dateCreated: group.offerGroup.dateCreated
              }))
            );
            offers.value = flattenedOffers;
            totalPages.value = response.totalPages || 1; // Ensure totalPages is set correctly
          } else {
            console.error("Received data is not in expected array format:", response.data);
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

    const openOfferDetails = offerId => {
      selectedOfferId.value = offerId;
      isModalVisible.value = true;
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
      selectedOfferId,
      handlePageChange,
      openOfferDetails,
      formatDate,
      columns: [
        { title: "No.", key: "id", render: (row, index) => index + 1 },
        { title: "Nabídka", key: "offerGroupTitle" },
        { title: "Popis", key: "offerGroupDescription" },
        { title: "Vytvořeno dne", key: "dateCreated", render: (row) => formatDate(row.dateCreated) },
        { title: "Detail", key: "action", render: (row) => h(NButton, { onClick: () => openOfferDetails(row.id) }, "Detail") },
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
