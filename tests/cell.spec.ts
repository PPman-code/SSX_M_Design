import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) for (const width of [360, 375, 390, 430]) {
  test(`TDesign cell combinations keep geometry and independent controls in ${theme} at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`/#/mobile?theme=${theme}`);
    const required = page.getByRole('button', { name: '选择校区 必填 请选择' });
    await expect(required).toHaveCSS('height', '56px');
    const title = await required.locator('.base-cell-label').boundingBox();
    const star = await required.locator('.base-cell-required').boundingBox();
    expect(star!.x).toBeGreaterThan(title!.x);
    await required.click();
    await expect(page.getByRole('status').filter({ hasText: '已点击校区选择' })).toBeVisible();
    const group = page.getByRole('group', { name: '通栏单元格示例', exact: true });
    await expect(group).toHaveCSS('border-radius', '0px');
    await expect(group.getByRole('img', { name: '16 条未读消息' })).toBeVisible();
    await expect(group.locator('.base-cell').first()).toHaveCSS('height', '56px');
    const imageRow = page.getByRole('button', { name: /课程封面 编程基础课程/ });
    await expect(imageRow.locator('img')).toHaveCSS('width', '48px');
    await expect(imageRow.locator('.base-cell-description')).toHaveCSS('white-space', 'normal');
    const toggle = page.getByRole('switch', { name: '教学通知开关', exact: true });
    await expect(toggle).toBeChecked();
    expect(await toggle.evaluate(el => el.closest('.base-cell')!.getBoundingClientRect().height)).toBe(82);
    expect(await toggle.evaluate(el => el.closest('.base-cell')!.tagName)).toBe('DIV');
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    const rows = page.locator('.cell-examples .base-cell');
    for (const row of await rows.all()) {
      expect(await row.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await row.evaluate(el => Number.parseFloat(getComputedStyle(el, '::after').left))).toBe(16);
    }
  });
}

for (const width of [360, 375, 390, 430]) {
  test(`cell variants fit ${width}px and separate row clicks from controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/mobile');
    const cells = page.getByRole('group', { name: '单元格示例', exact: true });
    await expect(cells.locator('.base-cell')).toHaveCount(7);
    for (const row of await cells.locator('.base-cell:not(.base-cell--description):not(.base-cell--multiline)').all()) await expect(row).toHaveCSS('height', '56px');
    expect((await cells.locator('.base-cell').first().boundingBox())!.height).toBe(56);
    await cells.getByRole('button', { name: '带图标与详情 查看说明' }).click();
    await expect(page.getByText('已点击详情单元格', { exact: true })).toBeVisible();
    const avatarRow = cells.getByRole('button', { name: /用户名称/ });
    await avatarRow.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('已点击头像单元格', { exact: true })).toBeVisible();
    const toggle = cells.getByRole('switch', { name: '单元格消息通知', exact: true });
    expect(await toggle.evaluate((element) => element.closest('.base-cell')!.getBoundingClientRect().height)).toBe(56);
    expect(await toggle.evaluate((element) => Boolean(element.closest('button')))).toBe(false);
    await expect(toggle).toBeChecked();
    await cells.getByText('消息通知', { exact: true }).click();
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    await expect(cells.getByRole('button', { name: '暂不可用 未开放' })).toBeDisabled();
    expect(await cells.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await cells.screenshot({ path: `test-results/cells-${width}.png` });
  });
}

test('cell icon uses the project sprite and keeps a compact centered gap', async ({ page }) => {
  await page.goto('/#/mobile');
  const row = page.getByRole('button', { name: '带图标与详情 查看说明' });
  const icon = row.locator('.base-cell-leading');
  const label = row.locator('.base-cell-label');
  await expect(icon.locator('use')).toHaveAttribute('href', /ssx-design\.symbol\.svg#SSX-question-circle$/);
  await expect(icon.locator('svg')).toHaveCSS('width', '18px');
  await expect(row.locator('.base-cell-arrow svg')).toHaveCSS('width', '18px');
  await expect(page.getByRole('group', { name: '单元格示例', exact: true }).locator('.base-cell-leading img')).toHaveCSS('width', '32px');
  const a = (await icon.boundingBox())!;
  const b = (await label.boundingBox())!;
  expect(b.x - a.x - a.width).toBe(8);
  expect(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThan(1);
});
