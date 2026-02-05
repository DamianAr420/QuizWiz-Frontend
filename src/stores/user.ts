import { defineStore } from "pinia";
import api from "@/services/api";
import { useAuthStore } from "./auth";
import type { User, UserStats } from "@/types/user";

export const useUserStore = defineStore("user", {
  state: () => ({
    profile: null as User | null,
    stats: null as UserStats | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchProfile() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<User>("/users/me");
        this.profile = response.data;

        const authStore = useAuthStore();
        if (authStore.user) {
          authStore.user.displayName = response.data.displayName;
          localStorage.setItem("user", JSON.stringify(authStore.user));
        }
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "Nie udało się pobrać profilu";
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<UserStats>("/users/stats");
        this.stats = response.data;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "Nie udało się pobrać statystyk";
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(displayName: string) {
      this.loading = true;
      try {
        const response = await api.put<User>("/users/update-profile", {
          displayName,
        });

        if (this.profile) {
          this.profile.displayName = response.data.displayName;
        }

        const authStore = useAuthStore();
        if (authStore.user) {
          authStore.user.displayName = response.data.displayName;
          localStorage.setItem("user", JSON.stringify(authStore.user));
        }
      } catch (err: any) {
        this.error = err.response?.data?.message || "Błąd podczas aktualizacji";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteAccount() {
      this.loading = true;
      try {
        await api.delete("/users/delete-account");
        const authStore = useAuthStore();
        authStore.logout();
        this.profile = null;
        this.stats = null;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "Błąd podczas usuwania konta";
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
