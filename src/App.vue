<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { QLayout, QPageContainer, QMenu } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import {
  PhArrowUpRight,
  PhSignOut,
  PhHouse,
  PhBooks,
  PhCompass,
  PhSparkle,
  PhCalendarBlank,
  PhArrowClockwise,
  PhCloudSlash,
  PhUserCircle,
  PhStack,
  PhDotsThree
} from '@phosphor-icons/vue';
import { useAuthStore } from './stores/auth';
import { useWatchlistStore } from './stores/watchlist';
import { useAssistantStore } from './stores/assistant';
import './styles/collections.css';
const auth = useAuthStore();
const watchlist = useWatchlistStore();
const router = useRouter();
const route = useRoute();
const assistant = useAssistantStore();
const logoutError = ref('');
const reconnecting = ref(false);
const starting = computed(() => !route.matched.length && Boolean(auth.restorePromise));
const workspace = computed(
  () => auth.authenticated || Boolean(route.meta.protected && auth.sessionError)
);
const navigation = [
  { to: '/dashboard', label: 'Overview', mobile: 'Home', icon: PhHouse },
  { to: '/watchlist', label: 'My watchlist', mobile: 'Watchlist', icon: PhBooks },
  { to: '/collections', label: 'Collections', mobile: 'Collections', icon: PhStack },
  { to: '/discover', label: 'Discover', mobile: 'Discover', icon: PhCompass },
  { to: '/assistant', label: 'Anime Assistant', mobile: 'Assistant', icon: PhSparkle },
  { to: '/calendar', label: 'Calendar', mobile: 'Calendar', icon: PhCalendarBlank },
  { to: '/account', label: 'Account', mobile: 'Account', icon: PhUserCircle }
];
const currentPage = computed(
  () => route.path.startsWith('/collections') ? 'Collections' : navigation.find((item) => item.to === route.path)?.label || 'Anime details'
);
const mobileNavigation = navigation.slice(0, 4);
const moreNavigation = navigation.slice(4);
watch(
  () => auth.user?.id,
  (next, previous) => {
    if (next !== previous) watchlist.$reset();
    if (previous && next !== previous) assistant.$reset();
    if (!next && previous && route.meta.protected)
      router.replace({ path: '/login', query: { redirect: route.fullPath } });
  },
  { flush: 'sync' }
);
async function logout() {
  logoutError.value = '';
  try {
    await auth.logout();
    watchlist.$reset();
    await router.push('/');
  } catch {
    logoutError.value = 'Could not sign out. Check your connection and try again.';
  }
}
async function reconnect() {
  reconnecting.value = true;
  try {
    await auth.restore();
  } finally {
    reconnecting.value = false;
  }
  if (auth.restored && !auth.authenticated && route.meta.protected)
    await router.replace({ path: '/login', query: { redirect: route.fullPath } });
}
</script>

