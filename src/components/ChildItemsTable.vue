<template>
    <n-data-table :columns="childColumns" :data="childItems" />
  </template>
  
  <script>
  import { NDataTable } from 'naive-ui';
  
  export default {
    components: {
      NDataTable,
    },
    props: {
      childItems: Array,
    },
    setup(props) {
      const childColumns = [
        { title: 'Description', key: 'description' },
        { title: 'Quantity', key: 'quantity' },
        // Add more columns as needed
      ];
  
      return { childColumns };
    },
  };
  </script>