<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLobbyStore } from "@/stores/lobby";
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";

const { t } = useI18n();
const router = useRouter();
const lobbyStore = useLobbyStore();
const toastStore = useToastStore();
const userStore = useUserStore();

const handleJoin = async (id: string) => {
  try {
    await lobbyStore.joinLobby(id);
    toastStore.success(t("lobby.browser.success.joined"));
    router.push({ name: "lobby-room", params: { id } });
  } catch (error) {
    toastStore.error(t("lobby.browser.errors.joinFailed"));
  }
};

const handleRefresh = async () => {
  try {
    await lobbyStore.fetchPublicLobbies();
  } catch (error) {
    console.error("Błąd podczas odświeżania lobby:", error);
  }
};

onMounted(() => {
  lobbyStore.fetchPublicLobbies();
  userStore.fetchProfile();
});
</script>

<template>
  <div class="max-w-5xl mx-auto w-full py-8 md:py-12 px-4">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
    >
      <div>
        <h1
          class="text-4xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-white"
        >
          {{ t("lobby.browser.title") }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 font-bold mt-1">
          {{ t("lobby.browser.subtitle") }}
        </p>
      </div>

      <button
        @click="handleRefresh"
        :disabled="lobbyStore.loading"
        class="w-full md:w-auto flex items-center justify-center gap-2.5 py-3.5 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-widest rounded-2xl shadow-md hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <span
          class="text-sm inline-block"
          :class="[lobbyStore.loading ? 'animate-spin' : '']"
        >
          🔄
        </span>
        {{ t("lobby.browser.refresh") }}
      </button>
    </div>

    <div
      v-if="lobbyStore.loading"
      class="flex flex-col items-center justify-center py-32 space-y-4"
    >
      <div
        class="w-16 h-16 border-8 border-green-500/20 border-t-green-500 rounded-full animate-spin"
      ></div>
      <span
        class="text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse"
      >
        {{ t("common.loading") }}
      </span>
    </div>

    <div
      v-else-if="lobbyStore.lobbies.length === 0"
      class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] py-20 text-center"
    >
      <div class="text-6xl mb-4">🏜️</div>
      <h3 class="text-xl font-black text-slate-400 uppercase tracking-widest">
        {{ t("lobby.browser.empty") }}
      </h3>
    </div>

    <div v-else class="grid gap-6">
      <div
        v-for="l in lobbyStore.lobbies"
        :key="l.id"
        class="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-2 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center transition-all hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/50"
      >
        <div class="flex items-center gap-6 p-4 w-full">
          <div
            class="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform"
          >
            {{ l.currentPlayers >= l.maxPlayers ? "🔒" : "🎮" }}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
              <h3
                class="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tight"
              >
                {{ l.name }}
              </h3>
              <span
                class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black rounded text-slate-500 uppercase"
              >
                #{{ l.id.slice(-4) }}
              </span>
            </div>
            <p
              class="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wide"
            >
              {{ t("lobby.browser.hostInfo", { name: l.hostName }) }} •
              <span class="text-green-600 dark:text-green-400">
                {{
                  t("lobby.options.questions", { count: l.questionCount || 10 })
                }}
              </span>
            </p>
          </div>
        </div>

        <div
          class="flex items-center gap-8 p-6 w-full md:w-auto bg-slate-50/50 dark:bg-slate-800/30 md:bg-transparent rounded-4xl md:rounded-none"
        >
          <div class="text-center">
            <span
              class="block text-2xl font-black text-slate-800 dark:text-white tabular-nums"
            >
              {{ l.currentPlayers
              }}<span class="text-slate-300 dark:text-slate-700 mx-1">/</span
              >{{ l.maxPlayers }}
            </span>
            <span
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
            >
              {{ t("lobby.fields.players") }}
            </span>
          </div>
          {{ console.log(l.isMember) }}
          <button
            @click="handleJoin(l.id)"
            :disabled="l.currentPlayers >= l.maxPlayers && !l.isMember"
            class="flex-1 md:flex-none min-w-35 py-4 px-8 rounded-2xl font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
            :class="[
              l.currentPlayers >= l.maxPlayers && !l.isMember
                ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 shadow-none'
                : 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-400 hover:scale-105 active:scale-95 shadow-green-200 dark:shadow-none',
            ]"
          >
            {{
              l.currentPlayers >= l.maxPlayers && !l.isMember
                ? t("lobby.browser.full")
                : t("lobby.browser.join")
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
