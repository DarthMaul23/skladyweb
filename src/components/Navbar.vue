<template>
  <div class="navbar">
    <div class="navbar-controls">
      <!-- Toggle Button for Sidebar -->
      <n-button class="navbar-item" text @click="toggleMenu">
        <span class="material-icons">menu</span>
      </n-button>
      <n-link to="/" class="navbar-logo">
        <img src="/src/assets/logo_new_1.png" alt="Your Logo" width="90" height="10" />
      </n-link>
    </div>
    <div class="navbar-menu">
      <div class="navbar-item" @click="Logout">
        <span class="material-icons">logout</span>
        <span>Odhlásit se</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from "vue-router";
import { NButton } from "naive-ui";
import { store } from "../store/store";

const router = useRouter();
const emit = defineEmits(["toggle-sidebar"]);

const toggleMenu = () => {
  const currentState = localStorage.getItem("is_expanded") === "true";
  const newState = !currentState;
  localStorage.setItem("is_expanded", newState.toString());
  emit("toggle-sidebar", newState);
};
const Logout = () => {
  store.logout();
  localStorage.removeItem('authToken');
  localStorage.removeItem('role');
  router.push("/login");
};
</script>
  
  <style scoped>
.navbar {
  background-color: var(--dark);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.navbar-controls {
  display: flex;
  align-items: center;
}

.navbar-logo img {
  height: 1rem;
  width: 3rem;
  margin-left: 1rem;
}

.navbar-item {
  color: #f9f9f9;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.navbar-item:hover {
  color: var(--primary);
  background-color: var(--light);
}
</style>
  