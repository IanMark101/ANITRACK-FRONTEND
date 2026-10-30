<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PhArrowLeft, PhArrowUpRight, PhPlay, PhPlus, PhCheck } from '@phosphor-icons/vue';
import { api } from '../api';
import { useAuthStore } from '../stores/auth';
import { useWatchlistStore } from '../stores/watchlist';
import AnimeCard from '../components/AnimeCard.vue';
import WatchProgress from '../components/WatchProgress.vue';
import type { RemoteAnime, EpisodePage } from '../types';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const store = useWatchlistStore();
const item = ref<RemoteAnime | null>(null);
const loading = ref(true);
const error = ref('');
const actionError = ref('');
const notice = ref('');
const active = ref('overview');
const extraLoading = ref(false);
const extraError = ref('');
const episodes = ref<EpisodePage | null>(null);
const related = ref<RemoteAnime[]>([]);
const explanation = ref('');
const episodePage = ref(1);
const playTrailer = ref(false);
const entry = computed(() =>
  store.items.find(
    (entry) => entry.provider === 'KITSU' && entry.externalId === item.value?.externalId
  )
);
const added = computed(
  () =>
    new Set(
      store.items.filter((entry) => entry.provider === 'KITSU').map((entry) => entry.externalId)
    )
);
const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'episodes', label: 'Episodes' },
  { id: 'related', label: 'Related titles' },
  { id: 'similar', label: 'Similar anime' }
];
let controller: AbortController | null = null;
let request = 0;
let extraRequest = 0;
const dateLabel = (date: string | null) =>
  date
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(
        new Date(date + 'T12:00:00Z')
      )
    : 'Not announced';
async function load() {
  controller?.abort();
  controller = new AbortController();
  const current = ++request;
  extraRequest++;
  loading.value = true;
  error.value = '';
  item.value = null;
  active.value = 'overview';
  episodes.value = null;
  related.value = [];
  episodePage.value = 1;
  playTrailer.value = false;
  notice.value = '';
  actionError.value = '';
  try {
    const result = await api<{ item: RemoteAnime; stale: boolean; notice?: string }>(
      `/discovery/${encodeURIComponent(String(route.params.id))}`,
      { signal: controller.signal }
    );
    if (current !== request) return;
    item.value = result.item;
    notice.value = result.notice || '';
  } catch (cause) {
    if (current === request && !controller.signal.aborted)
      error.value = cause instanceof Error ? cause.message : 'Could not load anime.';
  } finally {
    if (current === request) loading.value = false;
  }
}
async function loadExtra() {
  const current = ++extraRequest;
  const anime = item.value;
  if (!anime || active.value === 'overview') return;
  extraLoading.value = true;
  extraError.value = '';
  related.value = [];
  const tab = active.value;
  try {
    if (tab === 'episodes') {
      const result = await api<EpisodePage>(
        `/discovery/${anime.externalId}/episodes?page=${episodePage.value}`
      );
      if (current === extraRequest) episodes.value = result;
    } else {
      const result = await api<{ items: RemoteAnime[]; explanation?: string }>(
        `/discovery/${anime.externalId}/${tab}`
      );
      if (current === extraRequest) {
        related.value = result.items;
        explanation.value = result.explanation || '';
      }
    }
  } catch (cause) {
    if (current === extraRequest)
      extraError.value = cause instanceof Error ? cause.message : 'Could not load this section.';
  } finally {
    if (current === extraRequest) extraLoading.value = false;
  }
}
async function add(anime: RemoteAnime) {
  if (!auth.authenticated) {
    await router.push({ path: '/login', query: { redirect: `/anime/kitsu/${anime.externalId}` } });
    return;
  }
  actionError.value = '';
  try {
    if (await store.importAnime(anime.externalId))
      notice.value = `${anime.title} is in your watchlist.`;
  } catch (cause) {
    actionError.value = cause instanceof Error ? cause.message : 'Could not save anime.';
  }
}
watch(() => route.params.id, load, { immediate: true });
watch([active, episodePage], loadExtra);
onMounted(() => {
  if (auth.authenticated) void store.load();
});
onBeforeUnmount(() => {
  controller?.abort();
  request++;
  extraRequest++;
});
</script>

