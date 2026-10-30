<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api';
import { useAuthStore } from '../stores/auth';
import { useWatchlistStore } from '../stores/watchlist';
import WatchProgress from '../components/WatchProgress.vue';
import type { Anime } from '../types';
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const store = useWatchlistStore();
const item = ref<Anime | null>(null);
const error = ref('');
const loading = ref(true);
const notice = ref('');
const entry = computed(() =>
  store.items.find((entry) => entry.animeId === String(route.params.id))
);
let request = 0;
async function load() {
  const current = ++request;
  loading.value = true;
  error.value = '';
  item.value = null;
  try {
    if (auth.authenticated) await store.load();
    const result = entry.value
      ? { item: { ...entry.value, id: entry.value.animeId } }
      : await api<{ item: Anime }>(`/anime/${encodeURIComponent(String(route.params.id))}`);
    if (current === request) item.value = result.item;
  } catch (cause) {
    if (current === request)
      error.value = cause instanceof Error ? cause.message : 'Could not load anime.';
  } finally {
    if (current === request) loading.value = false;
  }
}
async function add() {
  if (!auth.authenticated) {
    await router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  try {
    if (await store.add({ animeId: String(route.params.id) }))
      notice.value = 'Added to your watchlist.';
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not add anime.';
  }
}
watch(() => route.params.id, load, { immediate: true });
</script>
<template>
  <main class="container explore-page">
    <RouterLink to="/watchlist" class="text-action">← Your watchlist</RouterLink>
    <div v-if="loading" class="detail-skeleton" role="status" aria-label="Loading anime">
      <div class="skeleton-cover" />
      <div>
        <div class="skeleton-line short" />
        <div class="skeleton-line heading" />
        <div class="skeleton-line" />
        <div class="skeleton-line" />
      </div>
    </div>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <p v-if="notice" class="explore-notice" role="status">{{ notice }}</p>
    <template v-if="item"
      ><section class="anime-detail-hero">
        <img
          class="anime-detail-cover"
          :src="item.image"
          :alt="`${item.title} cover`"
          width="390"
          height="550"
        />
        <div class="anime-detail-intro">
          <p class="anime-detail-kicker">Your catalog · {{ item.genre }}</p>
          <h1>{{ item.title }}</h1>
          <p class="anime-synopsis">{{ item.synopsis || 'No synopsis available.' }}</p>
          <div class="anime-detail-actions">
            <button class="btn btn-primary-action" :disabled="store.busy || !!entry" @click="add">
              {{ entry ? 'In your watchlist' : 'Add to watchlist' }}</button
            ><RouterLink :to="{ path: '/discover', query: { q: item.title } }" class="btn btn-glass"
              >Find full anime information</RouterLink
            >
          </div>
        </div>
      </section>
      <section v-if="entry" class="anime-progress-panel">
        <h2>Your progress</h2>
        <WatchProgress :entry="entry" /></section
    ></template>
  </main>
</template>
