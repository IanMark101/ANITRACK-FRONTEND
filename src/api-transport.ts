import { Capacitor, CapacitorHttp } from '@capacitor/core';

export function networkErrorMessage(): string {
  return Capacitor.isNativePlatform() && Boolean(import.meta.env.QUASAR_DEV || import.meta.env.QUASAR_DEBUG)
    ? 'Cannot reach AniTrack. This local test app needs the laptop running on the Wi-Fi network used for this build. Reconnect and try again.'
    : 'Cannot reach AniTrack. Check your connection and try again.';
}

function abortable<T>(pending: Promise<T>, signal?: AbortSignal | null): Promise<T> {
  if (!signal) return pending;
  return new Promise<T>((resolve, reject) => {
    const abort = () => { signal.removeEventListener('abort', abort); reject(signal.reason); };
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    // The native plugin finishes its socket request independently; an aborted result
    // must not hold up navigation or overwrite the next connection attempt.
    pending.then(value => {
      signal.removeEventListener('abort', abort);
      resolve(value);
    }, error => {
      signal.removeEventListener('abort', abort);
      reject(error);
    });
  });
}

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
  const restoring = path === '/auth/refresh';
  const result = await abortable(CapacitorHttp.request({
    url: `${base}${path}`,
    method: options.method || 'GET',
    headers: Object.fromEntries(new Headers(options.headers).entries()),
    ...(options.body ? { data: JSON.parse(String(options.body)) } : {}),
    connectTimeout: restoring ? 8000 : 20000,
    readTimeout: restoring ? 8000 : path === '/assistant' ? 65000 : 35000,
    responseType: 'text',
    disableRedirects: true
  }), options.signal);
  options.signal?.throwIfAborted();
  const data = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
  return new Response(result.status === 204 ? null : data, { status: result.status });
}
