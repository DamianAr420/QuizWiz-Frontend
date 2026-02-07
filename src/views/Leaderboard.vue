<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const placeholders = Array(5).fill(null);
</script>

<template>
  <div
    class="max-w-4xl mx-auto px-4 py-8 sm:py-12 transition-colors duration-300"
  >
    <header class="text-center mb-8 sm:mb-12">
      <div
        class="inline-block p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl sm:rounded-3xl text-3xl sm:text-4xl mb-3 sm:mb-4 shadow-sm"
      >
        🏆
      </div>
      <h1
        class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight"
      >
        {{ t("leaderboard.title") }}
      </h1>
      <p
        class="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium px-4"
      >
        {{ t("leaderboard.subtitle") }}
      </p>
    </header>

    <div
      class="relative bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[3rem] shadow-xl sm:shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <div
        class="absolute inset-0 z-10 backdrop-blur-sm bg-white/60 dark:bg-slate-950/60 flex items-center justify-center p-4 sm:p-6"
      >
        <div
          class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-2xl text-center w-full max-w-[20rem] sm:max-w-sm transform hover:scale-105 transition-transform duration-500"
          id="coming-soon-card"
        >
          <div class="text-4xl sm:text-5xl mb-4 sm:mb-6">🚀</div>
          <h3
            class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3"
          >
            {{ t("leaderboard.comingSoon") }}
          </h3>
          <p
            class="text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 text-xs sm:text-sm leading-relaxed font-medium"
          >
            {{ t("leaderboard.comingSoonDesc") }}
          </p>
          <button
            @click="$router.push('/')"
            class="w-full py-3 sm:py-4 bg-green-600 dark:bg-green-500 text-white font-black rounded-xl sm:rounded-2xl hover:bg-green-700 dark:hover:bg-green-400 shadow-lg shadow-green-200 dark:shadow-none transition-all active:scale-95 cursor-pointer text-sm sm:text-base"
          >
            {{ t("common.backToHome") }}
          </button>
        </div>
      </div>

      <div
        class="p-4 sm:p-10 opacity-30 dark:opacity-10 pointer-events-none select-none"
      >
        <div class="space-y-3 sm:space-y-5">
          <div
            v-for="(_, index) in placeholders"
            :key="index"
            class="flex items-center gap-3 sm:gap-5 p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700"
          >
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-400 dark:text-slate-500 text-xs sm:text-sm"
            >
              {{ index + 1 }}
            </div>

            <div
              class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"
            ></div>

            <div class="flex-1 min-w-0">
              <div
                class="h-4 sm:h-5 w-24 sm:w-40 bg-slate-200 dark:bg-slate-700 rounded-lg mb-1.5 sm:mb-2"
              ></div>
              <div
                class="h-2.5 sm:h-3 w-12 sm:w-20 bg-slate-100 dark:bg-slate-600 rounded-md"
              ></div>
            </div>

            <div
              class="h-6 sm:h-8 w-12 sm:w-16 bg-slate-200 dark:bg-slate-700 rounded-lg sm:rounded-xl"
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

@media (prefers-reduced-motion: reduce) {
  #coming-soon-card {
    animation: none;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.02);
  }
}

@media (max-width: 640px) {
  @keyframes float {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-5px) scale(1.01);
    }
  }
}

.bg-slate-200,
.bg-slate-100,
.dark\:bg-slate-700,
.dark\:bg-slate-600 {
  transition: background-color 0.3s ease;
}
</style>
