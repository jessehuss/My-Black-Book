<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6">{{ isEditing ? 'Edit Bet' : 'Create New Bet' }}</h2>
    
    <form @submit.prevent="submitForm">
      <!-- Basic Bet Information -->
      <div class="mb-6">
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          id="title"
          v-model="form.title"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What's the bet about?"
          required
        />
      </div>
      
      <div class="mb-6">
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
        <textarea
          id="description"
          v-model="form.description"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Provide additional details about the bet"
          rows="3"
        ></textarea>
      </div>
      
      <div class="mb-6">
        <label for="stake" class="block text-sm font-medium text-gray-700 mb-1">Stake Amount</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
          <input
            type="number"
            id="stake"
            v-model="form.stake_amount"
            class="w-full pl-8 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>
      
      <!-- Participants Section -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-3">Participants</h3>
        <p class="text-sm text-gray-500 mb-4">Select friends to invite to this bet</p>
        
        <div v-if="loading" class="text-center py-4">
          <span class="text-gray-500">Loading friends...</span>
        </div>
        
        <div v-else-if="friends.length === 0" class="text-center py-4 border border-dashed border-gray-300 rounded-md">
          <p class="text-gray-500">You need to add friends before creating a bet</p>
          <router-link to="/friends" class="inline-block mt-2 text-blue-600 hover:text-blue-800">
            Add Friends
          </router-link>
        </div>
        
        <div v-else>
          <div v-for="(participant, index) in form.participants" :key="index" class="flex items-center mb-3 p-3 bg-gray-50 rounded-md">
            <div class="flex-grow">
              <select
                v-model="participant.user_id"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select a friend</option>
                <option
                  v-for="friend in availableFriends(index)"
                  :key="friend.id"
                  :value="friend.id"
                >
                  {{ friend.name }}
                </option>
              </select>
            </div>
            
            <div class="ml-4">
              <select
                v-model="participant.side"
                class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Side</option>
                <option value="for">For</option>
                <option value="against">Against</option>
              </select>
            </div>
            
            <button
              type="button"
              @click="removeParticipant(index)"
              class="ml-4 text-red-600 hover:text-red-800"
              :disabled="form.participants.length <= 1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <button
            type="button"
            @click="addParticipant"
            class="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            :disabled="form.participants.length >= friends.length"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Participant
          </button>
        </div>
      </div>
      
      <!-- Conditions Section -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-3">Conditions</h3>
        <p class="text-sm text-gray-500 mb-4">Define the conditions that determine the outcome of the bet</p>
        
        <div v-for="(condition, index) in form.conditions" :key="index" class="mb-3 p-3 bg-gray-50 rounded-md">
          <div class="mb-2">
            <label :for="'condition-' + index" class="block text-sm font-medium text-gray-700 mb-1">Condition Description</label>
            <textarea
              :id="'condition-' + index"
              v-model="condition.description"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the condition"
              rows="2"
              required
            ></textarea>
          </div>
          
          <div class="flex items-center">
            <div class="flex-grow">
              <label :for="'odds-' + index" class="block text-sm font-medium text-gray-700 mb-1">Odds (Optional)</label>
              <input
                :id="'odds-' + index"
                type="number"
                v-model="condition.odds"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2.5"
                step="0.01"
                min="1"
              />
            </div>
            
            <button
              type="button"
              @click="removeCondition(index)"
              class="ml-4 text-red-600 hover:text-red-800 self-end mb-1"
              :disabled="form.conditions.length <= 1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <button
          type="button"
          @click="addCondition"
          class="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Condition
        </button>
      </div>
      
      <!-- Form Actions -->
      <div class="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading || submitting"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ submitting ? 'Saving...' : (isEditing ? 'Update Bet' : 'Create Bet') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useBetsStore } from '@/stores/useBetsStore';
import { useFriendsStore } from '@/stores/useFriendsStore';
import { useToast } from '@/components/SimpleToast.vue';

