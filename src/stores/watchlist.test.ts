import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
const mocks = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('../api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api')>()),
  api: mocks.api
}));
import { useWatchlistStore } from './watchlist';
beforeEach(() => {
  setActivePinia(createPinia());
  mocks.api.mockReset();
});
describe('Watchlist loading', () => {
  it('ignores the previous account response after reset and a new account load', async () => {
    let finish!: (value: unknown) => void;
    mocks.api.mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
    const store = useWatchlistStore();
    const previous = store.load();
    store.$reset();
    mocks.api.mockResolvedValueOnce({ items: [{ id: 'new-account' }], spotlightId: null });
    await store.load();
    finish({ items: [{ id: 'old-account' }], spotlightId: 'old-account' });
    await previous;
    expect(store.items[0]?.id).toBe('new-account');
    expect(store.spotlightId).toBeNull();
  });
  it('does not repopulate a logged-out collection after a delayed mutation', async () => {
    let finish!: (value: unknown) => void;
    mocks.api.mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
    const store = useWatchlistStore();
    const pending = store.add({ title: 'Previous account title' });
    store.$reset();
    finish({ item: { id: 'old-account' } });
    expect(await pending).toBeUndefined();
    expect(store.items).toEqual([]);
  });
  it('loads every bounded page without losing titles', async () => {
    mocks.api.mockResolvedValueOnce({ items: [{ id: 'one' }], spotlightId: 'one', hasNext: true })
      .mockResolvedValueOnce({ items: [{ id: 'two' }], spotlightId: 'one', hasNext: false });
    const store = useWatchlistStore();
    await store.load();
    expect(store.items.map((item) => item.id)).toEqual(['one', 'two']);
    expect(mocks.api).toHaveBeenLastCalledWith('/watchlist?page=2');
  });
  it('coalesces concurrent loads and does not fetch the shared catalog for every page', async () => {
    let finish!: (value: unknown) => void;
    mocks.api.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    const store = useWatchlistStore();
    const first = store.load();
    const second = store.load();
    expect(mocks.api).toHaveBeenCalledTimes(1);
    expect(mocks.api).toHaveBeenCalledWith('/watchlist');
    finish({ items: [], spotlightId: null });
    await Promise.all([first, second]);
    expect(store.loaded).toBe(true);
    expect(store.loading).toBe(false);
  });
  it('keeps already loaded titles visible when a background refresh fails', async () => {
    const store = useWatchlistStore();
    mocks.api.mockResolvedValueOnce({
      items: [{ id: 'qa-entry', title: 'Saved title' }],
      spotlightId: null
    });
    await store.load();
    mocks.api.mockRejectedValueOnce(new Error('Temporary connection failure'));
    await store.load();
    expect(store.loaded).toBe(true);
    expect(store.items[0]?.title).toBe('Saved title');
    expect(store.loadError).toContain('Temporary');
    expect(store.loading).toBe(false);
  });
  it('keeps a confirmed import visible when an older watchlist response arrives', async () => {
    let finishOldRead!: (value: unknown) => void;
    let finishNewRead!: (value: unknown) => void;
    const store = useWatchlistStore();
    const saved = { id: 'added-title', title: 'Newly added anime' };
    mocks.api
      .mockReturnValueOnce(new Promise(resolve => { finishOldRead = resolve; }))
      .mockResolvedValueOnce({ item: saved, created: true })
      .mockReturnValueOnce(new Promise(resolve => { finishNewRead = resolve; }));

    const pending = store.load();
    await store.importAnime('123');
    expect(store.items).toEqual([saved]);
    finishOldRead({ items: [], spotlightId: null });
    await vi.waitFor(() => expect(mocks.api).toHaveBeenCalledTimes(3));
    expect(store.items).toEqual([saved]);
    expect(store.spotlightId).toBe(saved.id);
    finishNewRead({ items: [saved], spotlightId: saved.id });
    await pending;
    expect(store.items).toEqual([saved]);
    expect(store.loaded).toBe(true);
  });
});
