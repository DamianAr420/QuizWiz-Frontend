<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useQuizHub } from "@/composables/useQuizHub";
import { signalRService } from "@/services/signalrService";
import { useCloudinary } from "@/composables/useCloudinary";
import AnimatedNumber from "@/components/AnimatedNumber.vue";
import confetti from "canvas-confetti";
import { useUserStore } from "@/stores/user";
import { SHOP_PRESETS } from "@/components/shop/shopPresets";

interface LobbyUser {
  id: string;
  username: string;
  cloudinaryPublicId: string;
  selectedBackground?: string;
  selectedFrame?: string;
}

const route = useRoute();
const router = useRouter();
const lobbyId = route.params.id as string;
const { t } = useI18n();
const { getAvatarUrl } = useCloudinary();

const { gameState, isFinished, initHub, submitAnswer } = useQuizHub();

const timeLeft = ref<number>(0);
const localSelectedAnswer = ref<string | null>(null);
const playersMap = ref<Record<string, LobbyUser>>({});
let timer: ReturnType<typeof setInterval> | null = null;

const showLevelUp = ref(false);

const fireConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#10b981", "#fbbf24", "#3b82f6"],
    });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#10b981", "#fbbf24", "#3b82f6"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

watch(
  () => isFinished.value,
  (finished) => {
    if (!finished) return;

    const userId = useUserStore().profile?.id;

    if (!userId) return;

    const reward = finalRewards.value[userId];

    if (reward?.isLevelUp) {
      setTimeout(() => {
        showLevelUp.value = true;
        fireConfetti();

        useUserStore().fetchStats();
        useUserStore().fetchProfile();

        setTimeout(() => {
          showLevelUp.value = false;
        }, 3000);
      }, 800);
    }
  },
);

watch(
  () => gameState.value.currentQuestion,
  () => {
    localSelectedAnswer.value = null;
  },
);

const startTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  timer = setInterval(() => {
    if (gameState.value.endTime) {
      const diff =
        new Date(gameState.value.endTime).getTime() - new Date().getTime();
      const seconds = Math.max(0, Math.floor(diff / 1000));
      timeLeft.value = seconds;

      if (seconds <= 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    }
  }, 100);
};

watch(
  () => gameState.value.endTime,
  () => startTimer(),
  { immediate: true },
);

const isPlayerAnswered = (userId: string | number): boolean => {
  if (!gameState.value.answeredPlayerIds) return false;
  return gameState.value.answeredPlayerIds.some(
    (id) => id.toString() === userId.toString(),
  );
};

const finalRewards = computed(() => gameState.value.rewards || {});

