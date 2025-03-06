import { defineStore } from "pinia";
import api from "../api";

export const useFriendsStore = defineStore("friends", {
  state: () => ({
    friends: [],
    pendingRequests: [],
  }),

  actions: {
    async fetchFriends() {
      const { data } = await api.get("/friends");
      this.friends = data;
    },

    async fetchPendingRequests() {
      const { data } = await api.get("/friends/pending");
      this.pendingRequests = data;
    },

    async sendFriendRequest(friendId) {
      await api.post("/friends/request", { friend_id: friendId });
      this.fetchPendingRequests();
    },

    async acceptFriendRequest(requestId) {
      await api.post(`/friends/accept/${requestId}`);
      this.fetchFriends();
      this.fetchPendingRequests();
    },

    async removeFriend(friendId) {
      await api.delete(`/friends/remove/${friendId}`);
      this.fetchFriends();
    },
  },
});
