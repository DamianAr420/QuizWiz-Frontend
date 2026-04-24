import { defineStore } from "pinia";
import { ref } from "vue";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export const useToastStore = defineStore("toast", () => {
  const toasts = ref<Toast[]>([]);

  const show = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = Date.now();
    toasts.value.push({ id, message, type });

    setTimeout(() => {
      remove(id);
    }, 3000);
  };

  const success = (message: string) => show(message, "success");
  const error = (message: string) => show(message, "error");
  const info = (message: string) => show(message, "info");

  const remove = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  return { toasts, show, success, error, info, remove };
});
