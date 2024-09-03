<template>
    <div class="notification-list">
      <n-list v-if="notifications.length > 0" :bordered="false">
        <n-list-item 
          v-for="notification in notifications" 
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="notification-item"
        >
          <n-thing :title="notification.title" :description="notification.description">
            <template #avatar>
              <n-avatar :style="{ backgroundColor: getColorByType(notification.type) }">
                {{ notification.type.charAt(0) }}
              </n-avatar>
            </template>
            <template #header-extra>
              {{ formatDate(notification.createdAt) }}
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
      <n-empty v-else description="No notifications of this type." />
    </div>
  
    <OfferDetailsModalOrganization
      :show="isOfferModalVisible"
      :offerId="selectedOfferId"
      @update:show="isOfferModalVisible = $event"
    />

    <OrderDetailsModal
      :show="isOrderModalVisible"
      :orderId="selectedOrderId"
      @update:show="isOrderModalVisible = $event"
    />
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch, PropType } from 'vue';
  import { NList, NListItem, NThing, NAvatar, NEmpty, useMessage } from 'naive-ui';
  import { NotificationsApi, Notification } from '../api/openapi/api';
  import { getDefaultApiConfig } from '../utils/utils';
  import OfferDetailsModalOrganization from "../components/OfferDetailsModalOrganization.vue";
  import OrderDetailsModal from "../components/OrderDetailsModal.vue";
  
  const props = defineProps({
    type: {
      type: String as PropType<'OfferCreated' | 'OrderCreated' | 'OfferComment' | 'OrderComment' | 'OrderShipped'>,
      required: true
    }
  });
  
  const notifications = ref<Notification[]>([]);
  const message = useMessage();
  
  const isOfferModalVisible = ref(false);
  const selectedOfferId = ref<string | null>(null);
  const isOrderModalVisible = ref(false);
  const selectedOrderId = ref<string | null>(null);
  
  const fetchNotifications = async () => {
    const notificationApi = new NotificationsApi(getDefaultApiConfig());
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await notificationApi.notificationsGetNotificationsTypeGet(props.type, {
          headers: { Authorization: `Bearer ${token}` },
        });
        notifications.value = response.data || [];
      } catch (error) {
        console.error('Error fetching notifications:', error);
        message.error('Failed to fetch notifications');
      }
    } else {
      message.error('Authentication token not found');
    }
  };
  
  const getColorByType = (type: string) => {
    const colors = {
      OfferCreated: '#1890ff',
      OrderCreated: '#52c41a',
      OfferComment: '#faad14',
      OrderComment: '#722ed1',
      OrderShipped: '#eb2f96'
    };
    return colors[type] || '#1890ff';
  };
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.type.startsWith('Offer')) {
      selectedOfferId.value = notification.subjectId;
      isOfferModalVisible.value = true;
    } else if (notification.type.startsWith('Order')) {
      selectedOrderId.value = notification.subjectId;
      isOrderModalVisible.value = true;
    }
  };
  
  onMounted(fetchNotifications);
  watch(() => props.type, fetchNotifications);
  </script>
  
  <style scoped>
  .notification-list {
    max-height: 600px;
    overflow-y: auto;
  }
  
  .notification-item {
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .notification-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  </style>