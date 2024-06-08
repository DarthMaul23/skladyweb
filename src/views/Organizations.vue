<template>
  <main id="organizations-page">
    <div class="filter-container">
      <n-input placeholder="Search..." class="filter-input" />
    </div>
    <n-button @click="() => (isModal2Visible = true)" class="add-organization-button"
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
      :modal-width="'600px'"
      :modal-height="'auto'"
      @update:show="isModal2Visible = $event"
    >
      <template #body>
        <div class="modal-content">
          <n-form>
            <n-form-item label="Název organizace" class="form-item">
              <n-input
                v-model:value="newOrganization.Name"
                placeholder="Název organizace"
                class="input-field"
              />
              <div v-if="validationErrors.Name" class="error-msg">
                {{ validationErrors.Name }}
              </div>
            </n-form-item>
            <n-form-item label="Lokalita" class="form-item">
              <n-input
                v-model:value="newOrganization.Location"
                placeholder="Lokalita"
                class="input-field"
              />
              <div v-if="validationErrors.Location" class="error-msg">
                {{ validationErrors.Location }}
              </div>
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
import { ref, onMounted, h, watch } from "vue";
import { NButton, NInput, NDataTable, NPagination, NForm, NFormItem } from "naive-ui";
import { OrganizationApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    NButton,
    NInput,
    NDataTable,
    NPagination,
    NForm,
    NFormItem,
  },
  setup() {
    const organizationApi = new OrganizationApi(getDefaultApiConfig());
    const data = ref([]);
    const isModalVisible = ref(false);
    const isModal2Visible = ref(false);
    const selectedOrderDetails = ref({});
    const newOrganization = ref({
      Name: "",
      Location: "",
    });

    const validationErrors = ref({});

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
          data.value = response.data.result;
        } catch (error) {
          console.error("Failed to load organizations:", error);
          data.value = [];
        }
      }
    };

    const createNewOrganization = async () => {
      const token = localStorage.getItem("authToken");
      try {
        await organizationApi.organizationCreateOrganizationPost(
          newOrganization.value,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        newOrganization.value = { Name: "", Location: "" };
        isModal2Visible.value = false;
        await loadOrganizations();
      } catch (error) {
        console.error("Failed to create organization:", error);
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
      validationErrors,
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
.filter-container {
  margin-bottom: 20px;
}

.add-organization-button {
  background-color: #0f9213;
  color: white;
  margin-bottom: 20px;
}

.organizations-table {
  width: 100%;
  margin-bottom: 20px;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
}

.form-item {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
}

.error-msg {
  color: #ff4d4f;
  margin-top: 5px;
}

.modal-add-button {
  background-color: green;
  color: white;
}

.modal-close-button {
  background-color: red;
  color: white;
}
</style>
