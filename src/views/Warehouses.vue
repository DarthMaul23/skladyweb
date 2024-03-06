<template>
  <main id="warehouses-page">
    <div class="actions" v-if="!showDetails">
      <n-button @click="showModal = true">Přidat nový sklad</n-button>
    </div>
    <div v-if="!showDetails">
      <n-data-table :columns="columns" :data="warehouses">
        <template v-slot:action="{ row }">
          <n-button size="small" @click="showWarehouseDetails(row)"
            >Detail</n-button
          >
          <n-button
            size="small"
            text
            color="red"
            @click="deleteWarehouse(row.id)"
            >Delete</n-button
          >
        </template>
      </n-data-table>
    </div>
    <div v-if="showDetails">
      <n-button @click="backToList">Back to List</n-button>
      <h2>{{ selectedWarehouse.name }} - Details</h2>
      <!-- Additional warehouse details and item management here -->
    </div>
    <!-- Custom Modal for Adding New Warehouse -->
    <CustomModal
      :show="showModal"
      title="Add New Warehouse"
      :headerBgColor="'green'"
      :modalWidth="'400px'"
      :modalHeight="'auto'"
      @update:show="handleModalVisibility"
    >
      <template #body>
        <div class="form-group">
          <n-form-item label="Name:" required>
            <n-input
              v-model:value="newWarehouse.name"
              placeholder="Warehouse name"
            />
            <div v-if="validationErrors.name" class="error-msg">
              {{ validationErrors.name }}
            </div>
          </n-form-item>
          <n-form-item label="Location:" required>
            <n-input
              v-model:value="newWarehouse.location"
              placeholder="Warehouse location"
            />
            <div v-if="validationErrors.location" class="error-msg">
              {{ validationErrors.location }}
            </div>
          </n-form-item>
        </div>
      </template>
      <template #footer>
        <n-button @click="addWarehouse" class="save-button">Add</n-button>
        <n-button @click="closeModal" class="close-button">Close</n-button>
      </template>
    </CustomModal>
  </main>
</template>
<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, computed, h, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { NButton } from "naive-ui";
import { WarehouseApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: { CustomModal },
  setup() {
    const router = useRouter();
    const warehouseApi = new WarehouseApi(getDefaultApiConfig());
    const showModal = ref(false);
    const newWarehouse = ref({ name: "", location: "" });
    const validationErrors = ref({});
    const warehouses = ref([]);

    const columns = [
      { title: "Name", key: "name" },
      { title: "Location", key: "location" },
      // Ensure 'action' matches the slot name in the template
      {
        title: "Actions",
        key: "action",
        render: (row, index) => {
          return h("div", [
            h(
              NButton,
              {
                onClick: () => showWarehouseDetails(row),
                size: "small",
                type: "success",
              },
              "Detail"
            ),
            h(
              NButton,
              {
                onClick: () => deleteCategory(row.id),
                size: "small",
                style: "margin-left: 8px;",
                type: "error",
              },
              "Delete"
            ),
          ]);
        },
      },
    ];

    onMounted(() => {
      fetchWarehouses();
    });

    const fetchWarehouses = async () => {
      try {
        let token = localStorage.getItem("authToken");
        const response = await warehouseApi.warehouseGetWarehousesGet({
          headers: { Authorization: `Bearer ${token}` },
        }); // Adjust this call to your actual API method
        warehouses.value = response.data.result; // Adjust according to the response structure
      } catch (error) {
        console.error("Failed to fetch warehouses:", error);
      }
    };

    const showDetails = ref(false);
    const selectedWarehouse = ref(null);

    const handleModalVisibility = (visible) => {
      showModal.value = visible;
      if (!visible) resetForm();
    };

    const addWarehouse = async () => {
      if (validateForm()) {
        try {
          let token = localStorage.getItem("authToken");
          // Note: First argument is the newWarehouse model, followed by options for headers
          const response = await warehouseApi.warehouseCreateWarehousePost(
            newWarehouse.value, // The new warehouse data to be sent as the request body
            {
              headers: { Authorization: `Bearer ${token}` }, // Options including headers
            }
          );
          showModal.value = false;
          resetForm();
          // Refresh the warehouses list
          fetchWarehouses();
        } catch (error) {
          console.error("Failed to add warehouse:", error);
          // Handle error appropriately
        }
      }
    };

    const validateForm = () => {
      validationErrors.value = {};
      let isValid = true;
      if (!newWarehouse.value.name) {
        validationErrors.value.name = "Name is required.";
        isValid = false;
      }
      if (!newWarehouse.value.location) {
        validationErrors.value.location = "Location is required.";
        isValid = false;
      }
      return isValid;
    };

    const resetForm = () => {
      newWarehouse.value = { name: "", location: "" };
      validationErrors.value = {};
    };

    const closeModal = () => {
      showModal.value = false;
      resetForm();
    };

    const showWarehouseDetails = (warehouse) => {
      console.log(warehouse);
      selectedWarehouse.value = warehouse;
      //showDetails.value = true;
      router.push({ name: 'WarehouseDetails', params: { id: warehouse.id } });
    };

    const backToList = () => {
      showDetails.value = false;
      selectedWarehouse.value = null;
    };

    return {
      showModal,
      newWarehouse,
      warehouses,
      columns,
      validationErrors,
      showDetails,
      selectedWarehouse,
      showWarehouseDetails,
      backToList,
      addWarehouse,
      closeModal,
      handleModalVisibility,
    };
  },
};
</script>

<style scoped>
.actions {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.error-msg {
  color: #ff4d4f;
  margin-top: 5px;
}

.save-button {
  background-color: #52c41a;
  color: white;
}

.close-button {
  background-color: #f5222d;
  color: white;
}
</style>
