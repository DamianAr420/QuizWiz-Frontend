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
    class="group relative bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_10px_40_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden"
    :class="[
      quiz.isPlayable
        ? 'cursor-pointer hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(79,70,229,0.12)] hover:border-indigo-100'
        : 'cursor-not-allowed opacity-80 grayscale-[0.3]',
    ]"
  >
    <div class="absolute top-8 right-8 flex flex-col gap-2 items-end z-20">
      <span
        v-if="!quiz.isVisible"
        class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-slate-900 text-white shadow-lg"
      >
        🔒 {{ t("quiz.status.private") }}
      </span>
      <span
        v-if="isAuthor"
        class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 backdrop-blur-sm"
      >
        👤 {{ t("quiz.status.yours") }}
      </span>
    </div>

    <div v-if="hasFullAccess" class="absolute top-26 right-8 flex gap-2 z-20">
      <button
        @click.stop="emit('edit', quiz.id)"
        class="p-3 bg-white/90 backdrop-blur-md hover:bg-indigo-100 hover:text-indigo-600 rounded-2xl transition-all border border-slate-200 hover:border-indigo-200 shadow-sm"
      >
        ✏️
      </button>
      <button
        @click.stop="emit('delete', quiz.id)"
        class="p-3 bg-white/90 backdrop-blur-md hover:bg-red-100 hover:text-red-600 rounded-2xl transition-all border border-slate-200 hover:border-red-200 shadow-sm"
      >
        🗑️
      </button>
    </div>

    <div
      class="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors"
    ></div>

    <div class="relative w-20 h-20 mb-8">
      <div
        class="absolute inset-0 bg-linear-to-br from-indigo-500 to-purple-600 rounded-3xl rotate-6 opacity-10"
      ></div>
      <div
        class="absolute inset-0 bg-white shadow-sm border border-slate-100 rounded-3xl flex items-center justify-center text-4xl"
      >
        {{ quiz.isOfficial ? "🏆" : "🚀" }}
      </div>
    </div>

    <div class="relative z-10">
      <h3
        class="text-2xl font-black text-slate-800 mb-3 line-clamp-1 pr-16 group-hover:text-indigo-600 transition-colors"
      >
        {{ quiz.title }}
      </h3>
      <p
        class="text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2 h-12"
      >
        {{ quiz.description }}
      </p>

      <div class="flex flex-wrap gap-3">
        <div
          class="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100"
        >
          <span class="text-lg">📋</span>
          <span class="text-xs font-black uppercase tracking-tighter">
            {{ quiz.questionsCount }} {{ t("quiz.stats.questions") }}
          </span>
        </div>
        <div
          class="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100"
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
