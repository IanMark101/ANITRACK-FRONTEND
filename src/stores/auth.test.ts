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
  it('distinguishes an unverified signed-in account from workspace access', () => {
    const store = useAuthStore();
    store.user = { id: 'pending', name: 'Pending member', email: 'pending@example.test', role: 'MEMBER', emailVerifiedAt: null };
    expect(store.authenticated).toBe(true);
    expect(store.verified).toBe(false);
    store.user.emailVerifiedAt = '2026-11-02T00:00:00.000Z';
    expect(store.verified).toBe(true);
    store.clear();
    expect(store.verified).toBe(false);
  });
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
  it('keeps an existing account and gives a useful connection message during an outage', async () => {
    const store = useAuthStore();
    store.user = { id: 'member', name: 'Member', email: 'member@example.test', role: 'MEMBER', emailVerifiedAt: '2026-11-02T00:00:00.000Z' };
    mocks.refresh.mockRejectedValueOnce(new ApiError(0, 'NETWORK_ERROR', 'Cannot reach AniTrack. Keep the laptop running.'));
    await store.restore();
    expect(store.user?.id).toBe('member');
    expect(store.restored).toBe(false);
    expect(store.sessionError).toContain('Keep the laptop running');
  });
});
