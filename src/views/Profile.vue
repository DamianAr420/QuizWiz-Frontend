<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useQuizStore } from "@/stores/quiz";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import QuizCard from "@/components/Cards/QuizCard.vue";
import ConfirmModal from "@/components/Modals/Confirm.vue";
import { useCloudinary } from "@/composables/useCloudinary";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const quizStore = useQuizStore();
const authStore = useAuthStore();
const toast = useToastStore();
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
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
});

onMounted(async () => {
  await Promise.all([
    userStore.fetchProfile(),
    userStore.fetchStats(),
    quizStore.fetchQuizzes(false),
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
    toast.show(t("common.saveSuccess"), "success");
  } catch (error: any) {
    console.error(error);
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

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
      toast.show(t("common.deleteSuccess"), "success");
    } catch (e) {
      toast.show(t("common.deleteError"), "error");
    }
  }
};
</script>

<template>
  <div
    class="max-w-7xl mx-auto px-4 py-6 sm:py-12 transition-colors duration-300"
  >
    <div
      class="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-4xl sm:rounded-[2.5rem] shadow-xl dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800 mb-8 sm:mb-12"
    >
      <div
        class="relative bg-linear-to-br from-emerald-500 via-emerald-600 to-green-700 h-24 sm:h-36 w-full"
      >
        <div class="absolute inset-0 bg-black/5"></div>
      </div>

      <div class="px-4 sm:px-10 pb-8 sm:pb-10">
        <div
          class="relative flex flex-col sm:flex-row justify-between items-center sm:items-end -mt-12 sm:-mt-16 mb-6 sm:mb-8 gap-4 text-center sm:text-left"
        >
          <div class="relative group cursor-pointer" @click="triggerFileInput">
            <div
              class="bg-slate-200 dark:bg-slate-800 h-24 w-24 sm:h-32 sm:w-32 rounded-3xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-4xl shadow-2xl overflow-hidden relative ring-4 ring-black/5"
            >
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                class="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <span v-else>🧙‍♂️</span>
              <div
                class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span
                  class="text-[10px] font-black text-white uppercase tracking-wider"
                  >Zmień</span
                >
              </div>
              <div
                v-if="userStore.loading"
                class="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center"
              >
                <div
                  class="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"
                ></div>
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

          <button
            @click="isEditing = !isEditing"
            class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            :class="
              isEditing
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-none'
                : 'bg-white dark:bg-green-600 text-green-600 dark:text-white hover:bg-green-50 dark:hover:bg-green-500'
            "
          >
            {{
              isEditing
                ? "❌ " + t("common.cancel")
                : "✏️ " + t("profile.editBtn")
            }}
          </button>
        </div>

        <header class="mb-8 text-center sm:text-left">
          <div
            class="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2"
          >
            <h1
              class="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              {{ userStore.profile?.displayName }}
            </h1>
            <span
              v-if="userStore.profile?.role"
              class="px-3 py-1 rounded-lg text-[9px] font-black uppercase border tracking-widest shadow-xs"
              :class="roleBadgeClass"
            >
              {{ userStore.profile.role }}
            </span>
          </div>
          <p
            class="text-xs sm:text-base text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2"
          >
            <span
              class="w-2 h-2 rounded-full bg-green-500 animate-pulse"
            ></span>
            {{ userStore.profile?.email }}
          </p>
        </header>

        <div
          v-if="userStore.loading && !userStore.profile"
          class="py-12 text-center"
        >
          <div
            class="animate-spin inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"
          ></div>
        </div>

        <div v-else>
          <form
            v-if="isEditing"
            @submit.prevent="handleUpdate"
            class="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-top-2"
          >
            <div class="space-y-2">
              <label
                class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1"
                >{{ t("auth.displayName") }}</label
              >
              <input
                v-model="form.displayName"
                type="text"
                class="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-slate-800 border-2 border-green-100 dark:border-slate-700 rounded-xl sm:rounded-2xl outline-none focus:border-green-500 transition-all text-slate-900 dark:text-white font-bold text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              :disabled="userStore.loading"
              class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-black px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-green-200 dark:shadow-none flex items-center justify-center gap-2"
            >
              <span v-if="!userStore.loading">💾 {{ t("common.save") }}</span>
              <div
                v-else
                class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></div>
            </button>
          </form>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div
              class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-green-200"
            >
              <p
                class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mb-1"
              >
                {{ t("auth.displayName") }}
              </p>
              <p
                class="font-bold text-base sm:text-lg text-slate-900 dark:text-white"
              >
                {{ userStore.profile?.displayName }}
              </p>
            </div>
            <div
              class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-green-200"
            >
              <p
                class="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mb-1"
              >
                {{ t("profile.memberSince") }}
              </p>
              <p
                class="font-bold text-base sm:text-lg text-slate-900 dark:text-white"
              >
                {{ formatDate(userStore.profile?.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section
      v-if="userStore.stats"
      class="mb-10 sm:mb-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
    >
      <div
        v-for="(stat, index) in [
          {
            label: t('profile.stats.played'),
            value: userStore.stats.quizzesPlayed,
            icon: '📚',
          },
          {
            label: t('profile.stats.accuracy'),
            value: accuracy + '%',
            icon: '🎯',
          },
          {
            label: t('profile.stats.correct'),
            value: userStore.stats.correctAnswers,
            icon: '✅',
          },
          {
            label: t('profile.stats.streak'),
            value: userStore.stats.bestStreak,
            icon: '🔥',
          },
        ]"
        :key="index"
        class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-8 rounded-3xl sm:rounded-4xl flex flex-col items-center gap-1 sm:gap-3 transition-all hover:scale-105 shadow-sm"
      >
        <span class="text-2xl sm:text-4xl mb-1">{{ stat.icon }}</span>
        <div class="text-center">
          <p
            class="text-lg sm:text-2xl font-black text-slate-900 dark:text-white"
          >
            {{ stat.value }}
          </p>
          <p
            class="text-[8px] sm:text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none"
          >
            {{ stat.label }}
          </p>
        </div>
      </div>
    </section>

    <section class="mb-10 sm:mb-12">
      <div class="flex items-center justify-between mb-6 sm:mb-8">
        <h3
          class="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
        >
          🚀 {{ t("profile.myQuizzes") }}
        </h3>
        <span
          class="px-3 sm:px-5 py-1 sm:py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm border border-green-100"
        >
          {{ myQuizzes.length }}
        </span>
      </div>
      <div
        v-if="quizStore.loading"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-4xl"
        ></div>
      </div>
      <div
        v-else-if="myQuizzes.length"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"
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
      </div>
      <div
        v-else
        class="text-center py-12 sm:py-16 bg-slate-50 dark:bg-slate-800/30 rounded-4xl sm:rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800"
      >
        <p class="text-slate-400 font-bold sm:text-lg mb-4">
          {{ t("profile.noQuizzes") }}
        </p>
        <button
          @click="router.push('/quiz/create')"
          class="text-green-600 font-black uppercase text-[10px] sm:text-xs tracking-widest hover:underline"
        >
          Stwórz swój pierwszy quiz
        </button>
      </div>
    </section>

    <div
      class="bg-red-50 dark:bg-red-900/10 rounded-4xl sm:rounded-[3rem] p-6 sm:p-10 border border-red-100 dark:border-red-900/30 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8"
    >
      <div class="text-center md:text-left">
        <h4
          class="text-red-800 dark:text-red-400 font-black text-xl sm:text-2xl mb-1"
        >
          {{ t("profile.dangerZone") }}
        </h4>
        <p
          class="text-red-600/70 dark:text-red-400/60 font-medium text-xs sm:text-sm max-w-sm"
        >
          {{ t("profile.deleteDesc") }}
        </p>
      </div>
      <button
        @click="isDeleteModalOpen = true"
        class="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm transition-transform active:scale-95 shadow-lg shadow-red-200 dark:shadow-none"
      >
        {{ t("profile.deleteBtn") }}
      </button>
    </div>

    <ConfirmModal
      :is-open="isDeleteModalOpen"
      :title="t('profile.deleteConfirmTitle')"
      :description="t('profile.deleteConfirmDesc')"
      :confirm-text="t('profile.deleteBtn')"
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
