<script setup lang="ts">
import { computed, ref } from 'vue';
import { QDialog, QMenu } from 'quasar';
import {
  PhHeart,
  PhDotsThree,
  PhStar,
  PhX,
  PhArrowUpRight,
  PhTrash,
  PhStarFour
} from '@phosphor-icons/vue';
import { useWatchlistStore } from '../stores/watchlist';
import WatchProgress from './WatchProgress.vue';
import type { Entry, WatchStatus } from '../types';
const props = defineProps<{ entry: Entry; progress?: boolean }>();
const emit = defineEmits<{ notice: [message: string] }>();
const store = useWatchlistStore();
const ratingOpen = ref(false);
const progressOpen = ref(false);
const removeOpen = ref(false);
const rating = ref(props.entry.rating);
const error = ref('');
const link = computed(() =>
  props.entry.provider === 'KITSU' && props.entry.externalId
    ? `/anime/kitsu/${props.entry.externalId}`
    : `/anime/local/${props.entry.animeId}`
);
const statuses: WatchStatus[] = ['Plan to Watch', 'Watching', 'Completed'];
async function update(change: Partial<Entry>) {
  error.value = '';
  try {
    await store.update(props.entry.id, change);
    return true;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not save the change.';
    return false;
  }
}
async function saveRating() {
  if (await update({ rating: Number(rating.value) })) {
    ratingOpen.value = false;
    emit('notice', 'Rating saved.');
  }
}
async function spotlight() {
  try {
    await store.spotlight(props.entry.id);
    emit('notice', `${props.entry.title} is your featured anime.`);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not update your featured anime.';
  }
}
async function remove() {
  try {
    await store.remove(props.entry.id);
    removeOpen.value = false;
    emit('notice', 'Removed from your watchlist.');
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not remove this anime.';
  }
}
function fallback(event: Event) {
  (event.target as HTMLImageElement).src = '/images/editorial/next-chapter-landscape.webp';
}
</script>
<template>
  <article class="library-card">
    <div class="library-cover">
      <RouterLink :to="link" :aria-label="`Open ${entry.title}`"
        ><img
          :src="entry.image"
          :alt="`${entry.title} cover`"
          width="300"
          height="425"
          loading="lazy"
          @error.once="fallback" /><span class="cover-open"
          ><PhArrowUpRight :size="22" /></span></RouterLink
      ><button
        class="cover-favorite"
        :class="{ selected: entry.isFavorite }"
        :aria-label="`${entry.isFavorite ? 'Unfavorite' : 'Favorite'} ${entry.title}`"
        :aria-pressed="entry.isFavorite"
        :disabled="store.busy"
        @click="update({ isFavorite: !entry.isFavorite })"
      >
        <PhHeart :size="20" :weight="entry.isFavorite ? 'fill' : 'regular'" />
      </button>
      <button class="icon-button card-menu-button cover-menu" :aria-label="`More options for ${entry.title}`">
        <PhDotsThree :size="22" /><QMenu class="library-menu" auto-close
          ><button @click="progressOpen = true">Edit episode progress</button
          ><button @click="rating = entry.rating; ratingOpen = true">Edit rating</button
          ><button :disabled="store.busy" @click="spotlight"><PhStarFour :size="17" />Feature on overview</button
          ><button :disabled="store.busy" class="danger-text" @click="removeOpen = true"><PhTrash :size="17" />Remove from watchlist</button></QMenu>
      </button>
    </div>
    <div class="library-card-meta">
      <span>{{ entry.genre }}</span
      ><button
        :aria-label="`Rate ${entry.title}`"
        @click="
          rating = entry.rating;
          ratingOpen = true;
        "
      >
        <PhStar :size="14" weight="fill" />{{ entry.rating.toFixed(1) }}
      </button>
    </div>
    <h3>
      <RouterLink :to="link">{{ entry.title }}</RouterLink>
    </h3>
    <div class="library-card-bottom">
      <select
        :value="entry.status"
        :aria-label="`Watch status for ${entry.title}`"
        :disabled="store.busy"
        @change="update({ status: ($event.target as HTMLSelectElement).value as WatchStatus })"
      >
        <option v-for="status in statuses" :key="status">{{ status }}</option></select
      >
    </div>
    <WatchProgress v-if="progress" :entry="entry" compact />
    <p v-if="error" class="inline-error" role="alert">{{ error }}</p>
    <QDialog v-model="ratingOpen" :persistent="store.busy"
      ><section class="app-dialog small-dialog" aria-labelledby="rating-heading">
        <header>
          <div>
            <h2 id="rating-heading">Your rating</h2>
            <p>{{ entry.title }}</p>
          </div>
          <button
            class="icon-button"
            aria-label="Close rating"
            :disabled="store.busy"
            @click="ratingOpen = false"
          >
            <PhX :size="22" />
          </button>
        </header>
        <form @submit.prevent="saveRating">
          <label class="rating-editor"
            >Score <strong>{{ Number(rating).toFixed(1) }} / 10</strong
            ><input
              v-model.number="rating"
              type="range"
              min="1"
              max="10"
              step="0.1"
              :disabled="store.busy"
              aria-label="Your rating"
          /></label>
          <p v-if="error" class="inline-error" role="alert">{{ error }}</p>
          <footer>
            <button
              class="btn btn-glass"
              type="button"
              :disabled="store.busy"
              @click="ratingOpen = false"
            >
              Cancel</button
            ><button class="btn btn-primary-action" :disabled="store.busy">
              {{ store.busy ? 'Saving…' : 'Save rating' }}
            </button>
          </footer>
        </form>
      </section></QDialog
    >
    <QDialog v-model="progressOpen" :persistent="store.busy"
      ><section class="app-dialog small-dialog" aria-labelledby="progress-heading">
        <header>
          <div>
            <h2 id="progress-heading">Episode progress</h2>
            <p>{{ entry.title }}</p>
          </div>
          <button
            class="icon-button"
            aria-label="Close progress"
            :disabled="store.busy"
            @click="progressOpen = false"
          >
            <PhX :size="22" />
          </button>
        </header>
        <WatchProgress :entry="entry" /></section
    ></QDialog>
    <QDialog v-model="removeOpen" :persistent="store.busy"
      ><section class="app-dialog small-dialog" aria-labelledby="remove-heading">
        <header>
          <h2 id="remove-heading">Remove this anime?</h2>
          <button
            class="icon-button"
            aria-label="Cancel removal"
            :disabled="store.busy"
            @click="removeOpen = false"
          >
            <PhX :size="22" />
          </button>
        </header>
        <p>This removes {{ entry.title }} and its saved progress and rating from your watchlist.</p>
        <p v-if="error" class="inline-error" role="alert">{{ error }}</p>
        <footer>
          <button class="btn btn-glass" :disabled="store.busy" @click="removeOpen = false">
            Keep anime</button
          ><button class="btn btn-primary-action" :disabled="store.busy" @click="remove">
            {{ store.busy ? 'Removing…' : 'Remove anime' }}
          </button>
        </footer>
      </section></QDialog
    >
  </article>
</template>

<style scoped>
.library-cover .cover-menu {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 8px;
  background: #16161bdb;
  color: #fff;
}
.library-cover .cover-menu:hover { background: #292930; }
</style>
