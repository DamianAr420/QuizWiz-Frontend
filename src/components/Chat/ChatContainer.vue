<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useFriendsStore } from "@/stores/friends";
import { useChatStore } from "@/stores/chat";
import { useFriendsPolling } from "@/composables/useFriendsPolling";

useFriendsPolling(30000);

const { t } = useI18n();
const chatStore = useChatStore();
const friendsStore = useFriendsStore();
const router = useRouter();

onMounted(() => {
  friendsStore.fetchFriends();
});

const onlineFriends = computed(() =>
  friendsStore.friends.filter((f) => f.isOnline),
);
const offlineFriends = computed(() =>
  friendsStore.friends.filter((f) => !f.isOnline),
);

const goToFriendsPage = () => {
  router.push("/friends");
};
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="!chatStore.hasActiveChats"
      class="fixed bottom-6 right-6 z-50 bg-green-600 dark:bg-green-500 text-white shadow-xl transition-all duration-500 ease-in-out overflow-hidden cursor-pointer"
      :class="[
        chatStore.isFriendsListOpen
          ? 'w-72 h-128 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl cursor-default!'
          : 'w-14 h-14 rounded-2xl hover:bg-green-700 dark:hover:bg-green-400 hover:scale-105 active:scale-95',
      ]"
      @click="!chatStore.isFriendsListOpen && chatStore.toggleFriendsList()"
    >
      <div
        v-if="!chatStore.isFriendsListOpen"
        class="w-full h-full flex items-center justify-center animate-in fade-in duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      <div
        v-else
        class="w-full h-full flex flex-col animate-in fade-in duration-500 delay-150"
      >
        <div
          class="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"
        >
          <span class="font-bold text-slate-800 dark:text-white">{{
            t("chat.container.title")
          }}</span>
          <button
            @click.stop="chatStore.toggleFriendsList"
            class="text-slate-500 hover:text-red-500 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {{ t("chat.container.close") }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div
            class="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
          >
            {{ t("chat.container.online") }}
          </div>
          <div
            v-for="friend in onlineFriends"
            :key="friend.id"
            @click.stop="
              () => {
                chatStore.openChat(friend.id);
                chatStore.toggleFriendsList();
              }
            "
            class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div
              class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200 dark:shadow-none"
            ></div>
            <span
              class="text-slate-700 dark:text-slate-200 font-medium text-sm"
              >{{ friend.name }}</span
            >
          </div>

          <div
            class="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
          >
            {{ t("chat.container.offline") }}
          </div>
          <div
            v-for="friend in offlineFriends"
            :key="friend.id"
            @click.stop="
              () => {
                chatStore.openChat(friend.id);
                chatStore.toggleFriendsList();
              }
            "
            class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 opacity-70 hover:opacity-100"
          >
            <div
              class="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600"
            ></div>
            <span
              class="text-slate-500 dark:text-slate-400 font-medium text-sm"
              >{{ friend.name }}</span
            >
          </div>
        </div>

        <button
          @click="goToFriendsPage"
          class="p-3 text-xs font-bold text-green-600 dark:text-green-400 border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider"
        >
          {{ t("chat.container.manage") }}
        </button>
      </div>
    </div>
  </Transition>
</template>
