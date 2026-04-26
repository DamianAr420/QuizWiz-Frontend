import { onMounted, onUnmounted } from "vue";
import { useFriendsStore } from "@/stores/friends";

export function useFriendsPolling(intervalMs = 30000) {
  const friendsStore = useFriendsStore();
  let interval: any = null;

  onMounted(() => {
    friendsStore.fetchFriends(false);

    interval = setInterval(() => {
      friendsStore.fetchFriends(true);
    }, intervalMs);
  });

  onUnmounted(() => {
    if (interval) clearInterval(interval);
  });
}
