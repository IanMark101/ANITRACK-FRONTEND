import { expect, test } from '@playwright/test';
import type { CollectionDetail, Entry } from '../src/types';

const saved: Entry = {
  id: 'saved-attack-on-titan', animeId: 'anime-attack-on-titan', title: 'Attack on Titan',
  image: '/images/editorial/next-chapter-landscape.webp', genre: 'Action', synopsis: '',
  provider: 'KITSU', externalId: '7442', totalEpisodes: 25, episodesWatched: 3,
  status: 'Watching', rating: 0, isFavorite: false
};
const other: Entry = { ...saved, id: 'saved-frieren', title: 'Frieren: Beyond Journey’s End' };

for (const width of [1440, 768, 390, 320]) {
  test(`saved anime can be found, read, and added at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 850 });
    const items: CollectionDetail['items'] = [];
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname;
      switch (path) {
        case '/api/auth/refresh':
          return route.fulfill({ json: { accessToken: 'collections-test-token', user: {
            id: 'collections-qa', name: 'Collections Tester', email: 'collections@example.test',
            role: 'MEMBER', emailVerifiedAt: '2026-11-18T00:00:00.000Z'
          } } });
        case '/api/watchlist':
          return route.fulfill({ json: { items: [saved, other], spotlightId: null, hasNext: false } });
        case '/api/collections/favorites':
          return route.fulfill({ json: { item: { id: 'favorites', name: 'Favorites', description: '', items } } });
        case '/api/collections/favorites/items':
          expect(route.request().method()).toBe('POST');
          expect(route.request().postDataJSON()).toEqual({ entryIds: [saved.id] });
          items.push({ ...saved, provider: 'KITSU', externalId: '7442', totalEpisodes: 25 });
          return route.fulfill({ json: { success: true } });
        default:
          return route.fulfill({ status: 404, json: { error: { message: 'Unexpected test request.' } } });
      }
    });

    await page.goto('/collections/favorites');
    await page.getByRole('button', { name: 'Add from watchlist', exact: true }).click();
    const picker = page.getByRole('dialog');
    const search = picker.getByRole('searchbox', { name: 'Search saved anime' });
    await search.fill('not a saved title');
    await expect(picker.getByText('No other saved anime matches your search.')).toBeVisible();
    await search.fill('attack on titan');
    await expect(picker.getByRole('checkbox')).toHaveCount(1);
    const title = picker.getByText(saved.title, { exact: true });
    const checkbox = picker.getByRole('checkbox', { name: saved.title, exact: true });
    await expect(search).toHaveCSS('border-top-width', '0px');
    await expect(search.locator('..')).toHaveCSS('border-top-width', '1px');
    await expect(search.locator('..')).toHaveCSS('outline-width', '2px');
    await expect(checkbox).toHaveCSS('width', '20px');
    await expect(title).toBeInViewport();
    const list = picker.locator('.collection-picker-list');
    await expect.poll(() => list.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await expect(picker.getByRole('button', { name: 'Add selected' })).toBeDisabled();
    await title.click();
    await expect(checkbox).toBeChecked();
    await expect(picker.getByText('1 selected')).toBeVisible();
    if (process.env.ANITRACK_COLLECTION_QA_IMAGES) {
      await page.screenshot({ path: testInfo.outputPath(`collections-picker-${width}.png`), animations: 'disabled' });
    }
    await picker.getByRole('button', { name: 'Add selected' }).click();
    await expect(page.getByRole('heading', { name: saved.title })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: saved.title })).toBeVisible();
  });
}
