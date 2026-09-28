import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    /** Draw-call counter installed by PATCH below. */
    __calls: number;
  }
}

/**
 * The 3D budget, measured rather than asserted.
 *
 * Draw calls are counted at the WebGL level by patching the context prototype
 * before the page runs, which is the ground truth regardless of what the
 * renderer reports.
 */

const PATCH = `
  (() => {
    const P = WebGL2RenderingContext.prototype;
    window.__calls = 0;
    for (const m of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']) {
      const orig = P[m];
      P[m] = function (...a) { window.__calls++; return orig.apply(this, a); };
    }
  })();
`;

test.describe('the 3D scene', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'WebGL counters are chromium-only here');

  test('renders nothing once the page is idle', async ({ page }) => {
    await page.addInitScript(PATCH);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 8000 });

    // Wake it, then wait past the idle window (2.5s) plus settling.
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(5500);

    const before = await page.evaluate(() => window.__calls);
    await page.waitForTimeout(2500);
    const after = await page.evaluate(() => window.__calls);

    // A settled page must issue zero further draw calls (architecture.md §4).
    expect(after - before).toBe(0);
  });

  test('stays far under the draw-call ceiling while moving', async ({ page }) => {
    await page.addInitScript(PATCH);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 8000 });

    await page.evaluate(() => { window.__calls = 0; });
    const start = Date.now();
    for (let i = 0; i < 40; i += 1) {
      await page.mouse.wheel(0, 60);
      await page.waitForTimeout(16);
    }
    const seconds = (Date.now() - start) / 1000;
    const calls = await page.evaluate(() => window.__calls);

    // One InstancedMesh means ~1 draw call per frame. Even at 60fps that is
    // ~60/s; the ceiling is 100 per frame, so this has enormous headroom.
    const perFrame = calls / Math.max(seconds * 60, 1);
    expect(perFrame).toBeLessThan(100);
  });

  test('is absent, and the page still complete, without WebGL', async ({ page }) => {
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
        if (String(type).includes('webgl')) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (orig as any).call(this, type, ...rest);
      };
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    expect(await page.locator('canvas').count()).toBe(0);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Custom software');
    // Every fact the scene shows also exists as text — check one that the
    // model is responsible for illustrating.
    await expect(page.getByText(/outgrows the workaround/i)).toBeVisible();
  });

  test('is absent under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(await page.locator('canvas').count()).toBe(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('is absent below the lg breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(await page.locator('canvas').count()).toBe(0);
    // And the sequence is inert: every item body is rendered.
    await expect(page.getByText(/Repetitive steps move into the system/i)).toBeVisible();
  });
});
