<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Error Message -->
    <div v-if="errorMessage" 
         class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex justify-between items-center">
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="text-red-700 hover:text-red-900">
        <span class="sr-only">Dismiss</span>
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Friends List Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Add Friend Section -->
      <div class="bg-white shadow rounded-lg">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Add Friend</h2>
          
          <!-- Search Input -->
          <div class="relative" ref="searchContainer">
            <input
              v-model="searchQuery"
              @input="handleSearch"
              @focus="showResults = true"
              type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search by name or email..."
            />
            
            <!-- Search Results Dropdown -->
            <div v-if="showResults && friendsStore.searchResults.length > 0" 
                 class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
              <ul class="py-1">
                <li v-for="user in friendsStore.searchResults" 
                    :key="user.id"
                    class="px-4 py-2 hover:bg-gray-100 flex justify-between items-center">
                  <span>{{ user.name }} ({{ user.email }})</span>
                  <button
                    @click="sendRequest(user.id)"
                    class="ml-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add Friend
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Invite Section -->
          <div class="mt-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Invite by Email</h3>
            <div class="flex gap-2">
              <input
                v-model="inviteEmail"
                type="email"
                class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="friend@example.com"
              />
              <button
                @click="sendInvite"
                class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Friends List -->
      <div class="bg-white shadow rounded-lg">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Friends</h2>
          <div class="divide-y divide-gray-200">
            <div v-for="friend in friendsStore.friends" 
                 :key="friend.id"
                 class="py-4 flex justify-between items-center">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="text-lg text-gray-600">{{ friend.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">{{ friend.name }}</h3>
                  <p class="text-sm text-gray-500">{{ friend.email }}</p>
                </div>
              </div>
              <button
                @click="removeFriend(friend.id)"
                class="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
            <div v-if="friendsStore.friends.length === 0" class="py-4 text-gray-500 text-center">
              No friends yet
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Requests -->
    <div class="mt-6 bg-white shadow rounded-lg">
      <div class="p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Pending Requests</h2>
        <div class="divide-y divide-gray-200">
          <div v-for="request in friendsStore.pendingRequests" 
               :key="request.id"
               class="py-4 flex justify-between items-center">
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span class="text-lg text-gray-600">{{ request.user.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="ml-4">
                <h3 class="text-sm font-medium text-gray-900">{{ request.user.name }}</h3>
                <p class="text-sm text-gray-500">{{ request.user.email }}</p>
                <p class="text-xs text-gray-400">
                  {{ request.type === 'incoming' ? 'Wants to be your friend' : 'Request sent' }}
                </p>
              </div>
            </div>
            <button
              v-if="request.type === 'incoming'"
              @click="acceptRequest(request.id)"
              class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Accept
            </button>
            <button
              v-else
              @click="cancelRequest(request.id)"
              class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
          <div v-if="friendsStore.pendingRequests.length === 0" class="py-4 text-gray-500 text-center">
            No pending requests
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useFriendsStore } from "@/stores/useFriendsStore";

const friendsStore = useFriendsStore();
const searchQuery = ref("");
const inviteEmail = ref("");
const errorMessage = ref("");
const showResults = ref(false);
const searchContainer = ref(null);

// Click outside handler
const handleClickOutside = (event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    showResults.value = false;
    friendsStore.searchResults = [];
    searchQuery.value = "";
  }
};

// Add and remove click outside listener
onMounted(() => {
  friendsStore.fetchFriends();
  friendsStore.fetchPendingRequests();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Debounce utility function
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Debounced search handler
const handleSearch = debounce(() => {
  friendsStore.searchUsers(searchQuery.value);
}, 300);

const sendRequest = async (id) => {
  try {
    await friendsStore.sendFriendRequest(id);
    searchQuery.value = "";
    showResults.value = false;
    friendsStore.searchResults = [];
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Failed to send friend request";
    setTimeout(() => {
      errorMessage.value = "";
    }, 5000);
  }
};

const sendInvite = () => {
  // TODO: Implement invite functionality
  console.log("Invite sent to:", inviteEmail.value);
  inviteEmail.value = "";
};

const removeFriend = async (id) => {
  try {
    await friendsStore.removeFriend(id);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Failed to remove friend";
    setTimeout(() => {
      errorMessage.value = "";
    }, 5000);
  }
};

const acceptRequest = async (id) => {
  try {
    await friendsStore.acceptFriendRequest(id);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Failed to accept friend request";
    setTimeout(() => {
      errorMessage.value = "";
    }, 5000);
  }
};

const cancelRequest = async (id) => {
  try {
    await friendsStore.removeFriend(id); // We can reuse the removeFriend method
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Failed to cancel friend request";
    setTimeout(() => {
      errorMessage.value = "";
    }, 5000);
  }
};
</script>
