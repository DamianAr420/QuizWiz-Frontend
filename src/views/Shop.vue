<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useShopStore } from "@/stores/shop";
import { useUserStore } from "@/stores/user";
import { useToastStore } from "@/stores/toast";
import { ItemRarity, ItemRarityLabels } from "@/types/shop";
import { SHOP_PRESETS } from "@/components/shop/shopPresets";
import AnimatedNumber from "@/components/AnimatedNumber.vue";

const { t } = useI18n();
const shopStore = useShopStore();
const userStore = useUserStore();
const toast = useToastStore();

onMounted(() => {
  shopStore.fetchShopItems();
  shopStore.fetchInventory();
});

const userPoints = computed(() => userStore.profile?.points || 0);
const userLevel = computed(() => userStore.profile?.level || 1);

const isOwned = (itemId: number) => {
  return shopStore.inventory.some((ui) => ui.shopItemId === itemId);
};

// POPRAWKA: Zmiana typu argumentu na string | null | undefined
const isRealImage = (url: string | null | undefined) => {
  if (!url) return false;
  return (
    url.startsWith("http") ||
    url.startsWith("/") ||
    url.startsWith("data:image")
  );
};

const getRarityClass = (rarity: ItemRarity) => {
  switch (rarity) {
    case ItemRarity.Legendary:
      return "border-amber-400 shadow-amber-900/10 text-amber-500";
    case ItemRarity.Epic:
      return "border-purple-500 shadow-purple-900/10 text-purple-500";
    case ItemRarity.Rare:
      return "border-blue-500 shadow-blue-900/10 text-blue-500";
    default:
      return "border-slate-200 dark:border-slate-700 text-slate-400";
  }
};

const handlePurchase = async (itemId: number) => {
  const result = await shopStore.purchaseItem(itemId);
  if (result.success) {
    toast.show(t("shop.purchaseSuccess"), "success");
    await userStore.fetchProfile();
  } else {
    toast.show(result.message, "error");
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-12">
    <header
      class="mb-12 flex flex-col md:flex-row justify-between items-center gap-6"
    >
      <div>
        <h1
          class="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight"
        >
          {{ t("shop.title") }}
          <span class="text-green-600">{{ t("shop.subtitle") }}</span>
        </h1>
        <p class="text-slate-500 dark:text-slate-400 font-bold">
          {{ t("shop.description") }}
        </p>
      </div>

      <div class="flex gap-4">
        <div
          class="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border-2 border-green-500 shadow-lg flex items-center gap-3"
        >
          <span class="text-2xl">💰</span>
          <div>
            <p
              class="text-[10px] font-black text-slate-400 uppercase leading-none"
            >
              {{ t("shop.yourPoints") }}
            </p>
            <p class="text-xl font-black text-slate-900 dark:text-white">
              <AnimatedNumber :value="userPoints" />
            </p>
          </div>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="item in shopStore.items"
        :key="item.id"
        class="group bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 transition-all hover:-translate-y-2 flex flex-col"
        :class="getRarityClass(item.rarity)"
      >
        <div
          class="aspect-square rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative border shadow-inner"
          :class="[
            !isRealImage(item.imageUrl)
              ? SHOP_PRESETS.getClassName(item.imageUrl!)
              : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800',
          ]"
          :style="
            !isRealImage(item.imageUrl)
              ? SHOP_PRESETS.getInlineStyle(item.imageUrl!)
              : {}
          "
        >
          <img
            v-if="isRealImage(item.imageUrl)"
            :src="item.imageUrl!"
            class="w-full h-full object-cover transition-transform group-hover:scale-110"
          />

          <div v-else class="text-center z-10">
            <span v-if="item.type === 1" class="text-4xl drop-shadow-md"
              >🖼️</span
            >
            <span v-else-if="item.type === 0" class="text-4xl drop-shadow-md"
              >👤</span
            >
            <span v-else class="text-4xl">🎁</span>
          </div>

          <div
            class="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-sm shadow-sm text-slate-900 dark:text-white"
          >
            {{ ItemRarityLabels[item.rarity] }}
          </div>
        </div>

        <div class="grow">
          <h3 class="text-lg font-black text-slate-900 dark:text-white mb-1">
            {{ t(item.title) }}
          </h3>
          <p
            class="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 line-clamp-2"
          >
            {{ t(item.description) }}
          </p>
        </div>

        <div class="mt-auto space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="font-black flex items-center gap-1 text-slate-400">
              Lvl {{ item.requiredLevel }}
            </span>
            <span class="text-slate-900 dark:text-white font-black text-lg">
              <AnimatedNumber :value="item.price" />
              <span class="text-xs text-green-600 ml-1">{{
                t("shop.currency")
              }}</span>
            </span>
          </div>

          <button
            @click="handlePurchase(item.id)"
            :disabled="
              isOwned(item.id) ||
              userLevel < item.requiredLevel ||
              userPoints < item.price
            "
            class="w-full py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed border-b-4"
            :class="[
              isOwned(item.id)
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-green-600 hover:bg-green-500 text-white border-green-800 shadow-lg shadow-green-900/20 active:border-b-0 active:mt-1',
            ]"
          >
            <template v-if="isOwned(item.id)">{{ t("shop.owned") }}</template>
            <template v-else-if="userLevel < item.requiredLevel">{{
              t("shop.lowLevel")
            }}</template>
            <template v-else>{{ t("shop.buyNow") }}</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-amber-400 {
  box-shadow: 0 10px 20px -10px rgba(251, 191, 36, 0.4);
}
.border-purple-500 {
  box-shadow: 0 10px 20px -10px rgba(168, 85, 247, 0.4);
}
.border-blue-500 {
  box-shadow: 0 10px 20px -10px rgba(59, 130, 246, 0.4);
}

@keyframes shop-rainbow-scroll {
  to {
    background-position: 200% center;
  }
}
@keyframes shop-move-gradient {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
