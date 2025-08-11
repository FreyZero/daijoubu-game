<script setup lang="ts">
interface Game {
  title: string
  to: string
  description: string
  icon: string
  badge?: string
}

const games: Game[] = [
  {
    title: 'Puzzle Game',
    to: '/game/puzzle',
    description: 'Reveal tiles to uncover the image. Great for group play or streams.',
    icon: 'i-heroicons-squares-2x2-solid'
  },
  {
    title: 'Guess the Anime',
    to: '/game/anime-guess',
    description: 'Multiple‑choice round with clues, genres, and synopsis hints.',
    icon: 'i-heroicons-question-mark-circle-solid'
  },
  {
    title: 'Animedle',
    to: '/game/animedle',
    description: 'Wordle‑style guessing for anime titles or characters.',
    icon: 'i-heroicons-command-line-solid',
    badge: 'New'
  }
]
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    <!-- Hero -->
    <div class="mb-10 text-center">
      <h1 class="text-4xl font-bold tracking-tight">Daijoubu Games</h1>
      <p class="mt-3 text-gray-600">Quick anime mini‑games built with Nuxt.</p>
    </div>

    <!-- All Games -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="g in games"
        :key="g.to"
        :to="g.to"
        class="group block focus:outline-none"
        :aria-label="`Play ${g.title}`"
      >
        <UCard class="transition hover:shadow-lg group-focus:shadow-lg">
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon :name="g.icon" class="h-6 w-6 text-primary" />
              <h2 class="text-lg font-semibold">{{ g.title }}</h2>
              <UBadge v-if="g.badge" color="primary" size="xs">{{ g.badge }}</UBadge>
            </div>
          </template>

          <p class="text-default">{{ g.description }}</p>

          <template #footer>
            <div class="flex items-center justify-between">
              <span class="text-primary group-hover:underline"></span>
              <UButton color="primary" icon="i-heroicons-play-solid" class="cursor-pointer">Play</UButton>
            </div>
          </template>
        </UCard>
      </NuxtLink>
    </div>

    <!-- Secondary CTA -->
    <div class="mt-12 flex justify-center">
      <UButton to="/random" variant="soft" icon="i-heroicons-sparkles-solid">Feeling lucky? Random anime</UButton>
    </div>
  </section>
</template>
