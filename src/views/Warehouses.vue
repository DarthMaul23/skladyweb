<template>
  <main id="warehouses-page">
      <n-button @click="showModal = true" class="add-warehouse-button">Přidat nový sklad</n-button>
    <div v-if="!showDetails">
      <n-data-table :columns="columns" :data="warehouses" class="warehouses-table">
        <template v-slot:action="{ row }">
          <n-button size="small" @click="showWarehouseDetails(row)">Detail</n-button>
          <n-button size="small" text color="red" @click="deleteWarehouse(row.id)">Odstranit</n-button>
        </template>
      </n-data-table>
    </div>
    <div v-if="showDetails">
      <n-button @click="backToList" class="back-button">Zpět na seznam</n-button>
      <h2>{{ selectedWarehouse.name }} - Detaily</h2>
      <!-- Additional warehouse details and item management here -->
    </div>
    <!-- Custom Modal for Adding New Warehouse -->
    <CustomModal
      :show="showModal"
      title="Vytvořit nový sklad"
      :headerBgColor="'green'"
      :modalWidth="'500px'"
      :modalHeight="'auto'"
      @update:show="handleModalVisibility"
    >
      <template #body>
        <div class="form-group">
          <n-form-item label="Název:" required>
            <n-input v-model:value="newWarehouse.name" placeholder="Název skladu" />
            <div v-if="validationErrors.name" class="error-msg">{{ validationErrors.name }}</div>
          </n-form-item>
          <n-form-item label="Lokace:" required>
            <n-input v-model:value="newWarehouse.location" placeholder="Lokace skladu" />
            <div v-if="validationErrors.location" class="error-msg">{{ validationErrors.location }}</div>
          </n-form-item>
        </div>
      </template>
      <template #footer>
        <n-button @click="addWarehouse" class="save-button">Přidat</n-button>
        <n-button @click="closeModal" class="close-button">Zrušit</n-button>
      </template>
    </CustomModal>
  </main>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, onMounted, h } from "vue";
import { useRouter } from "vue-router";
import { NButton, NInput, NDataTable, NFormItem } from "naive-ui";
import { WarehouseApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: { CustomModal, NButton, NInput, NDataTable, NFormItem },
  setup() {
    const router = useRouter();
    const warehouseApi = new WarehouseApi(getDefaultApiConfig());
    const showModal = ref(false);
    const newWarehouse = ref({ name: "", location: "" });
    const validationErrors = ref({});
    const warehouses = ref([]);

    const columns = [
      { title: "Sklad", key: "name" },
      { title: "Lokalita", key: "location" },
      {
        title: "Akce",
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
                onClick: () => deleteWarehouse(row.id),
                size: "small",
                style: "margin-left: 8px;",
                type: "error",
              },
              "Smazat"
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
        });
        warehouses.value = response.data.result;
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
          const response = await warehouseApi.warehouseCreateWarehousePost(
            newWarehouse.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          showModal.value = false;
          resetForm();
          fetchWarehouses();
        } catch (error) {
          console.error("Failed to add warehouse:", error);
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
      selectedWarehouse.value = warehouse;
      router.push({ name: "WarehouseDetails", params: { id: warehouse.id } });
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
  text-align: center;
}

.add-warehouse-button {
  background-color: #128315;
  color: white;
  border-radius: 4px;
  font-weight: bold;
}

.warehouses-table {
  width: 100%;
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
  background-color: green;
  color: white;
}

.close-button {
  background-color: #f5222d;
  color: white;
}

.back-button {
  background-color: #4caf50;
  color: white;
  margin-bottom: 20px;
}
</style>
