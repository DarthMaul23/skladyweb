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
          <n-input v-model="offerInformations.title" placeholder="Název nabídky" />
        </n-form-item>
        <n-form-item label="Popis:">
          <n-input v-model="offerInformations.description" placeholder="Popis nabídky" />
        </n-form-item>
        <n-form-item label="Organizace:" required>
          <n-select
            v-model="selectedOrganization"
            :options="organizationOptions"
            placeholder="Vyberte organizaci"
            @change="addOrganization"
          />
        </n-form-item>
        <div class="content-wrapper">
          <div class="available-items">
            <div class="section-header">Dostupné položky</div>
            <div v-for="(item, index) in availableItems" :key="index" class="item-card">
              <div class="item-header">
                <span>{{ item.description }} - Množství: {{ item.quantity }}</span>
                <n-button icon="add" type="primary" @click="addItemToOrganization(item, index)">
                  <span class="material-icons">add</span>
                </n-button>
              </div>
            </div>
          </div>
          <div class="selected-organizations">
            <div class="section-header">Vybrané organizace</div>
            <div v-for="(organization, orgIndex) in offerData.organizations" :key="orgIndex" class="organization-card">
              <div class="organization-header">
                <span>{{ organization.name }}</span>
                <n-button icon="trash" color="#f5222d" @click="removeOrganization(orgIndex)">
                  <span class="material-icons">delete</span>
                </n-button>
              </div>
              <div class="organization-items">
                <div v-for="(item, itemIndex) in organization.items" :key="itemIndex" class="selected-item">
                  <span>{{ item.description }} - Množství: {{ item.quantity }}</span>
                  <n-input-number
                    v-model="item.quantity"
                    @change="(newQuantity) => updateOfferItemQuantity(orgIndex, itemIndex, newQuantity)"
                    :min="0"
                  />
                  <n-button icon="trash" type="error" color="#f5222d" @click="removeItemFromOrganization(orgIndex, itemIndex)">
                    <span class="material-icons">delete</span>
                  </n-button>
                </div>
                <div class="available-items-for-org">
                  <div v-for="(item, itemIndex) in availableItems" :key="itemIndex" class="item-card">
                    <div class="item-header">
                      <span>{{ item.description }} - Množství: {{ item.quantity }}</span>
                      <n-button icon="add" type="primary" @click="assignItemToOrganization(orgIndex, item, itemIndex)">
                        <span class="material-icons">add</span>
                      </n-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <n-button @click="createOffer" class="save-button">Vytvořit nabídku</n-button>
      <n-button @click="closeModal" class="close-button">Zavřít</n-button>
    </template>
  </CustomModal>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, watch } from "vue";
import {
  NButton,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
} from "naive-ui";

export default {
  components: {
    CustomModal,
    NButton,
    NFormItem,
    NInput,
    NInputNumber,
    NSelect,
  },
  props: {
    showCreateOfferModal: Boolean,
    selectedItems: Array,
    organizationOptions: Array,
  },
  emits: ["updateShowCreateOfferModal"],
  setup(props, { emit }) {
    const offerInformations = ref({ title: "", description: "" });
    const offerData = ref({ organizations: [] });
    const availableItems = ref([...props.selectedItems]);
    const selectedOrganization = ref(null);

    watch(
      () => props.selectedItems,
      (newVal) => {
        availableItems.value = [...newVal];
      },
      { immediate: true, deep: true }
    );

    const addOrganization = (orgId) => {
      const org = props.organizationOptions.find((o) => o.value === orgId);
      if (org && !offerData.value.organizations.some((o) => o.id === orgId)) {
        offerData.value.organizations.push({
          id: orgId,
          name: org.label,
          items: [],
        });
      }
    };

    const removeOrganization = (index) => {
      const removedOrg = offerData.value.organizations.splice(index, 1)[0];
      if (removedOrg) {
        availableItems.value.push(...removedOrg.items);
      }
    };

    const addItemToOrganization = (item, itemIndex) => {
      const org = offerData.value.organizations.find(
        (org) => org.id === selectedOrganization.value
      );
      if (org) {
        org.items.push(item);
        availableItems.value.splice(itemIndex, 1);
      }
    };

    const removeItemFromOrganization = (orgIndex, itemIndex) => {
      const item = offerData.value.organizations[orgIndex].items.splice(itemIndex, 1)[0];
      availableItems.value.push(item);
    };

    const assignItemToOrganization = (orgIndex, item, itemIndex) => {
      const org = offerData.value.organizations[orgIndex];
      if (org) {
        org.items.push(item);
        availableItems.value.splice(itemIndex, 1);
      }
    };

    const updateOfferItemQuantity = (orgIndex, itemIndex, newQuantity) => {
      const org = offerData.value.organizations[orgIndex];
      const item = org.items[itemIndex];
      if (item) {
        item.quantity = newQuantity;
      }
    };

    const createOffer = () => {
      console.log("Offer created:", offerData.value);
      emit("updateShowCreateOfferModal", false);
    };

    const closeModal = () => {
      emit("updateShowCreateOfferModal", false);
    };

    return {
      offerInformations,
      offerData,
      availableItems,
      selectedOrganization,
      addOrganization,
      removeOrganization,
      addItemToOrganization,
      removeItemFromOrganization,
      assignItemToOrganization,
      updateOfferItemQuantity,
      createOffer,
      closeModal,
    };
  },
};
</script>

<style scoped>
.content-wrapper {
  display: flex;
  gap: 20px;
}

.available-items {
  width: 30%;
  height: 70vh;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
  padding: 10px;
}

.item-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #f8f8f8;
  padding: 10px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-organizations {
  width: 70%;
  height: 70vh;
  max-height: 70vh;
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

.available-items-for-org {
  min-height: 0;
  height: 20vh;
  max-height: 20vh;
  border-top: 1px solid #ccc;
  padding-top: 10px;
  margin-top: 10px;
}
</style>