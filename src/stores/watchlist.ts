import { defineStore } from 'pinia';
import { api, jsonBody } from '../api';
import type { Anime, Collection, Entry, Metadata } from '../types';

export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({
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
      return this.mutate(async () => {
        const result = await api<{ item: Entry; created: boolean }>('/watchlist/import', {
          method: 'POST',
          body: jsonBody({ externalId })
        });
        const index = this.items.findIndex((entry) => entry.id === result.item.id);
        if (index === -1) this.items.unshift(result.item);
        else this.items[index] = result.item;
        if (result.created) this.spotlightId = result.item.id;
        return result.item;
      });
    },
    async progress(id: string, delta: 1 | -1) {
      return this.mutate(async () => {
        const { item } = await api<{ item: Entry }>(`/watchlist/${id}/progress`, {
          method: 'POST',
          body: jsonBody({ delta })
        });
        const index = this.items.findIndex((entry) => entry.id === id);
        if (index !== -1) this.items[index] = item;
        return item;
      });
    },
    async load() {
      if (this.loadPromise) return this.loadPromise;
      this.loading = true;
      this.loadError = '';
      this.loadPromise = (async () => {
        try {
          const collection = await api<Collection>('/watchlist');
          this.items = collection.items;
          this.spotlightId = collection.spotlightId;
          this.loaded = true;
        } catch (error) {
          this.loadError = error instanceof Error ? error.message : 'Unable to load collection.';
        } finally {
          this.loading = false;
          this.loadPromise = null;
        }
      })();
      return this.loadPromise;
    },
    async loadMetadata() {
      if (this.metadata.genres.length && this.catalog.length) return;
      const [metadata, catalog] = await Promise.all([
        api<Metadata>('/anime/meta'),
        api<{ items: Anime[] }>('/anime')
      ]);
      this.metadata = metadata;
      this.catalog = catalog.items;
    },
    async mutate<T>(operation: () => Promise<T>): Promise<T | undefined> {
      if (this.busy) return;
      this.busy = true;
      this.actionError = '';
      try {
        return await operation();
      } catch (error) {
        this.actionError = error instanceof Error ? error.message : 'Could not save your change.';
        throw error;
      } finally {
        this.busy = false;
      }
    },
    async add(input: unknown) {
      return this.mutate(async () => {
        const { item } = await api<{ item: Entry }>('/watchlist', {
          method: 'POST',
          body: jsonBody(input)
        });
        this.items.unshift(item);
        this.spotlightId = item.id;
        return item;
      });
    },
    async update(id: string, changes: Partial<Entry>) {
      return this.mutate(async () => {
        const { item } = await api<{ item: Entry }>(`/watchlist/${id}`, {
          method: 'PATCH',
          body: jsonBody(changes)
        });
        const index = this.items.findIndex((entry) => entry.id === id);
        if (index !== -1) this.items[index] = item;
        return item;
      });
    },
    async remove(id: string) {
      return this.mutate(async () => {
        await api(`/watchlist/${id}`, { method: 'DELETE' });
        this.items = this.items.filter((entry) => entry.id !== id);
        if (this.spotlightId === id) this.spotlightId = null;
        return true;
      });
    },
    async spotlight(id: string) {
      return this.mutate(async () => {
        await api('/watchlist/spotlight', { method: 'PUT', body: jsonBody({ entryId: id }) });
        this.spotlightId = id;
        return true;
      });
    },
    async reset() {
      return this.mutate(async () => {
        const collection = await api<Collection>('/watchlist/reset', { method: 'POST' });
        this.items = collection.items;
        this.spotlightId = collection.spotlightId;
        return true;
      });
    }
  }
});
