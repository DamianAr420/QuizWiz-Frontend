<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useQuizStore } from "@/stores/quiz";
import { useAuthStore } from "@/stores/auth";
import QuizCard from "@/components/Cards/QuizCard.vue";
import ConfirmModal from "@/components/Modals/Confirm.vue";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const quizStore = useQuizStore();
const authStore = useAuthStore();

const isEditing = ref(false);
const isDeleteModalOpen = ref(false);
const isQuizDeleteModalOpen = ref(false);
const quizToDelete = ref<number | null>(null);
const message = ref({ type: "", text: "" });
const form = ref({ displayName: "" });

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

onMounted(async () => {
  await Promise.all([
    userStore.fetchProfile(),
    userStore.fetchStats(),
    quizStore.fetchQuizzes(false),
  ]);

  if (userStore.profile) {
    form.value.displayName = userStore.profile.displayName;
  }
});

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

const handleUpdate = async () => {
  message.value = { type: "", text: "" };
  try {
    await userStore.updateProfile(form.value.displayName);
    isEditing.value = false;
    message.value = { type: "success", text: t("profile.updateSuccess") };
  } catch (error: any) {
    message.value = {
      type: "error",
      text: userStore.error || t("profile.updateError"),
    };
  }
};

const handleDeleteAccount = async () => {
  try {
    await userStore.deleteAccount();
  } catch (error: any) {
    isDeleteModalOpen.value = false;
    message.value = {
      type: "error",
      text: userStore.error || t("profile.deleteError"),
    };
  }
};

const openQuizDelete = (id: number) => {
  quizToDelete.value = id;
  isQuizDeleteModalOpen.value = true;
};

const confirmQuizDelete = async () => {
  if (quizToDelete.value) {
    await quizStore.deleteQuiz(quizToDelete.value);
    isQuizDeleteModalOpen.value = false;
    quizToDelete.value = null;
  }
};
</script>

<template>
  <div
    class="max-w-7xl mx-auto px-4 py-8 sm:py-12 transition-colors duration-300"
  >
    <div
      class="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800 mb-12"
    >
      <div
        class="bg-green-600 dark:bg-green-700 h-24 sm:h-32 w-full opacity-90"
      ></div>
      <div class="px-5 sm:px-8 pb-8">
        <div
          class="relative flex flex-col xs:flex-row justify-between items-start xs:items-end -mt-10 sm:-mt-12 mb-6 sm:mb-8 gap-4"
        >
          <div
            class="bg-slate-200 dark:bg-slate-800 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-3xl sm:text-4xl shadow-sm"
          >
            🧙‍♂️
          </div>
          <button
            @click="isEditing = !isEditing"
            class="self-end xs:self-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm active:scale-95"
            :class="
              isEditing
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50'
            "
          >
            {{ isEditing ? t("common.cancel") : t("profile.editBtn") }}
          </button>
        </div>

        <header class="mb-6 sm:mb-8">
          <h1
            class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            {{ t("profile.title") }}
          </h1>
          <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            {{ t("profile.subtitle") }}
          </p>
        </header>

        <div
          v-if="userStore.loading && !userStore.profile"
          class="py-12 text-center text-slate-400"
        >
          <div
            class="animate-spin inline-block w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mb-2"
          ></div>
          <p>{{ t("auth.loading") }}...</p>
        </div>

        <div v-else class="grid gap-6">
          <div class="space-y-1">
            <label
              class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase ml-1"
              >{{ t("auth.email") }}</label
            >
            <div
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-sm sm:text-base"
            >
              {{ userStore.profile?.email }}
            </div>
          </div>
          <form @submit.prevent="handleUpdate" class="space-y-6">
            <div class="space-y-1">
              <label
                class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase ml-1"
                >{{ t("auth.displayName") }}</label
              >
              <input
                v-model="form.displayName"
                :disabled="!isEditing || userStore.loading"
                type="text"
                class="w-full px-4 py-3 border rounded-xl outline-none transition-all text-sm sm:text-base"
                :class="
                  isEditing
                    ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-900 focus:ring-2 focus:ring-green-500 text-slate-900 dark:text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-400'
                "
              />
            </div>
            <div
              class="pt-4 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4"
            >
              <span class="text-xs text-slate-400 dark:text-slate-500 italic">
                {{ t("profile.memberSince") }}:
                {{ formatDate(userStore.profile?.createdAt) }}
              </span>
              <button
                v-if="isEditing"
                type="submit"
                :disabled="userStore.loading"
                class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg shadow-green-100 dark:shadow-none"
              >
                {{ userStore.loading ? t("auth.loading") : t("common.save") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <section
      v-if="userStore.stats"
      class="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <div
        class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-4xl flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 shadow-sm"
      >
        <span class="text-2xl">📚</span>
        <div class="text-center">
          <p class="text-xl font-black text-slate-900 dark:text-white">
            {{ userStore.stats.quizzesPlayed }}
          </p>
          <p
            class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
          >
            {{ t("profile.stats.played") }}
          </p>
        </div>
      </div>
      <div
        class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-4xl flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 shadow-sm"
      >
        <span class="text-2xl">🎯</span>
        <div class="text-center">
          <p class="text-xl font-black text-slate-900 dark:text-white">
            {{ accuracy }}%
          </p>
          <p
            class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
          >
            {{ t("profile.stats.accuracy") }}
          </p>
        </div>
      </div>
      <div
        class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-4xl flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 shadow-sm"
      >
        <span class="text-2xl">✅</span>
        <div class="text-center">
          <p class="text-xl font-black text-slate-900 dark:text-white">
            {{ userStore.stats.correctAnswers }}
          </p>
          <p
            class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
          >
            {{ t("profile.stats.correct") }}
          </p>
        </div>
      </div>
      <div
        class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-4xl flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 shadow-sm"
      >
        <span class="text-2xl">🔥</span>
        <div class="text-center">
          <p class="text-xl font-black text-slate-900 dark:text-white">
            {{ userStore.stats.bestStreak }}
          </p>
          <p
            class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
          >
            {{ t("profile.stats.streak") }}
          </p>
        </div>
      </div>
    </section>

    <section class="mb-12">
      <div class="flex items-center justify-between mb-8">
        <h3
          class="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
        >
          🚀 {{ t("profile.myQuizzes") }}
        </h3>
        <span
          class="px-4 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full font-black text-sm border border-green-100 dark:border-green-900/30"
        >
          {{ myQuizzes.length }}
        </span>
      </div>
      <div
        v-if="quizStore.loading"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]"
        ></div>
      </div>
      <div
        v-else-if="myQuizzes.length"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
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
        class="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-4xl border border-dashed border-slate-200 dark:border-slate-700"
      >
        <p class="text-slate-400">{{ t("profile.noQuizzes") }}</p>
      </div>
    </section>

    <div
      class="bg-red-50 dark:bg-red-900/10 rounded-4xl p-6 sm:p-8 border border-red-100 dark:border-red-900/30 flex flex-col md:flex-row justify-between items-center gap-6"
    >
      <div class="text-center md:text-left">
        <h4 class="text-red-800 dark:text-red-400 font-black text-lg">
          {{ t("profile.dangerZone") }}
        </h4>
        <p class="text-red-600/70 dark:text-red-400/60 text-sm">
          {{ t("profile.deleteDesc") }}
        </p>
      </div>
      <button
        @click="isDeleteModalOpen = true"
        class="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm"
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

<style scoped>
.slide-up-enter-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
