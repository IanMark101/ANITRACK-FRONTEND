import { defineStore } from 'pinia';
import { api, ApiError, jsonBody, observeSession, refreshSession, setAccessToken } from '../api';
import type { Session, User } from '../types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    restoration: 0,
    user: null as User | null,
    restored: false,
    loading: false,
    sessionError: '',
    restorePromise: null as Promise<void> | null
  }),
  getters: { authenticated: (state) => Boolean(state.user) },
  actions: {
    bind() {
      observeSession((session) => {
        this.user = session?.user ?? null;
        if (session) this.sessionError = '';
      });
    },
    async restore() {
      if (this.restored) return;
      if (this.restorePromise) return this.restorePromise;
      this.bind();
      const restoration = this.restoration;
      this.restorePromise = (async () => {
        try {
          await refreshSession();
          if (restoration !== this.restoration) return;
          this.sessionError = '';
          this.restored = true;
        } catch (error) {
          if (restoration !== this.restoration) return;
          if (error instanceof ApiError && error.status === 401) {
            this.sessionError = '';
            this.restored = true;
          } else {
            this.sessionError =
              'We could not reconnect to AniTrack. Your session may still be valid. Please try again.';
          }
        } finally {
          if (restoration === this.restoration) this.restorePromise = null;
        }
      })();
      return this.restorePromise;
    },
    async authenticate(
      mode: 'login' | 'register',
      input: { email: string; password: string; name?: string }
    ) {
      this.loading = true;
      const restoration = ++this.restoration;
      this.restorePromise = null;
      setAccessToken(null);
      try {
        const session = await api<Session>(`/auth/${mode}`, {
          method: 'POST',
          body: jsonBody(input)
        });
        if (restoration !== this.restoration) return;
        this.user = session.user;
        setAccessToken(session.accessToken);
        this.sessionError = '';
        this.restored = true;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      this.loading = true;
      try {
        await api('/auth/logout', { method: 'POST' });
        this.clear();
      } finally {
        this.loading = false;
      }
    },
    clear() {
      this.restoration++;
      this.restorePromise = null;
      setAccessToken(null);
      this.user = null;
      this.restored = true;
      this.sessionError = '';
    }
  }
});
