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

const toggleOfficial = () => {
  if (form.value.isOfficial) {
    form.value.isVerified = true;
  } else {
    form.value.isVerified = false;
  }
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

      if (
        data.authorId?.toString() !== authStore.user?.id.toString() &&
        !isAdmin.value
      ) {
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
};

const removeQuestion = (index: number) => {
  form.value.questions.splice(index, 1);
};

const handleSubmit = async () => {
  try {
    if (isEditMode.value) {
      await quizStore.updateQuiz(Number(route.params.id), form.value);
    } else {
      await quizStore.createQuiz(form.value);
    }
    router.push("/quiz");
  } catch (error) {
    console.error(t("common.error"), error);
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 pb-24 transition-colors duration-300">
    <header class="mb-12 flex justify-between items-end">
      <div>
        <h1
          class="text-4xl font-black text-slate-900 dark:text-white tracking-tight"
        >
          {{
            isEditMode ? t("quiz.form.editTitle") : t("quiz.form.createTitle")
          }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium mt-2">
          {{ form.title || "..." }}
        </p>
      </div>
    </header>

    <form @submit.prevent="handleSubmit" class="space-y-10">
      <section
        class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1"
            >
              {{ t("quiz.form.title") }}
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-green-500 dark:focus:border-green-400 text-slate-900 dark:text-white outline-none transition-all"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest ml-1"
            >
              {{ t("quiz.form.description") }}
            </label>
            <input
              v-model="form.description"
              type="text"
              required
              class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-green-500 dark:focus:border-green-400 text-slate-900 dark:text-white outline-none transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          <label
            class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-700"
          >
            <input
              v-model="form.isVisible"
              type="checkbox"
              class="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
            />
            <div class="flex flex-col">
              <span
                class="text-sm font-bold text-slate-700 dark:text-slate-200"
                >{{ t("quiz.form.visible") }}</span
              >
              <span class="text-[10px] text-slate-400 uppercase font-black">{{
                t("quiz.form.statusPublic")
              }}</span>
            </div>
          </label>

          <label
            class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-700"
          >
            <input
              v-model="form.isPlayable"
              type="checkbox"
              class="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
            />
            <div class="flex flex-col">
              <span
                class="text-sm font-bold text-slate-700 dark:text-slate-200"
                >{{ t("quiz.form.playable") }}</span
              >
              <span class="text-[10px] text-slate-400 uppercase font-black">{{
                t("quiz.form.statusPlay")
              }}</span>
            </div>
          </label>

          <label
            v-if="isAdmin"
            class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-900/50"
          >
            <input
              v-model="form.isVerified"
              type="checkbox"
              class="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
            />
            <div class="flex flex-col">
              <span class="text-sm font-bold text-blue-700 dark:text-blue-400">
                {{ t("quiz.form.verified") || "Zweryfikowany" }}
              </span>
              <span class="text-[10px] text-blue-400/80 uppercase font-black">
                {{ t("quiz.form.statusVerified") || "100% Nagród" }}
              </span>
            </div>
          </label>

          <label
            v-if="isAdmin"
            class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-900/50"
          >
            <input
              v-model="form.isOfficial"
              @change="toggleOfficial"
              type="checkbox"
              class="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-500"
            />
            <div class="flex flex-col">
              <span
                class="text-sm font-bold text-green-700 dark:text-green-400"
                >{{ t("quiz.form.official") }}</span
              >
              <span
                class="text-[10px] text-green-400/80 uppercase font-black"
                >{{ t("quiz.form.statusAdmin") }}</span
              >
            </div>
          </label>
        </div>
      </section>

      <div class="space-y-8">
        <TransitionGroup name="list">
          <div
            v-for="(q, index) in form.questions"
            :key="index"
            class="group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all"
          >
            <div class="flex justify-between items-center mb-8">
              <span
                class="bg-green-600 dark:bg-green-500 text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm"
              >
                {{ t("quiz.form.questionNumber") }} #{{ index + 1 }}
              </span>
              <button
                type="button"
                v-if="form.questions.length > 1"
                @click="removeQuestion(index)"
                class="text-red-400 hover:text-red-600 dark:hover:text-red-300 font-bold text-sm p-2 transition-colors"
              >
                ✕
              </button>
            </div>

            <div class="space-y-6">
              <input
                v-model="q.text"
                type="text"
                required
                :placeholder="t('quiz.form.questionPlaceholder')"
                class="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-lg text-slate-800 dark:text-white outline-none focus:border-green-500 dark:focus:border-green-400 transition-all"
              />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label
                    class="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest ml-2"
                  >
                    {{ t("quiz.form.correctAnswer") }}
                  </label>
                  <input
                    v-model="q.correctAnswer"
                    type="text"
                    required
                    class="w-full px-6 py-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-slate-800 dark:text-green-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label
                    class="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest ml-2"
                  >
                    {{ t("quiz.form.wrongAnswers") }}
                  </label>
                  <div class="space-y-2">
                    <input
                      v-for="(_, dIndex) in q.distractors"
                      :key="dIndex"
                      v-model="q.distractors[dIndex]"
                      type="text"
                      required
                      class="w-full px-6 py-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-slate-800 dark:text-red-50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <div class="flex flex-col gap-4">
        <button
          type="button"
          @click="addQuestion"
          class="w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] text-slate-400 dark:text-slate-500 font-black hover:border-green-500 dark:hover:border-green-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all"
        >
          + {{ t("quiz.form.addQuestion") }}
        </button>

        <button
          type="submit"
          :disabled="quizStore.loading"
          class="w-full py-6 bg-green-600 dark:bg-green-500 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-green-200 dark:shadow-none hover:bg-green-700 dark:hover:bg-green-400 active:scale-95 disabled:opacity-50 transition-all"
        >
          {{
            quizStore.loading
              ? "..."
              : isEditMode
                ? t("quiz.form.update")
                : t("quiz.form.save")
          }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
