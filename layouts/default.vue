<template>
  <div>
    <header class="site-header" role="banner">
      <div class="header-inner">
        <NuxtLink to="/" class="brand" aria-label="Daijoubu Home">
          <NuxtImg src="/images/daijoubu-game-logo-2.png" alt="Daijoubu Game" class="brand-logo" width="112"
            height="40" />
        </NuxtLink>

        <button class="menu-btn" :aria-expanded="menuOpen ? 'true' : 'false'" aria-controls="primary-nav"
          aria-label="Toggle navigation" @click="menuOpen = !menuOpen">
          <span class="menu-icon" />
        </button>

        <nav id="primary-nav" class="site-nav" :class="{ open: menuOpen }" role="navigation" aria-label="Primary">
          <NuxtLink to="/" @click="closeMenu">Home</NuxtLink>
          <NuxtLink to="/game/puzzle" @click="closeMenu">Puzzle Game</NuxtLink>
          <NuxtLink to="/game/anime-guess" @click="closeMenu">Guess Anime</NuxtLink>
          <NuxtLink to="/game/animedle" @click="closeMenu">Animedle</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <slot />
    </main>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
const menuOpen = ref(false)
function closeMenu() { menuOpen.value = false }
function onResize() {
  // Close menu if switching to desktop width
  if (window.innerWidth >= 768 && menuOpen.value) menuOpen.value = false
}
onMounted(() => {
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: linear-gradient(90deg, var(--brand-pink-200), var(--brand-purple-400));
  color: #fff;
  /* account for safe areas on iOS */
  padding: max(0.5rem, env(safe-area-inset-top)) var(--page-x);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 auto;
  max-width: 1200px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: #fff;
  text-decoration: none;
  font-weight: 800;
}

.brand-logo {
  height: 40px;
  width: auto;
  display: block;
}

.brand-text {
  letter-spacing: 0.3px;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

.menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  background: transparent;
  color: #fff;
  cursor: pointer;
}

.menu-icon {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 2px;
  background: currentColor;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: currentColor;
}

.menu-icon::before {
  top: -6px;
}

.menu-icon::after {
  top: 6px;
}

.site-nav {
  display: flex;
  gap: 1rem;
}

.site-nav a {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 0.25rem;
  border-radius: 8px;
}

.site-nav a:hover,
.site-nav a:focus-visible {
  text-decoration: underline;
  outline: none;
}

/* Mobile layout */
@media (max-width: 767px) {
  .menu-btn {
    display: inline-flex;
  }

  .site-nav {
    position: absolute;
    inset: auto var(--page-x) auto var(--page-x);
    top: calc(100% + 8px);
    display: none;
    flex-direction: column;
    gap: 0.25rem;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 12px;
    backdrop-filter: blur(8px);
    padding: 0.5rem;
  }

  .site-nav.open {
    display: flex;
  }

  .site-nav a {
    padding: 0.5rem 0.75rem;
  }
}

.main-content {
  padding: var(--page-y) var(--page-x);
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
}
</style>
