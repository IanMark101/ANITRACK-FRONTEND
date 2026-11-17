import { expect, test, type Page, type Route } from '@playwright/test';

const prompt = 'I WANT TO WATCH A PIRATE ANIME WHERE A TWIST THAT THEY HAVE SOME UNIQUE POWERS';
const anime = {
  externalId: '12', provider: 'KITSU', title: 'One Piece', alternativeTitles: [],
  image: '/images/onepiece.jpg', banner: null,
  synopsis: 'A pirate with a rubber body searches for treasure.',
  genres: ['Action', 'Adventure'], categorySlugs: ['action', 'adventure'],
  totalEpisodes: null, episodeLength: 24, communityScore: 8.7, popularityRank: 1,
  format: 'TV', airingStatus: 'current', startDate: '1999-10-20', endDate: null,
  nextRelease: null, season: 'fall', year: 1999, studios: [], trailerId: null,
  sourceUrl: 'https://kitsu.app/anime/one-piece'
};
const result = {
  mode: 'recommend', summary: 'Pirate stories with unusual powers.', question: '',
  items: [{ anime, reason: 'A possible pirate adventure.', evidence: '', facts: [] }],
  notice: 'Showing verified catalog titles from your request while detailed matching is unavailable. Open the details to check the fit.'
};

async function assistantApi(page: Page, respond: (route: Route) => Promise<void> | void) {
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    if (path === '/auth/refresh') return route.fulfill({ json: {
      user: { id: 'assistant-qa', name: 'Assistant Tester', email: 'assistant@example.test',
        role: 'MEMBER', emailVerifiedAt: '2026-11-18T00:00:00.000Z' },
      accessToken: 'assistant-test-token'
    } });
    if (path === '/watchlist') return route.fulfill({ json: { items: [], spotlightId: null, hasNext: false } });
    if (path === '/assistant') return respond(route);
    return route.fulfill({ status: 404, json: { error: { message: 'Unexpected test request.' } } });
  });
}

async function recommend(page: Page) {
  await page.goto('/assistant');
  await page.getByRole('button', { name: /Recommend something/ }).click();
  await page.getByLabel('What would you like to watch?', { exact: true }).fill(prompt);
  await page.getByRole('button', { name: 'Find recommendations', exact: true }).click();
}

test('pirate recommendations display verified catalog recovery results across screen sizes', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await assistantApi(page, route => {
    expect(route.request().postDataJSON()).toMatchObject({ mode: 'recommend', message: prompt });
    return route.fulfill({ json: result });
  });
  await recommend(page);
  await expect(page.getByRole('heading', { name: 'One Piece', exact: true })).toBeVisible();
  await expect(page.getByText(result.notice, { exact: true })).toBeVisible();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (process.env.ANITRACK_ASSISTANT_QA_IMAGES)
      await page.screenshot({ path: testInfo.outputPath(`assistant-${width}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('an Assistant deadline releases the form, preserves the prompt, and allows a successful retry', async ({ page }) => {
  await page.addInitScript(() => {
    const timeout = AbortSignal.timeout.bind(AbortSignal);
    AbortSignal.timeout = milliseconds => timeout(milliseconds === 30000 ? 200 : milliseconds);
  });
  let attempts = 0;
  await assistantApi(page, route => {
    attempts++;
    if (attempts > 1) return route.fulfill({ json: result });
  });
  await recommend(page);
  await expect(page.locator('.assistant-error')).toContainText('The anime assistant took too long. Please try again.');
  await expect(page.getByLabel('What would you like to watch?', { exact: true })).toHaveValue(prompt);
  const retry = page.getByRole('button', { name: 'Find recommendations', exact: true });
  await expect(retry).toBeEnabled();
  await retry.click();
  await expect(page.getByRole('heading', { name: 'One Piece', exact: true })).toBeVisible();
  expect(attempts).toBe(2);
});

test('cancelling an Assistant request immediately restores the form', async ({ page }) => {
  await assistantApi(page, () => {});
  await recommend(page);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Find recommendations', exact: true })).toBeEnabled();
  await expect(page.getByLabel('What would you like to watch?', { exact: true })).toHaveValue(prompt);
  await expect(page.locator('.assistant-error, .assistant-results')).toHaveCount(0);
});
