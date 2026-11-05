<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  PhArrowRight,
  PhArrowUpRight,
  PhBookmarkSimple,
  PhHeart,
  PhStar,
  PhPlay,
  PhCheck
} from '@phosphor-icons/vue';
import { useAuthStore } from '../stores/auth';
import LandingFeatures from '../components/LandingFeatures.vue';

const auth = useAuthStore();
const page = ref<HTMLElement | null>(null);
const destination = computed(() => (auth.authenticated ? '/dashboard' : '/register'));
let alive = true;
let cleanup = () => {};
onMounted(async () => {
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
        y: 16,
        duration: 0.6,
        stagger: 0.08,
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
        <h1>Your anime.<br />Your next chapter.</h1>
        <p class="hero-description">
          Keep the stories you love close. Track your watches, rate your favorites, and find what
          comes next.
        </p>
        <div class="landing-actions">
          <RouterLink :to="destination" class="btn btn-primary-action large-button"
            >{{ auth.authenticated ? 'Go to dashboard' : 'Start your watchlist' }}
            <PhArrowUpRight :size="21" /></RouterLink
          ><RouterLink to="/#assistant" class="text-action"
            >Meet Anime Assistant <PhArrowRight :size="20"
          /></RouterLink>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="hero-art-column art-column-one">
          <img
            src="/images/editorial/frieren.webp"
            alt=""
            width="250"
            height="360"
            fetchpriority="high"
          /><img src="/images/editorial/spy-family.webp" alt="" width="250" height="360" />
        </div>
        <div class="hero-art-column art-column-two">
          <img
            src="/images/editorial/fullmetal-alchemist.webp"
            alt=""
            width="250"
            height="360"
            fetchpriority="high"
          /><img src="/images/editorial/cowboy-bebop.webp" alt="" width="250" height="360" />
        </div>
        <div class="hero-art-column art-column-three">
          <img src="/images/editorial/demon-slayer.webp" alt="" width="250" height="360" /><img
            src="/images/editorial/chainsaw-man.webp"
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
        <h2>Track every chapter.</h2>
        <p>One personal collection, built around how you watch.</p>
      </div>
      <div class="feature-grid">
        <article class="feature-tile feature-watch">
          <div class="feature-copy">
            <PhBookmarkSimple :size="30" />
            <h3>Your watchlist.</h3>
            <p>Watching, completed, or saved for later. Keep your next adventure within reach.</p>
          </div>
          <img
            src="/images/editorial/haikyu.webp"
            alt="Haikyu anime key visual"
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
        </article>
        <article class="feature-tile feature-favorite">
          <div class="favorite-visual">
            <img
              src="/images/editorial/violet-evergarden.webp"
              alt="Violet Evergarden anime key visual"
              loading="lazy"
              width="240"
              height="340"
            /><PhHeart :size="52" weight="fill" />
          </div>
          <div class="feature-copy">
            <h3>Your favorites.</h3>
            <p>A heart for the stories you’ll always come back to.</p>
          </div>
        </article>
        <article class="feature-tile feature-spotlight">
          <img
            src="/images/editorial/howls-moving-castle.webp"
            alt="Howl's moving castle floating among the clouds"
            loading="lazy"
            width="1440"
            height="779"
          />
          <div class="feature-copy">
            <h3>Your spotlight.</h3>
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
              src="/images/editorial/castle-in-the-sky.webp"
              alt="Overgrown towers and gardens of Laputa in Castle in the Sky"
              loading="lazy"
              width="1440"
              height="779"
            />
          </div>
          <figcaption>For the worlds you get lost in.</figcaption>
        </figure>
        <figure>
          <div class="journey-image">
            <img
              src="/images/editorial/spirited-away.webp"
              alt="Chihiro and Haku facing each other in Spirited Away"
              loading="lazy"
              width="1440"
              height="779"
            />
          </div>
          <figcaption>For the stories that stay with you.</figcaption>
        </figure>
      </div>
    </section>

    <LandingFeatures />

    <section class="landing-cta container">
      <img
        class="cta-landscape"
        src="/images/editorial/next-chapter-landscape.webp"
        alt=""
        loading="lazy"
        width="1600"
        height="900"
      />
      <h2>
        Your next story.<br /><span>Starts here.</span>
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
}
.hero-copy h1 {
  font-family: Outfit, sans-serif;
  font-size: clamp(44px, 5.9vw, 84px);
  line-height: 1.08;
  letter-spacing: -3.2px;
  font-weight: 600;
  max-width: 900px;
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
  padding: 29px 20px;
  color: #8d8d99;
}
.genre-track {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px 32px;
  align-items: center;
  font-family: Outfit, sans-serif;
  font-size: 24px;
}
.genre-track [aria-hidden='true'] {
  display: none;
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
  font-size: 13px;
  background: #17171ed9;
}
.feature-rating {
  grid-column: span 5;
  background: #241d21;
}
.feature-rating > svg {
  color: #f3b3b8;
}
.feature-favorite {
  grid-column: span 5;
}
.favorite-visual {
  position: relative;
  height: 155px;
  margin-bottom: 28px;
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
  aspect-ratio: 1.5;
}
.journey-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
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
.landing-cta .btn {
  margin: auto;
}
.text-action {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #e4e4eb;
  font-size: 14px;
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
  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .feature-tile {
    grid-column: auto;
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
    display: flex;
    align-items: center;
    padding-top: 40px;
    padding-bottom: 40px;
    min-height: min(580px, calc(100svh - 108px));
    overflow: hidden;
  }
  .hero-copy h1 {
    font-size: clamp(32px, 9vw, 40px);
    letter-spacing: -1.2px;
  }
  .hero-description {
    font-size: 16px;
    line-height: 1.75;
    max-width: 36ch;
    margin-top: 16px;
  }
  .landing-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-top: 24px;
  }
  .large-button {
    min-height: 48px;
    padding: 12px 16px;
    font-size: 14px;
  }
  .text-action {
    min-height: 44px;
    font-size: 14px;
  }
  .landing-actions .text-action {
    justify-content: center;
  }
  .hero-art {
    /* The posters remain one backdrop inside the hero, with copy above the scrim. */
    position: absolute;
    inset: -30px -60px -30px 20%;
    height: auto;
    margin: 0;
    transform: rotate(-10deg);
    opacity: .55;
    gap: 10px;
    mask-image: none;
    border-radius: 0;
  }
  .hero-art::after {
    display: block;
    /* taste-skill-ignore: gradient -- neutral scrim over real cover art for legibility. */
    background: linear-gradient(90deg, #101012f5, #101012bd 38%, #10101266 100%);
  }
  .hero-art-column {
    gap: 10px;
  }
  .hero-art-column img {
    height: 240px;
    aspect-ratio: auto;
    border-radius: 8px;
  }
  .art-column-one {
    margin-top: -70px;
  }
  .art-column-two {
    margin-top: 15px;
  }
  .art-column-three {
    margin-top: -45px;
  }
  .genre-strip {
    padding: 20px;
  }
  .genre-track {
    font-size: 20px;
    gap: 16px 20px;
  }
  .genre-track svg {
    display: none;
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
    font-size: 14px;
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
  .landing-cta {
    padding: 100px 20px;
  }
  .landing-cta h2 {
    font-size: 36px;
  }
}
</style>
