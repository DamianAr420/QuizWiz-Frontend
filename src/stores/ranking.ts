import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import { useToastStore } from "./toast";
import i18n from "@/i18n/index";
import type { RankingEntry, RankingType } from "@/types/ranking";

export const useRankingStore = defineStore("ranking", () => {
  const rankings = ref<RankingEntry[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const toast = useToastStore();
  const t = i18n.global.t;

  const handleError = (err: any, defaultKey: string) => {
    const msg = err.response?.data
      ? t(`ranking.${err.response.data}`)
      : t(defaultKey);
    error.value = msg;
    toast.show(msg, "error");
  };

  const fetchRanking = async (type: RankingType) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<RankingEntry[]>(`/ranking/${type}`);
      rankings.value = data;
    } catch (err: any) {
      handleError(err, "ranking.fetchError");
      rankings.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    rankings,
    isLoading,
    error,
    fetchRanking,
  };
});
