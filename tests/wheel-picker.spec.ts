import { test, expect } from '@playwright/test';

test('single wheel skips disabled options and submits only on confirmation', async ({ page }) => {
  await page.goto('/#/mobile?theme=light');
  const trigger = page.getByRole('button', { name: '单列滚轮', exact: true });
  await trigger.click();
  const sheet = page.getByRole('dialog', { name: '单列滚轮', exact: true });
  await expect(sheet.locator('.picker-toolbar')).toBeVisible();
  await expect(sheet.locator('.sheet-footer, .sheet-handle, .sheet-heading')).toHaveCount(0);
  await expect(sheet.getByRole('button', { name: '关闭弹层' })).toHaveCount(0);
  await expect(sheet.locator('.wheel-picker-center')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(sheet.locator('.wheel-picker-center')).toHaveCSS('border-top-width', '1px');
  await expect(sheet.locator('.wheel-picker-center')).toHaveCSS('border-bottom-width', '1px');
  const wheel = sheet.getByRole('listbox', { name: '时长' });
  await expect(wheel.getByRole('option', { name: '30分钟', exact: true })).toHaveAttribute('aria-selected', 'true');
  await wheel.focus();
  await page.keyboard.press('ArrowDown');
  await expect(wheel.getByRole('option', { name: '60分钟', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(sheet.getByRole('button', { name: '确认', exact: true })).toBeVisible();
  await sheet.getByRole('button', { name: '取消', exact: true }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(wheel.getByRole('option', { name: '30分钟', exact: true })).toHaveAttribute('aria-selected', 'true');
  await wheel.focus();
  await page.keyboard.press('End');
  await expect(wheel.getByRole('option', { name: '120分钟', exact: true })).toHaveAttribute('aria-selected', 'true');
  await sheet.getByRole('button', { name: '确认', exact: true }).click();
  await expect(page.getByText('已选时长：120分钟', { exact: true })).toBeVisible();
});

test('native wheel scrolling settles on an enabled centered value', async ({ page }) => {
  await page.goto('/#/mobile?theme=light');
  await page.getByRole('button', { name: '单列滚轮', exact: true }).click();
  const wheel = page.getByRole('listbox', { name: '时长' });
  await wheel.evaluate(el => { el.scrollTop = 88; }); // Disabled 45-minute row.
  await expect.poll(() => wheel.evaluate(el => el.scrollTop)).toBe(44);
  await expect(wheel.getByRole('option', { name: '30分钟', exact: true })).toHaveAttribute('aria-selected', 'true');
  await wheel.evaluate(el => { el.scrollTop = 176; });
  await expect(wheel.getByRole('option', { name: '90分钟', exact: true })).toHaveAttribute('aria-selected', 'true');
  const centered = await wheel.evaluate(el => {
    const row = el.querySelector('[aria-selected="true"]')!.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return Math.abs((row.top + row.bottom) / 2 - (box.top + box.bottom) / 2);
  });
  expect(centered).toBeLessThan(1);
});

for (const width of [360, 375, 390, 430]) {
  test(`multiple and cascading wheels fit ${width}px and discard drafts on dismissal`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.goto('/#/mobile?theme=dark');
    await page.getByRole('button', { name: '多列滚轮', exact: true }).click();
    let sheet = page.getByRole('dialog', { name: '多列滚轮', exact: true });
    const hours = sheet.getByRole('listbox', { name: '小时' });
    await hours.focus();
    await page.keyboard.press('ArrowDown');
    await sheet.getByRole('button', { name: '确认', exact: true }).click();
    await expect(page.getByText('已选时间：10时 30分', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '联动滚轮', exact: true }).click();
    sheet = page.getByRole('dialog', { name: '联动滚轮', exact: true });
    await sheet.getByRole('listbox', { name: '省份' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(sheet.getByRole('option', { name: '杭州', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(sheet.getByRole('option', { name: '深圳', exact: true })).toHaveCount(0);
    await sheet.getByRole('listbox', { name: '城市' }).focus();
    await page.keyboard.press('End');
    expect(await sheet.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await expect(sheet.getByRole('listbox', { name: '城市' })).toHaveCSS('scrollbar-width', 'none');
    await sheet.screenshot({ path: `test-results/wheel-linked-${width}.png` });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '联动滚轮', exact: true }).click();
    await expect(sheet.getByRole('option', { name: '深圳', exact: true })).toHaveAttribute('aria-selected', 'true');
    await sheet.getByRole('button', { name: '取消', exact: true }).click();
    await expect(page.getByText('已选地区：广东 / 深圳', { exact: true })).toBeVisible();
  });
}
