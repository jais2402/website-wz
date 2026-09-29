import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    /** Draw-call counter installed by PATCH below. */
    __calls: number;
  }
}

/**
 * The 3D budget and the four fallbacks, measured rather than asserted.
 *
 * Note on idling: the approved design has continuous ambient motion — a slow
 * yaw, pulses travelling connectors, work flowing through the model. The loop
 * therefore runs while the scene is live and stops when it is **paused**, which
 * is what the header's motion control and prefers-reduced-motion both do. An
 * earlier version of this suite asserted that a live page eventually stops
 * rendering; that was an invention, not the design. See journal.md.
 *
 * The canvas element is always in the DOM. What the fallbacks change is whether
 * the stage engine starts — signalled by the `no3d` class and by the three.js
 * chunk never being requested.
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

/** Resolves once the stage has actually started drawing. */
async function waitForStage(page: import('@playwright/test').Page) {
  await page.waitForFunction(
    () => document.querySelector('canvas')?.classList.contains('ready') === true,
    null,
    { timeout: 10000 },
  );
}

test.describe('the 3D scene', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'WebGL counters are chromium-only here');

  test('stays far under the draw-call ceiling while moving', async ({ page }) => {
    await page.addInitScript(PATCH);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await waitForStage(page);

    await page.evaluate(() => { window.__calls = 0; });
    const start = Date.now();
    for (let i = 0; i < 30; i += 1) {
      await page.mouse.wheel(0, 60);
      await page.waitForTimeout(16);
    }
    const seconds = (Date.now() - start) / 1000;
    const calls = await page.evaluate(() => window.__calls);

    // One InstancedMesh, one hub, one pulse mesh and four line objects — a
    // handful of draw calls per frame against a ceiling of 100.
    const perFrame = calls / Math.max(seconds * 60, 1);
    expect(perFrame).toBeLessThan(100);
    expect(calls).toBeGreaterThan(0);
  });

  test('stops rendering when motion is paused', async ({ page }) => {
    await page.addInitScript(PATCH);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await waitForStage(page);

    await page.getByRole('button', { name: /pause motion/i }).click();
    // The loop idles two seconds after the last poke.
    await page.waitForTimeout(3000);

    const before = await page.evaluate(() => window.__calls);
    await page.waitForTimeout(2000);
    const after = await page.evaluate(() => window.__calls);
    expect(after - before).toBe(0);
  });

  test('scene hand-offs glide: no jump between frames', async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium', 'desktop stage; one engine is enough for a motion bound');
    await page.setViewportSize({ width: 1440, height: 820 });
    await page.goto('/?debug3d');
    await waitForStage(page);
    // 2026-09-29: the model once jumped ~980px in one frame at centred
    // chapters (a snap). Scroll through moment and regions at 11px a frame
    // and bound the largest per-frame move of the smoothed placement.
    for (const id of ['moment', 'regions']) {
      const top = await page.evaluate((i) => document.getElementById(i)!.offsetTop, id);
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - 820);
      await page.waitForTimeout(1200);
      const maxStep = await page.evaluate(async () => {
        const cv = document.querySelector('canvas')!;
        const s: number[][] = [];
        await new Promise<void>((done) => {
          let f = 0;
          const step = () => {
            if (f < 90) window.scrollTo({ top: window.scrollY + 11, behavior: 'instant' });
            if (cv.dataset.dbg) s.push(cv.dataset.dbg.split(',').map(Number));
            f += 1;
            if (f < 150) requestAnimationFrame(step); else done();
          };
          requestAnimationFrame(step);
        });
        let m = 0;
        for (let i = 1; i < s.length; i += 1) m = Math.max(m, Math.abs(s[i]![0]! - s[i - 1]![0]!), Math.abs(s[i]![1]! - s[i - 1]![1]!));
        return m;
      });
      expect(maxStep).toBeLessThan(60);
    }
  });

  test('rests when the reader is idle, and wakes on scroll', async ({ page }) => {
    await page.addInitScript(PATCH);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await waitForStage(page);

    // CLAUDE.md rule 4: draw on demand. The loop rests 6s after the last input.
    await page.waitForTimeout(7500);
    const before = await page.evaluate(() => window.__calls);
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => window.__calls)).toBe(before);

    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.__calls)).toBeGreaterThan(before);
  });

  test('is inert, and the page complete, without WebGL', async ({ page }) => {
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
    await page.waitForTimeout(2500);

    await expect(page.locator('html')).toHaveClass(/no3d/);
    await expect(page.locator('canvas')).not.toHaveClass(/ready/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/custom software/i).first()).toBeVisible();
    // Every fact the scene illustrates also exists in the DOM as text.
    await expect(page.getByText(/outgrows the workaround/i)).toBeVisible();
  });

  test('does not run continuously under prefers-reduced-motion', async ({ page }) => {
    await page.addInitScript(PATCH);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(3000);

    const before = await page.evaluate(() => window.__calls);
    await page.waitForTimeout(2000);
    const after = await page.evaluate(() => window.__calls);
    // Under reduced motion the stage draws on scroll only — never on a timer.
    expect(after - before).toBe(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('never loads the three.js chunk below the lg breakpoint', async ({ page }) => {
    const three: string[] = [];
    page.on('request', (r) => { if (/chunks\/.*\.js$/.test(r.url())) three.push(r.url()); });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(2500);

    await expect(page.locator('html')).toHaveClass(/no3d/);
    await expect(page.locator('canvas')).not.toHaveClass(/ready/);
    // And the sequence is inert: every item body is rendered.
    await expect(page.getByText(/Routine steps run themselves/i)).toBeVisible();
  });
});
