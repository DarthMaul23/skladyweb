<template>
  <main id="categories-page">
    <div class="actions">
      <n-button @click="showAddCategoryModal = true" type="success"
        >Add New Category</n-button
      >
    </div>
    <div class="filter-container">
      <n-input
        v-model:value="filters.searchQuery"
        placeholder="Search by category name"
        @update:value="filterCategories"
        class="filter-input"
      />
    </div>

    <!-- Categories Table -->
    <n-data-table :columns="columns" :data="filteredCategories">
      <template #action="{ row }">
        <v-btn size="small" @click="prepareCategoryDetails(row)"
          >Detail</v-btn>
        <v-btn size="small" text color="red" @click="deleteCategory(row.id)"
          >Delete</v-btn>
      </template>
    </n-data-table>

    <!-- Modal for Adding New Category -->
    <CustomModal
      :show="showAddCategoryModal"
      title="Add New Category"
      @update:show="showAddCategoryModal = false"
      @save="addNewCategory"
    >
      <template #body>
        <!-- Form for adding a new category -->
        <n-form ref="addCategoryForm" :model="newCategoryForm">
          <n-form-item label="Name" required>
            <n-input v-model:value="newCategoryForm.name" />
          </n-form-item>
          <n-form-item label="Description">
            <n-input
              v-model:value="newCategoryForm.description"
              type="textarea"
            />
          </n-form-item>
        </n-form>
      </template>
      <template #footer>
        <n-button @click="addNewCategory" type="primary">Save</n-button>
        <n-button @click="showAddCategoryModal = false" type="error"
          >Close</n-button
        >
      </template>
    </CustomModal>

    <!-- Modal for Category Details -->
    <CustomModal
      :show="showCategoryDetailsModal"
      :title="`Details for ${selectedCategory.name}`"
      @update:show="showCategoryDetailsModal = false"
    >
      <template #body>
        <p><strong>Name:</strong> {{ selectedCategory.name }}</p>
        <p><strong>Description:</strong> {{ selectedCategory.description }}</p>
        <!-- Additional details here -->
      </template>
      <template #footer>
        <n-button @click="showCategoryDetailsModal = false" type="error"
          >Close</n-button
        >
      </template>
    </CustomModal>
  </main>
</template>
  <script>
import { computed, ref } from "vue";
import CustomModal from "../components/CustomModal.vue";

export default {
  components: {
    CustomModal,
  },
  setup() {
    const filters = ref({ searchQuery: "" });
    const categories = ref([
      {
        id: "1",
        name: "Technology",
        creatorId: "1001",
        createdAt: new Date("2021-01-01").toISOString(),
        description: "All about the latest in technology",
      },
      {
        id: "2",
        name: "Sports",
        creatorId: "1002",
        createdAt: new Date("2021-02-01").toISOString(),
        description: "Covering the world of sports and fitness",
      },
      {
        id: "3",
        name: "Food",
        creatorId: "1003",
        createdAt: new Date("2021-03-01").toISOString(),
        description: "Delicious recipes and restaurant reviews",
      },
      {
        id: "4",
        name: "Travel",
        creatorId: "1004",
        createdAt: new Date("2021-04-01").toISOString(),
        description: "Discover new destinations and travel tips",
      },
      {
        id: "5",
        name: "Fashion",
        creatorId: "1005",
        createdAt: new Date("2021-05-01").toISOString(),
        description: "The latest trends and fashion news",
      },
    ]);
    const showAddCategoryModal = ref(false);
    const showCategoryDetailsModal = ref(false);
    const selectedCategory = ref({});
    const newCategoryForm = ref({ name: "", description: "" });

    const columns = [
      { title: "Name", key: "name" },
      { 
        title: 'Actions', 
        key: 'action', 
        render: (row) => {}, // This is optional for customization but necessary if the action slot doesn't work
      },
    ];

    const filteredCategories = computed(() => {
      return categories.value.filter((category) =>
        category.name
          .toLowerCase()
          .includes(filters.value.searchQuery.toLowerCase())
      );
    });

    function prepareCategoryDetails(category) {
      selectedCategory.value = category;
      showCategoryDetailsModal.value = true;
    }

    function addNewCategory() {
      // Implement adding new category logic
      // Push new category to categories array and reset form
      categories.value.push({
        ...newCategoryForm.value,
        id: Date.now().toString(),
      }); // Example
      newCategoryForm.value = { name: "", description: "" };
      showAddCategoryModal.value = false;
    }

    function deleteCategory(id) {
      const index = categories.value.findIndex((c) => c.id === id);
      if (index > -1) categories.value.splice(index, 1);
    }

    return {
      filters,
      filteredCategories,
      showAddCategoryModal,
      showCategoryDetailsModal,
      selectedCategory,
      newCategoryForm,
      columns,
      prepareCategoryDetails,
      addNewCategory,
      deleteCategory,
    };
  },
};
</script>