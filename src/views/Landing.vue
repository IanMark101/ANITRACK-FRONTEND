<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { PhArrowRight, PhArrowUpRight } from '@phosphor-icons/vue';
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
      gsap.utils.toArray<HTMLElement>('.product-story [data-ui]', page.value).forEach((sample) => {
        gsap.from(sample, {
          y: 18,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: { trigger: sample, start: 'top 92%', once: true }
        });
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
        <div class="hero-intro">
          <h1><span class="hero-title-desktop">Your anime.<br />Your next chapter.</span><span class="hero-title-mobile">Your anime.<br />Your space.</span></h1>
          <div class="hero-mobile-art" aria-hidden="true">
            <img src="/images/editorial/frieren.webp" alt="" width="250" height="360" />
            <img src="/images/editorial/fullmetal-alchemist.webp" alt="" width="250" height="360" />
            <img src="/images/editorial/demon-slayer.webp" alt="" width="250" height="360" />
          </div>
        </div>
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
        Start your watchlist.
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
.hero-title-mobile,
.hero-mobile-art {
  display: none;
}
.hero-mobile-art,
.hero-art {
  pointer-events: none;
}
.hero-copy h1 {
  font-family: Outfit, sans-serif; /* taste-skill-ignore: default-font -- AniTrack's installed brand typeface. */
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
    linear-gradient(to right, transparent, #000 35%), /* taste-skill-ignore: gradient -- alpha mask fades the existing desktop cover art. */
    linear-gradient(to bottom, transparent, #000 15%, #000 78%, transparent); /* taste-skill-ignore: gradient -- alpha mask, not a colored surface. */
  mask-composite: intersect;
  opacity: 0.78;
}
.hero-art::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #11111466, transparent 75%); /* taste-skill-ignore: gradient -- neutral scrim over cover art for readable copy. */
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
  mask-image: linear-gradient(to bottom, transparent, #000 28%, #000 70%, transparent); /* taste-skill-ignore: gradient -- neutral alpha fade on the landscape image. */
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
  box-shadow: none; /* taste-skill-ignore: shadow -- removes the inherited button shadow. */
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

}
@media (max-width: 767px) {
  .landing-hero {
    display: block;
    padding-top: 28px;
    padding-bottom: 24px;
    min-height: 0;
    overflow: hidden;
  }
  .hero-intro {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hero-title-desktop {
    display: none;
  }
  .hero-title-mobile {
    display: inline;
  }
  .hero-copy h1 {
    flex: 1;
    min-width: 0;
    font-size: clamp(28px, 8vw, 34px);
    line-height: 1.15;
    letter-spacing: -.8px;
  }
  .hero-mobile-art {
    display: block;
    position: relative;
    flex: 0 0 clamp(112px, 34vw, 136px);
    height: 152px;
  }
  .hero-mobile-art img {
    position: absolute;
    top: 12px;
    width: 62%;
    height: auto;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: 6px;
  }
  .hero-mobile-art img:nth-child(1) {
    left: 2%;
    transform: rotate(-12deg);
  }
  .hero-mobile-art img:nth-child(2) {
    left: 19%;
    top: 4px;
  }
  .hero-mobile-art img:nth-child(3) {
    left: 36%;
    transform: rotate(12deg);
  }
  .hero-description {
    font-size: 15px;
    line-height: 1.7;
    max-width: 36ch;
    margin-top: 16px;
  }
  .landing-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-top: 20px;
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
    display: none;
  }
  .landing-cta {
    padding: 100px 20px;
  }
  .landing-cta h2 {
    font-size: 28px;
  }
}
</style>
