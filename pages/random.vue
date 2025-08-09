<script setup lang="ts">
interface AnimeResponse {
  data: {
    title: string;
    synopsis: string;
    score: number;
    episodes: number;
    images: {
      large_image_url?: string;
      jpg?: { large_image_url?: string };
      webp?: { large_image_url?: string };
    };
  };
}

const response = await useFetch<AnimeResponse>('https://api.jikan.moe/v4/random/anime')
const anime = response.data?.value?.data
</script>

<template>
  <div class="page-wrapper">
    <h1 class="text-3xl font-bold mb-4">{{ anime?.title }}</h1>
    <p class="text-gray-700 mb-4">{{ anime?.synopsis }}</p>
    <p class="text-gray-500 mb-4">Score: {{ anime?.score }}</p>
    <p class="text-gray-500 mb-4">Episodes: {{ anime?.episodes }}</p>
    <div v-if="anime && anime.images">
      <img :src="anime.images.large_image_url || anime.images.jpg?.large_image_url || anime.images.webp?.large_image_url" :alt="anime.title"/>
    </div>
    <div class="whitespace-pre-line">
      {{ JSON.stringify(anime?.images, null, 2)  }}
    </div>
  </div>
</template>
