<template>
  <main id="warehousedetail-page">
    <div>
      <n-button @click="goBackToWarehouses" type="primary"
        >Back to Warehouse List</n-button
      >
      <div class="warehouse-details">
        <h1>{{ warehouseDetails.name }}</h1>
        <p>Location: {{ warehouseDetails.location }}</p>
      </div>
      <div class="actions">
        <n-button @click="showAddItemModal = true" type="primary"
          >Add New Item</n-button
        >
      </div>
      <div class="item-list">
        <n-data-table :columns="itemColumns" :data="items">
          <!-- Existing slot for actions -->
        </n-data-table>
      </div>
    </div>

    <!-- CustomModal for adding new item -->
    <CustomModal
      :show="showAddItemModal"
      title="Add New Item"
      :headerBgColor="'#007bff'"
      :headerTitleColor="'#ffffff'"
      :modalWidth="'500px'"
      @update:show="showAddItemModal = $event"
    >
      <template #body>
        <n-form ref="newItemForm">
          <n-form-item label="Name">
            <n-input
              v-model:value="newItem.name"
              placeholder="Enter item name"
            />
          </n-form-item>
          <n-form-item label="Description">
            <n-input
              v-model:value="newItem.description"
              placeholder="Enter item description"
            />
          </n-form-item>
          <n-form-item label="Quantity">
            <n-input-number v-model:value="newItem.quantity" />
          </n-form-item>
        </n-form>
      </template>
      <template #footer>
        <n-button @click="addItem" class="save-button">Save</n-button>
        <n-button @click="closeModal" class="close-button">Close</n-button>
      </template>
    </CustomModal>
  </main>
</template>
  
  <script>
import {
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
} from "naive-ui";
import CustomModal from "../components/CustomModal.vue"; // Adjust the import path as needed
import { defineComponent, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ItemApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";
import { useMessage } from 'naive-ui';

export default defineComponent({
  components: {
    NButton,
    NDataTable,
    CustomModal,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
  },
  setup() {
    const itemApi = new ItemApi(getDefaultApiConfig());
    const route = useRoute();
    const router = useRouter();
    const warehouseDetails = ref({});
    const message = useMessage(); 
    const items = ref([]);
    const showAddItemModal = ref(false);
    const newItem = ref({ name: "", description: "", quantity: 1 });

    const itemColumns = [
      { title: "Name", key: "name" },
      { title: "Description", key: "description" },
      { title: "Quantity", key: "quantity" },
      // Add your actions column if necessary
    ];

    const loadWarehouseDetails = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await itemApi.itemGetWarehouseItemsPost(
            route.params.id,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          warehouseDetails.value = response.data.result.warehouse;
          items.value = response.data.result.items;
        } catch (error) {
          console.error("Failed to load warehouse details:", error);
          message.error("Failed to load warehouse details");
        }
      } else {
        router.push("/login");
      }
    };

    const addItem = async () => {
      const token = localStorage.getItem("authToken");
      if (token && newItem.value.name && newItem.value.quantity != null) {
        // Ensure mandatory fields are filled
        try {
          const response = await itemApi.itemAddNewItemPost(
            route.params.id,
            newItem.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          message.success("Item added successfully");
          warehouseDetails.value = response.data.result.warehouse; // Adjust according to your API response
          items.value = response.data.result.items; // Adjust according to your API response
          showAddItemModal.value = false;
          loadWarehouseDetails(); // Refresh warehouse details
        } catch (error) {
          console.error("Failed to add item:", error);
          message.error("Failed to add item");
        }
      } else {
        message.warning("Please fill all required item fields");
      }
    };

    const closeModal = () => {
      showAddItemModal.value = false;
    };

    const goBackToWarehouses = () => {
      router.push("/");
    };

    onMounted(loadWarehouseDetails);

    return {
      warehouseDetails,
      items,
      itemColumns,
      goBackToWarehouses,
      showAddItemModal,
      newItem,
      addItem,
      closeModal,
    };
  },
});
</script>
  
  <style scoped>
.warehouse-details {
  margin-bottom: 20px;
}
.item-list {
  margin-top: 20px;
}
.actions {
  margin-bottom: 20px;
}
.save-button {
  background-color: #28a745;
}
.close-button {
  background-color: #dc3545;
}
</style>