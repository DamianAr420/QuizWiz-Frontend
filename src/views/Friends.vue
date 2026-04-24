<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useFriendsStore } from "@/stores/friends";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const friendsStore = useFriendsStore();
const searchUsername = ref("");

onMounted(() => {
  friendsStore.fetchFriends();
  friendsStore.fetchRequests();
});

const handleAddFriend = async () => {
  if (!searchUsername.value) return;
  await friendsStore.sendRequest(searchUsername.value);
  searchUsername.value = "";
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold text-slate-800 dark:text-white mb-6">
      {{ t("friends.title") }}
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div
          class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <h2 class="font-bold text-slate-800 dark:text-white mb-4">
            {{ t("friends.addFriend") }}
          </h2>
          <div class="flex gap-2">
            <input
              v-model="searchUsername"
              type="text"
              :placeholder="t('friends.placeholder')"
              class="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 border-none outline-none text-sm text-slate-800 dark:text-white"
            />
            <button
              @click="handleAddFriend"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors"
            >
              {{ t("friends.add") }}
            </button>
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <h2 class="font-bold text-slate-800 dark:text-white mb-4">
            {{
              t("friends.requests", {
                count: friendsStore.pendingRequests.length,
              })
            }}
          </h2>
          <div
            v-if="friendsStore.pendingRequests.length === 0"
            class="text-sm text-slate-400"
          >
            {{ t("friends.noRequests") }}
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="req in friendsStore.pendingRequests"
              :key="req.senderId"
              class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl"
            >
              <span
                class="text-sm font-medium text-slate-700 dark:text-slate-200"
                >{{ req.senderName }}</span
              >
              <div class="flex gap-2">
                <button
                  @click="friendsStore.acceptRequest(req.senderId)"
                  class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {{ t("friends.accept") }}
                </button>
                <button
                  @click="friendsStore.declineRequest(req.senderId)"
                  class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold rounded-lg transition-colors"
                >
                  {{ t("friends.decline") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit"
      >
        <h2 class="font-bold text-slate-800 dark:text-white mb-4">
          {{ t("friends.yourFriends") }}
        </h2>
        <div
          v-if="friendsStore.friends.length === 0"
          class="text-sm text-slate-400"
        >
          {{ t("friends.noFriends") }}
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="friend in friendsStore.friends"
            :key="friend.id"
            class="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
          >
            <div
              :class="friend.isOnline ? 'bg-green-500' : 'bg-slate-400'"
              class="w-2 h-2 rounded-full"
            ></div>
            <span class="text-sm text-slate-700 dark:text-slate-200">{{
              friend.name
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
