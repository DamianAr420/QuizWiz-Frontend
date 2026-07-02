import { defineStore } from "pinia";
import api from "@/services/api";
import { signalRService } from "@/services/signalrService";
import router from "@/router";

export const useLobbyStore = defineStore("lobby", {
  state: () => ({
    lobbies: [] as any[],
    currentLobby: null as any,
    loading: false,
  }),

  actions: {
    async fetchPublicLobbies() {
      this.loading = true;
      try {
        const { data } = await api.get("/lobby/public");
        this.lobbies = data;
      } catch (error) {
        console.error("Error fetching lobbies:", error);
      } finally {
        this.loading = false;
      }
    },

    async getLobbyDetails(id: string) {
      try {
        const { data } = await api.get(`/lobby/${id}`);
        this.currentLobby = data;
        return data;
      } catch (error) {
        throw error;
      }
    },

    async createLobby(lobbyData: any) {
      this.loading = true;
      try {
        const { data } = await api.post("/lobby/create", lobbyData);
        return data;
      } finally {
        this.loading = false;
      }
    },

    async joinLobby(id: string) {
      try {
        await api.post(`/lobby/join/${id}`);
      } catch (error) {
        throw error;
      }
    },

    async connectToLobby(lobbyId: string, token: string) {
      await signalRService.initConnection(token);

      signalRService.on("PlayerJoined", async () => {
        await this.getLobbyDetails(lobbyId);
      });

      signalRService.on("UserReadyStatusChanged", (userId, isReady) => {
        const player = this.currentLobby?.players.find(
          (p: any) => p.userId === userId,
        );
        if (player) player.isReady = isReady;
      });

      signalRService.on("GameStarted", () => {
        if (this.currentLobby) {
          this.currentLobby.status = "InGame";
          router.push(`/play/${this.currentLobby.id}`);
        }
      });

      signalRService.on("PlayerLeft", (userId: string) => {
        if (this.currentLobby?.players) {
          this.currentLobby.players = this.currentLobby.players.filter(
            (p: any) => p.userId !== userId,
          );
        }
      });

      signalRService.on("HostChanged", (newHostId: string) => {
        if (this.currentLobby) {
          this.currentLobby.hostId = newHostId;
        }
      });

      await signalRService.invoke("JoinLobbyGroup", lobbyId);
    },

    async toggleReady(lobbyId: string, status: boolean) {
      await signalRService.invoke("ToggleReady", lobbyId, status);
    },

    async leaveLobby() {
      try {
        if (signalRService && this.currentLobby) {
          await signalRService.invoke("LeaveLobby", this.currentLobby.id);

          signalRService.off("PlayerJoined");
          signalRService.off("UserReadyStatusChanged");
          signalRService.off("GameStarted");
          signalRService.off("PlayerLeft");
          signalRService.off("HostChanged");

          if (this.currentLobby?.status !== "InGame") {
            await signalRService.stopConnection();
          }
        }

        this.currentLobby = null;
      } catch (error) {
        console.error("Error podczas opuszczania lobby:", error);
      }
    },

    async startGame() {
      try {
        if (!this.currentLobby?.id) return;
        await signalRService.invoke("StartGame", this.currentLobby.id);
      } catch (err) {
        console.error("Błąd startu:", err);
        throw err;
      }
    },
  },
});
