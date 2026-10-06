import { defineStore } from 'pinia';
import { api, ApiError, jsonBody, observeSession, refreshSession, setAccessToken } from '../api';
import type { Session, User } from '../types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
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
      });
    },
    async restore() {
      if (this.restored) return;
      if (this.restorePromise) return this.restorePromise;
      this.bind();
      this.restorePromise = (async () => {
        try {
          await refreshSession();
          this.sessionError = '';
        } catch (error) {
          if (!(error instanceof ApiError) || error.status !== 401)
            this.sessionError =
              error instanceof Error ? error.message : 'Unable to restore session.';
        } finally {
          this.restored = true;
          this.restorePromise = null;
        }
      })();
      return this.restorePromise;
    },
    async authenticate(
      mode: 'login' | 'register',
      input: { email: string; password: string; name?: string }
    ) {
      this.loading = true;
      try {
        const session = await api<Session>(`/auth/${mode}`, {
          method: 'POST',
          body: jsonBody(input)
        });
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
        this.user = null;
        setAccessToken(null);
      } finally {
        this.loading = false;
      }
    }
  }
});
