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
});
