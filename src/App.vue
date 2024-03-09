<template>
  <n-message-provider>
    <div class="app">
      <!-- Sidebar -->
      <Sidebar v-if="store.user" />

      <!-- Content -->
      <router-view />
    </div>
  </n-message-provider>
</template>
  
  <script setup>
import { store } from "./store/store";
import Sidebar from "./components/Sidebar.vue";
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

button {
  cursor: pointer;
  appearance: none;
  border: none;
  outline: none;
  background: none;
}

.app {
  display: flex;

  main {
    flex: 1 1 0;
    padding: 2rem;

    @media (max-width: 1024px) {
      padding-left: 6rem;
    }
  }
}
</style>