<template>
  <main id="offers-page">
    <div class="filter-container">
      <n-input placeholder="Search..." class="filter-input" />
    </div>

    <n-data-table :columns="columns" :data="orders" class="offers-table">
      <template v-slot:action="{ row }">
        <n-button @click="() => console.log('Detail view for', row)"
          >Details</n-button
        >
      </template>
    </n-data-table>
  
	<custom-modal
      :show="isModalVisible"
	  :title="selectedOrderDetails ? `Detail Objednávky: ${selectedOrderDetails.key}` : 'Detail Objednávky'"
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'auto'"
      @update:show="isModalVisible = $event"
    >
      <template #body>
        <div v-if="selectedOrderDetails" class="modal-content">
          <!-- Displaying order details here -->
          <div class="offer-details">
            <p class="detail-item"><strong>Vytvořeno organizací:</strong> <span class="chip">{{ selectedOrderDetails.organizationName }}</span></p>
            <p class="detail-item"><strong>Vytvořeno dne:</strong> <span class="chip">{{ formatDate(selectedOrderDetails.createdOn) }}</span></p>
            <!-- Add more fields as necessary -->
          </div>
		  <OrderTimeline />
		  <h1>TEST TEXT</h1>
          <!-- Any additional modal content can go here --> 
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
import OrderTimeline from "../components/OrderTimeline.vue";
import { ref, computed, onMounted, h } from "vue";
import { NButton, NInput, NDataTable } from "naive-ui";
import { OrderApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    NButton,
    NInput,
    NDataTable,
	OrderTimeline,
  },
  setup() {
    const orderApi = new OrderApi(getDefaultApiConfig()); // Initialize API (add params as needed)
    const orders = ref([]);
	const isModalVisible = ref(false);
    const selectedOrderDetails = ref({});

    const loadOrders = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await orderApi.orderOrganizationOrdersGet({
            headers: { Authorization: `Bearer ${token}` },
          });
          orders.value = response.data; // Assuming the response structure matches your endpoint data
        } catch (error) {
          console.error("Failed to load offers:", error);
          orders.value = []; // Reset to initial structure in case of error
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

	const prepareOrderDetails = (order) => {
      selectedOrderDetails.value = order; // Set the selected order details
      isModalVisible.value = true; // Show the modal
    };

    const closeModal = () => {
      isModalVisible.value = false;
    };

    onMounted(loadOrders);

    return {
      orders,
      formatDate,
	  isModalVisible,
      selectedOrderDetails,
      prepareOrderDetails,
      closeModal,
      columns: [
        { title: "ID Objednávky", key: "key" },
        { title: "Organizace", key: "organizationName" },
        {
          title: "Vytvořeno dne",
          key: "createdOn",
          render: (order) => formatDate(order.createdOn),
        },
        {
          title: "Detail",
          key: "action",
          render: (order) =>
            h(NButton, { onClick: () => prepareOrderDetails(order) }, "Detail"),
        },
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
  border-left: 5px solid #4caf50; /* Green accent border */
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

.order-button,
.reject-button {
  flex-basis: 48%; /* Adjust based on design */
}

.offer-items {
  margin-bottom: -30px;
}

.offer-items h3 {
  background-color: green;
  color: white;
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
  