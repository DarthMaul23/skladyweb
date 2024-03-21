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
  :title="modalTitle"
  :header-bg-color="'green'"
  :modal-width="'1200px'"
  :modal-height="'auto'"
  @update:show="isModalVisible = $event"
>
  <template #body>
    <div v-if="showDetailModal">
      <!-- Displaying offer details -->
      <div class="offer-details">
        <p><strong>ID:</strong> {{ selectedOfferDetails.id }}</p>
        <p><strong>Title:</strong> {{ selectedOfferDetails.title }}</p>
        <p><strong>Description:</strong> {{ selectedOfferDetails.description }}</p>
        <p><strong>Date Created:</strong> {{ selectedOfferDetails.dateCreated }}</p>
        <p><strong>User ID:</strong> {{ selectedOfferDetails.userId }}</p>
        <!-- Add more fields as necessary -->
      </div>
      
      <!-- If your offer has associated items, display them in a table or list -->
      <div v-if="selectedOfferDetails.items && selectedOfferDetails.items.length">
        <h3>Items:</h3>
        <ul>
          <li v-for="(item, index) in selectedOfferDetails.items" :key="index">
            {{ item.name }} - {{ item.description }}: {{ item.quantity }} {{ item.unit }}
          </li>
        </ul>
      </div>
    </div>
  </template>
  <template #footer>
    <n-button @click="closeModal" class="modal-close-button">Close</n-button>
  </template>
</custom-modal>


  </main>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, computed, onMounted, h } from "vue";
import { NButton, NInput, NDataTable, NFormItem, NForm } from "naive-ui";
import { OfferApi } from "../api/openapi/api";
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

      const data = await offerApi.offerIdGet(offer.id, {
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
/* Your CSS styles here */
</style>
