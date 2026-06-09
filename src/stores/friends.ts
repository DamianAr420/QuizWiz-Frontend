import { defineStore } from "pinia";
import api from "@/services/api";
import { useToastStore } from "@/stores/toast";
import i18n from "@/i18n";
import type { Friend, FriendRequest } from "@/types/friend";
import { useAuthStore } from "@/stores/auth";

const { t } = i18n.global;

export const useFriendsStore = defineStore("friends", {
  state: () => ({
    friends: [] as Friend[],
    pendingRequests: [] as FriendRequest[],
  }),
  actions: {
    notifyError(error: any, defaultKey: string) {
      const code = error.response?.data?.code;
      let message = code ? t(`friends.errors.${code}`) : null;

      if (!message || message === `friends.errors.${code}`) {
        message = code ? t(`common.errors.${code}`) : t(defaultKey);
      }

      if (message === `common.errors.${code}`) {
        message = t(defaultKey);
      }

      useToastStore().error(message);
    },

    async fetchFriends(silent = false) {
      const authStore = useAuthStore();

      if (!authStore.isAuthenticated) {
        this.friends = [];
        return;
      }

      try {
        const response = await api.get("/friends");

        this.friends = response.data.map((f: any) => ({
          id: f.id,
          name: f.displayName,
          isOnline: f.isOnline,
        }));
      } catch (error: any) {
        if (error.response?.status === 401) {
          return;
        }
        if (!silent) {
          this.notifyError(error, "friends.toast.fetchFriendsError");
        }
      }
    },

    async fetchRequests() {
      try {
        const response = await api.get("friends/requests");
        this.pendingRequests = response.data;
      } catch (error) {
        this.notifyError(error, "friends.toast.fetchRequestsError");
      }
    },

    async sendRequest(username: string) {
      try {
        await api.post(`friends/request/${username}`);
        useToastStore().success(t("friends.toast.sent"));
      } catch (error: any) {
        this.notifyError(error, "friends.toast.sendError");
      }
    },

    async acceptRequest(requesterId: number) {
      try {
        await api.put(`friends/accept/${requesterId}`);
        useToastStore().success(t("friends.toast.accepted"));
        await this.fetchFriends();
        await this.fetchRequests();
      } catch (error: any) {
        this.notifyError(error, "friends.toast.acceptError");
      }
    },

    async declineRequest(requesterId: number) {
      try {
        await api.delete(`friends/decline/${requesterId}`);
        useToastStore().info(t("friends.toast.declined"));
        await this.fetchRequests();
      } catch (error: any) {
        this.notifyError(error, "friends.toast.declineError");
      }
    },
  },
});
