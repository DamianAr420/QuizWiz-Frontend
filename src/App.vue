<script setup lang="ts">
import MainLayout from "@/layouts/MainLayout.vue";
import { RouterView } from "vue-router";
import { onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { useChatStore } from "@/stores/chat";
import Toast from "@/components/Notifications/Toast.vue";
import ChatManager from "@/components/Chat/ChatManager.vue";
import ChatContainer from "@/components/Chat/ChatContainer.vue";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { Analytics } from "@vercel/analytics/vue";
import { useHeartbeat } from "@/composables/useHeartbeat";

const authStore = useAuthStore();
const userStore = useUserStore();
const chatStore = useChatStore();
const { startHeartbeat, stopHeartbeat } = useHeartbeat();

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await userStore.fetchProfile();
    await chatStore.startConnection();
    startHeartbeat();
  }
});

onUnmounted(() => {
  stopHeartbeat();
});
</script>

<template>
  <MainLayout>
    <Toast />
    <ChatContainer v-if="authStore.isAuthenticated" />
    <ChatManager />

    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" v-if="Component" />
      </transition>
    </RouterView>

    <SpeedInsights />
    <Analytics />
  </MainLayout>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
