<template>
  <main id="warehousedetail-page">
    <n-button color="green" @click="backToList">Zpět na seznam skladů</n-button>
    <div class="warehouse-details">
      <h2>Sklad: {{ warehouseDetails.name }}</h2>
    </div>
    <div class="filter-container">
      <n-input placeholder="Hledat položku" v-model="searchQuery" class="filter-input" />
      <n-select
        v-model="selectedCategories"
        :options="categoriesOptions"
        multiple
        placeholder="Vybrat kategorie"
        @change="handleCategoryChange"
      />
      <n-select
        v-model="selectedSubcategories"
        :options="subcategoryOptions"
        multiple
        placeholder="Vybrat podkategorie"
        @change="handleSubcategoryChange"
      />
    </div>
    <div class="actions">
      <n-button color="green" @click="showAddItemModal = true">+ Naskladnit položku</n-button>
      <n-button v-if="isSelectedAnyItem" color="green" @click="openCreateOfferModal">Vytvořit nabídku</n-button>
    </div>
    <div class="scrollable-content">
      <CustomTable
        :data="items"
        :columns="columns"
        :pagination="pageSettings"
        :noPages="totalPages"
        @detailClicked="prepareCategoryDetails"
        @pageChanged="handlePageChange"
      />
    </div>
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
                v-model:value="newItemToBeStored.categoryId"
                :options="categoriesOptions"
                @update:value="(value) => {
                  newItemToBeStored.categoryId = value;
                  newItemToBeStored.subcategoryId = '';
                }"
                filterable
                placeholder="Select a category"
              />
            </n-form-item>
            <n-form-item label="Podkategorie:">
              <n-select
                v-model:value="newItemToBeStored.subcategoryId"
                :options="subcategoriesOptions"
                filterable
                placeholder="Select a subcategory"
              />
              <div v-if="validationErrors.subcategoryName" class="error-msg">
                {{ validationErrors.subcategoryName }}
              </div>
            </n-form-item>
            <n-form-item label="Položka:">
              <n-input v-model:value="newItemToBeStored.description" placeholder="Popis položky" />
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
            <n-form-item label="Výběr jednotek:" required>
              <n-select
                width="200px"
                v-model:value="newItemToBeStored.unit"
                :options="unitOptions"
                size="small"
              />
            </n-form-item>
            <n-form-item label="Možnosti hmotnosti palety:" required>
              <n-select v-model:value="newItemToBeStored.paletaOption" :options="paletaOptions" />
            </n-form-item>
            <n-form-item label="Počet palet:" required>
              <n-input-number v-model:value="newItemToBeStored.count" min="1" />
              <div v-if="validationErrors.count" class="error-msg">
                {{ validationErrors.count }}
              </div>
            </n-form-item>
            <n-button @click="addToListForStorageCreation" class="save-button">Přidat k naskladnění</n-button>
          </n-space>
        </div>
        <div v-if="listOfNewItemsToBeStored.length > 0">
          <h3>Seznam položek k naskladnění ({{ listOfNewItemsToBeStored.length }} položek):</h3>
          <div class="items-container">
            <div v-for="(item, index) in listOfNewItemsToBeStored" :key="index" class="item-card">
              <div class="item-header">
                <h4>{{ item.description }}</h4>
                <n-button size="small" class="remove-button" @click="removeItemFromStorageCreation(index)">
                  <span class="material-icons">delete_outline</span>
                </n-button>
              </div>
              <div class="item-content">
                <p>Množství: {{ item.quantity }} {{ item.unit }}</p>
                <p>Kategorie: {{ item.categoryName }} > {{ item.subcategoryName }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <n-button v-if="listOfNewItemsToBeStored.length > 0" @click="storeItems" class="save-button">
          Naskladnit vše
        </n-button>
        <n-button @click="showAddItemModal = false" class="close-button">Zavřít</n-button>
      </template>
    </CustomModal>
    <OfferCreationModal
      :showCreateOfferModal="showCreateOfferModal"
      :selectedItems="selectedItems"
      :organizationOptions="organizationOptions"
      :deselectItem="deselectItem"
      @updateShowCreateOfferModal="showCreateOfferModal = $event"
    />
  </main>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import OfferCreationModal from "../components/OfferCreationModal.vue";
import { debounce } from "lodash";
import { ref, onMounted, h, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  NButton,
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
import { getDefaultApiConfig } from "../utils/utils";
import CustomTable from "../components/CustomTable.vue";

export default {
  components: {
    OfferCreationModal,
    CustomModal,
    CustomTable,
    NButton,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NSelect,
    NSpace,
  },
  setup() {
    const router = useRouter();
    const route = useRoute(); 
    const itemApi = new ItemApi(getDefaultApiConfig());
    const categoryApi = new CategoryApi(getDefaultApiConfig());
    const organizationApi = new OrganizationApi(getDefaultApiConfig());
    const offerApi = new OfferApi(getDefaultApiConfig());
    const message = useMessage(); 
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
      categoryId: "",
      subcategoryId: "",
      name: "",
      description: "",
      quantity: 1,
      units: "",
    });

    const searchQuery = ref("");
    const selectedCategories = ref([]);
    const selectedSubcategories = ref([]);
    const categoryOptions = ref([]); 
    const subcategoryOptions = ref([]); 

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

    const totalPages = ref(0);

    const pageSettings = ref({
      Page: 1,
      NoOfItems: 30,
    });

    const itemMasterColumns = [
      { title: "Name", key: "name" },
      { title: "Quantity", key: "totalQuantity" },
      {
        title: "Actions",
        key: "action",
        render: (row) => renderExpandButton(row),
      },
    ];

    const columns = [
      {
        title: "No", 
        key: "recordNumber",
        render: (row, index) => {
          return (
            (pageSettings.value.Page - 1) * pageSettings.value.NoOfItems +
            index +
            1
          );
        },
      },
      { title: "Id", key: "name" },
      { title: "Položka", key: "description" },
      { title: "Kategorie", key: "categoryName" },
      { title: "Podkategorie", key: "subcategoryName" },
      { title: "Množství", key: "quantity" },
      { title: "Jednotky", key: "unit" },
      {
        title: "Akce",
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
      () => newItemToBeStored.value.categoryId,
      (newCategoryId) => {
        if (newCategoryId) {
          fetchSubcategoriesById(newCategoryId);
        }
      }
    );

    const rowKey = (row) => row.name;
    const childRowKey = (child) => child.name;

    onMounted(() => {
      loadWarehouseDetails();
      fetchCategories();
      loadOrganizations();
      fetchSubcategories();
    });

    const debouncedLoadWarehouseDetails = debounce(() => {
      loadWarehouseDetails();
    }, 300);

    const loadWarehouseDetails = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        const payload = {
          PageSettings: {
            Page: pageSettings.value.Page,
            NoOfItems: pageSettings.value.NoOfItems,
          },
          ItemSearchSettings: {
            Search: searchQuery.value,
            categories: selectedCategories.value,
            subcategories: selectedSubcategories.value,
          },
        };

        try {
          const response = await itemApi.itemGetWarehouseItemsWarehouseIdPost(
            route.params.id,
            payload,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          warehouseDetails.value = response.data.result.warehouse;
          items.value = response.data.result.items;
          totalPages.value = response.data.result.totalPages;
        } catch (error) {
          console.error("Failed to load warehouse details:", error);
          message.error("Failed to load warehouse details");
        }
      } else {
        router.push("/login");
      }
    };

    const handleCategoryChange = (newValues) => {
      pageSettings.value.Page = 1;
      selectedCategories.value = newValues;
      loadWarehouseDetails();
    };

    const handleSubcategoryChange = (newValues) => {
      pageSettings.value.Page = 1;
      selectedSubcategories.value = newValues;
      loadWarehouseDetails();
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

    const addItem = async () => {
      const token = localStorage.getItem("authToken");
      if (
        token &&
        newItem.value.categoryName &&
        newItem.value.subcategoryName &&
        newItem.value.quantity != null
      ) {
        try {
          const response = await itemApi.itemAddNewItemPost(
            route.params.id,
            newItem.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          message.success("Položka byla úspěšně naskladněna");
          warehouseDetails.value = response.data.result.warehouse;
          items.value = response.data.result.items;

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
          loadWarehouseDetails();
        } catch (error) {
          console.error("Failed to add item:", error);
          message.error("Vyskytla s echyba. Položku se nepodařilo naskaldnit.");
        }
      } else {
        message.warning("Vyplntě prosím všechna pole");
      }
    };

    const openCreateOfferModal = () => {
      showCreateOfferModal.value = true;
    };

    const closeModal = () => {
      showAddItemModal.value = false;
    };

    const backToList = () => {
      router.push("/");
    };

    const toggleExpand = (row) => {
      const key = row.name;
      const index = expandedRowKeys.value.indexOf(key);
      if (index >= 0) {
        expandedRowKeys.value.splice(index, 1);
      } else {
        expandedRowKeys.value.push(key);
      }
      findChildItemsByName(row.name);
    };

    const findChildItemsByName = (name) => {
      const item = items.value.find((item) => item.name === name);
      return item ? item.items : [];
    };

    const selectItem = (item) => {
      selectedItems.value.push({
        ...item,
        selectedQuantity: item.quantity,
      });
    };

    const deselectItem = (item) => {
      const index = selectedItems.value.findIndex(
        (selected) => selected.id === item.id
      );
      if (index > -1) {
        selectedItems.value.splice(index, 1);
      }
    };

    const renderExpandButton = (row) => {
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
        offerData.value.organizations[orgIndex].items.splice(itemIndex, 1);
        if (offerData.value.organizations[orgIndex].items.length === 0) {
          offerData.value.organizations.splice(orgIndex, 1);
        }
      }
    };

    const isSelectedAnyItem = computed(() => {
      return selectedItems.value.length > 0;
    });

    const updateOfferItemQuantity = (orgIndex, itemIndex, newQuantity) => {
      if (
        offerData.value.organizations[orgIndex] &&
        offerData.value.organizations[orgIndex].items[itemIndex].quantity
      ) {
        offerData.value.organizations[orgIndex].items[itemIndex].quantity =
          newQuantity;
        offerData.value.organizations = [...offerData.value.organizations];
      }
    };

    const distributeQuantitiesToOfferItems = () => {
      const totalQuantityPerItem = selectedItems.value.map((item) => ({
        ...item,
        quantity: item.quantity / selectedOrganizations.value.length,
      }));
      offerItems.value = totalQuantityPerItem;
    };

    const prepareOfferData = () => {
      selectedOrganizations.value.forEach((organization) => {
        let orgOfferIndex = offerData.value.organizations.findIndex(
          (orgOffer) => orgOffer.organization === organization.label
        );
        if (orgOfferIndex === -1) {
          let orgOffer = {
            OrganizationId: organization.value,
            organization: organization.label,
            items: [],
          };
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
          offerData.value.organizations.push(orgOffer);
        } else {
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

    const createOffer = async () => {
      const token = localStorage.getItem("authToken");
      if (token && offerData.value.organizations.length > 0) {
        try {
          offerData.value.title = offerInformations.value.title;
          offerData.value.description = offerInformations.value.description;
          const response = await offerApi.offerPost(offerData.value, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Nabídka byla úspěšně vytvořena");
          loadWarehouseDetails();
        } catch (error) {
          console.error("Failed to create offer:", error);
          message.error("Vyskytla se chyba. Nabídku se nepodařilo vytvořit.");
        }
      } else {
        message.warning("Vyplntě prosím všechna pole");
      }
    };

    const addToListForStorageCreation = () => {
      if (
        newItemToBeStored.value.categoryId &&
        newItemToBeStored.value.subcategoryId &&
        newItemToBeStored.value.description &&
        newItemToBeStored.value.quantity > 0 &&
        newItemToBeStored.value.unit &&
        newItemToBeStored.value.count > 0
      ) {
        for (let i = 0; i < newItemToBeStored.value.count; i++) {
          let quantity =
            newItemToBeStored.value.paletaOption == "palety"
              ? newItemToBeStored.value.quantity / newItemToBeStored.value.count
              : newItemToBeStored.value.quantity;

          const itemToAdd = {
            categoryId: newItemToBeStored.value.categoryId,
            subcategoryId: newItemToBeStored.value.subcategoryId,
            description: newItemToBeStored.value.description,
            quantity: quantity,
            unit: newItemToBeStored.value.unit,
            paletaOption: newItemToBeStored.value.paletaOption,
          };

          listOfNewItemsToBeStored.value.push(itemToAdd);
        }
      } else {
        message.warning("Please fill in all the fields.");
      }
    };

    const removeItemFromStorageCreation = (index) => {
      listOfNewItemsToBeStored.value.splice(index, 1);
    };

    const storeItems = async () => {
      const token = localStorage.getItem("authToken");
      if (token && listOfNewItemsToBeStored.value.length > 0) {
        try {
          const response = await itemApi.itemAddNewItemPost(
            route.params.id,
            listOfNewItemsToBeStored.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          message.success("Všechny položky byly úspěšně naskladněny");
          listOfNewItemsToBeStored.value = [];
          showAddItemModal.value = false;
          loadWarehouseDetails();
        } catch (error) {
          console.error("Failed to store items:", error);
          message.error("Nepodařilo se naskladnit položky.");
        }
      } else {
        router.push("/login");
      }
    };

    const fetchCategories = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await categoryApi.categoryGetCategoriesOptionsGet({
            headers: { Authorization: `Bearer ${token}` },
          });
          categoriesOptions.value = response.data.result.map((cat) => ({
            label: cat.name,
            value: cat.id,
          }));
        } catch (error) {
          message.error("Failed to load categories");
          console.error(error);
        }
      }
    };

    const fetchSubcategories = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await categoryApi.categoryGetSubcategoriesOptionsGet(
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          subcategoryOptions.value = response.data.result.map((sub) => ({
            label: sub.name,
            value: sub.id,
          }));
        } catch (error) {
          message.error("Failed to load subcategories");
          console.error(error);
        }
      }
    };

    const fetchSubcategoriesById = async (categoryId) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response =
            await categoryApi.categoryGetSubcategoriesOptionsForCategoryGet(
              categoryId,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          subcategoriesOptions.value = response.data.result.map((sub) => ({
            label: sub.name,
            value: sub.id,
          }));
        } catch (error) {
          message.error("Failed to load subcategories");
          console.error(error);
        }
      }
    };

    const handlePageChange = (newPage) => {
      pageSettings.value.Page = newPage;
      loadWarehouseDetails();
    };

    return {
      pageSettings,
      totalPages,
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
      columns,
      unitOptions,
      paletaOptions,
      categoriesOptions,
      subcategoriesOptions,
      subcategoryOptions,
      searchQuery,
      selectedCategories,
      selectedSubcategories,
      showCreateOfferModal,
      selectedItems,
      organizationOptions,
      selectedOrganizations,
      isSelectedAnyItem,
      offerItems,
      offerData,
      offerInformations,
      debouncedLoadWarehouseDetails,
      selectItem,
      deselectItem,
      handlePageChange,
      findChildItemsByName,
      addOrganization,
      removeItemFromOfferCreation,
      distributeQuantitiesToOfferItems,
      backToList,
      toggleExpand,
      loadWarehouseDetails,
      updateOfferItemQuantity,
      createOffer,
      prepareOfferData,
      handleCategoryChange,
      handleSubcategoryChange,
      loadOrganizationCategoriesAndSubcategories,
      addToListForStorageCreation,
      removeItemFromStorageCreation,
      storeItems,
      openCreateOfferModal,
    };
  },
};
</script>

<style scoped>
#warehousedetail-page {
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow: auto;
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
  max-height: calc(70% - 220px);
  overflow-y: auto;
}

.selected-organizations {
  height: 48vh;
  max-height: 48vh;
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

.items-container {
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;
  margin-bottom: 20px;
}

.item-card {
  background-color: rgb(253, 253, 253);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: green;
  color: white;
  padding: 10px;
}

.item-header h4 {
  margin: 0;
}

.item-content {
  padding: 10px;
}

.item-content h4 {
  margin: 0;
  color: #333;
}

.item-content p {
  margin: 5px 0;
  color: #666;
}

.remove-button {
  background-color: red;
  color: white;
  border: none;
}

.remove-button:hover {
  background-color: rgb(245, 45, 45);
  color: white;
  border: none;
}
.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.filter-input {
  flex: 3 1 300px;
}

.n-select {
  flex: 2 1 200px;
}
</style>