export default {
  name: 'BetForm',
  props: {
    initialBet: {
      type: Object,
      default: null
    }
  },
  emits: ['cancel', 'created', 'updated'],
  setup(props, { emit }) {
    const toast = useToast();
    const betsStore = useBetsStore();
    const friendsStore = useFriendsStore();
    const submitting = ref(false);
    
    const isEditing = computed(() => !!props.initialBet);
    
    // Initialize form state
    const form = ref({
      title: '',
      description: '',
      stake_amount: '',
      participants: [{ user_id: '', side: '' }],
      conditions: [{ description: '', odds: null }]
    });
    
    // Load friends when the component mounts
    onMounted(async () => {
      try {
        await friendsStore.fetchFriends();
        
        // If editing, populate the form with the initial bet data
        if (isEditing.value) {
          populateForm();
        }
      } catch (error) {
        console.error('Failed to load friends:', error);
        toast.error('Failed to load friends');
      }
    });
    
    // Helper to populate the form when editing
    const populateForm = () => {
      const bet = props.initialBet;
      form.value.title = bet.title;
      form.value.description = bet.description || '';
      form.value.stake_amount = bet.stake_amount;
      
      // Populate participants
      form.value.participants = bet.participants
        .filter(p => p.role === 'challenger') // Exclude creator
        .map(p => ({
          user_id: p.user_id,
          side: p.side
        }));
      
      // Ensure at least one participant field
      if (form.value.participants.length === 0) {
        form.value.participants = [{ user_id: '', side: '' }];
      }
      
      // Populate conditions
      form.value.conditions = bet.conditions.map(c => ({
        id: c.id,
        description: c.description,
        odds: c.odds
      }));
    };
    
    // Helper to get available friends for selection
    const availableFriends = (currentIndex) => {
      // Get IDs of friends already selected in other fields
      const selectedIds = form.value.participants
        .filter((_, index) => index !== currentIndex) // Exclude current field
        .map(p => p.user_id)
        .filter(id => id !== ''); // Exclude empty selections
      
      // Return only friends not already selected
      return friendsStore.friends.filter(friend => !selectedIds.includes(friend.id));
    };
    
    // Add/remove participant fields
    const addParticipant = () => {
      form.value.participants.push({ user_id: '', side: '' });
    };
    
    const removeParticipant = (index) => {
      if (form.value.participants.length > 1) {
        form.value.participants.splice(index, 1);
      }
    };
    
    // Add/remove condition fields
    const addCondition = () => {
      form.value.conditions.push({ description: '', odds: null });
    };
    
    const removeCondition = (index) => {
      if (form.value.conditions.length > 1) {
        form.value.conditions.splice(index, 1);
      }
    };
    
    // Form submission
    const submitForm = async () => {
      submitting.value = true;
      
      try {
        const formData = {
          title: form.value.title,
          description: form.value.description || null,
          stake_amount: parseFloat(form.value.stake_amount),
          participants: form.value.participants.filter(p => p.user_id && p.side),
          conditions: form.value.conditions.map(c => ({
            ...(c.id ? { id: c.id } : {}),
            description: c.description,
            odds: c.odds ? parseFloat(c.odds) : null
          }))
        };
        
        let response;
        
        if (isEditing.value) {
          response = await betsStore.updateBet(props.initialBet.id, formData);
          toast.success('Bet updated successfully');
          emit('updated', response);
        } else {
          response = await betsStore.createBet(formData);
          toast.success('Bet created successfully');
          emit('created', response);
        }
      } catch (error) {
        toast.error(isEditing.value ? 'Failed to update bet' : 'Failed to create bet');
      } finally {
        submitting.value = false;
      }
    };
    
    return {
      isEditing,
      loading: computed(() => betsStore.loading || friendsStore.loading),
      friends: computed(() => friendsStore.friends),
      form,
      availableFriends,
      addParticipant,
      removeParticipant,
      addCondition,
      removeCondition,
      submitForm,
      submitting
    };
  }
};
</script> 