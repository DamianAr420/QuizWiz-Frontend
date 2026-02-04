<script setup lang="ts">
import type { Quiz } from "@/types/quiz";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
  quiz: Quiz;
  isAuthor: boolean;
  hasFullAccess: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "click", quiz: Quiz): void;
  (e: "edit", id: number): void;
  (e: "delete", id: number): void;
}>();
</script>

<template>
  <div
    @click="emit('click', quiz)"
    class="group relative bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden"
    :class="[
      quiz.isPlayable
        ? 'cursor-pointer hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(22,163,74,0.12)] hover:border-green-100 dark:hover:border-green-900/50'
        : 'cursor-not-allowed opacity-80 grayscale-[0.3]',
    ]"
  >
    <div class="absolute top-8 right-8 flex flex-col gap-2 items-end z-20">
      <span
        v-if="!quiz.isVisible"
        class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg"
      >
        🔒 {{ t("quiz.status.private") }}
      </span>
      <span
        v-if="isAuthor"
        class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800 backdrop-blur-sm"
      >
        👤 {{ t("quiz.status.yours") }}
      </span>
    </div>

    <div v-if="hasFullAccess" class="absolute top-26 right-8 flex gap-2 z-20">
      <button
        @click.stop="emit('edit', quiz.id)"
        class="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-600 dark:hover:text-green-400 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-700 shadow-sm"
      >
        ✏️
      </button>
      <button
        @click.stop="emit('delete', quiz.id)"
        class="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-700 shadow-sm"
      >
        🗑️
      </button>
    </div>

    <div
      class="absolute -bottom-20 -right-20 w-40 h-40 bg-green-50 dark:bg-green-900/10 rounded-full blur-3xl group-hover:bg-green-100 dark:group-hover:bg-green-900/20 transition-colors"
    ></div>

    <div class="relative w-20 h-20 mb-8">
      <div
        class="absolute inset-0 bg-linear-to-br from-green-500 to-emerald-600 rounded-3xl rotate-6 opacity-10 dark:opacity-20"
      ></div>
      <div
        class="absolute inset-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-center text-4xl transition-colors"
      >
        {{ quiz.isOfficial ? "🏆" : "🚀" }}
      </div>
    </div>

    <div class="relative z-10">
      <h3
        class="text-2xl font-black text-slate-800 dark:text-white mb-3 line-clamp-1 pr-16 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
      >
        {{ quiz.title }}
      </h3>
      <p
        class="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 line-clamp-2 h-12"
      >
        {{ quiz.description }}
      </p>

      <div class="flex flex-wrap gap-3">
        <div
          class="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700"
        >
          <span class="text-lg">📋</span>
          <span class="text-xs font-black uppercase tracking-tighter">
            {{ quiz.questionsCount }} {{ t("quiz.stats.questions") }}
          </span>
        </div>
        <div
          class="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700"
        >
          <span class="text-lg">⏱️</span>
          <span class="text-xs font-black uppercase tracking-tighter">
            {{ quiz.timeLimitSeconds }}s / {{ t("quiz.stats.perQuestion") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
