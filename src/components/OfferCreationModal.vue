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
        <div class="form-row">
          <n-form-item label="Nabídka:">
            <n-input v-model="offerInformations.title" placeholder="Název nabídky" />
          </n-form-item>
          <n-form-item label="Popis:">
            <n-input v-model="offerInformations.description" placeholder="Popis nabídky" />
          </n-form-item>
        </div>
        <div class="form-row">
          <n-form-item label="Organizace:" required>
            <n-select
              v-model="selectedOrganization"
              :options="organizationOptions"
              placeholder="Vyberte organizaci"
              @change="addOrganization"
            />
            <n-button @click="distributeItemsEvenly" class="distribute-button">Automaticky rozdělit položky</n-button>
          </n-form-item>
        </div>
        <div class="content-wrapper">
          <div class="available-items">
            <div class="section-header">Dostupné položky</div>
            <div class="scrollable-content">
              <div v-for="(item, index) in filteredAvailableItems" :key="index" class="item-card">
                <div class="item-header">
                  <span>{{ item.name }}</span>
                  <span>{{ item.description }} - Množství: {{ item.quantity }} {{ item.unit }}</span>
                  <div>
                    <n-button icon="trash" type="error" @click="removeAvailableItem(index)">
                      <span class="material-icons">delete</span>
                    </n-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="selected-organizations">
            <div class="section-header">Vybrané organizace</div>
            <div class="scrollable-content">
              <div v-for="(organization, orgIndex) in offerData.organizations" :key="orgIndex" class="organization-card">
                <div class="organization-header">
                  <span>{{ organization.name }}</span>
                  <n-button icon="trash" color="#f5222d" @click="removeOrganization(orgIndex)">
                    <span class="material-icons">delete</span>
                  </n-button>
                </div>
                <div class="organization-items">
                  <div v-for="(item, itemIndex) in organization.items" :key="itemIndex" class="selected-item">
                    <span>{{ item.name }}</span>
                    <span>{{ item.description }} - Množství: {{ item.quantity }} {{ item.unit }}</span>
                    <n-button icon="trash" type="error" color="#f5222d" @click="removeItemFromOrganization(orgIndex, itemIndex)">
                      <span class="material-icons">delete</span>
                    </n-button>
                  </div>
                  <div class="available-items-for-org">
                    <div v-for="(item, itemIndex) in filteredAvailableItems" :key="itemIndex" class="item-card">
                      <div class="item-header">
                        <span>{{ item.name }}</span>
                        <span>{{ item.description }} - Množství: {{ item.quantity }} {{ item.unit }}</span>
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
import { ref, watch, computed } from "vue";
import {
  NButton,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
} from "naive-ui";

export default {
  components: {
    CustomModal,
    NButton,
    NFormItem,
    NInput,
    NInputNumber,
    NSelect,
    NSwitch,
  },
  props: {
    showCreateOfferModal: Boolean,
    selectedItems: Array,
    organizationOptions: Array,
    deselectItem: Function,
  },
  emits: ["updateShowCreateOfferModal"],
  setup(props, { emit }) {
    const offerInformations = ref({ title: "", description: "" });
    const offerData = ref({ organizations: [] });
    const availableItems = ref([...props.selectedItems]);
    const initialAvailableItems = ref([...props.selectedItems]); // Keep initial available items intact
    const selectedOrganization = ref(null);

    const filteredAvailableItems = computed(() => {
      const assignedItems = offerData.value.organizations.flatMap(org => org.items);
      return initialAvailableItems.value.filter(item => !assignedItems.includes(item));
    });

    watch(
      () => props.selectedItems,
      (newVal) => {
        availableItems.value = [...newVal];
        initialAvailableItems.value = [...newVal]; // Update initial available items
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
        availableItems.value.splice(itemIndex, 1); // Remove item from availableItems list
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
        availableItems.value.splice(itemIndex, 1); // Remove item from availableItems list
      }
    };

    const removeAvailableItem = (index) => {
      props.deselectItem(availableItems.value[index]);
      availableItems.value.splice(index, 1);
    };

    const distributeItemsEvenly = () => {
      const categorizedItems = {};

      // Categorize items by category and subcategory
      initialAvailableItems.value.forEach(item => {
        if (!categorizedItems[item.category]) {
          categorizedItems[item.category] = {};
        }
        if (!categorizedItems[item.category][item.subcategory]) {
          categorizedItems[item.category][item.subcategory] = [];
        }
        categorizedItems[item.category][item.subcategory].push(item);
      });

      // Clear current items in organizations
      offerData.value.organizations.forEach(org => {
        org.items = [];
      });

      // Distribute items evenly across organizations
      for (const category in categorizedItems) {
        for (const subcategory in categorizedItems[category]) {
          const items = categorizedItems[category][subcategory];
          items.forEach((item, index) => {
            const orgIndex = index % offerData.value.organizations.length;
            if (offerData.value.organizations[orgIndex]) {
              offerData.value.organizations[orgIndex].items.push(item);
            }
          });
        }
      }
    };

    const createOffer = () => {
      console.log("Offer created:", offerData.value);
      emit("updateShowCreateOfferModal", false);
    };

    const closeModal = () => {
      emit("updateShowCreateOfferModal", false);
      availableItems.value = [...initialAvailableItems.value]; // Reset available items to initial list
    };

    return {
      offerInformations,
      offerData,
      availableItems,
      filteredAvailableItems,
      selectedOrganization,
      addOrganization,
      removeOrganization,
      addItemToOrganization,
      removeItemFromOrganization,
      assignItemToOrganization,
      removeAvailableItem,
      distributeItemsEvenly,
      createOffer,
      closeModal,
    };
  },
};
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.available-items {
  width: 30%;
  height: 48vh;
  max-height: 48vh;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
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
  height: 48vh;
  max-height: 48vh;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
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
  border-top: 1px solid #ccc;
  padding-top: 10px;
  margin-top: 10px;
}

.section-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: green;
  color: white;
  font-weight: bold;
  padding: 10px;
  border-radius: 5px;
  margin-top: -10px;
}

.scrollable-content {
  margin-top: 20px;
  padding: 10px;
}

.distribute-button {
  margin: 20px;
  background-color: green;
  color: white;
}
</style>
