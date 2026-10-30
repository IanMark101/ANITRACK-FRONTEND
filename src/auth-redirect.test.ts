import { describe, expect, it } from 'vitest';
import { safeAuthRedirect } from './auth-redirect';

describe('Returning to anime after authentication', () => {
  it('preserves supported internal pages and search queries', () => {
    for (const path of [
      '/anime/kitsu/46474',
      '/anime/local/clocal123',
      '/calendar',
      '/assistant',
      '/discover?q=Frieren',
      '/dashboard',
      '/watchlist'
    ])
      expect(safeAuthRedirect(path)).toBe(path);
  });
  it('rejects external, protocol-relative, backslash and traversal destinations', () => {
    for (const path of [
      'https://example.test',
      '//example.test',
      '/\\example.test',
      '/dashboard/../../example',
      '/anime/kitsu/../other'
    ])
      expect(safeAuthRedirect(path)).toBe('/dashboard');
  });
  it('handles missing, duplicate and malformed query values safely', () => {
    for (const value of [undefined, null, ['/calendar', '/discover'], 123, 'javascript:alert(1)'])
      expect(safeAuthRedirect(value)).toBe('/dashboard');
  });
});
