<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-6 pb-0">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900">My Bets</h2>
        <button 
          @click="$emit('create-bet')" 
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Bet
        </button>
      </div>
      
      <!-- Filter Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="currentTab = tab.value"
            :class="[
              currentTab === tab.value 
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            {{ tab.label }}
            <span 
              v-if="tabCounts[tab.value] > 0"
              :class="[
                currentTab === tab.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900',
                'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
              ]"
            >
              {{ tabCounts[tab.value] }}
            </span>
          </button>
        </nav>
      </div>
    </div>
    
    <div class="p-6">
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-3 text-gray-500">Loading your bets...</p>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="filteredBets.length === 0" class="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">No bets found</h3>
        <p class="mt-1 text-gray-500">
          {{ emptyStateMessage }}
        </p>
        <div class="mt-6">
          <button
            @click="$emit('create-bet')"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Your First Bet
          </button>
        </div>
      </div>
      
      <!-- Bet list -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div
          v-for="bet in filteredBets"
          :key="bet.id"
          class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white flex flex-col"
        >
          <!-- Card Header with Status -->
          <div class="px-4 pt-4 pb-2 flex items-start justify-between border-b border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 line-clamp-1">
              {{ bet.title }}
            </h3>
            <span 
              :class="[
                statusClasses[bet.status].bgColor,
                statusClasses[bet.status].textColor,
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
              ]"
            >
              {{ statusLabels[bet.status] }}
            </span>
          </div>
          
          <!-- Card Content -->
          <div class="p-4 flex-grow">
            <!-- Description - truncated on mobile -->
            <p class="text-sm text-gray-500 mb-3 line-clamp-2">
              {{ bet.description || 'No description provided' }}
            </p>
            
            <!-- Key Details Row -->
            <div class="flex justify-between text-sm mb-3">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-bold">${{ bet.stake_amount }}</span>
              </div>
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ formatDate(bet.created_at) }}</span>
              </div>
            </div>
            
            <!-- Participants -->
            <div class="mb-3">
              <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Participants</h4>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="participant in bet.participants"
                  :key="participant.id"
                  :class="[
                    participant.side === 'for' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200',
                    'inline-flex items-center px-2 py-0.5 rounded-md text-xs border',
                    !participant.has_accepted && bet.status === 'pending' ? 'opacity-60' : ''
                  ]"
                >
                  {{ participant.user.name }}
                  <span class="ml-1 font-medium">{{ participant.side === 'for' ? '✓' : '✗' }}</span>
                  <span v-if="!participant.has_accepted && bet.status === 'pending'" class="ml-1 italic text-xs">
                    (pending)
                  </span>
                </span>
              </div>
            </div>
            
            <!-- Conditions - Simplified -->
            <div>
              <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Conditions</h4>
              <div class="text-sm text-gray-600">
                <div v-for="(condition, i) in bet.conditions" :key="condition.id" 
                     class="mb-1 flex items-start">
                  <span class="text-gray-400 mr-1">•</span>
                  <span class="line-clamp-1">{{ condition.description }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons - Compact Footer -->
          <div class="px-4 py-3 bg-gray-50 flex justify-end flex-wrap gap-2">
            <!-- View Details Button -->
            <button
              @click="viewBetDetail(bet)"
              class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Details
            </button>
            
            <!-- Accept/Decline buttons for pending bets - more compact -->
            <template v-if="bet.status === 'pending' && isPendingParticipant(bet)">
              <button
                @click="acceptBet(bet.id)"
                class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-green-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Accept
              </button>
              <button
                @click="declineBet(bet.id)"
                class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Decline
              </button>
            </template>
            
            <!-- Other action buttons styled consistently -->
            <button
              v-if="bet.status === 'pending' && isCreator(bet)"
              @click="$emit('edit-bet', bet)"
              class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            
            <button
              v-if="['pending', 'active'].includes(bet.status) && isCreator(bet)"
              @click="cancelBet(bet.id)"
              class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            
            <button
              v-if="bet.status === 'active'"
              @click="$emit('settle-bet', bet)"
              class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-green-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Settle
            </button>
            
            <button
              v-if="['won', 'lost'].includes(bet.status)"
              @click="$emit('dispute-bet', bet)"
              class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-yellow-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Dispute
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useBetsStore } from '@/stores/useBetsStore';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/SimpleToast.vue';
import { useRouter } from 'vue-router';

