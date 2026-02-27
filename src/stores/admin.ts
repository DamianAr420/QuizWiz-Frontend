import { defineStore } from "pinia";
import api from "@/services/api";
import type { User } from "@/types/user";
import type { ShopItem } from "@/types/shop";
import type { Quiz, UpdateQuizDto } from "@/types/quiz";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    users: [] as User[],
    shopItems: [] as ShopItem[],
    pendingQuizzes: [] as Quiz[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    pendingCount: (state) => state.pendingQuizzes.length,
    adminUsers: (state) => state.users.filter((u) => u.role === "Admin"),
  },

  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const { data } = await api.get<User[]>("/Admin/users");
        this.users = data;
      } catch (err) {
        this.error = "Nie udało się pobrać listy użytkowników.";
      } finally {
        this.loading = false;
      }
    },

    async updateUser(id: number, userData: Partial<User>) {
      try {
        const { data } = await api.put<User>(`/Admin/users/${id}`, userData);
        const index = this.users.findIndex((u) => u.id === id);
        if (index !== -1) this.users[index] = data;
      } catch (err) {
        console.error("Błąd edycji użytkownika:", err);
      }
    },

    async fetchShopItems() {
      try {
        const { data } = await api.get<ShopItem[]>("/shop");
        this.shopItems = data;
      } catch (err) {
        console.error("Błąd pobierania przedmiotów:", err);
      }
    },

    async saveShopItem(item: Partial<ShopItem>) {
      try {
        if (item.id === 0 || !item.id) {
          const { data } = await api.post<ShopItem>("/Admin/shop", item);
          this.shopItems.push(data);
        } else {
          const { data } = await api.put<ShopItem>(
            `/Admin/shop/${item.id}`,
            item,
          );
          const index = this.shopItems.findIndex((i) => i.id === item.id);
          if (index !== -1) this.shopItems[index] = data;
        }
      } catch (err) {
        console.error("Błąd zapisu w sklepie:", err);
      }
    },

    async deleteShopItem(id: number) {
      try {
        await api.delete(`/Admin/shop/${id}`);
        this.shopItems = this.shopItems.filter((i) => i.id !== id);
      } catch (err) {
        console.error("Błąd usuwania przedmiotu:", err);
      }
    },

    async fetchPendingQuizzes() {
      try {
        const { data } = await api.get<Quiz[]>("/Admin/quizzes/pending");
        this.pendingQuizzes = data;
      } catch (err) {
        console.error("Błąd pobierania quizów do weryfikacji:", err);
      }
    },

    async verifyQuiz(id: number) {
      try {
        await api.put(`/Admin/quizzes/${id}/verify`);
        this.pendingQuizzes = this.pendingQuizzes.filter((q) => q.id !== id);
      } catch (err) {
        console.error("Błąd podczas zatwierdzania quizu:", err);
      }
    },

    async rejectQuiz(id: number) {
      try {
        await api.delete(`/Admin/quizzes/${id}/reject`);
        this.pendingQuizzes = this.pendingQuizzes.filter((q) => q.id !== id);
      } catch (err) {
        console.error("Błąd podczas odrzucania quizu:", err);
      }
    },

    async updateQuiz(id: number, dto: UpdateQuizDto) {
      try {
        await api.put(`/quizzes/${id}`, dto);
        await this.fetchPendingQuizzes();
      } catch (err) {
        console.error("Błąd edycji quizu przez admina:", err);
      }
    },
  },
});
