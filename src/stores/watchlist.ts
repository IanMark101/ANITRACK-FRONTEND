import { defineStore } from 'pinia';
import { api, jsonBody } from '../api';
import type { Anime, Collection, Entry, Metadata } from '../types';

export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({
    requestScope: {},
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
      return this.mutate(async (current) => {
        const result = await api<{ item: Entry; created: boolean }>('/watchlist/import', {
          method: 'POST',
          body: jsonBody({ externalId })
        });
        if (!current()) return;
        const index = this.items.findIndex((entry) => entry.id === result.item.id);
        if (index === -1) this.items.unshift(result.item);
        else this.items[index] = result.item;
        if (result.created) this.spotlightId = result.item.id;
        return result.item;
      });
    },
    async progress(id: string, delta: 1 | -1) {
      return this.mutate(async (current) => {
        const { item } = await api<{ item: Entry }>(`/watchlist/${id}/progress`, {
          method: 'POST',
          body: jsonBody({ delta })
        });
        if (!current()) return;
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
          const collection = await api<Collection>('/watchlist');
          if (scope !== this.requestScope) return;
          let page = 1;
          let next = collection.hasNext;
          while (next && page < 250) {
            const extra = await api<Collection>(`/watchlist?page=${++page}`);
            if (scope !== this.requestScope) return;
            collection.items.push(...extra.items);
            next = extra.hasNext;
          }
          if (next) throw new Error('Your collection is too large to load. Please contact support.');
          this.items = collection.items;
          this.spotlightId = collection.spotlightId;
          this.loaded = true;
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
    async mutate<T>(operation: (current: () => boolean) => Promise<T>): Promise<T | undefined> {
      if (this.busy) return;
      const scope = this.requestScope;
      const current = () => scope === this.requestScope;
      this.busy = true;
      this.actionError = '';
      try {
        return await operation(current);
      } catch (error) {
        if (!current()) return;
        this.actionError = error instanceof Error ? error.message : 'Could not save your change.';
        throw error;
      } finally {
        if (current()) this.busy = false;
      }
    },
    async add(input: unknown) {
      return this.mutate(async (current) => {
        const { item } = await api<{ item: Entry }>('/watchlist', {
          method: 'POST',
          body: jsonBody(input)
        });
        if (!current()) return;
        this.items.unshift(item);
        this.spotlightId = item.id;
        return item;
      });
    },
    async update(id: string, changes: Partial<Entry>) {
      return this.mutate(async (current) => {
        const { item } = await api<{ item: Entry }>(`/watchlist/${id}`, {
          method: 'PATCH',
          body: jsonBody(changes)
        });
        if (!current()) return;
        const index = this.items.findIndex((entry) => entry.id === id);
        if (index !== -1) this.items[index] = item;
        return item;
      });
    },
    async remove(id: string) {
      return this.mutate(async (current) => {
        await api(`/watchlist/${id}`, { method: 'DELETE' });
        if (!current()) return;
        this.items = this.items.filter((entry) => entry.id !== id);
        if (this.spotlightId === id) this.spotlightId = null;
        return true;
      });
    },
    async spotlight(id: string) {
      return this.mutate(async (current) => {
        await api('/watchlist/spotlight', { method: 'PUT', body: jsonBody({ entryId: id }) });
        if (!current()) return;
        this.spotlightId = id;
        return true;
      });
    },
    async reset() {
      return this.mutate(async (current) => {
        const collection = await api<Collection>('/watchlist/reset', { method: 'POST' });
        if (!current()) return;
        this.items = collection.items;
        this.spotlightId = collection.spotlightId;
        if (collection.hasNext) await this.load();
        return true;
      });
    }
  }
});