export default {
  name: 'BetsList',
  emits: ['create-bet', 'edit-bet', 'view-bet', 'settle-bet', 'dispute-bet'],
  setup(props, { emit }) {
    const toast = useToast();
    const betsStore = useBetsStore();
    const authStore = useAuthStore();
    const currentTab = ref('all');
    const router = useRouter();
    
    // Remove userId from ref and set directly
    const userId = authStore.user?.id;
    
    // Define tabs
    const tabs = [
      { label: 'All Bets', value: 'all' },
      { label: 'Pending', value: 'pending' },
      { label: 'Active', value: 'active' },
      { label: 'Settled', value: 'settled' },
    ];
    
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
    
    // Filtered bets based on current tab
    const filteredBets = computed(() => {
      if (currentTab.value === 'all') {
        return betsStore.bets;
      } else if (currentTab.value === 'pending') {
        return betsStore.pendingBets;
      } else if (currentTab.value === 'active') {
        return betsStore.activeBets;
      } else if (currentTab.value === 'settled') {
        return betsStore.settledBets;
      }
      return betsStore.bets;
    });
    
    // Count of bets for each tab
    const tabCounts = computed(() => ({
      all: betsStore.bets.length,
      pending: betsStore.pendingBets.length,
      active: betsStore.activeBets.length,
      settled: betsStore.settledBets.length,
    }));
    
    // Empty state message based on current tab
    const emptyStateMessage = computed(() => {
      switch (currentTab.value) {
        case 'pending':
          return 'You have no pending bets. Create a new bet to get started!';
        case 'active':
          return 'You have no active bets. Once participants accept, bets will be active.';
        case 'settled':
          return 'You have no settled bets yet.';
        default:
          return 'You have no bets. Create a new bet to get started!';
      }
    });
    
    // Helper for debugging
    onMounted(() => {
      console.log("BetsList mounted, current bets:", betsStore.bets);
    });
    
    // Update isPendingParticipant to handle undefined participants
    const isPendingParticipant = (bet) => {
      if (!bet.participants) return false;
      const participant = bet.participants.find(p => p.user_id === userId);
      return participant && !participant.has_accepted;
    };
    
    // Update isCreator to handle edge cases
    const isCreator = (bet) => {
      return bet.created_by === userId;
    };
    
    // More robust getParticipantName implementation
    const getParticipantName = (id) => {
      if (!Array.isArray(betsStore.bets)) return 'Unknown';
      
      for (const bet of betsStore.bets) {
        if (!bet.participants) continue;
        const participant = bet.participants.find(p => p.user_id === id);
        if (participant && participant.user) {
          return participant.user.name;
        }
      }
      return 'Unknown';
    };
    
    // Format date
    const formatDate = (dateString) => {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    // Accept a bet
    const acceptBet = async (betId) => {
      try {
        await betsStore.acceptBet(betId);
        toast.success('Bet accepted successfully');
      } catch (error) {
        toast.error('Failed to accept bet');
      }
    };
    
    // Decline a bet
    const declineBet = async (betId) => {
      try {
        await betsStore.declineBet(betId);
        toast.success('Bet declined');
      } catch (error) {
        toast.error('Failed to decline bet');
      }
    };
    
    // Cancel a bet
    const cancelBet = async (betId) => {
      if (!confirm('Are you sure you want to cancel this bet?')) {
        return;
      }
      
      try {
        await betsStore.cancelBet(betId);
        toast.success('Bet canceled successfully');
      } catch (error) {
        toast.error('Failed to cancel bet');
      }
    };
    
    const viewBetDetail = (bet) => {
      router.push(`/bets/${bet.id}`);
    };
    
    return {
      loading: computed(() => betsStore.loading),
      bets: computed(() => betsStore.bets),
      currentTab,
      tabs,
      tabCounts,
      filteredBets,
      statusClasses,
      statusLabels,
      emptyStateMessage,
      isPendingParticipant,
      isCreator,
      getParticipantName,
      formatDate,
      acceptBet,
      declineBet,
      cancelBet,
      viewBetDetail
    };
  }
};
</script> 