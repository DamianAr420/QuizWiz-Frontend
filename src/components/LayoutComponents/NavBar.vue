<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import AuthModal from "@/components/Modals/Auth.vue";
import { useUserStore } from "@/stores/user";
import { useCloudinary } from "@/composables/useCloudinary";
import AnimatedNumber from "../AnimatedNumber.vue";

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
const isPointsBumping = ref(false);

const languages = [
  { code: "pl", name: "Polski", flag: "https://flagcdn.com/w40/pl.png" },
  { code: "en", name: "English", flag: "https://flagcdn.com/w40/gb.png" },
];

const isPlayPage = computed(() => route.path.includes("/quiz"));

const isGameEnded = computed(() => route.query.ended === "true");

const isNavbarSticky = computed(() => {
  if (isPlayPage.value && !isGameEnded.value) {
    return false;
  }
  return true;
});

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
  { name: "nav.shop", path: "/shop" },
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

const miniProgress = computed(() => {
  if (!userStore.profile) return 0;
  return (userStore.profile.experience % 1000) / 10;
});

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  },
);

watch(
  () => userStore.profile?.points,
  () => {
    isPointsBumping.value = true;
    setTimeout(() => {
      isPointsBumping.value = false;
    }, 400);
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
  if (authStore.isAuthenticated) {
    userStore.fetchProfile();
  }
});

onUnmounted(() => window.removeEventListener("click", closeDropdown));
</script>

