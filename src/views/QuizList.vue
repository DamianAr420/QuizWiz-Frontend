<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useQuizStore } from "@/stores/quiz";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import QuizCard from "@/components/Cards/QuizCard.vue";
import ConfirmModal from "@/components/Modals/Confirm.vue";

const { t } = useI18n();
const quizStore = useQuizStore();
const authStore = useAuthStore();
const router = useRouter();

const searchQuery = ref("");
const activeFilter = ref("official");
const isConfirmOpen = ref(false);
const quizToDelete = ref<number | null>(null);

onMounted(() => quizStore.fetchQuizzes(activeFilter.value === "official"));

const isAdmin = computed(() => authStore.user?.role === "Admin");

const isAuthor = (authorId: number | string | undefined) => {
  if (!authorId || !authStore.user) return false;
  return String(authStore.user.id) === String(authorId);
};

const canSeeQuiz = (isVisible: boolean, authorId?: number | string) => {
  if (isVisible) return true;
  if (isAdmin.value) return true;
  if (isAuthor(authorId)) return true;
  return false;
};

const filteredQuizzes = computed(() => {
  return quizStore.quizzes.filter((quiz) => {
    const isCorrectType =
      activeFilter.value === "official" ? quiz.isOfficial : !quiz.isOfficial;
    const searchLower = searchQuery.value.toLowerCase();
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchLower) ||
      quiz.description.toLowerCase().includes(searchLower);
    const canSee = canSeeQuiz(quiz.isVisible, quiz.authorId);

    return isCorrectType && matchesSearch && canSee;
  });
});

const handleCardClick = (quiz: any) => {
  if (quiz.isPlayable) router.push(`/quiz/${quiz.id}`);
};

const setFilter = (type: string) => {
  activeFilter.value = type;
  quizStore.fetchQuizzes(type === "official");
};

const openDeleteConfirm = (id: number) => {
  quizToDelete.value = id;
  isConfirmOpen.value = true;
};

const confirmDelete = async () => {
  if (quizToDelete.value) {
    await quizStore.deleteQuiz(quizToDelete.value);
    isConfirmOpen.value = false;
    quizToDelete.value = null;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 md:p-10">
    <header class="flex flex-col gap-10 mb-16">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <h1 class="text-5xl font-black text-slate-900 tracking-tight mb-2">
            {{ t("quiz.listTitle") }}
          </h1>
          <p class="text-slate-500 font-medium text-lg">
            {{
              activeFilter === "official"
                ? "Certyfikowane wyzwania wiedzy"
                : "Twórczość naszej społeczności"
            }}
          </p>
        </div>
        <button
          @click="router.push('/quiz/create')"
          class="group relative bg-indigo-600 text-white px-10 py-5 rounded-4xl font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all active:scale-95 overflow-hidden"
        >
          <span class="relative z-10 flex items-center gap-2">
            <span class="text-2xl">+</span> {{ t("quiz.createNew") }}
          </span>
          <div
            class="absolute inset-0 bg-linear-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
          ></div>
        </button>
      </div>

      <div class="flex flex-col lg:flex-row gap-6 items-center">
        <div class="relative flex-1 w-full group">
          <span
            class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-110 transition-transform"
            >🔍</span
          >
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('quiz.searchPlaceholder')"
            class="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-4xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg"
          />
        </div>
        <div
          class="inline-flex p-2 bg-slate-200/50 backdrop-blur-md rounded-4xl font-medium border border-white shadow-inner"
        >
          <button
            v-for="f in ['official', 'users']"
            :key="f"
            @click="setFilter(f)"
            :class="[
              activeFilter === f
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-slate-500 hover:text-slate-700',
              'px-10 py-4 rounded-[1.7rem] font-black text-sm uppercase tracking-wider transition-all active:scale-95',
            ]"
          >
            {{ t(`quiz.filter.${f}`) }}
          </button>
        </div>
      </div>
    </header>

    <div
      v-if="quizStore.loading"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative h-80 overflow-hidden"
      >
        <div class="skeleton-shimmer"></div>
      </div>
    </div>

    <div
      v-else-if="filteredQuizzes.length"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
    >
      <QuizCard
        v-for="quiz in filteredQuizzes"
        :key="quiz.id"
        :quiz="quiz"
        :is-author="isAuthor(quiz.authorId)"
        :has-full-access="isAuthor(quiz.authorId) || isAdmin"
        @click="handleCardClick"
        @edit="(id) => router.push(`/quiz/edit/${id}`)"
        @delete="openDeleteConfirm"
      />
    </div>

    <div
      v-else
      class="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner"
    >
      <div class="text-6xl mb-6">🏜️</div>
      <h3 class="text-2xl font-black text-slate-800 mb-2">Nic tu nie ma...</h3>
      <p class="text-slate-400 font-bold max-w-sm mx-auto">
        {{ t("quiz.noResults") }}
      </p>
    </div>

    <ConfirmModal
      :is-open="isConfirmOpen"
      :title="t('common.confirmDelete')"
      :description="t('quiz.deleteWarning')"
      :confirm-text="t('common.delete')"
      priority="High"
      :loading="quizStore.loading"
      @confirm="confirmDelete"
      @close="isConfirmOpen = false"
    />
  </div>
</template>

<style scoped>
.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
