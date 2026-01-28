<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <div class="text-center py-12">
    <h2 class="text-4xl font-extrabold text-slate-900 mb-4">
      {{ t("home.title") }}
    </h2>
    <p class="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
      {{ t("home.description") }}
    </p>
    <button
      @click="$router.push('/quiz')"
      class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all scale-100 hover:scale-105"
    >
      {{ t("home.cta") }}
    </button>
  </div>
</template>
