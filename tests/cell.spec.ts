import { test, expect } from '@playwright/test';

for (const width of [360, 375, 390, 430]) {
  test(`cell variants fit ${width}px and separate row clicks from controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/mobile');
    const cells = page.getByRole('group', { name: '单元格示例', exact: true });
    await expect(cells.locator('.base-cell')).toHaveCount(7);
    expect((await cells.locator('.base-cell').first().boundingBox())!.height).toBe(54);
    await cells.getByRole('button', { name: '带图标与详情 查看说明' }).click();
    await expect(page.getByText('已点击详情单元格', { exact: true })).toBeVisible();
    const avatarRow = cells.getByRole('button', { name: /用户名称/ });
    await avatarRow.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('已点击头像单元格', { exact: true })).toBeVisible();
    const toggle = cells.getByRole('switch', { name: '单元格消息通知', exact: true });
    expect(await toggle.evaluate((element) => element.closest('.base-cell')!.getBoundingClientRect().height)).toBe(54);
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
  const a = (await icon.boundingBox())!;
  const b = (await label.boundingBox())!;
  expect(b.x - a.x - a.width).toBe(8);
  expect(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThan(1);
});
