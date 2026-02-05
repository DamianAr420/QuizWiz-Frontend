<script setup lang="ts">
import { useToastStore } from "@/stores/toast";

const toastStore = useToastStore();
</script>

<template>
  <div
    class="fixed bottom-5 right-5 z-100 flex flex-col gap-3 pointer-events-none"
  >
    <TransitionGroup name="list">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl min-w-70 flex items-center justify-between"
        :class="[
          toast.type === 'success'
            ? 'bg-emerald-500/90 border-emerald-400 text-white'
            : '',
          toast.type === 'error'
            ? 'bg-rose-500/90 border-rose-400 text-white'
            : '',
          toast.type === 'info'
            ? 'bg-slate-800/90 border-slate-700 text-white'
            : '',
        ]"
      >
        <div class="flex items-center gap-3">
          <span v-if="toast.type === 'success'">✅</span>
          <span v-else-if="toast.type === 'error'">❌</span>
          <span v-else>ℹ️</span>
          <p class="font-bold text-sm">{{ toast.message }}</p>
        </div>
        <button
          @click="toastStore.remove(toast.id)"
          class="ml-4 opacity-50 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.list-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
