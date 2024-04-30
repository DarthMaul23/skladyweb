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
    <n-button @click="showAddModal">Nová Kategorie</n-button>
    <CustomTable
      :data="data"
      :columns="columns"
      :pagination="pageSettings"
      :noPages="totalPages"
      @detailClicked="prepareCategoryDetails"
      @pageChanged="loadCategories"
    />
    <custom-modal
      :show="isModalVisible"
      :title="modalTitle"
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'900px'"
      @update:show="handleModalVisibility"
    >
      <template #body>
        <div v-if="showAddCategory">
          <n-form-item label="Kód Kategorie">
            <n-input v-model:value="newCategory.key" placeholder="Zadejte kód kategorie" />
          </n-form-item>
          <n-form-item label="Název Kategorie">
            <n-input v-model:value="newCategory.name" placeholder="Zadejte název kategorie" />
          </n-form-item>
          <n-form-item label="Popis">
            <n-input v-model:value="newCategory.description" placeholder="Zadejte popis kategorie" />
          </n-form-item>
          <n-button @click="addCategory">Vytvořit Kategorii</n-button>
        </div>
        <div v-if="showDetailModal && !showEditModal">
          <div class="detail-view">
            <p>
              <strong>Kód Kategorie:</strong> {{ selectedCategoryDetails.key }}
              <n-button class="edit-button" @click="editCategory">Upravit</n-button>
            </p>
            <p><strong>Název:</strong> {{ selectedCategoryDetails.name }}</p>
            <p><strong>Popis:</strong> {{ selectedCategoryDetails.description }}</p>
          </div>
        </div>
        <div v-if="showEditModal">
          <n-form class="edit-form">
            <n-form-item label="Kód Kategorie">
              <n-input v-model:value="editCategoryDetails.key" />
            </n-form-item>
            <n-form-item label="Název Kategorie">
              <n-input v-model:value="editCategoryDetails.name" />
            </n-form-item>
            <n-form-item label="Popis">
              <n-input v-model:value="editCategoryDetails.description" />
            </n-form-item>
            <div class="form-buttons">
              <n-button class="save-button" @click="saveCategory">Uložit úpravy</n-button>
              <n-button class="cancel-button" @click="cancelEdit">Zrušit úpravy</n-button>
            </div>
          </n-form>
        </div>
      </template>
      <template #footer>
        <n-button @click="hideModal" class="modal-close-button">Zavřít</n-button>
      </template>
    </custom-modal>
  </main>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, computed, onMounted, watch, h } from "vue";
import { NButton, NInput, NSkeleton, NFormItem, NSpace } from "naive-ui";
import CustomTable from '../components/CustomTable.vue';
import { CategoryApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    CustomTable,
    NButton,
    NInput,
    NSkeleton,
    NFormItem,
    NSpace,
  },
  setup() {
    const categoryApi = new CategoryApi(getDefaultApiConfig());
    const data = ref([]);
    const isModalVisible = ref(false);
    const modalTitle = ref("");
    const showAddCategory = ref(false);
    const showDetailModal = ref(false);
    const showEditModal = ref(false);
    const selectedCategoryDetails = ref({});
    const editCategoryDetails = ref({});
    const newCategory = ref({ key: "", name: "", description: "" });
    const filters = ref({ searchQuery: "" });
    const totalPages = ref(0);
    const pageSettings = ref({ Page: 1, NoOfItems: 3 });

    onMounted(loadCategories);

    function showAddModal() {
      isModalVisible.value = true;
      modalTitle.value = "Vytvořit Kategorii";
      showAddCategory.value = true;
      showDetailModal.value = false;
      showEditModal.value = false;
    }

    function hideModal() {
      isModalVisible.value = false;
      modalTitle.value = "";
      showAddCategory.value = false;
      showDetailModal.value = false;
      showEditModal.value = false;
    }

    async function addCategory() {
      try {
        const token = localStorage.getItem("authToken");

        const response = await categoryApi.categoryCreateCategoryPost(newCategory.value, {
        headers: { Authorization: `Bearer ${token}` },
      });
        newCategory.value = { key: "", name: "", description: "" };
        loadCategories();
        hideModal();
      } catch (error) {
        console.error("Failed to add category:", error);
      }
    }

    async function loadCategories() {
      const token = localStorage.getItem("authToken");
      
      const response = await categoryApi.categoryGetCategoriesPost(pageSettings.value, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
      data.value = response.data.result.data;
      totalPages.value = response.data.result.totalPages;
      console.log(data.value);
      console.log(totalPages.value);
    }

    function prepareCategoryDetails(category) {
      selectedCategoryDetails.value = { ...category };
      modalTitle.value = `Detail kategorie: ${category.name}`;
      showDetailModal.value = true;
      showAddCategory.value = false;
      showEditModal.value = false;
      isModalVisible.value = true;
    }

    function editCategory() {
      editCategoryDetails.value = { ...selectedCategoryDetails.value };
      showDetailModal.value = false;
      showEditModal.value = true;
    }

    async function saveCategory() {
      try {
        const token = localStorage.getItem("authToken");
        
        const response = await categoryApi.categoryUpdateCategoryPost(editCategoryDetails.value.id, editCategoryDetails.value, 
        {
        headers: { Authorization: `Bearer ${token}` },
      });
        selectedCategoryDetails.value = { ...editCategoryDetails.value };
        showEditModal.value = false;
        showDetailModal.value = true;
      } catch (error) {
        console.error("Failed to update category:", error);
      }
    }

    function cancelEdit() {
      editCategoryDetails.value = {};
      showEditModal.value = false;
      showDetailModal.value = true;
    }

    function handleModalVisibility(show) {
      if (!show) {
        hideModal();
      }
    }

    const getRowNo = (row) => {
  // Using data instead of filteredCategories since filteredCategories is not defined
  const rowNo = data.value.indexOf(row) + 1 + (pageSettings.value.Page - 1) * pageSettings.value.NoOfItems;
  return rowNo;
}

    const columns = ref([
      {
        title: "No",
        key: "no",
        render: (row) => getRowNo(row),
      },
      { title: "Kategorie", key: "key" },
      { title: "Název", key: "name" },
      { title: "Popis", key: "description" },
      {
        title: "Detail",
        key: "action",
        render: (row) =>
          h(NButton, { onClick: () => prepareCategoryDetails(row) }, "Detail"),
      },
    ]);

    return {
      filters,
      data,
      isModalVisible,
      showAddCategory,
      showDetailModal,
      showEditModal,
      selectedCategoryDetails,
      editCategoryDetails,
      columns,
      showAddModal,
      hideModal,
      loadCategories,
      addCategory,
      prepareCategoryDetails,
      editCategory,
      saveCategory,
      cancelEdit,
      modalTitle,
      newCategory,
      pageSettings,
      totalPages,
    };
  },
};
</script>
<style scoped>
.filter-input {
  margin-bottom: 20px;
}

.detail-view p {
  font-size: 1.2rem;
  margin: 10px 0;
}

.edit-button {
  margin-left: 15px;
  color: white;
  background-color: orange;
  border: none;
}

.edit-form {
  display: flex;
  flex-direction: column;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.save-button {
  background-color: green;
  color: white;
}

.cancel-button {
  background-color: red;
  color: white;
}

.modal-close-button {
  background-color: #f56c6c;
  color: white;
}
</style>
