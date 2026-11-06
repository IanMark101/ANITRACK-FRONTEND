<script setup lang="ts">
import { PhArrowRight } from '@phosphor-icons/vue';
</script>

<template>
  <div class="member-feature-stories container">
    <section id="discover" class="member-feature-story" aria-labelledby="discovery-intro">
      <div class="member-feature-copy">
        <h2 id="discovery-intro">Discover your next anime.</h2>
        <p>Find a new story by title or genre. Browse popular picks, top-rated anime, seasonal releases, and upcoming titles, then save the ones you want to watch.</p>
        <p class="member-feature-access">Discover is part of your signed-in AniTrack workspace.</p>
        <RouterLink :to="{ path: '/login', query: { redirect: '/discover' } }" class="member-feature-action">Log in to discover <PhArrowRight :size="20" /></RouterLink>
      </div>
      <img src="/images/editorial/haikyu.webp" alt="Haikyu anime artwork" width="600" height="420" loading="lazy" />
    </section>
    <section id="assistant" class="member-feature-story assistant-feature-story" aria-labelledby="assistant-intro">
      <div class="member-feature-copy">
        <h2 id="assistant-intro">A story in mind.<br />A title to find.</h2>
        <p>Anime Assistant helps identify a forgotten anime from the scenes you remember, or suggests something to watch based on your tastes. Follow-up questions help narrow the search.</p>
        <p class="member-feature-access">Sign in to use the AI assistant and save suggestions to your watchlist.</p>
        <RouterLink :to="{ path: '/login', query: { redirect: '/assistant' } }" class="member-feature-action">Log in to use Anime Assistant <PhArrowRight :size="20" /></RouterLink>
      </div>
      <img src="/images/editorial/whisper-of-the-heart.webp" alt="Shizuku looking across the city in Whisper of the Heart" width="600" height="420" loading="lazy" />
    </section>
  </div>
</template>

<style scoped>
.member-feature-stories { padding-top: 100px; }
.member-feature-story { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 64px; padding-block: 64px; scroll-margin-top: 100px; }
.member-feature-copy { min-width: 0; }
.member-feature-story h2 { font: 600 clamp(34px, 4vw, 56px)/1.1 Outfit, sans-serif; letter-spacing: -.035em; margin: 0 0 24px; color: #f5f5f5; }
.member-feature-story p { font: 400 16px/1.75 'Plus Jakarta Sans', sans-serif; max-width: 58ch; color: #c7c7c7; margin: 0 0 18px; }
.member-feature-story .member-feature-access { color: #f1f1f1; }
.member-feature-action { display: inline-flex; align-items: center; gap: 12px; min-height: 44px; padding-block: 10px; color: #fff; font: 600 15px/1.5 'Plus Jakarta Sans', sans-serif; text-decoration: none; }
.member-feature-action:hover { color: #f3b3b8; }
.member-feature-action:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }
.member-feature-story > img { display: block; width: 100%; height: auto; aspect-ratio: 10 / 7; object-fit: cover; border-radius: 8px; }
.assistant-feature-story .member-feature-copy { grid-column: 2; grid-row: 1; }
.assistant-feature-story > img { grid-column: 1; grid-row: 1; }
@media (max-width: 800px) {
  .member-feature-stories { padding-top: 48px; }
  .member-feature-story { grid-template-columns: minmax(0, 1fr); gap: 28px; padding-block: 40px; scroll-margin-top: 92px; }
  .member-feature-story h2 { font-size: 28px; max-width: 20ch; }
  .assistant-feature-story .member-feature-copy, .assistant-feature-story > img { grid-column: auto; grid-row: auto; }
  .member-feature-story > img { max-height: 360px; }
}
</style>
