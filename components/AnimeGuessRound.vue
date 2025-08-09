<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'

type JikanImageEntry = {
  large_image_url?: string
  large_large_image_url?: string
}
type JikanImages = { jpg?: JikanImageEntry; webp?: JikanImageEntry }
type JikanStudio = { name: string }
type JikanGenre = { name: string }
type JikanAnime = {
  mal_id: number
  title: string
  title_english?: string | null
  title_japanese?: string | null
  synopsis?: string | null
  images?: JikanImages
  episodes?: number | null
  year?: number | null
  type?: string | null
  studios?: JikanStudio[]
  genres?: JikanGenre[]
}

const emit = defineEmits<{ (e: 'result', correct: boolean): void }>()

const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const anime = ref<JikanAnime | null>(null)
const options = ref<string[]>([])
const correctTitle = ref<string>('')
const selectedIndex = ref<number | null>(null)
const correctIndex = ref<number>(-1)
const hintsLevel = ref(0) // 0..3

const imageUrl = computed(() => {
  const a = anime.value
  if (!a) return ''
  return (
    a.images?.jpg?.large_image_url ||
    a.images?.webp?.large_image_url ||
    a.images?.jpg?.large_large_image_url ||
    a.images?.webp?.large_large_image_url ||
    ''
  )
})

const displayTitle = (a: JikanAnime) =>
  a.title_english?.trim() ||
  a.title?.trim() ||
  a.title_japanese?.trim() ||
  a.title?.trim() ||
  'Unknown'

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()

function maskTitleWords(text: string, title: string): string {
  if (!text) return ''
  const words = Array.from(new Set(title.split(/[\s:;,.!?()-]+/).filter(Boolean)))
  let masked = text
  for (const w of words) {
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    masked = masked.replace(re, '█'.repeat(Math.min(w.length, 6)))
  }
  return masked
}

const synopsisMasked = computed(() => {
  const s = anime.value?.synopsis || ''
  const t = correctTitle.value || ''
  const masked = maskTitleWords(s, t)
  // shorten
  return masked.length > 280 ? masked.slice(0, 280) + '…' : masked
})

// Show full synopsis after answering; otherwise show masked version
const synopsisDisplay = computed(() => {
  return selectedIndex.value !== null
    ? (anime.value?.synopsis || '')
    : synopsisMasked.value
})

const blurAmount = computed(() => {
  // Unblur when an answer has been submitted
  if (selectedIndex.value !== null) return 0
  // 0 -> 12px, 1 -> 8px, 2 -> 4px, 3 -> 0px
  return Math.max(12 - hintsLevel.value * 4, 0)
})

const primaryStudio = computed(() => anime.value?.studios?.[0]?.name || 'Unknown')

const extraHints = computed(() => {
  const a = anime.value
  return [
    a?.type ? `Type: ${a.type}` : null,
    a?.year ? `Year: ${a.year}` : null,
    a?.episodes != null ? `Episodes: ${a.episodes}` : null,
    primaryStudio.value ? `Studio: ${primaryStudio.value}` : null,
    a?.genres ? `Genres: ${a.genres.map(g => g.name).join(', ')}` : null,
    a?.synopsis ? `Synopsis: ${a.synopsis}` : null
  ].filter(Boolean) as string[]
})

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function fetchRandomAnime(attempts = 4): Promise<JikanAnime> {
  // pick randomly from top 200 by popularity (pages 1..8, 25 per page)
  for (let i = 0; i < attempts; i++) {
    const page = 1 + Math.floor(Math.random() * 8)
    const res = await $fetch<{ data: JikanAnime[] }>('https://api.jikan.moe/v4/top/anime', {
      query: { filter: 'bypopularity', page, limit: 25 }
    })
    const candidates = res.data.filter(a => {
      const title = displayTitle(a)
      return title && (a.synopsis?.length ?? 0) >= 50
    })
    if (candidates.length) {
      return candidates[Math.floor(Math.random() * candidates.length)]
    }
  }
  // fallback: first page of top by popularity
  const res = await $fetch<{ data: JikanAnime[] }>('https://api.jikan.moe/v4/top/anime', {
    query: { filter: 'bypopularity', page: 1, limit: 25 }
  })
  return res.data[0]
}

async function fetchDistractorTitles(excludeTitle: string): Promise<string[]> {
  const exclude = normalize(excludeTitle)
  // keep within top 200 by popularity to match the round's pool
  const page = 1 + Math.floor(Math.random() * 8)
  const res = await $fetch<{ data: JikanAnime[] }>('https://api.jikan.moe/v4/top/anime', {
    query: { filter: 'bypopularity', limit: 25, page }
  })
  const pool = res.data
    .map(displayTitle)
    .filter(t => t && normalize(t) !== exclude)
  const uniq = Array.from(new Set(pool.map(normalize))).map(n =>
    pool.find(t => normalize(t) === n) as string
  )
  return shuffle(uniq).slice(0, 3)
}

async function loadRound() {
  try {
    isLoading.value = true
    errorMessage.value = null
    selectedIndex.value = null
    hintsLevel.value = 0

    const a = await fetchRandomAnime()
    anime.value = a
    correctTitle.value = displayTitle(a)

    let distractors = await fetchDistractorTitles(correctTitle.value)
    // If not enough distractors, try again with a different page
    while (distractors.length < 3) {
      const more = await fetchDistractorTitles(correctTitle.value)
      distractors = Array.from(new Set([...distractors, ...more]))
    }
    const opts = shuffle([correctTitle.value, ...distractors.slice(0, 3)])
    options.value = opts
    correctIndex.value = opts.findIndex(o => normalize(o) === normalize(correctTitle.value))
  } catch {
    errorMessage.value = 'Failed to load a round. You can retry.'
  } finally {
    isLoading.value = false
  }
}

