<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer
    class="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-2 text-slate-400">
          <span
            class="font-bold text-slate-800 dark:text-white transition-colors"
          >
            QuizWiz
          </span>
          <span class="text-sm">&copy; {{ currentYear }}</span>
        </div>

        <div class="flex gap-6 text-sm font-medium">
          <a
            href="#"
            class="text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {{ t("footer.rules") }}
          </a>
          <a
            href="#"
            class="text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {{ t("footer.privacy") }}
          </a>
          <a
            href="#"
            class="text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {{ t("footer.contact") }}
          </a>
        </div>

        <div class="text-xs text-slate-400 flex items-center gap-1.5">
          {{ t("footer.builtWith") }}
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-green-600 dark:text-green-400 font-bold border border-slate-200 dark:border-slate-700"
          >
            Tailwind 4.1.18
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>
