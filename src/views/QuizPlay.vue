<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "@/stores/quiz";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

const gameQuestions = ref<any[]>([]);
const currentQuestionIndex = ref(0);
const score = ref(0);
const timeLeft = ref(0);
const isGameOver = ref(false);
const selectedAnswer = ref<string | null>(null);
let timerInterval: number | null = null;

const currentQuestion = computed(
  () => gameQuestions.value[currentQuestionIndex.value],
);

const shuffledAnswers = computed(() => {
  if (!currentQuestion.value) return [];
  const all = [
    currentQuestion.value.correctAnswer,
    ...currentQuestion.value.distractors,
  ];
  return [...all].sort(() => Math.random() - 0.5);
});

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  const maxTime = quizStore.currentQuiz?.timeLimitSeconds || 30;
  timeLeft.value = maxTime;

  timerInterval = window.setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) handleAnswer(null);
  }, 1000);
};

const handleAnswer = (answer: string | null) => {
  if (selectedAnswer.value !== null) return;
  if (timerInterval) clearInterval(timerInterval);
  selectedAnswer.value = answer;
  if (answer === currentQuestion.value?.correctAnswer) score.value++;
  setTimeout(() => nextQuestion(), 1200);
};

const nextQuestion = () => {
  selectedAnswer.value = null;
  if (currentQuestionIndex.value + 1 < gameQuestions.value.length) {
    currentQuestionIndex.value++;
    startTimer();
  } else {
    isGameOver.value = true;
  }
};

onMounted(async () => {
  const id = Number(route.params.id);
  const countLimit = Number(route.query.count) || 10;
  await quizStore.fetchQuizById(id);
  if (quizStore.currentQuiz) {
    const shuffled = [...quizStore.currentQuiz.questions].sort(
      () => Math.random() - 0.5,
    );
    gameQuestions.value = shuffled.slice(0, countLimit);
    startTimer();
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const playAgain = () => router.go(0);
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 min-h-[70vh] flex flex-col justify-center">
    <div v-if="quizStore.loading" class="text-center animate-pulse">
      <div class="text-6xl mb-4">🌀</div>
      <div
        class="font-black text-slate-300 text-2xl uppercase tracking-[0.5em]"
      >
        {{ t("game.loading") }}
      </div>
    </div>

    <div v-else-if="currentQuestion && !isGameOver" class="space-y-8">
      <div
        class="relative overflow-hidden bg-white p-6 rounded-4xl shadow-xl border border-slate-100 min-h-25 flex items-center"
      >
        <div
          class="absolute inset-y-0 left-0 bg-indigo-50 transition-all duration-1000 ease-linear"
          :style="{
            width:
              (timeLeft / (quizStore.currentQuiz?.timeLimitSeconds || 30)) *
                100 +
              '%',
          }"
          :class="{ 'bg-red-200': timeLeft < 6 }"
        ></div>

        <div class="relative z-10 w-full flex justify-between items-center">
          <div class="flex flex-col">
            <span
              class="text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
              :class="timeLeft < 6 ? 'text-red-600' : 'text-slate-400'"
            >
              {{ t("game.timeLeft") }}
            </span>

            <span
              class="text-3xl font-black transition-all duration-300 inline-block"
              :class="
                timeLeft < 6
                  ? 'text-red-500 animate-time-critical'
                  : 'text-indigo-600'
              "
            >
              {{ timeLeft }}s
            </span>
          </div>

          <div class="text-right">
            <span
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
              >{{ t("game.question") }}</span
            >
            <div class="text-2xl font-black text-slate-800">
              {{ currentQuestionIndex + 1 }}
              <span class="text-slate-200">/</span> {{ gameQuestions.length }}
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60"
      >
        <h2
          class="text-3xl font-black text-slate-900 leading-tight mb-10 text-center"
        >
          {{ currentQuestion.text }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="answer in shuffledAnswers"
            :key="answer"
            @click="handleAnswer(answer)"
            :disabled="selectedAnswer !== null"
            :class="[
              'p-6 rounded-4xl font-bold text-lg transition-all border-4 transform active:scale-95',
              selectedAnswer === null
                ? 'bg-slate-50 border-transparent hover:border-indigo-500 hover:bg-white'
                : '',
              selectedAnswer !== null &&
              answer === currentQuestion.correctAnswer
                ? 'bg-green-100 border-green-500 text-green-700'
                : '',
              selectedAnswer === answer &&
              answer !== currentQuestion.correctAnswer
                ? 'bg-red-100 border-red-500 text-red-700'
                : '',
              selectedAnswer !== null &&
              answer !== currentQuestion.correctAnswer &&
              answer !== selectedAnswer
                ? 'opacity-40 border-transparent grayscale'
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
      <div class="text-7xl mb-6">🎉</div>
      <h2 class="text-4xl font-black text-slate-900 mb-2">
        {{ t("game.gameOver") }}
      </h2>
      <p class="text-slate-500 font-bold text-lg mb-8">
        {{ t("game.yourScore") }}
        <span
          class="inline-block px-4 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-3xl ml-2 font-black"
        >
          {{ score }} / {{ gameQuestions.length }}
        </span>
      </p>
      <div class="flex flex-col gap-4 max-w-sm mx-auto">
        <button
          @click="router.push('/quiz')"
          class="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all"
        >
          {{ t("game.backToList") }}
        </button>
        <button
          @click="playAgain"
          class="w-full py-5 border-4 border-slate-100 text-slate-600 rounded-3xl font-black hover:bg-slate-50 transition-all"
        >
          {{ t("game.playAgain") }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-time-critical {
  animation: time-shake 0.5s infinite alternate
    cubic-bezier(0.36, 0.07, 0.19, 0.97);
  display: inline-block;
  transform-origin: center;
}

@keyframes time-shake {
  0% {
    transform: scale(1) rotate(0deg);
    text-shadow: 0 0 0px rgba(239, 68, 68, 0);
  }
  25% {
    transform: scale(1.1) rotate(-2deg);
    text-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
  }
  50% {
    transform: scale(1.1) rotate(2deg);
  }
  75% {
    transform: scale(1.1) rotate(-1deg);
  }
  100% {
    transform: scale(1.2) rotate(0deg);
    text-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
  }
}

span {
  font-variant-numeric: tabular-nums;
}
</style>
