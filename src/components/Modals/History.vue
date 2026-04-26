<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStatsStore } from "@/stores/stats";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(["close"]);
const { t } = useI18n();
const statsStore = useStatsStore();

const page = ref(1);
const loadingMore = ref(false);

const loadMore = async () => {
  loadingMore.value = true;
  page.value++;
  await statsStore.fetchHistory(page.value, 10);
  loadingMore.value = false;
};

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      page.value = 1;
      statsStore.fetchHistory(1, 10);
    }
    if (val) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="emit('close')"
    ></div>
    <div
      class="relative w-full max-w-lg bg-white dark:bg-[#151e32] rounded-3xl shadow-2xl p-6 overflow-hidden"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-black text-slate-800 dark:text-white">
          {{ t("profile.history.title") }}
        </h3>
        <button
          @click="emit('close')"
          class="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <div class="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
        <div
          v-for="attempt in statsStore.attempts"
          :key="attempt.id"
          class="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
        >
          <div>
            <p class="font-bold text-slate-800 dark:text-white">
              {{ attempt.quizTitle }}
            </p>
            <p class="text-xs text-slate-400">
              {{ new Date(attempt.completedAt).toLocaleDateString() }}
            </p>
          </div>
          <div class="text-lg font-black text-green-600">
            {{ attempt.score }}
            <span class="text-xs text-slate-400"
              >/ {{ attempt.totalQuestions }}</span
            >
          </div>
        </div>
      </div>

      <button
        v-if="statsStore.attempts.length < statsStore.totalAttempts"
        @click="loadMore"
        :disabled="statsStore.loading"
        class="w-full mt-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        {{ statsStore.loading ? t("common.loading") : t("common.loadMore") }}
      </button>
    </div>
  </div>
</template>
