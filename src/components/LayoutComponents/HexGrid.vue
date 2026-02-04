<script setup lang="ts">
defineProps<{
  strokeColor?: string;
}>();
</script>

<template>
  <svg
    class="absolute inset-0 h-full w-full"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="hexagons"
        width="56"
        height="100"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
          fill="none"
          :stroke="strokeColor || 'currentColor'"
          stroke-width="3"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hexagons)" />
  </svg>
</template>
