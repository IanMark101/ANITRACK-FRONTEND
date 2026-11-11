import { defineStore } from 'pinia';
import { api, jsonBody } from '../api';
import type { Anime, Collection, Entry, Metadata } from '../types';

export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({
    requestScope: {},
    writeVersion: 0,
    items: [] as Entry[],
    spotlightId: null as string | null,
    catalog: [] as Anime[],
    metadata: { genres: [], statuses: [], posters: [] } as Metadata,
    loading: false,
    loaded: false,
    loadPromise: null as Promise<void> | null,
    busy: false,
    loadError: '',
    actionError: ''
  }),
  actions: {
    async importAnime(externalId: string) {
      return this.mutate(async (acceptResult) => {
        const result = await api<{ item: Entry; created: boolean }>('/watchlist/import', {
          method: 'POST',
          body: jsonBody({ externalId })
        });
        if (!acceptResult()) return;
        const index = this.items.findIndex((entry) => entry.id === result.item.id);
        if (index === -1) this.items.unshift(result.item);
        else this.items[index] = result.item;
        if (result.created) this.spotlightId = result.item.id;
        return result.item;
      });
    },
    async progress(id: string, delta: 1 | -1) {
      return this.mutate(async (acceptResult) => {
        const { item } = await api<{ item: Entry }>(`/watchlist/${id}/progress`, {
          method: 'POST',
          body: jsonBody({ delta })
        });
        if (!acceptResult()) return;
        const index = this.items.findIndex((entry) => entry.id === id);
        if (index !== -1) this.items[index] = item;
        return item;
      });
    },
    async load() {
      if (this.loadPromise) return this.loadPromise;
      const scope = this.requestScope;
      this.loading = true;
      this.loadError = '';
      this.loadPromise = (async () => {
        try {
          while (scope === this.requestScope) {
            const version = this.writeVersion;
            const collection = await api<Collection>('/watchlist');
            if (scope !== this.requestScope) return;
            let page = 1;
            let next = collection.hasNext;
            while (next && page < 250 && version === this.writeVersion) {
              const extra = await api<Collection>(`/watchlist?page=${++page}`);
              if (scope !== this.requestScope) return;
              collection.items.push(...extra.items);
              next = extra.hasNext;
            }
            // A read started before a confirmed write can return an older list.
            if (version !== this.writeVersion) continue;
            if (next) throw new Error('Your collection is too large to load. Please contact support.');
            this.items = collection.items;
            this.spotlightId = collection.spotlightId;
            this.loaded = true;
            return;
          }
        } catch (error) {
          if (scope !== this.requestScope) return;
          this.loadError = error instanceof Error ? error.message : 'Unable to load collection.';
        } finally {
          if (scope === this.requestScope) {
            this.loading = false;
            this.loadPromise = null;
          }
        }
      })();
      return this.loadPromise;
    },
    async loadMetadata() {
      if (this.metadata.genres.length) return;
      const scope = this.requestScope;
      const metadata = await api<Metadata>('/anime/meta');
      if (scope !== this.requestScope) return;
      this.metadata = metadata;
    },
    async mutate<T>(operation: (acceptResult: () => boolean) => Promise<T>): Promise<T | undefined> {
      if (this.busy) return;
      const scope = this.requestScope;
      const current = () => scope === this.requestScope;
      this.busy = true;
      this.actionError = '';
      try {
        return await operation(() => {
          if (!current()) return false;
          this.writeVersion++;
          return true;
        });
      } catch (error) {
        if (!current()) return;
        this.actionError = error instanceof Error ? error.message : 'Could not save your change.';
        throw error;
      } finally {
        if (current()) this.busy = false;
      }
    },
    async add(input: unknown) {
      return this.mutate(async (acceptResult) => {
        const { item } = await api<{ item: Entry }>('/watchlist', {
          method: 'POST',
          body: jsonBody(input)
        });
        if (!acceptResult()) return;
        this.items.unshift(item);
        this.spotlightId = item.id;
        return item;
      });
    },
    async update(id: string, changes: Partial<Entry>) {
      return this.mutate(async (acceptResult) => {
        const { item } = await api<{ item: Entry }>(`/watchlist/${id}`, {
          method: 'PATCH',
          body: jsonBody(changes)
        });
        if (!acceptResult()) return;
        const index = this.items.findIndex((entry) => entry.id === id);
        if (index !== -1) this.items[index] = item;
        return item;
      });
    },
    async remove(id: string) {
      return this.mutate(async (acceptResult) => {
        await api(`/watchlist/${id}`, { method: 'DELETE' });
        if (!acceptResult()) return;
        this.items = this.items.filter((entry) => entry.id !== id);
        if (this.spotlightId === id) this.spotlightId = null;
        return true;
      });
    },
    async spotlight(id: string) {
      return this.mutate(async (acceptResult) => {
        await api('/watchlist/spotlight', { method: 'PUT', body: jsonBody({ entryId: id }) });
        if (!acceptResult()) return;
        this.spotlightId = id;
        return true;
      });
    },
    async reset() {
      return this.mutate(async (acceptResult) => {
        const collection = await api<Collection>('/watchlist/reset', { method: 'POST' });
        if (!acceptResult()) return;
        this.items = collection.items;
        this.spotlightId = collection.spotlightId;
        if (collection.hasNext) await this.load();
        return true;
      });
    }
  }
});
