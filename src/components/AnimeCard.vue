<script setup lang="ts">
import { PhPlus, PhCheck, PhArrowUpRight, PhStar } from '@phosphor-icons/vue';
import type { RemoteAnime } from '../types';
defineProps<{ anime: RemoteAnime; added?: boolean; busy?: boolean }>();
defineEmits<{ add: [anime: RemoteAnime] }>();
function fallback(event: Event) {
  const image = event.target as HTMLImageElement;
  image.onerror = null;
  image.src = '/images/editorial/next-chapter-landscape.webp';
}
</script>

<template>
  <article class="explore-card">
    <RouterLink :to="`/anime/kitsu/${anime.externalId}`" class="explore-poster">
      <img
        :src="anime.image"
        :alt="`${anime.title} cover`"
        loading="lazy"
        width="390"
        height="550"
        @error="fallback"
      />
      <span class="explore-card-open"><PhArrowUpRight :size="22" /></span>
    </RouterLink>
    <div class="explore-card-meta">
      <span>{{ anime.format || 'Anime' }}{{ anime.year ? ` · ${anime.year}` : '' }}</span
      ><span v-if="anime.communityScore" :aria-label="`Community score ${anime.communityScore.toFixed(1)} out of 10`"><PhStar :size="12" weight="fill" aria-hidden="true" /> {{ anime.communityScore.toFixed(1) }}</span>
    </div>
    <small v-if="anime.relation" class="explore-relation">{{ anime.relation }}</small>
    <h3>
      <RouterLink :to="`/anime/kitsu/${anime.externalId}`">{{ anime.title }}</RouterLink>
    </h3>
    <p>
      {{
        anime.totalEpisodes
          ? `${anime.totalEpisodes} ${anime.totalEpisodes === 1 ? 'episode' : 'episodes'}`
          : 'Episode total TBA'
      }}<span v-if="anime.genres.length"> · {{ anime.genres[0] }}</span>
    </p>
    <slot />
    <button
      class="btn btn-glass explore-add"
      :disabled="busy || added"
      @click="$emit('add', anime)"
    >
      <component :is="added ? PhCheck : PhPlus" :size="17" />{{
        added ? 'In your watchlist' : 'Add to watchlist'
      }}
    </button>
  </article>
</template>
