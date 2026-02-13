<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import confetti from "canvas-confetti";
import AnimatedNumber from "../AnimatedNumber.vue";
import { useUserStore } from "@/stores/user";

const props = defineProps<{
  score: number;
  totalQuestions: number;
  earnedExp: number;
  earnedPoints: number;
  isLevelUp?: boolean;
}>();

const emit = defineEmits(["playAgain"]);

const { t } = useI18n();
const router = useRouter();

const showLevelUp = ref(false);

const fireConfetti = () => {
  const duration = 3 * 1000;
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

const closeLevelUp = () => {
  showLevelUp.value = false;
};

onMounted(() => {
  if (props.isLevelUp) {
    setTimeout(() => {
      showLevelUp.value = true;
      fireConfetti();
      useUserStore().fetchStats();
      useUserStore().fetchProfile();

      setTimeout(() => {
        showLevelUp.value = false;
      }, 3000);
    }, 1000);
  }
});

const goBack = () => router.push("/quiz");
const handlePlayAgain = () => emit("playAgain");
</script>

<template>
  <div class="max-w-4xl mx-auto w-full py-4 px-4">
    <div
      class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/50 dark:border-white/10 text-center relative overflow-hidden"
    >
      <transition name="bounce">
        <div
          v-if="showLevelUp"
          @click="closeLevelUp"
          class="absolute inset-0 z-50 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm cursor-pointer select-none"
        >
          <div
            class="bg-white dark:bg-slate-800 p-8 rounded-full shadow-2xl border-4 border-emerald-500 flex flex-col items-center"
          >
            <span class="text-6xl mb-2">⭐</span>
            <span
              class="text-4xl font-black text-emerald-500 uppercase tracking-tighter"
            >
              {{ t("game.levelUp") }}
            </span>
          </div>
        </div>
      </transition>

      <div
        class="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-400 via-yellow-400 to-rose-500"
      ></div>

      <div class="relative z-10 flex flex-col items-center">
        <div class="text-8xl mb-6 animate-bounce-custom">🏆</div>

        <h2
          class="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter"
        >
          {{ t("game.gameOver") }}
        </h2>
        <p class="text-slate-500 dark:text-slate-400 font-medium mb-10">
          {{ t("game.greatJob") }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          <div
            class="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700"
          >
            <span
              class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2"
            >
              {{ t("game.yourScore") }}
            </span>
            <span class="text-4xl font-black text-slate-800 dark:text-white">
              {{ score }}
              <span class="text-xl text-slate-400">/{{ totalQuestions }}</span>
            </span>
          </div>

          <div
            class="flex flex-col items-center justify-center p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-500/20 shadow-sm transition-transform hover:scale-105"
          >
            <span
              class="text-xs font-bold text-amber-500/80 uppercase tracking-widest mb-2"
            >
              {{ t("game.points") }}
            </span>
            <span class="text-4xl font-black text-amber-500 tabular-nums">
              +<AnimatedNumber :value="earnedPoints" :duration="1500" />
            </span>
          </div>

          <div
            class="flex flex-col items-center justify-center p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm transition-transform hover:scale-105"
          >
            <span
              class="text-xs font-bold text-indigo-500/80 uppercase tracking-widest mb-2"
            >
              EXP
            </span>
            <span class="text-4xl font-black text-indigo-500 tabular-nums">
              +<AnimatedNumber :value="earnedExp" :duration="1500" />
            </span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          <button
            @click="goBack"
            class="flex-1 py-4 px-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
          >
            {{ t("game.backToList") }}
          </button>
          <button
            @click="handlePlayAgain"
            class="flex-1 py-4 px-8 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all"
          >
            {{ t("game.playAgain") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-bounce-custom {
  animation: bounce-custom 2s infinite;
}

@keyframes bounce-custom {
  0%,
  100% {
    transform: translateY(-5%);
  }
  50% {
    transform: translateY(0);
  }
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
</style>
