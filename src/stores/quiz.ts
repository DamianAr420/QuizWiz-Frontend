import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import type { Quiz } from "@/types/quiz";

export const useQuizStore = defineStore("quiz", () => {
  const quizzes = ref<Quiz[]>([]);
  const currentQuiz = ref<Quiz | null>(null);
  const loading = ref(false);

  const fetchQuizzes = async () => {
    loading.value = true;
    try {
      const { data } = await api.get<Quiz[]>("/quizzes");
      quizzes.value = data;
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

  const createQuiz = async (quizData: Partial<Quiz>) => {
    loading.value = true;
    try {
      await api.post("/quizzes", quizData);
      await fetchQuizzes();
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
