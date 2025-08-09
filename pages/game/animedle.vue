<script setup lang="ts">
import { ref } from 'vue'

type Mode = 'anime' | 'character'
const mode = ref<Mode>('anime')
const gameKey = ref(0)
const newGame = () => { gameKey.value++ }
</script>

<template>
  <div class="page-wrapper" style="max-width: 960px; margin: 0 auto;">
    <h1 class="text-3xl font-bold mb-4">Animedle</h1>

    <div class="controls" style="display:flex; gap:1rem; align-items:center; margin-bottom: 1rem;">
      <label style="display:flex; gap:0.4rem; align-items:center;">
        <input v-model="mode" type="radio" value="anime" @change="newGame"> Anime
      </label>
      <label style="display:flex; gap:0.4rem; align-items:center;">
        <input v-model="mode" type="radio" value="character" @change="newGame"> Character
      </label>
      <button class="btn" @click="newGame">New Game</button>
    </div>

    <ClientOnly>
      <AnimedleGame :key="mode + ':' + gameKey" :mode="mode" />
    </ClientOnly>
  </div>
</template>

<style scoped>
.btn {
  background-color: var(--brand-pink-500);
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>