import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/work', '/capabilities'];
const THEMES = ['light', 'dark'] as const;

/** Hard gate: zero serious or critical violations on every route, both themes. */
for (const route of ROUTES) {
  for (const theme of THEMES) {
    test(`${route} has no serious accessibility violations (${theme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious, JSON.stringify(serious, null, 2)).toHaveLength(0);
    });
  }
}

test('every section anchor in the content resolves in the DOM', async ({ page }) => {
  await page.goto('/');
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const path = fileURLToPath(new URL('../../content/site.json', import.meta.url));
  const content = JSON.parse(readFileSync(path, 'utf8')) as {
    sections: Array<{ id: string }>;
  };
  for (const section of content.sections) {
    await expect(page.locator(`#${section.id}`), `#${section.id} is a public URL`).toHaveCount(1);
  }
});
