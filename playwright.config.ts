import { defineConfig, devices } from '@playwright/test';

/**
 * Three projects, per standards.md §5: chromium, webkit, mobile chrome.
 * A partial run is not a sign-off.
 */
export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**', '**/integration/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // WebGL renders in software here; more workers overload the CPU and time
  // tests out (load average 100+, 2026-09-29). Two is reliable.
  workers: 2,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    // Never reuse: a long-running `next dev` on :3000 had the suite testing a
    // day-old server instead of the build, and it passed while the built
    // output disagreed with it. The gate must test what ships.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
