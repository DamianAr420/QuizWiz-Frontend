<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "@/stores/quiz";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

const selectedQuestionCount = ref(10);
const quiz = computed(() => quizStore.currentQuiz);

onMounted(async () => {
  const id = Number(route.params.id);
  await quizStore.fetchQuizById(id);
  if (quiz.value) {
    selectedQuestionCount.value = Math.min(10, quiz.value.questions.length);
  }
});

const startSoloGame = () => {
  router.push({
    name: "quiz-play",
    params: { id: quiz.value?.id },
    query: { count: selectedQuestionCount.value, ended: "false" },
  });
};
</script>

<template>
  <div
    class="max-w-4xl mx-auto p-6 min-h-[80vh] flex items-center transition-colors duration-300"
  >
    <div
      v-if="quiz"
      class="w-full bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <div
        class="bg-green-600 dark:bg-green-700 p-12 text-white text-center relative overflow-hidden"
      >
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"
        ></div>
        <div class="text-6xl mb-6 relative z-10">🚀</div>
        <h1 class="text-4xl font-black mb-4 tracking-tight relative z-10">
          {{ quiz.title }}
        </h1>
        <p
          class="text-green-50 dark:text-green-100 text-lg max-w-2xl mx-auto relative z-10"
        >
          {{ quiz.description }}
        </p>
      </div>

      <div class="p-12 space-y-12">
        <div class="flex flex-col items-center gap-6">
          <label
            class="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
          >
            {{ t("lobby.questionCount") }}
          </label>
          <div class="flex flex-wrap justify-center gap-4">
            <button
              v-for="count in [5, 10, 15, quiz.questions.length].filter(
                (c) => c <= quiz!.questions.length,
              )"
              :key="count"
              @click="selectedQuestionCount = count"
              :class="[
                'px-8 py-3 rounded-2xl font-black transition-all transform active:scale-95 border-2',
                selectedQuestionCount === count
                  ? 'bg-green-600 dark:bg-green-500 text-white border-green-600 dark:border-green-500 shadow-lg shadow-green-200 dark:shadow-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700',
              ]"
            >
              {{
                count === quiz.questions.length
                  ? t("lobby.max") + ` (${count})`
                  : count
              }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            @click="startSoloGame"
            class="group p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-green-600 dark:hover:border-green-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left shadow-sm"
          >
            <div
              class="text-3xl mb-4 group-hover:scale-110 transition-transform"
            >
              👤
            </div>
            <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">
              {{ t("lobby.soloMode") }}
            </h3>
            <p
              class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed"
            >
              {{ t("lobby.soloDesc") }}
            </p>
          </button>

          <button
            class="group p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent opacity-50 cursor-not-allowed text-left relative"
          >
            <span
              class="absolute top-6 right-8 text-[10px] font-black bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full uppercase tracking-widest"
            >
              {{ t("lobby.soon") }}
            </span>
            <div class="text-3xl mb-4">🎮</div>
            <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">
              {{ t("lobby.multiMode") }}
            </h3>
            <p
              class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed"
            >
              {{ t("lobby.multiDesc") }}
            </p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
