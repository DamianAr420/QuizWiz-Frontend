import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";
import { useToastStore } from "./toast";
import i18n from "@/i18n/index";
import type { User } from "@/types/user";
import type { ShopItem } from "@/types/shop";
import type { Quiz, UpdateQuizDto } from "@/types/quiz";

export const useAdminStore = defineStore("admin", () => {
  const users = ref<User[]>([]);
  const shopItems = ref<ShopItem[]>([]);
  const pendingQuizzes = ref<Quiz[]>([]);
  const totalPages = ref(1);
  const currentPage = ref(1);
  const totalCount = ref(0);
  const loading = ref(false);

  const toast = useToastStore();
  const t = i18n.global.t;

  const pendingCount = computed(() => pendingQuizzes.value.length);
  const adminUsers = computed(() =>
    users.value.filter((u) => u.role === "Admin"),
  );

  const handleError = (error: any, defaultKey: string) => {
    const code = error.response?.data?.code;
    const msg = code ? t(`admin.errors.${code}`) : t(defaultKey);
    toast.show(msg, "error");
  };

  const fetchUsers = async (search?: string, page: number = 1) => {
    loading.value = true;
    try {
      const { data } = await api.get("/Admin/users", {
        params: { search, page, pageSize: 10 },
      });
      users.value = data.items;
      totalPages.value = data.totalPages;
      currentPage.value = data.currentPage;
      totalCount.value = data.totalCount;
    } catch (err: any) {
      handleError(err, "admin.userFetchError");
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    loading.value = true;
    try {
      const { data } = await api.put<User>(`/Admin/users/${id}`, userData);
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) users.value[index] = data;
      toast.show(t("admin.userUpdateSuccess"), "success");
    } catch (err: any) {
      handleError(err, "admin.userUpdateError");
    } finally {
      loading.value = false;
    }
  };

  const fetchShopItems = async () => {
    loading.value = true;
    try {
      const { data } = await api.get<ShopItem[]>("/shop");
      shopItems.value = data;
    } catch (err: any) {
      handleError(err, "admin.shopFetchError");
    } finally {
      loading.value = false;
    }
  };

  const saveShopItem = async (item: Partial<ShopItem>) => {
    loading.value = true;
    try {
      if (!item.id) {
        const { data } = await api.post<ShopItem>("/Admin/shop", item);
        shopItems.value.push(data);
      } else {
        const { data } = await api.put<ShopItem>(
          `/Admin/shop/${item.id}`,
          item,
        );
        const index = shopItems.value.findIndex((i) => i.id === item.id);
        if (index !== -1) shopItems.value[index] = data;
      }
      toast.show(t("admin.shopSaveSuccess"), "success");
    } catch (err: any) {
      handleError(err, "admin.shopSaveError");
    } finally {
      loading.value = false;
    }
  };

  const deleteShopItem = async (id: number) => {
    loading.value = true;
    try {
      await api.delete(`/Admin/shop/${id}`);
      shopItems.value = shopItems.value.filter((i) => i.id !== id);
      toast.show(t("admin.shopDeleteSuccess"), "success");
    } catch (err: any) {
      handleError(err, "admin.shopDeleteError");
    } finally {
      loading.value = false;
    }
  };

  const fetchPendingQuizzes = async () => {
    loading.value = true;
    try {
      const { data } = await api.get<Quiz[]>("/Admin/quizzes/pending");
      pendingQuizzes.value = data;
    } catch (err: any) {
      handleError(err, "admin.quizFetchError");
    } finally {
      loading.value = false;
    }
  };

  const verifyQuiz = async (id: number) => {
    try {
      await api.put(`/Admin/quizzes/${id}/verify`);
      pendingQuizzes.value = pendingQuizzes.value.filter((q) => q.id !== id);
      toast.show(t("admin.quizVerifySuccess"), "success");
    } catch (err: any) {
      handleError(err, "admin.quizActionError");
    }
  };

  const rejectQuiz = async (id: number) => {
    try {
      await api.delete(`/Admin/quizzes/${id}/reject`);
      pendingQuizzes.value = pendingQuizzes.value.filter((q) => q.id !== id);
      toast.show(t("admin.quizRejectSuccess"), "success");
    } catch (err: any) {
      handleError(err, "admin.quizActionError");
    }
  };

  const updateQuiz = async (id: number, dto: UpdateQuizDto) => {
    try {
      await api.put(`/quizzes/${id}`, dto);
      await fetchPendingQuizzes();
      toast.show(t("admin.quizUpdateSuccess"), "success");
    } catch (err: any) {
      handleError(err, "admin.quizActionError");
    }
  };

  return {
    users,
    shopItems,
    pendingQuizzes,
    totalPages,
    currentPage,
    totalCount,
    loading,
    pendingCount,
    adminUsers,
    fetchUsers,
    updateUser,
    fetchShopItems,
    saveShopItem,
    deleteShopItem,
    fetchPendingQuizzes,
    verifyQuiz,
    rejectQuiz,
    updateQuiz,
  };
});
