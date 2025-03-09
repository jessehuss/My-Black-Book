import { defineStore } from "pinia";
import api from "../api";
import { useAuthStore } from "./auth";

export const useFriendsStore = defineStore("friends", {
  state: () => ({
    friends: [],
    pendingRequests: [],
    searchResults: [],
  }),

  actions: {
    async fetchFriends() {
      const authStore = useAuthStore();
      const { data } = await api.get("/friends", {
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      this.friends = data;
    },

    async fetchPendingRequests() {
      const authStore = useAuthStore();
      const { data } = await api.get("/friends/pending", {
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      this.pendingRequests = data;
    },

    async sendFriendRequest(friendId) {
      const authStore = useAuthStore();
      await api.post("/friends/request", 
        { friend_id: friendId },
        { headers: { Authorization: `Bearer ${authStore.token}` }}
      );
      this.fetchPendingRequests();
    },

    async acceptFriendRequest(requestId) {
      const authStore = useAuthStore();
      await api.post(`/friends/accept/${requestId}`, null, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      this.fetchFriends();
      this.fetchPendingRequests();
    },

    async removeFriend(friendId) {
      const authStore = useAuthStore();
      await api.delete(`/friends/remove/${friendId}`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      });
      this.fetchFriends();
    },

    async searchUsers(query) {
      if (!query || query.length < 2) {
        this.searchResults = [];
        return;
      }
      const authStore = useAuthStore();
      try {
        const { data } = await api.get("/users/search", {
          params: { q: query },
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        this.searchResults = data;
      } catch (error) {
        console.error("Search failed:", error);
        this.searchResults = [];
      }
    },
  },
});
