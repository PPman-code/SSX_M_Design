import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`radio selects exclusively, skips disabled and fits long labels in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(`/#/mobile?theme=${theme}`);
    const group = page.getByRole('radiogroup', { name: '基础单选示例', exact: true });
    const first = group.getByRole('radio', { name: '选项一', exact: true });
    const second = group.getByRole('radio', { name: '选项二', exact: true });
    await expect(first).toBeChecked();
    await group.getByText('选项二', { exact: true }).click();
    await expect(second).toBeChecked();
    await expect(first).not.toBeChecked();
    await second.focus();
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeChecked();
    await expect(group.getByRole('radio', { name: '禁用未选中' })).toBeDisabled();
    const disabled = page.getByRole('radiogroup', { name: '禁用已选中示例' }).getByRole('radio');
    await expect(disabled).toBeDisabled();
    await expect(disabled).toBeChecked();
    const mark = first.locator('.ssx-radio-mark');
    await expect(mark).toHaveCSS('width', '18px');
    await expect(mark).toHaveCSS('height', '18px');
    await expect(first.locator('.ssx-radio-indicator')).toHaveCSS('background-color', theme === 'light' ? 'rgb(40, 120, 232)' : 'rgb(64, 158, 255)');
    const comparisonRadio = page.getByRole('radio', { name: '单选尺寸对照', exact: true });
    const comparisonCheckbox = page.getByRole('checkbox', { name: '多选尺寸对照', exact: true });
    await expect(comparisonRadio).toHaveCSS('width', '20px');
    await expect(comparisonRadio).toHaveCSS('height', '20px');
    expect(await comparisonRadio.evaluate(el => parseFloat(getComputedStyle(el, '::after').width))).toBeGreaterThanOrEqual(40);
    expect(await comparisonRadio.evaluate(el => parseFloat(getComputedStyle(el, '::after').height))).toBeGreaterThanOrEqual(40);
    const radioCircle = await comparisonRadio.locator('.ssx-radio-mark').boundingBox();
    const checkboxCircle = await comparisonCheckbox.locator('.ssx-checkbox-mark').evaluate(el => ({width: parseFloat(getComputedStyle(el, '::before').width), height: parseFloat(getComputedStyle(el, '::before').height)}));
    expect(radioCircle!.width).toBe(checkboxCircle.width);
    expect(radioCircle!.height).toBe(checkboxCircle.height);
    const dots = page.getByRole('radiogroup', { name: '列表单选示例', exact: true });
    await dots.getByText('列表选项二', { exact: true }).click();
    await expect(dots.getByRole('radio', { name: '列表选项二', exact: true })).toBeChecked();
    await expect(dots.getByRole('radio', { name: '列表选项二', exact: true }).locator('.ssx-radio-indicator')).toHaveCSS('color', theme === 'light' ? 'rgb(40, 120, 232)' : 'rgb(64, 158, 255)');
    const section = page.getByRole('region', { name: '单选', exact: true });
    expect(await section.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await section.screenshot({ path: `test-results/radio-${theme}.png` });
  });
}
