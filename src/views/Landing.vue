<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  PhArrowRight,
  PhArrowUpRight,
  PhBookmarkSimple,
  PhHeart,
  PhStar,
  PhPlay,
  PhCheck,
  PhPlus
} from '@phosphor-icons/vue';
import { api } from '../api';
import { useAuthStore } from '../stores/auth';
import { useWatchlistStore } from '../stores/watchlist';
import type { Anime } from '../types';

const auth = useAuthStore();
const watchlist = useWatchlistStore();
const router = useRouter();
const page = ref<HTMLElement | null>(null);
const catalog = ref<Anime[]>([]);
const loading = ref(true);
const error = ref('');
const selectedId = ref('');
const addedId = ref('');
const addError = ref('');
const featured = computed(() => catalog.value.slice(0, 4));
const selected = computed(
  () => featured.value.find((anime) => anime.id === selectedId.value) ?? featured.value[0]
);
const destination = computed(() => (auth.authenticated ? '/dashboard' : '/register'));
let alive = true;
let cleanup = () => {};
async function loadCatalog() {
  loading.value = true;
  error.value = '';
  try {
    catalog.value = (await api<{ items: Anime[] }>('/anime')).items;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load catalog.';
  } finally {
    loading.value = false;
  }
}
async function addSelected() {
  if (!selected.value) return;
  if (!auth.authenticated) {
    await router.push({ path: '/login', query: { redirect: '/dashboard' } });
    return;
  }
  addError.value = '';
  try {
    const item = await watchlist.add({ animeId: selected.value.id });
    if (item) addedId.value = selected.value.id;
  } catch (cause) {
    addError.value = cause instanceof Error ? cause.message : 'Could not add title.';
  }
}
onMounted(async () => {
  void loadCatalog();
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger')
  ]);
  if (!alive || !page.value) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add(
    '(prefers-reduced-motion: no-preference)',
    () => {
      gsap.from('.landing-hero .hero-copy > *', {
        y: 25,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out'
      });
      gsap.from('.hero-art-column', {
        y: 45,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out'
      });
      gsap.utils.toArray<HTMLElement>('.feature-tile').forEach((tile) =>
        gsap.from(tile, {
          y: 30,
          opacity: 0,
          duration: 0.65,
          scrollTrigger: { trigger: tile, start: 'top 90%', once: true }
        })
      );
      gsap.utils.toArray<HTMLElement>('.journey-image').forEach((image) =>
        gsap.fromTo(
          image,
          { scale: 0.92, opacity: 0.5 },
          {
            scale: 1,
            opacity: 1,
            scrollTrigger: { trigger: image, start: 'top 90%', end: 'top 45%', scrub: 1 }
          }
        )
      );
    },
    page.value
  );
  media.add(
    '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
    () => {
      ScrollTrigger.create({
        trigger: '.journey-section',
        start: 'top 110px',
        end: 'bottom 75%',
        pin: '.journey-heading',
        pinSpacing: false,
        invalidateOnRefresh: true
      });
    },
    page.value
  );
  cleanup = () => media.revert();
});
onBeforeUnmount(() => {
  alive = false;
  cleanup();
});
</script>

