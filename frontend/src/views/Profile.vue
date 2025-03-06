<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const editMode = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const userForm = ref({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  newPasswordConfirmation: '',
});

onMounted(() => {
  userForm.value.name = auth.user?.name || '';
  userForm.value.email = auth.user?.email || '';
});

const updateProfile = async () => {
  try {
    // Here you would implement the API call to update the profile
    await auth.updateProfile({
      name: userForm.value.name,
      email: userForm.value.email,
    });
    successMessage.value = 'Profile updated successfully!';
    editMode.value = false;
    setTimeout(() => successMessage.value = '', 3000);
  } catch (error) {
    errorMessage.value = 'Failed to update profile';
    setTimeout(() => errorMessage.value = '', 3000);
  }
};

const updatePassword = async () => {
  try {
    // Here you would implement the API call to change password
    await auth.updatePassword({
      current_password: userForm.value.currentPassword,
      password: userForm.value.newPassword,
      password_confirmation: userForm.value.newPasswordConfirmation,
    });
    successMessage.value = 'Password updated successfully!';
    userForm.value.currentPassword = '';
    userForm.value.newPassword = '';
    userForm.value.newPasswordConfirmation = '';
    setTimeout(() => successMessage.value = '', 3000);
  } catch (error) {
    errorMessage.value = 'Failed to update password';
    setTimeout(() => errorMessage.value = '', 3000);
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ errorMessage }}
    </div>

    <!-- Profile Header -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="p-6">
        <div class="flex items-center space-x-6">
          <div class="flex-shrink-0">
            <!-- Avatar placeholder - you can replace with actual avatar component -->
            <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span class="text-2xl text-gray-600">{{ auth.user?.name?.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ auth.user?.name }}</h1>
            <p class="text-sm text-gray-500">Member since {{ new Date().toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Information -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Profile Information</h2>
          <button
            @click="editMode = !editMode"
            class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            {{ editMode ? 'Cancel' : 'Edit' }}
          </button>
        </div>

        <form v-if="editMode" @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="name"
              v-model="userForm.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="userForm.email"
              type="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>

        <div v-else class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Name</h3>
            <p class="mt-1 text-sm text-gray-900">{{ auth.user?.name }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Email</h3>
            <p class="mt-1 text-sm text-gray-900">{{ auth.user?.email }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password -->
    <div class="bg-white shadow rounded-lg">
      <div class="p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              id="currentPassword"
              v-model="userForm.currentPassword"
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="newPassword"
              v-model="userForm.newPassword"
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              id="confirmPassword"
              v-model="userForm.newPasswordConfirmation"
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>