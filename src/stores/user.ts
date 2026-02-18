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
          authStore.user.cloudinaryPublicId = response.data.cloudinaryPublicId;
          localStorage.setItem("user", JSON.stringify(response.data));
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

    async updateProfile(payload: {
      displayName: string;
      selectedFrame?: string | null;
      selectedBackground?: string | null;
    }) {
      this.loading = true;
      const toast = useToastStore();
      const t = i18n.global.t;
      try {
        const response = await api.put<User>("/users/update-profile", {
          DisplayName: payload.displayName,
          SelectedFrame: payload.selectedFrame,
          SelectedBackground: payload.selectedBackground,
        });

        this.profile = response.data;

        const authStore = useAuthStore();
        if (authStore.user) {
          authStore.user.displayName = response.data.displayName;
          localStorage.setItem("user", JSON.stringify(response.data));
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
        const response = await api.post<{ publicId: string }>(
          "/users/upload-avatar",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        if (this.profile) {
          this.profile.cloudinaryPublicId = response.data.publicId;
        }

        toast.show(
          t("profile.avatarSuccess") || "Avatar zaktualizowany!",
          "success",
        );
        return response.data.publicId;
      } catch (err: any) {
        this.error = err.response?.data || "Błąd podczas przesyłania zdjęcia";
        toast.show(this.error as string, "error");
        throw err;
      } finally {
        this.loading = false;
      }
    },

    updateWallet(points: number, xp: number) {
      if (this.profile) {
        this.profile.points = points;
        this.profile.experience = xp;
      }
    },
  },
});
