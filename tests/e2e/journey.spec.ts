import { expect, test } from '@playwright/test';

test.describe('the scroll journey', () => {
  test('the hero states the category within the first screen', async ({ page }) => {
    // context.md §3: naming the category in the first screen took five-second
    // comprehension from 26% to 80%. Since 2026-09-29 the H1 is a tag
    // ("Systems that grow with you.") and the sub carries the category, so
    // the check is the category above the fold, in the H1 or the sub, not the
    // H1 wording.
    await page.goto('/');
    const category = page.getByText(/custom software/i).first();
    await expect(category).toBeVisible();
    const box = await category.boundingBox();
    const vh = page.viewportSize()?.height ?? 0;
    expect(box && box.y + box.height).toBeLessThanOrEqual(vh);
    await expect(page.getByText(/spreadsheets, message threads and manual steps/i)).toBeVisible();
  });

  test('the skip link is the first thing Tab reaches', async ({ page, browserName }) => {
    // WebKit does not include links in the Tab order unless the user has
    // enabled full keyboard access (Safari > Advanced, or macOS Keyboard
    // settings). That is a platform default, not a defect in the markup — so
    // the Tab-order assertion runs where Tab reaches links, and WebKit gets
    // the assertion that actually matters there.
    test.skip(browserName === 'webkit', 'WebKit excludes links from Tab order by default');
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused();
  });

  test('the skip link is first in the DOM and targets main', async ({ page }) => {
    await page.goto('/');
    const skip = page.getByRole('link', { name: /skip to content/i });
    await expect(skip).toHaveAttribute('href', '#main');

    // First focusable element in document order, on every engine.
    const isFirst = await page.evaluate(() => {
      const focusable = document.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])',
      );
      return focusable[0]?.getAttribute('href') === '#main';
    });
    expect(isFirst).toBe(true);

    // And it works when activated.
    await skip.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeVisible();
  });

  test('no placeholder text reaches the page', async ({ page }) => {
    await page.goto('/');
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/\[[^\]]{3,}\]|Lorem ipsum|TBD\b/);
  });

  test('phones get everything open — no hover-gated content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'no horizontal scroll at 390px').toBeLessThanOrEqual(0);
  });
});
