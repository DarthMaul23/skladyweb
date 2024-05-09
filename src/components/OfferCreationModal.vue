<template>
  <CustomModal
    :show="showCreateOfferModal"
    title="Vytvořit nabídku"
    :header-bg-color="'green'"
    :modal-width="'80%'"
    :modal-height="'90%'"
    @update:show="$emit('updateShowCreateOfferModal', $event)"
  >
    <template #body>
      <div class="form-group">
        <n-form-item label="Nabídka:">
          <n-input
            v-model="offerInformations.title"
            placeholder="Název nabídky"
          />
        </n-form-item>

        <n-form-item label="Popis:">
          <n-input
            v-model="offerInformations.description"
            placeholder="Popis nabídky"
          />
        </n-form-item>
        <!-- Organization selection -->
        <n-form-item label="Organizace:" required>
          <n-select
            v-model="selectedOrganization"
            :options="organizationOptions"
            placeholder="Vyberte organizaci"
            @change="addOrganization"
          />
        </n-form-item>
        <!-- Display selected organizations and their items -->
        <div class="selected-organizations">
          <div
            v-for="(organization, orgIndex) in offerData.organizations"
            :key="orgIndex"
            class="organization-card"
          >
            <div class="organization-header">
              <span>{{ organization.name }}</span>
              <n-button
                icon="trash"
                color="#f5222d"
                @click="removeOrganization(orgIndex)"
              >
                <span class="material-icons">delete</span>
              </n-button>
            </div>
            <div class="organization-items">
              <div
                v-for="(item, itemIndex) in organization.items"
                :key="itemIndex"
                class="selected-item"
              >
                <span
                  >{{ item.description }} - Množství: {{ item.quantity }}</span
                >
                <n-input-number
                  v-model="item.quantity"
                  @change="
                    (newQuantity) =>
                      updateOfferItemQuantity(orgIndex, itemIndex, newQuantity)
                  "
                  :min="0"
                />
                <n-button
                  icon="trash"
                  type="error"
                  color="#f5222d"
                  @click="removeItemFromOfferCreation(orgIndex, itemIndex)"
                >
                  <span class="material-icons">delete</span>
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <n-button @click="createOffer" class="save-button"
        >Vytvořit nabídku</n-button
      >
      <n-button @click="closeModal" class="close-button">Zavřít</n-button>
    </template>
  </CustomModal>
</template>
  
  <script>
import CustomModal from "../components/CustomModal.vue";
import { getDefaultApiConfig } from "../utils/utils";
import { ref, watch } from "vue";
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
import {
  ItemApi,
  OrganizationApi,
  OfferApi,
  CategoryApi,
} from "../api/openapi/api";

export default {
  components: {
    CustomModal,
    NButton,
    NDataTable,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    useMessage,
    NSelect,
    NSpace,
  },
  props: {
    showCreateOfferModal: Boolean,
    selectedItems: Array,
  },
  emits: ["updateShowCreateOfferModal"],
  setup(props, { emit }) {
    const organizationOptions = ref([]);
    const selectedOrganization = ref(null);
    const offerInformations = ref({ title: "", description: "" });
    const offerData = ref({ organizations: [] });
    const organizationApi = new OrganizationApi(getDefaultApiConfig());

    watch(
      () => props.showCreateOfferModal,
      (newVal) => {
        if (newVal) {
          loadOrganizations();
        }
      }
    );

    const loadOrganizations = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await organizationApi.organizationOrganizationsGet({
            headers: { Authorization: `Bearer ${token}` },
          });
          organizationOptions.value = response.data.result.map((org) => ({
            label: org.name,
            value: org.id,
          }));
        } catch (error) {
          console.error("Failed to load Organizations:", error);
          emit("error", "Failed to load organizations");
        }
      } else {
        emit("authentication-needed");
      }
    };

    const addOrganization = (orgId) => {
      const org = organizationOptions.value.find((o) => o.value === orgId);
      if (org && !offerData.value.organizations.some((o) => o.id === orgId)) {
        offerData.value.organizations.push({
          id: orgId,
          name: org.label,
          items: [...props.selectedItems],
        });
      }
    };

    const removeOrganization = (index) => {
      offerData.value.organizations.splice(index, 1);
    };

    const updateOfferItemQuantity = (orgIndex, itemIndex, newQuantity) => {
      const org = offerData.value.organizations[orgIndex];
      const item = org.items[itemIndex];
      if (item) {
        item.quantity = newQuantity;
      }
    };

    const createOffer = () => {
      // API call to create offer
      console.log("Offer created:", offerData.value);
      emit("updateShowCreateOfferModal", false);
    };

    const closeModal = () => {
      emit("updateShowCreateOfferModal", false);
    };

    return {
      organizationOptions,
      selectedOrganization,
      offerInformations,
      offerData,
      addOrganization,
      removeOrganization,
      updateOfferItemQuantity,
      createOffer,
      closeModal,
    };
  },
};
</script>
  
  <style scoped>
.selected-organizations {
  height: 46vh;
  max-height: 46vh;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
  padding: 10px;
}

.organization-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #f8f8f8;
  padding-bottom: 5px;
}

.organization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  background-color: green;
  font-weight: bold;
  color: white;
  padding-left: 20px;
  padding-right: 10px;
}

.selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 10px;
  padding-top: 10px;
  padding-right: 5px;
}
</style>
  