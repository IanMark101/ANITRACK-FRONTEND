import type { Session } from './types';
import { request } from './api-transport';

let token: string | null = null;
let refreshPromise: Promise<Session> | null = null;
let identityVersion = 0;
let onSession: (session: Session | null) => void = () => {};
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}
export function setAccessToken(value: string | null) {
  if (value === null) {
    identityVersion++;
    refreshPromise = null;
  }
  token = value;
}
export function observeSession(callback: typeof onSession) {
  onSession = callback;
}

async function send<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await request(path, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      signal: options.signal ?? AbortSignal.timeout(35000)
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Cannot reach AniTrack. Check your connection and try again.'
    );
  }
  if (response.status === 204) return undefined as T;
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'The server returned an unexpected response.'
    );
  }
  if (!response.ok)
    throw new ApiError(
      response.status,
      payload.error?.code ?? 'REQUEST_FAILED',
      payload.error?.message ?? 'The request failed.'
    );
  return payload as T;
}

export function refreshSession(): Promise<Session> {
  if (!refreshPromise) {
    const version = identityVersion;
    const refresh = () => send<Session>('/auth/refresh', { method: 'POST' });
    // Browser tabs share the rotating cookie; serialize refreshes across tabs too.
    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    const pending = Promise.resolve(
      locks ? locks.request('anitrack-session-refresh', refresh) : refresh()
    )
      .then((session) => {
        if (version !== identityVersion) throw new ApiError(409, 'SESSION_CHANGED', 'Your account changed. Please try again.');
        setAccessToken(session.accessToken);
        onSession(session);
        return session;
      })
      .catch((error) => {
        if (version === identityVersion && error instanceof ApiError && error.status === 401) {
          setAccessToken(null);
          onSession(null);
        }
        throw error;
      })
      .finally(() => {
        if (refreshPromise === pending) refreshPromise = null;
      });
    refreshPromise = pending;
  }
  return refreshPromise;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const version = identityVersion;
  try {
    const result = await send<T>(path, options);
    if (version !== identityVersion) throw new ApiError(409, 'SESSION_CHANGED', 'Your account changed. Please try again.');
    return result;
  } catch (error) {
    if (version !== identityVersion) throw new ApiError(409, 'SESSION_CHANGED', 'Your account changed. Please try again.');
    if (!(error instanceof ApiError) || error.status !== 401 || path.startsWith('/auth/'))
      throw error;
    await refreshSession();
    if (version !== identityVersion) throw new ApiError(409, 'SESSION_CHANGED', 'Your account changed. Please try again.');
    const result = await send<T>(path, options);
    if (version !== identityVersion) throw new ApiError(409, 'SESSION_CHANGED', 'Your account changed. Please try again.');
    return result;
  }
}
export const jsonBody = (value: unknown) => JSON.stringify(value);