<template>
  <QLayout class="anitrack-layout" :class="{ 'workspace-mode': workspace, 'collections-mode': route.path.startsWith('/collections') }">
    <a href="#page-content" class="skip-link">Skip to content</a>
    <main v-if="starting" class="startup-state" role="status" aria-label="Opening AniTrack">
      <span class="logo-icon" aria-hidden="true">⛩️</span>
      <h1>AniTrack</h1>
      <div class="startup-progress" />
      <p>Opening your next chapter…</p>
    </main>
    <template v-else-if="workspace">
      <aside class="workspace-sidebar">
        <RouterLink to="/dashboard" class="workspace-brand" aria-label="AniTrack overview"
          ><span class="logo-icon" aria-hidden="true">⛩️</span
          ><span class="wordmark">AniTrack</span></RouterLink
        >
        <p class="sidebar-caption">YOUR SPACE</p>
        <nav aria-label="Main navigation">
          <RouterLink v-for="item in navigation" :key="item.to" :to="item.to"
            ><component
              :is="item.icon"
              :size="21"
              :weight="route.path === item.to ? 'fill' : 'regular'"
            /><span>{{ item.label }}</span
            ><span v-if="item.to === '/watchlist' && watchlist.loaded" class="sidebar-count">{{
              watchlist.items.length
            }}</span></RouterLink
          >
        </nav>
        <div class="sidebar-bottom">
          <p>Your anime.<br /><strong>Your pace.</strong></p>
          <div class="workspace-account">
            <span class="account-avatar">{{
              auth.user?.name?.charAt(0).toUpperCase() || 'A'
            }}</span>
            <div>
              <strong>{{ auth.user?.name || 'Your account' }}</strong
              ><small>Personal library</small>
            </div>
            <button
              v-if="auth.authenticated"
              class="icon-button"
              aria-label="Log out"
              :disabled="auth.loading"
              @click="logout"
            >
              <PhSignOut :size="21" />
            </button>
          </div>
        </div>
      </aside>
      <header class="workspace-topbar">
        <RouterLink to="/dashboard" class="workspace-mobile-brand" aria-label="AniTrack overview"
          ><span class="logo-icon" aria-hidden="true">⛩️</span
          ><span class="wordmark">AniTrack</span></RouterLink
        ><span class="workspace-breadcrumb"
          >Your space <span>/</span> <strong>{{ currentPage }}</strong></span
        ><span class="workspace-top-note">A good story is always worth keeping.</span
        ><button
          v-if="auth.authenticated"
          class="icon-button workspace-mobile-logout"
          aria-label="Log out"
          :disabled="auth.loading"
          @click="logout"
        >
          <PhSignOut :size="21" />
        </button>
      </header>
      <nav class="workspace-mobile-nav" aria-label="Mobile navigation">
        <RouterLink v-for="item in mobileNavigation" :key="item.to" :to="item.to"
          ><component
            :is="item.icon"
            :size="23"
            :weight="route.path === item.to ? 'fill' : 'regular'"
          /><span>{{ item.mobile }}</span></RouterLink
        >
        <button class="mobile-more-button" :class="{ 'router-link-active': moreNavigation.some(item => item.to === route.path) }" aria-label="More navigation">
          <PhDotsThree :size="23" /><span>More</span>
          <QMenu class="mobile-more-menu" anchor="top right" self="bottom right" :offset="[0, 12]">
            <nav aria-label="More destinations"><RouterLink v-for="item in moreNavigation" :key="item.to" v-close-popup :to="item.to"><component :is="item.icon" :size="21" />{{ item.label }}</RouterLink></nav>
          </QMenu>
        </button>
      </nav>
    </template>
    <template v-else>
      <header class="site-header app-header">
        <div class="container header-content">
          <RouterLink to="/" class="logo-area" aria-label="AniTrack home"
            ><span class="logo-icon" aria-hidden="true">⛩️</span
            ><span class="wordmark">AniTrack</span></RouterLink
          >
          <nav class="main-nav" aria-label="Main navigation">
            <RouterLink to="/#features">Features</RouterLink
            ><RouterLink to="/#discover">Discover</RouterLink
            ><RouterLink to="/#assistant">Anime Assistant</RouterLink>
          </nav>
          <div class="header-actions">
            <RouterLink to="/login" class="login-link">Log in</RouterLink
            ><RouterLink to="/register" class="btn btn-primary-action"
              >Get started <PhArrowUpRight :size="17"
            /></RouterLink>
          </div>
        </div>
      </header>
      <nav
        v-if="!['/login', '/register'].includes(route.path)"
        class="mobile-app-nav"
        aria-label="Explore AniTrack"
      >
        <RouterLink to="/#features">Features</RouterLink
        ><RouterLink to="/#discover">Discover</RouterLink
        ><RouterLink to="/#assistant">Anime Assistant</RouterLink>
      </nav>
    </template>
    <QPageContainer v-if="!starting"
      ><div id="page-content" tabindex="-1">
        <p v-if="logoutError" class="app-feedback error-feedback" role="alert">
          {{ logoutError }} <button @click="logout">Try again</button>
        </p>
        <section
          v-if="route.meta.protected && auth.sessionError && !auth.authenticated"
          class="session-recovery"
          role="alert"
        >
          <PhCloudSlash :size="42" />
          <h1>Let’s reconnect.</h1>
          <p>{{ auth.sessionError }}</p>
          <button class="btn btn-primary-action" :disabled="reconnecting" @click="reconnect">
            <PhArrowClockwise :size="19" />{{
              reconnecting ? 'Reconnecting…' : 'Try again'
            }}</button
          ><RouterLink to="/">About AniTrack</RouterLink>
        </section>
        <RouterView v-else /></div
    ></QPageContainer>
    <footer v-if="!workspace && !starting" class="app-footer container">
      <RouterLink to="/" class="footer-wordmark">AniTrack</RouterLink>
      <p>Your anime journey, in one place.</p>
      <RouterLink to="/#features">Explore AniTrack <PhArrowUpRight :size="16" /></RouterLink
      ><span>© {{ new Date().getFullYear() }} AniTrack</span>
    </footer>
  </QLayout>
</template>
