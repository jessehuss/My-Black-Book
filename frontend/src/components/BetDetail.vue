<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-6">
      <!-- Loading Indicator -->
      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-3 text-gray-500">Loading bet details...</p>
      </div>
      
      <!-- Content (only shown when not loading and bet data exists) -->
      <div v-else-if="bet && bet.id">
        <!-- Header -->
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ bet.title }}</h2>
            <p class="mt-1 text-gray-500 max-w-3xl">{{ bet.description || 'No description provided' }}</p>
          </div>
          <span 
            v-if="bet.status && statusClasses[bet.status]"
            :class="[
              statusClasses[bet.status].bgColor,
              statusClasses[bet.status].textColor,
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium'
            ]"
          >
            {{ statusLabels[bet.status] || bet.status }}
          </span>
        </div>
        
        <!-- Bet Info -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Bet Details</h3>
            
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-500">Stake Amount:</span>
                <span class="font-bold">${{ bet.stake_amount }}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-gray-500">Created By:</span>
                <span>{{ bet.creator?.name || 'Unknown' }}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-gray-500">Created On:</span>
                <span>{{ formatDate(bet.created_at) }}</span>
              </div>
              
              <div v-if="bet.settled_at" class="flex justify-between">
                <span class="text-gray-500">Settled On:</span>
                <span>{{ formatDate(bet.settled_at) }}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Participants</h3>
            
            <div class="space-y-2">
              <div 
                v-for="participant in bet.participants" 
                :key="participant.id"
                class="flex justify-between items-center py-2"
              >
                <div class="flex items-center">
                  <div class="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span class="text-gray-600 font-medium">{{ participant.user.name.charAt(0) }}</span>
                  </div>
                  <div>
                    <div class="font-medium">{{ participant.user.name }}</div>
                    <div class="text-sm text-gray-500">
                      {{ participant.role === 'creator' ? 'Creator' : 'Participant' }}
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center">
                  <span
                    :class="[
                      participant.side === 'for' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                    ]"
                  >
                    {{ participant.side === 'for' ? 'For' : 'Against' }}
                  </span>
                  
                  <span
                    v-if="bet.status === 'pending'"
                    :class="[
                      participant.has_accepted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800',
                      'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                    ]"
                  >
                    {{ participant.has_accepted ? 'Accepted' : 'Pending' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Conditions -->
        <div class="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Conditions</h3>
          
          <div class="space-y-3">
            <div 
              v-for="condition in bet.conditions" 
              :key="condition.id"
              class="p-3 bg-white rounded-md"
            >
              <div class="flex justify-between items-start">
                <p class="text-gray-800">{{ condition.description }}</p>
                <span v-if="condition.odds" class="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Odds: {{ condition.odds }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Outcome -->
        <div v-if="bet.outcome" class="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Outcome</h3>
          
          <div class="p-3 bg-white rounded-md">
            <div class="mb-2">
              <span class="text-gray-500">Result:</span>
              <span class="ml-2">{{ bet.outcome.outcome_description }}</span>
            </div>
            
            <div class="mb-2">
              <span class="text-gray-500">Winner:</span>
              <span 
                v-if="bet.outcome.winner_id" 
                class="ml-2 font-medium"
              >
                {{ getParticipantName(bet.outcome.winner_id) }}
              </span>
              <span v-else class="ml-2 italic text-gray-500">
                No winner (bet was canceled)
              </span>
            </div>
            
            <div class="mb-2">
              <span class="text-gray-500">Settled by:</span>
              <span class="ml-2">{{ getParticipantName(bet.outcome.settled_by) }}</span>
            </div>
            
            <div v-if="bet.outcome.settled_at">
              <span class="text-gray-500">Settled on:</span>
              <span class="ml-2">{{ formatDate(bet.outcome.settled_at) }}</span>
            </div>
            
            <div v-if="bet.status === 'disputed'" class="mt-3 p-3 bg-red-50 rounded-md text-red-800">
              <div class="font-medium">Disputed:</div>
              <p>{{ bet.outcome.dispute_reason }}</p>
              <div class="mt-1 text-sm">
                Disputed by {{ getParticipantName(bet.outcome.disputed_by) }} on {{ formatDate(bet.outcome.disputed_at) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Settle Bet Form (for active bets) -->
        <div v-if="bet.status === 'active'" class="mt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Settle Bet</h3>
          
          <form @submit.prevent="settleBet" class="bg-gray-50 p-4 rounded-lg">
            <div class="mb-4">
              <label for="winner" class="block text-sm font-medium text-gray-700 mb-1">
                Who won the bet?
              </label>
              <select
                id="winner"
                v-model="settleForm.winner_id"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select winner</option>
                <option
                  v-for="participant in bet.participants"
                  :key="participant.id"
                  :value="participant.user_id"
                >
                  {{ participant.user.name }} ({{ participant.side === 'for' ? 'For' : 'Against' }})
                </option>
              </select>
            </div>
            
            <div class="mb-4">
              <label for="outcome_description" class="block text-sm font-medium text-gray-700 mb-1">
                Outcome Description
              </label>
              <textarea
                id="outcome_description"
                v-model="settleForm.outcome_description"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe how the bet was resolved"
                rows="3"
                required
              ></textarea>
            </div>
            
            <div class="mb-4">
              <label for="proof" class="block text-sm font-medium text-gray-700 mb-1">
                Proof (Optional)
              </label>
              <input
                id="proof"
                type="text"
                v-model="settleForm.proof"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Link to image or video proof"
              />
            </div>
            
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="settling"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {{ settling ? 'Settling...' : 'Settle Bet' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Dispute Form (for settled bets) -->
        <div v-if="showDisputeForm && ['won', 'lost'].includes(bet.status)" class="mt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Dispute Outcome</h3>
          
          <form @submit.prevent="disputeBet" class="bg-gray-50 p-4 rounded-lg">
            <div class="mb-4">
              <label for="dispute_reason" class="block text-sm font-medium text-gray-700 mb-1">
                Reason for Dispute
              </label>
              <textarea
                id="dispute_reason"
                v-model="disputeForm.dispute_reason"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explain why you are disputing the outcome"
                rows="3"
                required
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showDisputeForm = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="disputing"
                class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {{ disputing ? 'Submitting...' : 'Submit Dispute' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Action Buttons -->
        <div class="mt-8 flex justify-end space-x-4">
          <button
            @click="$emit('back')"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Back to Bets
          </button>
          
          <!-- Edit button for pending bets (creator only) -->
          <button
            v-if="bet.status === 'pending' && isCreator"
            @click="$emit('edit', bet)"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Bet
          </button>
          
          <!-- Cancel button for pending or active bets (creator only) -->
          <button
            v-if="['pending', 'active'].includes(bet.status) && isCreator"
            @click="cancelBet"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel Bet
          </button>
          
          <!-- Dispute button for settled bets -->
          <button
            v-if="['won', 'lost'].includes(bet.status) && !showDisputeForm"
            @click="showDisputeForm = true"
            class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Dispute Outcome
          </button>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else class="text-center py-10">
        <p class="text-red-500">Failed to load bet details</p>
        <button
          @click="$emit('back')"
          class="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Back to Bets
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useBetsStore } from '@/stores/useBetsStore';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/SimpleToast.vue';

export default {
  name: 'BetDetail',
  props: {
    betId: {
      type: [Number, String],
      required: true
    }
  },
  emits: ['back', 'edit', 'updated'],
  setup(props, { emit }) {
    const toast = useToast();
    const betsStore = useBetsStore();
    const authStore = useAuthStore();
    const settling = ref(false);
    const disputing = ref(false);
    const showDisputeForm = ref(false);
    const error = ref(null);
    
    // Form for settling a bet
    const settleForm = ref({
      winner_id: '',
      outcome_description: '',
      proof: ''
    });
    
    // Form for disputing a bet
    const disputeForm = ref({
      dispute_reason: ''
    });
    
    // Status styling
    const statusClasses = {
      pending: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      active: { bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      won: { bgColor: 'bg-green-100', textColor: 'text-green-800' },
      lost: { bgColor: 'bg-red-100', textColor: 'text-red-800' },
      canceled: { bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
      disputed: { bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    };
    
    // Status display labels
    const statusLabels = {
      pending: 'Pending',
      active: 'Active',
      won: 'Won',
      lost: 'Lost',
      canceled: 'Canceled',
      disputed: 'Disputed',
    };
    
    // Get the current bet from the store with safety checks
    const bet = computed(() => {
      return betsStore.currentBet || {};
    });
    
    // Check if the user is the creator
    const isCreator = computed(() => {
      return bet.value && bet.value.created_by === authStore.user?.id;
    });
    
    // Format date with error handling
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      } catch (error) {
        console.error('Date formatting error:', error);
        return dateString;
      }
    };
    
    // Helper to get participant name by ID with safety checks
    const getParticipantName = (id) => {
      if (!bet.value || !bet.value.participants) return 'Unknown';
      
      const participant = bet.value.participants.find(p => p.user_id === id);
      return participant && participant.user ? participant.user.name : 'Unknown';
    };
    
    // Keep track of whether we've already loaded the bet
    const hasLoaded = ref(false);
    
    // Load bet when component mounts
    onMounted(async () => {
      if (hasLoaded.value) return;
      
      try {
        console.log("BetDetail mounted, loading bet ID:", props.betId);
        await betsStore.fetchBet(props.betId);
        hasLoaded.value = true;
        
        if (!betsStore.currentBet || !betsStore.currentBet.id) {
          error.value = "Could not load bet details";
          toast.error("Failed to load bet details");
        }
      } catch (err) {
        console.error("Error loading bet:", err);
        error.value = err.message || "An error occurred loading bet details";
        toast.error("Failed to load bet details");
        hasLoaded.value = true; // Mark as loaded to prevent infinite retries
      }
    });
    
    // Cancel a bet
    const cancelBet = async () => {
      if (!confirm('Are you sure you want to cancel this bet?')) {
        return;
      }
      
      try {
        await betsStore.cancelBet(props.betId);
        toast.success('Bet canceled successfully');
        emit('updated');
      } catch (error) {
        toast.error('Failed to cancel bet');
      }
    };
    
    // Settle a bet
    const settleBet = async () => {
      settling.value = true;
      try {
        await betsStore.settleBet(props.betId, settleForm.value);
        toast.success('Bet settled successfully');
        emit('updated');
      } catch (error) {
        toast.error('Failed to settle bet');
      } finally {
        settling.value = false;
      }
    };
    
    // Dispute a bet
    const disputeBet = async () => {
      disputing.value = true;
      try {
        await betsStore.disputeBet(props.betId, disputeForm.value);
        toast.success('Dispute submitted successfully');
        showDisputeForm.value = false;
        emit('updated');
      } catch (error) {
        toast.error('Failed to dispute bet');
      } finally {
        disputing.value = false;
      }
    };
    
    return {
      loading: computed(() => betsStore.loading && !hasLoaded.value),
      bet,
      error,
      isCreator,
      statusClasses,
      statusLabels,
      settling,
      disputing,
      showDisputeForm,
      settleForm,
      disputeForm,
      formatDate,
      getParticipantName,
      cancelBet,
      settleBet,
      disputeBet
    };
  }
};
</script> 