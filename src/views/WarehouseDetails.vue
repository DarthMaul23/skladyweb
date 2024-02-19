<template>
    <main id="warehousedetail-page">
      <div>
        <n-button @click="goBackToWarehouses" type="primary">Zpět na seznam skladů</n-button>
        <div class="warehouse-details">
          <h1>{{ warehouseDetails.name }}</h1>
          <p>Location: {{ warehouseDetails.location }}</p>
        </div>
        <div class="actions">
          <n-button @click="addItem" type="info">Add New Item</n-button>
        </div>
        <div class="item-list">
          <n-data-table :columns="itemColumns" :data="items">
            <template v-slot:action="{ row }">
              <n-button size="small" @click="showItemDetails(row)">Detail</n-button>
              <n-button size="small" text color="red" @click="deleteItem(row.id)">Delete</n-button>
            </template>
          </n-data-table>
        </div>
      </div>
    </main>
  </template>
  
  <script>
  import { NButton, NDataTable, useMessage } from 'naive-ui';
  import { defineComponent, ref, onMounted, h } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ItemApi } from '../api/openapi/api';
  import { getDefaultApiConfig } from '../utils/utils';
  
  export default defineComponent({
    components: {
      NButton,
      NDataTable,
    },
    setup() {
      const itemApi = new ItemApi(getDefaultApiConfig());
      const route = useRoute();
      const router = useRouter();
      const warehouseDetails = ref({});
      const items = ref([]);
      const message = useMessage();
  
      const itemColumns = [
        { title: 'Name', key: 'name' },
        { title: 'Description', key: 'description' },
        { title: 'Quantity', key: 'quantity' },
        {
          title: 'Actions',
          key: 'action',
          render: (row) => {
            return h('div', [
              h(NButton, { onClick: () => showItemDetails(row), size: 'small', type: 'success' }, 'Detail'),
              h(NButton, { onClick: () => deleteItem(row.id), size: 'small', style: 'margin-left: 8px;', type: 'error' }, 'Delete'),
            ]);
          },
        },
      ];
  
      const loadWarehouseDetails = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const response = await itemApi.itemGetWarehouseItemsPost(route.params.id, {
              headers: { Authorization: `Bearer ${token}` },
            });
            warehouseDetails.value = response.data.result.warehouse;
            items.value = response.data.result.items;
          } catch (error) {
            console.error('Failed to load warehouse details:', error);
            message.error('Failed to load warehouse details');
          }
        } else {
          router.push('/login');
        }
      };
  
      const addItem = () => {
        // Placeholder for adding item logic
        message.info('Add item functionality not implemented yet');
      };
  
      const showItemDetails = (item) => {
        // Placeholder for showing item details
        message.info(`Detail for item ${item.name}`);
      };
  
      const deleteItem = (itemId) => {
        // Placeholder for delete item logic
        message.warning(`Delete item functionality not implemented for item ID: ${itemId}`);
      };
  
      const goBackToWarehouses = () => {
        router.push('/');
      };
  
      onMounted(loadWarehouseDetails);
  
      return { warehouseDetails, items, itemColumns, goBackToWarehouses, addItem, showItemDetails, deleteItem };
    },
  });
  </script>
  
  <style scoped>
  .warehouse-details {
    margin-bottom: 20px;
  }
  .item-list {
    margin-top: 20px;
  }
  .actions {
    margin-bottom: 20px;
  }
  </style>
  