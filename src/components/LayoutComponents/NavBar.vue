<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import AuthModal from "@/components/Modals/Auth.vue";

const { t, locale } = useI18n();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const isModalOpen = ref(false);
const isLangMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
const isDark = ref(false);

const languages = [
  { code: "pl", name: "Polski", flag: "https://flagcdn.com/w40/pl.png" },
  { code: "en", name: "English", flag: "https://flagcdn.com/w40/gb.png" },
];

const setLanguage = (code: string) => {
  locale.value = code;
  isLangMenuOpen.value = false;
  localStorage.setItem("Lang", code);
};

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push("/");
  isMobileMenuOpen.value = false;
};

const navLinks = [
  { name: "nav.start", path: "/" },
  { name: "nav.play", path: "/quiz" },
  { name: "nav.ranking", path: "/leaderboard" },
];

const dropdownRef = ref<HTMLElement | null>(null);
const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isLangMenuOpen.value = false;
  }
};

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  },
);

onMounted(() => {
  const savedLang = localStorage.getItem("Lang");
  if (savedLang) locale.value = savedLang;

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add("dark");
  } else {
    isDark.value = false;
    document.documentElement.classList.remove("dark");
  }

  window.addEventListener("click", closeDropdown);
});

onUnmounted(() => window.removeEventListener("click", closeDropdown));
</script>

<template>
  <nav
    class="bg-green-600 dark:bg-slate-900 text-white shadow-md relative z-40 transition-colors duration-300"
  >
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center"
    >
      <router-link to="/" class="flex items-center gap-2 group shrink-0">
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
          class="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-500 dark:hover:bg-slate-800 transition-colors"
          active-class="bg-green-700 dark:bg-slate-800 text-white"
        >
          {{ t(link.name) }}
        </router-link>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button
          @click="toggleDarkMode"
          class="h-8 w-8 rounded-lg bg-green-700 dark:bg-slate-800 hover:bg-green-500 dark:hover:bg-slate-700 border border-green-400/30 dark:border-slate-700 transition-all shadow-sm active:scale-90"
          :title="isDark ? 'Light Mode' : 'Dark Mode'"
        >
          <span class="text-sm">{{ isDark ? "☀️" : "🌙" }}</span>
        </button>

        <div class="relative" ref="dropdownRef">
          <button
            @click.stop="isLangMenuOpen = !isLangMenuOpen"
            class="flex h-8 items-center gap-2 text-xs font-bold bg-green-700 dark:bg-slate-800 px-2 sm:px-3 py-2 rounded-lg hover:bg-green-500 dark:hover:bg-slate-700 border border-green-400/30 dark:border-slate-700 transition-all uppercase"
          >
            <img
              :src="languages.find((l) => l.code === locale)?.flag"
              class="w-4 h-auto rounded-sm"
              alt=""
            />
            <span class="hidden sm:inline">{{ locale }}</span>
            <span
              class="text-[10px] opacity-60 transition-transform"
              :class="{ 'rotate-180': isLangMenuOpen }"
              >▼</span
            >
          </button>

          <transition name="pop">
            <div
              v-if="isLangMenuOpen"
              class="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 overflow-hidden z-50"
            >
              <button
                v-for="lang in languages"
                :key="lang.code"
                @click="setLanguage(lang.code)"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                :class="{
                  'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold':
                    locale === lang.code,
                }"
              >
                <img :src="lang.flag" class="w-5 h-auto rounded-sm shadow-xs" />
                <span>{{ lang.name }}</span>
              </button>
            </div>
          </transition>
        </div>

        <div
          class="h-6 w-px bg-green-500/50 dark:bg-slate-700 mx-1 hidden sm:block"
        ></div>

        <div class="hidden sm:flex items-center gap-4">
          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/profile"
              class="flex items-center gap-2 group px-2 py-1 rounded-lg hover:bg-green-500 dark:hover:bg-slate-800 transition-all"
            >
              <div
                class="w-8 h-8 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center text-xs border border-green-400 shadow-inner group-hover:scale-110 transition-transform"
              >
                👤
              </div>
              <span class="text-sm font-bold tracking-wide max-w-25 truncate">{{
                authStore.user?.displayName
              }}</span>
            </router-link>
            <button
              @click="handleLogout"
              class="text-xs bg-red-500/20 hover:bg-red-500 px-3 py-1.5 rounded-md transition-colors font-bold uppercase tracking-wider"
            >
              {{ t("nav.logout") }}
            </button>
          </template>
          <template v-else>
            <button
              @click="isModalOpen = true"
              class="bg-white text-green-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-50 shadow-sm transition-all active:scale-95"
            >
              {{ t("nav.login") }}
            </button>
          </template>
        </div>

        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="sm:hidden p-2 rounded-md hover:bg-green-500 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        >
          <span
            class="text-2xl leading-none block transform transition-transform"
            :class="{ 'rotate-90': isMobileMenuOpen }"
          >
            {{ isMobileMenuOpen ? "✕" : "☰" }}
          </span>
        </button>
      </div>
    </div>

    <transition name="slide-down">
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden absolute top-full left-0 w-full bg-green-700 dark:bg-slate-900 border-t border-green-500 dark:border-slate-800 shadow-xl z-50 origin-top"
      >
        <div class="px-4 py-3 space-y-2">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600 dark:hover:bg-slate-800 transition-colors"
            active-class="bg-green-800 dark:bg-slate-800 text-white"
          >
            {{ t(link.name) }}
          </router-link>

          <div class="h-px bg-green-500/30 dark:bg-slate-800 my-2"></div>

          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/profile"
              class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-green-600 dark:hover:bg-slate-800"
            >
              <div
                class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border border-green-400"
              >
                👤
              </div>
              <span class="font-bold">{{ authStore.user?.displayName }}</span>
            </router-link>
            <button
              @click="handleLogout"
              class="w-full text-left px-3 py-2 text-red-300 font-bold uppercase text-sm"
            >
              {{ t("nav.logout") }}
            </button>
          </template>
          <template v-else>
            <button
              @click="
                isModalOpen = true;
                isMobileMenuOpen = false;
              "
              class="w-full mt-2 bg-white text-green-800 px-4 py-2 rounded-lg font-bold text-sm"
            >
              {{ t("nav.login") }}
            </button>
          </template>
        </div>
      </div>
    </transition>

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

.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    transform 0.3s ease-out,
    opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: scaleY(0.95) translateY(-10px);
  opacity: 0;
}
</style>
