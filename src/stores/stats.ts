import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import { type Attempt, type Stats } from "@/types/stats";
import i18n from "@/i18n";

export const useStatsStore = defineStore("stats", () => {
  const stats = ref<Stats>({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalUsers: 0,
  });

  const attempts = ref<Attempt[]>([]);
  const totalAttempts = ref(0);
  const loading = ref(false);

  const t = i18n.global.t;

  const fetchStats = async () => {
    loading.value = true;
    try {
      const { data } = await api.get<Stats>("/stats");
      stats.value = data;
    } catch (error) {
      console.error(t("profile.errors.fetch_stats_failed"), error);
    } finally {
      loading.value = false;
    }
  };

  const fetchHistory = async (page = 1, pageSize = 5) => {
    loading.value = true;
    try {
      const { data } = await api.get(
        `/stats/history?page=${page}&pageSize=${pageSize}`,
      );

      if (page === 1) {
        attempts.value = data.items;
      } else {
        attempts.value.push(...data.items);
      }

      totalAttempts.value = data.totalItems;
      return data;
    } catch (error) {
      console.error(t("profile.errors.fetch_history_failed"), error);
    } finally {
      loading.value = false;
    }
  };

  return {
    stats,
    attempts,
    totalAttempts,
    loading,
    fetchStats,
    fetchHistory,
  };
});
