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

    <n-button @click="showAddOfferModal">Vytvořit nabídku</n-button>

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
      :modal-height="'400px'"
      @update:show="isModalVisible = $event"
    >
      <template #body>
        <div v-if="showAddModal">
          <n-form @submit.prevent="addOffer">
            <n-form-item label="Offer Name">
              <n-input v-model="newOffer.name" placeholder="Enter offer name" />
            </n-form-item>
            <n-form-item label="Address">
              <n-input v-model="newOffer.address" placeholder="Enter address" />
            </n-form-item>
            <n-form-item label="Contact Person">
              <n-input
                v-model="newOffer.contact"
                placeholder="Enter contact person"
              />
            </n-form-item>
          </n-form>
        </div>
        <div v-if="showDetailModal">
          <p><strong>ID:</strong> {{ selectedOfferDetails.offerGroup.id }}</p>
          <p><strong>Title:</strong> {{ selectedOfferDetails.title }}</p>
          <p>
            <strong>Description:</strong> {{ selectedOfferDetails.description }}
          </p>
          <p>
            <strong>Date Created:</strong>
            {{ selectedOfferDetails.offerGroup.dateCreated }}
          </p>
          <p>
            <strong>User ID:</strong>
            {{ selectedOfferDetails.offerGroup.userId }}
          </p>
          <div v-for="organizations in selectedOfferDetails.offers">
            {{ organizations.organization.name }}
            <n-data-table
              :columns="itemColumns"
              :data="organizations.items"
              class="item-table"
            ></n-data-table>
          </div>
        </div>
      </template>
      <template #footer>
        <n-button @click="closeModal" class="modal-close-button"
          >Close</n-button
        >
        <n-button v-if="showAddModal" @click="addOffer" class="modal-add-button"
          >Add Offer</n-button
        >
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
    const itemColumns = [
      { title: "Kategorie", key: "name" },
      { title: "Položka", key: "description" },
      { title: "Množství", key: "quantity" },
      { title: "Jednotky", key: "unit" },
      // Add other columns as needed
    ];

    const filteredOffers = computed(() => {
      return offers.value.filter((offer) => {
        console.log(offer);
        return (
          offer.title
            .toLowerCase()
            .includes(filters.value.searchQuery.toLowerCase()) ||
          offer.description
            .toLowerCase()
            .includes(filters.value.searchQuery.toLowerCase()) ||
          offer.userId
            .toLowerCase()
            .includes(filters.value.searchQuery.toLowerCase())
        );
      });
    });

    const loadOffers = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await offerApi.offerGet({
            headers: { Authorization: `Bearer ${token}` },
          });
          // Check if the direct response data is an array
          if (Array.isArray(response.data)) {
            offers.value = response.data; // Directly use the array from response.data
          } else {
            console.error("Received data is not an array:", response.data);
            offers.value = []; // Reset to empty array if data is not as expected
          }
        } catch (error) {
          console.error("Failed to load offers:", error);
          offers.value = []; // Reset to empty array in case of error
        }
        console.log(offers.value);
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
      itemColumns,
      showAddModal,
      showDetailModal,
      newOffer,
      showAddOfferModal,
      addOffer,
      closeModal,
      prepareOfferDetails,
      columns: [
        { title: "Nabídka", key: "title" },
        { title: "Popis", key: "description" },
        { title: "Vytvořil", key: "userId" },
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
