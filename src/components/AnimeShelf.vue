<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { PhArrowLeft, PhArrowRight } from '@phosphor-icons/vue';
defineProps<{ title: string; description?: string; href?: string; loading?: boolean }>();
const rail = ref<HTMLElement>();
const atStart = ref(true);
const atEnd = ref(false);
let observer: ResizeObserver | undefined;
function update() {
  if (!rail.value) return;
  atStart.value = rail.value.scrollLeft < 2;
  atEnd.value = rail.value.scrollLeft + rail.value.clientWidth >= rail.value.scrollWidth - 2;
}
function move(direction: number) {
  rail.value?.scrollBy({
    left: direction * rail.value.clientWidth * 0.85,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  });
}
onMounted(() => {
  observer = new ResizeObserver(update);
  if (rail.value) observer.observe(rail.value);
  update();
});
onBeforeUnmount(() => observer?.disconnect());
</script>
<template>
  <section class="content-section" :aria-label="title">
    <header class="section-heading">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <div class="shelf-actions">
        <RouterLink v-if="href" :to="href">View all <PhArrowRight :size="16" /></RouterLink
        ><button
          class="icon-button"
          :aria-label="`Previous ${title.toLowerCase()}`"
          :disabled="atStart || loading"
          @click="move(-1)"
        >
          <PhArrowLeft :size="20" /></button
        ><button
          class="icon-button"
          :aria-label="`Next ${title.toLowerCase()}`"
          :disabled="atEnd || loading"
          @click="move(1)"
        >
          <PhArrowRight :size="20" />
        </button>
      </div>
    </header>
    <div
      ref="rail"
      class="anime-shelf"
      tabindex="0"
      :aria-label="`${title} carousel`"
      @scroll.passive="update"
    >
      <template v-if="loading"
        ><div v-for="n in 6" :key="n" class="poster-skeleton" aria-hidden="true">
          <div class="skeleton-cover" />
          <div class="skeleton-line" />
          <div class="skeleton-line short" />
        </div>
        <span class="sr-only" role="status">Loading {{ title.toLowerCase() }}…</span></template
      ><slot v-else />
    </div>
  </section>
</template>