function chooseOption(idx: number) {
  if (selectedIndex.value !== null) return
  selectedIndex.value = idx
  const correct = idx === correctIndex.value
  // Reveal all hints once answered
  hintsLevel.value = 5
  emit('result', correct)
}

function revealHint() {
  if (selectedIndex.value !== null) return
  hintsLevel.value = Math.min(hintsLevel.value + 1, 5)
}

function retry() {
  loadRound()
}

// Show full-size image when round ends
const showFullImage = ref(false)
watch(() => selectedIndex.value, (v) => {
  if (v !== null) showFullImage.value = true
})
const closeFullImage = () => { showFullImage.value = false }

onMounted(loadRound)
</script>

<template>
  <div class="round-container">
    <div v-if="isLoading" class="card">
      <div class="skeleton title" />
      <div class="skeleton lines" />
      <div class="skeleton image" />
      <div class="skeleton options" />
    </div>

    <div v-else-if="errorMessage" class="card error">
      <div>{{ errorMessage }}</div>
      <button class="btn" @click="retry">Try Again</button>
    </div>

    <div v-else class="card">
      <div class="header">
        <h2>Which anime is this?</h2>
        <button class="btn-hint" :disabled="selectedIndex !== null" @click="revealHint">
          Reveal Hint ({{ 5 - hintsLevel }} left)
        </button>
      </div>

      <!-- <div class="synopsis">
        <strong>Synopsis:</strong>
        <div class="synopsis-text">{{ synopsisDisplay }}</div>
      </div> -->

      <ul class="hints">
        <li v-if="hintsLevel >= 1"><strong>{{ extraHints[0].split(': ')[0] }}:</strong> {{ extraHints[0].split(': ')[1] }}</li>
        <li v-if="hintsLevel >= 2"><strong>{{ extraHints[1].split(': ')[0] }}:</strong> {{ extraHints[1].split(': ')[1] }}</li>
        <li v-if="hintsLevel >= 3"><strong>{{ extraHints[2].split(': ')[0] }}:</strong> {{ extraHints[2].split(': ')[1] }}</li>
        <li v-if="hintsLevel >= 4"><strong>{{ extraHints[3].split(': ')[0] }}:</strong> {{ extraHints[3].split(': ')[1] }}</li>
        <li v-if="hintsLevel >= 5"><strong>{{ extraHints[4].split(': ')[0] }}:</strong> {{ extraHints[4].split(': ')[1] }}</li>
      </ul>

      <div class="image-wrap" :style="{ filter: `blur(${blurAmount}px)` }">
        <img v-if="imageUrl" :src="imageUrl" alt="Anime image">
      </div>

      <div class="options">
        <button
          v-for="(opt, idx) in options"
          :key="idx"
          class="opt"
          :class="{
            correct: selectedIndex !== null && idx === correctIndex,
            wrong: selectedIndex === idx && idx !== correctIndex
          }"
          @click="chooseOption(idx)"
        >
          {{ opt }}
        </button>
      </div>

      <div v-if="selectedIndex !== null" class="result">
        <div v-if="selectedIndex === correctIndex" class="ok">Correct!</div>
        <div v-else class="bad">Wrong — it was: <strong>{{ correctTitle }}</strong></div>
      </div>
    </div>

    <!-- Full-size image modal -->
    <div v-if="showFullImage && imageUrl" class="img-modal" @click.self="closeFullImage">
      <button class="img-modal-close" aria-label="Close" @click="closeFullImage">×</button>
      <img :src="imageUrl" alt="Anime image full" class="img-modal-content">
    </div>
  </div>
</template>

<style scoped>
.round-container { width: 100%; }
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.synopsis { margin: 10px 0; }
.synopsis-text { white-space: pre-wrap; color: #334155; }

.hints { margin: 8px 0 14px; padding-left: 18px; color: #475569; }

.image-wrap {
  width: 100%;
  max-height: 360px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin: 10px 0 14px;
}
.image-wrap img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}
.opt {
  text-align: left;
  background: #0f172a;
  color: #fff;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.opt:hover { background: #1e293b; }
.opt.correct { background: #16a34a; }
.opt.wrong { background: #dc2626; }

.result { margin-top: 12px; }
.ok { color: #16a34a; font-weight: 600; }
.bad { color: #dc2626; }

.btn {
  background-color: var(--brand-pink-500);
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-hint {
  background: transparent;
  color: var(--brand-pink-500);
  border: 2px solid var(--brand-pink-500);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-hint:disabled { opacity: 0.6; cursor: not-allowed; }

.skeleton { background: #e5e7eb; border-radius: 6px; margin: 8px 0; }
.skeleton.title { height: 18px; width: 40%; }
.skeleton.lines { height: 60px; }
.skeleton.image { height: 220px; }
.skeleton.options { height: 44px; }
.error { display: flex; gap: 10px; align-items: center; }

/* Full-size image modal */
.img-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.img-modal-content {
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}
.img-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 9999px;
  background: rgba(255,255,255,0.9);
  color: #111827;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}
</style>