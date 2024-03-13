<template>
  <div class="navbar">
    <div class="navbar-controls">
      <!-- Toggle Button for Sidebar -->
      <n-button class="navbar-item" text @click="ToggleMenu">
        <span class="material-icons">menu</span>
      </n-button>
      <n-link to="/" class="navbar-logo">
        <img src="assets/logo.png" alt="Your Logo" width="112" height="28" />
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { store } from "../store/store";
import { NButton, NIcon } from "naive-ui";

const router = useRouter();
const is_expanded = ref(localStorage.getItem("is_expanded") === "true");

const emit = defineEmits(["toggle-sidebar"]);

const ToggleMenu = () => {
  is_expanded.value = !is_expanded.value;
  localStorage.setItem("is_expanded", is_expanded.value);
  console.log("Test");
  console.log(localStorage.getItem("is_expanded"));
};

const Logout = () => {
  store.logout();
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
  height: 3rem;
  margin-left: 1rem;
}

.navbar-item {
  color: #ffffff;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.navbar-item:hover {
  color: var(--primary);
  background-color: var(--light);
}
</style>
  