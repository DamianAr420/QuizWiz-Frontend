<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRankingStore } from "@/stores/ranking";
import { useCloudinary } from "@/composables/useCloudinary";
import type { RankingType, RankingEntry } from "@/types/ranking";

const { t } = useI18n();
const rankingStore = useRankingStore();
const { getAvatarUrl: cldGetAvatarUrl } = useCloudinary();

const activeTab = ref<RankingType>("experience");

const tabs = computed<{ name: string; value: RankingType }[]>(() => [
  { name: t("ranking.tabs.experience"), value: "experience" },
  { name: t("ranking.tabs.points"), value: "points" },
  { name: t("ranking.tabs.correctanswers"), value: "correctanswers" },
  { name: t("ranking.tabs.accuracy"), value: "accuracy" },
  { name: t("ranking.tabs.quizzescompleted"), value: "quizzescompleted" },
]);

const loadRanking = () => {
  rankingStore.fetchRanking(activeTab.value);
};

onMounted(() => {
  loadRanking();
});

watch(activeTab, () => {
  loadRanking();
});

const topThree = computed(() => rankingStore.rankings.slice(0, 3));
const theRest = computed(() => rankingStore.rankings.slice(3));

const getName = (user: RankingEntry) => {
  return user.displayName || user.DisplayName || t("ranking.anonymous");
};

const getInitials = (user: RankingEntry) => {
  const name = getName(user);
  return name.slice(0, 2).toUpperCase();
};

const getAvatarUrl = (user: RankingEntry) => {
  const publicId = user.cloudinaryPublicId || user.CloudinaryPublicId;
  return cldGetAvatarUrl(publicId, 150);
};

const getValue = (user: RankingEntry) => {
  if (user.experience !== undefined)
    return `${user.experience} ${t("ranking.units.xp")}`;
  if (user.points !== undefined)
    return `${user.points} ${t("ranking.units.pts")}`;
  if (user.correctAnswers !== undefined)
    return `${user.correctAnswers} ${t("ranking.units.answers")}`;
  if (user.accuracy !== undefined) return `${user.accuracy}%`;
  if (user.completed !== undefined)
    return `${user.completed} ${t("ranking.units.quizzes")}`;
  return "-";
};
</script>

