<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  PhPlus,
  PhArrowRight,
  PhArrowLeft,
  PhBooks,
  PhSparkle,
  PhArrowClockwise
} from '@phosphor-icons/vue';
import { useAuthStore } from '../stores/auth';
import { useWatchlistStore } from '../stores/watchlist';
import { api } from '../api';
import AnimeShelf from '../components/AnimeShelf.vue';
import AnimeCard from '../components/AnimeCard.vue';
import LibraryCard from '../components/LibraryCard.vue';
import AddAnimeDialog from '../components/AddAnimeDialog.vue';
import type { DiscoveryResult, RemoteAnime } from '../types';
const auth = useAuthStore();
const store = useWatchlistStore();
const addOpen = ref(false);
const notice = ref('');
const picks = ref<RemoteAnime[]>([]);
const picksLoading = ref(true);
const picksError = ref('');
const preview = ref(0);
let noticeTimer: ReturnType<typeof setTimeout>;
const controller = new AbortController();
const firstName = computed(() => auth.user?.name.split(' ')[0] || 'there');
const watching = computed(() => store.items.filter((item) => item.status === 'Watching'));
const later = computed(() => store.items.filter((item) => item.status === 'Plan to Watch'));
const favorites = computed(() => store.items.filter((item) => item.isFavorite));
const featuredList = computed(() => {
  const selected = store.items.find((item) => item.id === store.spotlightId);
  return selected
    ? [selected, ...store.items.filter((item) => item.id !== selected.id)]
    : store.items;
});
const featured = computed(
  () => featuredList.value[preview.value % featuredList.value.length] || null
);
const featuredLink = computed(() =>
  featured.value?.provider === 'KITSU' && featured.value.externalId
    ? `/anime/kitsu/${featured.value.externalId}`
    : `/anime/local/${featured.value?.animeId}`
);
const saved = computed(() => new Set(store.items.map((item) => item.externalId)));
function say(message: string) {
  notice.value = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    notice.value = '';
  }, 4000);
}
function next(direction: number) {
  preview.value =
    (preview.value + direction + featuredList.value.length) % featuredList.value.length;
}
async function loadPicks() {
  picksLoading.value = true;
  picksError.value = '';
  try {
    picks.value = (
      await api<DiscoveryResult>('/discovery?view=popular', { signal: controller.signal })
    ).items.slice(0, 8);
  } catch {
    if (!controller.signal.aborted)
      picksError.value = 'The anime catalog could not load right now.';
  } finally {
    if (!controller.signal.aborted) picksLoading.value = false;
  }
}
async function add(anime: RemoteAnime) {
  try {
    if (await store.importAnime(anime.externalId)) say(`${anime.title} added to your watchlist.`);
  } catch (cause) {
    picksError.value = cause instanceof Error ? cause.message : 'Could not save this anime.';
  }
}
onMounted(() => {
  if (!store.loaded) void store.load();
  void loadPicks();
});
onBeforeUnmount(() => {
  controller.abort();
  clearTimeout(noticeTimer);
});
</script>
<template>
  <main class="workspace-page overview-page">
    <header class="page-heading">
      <div>
        <p class="page-eyebrow">YOUR LIBRARY</p>
        <h1>Your next chapter.</h1>
        <p>Welcome back, {{ firstName }}. A world of stories is waiting.</p>
      </div>
      <button class="btn btn-primary-action" @click="addOpen = true">
        <PhPlus :size="19" />Add anime
      </button>
    </header>
    <p v-if="notice" class="app-feedback success-feedback" role="status">{{ notice }}</p>
    <div
      v-if="store.loading && !store.loaded"
      class="overview-loading"
      role="status"
      aria-label="Loading your overview"
    >
      <div class="feature-skeleton" />
      <div class="skeleton-line" />
      <AnimeShelf title="Your watchlist" loading />
    </div>
    <section v-else-if="store.loadError && !store.loaded" class="page-error" role="alert">
      <PhBooks :size="35" />
      <h2>Your library is taking a moment.</h2>
      <p>We couldn’t load your watchlist. Your saved titles are still yours.</p>
      <button class="btn btn-primary-action" :disabled="store.loading" @click="store.load">
        <PhArrowClockwise :size="18" />{{ store.loading ? 'Retrying…' : 'Try again' }}
      </button>
    </section>
    <template v-else>
      <p v-if="store.loadError" class="app-feedback error-feedback" role="alert">
        Could not refresh your watchlist. <button @click="store.load">Try again</button>
      </p>
      <section
        class="overview-feature"
        :class="{ 'welcome-feature': !featured }"
        aria-label="Featured anime"
      >
        <img
          :src="featured?.image || '/images/editorial/howls-moving-castle.webp'"
          :alt="featured ? `${featured.title} artwork` : 'Howl’s moving castle among the clouds'"
          class="feature-art"
        />
        <div class="feature-shade" />
        <div class="feature-copy">
          <span class="feature-label">{{
            featured ? 'FROM YOUR WATCHLIST' : 'A PLACE FOR EVERY STORY'
          }}</span>
          <h2>{{ featured?.title || 'Make room for your next favorite.' }}</h2>
          <div v-if="featured" class="feature-meta">
            <span>{{ featured.genre }}</span
            ><span>{{ featured.status }}</span
            ><span>★ {{ featured.rating.toFixed(1) }}</span>
          </div>
          <p>
            {{
              featured?.synopsis ||
              (featured
                ? 'One of the stories you’ve made a place for. Pick up where you left off.'
                : 'Discover an anime, save it to your library, and keep your journey in one place.')
            }}
          </p>
          <RouterLink :to="featured ? featuredLink : '/discover'" class="btn btn-feature"
            >{{ featured ? 'Open anime details' : 'Find your first anime'
            }}<PhArrowRight :size="19"
          /></RouterLink>
        </div>
        <div v-if="featuredList.length > 1" class="feature-controls">
          <span
            >{{ (preview % featuredList.length) + 1 }}
            <span>/ {{ featuredList.length }}</span></span
          ><button aria-label="Previous featured anime" @click="next(-1)">
            <PhArrowLeft :size="20" /></button
          ><button aria-label="Next featured anime" @click="next(1)">
            <PhArrowRight :size="20" />
          </button>
        </div>
      </section>
      <div v-if="store.items.length" class="library-summary" aria-label="Your watchlist summary">
        <RouterLink to="/watchlist"
          ><strong>{{ store.items.length }}</strong
          ><span>in your library</span></RouterLink
        ><RouterLink to="/watchlist?status=Watching"
          ><strong>{{ watching.length }}</strong
          ><span>watching</span></RouterLink
        ><RouterLink to="/watchlist?status=Completed"
          ><strong>{{ store.items.filter((item) => item.status === 'Completed').length }}</strong
          ><span>completed</span></RouterLink
        ><RouterLink to="/watchlist?favorites=1"
          ><strong>{{ favorites.length }}</strong
          ><span>favorites</span></RouterLink
        >
      </div>
      <AnimeShelf
        v-if="watching.length"
        title="Pick up where you left off"
        description="Your currently watching titles, with progress close at hand."
        href="/watchlist?status=Watching"
        ><LibraryCard
          v-for="entry in watching.slice(0, 8)"
          :key="entry.id"
          :entry="entry"
          progress
          @notice="say"
      /></AnimeShelf>
      <AnimeShelf
        v-if="later.length"
        title="For your next watch"
        description="The stories you’ve saved for the right moment."
        href="/watchlist?status=Plan%20to%20Watch"
        ><LibraryCard
          v-for="entry in later.slice(0, 8)"
          :key="entry.id"
          :entry="entry"
          @notice="say"
      /></AnimeShelf>
      <AnimeShelf
        v-if="favorites.length && !watching.length && !later.length"
        title="Always worth coming back to"
        description="Your personal favorites."
        href="/watchlist?favorites=1"
        ><LibraryCard
          v-for="entry in favorites.slice(0, 8)"
          :key="entry.id"
          :entry="entry"
          @notice="say"
      /></AnimeShelf>
    </template>
    <RouterLink to="/assistant" class="overview-assistant"
      ><span class="assistant-callout-icon"><PhSparkle :size="25" /></span>
      <div>
        <h2>A story in mind, but no title?</h2>
        <p>Describe what you remember. Let’s find it together.</p>
      </div>
      <span class="assistant-callout-action">Try Anime Assistant <PhArrowRight :size="20" /></span
    ></RouterLink>
    <div v-if="picksError" class="app-feedback error-feedback" role="alert">
      {{ picksError }} <button :disabled="picksLoading" @click="loadPicks">Try again</button>
    </div>
    <AnimeShelf
      v-if="picksLoading || picks.length"
      title="Popular right now"
      description="Find another story to make your own."
      href="/discover"
      :loading="picksLoading"
      ><AnimeCard
        v-for="anime in picks"
        :key="anime.externalId"
        :anime="anime"
        :added="saved.has(anime.externalId)"
        :busy="store.busy"
        @add="add"
    /></AnimeShelf>
    <AddAnimeDialog
      v-model="addOpen"
      @saved="(title) => say(`${title} added to your watchlist.`)"
    />
  </main>
</template>
