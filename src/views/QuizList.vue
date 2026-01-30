<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useQuizStore } from "@/stores/quiz";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type { Quiz } from "@/types/quiz";
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

const isOwner = (quiz: Quiz) => {
  return (
    authStore.user?.id === quiz.authorId || authStore.user?.role === "Admin"
  );
};

const filteredQuizzes = computed(() => {
  return quizStore.quizzes.filter((quiz) => {
    const isCorrectType =
      activeFilter.value === "official" ? quiz.isOfficial : !quiz.isOfficial;
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const canSee = quiz.isVisible || isOwner(quiz);

    return isCorrectType && matchesSearch && canSee;
  });
});

const handleCardClick = (quiz: Quiz) => {
  if (quiz.isPlayable) {
    router.push(`/quiz/${quiz.id}`);
  }
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
        class="h-80 bg-slate-100 animate-pulse rounded-[3rem]"
      ></div>
    </div>

    <div
      v-else-if="filteredQuizzes.length"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
    >
      <div
        v-for="quiz in filteredQuizzes"
        :key="quiz.id"
        @click="handleCardClick(quiz)"
        class="group relative bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden"
        :class="[
          quiz.isPlayable
            ? 'cursor-pointer hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(79,70,229,0.12)] hover:border-indigo-100'
            : 'cursor-not-allowed opacity-80 grayscale-[0.3]',
        ]"
      >
        <div class="absolute top-8 right-8 flex flex-col gap-2 items-end z-20">
          <span
            v-if="!quiz.isVisible"
            class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-slate-900 text-white shadow-lg"
          >
            🔒 {{ t("quiz.status.private") }}
          </span>
          <span
            v-if="!quiz.isPlayable"
            class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-amber-400 text-amber-950 shadow-lg"
          >
            ⏳ {{ t("quiz.status.comingSoon") }}
          </span>
          <span
            v-if="isOwner(quiz)"
            class="text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 backdrop-blur-sm"
          >
            👤 {{ t("quiz.status.yours") }}
          </span>
        </div>

        <div
          class="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors"
        ></div>

        <div
          class="relative w-20 h-20 mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
        >
          <div
            class="absolute inset-0 bg-linear-to-br from-indigo-500 to-purple-600 rounded-3xl rotate-6 opacity-10 group-hover:opacity-20 transition-opacity"
          ></div>
          <div
            class="absolute inset-0 bg-white shadow-sm border border-slate-100 rounded-3xl flex items-center justify-center text-4xl"
          >
            {{ quiz.isOfficial ? "🏆" : "🚀" }}
          </div>
        </div>

        <div class="relative z-10">
          <h3
            class="text-2xl font-black text-slate-800 mb-3 line-clamp-1 pr-16 group-hover:text-indigo-600 transition-colors"
          >
            {{ quiz.title }}
          </h3>
          <p
            class="text-slate-500 font-medium leading-relaxed mb-8 line-clamp-2 h-12"
          >
            {{ quiz.description }}
          </p>

          <div class="flex flex-wrap gap-3 mb-8">
            <div
              class="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100"
            >
              <span class="text-lg">📋</span>
              <span class="text-xs font-black uppercase tracking-tighter"
                >{{ quiz.questionsCount }} {{ t("quiz.stats.questions") }}</span
              >
            </div>
            <div
              class="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100"
            >
              <span class="text-lg">⏱️</span>
              <span class="text-xs font-black uppercase tracking-tighter"
                >{{ quiz.timeLimitSeconds }}s /
                {{ t("quiz.stats.perQuestion") }}</span
              >
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-50">
          <div
            v-if="isOwner(quiz)"
            class="flex flex-row justify-between items-center relative z-20"
          >
            <button
              @click.stop="router.push(`/quiz/edit/${quiz.id}`)"
              class="p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
              title="Edytuj"
            >
              ✏️
            </button>
            <button
              @click.stop="openDeleteConfirm(quiz.id)"
              class="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all border border-transparent hover:border-red-100"
              title="Usuń"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner"
    >
      <div class="text-6xl mb-6"></div>
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
.line-clamp-1 {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
