<template>
  <main id="offers-page">
    <div class="filter-container">
      <n-input
        v-model:value="filters.searchQuery"
        placeholder="Search..."
        class="filter-input"
        @input="filterOrders(filters.searchQuery)"
      />
    </div>

    <CustomTable
      :data="filteredOrders"
      :columns="columns"
      :pagination="pageSettings"
      :noPages="totalPages"
      @detailClicked="prepareOrderDetails"
      @pageChanged="loadOrders"
    />

    <custom-modal
      :show="isModalVisible"
      :title="modalTitle"
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'auto'"
      @update:show="isModalVisible = $event"
    >
      <template #body>
        <div v-if="selectedOrder">
          <!-- Displaying order details here -->
          <div class="offer-details">
            <p class="detail-item">
              <strong>Created by:</strong>
              <span class="chip">{{ selectedOrder.organizationName }}</span>
            </p>
            <p class="detail-item">
              <strong>Created on:</strong>
              <span class="chip">{{
                formatDate(selectedOrder.createdOn)
              }}</span>
            </p>
            <!-- Additional fields can be added here -->
          </div>
          <div class="modal-split-container">
            <!-- Timeline section -->
            <div class="timeline-container">
              <n-timeline size="large">
                <n-timeline-item
                  v-for="(stage, index) in stages"
                  :key="index"
                  :title="stage.title"
                  :content="stage.content"
                  :time="stage.time"
                  :type="stage.type"
                ></n-timeline-item>
              </n-timeline>
              <n-button
                v-if="stages.length < allStages.length"
                @click="addStage"
                class="save-button"
                >Next Step</n-button
              >
              <n-button @click="resetStages" class="close-button"
                >Reset</n-button
              >
            </div>

            <!-- Items table section -->
            <div class="items-table-container">
              <n-data-table
                :columns="itemColumns"
                :data="orderDetail.items"
                bordered
                :scroll-x="600"
              />
            </div>
          </div>
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
import CustomTable from "../components/CustomTable.vue";
import { ref, computed, onMounted, h, watch } from "vue";
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
    CustomTable,
    NButton,
    NInput,
    NDataTable,
    NTimeline,
    NTimelineItem,
  },
  setup() {
    const orderApi = new OrderApi(getDefaultApiConfig());
    const orders = ref([]);
    const filteredOrders = ref([]);
    const filters = ref({ searchQuery: "" });
    const isModalVisible = ref(false);
    const modalTitle = ref("");
    const selectedOrder = ref({});
    const orderDetail = ref({});
    const totalPages = ref(0);
    const pageSettings = ref({ Page: 1, NoOfItems: 3 });
    const stages = ref([
      {
        title: "Order Created",
        content: "Created by: ",
        time: "2024-04-03 20:46",
        type: "success",
      },
      // Additional stages as required
    ]);
    const allStages = [
      {
        title: "Order Created",
        content: "Created by: ",
        time: "2024-04-03 20:46",
        type: "success",
      },
      // Additional stages as required
    ];

    const loadOrders = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await orderApi.orderOrganizationOrdersGet({
            headers: { Authorization: `Bearer ${token}` },
          });
          orders.value = response.data; // Assuming the response structure matches your endpoint data
          filterOrders();
          console.log(orders.value);
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
          console.log(orderDetail.value);
        } catch (error) {
          console.error("Failed to load offers:", error);
          orderDetail.value = undefined; // Reset to initial structure in case of error
        }
      }
    };

    const filterOrders = () => {
      if (filters.value.searchQuery) {
        filteredOrders.value = orders.value.filter((order) =>
          order.organizationName
            .toLowerCase()
            .includes(filters.value.searchQuery.toLowerCase())
        );
      } else {
        filteredOrders.value = orders.value;
      }
      console.log(filteredOrders.value);
    };

    const prepareOrderDetails = (order) => {
      selectedOrder.value = order;
      modalTitle.value = `Order Detail: ${order.key}`;
      loadOrderDetail(order.id);
      isModalVisible.value = true;
    };

    const closeModal = () => {
      isModalVisible.value = false;
      orderDetail.value = [];
    };

    watch(() => filters.value.searchQuery, filterOrders);

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 because months are zero-indexed
      const year = date.getFullYear();
      return `${day}. ${month}. ${year}`;
    };

    const getRowNo = (row) => {
      // Using data instead of filteredCategories since filteredCategories is not defined
      const rowNo =
        orders.value.indexOf(row) +
        1 +
        (pageSettings.value.Page - 1) * pageSettings.value.NoOfItems;
      return rowNo;
    };

    onMounted(loadOrders);

    return {
      orders,
      filteredOrders,
      filters,
      isModalVisible,
      modalTitle,
      selectedOrder,
      orderDetail,
      prepareOrderDetails,
      closeModal,
      filterOrders,
      formatDate,
      stages,
      allStages,
      pageSettings,
      totalPages,
      columns: computed(() => [
        { title: "No", key: "no", render: (row) => getRowNo(row) },
        { title: "ID Objednávky", key: "key" },
        { title: "Oragnizace", key: "organizationName" },
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
      ]),
    };
  },
};
</script>

<style scoped>
.filter-input {
  margin-bottom: 20px;
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

.modal-split-container {
  display: flex;
  justify-content: space-between;
}

.timeline-container {
  flex: 1;
  margin-right: 20px; /* Space between timeline and table */
}

.items-table-container {
  flex: 2;
  overflow-x: auto; /* Allows horizontal scrolling if necessary */
}
</style>
