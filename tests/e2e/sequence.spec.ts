import { expect, test } from '@playwright/test';

/**
 * Regression: a sticky sequence must advance with scroll even when the pointer
 * is resting on one of its rows.
 *
 * The list is sticky, so it does not slide under a stationary cursor. When
 * hover pinned a row on mouseenter, whichever row the pointer rested on stayed
 * open for the entire section — scrolling could never advance it. Reported as
 * "misaligned": the open row in the list no longer matched the highlighted row
 * in the model.
 */

async function openRowTitle(page: import('@playwright/test').Page, section: string) {
  return page.evaluate((sel) => {
    const rows = [...document.querySelectorAll<HTMLElement>(`${sel} [data-step]`)];
    const open = rows.find(
      (r) => (r.querySelector(':scope > div:last-child') as HTMLElement | null)?.style.gridTemplateRows === '1fr',
    );
    return open?.querySelector('h3')?.textContent?.trim() ?? '';
  }, section);
}

test.describe('sticky sequences', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'desktop pointer behaviour');

  test('scroll advances the range even with the pointer resting on a row', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Start where the block has actually STUCK. At the very top of the track
    // it is still scrolling up into its sticky position (top: 116px), so its
    // lower rows are legitimately below the fold. Put the track top 50px from
    // the viewport top — above the 116px sticky line — and the block is held.
    const start = await page.evaluate(() => {
      const first = document.querySelector('#range [data-index]') as HTMLElement;
      return first.getBoundingClientRect().top + window.scrollY - 50;
    });
    // `behavior: 'instant'` overrides the site's `scroll-behavior: smooth`.
    // Without it the page ANIMATES to the target, and anything measured in
    // the next few hundred ms is measured mid-flight — the row reported y=3466
    // and a screenshot showed the fixed header halfway down the viewport.
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), start);
    await page.waitForTimeout(400);

    // A real pointer move onto the LAST row pins it.
    //
    // Deliberately NOT locator.hover(): its actionability check scrolls the
    // element into view first, and that scroll fires the IntersectionObserver
    // after the hover lands — which (correctly) reclaims the sequence and
    // clears the pin the hover just set. Move the pointer directly instead.
    const box = await page.locator('#range [data-step]').last().boundingBox();
    if (!box) throw new Error('last range row has no box');
    expect(box.y + box.height / 2).toBeLessThan(900);
    await page.mouse.move(box.x + 40, box.y + box.height / 2);
    await page.mouse.move(box.x + 60, box.y + box.height / 2); // a real movement
    await page.waitForTimeout(200);
    expect(await openRowTitle(page, '#range')).toBe('Industry systems');

    // Now scroll with the wheel. The pointer does not move.
    const seen = new Set<string>();
    for (let i = 0; i < 45; i += 1) {
      await page.mouse.wheel(0, 50);
      await page.waitForTimeout(40);
      const t = await openRowTitle(page, '#range');
      if (t) seen.add(t);
    }
    // Scroll must have reclaimed the sequence and walked it.
    expect(seen.size).toBeGreaterThanOrEqual(3);
  });

  test('an open range row shows its systems and count', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const open = page.locator('#range [data-step]').first();
    await expect(open.locator('ul li')).toHaveCount(6);
    // "6 systems", with the unit from content — the prototype's wording.
    await expect(open.getByText('6 systems', { exact: true })).toBeVisible();
  });
});
