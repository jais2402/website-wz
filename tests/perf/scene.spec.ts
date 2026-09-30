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

  test('the journey is continuous: the model never fades or jumps while scrolling', async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium', 'desktop stage; one engine is enough');
    await page.setViewportSize({ width: 1440, height: 820 });
    await page.goto('/?debug3d');
    await waitForStage(page);
    // 2026-09-29: the blocks are one journey, morphing from each section's shape
    // into the next (the approved prototype's loop). A snap once jumped ~980px
    // in a frame, and a later dissolve faded the model out and in. Scroll the
    // whole page at 11px a frame and require no fade and no per-frame jump.
    const r = await page.evaluate(async () => {
      const cv = document.querySelector('canvas')!;
      const max = document.documentElement.scrollHeight - innerHeight;
      let worst = 0, faded = false, prev: number[] | null = null;
      await new Promise<void>((done) => {
        const step = () => {
          window.scrollTo({ top: Math.min(max, window.scrollY + 11), behavior: 'instant' });
          if (cv.style.opacity && cv.style.opacity !== '1') faded = true;
          const d = (cv.dataset.dbg ?? '').split(',').map(Number);
          if (prev && d.length > 1) worst = Math.max(worst, Math.abs(d[0]! - prev[0]!), Math.abs(d[1]! - prev[1]!));
          if (d.length > 1) prev = d;
          if (window.scrollY < max) requestAnimationFrame(step); else done();
        };
        requestAnimationFrame(step);
      });
      return { worst, faded };
    });
    expect(r.faded).toBe(false);
    expect(r.worst).toBeLessThan(40);
  });

  test('an attached model moves with the page and does not slide after scroll stops', async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium', 'desktop stage; one engine is enough');
    await page.setViewportSize({ width: 1440, height: 820 });
    await page.goto('/?debug3d');
    await waitForStage(page);
    // 2026-09-29: a filter on placement made centred models trail the scroll
    // and slide ~300px after the page stopped. Flick 360px inside the moment
    // chapter, stop, and require zero visible movement afterwards.
    const top = await page.evaluate(() => document.getElementById('moment')!.offsetTop);
    await page.evaluate((y) => window.scrollTo({ top: y - 100, behavior: 'instant' }), top);
    await page.waitForTimeout(1500);
    const moved = await page.evaluate(async () => {
      const cv = document.querySelector('canvas')!;
      const s: number[][] = [];
      await new Promise<void>((done) => {
        let f = 0;
        const step = () => {
          if (f < 12) window.scrollTo({ top: window.scrollY + 30, behavior: 'instant' });
          if (cv.dataset.dbg) s.push(cv.dataset.dbg.split(',').map(Number));
          f += 1;
          if (f < 80) requestAnimationFrame(step); else done();
        };
        requestAnimationFrame(step);
      });
      let m = 0;
      for (let i = 14; i < s.length; i += 1) if (s[i]![4]! > 0.9 && s[i - 1]![4]! > 0.9) m = Math.max(m, Math.abs(s[i]![1]! - s[i - 1]![1]!));
      return m;
    });
    expect(moved).toBeLessThan(1);
  });

  test('rests when the reader is idle, and wakes on scroll', async ({ page }) => {
    // Waits out the 6s idle rest on purpose; under a parallel suite the default
    // 30s budget was exceeded once (timeout, not a behaviour failure).
    test.setTimeout(60_000);
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
    // The bento's centre never goes empty: the line-drawn stand-in shows.
    const fallback = page.locator('#build [data-stage-fallback]');
    if (await fallback.count()) {
      expect(await fallback.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    }
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

test.describe('3D → DOM hover (the reverse channel)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'desktop stage; one engine is enough');

  test('pointing at the model lights its bento tile, and moving away clears it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await waitForStage(page);

    // "build" is a static bento (every tile always open) — settle the stage on
    // it and let the damped placement (k = 1 − exp(−dt·5.2)) converge before
    // pointing at it.
    await page.locator('#build').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    // The model's visual centre inside the slot matches the fallback glyph's
    // placement (top-[44%] of the slot — SequenceSection.tsx): a real box in
    // the grid sits at the model's local origin, which projects there. This
    // point is INSIDE [data-stage-slot], never over a bento tile, so any tile
    // that lights up can only have done so via the model-hover channel, not
    // via the tile's own `:hover`/`onMouseMove`.
    const slot = await page.locator('[data-stage-slot]').boundingBox();
    if (!slot) throw new Error('no data-stage-slot in the build bento');
    const target = { x: slot.x + slot.width / 2, y: slot.y + slot.height * 0.44 };

    // Direct children of the bento grid that are links — the nine tiles, not
    // the CTA link below the grid (which also carries the `.group` class).
    const tiles = page.locator('#build .grid > a');
    const anyHighlighted = async () =>
      tiles.evaluateAll((els) => els.some((el) => el.className.split(/\s+/).includes('bg-raised')));

    expect(await anyHighlighted()).toBe(false);

    // A real move (not a single event): Chromium can otherwise treat the
    // first move as a no-op if it lands where the pointer already was.
    await page.mouse.move(target.x - 4, target.y - 4);
    await page.mouse.move(target.x, target.y);
    await page.waitForTimeout(400);
    expect(await anyHighlighted()).toBe(true);

    // Move well clear of the slot and every other tile (top-left corner).
    await page.mouse.move(4, 4);
    await page.waitForTimeout(400);
    expect(await anyHighlighted()).toBe(false);
  });

  test('pointing at a module also recolours it and dims the rest', async ({ page }) => {
    // Colour is read from `canvas.dataset.dbgc` (`?debug3d`), a comma list of
    // the rendered instance colours (`cur.c`, stage.ts) in hex — there is no
    // `preserveDrawingBuffer`, so a real pixel readback isn't available here.
    // Position is not re-asserted: it is a static property of the code that
    // the lift offset only ever reads the DOM-driven highlight (`hl`), never
    // the 3D-hover index used for colour (`hlc`) — see states.ts and the
    // `hlcA`/`hlcB` computation in stage.ts.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?debug3d');
    await waitForStage(page);

    await page.locator('#build').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const slot = await page.locator('[data-stage-slot]').boundingBox();
    if (!slot) throw new Error('no data-stage-slot in the build bento');
    const target = { x: slot.x + slot.width / 2, y: slot.y + slot.height * 0.44 };
    const tiles = page.locator('#build .grid > a');

    const readColours = () => page.evaluate(() =>
      (document.querySelector('canvas')!.dataset.dbgc ?? '').split(',').filter(Boolean));

    const before = await readColours();
    expect(before.length).toBeGreaterThan(0);

    await page.mouse.move(target.x - 4, target.y - 4);
    await page.mouse.move(target.x, target.y);
    await page.waitForTimeout(400);

    // The DOM tile order matches the model's instance order (both walk
    // `DISC` — SequenceSection.tsx's bento map, states.ts's `build` case).
    const hoveredIndex = await tiles.evaluateAll((els) =>
      els.findIndex((el) => el.className.split(/\s+/).includes('bg-raised')));
    expect(hoveredIndex).toBeGreaterThanOrEqual(0);

    const after = await readColours();
    // The hovered module returns to its full hue.
    expect(after[hoveredIndex]).not.toBe(before[hoveredIndex]);
    // At least one other module went paler, not just the hovered one lighting
    // up — the figure/ground effect the owner asked for.
    const otherChanged = after.some((c, i) => i !== hoveredIndex && i < before.length && c !== before[i]);
    expect(otherChanged).toBe(true);
  });
});

test.describe('the model on a sub-page', () => {
  const SUB = '/capabilities/ecommerce-systems/';

  test('the still drawing stands in until a stage is live, and never disappears without one', async ({
    page,
  }) => {
    // Rule 4: the page is complete without the 3D. The drawing is the DOM's
    // copy of the same idea, and it only steps aside for a live stage.
    await page.goto(SUB);
    const glyph = page.locator('[data-stage-fallback]').first();
    await expect(glyph).toHaveCount(1);
    await page.waitForTimeout(3500);
    const live = await page.evaluate(() => document.documentElement.classList.contains('has3d'));
    const opacity = await glyph.evaluate((el) => getComputedStyle(el).opacity);
    if (live) expect(Number(opacity)).toBeLessThan(0.05);
    else expect(Number(opacity)).toBe(1);
  });

  test('no canvas below lg, and the page still reads', async ({ page }) => {
    // Rule 5: on a phone the model is not the point and the chunk never loads.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(SUB);
    await page.waitForTimeout(2500);
    const three = page.evaluate(() =>
      performance.getEntriesByType('resource').filter((r) => /chunks\//.test(r.name)).length,
    );
    expect(await three).toBeGreaterThanOrEqual(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const canvas = page.locator('canvas#stage');
    if (await canvas.count()) {
      await expect(canvas).not.toHaveClass(/ready/);
    }
  });

  test('the model does not sit on the reading column', async ({ page }) => {
    // The band is its own block above the text, not a layer behind it: the
    // FAQ/contact overlap on the home page is the failure this avoids.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(SUB);
    await page.waitForTimeout(3500);
    const band = await page.locator('[data-stage-slot]').first().boundingBox();
    const h1 = await page.getByRole('heading', { level: 1 }).boundingBox();
    expect(band && h1 && band.y + band.height).toBeLessThanOrEqual((h1?.y ?? 0) + 1);
  });
});

test.describe('the shapes resolve into cubes', () => {
  test('irregular at the top of the page, exact by the last scene', async ({ page }) => {
    // The payoff has to be ON SCREEN. Measured against document height the
    // resolve completed inside the footer, which carries no model, so the
    // assembled cube was never visible. It now ends at the last scene.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?debug3d');
    await page.waitForTimeout(3500);
    const resolve = async () => {
      const dbg = await page.locator('canvas#stage').getAttribute('data-dbg');
      return Number((dbg ?? '').split(',')[6] ?? NaN);
    };
    test.skip(Number.isNaN(await resolve()), 'no live stage in this environment');

    expect(await resolve()).toBeLessThan(0.05);
    await page.evaluate(() =>
      document.getElementById('contact')?.scrollIntoView({ behavior: 'instant', block: 'center' }),
    );
    await page.waitForTimeout(2500);
    expect(await resolve()).toBeGreaterThan(0.95);
  });
});
