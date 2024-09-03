<template>
  <div class="notifications-container">
    <h1>Oznámení</h1>
    <n-tabs type="line" animated>
      <n-tab-pane name="OfferCreated" tab="Nabídky - vytvořené">
        <NotificationList type="OfferCreated" />
      </n-tab-pane>
      <n-tab-pane name="OfferComment" tab="Nabídky - komentáře">
        <NotificationList type="OfferComment" />
      </n-tab-pane>
      <n-tab-pane name="OrderCreated" tab="Objednávky - vytvořené">
        <NotificationList type="OrderCreated" />
      </n-tab-pane>
      <n-tab-pane name="OrderComment" tab="Obejndávky - komentáře">
        <NotificationList type="OrderComment" />
      </n-tab-pane>
      <n-tab-pane name="OrderShipped" tab="Obejndávky - expedované">
        <NotificationList type="OrderShipped" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NTabs, NTabPane, useMessage } from 'naive-ui';
import NotificationList from '../components/NotificationList.vue';
import { NotificationsApi } from '../api/openapi/api';
import { getDefaultApiConfig } from '../utils/utils';

const message = useMessage();

onMounted(() => {
  // You can add any initialization logic here if needed
});
</script>

<style scoped>
.notifications-container {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #06732e;
}
</style>