<script setup lang="ts">
import { onMounted } from "vue";
import { useQuizStore } from "@/stores/quiz";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const quizStore = useQuizStore();
const router = useRouter();

onMounted(() => {
  quizStore.fetchQuizzes();
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex justify-between items-center mb-10">
      <h1 class="text-4xl font-black text-slate-900">
        {{ t("quiz.listTitle") }}
      </h1>
      <button
        @click="router.push('/quiz/create')"
        class="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
      >
        + {{ t("quiz.createTitle") }}
      </button>
    </div>

    <div v-if="quizStore.loading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div
        v-for="i in 6"
        :key="i"
        class="h-64 bg-slate-100 animate-pulse rounded-[2.5rem]"
      ></div>
    </div>

    <div
      v-else-if="quizStore.quizzes.length"
      class="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      <div
        v-for="quiz in quizStore.quizzes"
        :key="quiz.id"
        @click="router.push(`/quiz/${quiz.id}`)"
        class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-all cursor-pointer"
      >
        <div
          class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all"
        >
          🚀
        </div>
        <h3 class="text-2xl font-bold text-slate-800 mb-3">{{ quiz.title }}</h3>
        <p class="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-2">
          {{ quiz.description }}
        </p>

        <div
          class="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest"
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
