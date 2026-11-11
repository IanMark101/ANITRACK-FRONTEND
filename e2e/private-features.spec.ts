import { test, expect, type Page } from '@playwright/test';

async function sessionApi(page: Page) {
  let signedIn = false;
  const privateRequests: string[] = [];
  const user = { id: 'access-check', name: 'Access Tester', email: 'access@example.test', role: 'MEMBER', emailVerifiedAt: '2026-11-02T00:00:00.000Z' };
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    if (path === '/auth/refresh') return route.fulfill(signedIn
      ? { json: { user, accessToken: 'access-test-token' } }
      : { status: 204 });
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
  await expect(page.locator('#features')).toContainText('Sample watchlist');
  await expect(page.locator('#collections')).toContainText('Fantasy journeys');
  await expect(page.locator('#discover')).toContainText('Sample catalog results');
  await expect(page.locator('#assistant')).toContainText('Suggested match');
  await page.getByText('See the clues it matched', { exact: true }).click();
  await expect(page.getByText('A long-lived elf mage', { exact: true })).toBeVisible();
  await expect(page.locator('.poster-picker, .explore-search, textarea')).toHaveCount(0);
  const navigation = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  await expect(navigation.getByRole('link', { name: 'Discover', exact: true })).toHaveAttribute('href', '/#discover');
  await expect(navigation.getByRole('link', { name: 'Anime Assistant', exact: true })).toHaveAttribute('href', '/#assistant');
  expect(requests).toEqual([]);
  await page.getByRole('link', { name: 'Log in to use Anime Assistant', exact: true }).click();
  await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirect') === '/assistant');
});

test('phone landing keeps its artwork beside the title and navigation in one header row', async ({ page }) => {
  const requests = await sessionApi(page);
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 562 });
    await page.goto('/');
    await expect(page.locator('.hero-title-mobile')).toBeVisible();
    const layout = await page.evaluate(() => {
      const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const heading = box('.hero-copy h1');
      const art = box('.hero-mobile-art');
      const description = box('.hero-description');
      const action = box('.landing-actions .btn');
      const brand = box('.logo-area');
      const login = box('.login-link');
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        titleClearOfArt: heading.right <= art.left,
        artBesideTitle: heading.top < art.bottom && art.top < heading.bottom,
        artAboveDescription: art.bottom <= description.top,
        actionOnFirstScreen: action.bottom <= innerHeight,
        headerFits: brand.right < login.left,
        headerRows: document.querySelector('header')!.getBoundingClientRect().height
      };
    });
    expect(layout).toEqual({
      overflow: false, titleClearOfArt: true, artBesideTitle: true,
      artAboveDescription: true, actionOnFirstScreen: true, headerFits: true, headerRows: 64
    });
  }
  const menu = page.getByRole('button', { name: 'Navigation', exact: true });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click();
  await page.locator('#public-mobile-menu').getByRole('link', { name: 'Discover', exact: true }).click();
  await expect(page).toHaveURL(url => url.hash === '#discover');
  await expect(page.locator('#public-mobile-menu')).toHaveCount(0);
  expect(requests).toEqual([]);
});

test('landing and account links stay responsive while session restoration is stalled', async ({ page }) => {
  let finish!: () => void;
  let attempts = 0;
  await page.route('**/api/auth/refresh', async route => {
    attempts++;
    await new Promise<void>(resolve => { finish = resolve; });
    await route.abort();
  });
  try {
    await page.setViewportSize({ width: 360, height: 784 });
    await page.goto('/');
    await expect(page.locator('.landing-page')).toBeVisible({ timeout: 2500 });
    await page.getByRole('link', { name: 'Start your watchlist', exact: true }).click({ timeout: 2500 });
    await expect(page.getByLabel('Your name', { exact: true })).toBeVisible({ timeout: 2500 });
    await page.locator('.auth-switch').getByRole('link', { name: 'Log in', exact: true }).click({ timeout: 2500 });
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible({ timeout: 2500 });
    await page.getByRole('link', { name: 'Forgot your password?', exact: true }).click({ timeout: 2500 });
    await expect(page).toHaveURL(url => url.pathname === '/forgot-password');
    expect(attempts).toBe(1);
  } finally {
    finish?.();
  }
});

test('landing can recover a connection without blocking public navigation', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/auth/refresh', route => ++attempts === 1
    ? route.abort('connectionfailed') : route.fulfill({ status: 204 }));
  await page.goto('/');
  await expect(page.locator('.public-connection-notice')).toContainText('Cannot reach AniTrack');
  await page.locator('.public-connection-notice').getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.locator('.public-connection-notice')).toHaveCount(0);
  await expect(page.locator('.landing-page')).toBeVisible();
  expect(attempts).toBe(2);
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
    await page.getByRole('dialog', { name: 'Log out of AniTrack?' }).getByRole('button', { name: 'Log out', exact: true }).click();
    await expect(page).toHaveURL(url => url.pathname === '/');
    await page.goto(`/${feature}`);
    await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirect') === `/${feature}`);
  });
}
