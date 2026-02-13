<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useQuizStore } from "@/stores/quiz";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const quizStore = useQuizStore();
const authStore = useAuthStore();

const isEditMode = computed(() => !!route.params.id);
const isAdmin = computed(() => authStore.user?.role === "Admin");

const form = ref({
  title: "",
  description: "",
  timeLimitSeconds: 30,
  maxQuestions: 10,
  isOfficial: false,
  isVerified: false,
  isVisible: true,
  isPlayable: true,
  questions: [{ text: "", correctAnswer: "", distractors: ["", "", ""] }],
});

const errorMessage = ref("");

const toggleOfficial = () => {
  form.value.isVerified = !!form.value.isOfficial;
};

onMounted(async () => {
  if (isEditMode.value) {
    const quizId = Number(route.params.id);
    const data = await quizStore.fetchQuizById(quizId);

    if (data) {
      form.value = {
        title: data.title,
        description: data.description,
        timeLimitSeconds: data.timeLimitSeconds,
        maxQuestions: data.maxQuestions,
        isOfficial: data.isOfficial,
        isVerified: data.isVerified,
        isVisible: data.isVisible,
        isPlayable: data.isPlayable,
        questions: data.questions.map((q) => ({
          text: q.text,
          correctAnswer: q.correctAnswer,
          distractors: [...q.distractors],
        })),
      };

      const currentUserId = authStore.user?.id?.toString();
      const authorId = (data as any).authorId?.toString();

      if (authorId && currentUserId !== authorId && !isAdmin.value) {
        router.push("/quiz");
      }
    }
  }
});

const addQuestion = () => {
  form.value.questions.push({
    text: "",
    correctAnswer: "",
    distractors: ["", "", ""],
  });
  errorMessage.value = "";
};

const removeQuestion = (index: number) => {
  form.value.questions.splice(index, 1);
  errorMessage.value = "";
};