<template>
  <div class="space-y-16 pb-20 transition-colors duration-300">
    <section class="relative text-center pt-16 px-4">
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-green-100/50 dark:from-green-900/20 via-transparent to-transparent h-125 transition-colors"
      ></div>

      <h1
        class="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight"
      >
        {{ t("ranking.title") }}
        <span class="text-green-600 dark:text-green-500">{{
          t("ranking.subtitle")
        }}</span>
      </h1>
      <p
        class="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
      >
        {{ t("ranking.description") }}
      </p>

      <div class="flex flex-wrap justify-center gap-3 mb-12 max-w-5xl mx-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'px-6 py-3 font-bold rounded-2xl transition-all duration-300 border text-sm',
            activeTab === tab.value
              ? 'bg-green-600 dark:bg-green-500 text-white border-green-600 dark:border-green-500 shadow-lg shadow-green-200 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-green-300 shadow-sm',
          ]"
        >
          {{ tab.name }}
        </button>
      </div>
    </section>

    <section
      v-if="!rankingStore.isLoading && topThree.length > 0"
      class="max-w-4xl mx-auto px-6"
    >
      <div
        class="flex flex-col md:flex-row justify-center items-end gap-8 md:gap-4 lg:gap-8 mb-12"
      >
        <div
          v-if="topThree[1]"
          class="order-2 md:order-1 flex flex-col items-center w-full md:w-1/3 group"
        >
          <div class="relative mb-4">
            <div
              class="absolute -top-3 -right-2 bg-slate-400 text-white text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 z-10"
            >
              2
            </div>
            <div
              class="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-600 flex items-center justify-center text-2xl font-bold text-slate-600 dark:text-slate-300 group-hover:scale-105 transition-transform overflow-hidden shadow-lg"
            >
              <img
                v-if="getAvatarUrl(topThree[1])"
                :src="getAvatarUrl(topThree[1])!"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ getInitials(topThree[1]) }}</span>
            </div>
          </div>
          <h3
            class="font-bold text-slate-800 dark:text-white text-lg text-center truncate w-full"
          >
            {{ getName(topThree[1]) }}
          </h3>
          <p
            class="text-green-600 dark:text-green-400 font-black font-mono leading-none"
          >
            {{ getValue(topThree[1]) }}
          </p>
          <p
            v-if="topThree[1].level"
            class="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold"
          >
            {{ t("ranking.level", { level: topThree[1].level }) }}
          </p>
          <div
            class="hidden md:block w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-t-2xl mt-4 h-16 transition-colors group-hover:bg-slate-200/50 dark:group-hover:bg-slate-800"
          ></div>
        </div>

        <div
          v-if="topThree[0]"
          class="order-1 md:order-2 flex flex-col items-center w-full md:w-1/3 group"
        >
          <div class="relative mb-4 scale-110">
            <div
              class="absolute -top-5 left-1/2 -translate-x-1/2 text-4xl transform -rotate-12 z-10"
            >
              👑
            </div>
            <div
              class="absolute -top-1 -right-1 bg-yellow-500 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 z-10"
            >
              1
            </div>
            <div
              class="w-28 h-28 rounded-full bg-green-50 dark:bg-green-900/30 border-4 border-yellow-500 flex items-center justify-center text-3xl font-black text-green-700 dark:text-green-400 group-hover:scale-105 transition-transform overflow-hidden shadow-xl shadow-yellow-100 dark:shadow-none"
            >
              <img
                v-if="getAvatarUrl(topThree[0])"
                :src="getAvatarUrl(topThree[0])!"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ getInitials(topThree[0]) }}</span>
            </div>
          </div>
          <h3
            class="font-bold text-slate-900 dark:text-white text-xl text-center truncate w-full"
          >
            {{ getName(topThree[0]) }}
          </h3>
          <p
            class="text-green-600 dark:text-green-400 font-black text-lg font-mono leading-none"
          >
            {{ getValue(topThree[0]) }}
          </p>
          <p
            v-if="topThree[0].level"
            class="text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-bold"
          >
            {{ t("ranking.level", { level: topThree[0].level }) }}
          </p>
          <div
            class="hidden md:block w-full bg-linear-to-b from-green-50 to-white dark:from-green-900/20 dark:to-slate-900/20 border border-green-200 dark:border-green-900/50 rounded-t-2xl mt-4 h-28 shadow-sm transition-colors group-hover:from-green-100 dark:group-hover:from-green-900/40"
          ></div>
        </div>

        <div
          v-if="topThree[2]"
          class="order-3 md:order-3 flex flex-col items-center w-full md:w-1/3 group"
        >
          <div class="relative mb-4">
            <div
              class="absolute -top-3 -right-2 bg-amber-700 text-white text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 z-10"
            >
              3
            </div>
            <div
              class="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-amber-600 flex items-center justify-center text-2xl font-bold text-amber-700 dark:text-amber-600 group-hover:scale-105 transition-transform overflow-hidden shadow-lg"
            >
              <img
                v-if="getAvatarUrl(topThree[2])"
                :src="getAvatarUrl(topThree[2])!"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ getInitials(topThree[2]) }}</span>
            </div>
          </div>
          <h3
            class="font-bold text-slate-800 dark:text-white text-lg text-center truncate w-full"
          >
            {{ getName(topThree[2]) }}
          </h3>
          <p
            class="text-green-600 dark:text-green-400 font-black font-mono leading-none"
          >
            {{ getValue(topThree[2]) }}
          </p>
          <p
            v-if="topThree[2].level"
            class="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold"
          >
            {{ t("ranking.level", { level: topThree[2].level }) }}
          </p>
          <div
            class="hidden md:block w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-t-2xl mt-4 h-10 transition-colors group-hover:bg-slate-200/50 dark:group-hover:bg-slate-800"
          ></div>
        </div>
      </div>
    </section>

    <section class="max-w-4xl mx-auto px-6">
      <div
        class="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        <div v-if="rankingStore.isLoading" class="p-16 text-center">
          <div
            class="inline-block w-8 h-8 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin mb-4"
          ></div>
          <div class="text-slate-500 dark:text-slate-400 font-medium">
            {{ t("ranking.loading") }}
          </div>
        </div>

        <div
          v-else-if="rankingStore.error"
          class="p-16 text-center text-red-500 font-medium"
        >
          {{ rankingStore.error }}
        </div>

        <div
          v-else-if="rankingStore.rankings.length === 0"
          class="p-16 text-center text-slate-500 dark:text-slate-400"
        >
          {{ t("ranking.empty") }}
        </div>

        <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
          <div
            v-for="(user, index) in theRest"
            :key="user.id"
            class="group flex items-center justify-between p-5 hover:bg-white dark:hover:bg-slate-900 transition-colors duration-300"
          >
            <div class="flex items-center gap-5">
              <div
                class="w-8 font-black text-slate-400 dark:text-slate-600 text-center"
              >
                {{ index + 4 }}
              </div>
              <div
                class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <img
                  v-if="getAvatarUrl(user)"
                  :src="getAvatarUrl(user)!"
                  class="w-full h-full object-cover"
                />
                <span v-else>{{ getInitials(user) }}</span>
              </div>
              <div>
                <div
                  class="font-bold text-slate-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors"
                >
                  {{ getName(user) }}
                </div>
                <div
                  v-if="user.level"
                  class="text-xs text-slate-500 dark:text-slate-400"
                >
                  {{ t("ranking.level", { level: user.level }) }}
                </div>
              </div>
            </div>
            <div
              class="font-mono font-black text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700"
            >
              {{ getValue(user) }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
section {
  animation: slideIn 0.8s ease-out forwards;
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
