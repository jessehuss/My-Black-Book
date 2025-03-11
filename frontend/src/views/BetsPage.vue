<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-3 text-gray-500">Loading...</p>
    </div>
    
    <div v-else>
      <!-- View for bet list -->
      <div v-if="currentView === 'list'">
        <BetsList 
          @create-bet="showCreateForm"
          @edit-bet="showEditForm"
          @view-bet="viewBetDetail"
          @settle-bet="viewBetDetail"
          @dispute-bet="viewBetDetail"
        />
      </div>
      
      <!-- View for creating a bet -->
      <div v-else-if="currentView === 'create'">
        <BetForm 
          @cancel="currentView = 'list'"
          @created="onBetCreated"
        />
      </div>
      
      <!-- View for editing a bet -->
      <div v-else-if="currentView === 'edit'">
        <BetForm 
          :initial-bet="selectedBet"
          @cancel="currentView = 'list'"
          @updated="onBetUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBetsStore } from '@/stores/useBetsStore';
import BetsList from '@/components/BetsList.vue';
import BetForm from '@/components/BetForm.vue';

export default {
  name: 'BetsPage',
  components: {
    BetsList,
    BetForm
  },
  setup() {
    const router = useRouter();
    const betsStore = useBetsStore();
    const currentView = ref('list');
    const selectedBet = ref(null);
    
    // Initialize the page - only place where fetchBets should be called
    onMounted(async () => {
      if (betsStore.bets.length === 0) {
        await betsStore.fetchBets();
      }
    });
    
    // Show the create bet form
    const showCreateForm = () => {
      currentView.value = 'create';
    };
    
    // Show the edit bet form
    const showEditForm = (bet) => {
      selectedBet.value = bet;
      currentView.value = 'edit';
    };
    
    // Use router navigation instead of component swap
    const viewBetDetail = (bet) => {
      router.push(`/bets/${bet.id}`);
    };
    
    // Handle successful bet creation
    const onBetCreated = async () => {
      await betsStore.fetchBets(); // Refresh data first
      currentView.value = 'list';
    };
    
    // Handle successful bet update
    const onBetUpdated = async () => {
      await betsStore.fetchBets(); // Refresh data first
      currentView.value = 'list';
    };
    
    // Refresh the bet list (can be called from child components)
    const refreshList = async () => {
      await betsStore.fetchBets();
      currentView.value = 'list';
    };
    
    return {
      loading: computed(() => betsStore.loading),
      currentView,
      selectedBet,
      showCreateForm,
      showEditForm,
      viewBetDetail,
      onBetCreated,
      onBetUpdated,
      refreshList
    };
  }
};
</script> 