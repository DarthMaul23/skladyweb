<template>
  <main id="Users-page">
    <div class="filter-container">
      <n-input
        v-model:value="filters.searchQuery"
        placeholder="Nabídka, popis...."
        @update:value="filterUsers"
        class="filter-input"
      />
    </div>

    <n-button @click="showAddUserModal">Vytvořit nabídku</n-button>

    <n-data-table :columns="columns" :data="filteredUsers" class="users-table">
      <template v-slot:action="{ row }">
        <n-button @click="prepareUserDetails(row)">Details</n-button>
      </template>
    </n-data-table>

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
          <n-form @submit.prevent="addUser">
            <n-form-item label="User Name">
              <n-input v-model="newUser.name" placeholder="Enter User name" />
            </n-form-item>
            <n-form-item label="Address">
              <n-input v-model="newUser.address" placeholder="Enter address" />
            </n-form-item>
            <n-form-item label="Contact Person">
              <n-input
                v-model="newUser.contact"
                placeholder="Enter contact person"
              />
            </n-form-item>
          </n-form>
        </div>
        <div v-if="showDetailModal">
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
        </div>
      </template>
      <template #footer>
        <n-button @click="closeModal" class="modal-close-button"
          >Close</n-button
        >
        <n-button v-if="showAddModal" @click="addUser" class="modal-add-button"
          >Add User</n-button
        >
      </template>
    </custom-modal>
  </main>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, computed, onMounted, h } from "vue";
import { NButton, NInput, NDataTable, NFormItem, NForm } from "naive-ui";
import { UserApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    NButton,
    NInput,
    NDataTable,
    NFormItem,
    NForm,
  },
  setup() {
    const userApi = new UserApi(getDefaultApiConfig());
    const users = ref([]);
    const isModalVisible = ref(false);
    const modalTitle = ref("");
    const showAddModal = ref(false);
    const showDetailModal = ref(false);
    const newUser = ref({ name: "", address: "", contact: "" });
    const selectedUserDetails = ref({});
    const filters = ref({ searchQuery: "" });

    const loadUsers = async () => {
      try {
        const response = await userApi.userUsersAndUserCreationDataGet();
        if (
          response.data &&
          response.data.result &&
          Array.isArray(response.data.result.users)
        ) {
          users.value = response.data.result.users; // Use the users array from the response
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    onMounted(loadUsers);

    const filteredUsers = computed(() => {
      return users.value.filter(
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
      );
    });

    const columns = ref([
      { title: "Email", key: "email" },
      { title: "First Name", key: "firstName" },
      { title: "Last Name", key: "lastName" },
      {
        title: "Organization",
        key: "organizationName",
        render: (row) => row.organization.name,
      },
      {
        title: "Detail",
        key: "action",
        render: (row) =>
          h(NButton, { onClick: () => prepareUserDetails(row) }, "Detail"),
      },
      // Define other columns as needed
    ]);

    return {
      filters,
      users,
      filteredUsers,
      selectedUserDetails,
      isModalVisible,
      modalTitle,
      itemColumns,
      showAddModal,
      showDetailModal,
      newUser,
      showAddUserModal,
      addUser,
      closeModal,
      prepareUserDetails,
      columns,
    };
  },
};
</script>

<style scoped>
/* Your CSS styles here */
</style>
