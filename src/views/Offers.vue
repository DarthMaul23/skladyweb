<template>
  <main id="offers-page">
    <!-- Filter input -->
    <div class="filter-container">
      <n-input
        v-model:value="filters.searchQuery"
        placeholder="Search by Offer Name, Address, or Contact Person"
        @update:value="filterOffers"
        class="filter-input"
      />
    </div>

    <n-button @click="showAddOfferModal">Add New Offer</n-button>

    <!-- Offers Table -->
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
      :headerBgColor="'green'"
      :headerTitleColor="'white'"
      :modalWidth="'1200px'"
      :modalHeight="'400px'"
      @update:show="isModalVisible = $event"
      @save="addOffer"
      @close="closeModal"
    >
      <template #body>
        <!-- Form for Adding a New Offer -->
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
        <button class="modal-close-button" @click="closeModal">Close</button>
        <button class="modal-add-button" v-if="showAddModal" @click="addOffer">
          Add Offer
        </button>
        <!-- Include other buttons or actions as needed -->
      </template>
    </custom-modal>
  </main>
</template>
  <script>
import CustomModal from "../components/CustomModal.vue"; // Ensure this path is correct
export default {
  components: {
    CustomModal,
  },
  data() {
    return {
      filters: {
        searchQuery: "",
      },
      columns: [
        { title: "No", key: "rowNumber" },
        { title: "Offer Name", key: "name" },
        { title: "Address", key: "address" },
        { title: "Contact Person", key: "contact" },
        { title: "Actions", key: "action" },
      ],
      offers: [
        // Sample data
        {
          id: "uuid-1",
          rowNumber: 1,
          name: "Offer A",
          address: "Address A",
          contact: "Contact A",
        },
        {
          id: "uuid-2",
          rowNumber: 2,
          name: "Offer B",
          address: "Address B",
          contact: "Contact B",
        },
        // ... more offers
      ],
      newOffer: { name: "", address: "", contact: "" }, // Reset for new offer creation
      showModal: false,
      showAddModal: false,
      showDetailsModal: false,
      selectedOffer: {},
      newOffer: {}, // For new offer creation
      isModalVisible: false, // Added to control the visibility of the modal
      modalTitle: "", // Dynamic title based on the action
    };
  },
  computed: {
    filteredOffers() {
      const searchQuery = this.filters.searchQuery.toLowerCase();
      return this.offers.filter((offer) => {
        const name = offer.name ? offer.name.toLowerCase() : "";
        const address = offer.address ? offer.address.toLowerCase() : "";
        const contact = offer.contact ? offer.contact.toLowerCase() : "";
        return (
          name.includes(searchQuery) ||
          address.includes(searchQuery) ||
          contact.includes(searchQuery)
        );
      });
    },
  },
  methods: {
    filterOffers() {
      // Filtering logic can be enhanced if needed
    },
    addOffer() {
      // Implement the logic to add the new offer
      // For demonstration, we're directly adding to the offers array
      const newId = `uuid-${this.offers.length + 1}`;
      const newOfferToAdd = {
        ...this.newOffer,
        id: newId,
        rowNumber: this.offers.length + 1,
      };
      this.offers.push(newOfferToAdd);
      console.log(this.offers);
      this.closeModal(); // Close the modal after adding
      this.newOffer = { name: "", address: "", contact: "" }; // Reset form
    },
    showAddOfferModal() {
      this.isModalVisible = true;
      this.modalTitle = "Add New Offer"; // Set title for the add new offer modal
      this.showAddModal = true;
      this.showDetailsModal = false;
    },
    prepareOfferDetails(offer) {
      this.selectedOffer = offer;
      this.isModalVisible = true;
      this.modalTitle = "Offer Details"; // Set title for the offer details modal
      this.showDetailsModal = true;
      this.showAddModal = false;
    },
    closeModal() {
      this.isModalVisible = false;
    },
  },
};
</script>
  
  <style scoped>
#offers-page {
  /* Styling for the offers page */
}
.filter-container {
  margin-bottom: 20px;
}
.filter-input {
  max-width: 500px;
}
.offers-table {
  /* Styling for the table */
}
.modal-close-button {
  background-color: red; /* Red background for the close button */
  color: white; /* White text color */
  padding: 10px 20px;
  margin-right: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-close-button:hover {
  opacity: 0.8;
}

.modal-add-button {
  background-color: green; /* Green background for the add button */
  color: white; /* White text color */
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-add-button:hover {
  opacity: 0.8;
}
</style>
  