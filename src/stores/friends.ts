import { defineStore } from "pinia";
import api from "@/services/api";

export interface Friend {
  id: number;
  name: string;
  isOnline: boolean;
}

export const useFriendsStore = defineStore("friends", {
  state: () => ({
    friends: [] as Friend[],
    loading: false,
  }),
  actions: {
    async fetchFriends() {
      this.loading = true;
      try {
        const response = await api.get("/friends");

        this.friends = response.data.map((f: any) => ({
          id: f.id,
          name: f.displayName,
          isOnline: f.isOnline || false,
        }));
        console.log("Pobrani znajomi:", this.friends);
      } catch (error) {
        console.error("Błąd pobierania znajomych:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});
