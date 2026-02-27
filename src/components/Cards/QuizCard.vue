<script setup lang="ts">
import type { Quiz } from "@/types/quiz";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
  quiz: Quiz;
  isAuthor: boolean;
  hasFullAccess: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "click", quiz: Quiz): void;
  (e: "edit", id: number): void;
  (e: "delete", id: number): void;
  (e: "submit", id: number): void;
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
        v-if="quiz.isOfficial"
        class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-amber-500 text-white shadow-lg flex items-center gap-1"
      >
        👑 {{ t("quiz.status.official") }}
      </span>

      <span
        v-else-if="quiz.isVerified"
        class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-blue-500 text-white shadow-lg flex items-center gap-1"
      >
        ✅ {{ t("quiz.status.verified") }}
      </span>

      <span
        v-if="quiz.isSubmitted && !quiz.isVerified"
        class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shadow-sm flex items-center gap-1 animate-pulse"
      >
        ⏳ {{ t("quiz.status.pending") }}
      </span>

      <span
        v-if="!quiz.isVisible"
        class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg"
      >
        🔒 {{ t("quiz.status.private") }}
      </span>

      <span
        v-if="isAuthor && !quiz.isOfficial"
        class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800 backdrop-blur-sm"
      >
        👤 {{ t("quiz.status.yours") }}
      </span>
    </div>

    <div v-if="hasFullAccess" class="absolute top-26 right-8 flex gap-2 z-20">
      <button
        v-if="isAuthor && !quiz.isSubmitted && !quiz.isVerified"
        @click.stop="emit('submit', quiz.id)"
        class="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 shadow-sm"
        :title="t('quiz.form.save')"
      >
        📤
      </button>
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
      class="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-colors"
      :class="[
        quiz.isOfficial
          ? 'bg-amber-100 dark:bg-amber-900/10'
          : quiz.isVerified
            ? 'bg-blue-100 dark:bg-blue-900/10'
            : 'bg-green-50 dark:bg-green-900/10',
      ]"
    ></div>

    <div class="relative w-20 h-20 mb-8">
      <div
        class="absolute inset-0 rounded-3xl rotate-6 opacity-10 dark:opacity-20"
        :class="[
          quiz.isOfficial
            ? 'bg-amber-500'
            : quiz.isVerified
              ? 'bg-blue-500'
              : 'bg-green-500',
        ]"
      ></div>
      <div
        class="absolute inset-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-center text-4xl transition-colors"
      >
        <span v-if="quiz.isOfficial">🏆</span>
        <span v-else-if="quiz.isVerified">⭐</span>
        <span v-else>🚀</span>
      </div>
    </div>

    <div class="relative z-10">
      <h3
        class="text-2xl font-black text-slate-800 dark:text-white mb-3 pr-16 transition-colors custom-line-clamp-1"
        :class="[
          quiz.isOfficial
            ? 'group-hover:text-amber-500'
            : quiz.isVerified
              ? 'group-hover:text-blue-500'
              : 'group-hover:text-green-600',
        ]"
        :title="quiz.title"
      >
        {{ quiz.title }}
      </h3>

      <p
        class="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 h-12 custom-line-clamp-2"
        :title="quiz.description"
      >
        {{ quiz.description }}
      </p>

      <div class="flex flex-wrap gap-3 relative z-10 group-hover/tooltip:z-40">
        <div
          class="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700"
        >
          <span class="text-lg">📋</span>
          <span class="text-xs font-black uppercase tracking-tighter">
            {{ quiz.questionsCount }} {{ t("quiz.stats.questions") }}
          </span>
        </div>

        <div class="inline-block relative group/tooltip">
          <div
            class="flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all"
            :class="[
              quiz.isCompletedToday ? 'cursor-help' : 'cursor-default',
              quiz.isCompletedToday
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800 opacity-80'
                : quiz.isOfficial || quiz.isVerified
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700',
            ]"
          >
            <span class="text-lg">
              {{
                quiz.isCompletedToday
                  ? "⏳"
                  : quiz.isOfficial || quiz.isVerified
                    ? "💰"
                    : "🍃"
              }}
            </span>
            <span class="text-xs font-black uppercase tracking-tighter">
              {{
                quiz.isCompletedToday
                  ? quiz.isOfficial || quiz.isVerified
                    ? "40%"
                    : "8%"
                  : quiz.isOfficial || quiz.isVerified
                    ? "100%"
                    : "20%"
              }}
              EXP
            </span>
          </div>

          <div
            v-if="quiz.isCompletedToday"
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 overflow-hidden bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl opacity-0 scale-90 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-300 pointer-events-none z-50 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <div
              class="h-1 w-full bg-linear-to-r from-amber-400 via-amber-500 to-amber-600"
            ></div>
            <div class="p-3">
              <div class="flex items-center gap-2 mb-1.5">
                <span
                  class="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 text-[10px]"
                  >⚠️</span
                >
                <span
                  class="text-amber-400 font-bold uppercase tracking-widest text-[9px]"
                  >{{ t("quiz.limitTitle") }}</span
                >
              </div>
              <p class="text-slate-300 text-[10px] leading-relaxed text-left">
                {{ t("quiz.alreadyDoneToday") }}
              </p>
              <div
                class="mt-2 pt-2 border-t border-slate-700/50 flex justify-between items-center"
              >
                <span class="text-slate-500 text-[8px] uppercase font-medium">{{
                  t("quiz.multiplier")
                }}</span>
                <span class="text-amber-500 font-black text-[10px]"
                  >x0.4 EXP</span
                >
              </div>
            </div>
            <div
              class="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900/95"
            ></div>
          </div>
        </div>

        <div
          class="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700"
        >
          <span class="text-lg">⏱️</span>
          <span class="text-xs font-black uppercase tracking-tighter"
            >{{ quiz.timeLimitSeconds }}s</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.custom-line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
