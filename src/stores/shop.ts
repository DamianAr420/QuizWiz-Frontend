import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import { useUserStore } from "./user";
import { useToastStore } from "./toast";
import i18n from "@/i18n/index";
import type { ShopItem, UserInventory } from "@/types/shop";

export const useShopStore = defineStore("shop", () => {
  const items = ref<ShopItem[]>([]);
  const inventory = ref<UserInventory[]>([]);
  const loading = ref(false);
  const toast = useToastStore();
  const t = i18n.global.t;

  const handleError = (error: any, defaultKey: string) => {
    const code = error.response?.data?.code;
    const msg = code ? t(`shop.errors.${code}`) : t(defaultKey);
    toast.show(msg, "error");
    throw msg;
  };

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

  const purchaseItem = async (itemId: number) => {
    loading.value = true;
    try {
      const { data } = await api.post(`/shop/purchase/${itemId}`);

      const userStore = useUserStore();
      if (userStore.profile) {
        userStore.profile.points = data.points;
      }

      toast.show(t("shop.purchaseSuccess"), "success");
      await fetchInventory();
      return true;
    } catch (error: any) {
      handleError(error, "shop.purchaseError");
      return false;
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
