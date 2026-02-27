<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { Quiz } from "@/types/quiz";

const props = defineProps<{
  quiz: Quiz;
}>();

const emit = defineEmits(["close"]);
const { t } = useI18n();
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          @click="emit('close')"
        ></div>

        <div
          class="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 max-h-[90vh] flex flex-col"
        >
          <div class="mb-6 flex justify-between items-start">
            <div>
              <h2
                class="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter"
              >
                {{ quiz.title }}
              </h2>
              <p class="text-slate-500 font-medium">{{ quiz.description }}</p>
            </div>
            <button
              @click="emit('close')"
              class="text-2xl hover:rotate-90 transition-transform dark:text-slate-400"
            >
              ✕
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 pr-2 custom-scroll">
            <div
              v-for="(question, index) in quiz.questions"
              :key="index"
              class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-4xl border border-slate-100 dark:border-slate-700"
            >
              <p
                class="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-2"
              >
                {{ t("admin.preview.question") }} {{ index + 1 }}
              </p>
              <h3
                class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4"
              >
                {{ question.text }}
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  class="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-black flex justify-between items-center"
                >
                  {{ question.correctAnswer }}
                  <span
                    class="text-[10px] uppercase tracking-tighter opacity-70"
                  >
                    {{ t("admin.preview.correct") }}
                  </span>
                </div>
                <div
                  v-for="(dist, dIdx) in question.distractors"
                  :key="dIdx"
                  class="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400"
                >
                  {{ dist }}
                </div>
              </div>
            </div>
          </div>

          <div
            class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm font-bold text-slate-400"
          >
            <div class="flex items-center gap-2">
              <span class="opacity-50 text-lg">⏱️</span>
              {{ t("admin.preview.timeLimit") }}: {{ quiz.timeLimitSeconds }}s /
              {{ t("admin.preview.perQuestion") }}
            </div>
            <div class="flex items-center gap-2">
              <span class="opacity-50 text-lg">📊</span>
              {{ t("admin.preview.totalQuestions") }}:
              {{ quiz.questions?.length || 0 }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scroll::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
