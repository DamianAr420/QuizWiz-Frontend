<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  value: number;
  duration?: number;
}>();

const displayValue = ref(props.value);
const duration = props.duration || 1000;

const animate = (newValue: number) => {
  const startValue = displayValue.value;
  const startTime = performance.now();

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOutQuad = progress * (2 - progress);

    displayValue.value = Math.floor(
      startValue + (newValue - startValue) * easeOutQuad,
    );

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

watch(
  () => props.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      animate(newVal);
    }
  },
);
</script>

<template>
  <span>{{ displayValue.toLocaleString() }}</span>
</template>
