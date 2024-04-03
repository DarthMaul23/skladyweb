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
    <!--
    <n-data-table :columns="columns" :data="filteredUsers" class="users-table">
      <template v-slot:action="{ row }">
        <n-button @click="prepareUserDetails(row)">Details</n-button>
      </template>
    </n-data-table>
    <n-pagination
      v-model:page="pageSettings.Page"
      :page-count="data.totalPages"
    />
    -->
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
      @update:show="isModalVisible = $event"
    >
      <template #body>
        <div v-if="showAddModal">
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
        </div>
        <div v-if="showDetailModal">
          <n-space v-if="loadingDetails" vertical>
            <n-skeleton height="40px" width="33%" />
            <n-skeleton height="40px" width="66%" :sharp="false" />
            <n-skeleton height="40px" round />
            <n-skeleton height="40px" circle />
          </n-space>
          <!--
            <p><strong>ID:</strong> {{ selectedUserDetails.UserGroup.id }}</p>
          <p><strong>Title:</strong> {{ selectedUserDetails.title }}</p>
          <p>
            <strong>Description:</strong> {{ selectedUserDetails.description }}
          </p>
          <p>
            <strong>Date Created:</strong>
            {{ selectedUserDetails.UserGroup.dateCreated }}
          </p>
          <p>
            <strong>User ID:</strong>
            {{ selectedUserDetails.UserGroup.userId }}
          </p>
          <div v-for="organizations in selectedUserDetails.Users">
            {{ organizations.organization.name }}
            <n-data-table
              :columns="itemColumns"
              :data="organizations.items"
              class="item-table"
            ></n-data-table>
          </div>
          -->
        </div>
      </template>
      <template #footer>
        <n-button @click="hideAddUserModal" class="modal-close-button"
          >Zařít</n-button
        >
        <n-button
          v-if="showAddModal"
          @click="addSubcategory"
          class="modal-add-button"
          >Vtyvořit Podkategorii</n-button
        >
      </template>
    </custom-modal>
  </main>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, computed, onMounted, h, watch } from "vue";
import {
  NButton,
  NInput,
  NDataTable,
  NFormItem,
  NForm,
  NSelect,
  NSpace,
  NSkeleton,
  NPagination,
} from "naive-ui";
import { CategoryApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";
import CustomTable from "../components/CustomTable.vue";

export default {
  components: {
    CustomModal,
    CustomTable,
    NButton,
    NInput,
    NDataTable,
    NFormItem,
    NForm,
    NSelect,
    NSpace,
    NSkeleton,
    NPagination,
  },
  setup() {
    const categoryApi = new CategoryApi(getDefaultApiConfig());
    const data = ref([]);
    const categories = ref([]);
    const isModalVisible = ref(false);
    const modalTitle = ref("");
    const showAddModal = ref(false);
    const showDetailModal = ref(false);
    const loadingDetails = ref(false);
    const selectedUserDetails = ref({});
    const filters = ref({ searchQuery: "" });
    const newSubcategory = ref({
      categories: [],
      key: "",
      name: "",
      description: "",
    });

    const totalPages = ref(0);

    const pageSettings = ref({
      Page: 1,
      NoOfItems: 10,
    });

    const categoriesOptions = computed(() =>
      categories.value.map((right) => ({
        label: right.name,
        value: right.id,
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

    // Function to show modal for adding a new user
    const showAddUserModal = () => {
      isModalVisible.value = true;
      modalTitle.value = "Vytvořit Kategorii";
      showAddModal.value = true;
    };

    // Function to hide modal for adding a new user
    const hideAddUserModal = () => {
      isModalVisible.value = false;
      modalTitle.value = "";
      showAddModal.value = false;
    };

    // Function to add a new user
    const addSubcategory = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          console.log(newSubcategory.value);
          await categoryApi.categoryCreateSubcategoryPost(
            { ...newSubcategory.value },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Clear form
          newSubcategory.value = {
            key: "",
            name: "",
            description: "",
          };

          loadSubcategories();

          isModalVisible.value = false;
          showAddModal.value = false;
        }
        // Optionally, refresh the list of users
      } catch (error) {
        console.error("Failed to add category:", error);
      }
    };

    const loadSubcategories = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await categoryApi.categoryGetSubcategoriesPost(
            pageSettings.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (
            response.data &&
            response.data.result &&
            Array.isArray(response.data.result.data)
          ) {
            data.value = response.data.result.data;
            console.log(data.value);
            totalPages.value = response.data.result.totalPages;

            loadCategories();
          } else {
            console.error("Unexpected response format:", response.data);
          }
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    const loadCategories = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response =
            await categoryApi.categoryGetCategoriesForSubcategoryCreationPost({
              headers: { Authorization: `Bearer ${token}` },
            });
          if (
            response.data &&
            response.data.result &&
            Array.isArray(response.data.result)
          ) {
            categories.value = response.data.result;
            console.log(categories.value);
          } else {
            console.error("Unexpected response format:", response.data);
          }
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    onMounted(loadSubcategories);

    const filteredSubcategories = computed(() => {
      return data.value;
      /*.value.filter(
        (user) =>
          user.email
            .toLowerCase()
            .includes(filters.value.searchQuery.toLowerCase()) ||
          user.firstName
            .toLowerCase()
            .includes(filters.value.searchQuery.toLowerCase()) ||
          user.lastName
            .toLowerCase()
            .includes(filters.value.searchQuery.toLowerCase()) ||
          (user.organization &&
            user.organization.name
              .toLowerCase()
              .includes(filters.value.searchQuery.toLowerCase()))
      );*/
    });

    const prepareSubcategoryDetails = async (user) => {
      console.log(user);
      loadingDetails.value = true;
      console.log(loadingDetails.value);
      // Set the selected offer details to be displayed in the modal
      const token = localStorage.getItem("authToken");
      /*
      const data = await offerApi.offerIdGet(offer.id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(data.data);
      selectedOfferDetails.value = data.data; // Store the selected offer details
      */
      // Update the modal title to reflect that this is about viewing offer details
      modalTitle.value = `Detail uživatele: ${user.firstName} ${user.lastName}`;

      // Resetting any states as needed, for example, hiding 'add new offer' form inside the modal
      showDetailModal.value = true;

      // Finally, making the modal visible
      isModalVisible.value = true;
    };

    const getRowNo = (row) => {
      const rowNo =
        filteredSubcategories.value.indexOf(row) +
        1 +
        (pageSettings.value.Page - 1) * pageSettings.value.NoOfItems;
      console.log(rowNo.value);
      return rowNo.value;
    };

    const columns = ref([
      {
        title: "No",
        key: "no",
        render: (row) => getRowNo(row),
      },
      { title: "Podkategorie", key: "key" },
      { title: "Název", key: "name" },
      { title: "Popis", key: "description" },
      {
        title: "Detail",
        key: "action",
        render: (row) =>
          h(
            NButton,
            { onClick: () => prepareSubcategoryDetails(row) },
            "Detail"
          ),
      },
    ]);

    watch(
      () => pageSettings.value.Page,
      (newPage, oldPage) => {
        if (newPage !== oldPage) {
          loadSubcategories();
        }
      }
    );

    return {
      filters,
      data,
      categories,
      categoriesOptions,
      selectedCategories,
      filteredSubcategories,
      selectedUserDetails,
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