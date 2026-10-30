import { test, expect, type Page } from '@playwright/test';

async function fakeApi(page: Page, signedIn = false) {
  let user = signedIn ? { id: 'browser-test', name: 'Browser Tester', email: 'browser@example.test', role: 'MEMBER', emailVerifiedAt: null } : null;
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    const method = route.request().method();
    const ok = (body: unknown) => route.fulfill({ json: body });
    if (path === '/auth/refresh') return user ? ok({ user, accessToken: 'test-token' })
      : route.fulfill({ status: 401, json: { error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } } });
    if (path === '/auth/register' || path === '/auth/login') {
      const input = route.request().postDataJSON();
      user = { id: 'browser-test', name: input.name || 'Browser Tester', email: input.email, role: 'MEMBER', emailVerifiedAt: null };
      return ok({ user, accessToken: 'test-token' });
    }
    if (path === '/auth/logout' || (path === '/account' && method === 'DELETE')) {
      user = null; return route.fulfill({ status: 204 });
    }
    if (path === '/account' && method === 'PATCH') {
      user = { ...user!, name: route.request().postDataJSON().name }; return ok({ user });
    }
    if (path === '/auth/password/forgot') return ok({ message: 'If an account matches that email, a password-reset link will be sent.' });
    if (path === '/auth/email/request') return ok({ message: 'A verification link has been sent.' });
    if (path === '/auth/password/reset' || path === '/auth/email/verify' || path === '/account/password') return route.fulfill({ status: 204 });
    if (path === '/watchlist') return ok({ items: [], spotlightId: null, hasNext: false });
    if (path === '/anime/meta') return ok({ genres: ['Action', 'Adventure'], statuses: ['Watching', 'Completed', 'Plan to Watch'], posters: [] });
    if (path === '/discovery' || path === '/anime') return ok({ items: [], hasNext: false });
    return route.fulfill({ status: 404, json: { error: { message: 'Unexpected test request' } } });
  });
}

test('registration, profile update, logout and password-recovery navigation', async ({ page }) => {
  await fakeApi(page);
  await page.goto('/register');
  await page.getByLabel('Your name', { exact: true }).fill('Browser Tester');
  await page.getByLabel('Email address', { exact: true }).fill('browser@example.test');
  await page.getByLabel('Password', { exact: true }).fill('browser-test-password-1982');
  await page.getByRole('button', { name: 'Create your account' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/account');
  await page.getByLabel('Your name', { exact: true }).fill('Updated Browser Tester');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Your name has been updated');
  await page.getByRole('button', { name: 'Send verification email', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('verification link');
  await page.locator('button[aria-label="Log out"]:visible').click();
  await page.goto('/login');
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible();
  await page.getByLabel('Email address', { exact: true }).fill('browser@example.test');
  await page.getByRole('button', { name: 'Send reset link', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('If an account matches');
});

test('reset links clear their URL token and require matching passwords', async ({ page }) => {
  await fakeApi(page);
  await page.goto('/reset-password#token=' + 'a'.repeat(43));
  await expect(page.getByRole('heading', { name: 'Choose a new password.' })).toBeVisible();
  await expect(page).toHaveURL(/\/reset-password$/);
  await page.getByLabel('New password', { exact: true }).fill('a-new-test-password');
  await page.getByLabel('Confirm new password', { exact: true }).fill('a-different-password');
  await page.getByRole('button', { name: 'Save password', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('matching passwords');
  await page.getByLabel('Confirm new password', { exact: true }).fill('a-new-test-password');
  await page.getByRole('button', { name: 'Save password', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Your password has changed');
});

test('email verification requires explicit confirmation', async ({ page }) => {
  await fakeApi(page);
  let verifies = 0;
  page.on('request', (request) => { if (request.url().endsWith('/api/auth/email/verify')) verifies++; });
  await page.goto('/verify-email#token=' + 'b'.repeat(43));
  await expect(page.getByRole('button', { name: 'Verify email', exact: true })).toBeVisible();
  expect(verifies).toBe(0);
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Your email is verified');
  expect(verifies).toBe(1);
});

test('mobile account page fits and deletion requires explicit confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fakeApi(page, true);
  await page.goto('/account');
  await expect(page.getByRole('heading', { name: 'Your account.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'More navigation', exact: true }).click();
  const more = page.getByRole('navigation', { name: 'More destinations', exact: true });
  await expect(more.getByRole('link')).toHaveCount(3);
  await more.getByRole('link', { name: 'Account', exact: true }).click();
  await expect(more).toBeHidden();
  await page.getByRole('button', { name: 'Delete my account', exact: true }).click();
  const submit = page.getByRole('button', { name: 'Permanently delete account', exact: true });
  await expect(submit).toBeDisabled();
  await page.getByLabel('Password', { exact: true }).fill('browser-test-password');
  await page.getByLabel('Type DELETE', { exact: true }).fill('DELETE');
  await submit.click();
  await expect(page).toHaveURL('http://127.0.0.1:5181/');
});
