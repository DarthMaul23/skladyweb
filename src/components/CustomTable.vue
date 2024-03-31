<template>
    <div>
      <n-data-table :columns="columns" :data="data" class="users-table">
        <template v-slot:action="{ row }">
          <n-button @click="handleDetailAction(row)">Details</n-button>
        </template>
      </n-data-table>
      <n-pagination
        v-model:page="pagination.page"
        :page-count="noPages"
        @update:page="pageChanged"
      />
    </div>
  </template>
  
  <script>
  import { defineComponent, toRefs } from 'vue';
  import { NDataTable, NPagination, NButton } from 'naive-ui';
  
  export default defineComponent({
    components: {
      NDataTable,
      NPagination,
      NButton,
    },
    props: {
      data: {
        type: Array,
        required: true,
      },
      columns: {
        type: Array,
        required: true,
      },
      pagination: {
        type: Object,
        required: true,
      },
      noPages: {
        type: Number,
        required: true,
      }
    },
    emits: ['detailClicked', 'pageChanged'],
    setup(props, { emit }) {
      const { pagination } = toRefs(props);
  
      const handleDetailAction = (row) => {
        emit('detailClicked', row);
      };
  
      const pageChanged = (newPage) => {
        emit('pageChanged', newPage);
      };
  
      return {
        handleDetailAction,
        pageChanged,
        pagination,
      };
    },
  });
  </script>
  
  <style scoped>
  /* Your styles here */
  </style>
  