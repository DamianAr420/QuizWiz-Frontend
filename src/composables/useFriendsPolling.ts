import { onMounted, onUnmounted } from "vue";
import { useFriendsStore } from "@/stores/friends";
import { useAuthStore } from "@/stores/auth";

export function useFriendsPolling(intervalMs = 30000) {
  const friendsStore = useFriendsStore();
  const authStore = useAuthStore();

  let interval: number | null = null;

  onMounted(() => {
    if (!authStore.isAuthenticated) {
      return;
    }

    friendsStore.fetchFriends(false);

    interval = window.setInterval(() => {
      if (authStore.isAuthenticated) {
        friendsStore.fetchFriends(true);
      }
    }, intervalMs);
  });

  onUnmounted(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
}
