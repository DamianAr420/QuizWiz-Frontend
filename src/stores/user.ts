import { defineStore } from "pinia";
import api from "@/services/api";
import { useAuthStore } from "./auth";
import type { User, UserStats } from "@/types/user";
import { useToastStore } from "./toast";
import i18n from "@/i18n/index";

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
      const toast = useToastStore();
      const t = i18n.global.t;
      try {
        const response = await api.put<User>("/users/update-profile", {
          displayName,
        });
        if (this.profile) this.profile.displayName = response.data.displayName;

        const authStore = useAuthStore();
        if (authStore.user) {
          authStore.user.displayName = response.data.displayName;
          localStorage.setItem("user", JSON.stringify(authStore.user));
        }

        toast.show(t("profile.updateSuccess"), "success");
      } catch (err: any) {
        this.error = err.response?.data?.message || t("profile.updateError");
        toast.show(this.error as string, "error");
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteAccount() {
      this.loading = true;
      const toast = useToastStore();
      const t = i18n.global.t;
      try {
        await api.delete("/users/delete-account");
        const authStore = useAuthStore();
        authStore.logout();
        this.profile = null;
        this.stats = null;
        toast.show(t("profile.deleteSuccess"), "info");
      } catch (err: any) {
        this.error = err.response?.data?.message || t("profile.deleteError");
        toast.show(this.error as string, "error");
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async uploadAvatar(file: File) {
      this.loading = true;
      const toast = useToastStore();
      const t = i18n.global.t;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await api.post<{ url: string }>(
          "/users/upload-avatar",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        if (this.profile) {
          this.profile.avatarUrl = response.data.url;
        }

        toast.show(
          t("profile.avatarSuccess") || "Avatar zaktualizowany!",
          "success",
        );
        return response.data.url;
      } catch (err: any) {
        this.error = err.response?.data || "Błąd podczas przesyłania zdjęcia";
        toast.show(this.error as string, "error");
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
