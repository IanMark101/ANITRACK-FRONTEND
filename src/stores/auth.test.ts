import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
const mocks = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock('../api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api')>()),
  refreshSession: mocks.refresh
}));
import { ApiError } from '../api';
import { useAuthStore } from './auth';
beforeEach(() => {
  setActivePinia(createPinia());
  mocks.refresh.mockReset();
});
afterEach(() => vi.restoreAllMocks());
describe('Session recovery state', () => {
  it('leaves a failed restore retryable rather than treating a temporary outage as signed out', async () => {
    mocks.refresh.mockRejectedValueOnce(new ApiError(503, 'SERVICE_UNAVAILABLE', 'Unavailable'));
    const store = useAuthStore();
    await store.restore();
    expect(store.restored).toBe(false);
    expect(store.sessionError).toContain('try again');
    mocks.refresh.mockResolvedValueOnce({});
    await store.restore();
    expect(store.restored).toBe(true);
    expect(store.sessionError).toBe('');
    expect(mocks.refresh).toHaveBeenCalledTimes(2);
  });
  it('treats a real expired session as restored guest state', async () => {
    mocks.refresh.mockRejectedValueOnce(new ApiError(401, 'SESSION_EXPIRED', 'Expired'));
    const store = useAuthStore();
    await store.restore();
    expect(store.restored).toBe(true);
    expect(store.sessionError).toBe('');
    expect(store.authenticated).toBe(false);
  });
});
