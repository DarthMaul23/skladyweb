<template>
	<n-message-provider>
	  <div class="app">
		<!-- Navbar -->
		<Navbar v-if="store.user" />
  
		<!-- Wrapper for Sidebar and Main Content -->
		<div class="content-wrapper">
		  <!-- Sidebar -->
		  <Sidebar v-if="store.user" />
  
		  <!-- Main Content -->
		  <div class="main-content">
			<router-view />
		  </div>
		</div>
	  </div>
	</n-message-provider>
  </template>
  
  <script setup>
  import { store } from "./store/store";
  import Sidebar from "./components/Sidebar.vue";
  import Navbar from "./components/Navbar.vue";
  import { NMessageProvider } from "naive-ui";
  </script>
  
  <style lang="scss">
  :root {
	--primary: #06732e;
	--primary-alt: #bfbfbf;
	--grey: #ffffff;
	--dark: #06732e;
	--dark-alt: #ffffff;
	--light: #f1f5f9;
	--sidebar-width: 200px;
  }
  
  * {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: "Fira sans", sans-serif;
  }
  
  body {
	background: var(--light);
  }
  
  .app {
	display: flex;
	flex-direction: column;
	min-height: 80vh;
  }
  
  .content-wrapper {
	display: flex;
	flex: 1; /* Ensure it fills the available space */
  }
  
  .sidebar {
	width: var(--sidebar-width);
	/* If you want the sidebar to be scrollable on its own, you can add:
	overflow-y: auto;
	*/
  }
  
  .main-content {
	flex: 1;
	overflow-y: auto; /* Only the main content is scrollable */
	padding: 2rem;
	height: calc(100vh -  4.8rem); /* Adjust based on your navbar height */
	width: 100%;
  }
  </style>
  