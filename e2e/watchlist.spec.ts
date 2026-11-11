import { test, expect, type Page } from '@playwright/test';
import type { Entry } from '../src/types';

async function watchlistApi(page: Page) {
  const existing: Entry = {
    id: 'existing-entry', animeId: 'existing-anime', externalId: '1', provider: 'KITSU',
    title: 'Fullmetal Alchemist: Brotherhood', genre: 'Adventure',
    image: '/images/editorial/next-chapter-landscape.webp', synopsis: '',
    totalEpisodes: 64, episodesWatched: 1, status: 'Watching', rating: 9, isFavorite: true
  };
  const added: Entry = {
    ...existing, id: 'added-entry', animeId: 'added-anime', externalId: '2',
    title: 'Steins;Gate', status: 'Plan to Watch', isFavorite: false, episodesWatched: 0
  };
  let reads = 0;
  let writes = 0;
  let logoutRequests = 0;
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    const method = route.request().method();
    const ok = (json: unknown) => route.fulfill({ json });
    if (path === '/auth/refresh') return ok({
      user: { id: 'watchlist-test', name: 'Watchlist Tester', email: 'watchlist@example.test',
        role: 'MEMBER', emailVerifiedAt: '2026-11-11T00:00:00.000Z' },
      accessToken: 'watchlist-test-token'
    });
    if (path === '/watchlist' && method === 'GET') {
      reads++;
      return ok({ items: writes ? [added, existing] : [existing], spotlightId: null, hasNext: false });
    }
    if (path === '/watchlist/existing-entry/progress' && method === 'POST') {
      existing.episodesWatched += route.request().postDataJSON().delta;
      return ok({ item: existing });
    }
    if (path === '/auth/logout' && method === 'POST') {
      logoutRequests++;
      if (logoutRequests === 1) return route.fulfill({ status: 503, json: { error: { message: 'Temporarily unavailable.' } } });
      return route.fulfill({ status: 204 });
    }
    if (path === '/anime/meta') return ok({ genres: ['Adventure'], statuses: ['Watching', 'Plan to Watch', 'Completed'], posters: [] });
    if (path === '/discovery') return ok({ items: [{
      externalId: added.externalId, provider: 'KITSU', title: added.title, image: added.image,
      year: 2011, format: 'TV', totalEpisodes: 24
    }], hasNext: false, page: 1 });
    if (method === 'POST' && (path === '/watchlist/import' || path === '/watchlist')) {
      writes++;
      return ok({ item: added, created: true });
    }
    return route.fulfill({ status: 404, json: { error: { message: 'Unexpected test request.' } } });
  });
  return { counts: () => ({ reads, writes }), logoutRequests: () => logoutRequests };
}

test('phone: episode tracking updates immediately and logout requires confirmation', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const api = await watchlistApi(page);
  await page.goto('/watchlist');
  const tracker = page.getByRole('progressbar', { name: 'Fullmetal Alchemist: Brotherhood episode progress' });
  const addEpisode = page.getByRole('button', { name: 'Mark one more episode watched for Fullmetal Alchemist: Brotherhood' });
  await expect(tracker).toHaveAttribute('value', '1');
  await addEpisode.click();
  await expect(tracker).toHaveAttribute('value', '2');
  const size = await addEpisode.boundingBox();
  expect(size?.height).toBeGreaterThanOrEqual(44);
  if (process.env.ANITRACK_WATCHLIST_QA_IMAGES) {
    await page.screenshot({ path: testInfo.outputPath('watch-progress.png') });
  }

  const logout = page.getByRole('button', { name: 'Log out', exact: true });
  await logout.click();
  const dialog = page.getByRole('dialog', { name: 'Log out of AniTrack?' });
  await expect(dialog.getByRole('button', { name: 'Stay signed in' })).toBeFocused();
  if (process.env.ANITRACK_WATCHLIST_QA_IMAGES) {
    await page.screenshot({ path: testInfo.outputPath('logout.png') });
  }
  await dialog.getByRole('button', { name: 'Stay signed in' }).click();
  await expect(dialog).toBeHidden();
  await expect(logout).toBeFocused();
  expect(api.logoutRequests()).toBe(0);
  await logout.click();
  const confirm = dialog.getByRole('button', { name: 'Log out', exact: true });
  await confirm.click();
  await expect(dialog.getByRole('alert')).toContainText('Could not sign out');
  await expect(page).toHaveURL(/\/watchlist$/);
  await confirm.click();
  await expect(page).toHaveURL(url => url.pathname === '/');
  expect(api.logoutRequests()).toBe(2);
});

for (const width of [1440, 768, 390]) {
  for (const source of ['catalog', 'custom']) {
    test(`${width}px: adding from ${source} immediately reveals the title despite active filters`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const api = await watchlistApi(page);
      await page.goto('/watchlist');
      const tabs = page.getByRole('group', { name: 'Filter by watch status' });
      await expect(page.locator('.library-card')).toHaveCount(1);
      await tabs.getByRole('button', { name: /^Watching/ }).click();
      await page.getByRole('button', { name: 'Show favorites only', exact: true }).click();
      await page.getByLabel('Search your watchlist', { exact: true }).fill('Fullmetal');
      await page.getByLabel('Sort watchlist', { exact: true }).selectOption('title');
      await page.getByRole('button', { name: 'Add anime', exact: true }).click();
      if (source === 'catalog') {
        await page.getByLabel('Search anime catalog', { exact: true }).fill('Steins');
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await page.getByRole('button', { name: 'Add Steins;Gate', exact: true }).click();
      } else {
        await page.getByRole('button', { name: 'Create a custom entry' }).click();
        await page.getByLabel('Anime title', { exact: true }).fill('Steins;Gate');
        await page.getByRole('button', { name: 'Add to watchlist', exact: true }).click();
      }
      await expect(page.getByRole('heading', { name: /Find your next anime|Create a custom entry/ })).toHaveCount(0);
      await expect(page.locator('.library-card').first().getByRole('heading')).toHaveText('Steins;Gate');
      await expect(page.locator('.library-card')).toHaveCount(2);
      await expect(tabs.getByRole('button', { name: /^All/ })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('button', { name: 'Show favorites only', exact: true })).toHaveAttribute('aria-pressed', 'false');
      await expect(page.getByLabel('Search your watchlist', { exact: true })).toHaveValue('');
      await expect(page.getByLabel('Sort watchlist', { exact: true })).toHaveValue('recent');
      await expect(page.locator('.library-result-count')).toContainText('2 titles');
      expect(api.counts()).toEqual({ reads: 1, writes: 1 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (source === 'catalog' && process.env.ANITRACK_WATCHLIST_QA_IMAGES) {
        await page.screenshot({ path: testInfo.outputPath('watchlist.png'), fullPage: true });
      }
    });
  }
}
