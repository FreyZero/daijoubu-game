<template>
  <div>
    <header style="background: #222; color: #fff; padding: 1rem;">
      <nav style="display: flex; gap: 1.5rem;">
        <NuxtLink to="/" style="color: #fff; text-decoration: none;">Home</NuxtLink>
        <!-- <NuxtLink to="/" style="color: #fff; text-decoration: none;">About</NuxtLink> -->
        <NuxtLink to="/game/puzzle" style="color: #fff; text-decoration: none;">Puzzle Game</NuxtLink>
        <NuxtLink to="/game/anime-guess" style="color: #fff; text-decoration: none;">Guess Anime</NuxtLink>
        <NuxtLink to="/game/animedle" style="color: #fff; text-decoration: none;">Animedle</NuxtLink>
        <!-- <NuxtLink to="/" style="color: #fff; text-decoration: none;">Contact</NuxtLink> -->
      </nav>
    </header>
    <main style="padding: 2rem;">
      <slot />
    </main>
  </div>
</template>


