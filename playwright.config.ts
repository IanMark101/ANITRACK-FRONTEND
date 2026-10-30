import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', workers: 1, timeout: 60000,
  forbidOnly: Boolean(process.env.CI), retries: process.env.CI ? 1 : 0,
  use: { baseURL: process.env.ANITRACK_LIVE_SMOKE_URL || 'http://127.0.0.1:5181',
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
    trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: process.env.ANITRACK_LIVE_SMOKE_URL ? undefined
    : { command: 'node node_modules/@quasar/app-vite/bin/quasar.js dev --port 5181', url: 'http://127.0.0.1:5181', reuseExistingServer: false, timeout: 120000 }
});
