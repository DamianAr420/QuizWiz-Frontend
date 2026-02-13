<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useQuizStore } from "@/stores/quiz";
import { useAuthStore } from "@/stores/auth";
import { useShopStore } from "@/stores/shop";
import QuizCard from "@/components/Cards/QuizCard.vue";
import ConfirmModal from "@/components/Modals/Confirm.vue";
import { useCloudinary } from "@/composables/useCloudinary";
import { ItemRarity } from "@/types/shop";
import AnimatedNumber from "@/components/AnimatedNumber.vue";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const quizStore = useQuizStore();
const authStore = useAuthStore();
const shopStore = useShopStore();
const { getAvatarUrl } = useCloudinary();

const isEditing = ref(false);
const isDeleteModalOpen = ref(false);
const isQuizDeleteModalOpen = ref(false);
const quizToDelete = ref<number | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const form = ref({ displayName: "" });

watch(
  () => userStore.profile?.displayName,
  (newVal) => {
    if (newVal) form.value.displayName = newVal;
  },
  { immediate: true },
);

const levelProgress = computed(() => {
  if (!userStore.profile) return 0;
  return (userStore.profile.experience % 1000) / 10;
});

const xpToNextLevel = computed(() => {
  if (!userStore.profile) return 0;
  return 1000 - (userStore.profile.experience % 1000);
});

const accuracy = computed(() => {
  const s = userStore.stats;
  if (!s || s.totalQuestionsAnswered === 0) return 0;
  return Math.round((s.correctAnswers / s.totalQuestionsAnswered) * 100);
});

const myQuizzes = computed(() => {
  return quizStore.quizzes.filter(
    (q) => String(q.authorId) === String(authStore.user?.id) && !q.isOfficial,
  );
});

const avatarUrl = computed(() =>
  getAvatarUrl(userStore.profile?.cloudinaryPublicId, 200),
);

const roleBadgeClass = computed(() => {
  const role = userStore.profile?.role?.toLowerCase();
  if (role === "admin")
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30";
});

onMounted(async () => {
  await Promise.all([
    userStore.fetchProfile(),
    userStore.fetchStats(),
    quizStore.fetchQuizzes(false),
    shopStore.fetchInventory(),
  ]);
});

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

const handleUpdate = async () => {
  try {
    await userStore.updateProfile(form.value.displayName);
    isEditing.value = false;
  } catch (error: any) {
    console.error(error);
  }
};

const triggerFileInput = () => fileInput.value?.click();

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    try {
      await userStore.uploadAvatar(target.files[0]);
    } catch (e) {
      console.error(e);
    }
  }
};

const handleDeleteAccount = async () => {
  try {
    await userStore.deleteAccount();
    isDeleteModalOpen.value = false;
    router.push("/");
  } catch (error: any) {
    isDeleteModalOpen.value = false;
  }
};

const openQuizDelete = (id: number) => {
  quizToDelete.value = id;
  isQuizDeleteModalOpen.value = true;
};

const confirmQuizDelete = async () => {
  if (quizToDelete.value) {
    try {
      await quizStore.deleteQuiz(quizToDelete.value);
      isQuizDeleteModalOpen.value = false;
      quizToDelete.value = null;
    } catch (e) {
      console.error(e);
    }
  }
};
</script>

