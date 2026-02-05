<script setup lang="ts">
import MainLayout from "@/layouts/MainLayout.vue";
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import Toast from "./components/Notifications/Toast.vue";

const authStore = useAuthStore();
const userStore = useUserStore();

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await userStore.fetchProfile();
  }
});
</script>

<template>
  <MainLayout>
    <Toast />
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" v-if="Component" />
      </transition>
    </RouterView>
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
