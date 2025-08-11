<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';
</script>

<template>
  <NuxtLayout>
    <Analytics />
    <UApp>
      <NuxtPage />
    </UApp>
  </NuxtLayout>
</template>

<style>
@import './assets/css/main.css';
:root {
  font-family: 'Krub', sans-serif;
}
</style>