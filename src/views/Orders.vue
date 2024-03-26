<template>
	<main id="orders-page">
	  <!-- Filter input -->
	  <div class="filter-container">
		<n-input
		  v-model:value="filters.searchQuery"
		  placeholder="Search by Order Name, Address, or Contact Person"
		  @update:value="filterOrders"
		  class="filter-input"
		/>
	  </div>
  
	  <!-- Orders Table -->
	  <n-data-table
		:columns="columns"
		:data="filteredOrders"
		class="orders-table"
	  >
		<!-- Custom rendering for 'Status' column -->
		<template v-slot:status="{ row }">
		  <n-tag :type="row.status ? 'success' : 'error'">
			{{ row.status ? 'Order' : 'No Order' }}
		  </n-tag>
		</template>
  
		<!-- Custom rendering for 'Actions' column -->
		<template v-slot:action="{ row }">
		  <n-button @click="showOrderDetails(row)">
			Details
		  </n-button>
		</template>
	  </n-data-table>
  
	  <!-- Order Details Modal -->
	  <n-dialog v-model:show="showModal" width="600px">
		<template #header>
		  <span>Order Details</span>
		</template>
		<div>
		  <!-- Display order details here -->
		  <p><strong>Order ID:</strong> {{ selectedOrder.id }}</p>
		  <p><strong>Order Name:</strong> {{ selectedOrder.name }}</p>
		  <p><strong>Address:</strong> {{ selectedOrder.address }}</p>
		  <p><strong>Contact Person:</strong> {{ selectedOrder.manager }}</p>
		  <p><strong>Status:</strong> {{ selectedOrder.status ? 'Order' : 'No Order' }}</p>
		</div>
		<template #footer>
		  <n-button @click="showModal = false">Close</n-button>
		</template>
	  </n-dialog>
	</main>
  </template>
  <script>
  export default {
	data() {
	  return {
		filters: {
		  searchQuery: "",
		},
		columns: [
		  {
			title: "No",
			key: "rowNumber",
		  },
		  {
			title: "Order Name",
			key: "name",
		  },
		  {
			title: "Address",
			key: "address",
		  },
		  {
			title: "Contact Person",
			key: "manager",
		  },
		  {
			title: "Status",
			key: "status",
		  },
		  {
			title: "Actions",
			key: "action",
		  },
		],
		orders: [
		  // Sample data
		  {
			id: "uuid-1",
			rowNumber: 1,
			name: "Order A",
			address: "Address A",
			manager: "Manager A",
			status: 1,
		  },
		  {
			id: "uuid-2",
			rowNumber: 2,
			name: "Order B",
			address: "Address B",
			manager: "Manager B",
			status: 0,
		  },
		  // ... more orders
		],
		showModal: false,
		selectedOrder: {},
	  };
	},
	computed: {
	  filteredOrders() {
		const searchQuery = this.filters.searchQuery.toLowerCase();
		return this.orders.filter((order) => {
		  const name = order.name ? order.name.toLowerCase() : '';
		  const address = order.address ? order.address.toLowerCase() : '';
		  return name.includes(searchQuery) || address.includes(searchQuery);
		});
	  },
	},
	methods: {
	  filterOrders() {
		// Filtering is handled by the computed property 'filteredOrders'
	  },
	  showOrderDetails(order) {
		this.selectedOrder = order;
		this.showModal = true;
	  },
	},
  };
  </script>
  
  <style scoped>
  #orders-page {
	/* Your styles here */
  }
  .filter-container {
	margin-bottom: 20px;
  }
  .filter-input {
	max-width: 500px; /* or any other width */
  }
  .orders-table {
	/* Styles for the table */
  }
  </style>
  