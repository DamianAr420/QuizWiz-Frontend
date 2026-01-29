import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";

interface Stats {
  totalQuizzes: number;
  totalQuestions: number;
  totalUsers: number;
}

export const useStatsStore = defineStore("stats", () => {
  const stats = ref<Stats>({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalUsers: 0,
  });

  const loading = ref(false);

  const fetchStats = async () => {
    loading.value = true;
    try {
      const { data } = await api.get<Stats>("/stats");
      stats.value = data;
    } catch (error) {
      console.error("Błąd podczas pobierania statystyk:", error);
    } finally {
      loading.value = false;
    }
  };

  return {
    stats,
    loading,
    fetchStats,
  };
});
