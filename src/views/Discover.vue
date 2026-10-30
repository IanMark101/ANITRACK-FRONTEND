<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PhMagnifyingGlass, PhArrowLeft, PhArrowRight } from '@phosphor-icons/vue';
import AnimeCard from '../components/AnimeCard.vue';
import { api } from '../api';
import { useAuthStore } from '../stores/auth';
import { useWatchlistStore } from '../stores/watchlist';
import type { DiscoveryResult, RemoteAnime } from '../types';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const watchlist = useWatchlistStore();
const q = ref(typeof route.query.q === 'string' ? route.query.q : '');
const view = ref('popular');
const genre = ref('');
const year = ref(new Date().getFullYear());
const season = ref(
  ['winter', 'spring', 'summer', 'fall'][Math.floor(new Date().getMonth() / 3)] ?? 'winter'
);
const page = ref(1);
const result = ref<DiscoveryResult>({
  items: [],
  page: 1,
  hasNext: false,
  total: null,
  source: 'Kitsu'
});
const loading = ref(true);
const error = ref('');
const actionError = ref('');
const notice = ref('');
const tabs = [
  { id: 'popular', label: 'Popular' },
  { id: 'top', label: 'Top rated' },
  { id: 'seasonal', label: 'This season' },
  { id: 'upcoming', label: 'Upcoming' }
];
const genres = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural'
];
const years = Array.from(
  { length: new Date().getFullYear() - 1980 + 2 },
  (_, index) => new Date().getFullYear() + 1 - index
);
const added = computed(
  () =>
    new Set(
      watchlist.items.filter((item) => item.provider === 'KITSU').map((item) => item.externalId)
    )
);
let timer: ReturnType<typeof setTimeout>;
let controller: AbortController | null = null;
let request = 0;
async function load() {
  clearTimeout(timer);
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal;
  const current = ++request;
  loading.value = true;
  error.value = '';
  const params = new URLSearchParams({
    q: q.value.trim(),
    view: view.value,
    genre: genre.value,
    page: String(page.value),
    year: String(year.value),
    season: season.value
  });
  try {
    const response = await api<DiscoveryResult>(`/discovery?${params}`, { signal });
    if (current === request) result.value = response;
  } catch (cause) {
    if (!signal.aborted && current === request)
      error.value = cause instanceof Error ? cause.message : 'Could not load anime.';
  } finally {
    if (current === request && !signal.aborted) loading.value = false;
  }
}
watch([q, view, genre, year, season], () => {
  page.value = 1;
});
watch(
  [q, view, genre, year, season, page],
  () => {
    controller?.abort();
    loading.value = true;
    clearTimeout(timer);
    timer = setTimeout(load, q.value.trim() ? 400 : 0);
  },
  { immediate: true }
);
watch(
  () => route.query.q,
  (value) => {
    q.value = typeof value === 'string' ? value : '';
  }
);
async function add(anime: RemoteAnime) {
  if (!auth.authenticated) {
    await router.push({ path: '/login', query: { redirect: `/anime/kitsu/${anime.externalId}` } });
    return;
  }
  actionError.value = '';
  notice.value = '';
  try {
    if (await watchlist.importAnime(anime.externalId))
      notice.value = `${anime.title} is in your watchlist.`;
  } catch (cause) {
    actionError.value = cause instanceof Error ? cause.message : 'Could not add anime.';
  }
}
function chooseView(value: string) {
  q.value = '';
  view.value = value;
}
onMounted(() => {
  if (auth.authenticated) void watchlist.load();
});
onBeforeUnmount(() => {
  clearTimeout(timer);
  controller?.abort();
  request++;
});
</script>

