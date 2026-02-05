import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import type { Quiz, CreateQuizDto, UpdateQuizDto } from "@/types/quiz";

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
      return data;
    } finally {
      loading.value = false;
    }
  };

  const createQuiz = async (quizData: CreateQuizDto) => {
    loading.value = true;
    try {
      await api.post("/quizzes", quizData);
    } finally {
      loading.value = false;
    }
  };

  const updateQuiz = async (id: number, quizData: UpdateQuizDto) => {
    loading.value = true;
    try {
      await api.put(`/quizzes/${id}`, quizData);
    } finally {
      loading.value = false;
    }
  };

  const deleteQuiz = async (id: number) => {
    loading.value = true;
    try {
      await api.delete(`/quizzes/${id}`);
      quizzes.value = quizzes.value.filter((q) => q.id !== id);
    } finally {
      loading.value = false;
    }
  };

  const submitQuizResult = async (
    quizId: number,
    score: number,
    totalQuestions: number,
  ) => {
    try {
      await api.post(`/quizzes/${quizId}/submit`, {
        score,
        totalQuestions,
      });
    } catch (error) {
      console.error("Failed to submit quiz result", error);
    }
  };

  return {
    quizzes,
    currentQuiz,
    loading,
    fetchQuizzes,
    fetchQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizResult,
  };
});
