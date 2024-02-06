<template>
	<main id="banky-page">
	  <!-- Filter input -->
	  <div class="filter-container">
		<n-input
		  v-model:value="filters.searchQuery"
		  placeholder="Vyhledat dle jména banky, adresy nebo kontaktní osoby"
		  @update:value="filterBanks"
		  class="filter-input"
		/>
	  </div>
  
	  <!-- Banks Table -->
	  <n-data-table
		:columns="columns"
		:data="filteredBanks"
		class="banks-table"
	  >
		<!-- Custom rendering for 'Status' column -->
		<template v-slot:status="{ row }">
		  <n-tag :type="row.status ? 'success' : 'error'">
			{{ row.status ? 'Order' : 'No Order' }}
		  </n-tag>
		</template>
  
		<!-- Custom rendering for 'Actions' column -->
		<template v-slot:action="{ row }">
		  <n-button @click="goToBankDetail(row.id)">
			Details
		  </n-button>
		</template>
	  </n-data-table>
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
			title: "Banka",
			key: "name",
		  },
		  {
			title: "Adresa",
			key: "address",
		  },
		  {
			title: "Kontaktní osoba",
			key: "manager",
		  },
		  {
			title: "Status",
			key: "status",
		  },
		  {
			title: "Akce",
			key: "action",
		  },
		],
		banks: [
		  // Sample data
		  {
			id: "uuid-1",
			rowNumber: 1,
			name: "Bank A",
			address: "Address A",
			manager: "Manager A",
			status: 1,
		  },
		  {
			id: "uuid-2",
			rowNumber: 2,
			name: "Bank B",
			address: "Address B",
			manager: "Manager B",
			status: 0,
		  },
		  // ... more banks
		],
	  };
	},
	computed: {
	  filteredBanks() {
		const searchQuery = this.filters.searchQuery.toLowerCase();
		return this.banks.filter((bank) => {
		  // Ensure that bank.name and bank.address are not undefined
		  const name = bank.name ? bank.name.toLowerCase() : '';
		  const address = bank.address ? bank.address.toLowerCase() : '';
		  return name.includes(searchQuery) || address.includes(searchQuery);
		});
	  },
	},
	methods: {
	  filterBanks() {
		// Filtering is handled by the computed property 'filteredBanks'
	  },
	  goToBankDetail(bankId) {
		// Logic to go to bank detail page, for example using Vue Router
		this.$router.push({ name: 'BankDetail', params: { bankId: bankId } });
	  },
	},
  };
  </script>
  <style scoped>
  #banky-page {
	/* Your styles here */
  }
  .filter-container {
	margin-bottom: 20px;
  }
  .filter-input {
	max-width: 500px; /* or any other width */
  }
  .banks-table {
	/* Styles for the table */
  }
  </style>
  