<script setup lang="ts">
import { watch } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  priority: "High" | "Medium" | "Low";
  loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["confirm", "close"]);
const { t } = useI18n();

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
  { immediate: true },
);

const priorityClasses = {
  High: "bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white shadow-red-200 dark:shadow-none",
  Medium:
    "bg-orange-500 dark:bg-orange-500 hover:bg-orange-600 dark:hover:bg-orange-400 text-white shadow-orange-200 dark:shadow-none",
  Low: "bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400 text-white shadow-green-200 dark:shadow-none",
};

const iconColors = {
  High: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
  Medium:
    "text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30",
  Low: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300"
    >
      <div
        class="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
        @click="emit('close')"
      ></div>

      <div
        class="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 overflow-hidden animate-pop"
      >
        <div class="p-6 sm:p-8">
          <div
            :class="[
              'w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-xl transition-colors duration-300',
              iconColors[priority],
            ]"
          >
            <span v-if="priority === 'High'">⚠️</span>
            <span v-else-if="priority === 'Medium'">⚡</span>
            <span v-else>ℹ️</span>
          </div>

          <h3
            class="text-xl font-black text-slate-800 dark:text-white mb-2 leading-tight"
          >
            {{ title }}
          </h3>
          <p
            class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8"
          >
            {{ description }}
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="emit('close')"
              :disabled="loading"
              class="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800 cursor-pointer disabled:opacity-50"
            >
              {{ t("common.cancel") }}
            </button>
            <button
              @click="emit('confirm')"
              :disabled="loading"
              :class="[
                'flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer',
                priorityClasses[priority],
              ]"
            >
              {{ loading ? t("auth.loading") : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-pop {
  animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
