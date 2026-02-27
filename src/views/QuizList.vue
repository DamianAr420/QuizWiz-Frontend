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
const isSubmitConfirmOpen = ref(false);
const quizToProcess = ref<number | null>(null);

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
  if (activeFilter.value === type) return;
  activeFilter.value = type;
  quizStore.fetchQuizzes(type === "official");
};

const openDeleteConfirm = (id: number) => {
  quizToProcess.value = id;
  isConfirmOpen.value = true;
};

const openSubmitConfirm = (id: number) => {
  quizToProcess.value = id;
  isSubmitConfirmOpen.value = true;
};

const confirmDelete = async () => {
  if (quizToProcess.value) {
    await quizStore.deleteQuiz(quizToProcess.value);
    isConfirmOpen.value = false;
    quizToProcess.value = null;
  }
};

const confirmSubmit = async () => {
  if (quizToProcess.value) {
    await quizStore.submitQuizForVerification(quizToProcess.value);
    isSubmitConfirmOpen.value = false;
    quizToProcess.value = null;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 md:p-10 transition-colors duration-300">
    <header class="flex flex-col gap-10 mb-16">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <h1
            class="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2"
          >
            {{ t("quiz.listTitle") }}
          </h1>
          <Transition name="fade" mode="out-in">
            <p
              :key="activeFilter"
              class="text-slate-500 dark:text-slate-400 font-medium text-lg"
            >
              {{
                activeFilter === "official"
                  ? "Certyfikowane wyzwania wiedzy"
                  : "Twórczość naszej społeczności"
              }}
            </p>
          </Transition>
        </div>

        <button
          @click="router.push('/quiz/create')"
          class="group relative bg-green-600 dark:bg-green-500 text-white px-10 py-5 rounded-4xl font-black shadow-[0_20px_50px_rgba(22,163,74,0.3)] dark:shadow-none hover:bg-green-700 dark:hover:bg-green-400 transition-all active:scale-95 overflow-hidden"
        >
          <span class="relative z-10 flex items-center gap-2">
            <span class="text-2xl">+</span> {{ t("quiz.createNew") }}
          </span>
          <div
            class="absolute inset-0 bg-linear-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
          ></div>
        </button>
      </div>

      <div class="flex flex-col lg:flex-row gap-6 items-center">
        <div class="relative flex-1 w-full group">
          <span
            class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-110 transition-transform"
          >
            🔍
          </span>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('quiz.searchPlaceholder')"
            class="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-4xl shadow-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-lg text-slate-800 dark:text-slate-100"
          />
        </div>

        <div
          class="relative grid grid-cols-2 p-1.5 bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md rounded-4xl border border-white dark:border-slate-700 shadow-inner w-full lg:w-auto lg:min-w-100"
        >
          <div
            class="absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white dark:bg-slate-700 rounded-[1.7rem] shadow-md transition-all duration-300 ease-spring"
            :class="activeFilter === 'official' ? 'left-1.5' : 'left-[50%]'"
          ></div>

          <button
            @click="setFilter('official')"
            class="relative z-10 px-6 py-3 rounded-[1.7rem] font-black text-sm uppercase tracking-wider transition-colors duration-300"
            :class="
              activeFilter === 'official'
                ? 'text-green-600 dark:text-green-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            "
          >
            {{ t("quiz.filter.official") }}
          </button>

          <button
            @click="setFilter('users')"
            class="relative z-10 px-6 py-3 rounded-[1.7rem] font-black text-sm uppercase tracking-wider transition-colors duration-300"
            :class="
              activeFilter === 'users'
                ? 'text-green-600 dark:text-green-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            "
          >
            {{ t("quiz.filter.users") }}
          </button>
        </div>
      </div>
    </header>

    <Transition name="fade-slide" mode="out-in">
      <div
        v-if="quizStore.loading"
        key="loading"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative h-80 overflow-hidden"
        >
          <div class="skeleton-shimmer dark:opacity-20"></div>
        </div>
      </div>

      <div
        v-else-if="filteredQuizzes.length"
        key="list"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
      >
        <QuizCard
          v-for="quiz in filteredQuizzes"
          :key="quiz.id"
          :quiz="quiz"
          :is-author="isAuthor(quiz.authorId)"
          :has-full-access="
            (isAuthor(quiz.authorId) && !quiz.isSubmitted) || isAdmin
          "
          @click="handleCardClick"
          @edit="(id) => router.push(`/quiz/edit/${id}`)"
          @delete="openDeleteConfirm"
          @submit="openSubmitConfirm"
        />
      </div>

      <div
        v-else
        key="empty"
        class="text-center py-32 bg-white dark:bg-slate-900/50 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-inner"
      >
        <div class="text-6xl mb-6 grayscale opacity-80">🏜️</div>
        <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-2">
          Nic tu nie ma...
        </h3>
        <p
          class="text-slate-400 dark:text-slate-500 font-bold max-w-sm mx-auto"
        >
          {{ t("quiz.noResults") }}
        </p>
      </div>
    </Transition>

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

    <ConfirmModal
      :is-open="isSubmitConfirmOpen"
      title="Zgłosić quiz do weryfikacji?"
      description="Po wysłaniu nie będziesz mógł edytować pytań do czasu podjęcia decyzji przez administratora."
      confirm-text="Zgłoś teraz"
      priority="Medium"
      :loading="quizStore.loading"
      @confirm="confirmSubmit"
      @close="isSubmitConfirmOpen = false"
    />
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.ease-spring {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

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