const scrollToQuestion = (index: number) => {
  const element = document.getElementById(`question-${index}`);
  if (element) {
    const yOffset = -150;
    const y =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

const validateForm = (): boolean => {
  errorMessage.value = "";
  form.value.title = form.value.title.trim();
  form.value.description = form.value.description.trim();

  if (!form.value.title || !form.value.description) {
    errorMessage.value = t("quiz.form.validation.emptyHeader");
    return false;
  }

  for (const [index, q] of form.value.questions.entries()) {
    const questionNum = index + 1;
    q.text = q.text.trim();
    q.correctAnswer = q.correctAnswer.trim();
    q.distractors = q.distractors.map((d) => d.trim());

    if (!q.text) {
      errorMessage.value = t("quiz.form.validation.emptyQuestion", {
        number: questionNum,
      });
      return false;
    }
    if (!q.correctAnswer) {
      errorMessage.value = t("quiz.form.validation.emptyCorrect", {
        number: questionNum,
      });
      return false;
    }
    if (q.distractors.some((d) => d === "")) {
      errorMessage.value = t("quiz.form.validation.emptyDistractors", {
        number: questionNum,
      });
      return false;
    }
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  try {
    if (isEditMode.value) {
      await quizStore.updateQuiz(Number(route.params.id), form.value);
    } else {
      await quizStore.createQuiz(form.value);
    }
    router.push("/quiz");
  } catch (error) {
    errorMessage.value = t("common.error");
    console.error(error);
  }
};
</script>

<template>
  <div
    class="lg:hidden sticky sm:top-20 top-16 z-10 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm"
  >
    <div class="flex items-center gap-2 p-3 overflow-x-auto custom-scrollbar">
      <button
        v-for="(_, index) in form.questions"
        :key="index"
        @click="scrollToQuestion(index)"
        class="shrink-0 min-w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm active:bg-green-500 active:text-white transition-all border border-transparent"
      >
        {{ index + 1 }}
      </button>

      <button
        @click="addQuestion"
        class="shrink-0 min-w-10 h-10 flex items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
      >
        +
      </button>
    </div>
  </div>

  <div
    class="max-w-7xl mx-auto p-4 sm:p-6 pb-40 transition-colors duration-300"
  >
    <div class="flex flex-col lg:flex-row gap-8 items-start">
      <aside class="hidden lg:block w-72 sticky top-22 shrink-0">
        <div
          class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden"
        >
          <h3
            class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"
          >
            {{ t("quiz.form.questionsList") }}
          </h3>

          <div
            class="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar"
          >
            <button
              v-for="(_, index) in form.questions"
              :key="index"
              @click="scrollToQuestion(index)"
              class="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
            >
              <span
                class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 group-hover:bg-green-500 group-hover:text-white transition-all"
              >
                {{ index + 1 }}
              </span>
              <span
                class="text-sm truncate text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-white"
              >
                {{ form.questions[index]?.text || "..." }}
              </span>
            </button>
          </div>

          <button
            @click="addQuestion"
            class="w-full mt-6 py-3 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 rounded-xl text-xs font-bold transition-all border border-slate-100 dark:border-slate-700 border-dashed hover:border-green-500"
          >
            + {{ t("quiz.form.addQuestion") }}
          </button>
        </div>
      </aside>

      <div class="flex-1 w-full max-w-4xl">
        <header class="mb-8 mt-4">
          <h1
            class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            {{
              isEditMode ? t("quiz.form.editTitle") : t("quiz.form.createTitle")
            }}
          </h1>
          <p
            class="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium mt-2 flex items-center gap-2"
          >
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            {{ form.title || t("quiz.form.title") + "..." }}
          </p>
        </header>

        <Transition name="fade">
          <div
            v-if="errorMessage"
            class="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-center gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-red-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p class="text-red-700 dark:text-red-400 font-bold text-sm">
              {{ errorMessage }}
            </p>
          </div>
        </Transition>

        <form @submit.prevent="handleSubmit" class="space-y-8 relative">
          <section
            class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label
                  class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1"
                  >{{ t("quiz.form.title") }}</label
                >
                <input
                  v-model="form.title"
                  type="text"
                  class="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label
                  class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1"
                  >{{ t("quiz.form.description") }}</label
                >
                <input
                  v-model="form.description"
                  type="text"
                  class="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-slate-900 dark:text-white outline-none transition-all"
                />
              </div>
            </div>

            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800"
            >
              <label
                class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div class="flex flex-col">
                  <span
                    class="text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >{{ t("quiz.form.visible") }}</span
                  >
                  <span class="text-[10px] text-slate-500 uppercase">{{
                    t("quiz.form.statusPublic")
                  }}</span>
                </div>
                <div class="relative inline-flex items-center">
                  <input
                    v-model="form.isVisible"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"
                  ></div>
                </div>
              </label>

              <label
                class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div class="flex flex-col">
                  <span
                    class="text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >{{ t("quiz.form.playable") }}</span
                  >
                  <span class="text-[10px] text-slate-500 uppercase">{{
                    t("quiz.form.statusPlay")
                  }}</span>
                </div>
                <div class="relative inline-flex items-center">
                  <input
                    v-model="form.isPlayable"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"
                  ></div>
                </div>
              </label>

              <label
                v-if="isAdmin"
                class="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border border-blue-100/50 dark:border-blue-900/30"
              >
                <div class="flex flex-col">
                  <span
                    class="text-sm font-semibold text-blue-700 dark:text-blue-400"
                    >{{ t("quiz.form.verified") }}</span
                  >
                  <span class="text-[10px] text-blue-500/80 uppercase">{{
                    t("quiz.form.statusVerified")
                  }}</span>
                </div>
                <div class="relative inline-flex items-center">
                  <input
                    v-model="form.isVerified"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"
                  ></div>
                </div>
              </label>

              <label
                v-if="isAdmin"
                class="flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-100/50 dark:border-indigo-900/30"
              >
                <div class="flex flex-col">
                  <span
                    class="text-sm font-semibold text-indigo-700 dark:text-indigo-400"
                    >{{ t("quiz.form.official") }}</span
                  >
                  <span class="text-[10px] text-indigo-500/80 uppercase">{{
                    t("quiz.form.statusAdmin")
                  }}</span>
                </div>
                <div class="relative inline-flex items-center">
                  <input
                    v-model="form.isOfficial"
                    @change="toggleOfficial"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"
                  ></div>
                </div>
              </label>
            </div>
          </section>

          <div class="space-y-6">
            <TransitionGroup name="list">
              <div
                v-for="(q, index) in form.questions"
                :key="index"
                :id="`question-${index}`"
                class="group relative bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all scroll-mt-32 lg:scroll-mt-24"
              >
                <div class="flex justify-between items-center mb-6">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm"
                    >
                      {{ index + 1 }}
                    </span>
                    <span
                      class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest"
                    >
                      {{ t("quiz.form.questionNumber") }}
                    </span>
                  </div>
                  <button
                    type="button"
                    v-if="form.questions.length > 1"
                    @click="removeQuestion(index)"
                    class="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div class="space-y-6">
                  <input
                    v-model="q.text"
                    type="text"
                    :placeholder="t('quiz.form.questionPlaceholder')"
                    class="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-lg sm:text-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-slate-400/70"
                  />

                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                      class="bg-green-50/50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100/50 dark:border-green-900/30 flex flex-col gap-3"
                    >
                      <label
                        class="text-[11px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-1"
                        >✓ {{ t("quiz.form.correctAnswer") }}</label
                      >
                      <input
                        v-model="q.correctAnswer"
                        type="text"
                        class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-800/50 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
                      />
                    </div>

                    <div
                      class="bg-red-50/50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100/50 dark:border-red-900/30 flex flex-col gap-3"
                    >
                      <label
                        class="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-1"
                        >✕ {{ t("quiz.form.wrongAnswers") }}</label
                      >
                      <div class="flex flex-col gap-3">
                        <input
                          v-for="(_, dIndex) in q.distractors"
                          :key="dIndex"
                          v-model="q.distractors[dIndex]"
                          type="text"
                          :placeholder="
                            t('quiz.form.wrongAnswers') + ` ${dIndex + 1}`
                          "
                          class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800/50 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <button
              type="button"
              @click="addQuestion"
              class="w-full py-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 dark:text-slate-400 font-semibold hover:border-green-500 dark:hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ t("quiz.form.addQuestion") }}
            </button>
          </div>

          <div class="sticky bottom-6 z-10 w-full mt-10">
            <div
              class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg p-4 sm:p-5 rounded-4xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center justify-between"
            >
              <div
                class="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400 px-2"
              >
                {{ t("quiz.maxQuestions") }}:
                <span class="font-bold text-slate-800 dark:text-white">{{
                  form.questions.length
                }}</span>
              </div>

              <div class="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  @click="router.push('/quiz')"
                  class="px-6 py-4 rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  {{ t("common.cancel") }}
                </button>

                <button
                  type="submit"
                  :disabled="quizStore.loading"
                  class="flex-1 sm:flex-none min-w-50 py-4 px-8 bg-green-600 dark:bg-green-500 text-white rounded-2xl font-bold text-lg hover:bg-green-700 dark:hover:bg-green-400 active:scale-[0.98] disabled:opacity-70 transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-600/20"
                >
                  <span
                    v-if="quizStore.loading"
                    class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                  ></span>
                  <span>{{
                    quizStore.loading
                      ? t("common.loading")
                      : isEditMode
                        ? t("quiz.form.update")
                        : t("quiz.form.save")
                  }}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

html {
  scroll-behavior: smooth;
}
</style>
