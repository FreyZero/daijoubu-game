<script setup lang="ts">
import { ref } from 'vue'

type Mode = 'anime' | 'character' | 'noimage'
const mode = ref<Mode>('anime')
const totalRounds = ref(10)
const roundsPlayed = ref(0)
const score = ref(0)
const answeredThisRound = ref(false)
const roundKey = ref(0) // force remount per round

const handleResult = (correct: boolean) => {
  if (answeredThisRound.value) return
  answeredThisRound.value = true
  roundsPlayed.value += 1
  if (correct) score.value += 1
}

const nextRound = () => {
  if (!answeredThisRound.value) return
  answeredThisRound.value = false
  roundKey.value += 1
}

const resetGame = () => {
  totalRounds.value = 10
  roundsPlayed.value = 0
  score.value = 0
  answeredThisRound.value = false
  roundKey.value += 1
}

const newRound = () => { roundKey.value += 1; answeredThisRound.value = false }
</script>

<template>
  <div class="page-wrapper">
    <h1 class="text-3xl font-bold mb-4">Guess the Anime</h1>

    <div class="mb-3" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
      <div style="display:flex; gap:0.75rem; align-items:center;">
        <label style="display:flex; gap:0.4rem; align-items:center;">
          <input v-model="mode" type="radio" value="anime" @change="newRound"> Anime
        </label>
        <label style="display:flex; gap:0.4rem; align-items:center;">
          <input v-model="mode" type="radio" value="character" @change="newRound"> Character
        </label>
        <label style="display:flex; gap:0.4rem; align-items:center;">
          <input v-model="mode" type="radio" value="noimage" @change="newRound"> No Image
        </label>
        <button class="btn" @click="newRound">New Round</button>
      </div>
    </div>

    <div class="mb-4" style="display:flex; gap:1rem; align-items:center;">
      <div>Score: {{ score }} / {{ roundsPlayed }}</div>
      <div>Target Rounds: {{ totalRounds }}</div>
    </div>

    <ClientOnly>
      <AnimeGuessRound
        :key="roundKey"
        :mode="mode"
        @result="handleResult"
      />
    </ClientOnly>

  <div class="mt-6 actions">
      <button class="btn-outline" @click="resetGame">Reset Game</button>
      <button
        class="btn"
        :disabled="!answeredThisRound || roundsPlayed >= totalRounds"
        @click="nextRound"
      >
        Next Round
      </button>
    </div>

    <div
      v-if="roundsPlayed >= totalRounds"
      class="mt-6 p-4 rounded"
      style="background:#f1f5f9;"
    >
      <strong>Game over!</strong>
      <div>Your final score: {{ score }} / {{ totalRounds }}</div>
      <div class="mt-2">
        <button class="btn" @click="resetGame">Play Again</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper { max-width: 960px; margin: 0 auto; padding: 0 var(--page-x); }
.actions { display:flex; gap:0.75rem; justify-content: space-between; flex-wrap: wrap; }
.btn {
  background-color: var(--brand-pink-500);
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline {
  background: transparent;
  color: var(--brand-pink-500);
  border: 2px solid var(--brand-pink-500);
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}
@media (max-width: 480px) {
  h1 { font-size: 1.5rem; }
}
</style>