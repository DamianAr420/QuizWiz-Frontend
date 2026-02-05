<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "@/components/LayoutComponents/NavBar.vue";
import Footer from "@/components/LayoutComponents/Footer.vue";
import HexGrid from "@/components/LayoutComponents/HexGrid.vue";

const route = useRoute();
const glowPosition = ref({ x: -1000, y: -1000 });
const isVisible = ref(false);

const shouldHideBg = computed(() => route.meta.hideHexBg === true);

const isPlayPage = computed(() => route.path.includes("/play"));

const updateGlow = (e: MouseEvent) => {
  glowPosition.value = { x: e.clientX, y: e.clientY };
  if (!isVisible.value) isVisible.value = true;
};

const glowStyle = computed(() => {
  const hexPath = "M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100";
  const svgMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='${hexPath}' fill='none' stroke='black' stroke-width='3'/%3E%3C/svg%3E")`;
  const radialGlow = `radial-gradient(200px circle at ${glowPosition.value.x}px ${glowPosition.value.y}px, black 0%, transparent 100%)`;

  return {
    opacity: isVisible.value ? 1 : 0,
    maskImage: `${radialGlow}, ${svgMask}`,
    WebkitMaskImage: `${radialGlow}, ${svgMask}`,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
});

onMounted(() => {
  window.addEventListener("mousemove", updateGlow);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", updateGlow);
});
</script>

<template>
  <div
    class="relative min-h-screen flex flex-col transition-colors duration-300 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden"
  >
    <template v-if="!shouldHideBg">
      <div
        class="fixed inset-0 z-0 text-slate-100 dark:text-slate-900 opacity-[0.35] dark:opacity-[0.1]"
      >
        <HexGrid />
      </div>

      <div
        class="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 bg-emerald-500"
        :style="glowStyle"
      ></div>
    </template>

    <div class="relative z-10 flex flex-col grow">
      <Navbar />

      <main
        class="flex flex-col grow w-full mx-auto transition-all duration-500 ease-in-out px-4 sm:px-6 lg:px-8 py-8"
        :class="[isPlayPage ? 'max-w-none' : 'max-w-7xl']"
      >
        <slot />
      </main>

      <Footer />
    </div>
  </div>
</template>

<style scoped>
main {
  will-change: max-width, padding;
}
</style>
