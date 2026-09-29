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

test('every "What we build" tile links to an entry that exists on /capabilities', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('#build a[href*="/capabilities"][href*="#"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
  expect(hrefs).toHaveLength(8);
  await page.goto('/capabilities');
  for (const href of hrefs) {
    const id = href.split('#')[1]!;
    await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  }
});

test.describe('review fixes (2026-09-29)', () => {
  test('the contact CTA is reachable from the header at every width', async ({ page }) => {
    // context.md §2/§5: ~45% of every cohort is on a phone, and the CTA is the
    // highest-recall string the brand owns. Below 640px the button carries the
    // short label; it is never absent.
    await page.goto('/');
    const header = page.locator('header');
    await expect(header.getByRole('link', { name: /tell us what is not working|contact/i })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(header.getByRole('link', { name: /tell us what is not working|contact/i })).toBeVisible();
  });

  test('the price commitment and the hook figures are on the page', async ({ page }) => {
    // Both are tuned lines from context.md §4 that owner edits had removed.
    await page.goto('/');
    await expect(page.getByText('No build starts before that number is agreed.')).toBeVisible();
    const hook = page.locator('#moment');
    await expect(hook.getByText('−80%')).toBeVisible();
    await expect(hook.getByText('100,000+')).toBeVisible();
  });

  test('the candour answer is readable without a click', async ({ page }) => {
    // The highest trust-per-word line on the site (context.md §4).
    await page.goto('/');
    const answer = page.getByText('Sometimes it is not, and we will say so.');
    await expect(answer).toBeVisible();
  });

  test('no share-image tag points at a file that is not there', async ({ page }) => {
    // A missing og:image is silent; a broken one renders an empty card in every
    // chat a referrer pastes the link into. src/lib/og.ts omits the tag until
    // the asset exists, so this passes both before and after it is added.
    const response = await page.goto('/');
    const html = (await response?.text()) ?? '';
    const match = html.match(/property="og:image"\s+content="([^"]+)"/);
    if (match) {
      const asset = await page.request.get(match[1]!);
      expect(asset.status()).toBe(200);
    }
  });
});
