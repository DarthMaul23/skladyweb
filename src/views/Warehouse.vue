<template>
  <main id="warehouse-page">
    <!-- Filter input -->
    <div class="filter-container">
      <n-input
        v-model:value="filters.searchQuery"
        placeholder="Search by Item Name"
        @update:value="filterItems"
        class="filter-input"
      />
    </div>

    <!-- Items Table -->
    <n-data-table
      :columns="columns"
      :data="filteredItems"
      class="items-table"
    />
    <n-modal
      v-model:show="showModal"
      :mask-closable="false"
      preset="dialog"
      title="Item Details"
      :content="selectedItemContent"
      positive-text="Confirm"
      negative-text="Cancel"
      @positive-click="onPositiveClick"
      @negative-click="onNegativeClick"
    />
  </main>
</template>
  
  <script>
import { h, ref, computed, defineComponent } from 'vue';
import { NButton, NTag, useMessage } from 'naive-ui';

const createColumns = (showItemDetails) => {
  return [
    {
      title: "Item",
      key: "name",
    },
    {
      title: "Amount",
      key: "amount",
    },
    {
      title: "Description",
      key: "description",
    },
    {
      title: "Actions",
      key: "action",
      render(row) {
        return h(
          NButton,
          {
            size: "small",
            onClick: () => showItemDetails(row.id),
          },
          { default: () => "Details" }
        );
      },
    },
  ];
};

export default defineComponent({
  setup() {
    const items = ref([
      // Sample data
      {
        id: "uuid-1",
        name: "Item A",
        amount: 100,
        description: "Description of Item A",
      },
      {
        id: "uuid-2",
        name: "Item B",
        amount: 200,
        description: "Description of Item B",
      },
    ]);
    const filters = ref({
      searchQuery: "",
    });
    const showModal = ref(false);
    const selectedItem = ref(null);

    const filteredItems = computed(() => {
      const searchQuery = filters.value.searchQuery.toLowerCase();
      return items.value.filter((item) => {
        const name = item.name ? item.name.toLowerCase() : "";
        return name.includes(searchQuery);
      });
    });

    const selectedItemContent = computed(() => {
      if (!selectedItem.value) return '';
      return `
        <p><strong>Name:</strong> ${selectedItem.value.name}</p>
        <p><strong>Amount:</strong> ${selectedItem.value.amount}</p>
        <p><strong>Description:</strong> ${selectedItem.value.description}</p>
        <!-- Add more details as needed -->
      `;
    });

    const showItemDetails = (itemId) => {
      selectedItem.value = items.value.find((item) => item.id === itemId);
      showModal.value = true;
    };

    const onPositiveClick = () => {
      message.success('Confirmed');
      showModal.value = false;
    };

    const onNegativeClick = () => {
      message.success('Cancelled');
      showModal.value = false;
    };

    const columns = createColumns(showItemDetails);

    return {
      filters,
      filteredItems,
      showModal,
      selectedItem,
      columns,
      selectedItemContent,
      onPositiveClick,
      onNegativeClick,
    };
  },
});
</script>
  
  <style scoped>
#warehouse-page {
  /* Your styles here */
}

.filter-container {
  margin-bottom: 20px;
}

.filter-input {
  max-width: 500px; /* or any other width */
}

.items-table {
  /* Styles for the table */
}
</style>