<template>
  <div>
    <header class="site-header">
      <nav class="site-nav">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/game/puzzle">Puzzle Game</NuxtLink>
        <NuxtLink to="/game/anime-guess">Guess Anime</NuxtLink>
        <NuxtLink to="/game/animedle">Animedle</NuxtLink>
      </nav>
    </header>
    <main style="padding: 2rem;">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.site-header {
  background: linear-gradient(90deg, var(--brand-purple-400), var(--brand-pink-400));
  color: #fff;
  padding: 1rem;
}
.site-nav { display: flex; gap: 1.5rem; }
.site-nav a { color: #fff; text-decoration: none; font-weight: 600; }
.site-nav a:hover { text-decoration: underline; }
</style>


