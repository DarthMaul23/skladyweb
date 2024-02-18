<template>
  <main id="warehousedetail-page">
    <div>
      <n-button @click="goBackToWarehouses" type="primary"
        >Zpět na seznam skladů</n-button
      >
      <div class="warehouse-details">
        <h1>{{ warehouseDetails.name }}</h1>
        <p>Location: {{ warehouseDetails.location }}</p>
      </div>
      <div class="item-list">
        <n-data-table :columns="itemColumns" :data="items">
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
    </div>
  </main>
</template>
<script>
import { NButton, NTable } from "naive-ui";
import { defineComponent, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ItemApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default defineComponent({
  components: {
    NButton,
    NTable,
  },
  setup() {
    const itemApi = new ItemApi(getDefaultApiConfig());
    const route = useRoute();
    const router = useRouter();
    const warehouseDetails = ref({});
    const items = ref([]);

    const itemColumns = [
      { title: "Name", key: "name" },
      { title: "Description", key: "description" },
      { title: "Quantity", key: "quantity" },
    ];

    const loadWarehouseDetails = async () => {
      let token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await itemApi.itemGetWarehouseItemsPost(
            route.params.id, // The new warehouse data to be sent as the request body
            {
              headers: { Authorization: `Bearer ${token}` }, // Options including headers
            }
          );
          warehouseDetails.value = response.data.result.warehouse;
          items.value = response.data.result.items; // Assuming the response structure matches
          console.log(items.value);
        } catch (error) {
          console.error("Failed to load warehouse details:", error);
          // Handle unauthorized error or other errors appropriately
        }
      } else {
        console.error("No auth token found");
        // Redirect to login or show a message
      }
    };

    const goBackToWarehouses = () => {
      router.push("/");
    };

    onMounted(loadWarehouseDetails);

    return { warehouseDetails, items, itemColumns, goBackToWarehouses };
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
</style>