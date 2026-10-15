import { test, expect } from '@playwright/test';

test('phone component preview shows status above navigation and plain preview omits it', async ({ page }) => {
  await page.setViewportSize({ width: 1120, height: 1051 });
  await page.goto('/#/?theme=light');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('.component-preview-status')).toBeVisible();
  await expect(frame.locator('.component-preview-status')).toHaveCSS('height', '54px');
  const status = (await frame.locator('.component-preview-status').boundingBox())!;
  const nav = (await frame.locator('.mobile-header').boundingBox())!;
  expect(nav.y).toBe(status.y + status.height);
  for (const img of await frame.locator('.component-preview-status img').all()) {
    await expect.poll(() => img.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.screenshot({ path: 'test-results/component-status-shell.png' });
  await page.getByRole('button', { name: '无外壳', exact: true }).click();
  await expect(frame.locator('.component-preview-status')).toHaveCount(0);
  await page.goto('/#/mobile?theme=light');
  await expect(page.locator('.component-preview-status')).toHaveCount(0);
});
