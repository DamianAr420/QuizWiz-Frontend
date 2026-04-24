import { defineStore } from "pinia";
import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "./auth";
import api from "@/services/api";
import { useFriendsStore } from "@/stores/friends";
import { useUserStore } from "@/stores/user";
import { useToastStore } from "@/stores/toast";
import i18n from "@/i18n";

const { t } = i18n.global;

export const useChatStore = defineStore("chat", {
  state: () => ({
    connection: null as signalR.HubConnection | null,
    openChats: [] as number[],
    messagesByFriend: {} as Record<number, any[]>,
    isFriendsListOpen: false,
  }),
  getters: {
    hasActiveChats: (state) => state.openChats.length > 0,
    getFriendName: () => (id: number) => {
      const friendsStore = useFriendsStore();
      const friend = friendsStore.friends.find((f) => f.id === id);
      return friend ? friend.name : t("chat.window.unknownUser");
    },
  },
  actions: {
    notifyError(code: string, defaultKey: string) {
      const message = code ? t(`chat.errors.${code}`) : t(defaultKey);
      useToastStore().error(message);
    },

    async startConnection() {
      const authStore = useAuthStore();
      const userStore = useUserStore();
      const baseUrl =
        api.defaults.baseURL?.replace(/\/api$/, "") ||
        import.meta.env.VITE_API_URL.replace(/\/api$/, "");
      const hubUrl = `${baseUrl}/chathub`;

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => authStore.token ?? "",
        })
        .withAutomaticReconnect()
        .build();

      this.connection.on("Error", (code: string) => {
        this.notifyError(code, "chat.toast.defaultError");
      });

      this.connection.on("ReceiveMessage", (message) => {
        const friendId =
          message.senderId === (userStore.profile ? userStore.profile.id : null)
            ? message.receiverId
            : message.senderId;

        if (!this.messagesByFriend[friendId]) {
          this.messagesByFriend[friendId] = [];
        }
        this.messagesByFriend[friendId].push(message);

        if (!this.openChats.includes(friendId)) {
          this.openChats.push(friendId);
        }
      });

      this.connection.on("MessagesRead", (readerId) => {
        if (this.messagesByFriend[readerId]) {
          this.messagesByFriend[readerId].forEach((msg) => {
            msg.isRead = true;
          });
        }
      });

      try {
        await this.connection.start();
      } catch (err) {
        console.error("SignalR Error:", err);
      }
    },

    async openChat(friendId: number) {
      if (this.openChats.includes(friendId)) return;

      this.openChats.push(friendId);
      await this.fetchChatHistory(friendId);
    },

    closeChat(friendId: number) {
      this.openChats = this.openChats.filter((id) => id !== friendId);
    },

    async sendMessage(receiverId: number, content: string) {
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        try {
          await this.connection.invoke("SendMessage", receiverId, content);
        } catch (err) {
          useToastStore().error(t("chat.toast.sendError"));
        }
      }
    },

    toggleFriendsList() {
      this.isFriendsListOpen = !this.isFriendsListOpen;
    },

    async fetchChatHistory(friendId: number) {
      if (
        this.messagesByFriend[friendId] &&
        this.messagesByFriend[friendId].length > 0
      ) {
        return;
      }

      try {
        const response = await api.get(`friends/chat/${friendId}`);
        this.messagesByFriend[friendId] = response.data;
      } catch (err) {
        console.error("Błąd podczas pobierania historii czatu:", err);
      }
    },

    async markAsRead(friendId: number) {
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke("MarkAsRead", friendId);
      }
    },
  },
});
