<template>
  <n-card :bordered="false" size="large" class="user-details-card">
    <n-spin :show="loading">
      <n-space v-if="!loading && selectedUserDetails" vertical :size="24">
        <n-space justify="space-between" align="center">
          <n-space align="center">
            <span class="material-icons person-icon">person</span>
            <div>
              <h2 class="user-name">
                {{ selectedUserDetails.firstName }}
                {{ selectedUserDetails.lastName }}
              </h2>
              <n-tag :bordered="false" type="success" size="small">
                {{ selectedUserDetails.right?.name }}
              </n-tag>
            </div>
          </n-space>
          <n-space>
            <n-button v-if="!editMode" @click="enableEditMode">Upravit</n-button>
            <n-button v-else @click="saveChanges" type="primary">Uložit</n-button>
            <n-button v-if="editMode" @click="cancelEdit">Zrušit úpravy</n-button>
          </n-space>
        </n-space>

        <n-divider />

        <n-form
          v-if="editMode"
          :model="editedUser"
          label-placement="left"
          label-width="auto"
          require-mark-placement="right-hanging"
          :style="{ maxWidth: '640px' }"
        >
        <n-form-item label="E-mail">
            <n-input v-model:value="editedUser.email" />
          </n-form-item>
          <n-form-item label="Heslo">
            <n-input v-model:value="editedUser.password" />
          </n-form-item>
          <n-form-item label="Jméno">
            <n-input v-model:value="editedUser.firstName" />
          </n-form-item>
          <n-form-item label="Příjmení">
            <n-input v-model:value="editedUser.lastName" />
          </n-form-item>
          <n-form-item label="Oprávnění">
            <n-select
              v-model:value="editedUser.right.id"
              :options="rightsOptions"
            />
          </n-form-item>
          <n-form-item label="Organizace">
            <n-select
              v-model:value="editedUser.organization.id"
              :options="organizationsOptions"
            />
          </n-form-item>
        </n-form>

        <n-grid v-else :cols="2" :x-gap="24" :y-gap="24">
          <n-gi>
            <n-space vertical :size="4">
              <span class="label">E-mail</span>
              <span>{{ selectedUserDetails.email }}</span>
            </n-space>
          </n-gi>
          <n-gi>
            <n-space vertical :size="4">
              <span class="label">Heslo</span>
              <span>{{ selectedUserDetails.password }}</span>
            </n-space>
          </n-gi>
          <n-gi>
            <n-space vertical :size="4">
              <span class="label">Organizace</span>
              <span>{{ selectedUserDetails.organization?.name }}</span>
            </n-space>
          </n-gi>
          <n-gi>
            <n-space vertical :size="4">
              <span class="label">Oprávnění</span>
              <span>{{ selectedUserDetails.right?.name }}</span>
            </n-space>
          </n-gi>
        </n-grid>
      </n-space>
      <div v-else-if="!loading && error">
        Error loading user details: {{ error }}
      </div>
    </n-spin>
  </n-card>
</template>

<script setup>
import {
  NCard,
  NSpace,
  NAvatar,
  NTag,
  NDivider,
  NGrid,
  NGi,
  NSpin,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NSelect,
} from "naive-ui";
import { onMounted, ref } from "vue";
import { UserApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  rightsOptions: {
    type: Array,
    required: true,
  },
  organizationsOptions: {
    type: Array,
    required: true,
  },
});

const userApi = new UserApi(getDefaultApiConfig());
const selectedUserDetails = ref(null);
const loading = ref(true);
const error = ref(null);
const editMode = ref(false);
const editedUser = ref({});

const loadUserDetails = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No auth token found");
    }
    const response = await userApi.userGetUserDetailUserIdGet(props.userId, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data && response.data.result) {
      selectedUserDetails.value = response.data.result;
      editedUser.value = {
        ...response.data.result,
        right: { id: response.data.result.right.id },
        organization: { id: response.data.result.organization.id },
      };
    } else {
      throw new Error("Unexpected API response structure");
    }
  } catch (err) {
    console.error("Error fetching user details:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const enableEditMode = () => {
  editMode.value = true;
};

const cancelEdit = () => {
  editMode.value = false;
  editedUser.value = {
    ...selectedUserDetails.value,
    right: { id: selectedUserDetails.value.right.id },
    organization: { id: selectedUserDetails.value.organization.id },
  };
};

const saveChanges = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No auth token found");
    }
    const updatedUser = {
      id: editedUser.value.id,
      email: editedUser.value.email,
      firstName: editedUser.value.firstName,
      lastName: editedUser.value.lastName,
      organization: editedUser.value.organization.id,
      right: editedUser.value.right.id,
      // Only include password if it's being updated
      ...(editedUser.value.password && { password: editedUser.value.password })
    };
    const response = await userApi.userUpdateUserPut(updatedUser, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data && response.data.result) {
      selectedUserDetails.value = response.data.result;
      editedUser.value = {
        ...response.data.result,
        right: { id: response.data.result.right.id },
        organization: { id: response.data.result.organization.id },
      };
      editMode.value = false;
      // message.success('User updated successfully');
      await loadUserDetails();
    } else {
      throw new Error("Unexpected API response structure");
    }
  } catch (err) {
    console.error("Error updating user details:", err);
    error.value = err.message;
    message.error(`Failed to update user: ${err.message}`);
  }
};

onMounted(() => {
  loadUserDetails();
});
</script>

<style scoped>
.user-details-card {
  max-width: 800px;
  margin: 0 auto;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 1.5em;
  font-weight: 600;
}

.label {
  font-size: 0.9em;
  color: #666;
  font-weight: 600;
}

.person-icon {
  font-size: 98px;
  color: #4caf50;
  margin-right: 16px;
}
</style>