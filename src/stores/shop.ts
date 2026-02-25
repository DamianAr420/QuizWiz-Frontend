import { defineStore } from "pinia";
import api from "@/services/api";
import { useUserStore } from "./user";
import type { ShopItem, UserInventory } from "@/types/shop";

export const useShopStore = defineStore("shop", {
  state: () => ({
    items: [] as ShopItem[],
    inventory: [] as UserInventory[],
    loading: false,
  }),

  actions: {
    async fetchShopItems() {
      this.loading = true;
      try {
        const { data } = await api.get("/shop");
        this.items = Array.isArray(data) ? data : [];
      } catch (e) {
        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchInventory() {
      try {
        const { data } = await api.get("/shop/my-inventory");
        this.inventory = data;
      } catch (error) {
        console.error("Błąd pobierania ekwipunku", error);
      }
    },

    async purchaseItem(itemId: number) {
      this.loading = true;
      try {
        const { data } = await api.post(`/shop/purchase/${itemId}`);

        const userStore = useUserStore();
        if (userStore.profile) {
          userStore.profile.points = data.points;
        }

        await this.fetchInventory();
        return { success: true, message: data.message };
      } catch (error: any) {
        return {
          success: false,
          message: error.response?.data || "Błąd podczas zakupu",
        };
      } finally {
        this.loading = false;
      }
    },
  },
});
