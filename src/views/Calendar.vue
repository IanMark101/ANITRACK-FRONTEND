<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { PhArrowLeft, PhArrowRight } from '@phosphor-icons/vue';
import { api } from '../api';
import type { CalendarResult } from '../types';
function monday(value: string) {
  const date = new Date(value + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}
const localDate = new Date();
const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
const week = ref(monday(today));
const loading = ref(true);
const error = ref('');
const result = ref<CalendarResult | null>(null);
const days = computed(() =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date(week.value + 'T12:00:00Z');
    date.setUTCDate(date.getUTCDate() + index);
    const value = date.toISOString().slice(0, 10);
    return {
      value,
      label: date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      }),
      events: result.value?.events.filter((event) => event.date === value) || []
    };
  })
);
let controller: AbortController | null = null;
let request = 0;
async function load() {
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal;
  const current = ++request;
  loading.value = true;
  error.value = '';
  try {
    const response = await api<CalendarResult>(`/watchlist/calendar?week=${week.value}`, {
      signal
    });
    if (current === request) result.value = response;
  } catch (cause) {
    if (current === request && !signal.aborted)
      error.value = cause instanceof Error ? cause.message : 'Could not load the calendar.';
  } finally {
    if (current === request) loading.value = false;
  }
}
function move(amount: number) {
  const date = new Date(week.value + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + amount * 7);
  week.value = date.toISOString().slice(0, 10);
}
watch(week, load, { immediate: true });
onBeforeUnmount(() => {
  controller?.abort();
  request++;
});
</script>
<template>
  <main class="container explore-page">
    <div class="explore-heading">
      <div>
        <p class="explore-eyebrow">YOUR WEEK IN ANIME</p>
        <h1>Airing calendar.</h1>
        <p>Known episode air dates for anime you have marked Watching.</p>
      </div>
      <RouterLink to="/watchlist" class="text-action"
        >Your watchlist <PhArrowRight :size="18"
      /></RouterLink>
    </div>
    <div class="calendar-toolbar">
      <button
        class="btn btn-glass"
        aria-label="Previous week"
        :disabled="loading"
        @click="move(-1)"
      >
        <PhArrowLeft :size="18" /></button
      ><label
        >Week of<input
          type="date"
          :value="week"
          :disabled="loading"
          @change="week = monday(($event.target as HTMLInputElement).value || today)" /></label
      ><button class="btn btn-glass" aria-label="Next week" :disabled="loading" @click="move(1)">
        <PhArrowRight :size="18" /></button
      ><button class="btn btn-glass" :disabled="loading" @click="week = monday(today)">
        This week
      </button>
    </div>
    <div v-if="loading" class="calendar-skeleton" role="status" aria-label="Checking episode dates">
      <div v-for="n in 7" :key="n">
        <div class="skeleton-line" />
        <div class="skeleton-cover" />
      </div>
    </div>
    <div v-else-if="error" class="explore-state" role="alert">
      <p>{{ error }}</p>
      <button class="btn btn-glass" @click="load">Try again</button>
    </div>
    <template v-else-if="result"
      ><p class="explore-muted">{{ result.notice }}</p>
      <p v-if="result.failedTitles" class="explore-notice" role="status">
        Dates for {{ result.failedTitles }} title(s) could not be checked.
        <button class="text-action" @click="load">Try again</button>
      </p>
      <p v-if="result.limited" class="explore-notice">
        Showing your 20 most recently updated Watching titles.
      </p>
      <div v-if="!result.trackedTitles" class="explore-state">
        <h2>Your calendar starts with a story.</h2>
        <p>Add anime from discovery and mark it Watching to see available episode dates.</p>
        <RouterLink to="/discover" class="btn btn-primary-action">Discover anime</RouterLink>
      </div>
      <template v-else
        ><p v-if="!result.events.length" class="explore-notice">
          No known air dates for this week. The provider may not have announced or recorded them
          yet.
        </p>
        <div class="anime-calendar">
          <section
            v-for="day in days"
            :key="day.value"
            :class="['calendar-day', { today: day.value === today }]"
          >
            <h2>{{ day.label }}</h2>
            <RouterLink
              v-for="event in day.events"
              :key="`${event.externalId}-${event.episode}-${event.kind}`"
              :to="`/anime/kitsu/${event.externalId}`"
              class="calendar-event"
              ><img :src="event.image" alt="" loading="lazy" width="90" height="125" /><strong>{{
                event.title
              }}</strong
              ><span>{{ event.episode ? `Episode ${event.episode}` : event.kind }}</span
              ><small>{{ event.episodeTitle }}</small></RouterLink
            >
            <p v-if="!day.events.length">No known releases</p>
          </section>
        </div></template
      ></template
    >
  </main>
</template>
