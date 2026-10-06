<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { PhArrowUpRight, PhSignOut } from '@phosphor-icons/vue';
import { useAuthStore } from './stores/auth';
import { useWatchlistStore } from './stores/watchlist';
const auth = useAuthStore();
const watchlist = useWatchlistStore();
const router = useRouter();
const logoutError = ref('');
watch(
  () => auth.user?.id,
  (next, previous) => {
    if (next !== previous) watchlist.$reset();
    if (!next && router.currentRoute.value.meta.protected) router.replace('/login');
  }
);
async function logout() {
  logoutError.value = '';
  try {
    await auth.logout();
    watchlist.$reset();
    await router.push('/');
  } catch (error) {
    logoutError.value = error instanceof Error ? error.message : 'Could not log out. Try again.';
  }
}
</script>

<template>
  <a href="#page-content" class="skip-link">Skip to content</a>
  <header class="site-header app-header">
    <div class="container header-content">
      <RouterLink to="/" class="logo-area" aria-label="AniTrack home"
        ><span class="logo-icon">⛩️</span
        ><span class="logo-text"><span class="wordmark">AniTrack</span></span></RouterLink
      >
      <nav class="main-nav" aria-label="Main navigation">
        <RouterLink to="/#features">Features</RouterLink
        ><RouterLink to="/#discover">Discover</RouterLink>
      </nav>
      <div class="header-actions">
        <template v-if="auth.authenticated"
          ><RouterLink to="/dashboard" class="btn btn-primary-action"
            >Dashboard <PhArrowUpRight :size="17" /></RouterLink
          ><button
            class="icon-button"
            :disabled="auth.loading"
            aria-label="Log out"
            @click="logout"
          >
            <PhSignOut :size="21" /></button
        ></template>
        <template v-else
          ><RouterLink to="/login" class="login-link">Log in</RouterLink
          ><RouterLink to="/register" class="btn btn-primary-action"
            >Get started <PhArrowUpRight :size="17" /></RouterLink
        ></template>
      </div>
    </div>
  </header>
  <p v-if="logoutError" class="global-error" role="alert">{{ logoutError }}</p>
  <div id="page-content"><RouterView /></div>
  <footer class="app-footer container">
    <RouterLink to="/" class="footer-wordmark">AniTrack</RouterLink>
    <p>Your anime journey, in one place.</p>
    <a href="https://anilist.co" target="_blank" rel="noopener noreferrer"
      >Explore AniList <PhArrowUpRight :size="16" /></a
    ><span>© {{ new Date().getFullYear() }} AniTrack</span>
  </footer>
</template>
