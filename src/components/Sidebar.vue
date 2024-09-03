<template>
  <aside :class="{ 'is-expanded': isExpanded }">
    <div class="logo">
      <!--<img :src="logoURL" alt="Vue" />-->
    </div>
    <div v-if="showSuperAdminLinks" class="menu">
      <router-link to="/" class="button">
        <span class="material-icons">warehouse</span>
        <span v-if="isExpanded" class="text">Sklady</span>
      </router-link>
      <router-link to="/notifications" class="button">
        <span class="material-icons">settings</span>
        <span v-if="isExpanded" class="text">Oznámení</span>
      </router-link>
      <router-link to="/offers" class="button">
        <span class="material-icons">inbox</span>
        <span v-if="isExpanded" class="text">Nabídky</span>
      </router-link>
      <router-link to="/orders" class="button">
        <span class="material-icons">inbox</span>
        <span v-if="isExpanded" class="text">Objednávky</span>
      </router-link>
      <router-link to="/categories" class="button">
        <span class="material-icons">settings</span>
        <span v-if="isExpanded" class="text">Kategorie</span>
      </router-link>
      <router-link to="/subcategories" class="button">
        <span class="material-icons">settings</span>
        <span v-if="isExpanded" class="text">Podkategorie</span>
      </router-link>
      <router-link to="/Organizations" class="button">
        <span class="material-icons">house</span>
        <span v-if="isExpanded" class="text">Organizace</span>
      </router-link>
      <router-link to="/users" class="button">
        <span class="material-icons">group</span>
        <span v-if="isExpanded" class="text">Uživatelé</span>
      </router-link>
      <router-link to="/contact" class="button">
        <span class="material-icons">home</span>
        <span v-if="isExpanded" class="text">Dodavatelé</span>
      </router-link>
    </div>
    <div v-if="showAdminLinks" class="menu">
      <router-link to="/" class="button">
        <span class="material-icons">warehouse</span>
        <span v-if="isExpanded" class="text">Sklady</span>
      </router-link>
      <router-link to="/notifications" class="button">
        <span class="material-icons">settings</span>
        <span v-if="isExpanded" class="text">Oznámení</span>
      </router-link>
      <router-link to="/offers" class="button">
        <span class="material-icons">inbox</span>
        <span v-if="isExpanded" class="text">Nabídky</span>
      </router-link>
      <router-link to="/orders" class="button">
        <span class="material-icons">inbox</span>
        <span v-if="isExpanded" class="text">Objednávky</span>
      </router-link>
      <router-link to="/categories" class="button">
        <span class="material-icons">settings</span>
        <span v-if="isExpanded" class="text">Kategorie</span>
      </router-link>
      <router-link to="/subcategories" class="button">
        <span class="material-icons">settings</span>
        <span v-if="isExpanded" class="text">Podkategorie</span>
      </router-link>
      <router-link to="/Organizations" class="button">
        <span class="material-icons">house</span>
        <span v-if="isExpanded" class="text">Organizace</span>
      </router-link>
      <router-link to="/users" class="button">
        <span class="material-icons">group</span>
        <span v-if="isExpanded" class="text">Uživatelé</span>
      </router-link>
    </div>
    <div v-if="showOrgLinks" class="menu">
      <!--
        <router-link to="/" class="button">
        <span class="material-icons">warehouse</span>
        <span v-if="isExpanded" class="text">Sklady</span>
      </router-link>
      -->
      <router-link to="/notifications" class="button">
        <span class="material-icons">settings</span>
        <span v-if="isExpanded" class="text">Oznámení</span>
      </router-link>
      <router-link to="/offersfororganization" class="button">
        <span class="material-icons">inbox</span>
        <span v-if="isExpanded" class="text">Nabídky</span>
      </router-link>
      <router-link to="/organizationOrders" class="button">
        <span class="material-icons">inbox</span>
        <span v-if="isExpanded" class="text">Objednávky</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  isExpanded: Boolean,
});

const userRole = ref(localStorage.getItem('role'));

// Computed properties to determine which menu items to show
const showSuperAdminLinks = computed(() => {
  return userRole.value === 'superadmin';
});

// Computed properties to determine which menu items to show
const showAdminLinks = computed(() => {
  return userRole.value === 'admin';
});

const showOrgLinks = computed(() => {
  // Assume 'organization' role is for organizational users
  return userRole.value === 'adminorganizace';
});
</script>

<style lang="scss" scoped>
aside {
  display: flex;
  flex-direction: column;

  background-color: var(--dark);
  color: var(--light);

  width: calc(2rem + 32px);
  overflow: hidden;
  min-height: calc(100% - 60px);

  transition: 0.2s ease-in-out;

  .flex {
    flex: 1 1 0%;
  }

  .logo {
    margin-bottom: 1rem;

    img {
      width: 2rem;
    }
  }

  .menu-toggle-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;

    position: relative;
    top: 0;
    transition: 0.2s ease-in-out;

    .menu-toggle {
      transition: 0.2s ease-in-out;
      .material-icons {
        font-size: 2rem;
        color: var(--light);
        transition: 0.2s ease-out;
      }

      &:hover {
        .material-icons {
          color: var(--light);
          transform: translateX(0.5rem);
        }
      }
    }
  }

  h3,
  .button .text {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  h3 {
    color: var(--grey);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .menu {
    margin: 0 -1rem;

    .button {
      display: flex;
      align-items: center;
      text-decoration: none;

      transition: 0.2s ease-in-out;
      padding: 0.5rem 2rem;

      .material-icons {
        font-size: 2rem;
        color: var(--light);
        transition: 0.2s ease-in-out;
      }
      .text {
        color: var(--light);
        transition: 0.2s ease-in-out;
      }

      &:hover {
        background-color: var(--dark-alt);

        .material-icons,
        .text {
          color: var(--primary);
        }
      }

      &.router-link-exact-active {
        background-color: var(--dark-alt);
        border-right: 5px solid var(--primary);

        .material-icons,
        .text {
          color: var(--primary);
        }
      }
    }
  }

  .footer {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;

    p {
      font-size: 0.875rem;
      color: var(--grey);
    }
  }

  &.is-expanded {
    width: var(--sidebar-width);

    .menu-toggle-wrap {
      top: -1rem;

      .menu-toggle {
        transform: rotate(-180deg);
      }
    }

    h3,
    .button .text {
      opacity: 1;
    }

    .button {
      .material-icons {
        margin-right: 1rem;
      }
    }

    .footer {
      opacity: 0;
    }
  }

  @media (max-width: 1024px) {
    position: relative;
    z-index: 99;
  }
}
</style>