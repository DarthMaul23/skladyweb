<template>
	<n-message-provider>
	  <div class="app">
		<Navbar @toggle-sidebar="toggleSidebar" v-if="store.user" />
		<div class="content-wrapper">
		  <transition name="slide">
			<Sidebar v-if="store.user && isSidebarExpanded" />
		  </transition>
		  <div class="main-content">
			<router-view />
		  </div>
		</div>
	  </div>
	</n-message-provider>
  </template>  
  <script setup>
  import { ref } from 'vue';
  import { store } from "./store/store";
  import Sidebar from "./components/Sidebar.vue";
  import Navbar from "./components/Navbar.vue";
  import { NMessageProvider } from "naive-ui";
  
  const isSidebarExpanded = ref(true);
  
  const toggleSidebar = () => {
	isSidebarExpanded.value = !isSidebarExpanded.value;
  };
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
  
  .slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}

  .main-content {
	flex: 1;
	overflow-y: auto; /* Only the main content is scrollable */
	padding: 2.5rem;
	padding-top: 4.5rem;
	height: calc(100vh); /* Adjust based on your navbar height */
	width: 100%;
  }
  </style>
  