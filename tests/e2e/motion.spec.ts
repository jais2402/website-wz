import { expect, test } from '@playwright/test';

/**
 * The two Motion (motion/react-mini) behaviours: section reveals and the
 * gliding case-tab indicator. What matters is not the animation but what it
 * must never cost — content that stays hidden, or an indicator under the
 * wrong tab.
 */

const opacities = (page: import('@playwright/test').Page, id: string) =>
  page.evaluate(
    (sel) =>
      [...document.querySelectorAll<HTMLElement>(`#${sel} [data-body] > div > *`)].map((el) =>
        Number(getComputedStyle(el).opacity),
      ),
    id,
  );

test.describe('motion', () => {
  test('a below-fold section fades in and ends fully visible', async ({ page }) => {
    await page.goto('/');
    // Hidden once hydrated, waiting below the fold.
    await expect.poll(async () => (await opacities(page, 'faq')).some((o) => o < 1)).toBe(true);
    await page.locator('#faq').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
    await expect.poll(async () => (await opacities(page, 'faq')).every((o) => o === 1), { timeout: 4000 }).toBe(true);
  });

  test('reduced motion never hides content', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    expect((await opacities(page, 'faq')).every((o) => o === 1)).toBe(true);
  });

  test('the case indicator glides to sit under the active tab', async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium', 'geometry check once is enough');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const tabs = page.getByRole('tab');
    await tabs.nth(2).click();
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const list = document.querySelector('[role="tablist"]')!;
            const tab = list.querySelector<HTMLElement>('[aria-selected="true"]')!;
            const bar = list.querySelector<HTMLElement>(':scope > span[aria-hidden="true"]')!;
            const a = tab.getBoundingClientRect();
            const b = bar.getBoundingClientRect();
            return Math.abs(a.left - b.left) < 1.5 && Math.abs(a.width - b.width) < 1.5 && Math.abs(a.bottom - b.bottom) < 1.5;
          }),
        { timeout: 4000 },
      )
      .toBe(true);
  });
});
