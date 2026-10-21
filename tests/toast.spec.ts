import { test, expect } from '@playwright/test';

for (const width of [360, 375, 390, 430]) {
  test(`toast horizontal/vertical geometry and replacement at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/mobile?theme=light');
    const section = page.getByRole('region', { name: '轻提示 Toast' });
    const toast = page.locator('.toast:not([data-ending])');
    await section.getByRole('button', { name: '横向成功提示', exact: true }).click();
    await expect(toast).toHaveAttribute('data-layout', 'horizontal');
    await expect(toast).toHaveCSS('padding', '16px 24px');
    await expect(toast).toHaveCSS('height', '56px');
    await expect(toast.locator('.toast-content')).toHaveCSS('flex-direction', 'row');
    await expect(toast.locator('.toast-icon')).toHaveCSS('width', '24px');
    await expect(toast.locator('.toast-message')).toHaveCSS('font-size', '14px');
    await expect(toast.locator('.toast-message')).toHaveCSS('line-height', '22px');
    await section.getByRole('button', { name: '成功提示', exact: true }).click();
    await expect(toast).toHaveCount(1);
    await expect(toast).toHaveAttribute('data-layout', 'vertical');
    await expect(toast).toHaveCSS('padding', '24px');
    await expect(toast).toHaveCSS('height', '110px');
    await expect(toast.locator('.toast-icon')).toHaveCSS('width', '32px');
    await section.getByRole('button', { name: '横向自定义图标', exact: true }).click();
    await expect(toast.locator('use')).toHaveAttribute('href', /#SSX-cloud-download$/);
    await expect(toast).toHaveAttribute('data-layout', 'horizontal');
    await section.getByRole('button', { name: '文字提示', exact: true }).click();
    await expect(toast.locator('.toast-icon')).toHaveCount(0);
    await expect(toast).toHaveCSS('height', '54px');
    await expect(toast).toHaveCSS('pointer-events', 'none');
    await expect(section.getByRole('button', { name: '文字提示', exact: true })).toBeFocused();
  });
}

for (const theme of ['light', 'dark']) {
  test(`toast replaces, dismisses and preserves loading in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(`/#/mobile?theme=${theme}`);
    const section = page.getByRole('region', { name: '轻提示 Toast' });
    const toast = page.locator('.toast:not([data-ending])');
    await section.getByRole('button', { name: '文字提示', exact: true }).click();
    await expect(toast).toHaveText('这是一条轻提示');
    await expect(toast).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.8)');
    await expect(toast).toHaveCSS('border-radius', '6px');
    await expect(toast.locator('.toast-message')).toHaveCSS('font-weight', '400');
    await section.getByRole('button', { name: '成功提示', exact: true }).click();
    await expect(toast).toHaveCount(1);
    await expect(toast).toHaveText('操作成功');
    const icon = toast.locator('.toast-icon');
    await expect(icon.locator('use')).toHaveAttribute('href', /#SSX-check-circle$/);
    await expect(icon).toHaveCSS('width', '32px');
    await page.screenshot({ path: `test-results/toast-success-${theme}.png` });
    await page.mouse.move(0, 0);
    await expect(toast).toHaveCount(0, { timeout: 4000 });
    for (const [button, name] of [['失败提示', 'close-circle'], ['警告提示', 'exclamation-circle']]) {
      await section.getByRole('button', { name: button, exact: true }).click();
      await expect(toast.locator('.toast-icon use')).toHaveAttribute('href', new RegExp(`#SSX-${name}$`));
    }
    await section.getByRole('button', { name: '加载提示', exact: true }).click();
    await expect(toast).toHaveText('加载中…');
    await page.waitForTimeout(2300);
    await expect(toast).toBeVisible();
    await section.getByRole('button', { name: '仅加载图标', exact: true }).click();
    await expect(toast.locator('.toast-message')).toHaveCount(0);
    await expect(toast.locator('.toast-icon')).toHaveAttribute('data-icon', 'loading');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(toast.locator('.toast-icon')).toHaveCSS('animation-name', 'none');
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
