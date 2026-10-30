import { test, expect, type Page } from '@playwright/test';

async function sessionApi(page: Page) {
  let signedIn = false;
  const privateRequests: string[] = [];
  const user = { id: 'access-check', name: 'Access Tester', email: 'access@example.test', role: 'MEMBER', emailVerifiedAt: null };
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    if (path === '/auth/refresh') return route.fulfill(signedIn
      ? { json: { user, accessToken: 'access-test-token' } }
      : { status: 401, json: { error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } } });
    if (path === '/auth/login') { signedIn = true; return route.fulfill({ json: { user, accessToken: 'access-test-token' } }); }
    if (path === '/auth/logout') { signedIn = false; return route.fulfill({ status: 204 }); }
    privateRequests.push(path);
    if (!signedIn) return route.fulfill({ status: 401, json: { error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } } });
    if (path === '/watchlist') return route.fulfill({ json: { items: [], spotlightId: null, hasNext: false } });
    if (path === '/anime/meta') return route.fulfill({ json: { genres: [], statuses: [], posters: [] } });
    if (path === '/discovery') return route.fulfill({ json: { items: [], page: 1, hasNext: false, total: 0, source: 'Kitsu' } });
    return route.fulfill({ status: 404, json: { error: { message: 'Unexpected test request.' } } });
  });
  return privateRequests;
}

test('landing describes member features without loading a catalog or exposing feature controls', async ({ page }) => {
  const requests = await sessionApi(page);
  await page.goto('/');
  await expect(page.locator('.landing-page')).toBeVisible();
  await expect(page.locator('#discover')).toContainText('signed-in AniTrack workspace');
  await expect(page.locator('#assistant')).toContainText('Sign in to use the AI assistant');
  await expect(page.locator('.poster-picker, .explore-search, textarea')).toHaveCount(0);
  const navigation = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  await expect(navigation.getByRole('link', { name: 'Discover', exact: true })).toHaveAttribute('href', '/#discover');
  await expect(navigation.getByRole('link', { name: 'Anime Assistant', exact: true })).toHaveAttribute('href', '/#assistant');
  expect(requests).toEqual([]);
  await page.getByRole('link', { name: 'Log in to use Anime Assistant', exact: true }).click();
  await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirect') === '/assistant');
});

for (const path of ['/discover?q=Frieren', '/assistant', '/anime/kitsu/123', '/anime/local/saved-title']) {
  test(`guest access to ${path} requires login before loading private data`, async ({ page }) => {
    const requests = await sessionApi(page);
    await page.goto(path);
    await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
    const url = new URL(page.url());
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('redirect')).toBe(path);
    expect(requests).toEqual([]);
  });
}

for (const feature of ['discover', 'assistant']) {
  test(`login returns to ${feature} and logout removes access`, async ({ page }) => {
    await sessionApi(page);
    await page.goto(`/${feature}`);
    await page.getByLabel('Email address', { exact: true }).fill('access@example.test');
    await page.getByLabel('Password', { exact: true }).fill('access-test-password');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${feature}$`));
    await expect(page.locator(feature === 'assistant' ? '.assistant-page' : '.explore-page')).toBeVisible();
    await expect(page.locator('.workspace-sidebar')).toBeVisible();
    await page.locator('button[aria-label="Log out"]:visible').click();
    await expect(page).toHaveURL('http://127.0.0.1:5181/');
    await page.goto(`/${feature}`);
    await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirect') === `/${feature}`);
  });
}
