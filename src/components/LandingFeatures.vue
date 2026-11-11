<script setup lang="ts">
import { PhArrowRight, PhCaretDown, PhCheck, PhHeart, PhMagnifyingGlass, PhPlus, PhStar } from '@phosphor-icons/vue';

const art = '/images/editorial/';
const watchlist = [
  { title: 'Fullmetal Alchemist: Brotherhood', cover: 'fullmetal-alchemist', genre: 'Adventure', status: 'Watching', watched: 18, total: 64, rating: '9.2', favorite: true },
  { title: 'Violet Evergarden', cover: 'violet-evergarden', genre: 'Drama', status: 'Completed', watched: 13, total: 13, rating: '9.0', favorite: false },
  { title: 'Frieren: Beyond Journey’s End', cover: 'frieren', genre: 'Fantasy', status: 'Plan to Watch', watched: 0, total: 28, rating: null, favorite: false }
];
const collections = [
  { name: 'Fantasy journeys', covers: ['frieren', 'fullmetal-alchemist', 'howls-moving-castle'] },
  { name: 'Anime to revisit', covers: ['violet-evergarden', 'cowboy-bebop', 'spy-family'] }
];
const results = [
  { title: 'Frieren: Beyond Journey’s End', cover: 'frieren', format: 'TV · 2023' },
  { title: 'Fullmetal Alchemist: Brotherhood', cover: 'fullmetal-alchemist', format: 'TV · 2009' },
  { title: 'Howl’s Moving Castle', cover: 'howls-moving-castle', format: 'Film · 2004' }
];
</script>

