<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { ShopItem } from "@/types/shop";
import { ItemRarity, ItemRarityLabels } from "@/types/shop";
import { SHOP_PRESETS } from "@/components/shop/shopPresets";
import AnimatedNumber from "@/components/AnimatedNumber.vue";

const { t } = useI18n();

const props = defineProps<{
  item: ShopItem;
  isOwned?: boolean;
  userLevel?: number;
  userPoints?: number;
  adminMode?: boolean;
}>();

const emit = defineEmits(["purchase", "edit", "delete"]);

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
</script>

<template>
  <div
    class="group bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 transition-all flex flex-col"
    :class="[
      getRarityClass(item.rarity),
      !adminMode ? 'hover:-translate-y-2' : '',
    ]"
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
        <span v-if="item.type === 1" class="text-4xl drop-shadow-md">🖼️</span>
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
        {{ adminMode ? item.title : t(item.title) }}
      </h3>
      <p
        class="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 line-clamp-2"
      >
        {{ adminMode ? item.description : t(item.description) }}
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

      <div v-if="adminMode" class="flex gap-2">
        <button
          @click="emit('delete', item.id)"
          class="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-black uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all"
        >
          Usuń
        </button>
        <button
          @click="emit('edit', item)"
          class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black uppercase text-[10px] hover:bg-green-600 hover:text-white transition-all"
        >
          Edytuj
        </button>
      </div>

      <button
        v-else
        @click="emit('purchase', item.id)"
        :disabled="
          isOwned ||
          (userLevel || 0) < item.requiredLevel ||
          (userPoints || 0) < item.price
        "
        class="w-full py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed border-b-4"
        :class="[
          isOwned
            ? 'bg-slate-100 text-slate-400 border-slate-200'
            : 'bg-green-600 hover:bg-green-500 text-white border-green-800 shadow-lg shadow-green-900/20 active:border-b-0 active:mt-1',
        ]"
      >
        <template v-if="isOwned">{{ t("shop.owned") }}</template>
        <template v-else-if="(userLevel || 0) < item.requiredLevel">{{
          t("shop.lowLevel")
        }}</template>
        <template v-else>{{ t("shop.buyNow") }}</template>
      </button>
    </div>
  </div>
</template>
