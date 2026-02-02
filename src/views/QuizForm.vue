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
  isVisible: true,
  isPlayable: true,
  questions: [{ text: "", correctAnswer: "", distractors: ["", "", ""] }],
});

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
        isVisible: data.isVisible,
        isPlayable: data.isPlayable,
        questions: data.questions.map((q) => ({
          text: q.text,
          correctAnswer: q.correctAnswer,
          distractors: [...q.distractors],
        })),
      };

      if (data.authorId?.toString() !== authStore.user?.id.toString()) {
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
  <div class="max-w-4xl mx-auto p-6 pb-24">
    <header class="mb-12 flex justify-between items-end">
      <div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">
          {{
            isEditMode ? t("quiz.form.editTitle") : t("quiz.form.createTitle")
          }}
        </h1>
        <p class="text-slate-500 font-medium mt-2">{{ form.title || "..." }}</p>
      </div>
    </header>

    <form @submit.prevent="handleSubmit" class="space-y-10">
      <section
        class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-black text-slate-700 uppercase tracking-widest ml-1"
            >
              {{ t("quiz.form.title") }}
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-black text-slate-700 uppercase tracking-widest ml-1"
            >
              {{ t("quiz.form.description") }}
            </label>
            <input
              v-model="form.description"
              type="text"
              required
              class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          <label
            class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <input
              v-model="form.isVisible"
              type="checkbox"
              class="w-5 h-5 rounded border-slate-300 text-indigo-600"
            />
            <div class="flex flex-col">
              <span class="text-sm font-bold text-slate-700">{{
                t("quiz.form.visible")
              }}</span>
              <span class="text-[10px] text-slate-400 uppercase font-black">{{
                t("quiz.form.statusPublic")
              }}</span>
            </div>
          </label>

          <label
            class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <input
              v-model="form.isPlayable"
              type="checkbox"
              class="w-5 h-5 rounded border-slate-300 text-indigo-600"
            />
            <div class="flex flex-col">
              <span class="text-sm font-bold text-slate-700">{{
                t("quiz.form.playable")
              }}</span>
              <span class="text-[10px] text-slate-400 uppercase font-black">{{
                t("quiz.form.statusPlay")
              }}</span>
            </div>
          </label>

          <label
            v-if="isAdmin"
            class="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
            <input
              v-model="form.isOfficial"
              type="checkbox"
              class="w-5 h-5 rounded border-indigo-300 text-indigo-600"
            />
            <div class="flex flex-col">
              <span class="text-sm font-bold text-indigo-700">{{
                t("quiz.form.official")
              }}</span>
              <span class="text-[10px] text-indigo-400 uppercase font-black">{{
                t("quiz.form.statusAdmin")
              }}</span>
            </div>
          </label>
        </div>
      </section>

      <div class="space-y-8">
        <div
          v-for="(q, index) in form.questions"
          :key="index"
          class="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-xl transition-all"
        >
          <div class="flex justify-between items-center mb-8">
            <span
              class="bg-indigo-600 text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter"
            >
              {{ t("quiz.form.questionNumber") }} #{{ index + 1 }}
            </span>
            <button
              type="button"
              v-if="form.questions.length > 1"
              @click="removeQuestion(index)"
              class="text-red-400 hover:text-red-600 font-bold text-sm p-2 transition-colors"
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
              class="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-lg outline-none focus:border-indigo-500 transition-all"
            />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label
                  class="text-[10px] font-black text-green-600 uppercase tracking-widest ml-2"
                  >{{ t("quiz.form.correctAnswer") }}</label
                >
                <input
                  v-model="q.correctAnswer"
                  type="text"
                  required
                  class="w-full px-6 py-4 bg-green-50 border border-green-100 rounded-2xl outline-none"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label
                  class="text-[10px] font-black text-red-600 uppercase tracking-widest ml-2"
                  >{{ t("quiz.form.wrongAnswers") }}</label
                >
                <div class="space-y-2">
                  <input
                    v-for="(_, dIndex) in q.distractors"
                    :key="dIndex"
                    v-model="q.distractors[dIndex]"
                    type="text"
                    required
                    class="w-full px-6 py-3 bg-red-50 border border-red-100 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <button
          type="button"
          @click="addQuestion"
          class="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all"
        >
          + {{ t("quiz.form.addQuestion") }}
        </button>
        <button
          type="submit"
          :disabled="quizStore.loading"
          class="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
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
