<template>
  <main id="offers-page">
    <div class="filter-container">
      <n-input
        v-model:value="filters.searchQuery"
        placeholder="Nabídka, popis...."
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
    <custom-modal
      :show="isModalVisible"
      :title="selectedOfferDetails.offerGroupTitle"
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'auto'"
      @update:show="isModalVisible = $event"
    ><template #body>
  <div v-if="showDetailModal" class="modal-content">
    <!-- Displaying offer details -->
    <div class="offer-details">
      <p class="detail-item"><strong>Vytvořeno organizací:</strong> <span class="chip">{{ selectedOfferDetails.organization.name }}</span></p>
      <p class="detail-item"><strong>Vytvořeno dne:</strong> <span class="chip">{{ formatDate(selectedOfferDetails.createdOn) }}</span></p>
      <p class="detail-item"><strong>Platné do:</strong> <span class="chip">{{ formatDate(selectedOfferDetails.validUntil) }}</span></p>
      <p class="detail-item"><strong>Popis:</strong> {{ selectedOfferDetails.offerDescritpion }}</p>
      <p class="detail-item"><strong>Počet palet v nabídce:</strong> {{ selectedOfferDetails.items.length }}</p>
      <!-- Add more fields as necessary -->
    </div>
    <div class="modal-header-buttons">
      <n-button class="order-button" @click="placeOrder(selectedOfferDetails)" type="success">
        <span class="material-icons">shopping_cart</span>
        Objednat
      </n-button>
      <n-button class="reject-button" @click="rejectOffer" type="error">
        <span class="material-icons">delete</span>
        Odmítnout
      </n-button>
    </div>

    <!-- Scrollable list of items associated with the offer -->
    <div v-if="selectedOfferDetails.items && selectedOfferDetails.items.length" class="offer-items">
      <h3><span class="material-icons item-icon">inventory_2</span>Položky v nabídce:</h3>
      <div class="items-container">
        <div class="item-card" v-for="(item, index) in selectedOfferDetails.items" :key="index">
          <div class="card-header">
              <span class="material-icons item-icon">inventory_2</span>
              <h4>{{ item.name }}</h4>
            </div>
            <div class="card-body">
              <p><strong>Popis:</strong> {{ item.description }}</p>
              <p><strong>Množství:</strong> {{ item.quantity }} {{ item.unit }}</p>
            </div>
          </div>
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
import { ref, computed, onMounted, h } from "vue";
import { NButton, NInput, NDataTable, NFormItem, NForm } from "naive-ui";
import { OfferApi } from "../api/openapi/api";
import { OrderApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    NButton,
    NInput,
    NDataTable,
    NFormItem,
    NForm,
  },
  setup() {
    const offerApi = new OfferApi(getDefaultApiConfig());
    const orderApi = new OrderApi(getDefaultApiConfig());
    const filters = ref({ searchQuery: "" });
    const offers = ref([]);
    const isModalVisible = ref(false);
    const modalTitle = ref("");
    const showAddModal = ref(false);
    const showDetailModal = ref(false);
    const newOffer = ref({ name: "", address: "", contact: "" });
    const selectedOfferDetails = ref({});

    const filteredOffers = computed(() => {
      const allOffers = [];
      if (offers.value && offers.value.length > 0) {
        offers.value.forEach((group) => {
          if (group.offers && group.offers.length > 0) {
            group.offers.forEach((offer) => {
              // Optionally, add offerGroup data to each offer if needed
              offer.offerGroupTitle = group.offerGroup.title;
              offer.offerGroupDescription = group.offerGroup.description;
              allOffers.push(offer);
            });
          }
        });
      }

      // Implement filtering if necessary
      return allOffers.filter((offer) => {
        return offer.title, offer.description, offer.organizationId;
      });
    });

    const loadOffers = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await offerApi.offerOrganizationOffersGet({
            headers: { Authorization: `Bearer ${token}` },
          });
          // Assuming 'response.data' holds the object with 'offerGroup' and 'offers'
          offers.value = response.data; // Store the entire object including both offerGroup and offers
        } catch (error) {
          console.error("Failed to load offers:", error);
          offers.value = { offerGroup: {}, offers: [] }; // Reset to initial structure in case of error
        }
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 because months are zero-indexed
      const year = date.getFullYear();
      return `${day}. ${month}. ${year}`;
    };

    onMounted(loadOffers);

    const showAddOfferModal = () => {
      isModalVisible.value = true;
      modalTitle.value = "Add New Offer";
      showAddModal.value = true;
    };

    const addOffer = () => {
      // Your logic to add an offer
      // For this example, we'll just add it to the offers lis
      closeModal(); // Reset and close the modal
    };

    const closeModal = () => {
      isModalVisible.value = false;
      newOffer.value = { name: "", address: "", contact: "" }; // Reset the form
      showAddModal.value = false; // Hide add offer form
    };

    const prepareOfferDetails = async (offer) => {
      console.log(offer);
      // Set the selected offer details to be displayed in the modal
      const token = localStorage.getItem("authToken");

      const data = await offerApi.offerOfferDetailIdGet(offer.id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(data.data);
      selectedOfferDetails.value = data.data; // Store the selected offer details
      // Update the modal title to reflect that this is about viewing offer details
      modalTitle.value = `Detail nabídky: ${offer.title}`;

      // Resetting any states as needed, for example, hiding 'add new offer' form inside the modal
      showDetailModal.value = true;

      // Finally, making the modal visible
      isModalVisible.value = true;
    };

    const placeOrder = async (offer) => {
      console.log(offer);
      // Set the selected offer details to be displayed in the modal
      const token = localStorage.getItem("authToken");

      const data = await orderApi.orderPost(offer.id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(data.data);
      selectedOfferDetails.value = data.data; // Store the selected offer details
      // Update the modal title to reflect that this is about viewing offer details
      modalTitle.value = `Detail nabídky: ${offer.title}`;

      // Resetting any states as needed, for example, hiding 'add new offer' form inside the modal
      showDetailModal.value = true;

      // Finally, making the modal visible
      isModalVisible.value = true;
    };

    return {
      filters,
      offers,
      filteredOffers,
      selectedOfferDetails,
      isModalVisible,
      modalTitle,
      showAddModal,
      showDetailModal,
      newOffer,
      showAddOfferModal,
      addOffer,
      closeModal,
      prepareOfferDetails,
      formatDate,
      placeOrder,
      columns: [
        { title: "Offer Group", key: "offerGroupTitle" },
        { title: "Offer Title", key: "title" },
        { title: "Description", key: "description" },
        { title: "Organization ID", key: "organizationId" },
        {
          title: "Detail",
          key: "action",
          render: (row) =>
            h(NButton, { onClick: () => prepareOfferDetails(row) }, "Detail"),
        },
        // You can define other columns as needed
      ],
    };
  },
};
</script>
<style scoped>
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
}

