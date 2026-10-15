import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`toast replaces, dismisses and preserves loading in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(`/#/mobile?theme=${theme}`);
    const section = page.getByRole('region', { name: '轻提示 Toast' });
    const toast = page.locator('.toast:not([data-ending])');
    await section.getByRole('button', { name: '文字提示', exact: true }).click();
    await expect(toast).toHaveText('这是一条轻提示');
    await expect(toast).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.8)');
    await expect(toast).toHaveCSS('border-radius', '4px');
    await expect(toast.locator('.toast-message')).toHaveCSS('font-weight', '400');
    await section.getByRole('button', { name: '成功提示', exact: true }).click();
    await expect(toast).toHaveCount(1);
    await expect(toast).toHaveText('操作成功');
    const icon = toast.locator('img');
    await expect(icon).toHaveAttribute('src', /success\.svg$/);
    await expect.poll(() => icon.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(icon).toHaveCSS('width', '24px');
    await page.screenshot({ path: `test-results/toast-success-${theme}.png` });
    await page.mouse.move(0, 0);
    await expect(toast).toHaveCount(0, { timeout: 4000 });
    for (const [button, type] of [['失败提示', 'error'], ['警告提示', 'warning']]) {
      await section.getByRole('button', { name: button, exact: true }).click();
      await expect(toast.locator('img')).toHaveAttribute('src', new RegExp(`${type}\\.svg$`));
      await expect.poll(() => toast.locator('img').evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await section.getByRole('button', { name: '加载提示', exact: true }).click();
    await expect(toast).toHaveText('加载中…');
    await page.waitForTimeout(2300);
    await expect(toast).toBeVisible();
    await section.getByRole('button', { name: '仅加载图标', exact: true }).click();
    await expect(toast.locator('.toast-message')).toHaveCount(0);
    await expect(toast.locator('img')).toHaveAttribute('src', /loading\.svg$/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(toast.locator('img')).toHaveCSS('animation-name', 'none');
    await section.getByRole('button', { name: '长文字提示', exact: true }).click();
    const bounds = (await toast.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(24);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(336);
    await page.screenshot({ path: `test-results/toast-long-${theme}.png` });
    await section.getByRole('button', { name: '关闭提示', exact: true }).click();
    await expect(toast).toHaveCount(0);
    await expect(section.getByRole('button', { name: '关闭提示', exact: true })).toBeFocused();
  });
}
