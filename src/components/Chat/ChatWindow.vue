<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useChatStore } from "@/stores/chat";
import { useUserStore } from "@/stores/user";

const { t } = useI18n();
const props = defineProps<{ friendId: number }>();
const chatStore = useChatStore();
const userStore = useUserStore();
const chatContainer = ref<HTMLElement | null>(null);
const newMessage = ref("");
const expandedMessageId = ref<number | null>(null);

const messages = computed(
  () => chatStore.messagesByFriend[props.friendId] || [],
);

const isNewDay = (currentMsg: any, index: number) => {
  if (index === 0) return true;
  const prevDate = new Date(messages.value[index - 1].sentAt).toDateString();
  const currDate = new Date(currentMsg.sentAt).toDateString();
  return prevDate !== currDate;
};

const getDayLabel = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString())
    return t("chat.window.today");
  if (date.toDateString() === yesterday.toDateString())
    return t("chat.window.yesterday");
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long" });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value)
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
};

onMounted(async () => {
  await chatStore.fetchChatHistory(props.friendId);
  await chatStore.markAsRead(props.friendId);
  scrollToBottom();
});

watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  await chatStore.sendMessage(props.friendId, newMessage.value);
  newMessage.value = "";
};
</script>

<template>
  <div
    class="w-72 h-96 bg-white -mr-16 mb-4 dark:bg-slate-900 rounded-t-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
  >
    <div
      class="p-3 bg-green-600 text-white font-bold flex justify-between items-center text-sm"
    >
      <span>{{ chatStore.getFriendName(props.friendId) }}</span>
      <button
        @click="chatStore.closeChat(friendId)"
        class="hover:text-slate-200"
      >
        ✕
      </button>
    </div>

    <div ref="chatContainer" class="flex-1 overflow-y-auto p-3 space-y-3">
      <div v-for="(msg, index) in messages" :key="msg.id">
        <div
          v-if="isNewDay(msg, index)"
          class="text-center text-[10px] text-slate-400 py-3 uppercase tracking-wider font-bold"
        >
          {{ getDayLabel(msg.sentAt) }}
        </div>

        <div
          class="flex w-full"
          :class="
            msg.senderId === userStore.profile?.id
              ? 'justify-end'
              : 'justify-start'
          "
        >
          <div
            class="text-sm p-3 rounded-2xl max-w-[80%] cursor-pointer select-none transition-all duration-200 wrap-break-word"
            :class="[
              msg.senderId === userStore.profile?.id
                ? 'bg-green-600 text-white rounded-br-none'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none',
            ]"
            @click="
              expandedMessageId = expandedMessageId === msg.id ? null : msg.id
            "
          >
            {{ msg.content }}

            <span
              v-if="msg.senderId === userStore.profile?.id"
              class="block font-black text-[9px] mt-1"
              :class="msg.isRead ? 'text-slate-800' : 'text-slate-300'"
            >
              {{ msg.isRead ? "✓✓" : "✓" }}
            </span>

            <div
              v-if="
                (index === messages.length - 1 &&
                  msg.senderId !== userStore.profile?.id) ||
                expandedMessageId === msg.id
              "
              class="text-[10px] mt-1 opacity-70"
              :class="
                msg.senderId === userStore.profile?.id
                  ? 'text-right'
                  : 'text-left'
              "
            >
              {{ formatTime(msg.sentAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <input
      v-model="newMessage"
      @keyup.enter="sendMessage"
      class="p-3 border-t border-slate-200 dark:border-slate-800 outline-none text-sm dark:bg-slate-900 dark:text-white"
      :placeholder="t('chat.window.placeholder')"
    />
  </div>
</template>
