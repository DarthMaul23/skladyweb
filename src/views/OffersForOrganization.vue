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
      :data="offers.offerGroup"
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
      // Assuming 'offers.value' now holds the entire response, not just the array of offers.
      if (!offers.value || !offers.value.offers) {
        return [];
      }

      return offers.value.offers.filter((offer) => {
        const title = offers.value.offerGroup.title
          ? offers.value.offerGroup.title.toLowerCase()
          : "";
        const description = offers.value.offerGroup.description
          ? offers.value.offerGroup.description.toLowerCase()
          : "";
        const userId = offer.userId ? offer.userId.toLowerCase() : ""; // Assuming userId is directly under each offer
        return offers.value;
        /*
        return (
          title.includes(filters.value.searchQuery.toLowerCase()) ||
          description.includes(filters.value.searchQuery.toLowerCase()) ||
          userId.includes(filters.value.searchQuery.toLowerCase())
        );
        */
      });
    });

    const loadOffers = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await offerApi.offerOrganizationOffersGet({
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data && response.data.offers) {
            // Assuming 'response.data' holds the object with 'offerGroup' and 'offers'
            offers.value = response.data; // Store the entire object including both offerGroup and offers
          } else {
            console.error("Received unexpected data structure:", response.data);
            offers.value = { offerGroup: {}, offers: [] }; // Reset to initial structure if data is not as expected
          }
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
