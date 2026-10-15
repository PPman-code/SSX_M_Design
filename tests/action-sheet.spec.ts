import { test, expect } from '@playwright/test';

test('action sheet executes a callback, cancels without action and restores focus', async ({ page }) => {
  await page.goto('/#/mobile?theme=light');
  const trigger = page.getByRole('button', { name: '基础动作面板', exact: true });
  await trigger.click();
  const sheet = page.getByRole('dialog', { name: '基础动作面板', exact: true });
  await expect(sheet.getByRole('button', { name: '操作一', exact: true })).toBeVisible();
  await sheet.getByRole('button', { name: '操作二', exact: true }).click();
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByText('动作结果：操作二', { exact: true })).toBeVisible();
  await trigger.click();
  await sheet.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.getByText('动作结果：操作二', { exact: true })).toBeVisible();
});

for (const theme of ['light', 'dark']) {
  test(`action sheet supports descriptions, danger and disabled states in ${theme}`, async ({ page }) => {
    await page.goto(`/#/mobile?theme=${theme}`);
    await page.getByRole('button', { name: '带说明动作面板', exact: true }).click();
    let sheet = page.getByRole('dialog', { name: '带说明动作面板', exact: true });
    await expect(sheet.getByText('请选择要执行的操作')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '状态动作面板', exact: true }).click();
    sheet = page.getByRole('dialog', { name: '状态动作面板', exact: true });
    await expect(sheet.getByRole('button', { name: '暂不可用', exact: true })).toBeDisabled();
    await expect(sheet.getByRole('button', { name: '删除', exact: true })).toHaveAttribute('data-danger', 'true');
    await sheet.getByRole('button', { name: '删除', exact: true }).click();
    await expect(page.getByText('动作结果：删除（仅演示）', { exact: true })).toBeVisible();
  });
}

for (const width of [360, 375, 390, 430]) {
  test(`long actions scroll above the cancel control at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 640 });
    await page.goto('/#/mobile?theme=light');
    await page.getByRole('button', { name: '长内容动作面板', exact: true }).click();
    const sheet = page.getByRole('dialog', { name: '长内容动作面板', exact: true });
    const cancel = sheet.getByRole('button', { name: '取消', exact: true });
    await expect(sheet).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await expect(cancel).toBeVisible();
    const before = await cancel.boundingBox();
    await sheet.locator('.action-sheet-options').evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect(sheet.getByRole('button', { name: '动作 20', exact: true })).toBeInViewport();
    expect((await cancel.boundingBox())!.y).toBe(before!.y);
    expect(await sheet.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await sheet.screenshot({ path: `test-results/action-sheet-long-${width}.png` });
    await cancel.click();
  });
}
