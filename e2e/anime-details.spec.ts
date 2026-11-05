import { test, expect } from '@playwright/test';

test('a verified member can open and close the trailer before reading a long synopsis', async ({ page }) => {
  await page.setViewportSize({ width: 330, height: 562 });
  const user = { id: 'trailer-member', name: 'Trailer Reviewer', email: 'trailer@example.test', role: 'MEMBER', emailVerifiedAt: '2026-11-05T00:00:00.000Z' };
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    if (path === '/auth/refresh') return route.fulfill({ json: { user, accessToken: 'test-session' } });
    if (path === '/watchlist') return route.fulfill({ json: { items: [], spotlightId: null, hasNext: false } });
    if (path === '/anime/meta') return route.fulfill({ json: { genres: [], statuses: [], posters: [] } });
    if (path === '/discovery/3936') return route.fulfill({ json: { stale: false, item: {
      externalId: '3936', title: 'Fullmetal Alchemist: Brotherhood', alternativeTitles: ['Hagane no Renkinjutsushi'],
      synopsis: 'Two brothers search for a way to recover what they lost. '.repeat(45),
      image: '/images/editorial/fullmetal-alchemist.webp', genres: ['Adventure', 'Fantasy'],
      format: 'TV', year: 2009, airingStatus: 'Finished', communityScore: 8.3, totalEpisodes: 64,
      episodeLength: 24, startDate: '2009-04-05', endDate: '2010-07-04', studios: ['Bones'],
      trailerId: 'abcdefghijk', sourceUrl: 'https://kitsu.app/anime/3936'
    } } });
    return route.fulfill({ status: 404, json: { error: { message: 'Unexpected test request' } } });
  });
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Trailer test player</title>' }));
  await page.goto('/anime/kitsu/3936');
  const trigger = page.getByRole('button', { name: 'Watch trailer', exact: true });
  await expect(trigger).toBeVisible();
  const action = await trigger.boundingBox();
  const story = await page.locator('.anime-synopsis').boundingBox();
  expect(action!.y).toBeLessThan(story!.y);
  await expect(page.locator('.trailer-player')).toHaveCount(0);
  await trigger.click();
  await expect(page.getByRole('heading', { name: 'Watch trailer', exact: true })).toBeVisible();
  await expect(page.locator('.trailer-player')).toHaveAttribute('title', 'Fullmetal Alchemist: Brotherhood trailer');
  await expect(page.getByRole('link', { name: 'Open on YouTube' })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=abcdefghijk');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Close trailer', exact: true }).click();
  await expect(page.locator('.trailer-player')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
