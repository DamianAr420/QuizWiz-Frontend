<script setup lang="ts">
import { onMounted, computed, watch, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLobbyStore } from "@/stores/lobby";
import { useAuthStore } from "@/stores/auth";
import { useCloudinary } from "@/composables/useCloudinary";
import { SHOP_PRESETS } from "@/components/shop/shopPresets";

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
      router.push(`/multiplayer/play/${lobbyId.value}`);
    }
  },
);

onMounted(async () => {
  try {
    await lobbyStore.getLobbyDetails(lobbyId.value);
    if (authStore.token) {
      await lobbyStore.connectToLobby(lobbyId.value, authStore.token);

      if (lobbyStore.currentLobby?.status === "InGame") {
        router.push(`/multiplayer/play/${lobbyId.value}`);
      }
    }
  } catch (error) {
    router.push("/quiz");
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

const gameStarting = computed(() => {
  return lobbyStore.currentLobby?.status === "Starting";
});
</script>

<template>
  <div class="max-w-6xl mx-auto w-full py-8 md:py-12 px-4">
    <Transition name="fade">
      <div
        v-if="gameStarting"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
      >
        <div class="text-center text-white">
          <div class="text-8xl mb-6 animate-bounce">🎮</div>

          <h2 class="text-4xl font-black uppercase mb-3">
            {{ t("lobby.room.startingGame") }}
          </h2>

          <p class="text-slate-300 mb-8">
            {{ t("lobby.room.prepare") }}
          </p>

          <div class="flex justify-center gap-3">
            <span
              v-for="i in 3"
              :key="i"
              class="w-4 h-4 bg-green-400 rounded-full animate-pulse"
              :style="{ animationDelay: `${i * 0.2}s` }"
            />
          </div>
        </div>
      </div>
    </Transition>

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
              class="relative overflow-hidden rounded-3xl border border-white/20 dark:border-slate-700 p-5 flex items-center gap-5 transition-all hover:scale-[1.02] hover:shadow-xl"
              :class="SHOP_PRESETS.getClassName(player.selectedBackground)"
              :style="SHOP_PRESETS.getInlineStyle(player.selectedBackground)"
            >
              <div
                class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
              ></div>

              <div class="relative z-10 shrink-0">
                <div
                  class="relative w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center"
                >
                  <img
                    :src="
                      getAvatarUrl(player.cloudinaryPublicId, 96) ?? undefined
                    "
                    :alt="player.displayName"
                    class="absolute w-full h-full rounded-xl object-cover z-10 p-1"
                  />

                  <div
                    v-if="player.selectedFrame"
                    class="absolute inset-0 pointer-events-none rounded-xl"
                    :class="SHOP_PRESETS.getClassName(player.selectedFrame)"
                    :style="SHOP_PRESETS.getInlineStyle(player.selectedFrame)"
                  ></div>
                </div>
              </div>

              <div class="relative z-10 flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-black text-xl text-white">
                    {{ player.displayName }}
                  </h3>

                  <span
                    v-if="player.userId === lobbyStore.currentLobby?.hostId"
                    class="px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-950 text-[10px] font-black uppercase text-center"
                  >
                    👑 Host
                  </span>
                </div>

                <div class="mt-2 flex gap-2">
                  <span
                    v-if="player.isReady"
                    class="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-black uppercase"
                  >
                    ✅ {{ t("lobby.room.isReady") }}
                  </span>

                  <span
                    v-else
                    class="px-2 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase"
                  >
                    ⏳ Waiting
                  </span>
                </div>
              </div>

              <!-- Status -->
              <div class="relative z-10">
                <div
                  :class="[
                    'w-5 h-5 rounded-full ring-4 ring-white/20',
                    player.isReady
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-slate-400',
                  ]"
                ></div>
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
