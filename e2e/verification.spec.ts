import { test, expect, type Page } from '@playwright/test';

async function pendingApi(page: Page, mailSent: boolean | null = true) {
  let signedIn = mailSent === null;
  let verified = false;
  let sends = 0;
  const privateRequests: string[] = [];
  const user = () => ({ id: 'pending', name: 'Pending member', email: 'pending@example.test', role: 'MEMBER', emailVerifiedAt: verified ? '2026-11-02T00:00:00.000Z' : null });
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    if (path === '/auth/refresh') return route.fulfill(signedIn ? { json: { user: user(), accessToken: 'pending-token' } } : { status: 204 });
    if (path === '/auth/register' || path === '/auth/login') {
      signedIn = true;
      return route.fulfill({ json: { user: user(), accessToken: 'pending-token', ...(path === '/auth/register' ? { verificationEmailSent: mailSent } : {}) } });
    }
    if (path === '/auth/me') return route.fulfill({ json: { user: user() } });
    if (path === '/auth/email/verify') { verified = true; return route.fulfill({ status: 204 }); }
    if (path === '/auth/email/request') {
      if (!verified) sends++;
      return route.fulfill({ json: { verificationEmailSent: !verified, message: verified ? 'Your email is already verified.' : 'A verification link has been sent.' } });
    }
    if (path === '/auth/logout') { signedIn = false; return route.fulfill({ status: 204 }); }
    privateRequests.push(path);
    if (!verified) return route.fulfill({ status: 403, json: { error: { code: 'EMAIL_VERIFICATION_REQUIRED', message: 'Verify your email first.' } } });
    if (path === '/watchlist') return route.fulfill({ json: { items: [], spotlightId: null, hasNext: false } });
    if (path === '/anime/meta') return route.fulfill({ json: { genres: [], statuses: [], posters: [] } });
    return route.fulfill({ json: { items: [], hasNext: false } });
  });
  return { privateRequests, sends: () => sends, verifyElsewhere: () => { verified = true; } };
}

test('signup requires verification, preserves the intended feature and grants access only after confirmation', async ({ page }) => {
  const state = await pendingApi(page);
  await page.goto('/register?redirect=/discover');
  await page.getByLabel('Your name', { exact: true }).fill('Pending member');
  await page.getByLabel('Email address', { exact: true }).fill('pending@example.test');
  await page.getByLabel('Password', { exact: true }).fill('temporary-browser-password');
  await page.getByRole('button', { name: 'Create your account' }).click();
  await expect(page.getByRole('heading', { name: 'Check your email.' })).toBeVisible();
  await expect(page).toHaveURL(url => url.pathname === '/check-email' && url.searchParams.get('redirect') === '/discover');
  await expect(page.locator('.workspace-sidebar')).toHaveCount(0);
  await page.getByRole('button', { name: "I've verified my email", exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('not verified yet');
  expect(state.privateRequests).toEqual([]);
  for (const path of ['/dashboard', '/watchlist', '/collections', '/discover', '/assistant', '/calendar', '/account', '/anime/kitsu/123']) {
    await page.goto(path);
    await expect(page).toHaveURL(url => url.pathname === '/check-email' && url.searchParams.get('redirect') === path);
    await expect(page.locator('.workspace-sidebar')).toHaveCount(0);
  }
  expect(state.privateRequests).toEqual([]);
  await page.goto('/verify-email?redirect=/discover#token=' + 'v'.repeat(43));
  await expect(page).toHaveURL(/\/verify-email\?redirect=\/discover$/);
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await page.getByRole('link', { name: 'Continue to AniTrack', exact: true }).click();
  await expect(page).toHaveURL(/\/discover$/);
  await expect(page.locator('.workspace-sidebar')).toBeVisible();
});

test('delivery failure shows a recoverable pending account and resend has a cooldown', async ({ page }) => {
  const state = await pendingApi(page, false);
  await page.goto('/register');
  await page.getByLabel('Your name', { exact: true }).fill('Pending member');
  await page.getByLabel('Email address', { exact: true }).fill('pending@example.test');
  await page.getByLabel('Password', { exact: true }).fill('temporary-browser-password');
  await page.getByRole('button', { name: 'Create your account' }).click();
  await expect(page.getByText('Your account is saved, but we could not send the verification email. Request a new link below.')).toBeVisible();
  await page.getByRole('button', { name: 'Resend verification email', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('new verification link');
  await expect(page.getByRole('button', { name: /Resend available in/ })).toBeDisabled();
  expect(state.sends()).toBe(1);
  await page.getByRole('button', { name: 'Use another account', exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test('an existing unverified account is restricted after reload and fits a phone', async ({ page }) => {
  const state = await pendingApi(page, null);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Check your email.' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Check your email.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(state.privateRequests).toEqual([]);
});

test('resend recognizes verification completed in another browser without claiming another email was sent', async ({ page }) => {
  const state = await pendingApi(page, null);
  await page.goto('/assistant');
  await expect(page.getByRole('heading', { name: 'Check your email.' })).toBeVisible();
  state.verifyElsewhere();
  await page.getByRole('button', { name: 'Resend verification email', exact: true }).click();
  await expect(page).toHaveURL(/\/assistant$/);
  await expect(page.locator('.assistant-page')).toBeVisible();
  expect(state.sends()).toBe(0);
});