onMounted(async () => {
  try {
    await initHub(lobbyId);

    const users = await signalRService.invoke("GetLobbyUsers", lobbyId);
    console.log(users);

    if (users && Array.isArray(users)) {
      playersMap.value = {};
      users.forEach((user: any) => {
        playersMap.value[user.id.toString()] = {
          id: user.id.toString(),
          username: user.username,
          cloudinaryPublicId: user.cloudinaryPublicId,
          selectedBackground: user.selectedBackground,
          selectedFrame: user.selectedFrame,
        };
      });
    } else {
      console.warn("GetLobbyUsers zwróciło pustą lub niepoprawną odpowiedź.");
    }
  } catch (err) {
    console.error("KRYTYCZNY BŁĄD w onMounted:", err);
  }
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

const handleAnswerClick = async (answer: string) => {
  if (
    gameState.value.hasAnswered ||
    gameState.value.isRevealingAnswer ||
    timeLeft.value <= 0
  ) {
    return;
  }

  try {
    localSelectedAnswer.value = answer;
    await submitAnswer(answer);
  } catch {
    localSelectedAnswer.value = null;
  }
};

const handleLeave = async () => {
  router.push("/multiplayer");
};

const sortedScores = computed(() => {
  return Object.entries(gameState.value.scores)
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .map(([userId, score], index) => ({
      userId,
      score,
      place: index + 1,
    }));
});
</script>

<template>
  <div class="relative w-full flex flex-col grow justify-start items-center">
    <!-- Tło z blobami, które niweluje paddingi z MainLayout, aby rozciągać się do krawędzi -->
    <div
      class="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 z-0 overflow-hidden pointer-events-none"
    >
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-emerald-400/20 dark:bg-emerald-500/40 rounded-full blur-[120px] animate-blob animation-delay-2000"
      ></div>
      <div
        class="absolute top-40 left-0 translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-emerald-200/50 dark:bg-emerald-500/40 rounded-full filter blur-3xl opacity-60 dark:opacity-50 dark:mix-blend-multiply animate-blob"
      ></div>
      <div
        class="absolute top-40 right-0 translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-emerald-200/50 dark:bg-emerald-500/40 rounded-full filter blur-3xl opacity-60 dark:opacity-50 dark:mix-blend-multiply animate-blob"
      ></div>
    </div>

    <!-- Kontener treści zmieniony na relative - teraz oddycha i płynnie się skaluje -->
    <div class="relative z-10 w-full max-w-7xl space-y-6 md:space-y-8">
      <header
        class="w-full flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-md transition-colors duration-300"
      >
        <div>
          <h3
            class="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest"
          >
            {{ t("game.gameMode") }}
          </h3>
          <p
            class="text-emerald-600 dark:text-emerald-400 font-bold text-xs md:text-sm"
          >
            {{ t("game.multiplayerMatch") }}
          </p>
        </div>

        <button
          @click="handleLeave"
          class="group flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-500 font-bold text-xs md:text-sm px-4 md:px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
        >
          <span>{{ t("game.leave") }}</span>
          <span class="transform group-hover:translate-x-1 transition-transform"
            >→</span
          >
        </button>
      </header>

      <main class="w-full">
        <Transition name="fade" mode="out-in">
          <div
            v-if="isFinished"
            class="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[3rem] shadow-xl text-center space-y-6 md:space-y-8 max-w-2xl mx-auto transition-colors duration-300"
          >
            <transition name="bounce">
              <div
                v-if="showLevelUp"
                class="absolute inset-0 z-50 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm p-4"
              >
                <div
                  class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl md:rounded-full shadow-2xl border-4 border-emerald-500 flex flex-col items-center max-w-xs md:max-w-none text-center"
                >
                  <span class="text-4xl md:text-6xl mb-2">⭐</span>
                  <span
                    class="text-2xl md:text-4xl font-black text-emerald-500 uppercase tracking-tight"
                  >
                    {{ t("game.levelUp") }}
                  </span>
                </div>
              </div>
            </transition>

            <div class="text-5xl md:text-6xl animate-bounce">🏆</div>
            <div class="space-y-2">
              <h2
                class="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400"
              >
                {{ t("game.gameOver") }}
              </h2>
              <p class="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                {{ t("game.finalStandings") }}
              </p>
            </div>

            <div class="space-y-3 pt-2">
              <div
                v-for="player in sortedScores"
                :key="player.userId"
                class="relative overflow-hidden rounded-2xl border transition-all hover:scale-[1.01]"
                :class="[
                  player.place === 1
                    ? 'bg-linear-to-r from-yellow-300 via-amber-300 to-yellow-200 text-black ring-4 ring-yellow-400 shadow-2xl scale-[1.03] winner'
                    : '',
                  playersMap[player.userId]?.selectedBackground
                    ? [
                        SHOP_PRESETS.getClassName(
                          playersMap[player.userId]?.selectedBackground,
                        ),
                        'border-white/10',
                      ]
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
                ]"
                :style="
                  playersMap[player.userId]?.selectedBackground
                    ? SHOP_PRESETS.getInlineStyle(
                        playersMap[player.userId]?.selectedBackground,
                      )
                    : undefined
                "
              >
                <div
                  v-if="playersMap[player.userId]?.selectedBackground"
                  class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                ></div>

                <div
                  class="relative z-10 flex flex-col sm:flex-row gap-3 justify-between items-center px-4 py-3 md:px-6 md:py-4"
                >
                  <div class="flex items-center gap-3 w-full sm:w-auto">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shrink-0"
                      :class="{
                        'bg-yellow-400 text-yellow-900': player.place === 1,
                        'bg-slate-300 text-slate-800': player.place === 2,
                        'bg-amber-700 text-white': player.place === 3,
                        'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200':
                          player.place > 3,
                      }"
                    >
                      <template v-if="player.place === 1">🥇</template>
                      <template v-else-if="player.place === 2">🥈</template>
                      <template v-else-if="player.place === 3">🥉</template>
                      <template v-else>#{{ player.place }}</template>
                    </div>

                    <div class="relative w-12 h-12 md:w-14 md:h-14 shrink-0">
                      <div
                        v-if="!playersMap[player.userId]?.selectedBackground"
                        class="absolute inset-0 rounded-xl bg-slate-200 dark:bg-slate-800"
                      ></div>

                      <img
                        v-if="playersMap[player.userId]?.cloudinaryPublicId"
                        :src="
                          getAvatarUrl(
                            playersMap[player.userId]?.cloudinaryPublicId,
                            80,
                          ) ?? undefined
                        "
                        :alt="playersMap[player.userId]?.username"
                        class="absolute p-1 w-full h-full object-cover rounded-xl z-40 shadow-lg"
                      />

                      <div
                        v-if="playersMap[player.userId]?.selectedFrame"
                        class="absolute inset-0 pointer-events-none z-30 rounded-xl"
                        :class="
                          SHOP_PRESETS.getClassName(
                            playersMap[player.userId]?.selectedFrame,
                          )
                        "
                        :style="
                          SHOP_PRESETS.getInlineStyle(
                            playersMap[player.userId]?.selectedFrame,
                          )
                        "
                      ></div>
                    </div>

                    <span
                      class="font-bold text-sm md:text-md truncate max-w-40 sm:max-w-none"
                      :class="
                        playersMap[player.userId]?.selectedBackground
                          ? 'text-white drop-shadow'
                          : 'text-slate-700 dark:text-slate-300'
                      "
                    >
                      {{
                        playersMap[player.userId]?.username ||
                        `${t("game.player")} #${player.userId}`
                      }}
                    </span>
                  </div>

                  <div
                    class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/10"
                  >
                    <span
                      class="font-black text-base md:text-xl"
                      :class="
                        playersMap[player.userId]?.selectedBackground
                          ? 'text-white drop-shadow'
                          : 'text-emerald-600 dark:text-emerald-400'
                      "
                    >
                      {{ player.score }} {{ t("game.pointsShort") }}
                    </span>

                    <div
                      v-if="finalRewards[player.userId]"
                      class="flex flex-wrap justify-end gap-1 text-[10px] md:text-[11px] font-bold"
                    >
                      <span
                        class="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 md:px-2 py-0.5 rounded-md border border-blue-500/20"
                      >
                        +<AnimatedNumber
                          :value="finalRewards[player.userId]?.experience ?? 0"
                          :duration="1500"
                        />
                        EXP
                      </span>

                      <span
                        class="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 md:px-2 py-0.5 rounded-md border border-amber-500/20"
                      >
                        +<AnimatedNumber
                          :value="finalRewards[player.userId]?.points ?? 0"
                          :duration="1500"
                        />
                        pkt
                      </span>

                      <span
                        class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 md:px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-0.5"
                      >
                        ✅
                        <AnimatedNumber
                          :value="
                            finalRewards[player.userId]?.correctAnswers ?? 0
                          "
                          :duration="1500"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else-if="!gameState.isStarted"
            class="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-6"
          >
            <div class="text-7xl md:text-9xl animate-spin-slow">🪄</div>
            <h2
              class="text-base md:text-2xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.4em] animate-pulse px-4"
            >
              {{ t("game.waitingForHost") }}
            </h2>
          </div>

          <div
            v-else
            class="grid grid-cols-1 grid-rows-1 lg:grid-cols-12 gap-6 items-start w-full"
          >
            <aside
              class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 order-2 lg:order-1 w-full"
            >
              <div
                class="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300"
              >
                <div
                  class="absolute inset-0 z-0 transition-all duration-1000 ease-linear origin-left"
                  :class="
                    timeLeft < 6
                      ? 'bg-red-500/10 dark:bg-red-500/20'
                      : 'bg-emerald-500/10 dark:bg-emerald-500/20'
                  "
                  :style="{ transform: `scaleX(${timeLeft / 15})` }"
                ></div>
                <div class="relative z-10">
                  <p
                    class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1"
                  >
                    {{ t("game.timeLeft") }}
                  </p>
                  <div class="flex items-baseline gap-1">
                    <span
                      class="text-3xl md:text-4xl font-black tabular-nums"
                      :class="
                        timeLeft < 6
                          ? 'text-red-500 animate-pulse'
                          : 'text-slate-800 dark:text-white'
                      "
                    >
                      {{ timeLeft }}
                    </span>
                    <span
                      class="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400"
                    >
                      {{ t("game.sec") }}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-md border border-slate-200 dark:border-slate-800 space-y-4 transition-colors duration-300"
              >
                <h4
                  class="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2"
                >
                  {{ t("game.playersStatus") }}
                </h4>
                <div
                  class="overflow-y-auto custom-scrollbar flex flex-col gap-3 max-h-48 md:max-h-72 pr-1"
                >
                  <div
                    v-for="(_, userId) in gameState.scores"
                    :key="userId"
                    class="relative overflow-hidden rounded-xl border border-white/10 transition-all shrink-0"
                    :class="
                      SHOP_PRESETS.getClassName(
                        playersMap[userId.toString()]?.selectedBackground,
                      )
                    "
                    :style="
                      SHOP_PRESETS.getInlineStyle(
                        playersMap[userId.toString()]?.selectedBackground,
                      ) || 'background: rgb(248 250 252)'
                    "
                  >
                    <div
                      class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                    ></div>

                    <div
                      class="relative z-10 flex items-center justify-between px-3 py-2.5 gap-2"
                    >
                      <div class="flex items-center gap-2 overflow-hidden grow">
                        <span
                          class="w-2 h-2 rounded-full shrink-0"
                          :class="
                            isPlayerAnswered(userId)
                              ? 'bg-emerald-500'
                              : 'bg-slate-300 dark:bg-slate-600'
                          "
                        ></span>

                        <div class="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
                          <img
                            :src="
                              getAvatarUrl(
                                playersMap[userId.toString()]
                                  ?.cloudinaryPublicId,
                                64,
                              ) || undefined
                            "
                            :alt="playersMap[userId.toString()]?.username"
                            class="absolute w-full h-full rounded-xl object-cover z-30 p-1"
                          />

                          <div
                            v-if="playersMap[userId.toString()]?.selectedFrame"
                            class="absolute inset-0 pointer-events-none rounded-xl"
                            :class="
                              SHOP_PRESETS.getClassName(
                                playersMap[userId.toString()]?.selectedFrame,
                              )
                            "
                            :style="
                              SHOP_PRESETS.getInlineStyle(
                                playersMap[userId.toString()]?.selectedFrame,
                              )
                            "
                          ></div>
                        </div>

                        <span
                          class="text-xs font-black text-white truncate drop-shadow"
                        >
                          {{
                            playersMap[userId.toString()]?.username ||
                            `${t("game.player")} #${userId}`
                          }}
                        </span>
                      </div>

                      <span
                        class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 text-center min-w-18.75"
                        :class="
                          isPlayerAnswered(userId)
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-black/20 text-white'
                        "
                      >
                        {{
                          isPlayerAnswered(userId)
                            ? t("game.statusAnswered")
                            : t("game.statusThinking")
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <main class="lg:col-span-9 order-1 lg:order-2 w-full">
              <div
                class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-2xl md:rounded-[2.5rem] shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800/80 p-5 md:p-12 min-h-64 md:min-h-72 flex flex-col justify-center relative overflow-hidden transition-colors duration-300"
              >
                <div class="relative z-10 mb-6 md:mb-10 text-center">
                  <h2
                    class="text-lg md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-snug"
                  >
                    {{ gameState.currentQuestion }}
                  </h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <button
                    v-for="(answer, idx) in gameState.answers"
                    :key="answer"
                    @click="handleAnswerClick(answer)"
                    :disabled="
                      gameState.hasAnswered ||
                      gameState.isRevealingAnswer ||
                      timeLeft <= 0
                    "
                    class="group relative w-full p-4 md:p-5 rounded-2xl md:rounded-3xl font-bold text-sm md:text-base transition-all duration-200 border-b-[6px] active:border-b-0 active:translate-y-1.5 flex items-center overflow-hidden text-left cursor-pointer"
                    :class="[
                      gameState.correctAnswer === answer
                        ? 'bg-green-600 border-green-800 text-white shadow-lg'
                        : '',
                      gameState.correctAnswer &&
                      localSelectedAnswer === answer &&
                      answer !== gameState.correctAnswer
                        ? 'bg-red-600 border-red-800 text-white shadow-lg'
                        : '',
                      !gameState.hasAnswered
                        ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10'
                        : '',
                      gameState.hasAnswered && localSelectedAnswer === answer
                        ? 'bg-emerald-600 border-emerald-800 text-white shadow-lg z-20'
                        : '',
                      gameState.hasAnswered && localSelectedAnswer !== answer
                        ? 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-600 opacity-40 scale-[0.98]'
                        : '',
                    ]"
                  >
                    <span
                      class="w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-xl flex items-center justify-center text-xs font-black mr-3 md:mr-4 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors"
                      :class="{
                        'bg-white/20 text-white border-transparent':
                          gameState.hasAnswered &&
                          localSelectedAnswer === answer,
                      }"
                    >
                      {{ String.fromCharCode(65 + idx) }}
                    </span>

                    <span class="leading-snug grow pr-2">{{ answer }}</span>
                  </button>
                </div>
              </div>
            </main>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.animate-blob {
  animation: blob 8s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -40px) scale(1.08);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.92);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-spin-slow {
  animation: spin 10s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

button {
  -webkit-tap-highlight-color: transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 99px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.bounce-enter-active {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.bounce-leave-active {
  transition: all 0.4s ease-in;
}

.bounce-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  70% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.winner {
  animation: winnerGlow 2s ease-in-out infinite;
}

@keyframes winnerGlow {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(250, 204, 21, 0.3),
      0 0 40px rgba(250, 204, 21, 0.15);
  }

  50% {
    box-shadow:
      0 0 35px rgba(250, 204, 21, 0.7),
      0 0 60px rgba(250, 204, 21, 0.3);
  }
}
</style>
