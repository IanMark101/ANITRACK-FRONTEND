import { defineRouter } from '#q-app';
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';

export default defineRouter(({ store }) => {
  const router = createRouter({
    history:
      import.meta.env.QUASAR_VUE_ROUTER_MODE === 'hash'
        ? createWebHashHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
        : createWebHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
    routes: [
      { path: '/collections/:id?', component: () => import('./views/Collections.vue'), meta: { protected: true, title: 'Your collections' } },
      { path: '/account', component: () => import('./views/Account.vue'), meta: { protected: true, title: 'Your account' } },
      { path: '/forgot-password', component: () => import('./views/AccountLink.vue'), meta: { title: 'Reset your password' } },
      { path: '/reset-password', component: () => import('./views/AccountLink.vue'), meta: { title: 'Choose a password' } },
      { path: '/verify-email', component: () => import('./views/AccountLink.vue'), meta: { title: 'Verify your email' } },
      {
        path: '/assistant',
        component: () => import('./views/Assistant.vue'),
        meta: { protected: true, title: 'Anime Assistant' }
      },
      {
        path: '/discover',
        component: () => import('./views/Discover.vue'),
        meta: { protected: true, title: 'Discover anime' }
      },
      {
        path: '/anime/kitsu/:id',
        component: () => import('./views/AnimeDetails.vue'),
        meta: { protected: true, title: 'Anime details' }
      },
      {
        path: '/anime/local/:id',
        component: () => import('./views/CatalogDetails.vue'),
        meta: { protected: true, title: 'Anime details' }
      },
      {
        path: '/calendar',
        component: () => import('./views/Calendar.vue'),
        meta: { protected: true, title: 'Your airing calendar' }
      },
      {
        path: '/',
        component: () => import('./views/Landing.vue'),
        meta: { title: 'Your next chapter' }
      },
      {
        path: '/login',
        component: () => import('./views/Auth.vue'),
        meta: { guestOnly: true, title: 'Log in' }
      },
      {
        path: '/register',
        component: () => import('./views/Auth.vue'),
        meta: { guestOnly: true, title: 'Create account' }
      },
      {
        path: '/dashboard',
        component: () => import('./views/Dashboard.vue'),
        meta: { protected: true, title: 'Your overview' }
      },
      {
        path: '/watchlist',
        component: () => import('./views/Watchlist.vue'),
        meta: { protected: true, title: 'Your watchlist' }
      },
      {
        path: '/:pathMatch(.*)*',
        component: () => import('./views/NotFound.vue'),
        meta: { title: 'Page not found' }
      }
    ],
    scrollBehavior(to) {
      return to.hash && !to.hash.startsWith('#token=') ? { el: to.hash, behavior: 'smooth' } : { top: 0 };
    }
  });
  router.beforeEach(async (to) => {
    const auth = useAuthStore(store);
    await auth.restore();
    if (to.meta.protected && !auth.authenticated && !auth.sessionError)
      return { path: '/login', query: { redirect: to.fullPath } };
    if (to.path === '/' && auth.authenticated) return '/dashboard';
    if (to.meta.guestOnly && auth.authenticated) return '/dashboard';
  });
  router.afterEach((to) => {
    document.title = `AniTrack | ${to.meta.title ?? 'Anime watchlist'}`;
  });
  return router;
});
