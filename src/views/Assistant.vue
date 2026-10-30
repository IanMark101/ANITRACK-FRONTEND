<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  PhArrowRight,
  PhMagnifyingGlass,
  PhCompass,
  PhArrowCounterClockwise,
  PhCheck
} from '@phosphor-icons/vue';
import AnimeCard from '../components/AnimeCard.vue';
import { api } from '../api';
import { useAssistantStore } from '../stores/assistant';
import { useAuthStore } from '../stores/auth';
import { useWatchlistStore } from '../stores/watchlist';
import type { AssistantMode, AssistantResult, RemoteAnime } from '../types';

const store = useAssistantStore();
const auth = useAuthStore();
const watchlist = useWatchlistStore();
const router = useRouter();
const current = computed(() => store.searches[store.mode]);
const identifying = computed(() => store.mode === 'identify');
const loading = ref(false);
const error = ref('');
const notice = ref('');
const actionError = ref('');
const input = ref<HTMLTextAreaElement>();
const resultsHeading = ref<HTMLElement>();
let controller: AbortController | null = null;
let request = 0;
const savedIds = computed(
  () =>
    new Set(
      watchlist.items.filter((item) => item.provider === 'KITSU').map((item) => item.externalId)
    )
);
const examples = computed(() =>
  identifying.value
    ? [
        'A boy with a straw hat whose body stretches travels with pirates.',
        'A notebook lets a student kill people by writing their names.',
        'An elf goes on a journey after her group defeats the demon king.'
      ]
    : [
        'I want adventure, exploration, and strong friendships.',
        'A funny romance that has finished airing, with at most 24 episodes.',
        'Something relaxing about everyday life, without horror.'
      ]
);
function cancel() {
  request++;
  controller?.abort();
  loading.value = false;
}
function changeMode(mode: AssistantMode) {
  if (store.mode === mode) return;
  cancel();
  store.mode = mode;
  error.value = notice.value = actionError.value = '';
}
async function useExample(example: string) {
  current.value.draft = example;
  await nextTick();
  input.value?.focus();
}
async function reset() {
  cancel();
  current.value.messages = [];
  current.value.result = null;
  current.value.draft = '';
  error.value = notice.value = actionError.value = '';
  await nextTick();
  input.value?.focus();
}
async function submit() {
  const search = current.value;
  const message = search.draft.trim();
  if (loading.value) return;
  if (message.length < 3) {
    error.value = 'Add a few words about the story or what you would like to watch.';
    input.value?.focus();
    return;
  }
  controller = new AbortController();
  const signal = controller.signal;
  const ticket = ++request;
  loading.value = true;
  error.value = notice.value = actionError.value = '';
  try {
    const result = await api<AssistantResult>('/assistant', {
      method: 'POST',
      body: JSON.stringify({
        mode: store.mode,
        message,
        context: search.messages.slice(-3),
        excludeIds: search.hideSaved
          ? [...savedIds.value].filter((id): id is string => Boolean(id)).slice(0, 300)
          : []
      }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(65000)])
    });
    if (ticket !== request) return;
    search.result = result;
    search.messages.push(message);
    search.draft = '';
    loading.value = false;
    await nextTick();
    resultsHeading.value?.focus({ preventScroll: true });
    resultsHeading.value?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  } catch (cause) {
    if (ticket === request && !signal.aborted)
      error.value =
        cause instanceof Error
          ? cause.message
          : 'We could not find matches just now. Please try again.';
  } finally {
    if (ticket === request) loading.value = false;
  }
}
async function add(anime: RemoteAnime) {
  if (!auth.authenticated) {
    await router.push({
      path: '/login',
      query: { redirect: `/anime/kitsu/${anime.externalId}` }
    });
    return;
  }
  actionError.value = '';
  try {
    if (await watchlist.importAnime(anime.externalId))
      notice.value = `${anime.title} is in your watchlist.`;
  } catch (cause) {
    actionError.value =
      cause instanceof Error ? cause.message : 'Could not save this anime. Please try again.';
  }
}
onMounted(() => {
  if (auth.authenticated && !watchlist.items.length) void watchlist.load();
});
onBeforeUnmount(cancel);
</script>

