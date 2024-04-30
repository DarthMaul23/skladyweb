<template>
  <main id="Users-page">
    <div class="filter-container">
      <n-input
        v-model:value="filters.searchQuery"
        placeholder="Název, Popis"
        @update:value="filterUsers"
        class="filter-input"
      />
    </div>
    <n-button @click="showAddUserModal">Nová Podkategorie</n-button>
    <CustomTable
      :data="filteredSubcategories"
      :columns="columns"
      :pagination="pageSettings"
      :noPages="totalPages"
      @detailClicked="prepareSubcategoryDetails"
      @pageChanged="loadSubcategories"
    />
    <custom-modal
      :show="isModalVisible"
      :title="modalTitle"
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'400px'"
      @update:show="handleModalVisibility"
    >
      <template #body>
        <div v-if="showAddModal">
          <n-form class="subcategory-form">
            <n-form-item label="Kód Podkategorie">
              <n-input
                v-model:value="newSubcategory.key"
                placeholder="Zadejte Kód Podkategorie"
              />
            </n-form-item>
            <n-form-item label="Název Podkategorie">
              <n-input
                v-model:value="newSubcategory.name"
                placeholder="Zadejte Název Podkategorie"
              />
            </n-form-item>
            <n-form-item label="Popis Podkategorie">
              <n-input
                v-model:value="newSubcategory.description"
                placeholder="Zadejte Popis Podkategorie"
              />
            </n-form-item>
            <n-form-item label="Kategorie">
              <n-select
                v-model:value="selectedCategories"
                :options="categoriesOptions"
                placeholder="Vyberte kategorie"
                multiple
              />
            </n-form-item>
          </n-form>
        </div>
        <div v-if="showDetailModal && selectedSubcategoryDetails.id">
          <div class="detail-view">
            <p><strong>ID:</strong> {{ selectedSubcategoryDetails.id }}</p>
            <p>
              <strong>Kód Podkategorie:</strong>
              {{ selectedSubcategoryDetails.key }}
              <n-button class="edit-button" @click="editSubcategory"
                >Upravit</n-button
              >
            </p>
            <p><strong>Název:</strong> {{ selectedSubcategoryDetails.name }}</p>
            <p>
              <strong>Popis:</strong>
              {{ selectedSubcategoryDetails.description }}
            </p>
            <p>
              <strong>Kategorie:</strong>
              {{ selectedSubcategoryDetails.categoryNames /*.join(", ")*/ }}
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <n-button @click="hideAddUserModal" class="modal-close-button"
          >Zavřít</n-button
        >
        <n-button
          v-if="showAddModal"
          @click="addSubcategory"
          class="modal-add-button"
          >Vytvořit Podkategorii</n-button
        >
      </template>
    </custom-modal>
  </main>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, computed, onMounted, h } from "vue";
import { NButton, NInput, NFormItem, NForm, NSelect } from "naive-ui";
import CustomTable from "../components/CustomTable.vue";
import { CategoryApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    CustomTable,
    NButton,
    NInput,
    NFormItem,
    NForm,
    NSelect,
  },
  setup() {
    const categoryApi = new CategoryApi(getDefaultApiConfig());
    const data = ref([]);
    const categories = ref([]);
    const isModalVisible = ref(false);
    const modalTitle = ref("");
    const showAddModal = ref(false);
    const showDetailModal = ref(false);
    const selectedSubcategoryDetails = ref({
      id: '',
      key: '',
      name: '',
      description: '',
      categoryNames: []
    });
    const filters = ref({ searchQuery: "" });
    const newSubcategory = ref({
      categories: [],
      key: "",
      name: "",
      description: "",
    });
    const totalPages = ref(0);
    const pageSettings = ref({ Page: 1, NoOfItems: 10 });
    const categoriesOptions = computed(() =>
      categories.value.map(category => ({
        label: category.name,
        value: category.id
      }))
    );
    const selectedCategories = computed({
      get() {
        return newSubcategory.value.categories;
      },
      set(value) {
        newSubcategory.value.categories = value;
      },
    });

    const showAddUserModal = () => {
      isModalVisible.value = true;
      modalTitle.value = "Vytvořit Podkategorii";
      showAddModal.value = true;
      showDetailModal.value = false;
    };

    const hideAddUserModal = () => {
      isModalVisible.value = false;
      modalTitle.value = "";
      showAddModal.value = false;
      showDetailModal.value = false;
    };

    const addSubcategory = async () => {
      try {
        const token = localStorage.getItem("authToken");

        await categoryApi.categoryCreateSubcategoryPost(newSubcategory.value, {
        headers: { Authorization: `Bearer ${token}` }
      });
        newSubcategory.value = { categories: [], key: "", name: "", description: "" };
        loadSubcategories();
        isModalVisible.value = false;
        showAddModal.value = false;
      } catch (error) {
        console.error("Failed to add subcategory:", error);
      }
    };

    const loadSubcategories = async () => {
      const token = localStorage.getItem("authToken");
      const response = await categoryApi.categoryGetSubcategoriesPost(pageSettings.value, {
        headers: { Authorization: `Bearer ${token}` }
      });
      data.value = response.data.result.data;
      totalPages.value = response.data.result.totalPages;
      loadCategories();
    };

    const loadCategories = async () => {
      const token = localStorage.getItem("authToken");
      const response = await categoryApi.categoryGetCategoriesForSubcategoryCreationPost({
        headers: { Authorization: `Bearer ${token}` },
      });
      categories.value = response.data.result;
    };

    const prepareSubcategoryDetails = async (subcategory) => {
      selectedSubcategoryDetails.value = { ...subcategory };
      modalTitle.value = `Detail podkategorie: ${subcategory.name}`;
      showDetailModal.value = true;
      isModalVisible.value = true;
    };

    const editSubcategory = () => {
      // logic to switch to edit mode
    };

    onMounted(loadSubcategories);

    const filteredSubcategories = computed(() => {
      return data.value.filter(subcategory =>
        subcategory.name.toLowerCase().includes(filters.value.searchQuery.toLowerCase())
      );
    });

    const columns = ref([
      { title: "No", key: "no", render: (row) => filteredSubcategories.value.indexOf(row) + 1 },
      { title: "Podkategorie", key: "key" },
      { title: "Název", key: "name" },
      { title: "Popis", key: "description" },
      { title: "Detail", key: "action", render: (row) => h(NButton, { onClick: () => prepareSubcategoryDetails(row) }, "Detail") },
    ]);

    return {
      filters,
      data,
      categories,
      categoriesOptions,
      selectedCategories,
      filteredSubcategories,
      selectedSubcategoryDetails,
      isModalVisible,
      showAddModal,
      showDetailModal,
      showAddUserModal,
      prepareSubcategoryDetails,
      hideAddUserModal,
      loadSubcategories,
      addSubcategory,
      pageSettings,
      totalPages,
      modalTitle,
      newSubcategory,
      columns,
    };
  },
};
</script>


<style scoped>
/* Apply greenish styles for this component */
.n-input,
.n-select {
  --n-border-color: #4caf50; /* Green border */
  --n-border-focus-color: #67c23a; /* Lighter green for focus */
}

.n-button {
  --n-color: #4caf50; /* Green background */
  --n-text-color: white; /* White text */
  --n-color-hover: #67c23a; /* Lighter green on hover */
}

.n-form-item {
  --n-label-text-color: #4caf50; /* Green labels */
}

.modal-add-button {
  background-color: #4caf50;
  border-color: #4caf50;
}

.modal-close-button {
  background-color: #f56c6c; /* Red for close button */
}
</style>