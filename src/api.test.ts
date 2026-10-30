import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('API authentication refresh', () => {
  it('cannot restore an old session after explicit sign-out', async () => {
    let finish!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise((resolve) => { finish = resolve; })));
    const { refreshSession, setAccessToken, observeSession } = await import('./api');
    const observed = vi.fn();
    observeSession(observed);
    const pending = refreshSession();
    setAccessToken(null);
    finish(response(200, { accessToken: 'old-token', user: { id: 'old-user' } }));
    await expect(pending).rejects.toMatchObject({ code: 'SESSION_CHANGED' });
    expect(observed).not.toHaveBeenCalled();
  });
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());
  const response = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  it('rejects a retried private response when the account changes during that retry', async () => {
    let finish!: (value: Response) => void;
    let retried!: () => void;
    const retryStarted = new Promise<void>((resolve) => { retried = resolve; });
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response(401, { error: { message: 'Expired' } }))
      .mockResolvedValueOnce(response(200, { accessToken: 'fresh', user: { id: 'old-user' } }))
      .mockImplementationOnce(() => { retried(); return new Promise((resolve) => { finish = resolve; }); }));
    const { api, setAccessToken } = await import('./api');
    const pending = api('/watchlist');
    await retryStarted;
    setAccessToken(null);
    setAccessToken('new-user-token');
    finish(response(200, { items: [{ id: 'old-user-private-entry' }] }));
    await expect(pending).rejects.toMatchObject({ code: 'SESSION_CHANGED' });
  });

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

  it('retains the session on a temporary refresh error and accepts a later successful retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response(503, {
          error: { code: 'SERVICE_UNAVAILABLE', message: 'Temporarily unavailable' }
        })
      )
      .mockResolvedValueOnce(
        response(200, { accessToken: 'recovered-token', user: { id: 'user-1' } })
      );
    vi.stubGlobal('fetch', fetchMock);
    const { refreshSession, observeSession, setAccessToken } = await import('./api');
    const observed = vi.fn();
    observeSession(observed);
    setAccessToken('current-token');
    await expect(refreshSession()).rejects.toThrow('Temporarily unavailable');
    expect(observed).not.toHaveBeenCalled();
    await expect(refreshSession()).resolves.toMatchObject({ accessToken: 'recovered-token' });
    expect(observed).toHaveBeenCalledTimes(1);
    expect(observed).not.toHaveBeenCalledWith(null);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
