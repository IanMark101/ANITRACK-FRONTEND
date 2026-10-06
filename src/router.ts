import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
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
      meta: { protected: true, title: 'Your watchlist' }
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('./views/NotFound.vue'),
      meta: { title: 'Page not found' }
    }
  ],
  scrollBehavior(to) {
    return to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 };
  }
});
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.restore();
  if (to.meta.protected && !auth.authenticated)
    return { path: '/login', query: { redirect: to.fullPath } };
  if (to.meta.guestOnly && auth.authenticated) return '/dashboard';
});
router.afterEach((to) => {
  document.title = `AniTrack | ${to.meta.title ?? 'Anime watchlist'}`;
});
