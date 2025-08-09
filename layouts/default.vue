<template>
  <div>
    <header class="site-header">
      <img src="/images/daijoubu-game-logo-2.png" alt="Daijoubu Game Logo" style="height: 48px; vertical-align: middle; margin-right: 1.5rem;" />
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
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, var(--brand-pink-300), var(--brand-purple-400));
  color: #fff;
  padding: 1rem;
}
.site-nav { display: flex; gap: 1.5rem; }
.site-nav a { color: #fff; text-decoration: none; font-weight: 600; }
.site-nav a:hover { text-decoration: underline; }
</style>


