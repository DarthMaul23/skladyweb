<template>
  <CustomModal
    :show="show"
    :title="modalTitle"
    :header-bg-color="'green'"
    :modal-width="'1200px'"
    :modal-height="'auto'"
    @update:show="handleClose"
  >
    <template #body>
      <div v-if="orderDetail">
        <!-- Order Details Section -->
        <div class="offer-details">
          <p class="detail-item">
            <strong>Organizace:</strong>
            <span class="chip">{{ orderDetail.organizationName }}</span>
          </p>
          <p class="detail-item">
            <strong>Objednávka vytvořena:</strong>
            <span class="chip">{{ formatDate(orderDetail.createdOn) }}</span>
          </p>
        </div>

        <!-- Order Status Section -->
        <div class="order-status">
          <p class="status-title"><strong>Status:</strong></p>
          <div class="status-timeline">
            <div
              v-for="(stage, index) in stages"
              :key="index"
              :class="['stage', getStageClass(index)]"
            >
              <div class="bubble">
                <span class="material-icons">{{ stage.icon }}</span>
              </div>
              <p class="stage-title">{{ stage.title }}</p>
              <div v-if="index < stages.length - 1" class="line-container">
                <div class="line"></div>
              </div>
            </div>
          </div>
          <div v-if="currentStage === 1" class="expedovat-button">
            <n-button type="warning" @click="expedovatObjednavku">
              <span class="material-icons">local_shipping</span> Expedovat objednávku
            </n-button>
          </div>
          <div v-if="currentStage === 2" class="reset-button">
            <n-button type="error" @click="resetovatObjednavku">
              <span class="material-icons">local_shipping</span> Resetovat objednávku
                <i class="material-icons cancel-icon">cancel</i>
            </n-button>
          </div>
        </div>

        <!-- Tabs Section -->
        <n-tabs v-model:value="activeTab">
          <n-tab-pane name="items" tab="Položky">
            <div class="items-table-container">
              <n-data-table
                :columns="itemColumns"
                :data="orderDetail.items"
                bordered
                :scroll-x="600"
              />
            </div>
          </n-tab-pane>
          <n-tab-pane name="comments" tab="Komentáře">
            <div class="comments-section">
              <div
                v-for="(comment, index) in comments"
                :key="index"
                class="comment-item"
              >
                <h3>{{ comment.author }}</h3>
                <p>{{ comment.comment }}</p>
                <p>{{ formatDate(comment.createDate) }}</p>
              </div>
              <n-input
                v-model:value="newComment"
                type="textarea"
                placeholder="Přidat komentář..."
                rows="4"
              />
              <n-button @click="addComment" class="save-button"
                >Přidat komentář</n-button
              >
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </template>
    <template #footer>
      <n-button @click="handleClose" class="modal-close-button">Zavřít</n-button>
    </template>
  </CustomModal>
</template>

<script>
import CustomModal from "../components/CustomModal.vue";
import { ref, watch } from "vue";
import {
  NButton,
  NDataTable,
  NTabs,
  NTabPane,
  NInput,
} from "naive-ui";
import { OrderApi } from "../api/openapi/api";
import { getDefaultApiConfig } from "../utils/utils";

export default {
  components: {
    CustomModal,
    NButton,
    NDataTable,
    NTabs,
    NTabPane,
    NInput,
  },
  props: {
    show: Boolean,
    orderId: String,
  },
  emits: ["update:show"],
  setup(props, { emit }) {
    const orderApi = new OrderApi(getDefaultApiConfig());
    const orderDetail = ref({});
    const modalTitle = ref("");
    const currentStage = ref(1); // Default to the first stage, adjust as necessary

    const stages = ref([
      { title: "Nabídka vytvořena", icon: "assignment" },
      { title: "Objednávka vytvořena", icon: "shopping_cart" },
      { title: "Objednávka expedována", icon: "local_shipping" },
    ]);

    const activeTab = ref("items");
    const comments = ref([]);
    const newComment = ref("");

    const loadOrderDetail = async (orderId) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await orderApi.orderIdGet(orderId, {
            headers: { Authorization: `Bearer ${token}` },
          });
          orderDetail.value = response.data;
          modalTitle.value = `Detail objednávky: ${response.data.key}`;
          //currentStage.value = response.data.stage; // Assuming `stage` is part of the response data
        } catch (error) {
          console.error("Failed to load order details:", error);
          orderDetail.value = undefined;
        }
      }
    };

    const expedovatObjednavku = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          // Update the order stage in the backend
          /*
          await orderApi.updateOrderStage(orderDetail.value.id, 2, {
            headers: { Authorization: `Bearer ${token}` },
          });
          */
          // Update the current stage in the frontend
          currentStage.value = 2;
        } catch (error) {
          console.error("Failed to update order stage:", error);
        }
      }
    };

    const resetovatObjednavku = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          // Update the order stage in the backend
          /*
          await orderApi.updateOrderStage(orderDetail.value.id, 2, {
            headers: { Authorization: `Bearer ${token}` },
          });
          */
          // Update the current stage in the frontend
          currentStage.value = 1;
        } catch (error) {
          console.error("Failed to update order stage:", error);
        }
      }
    };


    const addComment = () => {
      if (newComment.value.trim() !== "") {
        comments.value.push({
          createDate: Date.now(),
          author: "User1",
          comment: newComment.value.trim(),
        });
        newComment.value = "";
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

    const getStageClass = (index) => {
      if (index <= currentStage.value) {
        return "completed";
      }
      return "upcoming";
    };

    watch(
      () => props.orderId,
      (newOrderId) => {
        if (newOrderId) {
          loadOrderDetail(newOrderId);
        }
      },
      { immediate: true }
    );

    return {
      orderDetail,
      modalTitle,
      formatDate,
      handleClose,
      stages,
      currentStage,
      activeTab,
      newComment,
      comments,
      addComment,
      getStageClass,
      expedovatObjednavku,
      resetovatObjednavku,
      itemColumns: [
        { title: "Název položky", key: "itemName" },
        { title: "Popis", key: "itemDescription" },
        { title: "Množství", key: "quantity" },
        { title: "Jednotka", key: "unitType" },
      ],
    };
  },
};
</script>

<style scoped>
.modal-body {
  padding: 20px;
}

.offer-details {
  background-color: #f0fdf4;
  border-left: 5px solid #4caf50;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.detail-item {
  margin-bottom: 12px;
  color: #333;
  line-height: 1.6;
}

.detail-item strong {
  color: green;
}

.modal-split-container {
  display: flex;
  justify-content: space-between;
}

.timeline-container {
  flex: 1;
  margin-right: 20px;
}

.items-table-container {
  flex: 2;
  overflow-x: auto;
}

.comments-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-item {
  background-color: #e8f5e9;
  padding: 10px;
  border-radius: 8px;
}

.modal-close-button {
  background-color: red;
  color: white;
}

.chip {
  display: inline-block;
  padding: 4px 18px;
  background-color: green;
  color: white;
  border-radius: 16px;
  font-size: 14px;
  font-weight: bold;
  margin: 0 5px;
}

.status-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.status-timeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.bubble {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.line-container {
  width: 100px;
  height: 2px;
  position: absolute;
  top: 50%;
  left: 30px;
  z-index: -1;
}

.line {
  width: 100%;
  height: 2px;
  background-color: gray;
}

.stage.completed .bubble {
  background-color: green;
}

.stage.upcoming .bubble {
  background-color: gray;
}

.stage-title {
  margin-top: 10px;
}

.expedovat-button {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.reset-button {
  display: flex;
  justify-content: right;
  margin-top: 20px;
}
</style>
