<template>
  <main id="offers-page">
    <div class="filter-container">
      <n-input
        v-model:value="filters.searchQuery"
        placeholder="Search by Offer Name, Address, or Contact Person"
        @update:value="filterOffers"
        class="filter-input"
      />
    </div>

    <n-button @click="showAddOfferModal">Add New Offer</n-button>

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
import { ref, computed, onMounted } from "vue";
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
    const newOffer = ref({ name: "", address: "", contact: "" });

    const filteredOffers = computed(() => {
      return offers.value.filter((offer) => {
        return (
          offer.name
            .toLowerCase()
            .includes(filters.value.searchQuery.toLowerCase()) ||
          offer.address
            .toLowerCase()
            .includes(filters.value.searchQuery.toLowerCase()) ||
          offer.contact
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
      // For this example, we'll just add it to the offers list
      const newId = `uuid-${offers.value.length + 1}`; // Simulate new ID, replace with actual ID from your backend
      offers.value.push({ ...newOffer.value, id: newId });
      closeModal(); // Reset and close the modal
    };

    const closeModal = () => {
      isModalVisible.value = false;
      newOffer.value = { name: "", address: "", contact: "" }; // Reset the form
      showAddModal.value = false; // Hide add offer form
    };

    return {
      filters,
      offers,
      filteredOffers,
      isModalVisible,
      modalTitle,
      showAddModal,
      newOffer,
      showAddOfferModal,
      addOffer,
      closeModal,
      columns: [
        { title: "Nabídka", key: "title" },
        { title: "Popis", key: "description" },
        { title: "Vytvořil", key: "userId" },
        {
          title: "Actions",
          key: "action",
          render: (row) =>
            h(NButton, { onClick: () => prepareOfferDetails(row) }, "Details"),
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
