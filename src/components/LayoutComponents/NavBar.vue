<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import AuthModal from "@/components/Modals/Auth.vue";
import { useUserStore } from "@/stores/user";
import { useCloudinary } from "@/composables/useCloudinary";

const { t, locale } = useI18n();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { getAvatarUrl } = useCloudinary();

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

const avatarUrl = computed(() =>
  getAvatarUrl(userStore.profile?.cloudinaryPublicId, 80),
);

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
    class="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-all duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 sm:h-20">
        <router-link to="/" class="flex items-center gap-3 group shrink-0">
          <div
            class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors"
          >
            <img
              src="/QuizWizLogo.png"
              alt="Logo"
              class="h-7 w-7 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
            />
          </div>
          <span
            class="text-xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-green-600 to-emerald-800 dark:from-green-400 dark:to-emerald-200"
          >
            QuizWiz
          </span>
        </router-link>

        <div
          class="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50"
        >
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="px-5 py-2 rounded-full text-sm font-bold transition-all duration-300"
            :class="[
              route.path === link.path
                ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-300 hover:bg-white/50 dark:hover:bg-slate-700/50',
            ]"
          >
            {{ t(link.name) }}
          </router-link>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="toggleDarkMode"
            class="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <span
              class="text-lg transform transition-transform duration-500 hover:rotate-90"
            >
              {{ isDark ? "☀️" : "🌙" }}
            </span>
          </button>

          <div class="relative" ref="dropdownRef">
            <button
              @click.stop="isLangMenuOpen = !isLangMenuOpen"
              class="flex items-center gap-2 h-9 px-3 rounded-full border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 transition-colors bg-white dark:bg-slate-900"
            >
              <img
                :src="languages.find((l) => l.code === locale)?.flag"
                class="w-4 h-3 object-cover rounded-sm"
                alt=""
              />
              <span
                class="hidden sm:block text-xs font-bold uppercase text-slate-700 dark:text-slate-300"
              >
                {{ locale }}
              </span>
              <span
                class="text-[10px] text-slate-400 transition-transform duration-300"
                :class="{ 'rotate-180': isLangMenuOpen }"
                >▼</span
              >
            </button>

            <transition name="pop">
              <div
                v-if="isLangMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-1.5 z-50 overflow-hidden"
              >
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  @click="setLanguage(lang.code)"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
                  :class="
                    locale === lang.code
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  "
                >
                  <img :src="lang.flag" class="w-5 h-auto rounded shadow-sm" />
                  <span>{{ lang.name }}</span>
                  <span
                    v-if="locale === lang.code"
                    class="ml-auto text-green-500"
                    >✓</span
                  >
                </button>
              </div>
            </transition>
          </div>

          <div
            class="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"
          ></div>

          <div class="hidden sm:flex items-center gap-3">
            <template v-if="authStore.isAuthenticated">
              <router-link
                to="/profile"
                class="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div class="relative">
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    class="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs shadow-md"
                  >
                    🧙‍♂️
                  </div>
                  <div
                    class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"
                  ></div>
                </div>
                <span
                  class="text-sm font-bold text-slate-700 dark:text-slate-200 max-w-25 truncate"
                >
                  {{ authStore.user?.displayName }}
                </span>
              </router-link>

              <button
                @click="handleLogout"
                class="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2"
                :title="t('nav.logout')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </template>

            <template v-else>
              <button
                @click="isModalOpen = true"
                class="group relative px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-green-500/30 overflow-hidden transition-transform active:scale-95"
              >
                <div
                  class="absolute inset-0 bg-linear-to-r from-green-500 to-emerald-600 transition-transform group-hover:scale-105"
                ></div>
                <span class="relative flex items-center gap-2">
                  {{ t("nav.login") }}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </span>
              </button>
            </template>
          </div>

          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="sm:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span
              class="text-2xl leading-none block transform transition-transform duration-300"
              :class="{ 'rotate-90': isMobileMenuOpen }"
            >
              {{ isMobileMenuOpen ? "✕" : "☰" }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <transition name="slide-down">
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-2xl z-40"
      >
        <div class="p-4 space-y-2">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="block px-4 py-3 rounded-xl text-base font-bold transition-all"
            active-class="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 pl-6"
          >
            {{ t(link.name) }}
          </router-link>

          <div class="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>

          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/profile"
              class="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-lg"
              >
                🧙‍♂️
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-slate-900 dark:text-white">{{
                  authStore.user?.displayName
                }}</span>
                <span class="text-xs text-slate-500">Zobacz profil</span>
              </div>
            </router-link>
            <button
              @click="handleLogout"
              class="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              {{ t("nav.logout") }}
            </button>
          </template>

          <template v-else>
            <button
              @click="
                isModalOpen = true;
                isMobileMenuOpen = false;
              "
              class="w-full mt-4 bg-linear-to-r from-green-600 to-emerald-600 text-white px-4 py-3.5 rounded-xl font-bold shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
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
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
