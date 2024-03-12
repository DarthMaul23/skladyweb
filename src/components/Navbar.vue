<template>
    <div class="navbar">
      <div class="navbar-brand">
        <n-link to="/" class="navbar-item">
          <!-- Using Naive UI link component -->
          <img src="your-logo.png" alt="Your Logo" width="112" height="28" />
          <!-- Replace "your-logo.png" with your actual logo path -->
        </n-link>
      </div>
  
      <div class="navbar-menu">
        <div class="navbar-start"></div>
  
        <div class="navbar-end">
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">Account</a>
            <div class="navbar-dropdown">
              <n-link to="/profile" class="navbar-item">Profile</n-link>
              <n-link to="/settings" class="navbar-item">Settings</n-link>
              <hr class="navbar-divider" />
              <div class="navbar-item">
                <n-button text @click="Logout">
                  <n-icon><exit-outline /></n-icon>
                  <span>Odhlásit se</span>
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from "vue-router";
  import { store } from "../store/store";
  import { NButton, NIcon } from "naive-ui";
  
  const router = useRouter();
  
  const Logout = () => {
    store.logout();
    router.push("/login");
  };
  </script>
  
  <style scoped>
  .navbar {
    background-color: var(--dark);
    padding: 0.5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: flex; /* Make the navbar fixed */
    top: 0; /* Stick it to the top */
    left: 0;
    width: 100%; /* Ensure it spans the full width */
    z-index: 1000; /* Ensure it stays on top of other content */
  }
  
  .navbar-brand .navbar-item img {
    max-height: 3rem;
  }
  
  .navbar-menu {
    display: flex;
    justify-content: flex-end;
  }
  
  .navbar-item,
  .navbar-link,
  .navbar-item a,
  .navbar-link a {
    color: #ffffff;
    display: flex;
    align-items: center;
  }
  
  .navbar-dropdown {
    background-color: #4a4a4a;
    display: block;
  }
  
  .navbar-item:hover,
  .navbar-link:hover,
  .navbar-item:focus,
  .navbar-link:focus {
    background-color: #3273dc;
    color: #ffffff;
  }
  
  .navbar-divider {
    border-color: #3273dc;
  }
  
  .n-button {
    color: #ffffff;
    background-color: transparent;
    border: none;
  }
  
  .n-button:hover {
    background-color: #3273dc;
  }
  
  </style>
  