<template>
  <main ref="page" class="landing-page">
    <section class="landing-hero container">
      <div class="hero-copy">
        <p class="hero-eyebrow">A home for your anime journey</p>
        <h1>Your anime.<br /><span>Your next chapter.</span></h1>
        <p class="hero-description">
          Keep the stories you love close. Track your watches, rate your favorites, and find what
          comes next.
        </p>
        <div class="landing-actions">
          <RouterLink :to="destination" class="btn btn-primary-action large-button"
            >{{ auth.authenticated ? 'Go to dashboard' : 'Start your watchlist' }}
            <PhArrowUpRight :size="21" /></RouterLink
          ><a href="#discover" class="text-action"
            >Find your next watch <PhArrowRight :size="20"
          /></a>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="hero-art-column art-column-one">
          <img
            src="/images/jujutsukaisen.jpg"
            alt=""
            width="250"
            height="360"
            fetchpriority="high"
          /><img src="/images/komi.jpg" alt="" width="250" height="360" />
        </div>
        <div class="hero-art-column art-column-two">
          <img
            src="/images/vinlandsaga.jpg"
            alt=""
            width="250"
            height="360"
            fetchpriority="high"
          /><img src="/images/onepiece.jpg" alt="" width="250" height="360" />
        </div>
        <div class="hero-art-column art-column-three">
          <img src="/images/bleach.jpg" alt="" width="250" height="360" /><img
            src="/images/hellsparadise.jpg"
            alt=""
            width="250"
            height="360"
          />
        </div>
      </div>
    </section>

    <div class="genre-strip" aria-label="A place for every genre">
      <div class="genre-track">
        <span>Adventure</span><PhStar :size="24" /><span>Slice of life</span
        ><PhStar :size="24" /><span>Fantasy</span><PhStar :size="24" /><span>Romance</span
        ><PhStar :size="24" /><span>Action</span><PhStar :size="24" /><span aria-hidden="true"
          >Adventure</span
        ><PhStar :size="24" aria-hidden="true" /><span aria-hidden="true">Slice of life</span>
      </div>
    </div>

    <section id="features" class="landing-section container">
      <div class="section-intro">
        <h2>A little less searching.<br /><span>A lot more watching.</span></h2>
        <p>One personal collection, built around how you watch.</p>
      </div>
      <div class="feature-grid">
        <article class="feature-tile feature-watch">
          <div class="feature-copy">
            <PhBookmarkSimple :size="30" />
            <h3>Every title has its place.</h3>
            <p>Watching, completed, or saved for later. Keep your next adventure within reach.</p>
          </div>
          <img
            src="/images/onepiece.jpg"
            alt="One Piece poster"
            loading="lazy"
            width="300"
            height="400"
          />
          <div class="feature-statuses">
            <span><PhPlay :size="15" /> Watching</span><span><PhCheck :size="15" /> Completed</span
            ><span><PhBookmarkSimple :size="15" /> Plan to Watch</span>
          </div>
        </article>
        <article class="feature-tile feature-rating">
          <PhStar :size="36" weight="fill" />
          <h3>Your taste.<br />Your rating.</h3>
          <p>Give each story a personal score. Find your favorites at a glance.</p>
          <span class="rating-type" aria-hidden="true">★</span>
        </article>
        <article class="feature-tile feature-favorite">
          <div class="favorite-visual">
            <img
              src="/images/komi.jpg"
              alt="Komi Can't Communicate poster"
              loading="lazy"
              width="240"
              height="340"
            /><PhHeart :size="52" weight="fill" />
          </div>
          <div class="feature-copy">
            <h3>Keep the good ones close.</h3>
            <p>A heart for the stories you’ll always come back to.</p>
          </div>
        </article>
        <article class="feature-tile feature-spotlight">
          <img
            src="/images/vinlandsaga.jpg"
            alt="Vinland Saga poster"
            loading="lazy"
            width="500"
            height="450"
          />
          <div class="feature-copy">
            <h3>Put your favorite in the spotlight.</h3>
            <p>Make your dashboard yours, with a featured title you choose.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="journey-section container landing-section">
      <div class="journey-heading">
        <h2>For every kind<br />of anime fan.</h2>
        <p>The weekend binge. The long-running epic. The one you watched twice.</p>
        <RouterLink :to="destination" class="text-action"
          >{{ auth.authenticated ? 'Open your collection' : 'Make a collection of your own' }}
          <PhArrowRight :size="20"
        /></RouterLink>
      </div>
      <div class="journey-gallery">
        <figure>
          <div class="journey-image">
            <img
              src="/images/hellsparadise.jpg"
              alt="Hell's Paradise artwork"
              loading="lazy"
              width="600"
              height="500"
            />
          </div>
          <figcaption>For the worlds you get lost in.</figcaption>
        </figure>
        <figure>
          <div class="journey-image">
            <img
              src="/images/angelnextdoor.jpg"
              alt="The Angel Next Door Spoils Me Rotten artwork"
              loading="lazy"
              width="600"
              height="500"
            />
          </div>
          <figcaption>For the stories that stay with you.</figcaption>
        </figure>
      </div>
    </section>

    <section id="discover" class="landing-section container discover-section">
      <div class="section-intro">
        <h2>Your next obsession<br /><span>could be right here.</span></h2>
        <p>Explore the catalog. Give a new story a place in your collection.</p>
      </div>
      <div v-if="loading" class="catalog-skeleton" aria-label="Loading catalog" role="status">
        <span v-for="n in 4" :key="n"></span>
      </div>
      <div v-else-if="error" class="catalog-state" role="alert">
        <h3>The catalog is taking a break.</h3>
        <p>{{ error }}</p>
        <button class="btn btn-glass" @click="loadCatalog">Try again</button>
      </div>
      <div v-else-if="!featured.length" class="catalog-state">
        <h3>The next chapter is yours.</h3>
        <p>The catalog is empty. Add your own title from your dashboard.</p>
        <RouterLink :to="destination" class="text-action"
          >Start your collection <PhArrowRight :size="18"
        /></RouterLink>
      </div>
      <template v-else>
        <div
          class="poster-picker"
          :style="{
            gridTemplateColumns: featured
              .map((anime) => (selected?.id === anime.id ? '1.6fr' : '1fr'))
              .join(' ')
          }"
        >
          <button
            v-for="anime in featured"
            :key="anime.id"
            :class="['poster-choice', { selected: selected?.id === anime.id }]"
            :aria-pressed="selected?.id === anime.id"
            @click="
              selectedId = anime.id;
              addError = '';
            "
          >
            <span class="poster-choice-image"
              ><img
                :src="anime.image"
                :alt="`${anime.title} poster`"
                loading="lazy"
                width="300"
                height="420" /></span
            ><span>{{ anime.title }}</span>
          </button>
        </div>
        <div v-if="selected" class="catalog-detail">
          <div>
            <span class="catalog-genre">{{ selected.genre }}</span>
            <h3>{{ selected.title }}</h3>
            <p>{{ selected.synopsis }}</p>
          </div>
          <button
            class="btn btn-glass"
            :disabled="watchlist.busy || addedId === selected.id"
            @click="addSelected"
          >
            <component :is="addedId === selected.id ? PhCheck : PhPlus" :size="19" />{{
              watchlist.busy
                ? 'Adding…'
                : addedId === selected.id
                  ? 'Added to watchlist'
                  : 'Add to watchlist'
            }}
          </button>
        </div>
        <p v-if="addError" class="form-error" role="alert">{{ addError }}</p>
      </template>
    </section>

    <section class="landing-cta container">
      <img
        class="cta-landscape"
        src="/images/next-chapter-landscape.png"
        alt=""
        loading="lazy"
        width="1672"
        height="941"
      />
      <h2>
        Great stories deserve
        <span class="inline-poster" aria-hidden="true"
          ><img src="/images/naruto.jpg" alt="" loading="lazy" width="120" height="72" /></span
        ><br /><span>a place in yours.</span>
      </h2>
      <RouterLink :to="destination" class="btn btn-primary-action large-button"
        >{{ auth.authenticated ? 'Go to dashboard' : 'Create your account' }}
        <PhArrowUpRight :size="22"
      /></RouterLink>
    </section>
  </main>