<template>
  <main class="container explore-page">
    <div class="explore-heading">
      <div>
        <p class="explore-eyebrow">THE ANIME CATALOG</p>
        <h1>Discover your next anime.</h1>
        <p>Search the anime library, find a new favorite, and make it part of your collection.</p>
      </div>
      <RouterLink v-if="auth.authenticated" to="/watchlist" class="text-action"
        >Your watchlist <PhArrowRight :size="18"
      /></RouterLink>
    </div>
    <RouterLink to="/assistant" class="discover-assistant-link"
      ><div>
        <strong>Have a story in mind, but not a title?</strong
        ><span>Describe what you remember or what you enjoy. Try Anime Assistant.</span>
      </div>
      <PhArrowRight :size="24"
    /></RouterLink>
    <form class="explore-search" role="search" @submit.prevent="load">
      <PhMagnifyingGlass :size="22" /><input
        v-model="q"
        type="search"
        aria-label="Search the anime library"
        placeholder="Search anime, English or Japanese title…"
        maxlength="100"
      /><button class="btn btn-primary-action" type="submit">Search</button>
    </form>
    <div class="explore-toolbar">
      <div class="explore-tabs" aria-label="Browse anime">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="{ active: view === tab.id && !q.trim() }"
          :aria-pressed="view === tab.id && !q.trim()"
          @click="chooseView(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
      <label class="explore-filter"
        >Genre<select v-model="genre">
          <option value="">All genres</option>
          <option v-for="item in genres" :key="item">{{ item }}</option>
        </select></label
      >
    </div>
    <div v-if="view === 'seasonal' && !q.trim()" class="explore-season">
      <label
        >Season<select v-model="season">
          <option value="winter">Winter</option>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
          <option value="fall">Fall</option>
        </select></label
      ><label
        >Year<select v-model="year">
          <option v-for="value in years" :key="value" :value="value">{{ value }}</option>
        </select></label
      >
    </div>
    <p v-if="notice" class="explore-notice" role="status">
      {{ notice }} <RouterLink to="/watchlist">Open watchlist</RouterLink>
    </p>
    <p v-if="actionError" class="form-error" role="alert">{{ actionError }}</p>
    <div v-if="loading" class="explore-grid" aria-label="Loading anime" role="status">
      <div v-for="n in 8" :key="n" class="explore-skeleton"></div>
    </div>
    <section v-else-if="error" class="explore-state" role="alert">
      <h2>Discovery is taking a break.</h2>
      <p>{{ error }}</p>
      <div>
        <button class="btn btn-primary-action" @click="load">Try again</button
        ><RouterLink to="/watchlist" class="btn btn-glass">Open saved collection</RouterLink>
      </div>
    </section>
    <template v-else
      ><p class="explore-result-count">
        {{ q.trim() ? `Results for “${q.trim()}”` : tabs.find((tab) => tab.id === view)?.label
        }}<span v-if="result.total !== null"> · {{ result.total.toLocaleString() }} titles</span>
      </p>
      <div v-if="result.items.length" class="explore-grid">
        <AnimeCard
          v-for="anime in result.items"
          :key="anime.externalId"
          :anime="anime"
          :added="added.has(anime.externalId)"
          :busy="watchlist.busy"
          @add="add"
        />
      </div>
      <div v-else class="explore-state">
        <h2>No titles found.</h2>
        <p>Try another title, change the genre, or browse a different season.</p>
      </div>
      <nav
        v-if="result.items.length || page > 1"
        class="explore-pagination"
        aria-label="Anime result pages"
      >
        <button class="btn btn-glass" :disabled="page === 1" @click="page--">
          <PhArrowLeft :size="17" /> Previous</button
        ><span>Page {{ page }}</span
        ><button class="btn btn-glass" :disabled="!result.hasNext" @click="page++">
          Next <PhArrowRight :size="17" />
        </button></nav
    ></template>
    <p class="explore-attribution">
      Anime information from
      <a href="https://kitsu.app" target="_blank" rel="noopener noreferrer">Kitsu</a>. Stars show
      community scores; your personal ratings stay in your watchlist.
    </p>
  </main>
</template>
