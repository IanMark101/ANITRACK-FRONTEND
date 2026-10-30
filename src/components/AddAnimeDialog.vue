<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { QDialog } from 'quasar';
import {
  PhX,
  PhMagnifyingGlass,
  PhPlus,
  PhCheck,
  PhUploadSimple,
  PhArrowLeft
} from '@phosphor-icons/vue';
import { api } from '../api';
import { useWatchlistStore } from '../stores/watchlist';
import type { DiscoveryResult, RemoteAnime, WatchStatus } from '../types';
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [open: boolean]; saved: [title: string] }>();
const store = useWatchlistStore();
const dialog = ref<HTMLElement>();
const custom = ref(false);
const query = ref('');
const resultQuery = ref('');
const addingId = ref('');
const results = ref<RemoteAnime[]>([]);
const searching = ref(false);
const searched = ref(false);
const error = ref('');
const initialForm = () => ({
  title: '',
  genre: 'Action',
  status: 'Plan to Watch' as WatchStatus,
  rating: 8.5,
  totalEpisodes: null as number | null,
  synopsis: '',
  image: '/images/editorial/next-chapter-landscape.webp'
});
const form = ref(initialForm());
const saved = computed(() => new Set(store.items.map((item) => item.externalId)));
let controller: AbortController | undefined;
let ticket = 0;
function cancelSearch() {
  ticket++;
  controller?.abort();
  searching.value = false;
}
function close() {
  if (!store.busy) emit('update:modelValue', false);
}
function focusFirstField() {
  dialog.value
    ?.querySelector<HTMLInputElement>('input:not([type=file])')
    ?.focus({ preventScroll: true });
}
watch(custom, async () => {
  await nextTick();
  focusFirstField();
});
async function search() {
  cancelSearch();
  const current = ++ticket;
  controller = new AbortController();
  searching.value = true;
  error.value = '';
  const submittedQuery = query.value.trim();
  try {
    const data = await api<DiscoveryResult>(
      `/discovery?q=${encodeURIComponent(submittedQuery)}&view=popular`,
      { signal: controller.signal }
    );
    if (current === ticket) {
      results.value = data.items.slice(0, 10);
      searched.value = true;
      resultQuery.value = submittedQuery;
    }
  } catch (cause) {
    if (current === ticket)
      error.value = cause instanceof Error ? cause.message : 'Could not search anime.';
  } finally {
    if (current === ticket) searching.value = false;
  }
}
async function add(anime: RemoteAnime) {
  error.value = '';
  addingId.value = anime.externalId;
  try {
    if (await store.importAnime(anime.externalId)) {
      emit('saved', anime.title);
      close();
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not add this anime.';
  } finally {
    addingId.value = '';
  }
}
async function saveCustom() {
  error.value = '';
  if (!form.value.title.trim()) {
    error.value = 'Enter the anime title.';
    return;
  }
  try {
    const item = await store.add({
      ...form.value,
      title: form.value.title.trim(),
      rating: Number(form.value.rating),
      totalEpisodes:
        form.value.totalEpisodes === null || String(form.value.totalEpisodes) === ''
          ? null
          : Number(form.value.totalEpisodes)
    });
    if (item) {
      emit('saved', form.value.title.trim());
      close();
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not save your anime.';
  }
}
function upload(event: Event) {
  const field = event.target as HTMLInputElement;
  const file = field.files?.[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1048576) {
    error.value = 'Choose a JPEG, PNG, or WebP image smaller than 1 MB.';
    field.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    form.value.image = String(reader.result);
    error.value = '';
  };
  reader.onerror = () => {
    error.value = 'Could not read this image. Try another file.';
  };
  reader.readAsDataURL(file);
}
watch(
  () => props.modelValue,
  async (open) => {
    cancelSearch();
    if (!open) return;
    custom.value = false;
    query.value = '';
    resultQuery.value = '';
    error.value = '';
    form.value = initialForm();
    results.value = [];
    searched.value = false;
    void search();
    try {
      await store.loadMetadata();
    } catch {
      /* Catalog search remains available independently. */
    }
  }
);
onBeforeUnmount(cancelSearch);
</script>
<template>
  <QDialog
    :model-value="modelValue"
    :persistent="store.busy"
    aria-labelledby="add-anime-heading"
    @show="focusFirstField"
    @update:model-value="emit('update:modelValue', $event)"
    ><section ref="dialog" class="app-dialog add-anime-dialog" aria-labelledby="add-anime-heading">
      <header>
        <div>
          <p class="dialog-kicker">YOUR WATCHLIST</p>
          <h2 id="add-anime-heading">
            {{ custom ? 'Create a custom entry' : 'Find your next anime' }}
          </h2>
          <p>
            {{
              custom
                ? 'For a title you cannot find in the catalog.'
                : 'Search the catalog and save a title for later.'
            }}
          </p>
        </div>
        <button
          class="icon-button"
          aria-label="Close add anime"
          :disabled="store.busy"
          @click="close"
        >
          <PhX :size="23" />
        </button>
      </header>
      <p v-if="error" class="app-feedback error-feedback" role="alert">{{ error }}</p>
      <template v-if="!custom"
        ><form class="dialog-search" @submit.prevent="search">
          <PhMagnifyingGlass :size="21" /><input
            v-model="query"
            aria-label="Search anime catalog"
            placeholder="Search by anime title…"
            maxlength="100"
            autofocus
          /><button class="btn btn-primary-action" :disabled="searching">
            {{ searching ? 'Searching…' : 'Search' }}
          </button>
        </form>
        <p class="dialog-results-label">
          {{
            searching
              ? 'SEARCHING THE CATALOG'
              : resultQuery
                ? `RESULTS FOR “${resultQuery}”`
                : 'POPULAR IN THE CATALOG'
          }}
        </p>
        <div v-if="searching" class="dialog-result-list" role="status" aria-label="Searching anime">
          <div v-for="n in 4" :key="n" class="dialog-result skeleton-row">
            <div class="skeleton-cover" />
            <div class="skeleton-line" />
          </div>
        </div>
        <div v-else-if="results.length" class="dialog-result-list">
          <article v-for="anime in results" :key="anime.externalId" class="dialog-result">
            <img
              :src="anime.image"
              :alt="`${anime.title} cover`"
              width="50"
              height="72"
              loading="lazy"
            />
            <div>
              <h3>{{ anime.title }}</h3>
              <p>
                {{ anime.year || 'Anime' }}<span v-if="anime.format"> · {{ anime.format }}</span
                ><span v-if="anime.totalEpisodes">
                  · {{ anime.totalEpisodes }}
                  {{ anime.totalEpisodes === 1 ? 'episode' : 'episodes' }}</span
                >
              </p>
            </div>
            <button
              class="result-add"
              :aria-label="`${saved.has(anime.externalId) ? 'Already saved' : 'Add'} ${anime.title}`"
              :disabled="store.busy || saved.has(anime.externalId)"
              @click="add(anime)"
            >
              <span
                v-if="addingId === anime.externalId"
                class="assistant-spinner"
                aria-hidden="true"
              /><PhCheck v-else-if="saved.has(anime.externalId)" :size="20" /><PhPlus
                v-else
                :size="20"
              /><span>{{
                addingId === anime.externalId
                  ? 'Adding…'
                  : saved.has(anime.externalId)
                    ? 'Saved'
                    : 'Add'
              }}</span>
            </button>
          </article>
        </div>
        <div v-else-if="searched" class="dialog-empty">
          <h3>No titles found.</h3>
          <p>Try another spelling, or create your own entry below.</p>
        </div>
        <div v-else-if="error" class="dialog-empty">
          <button class="btn btn-glass" @click="search">Try search again</button>
        </div>
        <footer class="custom-entry-link">
          <p>Can’t find the title?</p>
          <button
            :disabled="store.busy"
            @click="
              custom = true;
              error = '';
            "
          >
            Create a custom entry <PhPlus :size="17" />
          </button></footer
      ></template>
      <form v-else class="custom-anime-form" @submit.prevent="saveCustom">
        <button
          type="button"
          class="text-button"
          @click="
            custom = false;
            error = '';
          "
        >
          <PhArrowLeft :size="17" />Back to catalog search</button
        ><label class="field-label"
          >Anime title<input
            v-model="form.title"
            required
            maxlength="150"
            placeholder="Enter the title"
            :disabled="store.busy"
        /></label>
        <div class="form-pair">
          <label class="field-label"
            >Genre<select v-model="form.genre" :disabled="store.busy">
              <option
                v-for="genre in store.metadata.genres.length
                  ? store.metadata.genres
                  : [
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
                    ]"
                :key="genre"
              >
                {{ genre }}
              </option>
            </select></label
          ><label class="field-label"
            >Watch status<select v-model="form.status" :disabled="store.busy">
              <option>Plan to Watch</option>
              <option>Watching</option>
              <option>Completed</option>
            </select></label
          >
        </div>
        <div class="form-pair">
          <label class="field-label"
            >Your rating<input
              v-model.number="form.rating"
              type="number"
              min="1"
              max="10"
              step="0.1"
              required
              :disabled="store.busy"
            /><small>Between 1 and 10. You can change this later.</small></label
          ><label class="field-label"
            >Total episodes <span>(optional)</span
            ><input
              v-model.number="form.totalEpisodes"
              type="number"
              min="1"
              max="50000"
              step="1"
              placeholder="Leave blank if unknown"
              :disabled="store.busy"
          /></label>
        </div>
        <label class="field-label"
          >Synopsis <span>(optional)</span
          ><textarea
            v-model="form.synopsis"
            rows="3"
            maxlength="2000"
            placeholder="A few words about the story…"
            :disabled="store.busy"
          />
        </label>
        <div class="custom-cover-picker">
          <img :src="form.image" alt="Selected cover preview" />
          <div>
            <strong>Cover image</strong>
            <p>Use the default artwork or upload your own.</p>
            <label class="btn btn-glass upload-cover"
              ><PhUploadSimple :size="18" />Choose image<input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                :disabled="store.busy"
                @change="upload" /></label
            ><small>JPEG, PNG or WebP · up to 1 MB</small>
          </div>
        </div>
        <details v-if="store.metadata.posters.length" class="preset-covers">
          <summary>Choose a catalog cover instead</summary>
          <div>
            <button
              v-for="poster in store.metadata.posters"
              :key="poster.id"
              type="button"
              :aria-label="`Use ${poster.title} cover`"
              :aria-pressed="form.image === poster.image"
              @click="form.image = poster.image"
            >
              <img :src="poster.image" :alt="poster.title" loading="lazy" />
            </button>
          </div>
        </details>
        <footer>
          <button class="btn btn-glass" type="button" :disabled="store.busy" @click="close">
            Cancel</button
          ><button class="btn btn-primary-action" :disabled="store.busy">
            {{ store.busy ? 'Saving…' : 'Add to watchlist' }}<PhPlus :size="18" />
          </button>
        </footer>
      </form></section
  ></QDialog>
</template>
