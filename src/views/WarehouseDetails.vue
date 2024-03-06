<template>
  <main id="warehousedetail-page">
    <n-button color="green" @click="backToList">Zpět na seznam skladů</n-button>
    <div class="warehouse-details">
      <h2>{{ warehouseDetails.name }} - Details</h2>
      <!-- Here you can insert additional details or management sections for your warehouse -->
    </div>
    <div class="actions">
      <n-button color="green" @click="showAddItemModal = true"
        >+ Naskladnit položku</n-button
      >
    </div>
    <div class="scrollable-content">
      <div
        v-for="parentItem in items"
        :key="parentItem.name"
        class="parent-item"
      >
        <section class="item-header" color="green">
          <h3>
            {{ parentItem.name }} (Celkové množství:
            {{ parentItem.totalQuantity }})
          </h3>
        </section>
        <n-data-table
          :columns="itemChildColumns"
          :data="parentItem.items"
          :row-key="childRowKey"
          bordered
        />
      </div>
    </div>
    <!-- Custom Modal for Adding New Item -->
    <CustomModal
      :show="showAddItemModal"
      title="Naskladnit Položku"
      :header-bg-color="'green'"
      :modal-width="'500px'"
      :modal-height="'auto'"
      @update:show="showAddItemModal = $event"
    >
      <template #body>
        <div class="form-group">
          <n-form-item label="Kategorie:" required>
            <n-select
              v-model:value="newItem.name"
              :options="categoriesOptions"
            />
            <div v-if="validationErrors.name" class="error-msg">
              {{ validationErrors.name }}
            </div>
          </n-form-item>
          <n-form-item label="Položka:">
            <n-input
              v-model:value="newItem.description"
              placeholder="Popis položky"
            />
            <div v-if="validationErrors.description" class="error-msg">
              {{ validationErrors.description }}
            </div>
          </n-form-item>
          <n-space align="center">
            <n-form-item label="Množství:" required>
              <n-input-number v-model:value="newItem.quantity" />
              <div v-if="validationErrors.quantity" class="error-msg">
                {{ validationErrors.quantity }}
              </div>
            </n-form-item>
            <n-form-item label="Jednotky:" required>
              <n-select
                v-model:value="newItem.unit"
                :options="unitOptions"
              /> </n-form-item
          ></n-space>
        </div>
      </template>
      <template #footer>
        <n-button @click="addItem" class="save-button">Naskladnit</n-button>
        <n-button @click="closeModal" class="close-button">Zavřít</n-button>
      </template>
    </CustomModal>
  </main>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, onMounted, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  useMessage,
  NSelect,
  NSpace,
} from "naive-ui";
import { ItemApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    NButton,
    NDataTable,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NSelect,
    NSpace,
  },
  setup() {
    const router = useRouter();
    const route = useRoute(); // Correctly initialized
    const itemApi = new ItemApi(getDefaultApiConfig());
    const message = useMessage(); // Correctly initialized
    const showDetails = ref(false);
    const showAddItemModal = ref(false);
    const newItem = ref({ name: "", description: "", quantity: 0, unit: "kg" });
    const validationErrors = ref({});
    const items = ref([]);
    const expandedRowKeys = ref(["Chleba"]);
    const warehouseDetails = ref({});
    const categoriesOptions = ref([]);

    const itemMasterColumns = [
      { title: "Name", key: "name" },
      { title: "Quantity", key: "totalQuantity" },
      {
        title: "Actions",
        key: "action",
        render: (row) => renderExpandButton(row),
      },
    ];

    const itemChildColumns = [
      { title: "Položka", key: "description" },
      { title: "Množství", key: "quantity" },
    ];

    const unitOptions = [
      {
        label: "Kilogramy",
        value: "kg",
      },
      {
        label: "Kusy",
        value: "ks",
      },
    ];

    const rowKey = (row) => row.name;
    const childRowKey = (child) => child.name;

    onMounted(() => {
      loadWarehouseDetails();
    });

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
          getCategoriesOfItems(items.value);
        } catch (error) {
          console.error("Failed to load warehouse details:", error);
          message.error("Failed to load warehouse details");
        }
      } else {
        router.push("/login");
      }
    };

    const getCategoriesOfItems = (items) => {
      categoriesOptions.value = items.map((item) => ({
        label: item.name,
        value: item.name,
      }));
      return categoriesOptions; // return the new array to be used elsewhere
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
          message.success("Položka byla úspěšně naskladněna");
          warehouseDetails.value = response.data.result.warehouse; // Adjust according to your API response
          items.value = response.data.result.items; // Adjust according to your API response
          showAddItemModal.value = false;
          loadWarehouseDetails(); // Refresh warehouse details
        } catch (error) {
          console.error("Failed to add item:", error);
          message.error("Vyskytla s echyba. Položku se nepodařilo naskaldnit.");
        }
      } else {
        message.warning("Vyplntě prosím všechna pole");
      }
    };

    const closeModal = () => {
      showAddItemModal.value = false;
    };

    const backToList = () => {
      router.push("/"); // Change this as needed
    };
    const toggleExpand = (row) => {
      const key = row.name; // Use the name as the key
      const index = expandedRowKeys.value.indexOf(key);
      if (index >= 0) {
        expandedRowKeys.value.splice(index, 1); // If already expanded, collapse it
      } else {
        expandedRowKeys.value.push(key); // Otherwise, expand it
      }
      console.log(expandedRowKeys.value);
      findChildItemsByName(row.name);
    };

    const findChildItemsByName = (name) => {
      console.log(name);
      const item = items.value.find((item) => item.name === name);
      console.log(item);
      return item ? item.items : [];
    };

    const validateForm = () => {
      // Function to validate the new item form inputs
    };

    const renderExpandButton = (row) => {
      // Make sure 'row' has the required properties before trying to access them
      return h(
        NButton,
        {
          size: "small",
          onClick: () => toggleExpand(row),
        },
        () =>
          expandedRowKeys.value.includes(row.name)
            ? "Zabalit Položky"
            : "Zobrazit Položky"
      );
    };

    return {
      showDetails,
      showAddItemModal,
      newItem,
      validationErrors,
      items,
      expandedRowKeys,
      warehouseDetails,
      itemMasterColumns,
      itemChildColumns,
      unitOptions,
      categoriesOptions,
      getCategoriesOfItems,
      findChildItemsByName,
      rowKey,
      childRowKey,
      addItem,
      closeModal,
      backToList,
      toggleExpand,
      loadWarehouseDetails,
      validateForm,
    };
  },
};
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
.error-msg {
  color: #ff4d4f;
  margin-top: 5px;
}
.save-button {
  background-color: 6, 15, 46;
  background-color: green;
  color: white;
}
.close-button {
  background-color: #f5222d;
  color: white;
}

.parent-item {
  margin-bottom: 2rem;
}

.item-header {
  padding-left: 1rem;
  padding-top: 0.5rem;
  background-color: green;
  color: white;
}

.scrollable-content {
  max-height: calc(
    100vh - 220px
  ); /* Adjust based on your header and action bar height */
  overflow-y: auto;
}
</style>
