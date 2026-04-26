import api from "@/services/api";
import { useAuthStore } from "@/stores/auth";

export function useHeartbeat() {
  let interval: any = null;

  const startHeartbeat = () => {
    interval = setInterval(async () => {
      try {
        await api.post("users/ping");
      } catch (e: any) {
        if (e.response?.status === 401) {
          const authStore = useAuthStore();
          authStore.logout();
        }
      }
    }, 60000);
  };

  const stopHeartbeat = () => {
    if (interval) clearInterval(interval);
  };

  return { startHeartbeat, stopHeartbeat };
}
