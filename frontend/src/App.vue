<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import './assets/main.css'

const router = useRouter();
const auth = useAuthStore();

const isAuthenticated = computed(() => !!auth.token);

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
              <h1 class="text-2xl font-bold text-blue-600">BetTrack</h1>
            </div>
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
          <div class="flex items-center">
            <button 
              @click="handleLogout" 
              class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
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
