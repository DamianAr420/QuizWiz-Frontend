import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import { useUserStore } from "./user";
import i18n from "@/i18n/index";
import type { ShopItem, UserInventory, PurchaseResult } from "@/types/shop";

export const useShopStore = defineStore("shop", () => {
  const items = ref<ShopItem[]>([]);
  const inventory = ref<UserInventory[]>([]);
  const loading = ref(false);
  const t = i18n.global.t;

  const fetchShopItems = async () => {
    loading.value = true;
    try {
      const { data } = await api.get<ShopItem[]>("/shop");
      items.value = Array.isArray(data) ? data : [];
    } catch (e) {
      items.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchInventory = async () => {
    try {
      const { data } = await api.get<UserInventory[]>("/shop/my-inventory");
      inventory.value = data;
    } catch (error) {
      console.error("Błąd pobierania ekwipunku", error);
    }
  };

  const purchaseItem = async (itemId: number): Promise<PurchaseResult> => {
    loading.value = true;
    try {
      const { data } = await api.post(`/shop/purchase/${itemId}`);

      const userStore = useUserStore();
      if (userStore.profile) {
        userStore.profile.points = data.points;
      }

      await fetchInventory();

      return { success: true, message: t("shop.purchaseSuccess") };
    } catch (error: any) {
      const code = error.response?.data?.code;
      const msg = code ? t(`shop.errors.${code}`) : t("shop.purchaseError");

      return { success: false, message: msg };
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    inventory,
    loading,
    fetchShopItems,
    fetchInventory,
    purchaseItem,
  };
});
