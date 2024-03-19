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
          <n-space align="center">
            <n-form-item label="Kategorie:" required>
              <n-select
                v-model:value="newItemToBeStored.categoryName"
                :options="categoriesOptions"
                filterable
                tag
                allow-create
                @create="handleCreateCategory"
                placeholder="Vyber nebo vytvoř novou kategorii"
              />
              <div v-if="validationErrors.categoryName" class="error-msg">
                {{ validationErrors.categoryName }}
              </div>
            </n-form-item>
            <n-form-item label="Podkategorie:" required>
              <n-select
                v-model:value="newItemToBeStored.subcategoryName"
                :options="subcategoriesOptions"
                filterable
                tag
                allow-create
                @create="handleCreateSubcategory"
                placeholder="Vyber nebo vytvoř novou kategorii"
              />
              <div v-if="validationErrors.subcategoryName" class="error-msg">
                {{ validationErrors.subcategoryName }}
              </div>
            </n-form-item>
            <n-form-item label="Položka:">
              <n-input
                v-model:value="newItemToBeStored.description"
                placeholder="Popis položky"
              />
              <div v-if="validationErrors.description" class="error-msg">
                {{ validationErrors.description }}
              </div>
            </n-form-item>
          </n-space>
          <n-space align="center">
            <n-form-item label="Množství:" required>
              <n-input-number v-model:value="newItemToBeStored.quantity" min="1" />
              <div v-if="validationErrors.quantity" class="error-msg">
                {{ validationErrors.quantity }}
              </div>
            </n-form-item>
            <n-form-item label="Jednotky:" required>
              <n-select
                v-model:value="newItemToBeStored.unit"
                :options="unitOptions"
                size="small"
              />
            </n-form-item>
          </n-space>
          <n-space align="center">
            <n-form-item label="Možnosti hmotnosti palety:" required>
              <n-select
                v-model:value="newItemToBeStored.paletaOption"
                :options="paletaOptions"
              />
            </n-form-item>

            <n-form-item label="Počet jednotek:" required>
              <n-input-number v-model:value="newItemToBeStored.count" min="1" />
              <div v-if="validationErrors.count" class="error-msg">
                {{ validationErrors.count }}
              </div>
            </n-form-item>
          </n-space>
        </div>
        <div v-if="listOfNewItemsToBeStored.length > 0">
          <h3>Seznam položek k uložení:</h3>
          <ul>
            <li v-for="(item, index) in listOfNewItemsToBeStored" :key="index">
              {{ item.name }} - {{ item.quantity }} {{ item.unit }} ({{
                item.categoryName
              }}
              > {{ item.subcategoryName }})
              <n-button size="small" @click="removeItemFromStorageCreation(index)"
                >Odstranit</n-button
              >
            </li>
          </ul>
        </div>
      </template>
      <template #footer>
        <n-button @click="addToListForStorageCreation" class="add-button"
          >Přidat do seznamu</n-button
        >
        <n-button
          v-if="listOfNewItemsToBeStored.length > 0"
          @click="storeItems"
          class="save-button"
          >Naskladnit vše</n-button
        >
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
          <n-form-item label="Nabídka:">
            <n-input
              v-model:value="offerInformations.title"
              placeholder="Popis položky"
            />
          </n-form-item>

          <n-form-item label="Popis:">
            <n-input
              v-model:value="offerInformations.description"
              placeholder="Popis položky"
            />
          </n-form-item>
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
              v-for="(organization, orgIndex) in offerData.organizations"
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
import { ItemApi, OrganizationApi, OfferApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";
import { watch } from "vue";

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
    const organizationApi = new OrganizationApi(getDefaultApiConfig());
    const offerApi = new OfferApi(getDefaultApiConfig());
    const message = useMessage(); // Correctly initialized
    const showDetails = ref(false);
    const showAddItemModal = ref(false);
    const showCreateOfferModal = ref(false);
    const newItem = ref({
      categoryName: "",
      subcategoryName: "",
      name: "",
      description: "",
      quantity: 1,
      paletaOption: "",
      count: 1,
      units: "kg",
    });

    const newItemToBeStored = ref({
      categoryName: "",
      subcategoryName: "",
      name: "",
      description: "",
      quantity: 1,
      units: "",
    });

    const listOfNewItemsToBeStored = ref([]);

    const validationErrors = ref({});
    const items = ref([]);
    const organizationCategoriesAndSubcategories = ref([]);
    const expandedRowKeys = ref(["Chleba"]);
    const warehouseDetails = ref({});
    const categoriesOptions = ref([]);
    const subcategoriesOptions = ref([]);
    const selectedItems = ref([]);
    const offerItems = ref([]);
    const offerInformations = ref({ title: "", description: "" });
    const offerData = ref({ title: "", description: "", organizations: [] });

    const organizationOptions = ref([]);

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
        maxWidth: 100,
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

    const paletaOptions = [
      {
        label: "Jedné Palety",
        value: "paleta",
      },
      {
        label: "Všech Palet",
        value: "palety",
      },
    ];

    watch(
      () => newItem.value.categoryName,
      (newCategoryId) => {
        if (newCategoryId) {
          const selectedCategory =
            organizationCategoriesAndSubcategories.value.find(
              (cat) => cat.category.id === newCategoryId
            );
          if (selectedCategory && selectedCategory.subcategories) {
            subcategoriesOptions.value = selectedCategory.subcategories.map(
              (sub) => ({
                value: sub.id,
                label: sub.name,
              })
            );
          } else {
            subcategoriesOptions.value = [];
          }
        } else {
          subcategoriesOptions.value = [];
        }
      }
    );

    const handleCreateCategory = (value) => {
      console.log("Creating new item category");
      // Check if the newly entered value already exists in the options
      const existingOption = categoriesOptions.value.find(
        (option) => option.value.toLowerCase() === value.toLowerCase()
      );

      if (existingOption) {
        // If it exists, just set the v-model value to the existing option's value
        newItem.value.categoryName = existingOption.value;
      } else {
        // If it doesn't exist, create a new option and update v-model
        const newOption = { label: value, value };
        categoriesOptions.value.push(newOption);
        newItem.value.categoryName = value; // This sets the select input to use the newly added value
      }

      subcategoriesOptions.value = [];

      console.log(organizationCategoriesAndSubcategories.value);

      /*
      subcategoriesOptions.value = organizationCategoriesAndSubcategories.value.find(
        (items) => items. === value.toLowerCase()
      );
      */
    };

    const handleCreateSubcategory = (value) => {
      console.log("Creating new item subcategory");
      // Check if the newly entered value already exists in the options
      const existingOption = subcategoriesOptions.value.find(
        (option) => option.value.toLowerCase() === value.toLowerCase()
      );

      if (existingOption) {
        // If it exists, just set the v-model value to the existing option's value
        newItem.value.subcategoryName = existingOption.value;
      } else {
        // If it doesn't exist, create a new option and update v-model
        const newOption = { label: value, value };
        subcategoriesOptions.value.push(newOption);
        newItem.value.subcategoryName = value; // This sets the select input to use the newly added value
      }
    };

    const rowKey = (row) => row.name;
    const childRowKey = (child) => child.name;

    onMounted(() => {
      loadWarehouseDetails();
      loadOrganizationCategoriesAndSubcategories();
      loadOrganizations();
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

    const loadOrganizationCategoriesAndSubcategories = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response =
            await itemApi.itemGetOrganizationCategoriesAndSubCategoriesPost({
              headers: { Authorization: `Bearer ${token}` },
            });
          organizationCategoriesAndSubcategories.value = response.data.result;

          // Map the categories for the selection
          categoriesOptions.value = response.data.result.map((cat) => ({
            value: cat.category.id,
            label: cat.category.name,
          }));
        } catch (error) {
          console.error(
            "Failed to load organization categories & subcategories:",
            error
          );
          message.error("Failed to load categories & subcategories");
        }
      } else {
        router.push("/login");
      }
    };

    const loadOrganizations = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await organizationApi.organizationOrganizationsGet({
            headers: { Authorization: `Bearer ${token}` },
          });
          // Map response data to organizationOptions
          organizationOptions.value = response.data.result.map((org) => ({
            label: org.name,
            value: org.id,
          }));
        } catch (error) {
          console.error("Failed to load Organizations:", error);
          message.error("Failed to load Organizations");
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

    const getSubcategoriesOfItems = (items) => {
      subcategoriesOptions.value = items.map((item) => ({
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
      if (
        token &&
        newItem.value.categoryName &&
        newItem.value.subcategoryName &&
        newItem.value.quantity != null
      ) {
        // Ensure mandatory fields are filled
        try {
          console.log(newItem.value);
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

          console.log(newItem.value);

          showAddItemModal.value = false;
          newItem.value = {
            categoryName: "",
            subcategoryName: "",
            name: "",
            description: "",
            quantity: 1,
            paletaOption: "",
            count: 1,
            units: "kg",
          };
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
        `Vyberte množství pro ${item.description}`,
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
        offerData.value.organizations[orgIndex] &&
        offerData.value.organizations[orgIndex].items[itemIndex]
      ) {
        // Remove the item from the specific organization's items array
        offerData.value.organizations[orgIndex].items.splice(itemIndex, 1);

        // If you want to remove the organization itself when it has no items left, you can do:
        if (offerData.value.organizations[orgIndex].items.length === 0) {
          offerData.value.organizations.splice(orgIndex, 1);
        }
      }
      //distributeQuantities();
    };

    const removeOrganization = (index) => {
      // Remove organization from selectedOrganizations...
      selectedOrganizations.value.splice(index, 1);
      offerData.value.organizations.splice(index, 1);
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
        offerData.value.organizations[orgIndex] &&
        offerData.value.organizations[orgIndex].items[itemIndex].quantity
      ) {
        offerData.value.organizations[orgIndex].items[itemIndex].quantity =
          newQuantity;
        // Trigger Vue reactivity for nested changes
        offerData.value.organizations = [...offerData.value.organizations];
      }
      console.log(offerData.value.organizations);
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
        let orgOfferIndex = offerData.value.organizations.findIndex(
          (orgOffer) => orgOffer.organization === organization.label
        );

        // If the organization does not exist, create a new one
        if (orgOfferIndex === -1) {
          let orgOffer = {
            OrganizationId: organization.value,
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
          offerData.value.organizations.push(orgOffer);
        } else {
          // If the organization already exists, update its items
          let orgOffer = offerData.value.organizations[orgOfferIndex];
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
      offerData.value.organizations.forEach((orgOffer) => {
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
      offerData.value.organizations = offerData.value.organizations.filter(
        (orgOffer) => orgOffer.items.length > 0
      );
    };

    const createOffer = async () => {
      const token = localStorage.getItem("authToken");
      if (token && offerData.value.organizations.length > 0) {
        // Ensure mandatory fields are filled
        try {
          offerData.value.title = offerInformations.value.title;
          offerData.value.description = offerInformations.value.description;
          console.log(offerData.value);
          const response = await offerApi.offerPost(offerData.value, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Nabídka byla úspěšně vytvořena");
          loadWarehouseDetails(); // Refresh warehouse details
        } catch (error) {
          console.error("Failed to create offer:", error);
          message.error("Vyskytla se chyba. Nabídku se nepodařilo vytvořit.");
        }
      } else {
        message.warning("Vyplntě prosím všechna pole");
      }
    };

    // Method to add item to the list
    const addToListForStorageCreation = () => {
    // Validate that all necessary fields have been filled out
    if (newItemToBeStored.value.categoryName && newItemToBeStored.value.subcategoryName &&
        newItemToBeStored.value.description && newItemToBeStored.value.quantity > 0 &&
        newItemToBeStored.value.unit) { // Ensure this field is 'unit', not 'units'

        const itemToAdd = {
            categoryName: newItemToBeStored.value.categoryName,
            subcategoryName: newItemToBeStored.value.subcategoryName,
            description: newItemToBeStored.value.description,
            quantity: newItemToBeStored.value.quantity,
            unit: newItemToBeStored.value.unit, // This should match your model
            paletaOption: newItemToBeStored.value.paletaOption,
            count: newItemToBeStored.value.count,
        };

        console.log(itemToAdd.Value);

        listOfNewItemsToBeStored.value.push(itemToAdd);

        // Reset newItemToBeStored after adding
        newItemToBeStored.value = {
            categoryName: "",
            subcategoryName: "",
            description: "",
            quantity: 1,
            unit: "", // This should match your initial state
            paletaOption: "",
            count: 1,
        };
    } else {
        message.warning("Please fill in all the fields.");
    }
};


    // Method to remove item from the list
    const removeItemFromStorageCreation = (index) => {
      listOfNewItemsToBeStored.value.splice(index, 1);
    };

    // Method to store all items in the list
    const storeItems = async () => {
      const token = localStorage.getItem("authToken");
      if (token && listOfNewItemsToBeStored.value.length > 0) {
        // Assuming your API can handle batch storing, or you might need to iterate and store items individually
        try {
          // You need to adjust this according to your API's requirements
          const response = await itemApi.storeMultipleItems(
            listOfNewItemsToBeStored.value,
            { headers: { Authorization: `Bearer ${token}` }}
          );
          message.success("Všechny položky byly úspěšně naskladněny");
          listOfNewItemsToBeStored.value = []; // Clear the list after storing
          showAddItemModal.value = false; // Close the modal
          loadWarehouseDetails(); // Refresh the warehouse details if necessary
        } catch (error) {
          console.error("Failed to store items:", error);
          message.error("Nepodařilo se naskladnit položky.");
        }
      } else {
        router.push("/login");
      }
    };


    return {
      showDetails,
      newItemToBeStored,
      listOfNewItemsToBeStored,
      showAddItemModal,
      newItem,
      validationErrors,
      items,
      expandedRowKeys,
      warehouseDetails,
      itemMasterColumns,
      itemChildColumns,
      unitOptions,
      paletaOptions,
      categoriesOptions,
      subcategoriesOptions,
      showCreateOfferModal,
      selectedItems,
      organizationOptions,
      selectedOrganizations,
      isSelectedAnyItem,
      offerItems,
      offerData,
      offerInformations,
      updateItemQuantity,
      selectItem,
      deselectItem,
      getCategoriesOfItems,
      getSubcategoriesOfItems,
      findChildItemsByName,
      addOrganization,
      removeOrganization,
      removeItemFromOfferCreation,
      distributeQuantities,
      getQuanitity,
      rowKey,
      loadOrganizations,
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
      handleCreateCategory,
      handleCreateSubcategory,
      loadOrganizationCategoriesAndSubcategories,
      organizationCategoriesAndSubcategories,
      addToListForStorageCreation,
      removeItemFromStorageCreation
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