<template>
  <main class="container explore-page anime-detail-page">
    <RouterLink to="/discover" class="text-action"
      ><PhArrowLeft :size="17" /> Back to discovery</RouterLink
    >
    <div v-if="loading" class="detail-skeleton" role="status" aria-label="Loading anime details">
      <div class="skeleton-cover" />
      <div>
        <div class="skeleton-line short" />
        <div class="skeleton-line heading" />
        <div class="skeleton-line" />
        <div class="skeleton-line" />
        <div class="skeleton-line short" />
      </div>
    </div>
    <div v-else-if="error" class="explore-state" role="alert">
      <h1>Could not load this story.</h1>
      <p>{{ error }}</p>
      <button class="btn btn-primary-action" @click="load">Try again</button>
    </div>
    <template v-else-if="item">
      <p v-if="notice" class="explore-notice" role="status">{{ notice }}</p>
      <p v-if="actionError" class="form-error" role="alert">{{ actionError }}</p>
      <section class="anime-detail-hero">
        <img
          class="anime-detail-cover"
          :src="item.image"
          :alt="`${item.title} cover`"
          width="390"
          height="550"
        />
        <div class="anime-detail-intro">
          <div class="anime-detail-kicker">
            {{ item.format || 'Anime' }} <span v-if="item.year">· {{ item.year }}</span> ·
            {{ item.airingStatus.replaceAll('_', ' ') }}
          </div>
          <h1>{{ item.title }}</h1>
          <p v-if="item.alternativeTitles.length" class="anime-alternative">
            {{ item.alternativeTitles.slice(0, 3).join(' · ') }}
          </p>
          <div class="anime-genre-list">
            <span v-for="genre in item.genres.slice(0, 8)" :key="genre">{{ genre }}</span>
          </div>
          <div class="anime-detail-actions">
            <button
              class="btn btn-primary-action"
              :disabled="store.busy || !!entry"
              @click="add(item)"
            >
              <component :is="entry ? PhCheck : PhPlus" :size="18" />{{
                entry ? 'In your watchlist' : 'Add to watchlist'
              }}</button
            ><RouterLink v-if="entry" to="/watchlist" class="btn btn-glass"
              >Open collection</RouterLink
            ><a :href="item.sourceUrl" target="_blank" rel="noopener noreferrer" class="text-action"
              >View on Kitsu <PhArrowUpRight :size="16"
            /></a>
          </div>
          <dl class="anime-facts">
            <div>
              <dt>Community score</dt>
              <dd>
                {{ item.communityScore ? `${item.communityScore.toFixed(1)} / 10` : 'Not rated' }}
              </dd>
            </div>
            <div>
              <dt>Episodes</dt>
              <dd>{{ item.totalEpisodes || 'TBA' }}</dd>
            </div>
            <div>
              <dt>Episode length</dt>
              <dd>{{ item.episodeLength ? `${item.episodeLength} min` : 'Unknown' }}</dd>
            </div>
            <div>
              <dt>First aired</dt>
              <dd>{{ dateLabel(item.startDate) }}</dd>
            </div>
            <div v-if="item.endDate">
              <dt>Last aired</dt>
              <dd>{{ dateLabel(item.endDate) }}</dd>
            </div>
            <div v-if="item.studios.length">
              <dt>Studios</dt>
              <dd>{{ item.studios.join(', ') }}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section v-if="entry" class="anime-progress-panel">
        <h2>Your progress</h2>
        <WatchProgress :entry="entry" />
      </section>
      <nav class="explore-tabs detail-tabs" aria-label="Anime information">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="{ active: active === tab.id }"
          :aria-pressed="active === tab.id"
          @click="active = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>
      <section v-if="active === 'overview'" class="anime-overview">
        <h2>The story</h2>
        <p class="anime-synopsis">{{ item.synopsis || 'A synopsis has not been provided yet.' }}</p>
        <div v-if="item.trailerId" class="anime-trailer">
          <h2>Trailer</h2>
          <button v-if="!playTrailer" class="btn btn-glass" @click="playTrailer = true">
            <PhPlay :size="18" /> Play trailer</button
          ><iframe
            v-else
            :src="`https://www.youtube-nocookie.com/embed/${item.trailerId}`"
            :title="`${item.title} trailer`"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <p v-else class="explore-muted">No trailer is available for this title.</p>
      </section>
      <div v-else-if="extraLoading" class="explore-state" role="status">
        Loading {{ active === 'episodes' ? 'episodes' : 'anime' }}…
      </div>
      <div v-else-if="extraError" class="explore-state" role="alert">
        <p>{{ extraError }}</p>
        <button class="btn btn-glass" @click="loadExtra">Try again</button>
      </div>
      <section v-else-if="active === 'episodes'" class="anime-episodes">
        <p class="explore-muted">
          Episode titles and air dates are shown when available. Expand an episode to read its
          synopsis.
        </p>
        <p v-if="!episodes?.items.length" class="explore-state">
          Episode information has not been provided for this title.
        </p>
        <details v-for="episode in episodes?.items" :key="episode.id">
          <summary>
            <span class="episode-number">{{ episode.number }}</span
            ><strong>{{ episode.title }}</strong
            ><span>{{ episode.airDate ? dateLabel(episode.airDate) : 'Date unknown' }}</span>
          </summary>
          <p>{{ episode.synopsis || 'No episode synopsis available.' }}</p>
        </details>
        <nav
          v-if="episodes && (episodes.hasNext || episodePage > 1)"
          class="explore-pagination"
          aria-label="Episode pages"
        >
          <button class="btn btn-glass" :disabled="episodePage === 1" @click="episodePage--">
            Previous</button
          ><span>Page {{ episodePage }}</span
          ><button class="btn btn-glass" :disabled="!episodes.hasNext" @click="episodePage++">
            Next
          </button>
        </nav>
      </section>
      <section v-else>
        <p v-if="active === 'similar'" class="explore-muted">{{ explanation }}</p>
        <div v-if="related.length" class="explore-grid">
          <AnimeCard
            v-for="anime in related"
            :key="anime.externalId"
            :anime="anime"
            :added="added.has(anime.externalId)"
            :busy="store.busy"
            @add="add"
          />
        </div>
        <p v-else class="explore-state">
          {{
            active === 'related'
              ? 'No related anime have been listed for this title.'
              : 'No similar titles are available yet.'
          }}
        </p>
      </section>
      <p class="explore-attribution">
        Anime information from Kitsu. Community scores are separate from your personal rating.
      </p>
    </template>
  </main>
</template>
