<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QDialog } from 'quasar';
import { PhPlus, PhArrowLeft, PhArrowUp, PhArrowDown, PhX, PhMagnifyingGlass, PhLockSimple, PhPencilSimple, PhTrash } from '@phosphor-icons/vue';
import { api, jsonBody } from '../api';
import { useAuthStore } from '../stores/auth';
import { useWatchlistStore } from '../stores/watchlist';
import type { AnimeCollection, CollectionDetail } from '../types';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const watchlist = useWatchlistStore();
const collections = ref<AnimeCollection[]>([]);
const detail = ref<CollectionDetail | null>(null);
const loading = ref(true);
const busy = ref(false);
const error = ref('');
const notice = ref('');
const page = ref(1);
const hasNext = ref(false);
const query = ref('');
const editorOpen = ref(false);
const editing = ref(false);
const name = ref('');
const description = ref('');
const addOpen = ref(false);
const removeOpen = ref(false);
const selected = ref<string[]>([]);
const titleQuery = ref('');
const id = computed(() => typeof route.params.id === 'string' ? route.params.id : '');
const filtered = computed(() => collections.value.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query.value.trim().toLowerCase())));
const available = computed(() => {
  const existing = new Set(detail.value?.items.map((item) => item.id));
  const search = titleQuery.value.trim().toLowerCase();
  return watchlist.items.filter((item) => !existing.has(item.id) && (!search || item.title.toLowerCase().includes(search)));
});
let ticket = 0;
let scope = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;
async function load(append = false) {
  const current = ++ticket;
  loading.value = true; error.value = '';
  try {
    if (id.value) {
      const result = await api<{ item: CollectionDetail }>(`/collections/${id.value}`);
      if (current === ticket) detail.value = result.item;
    } else {
      const result = await api<{ items: AnimeCollection[]; hasNext: boolean }>(`/collections?page=${append ? page.value + 1 : 1}&q=${encodeURIComponent(query.value.trim())}`);
      if (current === ticket) {
        collections.value = append ? [...collections.value, ...result.items] : result.items;
        page.value = append ? page.value + 1 : 1;
        hasNext.value = result.hasNext;
      }
    }
  } catch (cause) { if (current === ticket) error.value = cause instanceof Error ? cause.message : 'Could not load your collections.'; }
  finally { if (current === ticket) loading.value = false; }
}
watch([id, () => auth.user?.id], () => {
  scope++; ticket++; detail.value = null; collections.value = []; notice.value = '';
  editorOpen.value = addOpen.value = removeOpen.value = false;
  busy.value = false; query.value = ''; void load();
}, { immediate: true, flush: 'sync' });
watch(query, () => { clearTimeout(searchTimer); if (!id.value) searchTimer = setTimeout(() => { void load(); }, 250); });
onBeforeUnmount(() => { clearTimeout(searchTimer); scope++; ticket++; });
function edit(existing = false) {
  editing.value = existing;
  name.value = existing ? detail.value!.name : '';
  description.value = existing ? detail.value!.description : '';
  error.value = ''; editorOpen.value = true;
}
async function perform(action: (current: () => boolean) => Promise<void>) {
  if (busy.value) return;
  const current = scope;
  busy.value = true; error.value = ''; notice.value = '';
  try { await action(() => current === scope); }
  catch (cause) { if (current === scope) error.value = cause instanceof Error ? cause.message : 'Could not save your change.'; }
  finally { if (current === scope) busy.value = false; }
}
const save = () => perform(async (current) => {
  const result = await api<{ item: { id: string } }>(editing.value ? `/collections/${id.value}` : '/collections', {
    method: editing.value ? 'PATCH' : 'POST', body: jsonBody({ name: name.value, description: description.value })
  });
  if (!current()) return;
  editorOpen.value = false;
  if (editing.value) { await load(); if (current()) notice.value = 'Collection updated.'; }
  else await router.push(`/collections/${result.item.id}`);
});
async function choose() {
  error.value = ''; selected.value = []; titleQuery.value = ''; addOpen.value = true;
  if (!watchlist.loaded) await watchlist.load();
}
const add = () => perform(async (current) => {
  await api(`/collections/${id.value}/items`, { method: 'POST', body: jsonBody({ entryIds: selected.value }) });
  if (!current()) return;
  addOpen.value = false; await load(); if (current()) notice.value = 'Anime added to your collection.';
});
const remove = () => perform(async (current) => {
  await api(`/collections/${id.value}`, { method: 'DELETE' });
  if (!current()) return;
  removeOpen.value = false; await router.push('/collections');
});
const removeTitle = (entryId: string) => perform(async (current) => {
  await api(`/collections/${id.value}/items/${entryId}`, { method: 'DELETE' });
  if (!current()) return;
  await load(); if (current()) notice.value = 'Removed from this collection. Your watchlist is unchanged.';
});
const move = (index: number, direction: number) => perform(async (current) => {
  const entryIds = detail.value!.items.map((item) => item.id);
  [entryIds[index], entryIds[index + direction]] = [entryIds[index + direction]!, entryIds[index]!];
  await api(`/collections/${id.value}/order`, { method: 'PUT', body: jsonBody({ entryIds }) });
  if (!current()) return;
  await load(); if (current()) notice.value = 'Collection order saved.';
});
const animeLink = (item: CollectionDetail['items'][number]) => item.provider === 'KITSU' && item.externalId
  ? `/anime/kitsu/${item.externalId}` : `/anime/local/${item.animeId}`;
