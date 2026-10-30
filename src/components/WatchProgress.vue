<script setup lang="ts">
import { ref, watch } from 'vue';
import { PhMinus, PhPlus } from '@phosphor-icons/vue';
import { useWatchlistStore } from '../stores/watchlist';
import type { Entry } from '../types';
const props = defineProps<{ entry: Entry; compact?: boolean }>();
const store = useWatchlistStore();
const draft = ref(props.entry.episodesWatched || 0);
const error = ref('');
watch(
  () => props.entry.episodesWatched,
  (value) => {
    draft.value = value || 0;
  }
);
async function increment(delta: 1 | -1) {
  error.value = '';
  try {
    await store.progress(props.entry.id, delta);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not save progress.';
  }
}
async function save() {
  error.value = '';
  if (!Number.isInteger(draft.value) || draft.value < 0) {
    error.value = 'Enter a whole number of episodes.';
    return;
  }
  try {
    await store.update(props.entry.id, { episodesWatched: draft.value });
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not save progress.';
  }
}
</script>

<template>
  <div :class="['watch-progress', { compact }]">
    <div class="watch-progress-heading">
      <span>Episode progress</span
      ><strong>{{ entry.episodesWatched || 0 }} / {{ entry.totalEpisodes || '?' }}</strong>
    </div>
    <progress
      v-if="entry.totalEpisodes"
      :value="entry.episodesWatched || 0"
      :max="entry.totalEpisodes"
      :aria-label="`${entry.title} episode progress`"
    ></progress>
    <div class="watch-progress-controls">
      <button
        type="button"
        :disabled="store.busy || !entry.episodesWatched"
        :aria-label="`Undo one watched episode for ${entry.title}`"
        @click="increment(-1)"
      >
        <PhMinus :size="16" /></button
      ><button
        type="button"
        :aria-label="`Mark one more episode watched for ${entry.title}`"
        :disabled="
          store.busy ||
          (entry.totalEpisodes != null && entry.episodesWatched >= entry.totalEpisodes) ||
          entry.episodesWatched >= 50000
        "
        @click="increment(1)"
      >
        <PhPlus :size="16" /> 1 episode
      </button>
    </div>
    <form v-if="!compact" @submit.prevent="save">
      <label
        >Episodes watched<input
          v-model.number="draft"
          type="number"
          min="0"
          :max="entry.totalEpisodes || 50000"
          step="1"
          required
          :disabled="store.busy"
          :aria-label="`Episodes watched for ${entry.title}`" /></label
      ><button class="btn btn-glass" type="submit" :disabled="store.busy">
        {{ store.busy ? 'Saving…' : 'Save progress' }}
      </button>
    </form>
    <small v-if="!compact">{{
      entry.totalEpisodes
        ? 'Reaching the episode total marks this title Completed.'
        : 'The episode total is unknown. You can still track what you have watched.'
    }}</small>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
  </div>
</template>