<template>
  <section id="features" class="container product-story watchlist-story" aria-labelledby="watchlist-intro">
    <div class="story-intro watchlist-intro">
      <h2 id="watchlist-intro">Track every episode.</h2>
      <p>See what you’re watching, pick up where you left off, and keep your favorites and ratings together.</p>
    </div>
    <div class="sample-board watchlist-sample" data-ui>
      <div class="sample-board-heading">
        <div>
          <p class="sample-label">Sample watchlist</p>
          <h3>My watchlist</h3>
        </div>
        <span>{{ watchlist.length }} titles</span>
      </div>
      <ul class="sample-watchlist">
        <li v-for="anime in watchlist" :key="anime.cover" class="sample-watch-card">
          <img :src="`${art}${anime.cover}.webp`" alt="" width="180" height="240" loading="lazy" />
          <div class="sample-watch-copy">
            <p class="sample-status" :class="{ 'sample-watching': anime.status === 'Watching' }">{{ anime.status }}</p>
            <h4>{{ anime.title }}</h4>
            <p class="sample-meta">{{ anime.genre }} <span v-if="anime.rating"><PhStar weight="fill" :size="14" aria-hidden="true" /> {{ anime.rating }}<span class="sr-only"> out of 10</span></span><PhHeart v-if="anime.favorite" weight="fill" :size="15" aria-label="Favorite" /></p>
            <template v-if="anime.watched">
              <p class="sample-episodes"><span>Episodes watched</span><strong>{{ anime.watched }} / {{ anime.total }}</strong></p>
              <progress :value="anime.watched" :max="anime.total" :aria-label="`${anime.title} episode progress`" />
            </template>
            <span v-if="anime.status === 'Watching'" class="sample-episode-action"><PhPlus :size="16" aria-hidden="true" /> 1 episode</span>
          </div>
        </li>
      </ul>
    </div>
  </section>

  <section id="collections" class="container product-story collection-story" aria-labelledby="collections-intro">
    <div class="story-intro">
      <h2 id="collections-intro">Make it your collection.</h2>
      <p>Group titles from your watchlist by theme, mood, or whatever you want to watch next. Put the titles in your own order.</p>
      <RouterLink :to="{ path: '/login', query: { redirect: '/collections' } }" class="story-link">Log in to build collections <PhArrowRight :size="19" /></RouterLink>
    </div>
    <div class="collection-sample" data-ui>
      <p class="sample-label">Sample collections</p>
      <ul class="sample-collections">
        <li v-for="collection in collections" :key="collection.name">
          <h3>{{ collection.name }}</h3>
          <p>{{ collection.covers.length }} titles</p>
          <div class="sample-cover-fan" aria-hidden="true">
            <img v-for="cover in collection.covers" :key="cover" :src="`${art}${cover}.webp`" alt="" width="115" height="156" loading="lazy" />
          </div>
        </li>
      </ul>
    </div>
  </section>

  <section id="discover" class="discover-story" aria-labelledby="discovery-intro">
    <div class="container product-story">
      <div class="story-intro discovery-intro">
        <h2 id="discovery-intro">Find your next anime.</h2>
        <p>Browse popular, top-rated, seasonal, or upcoming anime. Filter by genre, open the details, and save a title to watch later.</p>
        <RouterLink :to="{ path: '/login', query: { redirect: '/discover' } }" class="story-link">Log in to discover <PhArrowRight :size="19" /></RouterLink>
      </div>
      <div class="sample-board catalog-sample" data-ui>
        <div class="sample-board-heading">
          <div>
            <p class="sample-label">Sample catalog results</p>
            <h3><PhMagnifyingGlass :size="23" aria-hidden="true" /> Fantasy anime</h3>
          </div>
        </div>
        <ul class="sample-results">
          <li v-for="anime in results" :key="anime.cover">
            <img :src="`${art}${anime.cover}.webp`" alt="" width="240" height="320" loading="lazy" />
            <h4>{{ anime.title }}</h4>
            <p>{{ anime.format }}</p>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section id="assistant" class="container product-story assistant-story" aria-labelledby="assistant-intro">
    <div class="story-intro">
      <h2 id="assistant-intro">A clue can be enough.</h2>
      <p>Describe a scene you remember or the kind of anime you’re in the mood for. Anime Assistant suggests titles and explains why they fit.</p>
      <RouterLink :to="{ path: '/login', query: { redirect: '/assistant' } }" class="story-link">Log in to use Anime Assistant <PhArrowRight :size="19" /></RouterLink>
    </div>
    <div class="sample-board assistant-sample" data-ui>
      <p class="sample-label">Sample assistant conversation</p>
      <div class="sample-prompt">
        <span>Your clue</span>
        <blockquote>“An elf mage outlives the hero of her old party and goes on another journey.”</blockquote>
      </div>
      <div class="sample-match">
        <img :src="`${art}frieren.webp`" alt="" width="120" height="164" loading="lazy" />
        <div>
          <p class="sample-label">Suggested match</p>
          <h3>Frieren: Beyond Journey’s End</h3>
          <p>Frieren is the elf mage. After Himmel dies, she sets out again to understand the people she traveled with.</p>
          <details>
            <summary>See the clues it matched <PhCaretDown :size="15" aria-hidden="true" /></summary>
            <ul>
              <li><PhCheck :size="15" aria-hidden="true" /> A long-lived elf mage</li>
              <li><PhCheck :size="15" aria-hidden="true" /> A new journey after the hero’s death</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.product-story {
  --sample-ground: #19191c;
  --sample-raised: #26262a;
  --sample-ink: #f3f2f5;
  --sample-muted: #bdbcc5;
  --sample-accent: #f0abb4;
  --story-gap: clamp(24px, 4vw, 64px);
  padding-block: clamp(52px, 8vw, 112px);
  scroll-margin-top: 74px;
}
.story-intro h2 {
  font: 600 clamp(32px, 4.5vw, 62px)/1.06 Outfit, sans-serif;
  letter-spacing: -.035em;
  margin: 0 0 18px;
  text-wrap: balance;
}
.story-intro p {
  max-width: 46ch;
  color: #c7c6ce;
  font-size: 16px;
  line-height: 1.7;
  margin: 0;
}
.story-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  margin-top: 14px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
}
.story-link:hover { color: var(--sample-accent); }
.story-link svg { flex: none; }
.watchlist-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, .65fr);
  gap: 18px var(--story-gap);
  align-items: end;
  margin-bottom: 30px;
}
.watchlist-intro h2 { margin-bottom: 0; }
.sample-board {
  min-width: 0;
  padding: clamp(16px, 3vw, 32px);
  background: var(--sample-ground);
  color: var(--sample-ink);
  border-radius: 12px;
}
.sample-board-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
}
.sample-board-heading > span, .sample-label, .sample-meta, .sample-results p, .sample-collections p {
  color: var(--sample-muted);
  font-size: 13px;
}
.sample-label { margin: 0 0 7px; font-weight: 600; }
.sample-board h3, .sample-collections h3 {
  margin: 0;
  font: 600 clamp(21px, 3vw, 30px)/1.15 Outfit, sans-serif;
}
.sample-watchlist, .sample-collections, .sample-results, .sample-match ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.sample-watchlist {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.sample-watch-card {
  display: grid;
  grid-template-columns: minmax(0, .7fr) minmax(0, 1fr);
  align-content: start;
  align-items: start;
  gap: 14px;
  min-width: 0;
  padding: 14px;
  background: var(--sample-raised);
  border-radius: 8px;
}
.sample-watch-card img, .sample-match > img {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 5px;
}
.sample-watch-card h4, .sample-results h4 {
  font: 600 19px/1.18 Outfit, sans-serif;
  margin: 0;
}
.sample-status { color: var(--sample-muted); font-size: 13px; margin: 0 0 8px; }
.sample-watching { color: var(--sample-accent); }
.sample-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 5px 10px; margin: 8px 0 0; }
.sample-meta span { display: inline-flex; align-items: center; gap: 4px; }
.sample-meta svg { color: var(--sample-accent); }
.sample-episodes {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 8px;
  font-size: 13px;
  margin: 14px 0 6px;
}
.sample-episodes strong { font-variant-numeric: tabular-nums; }
.sample-watch-card progress {
  display: block;
  width: 100%;
  height: 6px;
  accent-color: #e94253;
}
.sample-episode-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 10px;
  margin-top: 12px;
  color: #18181b;
  background: var(--sample-ink);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
}
.collection-story, .assistant-story {
  display: grid;
  grid-template-columns: minmax(0, .7fr) minmax(0, 1fr);
  align-items: center;
  gap: var(--story-gap);
}
.collection-story { padding-top: 16px; }
.sample-collections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.sample-collections > li {
  min-width: 0;
  overflow: hidden;
  background: var(--sample-ground);
  border-radius: 12px;
  padding: 16px 10px 0;
  text-align: center;
}
.sample-collections h3 { font-size: clamp(17px, 2.25vw, 24px); }
.sample-collections p { margin: 6px 0 8px; }
.sample-cover-fan { display: flex; justify-content: center; align-items: end; padding-top: 12px; }
.sample-cover-fan img {
  width: min(37%, 104px);
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 6px;
}
.sample-cover-fan img:first-child { transform: rotate(-10deg) translate(12%, 12%); }
.sample-cover-fan img:nth-child(2) { z-index: 1; }
.sample-cover-fan img:last-child { transform: rotate(10deg) translate(-12%, 12%); }
.discover-story {
  background: #eeedf0;
  color: #19191c;
  scroll-margin-top: 64px;
}
.discover-story .product-story {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, .7fr);
  grid-template-areas: 'catalog text';
  align-items: center;
  gap: var(--story-gap);
}
.discovery-intro { grid-area: text; }
.discovery-intro p { color: #4f4e55; }
.discovery-intro .story-link:hover { color: #9c202c; }
.catalog-sample { grid-area: catalog; }
.catalog-sample h3 { display: flex; gap: 10px; align-items: center; }
.sample-results { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.sample-results li { min-width: 0; }
.sample-results img {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}
.sample-results p { margin: 6px 0 0; }
.assistant-sample .sample-label { margin-bottom: 12px; }
.sample-prompt {
  width: fit-content;
  max-width: 90%;
  margin: 0 0 16px auto;
  padding: 12px 16px;
  background: var(--sample-raised);
  border-radius: 8px;
}
.sample-prompt span { color: var(--sample-muted); font-size: 13px; }
.sample-prompt blockquote { margin: 6px 0 0; font-size: 15px; line-height: 1.6; }
.sample-match {
  display: grid;
  grid-template-columns: minmax(70px, 112px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  padding-top: 8px;
}
.sample-match h3 { font-size: clamp(19px, 2.4vw, 25px); }
.sample-match p:not(.sample-label) { color: var(--sample-muted); font-size: 14px; line-height: 1.6; margin: 10px 0 0; }
.sample-match details { margin-top: 10px; }
.sample-match summary { display: flex; align-items: center; gap: 8px; min-height: 44px; padding-block: 10px; cursor: pointer; font-size: 13px; font-weight: 700; }
.sample-match summary:focus-visible { outline: 2px solid var(--sample-accent); outline-offset: 3px; }
.sample-match summary svg { flex: none; }
.sample-match details[open] summary svg { transform: rotate(180deg); }
.sample-match li { display: flex; align-items: baseline; gap: 6px; margin: 6px 0 0; font-size: 13px; color: var(--sample-muted); }
.sample-match li svg { color: var(--sample-accent); flex: none; }
@media (max-width: 1080px) {
  .sample-watch-card { grid-template-columns: 1fr; }
  .sample-watch-card img { aspect-ratio: 4 / 3; }
}
@media (max-width: 760px) {
  .watchlist-intro, .collection-story, .assistant-story, .discover-story .product-story { grid-template-columns: minmax(0, 1fr); }
  .discover-story .product-story { grid-template-areas: 'text' 'catalog'; }
  .watchlist-intro { margin-bottom: 22px; }
  .sample-watchlist { grid-template-columns: minmax(0, 1fr); gap: 10px; }
  .sample-watch-card { grid-template-columns: minmax(62px, .55fr) minmax(0, 1fr); align-items: start; }
  .sample-watch-card img { aspect-ratio: 3 / 4; }
  .sample-collections, .sample-results { gap: 10px; }
  .sample-results h4 { font-size: 16px; }
  .sample-match { grid-template-columns: minmax(56px, 82px) minmax(0, 1fr); gap: 12px; }
}
@media (max-width: 520px) {
  .sample-results { grid-template-columns: minmax(0, 1fr); }
  .sample-results li { display: grid; grid-template-columns: 56px minmax(0, 1fr); align-items: center; gap: 4px 10px; }
  .sample-results img { grid-row: span 2; margin: 0; }
  .sample-results p { margin: 0; }
}
@media (max-width: 370px) {
  .sample-watch-card { padding: 10px; gap: 10px; }
  .sample-watch-card h4 { font-size: 17px; }
}
</style>
