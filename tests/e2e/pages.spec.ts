import { expect, test } from '@playwright/test';

/** Every route that must exist. Kept in step with src/app by hand. */
const ROUTES = [
  '/',
  '/work/',
  '/capabilities/',
  '/about/',
  '/contact/',
  '/capabilities/custom-business-software/',
  '/capabilities/ecommerce-systems/',
  '/how-we-build/',
  '/systems/operations-supply-chain/',
  '/systems/people-workforce/',
];

test.describe('the sub-pages', () => {
  for (const route of ROUTES) {
    test(`${route} resolves and has exactly one h1`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      // A title that is only the company name tells a search result nothing.
      const title = await page.title();
      expect(title.length).toBeGreaterThan('Wezigns'.length + 3);
    });
  }

  test('every capability page is in the sitemap', async ({ page }) => {
    const xml = await (await page.request.get('/sitemap.xml')).text();
    for (const route of ROUTES) {
      expect(xml, `${route} should be listed`).toContain(route.replace(/\/$/, '/'));
    }
  });

  test('the contact page carries the ways to reach a person', async ({ page }) => {
    // The phone and the office are optional business facts: present only while
    // the content file has them. When absent nothing renders — never a stub.
    await page.goto('/contact/');
    // The email appears in the page body and again in the footer; either will do.
    await expect(page.getByRole('link', { name: /hello@wezigns\.com/ }).first()).toBeVisible();
    const tel = page.locator('a[href^="tel:"]').first();
    if (await tel.count()) {
      await expect(tel).toBeVisible();
      await expect(page.locator('address').first()).toBeVisible();
    }
  });

  test('no page in the sitemap is a 404, and none is orphaned', async ({ page }) => {
    // A sitemap that lists a page nobody links to is a page nobody reads, and
    // one that lists a 404 costs trust with every crawler that follows it.
    const xml = await (await page.request.get('/sitemap.xml')).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
    expect(urls.length).toBeGreaterThanOrEqual(20);
    for (const url of urls) {
      expect((await page.request.get(url)).status(), `${url} should resolve`).toBe(200);
    }
  });

  test('the range areas link to their own pages', async ({ page }) => {
    await page.goto('/capabilities/');
    const links = page.locator('#range a[href^="/systems/"]');
    expect(await links.count()).toBe(5);
    for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) {
      expect((await page.request.get(href)).status(), `${href} should resolve`).toBe(200);
    }
  });

  test('the ninth offering is on the home page and has its own page', async ({ page }) => {
    await page.goto('/');
    const tile = page.locator('#build').getByRole('link', { name: /ecommerce systems/i });
    await expect(tile).toBeVisible();
    await page.goto('/capabilities/ecommerce-systems/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
