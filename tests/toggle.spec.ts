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
    await expect(basic).toHaveCSS('width', '45px');
    await expect(basic).toHaveCSS('height', '28px');
    expect(await basic.evaluate(element => parseFloat(getComputedStyle(element, '::after').height))).toBeGreaterThanOrEqual(40);
    await expect(basic.locator('.toggle-track')).toHaveCSS('width', '45px');
    await expect(basic.locator('.toggle-track')).toHaveCSS('height', '28px');
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

for (const mode of ['light', 'dark']) {
  test(`toggle reference sizes and loading guard work in ${mode}`, async ({ page }) => {
    await page.goto(`/#/mobile?theme=${mode}`);
    for (const [name, width, height, thumb] of [['小号开关', 39, 24, 18], ['中号开关', 45, 28, 21], ['大号开关', 52, 32, 24]] as const) {
      const toggle = page.getByRole('switch', { name, exact: true });
      await expect(toggle).toHaveCSS('width', `${width}px`);
      await expect(toggle).toHaveCSS('height', `${height}px`);
      await expect(toggle.locator('.toggle-thumb')).toHaveCSS('width', `${thumb}px`);
      const hit = await toggle.evaluate(element => ({ width: parseFloat(getComputedStyle(element, '::after').width), height: parseFloat(getComputedStyle(element, '::after').height) }));
      expect(hit.width).toBeGreaterThanOrEqual(40);
      expect(hit.height).toBeGreaterThanOrEqual(40);
      await toggle.click();
      await expect(toggle).not.toBeChecked();
    }
    const icon = page.getByRole('switch', { name: '图标开启示例', exact: true });
    await expect(icon.locator('.toggle-state-icon')).toHaveAttribute('data-icon', 'selection-check');
    await expect(icon.locator('.toggle-state-icon')).toHaveCSS('width', '16px');
    await icon.click();
    await expect(icon.locator('.toggle-state-icon')).toHaveAttribute('data-icon', 'selection-close');
    const loading = page.getByRole('switch', { name: '加载开启示例', exact: true });
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(loading.locator('.toggle-spinner')).toHaveAttribute('data-icon', 'loading');
    await loading.click();
    await loading.focus();
    await page.keyboard.press('Space');
    await expect(loading).toBeChecked();
    await page.getByRole('button', { name: '结束开关加载', exact: true }).click();
    await expect(loading).not.toHaveAttribute('aria-busy', 'true');
    await loading.click();
    await expect(loading).not.toBeChecked();
    const readonly = page.getByRole('switch', { name: '只读开启示例', exact: true });
    await readonly.focus();
    await page.keyboard.press('Space');
    await expect(readonly).toBeChecked();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await icon.locator('.toggle-thumb').evaluate(element => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(0.001);
    await expect(page.getByRole('region', { name: '开关', exact: true })).toHaveJSProperty('scrollWidth', await page.getByRole('region', { name: '开关', exact: true }).evaluate(el => el.clientWidth));
  });
}
