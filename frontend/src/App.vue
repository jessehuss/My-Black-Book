<script setup>
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "./stores/auth";
import './assets/main.css'

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const mobileMenuOpen = ref(false);

const isAuthenticated = computed(() => !!auth.token);

// Watch for route changes to close the mobile menu
watch(() => route.path, () => {
  mobileMenuOpen.value = false;
});

const handleLogout = async () => {
  await auth.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Only show nav when authenticated -->
    <nav v-if="isAuthenticated" class="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl sm:text-2xl font-bold text-blue-600">BetTrack</h1>
            </div>
            <!-- Desktop Navigation -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link 
                to="/" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2" 
                :class="[$route.path === '/' ? 'border-blue-500' : 'border-transparent hover:border-gray-300']"
              >
                Home
              </router-link>
              <router-link 
                to="/profile" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2" 
                :class="[$route.path === '/profile' ? 'border-blue-500' : 'border-transparent hover:border-gray-300']"
              >
                Profile
              </router-link>
              <router-link 
                to="/friends" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2" 
                :class="[$route.path === '/friends' ? 'border-blue-500' : 'border-transparent hover:border-gray-300']"
              >
                Friends
              </router-link>
            </div>
          </div>
          
          <!-- Mobile Navigation -->
          <div class="sm:hidden flex items-center">
            <button 
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span class="sr-only">Open main menu</span>
              <!-- Hamburger icon -->
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="hidden sm:flex items-center">
            <button 
              @click="handleLogout" 
              class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <router-link 
            to="/" 
            class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            :class="[$route.path === '/' ? 'border-l-4 border-blue-500 bg-blue-50' : '']"
          >
            Home
          </router-link>
          <router-link 
            to="/profile" 
            class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            :class="[$route.path === '/profile' ? 'border-l-4 border-blue-500 bg-blue-50' : '']"
          >
            Profile
          </router-link>
          <router-link 
            to="/friends" 
            class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            :class="[$route.path === '/friends' ? 'border-l-4 border-blue-500 bg-blue-50' : '']"
          >
            Friends
          </router-link>
          <button 
            @click="handleLogout" 
            class="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <main :class="{ 'pt-16': isAuthenticated }">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
/* Remove all content from here - it's now in main.css */
</style>
