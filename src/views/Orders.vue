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
      :title="
        selectedOrder
          ? `Detail Objednávky: ${selectedOrder.key}`
          : 'Detail Objednávky'
      "
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'auto'"
      @update:show="isModalVisible = $event"
    >
      <template #body>
        <div v-if="selectedOrder" class="modal-content">
          <!-- Displaying order details here -->
          <div class="offer-details">
            <p class="detail-item">
              <strong>Vytvořeno organizací:</strong>
              <span class="chip">{{
                selectedOrder.organizationName
              }}</span>
            </p>
            <p class="detail-item">
              <strong>Vytvořeno dne:</strong>
              <span class="chip">{{
                formatDate(selectedOrder.createdOn)
              }}</span>
            </p>
            <!-- Add more fields as necessary -->
          </div>
          <n-timeline size="large">
            <n-timeline-item
              v-for="(stage, index) in stages"
              :key="index"
              :title="stage.title"
              :content="stage.content"
              :time="stage.time"
              :type="stage.type"
            >
            </n-timeline-item>
          </n-timeline>
          <n-button
            v-if="stages.length < allStages.length"
            @click="addStage"
            class="save-button"
            >Další krok</n-button
          >
          <n-button @click="resetStages" class="close-button">Reset</n-button>
        </div>
      </template>
      <template #footer>
        <n-button @click="closeModal" class="modal-close-button"
          >Zavřít</n-button
        >
      </template>
    </custom-modal>
  </main>
</template>  
<script>
import CustomModal from "../components/CustomModal.vue";
import OrderTimeline from "../components/OrderTimeline.vue";
import { ref, computed, onMounted, h } from "vue";
import {
  NButton,
  NInput,
  NDataTable,
  NTimeline,
  NTimelineItem,
} from "naive-ui";
import { OrderApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    NButton,
    NInput,
    NDataTable,
    NTimeline,
    NTimelineItem,
    OrderTimeline,
  },
  setup() {
    const orderApi = new OrderApi(getDefaultApiConfig()); // Initialize API (add params as needed)
    const orders = ref([]);
    const isModalVisible = ref(false);
    const selectedOrder = ref({});
    const selectedOrderDetails = ref({});
    const stages = ref([
      {
        title: "Nabídka Vytvořena",
        content: "Vytvořeno: ",
        time: "2024-04-03 20:46",
      },
    ]);
    const allStages = [
      {
        title: "Objednávka vytvořena",
        content: "Objednáno: ",
        time: "2024-04-03 20:46",
        type: "success",
      },
      {
        title: "Položky vyskladněny",
        content: "Vyskladnil: ",
        time: "2024-04-03 20:46",
        type: "warning",
      },
      {
        title: "Předání k přepravě",
        content: "Přepravuje: ",
        time: "2024-04-03 20:46",
        type: "warning",
      },
      {
        title: "Položky doručeny",
        content: "Převzal: ",
        time: "2024-04-03 20:46",
        type: "warning",
      },
      {
        title: "Položky naskladněny",
        content: "Naskladnil: ",
        time: "2024-04-03 20:46",
        type: "warning",
      },
      // Add other stages here as needed
      {
        title: "Objednávka Vyřízena",
        content: "info content",
        time: "2024-04-03 20:46",
        type: "success",
      },
    ];

    const addStage = () => {
      if (stages.value.length < allStages.length) {
        stages.value.push(allStages[stages.value.length]);
      }
    };

    const resetStages = () => {
      stages.value = [allStages[0]]; // Reset to the first stage
    };

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

    const loadOrderDetail = async (orderId) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await orderApi.orderIdGet(orderId, {
            headers: { Authorization: `Bearer ${token}` },
          });
          orderDetail.value = response.data; // Assuming the response structure matches your endpoint data
        } catch (error) {
          console.error("Failed to load offers:", error);
          orderDetail.value = undefined; // Reset to initial structure in case of error
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
      selectedOrder.value = order; // Set the selected order details
      loadOrderDetail(order.id);
      isModalVisible.value = true; // Show the modal
    };

    const closeModal = () => {
      isModalVisible.value = false;
    };

    onMounted(loadOrders);

    return {
      orders,
      allStages,
      addStage,
      resetStages,
      stages,
      formatDate,
      isModalVisible,
      selectedOrder,
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
  