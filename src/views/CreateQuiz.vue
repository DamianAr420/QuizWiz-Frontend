<script setup lang="ts">
import { ref } from "vue";
import { useQuizStore } from "@/stores/quiz";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type { CreateQuizDto } from "@/types/quiz";

const { t } = useI18n();
const router = useRouter();
const quizStore = useQuizStore();

const form = ref<CreateQuizDto>({
  title: "",
  description: "",
  timeLimitSeconds: 30,
  maxQuestions: 10,
  questions: [{ text: "", correctAnswer: "", distractors: ["", "", ""] }],
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
    await quizStore.createQuiz(form.value);
    router.push("/quiz");
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 pb-24">
    <header class="mb-12">
      <h1 class="text-4xl font-black text-slate-900 tracking-tight">
        {{ t("quiz.createTitle") }}
      </h1>
    </header>

    <form @submit.prevent="handleSubmit" class="space-y-10">
      <section
        class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-black text-slate-700 uppercase tracking-widest ml-1"
            >
              {{ t("quiz.title") }}
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-black text-slate-700 uppercase tracking-widest ml-1"
            >
              {{ t("quiz.description") }}
            </label>
            <input
              v-model="form.description"
              type="text"
              required
              class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-black text-slate-700 uppercase tracking-widest ml-1"
            >
              {{ t("quiz.timeLimit") }}
            </label>
            <input
              v-model.number="form.timeLimitSeconds"
              type="number"
              min="5"
              class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-black text-slate-700 uppercase tracking-widest ml-1"
            >
              {{ t("quiz.maxQuestions") }}
            </label>
            <input
              v-model.number="form.maxQuestions"
              type="number"
              min="1"
              class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
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
              {{ t("quiz.questions") }} #{{ index + 1 }}
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
            <div class="flex flex-col gap-2">
              <input
                v-model="q.text"
                type="text"
                required
                placeholder="Treść pytania..."
                class="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-lg outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label
                  class="text-[10px] font-black text-green-600 uppercase tracking-widest ml-2"
                >
                  {{ t("quiz.correctAnswer") }}
                </label>
                <input
                  v-model="q.correctAnswer"
                  type="text"
                  required
                  class="w-full px-6 py-4 bg-green-50 border border-green-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label
                  class="text-[10px] font-black text-red-600 uppercase tracking-widest ml-2"
                >
                  {{ t("quiz.wrongAnswers") }}
                </label>
                <div class="space-y-2">
                  <input
                    v-for="(_, dIndex) in q.distractors"
                    :key="dIndex"
                    v-model="q.distractors[dIndex]"
                    type="text"
                    required
                    class="w-full px-6 py-3 bg-red-50 border border-red-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
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
          class="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all"
        >
          + {{ t("quiz.addQuestion") }}
        </button>

        <button
          type="submit"
          :disabled="quizStore.loading"
          class="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
        >
          {{ quizStore.loading ? "..." : t("quiz.save") }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
