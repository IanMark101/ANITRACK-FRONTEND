import { afterEach, describe, expect, it, vi } from 'vitest';
const native = vi.hoisted(() => ({ enabled: false, request: vi.fn() }));
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => native.enabled },
  CapacitorHttp: { request: native.request }
}));
import { mobileApiUrl, request } from './api-transport';

afterEach(() => {
  native.enabled = false;
  native.request.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe('mobile API transport', () => {
  it('requires a deployed HTTPS API for release builds', () => {
    expect(() => mobileApiUrl(undefined, false)).toThrow();
    expect(() => mobileApiUrl('http://example.test/api', false)).toThrow('HTTPS');
    expect(() => mobileApiUrl('https://user:secret@example.test/api', false)).toThrow('credentials');
    expect(mobileApiUrl('https://example.test/api', false)).toBe('https://example.test/api');
    expect(mobileApiUrl(undefined, true)).toBe('http://10.0.2.2:3001/api');
  });
  it('uses normal cookie fetch in the browser', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    await request('/auth/refresh', { method: 'POST', credentials: 'include' });
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    expect(native.request).not.toHaveBeenCalled();
  });
  it('uses native JSON HTTP with bearer auth and handles empty logout responses', async () => {
    native.enabled = true;
    vi.stubEnv('VITE_MOBILE_API_URL', 'https://example.test/api');
    native.request.mockResolvedValue({ status: 204, data: '' });
    const response = await request('/auth/logout', {
      method: 'POST', headers: { Authorization: 'Bearer test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    expect(response.status).toBe(204);
    expect(native.request).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://example.test/api/auth/logout', data: { test: true },
      headers: expect.objectContaining({ authorization: 'Bearer test' }), disableRedirects: true
    }));
  });
});