<template>
  <main class="container assistant-page">
    <header class="assistant-heading">
      <div>
        <p class="explore-eyebrow">Anime Assistant</p>
        <h1>Find your anime.</h1>
        <p>Describe a story you remember, or tell us what you enjoy.</p>
      </div>
      <RouterLink to="/discover" class="text-action"
        >Browse all anime <PhArrowRight :size="18"
      /></RouterLink>
    </header>
    <div class="assistant-workspace">
      <section class="assistant-composer" aria-label="Describe your anime">
        <div class="assistant-mode-options" role="group" aria-label="Choose how to find anime">
          <button
            type="button"
            :aria-pressed="identifying"
            :class="{ selected: identifying }"
            @click="changeMode('identify')"
          >
            <PhMagnifyingGlass :size="24" /><span
              ><strong>Find a forgotten anime</strong
              ><small>Tell us the clues you remember.</small></span
            >
          </button>
          <button
            type="button"
            :aria-pressed="!identifying"
            :class="{ selected: !identifying }"
            @click="changeMode('recommend')"
          >
            <PhCompass :size="24" /><span
              ><strong>Recommend something</strong
              ><small>Tell us what you enjoy watching.</small></span
            >
          </button>
        </div>
        <form @submit.prevent="submit">
          <div class="assistant-input-heading">
            <label for="anime-description">{{
              current.messages.length
                ? identifying
                  ? 'Add another clue'
                  : 'Refine your preferences'
                : identifying
                  ? 'What do you remember?'
                  : 'What would you like to watch?'
            }}</label
            ><button
              v-if="current.messages.length"
              class="assistant-reset"
              type="button"
              @click="reset"
            >
              <PhArrowCounterClockwise :size="15" /> New search
            </button>
          </div>
          <p id="description-help" class="assistant-help">
            {{
              identifying
                ? 'A character, a scene, the setting, or even a small detail can help.'
                : 'Try a genre, a mood, a series length, or something you want to avoid.'
            }}
          </p>
          <textarea
            id="anime-description"
            ref="input"
            v-model="current.draft"
            :placeholder="
              current.messages.length
                ? identifying
                  ? 'For example: I watched it around 2010, and the main character had red hair…'
                  : 'For example: Something shorter, and no romance this time…'
                : identifying
                  ? 'I remember an anime where…'
                  : 'I’m in the mood for…'
            "
            rows="5"
            maxlength="1200"
            :disabled="loading"
            aria-describedby="description-help assistant-privacy"
            :aria-invalid="Boolean(error)"
          />
          <div class="assistant-input-footer">
            <span>{{ current.draft.length }} / 1200</span
            ><button v-if="loading" class="assistant-reset" type="button" @click="cancel">
              Cancel</button
            ><button
              class="btn btn-primary-action"
              type="submit"
              :disabled="loading || current.draft.trim().length < 3"
            >
              <span v-if="loading" class="assistant-spinner" aria-hidden="true" />{{
                loading
                  ? 'Finding matches…'
                  : current.messages.length
                    ? 'Update results'
                    : identifying
                      ? 'Find my anime'
                      : 'Find recommendations'
              }}<PhArrowRight v-if="!loading" :size="18" />
            </button>
          </div>
          <p v-if="error" class="assistant-error" role="alert">
            {{ error }} <RouterLink to="/discover">Browse Discover</RouterLink>
          </p>
          <label v-if="auth.authenticated && !identifying" class="assistant-hide-saved"
            ><input
              v-model="current.hideSaved"
              type="checkbox"
              :disabled="loading || watchlist.loading"
            />
            Hide anime already in my watchlist</label
          >
          <p id="assistant-privacy" class="assistant-privacy">
            Your description is sent to Google Gemini to suggest matches. Anime information comes
            from Kitsu.
          </p>
        </form>
      </section>
      <aside class="assistant-guide" aria-label="Search examples">
        <p class="assistant-guide-label">
          {{ current.messages.length ? 'Your search so far' : 'Need a starting point?' }}
        </p>
        <template v-if="!current.messages.length"
          ><p>
            {{
              identifying
                ? 'You do not need to remember the title. Start with a detail that stood out.'
                : 'Be as specific as you like. A simple “adventure” works too.'
            }}
          </p>
          <button
            v-for="example in examples"
            :key="example"
            type="button"
            class="assistant-example"
            :disabled="loading"
            @click="useExample(example)"
          >
            <span>{{ example }}</span
            ><PhArrowRight :size="16" /></button
          ><small>Choose an example to edit it before searching.</small></template
        >
        <template v-else
          ><ol>
            <li v-for="(message, index) in current.messages.slice(-4)" :key="`${index}-${message}`">
              {{ message }}
            </li>
          </ol>
          <p>
            Your next message will refine these results. Choose
            <strong>New search</strong> to start with a different story.
          </p></template
        >
      </aside>
    </div>
    <p v-if="loading" class="assistant-loading" role="status">
      Reading your {{ identifying ? 'clues' : 'preferences' }} and checking the anime catalog. This
      can take up to a minute.
    </p>
    <section
      v-if="current.result"
      class="assistant-results"
      :aria-busy="loading"
      aria-labelledby="assistant-results-heading"
    >
      <div class="assistant-results-header">
        <div>
          <p class="explore-eyebrow">
            {{ identifying ? 'Let’s narrow it down' : 'A little closer to your taste' }}
          </p>
          <h2 id="assistant-results-heading" ref="resultsHeading" tabindex="-1">
            {{
              current.result.items.length
                ? identifying
                  ? 'Could it be one of these?'
                  : 'Your next watch could be here.'
                : 'A little more detail will help.'
            }}
          </h2>
          <p>{{ current.result.summary }}</p>
        </div>
        <span v-if="current.result.items.length" class="assistant-result-count"
          >{{ current.result.items.length }} possible
          {{ current.result.items.length === 1 ? 'match' : 'matches' }}</span
        >
      </div>
      <div v-if="notice" class="explore-notice" role="status">
        <PhCheck :size="17" /> {{ notice }}
        <RouterLink to="/watchlist">Open watchlist</RouterLink>
      </div>
      <p v-if="actionError" class="assistant-error" role="alert">
        {{ actionError }}
      </p>
      <p v-if="current.result.notice" class="explore-muted">
        {{ current.result.notice }}
      </p>
      <div v-if="current.result.question" class="assistant-followup">
        <PhMagnifyingGlass :size="23" />
        <div>
          <strong>{{ current.result.question }}</strong>
          <p>Add your answer in the box above to narrow the results.</p>
        </div>
        <button type="button" class="btn btn-glass" @click="input?.focus()">
          {{ identifying ? 'Add a clue' : 'Refine results' }}
        </button>
      </div>
      <div v-if="current.result.items.length" class="explore-grid">
        <AnimeCard
          v-for="match in current.result.items"
          :key="match.anime.externalId"
          :anime="match.anime"
          :added="savedIds.has(match.anime.externalId)"
          :busy="watchlist.busy"
          @add="add"
          ><div class="assistant-match-reason">
            <p>{{ match.reason }}</p>
            <div v-if="match.facts.length" class="assistant-match-facts">
              <span v-for="fact in match.facts" :key="fact">{{ fact }}</span>
            </div>
            <details v-if="match.evidence">
              <summary>From the synopsis</summary>
              <p>“{{ match.evidence }}”</p>
            </details>
          </div></AnimeCard
        >
      </div>
      <p v-if="current.result.items.length" class="assistant-results-note">
        These are suggestions, not guaranteed matches. Open an anime’s details to check the story
        before saving it.
      </p>
    </section>
  </main>
</template>
