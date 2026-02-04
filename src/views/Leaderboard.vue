<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const placeholders = Array(5).fill(null);
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12 transition-colors duration-300">
    <header class="text-center mb-12">
      <div
        class="inline-block p-4 bg-green-50 dark:bg-green-900/20 rounded-3xl text-4xl mb-4 shadow-sm"
      >
        🏆
      </div>
      <h1
        class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight"
      >
        {{ t("leaderboard.title") }}
      </h1>
      <p class="text-slate-500 dark:text-slate-400 font-medium">
        {{ t("leaderboard.subtitle") }}
      </p>
    </header>

    <div
      class="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <div
        class="absolute inset-0 z-10 backdrop-blur-xs bg-white/40 dark:bg-slate-950/40 flex items-center justify-center p-6"
      >
        <div
          class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-10 rounded-[2.5rem] shadow-2xl text-center max-w-sm transform hover:scale-105 transition-transform duration-500"
          id="coming-soon-card"
        >
          <div class="text-5xl mb-6">🚀</div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3">
            {{ t("leaderboard.comingSoon") }}
          </h3>
          <p
            class="text-slate-600 dark:text-slate-400 mb-8 text-sm leading-relaxed"
          >
            {{ t("leaderboard.comingSoonDesc") }}
          </p>
          <button
            @click="$router.push('/')"
            class="w-full py-4 bg-green-600 dark:bg-green-500 text-white font-black rounded-2xl hover:bg-green-700 dark:hover:bg-green-400 shadow-lg shadow-green-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
          >
            {{ t("common.backToHome") }}
          </button>
        </div>
      </div>

      <div class="p-6 sm:p-10 opacity-20 dark:opacity-10 pointer-events-none">
        <div class="space-y-5">
          <div
            v-for="(_, index) in placeholders"
            :key="index"
            class="flex items-center gap-5 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700"
          >
            <div
              class="w-10 h-10 rounded-xl bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-500"
            >
              {{ index + 1 }}
            </div>
            <div
              class="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700"
            ></div>
            <div class="flex-1">
              <div
                class="h-5 w-40 bg-slate-300 dark:bg-slate-700 rounded-lg mb-2"
              ></div>
              <div
                class="h-3 w-20 bg-slate-200 dark:bg-slate-600 rounded-md"
              ></div>
            </div>
            <div
              class="h-8 w-16 bg-slate-300 dark:bg-slate-700 rounded-xl"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#coming-soon-card {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.02);
  }
}

.bg-slate-300,
.bg-slate-200,
.dark\:bg-slate-700,
.dark\:bg-slate-600 {
  transition: background-color 0.3s ease;
}
</style>
