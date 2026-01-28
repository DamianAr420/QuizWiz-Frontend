<script setup lang="ts">
import Navbar from "@/components/LayoutComponents/NavBar.vue";
import Footer from "@/components/LayoutComponents/Footer.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <Navbar />

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <Footer />
  </div>
</template>
