import { Capacitor, CapacitorHttp } from '@capacitor/core';

export function mobileApiUrl(value: string | undefined, development: boolean): string {
  const url = new URL(value || (development ? 'http://10.0.2.2:3001/api' : ''));
  if (url.username || url.password || url.search || url.hash || !url.pathname.endsWith('/api'))
    throw new Error(
      'VITE_MOBILE_API_URL must be an API URL ending in /api, without credentials or a query.'
    );
  if (url.protocol !== 'https:' && !(development && url.protocol === 'http:'))
    throw new Error('Mobile release builds require an HTTPS API.');
  return url.href.replace(/\/$/, '');
}

export async function request(path: string, options: RequestInit): Promise<Response> {
  if (!Capacitor.isNativePlatform()) {
    const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
    return fetch(`${base}${path}`, options);
  }
  const development = Boolean(import.meta.env.QUASAR_DEV || import.meta.env.QUASAR_DEBUG);
  const base = mobileApiUrl(import.meta.env.VITE_MOBILE_API_URL, development);
  options.signal?.throwIfAborted();
  // Native HTTP uses the platform cookie jar, keeping refresh cookies HttpOnly.
  // Browser requests use fetch and the existing same-site proxy.
  const result = await CapacitorHttp.request({
    url: `${base}${path}`,
    method: options.method || 'GET',
    headers: Object.fromEntries(new Headers(options.headers).entries()),
    ...(options.body ? { data: JSON.parse(String(options.body)) } : {}),
    connectTimeout: 20000,
    readTimeout: path === '/assistant' ? 65000 : 35000,
    responseType: 'text',
    disableRedirects: true
  });
  options.signal?.throwIfAborted();
  const data = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
  return new Response(result.status === 204 ? null : data, { status: result.status });
}
