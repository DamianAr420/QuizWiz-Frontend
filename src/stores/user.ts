import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import { useAuthStore } from "./auth";
import { useToastStore } from "./toast";
import i18n from "@/i18n/index";
import type { User, UserStats } from "@/types/user";

export const useUserStore = defineStore("user", () => {
  const profile = ref<User | null>(null);
  const stats = ref<UserStats | null>(null);
  const loading = ref(false);
  const toast = useToastStore();
  const t = i18n.global.t;

  const handleError = (error: any, defaultKey: string) => {
    const code = error.response?.data?.code;
    const msg = code ? t(`profile.errors.${code}`) : t(defaultKey);
    toast.show(msg, "error");
    throw msg;
  };

  const fetchProfile = async () => {
    loading.value = true;
    try {
      const response = await api.get<User>("/users/me");
      profile.value = response.data;

      const authStore = useAuthStore();
      if (authStore.user) {
        authStore.user.displayName = response.data.displayName;
        authStore.user.cloudinaryPublicId = response.data.cloudinaryPublicId;
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (err: any) {
      handleError(err, "profile.fetchError");
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (payload: {
    displayName: string;
    selectedFrame?: string | null;
    selectedBackground?: string | null;
  }) => {
    loading.value = true;
    try {
      const response = await api.put<User>("/users/update-profile", payload);
      profile.value = response.data;

      const authStore = useAuthStore();
      if (authStore.user) {
        authStore.user.displayName = response.data.displayName;
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      toast.show(t("profile.updateSuccess"), "success");
    } catch (err: any) {
      handleError(err, "profile.updateError");
    } finally {
      loading.value = false;
    }
  };

  const uploadAvatar = async (file: File) => {
    loading.value = true;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post<{ publicId: string }>(
        "/users/upload-avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (profile.value) {
        profile.value.cloudinaryPublicId = response.data.publicId;
      }
      toast.show(t("profile.avatarSuccess"), "success");
      return response.data.publicId;
    } catch (err: any) {
      handleError(err, "profile.avatarError");
    } finally {
      loading.value = false;
    }
  };

  const deleteAccount = async () => {
    loading.value = true;
    try {
      await api.delete("/users/delete-account");
      useAuthStore().logout();
      profile.value = null;
      stats.value = null;
      toast.show(t("profile.deleteSuccess"), "info");
    } catch (err: any) {
      handleError(err, "profile.deleteError");
    } finally {
      loading.value = false;
    }
  };

  const fetchStats = async () => {
    loading.value = true;
    try {
      const response = await api.get<UserStats>("/users/stats");
      stats.value = response.data;
    } catch (err: any) {
      handleError(err, "profile.fetchStatsError");
    } finally {
      loading.value = false;
    }
  };

  const updateWallet = (points: number, xp: number) => {
    if (profile.value) {
      profile.value.points = points;
      profile.value.experience = xp;
    }
  };

  return {
    profile,
    stats,
    loading,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAccount,
    updateWallet,
    fetchStats,
  };
});
