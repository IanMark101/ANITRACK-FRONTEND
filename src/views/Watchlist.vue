<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { QDialog, QMenu } from 'quasar';
import {
  PhPlus,
  PhMagnifyingGlass,
  PhBooks,
  PhArrowClockwise,
  PhDotsThree,
  PhX,
  PhHeart
} from '@phosphor-icons/vue';
import { useWatchlistStore } from '../stores/watchlist';
import LibraryCard from '../components/LibraryCard.vue';
import AddAnimeDialog from '../components/AddAnimeDialog.vue';
import type { WatchStatus } from '../types';
const store = useWatchlistStore();
const route = useRoute();
const query = ref('');
const status = ref('All');
const favoritesOnly = ref(false);
const sort = ref('recent');
const addOpen = ref(false);
const resetOpen = ref(false);
const notice = ref('');
const resetError = ref('');
let noticeTimer: ReturnType<typeof setTimeout>;
const filters = ['All', 'Watching', 'Plan to Watch', 'Completed'];
watch(
  () => route.query,
  (value) => {
    status.value =
      typeof value.status === 'string' && filters.includes(value.status) ? value.status : 'All';
    favoritesOnly.value = value.favorites === '1';
  },
  { immediate: true }
);
const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  const list = store.items.filter(
    (item) =>
      (status.value === 'All' || item.status === status.value) &&
      (!favoritesOnly.value || item.isFavorite) &&
      (!needle || `${item.title} ${item.genre}`.toLowerCase().includes(needle))
  );
  if (sort.value === 'rating') list.sort((a, b) => b.rating - a.rating);
  if (sort.value === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
  return list;
});
function count(filter: string) {
  return store.items.filter(
    (item) =>
      (filter === 'All' || item.status === filter) && (!favoritesOnly.value || item.isFavorite)
  ).length;
}
function clear() {
  query.value = '';
  status.value = 'All';
  favoritesOnly.value = false;
  sort.value = 'recent';
}
function say(message: string) {
  notice.value = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    notice.value = '';
  }, 4000);
}
function showAddedTitle(title: string) {
  clear();
  say(`${title} added to your watchlist.`);
}
async function reset() {
  resetError.value = '';
  try {
    await store.reset();
    resetOpen.value = false;
    clear();
    say('Your starter collection is ready.');
  } catch (cause) {
    resetError.value = cause instanceof Error ? cause.message : 'Could not reset the collection.';
  }
}
onMounted(() => {
  if (!store.loaded) void store.load();
});
onBeforeUnmount(() => clearTimeout(noticeTimer));
</script>
<template>
  <main class="workspace-page watchlist-page">
    <header class="page-heading">
      <div>
        <h1>
          My watchlist<span v-if="store.items.length" class="heading-count">{{
            store.items.length
          }}</span>
        </h1>
        <p>Every story you’re watching, saving, and coming back to.</p>
      </div>
      <div v-if="store.items.length" class="page-heading-actions">
        <button class="btn btn-primary-action page-add-action" aria-label="Add anime" @click="addOpen = true">
          <PhPlus :size="19" /><span>Add anime</span></button>
      </div>
    </header>
    <p v-if="notice" class="app-feedback success-feedback" role="status">{{ notice }}</p>
    <div
      v-if="store.loading && !store.loaded && !store.items.length"
      class="library-grid"
      role="status"
      aria-label="Loading your watchlist"
    >
      <div v-for="n in 8" :key="n" class="poster-skeleton" aria-hidden="true">
        <div class="skeleton-cover" />
        <div class="skeleton-line" />
        <div class="skeleton-line short" />
      </div>
    </div>
    <section v-else-if="store.loadError && !store.loaded && !store.items.length" class="page-error" role="alert">
      <PhBooks :size="38" />
      <h2>We couldn’t load your watchlist.</h2>
      <p>Your collection hasn’t changed. Let’s try connecting again.</p>
      <button class="btn btn-primary-action" :disabled="store.loading" @click="store.load">
        <PhArrowClockwise :size="18" />{{ store.loading ? 'Retrying…' : 'Try again' }}
      </button>
    </section>
    <section v-else-if="!store.items.length" class="first-library">
      <div class="first-library-art">
        <img src="/images/editorial/kikis-delivery-service.webp" alt="Kiki with her cat Jiji" />
      </div>
      <div>
        <h2>Your stories start here.</h2>
        <p>
          Save an anime you love or one you’ve been meaning to watch. We’ll help you keep track of
          the rest.
        </p>
        <button class="btn btn-primary-action" @click="addOpen = true">
          <PhPlus :size="19" />Add your first anime</button
        ><RouterLink to="/discover" class="text-button">Explore the catalog</RouterLink>
      </div>
    </section>
    <template v-else>
      <p v-if="store.loadError" class="app-feedback error-feedback" role="alert">
        Could not refresh your collection. <button @click="store.load">Try again</button>
      </p>
      <div class="watchlist-toolbar">
        <div class="watchlist-tabs" role="group" aria-label="Filter by watch status">
          <button
            v-for="filter in filters"
            :key="filter"
            :aria-pressed="status === filter"
            :class="{ active: status === filter }"
            @click="status = filter"
          >
            {{ filter }}<span>{{ count(filter) }}</span>
          </button>
        </div>
        <div class="watchlist-tools">
          <div class="watchlist-search-row">
          <label class="library-search"
            ><PhMagnifyingGlass :size="20" /><input
              v-model="query"
              placeholder="Search your watchlist…"
              aria-label="Search your watchlist" /></label>
            <button class="icon-button" aria-label="Collection options">
              <PhDotsThree :size="24" /><QMenu class="library-menu" auto-close>
                <button :disabled="store.loading" @click="store.load">Refresh watchlist</button>
                <button :disabled="store.busy || store.loading" @click="resetOpen = true; resetError = ''">Reset to starter collection</button>
              </QMenu>
            </button>
          </div>
          <button
            class="favorites-filter"
            :class="{ active: favoritesOnly }"
            :aria-pressed="favoritesOnly"
            aria-label="Show favorites only"
            @click="favoritesOnly = !favoritesOnly"
          >
            <PhHeart :size="20" :weight="favoritesOnly ? 'fill' : 'regular'" /><span
              >Favorites</span
            ></button
          ><select v-model="sort" aria-label="Sort watchlist">
            <option value="recent">Recently added</option>
            <option value="rating">Highest rated</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </div>
      <p class="library-result-count" role="status">
        {{ filtered.length }} {{ filtered.length === 1 ? 'title' : 'titles'
        }}<span v-if="store.loading"> · Refreshing…</span>
      </p>
      <div v-if="filtered.length" class="library-grid">
        <LibraryCard
          v-for="entry in filtered"
          :key="entry.id"
          :entry="entry"
          :progress="entry.status === ('Watching' as WatchStatus)"
          @notice="say"
        />
      </div>
      <section v-else class="no-results">
        <PhMagnifyingGlass :size="32" />
        <h2>No titles match those filters.</h2>
        <p>Try another title, genre, or watch status.</p>
        <button class="btn btn-glass" @click="clear">Clear filters</button>
      </section>
    </template>
    <AddAnimeDialog
      v-model="addOpen"
      @saved="showAddedTitle"
    />
    <QDialog v-model="resetOpen" :persistent="store.busy"
      ><section class="app-dialog small-dialog" aria-labelledby="reset-heading">
        <header>
          <h2 id="reset-heading">Start with the starter collection?</h2>
          <button
            class="icon-button"
            aria-label="Cancel reset"
            :disabled="store.busy"
            @click="resetOpen = false"
          >
            <PhX :size="22" />
          </button>
        </header>
        <p>
          This replaces your watchlist with the ten starter titles. Your current ratings, favorites,
          and episode progress will be removed.
        </p>
        <p v-if="resetError" class="inline-error" role="alert">{{ resetError }}</p>
        <footer>
          <button class="btn btn-glass" :disabled="store.busy" @click="resetOpen = false">
            Keep my collection</button
          ><button class="btn btn-primary-action" :disabled="store.busy" @click="reset">
            {{ store.busy ? 'Resetting…' : 'Reset collection' }}
          </button>
        </footer>
      </section></QDialog
    >
  </main>
</template>
