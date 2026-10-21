import { test, expect } from '@playwright/test';

for (const mode of ['light', 'dark']) {
  test(`checkbox supports independent selection, mixed select-all and disabled states in ${mode}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/mobile?theme=${mode}`);
    const group = page.getByRole('group', { name: '带全选多选', exact: true });
    const all = group.getByRole('checkbox', { name: '全选', exact: true });
    await expect(all).toHaveAttribute('aria-checked', 'mixed');
    await all.click();
    for (const label of ['选项一', '选项二', '选项三']) await expect(group.getByRole('checkbox', { name: label, exact: true })).toBeChecked();
    await group.getByRole('checkbox', { name: '选项二', exact: true }).click();
    await expect(all).toHaveAttribute('aria-checked', 'mixed');
    await all.click();
    await all.click();
    await expect(group.getByRole('checkbox', { name: '选项一', exact: true })).not.toBeChecked();
    const basic = page.getByRole('checkbox', { name: '基础选项一', exact: true });
    await expect(basic.locator('.ssx-checkbox-check')).toHaveAttribute('data-icon', 'selection-check');
    await expect(basic.locator('.ssx-checkbox-check')).toHaveCSS('width', '16px');
    expect((await page.request.get('/icons/selection/check.svg')).ok()).toBe(true);
    expect((await page.request.get('/icons/selection/close.svg')).ok()).toBe(true);
    await basic.focus();
    await page.keyboard.press('Space');
    await expect(basic).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: '基础选项二', exact: true })).toBeChecked();
    for (const label of ['禁用未选中', '禁用已选中', '禁用半选']) {
      const item = page.getByRole('checkbox', { name: label, exact: true });
      await expect(item).toBeDisabled();
      const before = await item.getAttribute('aria-checked');
      await item.dispatchEvent('click');
      await expect(item).toHaveAttribute('aria-checked', before!);
    }
    const card = page.getByRole('checkbox', { name: '卡片选项二', exact: true });
    await card.click();
    await expect(card).toBeChecked();
    await expect(card).toHaveCSS('border-color', mode === 'light' ? 'rgb(40, 120, 232)' : 'rgb(64, 158, 255)');
    await page.getByRole('region', { name: '多选 Checkbox', exact: true }).screenshot({ path: `test-results/checkbox-${mode}.png`, animations: 'disabled' });
  });
}
for (const width of [360, 375, 390, 430]) {
  test(`checkbox reference geometry, wrapping and hit areas fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/mobile?theme=light');
    const section = page.getByRole('region', { name: '多选 Checkbox', exact: true });
    expect(await section.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    const cards = page.getByRole('group', { name: '横向卡片多选', exact: true }).getByRole('checkbox');
    for (const card of await cards.all()) {
      await expect(card).toHaveCSS('height', '40px');
      expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(40);
      await expect(card).not.toHaveClass(/touch-target/);
    }
    const row = page.getByRole('checkbox', { name: '基础选项一', exact: true });
    await expect(row).toHaveCSS('height', '56px');
    await expect(row.locator('.ssx-checkbox-mark')).toHaveCSS('width', '20px');
    await expect(row.locator('.ssx-checkbox-mark')).toHaveCSS('height', '20px');
    const circle = await row.locator('.ssx-checkbox-mark').evaluate(el => ({ width: getComputedStyle(el, '::before').width, height: getComputedStyle(el, '::before').height }));
    expect(circle).toEqual({ width: '18px', height: '18px' });
    const square = page.getByRole('checkbox', { name: '方形勾选', exact: true }).locator('.ssx-checkbox-mark');
    expect(await square.evaluate(el => ({ width: getComputedStyle(el, '::before').width, radius: getComputedStyle(el, '::before').borderRadius }))).toEqual({ width: '16px', radius: '2px' });
    const uncheckedCheck = page.getByRole('checkbox', { name: '右侧纯勾', exact: true });
    await expect(uncheckedCheck.locator('.ssx-checkbox-check')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: '纯勾样式', exact: true }).locator('.ssx-checkbox-check use')).toHaveAttribute('href', /ssx-design\.symbol\.svg#SSX-check$/);
    const icon = page.getByRole('checkbox', { name: '独立多选标记', exact: true });
    await expect(icon).toHaveCSS('width', '20px');
    const hit = await icon.evaluate(el => ({width: parseFloat(getComputedStyle(el, '::after').width), height: parseFloat(getComputedStyle(el, '::after').height)}));
    expect(hit.width).toBeGreaterThanOrEqual(40);
    expect(hit.height).toBeGreaterThanOrEqual(40);
    const long = page.getByRole('checkbox', { name: '长文字选项会自然换行，标记与首行文字顶部对齐，不截断内容', exact: true });
    expect((await long.boundingBox())!.height).toBeGreaterThan(56);
    const right = page.getByRole('checkbox', { name: '右侧勾选', exact: true });
    const mark = await right.locator('.ssx-checkbox-mark').boundingBox();
    const text = await right.locator('.ssx-checkbox-label').boundingBox();
    expect(mark!.x).toBeGreaterThan(text!.x);
  });
}