</template>

<style scoped>
.landing-page {
  overflow-x: clip;
  width: 100%;
  --landing-accent: #e50914;
}
.landing-hero {
  position: relative;
  min-height: 690px;
  display: flex;
  align-items: center;
  padding-top: 70px;
  padding-bottom: 100px;
  isolation: isolate;
}
.hero-copy {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 900px;
  pointer-events: none;
}
.hero-copy a {
  pointer-events: auto;
}
.hero-eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2.3px;
  text-transform: uppercase;
  color: #c1b5b7;
  margin-bottom: 26px;
}
.hero-copy h1 {
  font-family: Outfit, sans-serif;
  font-size: clamp(44px, 5.9vw, 84px);
  line-height: 1.08;
  letter-spacing: -3.2px;
  font-weight: 600;
  max-width: 900px;
}
.hero-copy h1 span {
  color: #f3b3b8;
}
.hero-description {
  font-size: 15px;
  max-width: 380px;
  line-height: 1.9;
  color: #b9b9c3;
  margin-top: 26px;
}
.landing-actions {
  display: flex;
  align-items: center;
  gap: 26px;
  margin-top: 35px;
}
.hero-art {
  position: absolute;
  inset: 0 -110px 0 46%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  transform: rotate(-11deg);
  z-index: 0;
  overflow: hidden;
  mask-image:
    linear-gradient(to right, transparent, #000 35%),
    linear-gradient(to bottom, transparent, #000 15%, #000 78%, transparent);
  mask-composite: intersect;
  opacity: 0.78;
}
.hero-art::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #11111466, transparent 75%);
  pointer-events: none;
}
.hero-art-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.hero-art-column img {
  width: 100%;
  height: 355px;
  object-fit: cover;
  border-radius: 12px;
  filter: saturate(0.8);
  transition: transform 0.7s;
}
.hero-art-column img:hover {
  transform: scale(1.04);
}
.art-column-one {
  margin-top: 105px;
}
.art-column-two {
  margin-top: -35px;
}
.art-column-three {
  margin-top: 70px;
}
.genre-strip {
  border-block: 1px solid #29292e;
  padding: 29px 0;
  overflow: hidden;
  color: #8d8d99;
}
.genre-track {
  display: flex;
  gap: 50px;
  align-items: center;
  width: max-content;
  font-family: Outfit, sans-serif;
  font-size: 24px;
}
.genre-track svg {
  color: #723d43;
  flex-shrink: 0;
}
.landing-section {
  padding-top: 130px;
  padding-bottom: 40px;
  scroll-margin-top: 80px;
}
.section-intro {
  margin-bottom: 50px;
}
.landing-page h2 {
  font-family: Outfit, sans-serif;
  font-size: clamp(34px, 4vw, 56px);
  line-height: 1.14;
  letter-spacing: -1.8px;
  font-weight: 600;
}
.landing-page h2 span {
  color: #898995;
}
.section-intro p {
  color: #a9a9b5;
  margin-top: 20px;
  font-size: 14px;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: 20px;
}
.feature-tile {
  position: relative;
  border: 1px solid #303038;
  background: #1a1a1f;
  border-radius: 16px;
  overflow: hidden;
  min-height: 320px;
  padding: 36px;
}
.feature-copy {
  position: relative;
  z-index: 1;
  max-width: 350px;
}
.feature-tile h3 {
  font-family: Outfit, sans-serif;
  font-size: 27px;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.5px;
  margin-top: 18px;
}
.feature-tile p {
  color: #b8b8c3;
  font-size: 13px;
  line-height: 1.85;
  margin-top: 16px;
  max-width: 290px;
}
.feature-watch {
  grid-column: span 7;
  min-height: 350px;
}
.feature-watch .feature-copy {
  max-width: 280px;
}
.feature-watch > img {
  position: absolute;
  right: -15px;
  top: -40px;
  width: 250px;
  height: 400px;
  object-fit: cover;
  transform: rotate(13deg);
  opacity: 0.7;
  mask-image: linear-gradient(to left, #000, transparent);
}
.feature-statuses {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 32px;
}
.feature-statuses span {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 9px 12px;
  border: 1px solid #454550;
  border-radius: 7px;
  font-size: 10px;
  background: #17171ed9;
}
.feature-rating {
  grid-column: span 5;
  background: radial-gradient(ellipse at bottom right, #4a2028, transparent 75%), #1a1a1f;
}
.feature-rating > svg {
  color: #f3b3b8;
}
.rating-type {
  position: absolute;
  right: 16px;
  bottom: -55px;
  font-size: 210px;
  line-height: 1;
  color: #f3b3b80c;
  transform: rotate(-15deg);
  pointer-events: none;
}
.feature-favorite {
  grid-column: span 5;
  padding-top: 190px;
}
.favorite-visual {
  position: absolute;
  top: 26px;
  left: 35px;
  right: 35px;
  height: 155px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.favorite-visual img {
  width: 108px;
  height: 160px;
  object-fit: cover;
  transform: rotate(-9deg);
  border-radius: 8px;
}
.favorite-visual svg {
  color: #e50914;
  margin-left: 28px;
  filter: drop-shadow(0 7px 12px #5b1618);
}
.feature-spotlight {
  grid-column: span 7;
  display: flex;
  align-items: flex-end;
  min-height: 340px;
  background: #1e1e24;
}
.feature-spotlight > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  opacity: 0.45;
  mask-image: linear-gradient(to bottom, #000, transparent);
}
.feature-spotlight .feature-copy {
  max-width: 420px;
}
.journey-section {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 90px;
  align-items: start;
  padding-top: 170px;
}
.journey-heading {
  padding-top: 20px;
}
.journey-heading p {
  color: #b8b8c3;
  max-width: 310px;
  line-height: 1.9;
  margin: 24px 0 30px;
  font-size: 14px;
}
.journey-gallery {
  display: grid;
  gap: 50px;
}
.journey-gallery figure {
  margin: 0;
}
.journey-image {
  overflow: hidden;
  border-radius: 16px;
  aspect-ratio: 1.15;
}
.journey-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 25%;
  transition: transform 0.7s;
}
.journey-image:hover img {
  transform: scale(1.04);
}
.journey-gallery figcaption {
  color: #aaaab6;
  margin-top: 18px;
  font-size: 13px;
}
.discover-section {
  padding-top: 140px;
}
.poster-picker {
  display: grid;
  gap: 20px;
  align-items: start;
}
.poster-choice {
  border: 0;
  background: transparent;
  color: #b8b8c3;
  text-align: left;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  min-width: 0;
}
.poster-choice-image {
  display: block;
  height: 330px;
  overflow: hidden;
  border-radius: 12px;
  border: 2px solid transparent;
  opacity: 0.6;
  transition:
    opacity 0.3s,
    border-color 0.3s;
}
.poster-choice img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s;
}
.poster-choice:hover img {
  transform: scale(1.04);
}
.poster-choice.selected .poster-choice-image {
  border-color: #e50914;
  opacity: 1;
}
.poster-choice > span:last-child {
  display: block;
  margin-top: 16px;
  line-height: 1.6;
}
.catalog-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  margin-top: 35px;
  padding-top: 28px;
  border-top: 1px solid #2c2c33;
}
.catalog-detail h3 {
  font-family: Outfit, sans-serif;
  font-size: 26px;
  font-weight: 600;
  margin: 8px 0 12px;
}
.catalog-detail p {
  font-size: 13px;
  line-height: 1.85;
  color: #a9a9b5;
  max-width: 650px;
}
.catalog-detail button {
  flex-shrink: 0;
}
.catalog-genre {
  color: #f3b3b8;
  font-size: 11px;
}
.catalog-state {
  padding: 50px;
  border: 1px solid #303038;
  border-radius: 16px;
}
.catalog-state h3 {
  font-size: 24px;
  font-family: Outfit, sans-serif;
}
.catalog-state p {
  color: #b8b8c3;
  font-size: 14px;
  margin: 15px 0 24px;
}
.catalog-skeleton {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.catalog-skeleton span {
  height: 350px;
  background: #1c1c23;
  border-radius: 12px;
}
.landing-cta {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  text-align: center;
  padding-top: 150px;
  padding-bottom: 140px;
}
.cta-landscape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;
  z-index: -2;
  mask-image: linear-gradient(to bottom, transparent, #000 28%, #000 70%, transparent);
}
.landing-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #11111444;
  z-index: -1;
  pointer-events: none;
}
.landing-cta h2 {
  margin: 24px 0 34px;
  font-size: clamp(36px, 4.7vw, 65px);
}
.landing-cta h2 span {
  color: #f3b3b8;
}
.inline-poster {
  display: inline-block;
  width: 110px;
  height: 65px;
  overflow: hidden;
  border-radius: 50px;
  transform: rotate(-7deg);
  vertical-align: middle;
  margin-left: 10px;
}
.inline-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}
.landing-cta .btn {
  margin: auto;
}
.text-action {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #e4e4eb;
  font-size: 12px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}
.text-action:hover {
  color: #f3b3b8;
}
.large-button {
  padding: 15px 22px;
  font-size: 13px;
  white-space: nowrap;
}
.landing-page .btn-primary-action {
  box-shadow: none;
}
.landing-page .btn-primary-action:hover {
  transform: translateY(-2px);
}
@media (prefers-reduced-motion: no-preference) {
  .genre-track {
    animation: genres-drift 45s linear infinite;
  }
  .genre-strip:hover .genre-track {
    animation-play-state: paused;
  }
  .catalog-skeleton span {
    animation: catalog-pulse 1.5s ease-in-out infinite alternate;
  }
  .catalog-skeleton span:nth-child(2) {
    animation-delay: 0.2s;
  }
  @keyframes genres-drift {
    to {
      transform: translateX(-440px);
    }
  }
  @keyframes catalog-pulse {
    to {
      opacity: 0.45;
    }
  }
}
@media (min-width: 1550px) {
  .landing-hero {
    min-height: 760px;
  }
  .hero-art-column img {
    height: 420px;
  }
}
@media (max-width: 1023px) {
  .landing-hero {
    min-height: 650px;
  }
  .hero-copy h1 {
    font-size: 64px;
  }
  .hero-art {
    left: 35%;
    opacity: 0.45;
  }
  .feature-tile {
    padding: 28px;
  }
  .feature-watch .feature-copy {
    max-width: 220px;
  }
  .feature-watch > img {
    width: 190px;
  }
  .journey-section {
    gap: 40px;
  }
  .journey-heading h2 {
    font-size: 42px;
  }
  .poster-choice-image {
    height: 280px;
  }
}
@media (max-width: 767px) {
  .landing-hero {
    display: block;
    padding-top: 64px;
    padding-bottom: 0;
    min-height: 720px;
  }
  .hero-copy h1 {
    font-size: clamp(36px, 7.4vw, 56px);
    letter-spacing: -1.7px;
  }
  .hero-eyebrow {
    font-size: 10px;
    letter-spacing: 1.6px;
    margin-bottom: 23px;
  }
  .hero-description {
    font-size: 13px;
    max-width: 320px;
    margin-top: 20px;
  }
  .landing-actions {
    gap: 18px;
    flex-wrap: wrap;
    margin-top: 25px;
  }
  .large-button {
    padding: 13px 16px;
    font-size: 12px;
  }
  .text-action {
    font-size: 11px;
  }
  .hero-art {
    inset: 310px -40px 0 -10px;
    transform: rotate(-8deg);
    opacity: 0.6;
    gap: 10px;
    mask-image: linear-gradient(to bottom, transparent, #000 28%, #000 75%, transparent);
  }
  .hero-art-column {
    gap: 10px;
  }
  .hero-art-column img {
    height: 210px;
    border-radius: 8px;
  }
  .art-column-one {
    margin-top: 40px;
  }
  .art-column-two {
    margin-top: 0;
  }
  .art-column-three {
    margin-top: 70px;
  }
  .genre-strip {
    padding: 20px 0;
  }
  .genre-track {
    font-size: 20px;
    gap: 30px;
  }
  .landing-section {
    padding-top: 85px;
    padding-bottom: 0;
  }
  .section-intro {
    margin-bottom: 30px;
  }
  .landing-page h2 {
    font-size: 35px;
    letter-spacing: -1px;
  }
  .section-intro p {
    font-size: 12px;
    max-width: 290px;
    line-height: 1.8;
  }
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .feature-tile {
    grid-column: auto;
    min-height: 280px;
  }
  .feature-watch {
    min-height: 320px;
  }
  .feature-watch .feature-copy {
    max-width: 240px;
  }
  .feature-tile h3 {
    font-size: 25px;
  }
  .feature-favorite {
    padding-top: 180px;
  }
  .feature-spotlight {
    min-height: 320px;
  }
  .journey-section {
    display: block;
    padding-top: 100px;
  }
  .journey-heading {
    margin-bottom: 40px;
  }
  .journey-heading p {
    font-size: 13px;
  }
  .journey-gallery {
    gap: 30px;
  }
  .journey-image {
    aspect-ratio: 1.25;
  }
  .poster-picker {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 20px 14px;
  }
  .poster-choice-image {
    height: 230px;
  }
  .poster-choice > span:last-child {
    font-size: 11px;
  }
  .catalog-detail {
    display: block;
  }
  .catalog-detail h3 {
    font-size: 24px;
  }
  .catalog-detail button {
    margin-top: 20px;
  }
  .catalog-detail p {
    font-size: 12px;
  }
  .catalog-state {
    padding: 28px;
  }
  .catalog-skeleton {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  .catalog-skeleton span {
    height: 230px;
  }
  .landing-cta {
    padding: 100px 20px;
  }
  .landing-cta h2 {
    font-size: 36px;
  }
  .inline-poster {
    display: none;
  }
}
</style>
