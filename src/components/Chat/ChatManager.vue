<script setup lang="ts">
import { useChatStore } from "@/stores/chat";
import ChatWindow from "@/components/Chat/ChatWindow.vue";

const chatStore = useChatStore();
</script>

<template>
  <div
    v-show="!chatStore.isFriendsListOpen"
    class="fixed bottom-0 right-20 flex gap-2 z-50"
  >
    <ChatWindow
      v-for="friendId in chatStore.openChats"
      :key="friendId"
      :friend-id="friendId"
    />
  </div>
</template>
