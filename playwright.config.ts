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
    // The gate runs on its own port so it never collides with, or silently
    // reuses, a `next dev` the owner has open on 3000.
    baseURL: 'http://localhost:3100',
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
    command: 'pnpm build && npx serve out --no-clipboard -l 3100',
    url: 'http://localhost:3100',
    // Never reuse: a long-running `next dev` on :3000 had the suite testing a
    // day-old server instead of the build, and it passed while the built
    // output disagreed with it. The gate must test what ships.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
