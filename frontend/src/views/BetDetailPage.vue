<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="p-6">
        <!-- Loading Indicator -->
        <div v-if="isLoading" class="text-center py-10">
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
          
          <!-- Rest of your bet details HTML remains the same -->
          
          <!-- Action Buttons -->
          <div class="mt-8 flex justify-end space-x-4">
            <button
              @click="goBack"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Bets
            </button>
            
            <!-- Edit button for pending bets (creator only) -->
            <button
              v-if="bet.status === 'pending' && isCreator"
              @click="router.push(`/bets/edit/${betId}`)"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Bet
            </button>
            
            <!-- Other buttons remain the same -->
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else class="text-center py-10">
          <p class="text-red-500">Failed to load bet details</p>
          <button
            @click="goBack"
            class="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Back to Bets
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBetsStore } from '@/stores/useBetsStore';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/components/SimpleToast.vue';

export default {
  name: 'BetDetailPage',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const betId = route.params.id;
    
    const toast = useToast();
    const betsStore = useBetsStore();
    const authStore = useAuthStore();
    const isLoading = ref(true);
    const error = ref(null);
    const settling = ref(false);
    const disputing = ref(false);
    const showDisputeForm = ref(false);
    
    // Forms and other refs remain the same
    const settleForm = ref({
      winner_id: '',
      outcome_description: '',
      proof: ''
    });
    
    const disputeForm = ref({
      dispute_reason: ''
    });
    
    // Status styling and labels remain the same
    const statusClasses = {
      pending: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      active: { bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      won: { bgColor: 'bg-green-100', textColor: 'text-green-800' },
      lost: { bgColor: 'bg-red-100', textColor: 'text-red-800' },
      canceled: { bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
      disputed: { bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    };
    
    const statusLabels = {
      pending: 'Pending',
      active: 'Active',
      won: 'Won',
      lost: 'Lost',
      canceled: 'Canceled',
      disputed: 'Disputed',
    };
    
    // Computed properties for bet data
    const bet = computed(() => betsStore.currentBet || {});
    
    const isCreator = computed(() => 
      bet.value && bet.value.created_by === authStore.user?.id
    );
    
    // Navigation function
    const goBack = () => {
      router.push('/bets');
    };
    
    // Helper functions remain similar
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
    
    const getParticipantName = (id) => {
      if (!bet.value || !bet.value.participants) return 'Unknown';
      
      const participant = bet.value.participants.find(p => p.user_id === id);
      return participant && participant.user ? participant.user.name : 'Unknown';
    };
    
    // Load data only once on mount
    onMounted(async () => {
      console.log("BetDetailPage mounted, fetching bet ID:", betId);
      isLoading.value = true;
      
      try {
        await betsStore.fetchBet(betId);
        
        if (!betsStore.currentBet || !betsStore.currentBet.id) {
          error.value = "Could not load bet details";
          toast.error("Failed to load bet details");
        }
      } catch (err) {
        console.error("Error loading bet:", err);
        error.value = err.message || "An error occurred loading bet details";
        toast.error("Failed to load bet details");
      } finally {
        isLoading.value = false;
      }
    });
    
    // Action methods remain the same
    const cancelBet = async () => {
      if (!confirm('Are you sure you want to cancel this bet?')) {
        return;
      }
      
      try {
        await betsStore.cancelBet(betId);
        toast.success('Bet canceled successfully');
        goBack();
      } catch (error) {
        toast.error('Failed to cancel bet');
      }
    };
    
    const settleBet = async () => {
      settling.value = true;
      try {
        await betsStore.settleBet(betId, settleForm.value);
        toast.success('Bet settled successfully');
        await betsStore.fetchBet(betId); // Refresh the current bet
      } catch (error) {
        toast.error('Failed to settle bet');
      } finally {
        settling.value = false;
      }
    };
    
    const disputeBet = async () => {
      disputing.value = true;
      try {
        await betsStore.disputeBet(betId, disputeForm.value);
        toast.success('Dispute submitted successfully');
        showDisputeForm.value = false;
        await betsStore.fetchBet(betId); // Refresh the current bet
      } catch (error) {
        toast.error('Failed to dispute bet');
      } finally {
        disputing.value = false;
      }
    };
    
    return {
      betId,
      isLoading,
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
      goBack,
      cancelBet,
      settleBet,
      disputeBet
    };
  }
};
</script> 