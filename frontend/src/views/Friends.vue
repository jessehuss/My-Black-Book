<template>
  <div>
    <h2 class="text-2xl font-bold">Friends</h2>
    <ul>
      <li v-for="friend in friendsStore.friends" :key="friend.id">
        {{ friend.name }}
        <button @click="removeFriend(friend.id)">Remove</button>
      </li>
    </ul>

    <h2 class="text-2xl font-bold">Pending Requests</h2>
    <ul>
      <li v-for="request in friendsStore.pendingRequests" :key="request.id">
        {{ request.user.name }}
        <button @click="acceptRequest(request.id)">Accept</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useFriendsStore } from "@/stores/useFriendsStore";

const friendsStore = useFriendsStore();

const removeFriend = (id) => friendsStore.removeFriend(id);
const acceptRequest = (id) => friendsStore.acceptFriendRequest(id);

onMounted(() => {
  friendsStore.fetchFriends();
  friendsStore.fetchPendingRequests();
});
</script>