function fallback(event: Event) { (event.target as HTMLImageElement).src = '/images/editorial/next-chapter-landscape.webp'; }
</script>

<template>
  <main class="collections-page" :aria-busy="loading">
    <RouterLink v-if="id" to="/collections" class="collections-back"><PhArrowLeft :size="18" />All collections</RouterLink>
    <header class="collections-heading">
      <div><h1>{{ id ? detail?.name || 'Collection' : 'Your collections' }}</h1>
        <p v-if="id && detail">{{ detail.description || 'A selection from your watchlist.' }}</p>
        <p v-else-if="!id">Give the anime you love a place together.</p>
      </div>
      <div class="collections-heading-actions">
        <template v-if="id && detail">
          <button class="collection-icon-button" aria-label="Edit collection" :disabled="busy" @click="edit(true)"><PhPencilSimple :size="20" /></button>
          <button class="collection-icon-button" aria-label="Delete collection" :disabled="busy" @click="removeOpen = true"><PhTrash :size="20" /></button>
          <button class="collection-primary" :disabled="busy || detail.items.length >= 100" @click="choose"><PhPlus :size="18" />Add from watchlist</button>
        </template>
        <button v-else-if="!id" class="collection-primary" :disabled="busy" @click="edit()"><PhPlus :size="18" />Create new</button>
      </div>
    </header>
    <p v-if="notice" class="collection-feedback" role="status">{{ notice }}</p>
    <p v-if="error && !editorOpen && !addOpen && !removeOpen" class="collection-feedback" role="alert">{{ error }} <button class="collection-text-button" @click="load()">Try again</button></p>
    <div v-if="!id && (collections.length || query)" class="collection-toolbar">
      <label class="collection-search"><PhMagnifyingGlass :size="18" /><input v-model="query" aria-label="Search collections" placeholder="Search collections" type="search" maxlength="100" /></label>
      <span class="collection-meta"><PhLockSimple :size="15" />Private to you</span>
    </div>
    <div v-if="loading && !collections.length && !detail" class="collection-grid" role="status" aria-label="Loading collections">
      <div v-for="number in 6" :key="number" class="collection-skeleton"><span /><span /></div>
    </div>
    <template v-else-if="!id">
      <section v-if="!collections.length && !error && !query" class="collection-empty">
        <h2>Make room for a new theme.</h2><p>Comfort watches, unforgettable worlds, or a weekend with friends. Start with a collection of your own.</p>
        <button class="collection-text-button" @click="edit()">Create your first collection <PhPlus :size="18" /></button>
      </section>
      <section v-else-if="filtered.length" class="collection-grid" aria-label="Your anime collections">
        <RouterLink v-for="collection in filtered" :key="collection.id" :to="`/collections/${collection.id}`" class="collection-card">
          <div class="collection-card-copy"><h2>{{ collection.name }}</h2><p>{{ collection.count }} {{ collection.count === 1 ? 'title' : 'titles' }}</p></div>
          <div v-if="collection.covers.length" class="collection-poster-fan" aria-hidden="true" :class="`covers-${collection.covers.length}`">
            <img v-for="(cover, index) in collection.covers" :key="cover.id" :src="cover.image" alt="" width="180" height="254" :style="{ '--poster-index': index }" loading="lazy" @error.once="fallback" />
          </div>
          <div v-else class="collection-empty-preview"><span>Ready for your first anime</span></div>
        </RouterLink>
      </section>
      <p v-else-if="query && !error" class="collection-empty-search">No collections match “{{ query }}”. <button class="collection-text-button" @click="query = ''">Clear search</button></p>
      <button v-if="hasNext" class="collection-load-more" :disabled="loading" @click="load(true)">{{ loading ? 'Loading…' : 'Show more' }}</button>
    </template>
    <template v-else-if="detail">
      <p class="collection-detail-meta"><span>{{ detail.items.length }} {{ detail.items.length === 1 ? 'title' : 'titles' }}</span><span><PhLockSimple :size="15" />Private to you</span></p>
      <section v-if="!detail.items.length" class="collection-empty"><h2>Your theme starts here.</h2><p>Add saved anime from your watchlist. The same anime can belong to more than one collection.</p><button class="collection-text-button" @click="choose">Choose anime <PhPlus :size="18" /></button></section>
      <section v-else class="collection-anime-grid" aria-label="Anime in this collection">
        <article v-for="(item, index) in detail.items" :key="item.id" class="collection-anime-card">
          <RouterLink :to="animeLink(item)" class="collection-anime-link"><img :src="item.image" :alt="`${item.title} cover`" width="300" height="425" loading="lazy" @error.once="fallback" /><h2>{{ item.title }}</h2></RouterLink>
          <p>{{ item.episodesWatched }} / {{ item.totalEpisodes || '?' }} episodes</p>
          <div class="collection-order-controls">
            <button class="collection-icon-button" :aria-label="`Move ${item.title} up`" :disabled="busy || index === 0" @click="move(index, -1)"><PhArrowUp :size="18" /></button>
            <button class="collection-icon-button" :aria-label="`Move ${item.title} down`" :disabled="busy || index === detail.items.length - 1" @click="move(index, 1)"><PhArrowDown :size="18" /></button>
            <button class="collection-icon-button collection-remove-title" :aria-label="`Remove ${item.title} from collection`" :disabled="busy" @click="removeTitle(item.id)"><PhX :size="18" /></button>
          </div>
        </article>
      </section>
    </template>

    <QDialog v-model="editorOpen" :persistent="busy"><section class="app-dialog collection-dialog" aria-labelledby="collection-editor-heading">
      <header><h2 id="collection-editor-heading">{{ editing ? 'Edit collection' : 'Create a collection' }}</h2><button class="collection-icon-button" aria-label="Close collection editor" :disabled="busy" @click="editorOpen = false"><PhX :size="20" /></button></header>
      <p v-if="error" role="alert" class="collection-feedback">{{ error }}</p>
      <form class="collection-form" @submit.prevent="save">
        <label>Collection name<input v-model="name" maxlength="80" required :disabled="busy" placeholder="e.g. Unforgettable worlds" /></label>
        <label>Description <span>Optional</span><textarea v-model="description" rows="3" maxlength="300" :disabled="busy" /></label>
        <p class="collection-form-note"><PhLockSimple :size="15" />Only you can see this collection.</p>
        <footer><button class="collection-text-button" type="button" :disabled="busy" @click="editorOpen = false">Cancel</button><button class="collection-primary" :disabled="busy || !name.trim()">{{ busy ? 'Saving…' : editing ? 'Save changes' : 'Create collection' }}</button></footer>
      </form>
    </section></QDialog>
    <QDialog v-model="addOpen" :persistent="busy"><section class="app-dialog collection-dialog collection-picker" aria-labelledby="collection-picker-heading">
      <header><h2 id="collection-picker-heading">Add from your watchlist</h2><button class="collection-icon-button" aria-label="Close anime picker" :disabled="busy" @click="addOpen = false"><PhX :size="20" /></button></header>
      <p v-if="error || watchlist.loadError" role="alert" class="collection-feedback">{{ error || watchlist.loadError }}</p>
      <label class="collection-search"><PhMagnifyingGlass :size="18" /><input v-model="titleQuery" type="search" aria-label="Search saved anime" placeholder="Search saved anime" /></label>
      <p v-if="watchlist.loading" role="status">Loading your watchlist…</p>
      <div v-else class="collection-picker-list">
        <label v-for="item in available" :key="item.id" class="collection-picker-row"><input v-model="selected" :value="item.id" type="checkbox" :disabled="busy || (!selected.includes(item.id) && selected.length >= 100 - (detail?.items.length || 0))" /><img :src="item.image" alt="" width="40" height="56" loading="lazy" /><span>{{ item.title }}</span></label>
        <p v-if="!available.length">{{ !watchlist.items.length ? 'Save anime to your watchlist first, then add it here.' : 'No other saved anime matches your search.' }}</p>
        <RouterLink v-if="!watchlist.items.length" to="/discover" class="collection-text-button">Discover anime</RouterLink>
      </div>
      <footer><span>{{ selected.length }} selected</span><button class="collection-primary" :disabled="busy || !selected.length" @click="add">{{ busy ? 'Adding…' : 'Add selected' }}</button></footer>
    </section></QDialog>
    <QDialog v-model="removeOpen" :persistent="busy"><section class="app-dialog collection-dialog" aria-labelledby="collection-delete-heading">
      <h2 id="collection-delete-heading">Delete “{{ detail?.name }}”?</h2><p>This removes the collection. Your anime and episode progress stay in your watchlist.</p>
      <p v-if="error" class="collection-feedback" role="alert">{{ error }}</p>
      <footer><button class="collection-text-button" :disabled="busy" @click="removeOpen = false">Cancel</button><button class="collection-primary" :disabled="busy" @click="remove">Delete collection</button></footer>
    </section></QDialog>
  </main>
</template>
