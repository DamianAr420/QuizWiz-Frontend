<script setup lang="ts">
import { onMounted, onUnmounted, computed, watch, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLobbyStore } from "@/stores/lobby";
import { useAuthStore } from "@/stores/auth";
import { useCloudinary } from "@/composables/useCloudinary";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const lobbyStore = useLobbyStore();
const authStore = useAuthStore();
const { getAvatarUrl } = useCloudinary();

const lobbyId = computed(() => route.params.id as string);
const currentUser = computed(() => authStore.user);
const isStartingGame = ref(false);

const isHost = computed(() => {
  return lobbyStore.currentLobby?.hostId === currentUser.value?.id;
});

const myStatus = computed(() => {
  const me = lobbyStore.currentLobby?.players.find(
    (p: any) => p.userId === currentUser.value?.id,
  );
  return me?.isReady || false;
});

const canStart = computed(() => {
  if (!lobbyStore.currentLobby?.players) return false;
  const otherPlayers = lobbyStore.currentLobby.players.filter(
    (p: any) => p.userId !== lobbyStore.currentLobby.hostId,
  );
  return otherPlayers.length > 0 && otherPlayers.every((p: any) => p.isReady);
});

watch(
  () => lobbyStore.currentLobby?.status,
  (newStatus) => {
    if (newStatus === "InGame") {
      router.push(`/play/${lobbyId.value}`);
    }
  },
);

onMounted(async () => {
  try {
    await lobbyStore.getLobbyDetails(lobbyId.value);
    if (authStore.token) {
      await lobbyStore.connectToLobby(lobbyId.value, authStore.token);

      if (lobbyStore.currentLobby?.status === "InGame") {
        router.push(`/play/${lobbyId.value}`);
      }
    }
  } catch (error) {
    router.push("/quiz");
  }
});

onUnmounted(() => {
  if (!isStartingGame.value) {
    void lobbyStore.leaveLobby();
  }
});

const handleToggleReady = async () => {
  await lobbyStore.toggleReady(lobbyId.value, !myStatus.value);
};

const handleStartGame = async () => {
  try {
    isStartingGame.value = true;
    await lobbyStore.startGame();
  } catch (err) {
    console.error("Błąd startu gry:", err);
    isStartingGame.value = false;
  }
};

const handleLeave = async () => {
  try {
    await lobbyStore.leaveLobby();
    router.push("/multiplayer");
  } catch (err) {
    console.error("Błąd podczas opuszczania pokoju:", err);
    isStartingGame.value = false;
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto w-full py-8 md:py-12 px-4">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div
          class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[3rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl transition-all"
        >
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2
                class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2"
              >
                {{ t("lobby.room.playersTitle") }}
              </h2>
              <div class="flex items-center gap-2">
                <span
                  class="text-3xl font-black text-slate-800 dark:text-white uppercase italic"
                >
                  {{ lobbyStore.currentLobby?.name || "Lobby" }}
                </span>
                <span
                  class="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-black rounded-full border border-green-500/20"
                >
                  ID: {{ lobbyId.slice(0, 6) }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <span
                class="block text-3xl font-black text-green-600 dark:text-green-500"
              >
                {{ lobbyStore.currentLobby?.players?.length || 0 }}/{{
                  lobbyStore.currentLobby?.maxPlayers || 4
                }}
              </span>
              <span
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                >{{ t("lobby.fields.maxPlayers") }}</span
              >
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="player in lobbyStore.currentLobby?.players"
              :key="player.userId"
              class="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all group relative overflow-hidden"
              :class="[player.isReady ? 'border-green-500/50' : '']"
            >
              <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg transition-transform group-hover:scale-110 relative z-10"
              >
                <img
                  :src="
                    getAvatarUrl(player.cloudinaryPublicId, 80) ?? undefined
                  "
                  :alt="player.displayName"
                  class="w-full h-full object-cover rounded-2xl shadow-inner"
                />
              </div>

              <div class="flex flex-col relative z-10">
                <span
                  class="font-black text-slate-800 dark:text-white text-lg"
                  >{{ player.displayName }}</span
                >
                <div class="flex items-center gap-2">
                  <span
                    v-if="player.userId === lobbyStore.currentLobby?.hostId"
                    class="text-[10px] font-black text-green-600 dark:text-green-400 uppercase italic tracking-tighter"
                    >Host</span
                  >
                  <span
                    v-if="player.isReady"
                    class="text-[10px] font-black text-green-500 uppercase tracking-tighter"
                    >{{ t("lobby.room.isReady") }}</span
                  >
                </div>
              </div>

              <div v-if="player.isReady" class="ml-auto relative z-10">
                <div
                  class="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse"
                >
                  <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div
              v-for="n in Math.max(
                0,
                (lobbyStore.currentLobby?.maxPlayers || 0) -
                  (lobbyStore.currentLobby?.players?.length || 0),
              )"
              :key="'empty-' + n"
              class="flex items-center gap-4 p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl opacity-40"
            >
              <div
                class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xl font-black italic"
              >
                ?
              </div>
              <span
                class="font-bold text-slate-400 uppercase text-xs tracking-widest italic"
                >{{ t("lobby.room.waiting") }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div
          class="bg-green-600 dark:bg-green-500 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-green-200 dark:shadow-none transition-all"
        >
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"
          ></div>

          <h3
            v-if="canStart"
            class="text-2xl font-black mb-2 uppercase italic tracking-tight"
          >
            {{ t("lobby.room.ready") }}
          </h3>
          <p
            v-if="!canStart"
            class="text-green-100 text-sm mb-8 font-medium leading-relaxed opacity-90"
          >
            {{ isHost ? t("lobby.room.playerWait") : t("lobby.room.hostWait") }}
          </p>

          <div class="space-y-3 relative z-10">
            <button
              v-if="isHost"
              @click="handleStartGame"
              :disabled="!canStart"
              class="w-full py-5 bg-white text-green-600 font-black rounded-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {{ t("lobby.room.start") }}
            </button>

            <button
              @click="handleToggleReady"
              class="w-full py-5 font-black rounded-2xl transition-all cursor-pointer uppercase tracking-widest border-2"
              :class="[
                myStatus
                  ? 'bg-green-700 border-green-700 text-white hover:bg-green-800'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20',
              ]"
            >
              {{
                myStatus
                  ? t("lobby.room.notReady")
                  : t("lobby.room.readyButton")
              }}
            </button>

            <button
              @click="handleLeave"
              class="w-full py-4 text-white/60 hover:text-white font-black transition-all cursor-pointer uppercase tracking-[0.15em] text-xs"
            >
              {{ t("lobby.room.leave") }}
            </button>
          </div>
        </div>

        <div
          class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <h4
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6"
          >
            Info
          </h4>
          <div class="space-y-4">
            <div
              class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3"
            >
              <span class="text-xs font-bold text-slate-500">{{
                t("lobby.fields.questionCount")
              }}</span>
              <span class="font-black text-slate-800 dark:text-white">{{
                lobbyStore.currentLobby?.questionCount
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs font-bold text-slate-500">{{
                t("lobby.fields.visibility")
              }}</span>
              <span
                class="font-black text-slate-800 dark:text-white text-sm uppercase"
              >
                {{
                  lobbyStore.currentLobby?.isPrivate
                    ? t("lobby.visibility.private")
                    : t("lobby.visibility.public")
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
</style>
