<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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
  { icon: "⚡", title: "home.features.speed", desc: "home.features.speedDesc" },
];

const stats = [
  { value: "1000+", label: "home.stats.questions" },
  { value: "50+", label: "home.stats.categories" },
  { value: "10k+", label: "home.stats.users" },
];
</script>

<template>
  <div class="space-y-24 pb-20">
    <section class="relative text-center pt-16 px-4">
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-indigo-100/50 via-white to-white h-125"
      ></div>

      <h1
        class="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight"
      >
        {{ t("home.title") }} <span class="text-indigo-600">QuizWiz</span>
      </h1>
      <p class="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
        {{ t("home.description") }}
      </p>

      <div class="flex flex-wrap justify-center gap-4">
        <button
          @click="$router.push('/quiz')"
          class="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
        >
          {{ t("home.cta") }}
        </button>
        <button
          @click="$router.push('/leaderboard')"
          class="px-10 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
        >
          {{ t("nav.ranking") }}
        </button>
      </div>

      <div
        class="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
      >
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="p-6 bg-white rounded-3xl shadow-sm border border-slate-50"
        >
          <div class="text-3xl font-black text-indigo-600">
            {{ stat.value }}
          </div>
          <div
            class="text-sm text-slate-500 font-medium uppercase tracking-wider"
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
          class="group p-8 rounded-4xl bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300"
        >
          <div
            class="text-5xl mb-6 group-hover:scale-110 transition-transform inline-block"
          >
            {{ feature.icon }}
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-3">
            {{ t(feature.title) }}
          </h3>
          <p class="text-slate-600 leading-relaxed">{{ t(feature.desc) }}</p>
        </div>
      </div>
    </section>

    <section class="max-w-5xl mx-auto px-6">
      <div
        class="bg-indigo-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden"
      >
        <div
          class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"
        ></div>
        <h2 class="text-3xl md:text-4xl font-bold mb-6 relative z-10">
          {{ t("home.readyToPlay") }}
        </h2>
        <p class="text-indigo-200 mb-8 max-w-xl mx-auto">
          {{ t("home.ctaSub") }}
        </p>
        <button
          @click="$router.push('/quiz')"
          class="bg-white text-indigo-900 px-12 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all"
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