<template>
  <nav
    class="w-full bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 transition-all duration-300"
    :class="{ 'sticky top-0 z-50': isNavbarSticky, relative: !isNavbarSticky }"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 sm:h-20">
        <div class="flex items-center gap-6 lg:gap-10">
          <router-link to="/" class="flex items-center gap-3 group shrink-0">
            <div
              class="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-br from-green-400/20 to-emerald-600/20 dark:from-green-400/10 dark:to-emerald-500/10 border border-green-500/20 dark:border-green-400/20 group-hover:scale-105 group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all duration-300"
            >
              <img
                src="/QuizWizLogo.png"
                alt="Logo"
                class="h-7 w-7 sm:h-8 sm:w-8 drop-shadow-sm transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
              />
            </div>
            <span
              class="hidden lg:block text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-green-600 via-emerald-600 to-teal-700 dark:from-green-400 dark:via-emerald-400 dark:to-teal-300 drop-shadow-sm"
            >
              QuizWiz
            </span>
          </router-link>

          <div
            class="hidden md:flex items-center p-1.5 rounded-full bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm"
          >
            <router-link
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              class="relative px-5 py-2 rounded-full text-xs lg:text-sm font-bold transition-all duration-300 ease-out"
              :class="[
                route.path === link.path
                  ? 'text-green-700 dark:text-green-300 bg-white dark:bg-slate-700 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-white/50 dark:hover:bg-slate-700/50',
              ]"
            >
              {{ t(link.name) }}
            </router-link>
          </div>
        </div>

        <div class="flex items-center gap-3 sm:gap-5">
          <div
            class="hidden md:flex items-center gap-1.5 p-1 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors"
          >
            <button
              @click="toggleDarkMode"
              class="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-amber-500 dark:hover:text-yellow-400 transition-all active:scale-90"
            >
              <span class="text-lg transition-transform hover:rotate-45">{{
                isDark ? "☀️" : "🌙"
              }}</span>
            </button>

            <div class="relative" ref="dropdownRef">
              <button
                @click.stop="isLangMenuOpen = !isLangMenuOpen"
                class="flex items-center gap-2 h-9 pl-2 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  :src="languages.find((l) => l.code === locale)?.flag"
                  class="w-5 h-3.5 object-cover rounded shadow-sm"
                />
                <span
                  class="text-[10px] font-bold text-slate-400 transition-transform duration-300"
                  :class="{ 'rotate-180': isLangMenuOpen }"
                  >▼</span
                >
              </button>

              <transition name="pop">
                <div
                  v-if="isLangMenuOpen"
                  class="absolute right-0 mt-3 w-44 bg-white dark:bg-[#1a2236] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/50 p-2 z-50 overflow-hidden"
                >
                  <button
                    v-for="lang in languages"
                    :key="lang.code"
                    @click="setLanguage(lang.code)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                    :class="
                      locale === lang.code
                        ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400'
                        : 'text-slate-600 dark:text-slate-300'
                    "
                  >
                    <img
                      :src="lang.flag"
                      class="w-5 h-auto rounded shadow-sm"
                    />
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
          </div>

          <div
            class="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1"
          ></div>

          <template v-if="authStore.isAuthenticated">
            <div class="flex items-center gap-3">
              <div
                class="relative group flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300"
              >
                <div class="hidden sm:flex flex-col items-end gap-0.5">
                  <div
                    class="flex items-center gap-1.5 leading-none transition-transform duration-300"
                    :class="{
                      'scale-110 text-amber-500 font-bold': isPointsBumping,
                    }"
                  >
                    <span
                      class="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                    >
                      {{ t("profile.stats.points") }}
                    </span>
                    <span
                      class="text-sm font-black text-slate-800 dark:text-slate-100"
                    >
                      <AnimatedNumber
                        :value="userStore.profile?.points ?? 0"
                        :duration="800"
                      />
                    </span>
                  </div>

                  <div class="flex items-center gap-2 leading-none">
                    <span
                      class="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-wider"
                    >
                      {{ t("profile.levelShort") }}
                      {{ userStore.profile?.level ?? 1 }}
                    </span>
                    <div
                      class="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                    >
                      <div
                        class="h-full bg-linear-to-r from-green-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out relative"
                        :style="{ width: `${miniProgress}%` }"
                      >
                        <div
                          class="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite]"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <router-link to="/profile" class="relative shrink-0">
                  <div
                    class="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white dark:ring-slate-900 shadow-md group-hover:ring-green-400 transition-all duration-300"
                  >
                    <img
                      v-if="avatarUrl"
                      :src="avatarUrl"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-linear-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white"
                    >
                      🧙‍♂️
                    </div>
                  </div>
                </router-link>
              </div>

              <button
                @click="handleLogout"
                class="hidden md:flex w-10 h-10 items-center justify-center text-slate-400 hover:text-red-500 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </template>

          <template v-else>
            <button
              @click="isModalOpen = true"
              class="relative px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg overflow-hidden hover:-translate-y-0.5 transition-all duration-300"
            >
              <div
                class="absolute inset-0 bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 animate-[gradient_3s_infinite] bg-size-[200%_auto]"
              ></div>
              <span class="relative flex items-center gap-2">
                {{ t("nav.login") }} <span class="text-xs opacity-70">➔</span>
              </span>
            </button>
          </template>

          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2.5 text-slate-600 dark:text-slate-300 rounded-xl"
          >
            <div class="w-6 h-5 relative flex flex-col justify-between">
              <span
                class="w-full h-0.5 bg-current rounded-full transition-all duration-300"
                :class="isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''"
              ></span>
              <span
                class="w-full h-0.5 bg-current rounded-full transition-all duration-300"
                :class="isMobileMenuOpen ? 'opacity-0' : ''"
              ></span>
              <span
                class="w-full h-0.5 bg-current rounded-full transition-all duration-300"
                :class="isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''"
              ></span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <transition name="slide-down">
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#0f172a] backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-2xl z-40"
      >
        <div
          class="flex items-center justify-between px-6 py-4 border-b dark:border-slate-800/50"
        >
          <button
            @click="toggleDarkMode"
            class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold"
          >
            <span>{{ isDark ? "☀️" : "🌙" }}</span>
            {{ isDark ? t("nav.theme.light") : t("nav.theme.dark") }}
          </button>
          <div class="flex gap-2">
            <button
              v-for="lang in languages"
              :key="lang.code"
              @click="setLanguage(lang.code)"
              class="w-8 h-8 flex items-center justify-center rounded-lg border text-[10px] font-black"
              :class="
                locale === lang.code
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-slate-200 text-slate-400'
              "
            >
              {{ lang.code }}
            </button>
          </div>
        </div>

        <div
          v-if="authStore.isAuthenticated"
          class="mx-4 mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-700"
        >
          <div class="flex items-center gap-4 mb-4">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              class="w-14 h-14 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg"
            />
            <div class="flex-1 min-w-0">
              <p class="font-black text-lg truncate">
                {{ authStore.user?.displayName }}
              </p>
              <div
                class="flex items-center gap-4 mt-1 text-[11px] font-bold uppercase"
              >
                <span class="text-green-600"
                  >{{ t("profile.levelShort") }}
                  {{ userStore.profile?.level }}</span
                >
                <span
                  class="flex items-center gap-1 transition-all"
                  :class="{ 'text-amber-500 scale-110': isPointsBumping }"
                >
                  💰
                  <AnimatedNumber
                    :value="userStore.profile?.points ?? 0"
                    :duration="800"
                  />
                </span>
              </div>
            </div>
          </div>
          <div
            class="relative w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
          >
            <div
              class="absolute top-0 left-0 h-full bg-linear-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
              :style="{ width: `${miniProgress}%` }"
            ></div>
          </div>
        </div>

        <div class="p-4 space-y-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="flex items-center justify-between px-5 py-3.5 rounded-xl font-bold"
            :class="
              route.path === link.path
                ? 'bg-green-50 dark:bg-green-900/10 text-green-700'
                : 'text-slate-600 dark:text-slate-300'
            "
          >
            {{ t(link.name) }}
            <span v-if="route.path === link.path" class="text-green-500"
              >●</span
            >
          </router-link>

          <button
            @click="handleLogout"
            class="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-red-500 font-bold"
          >
            {{ t("nav.logout") }}
          </button>
        </div>
      </div>
    </transition>

    <AuthModal :is-open="isModalOpen" @close="isModalOpen = false" />
  </nav>
</template>

<style scoped>
/* Płynne przejście paska postępu */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.pop-enter-active,
.pop-leave-active {
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.9);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: scaleY(0.95) translateY(-10px);
  opacity: 0;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
