import { test, expect } from '@playwright/test';

test('dialog notice and confirmation share the local modal and restore focus', async ({ page }) => {
  await page.goto('/#/mobile?theme=light');
  const trigger = page.getByRole('button', { name: '单按钮对话框', exact: true });
  await trigger.click();
  let dialog = page.getByRole('dialog', { name: '提示', exact: true });
  await expect(dialog).toHaveCSS('width', '270px');
  await expect(dialog).toHaveCSS('border-radius', '8px');
  await expect(dialog.getByRole('heading')).toHaveCSS('font-size', '17px');
  await expect(dialog.getByRole('heading')).toHaveCSS('font-weight', '500');
  await dialog.getByRole('button', { name: '知道了', exact: true }).click();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: '双按钮对话框', exact: true }).click();
  dialog = page.getByRole('dialog', { name: '确认操作', exact: true });
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.getByText('对话框结果：尚未操作', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '双按钮对话框', exact: true }).click();
  await dialog.getByRole('button', { name: '确认', exact: true }).click();
  await expect(page.getByText('对话框结果：已确认', { exact: true })).toBeVisible();
});

test('dialog variants support stacked, android and custom actions', async ({ page }) => {
  await page.goto('/#/mobile?theme=dark');
  await page.getByRole('button', { name: '纵向操作对话框', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: '选择操作', exact: true });
  await expect(dialog.locator('.dialog-actions')).toHaveCSS('flex-direction', 'column');
  await dialog.getByRole('button', { name: '选项二', exact: true }).click();
  await expect(page.getByText('对话框结果：选项二', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Android 双按钮', exact: true }).click();
  dialog = page.getByRole('dialog', { name: '开启提醒', exact: true });
  await expect(dialog).toHaveCSS('border-radius', '4px');
  await expect(dialog.getByRole('heading')).toHaveCSS('text-align', 'left');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '自定义双按钮', exact: true }).click();
  dialog = page.getByRole('dialog', { name: '确认修改', exact: true });
  await expect(dialog.getByRole('button', { name: '确认', exact: true })).toHaveCSS('border-radius', '999px');
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
});

for (const width of [360, 375, 390, 430]) {
  test(`long dialog body scrolls above its fixed actions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 640 });
    await page.goto('/#/mobile?theme=light');
    await page.getByRole('button', { name: '长内容对话框', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: '详细说明', exact: true });
    const confirm = dialog.getByRole('button', { name: '知道了', exact: true });
    const before = await confirm.boundingBox();
    await dialog.locator('.info-dialog-content').evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect(dialog.getByText('说明条目 20', { exact: true })).toBeInViewport();
    expect((await confirm.boundingBox())!.y).toBe(before!.y);
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await confirm.click();
  });
}
