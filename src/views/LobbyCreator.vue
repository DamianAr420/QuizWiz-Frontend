<script setup lang="ts">
import { reactive, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLobbyStore } from "@/stores/lobby";
import { useQuizStore } from "@/stores/quiz";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const lobbyStore = useLobbyStore();
const quizStore = useQuizStore();

const lobbyData = reactive({
  name: "",
  maxPlayers: 4,
  questionCount: 1,
  isPrivate: false,
  quizId: 1,
});

const selectedQuiz = computed(() => quizStore.currentQuiz);

const handleCreate = async () => {
  if (!lobbyData.name) return alert(t("lobby.errors.emptyName"));

  try {
    const data = await lobbyStore.createLobby(lobbyData);
    router.push({ name: "lobby-room", params: { id: data.id } });
  } catch (error) {
    console.error(error);
  }
};

onMounted(async () => {
  if (route.query.quizId) {
    const id = Number(route.query.quizId);
    lobbyData.quizId = id;
    await quizStore.fetchQuizById(id);
  }
  if (route.query.questions) {
    lobbyData.questionCount = Number(route.query.questions);
  }
});
</script>

<template>
  <div
    class="max-w-2xl mx-auto w-full py-8 md:py-12 flex items-center justify-center"
  >
    <div
      class="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300"
    >
      <div
        class="bg-green-600 dark:bg-green-500 p-8 md:p-10 text-white text-center relative"
      >
        <div class="text-5xl mb-4">🎮</div>
        <h1 class="text-3xl md:text-4xl font-black tracking-tight uppercase">
          {{ t("lobby.create.title") }}
        </h1>

        <div
          v-if="selectedQuiz"
          class="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-black/10 rounded-full border border-white/20"
        >
          <span
            class="text-[10px] font-black uppercase tracking-widest opacity-80"
            >{{ t("lobby.create.selected") }}:</span
          >
          <span class="text-sm font-bold">{{ selectedQuiz.title }}</span>
        </div>
      </div>

      <div class="p-8 md:p-12 space-y-10">
        <div class="space-y-3">
          <label
            class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2"
          >
            {{ t("lobby.fields.name") }}
          </label>
          <input
            v-model="lobbyData.name"
            type="text"
            class="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 focus:border-green-500 dark:focus:border-green-500 rounded-2xl px-6 py-4 text-lg font-bold text-slate-800 dark:text-white outline-none transition-all shadow-sm"
            :placeholder="t('lobby.placeholders.name')"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-3">
            <div class="flex justify-between items-center px-2">
              <label
                class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
              >
                {{ t("lobby.fields.maxPlayers") }}
              </label>
              <span class="text-green-600 dark:text-green-400 font-black">{{
                lobbyData.maxPlayers
              }}</span>
            </div>
            <div
              class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800"
            >
              <input
                v-model.number="lobbyData.maxPlayers"
                type="range"
                min="2"
                max="4"
                class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between items-center px-2">
              <label
                class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
              >
                Liczba pytań
              </label>

              <span class="text-green-600 dark:text-green-400 font-black">
                {{ lobbyData.questionCount }}
              </span>
            </div>

            <div
              class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800"
            >
              <input
                v-model.number="lobbyData.questionCount"
                type="range"
                min="1"
                max="50"
                class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>
          </div>

          <div class="space-y-3">
            <label
              class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2"
            >
              {{ t("lobby.fields.visibility") }}
            </label>
            <div
              class="flex p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 h-18.5"
            >
              <button
                type="button"
                @click="lobbyData.isPrivate = false"
                :class="[
                  !lobbyData.isPrivate
                    ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600',
                ]"
                class="flex-1 rounded-xl font-bold transition-all cursor-pointer"
              >
                {{ t("lobby.visibility.public") }}
              </button>
              <button
                type="button"
                @click="lobbyData.isPrivate = true"
                :class="[
                  lobbyData.isPrivate
                    ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600',
                ]"
                class="flex-1 rounded-xl font-bold transition-all cursor-pointer"
              >
                {{ t("lobby.visibility.private") }}
              </button>
            </div>
          </div>
        </div>

        <div class="pt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            @click="router.back()"
            class="flex-1 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            type="button"
            @click="handleCreate"
            :disabled="lobbyStore.loading"
            class="flex-2 px-8 py-4 bg-green-600 dark:bg-green-500 text-white font-black rounded-2xl shadow-lg shadow-green-200 dark:shadow-none hover:bg-green-700 dark:hover:bg-green-400 transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer flex justify-center items-center gap-3"
          >
            <span
              v-if="lobbyStore.loading"
              class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"
            ></span>
            {{
              lobbyStore.loading
                ? t("common.loading")
                : t("lobby.create.submit")
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #ffffff;
  border: 3px solid #10b981;
  border-radius: 50%;
  cursor: pointer;
}
</style>
