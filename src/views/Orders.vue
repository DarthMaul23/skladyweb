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

    <OrderDetailsModal
      :show="isModalVisible"
      :orderId="selectedOrderId"
      @update:show="isModalVisible = $event"
    />
  </main>
</template>

<script>
import CustomTable from "../components/CustomTable.vue";
import OrderDetailsModal from "../components/OrderDetailsModal.vue";
import { ref, computed, onMounted, h, watch } from "vue";
import { NButton, NInput } from "naive-ui";
import { OrderApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomTable,
    OrderDetailsModal,
    NButton,
    NInput,
  },
  setup() {
    const orderApi = new OrderApi(getDefaultApiConfig());
    const orders = ref([]);
    const filteredOrders = ref([]);
    const filters = ref({ searchQuery: "" });
    const isModalVisible = ref(false);
    const selectedOrderId = ref("");
    const totalPages = ref(0);
    const pageSettings = ref({ Page: 1, NoOfItems: 3 });

    const loadOrders = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await orderApi.orderOrganizationOrdersGet({
            headers: { Authorization: `Bearer ${token}` },
          });
          orders.value = response.data;
          filterOrders();
        } catch (error) {
          console.error("Failed to load offers:", error);
          orders.value = [];
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
    };

    const prepareOrderDetails = (order) => {
      selectedOrderId.value = order.id;
      isModalVisible.value = true;
    };

    watch(() => filters.value.searchQuery, filterOrders);

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}. ${month}. ${year}`;
    };

    const getRowNo = (row) => {
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
      selectedOrderId,
      prepareOrderDetails,
      filterOrders,
      formatDate,
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
#offers-page {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-input {
  width: 100%;
  max-width: 600px;
}

.offers-table {
  width: 100%;
  margin-bottom: 20px;
}

.item-table {
  margin-top: 10px;
  width: 100%;
}

.modal-close-button,
.modal-add-button {
  margin-right: 10px;
}

.custom-modal {
  --modal-content-padding: 20px;
}

.organization-header {
  font-weight: bold;
  margin-top: 20px;
}

.organization-items {
  margin-bottom: 10px;
}

.details-section {
  flex-shrink: 0;
}

.organizations-section {
  flex-grow: 1;
  overflow-y: auto;
  margin-top: 20px;
}

.details-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  background-color: #f9f9f9;
  border-left: 5px solid #4caf50;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.detail-item p {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.detail-item strong {
  font-weight: bold;
  color: #2c3e50;
}

.organization-item {
  display: flex;
  align-items: center;
  gap: 10px;
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
  background-color: #4caf50;
}

.pending {
  background-color: #ffa500;
}

h3 {
  margin: 0;
}

.item-table {
  margin-top: 10px;
  width: 100%;
}
</style>
