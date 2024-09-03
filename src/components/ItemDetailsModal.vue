<template>
  <CustomModal
    :show="show"
    :title="modalTitle"
    :header-bg-color="'green'"
    :modal-width="'800px'"
    :modal-height="'auto'"
    @update:show="handleClose"
  >
    <template #body>
      <div v-if="itemDetail">
        <h3>{{ itemDetail.name }}</h3>
        <p><strong>Popis:</strong> {{ itemDetail.description }}</p>
        <p><strong>Množství:</strong> {{ itemDetail.quantity }} {{ itemDetail.unit }}</p>
        <p v-if="itemDetail.createdOn"><strong>Naskladněno:</strong> {{ formatDate(itemDetail.createdOn) }}</p>
        <p v-if="itemDetail.expirationDate"><strong>Datum spotřeby:</strong> {{ formatDate(itemDetail.expirationDate) }}</p>
      </div>
      <div v-else>
        <p>Načítání...</p>
      </div>
    </template>
    <template #footer>
      <n-button @click="handleClose" class="modal-close-button">Zavřít</n-button>
    </template>
  </CustomModal>
</template>

<script>
import CustomModal from "./CustomModal.vue";
import { ref, watch } from "vue";
import { NButton } from "naive-ui";
import { ItemApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    NButton,
  },
  props: {
    show: Boolean,
    itemId: String,
  },
  emits: ["update:show"],
  setup(props, { emit }) {
    const itemDetail = ref(null);
    const modalTitle = ref("Detail Položky");
    const itemApi = new ItemApi(getDefaultApiConfig());

    const loadItemDetail = async (itemId) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await itemApi.itemGetItemDetailPost(itemId, {
            headers: { Authorization: `Bearer ${token}` },
          });
          itemDetail.value = response.data.result;
        } catch (error) {
          console.error("Failed to load item details:", error);
          itemDetail.value = null;
        }
      }
    };

    const handleClose = () => {
      emit("update:show", false);
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}. ${month}. ${year}`;
    };

    watch(
      () => props.itemId,
      (newItemId) => {
        if (newItemId) {
          loadItemDetail(newItemId);
        }
      },
      { immediate: true }
    );

    return {
      itemDetail,
      modalTitle,
      handleClose,
      formatDate,
    };
  },
};
</script>

<style scoped>
.modal-close-button {
  background-color: red;
  color: white;
}
</style>
