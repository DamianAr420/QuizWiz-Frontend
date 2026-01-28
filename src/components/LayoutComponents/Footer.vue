<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-white border-t border-slate-200 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2 text-slate-400">
          <span class="font-bold text-slate-800">QuizWiz</span>
          <span>&copy; {{ currentYear }}</span>
        </div>

        <div class="flex gap-6 text-sm text-slate-500">
          <a href="#" class="hover:text-indigo-600 transition-colors">
            {{ t("footer.rules") }}
          </a>
          <a href="#" class="hover:text-indigo-600 transition-colors">
            {{ t("footer.privacy") }}
          </a>
          <a href="#" class="hover:text-indigo-600 transition-colors">
            {{ t("footer.contact") }}
          </a>
        </div>

        <div class="text-xs text-slate-400">
          {{ t("footer.builtWith") }}
          <span class="text-indigo-500 font-medium">Tailwind 4.1.18</span>
        </div>
      </div>
    </div>
  </footer>
</template>
