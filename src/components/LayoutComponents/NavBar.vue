<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import AuthModal from "@/components/Modals/Auth.vue";

const { t, locale } = useI18n();
const authStore = useAuthStore();
const isModalOpen = ref(false);
const isLangMenuOpen = ref(false);

const languages = [
  {
    code: "pl",
    name: "Polski",
    flag: "https://flagcdn.com/w40/pl.png",
  },
  {
    code: "en",
    name: "English",
    flag: "https://flagcdn.com/w40/gb.png",
  },
];

const setLanguage = (code: string) => {
  locale.value = code;
  isLangMenuOpen.value = false;
};

const dropdownRef = ref<HTMLElement | null>(null);
const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isLangMenuOpen.value = false;
  }
};

onMounted(() => window.addEventListener("click", closeDropdown));
onUnmounted(() => window.removeEventListener("click", closeDropdown));

const navLinks = [
  { name: "nav.start", path: "/" },
  { name: "nav.play", path: "/quiz" },
  { name: "nav.ranking", path: "/leaderboard" },
];
</script>

<template>
  <nav class="bg-indigo-700 text-white shadow-md relative z-40">
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center"
    >
      <div class="flex items-center gap-8">
        <router-link to="/" class="flex items-center gap-2 group">
          <span class="text-2xl transition-transform group-hover:rotate-12"
            >🧙‍♂️</span
          >
          <span class="text-xl font-bold tracking-tight">QuizWiz</span>
        </router-link>

        <div class="hidden md:flex gap-2">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors"
            active-class="bg-indigo-800 text-indigo-100"
          >
            {{ t(link.name) }}
          </router-link>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative" ref="dropdownRef">
          <button
            @click.stop="isLangMenuOpen = !isLangMenuOpen"
            class="flex items-center gap-2 text-xs font-bold bg-indigo-800 px-3 py-2 rounded-lg hover:bg-indigo-600 border border-indigo-400/30 transition-all uppercase"
          >
            <img
              :src="languages.find((l) => l.code === locale)?.flag"
              class="w-4 h-auto rounded-sm"
              alt=""
            />
            <span>{{ locale }}</span>
            <span
              class="text-[10px] opacity-60 transition-transform"
              :class="{ 'rotate-180': isLangMenuOpen }"
              >▼</span
            >
          </button>

          <transition name="pop">
            <div
              v-if="isLangMenuOpen"
              class="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden"
            >
              <button
                v-for="lang in languages"
                :key="lang.code"
                @click="setLanguage(lang.code)"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                :class="{
                  'bg-indigo-50 text-indigo-700 font-bold':
                    locale === lang.code,
                }"
              >
                <img
                  :src="lang.flag"
                  class="w-5 h-auto rounded-sm shadow-xs"
                  alt=""
                />
                <span>{{ lang.name }}</span>
              </button>
            </div>
          </transition>
        </div>

        <div class="h-6 w-px bg-indigo-500/50 mx-1"></div>

        <template v-if="authStore.isAuthenticated">
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium">{{
              authStore.user?.displayName
            }}</span>
            <button
              @click="authStore.logout"
              class="text-xs bg-red-500/20 hover:bg-red-500 px-3 py-1.5 rounded-md transition-colors font-bold uppercase tracking-wider"
            >
              {{ t("nav.logout") }}
            </button>
          </div>
        </template>
        <template v-else>
          <button
            @click="isModalOpen = true"
            class="bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 shadow-sm transition-all active:scale-95"
          >
            {{ t("nav.login") }}
          </button>
        </template>
      </div>
    </div>

    <AuthModal :is-open="isModalOpen" @close="isModalOpen = false" />
  </nav>
</template>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
