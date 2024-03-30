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

    <n-button @click="showAddUserModal">Přidat uživatele</n-button>

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
            <n-form-item label="E-mail">
              <n-input v-model="newUser.email" placeholder="Enter user email" />
            </n-form-item>
            <n-form-item label="Password">
              <n-input
                v-model="newUser.password"
                placeholder="Enter password"
                type="password"
              />
            </n-form-item>
            <n-form-item label="First Name">
              <n-input
                v-model="newUser.firstName"
                placeholder="Enter first name"
              />
            </n-form-item>
            <n-form-item label="Last Name">
              <n-input
                v-model="newUser.lastName"
                placeholder="Enter last name"
              />
            </n-form-item>
            <n-form-item label="Right ID">
              <n-input v-model="newUser.rightId" placeholder="Enter right ID" />
            </n-form-item>
            <n-button type="submit" class="modal-add-button">Vytvořit Uživatele</n-button>
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
        <n-button @click="hideAddUserModal" class="modal-close-button"
          >Zařít</n-button
        >
        <n-button v-if="showAddModal" @click="addUser" class="modal-add-button"
          >Vtyvořit Uživatele</n-button
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
    const selectedUserDetails = ref({});
    const filters = ref({ searchQuery: "" });
    const newUser = ref({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      rightId: "",
    });

    // Function to show modal for adding a new user
    const showAddUserModal = () => {
      isModalVisible.value = true;
      modalTitle.value = "Add New User";
      showAddModal.value = true;
    };

    // Function to hide modal for adding a new user
    const hideAddUserModal = () => {
      isModalVisible.value = false;
      modalTitle.value = "Add New User";
      showAddModal.value = false;
    };

    // Function to add a new user
    const addUser = async () => {
      try {
        await userApi.createUser({ ...newUser.value });
        // Clear form
        newUser.value = {
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          rightId: "",
        };
        isModalVisible.value = false;
        showAddModal.value = false;
        // Optionally, refresh the list of users
      } catch (error) {
        console.error("Failed to add user:", error);
      }
    };


    const loadUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await userApi.userUsersAndUserCreationDataGet({
            headers: { Authorization: `Bearer ${token}` },
          });
          if (
            response.data &&
            response.data.result &&
            Array.isArray(response.data.result.users)
          ) {
            users.value = response.data.result.users; // Use the users array from the response
          } else {
            console.error("Unexpected response format:", response.data);
          }
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
      {
        title: "No",
        key: "no",
        render: (row) => filteredUsers.value.indexOf(row) + 1,
      },
      { title: "E-mail", key: "email" },
      { title: "Jméno", key: "firstName" },
      { title: "Příjmení", key: "lastName" },
      {
        title: "Organizace",
        key: "organizationName",
        render: (row) => row.organization.name,
      },
      {
        title: "Oprávění",
        key: "right",
        render: (row) => row.right.name,
      },
      {
        title: "Detail",
        key: "action",
        render: (row) =>
          h(NButton, { onClick: () => prepareUserDetails(row) }, "Detail"),
      },
    ]);

    return {
      filters,
      users,
      filteredUsers,
      selectedUserDetails,
      isModalVisible,
      showAddUserModal,
      hideAddUserModal,
      modalTitle,
      newUser,
      columns,
    };
  },
};
</script>

<style scoped>
/* Your CSS styles here */
</style>
