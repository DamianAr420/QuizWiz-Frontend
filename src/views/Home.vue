<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useStatsStore } from "@/stores/stats";

const { t } = useI18n();
const statsStore = useStatsStore();

const features = [
  {
    icon: "🧠",
    title: "home.features.quizzes",
    desc: "home.features.quizzesDesc",
  },
  {
    icon: "🏆",
    title: "home.features.ranking",
    desc: "home.features.rankingDesc",
  },
  {
    icon: "⚡",
    title: "home.features.speed",
    desc: "home.features.speedDesc",
  },
];

const statsItems = computed(() => [
  {
    value: statsStore.stats.totalQuestions,
    label: "home.stats.questions",
  },
  {
    value: statsStore.stats.totalQuizzes,
    label: "home.stats.quizzes",
  },
  {
    value: statsStore.stats.totalUsers,
    label: "home.stats.users",
  },
]);

onMounted(() => {
  statsStore.fetchStats();
});
</script>

<template>
  <div class="space-y-24 pb-20 transition-colors duration-300">
    <section class="relative text-center pt-16 px-4">
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-green-100/50 dark:from-green-900/20 via-transparent to-transparent h-125 transition-colors"
      ></div>

      <h1
        class="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
      >
        {{ t("home.title") }}
        <span class="text-green-600 dark:text-green-500">QuizWiz</span>
      </h1>
      <p
        class="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
      >
        {{ t("home.description") }}
      </p>

      <div class="flex flex-wrap justify-center gap-4">
        <button
          @click="$router.push('/quiz')"
          class="px-10 py-4 bg-green-600 dark:bg-green-500 text-white font-bold rounded-2xl shadow-xl shadow-green-200 dark:shadow-none hover:bg-green-700 dark:hover:bg-green-400 hover:-translate-y-1 transition-all active:scale-95"
        >
          {{ t("home.cta") }}
        </button>
        <button
          @click="$router.push('/leaderboard')"
          class="px-10 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
        >
          {{ t("nav.ranking") }}
        </button>
      </div>

      <div
        class="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
      >
        <div
          v-for="stat in statsItems"
          :key="stat.label"
          class="p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-800 transition-all"
        >
          <div class="text-3xl font-black text-green-600 dark:text-green-400">
            {{ statsStore.loading ? "..." : stat.value }}
          </div>
          <div
            class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider"
          >
            {{ t(stat.label) }}
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-3 gap-12">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="group p-8 rounded-4xl bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-lg hover:shadow-green-300 dark:hover:shadow-green-500 transition-all duration-300"
        >
          <div
            class="text-5xl mb-6 group-hover:scale-110 transition-transform inline-block"
          >
            {{ feature.icon }}
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-3">
            {{ t(feature.title) }}
          </h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            {{ t(feature.desc) }}
          </p>
        </div>
      </div>
    </section>

    <section class="max-w-5xl mx-auto px-6">
      <div
        class="bg-green-700 dark:bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden border border-green-600 dark:border-slate-800 shadow-2xl"
      >
        <div
          class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-green-400 dark:bg-green-500 rounded-full blur-3xl opacity-20"
        ></div>
        <h2 class="text-3xl md:text-4xl font-bold mb-6 relative z-10">
          {{ t("home.readyToPlay") }}
        </h2>
        <p class="text-green-100 dark:text-slate-400 mb-8 max-w-xl mx-auto">
          {{ t("home.ctaSub") }}
        </p>
        <button
          @click="$router.push('/quiz')"
          class="bg-white text-green-700 dark:bg-green-500 dark:text-white px-12 py-4 rounded-2xl font-black hover:bg-green-50 dark:hover:bg-green-400 transition-all shadow-lg active:scale-95"
        >
          {{ t("home.startNow") }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
section {
  animation: slideIn 0.8s ease-out forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
