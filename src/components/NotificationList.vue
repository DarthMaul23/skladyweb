<template>
    <div class="notification-list">
      <n-list v-if="notifications.length > 0" :bordered="false">
        <n-list-item v-for="notification in notifications" :key="notification.id">
          <n-thing :title="notification.title" :description="notification.description">
            <template #avatar>
              <n-avatar :style="{ backgroundColor: getColorByType(type) }">
                {{ type.charAt(0) }}
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
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch, PropType } from 'vue';
  import { NList, NListItem, NThing, NAvatar, NEmpty, useMessage } from 'naive-ui';
  import { NotificationsApi } from '../api/openapi/api';
  import { getDefaultApiConfig } from '../utils/utils';
  
  const props = defineProps({
    type: {
      type: String as PropType<'OfferCreated' | 'OrderCreated' | 'OfferComment' | 'OrderComment' | 'OrderShipped'>,
      required: true
    }
  });
  
  const notifications = ref<Notification[]>([]);
  const message = useMessage();
  
  const fetchNotifications = async () => {
    const notificationApi = new NotificationsApi(getDefaultApiConfig());
    const token = localStorage.getItem("authToken");
    if (token) {
    try {
      const response = await notificationApi.notificationsGetNotificationsTypeGet(props.type, 
      {
                headers: { Authorization: `Bearer ${token}` },
              });
      notifications.value = response.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to fetch notifications');
    }
    }else{

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
  
  onMounted(fetchNotifications);
  watch(() => props.type, fetchNotifications);
  </script>
  
  <style scoped>
  .notification-list {
    max-height: 600px;
    overflow-y: auto;
  }
  </style>