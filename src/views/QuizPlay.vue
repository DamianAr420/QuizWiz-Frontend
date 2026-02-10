<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuizStore } from "@/stores/quiz";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
import QuizResult from "@/components/Cards/QuizResult.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();
const userStore = useUserStore();

const quizContainer = ref<HTMLElement | null>(null);
const gameQuestions = ref<any[]>([]);
const currentQuestionIndex = ref(0);
const score = ref(0);
const timeLeft = ref(0);
const isGameOver = ref(false);
const selectedAnswer = ref<string | null>(null);
const answerState = ref<"correct" | "wrong" | null>(null);

const earnedExp = ref(0);
const earnedPoints = ref(0);
const isLevelUp = ref(false);

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

const scrollToContent = async () => {
  await nextTick();
  quizContainer.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};

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
  const isCorrect = answer === currentQuestion.value?.correctAnswer;

  if (isCorrect) {
    score.value++;
    answerState.value = "correct";
  } else {
    answerState.value = "wrong";
  }

  setTimeout(() => {
    answerState.value = null;
    nextQuestion();
  }, 1200);
};

const nextQuestion = async () => {
  selectedAnswer.value = null;

  if (currentQuestionIndex.value + 1 < gameQuestions.value.length) {
    currentQuestionIndex.value++;
    startTimer();
    scrollToContent();
  } else {
    const quizId = Number(route.params.id);

    try {
      const result = await quizStore.submitQuizResult(
        quizId,
        score.value,
        gameQuestions.value.length,
      );

      earnedPoints.value = result.pointsGained;
      earnedExp.value = result.xpGained;
      isLevelUp.value = result.isLevelUp;

      await userStore.fetchStats();
      isGameOver.value = true;
    } catch (e) {
      console.error("Błąd podczas wysyłania wyniku:", e);
      earnedPoints.value = score.value * 10;
      earnedExp.value = score.value * 25;
    }

    scrollToContent();
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
    scrollToContent();
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const playAgain = () => router.go(0);
</script>

<template>
  <div
    ref="quizContainer"
    class="relative min-h-screen w-full flex flex-col grow justify-center items-center py-4 md:py-10"
  >
    <div
      class="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 z-0 overflow-hidden pointer-events-none"
    >
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-emerald-500/40 rounded-full blur-[120px] animate-blob animation-delay-2000"
      ></div>
      <div
        class="absolute top-40 left-0 translate-y-1/2 w-96 h-96 bg-emerald-500/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"
      ></div>
      <div
        class="absolute top-40 right-0 translate-y-1/2 w-96 h-96 bg-emerald-500/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"
      ></div>
    </div>

    <div class="relative z-10 w-[95%] lg:w-full max-w-7xl">
      <transition name="fade">
        <div
          v-if="quizStore.loading"
          class="flex flex-col items-center justify-center py-20 text-center"
        >
          <div class="text-8xl md:text-9xl animate-spin-slow">🪄</div>
          <h2
            class="mt-8 text-2xl md:text-4xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em] animate-pulse"
          >
            {{ t("game.loading") }}
          </h2>
        </div>
      </transition>

      <transition name="fade" mode="out-in">
        <div
          v-if="!quizStore.loading && currentQuestion && !isGameOver"
          :key="currentQuestionIndex"
          class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start w-full"
        >
          <aside class="lg:col-span-3 order-1 space-y-4">
            <div
              class="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-4xl shadow-xl border border-white/20 dark:border-white/5 overflow-hidden"
            >
              <div
                class="absolute inset-0 z-0 transition-all duration-1000 ease-linear origin-left"
                :class="
                  timeLeft < 6
                    ? 'bg-red-500/30 dark:bg-red-500/60'
                    : 'bg-emerald-500/40 dark:bg-emerald-500/80'
                "
                :style="{
                  transform: `scaleX(${timeLeft / (quizStore.currentQuiz?.timeLimitSeconds || 30)})`,
                }"
              ></div>
              <div class="relative z-10">
                <p
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1"
                >
                  {{ t("game.timeLeft") }}
                </p>
                <div class="flex items-baseline gap-2">
                  <span
                    class="text-5xl font-black tabular-nums transition-all"
                    :class="
                      timeLeft < 6
                        ? 'text-red-500 animate-pulse'
                        : 'text-slate-800 dark:text-white'
                    "
                  >
                    {{ timeLeft }}
                  </span>
                  <span
                    class="text-2xl font-bold"
                    :class="
                      timeLeft < 6
                        ? 'text-red-500'
                        : 'text-slate-800 dark:text-white'
                    "
                  >
                    {{ t("game.sec") }}
                  </span>
                </div>
              </div>
            </div>

            <div
              class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-4xl shadow-xl border border-white/20 dark:border-white/5 flex items-center justify-between"
            >
              <div>
                <p
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1"
                >
                  {{ t("game.question") }}
                </p>
                <span
                  class="text-3xl font-black text-slate-800 dark:text-white"
                >
                  {{ currentQuestionIndex + 1
                  }}<span class="text-slate-300 dark:text-slate-700 text-lg"
                    >/{{ gameQuestions.length }}</span
                  >
                </span>
              </div>
              <div class="w-12 h-12">
                <svg class="w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    stroke-width="4"
                    fill="transparent"
                    class="text-slate-100 dark:text-slate-800"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    stroke-width="4"
                    fill="transparent"
                    class="text-emerald-500 transition-all duration-700"
                    stroke-linecap="round"
                    :style="{
                      strokeDasharray: 125.6,
                      strokeDashoffset:
                        125.6 -
                        (125.6 * (currentQuestionIndex + 1)) /
                          gameQuestions.length,
                    }"
                  />
                </svg>
              </div>
            </div>
          </aside>

          <main class="lg:col-span-9 order-2">
            <div
              class="bg-white/70 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/40 dark:border-white/10 p-6 md:p-12 lg:p-16 min-h-112.5 flex flex-col justify-center transition-all duration-500"
            >
              <div class="relative z-10 mb-12 text-center">
                <h2
                  class="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 dark:text-white leading-tight"
                >
                  {{ currentQuestion.text }}
                </h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <button
                  v-for="(answer, idx) in shuffledAnswers"
                  :key="answer"
                  @click="handleAnswer(answer)"
                  :disabled="selectedAnswer !== null"
                  class="group relative w-full p-6 rounded-4xl font-bold text-lg transition-all duration-200 border-b-[6px] active:border-b-0 active:translate-y-1.5 flex items-center overflow-hidden"
                  :class="[
                    selectedAnswer === null
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      : '',
                    selectedAnswer !== null &&
                    answer === currentQuestion.correctAnswer
                      ? 'bg-emerald-500 border-emerald-700 text-white z-20 shadow-xl'
                      : '',
                    selectedAnswer === answer &&
                    answer !== currentQuestion.correctAnswer
                      ? 'bg-red-500 border-red-700 text-white shadow-xl shake-animation'
                      : '',
                    selectedAnswer !== null &&
                    answer !== currentQuestion.correctAnswer &&
                    answer !== selectedAnswer
                      ? 'opacity-40 grayscale scale-95'
                      : '',
                  ]"
                >
                  <span
                    class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-black mr-4 bg-slate-100 dark:bg-slate-900/50 text-slate-500"
                    :class="{
                      'bg-white/20 text-white':
                        selectedAnswer !== null &&
                        answer === currentQuestion.correctAnswer,
                    }"
                  >
                    {{ String.fromCharCode(65 + idx) }}
                  </span>
                  <span class="text-left leading-snug">{{ answer }}</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </transition>

      <transition name="fade">
        <QuizResult
          v-if="!quizStore.loading && isGameOver"
          :score="score"
          :total-questions="gameQuestions.length"
          :earned-exp="earnedExp"
          :earned-points="earnedPoints"
          :is-level-up="isLevelUp"
          @play-again="playAgain"
        />
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(20px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-10px, 10px) scale(0.95);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-spin-slow {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

button {
  -webkit-tap-highlight-color: transparent;
}
</style>
