<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const placeholders = Array(5).fill(null);
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <header class="text-center mb-12">
      <div class="inline-block p-3 bg-indigo-50 rounded-2xl text-3xl mb-4">
        🏆
      </div>
      <h1 class="text-4xl font-black text-slate-900 mb-2">
        {{ t("leaderboard.title") }}
      </h1>
      <p class="text-slate-500">{{ t("leaderboard.subtitle") }}</p>
    </header>

    <div
      class="relative bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
    >
      <div
        class="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/30 flex items-center justify-center p-6"
      >
        <div
          class="bg-white/90 border border-slate-200 p-8 rounded-4xl shadow-2xl text-center max-w-sm transform hover:scale-105 transition-transform"
        >
          <div class="text-4xl mb-4">🚀</div>
          <h3 class="text-2xl font-black text-slate-900 mb-2">
            {{ t("leaderboard.comingSoon") }}
          </h3>
          <p class="text-slate-600 mb-6 text-sm leading-relaxed">
            {{ t("leaderboard.comingSoonDesc") }}
          </p>
          <button
            @click="$router.push('/')"
            class="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            {{ t("common.backToHome") }}
          </button>
        </div>
      </div>

      <div class="p-4 sm:p-8 opacity-20 pointer-events-none">
        <div class="space-y-4">
          <div
            v-for="(_, index) in placeholders"
            :key="index"
            class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50"
          >
            <div
              class="w-8 h-8 rounded-lg bg-slate-300 flex items-center justify-center font-bold text-slate-400"
            >
              {{ index + 1 }}
            </div>
            <div class="w-10 h-10 rounded-full bg-slate-300"></div>
            <div class="flex-1">
              <div class="h-4 w-32 bg-slate-300 rounded-md mb-2"></div>
              <div class="h-3 w-16 bg-slate-200 rounded-md"></div>
            </div>
            <div class="h-6 w-12 bg-slate-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-white\/90 {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
