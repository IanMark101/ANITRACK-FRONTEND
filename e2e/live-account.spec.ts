import { randomBytes, randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

test('live temporary account can register, manage a custom title and delete its data', async ({ page, request }) => {
  test.skip(!process.env.ANITRACK_LIVE_SMOKE_URL, 'Opt in with a reachable development frontend URL.');
  test.setTimeout(240000);
  const email = `temporary-ui-${randomUUID()}@example.test`;
  const password = randomBytes(24).toString('base64url');
  let userId = '';
  let deleted = false;
  try {
    await page.goto('/register');
    await page.getByLabel('Your name', { exact: true }).fill('Temporary browser account');
    await page.getByLabel('Email address', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    const registered = page.waitForResponse((response) => response.url().endsWith('/api/auth/register'));
    await page.getByRole('button', { name: 'Create your account' }).click();
    const session = await (await registered).json();
    expect(session.user?.id).toBeTruthy();
    userId = session.user.id;
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole('button', { name: 'Add anime', exact: true }).click();
    await page.getByRole('button', { name: 'Create a custom entry', exact: true }).click();
    await page.getByLabel('Anime title', { exact: true }).fill('Temporary smoke-test title');
    const saved = page.waitForResponse((response) => response.url().endsWith('/api/watchlist') && response.request().method() === 'POST');
    await page.locator('.add-anime-dialog').getByRole('button', { name: 'Add to watchlist', exact: true }).click();
    expect((await saved).status()).toBe(201);
    await page.goto('/watchlist');
    await expect(page.getByRole('link', { name: 'Temporary smoke-test title', exact: true })).toBeVisible({ timeout: 20000 });
    await page.goto('/collections');
    await page.getByRole('button', { name: 'Create new', exact: true }).click();
    await page.getByLabel('Collection name', { exact: true }).fill('Temporary browser collection');
    await page.getByRole('button', { name: 'Create collection', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Temporary browser collection', exact: true })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Add from watchlist', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Temporary smoke-test title' }).check();
    await page.getByRole('button', { name: 'Add selected', exact: true }).click();
    await expect(page.locator('.collection-anime-card')).toHaveCount(1, { timeout: 15000 });
    await page.getByRole('button', { name: 'Edit collection', exact: true }).click();
    await page.getByLabel('Collection name', { exact: true }).fill('Renamed browser collection');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Renamed browser collection', exact: true })).toBeVisible({ timeout: 15000 });
    await page.goto('/collections');
    await expect(page.locator('.collection-card')).toContainText('Renamed browser collection', { timeout: 15000 });
    await page.locator('.collection-card').click();
    await page.getByRole('button', { name: 'Delete collection', exact: true }).click();
    await page.locator('.collection-dialog').getByRole('button', { name: 'Delete collection', exact: true }).click();
    await expect(page).toHaveURL(/\/collections$/, { timeout: 15000 });
    await page.goto('/watchlist');
    await expect(page.getByRole('link', { name: 'Temporary smoke-test title', exact: true })).toBeVisible({ timeout: 20000 });
    await page.goto('/account');
    await page.getByLabel('Your name', { exact: true }).fill('Updated temporary account');
    await page.getByRole('button', { name: 'Save profile', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Your name has been updated');
    await page.getByRole('button', { name: 'Delete my account', exact: true }).click();
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Type DELETE', { exact: true }).fill('DELETE');
    const removed = page.waitForResponse((response) => response.url().endsWith('/api/account') && response.request().method() === 'DELETE');
    await page.getByRole('button', { name: 'Permanently delete account', exact: true }).click();
    expect((await removed).status()).toBe(204);
    deleted = true;
  } finally {
    // Clean up this exact randomly named account even if a UI assertion fails.
    if (!deleted) {
      const login = await request.post('/api/auth/login', { data: { email, password } });
      if (login.ok()) {
        const session = await login.json();
        if (userId) expect(session.user.id).toBe(userId);
        const result = await request.delete('/api/account', {
          headers: { Authorization: `Bearer ${session.accessToken}` }, data: { password, confirmation: 'DELETE' }
        });
        expect(result.status()).toBe(204);
      } else expect(login.status()).toBe(401);
    }
  }
});
