import { defineStore } from "pinia";
import api from "@/services/api";
import type { RankingEntry, RankingType } from "@/types/ranking";

export const useRankingStore = defineStore("ranking", {
  state: () => ({
    rankings: [] as RankingEntry[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchRanking(type: RankingType) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get<RankingEntry[]>(`/ranking/${type}`);
        this.rankings = response.data;
      } catch (err) {
        this.error = "Nie udało się pobrać danych rankingu.";
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
