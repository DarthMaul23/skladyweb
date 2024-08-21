<template>
  <main id="Users-page">
    <div class="filter-container">
      <n-input
        v-model:value="filters.searchQuery"
        placeholder="E-mail, Jméno, Příjmení, Organizace, Oprávnění ..."
        @update:value="filterUsers"
        class="filter-input"
      />
    </div>

    <n-button @click="showAddUserModal">Přidat uživatele</n-button>
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
      :data="filteredUsers"
      :columns="columns"
      :pagination="pageSettings"
      :noPages="totalPages"
      @detailClicked="prepareUserDetails"
      @pageChanged="loadUsers"
    />
    <custom-modal
      :show="isModalVisible"
      :title="modalTitle"
      :header-bg-color="'green'"
      :modal-width="'1200px'"
      :modal-height="'900px'"
      @update:show="isModalVisible = $event"
    >
      <template #body>
        <div v-if="showAddModal">
          <n-form-item label="E-mail">
            <n-input
              v-model:value="newUser.email"
              placeholder="Zadejte e-mail uživatele"
            />
          </n-form-item>
          <n-form-item label="Heslo">
            <n-input
              v-model:value="newUser.password"
              placeholder="Zadejte heslo"
              type="password"
            />
          </n-form-item>
          <n-form-item label="Jméno">
            <n-input
              v-model:value="newUser.firstName"
              placeholder="Zadejte křestní jméno"
            />
          </n-form-item>
          <n-form-item label="Příjmení">
            <n-input
              v-model:value="newUser.lastName"
              placeholder="Zadejte příjmení"
            />
          </n-form-item>
          <n-form-item label="Oprávnění">
            <n-select
              v-model:value="newUser.rightId"
              :options="rightsOptions"
              placeholder="Vyberte oprávnění"
            />
          </n-form-item>
          <n-form-item label="Organizace">
            <n-select
              v-model:value="newUser.organizationId"
              :options="organizationsOptions"
              placeholder="Vyberte organizaci"
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
          <div v-else>
            <n-descriptions bordered>
              <n-descriptions-item label="ID">
                {{ selectedUserDetails.id }}
              </n-descriptions-item>
              <n-descriptions-item label="E-mail">
                {{ selectedUserDetails.email }}
              </n-descriptions-item>
              <n-descriptions-item label="Jméno">
                {{ selectedUserDetails.firstName }}
              </n-descriptions-item>
              <n-descriptions-item label="Příjmení">
                {{ selectedUserDetails.lastName }}
              </n-descriptions-item>
              <n-descriptions-item label="Organizace">
                {{ selectedUserDetails.organization?.name }}
              </n-descriptions-item>
              <n-descriptions-item label="Lokace organizace">
                {{ selectedUserDetails.organization?.location }}
              </n-descriptions-item>
              <n-descriptions-item label="Oprávnění">
                {{ selectedUserDetails.right?.name }}
              </n-descriptions-item>
              <n-descriptions-item label="Klíč oprávnění">
                {{ selectedUserDetails.right?.key }}
              </n-descriptions-item>
            </n-descriptions>
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
  NDescriptions,
  NDescriptionsItem,
} from "naive-ui";
import { UserApi } from "../api/openapi/api";
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
    NDescriptions,
    NDescriptionsItem,
  },
  setup() {
    const userApi = new UserApi(getDefaultApiConfig());
    const data = ref([]);
    const isModalVisible = ref(false);
    const modalTitle = ref("");
    const showAddModal = ref(false);
    const showDetailModal = ref(false);
    const loadingDetails = ref(false);
    const selectedUserDetails = ref({});
    const filters = ref({ searchQuery: "" });
    const newUser = ref({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      rightId: "",
      organizationId: "",
    });
    const totalPages = ref(0);
    const pageSettings = ref({
      Page: 1,
      NoOfItems: 2,
    });

    const rights = ref([]);

    const rightsOptions = computed(() =>
      rights.value.map((right) => ({
        label: right.name,
        value: right.id,
      }))
    );

    const organizations = ref([]);
    const organizationsOptions = computed(() =>
      organizations.value.map((right) => ({
        label: right.name,
        value: right.id,
      }))
    );

    // Function to show modal for adding a new user
    const showAddUserModal = () => {
      isModalVisible.value = true;
      modalTitle.value = "Vytvořit nového uživatele";
      showAddModal.value = true;
    };

    // Function to hide modal for adding a new user
    const hideAddUserModal = () => {
      isModalVisible.value = false;
      modalTitle.value = "";
      showAddModal.value = false;
    };

    // Function to add a new user
    const addUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          console.log(newUser.value);
          await userApi.userCreateNewUserPost(
            { ...newUser.value },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Clear form
          newUser.value = {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            rightId: "",
            organizationId: "",
          };

          loadUsers();

          isModalVisible.value = false;
          showAddModal.value = false;
        }
        // Optionally, refresh the list of users
      } catch (error) {
        console.error("Failed to add user:", error);
      }
    };

    const loadUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await userApi.userUsersAndUserCreationDataPost(
            pageSettings.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (
            response.data &&
            response.data.result &&
            Array.isArray(response.data.result.data.users)
          ) {
            data.value = response.data.result.data;
            totalPages.value = response.data.result.totalPages;
            rights.value = response.data.result.data.rights;
            organizations.value = response.data.result.data.organizations;
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
      return data.value.users;
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

    const prepareUserDetails = async (user) => {
      console.log(user);
      loadingDetails.value = true;
      console.log(loadingDetails.value);
      // Set the selected offer details to be displayed in the modal
      const token = localStorage.getItem("authToken");
      
      const data = await userApi.userIdGet(user.id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(data.data);
      selectedOfferDetails.value = data.data; // Store the selected offer details
      
      // Update the modal title to reflect that this is about viewing offer details
      modalTitle.value = `Detail uživatele: ${user.firstName} ${user.lastName}`;

      // Resetting any states as needed, for example, hiding 'add new offer' form inside the modal
      showDetailModal.value = true;

      // Finally, making the modal visible
      isModalVisible.value = true;
    };

    const getRowNo = (row) => {
      const rowNo =
        filteredUsers.value.indexOf(row) +
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
      { title: "E-mail", key: "email" },
      { title: "Jméno", key: "firstName" },
      { title: "Příjmení", key: "lastName" },
      {
        title: "Organizace",
        key: "organizationName",
        render: (row) => row.organization?.name,
      },
      {
        title: "Oprávění",
        key: "right",
        render: (row) => row.right?.name,
      },
      {
        title: "Detail",
        key: "action",
        render: (row) =>
          h(NButton, { onClick: () => prepareUserDetails(row) }, "Detail"),
      },
    ]);

    watch(
      () => pageSettings.value.Page,
      (newPage, oldPage) => {
        if (newPage !== oldPage) {
          loadUsers();
        }
      }
    );

    return {
      filters,
      data,
      filteredUsers,
      selectedUserDetails,
      isModalVisible,
      showAddModal,
      showDetailModal,
      showAddUserModal,
      prepareUserDetails,
      hideAddUserModal,
      loadUsers,
      addUser,
      totalPages,
      pageSettings,
      rights,
      rightsOptions,
      organizations,
      organizationsOptions,
      modalTitle,
      newUser,
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