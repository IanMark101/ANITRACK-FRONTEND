import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('API authentication refresh', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());
  const response = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  it('coordinates simultaneous 401 requests through one refresh and retries both', async () => {
    let refreshCalls = 0;
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        refreshCalls++;
        return response(200, { accessToken: 'fresh-token', user: { id: 'user-1' } });
      }
      return (init.headers as Record<string, string>).Authorization === 'Bearer fresh-token'
        ? response(200, { items: [] })
        : response(401, { error: { code: 'INVALID_TOKEN', message: 'Expired' } });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { api, setAccessToken } = await import('./api');
    setAccessToken('expired-token');
    const results = await Promise.all([api('/watchlist'), api('/anime')]);
    expect(refreshCalls).toBe(1);
    expect(results).toEqual([{ items: [] }, { items: [] }]);
    expect(fetchMock.mock.calls.every(([, init]) => init.credentials === 'include')).toBe(true);
  });

  it('does not refresh on invalid login credentials', async () => {
    const fetchMock = vi.fn(async () =>
      response(401, { error: { code: 'INVALID_CREDENTIALS', message: 'Wrong password' } })
    );
    vi.stubGlobal('fetch', fetchMock);
    const { api } = await import('./api');
    await expect(api('/auth/login', { method: 'POST' })).rejects.toThrow('Wrong password');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('clears session on an expired refresh without retry loops', async () => {
    const fetchMock = vi.fn(async () =>
      response(401, { error: { code: 'SESSION_EXPIRED', message: 'Please sign in.' } })
    );
    vi.stubGlobal('fetch', fetchMock);
    const { api, observeSession } = await import('./api');
    const observed = vi.fn();
    observeSession(observed);
    await expect(api('/watchlist')).rejects.toThrow('Please sign in.');
    expect(observed).toHaveBeenCalledWith(null);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reports a network failure without discarding the session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const { refreshSession, observeSession } = await import('./api');
    const observed = vi.fn();
    observeSession(observed);
    await expect(refreshSession()).rejects.toThrow('Cannot reach AniTrack');
    expect(observed).not.toHaveBeenCalled();
  });
});
