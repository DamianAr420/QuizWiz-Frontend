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
    query: { count: selectedQuestionCount.value },
  });
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 min-h-[80vh] flex items-center">
    <div
      v-if="quiz"
      class="w-full bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden"
    >
      <div class="bg-indigo-600 p-12 text-white text-center">
        <div class="text-6xl mb-6">🚀</div>
        <h1 class="text-4xl font-black mb-4 tracking-tight">
          {{ quiz.title }}
        </h1>
        <p class="text-indigo-100 text-lg max-w-2xl mx-auto">
          {{ quiz.description }}
        </p>
      </div>

      <div class="p-12 space-y-10">
        <div class="flex flex-col items-center gap-6">
          <label
            class="text-sm font-black text-slate-400 uppercase tracking-[0.2em]"
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
                'px-8 py-3 rounded-2xl font-black transition-all transform active:scale-95',
                selectedQuestionCount === count
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            @click="startSoloGame"
            class="group p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent hover:border-indigo-600 transition-all text-left"
          >
            <div
              class="text-3xl mb-4 group-hover:scale-110 transition-transform"
            >
              👤
            </div>
            <h3 class="text-xl font-black text-slate-800 mb-2">
              {{ t("lobby.soloMode") }}
            </h3>
            <p class="text-slate-500 text-sm">{{ t("lobby.soloDesc") }}</p>
          </button>

          <button
            class="group p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent opacity-50 cursor-not-allowed text-left relative"
          >
            <span
              class="absolute top-4 right-6 text-[10px] font-black bg-slate-200 text-slate-600 px-2 py-1 rounded-md uppercase"
            >
              {{ t("lobby.soon") }}
            </span>
            <div class="text-3xl mb-4">🎮</div>
            <h3 class="text-xl font-black text-slate-800 mb-2">
              {{ t("lobby.multiMode") }}
            </h3>
            <p class="text-slate-500 text-sm">{{ t("lobby.multiDesc") }}</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
