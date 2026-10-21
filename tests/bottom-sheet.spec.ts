import { test, expect } from '@playwright/test';

test('shared selection content preserves immediate and draft selection modes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('/#/mobile?theme=light');
  const instant = page.getByRole('button', { name: '即时单选', exact: true });
  await instant.click();
  let sheet = page.getByRole('dialog', { name: '即时单选示例' });
  await expect(sheet.locator('.sheet-heading h2')).toHaveCSS('font-size', '16px');
  await expect(sheet.locator('.sheet-close-icon')).toHaveCSS('width', '18px');
  await expect(sheet.locator('.sheet-close-icon')).toHaveCSS('height', '18px');
  const close = sheet.getByRole('button', { name: '关闭弹层' });
  await expect(close).toHaveCSS('width', '40px');
  await expect(close).toHaveCSS('height', '40px');
  await expect(sheet.locator('.sheet-footer')).toHaveCount(0);
  await sheet.getByRole('radio', { name: '宽松' }).click();
  await expect(sheet).toBeHidden();
  await expect(instant).toBeFocused();
  await instant.click();
  await sheet.getByRole('radio', { name: '宽松' }).click();
  await expect(sheet).toBeHidden();

  const multiple = page.getByRole('button', { name: '多选列表', exact: true });
  await multiple.click();
  sheet = page.getByRole('dialog', { name: '多选列表示例' });
  await sheet.getByRole('button', { name: '宽松', exact: true }).click();
  await sheet.getByRole('button', { name: '关闭弹层' }).click();
  await multiple.click();
  await expect(sheet.getByRole('button', { name: '宽松', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await sheet.getByRole('button', { name: '宽松', exact: true }).click();
  await sheet.getByRole('button', { name: '确认', exact: true }).click();
  await expect(page.getByText('多选结果：默认、宽松', { exact: true })).toBeVisible();
  await multiple.click();
  await sheet.getByRole('button', { name: '默认', exact: true }).click();
  await sheet.getByRole('button', { name: '取消', exact: true }).click();
  await multiple.click();
  await expect(sheet.getByRole('button', { name: '默认', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(sheet.getByRole('button', { name: '宽松', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await sheet.getByRole('button', { name: '取消', exact: true }).click();
});

for (const width of [360, 390, 430]) {
  test(`long sheet scrolls while heading and footer remain visible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 640 });
    await page.goto('/#/mobile?theme=light');
    const trigger = page.getByRole('button', { name: '长内容弹层', exact: true });
    await trigger.click();
    const sheet = page.getByRole('dialog', { name: '长内容弹层示例' });
    const content = sheet.locator('.sheet-content');
    const footer = sheet.locator('.sheet-footer');
    await expect(sheet).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await expect(footer.getByRole('button', { name: '知道了' })).toBeVisible();
    await expect(content).toHaveCSS('scrollbar-width', 'none');
    expect(await content.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    const before = await footer.boundingBox();
    await content.hover();
    await page.mouse.wheel(0, 800);
    await expect.poll(() => content.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await expect(sheet.getByRole('heading')).toBeVisible();
    const after = await footer.boundingBox();
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
    expect(after!.y + after!.height).toBeLessThanOrEqual(640);
    expect(await sheet.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await sheet.screenshot({ path: `test-results/sheet-long-${width}.png` });
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test('selection sheet cancels drafts and confirms from its fixed footer', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/#/mobile?theme=dark');
  const trigger = page.getByRole('button', { name: '选择弹层', exact: true });
  await trigger.click();
  let sheet = page.getByRole('dialog', { name: '选择弹层示例' });
  await sheet.getByRole('radio', { name: '宽松' }).click();
  await sheet.locator('.sheet-footer').getByRole('button', { name: '取消' }).click();
  await expect(page.getByText('当前选择：默认', { exact: true })).toBeVisible();
  await trigger.click();
  sheet = page.getByRole('dialog', { name: '选择弹层示例' });
  await expect(sheet.getByRole('radio', { name: '默认' })).toBeChecked();
  await sheet.getByRole('radio', { name: '宽松' }).click();
  await sheet.locator('.sheet-footer').getByRole('button', { name: '确认' }).click();
  await expect(page.getByText('当前选择：宽松', { exact: true })).toBeVisible();
});
