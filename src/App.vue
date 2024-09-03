<template>
  <n-message-provider>
    <div class="app-container">
      <template v-if="store.user?.isLoggedIn">
        <Navbar @toggle-sidebar="toggleSidebar" class="navbar" />
        <div class="content-container">
          <Sidebar :is-expanded="isSidebarExpanded" class="sidebar" />
          <main class="main-content" :class="{ 'sidebar-expanded': isSidebarExpanded }">
            <router-view />
          </main>
        </div>
      </template>
      <template v-else>
        <main class="main-content login-content">
          <router-view />
        </main>
      </template>
    </div>
  </n-message-provider>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { NMessageProvider } from "naive-ui";
import Sidebar from "./components/Sidebar.vue";
import Navbar from "./components/Navbar.vue";
import { store } from "./store/store";
import { useRouter } from "vue-router";

const router = useRouter();
const isSidebarExpanded = ref(localStorage.getItem("is_expanded") === "true");

const toggleSidebar = (newState) => {
  isSidebarExpanded.value = newState;
  localStorage.setItem("is_expanded", newState.toString());
};

onMounted(() => {
  const savedState = localStorage.getItem("is_expanded");
  if (savedState !== null) {
    isSidebarExpanded.value = savedState === "true";
  }
});

watch(() => store.user?.isLoggedIn, (newValue) => {
  console.log("Login state changed:", newValue);
  if (!newValue) {
    router.push("/login");
  }
});
</script>
<style lang="scss">
:root {
  --primary: #06732e;
  --primary-alt: #bfbfbf;
  --grey: #ffffff;
  --dark: #06732e;
  --dark-alt: #ffffff;
  --light: #f1f5f9;
  --sidebar-width: 240px;
  --navbar-height: 60px;
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

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--navbar-height);
  z-index: 1000;
}

.content-container {
  display: flex;
  flex: 1;
  padding-top: var(--navbar-height);
}

.sidebar {
  width: calc(2rem + 32px);
  height: calc(100vh - var(--navbar-height));
  position: fixed;
  top: var(--navbar-height);
  left: 0;
  z-index: 999;
  transition: width 0.2s ease-in-out;

  &.is-expanded {
    width: var(--sidebar-width);
  }
}

.main-content {
  flex: 1;
  margin-left: calc(2rem + 32px);
  padding: 2rem;
  transition: margin-left 0.2s ease-in-out;
  overflow-y: auto;
  height: calc(100vh - var(--navbar-height));

  &.sidebar-expanded {
    margin-left: var(--sidebar-width);
  }
}

.login-content {
  margin-left: 0;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    z-index: 999;
  }

  .main-content {
    margin-left: 0;
  }
}
</style>