.offer-details {
  background-color: #f0fdf4; /* Light green background */
  border-left: 5px solid #4CAF50; /* Green accent border */
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 8px; /* Rounded corners for a modern look */
}

.detail-item {
  margin-bottom: 12px; /* Space between details for clarity */
  color: #333; /* Dark color for better readability */
  line-height: 1.6; /* Spacing between lines */
}

.detail-item strong {
  color: green; /* Slightly darker green for emphasis */
}

.modal-header-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.order-button, .reject-button {
  flex-basis: 48%; /* Adjust based on design */
}

.offer-items {
  margin-bottom: -30px;
}

.offer-items h3{
  background-color: green;
  color:white;
  padding: 5px;
}

h3 .material-icons {
  vertical-align: middle; /* Align the icon with the middle of the text */
  margin-right: 8px; /* Space between the icon and the text */
}

.items-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 300px; /* Adjust based on your requirement */
  overflow-y: auto; /* Enables vertical scrolling */
  padding-right: 10px; /* Optional: for better scrollbar visibility */
}

.item-card {
  background-color: #ffffff;
  border: 2px solid #e8f5e9; /* Light green border */
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  overflow: hidden; /* Ensures the child elements do not overflow */
}

.card-header {
  background-color: green; /* Green background */
  color: white;
  display: flex;
  align-items: center;
  padding: 10px;
}

.item-icon {
  margin-right: 10px;
}

.card-body {
  padding: 20px;
  background-color: #f9f9f9; /* Lighter shade for the body */
}

.card-body p {
  margin: 10px 0; /* Spacing between paragraphs */
}

.card-body strong {
  color: green; /* Green text for labels */
}

.modal-close-button {
  background-color: red;
  color: white;
}

.chip {
  display: inline-block;
  padding: 4px 18px; /* Adjust the padding to change the size */
  background-color: green; /* Green background */
  color: white; /* White text */
  border-radius: 16px; /* Rounded corners for chip shape */
  font-size: 14px; /* Font size, adjust as needed */
  font-weight: bold; /* Font weight, adjust for boldness */
  margin: 0 5px; /* Margin for spacing if you have multiple chips */
}
</style>
