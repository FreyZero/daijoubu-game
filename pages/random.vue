<script setup lang="ts">
type ImageVariant = { large_image_url?: string; image_url?: string }

interface Anime {
  mal_id: number
  url?: string
  title: string
  synopsis?: string
  score?: number
  episodes?: number
  type?: string
  images?: {
    large_image_url?: string
    jpg?: ImageVariant
    webp?: ImageVariant
  }
}

interface AnimeResponse { data: Anime }

const { data, pending, error, refresh } = await useFetch<AnimeResponse>(
  () => 'https://api.jikan.moe/v4/random/anime',
  { key: 'random-anime' }
)

const anime = computed(() => data.value?.data)
const imageUrl = computed(() => {
  const img = anime.value?.images
  return (
    img?.large_image_url ||
    img?.webp?.large_image_url ||
    img?.jpg?.large_image_url ||
    img?.webp?.image_url ||
    img?.jpg?.image_url ||
    ''
  )
})

const synopsisOpen = ref(false)
const synopsisText = computed(() => anime.value?.synopsis || 'No synopsis available for this title.')
const synopsisShort = computed(() => {
  const txt = synopsisText.value
  if (!txt) return ''
  return txt.length > 260 && !synopsisOpen.value ? txt.slice(0, 260) + '…' : txt
})

function reload() {
  synopsisOpen.value = false
  refresh()
}

useHead({ title: 'Random Anime • Daijoubu' })
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6 flex items-center justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Feeling lucky?</h1>
        <p class="mt-1 text-gray-600">Discover a random anime with one click.</p>
      </div>
      <UButton color="primary" icon="i-heroicons-sparkles-solid" @click="reload">Another one</UButton>
    </div>

    <!-- Error state -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      title="Could not load a random anime"
      :description="(error as any)?.message || 'Please try again.'"
      class="mb-6"
    >
      <template #actions>
        <UButton color="error" variant="soft" icon="i-heroicons-arrow-path" @click="reload">Retry</UButton>
      </template>
    </UAlert>

    <!-- Loading skeleton -->
    <UCard v-if="pending" class="overflow-hidden">
      <div class="grid gap-6 md:grid-cols-2">
        <div>
          <USkeleton class="h-64 w-full rounded-lg md:h-full" />
        </div>
        <div class="space-y-3">
          <USkeleton class="h-7 w-3/4" />
          <div class="flex gap-2">
            <USkeleton class="h-6 w-20" />
            <USkeleton class="h-6 w-24" />
            <USkeleton class="h-6 w-16" />
          </div>
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-11/12" />
          <USkeleton class="h-4 w-5/6" />
        </div>
      </div>
    </UCard>

    <!-- Content -->
    <UCard v-else-if="anime" class="overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">{{ anime.title }}</h2>
          <div class="flex items-center gap-2">
            <UBadge v-if="anime.type" color="primary" variant="soft">{{ anime.type }}</UBadge>
            <UBadge v-if="anime.episodes != null" color="neutral" variant="soft">Ep {{ anime.episodes }}</UBadge>
            <UBadge v-if="anime.score != null" color="warning" variant="soft">
              <UIcon name="i-heroicons-star-solid" class="mr-1 h-4 w-4 text-amber-500" />
              {{ anime.score }}
            </UBadge>
          </div>
        </div>
      </template>

      <div class="grid gap-6 md:grid-cols-2">
        <div>
          <div class="overflow-hidden rounded-lg border border-gray-200/60 bg-white">
            <img
              v-if="imageUrl"
              :src="imageUrl"
              :alt="anime.title"
              class="h-full w-full object-cover"
              loading="lazy"
            >
            <div v-else class="flex h-64 items-center justify-center text-gray-400">No image</div>
          </div>
        </div>
        <div>
          <p class="text-gray-700">
            {{ synopsisShort }}
            <button
              v-if="synopsisText && synopsisText.length > 260"
              class="ml-2 text-primary underline hover:no-underline"
              @click="synopsisOpen = !synopsisOpen"
            >
              {{ synopsisOpen ? 'Show less' : 'Read more' }}
            </button>
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-sm text-gray-500">Random pick from Jikan API</div>
          <div class="flex gap-2">
            <UButton color="primary" icon="i-heroicons-arrow-path" @click="reload">Another one</UButton>
            <UButton
              v-if="anime.url"
              color="neutral"
              variant="soft"
              icon="i-heroicons-arrow-top-right-on-square"
              :to="anime.url"
              target="_blank"
            >
              Open on MyAnimeList
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </section>
</template>
