import { test, expect } from '@playwright/test';

for (const mode of ['light', 'dark']) {
  test(`toggle supports keyboard, text and disabled states in ${mode}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/mobile?theme=${mode}`);
    const basic = page.getByRole('switch', { name: '基础开启示例', exact: true });
    await expect(basic).toBeChecked();
    await basic.focus();
    await page.keyboard.press('Space');
    await expect(basic).not.toBeChecked();
    await page.keyboard.press('Space');
    await expect(basic).toBeChecked();
    await expect(basic.locator('.toggle-track')).toHaveCSS('background-color', mode === 'light' ? 'rgb(40, 120, 232)' : 'rgb(64, 158, 255)');
    const box = await basic.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await expect(basic.locator('.toggle-track')).toHaveCSS('width', '40px');
    await expect(basic.locator('.toggle-track')).toHaveCSS('height', '24px');
    await expect(basic.locator('.toggle-thumb')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const text = page.getByRole('switch', { name: '文字关闭示例', exact: true });
    await expect(text.locator('.toggle-state-text')).toHaveText('关');
    await text.click();
    await expect(text).toBeChecked();
    await expect(text.locator('.toggle-state-text')).toHaveText('开');
    await text.click();
    await expect(text.locator('.toggle-state-text')).toHaveText('关');
    for (const name of ['基础禁用开启', '基础禁用关闭', '文字禁用开启', '文字禁用关闭']) {
      const toggle = page.getByRole('switch', { name, exact: true });
      await expect(toggle).toBeDisabled();
      const checked = await toggle.isChecked();
      // Simulate a pointer click even though disabled controls reject normal Playwright clicks.
      await toggle.dispatchEvent('click');
      expect(await toggle.isChecked()).toBe(checked);
    }
    await page.getByRole('region', { name: '开关', exact: true }).screenshot({ path: `test-results/toggles-${mode}.png`, animations: 'disabled' });
  });
}
