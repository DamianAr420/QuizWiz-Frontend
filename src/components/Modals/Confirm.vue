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
  High: "bg-red-600 hover:bg-red-700 text-white shadow-red-200",
  Medium: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200",
  Low: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200",
};

const iconColors = {
  High: "text-red-600 bg-red-50",
  Medium: "text-orange-500 bg-orange-50",
  Low: "text-blue-600 bg-blue-50",
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        @click="emit('close')"
      ></div>

      <div
        class="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-pop"
      >
        <div class="p-6 sm:p-8">
          <div
            :class="[
              'w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-xl',
              iconColors[priority],
            ]"
          >
            <span v-if="priority === 'High'">⚠️</span>
            <span v-else-if="priority === 'Medium'">⚡</span>
            <span v-else>ℹ️</span>
          </div>

          <h3 class="text-xl font-black text-slate-800 mb-2 leading-tight">
            {{ title }}
          </h3>
          <p class="text-slate-500 text-sm leading-relaxed mb-8">
            {{ description }}
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="emit('close')"
              :disabled="loading"
              class="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors border border-slate-100 cursor-pointer"
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
