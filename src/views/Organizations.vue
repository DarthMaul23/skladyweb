<template>
  <main id="offers-page">
    <div class="filter-container">
      <n-input placeholder="Search..." class="filter-input" />
    </div>
    <n-button @click="() => (isModal2Visible = true)"
      >Přidat Novou Organizaci</n-button
    >
    <n-data-table
      :columns="columns"
      :data="data.organizations"
      class="organizations-table"
    >
      <template v-slot:action="{ row }">
        <n-button @click="() => console.log('Detail view for', row)"
          >Details</n-button
        >
      </template>
    </n-data-table>
    <n-pagination
      v-model:page="pageSettings.Page"
      :page-count="data.totalPages"
    />

    <custom-modal
      :show="isModal2Visible"
      :title="'Vytvořit Novou Organizaci'"
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'auto'"
      @update:show="isModal2Visible = $event"
    >
      <template #body>
        <div class="modal-content">
          <n-form>
            <n-form-item label="Název organizace">
              <n-input
                v-model:value="newOrganization.Name"
                placeholder="Název organizace"
              />
            </n-form-item>
            <n-form-item label="Lokalita">
              <n-input
                v-model:value="newOrganization.Location"
                placeholder="Lokalita"
              />
            </n-form-item>
          </n-form>
        </div>
      </template>
      <template #footer>
        <n-button
          @click="() => createNewOrganization()"
          class="modal-add-button"
          >Vytvořit organizaci</n-button
        >
        <n-button
          @click="() => (isModal2Visible = false)"
          class="modal-close-button"
          >Zavřít</n-button
        >
      </template>
    </custom-modal>

    <custom-modal
      :show="isModalVisible"
      :title="
        selectedOrderDetails
          ? `Detail Organiazce: ${selectedOrderDetails.key}`
          : 'Detail Organiazce'
      "
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'auto'"
      @update:show="isModalVisible = $event"
    >
      <template #body>
        <div class="modal-content"></div>
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
import { ref, computed, onMounted, h, watch } from "vue";
import { NButton, NInput, NDataTable, NPagination } from "naive-ui";
import { OrganizationApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    NButton,
    NInput,
    NDataTable,
    OrderTimeline,
    NPagination,
  },
  setup() {
    const organizationApi = new OrganizationApi(getDefaultApiConfig()); // Initialize API (add params as needed)
    const data = ref([]);
    const isModalVisible = ref(false);
    const isModal2Visible = ref(false);
    const selectedOrderDetails = ref({});
    const newOrganization = ref({
      Name: "",
      Location: "",
    });

    const pageSettings = ref({
      Page: 1,
      NoOfItems: 5,
    });

    const loadOrganizations = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response =
            await organizationApi.organizationGetAllOrganizationsPost(
              pageSettings.value,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          data.value = response.data.result; // Assuming the response structure matches your endpoint data
        } catch (error) {
          console.error("Failed to load offers:", error);
          data.value = []; // Reset to initial structure in case of error
        }
      }
    };

    const createNewOrganization = async () => {
      // Assuming authToken is always available for simplicity
      const token = localStorage.getItem("authToken");
      try {
        await organizationApi.organizationCreateOrganizationPost(
          newOrganization.value,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        newOrganization.value = { Name: "", Location: "" }; // Reset form
        isModal2Visible.value = false; // Close modal explicitly
        await loadOrganizations(); // Reload the list
      } catch (error) {
        console.error("Failed to create organization:", error);
        // Consider setting an error state or displaying a message to the user here
      }
    };

    const closeModal = () => {
      isModalVisible.value = false;
    };

    onMounted(loadOrganizations);

    watch(
      () => pageSettings.value.Page,
      (newPage, oldPage) => {
        if (newPage !== oldPage) {
			loadOrganizations();
        }
      }
    );

    return {
      data,
      newOrganization,
      createNewOrganization,
      isModalVisible,
      isModal2Visible,
      selectedOrderDetails,
      closeModal,
      pageSettings,
      columns: [
        { title: "Organiazce", key: "name" },
        { title: "Lokalita", key: "location" },
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

.modal-add-button {
  background-color: green;
  color: white;
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
	