<template>
  <div class="min-h-screen py-8 sm:py-12 px-4 transition-colors duration-300">
    <div class="max-w-7xl mx-auto space-y-8">
      <div
        class="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#151e32] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800"
      >
        <div
          class="h-32 sm:h-48 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-600 dark:from-green-600 dark:via-emerald-800 dark:to-teal-900 relative"
        >
          <div
            class="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"
          ></div>
          <div
            class="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"
          ></div>
        </div>

        <div class="px-6 sm:px-12 pb-8">
          <div class="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
            <div class="-mt-16 sm:-mt-20 relative group">
              <div
                class="w-32 h-32 sm:w-40 sm:h-40 rounded-4xl p-1.5 bg-white dark:bg-[#151e32] shadow-2xl transition-transform duration-300 group-hover:scale-105"
                @click="triggerFileInput"
              >
                <div
                  class="w-full h-full rounded-[1.7rem] overflow-hidden relative cursor-pointer bg-slate-100 dark:bg-slate-800"
                >
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-4xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
                  >
                    🧙‍♂️
                  </div>

                  <div
                    class="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <span
                      class="text-xs font-bold text-white uppercase tracking-wider border border-white/30 px-3 py-1 rounded-full bg-white/10"
                    >
                      {{ t("profile.changeAvatar") }}
                    </span>
                  </div>

                  <div
                    v-if="userStore.loading"
                    class="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-20"
                  >
                    <div
                      class="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"
                    ></div>
                  </div>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept="image/*"
                @change="handleFileChange"
              />
            </div>

            <div class="flex-1 w-full pt-2 lg:pt-6">
              <div
                class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6"
              >
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <h1
                      class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                      {{ userStore.profile?.displayName }}
                    </h1>
                    <span
                      class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest"
                      :class="roleBadgeClass"
                    >
                      {{ userStore.profile?.role }}
                    </span>
                  </div>
                  <p
                    class="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2"
                  >
                    <span
                      class="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                    ></span>
                    {{ userStore.profile?.email }}
                  </p>
                </div>

                <button
                  @click="isEditing = !isEditing"
                  class="group px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 border"
                  :class="
                    isEditing
                      ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-green-400 hover:text-green-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:border-green-500/50 dark:hover:text-green-400 shadow-sm'
                  "
                >
                  {{ isEditing ? t("common.cancel") : t("profile.editBtn") }}
                </button>
              </div>

              <div
                v-if="isEditing"
                class="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 fade-in"
              >
                <form
                  @submit.prevent="handleUpdate"
                  class="flex flex-col sm:flex-row gap-3"
                >
                  <div class="flex-1">
                    <label
                      class="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block"
                      >{{ t("auth.displayName") }}</label
                    >
                    <input
                      v-model="form.displayName"
                      type="text"
                      class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div class="flex items-end">
                    <button
                      type="submit"
                      :disabled="userStore.loading"
                      class="h-12.5 px-8 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center min-w-30"
                    >
                      <span v-if="!userStore.loading">{{
                        t("common.save")
                      }}</span>
                      <div
                        v-else
                        class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      ></div>
                    </button>
                  </div>
                </form>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div
                  class="md:col-span-8 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 relative overflow-hidden"
                >
                  <div
                    class="flex justify-between items-end mb-2 relative z-10"
                  >
                    <div class="flex items-center gap-2">
                      <span
                        class="w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-xs font-black"
                      >
                        {{ userStore.profile?.level }}
                      </span>
                      <span
                        class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                        >{{ t("profile.stats.xp") }}</span
                      >
                    </div>
                    <span
                      class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md"
                    >
                      {{ t("profile.stats.xpLeft", { xp: xpToNextLevel }) }}
                    </span>
                  </div>
                  <div
                    class="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative z-10"
                  >
                    <div
                      class="h-full bg-linear-to-r from-green-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out"
                      :style="{ width: `${levelProgress}%` }"
                    >
                      <div
                        class="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"
                      ></div>
                    </div>
                  </div>
                </div>

                <div
                  class="md:col-span-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex items-center justify-between"
                >
                  <div class="flex flex-col">
                    <span
                      class="text-[10px] font-black text-amber-600/60 dark:text-amber-500/60 uppercase tracking-widest"
                      >{{ t("profile.stats.wallet") }}</span
                    >
                    <span
                      class="text-2xl font-black text-amber-600 dark:text-amber-500"
                    >
                      <AnimatedNumber :value="userStore.profile?.points ?? 0" />
                    </span>
                  </div>
                  <div
                    class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-2xl"
                  >
                    💰
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div class="xl:col-span-1 space-y-8">
          <section>
            <h3
              class="text-xl font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2"
            >
              <span class="text-2xl">📊</span> {{ t("profile.stats.title") }}
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="(stat, index) in [
                  {
                    label: t('profile.stats.played'),
                    value: userStore.stats?.quizzesPlayed ?? 0,
                    icon: '📚',
                    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
                  },
                  {
                    label: t('profile.stats.accuracy'),
                    value: accuracy,
                    suffix: '%',
                    icon: '🎯',
                    color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
                  },
                  {
                    label: t('profile.stats.correct'),
                    value: userStore.stats?.correctAnswers ?? 0,
                    icon: '✅',
                    color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
                  },
                  {
                    label: t('profile.stats.streak'),
                    value: userStore.stats?.bestStreak ?? 0,
                    icon: '🔥',
                    color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
                  },
                ]"
                :key="index"
                class="p-4 rounded-2xl bg-white dark:bg-[#151e32] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div class="flex justify-between items-start mb-2">
                  <div
                    :class="`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${stat.color}`"
                  >
                    {{ stat.icon }}
                  </div>
                </div>
                <div
                  class="text-2xl font-black text-slate-800 dark:text-white group-hover:scale-110 origin-left transition-transform flex items-center"
                >
                  <AnimatedNumber :value="stat.value" />
                  <span v-if="stat.suffix">{{ stat.suffix }}</span>
                </div>
                <div
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  {{ stat.label }}
                </div>
              </div>
            </div>

            <div
              class="mt-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
            >
              <span
                class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                >{{ t("profile.memberSince") }}</span
              >
              <span
                class="text-sm font-black text-slate-700 dark:text-slate-200"
                >{{ formatDate(userStore.profile?.createdAt) }}</span
              >
            </div>
          </section>

          <section>
            <div class="flex items-center justify-between mb-4">
              <h3
                class="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2"
              >
                <span class="text-2xl">🎒</span>
                {{ t("profile.inventory.title") }}
              </h3>
              <button
                @click="router.push('/shop')"
                class="text-xs font-black uppercase text-green-600 hover:text-green-700 dark:text-green-400 hover:underline"
              >
                {{ t("profile.inventory.goToShop") }}
              </button>
            </div>

            <div
              class="bg-white dark:bg-[#151e32] p-4 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div
                v-if="shopStore.inventory.length > 0"
                class="grid grid-cols-4 gap-2"
              >
                <div
                  v-for="item in shopStore.inventory.slice(0, 8)"
                  :key="item.id"
                  class="aspect-square rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 relative group overflow-hidden"
                  :title="t(item.shopItem.title)"
                >
                  <img
                    v-if="item.shopItem.imageUrl"
                    :src="item.shopItem.imageUrl"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <span
                    v-else
                    class="absolute inset-0 flex items-center justify-center text-xl"
                    >🎁</span
                  >

                  <div
                    class="absolute bottom-0 inset-x-0 h-1"
                    :class="{
                      'bg-slate-400':
                        item.shopItem.rarity === ItemRarity.Common,
                      'bg-blue-400': item.shopItem.rarity === ItemRarity.Rare,
                      'bg-purple-500': item.shopItem.rarity === ItemRarity.Epic,
                      'bg-amber-500':
                        item.shopItem.rarity === ItemRarity.Legendary,
                    }"
                  ></div>
                </div>
                <div
                  v-if="shopStore.inventory.length > 8"
                  class="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500"
                >
                  +{{ shopStore.inventory.length - 8 }}
                </div>
              </div>
              <div v-else class="text-center py-8">
                <div class="text-4xl mb-2 opacity-30">🕸️</div>
                <p class="text-xs font-bold text-slate-400">
                  {{ t("profile.inventory.empty") }}
                </p>
              </div>
            </div>
          </section>

          <section class="pt-4">
            <div
              class="rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/5 overflow-hidden transition-all hover:bg-red-50 dark:hover:bg-red-900/10"
            >
              <button
                @click="isDeleteModalOpen = true"
                class="w-full px-5 py-4 flex items-center justify-between group"
              >
                <div class="text-left">
                  <span
                    class="block text-sm font-black text-red-700 dark:text-red-400"
                    >{{ t("profile.danger.title") }}</span
                  >
                  <span
                    class="text-xs font-medium text-red-600/60 dark:text-red-400/50"
                    >{{ t("profile.danger.desc") }}</span
                  >
                </div>
                <div
                  class="w-8 h-8 rounded-full bg-white dark:bg-red-900/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform"
                >
                  🗑️
                </div>
              </button>
            </div>
          </section>
        </div>

        <div class="xl:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h3
              class="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2"
            >
              <span class="text-2xl">🚀</span> {{ t("profile.quizzes.title") }}
            </h3>
            <button
              @click="router.push('/quiz/create')"
              class="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <span>+</span> {{ t("profile.quizzes.create") }}
            </button>
          </div>

          <div
            v-if="quizStore.loading"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"
            ></div>
          </div>

          <div
            v-else-if="myQuizzes.length"
            class="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <QuizCard
              v-for="quiz in myQuizzes"
              :key="quiz.id"
              :quiz="quiz"
              :is-author="true"
              :has-full-access="true"
              @click="(q) => router.push(`/quiz/${q.id}`)"
              @edit="(id) => router.push(`/quiz/edit/${id}`)"
              @delete="openQuizDelete"
            />
            <button
              @click="router.push('/quiz/create')"
              class="group min-h-62.5 rounded-4xl border-3 border-dashed border-slate-200 dark:border-slate-800 hover:border-green-400 dark:hover:border-green-500/50 bg-transparent flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:bg-green-50/50 dark:hover:bg-green-900/10"
            >
              <div
                class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-green-100 dark:group-hover:bg-green-500/20 flex items-center justify-center text-3xl text-slate-400 group-hover:text-green-500 transition-colors"
              >
                +
              </div>
              <span
                class="font-black text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
                >{{ t("profile.quizzes.create") }}</span
              >
            </button>
          </div>

          <div
            v-else
            class="rounded-[2.5rem] bg-white dark:bg-[#151e32] border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm"
          >
            <div
              class="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-5xl mx-auto mb-6"
            >
              📝
            </div>
            <h4 class="text-xl font-black text-slate-900 dark:text-white mb-2">
              {{ t("profile.quizzes.emptyTitle") }}
            </h4>
            <p class="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {{ t("profile.quizzes.emptyDesc") }}
            </p>
            <button
              @click="router.push('/quiz/create')"
              class="px-8 py-3 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              {{ t("profile.quizzes.createFirst") }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      :is-open="isDeleteModalOpen"
      :title="t('profile.danger.deleteTitle')"
      :description="t('profile.danger.deleteConfirmDesc')"
      :confirm-text="t('profile.danger.deleteBtn')"
      priority="High"
      :loading="userStore.loading"
      @close="isDeleteModalOpen = false"
      @confirm="handleDeleteAccount"
    />
    <ConfirmModal
      :is-open="isQuizDeleteModalOpen"
      :title="t('common.confirmDelete')"
      :description="t('quiz.deleteWarning')"
      :confirm-text="t('common.delete')"
      priority="High"
      :loading="quizStore.loading"
      @close="isQuizDeleteModalOpen = false"
      @confirm="confirmQuizDelete"
    />
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-150%) skewX(-15deg);
  }
  100% {
    transform: translateX(150%) skewX(-15deg);
  }
}
</style>
