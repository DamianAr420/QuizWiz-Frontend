<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "@/stores/quiz";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

const currentQuestionIndex = ref(0);
const score = ref(0);
const timeLeft = ref(0);
const isGameOver = ref(false);
const selectedAnswer = ref<string | null>(null);
let timerInterval: number | null = null;

const quiz = computed(() => quizStore.currentQuiz);
const currentQuestion = computed(
  () => quiz.value?.questions[currentQuestionIndex.value],
);

const shuffledAnswers = computed(() => {
  if (!currentQuestion.value) return [];
  const all = [
    currentQuestion.value.correctAnswer,
    ...currentQuestion.value.distractors,
  ];
  return all.sort(() => Math.random() - 0.5);
});

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  timeLeft.value = quiz.value?.timeLimitSeconds || 30;

  timerInterval = window.setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      handleAnswer(null);
    }
  }, 1000);
};

const handleAnswer = (answer: string | null) => {
  if (selectedAnswer.value !== null) return;
  if (timerInterval) clearInterval(timerInterval);

  selectedAnswer.value = answer;

  if (answer === currentQuestion.value?.correctAnswer) {
    score.value++;
  }

  setTimeout(() => {
    nextQuestion();
  }, 1500);
};

const nextQuestion = () => {
  selectedAnswer.value = null;
  if (currentQuestionIndex.value + 1 < (quiz.value?.questions.length || 0)) {
    currentQuestionIndex.value++;
    startTimer();
  } else {
    isGameOver.value = true;
  }
};

const playAgain = () => {
  window.location.reload();
};

onMounted(async () => {
  const id = Number(route.params.id);
  await quizStore.fetchQuizById(id);
  if (quiz.value) {
    startTimer();
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 min-h-[80vh] flex flex-col justify-center">
    <div
      v-if="quizStore.loading"
      class="text-center font-black text-slate-300 animate-pulse text-4xl"
    >
      LOADING...
    </div>

    <div v-else-if="quiz && !isGameOver" class="space-y-8">
      <div
        class="flex justify-between items-center bg-white p-6 rounded-4xl shadow-xl shadow-slate-200/50"
      >
        <div class="flex flex-col">
          <span
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
            >{{ t("game.timeLeft") }}</span
          >
          <span
            class="text-2xl font-black"
            :class="
              timeLeft < 10 ? 'text-red-500 animate-bounce' : 'text-indigo-600'
            "
          >
            {{ timeLeft }}s
          </span>
        </div>
        <div class="text-right">
          <span
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
            >Pytanie</span
          >
          <div class="text-xl font-black text-slate-800">
            {{ currentQuestionIndex + 1 }} <span class="text-slate-300">/</span>
            {{ quiz.questions.length }}
          </div>
        </div>
      </div>

      <div
        class="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60"
      >
        <h2
          class="text-3xl font-black text-slate-900 leading-tight mb-10 text-center"
        >
          {{ currentQuestion?.text }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="answer in shuffledAnswers"
            :key="answer"
            @click="handleAnswer(answer)"
            :disabled="selectedAnswer !== null"
            :class="[
              'p-6 rounded-4xl font-bold text-lg transition-all border-4',
              selectedAnswer === null
                ? 'bg-slate-50 border-transparent hover:border-indigo-500 hover:bg-white'
                : '',
              selectedAnswer !== null &&
              answer === currentQuestion?.correctAnswer
                ? 'bg-green-100 border-green-500 text-green-700'
                : '',
              selectedAnswer === answer &&
              answer !== currentQuestion?.correctAnswer
                ? 'bg-red-100 border-red-500 text-red-700'
                : '',
              selectedAnswer !== null &&
              answer !== currentQuestion?.correctAnswer &&
              answer !== selectedAnswer
                ? 'opacity-50 border-transparent'
                : '',
            ]"
          >
            {{ answer }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-else-if="isGameOver"
      class="text-center bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100"
    >
      <div class="text-6xl mb-6">🏆</div>
      <h2 class="text-4xl font-black text-slate-900 mb-2">
        {{ t("game.gameOver") }}
      </h2>
      <p class="text-slate-500 mb-8">
        {{ t("game.score") }}:
        <span class="font-black text-indigo-600 text-3xl">{{ score }}</span>
      </p>

      <div class="flex flex-col gap-4">
        <button
          @click="router.push('/quiz')"
          class="w-full py-5 bg-indigo-600 text-white rounded-4xl font-black shadow-xl hover:bg-indigo-700 transition-all"
        >
          {{ t("game.backToList") }}
        </button>
        <button
          @click="playAgain"
          class="w-full py-5 border-2 border-slate-200 text-slate-600 rounded-4xl font-black hover:bg-slate-50 transition-all"
        >
          {{ t("game.playAgain") }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
button:disabled {
  cursor: default;
}
</style>
