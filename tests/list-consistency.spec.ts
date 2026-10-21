import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [360, 375, 390, 430]) {
    test(`people lists share confirmed spacing and badge height at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      for (const [route, prefix] of [['students', 'student'], ['prospective-students', 'prospect']] as const) {
        await page.goto(`/#/pages/${route}/v1?theme=${theme}`);
        await expect(page.locator('.search')).toHaveCSS('height', '56px');
        await expect(page.locator('.search-field')).toHaveCSS('height', '36px');
        const count = page.locator(`.${prefix}-count`);
        await expect(count).toHaveCSS('height', '40px');
        await expect(count).toHaveCSS('padding-left', '12px');
        await expect(count).toHaveCSS('padding-right', '12px');
        const cards = page.getByRole('listitem');
        const first = await cards.nth(0).boundingBox();
        const second = await cards.nth(1).boundingBox();
        expect(second!.y - first!.y - first!.height).toBeCloseTo(12, 1);
        for (const badge of await page.locator(`.${prefix}-status`).all()) {
          expect((await badge.boundingBox())!.height).toBeCloseTo(18, 1);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (width === 390) await page.screenshot({ path: `test-results/list-consistency-${route}-${theme}.png` });
      }
    });
  }
}

for (const theme of ['light', 'dark']) {
  test(`filter chips use 40px in both people lists in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [route, label] of [['students', '筛选学员'], ['prospective-students', '筛选客户']] as const) {
      await page.goto(`/#/pages/${route}/v1?theme=${theme}`);
      expect(await page.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--layout-touch-target').trim())).toBe('40px');
      await page.getByRole('button', { name: label, exact: true }).click();
      const dialog = page.getByRole('dialog', { name: label, exact: true });
      await expect(dialog.locator('.sheet-footer')).toHaveCSS('height', '56px');
      const chips = dialog.locator('.sheet-choice-grid button');
      expect(await chips.count()).toBeGreaterThan(0);
      const unselected = dialog.locator('.sheet-choice-grid button[aria-pressed="false"]:not(:disabled)');
      for (const chip of await unselected.all()) await expect(chip).toHaveCSS('background-color', theme === 'light' ? 'rgb(245, 247, 250)' : 'rgb(38, 39, 39)');
      for (const chip of await chips.all()) await expect(chip).toHaveCSS('height', '40px');
      const first = chips.first();
      const before = await first.getAttribute('aria-pressed');
      await first.click();
      await expect(first).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true');
      await page.keyboard.press('Escape');
    }
  });
}
