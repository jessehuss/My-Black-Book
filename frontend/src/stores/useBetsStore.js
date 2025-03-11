import { defineStore } from "pinia";
import api from "../api";
import { useAuthStore } from "./auth";

export const useBetsStore = defineStore("bets", {
  state: () => ({
    bets: [],
    currentBet: null,
    loading: false,
    fetchInProgress: false,
  }),

  getters: {
    pendingBets: (state) => Array.isArray(state.bets) 
      ? state.bets.filter(bet => bet.status === 'pending')
      : [],
    activeBets: (state) => Array.isArray(state.bets) 
      ? state.bets.filter(bet => bet.status === 'active')
      : [],
    settledBets: (state) => Array.isArray(state.bets) 
      ? state.bets.filter(bet => 
          ['won', 'lost', 'canceled', 'disputed'].includes(bet.status)
        )
      : [],
  },

  actions: {
    async fetchBets() {
      if (this.fetchInProgress) {
        return this.bets;
      }
      
      const authStore = useAuthStore();
      this.loading = true;
      this.fetchInProgress = true;
      
      try {
        const response = await api.get('/bets', {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        
        console.log('API Response:', response.data);
        
        // Handle Laravel's paginated response structure
        if (response.data && response.data.success === true && response.data.data && response.data.data.data) {
          // This handles the paginated response format you showed me
          this.bets = response.data.data.data;
        } else if (response.data && response.data.data) {
          // If response has a 'data' property but not paginated
          this.bets = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (Array.isArray(response.data)) {
          // Direct array format
          this.bets = response.data;
        } else {
          console.error('Unexpected API response format:', response.data);
          this.bets = [];
        }
        
        return this.bets;
      } catch (error) {
        console.error('Failed to load bets:', error);
        this.bets = [];
        throw error;
      } finally {
        this.loading = false;
        this.fetchInProgress = false;
      }
    },

    async fetchBet(betId) {
      // Add a guard to prevent duplicate requests
      if (this.loading && this.currentBet && this.currentBet.id === parseInt(betId)) {
        return this.currentBet;
      }
      
      const authStore = useAuthStore();
      this.loading = true;
      
      try {
        console.log(`Fetching bet ${betId}...`);
        const response = await api.get(`/bets/${betId}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        
        // Handle the nested structure properly
        if (response.data && response.data.success === true && response.data.data) {
          // Store the data from the nested response
          this.currentBet = response.data.data;
        } else {
          console.error('Unexpected API response format:', response.data);
          this.currentBet = null;
        }
        
        return this.currentBet;
      } catch (error) {
        console.error('Failed to load bet details:', error);
        this.currentBet = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createBet(betData) {
      const authStore = useAuthStore();
      this.loading = true;
      try {
        const response = await api.post('/bets', betData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        await this.fetchBets(); // Refresh the list
        return response.data.data;
      } catch (error) {
        console.error('Failed to create bet:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateBet(betId, betData) {
      const authStore = useAuthStore();
      this.loading = true;
      try {
        const response = await api.put(`/bets/${betId}`, betData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        await this.fetchBets(); // Refresh the list
        return response.data.data;
      } catch (error) {
        console.error('Failed to update bet:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async acceptBet(betId) {
      const authStore = useAuthStore();
      try {
        const response = await api.post(`/bets/${betId}/accept`, null, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        await this.fetchBets(); // Refresh the list
        return response.data;
      } catch (error) {
        console.error('Failed to accept bet:', error);
        throw error;
      }
    },

    async declineBet(betId) {
      const authStore = useAuthStore();
      try {
        const response = await api.post(`/bets/${betId}/decline`, null, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        await this.fetchBets(); // Refresh the list
        return response.data;
      } catch (error) {
        console.error('Failed to decline bet:', error);
        throw error;
      }
    },

    async cancelBet(betId) {
      const authStore = useAuthStore();
      try {
        const response = await api.post(`/bets/${betId}/cancel`, null, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (this.currentBet && this.currentBet.id === betId) {
          await this.fetchBet(betId); // Refresh current bet
        }
        await this.fetchBets(); // Refresh the list
        return response.data;
      } catch (error) {
        console.error('Failed to cancel bet:', error);
        throw error;
      }
    },

    async settleBet(betId, settlementData) {
      const authStore = useAuthStore();
      try {
        const response = await api.post(`/bets/${betId}/settle`, settlementData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (this.currentBet && this.currentBet.id === betId) {
          await this.fetchBet(betId); // Refresh current bet
        }
        await this.fetchBets(); // Refresh the list
        return response.data;
      } catch (error) {
        console.error('Failed to settle bet:', error);
        throw error;
      }
    },

    async disputeBet(betId, disputeData) {
      const authStore = useAuthStore();
      try {
        const response = await api.post(`/bets/${betId}/dispute`, disputeData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (this.currentBet && this.currentBet.id === betId) {
          await this.fetchBet(betId); // Refresh current bet
        }
        await this.fetchBets(); // Refresh the list
        return response.data;
      } catch (error) {
        console.error('Failed to dispute bet:', error);
        throw error;
      }
    },

    async deleteBet(betId) {
      const authStore = useAuthStore();
      try {
        const response = await api.delete(`/bets/${betId}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        await this.fetchBets(); // Refresh the list
        return response.data;
      } catch (error) {
        console.error('Failed to delete bet:', error);
        throw error;
      }
    }
  },
}); 