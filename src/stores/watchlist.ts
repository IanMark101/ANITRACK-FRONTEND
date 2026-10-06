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
    busy: false,
    loadError: '',
    actionError: ''
  }),
  actions: {
    async load() {
      this.loading = true;
      this.loadError = '';
      try {
        const [collection, metadata, catalog] = await Promise.all([
          api<Collection>('/watchlist'),
          api<Metadata>('/anime/meta'),
          api<{ items: Anime[] }>('/anime')
        ]);
        this.items = collection.items;
        this.spotlightId = collection.spotlightId;
        this.metadata = metadata;
        this.catalog = catalog.items;
      } catch (error) {
        this.loadError = error instanceof Error ? error.message : 'Unable to load collection.';
      } finally {
        this.loading = false;
      }
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
