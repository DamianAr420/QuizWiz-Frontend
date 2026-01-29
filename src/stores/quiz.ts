import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import type { Quiz, CreateQuizDto } from "@/types/quiz";

export const useQuizStore = defineStore("quiz", () => {
  const quizzes = ref<Quiz[]>([]);
  const currentQuiz = ref<Quiz | null>(null);
  const loading = ref(false);

  const fetchQuizzes = async (isOfficial?: boolean) => {
    loading.value = true;
    try {
      const response = await api.get<Quiz[]>("/quizzes", {
        params: { official: isOfficial },
      });
      quizzes.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  const fetchQuizById = async (id: number) => {
    loading.value = true;
    try {
      const { data } = await api.get<Quiz>(`/quizzes/${id}`);
      currentQuiz.value = data;
    } finally {
      loading.value = false;
    }
  };

  const createQuiz = async (quizData: CreateQuizDto) => {
    loading.value = true;
    try {
      await api.post("/quizzes", quizData);
      await fetchQuizzes(true);
    } finally {
      loading.value = false;
    }
  };

  return {
    quizzes,
    currentQuiz,
    loading,
    fetchQuizzes,
    fetchQuizById,
    createQuiz,
  };
});
