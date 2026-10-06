import type { Session } from './types';

const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
let token: string | null = null;
let refreshPromise: Promise<Session> | null = null;
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
  token = value;
}
export function observeSession(callback: typeof onSession) {
  onSession = callback;
}

async function send<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      signal: options.signal ?? AbortSignal.timeout(20000)
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
    refreshPromise = send<Session>('/auth/refresh', { method: 'POST' })
      .then((session) => {
        setAccessToken(session.accessToken);
        onSession(session);
        return session;
      })
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          setAccessToken(null);
          onSession(null);
        }
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    return await send<T>(path, options);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || path.startsWith('/auth/'))
      throw error;
    await refreshSession();
    return send<T>(path, options);
  }
}
export const jsonBody = (value: unknown) => JSON.stringify(value);
