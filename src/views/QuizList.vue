<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useQuizStore } from "@/stores/quiz";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const quizStore = useQuizStore();
const router = useRouter();

const searchQuery = ref("");
const activeFilter = ref("official");

onMounted(() => {
  quizStore.fetchQuizzes(true);
});

const filteredQuizzes = computed(() => {
  return quizStore.quizzes.filter((quiz) => {
    return (
      quiz.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
});

const setFilter = (type: string) => {
  activeFilter.value = type;
  const isOfficial = type === "official";
  quizStore.fetchQuizzes(isOfficial);
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex flex-col gap-8 mb-12">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">
          {{ t("quiz.listTitle") }}
        </h1>
        <button
          @click="router.push('/quiz/create')"
          class="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          + {{ t("quiz.createTitle") }}
        </button>
      </div>

      <div class="flex flex-col md:flex-row gap-4 items-center">
        <div class="relative flex-1 w-full">
          <span
            class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xl"
            >🔍</span
          >
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('quiz.searchPlaceholder')"
            class="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-4xl shadow-sm outline-none focus:border-indigo-500 transition-all text-slate-700 font-medium"
          />
        </div>

        <div
          class="inline-flex p-1.5 bg-slate-100 rounded-4xl w-full md:w-auto"
        >
          <button
            @click="setFilter('official')"
            :class="[
              'flex-1 md:flex-none px-8 py-3 rounded-3xl font-bold text-sm transition-all duration-300',
              activeFilter === 'official'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ]"
          >
            {{ t("quiz.official") }}
          </button>
          <button
            @click="setFilter('users')"
            :class="[
              'flex-1 md:flex-none px-8 py-3 rounded-3xl font-bold text-sm transition-all duration-300',
              activeFilter === 'users'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ]"
          >
            {{ t("quiz.users") }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="quizStore.loading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div
        v-for="i in 6"
        :key="i"
        class="h-64 bg-slate-100 animate-pulse rounded-[2.5rem]"
      ></div>
    </div>

    <div
      v-else-if="filteredQuizzes.length"
      class="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      <div
        v-for="quiz in filteredQuizzes"
        :key="quiz.id"
        @click="router.push(`/quiz/${quiz.id}`)"
        class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-all cursor-pointer"
      >
        <div
          class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all"
        >
          🚀
        </div>
        <h3
          class="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors"
        >
          {{ quiz.title }}
        </h3>
        <p class="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-2">
          {{ quiz.description }}
        </p>

        <div
          class="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50"
        >
          <span class="flex items-center gap-1"
            >⏱️ {{ quiz.timeLimitSeconds }}s</span
          >
          <span class="flex items-center gap-1"
            >🧩 {{ quiz.questionsCount }} {{ t("quiz.questions") }}</span
          >
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"
    >
      <div class="text-5xl mb-4">🏜️</div>
      <p class="text-slate-400 font-medium">{{ t("quiz.empty") }}</p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
