<template>
  <main id="warehousedetail-page">
    <n-button color="green" @click="backToList">Zpět na seznam skladů</n-button>
    <div class="warehouse-details">
      <h2>Sklad: {{ warehouseDetails.name }}</h2>
      <!-- Here you can insert additional details or management sections for your warehouse -->
    </div>
    <div class="actions">
      <n-button color="green" @click="showAddItemModal = true"
        >+ Naskladnit položku</n-button
      >
      <n-button
        v-if="isSelectedAnyItem"
        color="green"
        @click="openCreateOfferModal()"
        >Vytvořit nabídku</n-button
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
        <n-button @click="showAddItemModal = false" class="close-button"
          >Zavřít</n-button
        >
      </template>
    </CustomModal>
    <!--Modal for creation of new offer-->
    <!-- CustomModal for Offer Creation -->
    <CustomModal
      :show="showCreateOfferModal"
      title="Vytvořit nabídku"
      :header-bg-color="'green'"
      :modal-width="'80%'"
      :modal-height="'80%'"
      @update:show="showCreateOfferModal = $event"
    >
      <template #body>
        <div class="form-group">
          <!-- Organization selection -->
          <n-form-item label="Organizace:" required>
            <n-select
              v-model:value="selectedOrganization"
              :options="organizationOptions"
              placeholder="Vyberte organizaci"
              @update:value="addOrganization"
            />
          </n-form-item>
          <!-- Display selected organizations and their items -->
          <div class="selected-organizations">
            <div
              v-for="(organization, orgIndex) in offerData"
              :key="orgIndex"
              class="organization-card"
            >
              <div class="organization-header">
                <span>{{ organization.organization }}</span>
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
                  <span>{{ item.description }} - Množství:</span>
                  <n-input-number
                    :value="item.quantity"
                    @update:value="
                      (newQuantity) =>
                        updateOfferItemQuantity(
                          orgIndex,
                          itemIndex,
                          newQuantity
                        )
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
        <n-button @click="createOffer()" class="save-button"
          >Vytvořit nabídku</n-button
        >
        <n-button @click="showCreateOfferModal = false" class="close-button"
          >Zavřít</n-button
        >
      </template>
    </CustomModal>
  </main>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, onMounted, h, computed } from "vue";
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
    const showCreateOfferModal = ref(false);
    const newItem = ref({ name: "", description: "", quantity: 0, unit: "kg" });
    const validationErrors = ref({});
    const items = ref([]);
    const expandedRowKeys = ref(["Chleba"]);
    const warehouseDetails = ref({});
    const categoriesOptions = ref([]);
    const selectedItems = ref([]);
    const offerItems = ref([]);
    const offerData = ref([]);

    const organizationOptions = ref([
      { label: "Organization A", value: "orgA" },
      { label: "Organization B", value: "orgB" },
      { label: "Organization C", value: "orgC" },
      { label: "Organization D", value: "orgD" },
      { label: "Organization E", value: "orgE" },
      { label: "Organization F", value: "orgF" },
      { label: "Organization G", value: "orgG" },
    ]); // Add actual organization options

    const selectedOrganizations = ref([]);

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
      {
        title: "Actions",
        key: "action",
        render: (row) => {
          const isSelected = selectedItems.value.some(
            (item) => item.id === row.id
          );
          return h(
            NButton,
            {
              size: "small",
              type: isSelected ? "error" : "success",
              onClick: () => {
                isSelected ? deselectItem(row) : selectItem(row);
              },
            },
            () => (isSelected ? "Zrušit výber" : "Vybrat")
          );
        },
      },
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

    const getQuanitity = (item) => {
      //console.log(item);
      var quantity = item.unit / selectedOrganizations.length;

      return 5; // return the new array to be used elsewhere
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

    const openCreateOfferModal = () => {
      offerItems.value = JSON.parse(JSON.stringify(selectedItems.value)); // Deep copy selected items
      distributeQuantitiesToOfferItems(); // Distribute quantities for the copied items
      showCreateOfferModal.value = true;
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
      //console.log(expandedRowKeys.value);
      findChildItemsByName(row.name);
    };

    const findChildItemsByName = (name) => {
      //console.log(name);
      const item = items.value.find((item) => item.name === name);
      //console.log(item);
      return item ? item.items : [];
    };

    const selectItem = (item) => {
      //selectedItems.value.push(item);
      // Open modal for selecting quantity, for simplicity, let's just prompt
      const quantity = window.prompt(
        `Select quantity for ${item.description}`,
        "1"
      );
      if (quantity) {
        item.selectedQuantity = parseInt(quantity, 10);
        // Add item with selected quantity
        selectedItems.value.push({
          ...item,
          selectedQuantity: item.selectedQuantity,
        });
      }
    };

    const deselectItem = (item) => {
      const index = selectedItems.value.findIndex(
        (selected) => selected.id === item.id
      );
      if (index > -1) {
        selectedItems.value.splice(index, 1);
      }
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

    const addOrganization = (value) => {
      // Add organization to selectedOrganizations...
      const selectedOrg = organizationOptions.value.find(
        (org) => org.value === value
      );
      if (selectedOrg && !selectedOrganizations.value.includes(selectedOrg)) {
        selectedOrganizations.value.push(selectedOrg);
      }
      distributeQuantitiesToOfferItems();
      prepareOfferData();
    };

    const removeItemFromOfferCreation = (orgIndex, itemIndex) => {
      if (
        offerData.value[orgIndex] &&
        offerData.value[orgIndex].items[itemIndex]
      ) {
        // Remove the item from the specific organization's items array
        offerData.value[orgIndex].items.splice(itemIndex, 1);

        // If you want to remove the organization itself when it has no items left, you can do:
        if (offerData.value[orgIndex].items.length === 0) {
          offerData.value.splice(orgIndex, 1);
        }
      }
      //distributeQuantities();
    };

    const removeOrganization = (index) => {
      // Remove organization from selectedOrganizations...
      selectedOrganizations.value.splice(index, 1);
      offerData.value.splice(index, 1);
      redistributeQuantitiesInOfferData();
      distributeQuantitiesToOfferItems();
      prepareOfferData();
    };

    const isSelectedAnyItem = computed(() => {
      return selectedItems.value.length > 0;
    });

    const updateItemQuantity = (item, itemIndex, newQuantity) => {
      // Update the item quantity
      item.quantity = newQuantity;

      // Further actions like redistributing quantities among other items
      // can go here...
      // console.log(item.quantity);

      // Force update if needed due to Vue's reactivity caveats with arrays
      selectedItems.value[itemIndex] = { ...item };

      // Optionally, if you're dealing with quantities across multiple organizations
      distributeQuantities(); // Some function to handle redistribution
    };

    const updateOfferItemQuantity = (orgIndex, itemIndex, newQuantity) => {
      if (
        offerData.value[orgIndex] &&
        offerData.value[orgIndex].items[itemIndex].quantity
      ) {
        offerData.value[orgIndex].items[itemIndex].quantity = newQuantity;
        // Trigger Vue reactivity for nested changes
        offerData.value = [...offerData.value];
      }
      console.log(offerData.value);
    };

    const distributeQuantitiesToOfferItems = () => {
      const totalQuantityPerItem = offerItems.value.map((item) => ({
        ...item,
        quantity: item.selectedQuantity / selectedOrganizations.value.length,
      }));
      offerItems.value = totalQuantityPerItem;
    };

    const distributeQuantities = () => {
      // Loop through each item
      selectedItems.value.forEach((item, itemIndex) => {
        // Total quantity to distribute
        let totalQuantity = item.selectedQuantity;

        // Count organizations that haven't had their quantity manually set for this item
        let orgsToDistribute = selectedOrganizations.value.length;

        // Subtract quantities already set manually and reduce orgsToDistribute accordingly
        selectedOrganizations.value.forEach((org, orgIndex) => {
          if (
            item.manualQuantities &&
            item.manualQuantities[orgIndex] !== undefined
          ) {
            totalQuantity -= item.manualQuantities[orgIndex];
            orgsToDistribute--;
          }
        });

        // New quantity per organization, avoid division by zero
        const quantityPerOrg =
          orgsToDistribute > 0 ? totalQuantity / orgsToDistribute : 0;

        // Assign this equally divided quantity to all organizations for this item
        selectedOrganizations.value.forEach((org, orgIndex) => {
          // If manual quantity for this org and item hasn't been set, distribute evenly
          if (
            !item.manualQuantities ||
            item.manualQuantities[orgIndex] === undefined
          ) {
            // Initialize the item's quantity distribution if it doesn't exist
            if (!item.quantitiesPerOrg) item.quantitiesPerOrg = [];
            item.quantitiesPerOrg[orgIndex] = quantityPerOrg;
          } // If there's a manual quantity, it's already accounted for, so we don't change it here
        });

        // Update the item with new distributed quantities (to trigger reactivity)
        selectedItems.value[itemIndex] = { ...item };
      });

      // Since we potentially modified objects deeply, ensure Vue reacts to changes
      selectedItems.value = [...selectedItems.value];
      //console.log(selectedItems.value);
    };

    const prepareOfferData = () => {
      // Reset offerData if you want to rebuild it from scratch each time this function is called
      // offerData.value = [];

      selectedOrganizations.value.forEach((organization) => {
        // Find if the organization already exists in offerData
        let orgOfferIndex = offerData.value.findIndex(
          (orgOffer) => orgOffer.organization === organization.label
        );

        // If the organization does not exist, create a new one
        if (orgOfferIndex === -1) {
          let orgOffer = {
            organization: organization.label,
            items: [],
          };

          // Loop through each of the selected items to populate new orgOffer
          offerItems.value.forEach((item) => {
            let quantityPerOrg =
              item.selectedQuantity / selectedOrganizations.value.length;
            let itemOffer = {
              id: item.id,
              description: item.description,
              quantity: quantityPerOrg,
            };
            orgOffer.items.push(itemOffer);
          });

          // Add the new organization offer to offerData
          offerData.value.push(orgOffer);
        } else {
          // If the organization already exists, update its items
          let orgOffer = offerData.value[orgOfferIndex];
          orgOffer.items = offerItems.value.map((item) => {
            let quantityPerOrg =
              item.selectedQuantity / selectedOrganizations.value.length;
            return {
              id: item.id,
              description: item.description,
              quantity: quantityPerOrg,
            };
          });
        }
      });
    };

    const redistributeQuantitiesInOfferData = () => {
      // Iterate over each organization in the offerData
      offerData.value.forEach((orgOffer) => {
        // For each organization, iterate over its items
        orgOffer.items.forEach((itemOffer) => {
          // Find the corresponding item from the offerItems
          const correspondingItem = offerItems.value.find(
            (item) => item.id === itemOffer.id
          );

          if (correspondingItem) {
            // Recalculate the quantity per organization based on the updated selectedQuantity
            let quantityPerOrg =
              correspondingItem.selectedQuantity /
              selectedOrganizations.value.length;

            // Update the item's quantity in the orgOffer
            itemOffer.quantity = quantityPerOrg;
          }
        });

        // Remove items that no longer exist in offerItems (if any)
        orgOffer.items = orgOffer.items.filter((itemOffer) =>
          offerItems.value.some((item) => item.id === itemOffer.id)
        );
      });

      // Remove any organizations that no longer have any items
      offerData.value = offerData.value.filter(
        (orgOffer) => orgOffer.items.length > 0
      );

      // Log the updated offerData structure
      console.log(offerData.value);
    };

    const createOffer = () => {
      console.log(offerData.value);
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
      showCreateOfferModal,
      selectedItems,
      organizationOptions,
      selectedOrganizations,
      isSelectedAnyItem,
      offerItems,
      offerData,
      updateItemQuantity,
      selectItem,
      deselectItem,
      getCategoriesOfItems,
      findChildItemsByName,
      addOrganization,
      removeOrganization,
      removeItemFromOfferCreation,
      distributeQuantities,
      getQuanitity,
      rowKey,
      childRowKey,
      addItem,
      openCreateOfferModal,
      distributeQuantitiesToOfferItems,
      closeModal,
      backToList,
      toggleExpand,
      loadWarehouseDetails,
      updateOfferItemQuantity,
      validateForm,
      createOffer,
      prepareOfferData,
    };
  },
};
</script>
<style scoped>
#warehousedetail-page {
  display: flex;
  flex-direction: column;
  max-height: 100vh; /* Prevent it from exceeding the viewport height */
  overflow: auto; /* Allow scrolling within this container if content overflows */
}
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
    70% - 220px
  ); /* Adjust based on your header and action bar height */
  overflow-y: auto;
}

.selected-organizations {
  height: 65vh;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
  background-color: #f8f8f8;
  padding: 10px; /* Optional: adds some padding inside the scrollable area */
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
