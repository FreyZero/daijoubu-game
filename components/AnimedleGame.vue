<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

type Mode = 'anime' | 'character'

type JikanImageEntry = {
  // Jikan anime often provides large_image_url; characters commonly use image_url/small_image_url
  image_url?: string
  small_image_url?: string
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
// Character API types (from Jikan Characters endpoints)
type JikanCharacter = { mal_id: number; name: string; images?: JikanImages }
type JikanCharacterAnimeography = { role: string; anime: { mal_id: number; title: string; images?: JikanImages; type?: string | null } }
type JikanCharacterFull = { mal_id: number; name: string; images?: JikanImages; anime?: JikanCharacterAnimeography[] }

const props = defineProps<{ mode: Mode }>()

const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const targetRaw = ref('')      // full original display (title or character name)
const targetWord = ref('')     // normalized for wordle logic (A-Z only)
const targetMeta = ref<{      // extra details for hints
  image?: string | null
  synopsis?: string | null
  year?: number | null
  type?: string | null
  studio?: string | null
  animeTitle?: string | null
  genres?: JikanGenre[] | null
} | null>(null)

const attemptsMax = 6
const guesses = ref<string[]>([])   // stored as normalized
const cursor = ref(0)               // position in current guess
const statuses = ref<Array<Array<'' | 'correct' | 'present' | 'absent'>>>([])
const keyboardState = ref<Record<string, 'correct' | 'present' | 'absent'>>({})
const gameOver = ref(false)
const won = ref(false)

// Track the active row explicitly
const rowIndex = ref(0)

// Hidden input to reliably capture keyboard on mobile (iOS/Android)
const hiddenEl = ref<HTMLInputElement | null>(null)
const hiddenValue = ref('')
function focusHidden() {
  // focus next frame to avoid timing issues after DOM updates
  requestAnimationFrame(() => hiddenEl.value?.focus())
}
function onHiddenKeydown(e: KeyboardEvent) {
  handleKeydown(e)
  e.preventDefault()
  e.stopPropagation()
  // keep buffer empty so we don't accumulate characters
  hiddenValue.value = ''
}
function onHiddenInput() {
  // Fallback for platforms where keydown may be unreliable
  const ch = hiddenValue.value.slice(-1).toUpperCase()
  if (/^[A-Z]$/.test(ch)) pressKey(ch)
  hiddenValue.value = ''
}

const keysAZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const currentRow = computed(() => rowIndex.value)
const wordLength = computed(() => targetWord.value.length)

function displayTitle(a: JikanAnime) {
  return a.title_english?.trim() || a.title?.trim() || a.title_japanese?.trim() || a.title?.trim() || ''
}
function imageFrom(images?: JikanImages) {
  return (
    images?.jpg?.large_image_url ||
    images?.webp?.large_image_url ||
    images?.jpg?.image_url ||
    images?.webp?.image_url ||
    images?.jpg?.small_image_url ||
    images?.webp?.small_image_url ||
    images?.jpg?.large_large_image_url ||
    images?.webp?.large_large_image_url ||
    null
  )
}
function normalizeLetters(s: string) {
  // Uppercase A-Z only; remove spaces/punct/diacritics
  const noDiacritics = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return (noDiacritics.match(/[A-Za-z]/g) || []).join('').toUpperCase()
}

function initBoard(len: number) {
  guesses.value = Array.from({ length: attemptsMax }, () => '')
  statuses.value = Array.from({ length: attemptsMax }, () => Array.from({ length: len }, () => '' as '' | 'correct' | 'present' | 'absent'))
  rowIndex.value = 0
  cursor.value = 0
  keyboardState.value = {}
  gameOver.value = false
  won.value = false
}

function applyStatuses(guess: string, target: string): ('correct'|'present'|'absent')[] {
  const res: ('correct'|'present'|'absent')[] = Array(target.length).fill('absent')
  const targetArr = target.split('')
  const guessArr = guess.split('')
  const counts: Record<string, number> = {}
  for (const ch of targetArr) counts[ch] = (counts[ch] || 0) + 1
  // first pass correct
  for (let i = 0; i < targetArr.length; i++) {
    if (guessArr[i] === targetArr[i]) {
      res[i] = 'correct'
      counts[guessArr[i]]!--
      guessArr[i] = '*' // mark consumed
    }
  }
  // second pass presents
  for (let i = 0; i < targetArr.length; i++) {
    if (res[i] === 'correct') continue
    const ch = guessArr[i]
    if (ch && counts[ch] > 0) {
      res[i] = 'present'
      counts[ch]--
    } else {
      res[i] = 'absent'
    }
  }
  return res
}

function updateKeyboard(guess: string, rowStatuses: ('correct'|'present'|'absent')[]) {
  for (let i = 0; i < guess.length; i++) {
    const ch = guess[i]
    const s = rowStatuses[i]
    const prev = keyboardState.value[ch]
    if (!prev) keyboardState.value[ch] = s
    else {
      // do not downgrade statuses
      if (prev === 'present' && s === 'correct') keyboardState.value[ch] = 'correct'
      if (prev === 'absent' && (s === 'present' || s === 'correct')) keyboardState.value[ch] = s
    }
  }
}

function pressKey(k: string) {
  if (gameOver.value || !targetWord.value) return
  if (k === 'ENTER') {
    submitGuess()
    return
  }
  if (k === 'BACKSPACE') {
    if (cursor.value > 0) {
      const row = currentRow.value
      const curr = guesses.value[row] || ''
      guesses.value[row] = curr.slice(0, -1)
      cursor.value--
    }
    return
  }
  if (/^[A-Z]$/.test(k)) {
    if (cursor.value < wordLength.value) {
      const row = currentRow.value
      const curr = guesses.value[row] || ''
      guesses.value[row] = (curr + k).slice(0, wordLength.value)
      cursor.value++
    }
  }
}

function submitGuess() {
  if (gameOver.value) return
  const row = currentRow.value
  const g = (guesses.value[row] || '')
  if (g.length !== wordLength.value) return
  const rowStat = applyStatuses(g, targetWord.value)
  statuses.value[row] = rowStat
  updateKeyboard(g, rowStat)

  if (g === targetWord.value) {
    won.value = true
    gameOver.value = true
    return
  }
  if (row + 1 >= attemptsMax) {
    gameOver.value = true
    return
  }
  // advance to next row
  rowIndex.value = row + 1
  cursor.value = 0
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') pressKey('ENTER')
  else if (e.key === 'Backspace') pressKey('BACKSPACE')
  else if (/^[a-z]$/i.test(e.key)) pressKey(e.key.toUpperCase())
}

const hintLevel = computed(() => {
  // after 2, 4, 5 attempts reveal more
  const used = currentRow.value
  if (won.value || gameOver.value) return 5
  if (used >= 5) return 4
  if (used >= 4) return 3
  if (used >= 2) return 2
  if (used >= 1) return 1
  return 0
})

const hintList = computed(() => {
  const meta = targetMeta.value || {}
  const list: string[] = []
  if (props.mode === 'anime') {
    if (meta.type) list.push(`Type: ${meta.type}`)
    if (meta.year) list.push(`Year: ${meta.year}`)
    if (meta.studio) list.push(`Studio: ${meta.studio}`)
    if (meta.genres) list.push(`Genres: ${meta.genres.map(g => g.name).join(', ')}`)
    if (meta.synopsis) list.push(`Synopsis: ${meta.synopsis.slice(0, 160)}…`)
  } else {
    if (meta.animeTitle) list.push(`Anime: ${meta.animeTitle}`)
    if (meta.year) list.push(`Anime Year: ${meta.year}`)
    if (meta.type) list.push(`Anime Type: ${meta.type}`)
  }
  return list.slice(0, hintLevel.value) // reveal progressively
})

const topAnimeCache: JikanAnime[] = []
let cacheLoaded = false
async function ensureTopAnimeCache() {
  if (cacheLoaded) return
  // pull top 200 by popularity (pages 1..8). Mild concurrency.
  const pages = Array.from({ length: 8 }, (_, i) => i + 1)
  const chunkSize = 4
  for (let i = 0; i < pages.length; i += chunkSize) {
    const chunk = pages.slice(i, i + chunkSize)
    const results = await Promise.allSettled(chunk.map(page =>
      $fetch<{ data: JikanAnime[] }>('https://api.jikan.moe/v4/top/anime', {
        query: { filter: 'bypopularity', limit: 25, page }
      })
    ))
    for (const r of results) {
      if (r.status === 'fulfilled') topAnimeCache.push(...r.value.data)
    }
  }
  cacheLoaded = true
}

// Characters cache using Jikan Characters API (popular by favorites)
const topCharactersCache: JikanCharacter[] = []
let charCacheLoaded = false
async function ensureTopCharactersCache() {
  if (charCacheLoaded) return
  const pages = Array.from({ length: 8 }, (_, i) => i + 1)
  const chunkSize = 3 // respect Jikan rate limits
  for (let i = 0; i < pages.length; i += chunkSize) {
    const chunk = pages.slice(i, i + chunkSize)
    const results = await Promise.allSettled(chunk.map(page =>
      $fetch<{ data: JikanCharacter[] }>('https://api.jikan.moe/v4/characters', {
        query: { order_by: 'favorites', sort: 'desc', limit: 25, page }
      })
    ))
    for (const r of results) {
      if (r.status === 'fulfilled') topCharactersCache.push(...r.value.data)
    }
  }
  charCacheLoaded = true
}

function pickAnimeCandidate(minLen = 5, maxLen = 9): JikanAnime | null {
  // prefer English/romaji titles that normalize within desired length
  const shuffled = topAnimeCache.slice().sort(() => Math.random() - 0.5)
  for (const a of shuffled) {
    const t = displayTitle(a)
    const n = normalizeLetters(t)
    if (n.length >= minLen && n.length <= maxLen) return a
  }
  return null
}

async function loadAnimeTarget() {
  await ensureTopAnimeCache()
  const a = pickAnimeCandidate()
  if (!a) throw new Error('No suitable anime found in top 200.')
  const t = displayTitle(a)
  const norm = normalizeLetters(t)
  targetRaw.value = t
  targetWord.value = norm
  targetMeta.value = {
    image: imageFrom(a.images),
    synopsis: a.synopsis || null,
    year: a.year ?? null,
    type: a.type ?? null,
    studio: a.studios?.[0]?.name ?? null,
    animeTitle: null,
    genres: a.genres ? a.genres : []
  }
}

async function loadCharacterTarget() {
  // Use Characters API: pick from popular characters by favorites, then enrich with animeography
  await ensureTopCharactersCache()
  const shuffled = topCharactersCache.slice().sort(() => Math.random() - 0.5)
  for (const c of shuffled) {
    const name = c.name?.trim() || ''
    const normalized = normalizeLetters(name)
    if (normalized.length < 5 || normalized.length > 9) continue
    // Fetch full character to discover anime appearances
    let charFull: JikanCharacterFull | null = null
    try {
      const fullRes = await $fetch<{ data: JikanCharacterFull }>(`https://api.jikan.moe/v4/characters/${c.mal_id}/full`)
      charFull = fullRes.data
    } catch {
      continue
    }
    const firstAnime = charFull?.anime?.[0]?.anime
    // Optionally fetch anime details for year/type/studio if we have an id
    let animeTitle: string | null = null
    let year: number | null = null
    let type: string | null = null
    let studio: string | null = null
    if (firstAnime?.mal_id) {
      try {
        const animeRes = await $fetch<{ data: JikanAnime }>(`https://api.jikan.moe/v4/anime/${firstAnime.mal_id}`)
        const a = animeRes.data
        animeTitle = displayTitle(a)
        year = a.year ?? null
        type = a.type ?? null
        studio = a.studios?.[0]?.name ?? null
      } catch {
        animeTitle = firstAnime.title || null
        // year/type/studio remain null
      }
    }

    targetRaw.value = name
    targetWord.value = normalized
    targetMeta.value = {
      image: imageFrom(charFull?.images) || imageFrom(c.images) || null,
      synopsis: null,
      year,
      type,
      studio,
      animeTitle
    }
    return
  }
  throw new Error('No suitable character found from popular characters list.')
}

async function newRound() {
  isLoading.value = true
  errorMessage.value = null
  try {
    if (props.mode === 'anime') await loadAnimeTarget()
    else await loadCharacterTarget()
    initBoard(wordLength.value)
  } catch {
    errorMessage.value = 'Failed to start game.'
  } finally {
    isLoading.value = false
  }
}

function reset() {
  newRound()
  focusHidden()
}

// Reveal full-size image when the round ends
const showFullImage = ref(false)
watch(() => gameOver.value, (over) => {
  if (over && (targetMeta.value?.image)) showFullImage.value = true
})
const closeFullImage = () => { showFullImage.value = false }

onMounted(() => {
  newRound()
  window.addEventListener('keydown', handleKeydown)
  focusHidden()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="animedle" @click="focusHidden">
    <!-- Hidden input to capture mobile typing -->
  <input
      ref="hiddenEl"
      v-model="hiddenValue"
      class="sr-only-input"
      aria-hidden="true"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="characters"
      spellcheck="false"
      @keydown="onHiddenKeydown"
      @input="onHiddenInput"
  >

    <div v-if="isLoading" class="card">
      <div class="skeleton title" />
      <div class="skeleton lines" />
      <div class="skeleton image" />
      <div class="skeleton lines" />
    </div>

    <div v-else-if="errorMessage" class="card error">
      <div>{{ errorMessage }}</div>
      <button class="btn" @click="reset">Try Again</button>
    </div>

    <div v-else class="card">
      <div class="top">
        <div class="mode">Mode: <strong style="text-transform: capitalize;">{{ props.mode }}</strong></div>
        <div class="len">Word length: {{ wordLength }}</div>
        <button class="btn-outline" @click="reset">New Target</button>
      </div>

      <div v-if="targetMeta?.image && gameOver" class="image-wrap">
        <img :src="targetMeta?.image" alt="cover">
      </div>

      <div class="board">
        <div v-for="rowIdx in attemptsMax" :key="rowIdx" class="row">
          <div
            v-for="colIdx in wordLength"
            :key="colIdx"
            class="tile"
            :class="statuses[rowIdx - 1]?.[colIdx - 1]"
          >
            {{ (guesses[rowIdx - 1] || '')[colIdx - 1] || '' }}
          </div>
        </div>
      </div>

      <div class="keyboard">
        <div class="kb-grid" role="group" aria-label="On-screen keyboard">
          <button
            v-for="k in keysAZ"
            :key="k"
            class="key"
            :class="keyboardState[k]"
            type="button"
            :aria-label="`Key ${k}`"
            @click="pressKey(k)"
          >
            {{ k }}
          </button>
        </div>
        <div class="kb-actions" role="group" aria-label="Keyboard actions">
          <button class="key action" type="button" @click="pressKey('BACKSPACE')">DEL</button>
          <button class="key action btn" type="button" @click="pressKey('ENTER')">ENTER</button>
        </div>
      </div>

    <div v-if="hintList.length" class="hints">
        <div v-for="(h, i) in hintList" :key="i" class="hint">{{ h }}</div>
      </div>

      <div v-if="gameOver" class="result">
        <div v-if="won" class="ok">You got it!</div>
        <div v-else class="bad">Answer: <strong>{{ targetRaw }}</strong></div>
        <button class="btn" @click="reset">Play Again</button>
      </div>
    </div>

    <!-- Full-size image modal -->
    <div v-if="showFullImage && targetMeta?.image" class="img-modal" @click.self="closeFullImage">
      <button class="img-modal-close" aria-label="Close" @click="closeFullImage">×</button>
      <img :src="targetMeta?.image" alt="cover full" class="img-modal-content">
    </div>
  </div>
</template>

<style scoped>
.animedle { width: 100%; }
/* Hidden, but focusable input */
.sr-only-input {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
}
.top {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.image-wrap {
  width: 50%;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin: 10px auto 14px;
}
.image-wrap img { width: 100%; height: auto; object-fit: cover; display: block; }

.board {
  display: grid;
  gap: 8px;
  margin: 12px 0;
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(36px, 1fr));
  grid-auto-columns: 36px;
  gap: 8px;
}
.tile {
  height: 44px;
  min-width: 36px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-weight: 700;
  color: #0f172a;
  background: #f8fafc;
}
.tile.correct { background: #16a34a; color: white; border-color: #16a34a; }
.tile.present { background: #f59e0b; color: white; border-color: #f59e0b; }
.tile.absent { background: #334155; color: white; border-color: #334155; }

.keyboard { display: grid; gap: 10px; margin-top: 8px; }
.kb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(36px, 1fr));
  gap: 6px;
}
.kb-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(80px, 1fr));
  gap: 8px;
}
.key {
  background: #e2e8f0;
  color: #0f172a;
  border: none;
  padding: 10px 10px;
  border-radius: 6px;
  cursor: pointer;
  min-width: 36px;
  font-weight: 600;
}
.key.action { min-height: 40px; }
.key.correct { background: #16a34a; color: white; }
.key.present { background: #f59e0b; color: white; }
.key.absent { background: #334155; color: white; }

.hints { margin-top: 12px; display: grid; gap: 6px; }
.hint {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 8px 10px;
  border-radius: 6px;
  color: #334155;
  font-size: 0.95rem;
}

.result { margin-top: 14px; }
.ok { color: #16a34a; font-weight: 700; }
.bad { color: #dc2626; font-weight: 700; }

.btn {
  background-color: var(--brand-pink-500);
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-outline {
  background: transparent;
  color: var(--brand-pink-500);
  border: 2px solid var(--brand-pink-500);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.skeleton { background: #e5e7eb; border-radius: 6px; margin: 8px 0; }
.skeleton.title { height: 18px; width: 40%; }
.skeleton.lines { height: 60px; }
.skeleton.image { height: 180px; }
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